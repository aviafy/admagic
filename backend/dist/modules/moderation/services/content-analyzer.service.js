"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../common/constants");
class ContentAnalyzerService {
    constructor(openaiModel, gemini, preferredProvider) {
        this.openaiModel = openaiModel;
        this.gemini = gemini;
        this.preferredProvider = preferredProvider;
        this.logger = new common_1.Logger(ContentAnalyzerService.name);
        this.logger.log(`Initialized with preferredProvider: ${preferredProvider}, Gemini available: ${gemini !== null}`);
    }
    async analyze(content, contentType) {
        this.logger.log(`Starting analysis with preferredProvider: ${this.preferredProvider}`);
        this.logger.log(`Gemini available: ${this.gemini !== null}`);
        const prompt = this.buildAnalysisPrompt(content, contentType);
        try {
            let analysisResult;
            let usedProvider;
            if (this.preferredProvider === constants_1.AIProvider.GEMINI && this.gemini) {
                this.logger.log(`Preferred provider is GEMINI, attempting Gemini analysis...`);
                try {
                    analysisResult = await this.analyzeWithGemini(prompt);
                    usedProvider = constants_1.AIProvider.GEMINI;
                    this.logger.log("Successfully used Gemini for analysis");
                }
                catch (error) {
                    this.logger.error(`Gemini failed, falling back to OpenAI. Error: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
                    analysisResult = await this.analyzeWithOpenAI(prompt);
                    usedProvider = constants_1.AIProvider.OPENAI;
                    this.logger.log("Fallback to OpenAI successful");
                }
            }
            else {
                this.logger.log(`Preferred provider is OPENAI or Gemini unavailable, using OpenAI...`);
                try {
                    analysisResult = await this.analyzeWithOpenAI(prompt);
                    usedProvider = constants_1.AIProvider.OPENAI;
                    this.logger.log("Successfully used OpenAI for analysis");
                }
                catch (error) {
                    if (this.gemini) {
                        this.logger.warn("OpenAI failed, falling back to Gemini", error);
                        analysisResult = await this.analyzeWithGemini(prompt);
                        usedProvider = constants_1.AIProvider.GEMINI;
                        this.logger.log("Fallback to Gemini successful");
                    }
                    else {
                        throw error;
                    }
                }
            }
            this.logger.debug(`Analysis complete - Provider=${usedProvider}, Safe=${analysisResult.isSafe}, Severity=${analysisResult.severity}`);
            return { result: analysisResult, provider: usedProvider };
        }
        catch (error) {
            this.logger.error("All providers failed", error);
            return {
                result: {
                    isSafe: true,
                    concerns: [],
                    severity: "low",
                    detailedReason: "Analysis failed, defaulting to safe",
                },
                provider: constants_1.AIProvider.OPENAI,
            };
        }
    }
    async analyzeWithOpenAI(prompt) {
        const response = await this.openaiModel.invoke(prompt);
        return JSON.parse(response.content);
    }
    async analyzeWithGemini(prompt) {
        if (!this.gemini) {
            throw new Error("Gemini not initialized");
        }
        const model = this.gemini.getGenerativeModel({
            model: "gemini-flash-latest",
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        return JSON.parse(cleanedText);
    }
    buildAnalysisPrompt(content, contentType) {
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
exports.ContentAnalyzerService = ContentAnalyzerService;
//# sourceMappingURL=content-analyzer.service.js.map