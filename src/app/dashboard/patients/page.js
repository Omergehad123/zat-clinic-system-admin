'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [activePatient, setActivePatient] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  const { data: patients = [], isLoading } = usePatients(branchFilter, search, statusFilter);
  const { data: branches = [] } = useBranches();
  const openModal = useUIStore(s => s.openModal);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click, window scroll or resize
  useEffect(() => {
    if (!openActionId) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenActionId(null);
        setActivePatient(null);
        setMenuPosition(null);
      }
    };

    const handleScrollOrResize = () => {
      setOpenActionId(null);
      setActivePatient(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openActionId]);

  const toggleActionMenu = (e, patient) => {
    e.stopPropagation();
    if (openActionId === patient.id) {
      setOpenActionId(null);
      setActivePatient(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 208;
      const menuHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

      let left = rect.right - menuWidth;
      if (left < 10) left = rect.left;
      if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
      }

      setMenuPosition({
        top: openUpwards ? rect.top - 6 : rect.bottom + 6,
        left: Math.max(10, left),
        openUpwards
      });
      setOpenActionId(patient.id);
      setActivePatient(patient);
    }
  };

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
                <th className="mono-table-th">تاريخ التجديد</th>
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
                  <td colSpan={10} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">لا يوجد نزلاء مطابقين للبحث</td>
                </tr>
              ) : patients.map(p => {
                const isOpen = openActionId === p.id;
                let renewalDate = p.lastRenewalDate || p.renewalDate;
                if (!renewalDate && Array.isArray(p.timeline)) {
                  const ren = p.timeline.filter(e => e.type === 'renewal');
                  if (ren.length > 0) renewalDate = ren[ren.length - 1].date;
                }
                if (!renewalDate && p.notes) {
                  const m = p.notes.match(/\[تجديد إقامة بتاريخ\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\]/);
                  if (m && m[1]) renewalDate = m[1];
                }
                const renewalsCount = p.renewalsCount || (p.timeline?.filter(e => e.type === 'renewal')?.length || (renewalDate ? 1 : 0));

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
                    <td className="mono-table-td">
                      {renewalDate ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-semibold">{formatDate(renewalDate)}</span>
                          {renewalsCount > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded font-mono font-bold">
                              {renewalsCount}x
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="mono-table-td font-semibold text-white">{formatCurrency(p.stayValue)}</td>
                    <td className="mono-table-td text-emerald-400 font-semibold">{formatCurrency(p.paid)}</td>
                    <td className="mono-table-td text-rose-400 font-semibold">{formatCurrency(p.remaining)}</td>
                    <td className="mono-table-td">
                      {(() => {
                        const paid = Number(p.paidAmount ?? p.paid ?? 0);
                        const exp = Number(p.totalExpenses ?? p.expensesTotal ?? 0);
                        const net = paid - exp;
                        return (
                          <>
                            <div className={`font-bold font-mono ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatCurrency(net)}
                            </div>
                            {exp > 0 && (
                              <div className="text-[10px] text-zinc-500 font-normal">
                                مصاريف: {formatCurrency(exp)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </td>
                    <td className="mono-table-td">{getStatusBadge(p.status)}</td>
                    <td className="mono-table-td text-center">
                      <button
                        onClick={(e) => toggleActionMenu(e, p)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm ${
                          openActionId === p.id 
                            ? 'bg-zinc-800 border-zinc-500 text-white' 
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-zinc-200'
                        }`}
                      >
                        <span>الإجراءات</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openActionId === p.id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {patients.length > 0 && (
              <tfoot className="border-t-2 border-zinc-700 bg-zinc-950 font-bold">
                <tr>
                  <td className="mono-table-td text-white" colSpan={4}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-zinc-300">الإجمالي العام:</span>
                      <span className="text-xs text-zinc-400 font-mono">({patients.length} نزيل)</span>
                    </div>
                  </td>
                  <td className="mono-table-td text-white font-mono text-sm">
                    {formatCurrency(patients.reduce((sum, p) => sum + Number(p.stayValue || 0), 0))}
                  </td>
                  <td className="mono-table-td text-emerald-400 font-mono text-sm">
                    {formatCurrency(patients.reduce((sum, p) => sum + Number(p.paid || 0), 0))}
                  </td>
                  <td className="mono-table-td text-rose-400 font-mono text-sm">
                    {formatCurrency(patients.reduce((sum, p) => sum + Number(p.remaining || 0), 0))}
                  </td>
                  <td className="mono-table-td">
                    {(() => {
                      const totalNet = patients.reduce((sum, p) => {
                        const paid = Number(p.paidAmount ?? p.paid ?? 0);
                        const exp = Number(p.totalExpenses ?? p.expensesTotal ?? 0);
                        return sum + (paid - exp);
                      }, 0);
                      const totalExp = patients.reduce((sum, p) => sum + Number(p.totalExpenses ?? p.expensesTotal ?? 0), 0);
                      return (
                        <>
                          <div className={`font-mono text-sm ${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(totalNet)}
                          </div>
                          {totalExp > 0 && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              مصاريف: {formatCurrency(totalExp)}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  <td className="mono-table-td text-zinc-600 text-xs text-center">-</td>
                  <td className="mono-table-td text-zinc-600 text-xs text-center">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Floating Action Menu rendered in Portal outside table DOM */}
      {mounted && openActionId && activePatient && menuPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: menuPosition.openUpwards ? undefined : `${menuPosition.top}px`,
            bottom: menuPosition.openUpwards ? `${window.innerHeight - menuPosition.top}px` : undefined,
            left: `${menuPosition.left}px`,
            zIndex: 99999
          }}
          className="w-52 bg-zinc-900 border border-zinc-700/90 rounded-xl shadow-2xl overflow-hidden dir-rtl divide-y divide-zinc-800 animate-fade-in text-right"
        >
          <div className="py-1">
            <Link
              href={`/dashboard/patients/${activePatient.id}`}
              onClick={() => { setOpenActionId(null); setActivePatient(null); setMenuPosition(null); }}
              className="w-full text-right px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors font-medium"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>عرض الملف بالتفصيل</span>
            </Link>
            <button
              onClick={() => {
                setOpenActionId(null);
                setActivePatient(null);
                setMenuPosition(null);
                openModal('ADD_PAYMENT', { ...activePatient, patientId: activePatient.id, patientName: activePatient.name });
              }}
              className="w-full text-right px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors font-medium"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>إضافة دفعة سداد</span>
            </button>
            <button
              onClick={() => {
                setOpenActionId(null);
                setActivePatient(null);
                setMenuPosition(null);
                openModal('ADD_PATIENT_EXPENSE', { ...activePatient, patientId: activePatient.id, patientName: activePatient.name });
              }}
              className="w-full text-right px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-colors font-medium"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>إضافة مصروف نزيل</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setOpenActionId(null);
                setActivePatient(null);
                setMenuPosition(null);
                openModal('RENEW_PATIENT', activePatient);
              }}
              className="w-full text-right px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>تجديد الإقامة (تمديد الحجز)</span>
            </button>

            {activePatient.status !== 'خرج' && activePatient.status !== 'discharged' && (
              <button
                onClick={() => {
                  setOpenActionId(null);
                  setActivePatient(null);
                  setMenuPosition(null);
                  openModal('DISCHARGE_PATIENT', activePatient);
                }}
                className="w-full text-right px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 flex items-center gap-2 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>تسجيل خروج النزيل</span>
              </button>
            )}

            <button
              onClick={() => {
                setOpenActionId(null);
                setActivePatient(null);
                setMenuPosition(null);
                openModal('EDIT_PATIENT', activePatient);
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
                setActivePatient(null);
                setMenuPosition(null);
                openModal('DELETE_PATIENT', activePatient);
              }}
              className="w-full text-right px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف النزيل نهائياً</span>
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
