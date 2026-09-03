'use client';

import { useState } from 'react';
import { useEmployees, useEmployeeAnalytics, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import { UserCheck, Stethoscope, HeartPulse, ShieldAlert, Wrench, Wallet, MapPin, Filter } from 'lucide-react';

export default function EmployeesPage() {
  const { selectedBranchId } = useUIStore();
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const { data: employees = [], isLoading } = useEmployees(branchFilter, typeFilter);
  const { data: analytics } = useEmployeeAnalytics(branchFilter);
  const { data: branches = [] } = useBranches();

  const counts = analytics?.roleDistribution || { doctors: 0, nurses: 0, supervisors: 0, workers: 0 };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-emerald-400" />
          إدارة الموظفين والكوادر الطبية — Employee Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          إحصائيات الكوادر (أطباء، تمريض، مشرفين، عمال) وإحصائيات السلف بالمنظومة
        </p>
      </div>

      {/* Role Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="mono-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي الأطباء</span>
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-xl font-black text-white">
            {formatNumber(counts.doctors)} دكتور
          </div>
        </div>

        <div className="mono-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">تمريض</span>
            <HeartPulse className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 text-xl font-black text-white">
            {formatNumber(counts.nurses)} ممرض
          </div>
        </div>

        <div className="mono-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">مشرفين</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-xl font-black text-white">
            {formatNumber(counts.supervisors)} مشرف
          </div>
        </div>

        <div className="mono-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">عمال وسائقين</span>
            <Wrench className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3 text-xl font-black text-white">
            {formatNumber(counts.workers)} عامل
          </div>
        </div>

        <div className="mono-card p-4 border-zinc-700 bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">إجمالي الموظفين</span>
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3 text-lg font-black text-white">
            {formatNumber(analytics?.total || employees.length)} موظف
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="mono-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-zinc-800 pb-3 sm:pb-0">
          {['ALL', 'دكتور', 'تمريض', 'مشرف', 'عامل'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === t 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {t === 'ALL' ? 'كل الوظائف' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-emerald-400" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="mono-input text-xs w-48"
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

      {/* Employees Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">اسم الموظف</th>
                <th className="mono-table-th">الوظيفة</th>
                <th className="mono-table-th">التخصص</th>
                <th className="mono-table-th">الفرع</th>
                <th className="mono-table-th">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">لا يوجد موظفين مطبقين للبحث</td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-bold text-white">{emp.name}</td>
                  <td className="mono-table-td font-semibold text-zinc-300">{emp.type || emp.role}</td>
                  <td className="mono-table-td text-zinc-400">{emp.specialization || '-'}</td>
                  <td className="mono-table-td text-zinc-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {emp.branchName || 'غير محدد'}
                    </span>
                  </td>
                  <td className="mono-table-td">
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
