
import { supabase } from '../../lib/supabase';
import { Database } from '../types/database';

export type Guardian = Database['public']['Tables']['guardians']['Row'] & {
  users?: { full_name: string }; // Assuming a join with users table for full_name
};

export const guardiansService = {
  async getAll() {
    const { data, error } = await supabase
      .from('guardians')
      .select('*, users(full_name)') // Join with users table to get full_name
      .order('full_name');
    if (error) throw error;
    return data;
  },

  // Add other CRUD operations if needed
};
