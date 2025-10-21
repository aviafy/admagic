import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { GenerateImageDto } from "../dto/generate-image.dto";

/**
 * Service for generating images using DALL-E 3
 * Reuses the existing OpenAI integration from the moderation workflow
 */
@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("openai.apiKey");

    if (!apiKey) {
      throw new Error("OpenAI API key is required for image generation");
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.log("Image generation service initialized with DALL-E 3");
  }

  /**
   * Generate an image from a text prompt using DALL-E 3
   */
  async generateImage(dto: GenerateImageDto): Promise<{ imageUrl: string; revisedPrompt?: string }> {
    const { prompt, size = "1024x1024", quality = "standard" } = dto;

    this.logger.log(`Generating image with DALL-E 3: "${prompt.substring(0, 50)}..."`);

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size,
        quality,
        response_format: "url",
      });

      const imageUrl = response.data?.[0]?.url;
      const revisedPrompt = response.data?.[0]?.revised_prompt;

      if (!imageUrl) {
        throw new Error("No image URL returned from DALL-E");
      }

      this.logger.log("Image generated successfully");
      return { imageUrl, revisedPrompt };
    } catch (error: any) {
      this.logger.error("Failed to generate image with DALL-E 3", error);

      // Provide user-friendly error messages for common OpenAI errors
      if (error?.code === 'content_policy_violation') {
        throw new Error("Your prompt was rejected by OpenAI's safety system. Please try a different prompt that follows content guidelines.");
      }

      if (error?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few moments.");
      }

      // Re-throw original error for other cases
      throw error;
    }
  }
}
