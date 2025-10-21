import { ModerationState } from "../interfaces";
import { ContentType, AIProvider } from "../../../common/constants";
export declare class ModerationAgent {
    private readonly logger;
    private readonly visionAnalyzer;
    private readonly contentAnalyzer;
    private readonly visualizationService;
    private readonly decisionService;
    private graph;
    private readonly gemini;
    constructor(openaiKey: string, geminiKey?: string, preferredProvider?: AIProvider);
    private buildGraph;
    private analyzeNode;
    private classifyNode;
    private decideNode;
    private routeAfterDecision;
    private generateVisualizationNode;
    moderate(content: string, contentType: ContentType): Promise<ModerationState>;
    isGeminiAvailable(): boolean;
}
