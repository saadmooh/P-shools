
import { supabase } from '../../lib/supabase';

export const studentsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*, guardians(full_name)')
      .order('full_name');
    if (error) throw error;
    return data;
  },
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*, guardians(full_name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (studentData: any) => {
    // Assuming studentData contains at least full_name, guardian_id (optional)
    // and potentially other fields like phone, email
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, studentData: any) => {
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  // Potentially add a method to link/unlink guardians if needed separately
};
