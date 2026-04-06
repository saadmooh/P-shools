import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, ArrowLeft, Filter, DollarSign, Send, Plus, X, ShieldX, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from "../../../components/ui/Select";
import { invoicesService, Invoice } from '../../../services/supabase/billing';
import { useTelegram } from '../../../hooks/useTelegram';
import { useAuthPermissions } from '../../../stores/authStore';
import { PERMISSIONS } from '../../../lib/permissions';

const InvoicesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuthPermissions();
  
  const [filter, setFilter] = useState('all');
  
  // State for Modals and Forms
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false); // For potential future edit functionality
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false); // For potential future delete functionality
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    payer_type: 'guardian' as 'guardian' | 'independent', // Default payer type
    guardian_id: '', // To be populated from guardian lookup
    independent_user_id: '', // To be populated from user lookup
    invoice_number: '',
    total_amount: 0,
    due_date: '',
    status: 'draft' as Invoice['status'],
    // Add fields for items if needed, e.g., an array of { description, quantity, price }
  });
  const [canManageBilling, setCanManageBilling] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await hasPermission(PERMISSIONS.BILLING_MANAGE) || isAdmin();
      setCanManageBilling(hasAccess);
    };
    checkPermissions();
  }, [hasPermission, isAdmin]);

  // Show access denied if user doesn't have permission
  if (!canManageBilling) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <ShieldX size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
          <p className="text-zinc-600 mb-6 max-w-md">
            You don't have permission to manage billing and invoices.
            Contact your administrator if you need access.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['admin_invoices', filter],
    queryFn: () => invoicesService.getAll(),
    enabled: canManageBilling // Only fetch if user has permission
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>) => invoicesService.create(data as any), // Casting to 'any' as type might not perfectly match Insert
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_invoices'] });
      setIsAddingInvoice(false);
      setInvoiceFormData({ payer_type: 'guardian', guardian_id: '', independent_user_id: '', invoice_number: '', total_amount: 0, due_date: '', status: 'draft' });
      hapticFeedback('light');
    },
    onError: (error: any) => {
      console.error("Failed to create invoice:", error);
      alert(`Failed to create invoice: ${error.message}`);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Invoice['status'] }) => 
      invoicesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_invoices'] });
      hapticFeedback('medium');
    },
    onError: (error: any) => {
      console.error("Failed to update invoice status:", error);
      alert(`Failed to update status: ${error.message}`);
    }
  });

  const { data: guardians } = useQuery({
    queryKey: ['guardians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('guardians').select('id, full_name').order('full_name');
      if (error) throw error;
      return data;
    }
  });

  const { data: independentUsers } = useQuery({
    queryKey: ['independent-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('id, full_name').order('full_name');
      if (error) throw error;
      return data;
    }
  });

  const handleSaveInvoice = () => {
    if (!invoiceFormData.invoice_number || !invoiceFormData.total_amount || !invoiceFormData.due_date) {
      alert("Invoice number, total amount, and due date are required.");
      return;
    }
    const payerId = invoiceFormData.payer_type === 'guardian' ? invoiceFormData.guardian_id : invoiceFormData.independent_user_id;
    if (!payerId) {
      alert("Please select a payer.");
      return;
    }

    const invoiceData = {
      ...invoiceFormData,
      [invoiceFormData.payer_type === 'guardian' ? 'guardian_id' : 'independent_user_id']: payerId,
      total_amount: parseFloat(invoiceFormData.total_amount as any),
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const handleCancel = () => {
    setIsAddingInvoice(false);
    setIsEditingInvoice(false); // Reset if implemented
    setIsDeletingInvoice(false); // Reset if implemented
    setSelectedInvoice(null);
    setInvoiceFormData({ payer_type: 'guardian', guardian_id: '', independent_user_id: '', invoice_number: '', total_amount: 0, due_date: '', status: 'draft' });
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout title="Billing & Invoices">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} /> Back
        </Button>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2">
            {['all', 'draft', 'sent', 'paid', 'overdue'].map(f => (
              <Button 
                key={f}
                size="sm" 
                variant={filter === f ? 'primary' : 'secondary'}
                className="capitalize whitespace-nowrap px-3 h-8"
                onClick={() => setFilter(f as Invoice['status'] | 'all')}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        {canManageBilling && ( // Only show Add button if user can manage billing
          <Button size="sm" onClick={() => setIsAddingInvoice(true)}>
            <Plus size={18} className="mr-1" /> Add Invoice
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading invoices...</div>
        ) : invoices?.filter(inv => filter === 'all' || inv.status === filter).length === 0 ? (
           <div className="text-center py-12 text-[var(--tg-theme-hint-color)]">
              No invoices found for the selected filter.
            </div>
        ) : (
          invoices?.filter(inv => filter === 'all' || inv.status === filter).map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--tg-theme-secondary-bg-color)]">
                    <FileText size={20} className="text-[var(--tg-theme-hint-color)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">#{invoice.invoice_number}</h4>
                    <p className="text-[10px] text-[var(--tg-theme-hint-color)]">
                      {invoice.guardians?.full_name || invoice.users?.full_name || 'N/A'}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-bold text-sm">{invoice.total_amount?.toFixed(2) ?? '0.00'} SAR</p>
                  <div className="flex gap-1">
                    {/* Actions based on status and permissions */}
                    {canManageBilling && invoice.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 h-7 w-7"
                        onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'sent' })}
                      >
                        <Send size={14} />
                      </Button>
                    )}
                    {canManageBilling && invoice.status === 'sent' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 h-7 w-7 text-green-600"
                        onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'paid' })}
                      >
                        <DollarSign size={14} />
                      </Button>
                    )}
                    {/* Add Edit/Delete actions here if needed and permissioned */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Invoice Modal */}
      {isAddingInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Add New Invoice</h3>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleCancel}>
                  <X size={20} />
                </Button>
              </div>
              <div className="space-y-4">
                <Select
                  label="Payer Type"
                  value={invoiceFormData.payer_type}
                  onChange={(e) => {
                    const value = e.target.value as 'guardian' | 'independent';
                    setInvoiceFormData({...invoiceFormData, payer_type: value, guardian_id: '', independent_user_id: ''}); // Reset IDs when type changes
                  }}
                >
                  <option value="guardian">Guardian</option>
                  <option value="independent">Independent User</option>
                </Select>

                {invoiceFormData.payer_type === 'guardian' ? (
                  <Select
                    label="Guardian"
                    value={invoiceFormData.guardian_id}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, guardian_id: e.target.value})}
                  >
                    <option value="">Select Guardian</option>
                    {guardians?.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
                  </Select>
                ) : (
                  <Select
                    label="User"
                    value={invoiceFormData.independent_user_id}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, independent_user_id: e.target.value})}
                  >
                    <option value="">Select User</option>
                    {independentUsers?.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </Select>
                )}

                <Input
                  label="Invoice Number"
                  placeholder="e.g. INV-0001"
                  value={invoiceFormData.invoice_number}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, invoice_number: e.target.value})}
                />
                <Input
                  label="Total Amount (SAR)"
                  type="number"
                  placeholder="e.g. 150.00"
                  value={invoiceFormData.total_amount}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, total_amount: parseFloat(e.target.value) || 0})}
                />
                 <Input
                  label="Due Date"
                  type="date"
                  value={invoiceFormData.due_date}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, due_date: e.target.value})}
                />
                {/* TODO: Add fields for invoice items if needed */}

                <Button onClick={handleSaveInvoice} loading={createInvoiceMutation.isPending} className="w-full">
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default InvoicesManagement;
