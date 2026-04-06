import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, User, ArrowLeft, MoreVertical, Plus, Edit, Trash2, PlusSquare, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../lib/permissions';

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_id: ''
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState('');

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

  const handleCreateUser = () => {
    createUserMutation.mutate(formData);
  };

  const handleEditUser = () => {
    updateUserMutation.mutate({
      ...editingUser,
      ...formData
    });
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate(deletingUserId);
  };

  const handleEdit = (user: any) => {
    setShowEditModal(true);
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role_id: user.user_roles?.[0]?.role_id || ''
    });
  };

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Assign role
      await supabase
        .from('user_roles')
        .insert({ user_id: data.id, role_id: userData.role_id });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      setShowCreateModal(false);
      setFormData({ full_name: '', email: '', phone: '', role_id: '' });
      hapticFeedback('medium');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone
        })
        .eq('id', userData.id);
      
      if (error) throw error;
      
      // Update role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userData.id);
      
      await supabase
        .from('user_roles')
        .insert({ user_id: userData.id, role_id: userData.role_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      setShowEditModal(false);
      setEditingUser(null);
      hapticFeedback('medium');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      setShowDeleteModal(false);
      setDeletingUserId('');
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
                    <Button variant="ghost" size="sm" className="p-2" onClick={() => handleEdit(user)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-red-500" onClick={() =u003e {
                      setShowDeleteModal(true);
                      setDeletingUserId(user.id);
                    }}>
                      <Trash2 size={16} />
                    </Button>
                      <Trash2 size={16} />
                    </Button>
                      <Trash2 size={16} />
                    </Button>
                      <Trash2 size={16} />
                    </Button>
                      <Trash2 size={16} />
                    </Button>
                      <Trash2 size={16} />
                    </Button>
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

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() =u003e setShowEditModal(false)}u003e
          <Card className="w-full max-w-md animate-in zoom-in duration-200" onClick={(e) =u003e e.stopPropagation()}u003e
            <CardContent className="p-6"u003e
              <h3 className="font-bold text-lg mb-4"u003eEdit Useru003c/h3>
              <form className="space-y-3"u003e
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) =u003e setFormData({...formData, full_name: e.target.value})}u003e
                </Input>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =u003e setFormData({...formData, email: e.target.value})}u003e
                </Input>
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =u003e setFormData({...formData, phone: e.target.value})}u003e
                </Input>
                <Select
                  label="Role"
                  value={formData.role_id}
                  onChange={(e) =u003e setFormData({...formData, role_id: e.target.value})}u003e
                  <option value=""u003eSelect Role</option>
                  {roles?.map(role =u003e (
                    <option key={role.id} value={role.id}u003e{role.name}u003c/option>
                  ))}u003e
                </Select>
                <div className="flex gap-2"u003e
                  <Button onClick={() =u003e setShowEditModal(false)}u003eCancelu003c/Button>
                  <Button onClick={handleEditUser} disabled={!formData.full_name || !formData.email || !formData.role_id}u003eUpdateu003c/Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}u003e

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() =u003e setShowDeleteModal(false)}u003e
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) =u003e e.stopPropagation()}u003e
            <CardContent className="p-6 text-center"u003e
              <Shield size={48} className="text-red-500 mb-4" /u003e
              <h3 className="font-bold text-lg mb-2"u003eDelete Useru003c/h3>
              <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4"u003eAre you sure you want to delete this user? This action cannot be undone.u003c/p>
              <div className="flex gap-2"u003e
                <Button onClick={() =u003e setShowDeleteModal(false)}u003eCancelu003c/Button>
                <Button variant="destructive" onClick={handleDeleteUser}u003eDeleteu003c/Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
