# 🏗️ System Architecture Diagram

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT / FRONTEND                               │
│                                                                          │
│  • Next.js Application                                                  │
│  • Content Submission Form                                              │
│  • Status Checking UI                                                   │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP Requests
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        REST API LAYER ✅                                 │
│                     (NestJS Backend)                                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────┐            │
│  │  Content Controller                                     │            │
│  │  • POST /content/submit                                 │            │
│  │  • GET /content/status/:id                              │            │
│  └──────────────┬─────────────────────────────────────────┘            │
│                 │                                                        │
│                 ↓                                                        │
│  ┌────────────────────────────────────────────────────────┐            │
│  │  Content Service                                        │            │
│  │  • submitContent()                                      │            │
│  │  • getSubmissionStatus()                                │            │
│  │  • processModeration() (async)                          │            │
│  └──────────────┬──────────────────────┬──────────────────┘            │
└─────────────────┼──────────────────────┼───────────────────────────────┘
                  │                      │
                  │                      │
    ┌─────────────┘                      └─────────────┐
    │                                                   │
    ↓                                                   ↓
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  DATABASE SERVICE ✅             │    │  MODERATION SERVICE ✅           │
│  (Supabase Client)               │    │  (AI Agent Orchestrator)        │
│                                  │    │                                  │
│  • createSubmission()            │    │  • moderateContent()            │
│  • updateSubmission()            │    │  • Uses: ModerationAgent        │
│  • getSubmission()               │    │                                  │
│  • createAuditLog()              │    └──────────┬──────────────────────┘
│                                  │               │
└──────────────┬───────────────────┘               │
               │                                   ↓
               │              ┌─────────────────────────────────────────────┐
               │              │     LANGGRAPH AGENT ✅                       │
               │              │     (State Machine)                         │
               │              │                                             │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  State Annotation                      │ │
               │              │  │  • content                             │ │
               │              │  │  • contentType                         │ │
               │              │  │  • analysisResult                      │ │
               │              │  │  • classification                      │ │
               │              │  │  • decision                            │ │
               │              │  │  • reasoning                           │ │
               │              │  │  • needsVisualization                  │ │
               │              │  │  • visualizationUrl                    │ │
               │              │  └───────────────────────────────────────┘ │
               │              │                                             │
               │              │  WORKFLOW:                                  │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │         START                         │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                ↓                            │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  NODE 1: ANALYZE ✅                   │ │
               │              │  │  • Uses: GPT-3.5-turbo                │ │
               │              │  │  • Analyzes content safety            │ │
               │              │  │  • Returns: analysisResult            │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                ↓                            │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  NODE 2: CLASSIFY ✅                  │ │
               │              │  │  • Rule-based classification          │ │
               │              │  │  • Returns: safe/flagged/harmful      │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                ↓                            │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  ROUTER: routeClassification()        │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                ↓                            │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  NODE 3: DECIDE ✅                    │ │
               │              │  │  • Makes final decision               │ │
               │              │  │  • Sets needsVisualization flag       │ │
               │              │  │  • Returns: decision, reasoning       │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                ↓                            │
               │              │  ┌───────────────────────────────────────┐ │
               │              │  │  ROUTER: routeAfterDecision()         │ │
               │              │  │  • Checks needsVisualization          │ │
               │              │  │  • Routes conditionally               │ │
               │              │  └─────────────┬─────────────────────────┘ │
               │              │                │                            │
               │              │    ┌───────────┴────────────┐              │
               │              │    │                        │              │
               │              │   YES                      NO              │
               │              │    │                        │              │
               │              │    ↓                        ↓              │
               │              │  ┌─────────────┐      ┌─────────┐        │
               │              │  │  NODE 4:    │      │   END   │        │
               │              │  │  GENERATE   │      └─────────┘        │
               │              │  │  IMAGE ✅   │                          │
               │              │  │  • DALL-E 3 │                          │
               │              │  └──────┬──────┘                          │
               │              │         ↓                                  │
               │              │    ┌─────────┐                            │
               │              │    │   END   │                            │
               │              │    └─────────┘                            │
               │              └─────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE DATABASE ✅                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────┐            │
│  │  Table: content_submissions                             │            │
│  │  ─────────────────────────────────────────────────────  │            │
│  │  • id (UUID)                                            │            │
│  │  • user_id (TEXT)                                       │            │
│  │  • content_type (TEXT/IMAGE)                            │            │
│  │  • content_text (TEXT)                                  │            │
│  │  • content_url (TEXT)                                   │            │
│  │  • status (pending/approved/flagged/rejected)           │            │
│  │  • ai_decision (JSONB) ← Stores AI results             │            │
│  │  • created_at (TIMESTAMP)                               │            │
│  │  • updated_at (TIMESTAMP)                               │            │
│  └────────────────────────────────────────────────────────┘            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────┐            │
│  │  Table: audit_logs                                      │            │
│  │  ─────────────────────────────────────────────────────  │            │
│  │  • id (UUID)                                            │            │
│  │  • submission_id (UUID FK)                              │            │
│  │  • action (TEXT) ← submission_created, moderation_      │            │
│  │                     completed, moderation_error         │            │
│  │  • details (JSONB) ← Full audit trail                  │            │
│  │  • created_at (TIMESTAMP)                               │            │
│  └────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↑
                                   │
                    ┌──────────────┴─────────────┐
                    │                            │
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  EXTERNAL AI SERVICES         │   │  EXTERNAL AI SERVICES          │
│                               │   │                                │
│  OpenAI API ✅                │   │  Google Gemini API ❌          │
│  • GPT-3.5-turbo              │   │  • NOT IMPLEMENTED             │
│    (text analysis)            │   │                                │
│  • DALL-E 3                   │   └────────────────────────────────┘
│    (image generation)         │
└───────────────────────────────┘
```

---

## Data Flow Diagram

### Flow 1: Content Submission ✅

```
User → Frontend → POST /content/submit → Content Service
                                              ↓
                                    Create Submission in DB
                                              ↓
                                    Create Audit Log (SUBMISSION_CREATED)
                                              ↓
                                    Return {submissionId, status: "pending"}
                                              ↓
                                    Trigger Async Moderation
                                              ↓
                                    Moderation Service
                                              ↓
                                    LangGraph Agent
                                              ↓
                                    ANALYZE → CLASSIFY → DECIDE → [GENERATE IMAGE?]
                                              ↓
                                    Update Submission in DB
                                              ↓
                                    Create Audit Log (MODERATION_COMPLETED)
```

### Flow 2: Status Checking ✅

```
User → Frontend → GET /content/status/:id → Content Service
                                                  ↓
                                        Query Submission from DB
                                                  ↓
                                        Return {
                                          id,
                                          status,
                                          aiDecision: {
                                            decision,
                                            reasoning,
                                            visualizationUrl
                                          }
                                        }
```

---

## Component Status

### ✅ Implemented Components

```
REST API Layer ✅
├── ContentController ✅
│   ├── POST /content/submit ✅
│   └── GET /content/status/:id ✅
└── ContentService ✅
    ├── submitContent() ✅
    ├── getSubmissionStatus() ✅
    └── processModeration() ✅

Database Layer ✅
├── DatabaseService ✅
│   ├── createSubmission() ✅
│   ├── updateSubmission() ✅
│   ├── getSubmission() ✅
│   └── createAuditLog() ✅
└── Supabase Tables ✅
    ├── content_submissions ✅
    └── audit_logs ✅

Moderation Layer ✅
├── ModerationService ✅
│   └── moderateContent() ✅
└── LangGraph Agent ✅
    ├── State Machine ✅
    ├── Node 1: Analyze (GPT-3.5) ✅
    ├── Node 2: Classify ✅
    ├── Node 3: Decide ✅
    ├── Node 4: Generate Image (DALL-E 3) ✅
    └── Conditional Routing ✅

External Services
├── OpenAI ✅
│   ├── GPT-3.5-turbo ✅
│   └── DALL-E 3 ✅
└── Google Gemini ❌ (NOT IMPLEMENTED)
```

### ❌ Missing Components

```
AI Providers
└── Google Gemini ❌
    ├── Gemini API Integration ❌
    ├── Text Analysis with Gemini ❌
    └── Provider Switching Logic ❌

Image Analysis Tools ❌
├── Image Content Moderation ❌
├── OCR/Text Extraction ❌
├── NSFW Detection ❌
└── Visual Safety Checks ❌

Tool Architecture ⚠️
├── Pluggable Tool System ❌
├── Tool Registry ❌
└── Dynamic Tool Loading ❌
```

---

## Tech Stack

### Backend

- **Framework:** NestJS (TypeScript)
- **AI Orchestration:** LangGraph (@langchain/langgraph)
- **AI Provider:** OpenAI (GPT-3.5, DALL-E 3)
- **Database:** Supabase (PostgreSQL)
- **Validation:** class-validator

### Frontend

- **Framework:** Next.js (TypeScript)
- **Auth:** Supabase Auth
- **UI:** React Components

### Database

- **Provider:** Supabase
- **Type:** PostgreSQL
- **Tables:** content_submissions, audit_logs

### AI Services

- **Text Analysis:** OpenAI GPT-3.5-turbo ✅
- **Image Generation:** OpenAI DALL-E 3 ✅
- **Image Analysis:** ❌ Not implemented
- **Multi-Provider:** ❌ Only OpenAI

---

## API Endpoints

### POST /content/submit ✅

**Purpose:** Submit content for moderation

**Request:**

```json
{
  "userId": "string",
  "contentType": "text" | "image",
  "contentText": "string (optional)",
  "contentUrl": "string (optional)"
}
```

**Response:**

```json
{
  "submissionId": "uuid",
  "status": "pending",
  "message": "Content submitted for moderation"
}
```

### GET /content/status/:id ✅

**Purpose:** Get moderation status and results

**Response:**

```json
{
  "id": "uuid",
  "status": "approved" | "flagged" | "rejected" | "pending",
  "contentType": "text" | "image",
  "aiDecision": {
    "decision": "approved" | "flagged" | "rejected",
    "reasoning": "string",
    "classification": ["safe"] | ["flagged"] | ["harmful"],
    "analysisResult": {...},
    "visualizationUrl": "string (optional)"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Conclusion

### ✅ Working System Architecture

Your system has a **solid, production-ready architecture** for text content moderation:

1. **REST API** - Complete endpoints ✅
2. **LangGraph State Machine** - Proper workflow ✅
3. **Supabase Storage** - Persistent data ✅
4. **AI Moderation** - OpenAI integration ✅
5. **Audit Trail** - Complete logging ✅

### ❌ Missing Pieces

1. Gemini AI integration (if multi-provider is needed)
2. Image content analysis (only generation works)
3. More pluggable tool architecture

**Overall:** **~80% complete** and **production-ready** for text moderation! 🎉
