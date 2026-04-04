import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/Layout';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';

const MyPayroll: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: payrolls, isLoading } = useQuery({
    queryKey: ['teacher_payrolls', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_payrolls')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('period_start', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <Layout title="My Earnings">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-lg font-bold">Payroll History</h2>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading payrolls...</div>
        ) : (
          payrolls?.map((payroll) => (
            <Card key={payroll.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-[var(--tg-theme-hint-color)]">Period</p>
                    <p className="font-bold text-sm">
                      {new Date(payroll.period_start).toLocaleDateString()} - {new Date(payroll.period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    payroll.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {payroll.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[var(--tg-theme-secondary-bg-color)] p-3 rounded-lg mb-3">
                  <div>
                    <p className="text-[10px] text-[var(--tg-theme-hint-color)]">Total Hours</p>
                    <p className="font-bold">{payroll.total_hours}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--tg-theme-hint-color)]">Net Amount</p>
                    <p className="font-bold text-[var(--tg-theme-button-color)]">{payroll.net_amount} SAR</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                  <Download size={14} className="mr-1" /> Download Statement (PDF)
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {payrolls?.length === 0 && (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-[var(--tg-theme-hint-color)] mb-2 opacity-20" />
            <p className="text-[var(--tg-theme-hint-color)]">No payroll records yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPayroll;
