import { Logger } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../../../common/constants";
import { ModerationState } from "../interfaces";

/**
 * Service responsible for generating visualizations for flagged content
 * and deciding when visualizations would be helpful for human reviewers
 */
export class VisualizationService {
  private readonly logger = new Logger(VisualizationService.name);

  constructor(
    private readonly openaiModel: ChatOpenAI,
    private readonly openai: OpenAI,
    private readonly gemini: GoogleGenerativeAI | null
  ) {}

  /**
   * AI decides whether a visual preview would be helpful for flagged content
   */
  async shouldGenerateVisualization(state: ModerationState): Promise<boolean> {
    this.logger.debug("AI deciding on visualization need");

    const { analysisResult, content, contentType, aiProvider } = state;

    if (!analysisResult) {
      return false;
    }

    const decisionPrompt = `You are a content moderation decision assistant. A piece of content has been flagged for manual review.

Content Type: ${contentType}
Content: ${content}
Concerns: ${analysisResult.concerns?.join(", ")}
Severity: ${analysisResult.severity}
Reason: ${analysisResult.detailedReason}

Your task: Decide if generating a visual preview/illustration would help human reviewers understand the flagged concerns.

Consider generating a visualization when:
- The concern is complex or abstract and would benefit from visual explanation
- Visual representation would help illustrate the specific policy violation
- The flagged content involves visual elements that need context (e.g., images with subtle inappropriate elements)
- A diagram could help explain why borderline content was flagged

DO NOT generate visualization when:
- The concern is straightforward and self-explanatory from text alone
- The flagged content is simple text with obvious issues
- Visualization would not add meaningful value to the review process
- The concern is purely textual (e.g., spelling mistakes, simple spam)

Respond with ONLY a JSON object:
{
  "shouldGenerate": true/false,
  "reasoning": "Brief explanation of why visualization is/isn't needed"
}`;

    try {
      let result: { shouldGenerate: boolean; reasoning: string };

      // Use the same AI provider that did the analysis
      if (aiProvider === AIProvider.GEMINI && this.gemini) {
        result = await this.decideWithGemini(decisionPrompt);
      } else {
        result = await this.decideWithOpenAI(decisionPrompt);
      }

      this.logger.log(
        `Visualization decision: ${result.shouldGenerate} - ${result.reasoning}`
      );

      return result.shouldGenerate;
    } catch (error) {
      this.logger.error(
        "Visualization decision failed, defaulting to false",
        error
      );
      return false;
    }
  }

  /**
   * Makes visualization decision using OpenAI
   */
  private async decideWithOpenAI(
    prompt: string
  ): Promise<{ shouldGenerate: boolean; reasoning: string }> {
    try {
      const response = await this.openaiModel.invoke(prompt);
      return JSON.parse(response.content as string);
    } catch (error) {
      if (this.gemini) {
        this.logger.warn("OpenAI decision failed, trying Gemini");
        return this.decideWithGemini(prompt);
      }
      throw error;
    }
  }

  /**
   * Makes visualization decision using Gemini
   */
  private async decideWithGemini(
    prompt: string
  ): Promise<{ shouldGenerate: boolean; reasoning: string }> {
    if (!this.gemini) {
      throw new Error("Gemini is not initialized");
    }

    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(prompt);
      const text = response.response.text();

      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      this.logger.warn("Gemini decision failed, trying OpenAI");
      const response = await this.openaiModel.invoke(prompt);
      return JSON.parse(response.content as string);
    }
  }

  /**
   * Generates an explanatory visualization using DALL-E
   */
  async generateVisualization(reasoning: string): Promise<string | undefined> {
    this.logger.debug("Creating explanatory image");

    try {
      const imagePrompt = `Create a simple, educational diagram or illustration that explains content moderation concerns.
      The image should visually represent: ${reasoning}.
      Style: clean, professional, informational diagram with icons or symbols representing safety concerns.
      Do not include any offensive content - this is an explanatory visualization only.`;

      this.logger.debug("Calling DALL-E API...");

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      const visualizationUrl = response.data?.[0]?.url;

      if (visualizationUrl) {
        this.logger.log("Image generated successfully");
        return visualizationUrl;
      } else {
        this.logger.warn("No image URL returned");
        return undefined;
      }
    } catch (error) {
      this.logger.error("Failed to generate image", error);
      return undefined;
    }
  }
}
