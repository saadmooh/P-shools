import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Book, Compass, Clock, CreditCard, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { format } from 'date-fns';

const IndependentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: enrollments, isLoading: coursesLoading } = useQuery({
    queryKey: ['independent_enrollments', user?.id],
    queryFn: async () => {
      // In a real app, we'd have a course_participants table
      // For now, we'll try to find courses through attendances/sessions 
      // or assume course_participants exists as per plan
      const { data, error } = await supabase
        .from('course_participants')
        .select(`
          *,
          courses:course_id(
            *,
            sessions(
              scheduled_at,
              status
            )
          )
        `)
        .eq('user_id', user?.id);
      
      if (error) {
        // Fallback: try to find courses where user had any attendance
        const { data: attendanceData } = await supabase
          .from('attendances')
          .select('sessions(courses(*))')
          .eq('independent_user_id', user?.id);
        
        const courses = attendanceData
          ?.map(a => a.sessions?.courses)
          .filter((c, i, self) => c && self.findIndex(t => t?.id === c.id) === i);
        
        return courses?.map(c => ({ courses: c, progress: 0 })) || [];
      }

      return data;
    }
  });

  return (
    <Layout title={t('dashboards.independent_title')}>
      <Card className="mb-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-violet-100 text-sm opacity-80">Learning Progress</p>
              <h2 className="text-3xl font-bold">
                {coursesLoading ? '...' : (enrollments?.length || 0)} Active
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Book size={28} className="text-white" />
            </div>
          </div>
          <Button 
            variant="secondary" 
            className="w-full bg-white text-violet-600 border-none font-bold py-4 active:scale-[0.98] transition-transform"
            onClick={() => navigate('/courses/browse')}
          >
            Browse New Courses
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">My Courses</h3>
          <button className="text-xs font-semibold text-violet-500">View All</button>
        </div>
        
        {coursesLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 rounded-2xl animate-pulse"></div>
          ))
        ) : enrollments?.length === 0 ? (
          <div className="p-10 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
             <Book size={32} className="mx-auto text-zinc-300 mb-3" />
             <p className="text-zinc-500 text-sm">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          enrollments?.map((enrollment: any, i: number) => {
            const course = enrollment.courses;
            const nextSession = course.sessions
              ?.filter((s: any) => new Date(s.scheduled_at) > new Date())
              .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];

            return (
              <Card 
                key={course.id}
                className="active:scale-[0.99] transition-all hover:shadow-md cursor-pointer border-zinc-100"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-900 leading-tight mb-1">{course.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {course.status}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-violet-600">{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-50">
                      <div 
                        className="h-full bg-violet-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {nextSession && (
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <Clock size={14} className="text-violet-400" />
                      <span>Next: {format(new Date(nextSession.scheduled_at), 'EEEE, HH:mm')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-1 mb-4">Recommended For You</h3>
        <Card className="bg-zinc-50 border-zinc-100 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner">
              <Compass className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-zinc-900">Advanced React Patterns</h4>
              <p className="text-xs text-zinc-400">Based on your recent activity</p>
            </div>
            <Button size="sm" variant="ghost" className="text-indigo-600 font-bold">Details</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IndependentDashboard;
