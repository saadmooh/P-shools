-- EMS: Education Management System - Global RLS Policies
-- Enabling CRUD operations for all core tables.

-- List of tables to apply policies to
-- users, guardians, teachers, students, rooms, school_levels, subjects, groups, courses, sessions, attendances, invoices, system_settings

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'guardians', 'teachers', 'students', 'rooms', 'school_levels', 'subjects', 'groups', 'courses', 'sessions', 'attendances', 'invoices', 'system_settings')
    LOOP
        -- Enable RLS
        EXECUTE 'ALTER TABLE IF EXISTS ' || table_name || ' ENABLE ROW LEVEL SECURITY';

        -- Drop existing policies if any to avoid errors on rerun
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations" ON ' || table_name;

        -- Create a permissive policy
        EXECUTE 'CREATE POLICY "Allow all operations" ON ' || table_name || ' FOR ALL USING (true) WITH CHECK (true)';
    END LOOP;
END $$;
