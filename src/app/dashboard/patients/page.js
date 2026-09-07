'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePatients, useBranches } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  Users,
  Search,
  MapPin,
  Eye,
  LogOut,
  RotateCcw,
  DollarSign,
  Receipt,
  Pencil,
  Trash2,
  ChevronDown
} from 'lucide-react';

export default function PatientsPage() {
  const { selectedBranchId } = useUIStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'all');
  const [openActionId, setOpenActionId] = useState(null);
  const dropdownRef = useRef(null);

  const { data: patients = [], isLoading } = usePatients(branchFilter, search, statusFilter);
  const { data: branches = [] } = useBranches();
  const openModal = useUIStore(s => s.openModal);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'حالي':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            حالي
          </span>
        );
      case 'جديد':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            جديد
          </span>
        );
      case 'خرج':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            خرج
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

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
      <div className="mono-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[950px]">
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
                <th className="mono-table-th text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">لا يوجد نزلاء مطابقين للبحث</td>
                </tr>
              ) : patients.map(p => {
                const isOpen = openActionId === p.id;
                return (
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
                    <td className="mono-table-td">{getStatusBadge(p.status)}</td>
                    <td className="mono-table-td text-center relative">
                      {/* Action Dropdown */}
                      <div className="relative inline-block text-right" ref={isOpen ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenActionId(isOpen ? null : p.id)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-xs font-bold text-zinc-200 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>الإجراءات</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="absolute left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-30 overflow-hidden dir-rtl divide-y divide-zinc-800 animate-fade-in">
                            <div className="py-1">
                              <Link
                                href={`/dashboard/patients/${p.id}`}
                                onClick={() => setOpenActionId(null)}
                                className="w-full text-right px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                <span>عرض الملف بالتفصيل</span>
                              </Link>
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  openModal('ADD_PAYMENT', { ...p, patientId: p.id, patientName: p.name });
                                }}
                                className="w-full text-right px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors font-medium"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>إضافة دفعة سداد</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  openModal('ADD_PATIENT_EXPENSE', { ...p, patientId: p.id, patientName: p.name });
                                }}
                                className="w-full text-right px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-colors font-medium"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>إضافة مصروف نزيل</span>
                              </button>
                            </div>

                            <div className="py-1">
                              {p.status !== 'خرج' && p.status !== 'discharged' ? (
                                <button
                                  onClick={() => {
                                    setOpenActionId(null);
                                    openModal('DISCHARGE_PATIENT', p);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors font-medium"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>تسجيل خروج النزيل</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setOpenActionId(null);
                                    openModal('RENEW_PATIENT', p);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors font-medium"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>تجديد الإقامة (إعادة دخول)</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  openModal('EDIT_PATIENT', p);
                                }}
                                className="w-full text-right px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-colors font-medium"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>تعديل بيانات النزيل</span>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  openModal('DELETE_PATIENT', p);
                                }}
                                className="w-full text-right px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف النزيل نهائياً</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
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
