import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

export type Invoice = Database['public']['Tables']['invoices']['Row'];

export const invoicesService = {
  async getByPayer(id: string, type: 'guardian' | 'independent') {
    const column = type === 'guardian' ? 'guardian_id' : 'independent_user_id';
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq(column, id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, guardians(full_name), users(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(invoiceData: Database['public']['Tables']['invoices']['Insert']) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, invoiceData: Partial<Database['public']['Tables']['invoices']['Update']>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: Invoice['status']) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const paymentsService = {
  async recordPayment(payment: any) {
    // 1. Insert payment record
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    if (error) throw error;

    // 2. Update guardian balance if applicable
    if (payment.guardian_id) {
      const { data: guardian } = await supabase
        .from('guardians')
        .select('balance')
        .eq('user_id', payment.guardian_id)
        .single();
      
      const newBalance = (guardian?.balance || 0) + payment.amount;
      
      await supabase
        .from('guardians')
        .update({ balance: newBalance })
        .eq('user_id', payment.guardian_id);
    }

    return data;
  }
};
