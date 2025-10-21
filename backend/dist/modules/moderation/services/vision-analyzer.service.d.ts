import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../interfaces";
export declare class VisionAnalyzerService {
    private readonly openai;
    private readonly gemini;
    private readonly logger;
    constructor(openai: OpenAI, gemini: GoogleGenerativeAI | null);
    analyzeImage(imageUrl: string): Promise<AnalysisResult>;
    private analyzeWithGPT4Vision;
    private analyzeWithGeminiVision;
    private prepareImageForGemini;
    private fetchImageAsBase64;
    private parseJSONResponse;
    private buildVisionPrompt;
    private createFallbackResult;
    private createErrorResult;
}
