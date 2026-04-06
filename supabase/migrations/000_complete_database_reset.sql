-- EMS: Complete Database Reset and Recreation
-- WARNING: This will DROP ALL DATA and recreate the entire schema from scratch

-- 1. Drop all tables in reverse dependency order (to avoid FK constraints)
DROP TABLE IF EXISTS absence_justifications CASCADE;
DROP TABLE IF EXISTS course_participants CASCADE;
DROP TABLE IF EXISTS group_enrollments CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS school_levels CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Drop all custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS contract_type CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS course_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS justification_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payroll_status CASCADE;
DROP TYPE IF EXISTS relation_type CASCADE;
DROP TYPE IF EXISTS participant_type CASCADE;

-- ============================================================================
-- RECREATE SCHEMA FROM MIGRATIONS
-- ============================================================================

-- EMS: Education Management System - Initial Schema

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'guardian', 'independent', 'system');
CREATE TYPE contract_type AS ENUM ('permanent', 'contract', 'hourly');
CREATE TYPE session_type AS ENUM ('group', 'course');
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE enrollment_status AS ENUM ('active', 'suspended', 'cancelled');
CREATE TYPE course_status AS ENUM ('draft', 'open', 'ongoing', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent_excused', 'absent_unexcused', 'absent_pending');
CREATE TYPE justification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'other');
CREATE TYPE payroll_status AS ENUM ('draft', 'approved', 'paid');
CREATE TYPE relation_type AS ENUM ('father', 'mother', 'tutor', 'other');
CREATE TYPE participant_type AS ENUM ('student', 'independent');

-- 2. CORE TABLES
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Telegram User ID
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    role user_role NOT NULL DEFAULT 'guardian',
    is_active BOOLEAN DEFAULT true,
    full_name VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guardians (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    national_id VARCHAR(30) UNIQUE,
    address TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    notes TEXT
);

CREATE TABLE teachers (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100),
    base_rate_per_hour DECIMAL(10,2) NOT NULL,
    iban VARCHAR(34),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    contract_type contract_type NOT NULL DEFAULT 'hourly'
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id TEXT REFERENCES guardians(user_id),
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    student_code VARCHAR(20) UNIQUE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);

-- 3. INFRASTRUCTURE
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    floor VARCHAR(20),
    has_projector BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    notes TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE school_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID REFERENCES school_levels(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    default_price_per_hour DECIMAL(10,2) NOT NULL
);

-- 4. ACADEMIC
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id),
    teacher_id TEXT REFERENCES teachers(user_id),
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    max_students INTEGER DEFAULT 20,
    price_per_hour DECIMAL(10,2) NOT NULL,
    teacher_rate_per_hour DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT REFERENCES teachers(user_id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_hours DECIMAL(6,2) NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_mode VARCHAR(20) DEFAULT 'per_hour',
    fixed_total_price DECIMAL(10,2),
    teacher_rate_per_hour DECIMAL(10,2) NOT NULL,
    max_participants INTEGER,
    start_date DATE,
    end_date DATE,
    status course_status DEFAULT 'draft',
    justification_deadline_hours INTEGER DEFAULT 24,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESSIONS
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_type session_type NOT NULL,
    group_id UUID REFERENCES groups(id),
    course_id UUID REFERENCES courses(id),
    room_id UUID REFERENCES rooms(id),
    teacher_id TEXT REFERENCES teachers(user_id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    justification_deadline TIMESTAMPTZ NOT NULL,
    status session_status DEFAULT 'scheduled',
    topic TEXT,
    notes TEXT,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT session_type_check CHECK (
        (session_type='group' AND group_id IS NOT NULL AND course_id IS NULL) OR
        (session_type='course' AND course_id IS NOT NULL AND group_id IS NULL)
    )
);

-- 6. ATTENDANCE
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    participant_type participant_type NOT NULL,
    student_id UUID REFERENCES students(id),
    independent_user_id TEXT REFERENCES users(id),
    status attendance_status DEFAULT 'present',
    hours_billed DECIMAL(4,2) NOT NULL,
    amount_due DECIMAL(10,2) DEFAULT 0,
    is_billed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id),
    UNIQUE(session_id, independent_user_id)
);

-- 7. FINANCIALS (Simplified for now)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_type participant_type NOT NULL,
    guardian_id TEXT REFERENCES guardians(user_id),
    independent_user_id TEXT REFERENCES users(id),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status invoice_status DEFAULT 'draft',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SYSTEM
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add telegram_id column to users table for Telegram integration
ALTER TABLE users ADD COLUMN telegram_id BIGINT UNIQUE;

-- Add comment to the column
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID for authentication';

-- EMS: Add missing enrollment tables for courses and groups

-- 1. Course participants table (for independent users enrolling in courses)
CREATE TABLE course_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    progress DECIMAL(5,2) DEFAULT 0, -- 0-100 percentage
    status enrollment_status DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 2. Group enrollments table (for students in groups)
CREATE TABLE group_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status enrollment_status DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, group_id)
);

-- 3. Absence justifications table
CREATE TABLE absence_justifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL REFERENCES attendances(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status justification_status DEFAULT 'pending',
    submitted_by TEXT REFERENCES users(id),
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_course_participants_user_id ON course_participants(user_id);
CREATE INDEX idx_course_participants_course_id ON course_participants(course_id);
CREATE INDEX idx_group_enrollments_student_id ON group_enrollments(student_id);
CREATE INDEX idx_group_enrollments_group_id ON group_enrollments(group_id);
CREATE INDEX idx_absence_justifications_attendance_id ON absence_justifications(attendance_id);

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
        AND tablename IN ('users', 'guardians', 'teachers', 'students', 'rooms', 'school_levels', 'subjects', 'groups', 'courses', 'sessions', 'attendances', 'invoices', 'system_settings', 'course_participants', 'group_enrollments', 'absence_justifications')
    LOOP
        -- Enable RLS
        EXECUTE 'ALTER TABLE IF EXISTS ' || table_name || ' ENABLE ROW LEVEL SECURITY';

        -- Drop existing policies if any to avoid errors on rerun
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations" ON ' || table_name;

        -- Create a permissive policy
        EXECUTE 'CREATE POLICY "Allow all operations" ON ' || table_name || ' FOR ALL USING (true) WITH CHECK (true)';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE course_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_justifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_participants
CREATE POLICY "Users can view their own course enrollments" ON course_participants
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can enroll themselves in courses" ON course_participants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own enrollments" ON course_participants
    FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS Policies for group_enrollments (admins and teachers can manage)
CREATE POLICY "Guardians can view their children's group enrollments" ON group_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = group_enrollments.student_id
            AND s.guardian_id = auth.uid()::text
        )
    );

CREATE POLICY "Teachers can view enrollments in their groups" ON group_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_enrollments.group_id
            AND g.teacher_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can manage all group enrollments" ON group_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()::text
            AND u.role = 'admin'
        )
    );

-- RLS Policies for absence_justifications
CREATE POLICY "Users can view justifications for their attendance" ON absence_justifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM attendances a
            WHERE a.id = absence_justifications.attendance_id
            AND (
                a.student_id IN (
                    SELECT s.id FROM students s WHERE s.guardian_id = auth.uid()::text
                ) OR
                a.independent_user_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can create justifications for their attendance" ON absence_justifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM attendances a
            WHERE a.id = absence_justifications.attendance_id
            AND (
                a.student_id IN (
                    SELECT s.id FROM students s WHERE s.guardian_id = auth.uid()::text
                ) OR
                a.independent_user_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Teachers and admins can review justifications" ON absence_justifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()::text
            AND u.role IN ('admin', 'teacher')
        )
    );

-- Insert initial system settings
INSERT INTO system_settings (key, value, description) VALUES
('justification_deadline_hours', '24', 'Default hours before session to justify absence');</content>
<parameter name="filePath">/home/user/p-school/supabase/migrations/000_complete_database_reset.sql