import React from 'react';
import { FileText, Download, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const TeacherDocuments: React.FC = () => {
  const { user } = useAuthStore();

  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  if (teacherLoading) return <div className="p-4">Loading...</div>;

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        My Documents
      </h1>

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
    </div>
  );
};

export default TeacherDocuments;