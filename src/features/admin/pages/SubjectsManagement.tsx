import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, BookOpen, Layers, ShieldX, Pencil, Trash2, X, Save, UploadCloud, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { levelsService, subjectsService, Level, Subject } from '../../../services/supabase/subjects';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../stores/authStore';
import { PERMISSIONS } from '../../../lib/permissions';

const SubjectsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  
  // State for Modals and Forms
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [isDeletingLevel, setIsDeletingLevel] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [levelFormData, setLevelFormData] = useState({ name: '', sort_order: 0 });

  const [isAddingSubject, setIsAddingSubject] = useState<string | null>(null); // Stores level_id for which subject is being added
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
  
  const [canManageSubjects, setCanManageSubjects] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await hasPermission(PERMISSIONS.SUBJECTS_MANAGE) || isAdmin();
      setCanManageSubjects(hasAccess);
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  const { data: levels, isLoading: isLoadingLevels } = useQuery<Level[]>({
    queryKey: ['school_levels'],
    queryFn: levelsService.getAll,
    enabled: canManageSubjects
  });
  
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
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

  // --- Mutations ---
  // Level Mutations
  const createLevelMutation = useMutation({
    mutationFn: levelsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_levels'] });
      setIsAddingLevel(false);
      setLevelFormData({ name: '', sort_order: 0 });
      hapticFeedback('light');
    },
    onError: (error: any) => {
      console.error("Failed to create level:", error);
      alert(`Failed to add level: ${error.message}`);
    }
  });

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Level> }) => levelsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_levels'] });
      setIsEditingLevel(false);
      setSelectedLevel(null);
      setLevelFormData({ name: '', sort_order: 0 });
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to update level:", error);
      alert(`Failed to update level: ${error.message}`);
    }
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: string) => levelsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_levels'] });
      setIsDeletingLevel(false);
      setSelectedLevel(null);
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to delete level:", error);
      alert(`Failed to delete level: ${error.message}`);
    }
  });

  // Subject Mutations
  const createSubjectMutation = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsAddingSubject(null);
      setSubjectFormData({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
      hapticFeedback('light');
    },
    onError: (error: any) => {
      console.error("Failed to create subject:", error);
      alert(`Failed to add subject: ${error.message}`);
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Subject> }) => subjectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsEditingSubject(false);
      setSelectedSubject(null);
      setSubjectFormData({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to update subject:", error);
      alert(`Failed to update subject: ${error.message}`);
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => subjectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsDeletingSubject(false);
      setSelectedSubject(null);
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to delete subject:", error);
      alert(`Failed to delete subject: ${error.message}`);
    }
  });

  // --- Handlers ---
  const handleSaveLevel = () => {
    if (!levelFormData.name) {
      alert("Level name is required.");
      return;
    }
    if (isEditingLevel && selectedLevel) {
      updateLevelMutation.mutate({ id: selectedLevel.id, data: levelFormData });
    } else {
      createLevelMutation.mutate(levelFormData);
    }
  };

  const handleSaveSubject = () => {
    if (!subjectFormData.name || !subjectFormData.code || !subjectFormData.level_id) {
      alert("Subject name, code, and level are required.");
      return;
    }
    if (isEditingSubject && selectedSubject) {
      updateSubjectMutation.mutate({ id: selectedSubject.id, data: subjectFormData });
    } else {
      createSubjectMutation.mutate(subjectFormData);
    }
  };

  const startEditLevel = (level: Level) => {
    setSelectedLevel(level);
    setLevelFormData({ name: level.name, sort_order: level.sort_order });
    setIsEditingLevel(true);
    setIsAddingLevel(false); // Close add level form if open
  };

  const startDeleteLevel = (level: Level) => {
    setSelectedLevel(level);
    setIsDeletingLevel(true);
  };

  const startEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectFormData({
      name: subject.name,
      code: subject.code,
      default_price_per_hour: subject.default_price_per_hour,
      level_id: subject.level_id,
    });
    setIsEditingSubject(true);
    setIsAddingSubject(null); // Close add subject form if open
  };
  
  const startDeleteSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeletingSubject(true);
  };

  const handleCancel = () => {
    setIsAddingLevel(false);
    setIsEditingLevel(false);
    setIsDeletingLevel(false);
    setSelectedLevel(null);
    setLevelFormData({ name: '', sort_order: 0 });

    setIsAddingSubject(null);
    setIsEditingSubject(false);
    setIsDeletingSubject(false);
    setSelectedSubject(null);
    setSubjectFormData({ name: '', code: '', default_price_per_hour: 0, level_id: '' });
  };

  // Helper to filter subjects by level
  const getSubjectsForLevel = (levelId: string) => {
    return subjects?.filter(s => s.level_id === levelId) || [];
  };

  return (
    <Layout title="Subjects & Levels">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        {canManageSubjects && (
          <Button size="sm" onClick={() => setIsAddingLevel(true)}>
            <Plus size={18} className="mr-1" /> Add Level
          </Button>
        )}
      </div>

      {/* Add/Edit Level Modal */}
      {(isAddingLevel || isEditingLevel) && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{isEditingLevel ? 'Edit Level' : 'Add New Level'}</h3>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleCancel}>
                  <X size={20} />
                </Button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Level Name"
                  placeholder="e.g. Elementary, High School"
                  value={levelFormData.name}
                  onChange={(e) => setLevelFormData({...levelFormData, name: e.target.value})}
                />
                <Input
                  label="Sort Order"
                  type="number"
                  placeholder="e.g. 1, 2, 3"
                  value={levelFormData.sort_order}
                  onChange={(e) => setLevelFormData({...levelFormData, sort_order: parseInt(e.target.value) || 0})}
                />
                <Button onClick={handleSaveLevel} loading={createLevelMutation.isPending || updateLevelMutation.isPending} className="w-full">
                  {isEditingLevel ? 'Update Level' : 'Save Level'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Level Confirmation Modal */}
      {isDeletingLevel && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 text-center">
              <ShieldX size={48} className="text-red-500 mb-4 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Delete Level</h3>
              <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4">
                Are you sure you want to delete the level '{selectedLevel.name}'? This will also delete all associated subjects. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={() => deleteLevelMutation.mutate(selectedLevel.id)} loading={deleteLevelMutation.isPending} className="flex-1">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      {(isAddingSubject || isEditingSubject) && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{isEditingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleCancel}>
                  <X size={20} />
                </Button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Subject Name"
                  placeholder="e.g. Mathematics, English"
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                />
                <Input
                  label="Subject Code"
                  placeholder="e.g. MATH, ENG"
                  value={subjectFormData.code}
                  onChange={(e) => setSubjectFormData({...subjectFormData, code: e.target.value.toUpperCase()})}
                />
                <Input
                  label="Default Price per Hour"
                  type="number"
                  placeholder="e.g. 50.00"
                  value={subjectFormData.default_price_per_hour}
                  onChange={(e) => setSubjectFormData({...subjectFormData, default_price_per_hour: parseFloat(e.target.value) || 0})}
                />
                <Button onClick={handleSaveSubject} loading={createSubjectMutation.isPending || updateSubjectMutation.isPending} className="w-full">
                  {isEditingSubject ? 'Update Subject' : 'Save Subject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {isDeletingSubject && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-xs animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 text-center">
              <ShieldX size={48} className="text-red-500 mb-4 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Delete Subject</h3>
              <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4">
                Are you sure you want to delete the subject '{selectedSubject.name}'? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={() => deleteSubjectMutation.mutate(selectedSubject.id)} loading={deleteSubjectMutation.isPending} className="flex-1">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Display Levels and Subjects */}
      <section className="space-y-6">
        {isLoadingLevels ? (
          <div className="flex justify-center p-8">Loading levels...</div>
        ) : levels?.length === 0 ? (
          <div className="text-center py-12 text-[var(--tg-theme-hint-color)]">
            No grade levels found. Add your first level!
          </div>
        ) : (
          levels?.map((level) => {
            const levelSubjects = getSubjectsForLevel(level.id);
            return (
              <div key={level.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--tg-theme-hint-color)] uppercase flex items-center gap-2">
                    <Layers size={14} /> {level.name} <span className="text-xs font-normal text-gray-500"> (Order: {level.sort_order})</span>
                  </h3>
                  {canManageSubjects && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => startEditLevel(level)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 text-[var(--tg-theme-destructive-text-color)]" onClick={() => startDeleteLevel(level)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {isLoadingSubjects ? (
                    <div className="p-4 text-[var(--tg-theme-hint-color)]">Loading subjects...</div>
                  ) : levelSubjects.length === 0 ? (
                    <Card className="border-dashed border-2 border-[var(--tg-theme-secondary-bg-color)] h-16">
                      <CardContent className="flex items-center justify-center p-0 h-full">
                        <p className="text-sm text-[var(--tg-theme-hint-color)]">No subjects for this level yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    levelSubjects.map(subject => (
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
                              {subject.default_price_per_hour.toFixed(2)} SAR
                            </p>
                            <p className="text-[10px] text-[var(--tg-theme-hint-color)]">per hour</p>
                          </div>
                          {canManageSubjects && (
                            <div className="flex gap-1 ml-2">
                              <Button variant="ghost" size="sm" className="p-1.5" onClick={() => startEditSubject(subject)}>
                                <Pencil size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1.5 text-[var(--tg-theme-destructive-text-color)]" onClick={() => startDeleteSubject(subject)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                {canManageSubjects && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-dashed border-2 border-[var(--tg-theme-secondary-bg-color)] h-12 w-full"
                    onClick={() => {
                      setIsAddingSubject(level.id);
                      setSubjectFormData({...subjectFormData, level_id: level.id});
                    }}
                  >
                    <Plus size={16} className="mr-1" /> Add Subject to {level.name}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </section>
    </Layout>
  );
};

export default SubjectsManagement;
