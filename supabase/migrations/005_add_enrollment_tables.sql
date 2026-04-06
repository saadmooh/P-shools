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