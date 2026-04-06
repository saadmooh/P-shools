-- EMS: Dynamic Roles and Permissions System
-- Replaces enum-based roles with dynamic database tables

-- 1. Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL, -- e.g., 'users', 'students', 'sessions'
    action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create role_permissions junction table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- 4. Create user_roles table (replaces the role enum in users table)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES users(id), -- Who assigned this role
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id) -- User can only have each role once
);

-- 5. Add indexes for performance
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 6. Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
-- User management
('users.create', 'Create new users', 'users', 'create'),
('users.read', 'View user information', 'users', 'read'),
('users.update', 'Update user information', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),
('users.manage', 'Full user management', 'users', 'manage'),

-- Student management
('students.create', 'Enroll new students', 'students', 'create'),
('students.read', 'View student information', 'students', 'read'),
('students.update', 'Update student information', 'students', 'update'),
('students.delete', 'Remove students', 'students', 'delete'),
('students.manage', 'Full student management', 'students', 'manage'),

-- Guardian management
('guardians.create', 'Add new guardians', 'guardians', 'create'),
('guardians.read', 'View guardian information', 'guardians', 'read'),
('guardians.update', 'Update guardian information', 'guardians', 'update'),
('guardians.delete', 'Remove guardians', 'guardians', 'delete'),
('guardians.manage', 'Full guardian management', 'guardians', 'manage'),

-- Teacher management
('teachers.create', 'Hire new teachers', 'teachers', 'create'),
('teachers.read', 'View teacher information', 'teachers', 'read'),
('teachers.update', 'Update teacher information', 'teachers', 'update'),
('teachers.delete', 'Remove teachers', 'teachers', 'delete'),
('teachers.manage', 'Full teacher management', 'teachers', 'manage'),

-- Academic management
('subjects.create', 'Create new subjects', 'subjects', 'create'),
('subjects.read', 'View subjects', 'subjects', 'read'),
('subjects.update', 'Update subjects', 'subjects', 'update'),
('subjects.delete', 'Delete subjects', 'subjects', 'delete'),
('subjects.manage', 'Full subject management', 'subjects', 'manage'),

('groups.create', 'Create new groups', 'groups', 'create'),
('groups.read', 'View groups', 'groups', 'read'),
('groups.update', 'Update groups', 'groups', 'update'),
('groups.delete', 'Delete groups', 'groups', 'delete'),
('groups.manage', 'Full group management', 'groups', 'manage'),

('courses.create', 'Create new courses', 'courses', 'create'),
('courses.read', 'View courses', 'courses', 'read'),
('courses.update', 'Update courses', 'courses', 'update'),
('courses.delete', 'Delete courses', 'courses', 'delete'),
('courses.manage', 'Full course management', 'courses', 'manage'),

-- Session management
('sessions.create', 'Schedule new sessions', 'sessions', 'create'),
('sessions.read', 'View sessions', 'sessions', 'read'),
('sessions.update', 'Update session details', 'sessions', 'update'),
('sessions.delete', 'Cancel sessions', 'sessions', 'delete'),
('sessions.manage', 'Full session management', 'sessions', 'manage'),

-- Attendance management
('attendance.mark', 'Mark attendance for sessions', 'attendance', 'update'),
('attendance.read', 'View attendance records', 'attendance', 'read'),
('attendance.manage', 'Full attendance management', 'attendance', 'manage'),

-- Financial management
('invoices.create', 'Create invoices', 'invoices', 'create'),
('invoices.read', 'View invoices', 'invoices', 'read'),
('invoices.update', 'Update invoices', 'invoices', 'update'),
('invoices.delete', 'Delete invoices', 'invoices', 'delete'),
('invoices.manage', 'Full invoice management', 'invoices', 'manage'),

('payments.process', 'Process payments', 'payments', 'create'),
('payments.read', 'View payment records', 'payments', 'read'),
('payments.manage', 'Full payment management', 'payments', 'manage'),

-- Reports and analytics
('reports.view', 'View system reports', 'reports', 'read'),
('reports.manage', 'Manage report configurations', 'reports', 'manage'),

-- System administration
('system.settings', 'Modify system settings', 'system', 'update'),
('system.backup', 'Create system backups', 'system', 'create'),
('system.manage', 'Full system administration', 'system', 'manage');

-- 8. Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
('Super Admin', 'Full system access with all permissions', true),
('School Admin', 'Administrative access to manage school operations', true),
('Teacher', 'Teaching staff with access to their classes and students', true),
('Guardian', 'Parent access to view their children''s information', true),
('Independent Learner', 'Self-directed learners with access to their courses', true),
('System', 'System-level operations', true);

-- 9. Assign permissions to default roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Super Admin';

-- School Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'School Admin'
AND p.name IN (
    'users.manage', 'students.manage', 'guardians.manage', 'teachers.manage',
    'subjects.manage', 'groups.manage', 'courses.manage', 'sessions.manage',
    'attendance.manage', 'invoices.manage', 'payments.manage', 'reports.manage',
    'system.settings'
);

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Teacher'
AND p.name IN (
    'students.read', 'groups.read', 'courses.read', 'sessions.read',
    'sessions.update', 'attendance.mark', 'attendance.read'
);

-- Guardian permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Guardian'
AND p.name IN (
    'students.read', 'invoices.read', 'payments.read'
);

-- Independent Learner permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Independent Learner'
AND p.name IN (
    'courses.read', 'sessions.read', 'attendance.read'
);

-- 10. Migrate existing users to the new role system
-- Insert user_roles based on existing user.role enum values
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (
    (u.role = 'admin' AND r.name = 'Super Admin') OR
    (u.role = 'teacher' AND r.name = 'Teacher') OR
    (u.role = 'guardian' AND r.name = 'Guardian') OR
    (u.role = 'independent' AND r.name = 'Independent Learner') OR
    (u.role = 'system' AND r.name = 'System')
);

-- 11. RLS Policies for the new tables
-- Permissions table - only admins can manage
CREATE POLICY "Admins can manage permissions" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()::text
            AND ur.is_active = true
            AND r.name IN ('Super Admin', 'School Admin')
        )
    );

-- Roles table - admins can manage non-system roles
CREATE POLICY "Admins can manage roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Admins can create and update roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()::text
            AND ur.is_active = true
            AND r.name IN ('Super Admin', 'School Admin')
        ) AND (is_system_role = false OR is_system_role IS NULL)
    );

-- Role permissions - admins can manage
CREATE POLICY "Admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()::text
            AND ur.is_active = true
            AND r.name IN ('Super Admin', 'School Admin')
        )
    );

-- User roles - users can view their own, admins can manage all
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()::text
            AND ur.is_active = true
            AND r.name IN ('Super Admin', 'School Admin')
        )
    );

-- Note: After running this migration, you can remove the role column from the users table
-- ALTER TABLE users DROP COLUMN role;</content>
<parameter name="filePath">/home/user/p-school/supabase/migrations/007_dynamic_roles_permissions.sql