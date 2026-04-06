import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, QrCode, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';

const StudentsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('*, guardians(full_name)');
      
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('full_name');
      if (error) throw error;
      return data;
    }
  });

  return (
    <Layout title="Manage Students">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="relative flex-1">
          <Input 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-[var(--tg-theme-hint-color)]" size={18} />
        </div>
        <Button size="sm" className="p-2">
          <Plus size={20} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading students...</div>
      ) : students?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <QrCode size={24} className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">No Students Found</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Students will appear here once they're enrolled in the system.
          </p>
          <Button size="sm" onClick={() => navigate('/admin')}>
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {students?.map((student) => (
            <Card key={student.id} onClick={() => {
              setSelectedStudent(student);
              hapticFeedback('light');
            }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{student.full_name}</h4>
                  <p className="text-xs text-[var(--tg-theme-hint-color)]">
                    Guardian: {student.guardians?.full_name}
                  </p>
                </div>
                <QrCode size={20} className="text-[var(--tg-theme-button-color)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedStudent(null)}
        >
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <h3 className="font-bold text-lg">{selectedStudent.full_name}</h3>
              <div className="bg-white p-4 rounded-xl">
                <QRCode 
                  value={selectedStudent.id} 
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-xs text-[var(--tg-theme-hint-color)] text-center">
                Student Code: {selectedStudent.id.slice(0, 8)}
              </p>
              <Button className="w-full" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default StudentsManagement;
