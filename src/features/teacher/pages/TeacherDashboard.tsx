import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Calendar, UserCheck, Clock, Award } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
...
  const sessions = [
    { time: '14:00', group: 'Grade 5 Maths', room: 'Room A1', type: 'group' },
    { time: '16:00', group: 'Advanced Physics', room: 'Lab 2', type: 'course' },
  ];

  return (
    <Layout title={t('dashboards.teacher_title')}>
      <Card className="mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-blue-100 text-sm">Welcome back,</p>
              <h2 className="text-2xl font-bold">Ahmed Hassan</h2>
            </div>
            <Award size={40} className="text-yellow-400" />
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-blue-100 text-xs">Total Hours</p>
              <p className="text-lg font-bold">42.5h</p>
            </div>
            <div className="w-px h-8 bg-blue-400" />
            <div 
              className="cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate('/teacher/payroll')}
            >
              <p className="text-blue-100 text-xs">This Month</p>
              <p className="text-lg font-bold">2,400.00 SAR</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Next Sessions</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        {sessions.map((session, i) => (
          <Card key={i} className="active:scale-[0.98] transition-transform cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-[var(--tg-theme-button-color)]">{session.time}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{session.group}</h4>
                <p className="text-xs text-[var(--tg-theme-hint-color)]">{session.room}</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/teacher/attendance/${session.id || 'mock-id'}`)}
              >
                <UserCheck size={16} className="mr-1" /> Attendance
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
