# LangGraph Agent Documentation

## Overview

This document explains the LangGraph-based content moderation agent with conditional routing and image generation capabilities.

## Architecture

### State Management

The agent uses LangGraph's `Annotation` system for state management:

```typescript
const ModerationStateAnnotation = Annotation.Root({
  content: Annotation<string>,
  contentType: Annotation<ContentType>,
  analysisResult: Annotation<AnalysisResult | undefined>,
  classification: Annotation<"safe" | "flagged" | "harmful" | undefined>,
  decision: Annotation<ModerationDecision | undefined>,
  reasoning: Annotation<string | undefined>,
  visualizationUrl: Annotation<string | undefined>,
  needsVisualization: Annotation<boolean | undefined>,
});
```

### Graph Flow

```
START
  ↓
[ANALYZE NODE]
  ↓ (analyzes content for safety)
  ↓
[CLASSIFY NODE]
  ↓ (classifies as safe/flagged/harmful)
  ↓
[ROUTE: routeClassification]
  ↓
[DECIDE NODE]
  ↓ (makes final decision & sets needsVisualization flag)
  ↓
[ROUTE: routeAfterDecision] ← **CONDITIONAL ROUTING HAPPENS HERE**
  ↓
  ├─→ [needsVisualization === true] → [GENERATE VISUALIZATION NODE] → END
  │
  └─→ [needsVisualization === false] → END
```

## Decision Nodes

### 1. Analyze Node

- **Purpose**: Analyzes content for safety concerns
- **Input**: `content`, `contentType`
- **Output**: `analysisResult` (isSafe, concerns, severity)
- **Logic**: Uses GPT-3.5 to detect hate speech, violence, explicit content, spam, harassment

### 2. Classify Node

- **Purpose**: Classifies content based on analysis
- **Input**: `analysisResult`
- **Output**: `classification` (safe | flagged | harmful)
- **Logic**:
  - If `isSafe === true` → `safe`
  - If `isSafe === false` and `severity === 'high'` → `harmful`
  - Otherwise → `flagged`

### 3. Decide Node

- **Purpose**: Makes final moderation decision
- **Input**: `classification`, `analysisResult`
- **Output**: `decision`, `reasoning`, `needsVisualization`
- **Logic**:
  - `safe` → APPROVED, needsVisualization = false
  - `flagged` → FLAGGED, **needsVisualization = true** ⚠️
  - `harmful` → REJECTED, needsVisualization = false

### 4. Generate Visualization Node

- **Purpose**: Creates explanatory image for flagged content
- **Input**: `reasoning`, `analysisResult`
- **Output**: `visualizationUrl`
- **Logic**: Uses DALL-E 3 to generate educational diagram explaining the concerns

## Conditional Routing Logic

### Route After Decision

This is the key conditional logic that determines if image generation is needed:

```typescript
private routeAfterDecision(state: ModerationState): string {
  this.logger.debug(`[LangGraph Router] After decision - needsVisualization: ${state.needsVisualization}`);

  if (state.needsVisualization) {
    return 'generateVisualization';
  }

  return '__end__';
}
```

**How It Works:**

1. The `decideNode` sets `needsVisualization = true` when content is classified as `'flagged'`
2. After the decide node completes, `routeAfterDecision` is called
3. If `needsVisualization === true`, route to `generateVisualization` node
4. If `needsVisualization === false`, route to `__end__` (skip image generation)

## Test Cases

### Case 1: Safe Content

- **Input**: "Check out our amazing new product launch!"
- **Expected Flow**: analyze → classify → decide → END
- **needsVisualization**: false
- **Image Generated**: NO ❌

### Case 2: Flagged Content

- **Input**: "This is questionable content that needs review."
- **Expected Flow**: analyze → classify → decide → **generateVisualization** → END
- **needsVisualization**: true
- **Image Generated**: YES ✅

### Case 3: Harmful Content

- **Input**: "Extremely offensive hate speech..."
- **Expected Flow**: analyze → classify → decide → END
- **needsVisualization**: false
- **Image Generated**: NO ❌

## Image Generation Details

### When Images Are Generated

- **ONLY** for content classified as `'flagged'` (medium severity)
- NOT for safe content (no need)
- NOT for harmful content (rejected outright)

### Image Characteristics

- Model: DALL-E 3
- Size: 1024x1024
- Quality: Standard
- Style: Clean, professional, informational diagram
- Purpose: Educational visualization of moderation concerns

### Prompt Template

```
Create a simple, educational diagram or illustration that explains content moderation concerns.
The image should visually represent: [reasoning].
Style: clean, professional, informational diagram with icons or symbols representing safety concerns.
Do not include any offensive content - this is an explanatory visualization only.
```

## Error Handling

- If analysis fails → defaults to safe
- If classification fails → uses fallback logic
- If image generation fails → continues without image (doesn't fail the workflow)

## Running Tests

### Option 1: Using Shell Script

```bash
chmod +x test-moderation-flow.sh
export OPENAI_API_KEY='your-api-key'
./test-moderation-flow.sh
```

### Option 2: Using ts-node Directly

```bash
cd backend
export OPENAI_API_KEY='your-api-key'
npx ts-node src/modules/moderation/agents/test-agent.ts
```

### Option 3: Using NestJS Context

```bash
cd backend
npm run start:dev
# Then make API calls to /content endpoint
```

## Verification Checklist

✅ **Multiple Decision Nodes**: analyze → classify → decide → generateVisualization  
✅ **Conditional Routing**: `routeClassification()` and `routeAfterDecision()`  
✅ **State Management**: Using LangGraph Annotation system  
✅ **Image Generation Logic**: Based on `needsVisualization` flag  
✅ **Proper Graph Structure**: Uses `.addConditionalEdges()` for routing

## Implementation Highlights

1. **State Persistence**: State flows through all nodes automatically
2. **Type Safety**: TypeScript interfaces ensure type safety
3. **Logging**: Comprehensive logging at each node for debugging
4. **Fallback Logic**: Graceful degradation if services fail
5. **Scalability**: Easy to add more nodes or routing logic

## Future Enhancements

Possible improvements:

- Add more granular classification categories
- Support multiple image generation styles
- Cache image results to avoid regenerating
- Add human-in-the-loop for borderline cases
- Implement cost tracking for API usage
- Add A/B testing for different prompts

## Conclusion

The condition **DOES WORK** correctly:

- Flagged content triggers `needsVisualization = true`
- Router checks this flag and routes to image generation
- Safe and harmful content skip image generation
- All state is properly managed through the graph
