import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

const GuardianSchedule: React.FC = () => {
  // Placeholder data
  const sessions = [
    { id: 1, subject: 'Mathematics', teacher: 'Mr. Smith', time: '2024-01-15 10:00', room: 'Room 101' },
    { id: 2, subject: 'Science', teacher: 'Ms. Johnson', time: '2024-01-16 14:00', room: 'Room 202' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Child's Schedule
      </h1>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold">{session.subject}</h3>
            <p className="text-sm text-gray-600">{session.teacher}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4" />
              {session.time} - {session.room}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
        )}
      </div>
    </div>
  );
};

export default GuardianSchedule;