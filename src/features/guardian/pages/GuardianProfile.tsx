import React from 'react';
import { User, Mail, Phone, Users } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

const GuardianProfile: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="h-6 w-6" />
        My Profile
      </h1>

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
              <p className="font-medium">2 students enrolled</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianProfile;