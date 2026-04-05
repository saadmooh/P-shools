import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const TeacherSchedule: React.FC = () => {
  // Placeholder data
  const sessions = [
    { id: 1, title: 'Math Group A', time: '2024-01-15 10:00', room: 'Room 101', students: 5 },
    { id: 2, title: 'Physics Course', time: '2024-01-16 14:00', room: 'Room 202', students: 3 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        My Schedule
      </h1>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold">{session.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4" />
              {session.time} - {session.room}
            </div>
            <p className="text-sm text-gray-600 mt-1">{session.students} students</p>
          </div>
        ))}

        {sessions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
        )}
      </div>
    </div>
  );
};

export default TeacherSchedule;