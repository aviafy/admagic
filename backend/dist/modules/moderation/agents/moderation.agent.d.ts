import { ModerationState } from "../interfaces";
import { ContentType, AIProvider } from "../../../common/constants";
export declare class ModerationAgent {
    private readonly logger;
    private openaiModel;
    private openai;
    private gemini;
    private preferredProvider;
    private graph;
    constructor(openaiKey: string, geminiKey?: string, preferredProvider?: AIProvider);
    private buildGraph;
    private analyzeImageWithVision;
    private analyzeNode;
    private analyzeWithOpenAI;
    private analyzeWithGemini;
    private classifyNode;
    private routeClassification;
    private decideNode;
    private routeAfterDecision;
    private generateVisualizationNode;
    moderate(content: string, contentType: ContentType): Promise<ModerationState>;
    isGeminiAvailable(): boolean;
    getPreferredProvider(): AIProvider;
}
