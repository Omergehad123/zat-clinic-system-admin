'use client';

import { useState } from 'react';
import { usePatients, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Users, Search, Filter, MapPin } from 'lucide-react';

export default function PatientsPage() {
  const { selectedBranchId } = useUIStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');

  const { data: patients = [], isLoading } = usePatients(branchFilter, search, statusFilter);
  const { data: branches = [] } = useBranches();

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          إدارة النزلاء — Multi-Branch Patients Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          عرض وقوائم جميع النزلاء بكافة الفروع وحالات الإقامة والمستحقات المتبقية
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mono-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث باسم النزيل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input pr-9"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3.5" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mono-input"
          >
            <option value="ALL" className="bg-zinc-900 text-white">كل الحالات (حالي / جديد / خرج)</option>
            <option value="حالي" className="bg-zinc-900 text-white">حالي</option>
            <option value="جديد" className="bg-zinc-900 text-white">جديد</option>
            <option value="خرج" className="bg-zinc-900 text-white">خرج</option>
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

      {/* Patients Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">اسم النزيل</th>
                <th className="mono-table-th">الفرع</th>
                <th className="mono-table-th">تاريخ الدخول</th>
                <th className="mono-table-th">قيمة الإقامة</th>
                <th className="mono-table-th">المسدد</th>
                <th className="mono-table-th">المتبقي</th>
                <th className="mono-table-th">صافي الإيرادات</th>
                <th className="mono-table-th">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">لا يوجد نزلاء مطبقين للبحث</td>
                </tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-bold text-white">{p.name}</td>
                  <td className="mono-table-td text-zinc-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {p.branchName}
                    </span>
                  </td>
                  <td className="mono-table-td text-zinc-400">{formatDate(p.entryDate)}</td>
                  <td className="mono-table-td font-semibold text-white">{formatCurrency(p.stayValue)}</td>
                  <td className="mono-table-td text-emerald-400 font-semibold">{formatCurrency(p.paid)}</td>
                  <td className="mono-table-td text-rose-400 font-semibold">{formatCurrency(p.remaining)}</td>
                  <td className={`mono-table-td font-bold font-mono ${
                    (p.netRevenue ?? ((p.stayValue || 0) - (p.expensesTotal || 0))) >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}>
                    <div>{formatCurrency(p.netRevenue ?? ((p.stayValue || 0) - (p.expensesTotal || 0)))}</div>
                    {(p.expensesTotal > 0) && (
                      <div className="text-[10px] text-zinc-500 font-normal">مصاريف: {formatCurrency(p.expensesTotal)}</div>
                    )}
                  </td>
                  <td className="mono-table-td">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      p.status === 'حالي' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'جديد' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {p.status}
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
