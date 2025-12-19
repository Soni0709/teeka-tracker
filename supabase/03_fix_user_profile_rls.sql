-- =============================================
-- FIX: Allow users to create their own profile
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing insert policy if exists
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Also ensure the select policy exists
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Allow admins to read all profiles (optional)
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

 

