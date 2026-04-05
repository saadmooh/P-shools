import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, BookOpen, Calendar, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

      return [
        { label: 'Users', value: usersCount?.toString() || '0', icon: Users, color: 'text-blue-600', path: '/admin/users' },
        { label: 'Groups', value: groupsCount?.toString() || '0', icon: BookOpen, color: 'text-green-600', path: '/admin/subjects' },
        { label: 'Sessions', value: sessionsCount?.toString() || '0', icon: Calendar, color: 'text-purple-600', path: '/admin/schedule' },
        { label: 'Pending', value: pendingInvoicesCount?.toString() || '0', icon: CreditCard, color: 'text-orange-600', path: '/admin/invoices' },
      ];
    }
  });

  const actions = [
    { label: 'Manage Students', icon: Users, path: '/admin/students' },
    { label: 'Subjects & Levels', icon: BookOpen, path: '/admin/subjects' },
    { label: 'User Permissions', icon: Shield, path: '/admin/users' },
    { label: 'Invoices & Payments', icon: CreditCard, path: '/admin/invoices' },
  ];

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
          {actions.map((action) => (
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