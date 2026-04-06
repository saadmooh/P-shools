import { supabase } from '../lib/supabase';

// Types for the dynamic role system
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  role: Role;
  permissions: Permission[];
}

// Check if user has a specific permission
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles!inner(
          role_permissions(
            permission:permissions!inner(name)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('role.role_permissions.permission.name', permissionName);

    if (error) {
      console.error('Permission check error:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Check if user has a specific role
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role:roles!inner(name)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('role.name', roleName);

    if (error) {
      console.error('Role check error:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

// Get all user permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles!inner(
          role_permissions(
            permission:permissions!inner(name)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Get permissions error:', error);
      return [];
    }

    const permissions = new Set<string>();
    data?.forEach(userRole => {
      userRole.role?.role_permissions?.forEach(rp => {
        if (rp.permission?.name) {
          permissions.add(rp.permission.name);
        }
      });
    });

    return Array.from(permissions);
  } catch (error) {
    console.error('Get permissions failed:', error);
    return [];
  }
}

// Get all user roles
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role:roles!inner(name)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Get roles error:', error);
      return [];
    }

    return data?.map(ur => ur.role?.name).filter(Boolean) || [];
  } catch (error) {
    console.error('Get roles failed:', error);
    return [];
  }
}

// Common permission checks
export const PERMISSIONS = {
  // Users
  USERS_MANAGE: 'users.manage',
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Students
  STUDENTS_MANAGE: 'students.manage',
  STUDENTS_READ: 'students.read',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_UPDATE: 'students.update',
  STUDENTS_DELETE: 'students.delete',

  // Subjects
  SUBJECTS_MANAGE: 'subjects.manage',
  SUBJECTS_READ: 'subjects.read',
  SUBJECTS_CREATE: 'subjects.create',
  SUBJECTS_UPDATE: 'subjects.update',
  SUBJECTS_DELETE: 'subjects.delete',

  // Groups
  GROUPS_MANAGE: 'groups.manage',
  GROUPS_READ: 'groups.read',
  GROUPS_CREATE: 'groups.create',
  GROUPS_UPDATE: 'groups.update',
  GROUPS_DELETE: 'groups.delete',

  // Courses
  COURSES_MANAGE: 'courses.manage',
  COURSES_READ: 'courses.read',
  COURSES_CREATE: 'courses.create',
  COURSES_UPDATE: 'courses.update',
  COURSES_DELETE: 'courses.delete',

  // Sessions
  SESSIONS_MANAGE: 'sessions.manage',
  SESSIONS_READ: 'sessions.read',
  SESSIONS_CREATE: 'sessions.create',
  SESSIONS_UPDATE: 'sessions.update',
  SESSIONS_DELETE: 'sessions.delete',

  // Attendance
  ATTENDANCE_MANAGE: 'attendance.manage',
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MARK: 'attendance.mark',

  // Invoices
  INVOICES_MANAGE: 'invoices.manage',
  INVOICES_READ: 'invoices.read',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_UPDATE: 'invoices.update',
  INVOICES_DELETE: 'invoices.delete',

  // System
  SYSTEM_MANAGE: 'system.manage',
  SYSTEM_SETTINGS: 'system.settings'
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// React hook for permission checking
export function usePermissions() {
  const checkPermission = async (permission: PermissionName): Promise<boolean> => {
    // For now, get user from auth context - you'll need to implement this
    const user = await getCurrentUser();
    if (!user) return false;

    return hasPermission(user.id, permission);
  };

  const checkRole = async (roleName: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    return hasRole(user.id, roleName);
  };

  return { checkPermission, checkRole };
}

// Helper function - you'll need to implement this based on your auth system
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}