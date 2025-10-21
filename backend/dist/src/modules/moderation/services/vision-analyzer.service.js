"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
class VisionAnalyzerService {
    constructor(openai, gemini) {
        this.openai = openai;
        this.gemini = gemini;
        this.logger = new common_1.Logger(VisionAnalyzerService.name);
    }
    async analyzeImage(imageUrl) {
        this.logger.debug("Analyzing image content");
        const visionPrompt = this.buildVisionPrompt();
        try {
            if (this.openai) {
                try {
                    return await this.analyzeWithGPT4Vision(imageUrl, visionPrompt);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.warn("GPT-4 Vision failed:", errorMessage);
                }
            }
            if (this.gemini) {
                try {
                    return await this.analyzeWithGeminiVision(imageUrl, visionPrompt);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.warn("Gemini Vision failed:", errorMessage);
                }
            }
            return this.createFallbackResult();
        }
        catch (error) {
            this.logger.error("Critical error in image analysis:", error);
            return this.createErrorResult();
        }
    }
    async analyzeWithGPT4Vision(imageUrl, prompt) {
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
        this.logger.debug(`GPT-4 Vision result: isSafe=${result.isSafe}, concerns=${result.concerns?.length || 0}`);
        return result;
    }
    async analyzeWithGeminiVision(imageUrl, prompt) {
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
        this.logger.debug(`Gemini Vision result: isSafe=${parsedResult.isSafe}, concerns=${parsedResult.concerns?.length || 0}`);
        return parsedResult;
    }
    async prepareImageForGemini(imageUrl) {
        let imageData;
        let mimeType = "image/jpeg";
        if (imageUrl.startsWith("data:image")) {
            const match = imageUrl.match(/data:(image\/[^;]+);base64,(.+)/);
            if (match) {
                mimeType = match[1];
                imageData = match[2];
            }
            else {
                imageData = imageUrl.split(",")[1];
            }
        }
        else {
            const result = await this.fetchImageAsBase64(imageUrl);
            imageData = result.data;
            mimeType = result.contentType;
        }
        return { imageData, mimeType };
    }
    async fetchImageAsBase64(imageUrl) {
        const https = await Promise.resolve().then(() => __importStar(require("https")));
        const http = await Promise.resolve().then(() => __importStar(require("http")));
        return new Promise((resolve, reject) => {
            const client = imageUrl.startsWith("https") ? https : http;
            client
                .get(imageUrl, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to fetch image: ${res.statusCode}`));
                    return;
                }
                const chunks = [];
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
    parseJSONResponse(content) {
        try {
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : content;
            return JSON.parse(jsonText.trim());
        }
        catch (parseError) {
            const cleaned = content
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            return JSON.parse(cleaned);
        }
    }
    buildVisionPrompt() {
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
    createFallbackResult() {
        this.logger.warn("All vision models failed");
        return {
            isSafe: false,
            concerns: [
                "Unable to analyze image content - vision models unavailable",
            ],
            severity: "medium",
            detailedReason: "Image analysis unavailable. This image will be reviewed manually to ensure it meets community guidelines.",
        };
    }
    createErrorResult() {
        return {
            isSafe: false,
            concerns: ["Image analysis system error"],
            severity: "medium",
            detailedReason: "An error occurred while analyzing this image. It will be reviewed manually to ensure safety.",
        };
    }
}
exports.VisionAnalyzerService = VisionAnalyzerService;
//# sourceMappingURL=vision-analyzer.service.js.map