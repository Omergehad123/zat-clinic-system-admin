'use client';

import { useState } from 'react';
import { useAdvances, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';
import { Wallet, Search, Filter, MapPin } from 'lucide-react';

export default function AdvancesPage() {
  const { selectedBranchId } = useUIStore();
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data: advancesData, isLoading } = useAdvances(branchFilter, search, roleFilter);
  const { data: branches = [] } = useBranches();

  const advances = advancesData?.advances || [];
  const totals = advancesData?.totals || { today: 0, month: 0, total: 0 };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          إدارة السلف والخصومات — Employee Advances
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          متابعة السلف المسجلة للموظفين وإجمالي السحب المالي اليومي والشهري
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">سلف اليوم</span>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totals.today)}
          </div>
        </div>

        <div className="mono-card p-5 border-zinc-700 bg-zinc-900">
          <span className="text-xs font-semibold text-zinc-300">سلف هذا الشهر المجمعة</span>
          <div className="mt-3 text-2xl font-black text-emerald-400">
            {formatCurrency(totals.month)}
          </div>
        </div>

        <div className="mono-card p-5">
          <span className="text-xs font-semibold text-zinc-400">عدد عمليات السلف</span>
          <div className="mt-3 text-2xl font-black text-white">
            {formatNumber(advances.length)} عملية
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mono-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث باسم الموظف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input pr-9"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3.5" />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="mono-input"
          >
            <option value="ALL" className="bg-zinc-900 text-white">كل الوظائف</option>
            <option value="دكتور" className="bg-zinc-900 text-white">أطباء</option>
            <option value="تمريض" className="bg-zinc-900 text-white">تمريض</option>
            <option value="مشرف" className="bg-zinc-900 text-white">مشرفين</option>
            <option value="عامل" className="bg-zinc-900 text-white">عمال وسائقين</option>
          </select>
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advances Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">التاريخ</th>
                <th className="mono-table-th">اسم الموظف</th>
                <th className="mono-table-th">الوظيفة</th>
                <th className="mono-table-th">الفرع</th>
                <th className="mono-table-th">مبلغ السلفة</th>
                <th className="mono-table-th">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : advances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">لا توجد سلف مسجلة</td>
                </tr>
              ) : advances.map(adv => (
                <tr key={adv.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td text-zinc-400">{formatDate(adv.date)}</td>
                  <td className="mono-table-td font-bold text-white">{adv.employeeName}</td>
                  <td className="mono-table-td text-zinc-300">{adv.employeeType}</td>
                  <td className="mono-table-td text-zinc-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {adv.branchName}
                    </span>
                  </td>
                  <td className="mono-table-td text-emerald-400 font-bold">{formatCurrency(adv.amount)}</td>
                  <td className="mono-table-td text-zinc-400">{adv.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
