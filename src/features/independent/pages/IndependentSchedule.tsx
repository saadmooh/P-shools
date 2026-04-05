import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const IndependentSchedule: React.FC = () => {
  const { user } = useAuthStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['independent-sessions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendances')
        .select(`
          sessions (
            id,
            scheduled_at,
            duration_hours,
            topic,
            status,
            rooms (name),
            groups (name, subjects (name), teachers (full_name)),
            courses (name, teachers (full_name))
          )
        `)
        .eq('independent_user_id', user?.id)
        .gte('sessions.scheduled_at', new Date().toISOString())
        .order('sessions.scheduled_at')
        .limit(10);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        My Schedule
      </h1>

      <div className="space-y-4">
        {sessions?.map(attendance => {
          const session = attendance.sessions;
          if (!session) return null;

          const subject = session.groups?.subjects?.name;
          const title = session.groups?.name || session.courses?.name || session.topic || 'Session';
          const teacher = session.groups?.teachers?.full_name || session.courses?.teachers?.full_name;
          const time = new Date(session.scheduled_at).toLocaleString();
          const room = session.rooms?.name;

          return (
            <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold">{subject ? `${subject} - ${title}` : title}</h3>
              <p className="text-sm text-gray-600">{teacher}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4" />
                {time} - {room}
              </div>
            </div>
          );
        })}

        {(!sessions || sessions.length === 0) && (
          <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
        )}
      </div>
    </div>
  );
};

export default IndependentSchedule;