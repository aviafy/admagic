# Quick Debug Reference - Gemini Flow

## 🚀 Quick Start

1. **Start Backend**: `cd backend && npm run start:dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser Console**: F12 → Console tab
4. **Watch Backend Terminal**: Keep visible

---

## 🔍 What to Look For

### ✅ Successful Gemini Flow

**Frontend Console:**

```
📂 [LLMProvider] Loading provider from localStorage: gemini
🚀 [Frontend] Submitting content with AI provider: gemini
```

**Backend Terminal:**

```
🔵 [Controller] ... with AI provider: gemini
⚡ [ModerationService] Creating NEW agent instance for provider: gemini
✅ [ModerationAgent] Gemini AI initialized
🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI
✅ [ContentAnalyzer.analyze] Successfully used Gemini
✅ [ModerationService] Agent returned result with provider: gemini
```

---

### ❌ Common Problems

#### Problem 1: Cache Hit

```
💾 [ModerationService] Using cached moderation result - Used provider: openai
```

**Solution**: Try different content

#### Problem 2: No Gemini API Key

```
⚠️ [ModerationAgent] Gemini API key not provided
```

**Solution**: Check `backend/.env` for `GEMINI_API_KEY`

#### Problem 3: Gemini Request Failed

```
❌ [ContentAnalyzer.analyze] Gemini failed, falling back to OpenAI
```

**Solution**: Read the error message, check API key/quota

#### Problem 4: Provider Not Sent

```
🔵 [Controller] ... with AI provider: default
```

**Solution**: Check frontend localStorage for provider

---

## 🎯 Key Checkpoints

| #   | Checkpoint         | What to See                                                               |
| --- | ------------------ | ------------------------------------------------------------------------- |
| 1   | Provider loads     | `✅ [LLMProvider] Provider set to: gemini`                                |
| 2   | User switches      | `🔄 [LLMProvider] Switching provider ... to gemini`                       |
| 3   | Content submits    | `🚀 [Frontend] Submitting content with AI provider: gemini`               |
| 4   | Backend receives   | `🔵 [Controller] ... with AI provider: gemini`                            |
| 5   | New agent created  | `⚡ [ModerationService] Creating NEW agent instance for provider: gemini` |
| 6   | Gemini initialized | `✅ [ModerationAgent] Gemini AI initialized`                              |
| 7   | Gemini attempted   | `🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI`               |
| 8   | Gemini succeeds    | `✅ [ContentAnalyzer.analyze] Successfully used Gemini`                   |
| 9   | Result confirmed   | `✅ [ModerationService] Agent returned result with provider: gemini`      |

---

## 🔧 Quick Fixes

### Check Provider in localStorage

```javascript
// In browser console:
localStorage.getItem("admagic-ai-provider");
// Should return: "gemini"
```

### Force Set Provider

```javascript
// In browser console:
localStorage.setItem("admagic-ai-provider", "gemini");
// Then refresh page
```

### Check Backend Environment

```bash
# In terminal:
cd backend
grep GEMINI_API_KEY .env
```

### Clear Cache

```bash
# Restart backend to clear in-memory cache
cd backend
npm run start:dev
```

---

## 📊 Log Emoji Legend

| Emoji | Meaning                    |
| ----- | -------------------------- |
| 📂    | Loading from storage       |
| 🔄    | State change               |
| ✅    | Success                    |
| ⚠️    | Warning                    |
| ❌    | Error/Failure              |
| 🚀    | Starting action            |
| 🔵    | Controller layer           |
| 🟢    | Service layer              |
| 🟣    | Moderation layer           |
| 🏗️    | Constructor/Initialization |
| 🔧    | Configuration              |
| 🤖    | AI operation               |
| 💾    | Cache operation            |
| 👁️    | Vision analysis            |
| 📊    | Data analysis              |
| 📤    | Sending data               |
| 📥    | Receiving data             |
| 🖱️    | User interaction           |

---

## 📝 Test Script

1. Open app in browser
2. Open Console (F12)
3. Click **Gemini** button
   - ✅ See: `🔄 [LLMProvider] Switching provider`
4. Type test text: "Hello world"
5. Click **Submit**
   - ✅ See: `🚀 [Frontend] Submitting content with AI provider: gemini`
6. Switch to Backend Terminal
   - ✅ See: `🔵 [Controller] ... with AI provider: gemini`
   - ✅ See: `⚡ [ModerationService] Creating NEW agent`
   - ✅ See: `🟢 [ContentAnalyzer.analyze] Preferred provider is GEMINI`
   - ✅ See: `✅ Successfully used Gemini`
7. Check post card
   - ✅ Should show AI provider used (if displayed in UI)

---

## 🆘 Still Not Working?

See detailed guides:

- **GEMINI_FLOW_DEBUGGING.md** - Complete log reference
- **DEBUGGING_LOGS_SUMMARY.md** - Implementation details

Or check:

1. Gemini API key is valid
2. Gemini API has available quota
3. No firewall blocking Gemini API
4. Network connection is stable

---

## 📞 Report Issue

If problem persists, collect:

1. Full frontend console logs
2. Full backend terminal logs
3. Screenshot of localStorage (`admagic-ai-provider`)
4. Content that was submitted
5. Which checkpoint failed (from table above)
