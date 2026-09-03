'use client';

import { useState } from 'react';
import { useFinancialAnalytics, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Filter, Search } from 'lucide-react';

export default function FinancePage() {
  const { selectedBranchId } = useUIStore();
  const [kindFilter, setKindFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: finance, isLoading } = useFinancialAnalytics(selectedBranchId, {
    kind: kindFilter,
    category: categoryFilter
  });

  const { data: branches = [] } = useBranches();

  const totals = finance?.totals || { totalIncome: 0, totalExpenses: 0, netRevenue: 0, advancesTotal: 0 };
  const transactions = finance?.transactions || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          المالية والتدفقات النقدية — Central Financial Ledger
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          سجل العمليات المالية الشامل لكافة الفروع (إيرادات، مصروفات تشغيلية، مصروفات نزلاء، سلف)
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي الإيرادات</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-400">
            {formatCurrency(totals.totalIncome)}
          </div>
        </div>

        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي المصروفات</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-rose-400">
            {formatCurrency(totals.totalExpenses)}
          </div>
        </div>

        <div className="mono-card p-5 border-zinc-700 bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">صافي الأرباح/الإيرادات</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totals.netRevenue)}
          </div>
        </div>

        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي السلف</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totals.advancesTotal)}
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="mono-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل العمليات (إيراد + مصروف)</option>
            <option value="إيراد" className="bg-zinc-900 text-white">إيرادات فقط</option>
            <option value="مصروف" className="bg-zinc-900 text-white">مصروفات فقط</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل التصنيفات</option>
            <option value="إيرادات إقامة" className="bg-zinc-900 text-white">إيرادات إقامة</option>
            <option value="أكل" className="bg-zinc-900 text-white">أكل</option>
            <option value="أدوية" className="bg-zinc-900 text-white">أدوية</option>
            <option value="مرافق" className="bg-zinc-900 text-white">مرافق</option>
            <option value="صيانة" className="bg-zinc-900 text-white">صيانة</option>
            <option value="مستلزمات" className="bg-zinc-900 text-white">مستلزمات</option>
            <option value="سلف" className="bg-zinc-900 text-white">سلف</option>
            <option value="أخرى" className="bg-zinc-900 text-white">أخرى</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">التاريخ</th>
                <th className="mono-table-th">نوع الحركة</th>
                <th className="mono-table-th">البيان / العنوان</th>
                <th className="mono-table-th">التصنيف</th>
                <th className="mono-table-th">الفرع</th>
                <th className="mono-table-th">المبلغ</th>
                <th className="mono-table-th">بواسطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">لا توجد معاملات مطابقة للفلتر</td>
                </tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td text-zinc-400">{formatDate(t.date)}</td>
                  <td className="mono-table-td">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      t.type === 'إيراد'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="mono-table-td font-bold text-white">{t.title}</td>
                  <td className="mono-table-td text-zinc-300 font-semibold">{t.category}</td>
                  <td className="mono-table-td text-zinc-300">{t.branchName}</td>
                  <td className={`mono-table-td font-black ${
                    t.type === 'إيراد' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.type === 'إيراد' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="mono-table-td text-zinc-400">{t.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
