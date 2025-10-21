import { Logger } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ModerationState } from "../interfaces";
import {
  ContentType,
  ModerationDecision,
  AIProvider,
} from "../../../common/constants";
import {
  VisionAnalyzerService,
  ContentAnalyzerService,
  VisualizationService,
  DecisionService,
} from "../services";

/**
 * Main orchestrator for the content moderation workflow
 * Uses LangGraph to manage the state machine and coordinate between services
 */
export class ModerationAgent {
  private readonly logger = new Logger(ModerationAgent.name);
  private readonly visionAnalyzer: VisionAnalyzerService;
  private readonly contentAnalyzer: ContentAnalyzerService;
  private readonly visualizationService: VisualizationService;
  private readonly decisionService: DecisionService;
  private graph: any;
  private readonly gemini: GoogleGenerativeAI | null = null;

  constructor(
    openaiKey: string,
    geminiKey?: string,
    preferredProvider: AIProvider = AIProvider.OPENAI
  ) {
    this.logger.log(
      `🏗️  [ModerationAgent] Constructor called with preferredProvider: ${preferredProvider}`
    );

    const openaiModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: openaiKey,
    });

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Initialize Gemini if key provided
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.logger.log("✅ [ModerationAgent] Gemini AI initialized");
    } else {
      this.logger.warn(
        "⚠️ [ModerationAgent] Gemini API key not provided, using OpenAI only"
      );
    }

    // Initialize services
    this.logger.log(
      `🔧 [ModerationAgent] Initializing services with preferredProvider: ${preferredProvider}`
    );
    this.visionAnalyzer = new VisionAnalyzerService(openai, this.gemini);
    this.contentAnalyzer = new ContentAnalyzerService(
      openaiModel,
      this.gemini,
      preferredProvider
    );
    this.visualizationService = new VisualizationService(
      openaiModel,
      openai,
      this.gemini
    );
    this.decisionService = new DecisionService();

    this.logger.log(
      `✅ [ModerationAgent] Moderation agent initialized with preferred provider: ${preferredProvider}`
    );

    this.buildGraph();
  }

  /**
   * Builds the LangGraph workflow for content moderation
   */
  private buildGraph(): void {
    this.logger.debug("Building LangGraph workflow...");

    const ModerationStateAnnotation = Annotation.Root({
      content: Annotation<string>,
      contentType: Annotation<ContentType>,
      analysisResult: Annotation<any | undefined>,
      classification: Annotation<"safe" | "flagged" | "harmful" | undefined>,
      decision: Annotation<ModerationDecision | undefined>,
      reasoning: Annotation<string | undefined>,
      visualizationUrl: Annotation<string | undefined>,
      needsVisualization: Annotation<boolean | undefined>,
      aiProvider: Annotation<AIProvider | undefined>,
    });

    const workflow = new StateGraph(ModerationStateAnnotation)
      .addNode("analyze", this.analyzeNode.bind(this))
      .addNode("classify", this.classifyNode.bind(this))
      .addNode("decide", this.decideNode.bind(this))
      .addNode(
        "generateVisualization",
        this.generateVisualizationNode.bind(this)
      )
      .addEdge("__start__", "analyze")
      .addEdge("analyze", "classify")
      .addEdge("classify", "decide")
      .addConditionalEdges("decide", this.routeAfterDecision.bind(this))
      .addEdge("generateVisualization", "__end__");

    this.graph = workflow.compile();
    this.logger.log("LangGraph workflow compiled successfully");
  }

  /**
   * LangGraph Node 1: Analyze content using appropriate AI service
   */
  private async analyzeNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.log(
      `📊 [ModerationAgent.analyzeNode] Analyzing ${state.contentType} content`
    );

    // For images, try vision analysis first
    if (state.contentType === ContentType.IMAGE) {
      const imageUrl = state.content;

      if (imageUrl.startsWith("http") || imageUrl.startsWith("data:image")) {
        try {
          this.logger.log(
            `👁️  [ModerationAgent.analyzeNode] Using Vision Model for image`
          );
          const visionResult = await this.visionAnalyzer.analyzeImage(imageUrl);
          this.logger.log(
            "✅ [ModerationAgent.analyzeNode] Vision analysis complete - Using OpenAI"
          );

          return {
            analysisResult: visionResult,
            aiProvider: AIProvider.OPENAI,
          };
        } catch (error) {
          this.logger.warn(
            "⚠️ [ModerationAgent.analyzeNode] Vision analysis failed, falling back to text analysis",
            error
          );
        }
      }
    }

    // Text/URL content analysis
    this.logger.log(
      `🤖 [ModerationAgent.analyzeNode] Calling ContentAnalyzer.analyze()...`
    );
    const { result, provider } = await this.contentAnalyzer.analyze(
      state.content,
      state.contentType
    );
    this.logger.log(
      `✅ [ModerationAgent.analyzeNode] Analysis complete with provider: ${provider}`
    );

    return {
      analysisResult: result,
      aiProvider: provider,
    };
  }

  /**
   * LangGraph Node 2: Classify content based on analysis
   */
  private async classifyNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug("Classifying content");

    if (!state.analysisResult) {
      throw new Error("Analysis result is required for classification");
    }

    const classification = this.decisionService.classifyContent(
      state.analysisResult
    );

    this.logger.debug(`Content classified as: ${classification}`);

    return { classification };
  }

  /**
   * LangGraph Node 3: Make final moderation decision
   */
  private async decideNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug("Making final decision");

    if (!state.classification) {
      throw new Error("Classification is required for decision");
    }

    if (!state.analysisResult) {
      throw new Error("Analysis result is required for decision");
    }

    if (!state.aiProvider) {
      throw new Error("AI provider is required for decision");
    }

    const { decision, reasoning } = this.decisionService.makeDecision(
      state.classification,
      state.analysisResult,
      state.aiProvider
    );

    let needsVisualization = false;

    // For flagged content, AI decides if visualization would help
    if (state.classification === "flagged") {
      needsVisualization =
        await this.visualizationService.shouldGenerateVisualization(state);
    }

    this.logger.log(`Decision: ${decision}`);

    return {
      decision,
      reasoning,
      needsVisualization,
    };
  }

  /**
   * Routes after decision - determines if visualization is needed
   */
  private routeAfterDecision(state: ModerationState): string {
    this.logger.debug(
      `Routing after decision - needsVisualization: ${state.needsVisualization}`
    );

    if (state.needsVisualization) {
      return "generateVisualization";
    }

    return "__end__";
  }

  /**
   * LangGraph Node 4: Generate visualization for flagged content
   */
  private async generateVisualizationNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    if (!state.reasoning) {
      throw new Error("Reasoning is required for visualization generation");
    }

    const visualizationUrl =
      await this.visualizationService.generateVisualization(state.reasoning);

    return { visualizationUrl };
  }

  /**
   * Execute the complete LangGraph moderation workflow
   */
  async moderate(
    content: string,
    contentType: ContentType
  ): Promise<ModerationState> {
    this.logger.log(`Starting moderation for ${contentType} content`);

    const initialState: ModerationState = {
      content,
      contentType,
    };

    try {
      const result = await this.graph.invoke(initialState);
      this.logger.log(
        `Moderation complete: ${result.decision} (via ${result.aiProvider})`
      );
      return result;
    } catch (error) {
      this.logger.error("Moderation workflow failed", error);
      throw error;
    }
  }

  /**
   * Check if Gemini is available
   */
  isGeminiAvailable(): boolean {
    return this.gemini !== null;
  }
}
