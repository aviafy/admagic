import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModerationState } from "../interfaces";
export declare class VisualizationService {
    private readonly openaiModel;
    private readonly openai;
    private readonly gemini;
    private readonly logger;
    constructor(openaiModel: ChatOpenAI, openai: OpenAI, gemini: GoogleGenerativeAI | null);
    shouldGenerateVisualization(state: ModerationState): Promise<boolean>;
    private decideWithOpenAI;
    private decideWithGemini;
    generateVisualization(reasoning: string): Promise<string | undefined>;
}
