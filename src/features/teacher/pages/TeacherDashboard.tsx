import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { format } from 'date-fns';

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: teacherProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['teacher_profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const { data: nextSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['teacher_sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          groups:group_id(name),
          courses:course_id(name),
          rooms:room_id(name)
        `)
        .eq('teacher_id', user?.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher_stats', user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('duration_hours')
        .eq('teacher_id', user?.id)
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth.toISOString());

      if (sessionsError) throw sessionsError;

      const totalHours = sessions?.reduce((sum, s) => sum + Number(s.duration_hours), 0) || 0;
      
      const rate = Number(teacherProfile?.base_rate_per_hour || 0);
      const earnings = totalHours * rate;

      return { totalHours, earnings };
    },
    enabled: !!teacherProfile // Wait for profile to get the rate
  });

  return (
    <Layout title={t('dashboards.teacher_title')}>
      <Card className="mb-6 bg-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-zinc-400 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold text-white">
                {profileLoading ? '...' : (teacherProfile?.full_name || user?.full_name)}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
               <Clock size={20} className="text-zinc-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
              onClick={() => navigate('/teacher/payroll')}
            >
              <p className="text-zinc-400 text-xs mb-1">Estimated Earnings</p>
              <p className="text-xl font-bold text-white">
                {statsLoading ? '...' : `${stats?.earnings.toLocaleString()} SAR`}
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-zinc-400 text-xs mb-1">Billed Hours</p>
              <p className="text-xl font-bold text-white">
                {statsLoading ? '...' : `${stats?.totalHours}h`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Upcoming Sessions</h3>
          <button 
            className="text-xs font-semibold text-blue-500 active:opacity-60"
            onClick={() => navigate('/teacher/schedule')}
          >
            View Schedule
          </button>
        </div>
        
        {sessionsLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse"></div>
          ))
        ) : nextSessions?.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            No upcoming sessions scheduled.
          </div>
        ) : (
          nextSessions?.map((session, i) => (
            <Card 
              key={session.id} 
              className="cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
              onClick={() => navigate(`/teacher/attendance/${session.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {format(new Date(session.scheduled_at), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-zinc-900 leading-tight">
                    {format(new Date(session.scheduled_at), 'HH:mm')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-zinc-900 truncate">
                    {session.groups?.name || session.courses?.name || 'Untitled Session'}
                  </h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                     {session.rooms?.name || 'TBD'}
                  </p>
                </div>
                <ArrowRight size={18} className="text-zinc-300 flex-shrink-0" />
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </Layout>
  );
};

export default TeacherDashboard;