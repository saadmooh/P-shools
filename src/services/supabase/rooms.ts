import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type RoomInsert = Database['public']['Tables']['rooms']['Insert'];

export const roomsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(room: RoomInsert) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, room: Partial<RoomInsert>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(room)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
