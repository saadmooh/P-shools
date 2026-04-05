import React from 'react';
import { FileText, Download, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Layout from '../../shared/Layout';

const GuardianDocuments: React.FC = () => {
  const { user } = useAuthStore();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['guardian-invoices', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          status,
          due_date,
          created_at
        `)
        .eq('guardian_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return (
    <Layout title="My Documents">
      <div className="flex justify-center p-8">Loading documents...</div>
    </Layout>
  );

  return (
    <Layout title="My Documents">
      <div className="space-y-4">
        {invoices?.map(invoice => {
          const title = `Invoice ${invoice.invoice_number}`;
          const type = 'PDF';
          const size = `${(invoice.total_amount / 1000).toFixed(1)} KB`; // Approximate

          return (
            <div key={invoice.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {title}
                  <span className={`px-2 py-1 text-xs rounded ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </h3>
                <p className="text-sm text-gray-600">{type} • {size} • Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
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

export default GuardianDocuments;