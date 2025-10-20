# Moderation Agent - LangGraph Implementation

## Overview

This directory contains a LangGraph-based content moderation agent with conditional routing for automatic image generation.

## Files

- **`moderation.agent.ts`** - Main LangGraph agent implementation
- **`test-agent.ts`** - Test suite to verify conditional routing

## Key Features

### ✅ 1. Multiple Decision Nodes (3 total)

1. **Analyze Node** - Analyzes content for safety using GPT-3.5
2. **Classify Node** - Classifies content as safe/flagged/harmful
3. **Decide Node** - Makes final moderation decision

### ✅ 2. Conditional Routing

The agent uses LangGraph's conditional edges to route based on state:

```typescript
// Router that determines if image generation is needed
private routeAfterDecision(state: ModerationState): string {
  if (state.needsVisualization) {
    return 'generateVisualization'; // ✅ Generate image
  }
  return '__end__'; // ❌ Skip image generation
}
```

### ✅ 3. Proper State Management

Uses LangGraph's `Annotation` system for type-safe state management:

```typescript
const ModerationStateAnnotation = Annotation.Root({
  content: Annotation<string>,
  contentType: Annotation<ContentType>,
  analysisResult: Annotation<AnalysisResult | undefined>,
  classification: Annotation<"safe" | "flagged" | "harmful" | undefined>,
  decision: Annotation<ModerationDecision | undefined>,
  reasoning: Annotation<string | undefined>,
  visualizationUrl: Annotation<string | undefined>,
  needsVisualization: Annotation<boolean | undefined>, // ← Key flag
});
```

## The Conditional Logic

### When is Image Generation Triggered?

**ONLY when content is classified as "flagged"** (medium severity concerns)

```typescript
// In decideNode (line 175)
if (classification === "flagged") {
  needsVisualization = true; // ✅ This triggers image generation
}
```

### Truth Table

| Content Classification | needsVisualization | Image Generated? |
| ---------------------- | ------------------ | ---------------- |
| safe                   | false              | NO               |
| flagged                | **true**           | **YES** ✅       |
| harmful                | false              | NO               |

## Graph Flow

```
START
  ↓
ANALYZE (Node 1)
  ↓
CLASSIFY (Node 2)
  ↓
DECIDE (Node 3)
  ↓
ROUTER (Conditional)
  ├─→ [if needsVisualization === true] → GENERATE IMAGE → END
  └─→ [if needsVisualization === false] → END
```

## Usage

### In Production

```typescript
import { ModerationAgent } from "./moderation.agent";

const agent = new ModerationAgent(apiKey);
const result = await agent.moderate(content, contentType);

console.log(result.decision); // APPROVED, FLAGGED, or REJECTED
console.log(result.visualizationUrl); // Image URL if flagged
```

### Running Tests

```bash
# From project root
export OPENAI_API_KEY='your-key'
./backend/test-moderation-flow.sh

# Or directly with ts-node
cd backend
npx ts-node src/modules/moderation/agents/test-agent.ts
```

## Implementation Details

### Decision Logic

**Analyze → Classify:**

```typescript
if (analysisResult.isSafe) {
  classification = "safe";
} else if (analysisResult.severity === "high") {
  classification = "harmful";
} else {
  classification = "flagged"; // ← Medium severity
}
```

**Classify → Decide:**

```typescript
if (classification === "safe") {
  decision = APPROVED;
  needsVisualization = false; // ❌
} else if (classification === "flagged") {
  decision = FLAGGED;
  needsVisualization = true; // ✅ IMAGE GENERATION TRIGGERED
} else {
  decision = REJECTED;
  needsVisualization = false; // ❌
}
```

**Decide → Router:**

```typescript
if (state.needsVisualization) {
  return "generateVisualization"; // ✅ Go to image gen node
}
return "__end__"; // ❌ Skip image gen
```

### Image Generation

When `needsVisualization === true`, the agent:

1. Calls DALL-E 3 API
2. Generates educational diagram explaining concerns
3. Returns visualization URL
4. URL is included in moderation result

**Prompt Template:**

```
Create a simple, educational diagram that explains content moderation concerns.
The image should visually represent: [reasoning].
Style: clean, professional, informational diagram.
```

## Architecture

### LangGraph Components Used

- **StateGraph** - Main graph builder
- **Annotation** - Type-safe state management
- **addNode()** - Register processing nodes
- **addEdge()** - Fixed connections between nodes
- **addConditionalEdges()** - Dynamic routing based on state
- **compile()** - Build executable workflow

### Why LangGraph?

1. **State Management** - Automatic state flow between nodes
2. **Type Safety** - TypeScript-first design
3. **Conditional Routing** - Easy to implement decision trees
4. **Debugging** - Clear flow visualization
5. **Scalability** - Easy to add more nodes/routes

## Testing

### Test Cases

The test suite verifies three scenarios:

1. **Safe Content** - Should NOT generate image

   - Input: "Check out our amazing new product!"
   - Expected: `needsVisualization: false`, no image

2. **Flagged Content** - SHOULD generate image ✅

   - Input: "Questionable content that needs review"
   - Expected: `needsVisualization: true`, image generated

3. **Harmful Content** - Should NOT generate image
   - Input: "Extremely offensive content"
   - Expected: `needsVisualization: false`, no image

### Expected Test Output

```
✅ Results:
  Decision: FLAGGED
  Classification: flagged
  Reasoning: Content flagged for review. Concerns: ...
  Needs Visualization: true
  Visualization URL: ✅ Generated

✅ Test PASSED: Image generation condition works correctly
```

## Error Handling

- **Analysis fails** → Defaults to safe classification
- **Classification fails** → Uses fallback logic
- **Image generation fails** → Continues without image (doesn't fail workflow)
- **API errors** → Logged and handled gracefully

## Performance

- **API Calls**: 2 for flagged content (GPT-3.5 + DALL-E 3)
- **Latency**: ~5-10 seconds for flagged content with image
- **Cost**: ~$0.04 per DALL-E 3 image
- **Rate Limits**: Respects OpenAI rate limits

## Logging

Each node logs its progress:

```
[LangGraph Node: analyze] Analyzing social_post content
[LangGraph Node: classify] Content classified as: flagged
[LangGraph Router] After decision - needsVisualization: true
[LangGraph Node: generateVisualization] Generating explanatory image
```

## Future Enhancements

- [ ] Cache generated images to avoid regeneration
- [ ] Support multiple visualization styles
- [ ] Add human-in-the-loop for borderline cases
- [ ] Implement cost tracking
- [ ] A/B test different prompts
- [ ] Add more granular classifications

## Documentation

See also:

- `/LANGGRAPH_AGENT_DOCUMENTATION.md` - Full documentation
- `/LANGGRAPH_FLOW_DIAGRAM.md` - Visual flow diagram
- `/CONDITION_VERIFICATION_SUMMARY.md` - Verification details
- `/QUICK_TEST_GUIDE.md` - Quick testing guide

## Verification

**Status**: ✅ VERIFIED AND WORKING

The conditional routing for image generation is properly implemented and tested.

**To verify:**

```bash
export OPENAI_API_KEY='your-key'
./backend/test-moderation-flow.sh
```
