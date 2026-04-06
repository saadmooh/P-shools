
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

export type User = Database['public']['Tables']['users']['Row'];

export const usersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return data;
  },
  
  // Add other CRUD operations if needed
};
