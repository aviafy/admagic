import { Logger } from "@nestjs/common";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../interfaces";

/**
 * Service responsible for analyzing images using vision AI models
 * Supports both OpenAI GPT-4 Vision and Google Gemini Vision
 */
export class VisionAnalyzerService {
  private readonly logger = new Logger(VisionAnalyzerService.name);

  constructor(
    private readonly openai: OpenAI,
    private readonly gemini: GoogleGenerativeAI | null
  ) {}

  /**
   * Analyzes image content using available vision models
   * Tries GPT-4 Vision first, then falls back to Gemini
   */
  async analyzeImage(imageUrl: string): Promise<AnalysisResult> {
    this.logger.debug("Analyzing image content");

    const visionPrompt = this.buildVisionPrompt();

    try {
      // Try GPT-4 Vision first
      if (this.openai) {
        try {
          return await this.analyzeWithGPT4Vision(imageUrl, visionPrompt);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn("GPT-4 Vision failed:", errorMessage);
        }
      }

      // Fallback to Gemini Vision
      if (this.gemini) {
        try {
          return await this.analyzeWithGeminiVision(imageUrl, visionPrompt);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn("Gemini Vision failed:", errorMessage);
        }
      }

      // If all vision models fail
      return this.createFallbackResult();
    } catch (error) {
      this.logger.error("Critical error in image analysis:", error);
      return this.createErrorResult();
    }
  }

  /**
   * Analyzes image using GPT-4 Vision
   */
  private async analyzeWithGPT4Vision(
    imageUrl: string,
    prompt: string
  ): Promise<AnalysisResult> {
    this.logger.debug("Using GPT-4 Vision");

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = this.parseJSONResponse(content);

    this.logger.debug(
      `GPT-4 Vision result: isSafe=${result.isSafe}, concerns=${result.concerns?.length || 0}`
    );

    return result;
  }

  /**
   * Analyzes image using Gemini Vision
   */
  private async analyzeWithGeminiVision(
    imageUrl: string,
    prompt: string
  ): Promise<AnalysisResult> {
    this.logger.debug("Using Gemini Vision");

    if (!this.gemini) {
      throw new Error("Gemini is not initialized");
    }

    const { imageData, mimeType } = await this.prepareImageForGemini(imageUrl);

    const model = this.gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ]);

    const text = result.response.text();
    const parsedResult = this.parseJSONResponse(text);

    this.logger.debug(
      `Gemini Vision result: isSafe=${parsedResult.isSafe}, concerns=${parsedResult.concerns?.length || 0}`
    );

    return parsedResult;
  }

  /**
   * Prepares image data for Gemini API
   */
  private async prepareImageForGemini(
    imageUrl: string
  ): Promise<{ imageData: string; mimeType: string }> {
    let imageData: string;
    let mimeType = "image/jpeg";

    if (imageUrl.startsWith("data:image")) {
      // Already base64
      const match = imageUrl.match(/data:(image\/[^;]+);base64,(.+)/);
      if (match) {
        mimeType = match[1];
        imageData = match[2];
      } else {
        imageData = imageUrl.split(",")[1];
      }
    } else {
      // Fetch and convert to base64
      const result = await this.fetchImageAsBase64(imageUrl);
      imageData = result.data;
      mimeType = result.contentType;
    }

    return { imageData, mimeType };
  }

  /**
   * Fetches image from URL and converts to base64
   */
  private async fetchImageAsBase64(
    imageUrl: string
  ): Promise<{ data: string; contentType: string }> {
    const https = await import("https");
    const http = await import("http");

    return new Promise((resolve, reject) => {
      const client = imageUrl.startsWith("https") ? https : http;
      client
        .get(imageUrl, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch image: ${res.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const contentType = res.headers["content-type"] || "image/jpeg";
            const data = Buffer.concat(chunks).toString("base64");
            resolve({ data, contentType });
          });
          res.on("error", reject);
        })
        .on("error", reject);
    });
  }

  /**
   * Parses JSON response from AI models, handling markdown code blocks
   */
  private parseJSONResponse(content: string): AnalysisResult {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonText.trim());
    } catch (parseError) {
      // Clean up and try again
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Builds the vision analysis prompt
   */
  private buildVisionPrompt(): string {
    return `You are a strict content moderation AI with vision capabilities. Analyze this image for safety and appropriateness.

Carefully check for the following violations (be very strict):

1. **Adult/Explicit Content (+18)**:
   - Nudity, sexual content, or sexually suggestive poses/clothing
   - Pornographic or erotic imagery
   - Sexual acts or suggestive gestures

2. **Violence**:
   - Graphic violence, gore, blood, or injuries
   - Weapons in threatening contexts
   - Depictions of physical harm
   - Self-harm or suicide imagery

3. **Hate Symbols & Discrimination**:
   - Hate symbols, offensive gestures, or discriminatory imagery
   - Racist, sexist, or other discriminatory content

4. **Illegal Content**:
   - Drug paraphernalia or illegal substances
   - Child exploitation (IMMEDIATE REJECT)
   - Illegal activities

5. **Other Violations**:
   - Graphic disturbing content
   - Animal cruelty

Respond with ONLY a JSON object containing:
- isSafe (boolean): true only if image is completely appropriate
- concerns (array of strings): List ALL specific concerns found (use exact categories like "Adult/Explicit Content", "Graphic Violence", etc.)
- severity (string): "low" for minor issues, "medium" for moderate concerns, "high" for serious violations
- detailedReason (string): A clear explanation of why the image was flagged or rejected, suitable for showing to users`;
  }

  /**
   * Creates a fallback result when all vision models fail
   */
  private createFallbackResult(): AnalysisResult {
    this.logger.warn("All vision models failed");
    return {
      isSafe: false,
      concerns: [
        "Unable to analyze image content - vision models unavailable",
      ],
      severity: "medium",
      detailedReason:
        "Image analysis unavailable. This image will be reviewed manually to ensure it meets community guidelines.",
    };
  }

  /**
   * Creates an error result for critical failures
   */
  private createErrorResult(): AnalysisResult {
    return {
      isSafe: false,
      concerns: ["Image analysis system error"],
      severity: "medium",
      detailedReason:
        "An error occurred while analyzing this image. It will be reviewed manually to ensure safety.",
    };
  }
}
