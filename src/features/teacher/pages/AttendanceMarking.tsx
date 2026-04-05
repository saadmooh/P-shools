import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, X, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';

const AttendanceMarking: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { hapticFeedback, showAlert } = useTelegram();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  // 1. Fetch students for this session (via group/course)
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: async () => {
      // First get the session to know group_id or course_id
      const { data: session } = await supabase
        .from('sessions')
        .select('*, groups(id, name), courses(id, name)')
        .eq('id', sessionId)
        .single();
      
      if (!session) return { session: null, participants: [] };

      let participants: any[] = [];
      // Get students enrolled in that group/course
      if (session.group_id) {
        const { data } = await supabase
          .from('group_enrollments')
          .select('students(*)')
          .eq('group_id', session.group_id);
        participants = data?.map(d => ({ ...d.students, status: 'absent_unexcused' })) || [];
      } else if (session.course_id) {
        const { data } = await supabase
          .from('course_participants')
          .select('users(*)')
          .eq('course_id', session.course_id);
        participants = data?.map(d => ({ ...d.users, status: 'absent_unexcused' })) || [];
      }

      return { session, participants };
    }
  });

  const participants = sessionData?.participants;
  const session = sessionData?.session;

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string, status: string }) => {
      const { error } = await supabase
        .from('attendances')
        .upsert({
          session_id: sessionId,
          student_id: session?.group_id ? studentId : null,
          independent_user_id: session?.course_id ? studentId : null,
          participant_type: session?.group_id ? 'student' : 'independent',
          status: status,
          hours_billed: session?.duration_hours || 1, 
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] });
      hapticFeedback('light');
    }
  });

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        // decodedText is the student ID
        markAttendanceMutation.mutate({ studentId: decodedText, status: 'present' });
        scanner.clear();
        setIsScanning(false);
        showAlert(`Checked in: ${decodedText.slice(0,8)}`);
      }, (error) => {
        // ignore errors
      });
    }, 100);
  };

  return (
    <Layout title="Mark Attendance">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-lg font-bold">Session Attendance</h2>
      </div>

      <Button className="w-full mb-6 gap-2" onClick={startScanner}>
        <Camera size={18} /> {isScanning ? 'Scanner Active' : 'Scan Student QR'}
      </Button>

      {isScanning && (
        <div className="fixed inset-0 bg-black z-[100] p-6 flex flex-col items-center justify-center">
           <div id="reader" className="w-full max-w-sm bg-white rounded-xl overflow-hidden"></div>
           <Button variant="danger" className="mt-6" onClick={() => setIsScanning(false)}>Cancel</Button>
        </div>
      )}

      <div className="space-y-3">
        {participants?.map((student: any) => (
          <Card key={student.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{student.full_name}</p>
                <p className="text-xs text-[var(--tg-theme-hint-color)]">ID: {student.id.slice(0,8)}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={student.status === 'present' ? 'primary' : 'secondary'}
                  className="p-2 h-10 w-10"
                  onClick={() => markAttendanceMutation.mutate({ studentId: student.id, status: 'present' })}
                >
                  <Check size={18} />
                </Button>
                <Button 
                  size="sm" 
                  variant={student.status === 'absent_unexcused' ? 'danger' : 'secondary'}
                  className="p-2 h-10 w-10"
                  onClick={() => markAttendanceMutation.mutate({ studentId: student.id, status: 'absent_unexcused' })}
                >
                  <X size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default AttendanceMarking;
