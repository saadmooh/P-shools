import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Card, { CardContent } from '../../../components/ui/Card';

const localizer = momentLocalizer(moment);

const SessionCalendar: React.FC = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_hours,
          session_type,
          groups(name),
          courses(name)
        `);
      if (error) throw error;
      
      return data.map(s => ({
        id: s.id,
        title: s.groups?.name || s.courses?.name || 'Unnamed Session',
        start: new Date(s.scheduled_at),
        end: new Date(new Date(s.scheduled_at).getTime() + s.duration_hours * 60 * 60 * 1000),
        resource: s
      }));
    }
  });

  return (
    <Card className="h-[500px] overflow-hidden">
      <CardContent className="p-0 h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Loading calendar...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={sessions || []}
            startAccessor="start"
            endAccessor="end"
            defaultView="day"
            views={['day', 'week', 'month']}
            className="rounded-xl"
            eventPropGetter={(event: any) => ({
              style: {
                backgroundColor: 'var(--tg-theme-button-color)',
                borderRadius: '8px',
                border: 'none'
              }
            })}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SessionCalendar;
