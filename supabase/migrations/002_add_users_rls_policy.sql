-- EMS: Education Management System - RLS Policies

-- 1. Enable RLS on the users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Allow public/authenticated inserts for initial user registration
-- We use a permissive policy here because users are identified by their Telegram ID 
-- and not necessarily by a Supabase Auth session during the initial registration.
CREATE POLICY "Allow insert for new users" ON users
  FOR INSERT
  WITH CHECK (true);

-- 3. Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true); -- Simplified for now, can be restricted to auth.uid() later
