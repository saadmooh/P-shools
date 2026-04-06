-- EMS: Sample Data Seeding
-- تحذير: سيقوم هذا السكربت بإضافة بيانات أولية إلى قاعدة البيانات.
-- ملاحظة: هذا الملف هو لتعبئة البيانات الأولية (Seeding) وليس لإعادة تعيين الهيكل (Reset).

-- ===========================================================================
-- 1. إضافة بيانات أولية للجداول الأساسية
-- ===========================================================================

-- 1.1 المستخدمون (Users)
-- ستحتاج إلى التأكد من أن هذه المعرفات Telegram موجودة بالفعل أو تم إنشاؤها في جدول المستخدمين.
-- في سيناريو حقيقي، سيتم ربط هذه البيانات بحسابات مستخدمين موجودة.
-- هنا، نفترض أن المستخدمين موجودون وأننا نضيف أدوارهم وبياناتهم الإضافية.

-- إدراج أدوار للنظام (إذا لم تكن موجودة)
INSERT INTO roles (name, description, is_system_role) VALUES
('admin', 'System administrator with full access', true),
('teacher', 'Teacher role for managing courses and students', false),
('guardian', 'Guardian role for managing student data', false),
('independent', 'Independent user role', false);

-- إدراج الأذونات (Permissions) - أمثلة
INSERT INTO permissions (name, resource, action) VALUES
('can_view_dashboard', 'dashboard', 'read'),
('can_manage_users', 'users', 'manage'),
('can_manage_courses', 'courses', 'manage'),
('can_view_schedule', 'schedule', 'read'),
('can_manage_invoices', 'invoices', 'manage'),
('can_view_students', 'students', 'read'),
('can_manage_students', 'students', 'manage'),
('can_view_grades', 'grades', 'read');

-- ربط الأذونات بالأدوار
-- Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin' AND p.resource = 'users';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin' AND p.resource = 'courses';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin' AND p.resource = 'invoices';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin' AND p.resource = 'students';

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'teacher' AND p.resource = 'courses';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'teacher' AND p.resource = 'schedule';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'teacher' AND p.resource = 'students';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'teacher' AND p.resource = 'grades';

-- Guardian permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'guardian' AND p.resource = 'schedule';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'guardian' AND p.resource = 'students';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'guardian' AND p.resource = 'invoices';

-- Independent permissions (minimal for now)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'independent' AND p.resource = 'schedule';

-- 1.2 الإعدادات الأساسية للنظام (System Settings)
-- لإدارة البيانات التي قد تكون قابلة للتغيير مثل اسم التطبيق، رسائل الترحيب، إلخ.
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'EMS', 'The name of the application displayed in headers.'),
('default_title', 'Welcome', 'The default welcome message for the main page title.');

-- ===========================================================================
-- 2. بيانات إضافية للجداول الأخرى (يمكن توسيعها حسب الحاجة)
-- ===========================================================================

-- 2.1 مستويات المدرسة (School Levels)
INSERT INTO school_levels (name, sort_order) VALUES
('Kindergarten', 1),
('Elementary School', 2),
('Middle School', 3),
('High School', 4);

-- 2.2 الغرف (Rooms)
INSERT INTO rooms (name, code, capacity, floor, has_projector, has_ac) VALUES
('Room 101', 'R101', 30, '1', true, true),
('Room 102', 'R102', 25, '1', false, true),
('Lab 201', 'L201', 20, '2', true, false);

-- 2.3 مواد (Subjects) - تحتاج إلى school_levels IDs
-- نفترض وجود school_level IDs: 1, 2, 3, 4
-- سيتم استخدامها في جملة INSERT التالية

-- 2.4 جداول لتعبئة البيانات الأولية
-- مثال: إضافة مدرسين، طلاب، أولياء أمور، إلخ.
-- في سيناريو حقيقي، يجب إنشاء سجلات مرتبطة بشكل صحيح.

-- مثال: إضافة مدرس
-- تحتاج إلى user_id مسبقًا. سنقوم بإنشاء مستخدم وهمي أولاً.
-- افتراض: وجود مستخدم 'admin_user_id' و 'teacher_user_id' معرف مسبقًا في جدول users.
-- أو سنضيفهم هنا لأغراض المثال.

-- إضافة مستخدمين وهميين لغرض الاختبار (إذا لم يكونوا موجودين)
-- يجب التأكد من أن معرفات Telegram فريدة أو استخدام UUIDs إذا كان Telegram ID غير موجود
INSERT INTO users (id, telegram_id, role, full_name, is_active) VALUES
('admin_user_id_seed', 100000001, 'admin', 'Admin User', true),
('teacher_user_id_seed', 100000002, 'teacher', 'Mr. John Doe', true),
('guardian_user_id_seed', 100000003, 'guardian', 'Mrs. Jane Smith', true),
('student_guardian_id_seed', 100000004, 'guardian', 'Mr. Peter Jones', true),
('independent_user_id_seed', 100000005, 'independent', 'Independent User', true);

-- إضافة بيانات للمدرسين
INSERT INTO teachers (user_id, full_name, specialty, base_rate_per_hour, hire_date, contract_type) VALUES
('teacher_user_id_seed', 'Mr. John Doe', 'Computer Science', 50.00, '2023-01-15', 'hourly');

-- إضافة بيانات لأولياء الأمور
INSERT INTO guardians (user_id, full_name, address) VALUES
('guardian_user_id_seed', 'Mrs. Jane Smith', '123 Main St, Anytown'),
('student_guardian_id_seed', 'Mr. Peter Jones', '456 Oak Ave, Otherville');

-- إضافة بيانات للطلاب
INSERT INTO students (guardian_id, full_name, date_of_birth, student_code, enrollment_date) VALUES
('guardian_user_id_seed', 'Alice Smith', '2010-05-15', 'S1001', '2023-09-01'),
('student_guardian_id_seed', 'Bob Jones', '2011-08-20', 'S1002', '2023-09-01');

-- إضافة بيانات للمستخدمين المستقلين (إذا لم يكونوا جزءًا من الطلاب/المعلمين/الأولياء)
-- 'independent_user_id_seed' تم إضافته في جدول users أعلاه.

-- 2.5 مواد (Subjects) - تحتاج إلى school_levels IDs
-- سنفترض أن school_levels IDs هي 1, 2, 3, 4
INSERT INTO subjects (level_id, name, code, default_price_per_hour) VALUES
(1, 'Arabic Language', 'ARB101', 30.00),
(2, 'Mathematics', 'MAT201', 40.00),
(3, 'Physics', 'PHY301', 45.00),
(4, 'Chemistry', 'CHM401', 45.00);

-- 2.6 مجموعات (Groups) - تحتاج إلى subject_id و teacher_id
-- نفترض وجود subject IDs لـ ARB101, MAT201
-- نفترض وجود teacher ID: 'teacher_user_id_seed'

-- مثال: إضافة مجموعتين
INSERT INTO groups (subject_id, teacher_id, name, academic_year, max_students, price_per_hour, teacher_rate_per_hour) VALUES
((SELECT id FROM subjects WHERE code = 'ARB101'), 'teacher_user_id_seed', 'Arabic Beginners', '2023-2024', 25, 35.00, 40.00),
((SELECT id FROM subjects WHERE code = 'MAT201'), 'teacher_user_id_seed', 'Algebra I', '2023-2024', 30, 45.00, 50.00);

-- 2.7 دورات (Courses) - تحتاج إلى teacher_id
INSERT INTO courses (teacher_id, name, description, total_hours, price_per_hour, price_mode, fixed_total_price, teacher_rate_per_hour, max_participants, start_date, end_date, status) VALUES
('teacher_user_id_seed', 'Introduction to React', 'Learn the basics of React.js', 20.00, 50.00, 'per_hour', NULL, 40.00, 30, '2024-09-01', '2024-12-20', 'open'),
('teacher_user_id_seed', 'Advanced SQL', 'Deep dive into SQL features', 15.00, 55.00, 'per_hour', NULL, 45.00, 25, '2024-09-10', '2024-12-15', 'draft');

-- 2.8 جلسات (Sessions) - تحتاج إلى group_id أو course_id, room_id, teacher_id
-- نفترض وجود group IDs لـ 'Arabic Beginners', 'Algebra I'
-- نفترض وجود course IDs لـ 'Introduction to React', 'Advanced SQL'
-- نفترض وجود room IDs لـ 'R101', 'L201'

-- مثال: إضافة جلسة لمجموعة
INSERT INTO sessions (session_type, group_id, room_id, teacher_id, scheduled_at, duration_hours, justification_deadline, status, topic) VALUES
('group', (SELECT id FROM groups WHERE name = 'Arabic Beginners'), (SELECT id FROM rooms WHERE code = 'R101'), 'teacher_user_id_seed', '2024-09-05 10:00:00+00', 1.5, '2024-09-04 10:00:00+00', 'scheduled', 'Introduction to Arabic Alphabet');

-- مثال: إضافة جلسة لدورة
INSERT INTO sessions (session_type, course_id, room_id, teacher_id, scheduled_at, duration_hours, justification_deadline, status, topic) VALUES
('course', (SELECT id FROM courses WHERE name = 'Introduction to React'), (SELECT id FROM rooms WHERE code = 'L201'), 'teacher_user_id_seed', '2024-09-05 14:00:00+00', 2.0, '2024-09-04 14:00:00+00', 'scheduled', 'React Components');

-- ===========================================================================
-- 3. إضافة بيانات أولية لجدول إعدادات النظام
-- ===========================================================================
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'EMS', 'The name of the application displayed in headers.'),
('default_title', 'Welcome', 'The default welcome message for the main page title.');
