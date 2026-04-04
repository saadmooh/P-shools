import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../shared/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, AlertTriangle, FileText, CreditCard, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../stores/authStore';
import { supabase } from '../../../lib/supabase';
import { invoicesService } from '../../../services/supabase/billing';

const GuardianDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: guardianData } = useQuery({
    queryKey: ['guardian_profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      return data;
    }
  });

  const { data: children } = useQuery({
    queryKey: ['guardian_children', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('guardian_id', user?.id);
      return data;
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ['guardian_invoices', user?.id],
    queryFn: () => invoicesService.getByPayer(user!.id, 'guardian')
  });

  return (
    <Layout title={t('dashboards.guardian_title')}>
      <Card className="mb-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-emerald-100 text-sm">Account Balance</p>
              <h2 className="text-3xl font-bold">{guardianData?.balance || '0.00'} SAR</h2>
              <p className="text-emerald-100 text-xs mt-1">Status: {guardianData?.balance && guardianData.balance < 0 ? 'Overdue' : 'Good Standing'}</p>
            </div>
            <CreditCard size={40} className="text-white opacity-40" />
          </div>
          <Button variant="secondary" className="w-full bg-white text-emerald-600 border-none font-bold py-4">
            Pay Now
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">My Children</h3>
          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
        </div>
        {children?.map((child, i) => (
          <Card key={child.id} className="active:scale-[0.98] transition-transform cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  {child.full_name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{child.full_name}</h4>
                  <p className="text-xs text-[var(--tg-theme-hint-color)]">Student ID: {child.id.slice(0,8)}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--tg-theme-hint-color)]" />
            </CardContent>
          </Card>
        ))}
        {children?.length === 0 && <p className="text-center py-4 text-sm text-[var(--tg-theme-hint-color)]">No students linked to your account.</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Recent Invoices</h3>
        {invoices?.slice(0, 3).map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[var(--tg-theme-hint-color)]" />
                <div>
                  <p className="text-sm font-semibold">#{invoice.invoice_number}</p>
                  <p className="text-[10px] text-[var(--tg-theme-hint-color)]">{invoice.due_date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{invoice.total_amount} SAR</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default GuardianDashboard;
