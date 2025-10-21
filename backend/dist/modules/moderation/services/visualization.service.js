"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizationService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../common/constants");
class VisualizationService {
    constructor(openaiModel, openai, gemini) {
        this.openaiModel = openaiModel;
        this.openai = openai;
        this.gemini = gemini;
        this.logger = new common_1.Logger(VisualizationService.name);
    }
    async shouldGenerateVisualization(state) {
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
            let result;
            if (aiProvider === constants_1.AIProvider.GEMINI && this.gemini) {
                result = await this.decideWithGemini(decisionPrompt);
            }
            else {
                result = await this.decideWithOpenAI(decisionPrompt);
            }
            this.logger.log(`Visualization decision: ${result.shouldGenerate} - ${result.reasoning}`);
            return result.shouldGenerate;
        }
        catch (error) {
            this.logger.error("Visualization decision failed, defaulting to false", error);
            return false;
        }
    }
    async decideWithOpenAI(prompt) {
        try {
            const response = await this.openaiModel.invoke(prompt);
            return JSON.parse(response.content);
        }
        catch (error) {
            if (this.gemini) {
                this.logger.warn("OpenAI decision failed, trying Gemini");
                return this.decideWithGemini(prompt);
            }
            throw error;
        }
    }
    async decideWithGemini(prompt) {
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
        }
        catch (error) {
            this.logger.warn("Gemini decision failed, trying OpenAI");
            const response = await this.openaiModel.invoke(prompt);
            return JSON.parse(response.content);
        }
    }
    async generateVisualization(reasoning) {
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
            }
            else {
                this.logger.warn("No image URL returned");
                return undefined;
            }
        }
        catch (error) {
            this.logger.error("Failed to generate image", error);
            return undefined;
        }
    }
}
exports.VisualizationService = VisualizationService;
//# sourceMappingURL=visualization.service.js.map