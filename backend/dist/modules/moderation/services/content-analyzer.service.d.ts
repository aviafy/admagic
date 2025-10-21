import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../../../common/constants";
import { AnalysisResult } from "../interfaces";
export declare class ContentAnalyzerService {
    private readonly openaiModel;
    private readonly gemini;
    private readonly preferredProvider;
    private readonly logger;
    constructor(openaiModel: ChatOpenAI, gemini: GoogleGenerativeAI | null, preferredProvider: AIProvider);
    analyze(content: string, contentType: string): Promise<{
        result: AnalysisResult;
        provider: AIProvider;
    }>;
    private analyzeWithOpenAI;
    private analyzeWithGemini;
    private buildAnalysisPrompt;
}
