import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, BookOpen, Calendar, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthPermissions, PERMISSIONS } from '../../../lib/permissions';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission, permissions } = useAuthPermissions();
  const [availableStats, setAvailableStats] = useState<any[]>([]);
  const [availableActions, setAvailableActions] = useState<any[]>([]);

  useEffect(() => {
    const loadPermissions = async () => {
      const baseStats = [];
      const baseActions = [];

      // Check permissions and add items accordingly
      if (await hasPermission(PERMISSIONS.USERS_READ) || permissions.includes('users.manage')) {
        baseStats.push({ label: 'Users', value: '0', icon: Users, color: 'text-blue-600', path: '/admin/users' });
      }

      if (await hasPermission(PERMISSIONS.SUBJECTS_READ)) {
        baseStats.push({ label: 'Groups', value: '0', icon: BookOpen, color: 'text-green-600', path: '/admin/subjects' });
      }

      if (await hasPermission(PERMISSIONS.SESSIONS_READ)) {
        baseStats.push({ label: 'Sessions', value: '0', icon: Calendar, color: 'text-purple-600', path: '/admin/schedule' });
      }

      if (await hasPermission(PERMISSIONS.INVOICES_READ)) {
        baseStats.push({ label: 'Pending', value: '0', icon: CreditCard, color: 'text-orange-600', path: '/admin/invoices' });
      }

      // Actions
      if (await hasPermission(PERMISSIONS.STUDENTS_MANAGE)) {
        baseActions.push({ label: 'Manage Students', icon: Users, path: '/admin/students' });
      }

      if (await hasPermission(PERMISSIONS.SUBJECTS_MANAGE)) {
        baseActions.push({ label: 'Subjects & Levels', icon: BookOpen, path: '/admin/subjects' });
      }

      if (permissions.includes('users.manage')) {
        baseActions.push({ label: 'User Permissions', icon: Shield, path: '/admin/users' });
      }

      if (await hasPermission(PERMISSIONS.INVOICES_MANAGE)) {
        baseActions.push({ label: 'Invoices & Payments', icon: CreditCard, path: '/admin/invoices' });
      }

      setAvailableStats(baseStats);
      setAvailableActions(baseActions);
    };

    loadPermissions();
  }, [hasPermission, permissions]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: groupsCount },
        { count: sessionsCount },
        { count: pendingInvoicesCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).neq('status', 'paid').neq('status', 'cancelled')
      ]);

      const result = [];

      // Only add stats that user has permission for
      if (availableStats.some(s => s.label === 'Users')) {
        result.push({ label: 'Users', value: usersCount?.toString() || '0', icon: Users, color: 'text-blue-600', path: '/admin/users' });
      }
      if (availableStats.some(s => s.label === 'Groups')) {
        result.push({ label: 'Groups', value: groupsCount?.toString() || '0', icon: BookOpen, color: 'text-green-600', path: '/admin/subjects' });
      }
      if (availableStats.some(s => s.label === 'Sessions')) {
        result.push({ label: 'Sessions', value: sessionsCount?.toString() || '0', icon: Calendar, color: 'text-purple-600', path: '/admin/schedule' });
      }
      if (availableStats.some(s => s.label === 'Pending')) {
        result.push({ label: 'Pending', value: pendingInvoicesCount?.toString() || '0', icon: CreditCard, color: 'text-orange-600', path: '/admin/invoices' });
      }

      return result;
    }
  });

  return (
    <Layout title={t('dashboards.admin_title')}>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col items-center">
              <div className="w-8 h-8 bg-zinc-200 rounded-full mb-2"></div>
              <div className="h-4 w-8 bg-zinc-200 rounded mb-1"></div>
              <div className="h-3 w-12 bg-zinc-100 rounded"></div>
            </div>
          ))
        ) : (
          stats?.map((stat) => (
            <div 
              key={stat.label} 
              className="text-center cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate(stat.path)}
            >
              <stat.icon size={20} className={stat.color + ' mx-auto mb-1'} />
              <div className="text-xl font-semibold text-zinc-900">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Quick Actions</h2>
        <div className="space-y-2">
          {availableActions.map((action) => (
            <Card 
              key={action.path}
              className="cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <action.icon size={18} className="text-zinc-700" />
                  </div>
                  <span className="font-medium text-zinc-900">{action.label}</span>
                </div>
                <ArrowRight size={18} className="text-zinc-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;