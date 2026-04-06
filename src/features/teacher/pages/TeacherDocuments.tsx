import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const TeacherDocuments: React.FC = () => {
  const { user } = useAuthStore();

  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  if (teacherLoading) return (
    <Layout title="My Documents">
      <div className="flex justify-center p-8">Loading documents...</div>
    </Layout>
  );

  // For now, just show teacher contract info
  const documents = [
    {
      id: 1,
      title: 'Teacher Contract',
      type: 'PDF',
      size: '2.1 MB',
      description: `Contract for ${user?.full_name}`,
    },
  ];

  return (
    <Layout title="My Documents">
      <div className="space-y-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
              <p className="text-sm text-gray-600">{doc.description}</p>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="text-gray-500 text-center py-8">No documents available</p>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDocuments;