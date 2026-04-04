import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, BookOpen, Calendar, CreditCard, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    { label: 'Users', value: '124', icon: Users, color: 'text-blue-500' },
    { label: 'Groups', value: '18', icon: BookOpen, color: 'text-green-500' },
    { label: 'Sessions', value: '42', icon: Calendar, color: 'text-purple-500' },
    { label: 'Pending', value: '8', icon: CreditCard, color: 'text-red-500' },
  ];

  return (
    <Layout title={t('dashboards.admin_title')}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <stat.icon size={24} className={stat.color} />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-[var(--tg-theme-hint-color)]">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Card 
            className="active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => navigate('/admin/students')}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={18} /> Manage Students
              </CardTitle>
            </CardHeader>
          </Card>
          <Card 
            className="active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => navigate('/admin/subjects')}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen size={18} /> Subjects & Levels
              </CardTitle>
            </CardHeader>
          </Card>
          <Card 
            className="active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={18} /> User Permissions
              </CardTitle>
            </CardHeader>
          </Card>
          <Card 
            className="active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => navigate('/admin/invoices')}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={18} /> Invoices & Payments
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
