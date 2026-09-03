'use client';

import { useState } from 'react';
import { useEmployees, useAttendance, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { getArabicMonthName } from '../../../utils/formatters';
import { CalendarCheck, MapPin, Filter } from 'lucide-react';

export default function AttendancePage() {
  const { selectedBranchId } = useUIStore();
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);

  const { data: employees = [], isLoading: loadingEmployees } = useEmployees(branchFilter);
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAttendance(branchFilter, month, year);
  const { data: branches = [] } = useBranches();

  // Aggregate attendance count by employeeId
  const attendanceMap = {};
  attendanceRecords.forEach(rec => {
    const empId = rec.employeeId;
    if (!empId) return;
    if (!attendanceMap[empId]) {
      attendanceMap[empId] = { present: 0, leave: 0, absent: 0 };
    }
    if (rec.status === 'present' || rec.status === 'حاضر') attendanceMap[empId].present += 1;
    else if (rec.status === 'leave' || rec.status === 'إجازة') attendanceMap[empId].leave += 1;
    else if (rec.status === 'absent' || rec.status === 'غائب') attendanceMap[empId].absent += 1;
  });

  const isLoading = loadingEmployees || loadingAttendance;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-emerald-400" />
          سجل الحضور والغياب للموظفين — Attendance Monitoring
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          متابعة حضور وانصراف وغياب الكوادر الطبية والموظفين لشهر {getArabicMonthName(month)} {year}
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mono-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-zinc-800 pb-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>تصفية الحضور:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">الفرع</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="mono-input text-xs w-full"
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
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">الشهر</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mono-input text-xs w-full"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getArabicMonthName(m)} ({m})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">السنة</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mono-input text-xs w-full"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">الموظف</th>
                <th className="mono-table-th">الوظيفة</th>
                <th className="mono-table-th">الفرع</th>
                <th className="mono-table-th text-center">أيام الحضور</th>
                <th className="mono-table-th text-center">أيام الإجازة</th>
                <th className="mono-table-th text-center">أيام الغياب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">لا يوجد موظفين مسجلين بالفرع المفضل</td>
                </tr>
              ) : employees.map(emp => {
                const stats = attendanceMap[emp.id] || { present: 0, leave: 0, absent: 0 };
                return (
                  <tr key={emp.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="mono-table-td font-bold text-white">{emp.name}</td>
                    <td className="mono-table-td text-zinc-300">{emp.type || emp.role}</td>
                    <td className="mono-table-td text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {emp.branchName || 'غير محدد'}
                      </span>
                    </td>
                    <td className="mono-table-td text-center text-emerald-400 font-bold">{stats.present} يوم</td>
                    <td className="mono-table-td text-center text-blue-400 font-bold">{stats.leave} أيام</td>
                    <td className="mono-table-td text-center text-rose-400 font-bold">{stats.absent} يوم</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
