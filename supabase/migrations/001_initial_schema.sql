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

INSERT INTO system_settings (key, value, description) VALUES 
('justification_deadline_hours', '24', 'Default hours before session to justify absence');
