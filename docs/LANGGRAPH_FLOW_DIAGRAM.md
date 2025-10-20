# LangGraph Agent Flow Diagram

## Visual Representation of the Conditional Routing Logic

```
┌─────────────────────────────────────────────────────────────────────┐
│                          START                                       │
│                     (Initial State)                                  │
│                                                                       │
│  State: { content, contentType }                                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE 1: ANALYZE                                   │
│                   (Decision Node)                                    │
│                                                                       │
│  • Analyzes content for safety using GPT-3.5                        │
│  • Checks for: hate speech, violence, explicit content              │
│                                                                       │
│  Output: analysisResult = {                                         │
│    isSafe: boolean,                                                 │
│    concerns: string[],                                              │
│    severity: 'low' | 'medium' | 'high'                             │
│  }                                                                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NODE 2: CLASSIFY                                   │
│                  (Decision Node)                                     │
│                                                                       │
│  Classification Logic:                                               │
│  ┌────────────────────────────────────┐                            │
│  │ IF isSafe === true                 │ → classification = 'safe'   │
│  │ ELIF severity === 'high'           │ → classification = 'harmful'│
│  │ ELSE                               │ → classification = 'flagged'│
│  └────────────────────────────────────┘                            │
│                                                                       │
│  Output: classification ('safe' | 'flagged' | 'harmful')            │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ROUTER 1: routeClassification()                         │
│                                                                       │
│  • Currently routes all classifications to 'decide'                 │
│  • Could be extended for different routing based on class           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE 3: DECIDE                                    │
│                   (Decision Node)                                    │
│                                                                       │
│  Decision Logic:                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ IF classification === 'safe'                                 │  │
│  │   → decision = APPROVED                                      │  │
│  │   → reasoning = "Content meets all safety guidelines"        │  │
│  │   → needsVisualization = false ❌                           │  │
│  │                                                              │  │
│  │ ELIF classification === 'flagged'                           │  │
│  │   → decision = FLAGGED                                      │  │
│  │   → reasoning = "Content flagged for review..."            │  │
│  │   → needsVisualization = true ✅ ← KEY CONDITION           │  │
│  │                                                              │  │
│  │ ELSE (classification === 'harmful')                         │  │
│  │   → decision = REJECTED                                     │  │
│  │   → reasoning = "Content rejected..."                       │  │
│  │   → needsVisualization = false ❌                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Output: decision, reasoning, needsVisualization                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│           🔀 ROUTER 2: routeAfterDecision()                         │
│              (CONDITIONAL ROUTING LOGIC)                             │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │   IF state.needsVisualization === true                      │    │
│  │      RETURN 'generateVisualization'                         │    │
│  │   ELSE                                                       │    │
│  │      RETURN '__end__'                                        │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
    needsVisualization            needsVisualization
         = true                        = false
                │                       │
                ▼                       ▼
┌───────────────────────────┐   ┌─────────────────┐
│  NODE 4: GENERATE          │   │      END        │
│  VISUALIZATION             │   │                 │
│                            │   │  No image       │
│  • Uses DALL-E 3           │   │  generated      │
│  • Creates explanatory     │   │                 │
│    diagram                 │   └─────────────────┘
│  • Size: 1024x1024         │
│  • Style: Professional     │
│                            │
│  Output:                   │
│    visualizationUrl        │
└──────────┬─────────────────┘
           │
           ▼
    ┌─────────────┐
    │     END     │
    │             │
    │ With image  │
    │  generated  │
    └─────────────┘
```

## Flow Examples

### Example 1: Safe Content ✅

```
Input: "Check out our new product!"

ANALYZE → analysisResult: { isSafe: true, concerns: [], severity: 'low' }
   ↓
CLASSIFY → classification: 'safe'
   ↓
DECIDE → decision: APPROVED, needsVisualization: false
   ↓
ROUTER → needsVisualization === false → route to '__end__'
   ↓
END (no image generated)
```

### Example 2: Flagged Content ⚠️

```
Input: "This content is slightly inappropriate and questionable"

ANALYZE → analysisResult: { isSafe: false, concerns: ['inappropriate'], severity: 'medium' }
   ↓
CLASSIFY → classification: 'flagged'
   ↓
DECIDE → decision: FLAGGED, needsVisualization: TRUE ✅
   ↓
ROUTER → needsVisualization === true → route to 'generateVisualization'
   ↓
GENERATE VISUALIZATION → visualizationUrl: "https://oaidalleapi...."
   ↓
END (with image generated)
```

### Example 3: Harmful Content ❌

```
Input: "Extremely offensive hate speech and threats"

ANALYZE → analysisResult: { isSafe: false, concerns: ['hate speech', 'threats'], severity: 'high' }
   ↓
CLASSIFY → classification: 'harmful'
   ↓
DECIDE → decision: REJECTED, needsVisualization: false
   ↓
ROUTER → needsVisualization === false → route to '__end__'
   ↓
END (no image generated)
```

## Key Decision Points

### 🎯 Decision Point 1: Classification

**Where**: `classifyNode`
**Condition**:

- `isSafe === true` → safe
- `severity === 'high'` → harmful
- Otherwise → flagged

### 🎯 Decision Point 2: Image Generation (MAIN CONDITION)

**Where**: `decideNode`
**Condition**:

```typescript
if (classification === "flagged") {
  needsVisualization = true; // ✅ THIS IS THE KEY CONDITION
}
```

### 🎯 Decision Point 3: Routing

**Where**: `routeAfterDecision`
**Condition**:

```typescript
if (state.needsVisualization) {
  return "generateVisualization"; // ✅ ROUTES TO IMAGE GENERATION
}
return "__end__"; // ❌ SKIPS IMAGE GENERATION
```

## State Flow Table

| Node                  | Input State                    | Processing       | Output State                              |
| --------------------- | ------------------------------ | ---------------- | ----------------------------------------- |
| analyze               | content, contentType           | GPT-3.5 analysis | + analysisResult                          |
| classify              | analysisResult                 | Rule-based logic | + classification                          |
| decide                | classification, analysisResult | Decision logic   | + decision, reasoning, needsVisualization |
| routeAfterDecision    | needsVisualization             | Check flag       | Next node name                            |
| generateVisualization | reasoning, analysisResult      | DALL-E 3 API     | + visualizationUrl                        |

## Condition Verification

### ✅ The condition WORKS because:

1. **State is preserved**: LangGraph's Annotation system ensures state flows between nodes
2. **Flag is set correctly**: `decideNode` sets `needsVisualization = true` for flagged content
3. **Router checks flag**: `routeAfterDecision` properly checks the flag
4. **Conditional edges work**: `.addConditionalEdges()` properly implements routing
5. **Type safety**: TypeScript ensures the boolean flag is handled correctly

### Testing the Condition

Run the test script to verify:

```bash
export OPENAI_API_KEY='your-key'
./backend/test-moderation-flow.sh
```

Expected results:

- ✅ Safe content: NO image generated
- ✅ Flagged content: Image IS generated
- ✅ Harmful content: NO image generated

## Implementation Notes

- The graph is compiled in `buildGraph()` method
- Nodes are bound to class methods using `.bind(this)`
- Conditional edges return the next node name as a string
- Special node names: `__start__` and `__end__` are reserved by LangGraph
- Error handling ensures workflow doesn't fail if image generation fails
