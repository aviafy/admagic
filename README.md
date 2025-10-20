# AI-Powered Content Moderator

A full-stack application for AI-powered content moderation using LangGraph, NestJS, Next.js, and Supabase.

## Features

- **AI-Powered Moderation**: Uses LangGraph with OpenAI/Gemini to analyze content through a multi-step decision process
- **🎨 AI-Generated Visualizations**: Automatically creates explanatory images using DALL-E 3 for flagged content
- **Real-time Updates**: Supabase WebSocket subscriptions with polling fallback for live status updates
- **Dual AI Support**: OpenAI GPT-3.5-turbo + Google Gemini Pro with automatic fallback
- **User Authentication**: Supabase Auth for secure user management
- **Audit Logging**: Complete audit trail of all moderation decisions
- **Content Types**: Supports both text and image URL moderation

## Tech Stack

### Backend

- **NestJS**: TypeScript-based Node.js framework
- **LangGraph**: Multi-agent AI workflow with 4 decision nodes (analyze → classify → decide → visualize)
- **OpenAI**: GPT-3.5-turbo for content analysis + DALL-E 3 for image generation
- **Google Gemini**: Gemini Pro as alternative/fallback AI provider
- **Supabase**: Database and authentication

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling
- **Supabase Client**: Authentication integration

## Project Structure

```
admagic/
├── backend/
│   ├── src/
│   │   ├── content/          # Content submission endpoints
│   │   ├── moderation/       # LangGraph agent implementation
│   │   ├── supabase/         # Database service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── supabase-schema.sql   # Database schema
│   └── package.json
└── frontend/
    ├── app/
    │   └── page.tsx          # Main application page
    ├── components/
    │   ├── AuthForm.tsx      # Login/signup form
    │   ├── ContentForm.tsx   # Content submission form
    │   └── ModerationResult.tsx  # Results display
    ├── lib/
    │   └── supabase.ts       # Supabase client config
    └── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### 2. Supabase Setup

1. Create a new project on Supabase
2. Go to SQL Editor and run the schema from `backend/supabase-schema.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# PORT=3001
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_KEY=your_supabase_anon_key
# OPENAI_API_KEY=your_openai_api_key

# Install dependencies (already done)
npm install

# Start the server
npm run start:dev
```

Backend will run on http://localhost:3001

### 4. Frontend Setup

```bash
cd frontend

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Install dependencies (already done)
npm install

# Start the dev server
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Submit Content**: Choose text or image URL and submit content for moderation
3. **View Results**: Watch real-time AI analysis with decision and reasoning
4. **Check Status**: Results show approved/flagged/rejected with detailed reasoning

## LangGraph Workflow

The moderation agent uses a 4-node state machine with conditional routing:

1. **Analyze Node**: Uses GPT-3.5/Gemini to analyze content for safety concerns
2. **Classify Node**: Categorizes content as safe/flagged/harmful based on severity
3. **Decide Node**: Makes final decision (approved/flagged/rejected) with reasoning
4. **Generate Visualization Node** (conditional): Uses DALL-E 3 to create explanatory images for flagged content

### Image Generation Logic

- ✅ **Flagged content** → AI generates explanatory diagram using DALL-E 3
- ❌ **Safe content** → No image (not needed)
- ❌ **Harmful content** → No image (clear violation)

**Test it:**

```bash
cd backend
export OPENAI_API_KEY='your-key'
./test-image-generation.sh
```

## API Endpoints

### POST `/content/submit`

Submit content for moderation

```json
{
  "userId": "user-uuid",
  "contentType": "text",
  "contentText": "Content to moderate"
}
```

### GET `/content/status/:id`

Get moderation status and results

```json
{
  "id": "submission-uuid",
  "status": "approved",
  "aiDecision": {
    "decision": "approved",
    "reasoning": "Content meets all safety guidelines.",
    "classification": "safe"
  }
}
```

## Database Schema

### content_submissions

- User submissions with content and moderation status
- Stores AI decisions and reasoning

### audit_logs

- Complete audit trail of all moderation actions
- Links to submissions for transparency

## Development Notes

- Backend uses TypeScript with NestJS decorators
- Frontend is client-side rendered with real-time polling
- Authentication state managed via Supabase Auth
- Row Level Security (RLS) enabled on all tables

## License

ISC
