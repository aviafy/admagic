# Supabase Setup Guide

## Step 1: Run the SQL Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/ijdjikccqxmzjrdeyfww
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content from `backend/supabase-schema.sql`
5. Click **Run** to execute the SQL

## Step 2: Disable Email Confirmation (For Development)

To make testing easier and avoid rate limit errors:

1. Go to **Authentication** → **Providers** in the left sidebar
2. Find the **Email** provider
3. Scroll down to **Confirm email** section
4. **Toggle OFF** the "Confirm email" option
5. Click **Save**

This allows users to sign up instantly without email verification during development.

## Step 3: Configure Email Settings (Optional - For Production)

If you want to enable email confirmation later:

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Go to **Authentication** → **Providers** → **Email**
4. Enable "Confirm email"
5. Set up a custom SMTP provider (recommended for production)

## Step 4: Test Authentication

### Create a Test User (Option 1 - Via Dashboard)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: test@example.com
   - Password: test123456
4. Click **Create user**
5. Use these credentials to login in your app

### Create a Test User (Option 2 - Via App)

1. Start your frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Click "Create an account"
4. Enter any email and password (min 6 characters)
5. Click "Create Account"

## Step 5: Verify Database Tables

1. Go to **Table Editor** in the left sidebar
2. You should see two tables:
   - `content_submissions` - Stores content and AI decisions
   - `audit_logs` - Stores audit trail of actions

## Step 6: Check Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Verify these policies exist:
   - **content_submissions**:
     - Users can view their own submissions
     - Users can insert their own submissions
   - **audit_logs**:
     - Users can view audit logs for their submissions

## Step 7: Enable Realtime (Optional - For Real-time Updates)

While the app includes polling for automatic updates, you can also enable Supabase realtime for instant updates:

1. Go to **Database** → **Replication** in the left sidebar
2. Find the `content_submissions` table in the list
3. Toggle the switch to **enable replication** for this table
4. Verify that **Realtime** is enabled in **Settings** → **API** → **Realtime API**

**Note**: The app will work fine without this (it uses active polling), but enabling realtime provides an additional layer of instant updates.

## Troubleshooting

### Rate Limit Error (429)

- **Problem**: "Too many signup attempts"
- **Solution**:
  1. Disable email confirmation (Step 2 above)
  2. Wait 1 hour for rate limit to reset
  3. Or create user manually via dashboard

### Email Not Confirmed Error

- **Problem**: "Email not confirmed" when signing in
- **Solution**:
  1. Disable email confirmation (Step 2 above)
  2. Or verify email from inbox
  3. Or delete user and recreate with confirmation disabled

### Cannot Sign In

- **Problem**: "Invalid login credentials"
- **Solution**:
  1. Make sure you're using the exact email and password
  2. Check if user exists in Authentication → Users
  3. Try creating a new user

### Tables Not Found

- **Problem**: Backend errors about missing tables
- **Solution**: Run the SQL schema from Step 1

## Current Configuration

Your Supabase project is already configured in the environment files:

- **URL**: https://ijdjikccqxmzjrdeyfww.supabase.co
- **Anon Key**: (already set in .env files)

## Next Steps

After completing this setup:

1. Run the backend: `cd backend && npm run start`
2. Run the frontend: `cd frontend && npm run dev`
3. Test authentication at http://localhost:3000
4. Submit content for moderation (requires OpenAI API key)
