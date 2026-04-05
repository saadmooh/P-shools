import React from 'react';
import { User, Mail, Phone, Users } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const GuardianProfile: React.FC = () => {
  const { user } = useAuthStore();

  const { data: guardian } = useQuery({
    queryKey: ['guardian', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: students } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('guardian_id', user?.id);
      return data;
    },
    enabled: !!user?.id,
  });

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
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Children</p>
              <p className="font-medium">{students?.length || 0} students enrolled</p>
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

export default GuardianProfile;