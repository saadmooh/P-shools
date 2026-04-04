import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, ArrowLeft, Filter, DollarSign, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import { invoicesService } from '../../../services/supabase/billing';
import { useTelegram } from '../../../hooks/useTelegram';

const InvoicesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin_invoices'],
    queryFn: invoicesService.getAll
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      invoicesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_invoices'] });
      hapticFeedback('medium');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout title="Billing & Invoices">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2">
            {['all', 'draft', 'sent', 'paid', 'overdue'].map(f => (
              <Button 
                key={f}
                size="sm" 
                variant={filter === f ? 'primary' : 'secondary'}
                className="capitalize whitespace-nowrap px-3 h-8"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading invoices...</div>
        ) : (
          invoices?.filter(inv => filter === 'all' || inv.status === filter).map((invoice: any) => (
            <Card key={invoice.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--tg-theme-secondary-bg-color)]">
                    <FileText size={20} className="text-[var(--tg-theme-hint-color)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">#{invoice.invoice_number}</h4>
                    <p className="text-[10px] text-[var(--tg-theme-hint-color)]">
                      {invoice.guardians?.full_name || invoice.users?.full_name}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-bold text-sm">{invoice.total_amount} SAR</p>
                  <div className="flex gap-1">
                    {invoice.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 h-7 w-7"
                        onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'sent' })}
                      >
                        <Send size={14} />
                      </Button>
                    )}
                    {invoice.status === 'sent' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 h-7 w-7 text-green-600"
                        onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'paid' })}
                      >
                        <DollarSign size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {invoices?.length === 0 && (
        <div className="text-center py-12 text-[var(--tg-theme-hint-color)]">
          No invoices found.
        </div>
      )}
    </Layout>
  );
};

export default InvoicesManagement;
