# Gemini Flow Debugging Guide

## Overview

This document explains the comprehensive logging added to debug the Gemini provider selection issue. The logs trace the entire flow from frontend to backend to identify where OpenAI might still be used when Gemini is selected.

## Problem Statement

User reports that when they switch to Gemini in the UI, the system still uses OpenAI for content moderation.

## Log Flow

### Frontend Logs

#### 1. **LLM Provider Context Initialization**

```
📂 [LLMProvider] Loading provider from localStorage: <value or "not found">
✅ [LLMProvider] Provider set to: <provider>
ℹ️ [LLMProvider] Using default provider: openai
```

**Location**: `frontend/src/shared/contexts/LLMProviderContext.tsx` (lines 22-30)
**When**: On application load
**What to check**: Verify the correct provider is loaded from localStorage

#### 2. **Provider Switch**

```
🔄 [LLMProvider] Switching provider from <old> to <new>
✅ [LLMProvider] Provider saved to localStorage: <provider>
```

**Location**: `frontend/src/shared/contexts/LLMProviderContext.tsx` (lines 34-38)
**When**: User clicks OpenAI or Gemini button in header
**What to check**: Confirm provider change is persisted to localStorage

#### 3. **User Click Events**

```
🖱️ [Header] User clicked OpenAI button
🖱️ [Header] User clicked Gemini button
```

**Location**: `frontend/src/shared/components/Header.tsx` (lines 84, 101)
**When**: User clicks provider toggle buttons
**What to check**: Verify button clicks are registered

#### 4. **Content Submission**

```
🚀 [Frontend] Submitting content with AI provider: <provider>
✅ [Frontend] Submission response received: <response>
```

**Location**: `frontend/src/features/content/components/CreatePostCard.tsx` (lines 332, 339)
**When**: User submits content for moderation
**What to check**: Confirm the correct provider is being sent in the request

---

### Backend Logs

#### 5. **Controller - Request Received**

```
🔵 [Controller] Received content submission from user: <userId> with AI provider: <provider or "default">
📦 [Controller] SubmitDto: <JSON payload>
```

**Location**: `backend/src/modules/content/content.controller.ts` (lines 45-48)
**When**: Backend receives content submission
**What to check**: Verify the `aiProvider` field is present in the DTO

#### 6. **Content Service - Processing**

```
🟢 [ContentService] Processing moderation for submission: <submissionId>
🤖 [ContentService] Requested AI provider: <provider or "default (OpenAI)">
📤 [ContentService] Calling moderationService with provider: <provider>
📥 [ContentService] Moderation result received - Decision: <decision>, Used provider: <provider>
```

**Location**: `backend/src/modules/content/content.service.ts` (lines 62-76)
**When**: Content service processes the submission
**What to check**: Confirm provider is passed correctly to moderation service

#### 7. **Moderation Service - Agent Selection**

```
🟣 [ModerationService] Moderating <contentType> content with provider: <provider or "default (OpenAI)">
💾 [ModerationService] Using cached moderation result (saved AI API call) - Used provider: <provider>
🔧 [ModerationService] No cache hit. Creating/using agent with provider: <provider>
⚡ [ModerationService] Creating NEW agent instance for provider: <provider>
✅ [ModerationService] New agent created with preferred provider: <provider>
♻️ [ModerationService] Using existing default agent (OpenAI)
🚀 [ModerationService] Calling agent.moderate()...
✅ [ModerationService] Agent returned result with provider: <provider>
```

**Location**: `backend/src/modules/moderation/moderation.service.ts` (lines 54-84)
**When**: Moderation service decides which agent to use
**What to check**:

- If Gemini is requested, verify a new agent is created
- Check if cache is being used (could be serving OpenAI cached result)
- **CRITICAL**: Verify the cache key includes the provider (line 58)

#### 8. **Moderation Agent - Initialization**

```
🏗️ [ModerationAgent] Constructor called with preferredProvider: <provider>
✅ [ModerationAgent] Gemini AI initialized
⚠️ [ModerationAgent] Gemini API key not provided, using OpenAI only
🔧 [ModerationAgent] Initializing services with preferredProvider: <provider>
✅ [ModerationAgent] Moderation agent initialized with preferred provider: <provider>
```

**Location**: `backend/src/modules/moderation/agents/moderation.agent.ts` (lines 37-74)
**When**: A new moderation agent is created
**What to check**:

- Confirm Gemini API key is available
- Verify services are initialized with correct provider

#### 9. **Moderation Agent - Analysis Node**

```
📊 [ModerationAgent.analyzeNode] Analyzing <contentType> content
👁️ [ModerationAgent.analyzeNode] Using Vision Model for image
✅ [ModerationAgent.analyzeNode] Vision analysis complete - Using OpenAI
⚠️ [ModerationAgent.analyzeNode] Vision analysis failed, falling back to text analysis
🤖 [ModerationAgent.analyzeNode] Calling ContentAnalyzer.analyze()...
✅ [ModerationAgent.analyzeNode] Analysis complete with provider: <provider>
```

**Location**: `backend/src/modules/moderation/agents/moderation.agent.ts` (lines 118-149)
**When**: Content is analyzed
**What to check**:

- For images, vision analysis always uses OpenAI (expected behavior)
- For text, verify ContentAnalyzer is called

#### 10. **Content Analyzer - Provider Selection**

```
🔧 [ContentAnalyzer] Initialized with preferredProvider: <provider>, Gemini available: <true/false>
🔍 [ContentAnalyzer.analyze] Starting analysis with preferredProvider: <provider>
📝 [ContentAnalyzer.analyze] Gemini available: <true/false>
🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI, attempting Gemini analysis...
✅ [ContentAnalyzer.analyze] Successfully used Gemini for analysis
❌ [ContentAnalyzer.analyze] Gemini failed, falling back to OpenAI. Error: <error>
✅ [ContentAnalyzer.analyze] Fallback to OpenAI successful
🔵 [ContentAnalyzer.analyze] Preferred provider is OPENAI or Gemini unavailable, using OpenAI...
✅ [ContentAnalyzer.analyze] Successfully used OpenAI for analysis
⚠️ [ContentAnalyzer.analyze] OpenAI failed, falling back to Gemini
✅ [ContentAnalyzer.analyze] Fallback to Gemini successful
```

**Location**: `backend/src/modules/moderation/services/content-analyzer.service.ts` (lines 19-71)
**When**: Text content is analyzed
**What to check**:

- Verify preferred provider matches request
- If Gemini fails, check error message
- Confirm correct provider is actually used

---

## Debugging Steps

### Step 1: Check Frontend Provider State

1. Open browser DevTools Console
2. Look for `📂 [LLMProvider] Loading provider from localStorage:`
3. Verify the loaded provider is correct
4. If not, check localStorage: `localStorage.getItem('admagic-ai-provider')`

### Step 2: Switch Providers

1. Click Gemini button in header
2. Look for: `🖱️ [Header] User clicked Gemini button`
3. Then: `🔄 [LLMProvider] Switching provider from openai to gemini`
4. Then: `✅ [LLMProvider] Provider saved to localStorage: gemini`

### Step 3: Submit Content

1. Submit a text post
2. Frontend logs should show:
   ```
   🚀 [Frontend] Submitting content with AI provider: gemini
   ```
3. Backend controller should receive:
   ```
   🔵 [Controller] Received content submission from user: <id> with AI provider: gemini
   ```

### Step 4: Check Backend Processing

1. Check if cache is hit:

   ```
   💾 [ModerationService] Using cached moderation result
   ```

   - **If cached**: This might be the problem! Cache key should include provider
   - **Solution**: Clear cache or ensure cache key includes provider (line 58 in moderation.service.ts)

2. Check agent creation:

   ```
   ⚡ [ModerationService] Creating NEW agent instance for provider: gemini
   ✅ [ModerationAgent] Constructor called with preferredProvider: gemini
   ```

3. Check Gemini initialization:

   ```
   ✅ [ModerationAgent] Gemini AI initialized
   ```

   - **If you see** `⚠️ Gemini API key not provided`: Check `.env` for `GEMINI_API_KEY`

4. Check actual analysis:
   ```
   🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI, attempting Gemini analysis...
   ✅ [ContentAnalyzer.analyze] Successfully used Gemini for analysis
   ```
   - **If you see fallback**: Check the error message for why Gemini failed

### Step 5: Verify Result

1. Final log should show:
   ```
   ✅ [ModerationService] Agent returned result with provider: gemini
   ```
2. This confirms Gemini was actually used

---

## Common Issues and Solutions

### Issue 1: Cache Hit with Wrong Provider

**Symptom**:

```
💾 [ModerationService] Using cached moderation result - Used provider: openai
```

When you requested Gemini.

**Root Cause**: The cache key includes the provider, but you might be testing the same content.

**Solution**:

- Test with different content
- Or clear the cache by restarting the backend
- The cache key is: `${content}:${provider}` (line 58)

### Issue 2: Gemini API Key Missing

**Symptom**:

```
⚠️ [ModerationAgent] Gemini API key not provided, using OpenAI only
```

**Solution**:

1. Check `backend/.env` for `GEMINI_API_KEY`
2. Restart backend server
3. Look for startup log: `✅ Gemini AI initialized`

### Issue 3: Gemini Request Fails

**Symptom**:

```
❌ [ContentAnalyzer.analyze] Gemini failed, falling back to OpenAI. Error: <error>
```

**Solution**:

- Check error message for specific issue (API key, quota, network, etc.)
- Verify Gemini API key is valid
- Check if content violates Gemini's safety filters

### Issue 4: Provider Not Sent from Frontend

**Symptom**:

```
🔵 [Controller] Received content submission from user: <id> with AI provider: default
```

**Solution**:

- Check if LLMProviderContext is properly wrapped around the app
- Verify `useLLMProvider()` hook is working
- Check browser localStorage for the provider value

---

## Testing Checklist

- [ ] Provider loads correctly on app start
- [ ] Can switch between OpenAI and Gemini
- [ ] Provider persists in localStorage
- [ ] Correct provider is sent in submission request
- [ ] Backend receives correct provider
- [ ] New agent is created for Gemini (when not using default OpenAI)
- [ ] Gemini API key is initialized
- [ ] ContentAnalyzer attempts to use Gemini
- [ ] Result shows correct provider was used
- [ ] Cache respects provider preference

---

## Log Interpretation Example

### Successful Gemini Flow:

```
📂 [LLMProvider] Loading provider from localStorage: gemini
✅ [LLMProvider] Provider set to: gemini
🚀 [Frontend] Submitting content with AI provider: gemini
🔵 [Controller] Received content submission from user: xyz with AI provider: gemini
🟢 [ContentService] Requested AI provider: gemini
🟣 [ModerationService] Moderating text content with provider: gemini
⚡ [ModerationService] Creating NEW agent instance for provider: gemini
🏗️ [ModerationAgent] Constructor called with preferredProvider: gemini
✅ [ModerationAgent] Gemini AI initialized
🔧 [ContentAnalyzer] Initialized with preferredProvider: gemini, Gemini available: true
🔍 [ContentAnalyzer.analyze] Starting analysis with preferredProvider: gemini
🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI, attempting Gemini analysis...
✅ [ContentAnalyzer.analyze] Successfully used Gemini for analysis
✅ [ModerationService] Agent returned result with provider: gemini
```

### Issue: Cache Hit with OpenAI:

```
📂 [LLMProvider] Loading provider from localStorage: gemini
✅ [LLMProvider] Provider set to: gemini
🚀 [Frontend] Submitting content with AI provider: gemini
🔵 [Controller] Received content submission from user: xyz with AI provider: gemini
🟢 [ContentService] Requested AI provider: gemini
🟣 [ModerationService] Moderating text content with provider: gemini
💾 [ModerationService] Using cached moderation result - Used provider: openai
```

**Problem**: Content was previously cached with OpenAI. Try different content!

---

## Environment Variables

Make sure these are set in `backend/.env`:

```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

---

## Quick Debug Command

To see all logs in real-time, run backend with:

```bash
cd backend
npm run start:dev
```

Then watch the logs as you:

1. Switch to Gemini in UI
2. Submit content
3. Follow the log flow above

---

## Contact

If the issue persists after following this guide:

1. Copy all relevant logs from the flow
2. Note where the flow deviates from expected
3. Check the specific service where the issue occurs
4. Review the code at that location
