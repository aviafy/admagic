# Troubleshooting Guide

Common issues and their solutions for AdMagic.

---

## 🔴 "Failed to fetch" Error in Frontend

### Symptoms
```
Console Error: TypeError: Failed to fetch
at ContentService.submitContent
```

### Root Cause
The backend API is not running or not accessible.

### Solution

#### 1. Check if Backend is Running
```bash
# Check if port 3001 is in use
lsof -ti:3001

# If nothing is returned, backend is NOT running
```

#### 2. Start the Backend
```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
✅ [DatabaseService] Database service initialized
✅ [ModerationService] Moderation service initialized
✅ [ContentService] Content service initialized
✅ [Bootstrap] Application is running on: http://[::1]:3001
✅ [Bootstrap] CORS enabled for: *
```

#### 3. Verify Backend is Responding
```bash
curl http://localhost:3001/content/submit -X OPTIONS -I
```

**Expected Response:**
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
```

#### 4. Reload Frontend
After backend starts, reload the browser page (F5) and try submitting again.

---

## 🔴 Backend Won't Start - Port Already in Use

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3001
```

### Solution

#### Kill the Process on Port 3001
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill

# Or manually:
lsof -ti:3001  # Get PID
kill <PID>     # Replace <PID> with the number
```

#### Restart Backend
```bash
cd backend
npm run start:dev
```

---

## 🔴 Environment Variables Missing

### Symptoms
```
Error: Missing Supabase environment variables
```

### Solution

#### Backend (.env)
```bash
cd backend
nano .env  # or use your editor
```

Add:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

#### Frontend (.env.local)
```bash
cd frontend
nano .env.local
```

Add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Restart Both Services
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔴 Status Stays "Pending" Forever

### Symptoms
- Post submits successfully
- Status shows "pending"
- Never updates to approved/flagged/rejected
- Page refresh doesn't help

### Causes & Solutions

#### 1. Supabase Real-Time Not Enabled

**Check:**
1. Go to Supabase Dashboard
2. Database → Replication
3. Look for `content_submissions` table

**Fix:**
- Toggle Real-time to **ON**
- Save changes
- Refresh frontend

#### 2. OpenAI API Key Missing/Invalid

**Check Backend Logs:**
```bash
# Look for errors in the backend terminal
# Should see moderation completing
```

**Fix:**
```bash
cd backend
nano .env
# Verify OPENAI_API_KEY is set correctly
# Restart backend
npm run start:dev
```

#### 3. Backend Moderation Error

**Check Backend Logs for:**
```
❌ Error: OpenAI API error
❌ Moderation error: ...
```

**Fix:**
- Check OpenAI API key is valid
- Check you have API credits
- Check internet connection

#### 4. WebSocket Connection Failed

**Check Browser Console:**
```
❌ Subscription status: TIMED_OUT
```

**Fix:**
- Disable ad-blocker for localhost
- Check browser Network tab → WS (WebSocket)
- Verify Supabase project is active (not paused)

**Note:** Even if WebSocket fails, polling should still work as fallback!

---

## 🔴 CORS Error

### Symptoms
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

### Solution

#### Check Backend CORS Configuration

**File:** `backend/src/main.ts`

Should have:
```typescript
app.enableCors({
  origin: corsOrigin,  // Should be '*' for development
  credentials: true,
});
```

**Check .env:**
```env
CORS_ORIGIN=*
```

#### Restart Backend
```bash
cd backend
npm run start:dev
```

---

## 🔴 Database Connection Error

### Symptoms
```
Error: Failed to connect to Supabase
Error: Invalid API key
```

### Solution

#### Verify Supabase Credentials

1. Go to Supabase Dashboard
2. Settings → API
3. Copy credentials

**Backend (.env):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=<service_role key>  # NOT the anon key!
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>  # NOT the service_role key!
```

**Important:**
- Backend uses `service_role` key (secret)
- Frontend uses `anon` key (public)

#### Restart Services
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

---

## 🔴 Build Errors

### Symptoms
```
npm run build
Error: ...
```

### Solution

#### Clean and Reinstall
```bash
# Remove dependencies
rm -rf node_modules package-lock.json

# Clear build cache
rm -rf dist
rm -rf .next

# Reinstall
npm install

# Rebuild
npm run build
```

---

## 🔴 Real-Time Updates Not Working

### Symptoms
- Posts appear after refresh only
- Status updates after refresh only
- Console shows no real-time events

### Diagnostic Steps

#### 1. Check Browser Console
```bash
# Open DevTools (F12) → Console
# Look for:
✅ Real-time change received: INSERT
✅ Real-time change received: UPDATE
✅ Subscription status: SUBSCRIBED
```

#### 2. Check Supabase Real-Time

**Verify in Dashboard:**
1. Database → Replication
2. `content_submissions` should be enabled
3. Toggle OFF then ON to refresh

#### 3. Check Network Tab

**Look for WebSocket:**
1. F12 → Network → WS
2. Should see WebSocket connection
3. Status should be "101 Switching Protocols"

#### 4. Test Polling Fallback

**In Browser Console:**
```javascript
// Should see polling logs
// Polling attempt 1/60, next check in 500ms
```

If polling works but real-time doesn't:
- WebSocket is blocked (ad-blocker, firewall)
- Supabase real-time not enabled
- Application will still work via polling!

---

## 🔴 Moderation Taking Too Long

### Symptoms
- Status stays pending for >30 seconds
- Console shows many polling attempts
- Eventually shows timeout message

### Causes

#### 1. OpenAI API Slow/Down

**Check:**
- Visit https://status.openai.com
- Check if API is experiencing issues

**Fix:**
- Wait and retry
- OpenAI usually resolves quickly

#### 2. OpenAI Rate Limit

**Symptoms:**
```
Error: Rate limit exceeded
```

**Fix:**
- Wait a few minutes
- Check OpenAI dashboard for limits
- Upgrade plan if needed

#### 3. Complex Content

**Note:**
- Very long text takes longer to analyze
- Multiple images take longer
- This is normal, polling will continue

---

## 🔴 Authentication Issues

### Symptoms
- Can't sign up
- Can't sign in
- "Invalid credentials" error

### Solution

#### Check Supabase Auth Settings

1. Supabase Dashboard → Authentication → Providers
2. Email provider should be enabled
3. Check email confirmations (if enabled)

#### Check RLS Policies

```sql
-- In Supabase SQL Editor
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'content_submissions';
```

If no policies exist, run the schema from `backend/supabase-schema.sql`

---

## 📋 Quick Diagnosis Checklist

Run through this checklist when experiencing issues:

- [ ] Backend is running (`lsof -ti:3001` returns a PID)
- [ ] Frontend is running (http://localhost:3000 loads)
- [ ] .env files exist in both backend and frontend
- [ ] All required env vars are set
- [ ] Supabase project is active (not paused)
- [ ] OpenAI API key is valid
- [ ] Real-time enabled in Supabase Dashboard
- [ ] No CORS errors in console
- [ ] Browser DevTools shows no errors
- [ ] Internet connection is working

---

## 🆘 Common Commands

### Restart Everything
```bash
# Kill backend
lsof -ti:3001 | xargs kill

# Start backend
cd backend && npm run start:dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

### Check Logs
```bash
# Backend logs - check the terminal running start:dev
# Frontend logs - check browser console (F12)
```

### Test Backend API
```bash
# Test if backend is responding
curl http://localhost:3001/content/submit -X OPTIONS -I

# Should return:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: *
```

### Check Process
```bash
# Check what's running on port 3001
lsof -ti:3001

# Check what's running on port 3000
lsof -ti:3000
```

---

## 🔍 Debug Mode

### Enable Detailed Logging

#### Backend
Already has detailed logging via interceptors and services.

Check terminal for:
```
✅ [ContentService] Submitting content for user: ...
✅ [ModerationService] Moderating text content
✅ [DatabaseService] Submission created: ...
```

#### Frontend
Browser console already shows:
```
✅ Real-time change received: ...
✅ Polling attempt 1/60, next check in 500ms
✅ Moderation complete: approved
```

### Enable Supabase Debug Logs

**In Browser Console:**
```javascript
localStorage.setItem('debug', 'realtime:*');
// Reload page
```

This shows detailed WebSocket communication.

---

## 📞 Still Having Issues?

### Check Documentation
1. [QUICK_START.md](QUICK_START.md) - Setup guide
2. [BACKEND_REFACTORING.md](BACKEND_REFACTORING.md) - Backend details
3. [REALTIME_UPDATES_GUIDE.md](REALTIME_UPDATES_GUIDE.md) - Real-time debugging
4. [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current state

### Verify Setup
- Node.js version 18+
- npm version 9+
- Supabase account active
- OpenAI API key valid

### Common Mistakes
- ❌ Using wrong Supabase key (service_role vs anon)
- ❌ Forgetting to enable Supabase Real-time
- ❌ Backend not running when testing frontend
- ❌ Wrong API URL in frontend .env.local
- ❌ Missing environment variables

---

## ✅ Verification Steps

After fixing issues:

1. **Backend Test:**
   ```bash
   curl http://localhost:3001/content/submit -X OPTIONS -I
   # Should return 204 with CORS headers
   ```

2. **Frontend Test:**
   - Open http://localhost:3000
   - Sign in
   - Submit content
   - Watch console for real-time events
   - Status should update automatically

3. **End-to-End Test:**
   - Submit text: "Test content"
   - Should see "pending" → "approved" (typically 3-8 seconds)
   - No page refresh needed

---

**Last Updated:** October 20, 2025
**Version:** 1.0.0
