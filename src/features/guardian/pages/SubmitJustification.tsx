import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, Send, Camera, ShieldX } from 'lucide-react'; // Import ShieldX
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button'; // Import Button for Access Denied screen
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../stores/authStore';
import { useAuthStore } from '../../../stores/authStore'; // Import useAuthStore to get user info

const SubmitJustification: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback, showAlert } = useTelegram();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { hasRole, isAdmin } = useAuthPermissions();
  
  const [searchParams] = useSearchParams();
  const attendanceId = searchParams.get('attendanceId');
  
  const [reason, setReason] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const hasAccess = hasRole('Guardian') || isAdmin();
    setCanSubmitJustification(hasAccess);
  }, [hasRole, isAdmin]);

  // Show access denied if user doesn't have permission or if attendanceId is missing
  if (!canSubmitJustification || !attendanceId) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            { !attendanceId ? "Invalid request: Attendance ID is missing." : "You don't have permission to submit justifications." }
            Contact your administrator if you need access or if this is an error.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('absence_justifications')
        .insert([data]);
      if (error) throw error;
      
      // Update attendance status to pending
      await supabase
        .from('attendances')
        .update({ status: 'absent_pending' })
        .eq('id', attendanceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian_documents'] }); // Invalidate documents if they depend on this
      hapticFeedback('medium');
      showAlert('Justification submitted successfully');
      navigate('/guardian/documents'); // Navigate to documents page after success
    },
    onError: (error: any) => {
      console.error("Failed to submit justification:", error);
      alert(`Failed to submit justification: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    submitMutation.mutate({
      attendance_id: attendanceId,
      reason,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    });
  };

  return (
    <Layout title="Justify Absence">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-lg font-bold">New Justification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--tg-theme-section-header-text-color)]">
                Reason for absence
              </label>
              <textarea 
                className="w-full min-h-[120px] rounded-lg bg-[var(--tg-theme-secondary-bg-color)] border-none p-3 text-sm focus:ring-2 focus:ring-[var(--tg-theme-button-color)] outline-none"
                placeholder="e.g. Medical appointment, family emergency..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="border-2 border-dashed border-[var(--tg-theme-hint-color)] rounded-xl p-8 flex flex-col items-center justify-center gap-2 opacity-50">
              <Camera size={32} />
              <p className="text-xs font-medium">Attach Medical Certificate or Photo</p>
              <p className="text-[10px]">JPG, PNG supported</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full font-bold h-14"
          loading={submitMutation.isPending}
        >
          <Send size={18} className="mr-2" /> Submit Justification
        </Button>
      </form>
    </Layout>
  );
};

export default SubmitJustification;
