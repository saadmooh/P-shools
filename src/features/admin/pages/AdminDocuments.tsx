import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const AdminDocuments: React.FC = () => {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          status,
          due_date,
          created_at,
          payer_type,
          guardians (full_name),
          users (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  if (isLoading) return (
    <Layout title="Admin Documents">
      <div className="flex justify-center p-8">Loading documents...</div>
    </Layout>
  );

  return (
    <Layout title="Admin Documents">
      <div className="space-y-4">
        {invoices?.map(invoice => {
          const payerName = invoice.payer_type === 'student' ? invoice.guardians?.full_name : invoice.users?.full_name;
          const title = `Invoice ${invoice.invoice_number}`;
          const type = 'PDF';
          const size = `${(invoice.total_amount / 1000).toFixed(1)} KB`; // Approximate

          return (
            <div key={invoice.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{type} • {size} • {payerName}</p>
                <p className="text-sm text-green-600 font-medium">${invoice.total_amount}</p>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Download className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {(!invoices || invoices.length === 0) && (
          <p className="text-gray-500 text-center py-8">No documents available</p>
        )}
      </div>
    </Layout>
  );
};

export default AdminDocuments;