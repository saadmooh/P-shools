import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowLeft, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { roomsService, RoomInsert } from '../../../services/supabase/rooms';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../stores/authStore';
import { PERMISSIONS } from '../../../lib/permissions';

const RoomsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newRoom, setNewRoom] = useState<RoomInsert>({
    name: '',
    code: '',
    capacity: 20,
  });
  const [canManageRooms, setCanManageRooms] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await hasPermission(PERMISSIONS.ROOMS_MANAGE) || isAdmin();
      setCanManageRooms(hasAccess);
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  // Show access denied if user doesn't have permission
  if (!canManageRooms) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to manage rooms.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

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
    },
    onError: (error: any) => {
      console.error("Failed to create room:", error);
      alert(`Failed to add room: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<RoomInsert> }) =>
      roomsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingRoom(null);
      setIsAdding(false); // Close the form after update
      setNewRoom({ name: '', code: '', capacity: 20 });
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to update room:", error);
      alert(`Failed to update room: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      // No need to close modal here, delete is usually triggered by a button click directly
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to delete room:", error);
      alert(`Failed to delete room: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!newRoom.name || !newRoom.code) {
      alert("Room name and code are required.");
      return;
    }
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data: newRoom });
    } else {
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
    setIsAdding(true); // Reuse the adding modal for editing
  };
  
  const startDelete = (room: any) => {
    // For deletion, we might want a confirmation modal. For now, directly trigger mutation.
    // In a more complex UI, this would open a confirmation dialog.
    if (window.confirm(`Are you sure you want to delete room "${room.name}"?`)) {
      deleteMutation.mutate(room.id);
    }
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingRoom(null);
    setNewRoom({ name: '', code: '', capacity: 20 });
  };

  return (
    <Layout title="Manage Rooms">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        {canManageRooms && ( // Conditionally render Add button
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus size={18} className="mr-1" /> Add Room
          </Button>
        )}
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
              <Button size="sm" variant="secondary" className="flex-1" onClick={cancelForm}>
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
                  {canManageRooms && ( // Conditionally render Edit/Delete buttons
                    <>
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
                        onClick={() => startDelete(room)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
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
