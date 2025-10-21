# Moderation Agent

## Overview

This directory contains the LangGraph-based content moderation agent implementation.

## Main File

- **`moderation.agent.ts`** - Main agent implementation with conditional routing and image generation

## Documentation

📚 **Full documentation is available at:** [`/docs/MODERATION_AGENT.md`](../../../../docs/MODERATION_AGENT.md)

The comprehensive documentation includes:

- Architecture and graph flow
- State management
- Decision nodes and routing logic
- Image generation details
- Usage examples
- Testing guide
- Error handling
- Performance considerations

## Quick Start

```typescript
import { ModerationAgent } from "./moderation.agent";
import { ContentType } from "../../../common/constants";

// Initialize
const agent = new ModerationAgent(
  process.env.OPENAI_API_KEY,
  process.env.GEMINI_API_KEY
);

// Moderate content
const result = await agent.moderate("Your content here", ContentType.TEXT);

// Result contains:
// - result.decision: APPROVED, FLAGGED, or REJECTED
// - result.visualizationUrl: Image URL if flagged
```

## Testing

```bash
cd backend
export OPENAI_API_KEY='your-key'
npx ts-node test/test-agent.ts
```

## Key Features

✅ Multi-provider support (OpenAI & Gemini)  
✅ Vision analysis for images  
✅ Conditional image generation for flagged content  
✅ Type-safe state management  
✅ Comprehensive error handling

## Related Documentation

- [Main Documentation](../../../../docs/MODERATION_AGENT.md)
- [LangGraph Flow Diagram](../../../../docs/LANGGRAPH_FLOW_DIAGRAM.md)
- [Gemini Integration](../../../../docs/GEMINI_INTEGRATION_GUIDE.md)
- [System Architecture](../../../../docs/SYSTEM_ARCHITECTURE_DIAGRAM.md)
