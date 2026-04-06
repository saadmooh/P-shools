import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, BookOpen, Layers, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { levelsService, subjectsService } from '../../../services/supabase/subjects';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions, PERMISSIONS } from '../../../lib/permissions';

const SubjectsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({ name: '', sort_order: 0 });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
  const [canManageSubjects, setCanManageSubjects] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await hasPermission(PERMISSIONS.SUBJECTS_MANAGE) || isAdmin();
      setCanManageSubjects(hasAccess);
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: levelsService.getAll,
    enabled: canManageSubjects
  });
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsService.getAll,
    enabled: canManageSubjects
  });

  // Show access denied if user doesn't have permission
  if (!canManageSubjects) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to manage subjects and levels.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const createLevelMutation = useMutation({
    mutationFn: levelsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      setIsAddingLevel(false);
      setNewLevel({ name: '', sort_order: 0 });
      hapticFeedback('light');
    }
  });

  const createSubjectMutation = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsAddingSubject(null);
      setNewSubject({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
      hapticFeedback('light');
    },
    onError: (error) => {
      console.error("Failed to create subject:", error);
      alert(`Failed to add subject: ${error.message}`); // Basic error feedback
    }
  });

  return (
    <Layout title="Subjects & Levels">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        <Button size="sm" onClick={() => setIsAddingLevel(true)}>
          <Plus size={18} className="mr-1" /> Add Level
        </Button>
      </div>

      {isAddingLevel && (
        <Card className="mb-6 border-2 border-[var(--tg-theme-button-color)]">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold">New Grade Level</h3>
            <Input
              label="Level Name"
              placeholder="e.g. Elementary, High School"
              value={newLevel.name}
              onChange={(e) => setNewLevel({...newLevel, name: e.target.value})}
            />
            <Button size="sm" className="w-full" onClick={() => createLevelMutation.mutate(newLevel)}>
              Save Level
            </Button>
          </CardContent>
        </Card>
      )}

      {isAddingSubject && (
        <Card className="mb-6 border-2 border-[var(--tg-theme-button-color)]">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold">New Subject</h3>
            <Input
              label="Subject Name"
              placeholder="e.g. Mathematics, English"
              value={newSubject.name}
              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
            />
            <Input
              label="Subject Code"
              placeholder="e.g. MATH, ENG"
              value={newSubject.code}
              onChange={(e) => setNewSubject({...newSubject, code: e.target.value.toUpperCase()})}
            />
            <Input
              label="Default Price per Hour"
              type="number"
              placeholder="50.00"
              value={newSubject.default_price_per_hour || ''}
              onChange={(e) => setNewSubject({...newSubject, default_price_per_hour: parseFloat(e.target.value) || 0})}
            />
            <Button size="sm" className="w-full" onClick={() => createSubjectMutation.mutate({...newSubject, level_id: isAddingSubject})}>
              Save Subject
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-6">
        {levels?.map((level) => (
          <div key={level.id} className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--tg-theme-hint-color)] uppercase flex items-center gap-2">
              <Layers size={14} /> {level.name}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {subjects?.filter(s => s.level_id === level.id).map(subject => (
                <Card key={subject.id}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{subject.name}</p>
                        <p className="text-[10px] text-[var(--tg-theme-hint-color)]">{subject.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--tg-theme-button-color)]">
                        {subject.default_price_per_hour} SAR
                      </p>
                      <p className="text-[10px] text-[var(--tg-theme-hint-color)]">per hour</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="border-dashed border-2 border-[var(--tg-theme-secondary-bg-color)] h-12"
                onClick={() => {
                  setIsAddingSubject(level.id);
                  setNewSubject({...newSubject, level_id: level.id});
                }}
              >
                <Plus size={16} className="mr-1" /> Add Subject to {level.name}
              </Button>
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default SubjectsManagement;
