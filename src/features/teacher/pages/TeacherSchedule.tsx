import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const TeacherSchedule: React.FC = () => {
  const { user } = useAuthStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-sessions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_hours,
          topic,
          status,
          rooms (name),
          groups (name, subjects (name)),
          courses (name),
          attendances (count)
        `)
        .eq('teacher_id', user?.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at')
        .limit(10);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return (
    <Layout title="My Schedule">
      <div className="flex justify-center p-8">Loading schedule...</div>
    </Layout>
  );

  return (
    <Layout title="My Schedule">
      <div className="space-y-4">
        {sessions?.map(session => {
          const title = session.groups?.name || session.courses?.name || session.topic || 'Session';
          const subject = session.groups?.subjects?.name;
          const time = new Date(session.scheduled_at).toLocaleString();
          const room = session.rooms?.name;
          const studentCount = session.attendances?.[0]?.count || 0;

          return (
            <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">{subject ? `${subject} - ${title}` : title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4" />
                {time} - {room}
              </div>
              <p className="text-sm text-gray-600 mt-1">{session.duration_hours}h • {studentCount} students • {session.status}</p>
            </div>
          );
        })}

        {(!sessions || sessions.length === 0) && (
          <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
        )}
      </div>
    </Layout>
  );
};

export default TeacherSchedule;