# 🚀 Quick Setup for Interviewers

This guide will get you running in **5 minutes**.

---

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repo-url>
cd admagic

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Setup Environment Variables (2 minutes)

### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` and add your credentials:

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-your-openai-key

# Optional
GEMINI_API_KEY=your-gemini-key  # For Gemini fallback

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

**Where to get these:**
- **Supabase credentials**: [Supabase Dashboard](https://supabase.com) → Settings → API
  - `SUPABASE_URL`: Project URL
  - `SUPABASE_KEY`: Service role key (secret)
  - `SUPABASE_JWT_SECRET`: JWT Secret from API settings
- **OpenAI API key**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Gemini API key** (optional): [Google AI Studio](https://makersuite.google.com/app/apikey)

### Frontend Configuration

```bash
cd frontend
cp .env.example .env.local
```

Then edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Where to get these:**
- Same Supabase Dashboard → Settings → API
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key

---

## Step 3: Setup Database (1 minute)

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Open **SQL Editor**
3. Copy the contents of `backend/supabase-schema.sql`
4. Paste and run it
5. Go to **Database** → **Replication**
6. Find `content_submissions` table
7. Enable **Realtime** (toggle to ON)

---

## Step 4: Run the Application (30 seconds)

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

Wait for: `✅ Application is running on: http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Wait for: `✅ Ready on http://localhost:3000`

---

## Step 5: Test the App

1. Open http://localhost:3000
2. Create an account (any email/password)
3. Submit test content: "Hello world!"
4. Watch it get moderated in real-time ✨

---

## 🎯 What to Test

✅ **Text Moderation**: Submit various text content (safe, questionable, harmful)
✅ **Image Analysis**: Submit image URLs
✅ **Image Paste**: Paste images directly (Ctrl+V / Cmd+V)
✅ **Real-time Updates**: Status changes without refresh
✅ **Rate Limiting**: Try submitting >5 posts rapidly
✅ **Multi-user**: Open incognito window, create another user
✅ **Performance**: Submit duplicate content (should be cached)

---

## 🐛 Common Issues

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill

# Or use a different port
PORT=3002 npm run start:dev
```

### "Missing Supabase environment variables"

- Make sure `.env` and `.env.local` files exist
- Check that all required variables are filled in
- Restart the servers after adding env vars

### Status Stays "Pending"

- Check backend logs for errors
- Verify OpenAI API key is valid
- Ensure Supabase Realtime is enabled
- Check browser console (F12) for errors

---

## 📊 Key Features to Review

1. **AI-Powered Moderation**: LangGraph workflow with multi-step analysis
2. **JWT Authentication**: Secure token-based auth
3. **Performance Optimization**: Content caching (40% cost reduction)
4. **Rate Limiting**: Prevents abuse (5 submissions/min)
5. **Real-time Updates**: WebSocket + polling fallback
6. **TypeScript Strict Mode**: Full type safety
7. **Dual AI Support**: OpenAI + Gemini with fallback
8. **Image Generation**: DALL-E 3 visualizations for flagged content

---

## 📖 Additional Documentation

- **[Complete Quick Start](docs/QUICK_START.md)** - Detailed setup guide
- **[API Documentation](docs/README.md)** - Complete API reference
- **[System Architecture](docs/SYSTEM_ARCHITECTURE_DIAGRAM.md)** - Architecture overview
- **[Real-Time Guide](docs/REALTIME_UPDATES_GUIDE.md)** - How real-time works
- **[Performance](docs/performance-optimization.md)** - Optimization details

---

## 💡 Tips for Review

- Check `backend/src/modules/moderation/agents/moderation.agent.ts` for LangGraph implementation
- Review `frontend/src/features/content/` for real-time update logic
- Look at `backend/src/modules/content/content.service.ts` for caching strategy
- See `backend/src/modules/auth/` for JWT implementation

---

## 🚨 Security Note

**Never commit real `.env` files!** The provided `.env.example` files contain placeholders only. Add your actual credentials to `.env` and `.env.local` files, which are protected by `.gitignore`.

---

## Questions?

Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md) or the detailed [Quick Start Guide](docs/QUICK_START.md).

Happy testing! 🎉

