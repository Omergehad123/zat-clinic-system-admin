'use client';

import { useState } from 'react';
import { useEmployees, useAttendance, useBranches, useDeleteAttendance } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { getArabicMonthName, formatDate } from '../../../utils/formatters';
import { CalendarCheck, MapPin, Filter, ChevronDown, ChevronUp, Trash2, AlertTriangle, X } from 'lucide-react';
import { attendanceService } from '../../../services/attendance.service';
import { useQueryClient } from '@tanstack/react-query';

// Mini delete confirm modal for attendance records
function DeleteAttendanceConfirm({ record, onClose }) {
  const deleteMutation = useDeleteAttendance();
  const { showToast } = useUIStore();
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    try {
      await deleteMutation.mutateAsync(record.id || record._id);
      showToast('تم حذف سجل الحضور بنجاح');
      onClose();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-sm p-5 space-y-4 shadow-2xl text-right dir-rtl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white">حذف سجل الحضور</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-0.5">
            <p className="font-semibold text-rose-300">تأكيد حذف سجل الحضور</p>
            <p>الموظف: <span className="text-white font-bold">{record.employeeName}</span></p>
            <p>التاريخ: <span className="text-white">{formatDate(record.date)}</span></p>
            <p>الحالة: <span className="text-amber-400 font-bold">{record.status}</span></p>
          </div>
        </div>
        {error && <div className="p-2 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl text-center">{error}</div>}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={onClose} className="mono-btn-secondary text-xs">إلغاء</button>
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
            <Trash2 className="w-3 h-3" />
            {deleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const { selectedBranchId } = useUIStore();
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);
  const [expandedEmp, setExpandedEmp] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);

  const { data: employees = [], isLoading: loadingEmployees } = useEmployees(branchFilter);
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useAttendance(branchFilter, month, year);
  const { data: branches = [] } = useBranches();

  // Aggregate attendance count by employeeId
  const attendanceMap = {};
  const attendanceByEmp = {};
  attendanceRecords.forEach(rec => {
    const empId = rec.employeeId;
    if (!empId) return;
    if (!attendanceMap[empId]) {
      attendanceMap[empId] = { present: 0, leave: 0, absent: 0 };
      attendanceByEmp[empId] = [];
    }
    if (rec.status === 'present' || rec.status === 'حاضر') attendanceMap[empId].present += 1;
    else if (rec.status === 'leave' || rec.status === 'إجازة') attendanceMap[empId].leave += 1;
    else if (rec.status === 'absent' || rec.status === 'غائب') attendanceMap[empId].absent += 1;
    attendanceByEmp[empId].push(rec);
  });

  const isLoading = loadingEmployees || loadingAttendance;

  const statusLabel = (s) => {
    if (s === 'present' || s === 'حاضر') return { label: 'حاضر', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (s === 'leave' || s === 'إجازة') return { label: 'إجازة', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if (s === 'absent' || s === 'غائب') return { label: 'غائب', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    return { label: s, cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  };

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
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="mono-input text-xs w-full">
              <option value="all" className="bg-zinc-900 text-white">كل الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">الشهر</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="mono-input text-xs w-full">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getArabicMonthName(m)} ({m})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">السنة</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="mono-input text-xs w-full">
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
                <th className="mono-table-th text-center">السجلات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">لا يوجد موظفين مسجلين بالفرع المفضل</td>
                </tr>
              ) : employees.map(emp => {
                const stats = attendanceMap[emp.id] || { present: 0, leave: 0, absent: 0 };
                const records = attendanceByEmp[emp.id] || [];
                const isExpanded = expandedEmp === emp.id;

                return (
                  <>
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
                      <td className="mono-table-td text-center">
                        {records.length > 0 && (
                          <button
                            onClick={() => setExpandedEmp(isExpanded ? null : emp.id)}
                            className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg flex items-center gap-1 transition-colors mx-auto"
                          >
                            <span>{records.length} سجل</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                        {records.length === 0 && <span className="text-zinc-600 text-xs">-</span>}
                      </td>
                    </tr>
                    {isExpanded && records.length > 0 && (
                      <tr key={`${emp.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <div className="bg-zinc-950/80 border-t border-zinc-800 px-6 py-3 space-y-1.5">
                            <p className="text-[11px] font-bold text-zinc-400 mb-2">سجلات الحضور التفصيلية — {emp.name}:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {records.sort((a, b) => new Date(a.date) - new Date(b.date)).map(rec => {
                                const s = statusLabel(rec.status);
                                return (
                                  <div key={rec.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400 text-xs font-mono">{formatDate(rec.date)}</span>
                                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${s.cls}`}>{s.label}</span>
                                    </div>
                                    <button
                                      onClick={() => setDeletingRecord(rec)}
                                      className="p-1 text-rose-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                                      title="حذف هذا السجل"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deletingRecord && (
        <DeleteAttendanceConfirm
          record={deletingRecord}
          onClose={() => setDeletingRecord(null)}
        />
      )}
    </div>
  );
}
