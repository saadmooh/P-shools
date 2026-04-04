import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, User, ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role');
      if (error) throw error;
      return data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: any }) => {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      hapticFeedback('medium');
    }
  });

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    teacher: 'bg-blue-100 text-blue-700 border-blue-200',
    guardian: 'bg-green-100 text-green-700 border-green-200',
    independent: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <Layout title="User Permissions">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-lg font-bold">Manage Roles</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading users...</div>
      ) : (
        <div className="space-y-3">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                    <User size={20} className="text-[var(--tg-theme-hint-color)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{user.full_name || 'Anonymous'}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColors[user.role]}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {/* Quick role toggle for demo purposes */}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="p-2 h-8 w-8"
                    onClick={() => {
                      const roles: any[] = ['admin', 'teacher', 'guardian', 'independent'];
                      const nextRole = roles[(roles.indexOf(user.role) + 1) % roles.length];
                      updateRoleMutation.mutate({ id: user.id, role: nextRole });
                    }}
                  >
                    <Shield size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default UsersManagement;
