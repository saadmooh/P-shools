import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, User, ArrowLeft, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../lib/permissions';

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  const [canManageUsers, setCanManageUsers] = useState(false);

  React.useEffect(() => {
    const checkPermissions = async () => {
      setCanManageUsers(await hasPermission('users.manage') || isAdmin());
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users_with_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles(
            role:roles(name, description)
          )
        `)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: canManageUsers
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: canManageUsers
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string, roleId: string }) => {
      // First remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then assign the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      hapticFeedback('medium');
    }
  });

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-red-100 text-red-700 border-red-200',
    'School Admin': 'bg-orange-100 text-orange-700 border-orange-200',
    'Teacher': 'bg-blue-100 text-blue-700 border-blue-200',
    'Guardian': 'bg-green-100 text-green-700 border-green-200',
    'Independent Learner': 'bg-purple-100 text-purple-700 border-purple-200',
    'System': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  if (!canManageUsers) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <Shield size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to manage users.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/admin')}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-bold">Manage Users & Roles</h2>
        </div>
        <Button size="sm">
          <Plus size={18} className="mr-1" /> Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading users...</div>
      ) : (
        <div className="space-y-3">
          {users?.map((user: any) => {
            const userRole = user.user_roles?.[0]?.role?.name || 'No Role';
            return (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                      <User size={20} className="text-[var(--tg-theme-hint-color)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{user.full_name || 'Anonymous'}</h4>
                      <p className="text-xs text-[var(--tg-theme-hint-color)]">{user.phone || user.email}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColors[userRole] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {userRole.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <select
                      className="text-xs p-1 border rounded"
                      value={user.user_roles?.[0]?.role_id || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignRoleMutation.mutate({
                            userId: user.id,
                            roleId: e.target.value
                          });
                        }
                      }}
                    >
                      <option value="">Select Role</option>
                      {roles?.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-red-500">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default UsersManagement;
