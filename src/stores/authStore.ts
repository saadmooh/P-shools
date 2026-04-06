import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserRoles, getUserPermissions } from '../lib/permissions';

interface User {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
}

interface AuthState {
  user: User | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      token: null,
      setAuth: async (user, token) => {
        // Load roles and permissions when user authenticates
        const roles = await getUserRoles(user.id);
        const permissions = await getUserPermissions(user.id);
        set({ user, token, roles, permissions, isAuthenticated: true });
      },
      logout: () => set({
        user: null,
        token: null,
        roles: [],
        permissions: [],
        isAuthenticated: false
      }),
      refreshPermissions: async () => {
        const { user } = get();
        if (user) {
          const roles = await getUserRoles(user.id);
          const permissions = await getUserPermissions(user.id);
          set({ roles, permissions });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist basic auth data, not permissions (they can be refreshed)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Utility functions for checking permissions and roles
export const useAuthPermissions = () => {
  const { permissions, roles, isAuthenticated } = useAuthStore();

  const hasPermission = (permission: string) => {
    return isAuthenticated && permissions.includes(permission);
  };

  const hasRole = (roleName: string) => {
    return isAuthenticated && roles.includes(roleName);
  };

  const hasAnyRole = (roleNames: string[]) => {
    return isAuthenticated && roleNames.some(role => roles.includes(role));
  };

  const isAdmin = () => {
    return hasRole('Super Admin') || hasRole('School Admin');
  };

  const isTeacher = () => {
    return hasRole('Teacher');
  };

  const isGuardian = () => {
    return hasRole('Guardian');
  };

  const isIndependent = () => {
    return hasRole('Independent Learner');
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isGuardian,
    isIndependent,
    permissions,
    roles,
    isAuthenticated
  };
};
