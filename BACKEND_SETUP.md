# TeekaSetu - Backend Setup Guide

A guide to set up the Supabase backend for TeekaSetu vaccination tracking system.

---

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Name:** `teekatracker`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
5. Click **"Create new project"**
6. Wait 1-2 minutes for setup

---

## 2. Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbG...` (long string)

3. Create `.env` file in your project root[we have already created]

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 3. Database Schema

### Run this SQL in Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'health_worker')),
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 4. Authentication Settings (Development)

To disable email confirmation during development:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle OFF "Confirm email"
3. Click **Save**

> ⚠️ Enable email confirmation for production!

---

## 5. User Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all data |
| `health_worker` | Access only to assigned district |
