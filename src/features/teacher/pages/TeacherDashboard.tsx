import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sessions = [
    { time: '14:00', group: 'Grade 5 Maths', room: 'Room A1' },
    { time: '16:00', group: 'Advanced Physics', room: 'Lab 2' },
  ];

  return (
    <Layout title={t('dashboards.teacher_title')}>
      <Card className="mb-6 bg-zinc-900">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm">Welcome back,</p>
              <h2 className="text-xl font-semibold text-white">Ahmed Hassan</h2>
            </div>
            <Clock size={24} className="text-zinc-500" />
          </div>
          <div className="flex gap-6">
            <div 
              className="cursor-pointer"
              onClick={() => navigate('/teacher/payroll')}
            >
              <p className="text-zinc-400 text-xs">This Month</p>
              <p className="text-lg font-semibold text-white">2,400 SAR</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Total Hours</p>
              <p className="text-lg font-semibold text-white">42.5h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Next Sessions</h3>
          <span className="text-xs text-zinc-400">View All</span>
        </div>
        
        {sessions.map((session, i) => (
          <Card key={i} className="cursor-pointer active:scale-[0.99] transition-transform">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-zinc-100 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold text-zinc-900">{session.time}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-zinc-900">{session.group}</h4>
                <p className="text-sm text-zinc-500">{session.room}</p>
              </div>
              <ArrowRight size={18} className="text-zinc-300" />
            </CardContent>
          </Card>
        ))}
      </section>
    </Layout>
  );
};

export default TeacherDashboard;