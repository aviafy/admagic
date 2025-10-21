"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationAgent = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_2 = __importDefault(require("openai"));
const generative_ai_1 = require("@google/generative-ai");
const langgraph_1 = require("@langchain/langgraph");
const constants_1 = require("../../../common/constants");
const services_1 = require("../services");
class ModerationAgent {
    constructor(openaiKey, geminiKey, preferredProvider = constants_1.AIProvider.OPENAI) {
        this.logger = new common_1.Logger(ModerationAgent.name);
        this.gemini = null;
        const openaiModel = new openai_1.ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            temperature: 0,
            openAIApiKey: openaiKey,
        });
        const openai = new openai_2.default({
            apiKey: openaiKey,
        });
        if (geminiKey) {
            this.gemini = new generative_ai_1.GoogleGenerativeAI(geminiKey);
            this.logger.log("✅ Gemini AI initialized");
        }
        else {
            this.logger.warn("⚠️ Gemini API key not provided, using OpenAI only");
        }
        this.visionAnalyzer = new services_1.VisionAnalyzerService(openai, this.gemini);
        this.contentAnalyzer = new services_1.ContentAnalyzerService(openaiModel, this.gemini, preferredProvider);
        this.visualizationService = new services_1.VisualizationService(openaiModel, openai, this.gemini);
        this.decisionService = new services_1.DecisionService();
        this.logger.log(`Moderation agent initialized with preferred provider: ${preferredProvider}`);
        this.buildGraph();
    }
    buildGraph() {
        this.logger.debug("Building LangGraph workflow...");
        const ModerationStateAnnotation = langgraph_1.Annotation.Root({
            content: (langgraph_1.Annotation),
            contentType: (langgraph_1.Annotation),
            analysisResult: (langgraph_1.Annotation),
            classification: (langgraph_1.Annotation),
            decision: (langgraph_1.Annotation),
            reasoning: (langgraph_1.Annotation),
            visualizationUrl: (langgraph_1.Annotation),
            needsVisualization: (langgraph_1.Annotation),
            aiProvider: (langgraph_1.Annotation),
        });
        const workflow = new langgraph_1.StateGraph(ModerationStateAnnotation)
            .addNode("analyze", this.analyzeNode.bind(this))
            .addNode("classify", this.classifyNode.bind(this))
            .addNode("decide", this.decideNode.bind(this))
            .addNode("generateVisualization", this.generateVisualizationNode.bind(this))
            .addEdge("__start__", "analyze")
            .addEdge("analyze", "classify")
            .addEdge("classify", "decide")
            .addConditionalEdges("decide", this.routeAfterDecision.bind(this))
            .addEdge("generateVisualization", "__end__");
        this.graph = workflow.compile();
        this.logger.log("LangGraph workflow compiled successfully");
    }
    async analyzeNode(state) {
        this.logger.debug(`Analyzing ${state.contentType} content`);
        if (state.contentType === constants_1.ContentType.IMAGE) {
            const imageUrl = state.content;
            if (imageUrl.startsWith("http") || imageUrl.startsWith("data:image")) {
                try {
                    const visionResult = await this.visionAnalyzer.analyzeImage(imageUrl);
                    this.logger.debug("Used Vision Model for image");
                    return {
                        analysisResult: visionResult,
                        aiProvider: constants_1.AIProvider.OPENAI,
                    };
                }
                catch (error) {
                    this.logger.warn("Vision analysis failed, falling back to text analysis", error);
                }
            }
        }
        const { result, provider } = await this.contentAnalyzer.analyze(state.content, state.contentType);
        return {
            analysisResult: result,
            aiProvider: provider,
        };
    }
    async classifyNode(state) {
        this.logger.debug("Classifying content");
        if (!state.analysisResult) {
            throw new Error("Analysis result is required for classification");
        }
        const classification = this.decisionService.classifyContent(state.analysisResult);
        this.logger.debug(`Content classified as: ${classification}`);
        return { classification };
    }
    async decideNode(state) {
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
        const { decision, reasoning } = this.decisionService.makeDecision(state.classification, state.analysisResult, state.aiProvider);
        let needsVisualization = false;
        if (state.classification === "flagged") {
            needsVisualization = await this.visualizationService.shouldGenerateVisualization(state);
        }
        this.logger.log(`Decision: ${decision}`);
        return {
            decision,
            reasoning,
            needsVisualization,
        };
    }
    routeAfterDecision(state) {
        this.logger.debug(`Routing after decision - needsVisualization: ${state.needsVisualization}`);
        if (state.needsVisualization) {
            return "generateVisualization";
        }
        return "__end__";
    }
    async generateVisualizationNode(state) {
        if (!state.reasoning) {
            throw new Error("Reasoning is required for visualization generation");
        }
        const visualizationUrl = await this.visualizationService.generateVisualization(state.reasoning);
        return { visualizationUrl };
    }
    async moderate(content, contentType) {
        this.logger.log(`Starting moderation for ${contentType} content`);
        const initialState = {
            content,
            contentType,
        };
        try {
            const result = await this.graph.invoke(initialState);
            this.logger.log(`Moderation complete: ${result.decision} (via ${result.aiProvider})`);
            return result;
        }
        catch (error) {
            this.logger.error("Moderation workflow failed", error);
            throw error;
        }
    }
    isGeminiAvailable() {
        return this.gemini !== null;
    }
}
exports.ModerationAgent = ModerationAgent;
//# sourceMappingURL=moderation.agent.js.map