import { Logger } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../../../common/constants";
import { AnalysisResult } from "../interfaces";

/**
 * Service responsible for analyzing text and URL content using AI models
 * Supports both OpenAI GPT-3.5 and Google Gemini
 */
export class ContentAnalyzerService {
  private readonly logger = new Logger(ContentAnalyzerService.name);

  constructor(
    private readonly openaiModel: ChatOpenAI,
    private readonly gemini: GoogleGenerativeAI | null,
    private readonly preferredProvider: AIProvider
  ) {
    this.logger.log(
      `🔧 [ContentAnalyzer] Initialized with preferredProvider: ${preferredProvider}, Gemini available: ${
        gemini !== null
      }`
    );
  }

  /**
   * Analyzes text/URL content for safety and appropriateness
   * Uses preferred provider first, then falls back to alternative
   */
  async analyze(
    content: string,
    contentType: string
  ): Promise<{ result: AnalysisResult; provider: AIProvider }> {
    this.logger.log(
      `🔍 [ContentAnalyzer.analyze] Starting analysis with preferredProvider: ${this.preferredProvider}`
    );
    this.logger.log(
      `📝 [ContentAnalyzer.analyze] Gemini available: ${this.gemini !== null}`
    );

    const prompt = this.buildAnalysisPrompt(content, contentType);

    try {
      let analysisResult: AnalysisResult;
      let usedProvider: AIProvider;

      // Try preferred provider first
      if (this.preferredProvider === AIProvider.GEMINI && this.gemini) {
        this.logger.log(
          `🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI, attempting Gemini analysis...`
        );
        try {
          analysisResult = await this.analyzeWithGemini(prompt);
          usedProvider = AIProvider.GEMINI;
          this.logger.log(
            "✅ [ContentAnalyzer.analyze] Successfully used Gemini for analysis"
          );
        } catch (error) {
          this.logger.error(
            `❌ [ContentAnalyzer.analyze] Gemini failed, falling back to OpenAI. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
            error instanceof Error ? error.stack : undefined
          );
          analysisResult = await this.analyzeWithOpenAI(prompt);
          usedProvider = AIProvider.OPENAI;
          this.logger.log(
            "✅ [ContentAnalyzer.analyze] Fallback to OpenAI successful"
          );
        }
      } else {
        this.logger.log(
          `🔵 [ContentAnalyzer.analyze] Preferred provider is OPENAI or Gemini unavailable, using OpenAI...`
        );
        try {
          analysisResult = await this.analyzeWithOpenAI(prompt);
          usedProvider = AIProvider.OPENAI;
          this.logger.log(
            "✅ [ContentAnalyzer.analyze] Successfully used OpenAI for analysis"
          );
        } catch (error) {
          if (this.gemini) {
            this.logger.warn(
              "⚠️ [ContentAnalyzer.analyze] OpenAI failed, falling back to Gemini",
              error
            );
            analysisResult = await this.analyzeWithGemini(prompt);
            usedProvider = AIProvider.GEMINI;
            this.logger.log(
              "✅ [ContentAnalyzer.analyze] Fallback to Gemini successful"
            );
          } else {
            throw error;
          }
        }
      }

      this.logger.debug(
        `Analysis complete - Provider=${usedProvider}, Safe=${analysisResult.isSafe}, Severity=${analysisResult.severity}`
      );

      return { result: analysisResult, provider: usedProvider };
    } catch (error) {
      this.logger.error("All providers failed", error);
      return {
        result: {
          isSafe: true,
          concerns: [],
          severity: "low",
          detailedReason: "Analysis failed, defaulting to safe",
        },
        provider: AIProvider.OPENAI,
      };
    }
  }

  /**
   * Analyzes content using OpenAI GPT-3.5
   */
  private async analyzeWithOpenAI(prompt: string): Promise<AnalysisResult> {
    const response = await this.openaiModel.invoke(prompt);
    return JSON.parse(response.content as string);
  }

  /**
   * Analyzes content using Google Gemini
   */
  private async analyzeWithGemini(prompt: string): Promise<AnalysisResult> {
    if (!this.gemini) {
      throw new Error("Gemini not initialized");
    }

    const model = this.gemini.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Gemini sometimes wraps JSON in markdown, so clean it
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText);
  }

  /**
   * Builds the analysis prompt for text/URL content
   */
  private buildAnalysisPrompt(content: string, contentType: string): string {
    return `You are a strict content moderation AI. Analyze the following ${contentType} content for safety and appropriateness.

Content: ${content}

Carefully check for the following violations (be very strict):

1. **Adult/Explicit Content (+18)**:
   - Sexual content, nudity, or sexually suggestive material
   - Pornographic or erotic content
   - Sexual solicitation or services
   - Content intended for mature audiences only

2. **Violence**:
   - Graphic violence, gore, or bloodshed
   - Depictions of physical harm or torture
   - Weapons used in threatening contexts
   - Self-harm or suicide content
   - Animal cruelty

3. **Hate Speech & Discrimination**:
   - Targeting individuals or groups based on race, religion, ethnicity, gender, sexual orientation, etc.
   - Slurs, derogatory language, or hate symbols

4. **Threats & Harassment**:
   - Direct threats of violence or harm
   - Cyberbullying, stalking, or intimidation
   - Doxxing or privacy violations

5. **Illegal Content**:
   - Drug trafficking or illegal substance promotion
   - Illegal weapons sales
   - Human trafficking or exploitation
   - Child exploitation (IMMEDIATE REJECT)

6. **Spam & Misinformation**:
   - Misleading or false information
   - Scams or fraudulent schemes
   - Excessive promotional content

Be extremely cautious with:
- Images that might contain hidden inappropriate content
- URLs that might lead to inappropriate websites
- Text with coded language or euphemisms for inappropriate content

Respond with ONLY a JSON object containing:
- isSafe (boolean): true only if content is completely appropriate
- concerns (array of strings): List ALL specific concerns found (use exact categories like "Adult/Explicit Content", "Graphic Violence", etc.)
- severity (string): "low" for minor issues, "medium" for moderate concerns, "high" for serious violations
- detailedReason (string): A clear explanation of why the content was flagged or rejected, suitable for showing to users`;
  }
}
