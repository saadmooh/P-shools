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
  const [editingRoom, setEditingRoom] = useState<any>(null);
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<RoomInsert> }) =>
      roomsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingRoom(null);
      hapticFeedback('medium');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roomsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      hapticFeedback('medium');
    }
  });

  const handleSave = () => {
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data: newRoom });
    } else if (newRoom.name && newRoom.code) {
      createMutation.mutate(newRoom);
    }
  };

  const startEdit = (room: any) => {
    setEditingRoom(room);
    setNewRoom({
      name: room.name,
      code: room.code,
      capacity: room.capacity,
      floor: room.floor,
      has_projector: room.has_projector,
      has_ac: room.has_ac,
      notes: room.notes
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setNewRoom({ name: '', code: '', capacity: 20 });
    setIsAdding(false);
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
            <h3 className="font-bold">{editingRoom ? 'Edit Room' : 'New Room'}</h3>
            <Input
              label="Room Name"
              placeholder="e.g. Science Lab"
              value={newRoom.name || ''}
              onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
            />
            <Input
              label="Room Code"
              placeholder="e.g. LAB-01"
              value={newRoom.code || ''}
              onChange={(e) => setNewRoom({...newRoom, code: e.target.value})}
            />
            <Input
              label="Capacity"
              type="number"
              value={newRoom.capacity || 20}
              onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
            />
            <Input
              label="Floor"
              placeholder="e.g. Ground Floor"
              value={newRoom.floor || ''}
              onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newRoom.has_projector || false}
                  onChange={(e) => setNewRoom({...newRoom, has_projector: e.target.checked})}
                />
                <span className="text-sm">Projector</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newRoom.has_ac || false}
                  onChange={(e) => setNewRoom({...newRoom, has_ac: e.target.checked})}
                />
                <span className="text-sm">Air Conditioning</span>
              </label>
            </div>
            <Input
              label="Notes"
              placeholder="Additional notes..."
              value={newRoom.notes || ''}
              onChange={(e) => setNewRoom({...newRoom, notes: e.target.value})}
            />
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSave}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingRoom ? 'Update' : 'Save'}
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={cancelEdit}>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => startEdit(room)}
                  >
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
