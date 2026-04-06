-- EMS: Sample Data Seeding Script
-- This script inserts realistic sample data for testing the Education Management System

-- 1. Insert sample users (mix of admin, teachers, guardians, independents)
INSERT INTO users (id, phone, email, role, is_active, full_name, telegram_id) VALUES
('admin_001', '+966501234567', 'admin@school.com', 'admin', true, 'Ahmed Al-Admin', 123456789),
('teacher_001', '+966507654321', 'teacher1@school.com', 'teacher', true, 'Sarah Johnson', 987654321),
('teacher_002', '+966509876543', 'teacher2@school.com', 'teacher', true, 'Mohammed Al-Rashid', 456789123),
('guardian_001', '+966501111111', 'parent1@email.com', 'guardian', true, 'Fatima Al-Zahra', 111111111),
('guardian_002', '+966502222222', 'parent2@email.com', 'guardian', true, 'Omar Al-Saud', 222222222),
('independent_001', '+966503333333', 'student@email.com', 'independent', true, 'Layla Al-Mansoori', 333333333),
('independent_002', '+966504444444', 'learner@email.com', 'independent', true, 'Khalid Al-Farsi', 444444444);

-- 2. Insert guardian details
INSERT INTO guardians (user_id, full_name, national_id, address, balance, notes) VALUES
('guardian_001', 'Fatima Al-Zahra', '1234567890', 'Riyadh, Saudi Arabia', 1500.00, 'Active parent with 2 children'),
('guardian_002', 'Omar Al-Saud', '0987654321', 'Jeddah, Saudi Arabia', 2500.00, 'Business owner, interested in STEM education');

-- 3. Insert teacher details
INSERT INTO teachers (user_id, full_name, specialty, base_rate_per_hour, iban, hire_date, contract_type) VALUES
('teacher_001', 'Sarah Johnson', 'Mathematics', 75.00, 'SA1234567890123456789012', '2023-09-01', 'permanent'),
('teacher_002', 'Mohammed Al-Rashid', 'English Literature', 70.00, 'SA9876543210987654321098', '2023-09-01', 'contract');

-- 4. Insert students (linked to guardians)
INSERT INTO students (guardian_id, full_name, date_of_birth, student_code, enrollment_date, is_active) VALUES
('guardian_001', 'Aisha Al-Zahra', '2015-05-15', 'STU001', '2023-09-01', true),
('guardian_001', 'Omar Al-Zahra', '2013-03-20', 'STU002', '2023-09-01', true),
('guardian_002', 'Sara Al-Saud', '2014-08-10', 'STU003', '2023-09-01', true);

-- 5. Insert rooms
INSERT INTO rooms (name, code, capacity, floor, has_projector, has_ac, notes, is_active) VALUES
('Mathematics Room A', 'MATH-A', 25, '1st Floor', true, true, 'Equipped with smart board', true),
('English Room B', 'ENG-B', 20, '2nd Floor', true, true, 'Language lab setup', true),
('Science Lab', 'SCI-LAB', 15, 'Ground Floor', true, true, 'Chemistry experiments room', true),
('Computer Lab', 'COMP-LAB', 30, '3rd Floor', true, true, '24 workstations available', true);

-- 6. Insert school levels
INSERT INTO school_levels (name, sort_order) VALUES
('Elementary', 1),
('Middle School', 2),
('High School', 3);

-- 7. Insert subjects
INSERT INTO subjects (level_id, name, code, default_price_per_hour) VALUES
((SELECT id FROM school_levels WHERE name = 'Elementary'), 'Mathematics', 'MATH-ELEM', 50.00),
((SELECT id FROM school_levels WHERE name = 'Elementary'), 'English', 'ENG-ELEM', 45.00),
((SELECT id FROM school_levels WHERE name = 'Middle School'), 'Advanced Mathematics', 'MATH-MS', 60.00),
((SELECT id FROM school_levels WHERE name = 'Middle School'), 'Literature', 'LIT-MS', 55.00),
((SELECT id FROM school_levels WHERE name = 'High School'), 'Calculus', 'CALC-HS', 75.00),
((SELECT id FROM school_levels WHERE name = 'High School'), 'Physics', 'PHYS-HS', 80.00);

-- 8. Insert groups
INSERT INTO groups (subject_id, teacher_id, name, academic_year, max_students, price_per_hour, teacher_rate_per_hour, is_active) VALUES
((SELECT id FROM subjects WHERE code = 'MATH-ELEM'), 'teacher_001', 'Math Elementary A', '2024-2025', 20, 50.00, 35.00, true),
((SELECT id FROM subjects WHERE code = 'ENG-ELEM'), 'teacher_002', 'English Elementary B', '2024-2025', 18, 45.00, 30.00, true),
((SELECT id FROM subjects WHERE code = 'MATH-MS'), 'teacher_001', 'Advanced Math Middle', '2024-2025', 15, 60.00, 42.00, true);

-- 9. Insert courses
INSERT INTO courses (teacher_id, name, description, total_hours, price_per_hour, price_mode, teacher_rate_per_hour, max_participants, start_date, end_date, status, justification_deadline_hours, created_by) VALUES
('teacher_001', 'Complete Mathematics Mastery', 'Comprehensive mathematics course covering algebra, geometry, and statistics', 40.0, 80.00, 'per_hour', 55.00, 10, '2024-10-01', '2024-12-15', 'open', 24, 'admin_001'),
('teacher_002', 'English Literature Appreciation', 'Explore classic and modern literature with critical analysis', 30.0, 70.00, 'per_hour', 45.00, 12, '2024-11-01', '2024-12-30', 'open', 24, 'admin_001'),
('teacher_001', 'Physics Fundamentals', 'Introduction to physics concepts with practical experiments', 35.0, 85.00, 'per_hour', 60.00, 8, '2024-09-15', '2024-11-30', 'ongoing', 24, 'admin_001');

-- 10. Insert sessions (some past, some future)
INSERT INTO sessions (session_type, group_id, course_id, room_id, teacher_id, scheduled_at, duration_hours, justification_deadline, status, topic, notes, created_by) VALUES
-- Group sessions
('group', (SELECT id FROM groups WHERE name = 'Math Elementary A'), NULL, (SELECT id FROM rooms WHERE code = 'MATH-A'), 'teacher_001', '2024-12-01 09:00:00+03', 2.0, '2024-11-30 09:00:00+03', 'scheduled', 'Introduction to Addition', 'Bring calculators', 'admin_001'),
('group', (SELECT id FROM groups WHERE name = 'Math Elementary A'), NULL, (SELECT id FROM rooms WHERE code = 'MATH-A'), 'teacher_001', '2024-12-08 09:00:00+03', 2.0, '2024-12-07 09:00:00+03', 'scheduled', 'Subtraction Basics', NULL, 'admin_001'),
('group', (SELECT id FROM groups WHERE name = 'English Elementary B'), NULL, (SELECT id FROM rooms WHERE code = 'ENG-B'), 'teacher_002', '2024-12-02 14:00:00+03', 1.5, '2024-12-01 14:00:00+03', 'scheduled', 'Reading Comprehension', 'Bring reading books', 'admin_001'),
-- Course sessions (some completed, some upcoming)
('course', NULL, (SELECT id FROM courses WHERE name = 'Complete Mathematics Mastery'), (SELECT id FROM rooms WHERE code = 'MATH-A'), 'teacher_001', '2024-10-15 10:00:00+03', 2.0, '2024-10-14 10:00:00+03', 'completed', 'Algebra Basics', 'Session completed successfully', 'admin_001'),
('course', NULL, (SELECT id FROM courses WHERE name = 'Complete Mathematics Mastery'), (SELECT id FROM rooms WHERE code = 'MATH-A'), 'teacher_001', '2024-12-10 10:00:00+03', 2.0, '2024-12-09 10:00:00+03', 'scheduled', 'Geometry Fundamentals', NULL, 'admin_001'),
('course', NULL, (SELECT id FROM courses WHERE name = 'English Literature Appreciation'), (SELECT id FROM rooms WHERE code = 'ENG-B'), 'teacher_002', '2024-11-15 16:00:00+03', 2.5, '2024-11-14 16:00:00+03', 'completed', 'Shakespeare Overview', 'Great discussion session', 'admin_001');

-- 11. Insert attendances for some sessions
INSERT INTO attendances (session_id, participant_type, student_id, independent_user_id, status, hours_billed, amount_due, is_billed) VALUES
-- Completed session attendances
((SELECT id FROM sessions WHERE topic = 'Algebra Basics'), 'independent', NULL, 'independent_001', 'present', 2.0, 160.00, true),
((SELECT id FROM sessions WHERE topic = 'Shakespeare Overview'), 'independent', NULL, 'independent_002', 'present', 2.5, 175.00, true),
-- Group session attendances (students)
((SELECT id FROM sessions WHERE topic = 'Introduction to Addition'), 'student', (SELECT id FROM students WHERE student_code = 'STU001'), NULL, 'present', 2.0, 100.00, false),
((SELECT id FROM sessions WHERE topic = 'Introduction to Addition'), 'student', (SELECT id FROM students WHERE student_code = 'STU002'), NULL, 'absent_excused', 2.0, 100.00, false),
((SELECT id FROM sessions WHERE topic = 'Reading Comprehension'), 'student', (SELECT id FROM students WHERE student_code = 'STU003'), NULL, 'present', 1.5, 67.50, false);

-- 12. Insert course participants
INSERT INTO course_participants (user_id, course_id, enrollment_date, progress, status, notes) VALUES
('independent_001', (SELECT id FROM courses WHERE name = 'Complete Mathematics Mastery'), '2024-09-15', 75.0, 'active', 'Excellent progress, ahead of schedule'),
('independent_002', (SELECT id FROM courses WHERE name = 'English Literature Appreciation'), '2024-10-01', 45.0, 'active', 'Needs more reading practice'),
('independent_001', (SELECT id FROM courses WHERE name = 'Physics Fundamentals'), '2024-09-01', 30.0, 'active', 'Enthusiastic about experiments');

-- 13. Insert group enrollments
INSERT INTO group_enrollments (student_id, group_id, enrollment_date, status, notes) VALUES
((SELECT id FROM students WHERE student_code = 'STU001'), (SELECT id FROM groups WHERE name = 'Math Elementary A'), '2023-09-01', 'active', 'Top performer in class'),
((SELECT id FROM students WHERE student_code = 'STU002'), (SELECT id FROM groups WHERE name = 'Math Elementary A'), '2023-09-01', 'active', 'Needs extra help with multiplication'),
((SELECT id FROM students WHERE student_code = 'STU003'), (SELECT id FROM groups WHERE name = 'English Elementary B'), '2023-09-01', 'active', 'Excellent reading skills');

-- 14. Insert absence justifications
INSERT INTO absence_justifications (attendance_id, reason, attachment_url, status, submitted_by, reviewed_by, reviewed_at, review_notes) VALUES
((SELECT id FROM attendances WHERE status = 'absent_excused'), 'Medical appointment for routine checkup', NULL, 'approved', 'guardian_001', 'teacher_001', '2024-11-15 08:00:00+03', 'Medical certificate provided, absence approved');

-- 15. Insert sample invoices
INSERT INTO invoices (payer_type, guardian_id, independent_user_id, invoice_number, total_amount, status, due_date) VALUES
('student', 'guardian_001', NULL, 'INV-2024-001', 500.00, 'paid', '2024-10-15'),
('student', 'guardian_002', NULL, 'INV-2024-002', 750.00, 'sent', '2024-11-01'),
('independent', NULL, 'independent_001', 'INV-2024-003', 320.00, 'paid', '2024-10-20'),
('independent', NULL, 'independent_002', 'INV-2024-004', 175.00, 'overdue', '2024-10-30');

-- 16. Update system settings if needed (defaults should be fine)
-- The system settings were already inserted in the main migration

-- 17. Add some sample data for testing dashboard statistics
-- This ensures we have enough data to test various dashboard features

-- Create a few more sample sessions for variety
INSERT INTO sessions (session_type, group_id, course_id, room_id, teacher_id, scheduled_at, duration_hours, justification_deadline, status, topic, notes, created_by) VALUES
('group', (SELECT id FROM groups WHERE name = 'Advanced Math Middle'), NULL, (SELECT id FROM rooms WHERE code = 'SCI-LAB'), 'teacher_001', '2024-12-15 11:00:00+03', 2.5, '2024-12-14 11:00:00+03', 'scheduled', 'Quadratic Equations', 'Bring graphing calculators', 'admin_001'),
('course', NULL, (SELECT id FROM courses WHERE name = 'Physics Fundamentals'), (SELECT id FROM rooms WHERE code = 'SCI-LAB'), 'teacher_001', '2024-12-20 13:00:00+03', 3.0, '2024-12-19 13:00:00+03', 'scheduled', 'Newton Laws Demonstration', 'Safety equipment required', 'admin_001');

-- Add attendance for these new sessions
INSERT INTO attendances (session_id, participant_type, student_id, independent_user_id, status, hours_billed, amount_due, is_billed) VALUES
((SELECT id FROM sessions WHERE topic = 'Quadratic Equations'), 'student', (SELECT id FROM students WHERE student_code = 'STU002'), NULL, 'present', 2.5, 150.00, false),
((SELECT id FROM sessions WHERE topic = 'Newton Laws Demonstration'), 'independent', NULL, 'independent_001', 'present', 3.0, 255.00, false);

-- Success message
SELECT 'Sample data seeding completed successfully! Database now contains test data for all major features.' as status;</content>
<parameter name="filePath">/home/user/p-school/supabase/migrations/006_sample_data_seeding.sql