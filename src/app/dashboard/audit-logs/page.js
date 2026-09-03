'use client';

import { useState } from 'react';
import { useAuditLogs, useBranches, useUsers } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';

export default function AuditLogsPage() {
  const { selectedBranchId } = useUIStore();

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [userFilter, setUserFilter] = useState('all');

  const { data: logs = [], isLoading } = useAuditLogs({
    search,
    branchId: branchFilter,
    userId: userFilter
  });

  const { data: branches = [] } = useBranches();
  const { data: users = [] } = useUsers();

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" />
          سجل نشاط المنظومة والتدقيق — Centralized Audit Log
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          تتبع وتسجيل جميع العمليات الحساسة المنفذة بكافة الفروع ومن كافة المستخدمين
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mono-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث في العمليات أو العناصر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input pr-9"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3.5" />
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

        <div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل المستخدمين المنفذين</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="bg-zinc-900 text-white">
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">التاريخ والوقت</th>
                <th className="mono-table-th">المستخدم المنفذ</th>
                <th className="mono-table-th">الصلاحية</th>
                <th className="mono-table-th">نوع العملية</th>
                <th className="mono-table-th">العنصر / البيان</th>
                <th className="mono-table-th">الفرع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">لا توجد عمليات مسجلة بالسجل</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-mono dir-ltr text-zinc-400 text-left">{log.date}</td>
                  <td className="mono-table-td font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      {log.userName}
                    </span>
                  </td>
                  <td className="mono-table-td">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="mono-table-td font-bold text-emerald-400">{log.action}</td>
                  <td className="mono-table-td text-zinc-200">{log.item}</td>
                  <td className="mono-table-td text-zinc-300 font-semibold">{log.branchName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
