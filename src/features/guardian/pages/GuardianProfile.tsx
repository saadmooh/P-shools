import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Users, ShieldX } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthPermissions } from '../../../stores/authStore';

const GuardianProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { hasRole, isAdmin } = useAuthPermissions();
  const navigate = useNavigate();
  const [canViewProfile, setCanViewProfile] = useState(false);

  useEffect(() => {
    const hasAccess = hasRole('Guardian') || isAdmin();
    setCanViewProfile(hasAccess);
  }, [hasRole, isAdmin]);

  // Show access denied if user doesn't have permission
  if (!canViewProfile) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to view your profile.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const { data: guardian } = useQuery({
    queryKey: ['guardian_profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && canViewProfile,
  });

  const { data: students } = useQuery({
    queryKey: ['guardian_students', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('guardian_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && canViewProfile, // Only fetch if user exists and has access
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
            <p className="font-medium capitalize">{user?.role || 'N/A'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GuardianProfile;