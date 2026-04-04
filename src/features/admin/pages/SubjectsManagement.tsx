import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { levelsService, subjectsService } from '../../../services/supabase/subjects';
import { useTelegram } from '../../../hooks/useTelegram';

const SubjectsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({ name: '', sort_order: 0 });

  const { data: levels } = useQuery({ queryKey: ['levels'], queryFn: levelsService.getAll });
  const { data: subjects, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: subjectsService.getAll });

  const createLevelMutation = useMutation({
    mutationFn: levelsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      setIsAddingLevel(false);
      setNewLevel({ name: '', sort_order: 0 });
      hapticFeedback('light');
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
              <Button variant="ghost" size="sm" className="border-dashed border-2 border-[var(--tg-theme-secondary-bg-color)] h-12">
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
