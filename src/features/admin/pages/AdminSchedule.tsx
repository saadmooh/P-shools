import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const AdminSchedule: React.FC = () => {
  // Placeholder data - in real app, fetch from API
  const sessions = [
    { id: 1, title: 'Math Group Session', time: '2024-01-15 10:00', room: 'Room 101' },
    { id: 2, title: 'Science Course', time: '2024-01-16 14:00', room: 'Room 202' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Admin Schedule
      </h1>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold">{session.title}</h3>
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

export default AdminSchedule;