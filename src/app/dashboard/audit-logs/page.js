'use client';

import { useState } from 'react';
import { useAuditLogs, useBranches, useUsers } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { History, Search, ShieldCheck, User, Clock, Tag } from 'lucide-react';

// Color-code audit action types
const getActionBadge = (actionCode) => {
  if (!actionCode) return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  const code = actionCode.toUpperCase();
  if (code.startsWith('CREATE') || code.startsWith('ADD')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (code.startsWith('UPDATE') || code.startsWith('TOGGLE') || code.startsWith('RESET')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (code.startsWith('DELETE') || code.startsWith('DISCHARGE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  if (code === 'LOGIN') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  return 'bg-zinc-800 text-zinc-300 border-zinc-700';
};

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

  // Filter logs by search term client-side (action or item)
  const filteredLogs = search.trim()
    ? logs.filter(log =>
        (log.action || '').includes(search.trim()) ||
        (log.item || '').includes(search.trim()) ||
        (log.userName || '').includes(search.trim())
      )
    : logs;

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
            placeholder="بحث في العمليات أو العناصر أو المستخدمين..."
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

      {/* Stats bar */}
      {!isLoading && filteredLogs.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-zinc-400 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            إجمالي السجلات: <strong className="text-white mr-1">{filteredLogs.length}</strong>
          </span>
        </div>
      )}

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
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">لا توجد عمليات مسجلة بالسجل</td>
                </tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-mono text-zinc-400 text-left dir-ltr whitespace-nowrap">
                    {log.date || '-'}
                  </td>
                  <td className="mono-table-td font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {log.userName}
                    </span>
                  </td>
                  <td className="mono-table-td">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="mono-table-td">
                    <span className={`px-2 py-0.5 text-[11px] font-bold border rounded-md ${getActionBadge(log.actionCode)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="mono-table-td text-zinc-200 max-w-[200px]">
                    {log.item && log.item !== '-' ? (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate" title={log.item}>{log.item}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="mono-table-td text-zinc-300 font-semibold">{log.branchName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
