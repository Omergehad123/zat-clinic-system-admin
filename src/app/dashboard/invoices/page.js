'use client';

import { useState } from 'react';
import { useInvoices, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { FileText, Plus, MapPin } from 'lucide-react';

export default function InvoicesPage() {
  const { selectedBranchId, openModal } = useUIStore();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: invoices = [], isLoading } = useInvoices(selectedBranchId, { category: categoryFilter });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            إدارة فواتير المصروفات — Invoices Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            سجل فواتير الأصناف والمشتروات الصادرة من مختلف الفروع
          </p>
        </div>

        <button
          onClick={() => openModal('ADD_INVOICE')}
          className="mono-btn-primary text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          إضافة فاتورة جديدة
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mono-card p-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="mono-input max-w-xs"
        >
          <option value="all" className="bg-zinc-900 text-white">كل التصنيفات</option>
          <option value="أكل" className="bg-zinc-900 text-white">أكل</option>
          <option value="أدوية" className="bg-zinc-900 text-white">أدوية</option>
          <option value="مرافق" className="bg-zinc-900 text-white">مرافق</option>
          <option value="صيانة" className="bg-zinc-900 text-white">صيانة</option>
          <option value="مستلزمات" className="bg-zinc-900 text-white">مستلزمات</option>
        </select>
      </div>

      {/* Invoices List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-500">جاري تحميل الفواتير...</div>
        ) : invoices.map(inv => (
          <div key={inv.id} className="mono-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">#{inv.id}</span>
                <span className="text-xs text-zinc-400 mr-3">{formatDate(inv.date)}</span>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg">
                {inv.category}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                الفرع: <span className="text-white font-bold">{inv.branchName}</span>
              </span>
              <span>مُدخل الفاتورة: <span className="text-zinc-200">{inv.createdBy}</span></span>
            </div>

            {/* Items list */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <h4 className="text-xs font-bold text-zinc-400">الأصناف المسجلة ({inv.items?.length || 0}):</h4>
              <div className="space-y-1">
                {inv.items?.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-zinc-900/80 p-2 rounded-lg">
                    <span className="text-zinc-200 font-semibold">{item.name} ({item.count} قطعة)</span>
                    <span className="font-mono text-zinc-400">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">إجمالي الفاتورة:</span>
              <span className="text-lg font-black text-white">{formatCurrency(inv.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
