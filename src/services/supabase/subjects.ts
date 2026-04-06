import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

export type Level = Database['public']['Tables']['school_levels']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'] & {
  school_levels?: Level;
};

export const levelsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('school_levels')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data;
  },

  async create(level: Database['public']['Tables']['school_levels']['Insert']) {
    const { data, error } = await supabase
      .from('school_levels')
      .insert(level)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, levelData: Partial<Database['public']['Tables']['school_levels']['Update']>) {
    const { data, error } = await supabase
      .from('school_levels')
      .update(levelData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('school_levels')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const subjectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, school_levels(name)')
      .order('name');
    if (error) throw error;
    return data;
  },

  async create(subject: Database['public']['Tables']['subjects']['Insert']) {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, subjectData: Partial<Database['public']['Tables']['subjects']['Update']>) {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
