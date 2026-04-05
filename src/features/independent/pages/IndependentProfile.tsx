import React from 'react';
import { User, Mail, Phone, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const IndependentProfile: React.FC = () => {
  const { user } = useAuthStore();

  const { data: courses } = useQuery({
    queryKey: ['independent-courses', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendances')
        .select(`
          sessions (
            course_id,
            courses (
              name
            )
          )
        `)
        .eq('independent_user_id', user?.id)
        .eq('sessions.status', 'scheduled');
      return data;
    },
    enabled: !!user?.id,
  });

  const uniqueCourses = [...new Set(courses?.map(a => (a as any).sessions?.courses?.name).filter(Boolean))];

  return (
    <Layout title="My Profile">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{user?.full_name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="font-medium">{uniqueCourses.join(', ') || 'None'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndependentProfile;