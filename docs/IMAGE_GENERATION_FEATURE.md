# 🎨 AI Image Generation Feature

## Overview

The image generation feature allows users to generate images from text prompts using DALL-E 3, directly integrated into the content creation workflow.

## How It Works

### User Flow

1. **User enters text** in the content input area (e.g., "a sunset over mountains")
2. **Clicks "🎨 Generate" button** next to the Submit button
3. **Loading state** shows while DALL-E 3 generates the image (typically 5-15 seconds)
4. **Generated image appears** as a preview in the input area
5. **User can submit** the generated image for moderation or regenerate with a different prompt

### Technical Implementation

#### Backend (NestJS)

**Endpoint**: `POST /content/generate-image`

**Location**: `backend/src/modules/content/`

**Key Files**:

- `dto/generate-image.dto.ts` - Request/response DTOs
- `services/image-generation.service.ts` - DALL-E 3 integration
- `content.controller.ts` - API endpoint
- `content.module.ts` - Module configuration

**Request Body**:

```json
{
  "prompt": "a sunset over mountains",
  "size": "1024x1024", // optional: "1792x1024" | "1024x1792"
  "quality": "standard" // optional: "hd"
}
```

**Response**:

```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "revisedPrompt": "A breathtaking sunset..."
}
```

**Rate Limiting**: 10 generations per minute per user

**Authentication**: Requires JWT authentication (same as content submission)

#### Frontend (Next.js)

**Component**: `CreatePostCard.tsx`

**Key Features**:

- Button only appears when text content type is selected and text is entered
- Loading state with animated spinner
- Error handling with user-friendly messages
- Generated image shows as preview (reuses existing image preview UI)
- 60-second timeout for generation requests

**Service Method**:

```typescript
contentService.generateImage(prompt, size?, quality?)
```

## Code Reuse

This feature leverages existing DALL-E 3 integration code:

1. **VisualizationService** pattern - Reused the OpenAI images API setup
2. **Authentication flow** - Uses existing JWT authentication middleware
3. **Rate limiting** - Uses existing NestJS throttler
4. **UI components** - Reuses image preview components from paste/URL detection

## Configuration

**Environment Variables** (already configured):

```bash
OPENAI_API_KEY=your_openai_key
```

No additional configuration needed - uses the same OpenAI API key as content moderation.

## Cost Considerations

**DALL-E 3 Pricing** (as of 2024):

- Standard quality (1024x1024): ~$0.04 per image
- HD quality (1024x1024): ~$0.08 per image
- Larger sizes cost the same

**Rate Limiting** helps control costs:

- 10 generations/minute per user
- ~$2.40/hour maximum per user at standard quality

## User Experience

### Button Visibility

- ✅ Shows when: Text mode + text entered
- ❌ Hidden when: Image upload mode, no text, already generating, or submitting

### States

1. **Idle**: Purple "🎨 Generate" button
2. **Generating**: Spinner animation, disabled button, "Generating..." text
3. **Success**: Image appears as preview, text preserved
4. **Error**: Error alert displayed, button re-enabled

### Design

- **Color**: Purple theme to distinguish from Submit (blue) and Rules (gray)
- **Icon**: Image icon (static) or refresh icon (while generating)
- **Responsive**: Text hidden on small screens, icon always visible
- **Accessibility**: Proper disabled states and loading indicators

## Future Enhancements

Potential improvements:

1. **Image size selector** - Let users choose dimensions before generating
2. **Quality toggle** - HD vs Standard quality option
3. **Regenerate button** - Easy way to regenerate with same/modified prompt
4. **Generation history** - Save recent generations for the session
5. **Prompt enhancement** - Auto-improve prompts before sending to DALL-E
6. **Cost tracking** - Show user their generation usage/costs

## Testing

### Manual Testing Steps

1. **Start backend**: `cd backend && npm run start:dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Login** to the application
4. **Type text** in the input area (e.g., "a happy robot")
5. **Click "🎨 Generate"** button
6. **Wait 5-15 seconds** for generation
7. **Verify** image appears in preview
8. **Submit** to test full workflow

### API Testing (with curl)

```bash
# Get JWT token from Supabase
TOKEN="your-jwt-token"

# Generate image
curl -X POST http://localhost:3001/content/generate-image \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a sunset over mountains",
    "size": "1024x1024",
    "quality": "standard"
  }'
```

## Troubleshooting

**Issue**: "Failed to generate image"

- **Check**: OpenAI API key is valid and has credits
- **Check**: Network connectivity to OpenAI API
- **Check**: Backend logs for detailed error message

**Issue**: Button doesn't appear

- **Check**: Text content type is selected (not "Upload Image")
- **Check**: Text is entered in the input field
- **Check**: Not currently submitting or generating

**Issue**: Timeout errors

- **Cause**: DALL-E 3 can sometimes take longer than 60 seconds
- **Solution**: Retry the generation

## Architecture Diagram

```
Frontend (CreatePostCard)
    ↓
contentService.generateImage()
    ↓
POST /content/generate-image
    ↓
ContentController
    ↓
ImageGenerationService
    ↓
OpenAI DALL-E 3 API
    ↓
Image URL returned
    ↓
Display preview
    ↓
User submits for moderation
```

## Related Documentation

- [DALL-E 3 API Documentation](https://platform.openai.com/docs/guides/images)
- [Content Moderation Flow](./MODERATION_AGENT.md)
- [Authentication Guide](./authentication.md)
