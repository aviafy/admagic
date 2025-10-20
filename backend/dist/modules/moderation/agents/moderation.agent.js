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
class ModerationAgent {
    constructor(openaiKey, geminiKey, preferredProvider = constants_1.AIProvider.OPENAI) {
        this.logger = new common_1.Logger(ModerationAgent.name);
        this.gemini = null;
        this.openaiModel = new openai_1.ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            temperature: 0,
            openAIApiKey: openaiKey,
        });
        this.openai = new openai_2.default({
            apiKey: openaiKey,
        });
        if (geminiKey) {
            this.gemini = new generative_ai_1.GoogleGenerativeAI(geminiKey);
            this.logger.log("✅ Gemini AI initialized");
        }
        else {
            this.logger.warn("⚠️ Gemini API key not provided, using OpenAI only");
        }
        this.preferredProvider = preferredProvider;
        this.logger.log(`Moderation agent initialized with preferred provider: ${preferredProvider}`);
        this.buildGraph();
    }
    buildGraph() {
        this.logger.debug("Building LangGraph workflow...");
        const workflow = new langgraph_1.StateGraph(ModerationStateAnnotation)
            .addNode("analyze", this.analyzeNode.bind(this))
            .addNode("classify", this.classifyNode.bind(this))
            .addNode("decide", this.decideNode.bind(this))
            .addNode("generateVisualization", this.generateVisualizationNode.bind(this))
            .addEdge("__start__", "analyze")
            .addEdge("analyze", "classify")
            .addConditionalEdges("classify", this.routeClassification.bind(this))
            .addConditionalEdges("decide", this.routeAfterDecision.bind(this))
            .addEdge("generateVisualization", "__end__");
        this.graph = workflow.compile();
        this.logger.log("LangGraph workflow compiled successfully");
    }
    async analyzeImageWithVision(imageUrl) {
        this.logger.debug("[analyzeImageWithVision] Analyzing image content");
        const visionPrompt = `You are a strict content moderation AI with vision capabilities. Analyze this image for safety and appropriateness.

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
        try {
            if (this.openai) {
                try {
                    this.logger.debug("[analyzeImageWithVision] Trying GPT-4 Vision");
                    const model = "gpt-4o";
                    const response = await this.openai.chat.completions.create({
                        model: model,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: visionPrompt },
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
                    let result;
                    try {
                        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                        const jsonText = jsonMatch ? jsonMatch[1] : content;
                        result = JSON.parse(jsonText.trim());
                    }
                    catch (parseError) {
                        this.logger.warn("[analyzeImageWithVision] JSON parse failed, trying cleanup");
                        const cleaned = content
                            .replace(/```json\n?/g, "")
                            .replace(/```\n?/g, "")
                            .trim();
                        result = JSON.parse(cleaned);
                    }
                    this.logger.debug("[analyzeImageWithVision] ✅ GPT-4 Vision succeeded");
                    this.logger.debug(`[analyzeImageWithVision] Result: isSafe=${result.isSafe}, concerns=${result.concerns?.length || 0}`);
                    return result;
                }
                catch (error) {
                    this.logger.warn("[analyzeImageWithVision] GPT-4 Vision failed:", error.message);
                    this.logger.debug("[analyzeImageWithVision] Full error:", error);
                }
            }
            if (this.gemini) {
                try {
                    this.logger.debug("[analyzeImageWithVision] Trying Gemini Vision");
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
                        const https = await Promise.resolve().then(() => __importStar(require("https")));
                        const http = await Promise.resolve().then(() => __importStar(require("http")));
                        const response = await new Promise((resolve, reject) => {
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
                                    resolve({
                                        data: Buffer.concat(chunks),
                                        contentType: contentType,
                                    });
                                });
                                res.on("error", reject);
                            })
                                .on("error", reject);
                        });
                        imageData = response.data.toString("base64");
                        mimeType = response.contentType;
                    }
                    const model = this.gemini.getGenerativeModel({
                        model: "gemini-1.5-flash",
                    });
                    const result = await model.generateContent([
                        visionPrompt,
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageData,
                            },
                        },
                    ]);
                    const response = await result.response;
                    const text = response.text();
                    let parsedResult;
                    try {
                        const cleanedText = text
                            .replace(/```json\n?/g, "")
                            .replace(/```\n?/g, "")
                            .trim();
                        parsedResult = JSON.parse(cleanedText);
                    }
                    catch (parseError) {
                        this.logger.warn("[analyzeImageWithVision] Gemini JSON parse failed");
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            parsedResult = JSON.parse(jsonMatch[0]);
                        }
                        else {
                            throw parseError;
                        }
                    }
                    this.logger.debug("[analyzeImageWithVision] ✅ Gemini Vision succeeded");
                    this.logger.debug(`[analyzeImageWithVision] Result: isSafe=${parsedResult.isSafe}, concerns=${parsedResult.concerns?.length || 0}`);
                    return parsedResult;
                }
                catch (error) {
                    this.logger.warn("[analyzeImageWithVision] Gemini Vision failed:", error.message);
                    this.logger.debug("[analyzeImageWithVision] Full error:", error);
                }
            }
            this.logger.warn("[analyzeImageWithVision] All vision models failed");
            return {
                isSafe: false,
                concerns: [
                    "Unable to analyze image content - vision models unavailable",
                ],
                severity: "medium",
                detailedReason: "Image analysis unavailable. This image will be reviewed manually to ensure it meets community guidelines.",
            };
        }
        catch (error) {
            this.logger.error("[analyzeImageWithVision] Critical error:", error);
            return {
                isSafe: false,
                concerns: ["Image analysis system error"],
                severity: "medium",
                detailedReason: "An error occurred while analyzing this image. It will be reviewed manually to ensure safety.",
            };
        }
    }
    async analyzeNode(state) {
        this.logger.debug(`[analyze] Analyzing ${state.contentType} content`);
        if (state.contentType === constants_1.ContentType.IMAGE) {
            const imageUrl = state.content;
            if (imageUrl.startsWith("http") || imageUrl.startsWith("data:image")) {
                try {
                    const visionResult = await this.analyzeImageWithVision(imageUrl);
                    this.logger.debug("[analyze] ✅ Used Vision Model for image");
                    return {
                        analysisResult: visionResult,
                        aiProvider: constants_1.AIProvider.OPENAI,
                    };
                }
                catch (error) {
                    this.logger.warn("[analyze] Vision analysis failed, falling back to text analysis", error);
                }
            }
        }
        const prompt = `You are a strict content moderation AI. Analyze the following ${state.contentType} content for safety and appropriateness.

Content: ${state.content}

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
        try {
            let analysisResult;
            let usedProvider;
            if (this.preferredProvider === constants_1.AIProvider.GEMINI && this.gemini) {
                try {
                    analysisResult = await this.analyzeWithGemini(prompt);
                    usedProvider = constants_1.AIProvider.GEMINI;
                    this.logger.debug("[analyze] ✅ Used Gemini");
                }
                catch (error) {
                    this.logger.warn("[analyze] Gemini failed, falling back to OpenAI");
                    analysisResult = await this.analyzeWithOpenAI(prompt);
                    usedProvider = constants_1.AIProvider.OPENAI;
                }
            }
            else {
                try {
                    analysisResult = await this.analyzeWithOpenAI(prompt);
                    usedProvider = constants_1.AIProvider.OPENAI;
                    this.logger.debug("[analyze] ✅ Used OpenAI");
                }
                catch (error) {
                    if (this.gemini) {
                        this.logger.warn("[analyze] OpenAI failed, falling back to Gemini");
                        analysisResult = await this.analyzeWithGemini(prompt);
                        usedProvider = constants_1.AIProvider.GEMINI;
                    }
                    else {
                        throw error;
                    }
                }
            }
            this.logger.debug(`[analyze] Complete - Provider=${usedProvider}, Safe=${analysisResult.isSafe}, Severity=${analysisResult.severity}`);
            return {
                analysisResult,
                aiProvider: usedProvider,
            };
        }
        catch (error) {
            this.logger.error("[analyze] All providers failed", error);
            return {
                analysisResult: {
                    isSafe: true,
                    concerns: [],
                    severity: "low",
                    detailedReason: "Analysis failed, defaulting to safe",
                },
                aiProvider: constants_1.AIProvider.OPENAI,
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
        const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        return JSON.parse(cleanedText);
    }
    async classifyNode(state) {
        this.logger.debug("[classify] Classifying content");
        const { analysisResult } = state;
        let classification;
        if (analysisResult.isSafe) {
            classification = "safe";
        }
        else if (analysisResult.severity === "high") {
            classification = "harmful";
        }
        else {
            classification = "flagged";
        }
        this.logger.debug(`[classify] Content classified as: ${classification}`);
        return {
            classification,
        };
    }
    routeClassification(state) {
        return "decide";
    }
    async decideNode(state) {
        this.logger.debug("[decide] Making final decision");
        const { classification, analysisResult, aiProvider } = state;
        let decision;
        let reasoning;
        let needsVisualization = false;
        if (classification === "safe") {
            decision = constants_1.ModerationDecision.APPROVED;
            reasoning = `✅ Content approved. Your content meets all community guidelines and safety standards. [AI: ${aiProvider}]`;
        }
        else if (classification === "flagged") {
            decision = constants_1.ModerationDecision.FLAGGED;
            const concernsList = analysisResult.concerns?.join(", ") || "Unknown";
            const userMessage = analysisResult.detailedReason ||
                `Your content has been flagged for manual review due to potential concerns: ${concernsList}. ` +
                    `This content will be reviewed by our moderation team before publication.`;
            reasoning = `⚠️ ${userMessage} [AI: ${aiProvider}]`;
            needsVisualization = true;
        }
        else {
            decision = constants_1.ModerationDecision.REJECTED;
            const concernsList = analysisResult.concerns?.join(", ") || "Unknown";
            const concerns = analysisResult.concerns || [];
            let userMessage = analysisResult.detailedReason;
            if (!userMessage) {
                if (concerns.some((c) => c.toLowerCase().includes("adult") ||
                    c.toLowerCase().includes("explicit") ||
                    c.toLowerCase().includes("sexual"))) {
                    userMessage =
                        `Your content has been rejected because it contains adult or sexually explicit material (+18). ` +
                            `Our platform does not allow pornographic content, nudity, or sexually suggestive material. ` +
                            `Specific concerns: ${concernsList}.`;
                }
                else if (concerns.some((c) => c.toLowerCase().includes("violence") ||
                    c.toLowerCase().includes("gore") ||
                    c.toLowerCase().includes("harm"))) {
                    userMessage =
                        `Your content has been rejected because it contains graphic violence or harmful content. ` +
                            `Our platform prohibits content depicting violence, gore, self-harm, or cruelty. ` +
                            `Specific concerns: ${concernsList}.`;
                }
                else if (concerns.some((c) => c.toLowerCase().includes("child") ||
                    c.toLowerCase().includes("minor"))) {
                    userMessage =
                        `Your content has been rejected due to serious safety violations involving minors. ` +
                            `This type of content is strictly prohibited and may be reported to authorities.`;
                }
                else {
                    userMessage =
                        `Your content has been rejected because it violates our community guidelines. ` +
                            `Specific violations: ${concernsList}. Please review our content policy and submit appropriate content.`;
                }
            }
            reasoning = `❌ ${userMessage} [AI: ${aiProvider}]`;
        }
        this.logger.log(`[decide] Decision: ${decision} - ${reasoning}`);
        return {
            decision,
            reasoning,
            needsVisualization,
        };
    }
    routeAfterDecision(state) {
        this.logger.debug(`[router] After decision - needsVisualization: ${state.needsVisualization}`);
        if (state.needsVisualization) {
            return "generateVisualization";
        }
        return "__end__";
    }
    async generateVisualizationNode(state) {
        this.logger.debug("[generateVisualization] Creating explanatory image");
        try {
            const { reasoning } = state;
            const imagePrompt = `Create a simple, educational diagram or illustration that explains content moderation concerns.
      The image should visually represent: ${reasoning}.
      Style: clean, professional, informational diagram with icons or symbols representing safety concerns.
      Do not include any offensive content - this is an explanatory visualization only.`;
            this.logger.debug("[generateVisualization] Calling DALL-E API...");
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url",
            });
            const visualizationUrl = response.data[0]?.url;
            if (visualizationUrl) {
                this.logger.log("[generateVisualization] ✅ Image generated successfully");
                return {
                    visualizationUrl,
                };
            }
            else {
                this.logger.warn("[generateVisualization] No image URL returned");
                return {};
            }
        }
        catch (error) {
            this.logger.error("[generateVisualization] Failed to generate image", error);
            return {
                visualizationUrl: undefined,
            };
        }
    }
    async moderate(content, contentType) {
        this.logger.log(`Starting LangGraph moderation for ${contentType} content`);
        const initialState = {
            content,
            contentType,
        };
        try {
            const result = await this.graph.invoke(initialState);
            this.logger.log(`LangGraph moderation complete: ${result.decision} (via ${result.aiProvider})`);
            return result;
        }
        catch (error) {
            this.logger.error("LangGraph execution failed", error);
            throw error;
        }
    }
    isGeminiAvailable() {
        return this.gemini !== null;
    }
    getPreferredProvider() {
        return this.preferredProvider;
    }
}
exports.ModerationAgent = ModerationAgent;
//# sourceMappingURL=moderation.agent.js.map