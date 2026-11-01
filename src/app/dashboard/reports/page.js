'use client';

import { useState } from 'react';
import { useMonthlyReport, useOutstandingPayments, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate, getArabicMonthName } from '../../../utils/formatters';
import { exportStyledExcel } from '../../../utils/excelExporter';
import { exportComprehensiveClinicExcel } from '../../../utils/clinicFullExcelExporter';
import { BarChart3, Download, Calendar, DollarSign, AlertCircle, FileSpreadsheet, Filter, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { selectedBranchId } = useUIStore();
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' | 'outstanding'
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);

  const { data: monthlyData, isLoading: loadingMonthly } = useMonthlyReport(branchFilter, month, year);
  const { data: outstandingData, isLoading: loadingOutstanding } = useOutstandingPayments(branchFilter);
  const { data: branches = [] } = useBranches();

  const [isExporting, setIsExporting] = useState(false);

  // Excel Export Handler
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      if (activeTab === 'monthly') {
        const curBranch = branches.find(b => (b.id || b._id) === branchFilter) || { name: 'كافة الفروع' };
        await exportComprehensiveClinicExcel({
          month,
          year,
          branch: curBranch,
          existingReport: monthlyData
        });
      } else {
        const rows = (outstandingData?.list || []).map(p => ({
          patientName: p.patientName,
          branchName: p.branchName,
          entryDate: p.entryDate,
          stayValue: p.stayValue || 0,
          paid: p.paid || 0,
          remaining: p.remaining || 0,
          notes: p.notes || '-'
        }));

        const totalStay = rows.reduce((s, r) => s + r.stayValue, 0);
        const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
        const totalRem = rows.reduce((s, r) => s + r.remaining, 0);

        await exportStyledExcel({
          filename: `تقرير_مستحقات_النزلاء_المتبقية_${new Date().toISOString().split('T')[0]}.xlsx`,
          sheets: [
            {
              name: 'مستحقات النزلاء المتبقية',
              title: 'كشف مبالغ ومستحقات النزلاء المتبقية غير المحصلة',
              subtitle: `تاريخ التقرير: ${new Date().toISOString().split('T')[0]}`,
              columns: [
                { header: 'اسم النزيل', key: 'patientName', width: 25, align: 'right' },
                { header: 'الفرع', key: 'branchName', width: 20, align: 'center' },
                { header: 'تاريخ الدخول', key: 'entryDate', width: 16, align: 'center' },
                { header: 'قيمة الإقامة', key: 'stayValue', width: 18, type: 'currency' },
                { header: 'المبلغ المسدد', key: 'paid', width: 18, type: 'currency' },
                { header: 'المتبقي (جنيه)', key: 'remaining', width: 18, type: 'currency', headerColor: 'FFB91C1C' },
                { header: 'ملاحظات', key: 'notes', width: 25, align: 'right' }
              ],
              rows,
              summaryRow: {
                patientName: 'إجمالي المستحقات:',
                stayValue: totalStay,
                paid: totalPaid,
                remaining: totalRem
              }
            }
          ]
        });
      }
    } catch (err) {
      console.error('Failed to export styled excel', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner & Excel Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            التقارير والتصدير المالي — Central Reports & Excel Export
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            تقارير الأداء المالي، المتبقيات، وتصدير البيانات الشاملة بصيغة Excel
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={loadingMonthly || isExporting}
          className="mono-btn-primary text-sm shadow-md flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>جاري تجهيز Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير ملف Excel الشامل</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="mono-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-zinc-800 pb-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>تحديد التقرير والفرع:</span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'monthly'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          التقرير المالي الشهري الشامل
        </button>

        <button
          onClick={() => setActiveTab('outstanding')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'outstanding'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          تقرير مستحقات النزلاء المتبقية
        </button>
      </div>

      {/* Monthly Report View */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="mono-card p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400">إجمالي الإيرادات</span>
                <div className="mt-3 text-xl font-black text-emerald-400">
                  {loadingMonthly ? '...' : formatCurrency(monthlyData?.totals?.totalRevenue || 0)}
                </div>
              </div>
              {!loadingMonthly && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="flex justify-between items-center">
                    <span>إيرادات إقامة الشهر الحالي:</span>
                    <span className="font-semibold text-zinc-300 font-mono">{formatCurrency(monthlyData?.totals?.currentMonthStay || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>+ صافي إيرادات شهر {getArabicMonthName(month === 1 ? 12 : month - 1)}:</span>
                    <span className="font-bold font-mono">+{formatCurrency(monthlyData?.totals?.previousMonthNet || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mono-card p-5">
              <span className="text-xs font-semibold text-zinc-400">إجمالي المصروفات والسلف</span>
              <div className="mt-3 text-xl font-black text-rose-400">
                {loadingMonthly ? '...' : formatCurrency(monthlyData?.totals?.totalExpenses || 0)}
              </div>
            </div>

            <div className="mono-card p-5 border-zinc-700 bg-zinc-900">
              <span className="text-xs font-semibold text-zinc-300">صافي الإيرادات</span>
              <div className="mt-3 text-xl font-black text-white">
                {loadingMonthly ? '...' : formatCurrency(monthlyData?.totals?.netRevenue || 0)}
              </div>
            </div>

            <div className="mono-card p-5">
              <span className="text-xs font-semibold text-zinc-400">إجمالي السلف الشاملة</span>
              <div className="mt-3 text-xl font-black text-white">
                {loadingMonthly ? '...' : formatCurrency(monthlyData?.totals?.totalAdvances || 0)}
              </div>
            </div>

          </div>

          <div className="mono-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white">توزيع المصروفات حسب التصنيف لشهر {getArabicMonthName(month)} {year}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(monthlyData?.categoryBreakdown || []).map(cat => (
                <div key={cat.name} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-xs text-zinc-400">{cat.name}</span>
                  <div className="text-sm font-bold text-white">{formatCurrency(cat.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Payments View */}
      {activeTab === 'outstanding' && (
        <div className="space-y-6">
          <div className="mono-card p-5 bg-zinc-900 border-zinc-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400">إجمالي المبالغ المتبقية المستحقة على النزلاء</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {formatCurrency(outstandingData?.totalRemaining || 0)}
              </div>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>

          <div className="mono-card p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="mono-table-th">اسم النزيل</th>
                    <th className="mono-table-th">الفرع</th>
                    <th className="mono-table-th">قيمة الإقامة</th>
                    <th className="mono-table-th">المسدد</th>
                    <th className="mono-table-th">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loadingOutstanding ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                    </tr>
                  ) : (outstandingData?.list || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">لا توجد متبقيات مستحقة على النزلاء</td>
                    </tr>
                  ) : (outstandingData?.list || []).map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="mono-table-td font-bold text-white">{p.patientName}</td>
                      <td className="mono-table-td text-zinc-300">{p.branchName}</td>
                      <td className="mono-table-td text-white font-semibold">{formatCurrency(p.stayValue)}</td>
                      <td className="mono-table-td text-emerald-400 font-semibold">{formatCurrency(p.paid)}</td>
                      <td className="mono-table-td text-rose-400 font-bold">{formatCurrency(p.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
