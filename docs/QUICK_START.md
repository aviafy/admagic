# Quick Start Guide - AdMagic

## 🚀 Get Up and Running in 5 Minutes

This guide will get you from zero to running with real-time content moderation.

---

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works!)
- OpenAI API key

---

## Step 1: Clone & Install (1 minute)

```bash
# Navigate to project
cd /Users/mariammeskhia/Desktop/Alex\'s\ Projects/admagic

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Setup Supabase (2 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize

### 2.2 Run Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents from `backend/supabase-schema.sql`
3. Run the SQL

### 2.3 Enable Real-Time
1. Go to **Database** → **Replication**
2. Find `content_submissions` table
3. Toggle **Realtime** to ON
4. Save

---

## Step 3: Configure Environment (1 minute)

### Backend `.env`
```bash
cd backend
cp .env.example .env
nano .env  # or use your favorite editor
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

### Frontend `.env.local`
```bash
cd ../frontend
nano .env.local
```

Add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Where to find keys:**
- Supabase Dashboard → **Settings** → **API**
- `SUPABASE_URL`: Project URL
- `SUPABASE_KEY` (backend): `service_role` key (secret!)
- `SUPABASE_ANON_KEY` (frontend): `anon` `public` key

---

## Step 4: Start the Apps (1 minute)

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

You should see:
```
✅ [DatabaseService] Database service initialized
✅ [ModerationService] Moderation service initialized
✅ [Bootstrap] Application is running on: http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
✅ Ready on http://localhost:3000
```

---

## Step 5: Test It! (30 seconds)

1. **Open browser** → http://localhost:3000

2. **Sign up** with email/password

3. **Submit content:**
   - Type: "Hello world!"
   - Press Enter or click Submit

4. **Watch the magic!** ✨
   - Post appears instantly
   - Status: "pending" → changes automatically
   - No refresh needed!

5. **Check console** (F12):
   ```
   ✅ Real-time change received: INSERT
   ✅ Polling attempt 1/60, next check in 500ms
   ✅ Real-time change received: UPDATE
   ✅ Moderation complete: approved
   ```

---

## 🎉 Success!

You now have a fully working real-time content moderation system!

---

## Common Issues & Fixes

### Issue: Backend won't start

**Error:** `Port 3001 already in use`

**Fix:**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill it
kill $(lsof -ti:3001)

# Restart backend
npm run start:dev
```

---

### Issue: Frontend shows "Missing Supabase environment variables"

**Fix:**
```bash
# Check .env.local exists
ls -la frontend/.env.local

# If not, create it
cd frontend
nano .env.local
# Add the env vars from Step 3
```

---

### Issue: Status stays "pending" forever

**Checklist:**
1. ✅ Supabase Realtime enabled? (Dashboard → Database → Replication)
2. ✅ OpenAI API key set in backend `.env`?
3. ✅ Backend running without errors?
4. ✅ Console showing real-time events?

**Debug:**
```bash
# Check backend logs
cd backend
npm run start:dev
# Look for errors

# Check browser console (F12)
# Should see: "Real-time change received: UPDATE"
```

---

### Issue: WebSocket connection fails

**Symptoms:**
```
❌ Subscription status: TIMED_OUT
```

**Fix:**
1. Check ad-blocker (disable for localhost)
2. Check firewall settings
3. Verify Supabase project is not paused
4. Check Network tab → WS (WebSocket) connection

**Fallback:**
- Even if WebSocket fails, polling will work!
- You'll still get updates (just slightly slower)

---

## Next Steps

### Learn More
- 📖 [Backend Refactoring Guide](BACKEND_REFACTORING.md)
- 📖 [Real-Time Updates Guide](REALTIME_UPDATES_GUIDE.md)
- 📖 [Complete Summary](COMPLETE_REFACTORING_SUMMARY.md)

### Try These Features
- ✅ Submit text content
- ✅ Submit image URLs
- ✅ Paste images directly (Ctrl+V)
- ✅ Test with offensive content (gets flagged/rejected)
- ✅ Open multiple tabs (different users)
- ✅ Submit multiple posts

### Customize
- 📝 Modify moderation prompts in `backend/src/modules/moderation/agents/moderation.agent.ts`
- 🎨 Update UI styles in `frontend/src/`
- ⚙️ Adjust polling intervals in `frontend/src/config/constants.ts`

---

## Project Structure

```
admagic/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── common/   # Shared utilities
│   │   ├── config/   # Configuration
│   │   └── modules/  # Features
│   ├── .env          # Backend config
│   └── package.json
│
├── frontend/         # Next.js App
│   ├── src/
│   │   ├── app/      # Pages
│   │   ├── features/ # Components
│   │   └── config/   # Settings
│   ├── .env.local    # Frontend config
│   └── package.json
│
└── docs/            # Documentation
    ├── BACKEND_REFACTORING.md
    ├── REALTIME_UPDATES_GUIDE.md
    ├── COMPLETE_REFACTORING_SUMMARY.md
    └── QUICK_START.md  (this file)
```

---

## Available Scripts

### Backend
```bash
npm run start         # Start (normal)
npm run start:dev     # Start with watch mode 🔄
npm run start:debug   # Start with debugging
npm run build         # Build for production
npm run start:prod    # Run production build
```

### Frontend
```bash
npm run dev           # Development mode 🔄
npm run build         # Build for production
npm run start         # Run production build
npm run lint          # Run linter
```

---

## Environment Variables Reference

### Backend (.env)
```env
# Required
SUPABASE_URL=          # Your Supabase project URL
SUPABASE_KEY=          # Service role key (secret!)
OPENAI_API_KEY=        # OpenAI API key

# Optional
PORT=3001              # API port
NODE_ENV=development   # Environment
CORS_ORIGIN=*          # CORS origin
```

### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=        # Same as backend
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public anon key
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend URL
```

---

## Testing Checklist

After setup, verify these work:

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:3000
- [ ] Can create account
- [ ] Can sign in
- [ ] Can submit text content
- [ ] Post appears instantly (no refresh)
- [ ] Status updates automatically
- [ ] Console shows real-time events
- [ ] Can submit image URL
- [ ] Can paste image (Ctrl+V)
- [ ] Multiple submissions work
- [ ] Different users isolated (use incognito)

---

## Get Help

### Documentation
- [Complete Refactoring Summary](COMPLETE_REFACTORING_SUMMARY.md)
- [Backend Guide](BACKEND_REFACTORING.md)
- [Real-Time Guide](REALTIME_UPDATES_GUIDE.md)

### Debugging
1. Check terminal logs (both backend & frontend)
2. Check browser console (F12)
3. Check Network tab (F12 → Network)
4. Check Supabase logs (Dashboard → Logs)

### Common Commands
```bash
# Kill process on port
lsof -ti:3001 | xargs kill

# Restart backend
cd backend && npm run start:dev

# Restart frontend
cd frontend && npm run dev

# Check logs
# Just look at terminal output

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 You're All Set!

Your real-time content moderation system is ready to go!

**Key Features:**
- ⚡ Real-time status updates (<100ms)
- 🔄 Automatic polling fallback
- 🛡️ AI-powered moderation
- 📊 Social media feed UI
- 🖼️ Image & text support
- 🚀 Production-ready

**Happy Coding!** 🚀
