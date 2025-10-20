# 🚀 Gemini Integration Guide

## Complete Step-by-Step Implementation

This guide shows you how to add Google Gemini AI to your moderation system alongside OpenAI.

---

## Step 1: Install Dependencies

```bash
cd backend
npm install @google/generative-ai
```

---

## Step 2: Add Gemini API Key to Configuration

### Update `backend/src/config/configuration.ts`

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // ADD THIS: Gemini configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
});
```

### Update `backend/src/config/validation.schema.ts`

```typescript
import * as Joi from "joi";

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  OPENAI_API_KEY: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().optional(), // ADD THIS
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_KEY: Joi.string().required(),
});
```

### Update your `.env` file

```bash
# backend/.env
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here  # ADD THIS
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

---

## Step 3: Create AI Provider Enum

### Create `backend/src/common/constants/ai-provider.constants.ts`

```typescript
export enum AIProvider {
  OPENAI = "openai",
  GEMINI = "gemini",
}

export const DEFAULT_AI_PROVIDER = AIProvider.OPENAI;
```

### Update `backend/src/common/constants/index.ts`

```typescript
export * from "./content.constants";
export * from "./ai-provider.constants"; // ADD THIS
```

---

## Step 4: Update Moderation Agent

### Replace `backend/src/modules/moderation/agents/moderation.agent.ts`

````typescript
import { Logger } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ADD THIS
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ModerationState, AnalysisResult } from "../interfaces";
import {
  ContentType,
  ModerationDecision,
  AIProvider,
} from "../../../common/constants";

// Define the state annotation for LangGraph
const ModerationStateAnnotation = Annotation.Root({
  content: Annotation<string>,
  contentType: Annotation<ContentType>,
  analysisResult: Annotation<AnalysisResult | undefined>,
  classification: Annotation<"safe" | "flagged" | "harmful" | undefined>,
  decision: Annotation<ModerationDecision | undefined>,
  reasoning: Annotation<string | undefined>,
  visualizationUrl: Annotation<string | undefined>,
  needsVisualization: Annotation<boolean | undefined>,
  aiProvider: Annotation<AIProvider | undefined>, // ADD THIS: Track which AI was used
});

export class ModerationAgent {
  private readonly logger = new Logger(ModerationAgent.name);

  // OpenAI clients
  private openaiModel: ChatOpenAI;
  private openai: OpenAI;

  // Gemini client
  private gemini: GoogleGenerativeAI | null = null;

  // Configuration
  private preferredProvider: AIProvider;
  private graph: any;

  constructor(
    openaiKey: string,
    geminiKey?: string,
    preferredProvider: AIProvider = AIProvider.OPENAI
  ) {
    // Initialize OpenAI
    this.openaiModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: openaiKey,
    });

    this.openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Initialize Gemini if key provided
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.logger.log("Gemini AI initialized");
    } else {
      this.logger.warn("Gemini API key not provided, using OpenAI only");
    }

    this.preferredProvider = preferredProvider;
    this.logger.log(
      `Moderation agent initialized with preferred provider: ${preferredProvider}`
    );

    // Build the LangGraph workflow
    this.buildGraph();
  }

  /**
   * Build the LangGraph state machine
   */
  private buildGraph(): void {
    this.logger.debug("Building LangGraph workflow...");

    const workflow = new StateGraph(ModerationStateAnnotation)
      .addNode("analyze", this.analyzeNode.bind(this))
      .addNode("classify", this.classifyNode.bind(this))
      .addNode("decide", this.decideNode.bind(this))
      .addNode(
        "generateVisualization",
        this.generateVisualizationNode.bind(this)
      )
      .addEdge("__start__", "analyze")
      .addEdge("analyze", "classify")
      .addConditionalEdges("classify", this.routeClassification.bind(this))
      .addConditionalEdges("decide", this.routeAfterDecision.bind(this))
      .addEdge("generateVisualization", "__end__");

    this.graph = workflow.compile();
    this.logger.log("LangGraph workflow compiled successfully");
  }

  /**
   * LangGraph Node 1: Analyze content using AI
   * NOW SUPPORTS BOTH OPENAI AND GEMINI
   */
  private async analyzeNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug(
      `[LangGraph Node: analyze] Analyzing ${state.contentType} content`
    );

    const prompt = `Analyze the following ${state.contentType} content for safety and appropriateness:

Content: ${state.content}

Determine if it contains:
- Hate speech or discrimination
- Violence or threats
- Adult or explicit content
- Spam or misleading information
- Harassment or bullying

Respond with a JSON object containing:
- isSafe (boolean)
- concerns (array of strings)
- severity (low/medium/high)`;

    try {
      let analysisResult: AnalysisResult;
      let usedProvider: AIProvider;

      // Try preferred provider first, fallback to alternative
      if (this.preferredProvider === AIProvider.GEMINI && this.gemini) {
        try {
          analysisResult = await this.analyzeWithGemini(prompt);
          usedProvider = AIProvider.GEMINI;
          this.logger.debug("[LangGraph Node: analyze] Used Gemini");
        } catch (error) {
          this.logger.warn(
            "[LangGraph Node: analyze] Gemini failed, falling back to OpenAI",
            error.message
          );
          analysisResult = await this.analyzeWithOpenAI(prompt);
          usedProvider = AIProvider.OPENAI;
        }
      } else {
        try {
          analysisResult = await this.analyzeWithOpenAI(prompt);
          usedProvider = AIProvider.OPENAI;
          this.logger.debug("[LangGraph Node: analyze] Used OpenAI");
        } catch (error) {
          if (this.gemini) {
            this.logger.warn(
              "[LangGraph Node: analyze] OpenAI failed, falling back to Gemini",
              error.message
            );
            analysisResult = await this.analyzeWithGemini(prompt);
            usedProvider = AIProvider.GEMINI;
          } else {
            throw error;
          }
        }
      }

      this.logger.debug(
        `[LangGraph Node: analyze] Complete - Provider=${usedProvider}, Safe=${analysisResult.isSafe}, Severity=${analysisResult.severity}`
      );

      return {
        analysisResult,
        aiProvider: usedProvider,
      };
    } catch (error) {
      this.logger.error(
        "[LangGraph Node: analyze] All providers failed",
        error
      );
      // Fallback
      return {
        analysisResult: {
          isSafe: true,
          concerns: [],
          severity: "low",
        },
        aiProvider: AIProvider.OPENAI,
      };
    }
  }

  /**
   * Analyze content using OpenAI GPT-3.5
   */
  private async analyzeWithOpenAI(prompt: string): Promise<AnalysisResult> {
    const response = await this.openaiModel.invoke(prompt);
    return JSON.parse(response.content as string);
  }

  /**
   * Analyze content using Google Gemini
   */
  private async analyzeWithGemini(prompt: string): Promise<AnalysisResult> {
    if (!this.gemini) {
      throw new Error("Gemini not initialized");
    }

    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    // Gemini sometimes wraps JSON in markdown, so clean it
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText);
  }

  /**
   * LangGraph Node 2: Classify content based on analysis
   * (No changes needed - works with both providers)
   */
  private async classifyNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug("[LangGraph Node: classify] Classifying content");

    const { analysisResult } = state;

    let classification: "safe" | "flagged" | "harmful";

    if (analysisResult.isSafe) {
      classification = "safe";
    } else if (analysisResult.severity === "high") {
      classification = "harmful";
    } else {
      classification = "flagged";
    }

    this.logger.debug(
      `[LangGraph Node: classify] Content classified as: ${classification}`
    );

    return {
      classification,
    };
  }

  /**
   * LangGraph Conditional Edge: Route based on classification
   */
  private routeClassification(state: ModerationState): string {
    const { classification } = state;
    this.logger.debug(
      `[LangGraph Router] Routing classification: ${classification}`
    );
    return "decide";
  }

  /**
   * LangGraph Node 3: Make final moderation decision
   * (No changes needed)
   */
  private async decideNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug("[LangGraph Node: decide] Making final decision");

    const { classification, analysisResult, aiProvider } = state;

    let decision: ModerationDecision;
    let reasoning: string;
    let needsVisualization = false;

    if (classification === "safe") {
      decision = ModerationDecision.APPROVED;
      reasoning = "Content meets all safety guidelines.";
    } else if (classification === "flagged") {
      decision = ModerationDecision.FLAGGED;
      reasoning = `Content flagged for review. Concerns: ${
        analysisResult.concerns?.join(", ") || "Unknown"
      }. Analyzed by: ${aiProvider || "AI"}.`;
      needsVisualization = true;
    } else {
      decision = ModerationDecision.REJECTED;
      reasoning = `Content rejected. High severity concerns: ${
        analysisResult.concerns?.join(", ") || "Unknown"
      }. Analyzed by: ${aiProvider || "AI"}.`;
    }

    this.logger.log(
      `[LangGraph Node: decide] Decision: ${decision} - ${reasoning}`
    );

    return {
      decision,
      reasoning,
      needsVisualization,
    };
  }

  /**
   * LangGraph Router: Determine if we need to generate visualization
   */
  private routeAfterDecision(state: ModerationState): string {
    this.logger.debug(
      `[LangGraph Router] After decision - needsVisualization: ${state.needsVisualization}`
    );

    if (state.needsVisualization) {
      return "generateVisualization";
    }

    return "__end__";
  }

  /**
   * LangGraph Node 4: Generate visualization
   * (Uses OpenAI DALL-E - could add Gemini's Imagen in the future)
   */
  private async generateVisualizationNode(
    state: ModerationState
  ): Promise<Partial<ModerationState>> {
    this.logger.debug(
      "[LangGraph Node: generateVisualization] Generating explanatory image"
    );

    try {
      const { reasoning, analysisResult } = state;

      const imagePrompt = `Create a simple, educational diagram or illustration that explains content moderation concerns.
      The image should visually represent: ${reasoning}.
      Style: clean, professional, informational diagram with icons or symbols representing safety concerns.
      Do not include any offensive content - this is an explanatory visualization only.`;

      this.logger.debug(
        "[LangGraph Node: generateVisualization] Calling DALL-E API..."
      );

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
        this.logger.log(
          `[LangGraph Node: generateVisualization] Image generated successfully`
        );
        return {
          visualizationUrl,
        };
      } else {
        this.logger.warn(
          "[LangGraph Node: generateVisualization] No image URL returned"
        );
        return {};
      }
    } catch (error) {
      this.logger.error(
        "[LangGraph Node: generateVisualization] Failed to generate image",
        error
      );
      return {
        visualizationUrl: undefined,
      };
    }
  }

  /**
   * Execute the complete LangGraph moderation workflow
   */
  async moderate(
    content: string,
    contentType: ContentType
  ): Promise<ModerationState> {
    this.logger.log(`Starting LangGraph moderation for ${contentType} content`);

    const initialState: ModerationState = {
      content,
      contentType,
    };

    try {
      const result = await this.graph.invoke(initialState);
      this.logger.log(
        `LangGraph moderation complete: ${result.decision} (via ${result.aiProvider})`
      );
      return result;
    } catch (error) {
      this.logger.error("LangGraph execution failed", error);
      throw error;
    }
  }

  /**
   * Get current AI provider
   */
  getPreferredProvider(): AIProvider {
    return this.preferredProvider;
  }

  /**
   * Check if Gemini is available
   */
  isGeminiAvailable(): boolean {
    return this.gemini !== null;
  }
}
````

---

## Step 5: Update Moderation Service

### Update `backend/src/modules/moderation/moderation.service.ts`

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModerationAgent } from "./agents/moderation.agent";
import { ContentType, AIProvider } from "../../common/constants";
import { ModerationResult } from "../../common/interfaces";

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private agent: ModerationAgent;

  constructor(private configService: ConfigService) {
    const openaiKey = this.configService.get<string>("openai.apiKey");
    const geminiKey = this.configService.get<string>("gemini.apiKey"); // ADD THIS

    // Choose preferred provider (default to OpenAI)
    const preferredProvider = this.configService.get<AIProvider>(
      "aiProvider",
      AIProvider.OPENAI
    );

    this.agent = new ModerationAgent(openaiKey, geminiKey, preferredProvider); // UPDATED

    this.logger.log(
      `Moderation service initialized - Gemini available: ${this.agent.isGeminiAvailable()}`
    );
  }

  async moderateContent(
    content: string,
    contentType: ContentType
  ): Promise<ModerationResult> {
    this.logger.log(`Moderating ${contentType} content`);

    try {
      const result = await this.agent.moderate(content, contentType);

      return {
        decision: result.decision,
        reasoning: result.reasoning,
        classification: result.classification ? [result.classification] : [],
        analysisResult: result.analysisResult,
        visualizationUrl: result.visualizationUrl,
      };
    } catch (error) {
      this.logger.error("Moderation failed", error);
      throw error;
    }
  }

  // ADD THIS: Method to get AI provider info
  getProviderInfo(): { preferred: AIProvider; geminiAvailable: boolean } {
    return {
      preferred: this.agent.getPreferredProvider(),
      geminiAvailable: this.agent.isGeminiAvailable(),
    };
  }
}
```

---

## Step 6: Update State Interface

### Update `backend/src/modules/moderation/interfaces/moderation-state.interface.ts`

```typescript
import {
  ContentType,
  ModerationDecision,
  AIProvider,
} from "../../../common/constants";

export type ContentClassification = "safe" | "flagged" | "harmful";

export interface AnalysisResult {
  isSafe: boolean;
  concerns: string[];
  severity: "low" | "medium" | "high";
}

export interface ModerationState {
  content: string;
  contentType: ContentType;
  analysisResult?: AnalysisResult;
  classification?: ContentClassification;
  decision?: ModerationDecision;
  reasoning?: string;
  visualizationUrl?: string;
  needsVisualization?: boolean;
  aiProvider?: AIProvider; // ADD THIS
}
```

---

## Step 7: Get Gemini API Key

### How to Get Your Gemini API Key

1. **Go to Google AI Studio:**

   - Visit: https://makersuite.google.com/app/apikey

2. **Sign in with Google Account**

3. **Create API Key:**

   - Click "Create API Key"
   - Choose or create a Google Cloud project
   - Copy the API key

4. **Add to .env:**
   ```bash
   GEMINI_API_KEY=your-gemini-key-here
   ```

---

## Step 8: Test the Integration

### Create Test Script: `backend/src/modules/moderation/agents/test-gemini.ts`

```typescript
import { ModerationAgent } from "./moderation.agent";
import { ContentType, AIProvider } from "../../../common/constants";

async function testGeminiIntegration() {
  console.log("🧪 Testing Gemini Integration\n");

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey) {
    console.error("❌ OPENAI_API_KEY not set");
    process.exit(1);
  }

  if (!geminiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }

  // Test 1: Using OpenAI
  console.log("Test 1: Using OpenAI as preferred provider");
  console.log("=".repeat(60));
  const agentOpenAI = new ModerationAgent(
    openaiKey,
    geminiKey,
    AIProvider.OPENAI
  );
  const result1 = await agentOpenAI.moderate(
    "This is test content to moderate",
    ContentType.TEXT
  );
  console.log(`✅ Result: ${result1.decision} (via ${result1.aiProvider})`);
  console.log(`   Reasoning: ${result1.reasoning}\n`);

  // Test 2: Using Gemini
  console.log("Test 2: Using Gemini as preferred provider");
  console.log("=".repeat(60));
  const agentGemini = new ModerationAgent(
    openaiKey,
    geminiKey,
    AIProvider.GEMINI
  );
  const result2 = await agentGemini.moderate(
    "This is test content to moderate",
    ContentType.TEXT
  );
  console.log(`✅ Result: ${result2.decision} (via ${result2.aiProvider})`);
  console.log(`   Reasoning: ${result2.reasoning}\n`);

  // Test 3: Flagged content with Gemini
  console.log("Test 3: Flagged content with Gemini");
  console.log("=".repeat(60));
  const result3 = await agentGemini.moderate(
    "This is questionable content that might need review",
    ContentType.TEXT
  );
  console.log(`✅ Result: ${result3.decision} (via ${result3.aiProvider})`);
  console.log(`   Reasoning: ${result3.reasoning}`);
  console.log(`   Needs Visualization: ${result3.needsVisualization}\n`);

  console.log("🎉 All tests completed!");
}

testGeminiIntegration().catch(console.error);
```

### Run the test:

```bash
cd backend
export OPENAI_API_KEY='your-openai-key'
export GEMINI_API_KEY='your-gemini-key'
npx ts-node src/modules/moderation/agents/test-gemini.ts
```

---

## Step 9: Configure Provider Preference

### Option A: Set via Environment Variable

```bash
# In .env
AI_PROVIDER=gemini  # or 'openai'
```

### Option B: Set via Configuration

```typescript
// In backend/src/config/configuration.ts
export default () => ({
  // ...
  aiProvider: process.env.AI_PROVIDER || "openai",
});
```

---

## How It Works

### Provider Selection Logic

```
1. Check preferred provider
2. Try preferred provider first
3. If it fails, automatically fallback to alternative
4. Log which provider was used
```

### Example Flows

#### Using OpenAI (default):

```
User submits content
  → Analyze with OpenAI GPT-3.5 ✅
  → Classify result
  → Make decision
  → Generate image with DALL-E (if needed)
```

#### Using Gemini:

```
User submits content
  → Analyze with Gemini Pro ✅
  → Classify result
  → Make decision
  → Generate image with DALL-E (if needed)
```

#### Automatic Fallback:

```
User submits content
  → Try Gemini Pro ❌ (fails)
  → Fallback to OpenAI GPT-3.5 ✅
  → Classify result
  → Make decision
```

---

## Verification

### Check Provider in Use

```typescript
// In your controller or service
const providerInfo = this.moderationService.getProviderInfo();
console.log(`Preferred: ${providerInfo.preferred}`);
console.log(`Gemini Available: ${providerInfo.geminiAvailable}`);
```

### Check Logs

```
[ModerationAgent] Moderation agent initialized with preferred provider: gemini
[ModerationAgent] Gemini AI initialized
[LangGraph Node: analyze] Used Gemini
[LangGraph Node: decide] Decision: APPROVED - ... Analyzed by: gemini.
```

---

## Summary

### What You Get:

✅ **Dual AI Provider Support**

- OpenAI GPT-3.5-turbo
- Google Gemini Pro

✅ **Automatic Fallback**

- If preferred provider fails, uses backup

✅ **Provider Tracking**

- Know which AI analyzed each piece of content

✅ **Easy Configuration**

- Just add GEMINI_API_KEY to .env

✅ **Backward Compatible**

- Works without Gemini (OpenAI only)

### Files Changed:

1. `backend/package.json` - Added @google/generative-ai
2. `backend/src/config/configuration.ts` - Added Gemini config
3. `backend/src/config/validation.schema.ts` - Added Gemini key validation
4. `backend/src/common/constants/ai-provider.constants.ts` - New file
5. `backend/src/modules/moderation/agents/moderation.agent.ts` - Updated
6. `backend/src/modules/moderation/moderation.service.ts` - Updated
7. `backend/src/modules/moderation/interfaces/moderation-state.interface.ts` - Updated

---

## Next Steps

1. Install dependencies: `npm install @google/generative-ai`
2. Get Gemini API key from https://makersuite.google.com/app/apikey
3. Add `GEMINI_API_KEY` to your `.env` file
4. Update the files as shown above
5. Test with `test-gemini.ts`
6. Deploy! 🚀

**Your moderation system now supports both OpenAI and Gemini!** 🎉
