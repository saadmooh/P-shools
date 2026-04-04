import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { roomsService, RoomInsert } from '../../../services/supabase/rooms';
import { useTelegram } from '../../../hooks/useTelegram';

const RoomsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRoom, setNewRoom] = useState<RoomInsert>({
    name: '',
    code: '',
    capacity: 20,
  });

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsService.getAll
  });

  const createMutation = useMutation({
    mutationFn: roomsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsAdding(false);
      setNewRoom({ name: '', code: '', capacity: 20 });
      hapticFeedback('light');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roomsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      hapticFeedback('medium');
    }
  });

  const handleCreate = () => {
    if (newRoom.name && newRoom.code) {
      createMutation.mutate(newRoom);
    }
  };

  return (
    <Layout title="Manage Rooms">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus size={18} className="mr-1" /> Add Room
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6 border-2 border-[var(--tg-theme-button-color)]">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold">New Room</h3>
            <Input 
              label="Room Name" 
              placeholder="e.g. Science Lab"
              value={newRoom.name}
              onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
            />
            <Input 
              label="Room Code" 
              placeholder="e.g. LAB-01"
              value={newRoom.code}
              onChange={(e) => setNewRoom({...newRoom, code: e.target.value})}
            />
            <Input 
              label="Capacity" 
              type="number"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
            />
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1" onClick={handleCreate} loading={createMutation.isPending}>
                Save
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">Loading rooms...</div>
      ) : (
        <div className="space-y-3">
          {rooms?.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{room.name}</h4>
                  <p className="text-xs text-[var(--tg-theme-hint-color)]">
                    Code: {room.code} • Capacity: {room.capacity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 text-[var(--tg-theme-destructive-text-color)]"
                    onClick={() => deleteMutation.mutate(room.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {rooms?.length === 0 && (
            <div className="text-center py-8 text-[var(--tg-theme-hint-color)]">
              No rooms found. Add your first room!
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default RoomsManagement;
