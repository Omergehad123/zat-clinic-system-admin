'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBranchDetails, usePatients, useFinancialAnalytics, useEmployees } from '../../../../hooks/useDashboardQueries';
import { formatCurrency, formatNumber } from '../../../../utils/formatters';
import { GitFork, MapPin, Phone, Users, UserCheck, TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.id;

  const { data: branch, isLoading: loadingBranch } = useBranchDetails(branchId);
  const { data: patients = [] } = usePatients(branchId);
  const { data: finance } = useFinancialAnalytics(branchId);
  const { data: employees = [] } = useEmployees(branchId);

  if (loadingBranch) {
    return <div className="py-12 text-center text-zinc-500">جاري تحميل بيانات الفرع...</div>;
  }

  if (!branch) {
    return <div className="py-12 text-center text-rose-400">الفرع المطلوب غير موجود</div>;
  }

  const currentPatientsCount = patients.filter(p => p.status === 'حالي' || p.status === 'جديد').length;
  const totalRevenue = finance?.totals?.totalIncome || 0;
  const totalExpenses = finance?.totals?.totalExpenses || 0;
  const netRevenue = finance?.totals?.netRevenue || 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back button & Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/dashboard/branches')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الفروع
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">{branch.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg">
                {branch.code}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                {branch.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {branch.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                {branch.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid for Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">النزلاء الحاليون</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{formatNumber(currentPatientsCount)}</span>
            <Users className="w-5 h-5 text-zinc-500" />
          </div>
        </div>

        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">عدد الموظفين</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{formatNumber(employees.length)}</span>
            <UserCheck className="w-5 h-5 text-zinc-500" />
          </div>
        </div>

        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">إجمالي الإيرادات</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">صافي الإيرادات</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">{formatCurrency(netRevenue)}</span>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Staff list preview */}
      <div className="mono-card p-6 space-y-4">
        <h2 className="text-base font-bold text-white">طاقم العمل بالفرع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {employees.map(emp => (
            <div key={emp.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-1">
              <div className="font-bold text-white">{emp.name}</div>
              <div className="text-zinc-400 flex items-center justify-between">
                <span>{emp.type}</span>
                <span className="text-zinc-500">{emp.specialization}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
