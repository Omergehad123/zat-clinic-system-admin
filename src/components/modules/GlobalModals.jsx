'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { 
  useAddPatient, 
  useAddPayment, 
  useAddPatientExpense, 
  useDischargePatient, 
  useDeletePatient, 
  useUpdatePatient,
  useRenewPatient
} from '../../hooks/usePatients';
import { useBranches } from '../../hooks/useDashboardQueries';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Trash2, Calculator, AlertTriangle, Pencil, RotateCcw } from 'lucide-react';

export default function GlobalModals() {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { data: branches = [] } = useBranches();

  const addPatientMutation = useAddPatient();
  const updatePatientMutation = useUpdatePatient();
  const renewPatientMutation = useRenewPatient();
  const addPaymentMutation = useAddPayment();
  const addPatientExpenseMutation = useAddPatientExpense();
  const dischargePatientMutation = useDischargePatient();
  const deletePatientMutation = useDeletePatient();

  // --- Form 1: Add Patient State ---
  const [patBranchId, setPatBranchId] = useState('');
  const [patName, setPatName] = useState('');
  const [patEntryDate, setPatEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [patExpectedExit, setPatExpectedExit] = useState('');
  const [patStayValue, setPatStayValue] = useState('');
  const [patFirstPayment, setPatFirstPayment] = useState('');
  const [patInitialExpenses, setPatInitialExpenses] = useState('');
  const [patExpenseDeposit, setPatExpenseDeposit] = useState('');
  const [patNotes, setPatNotes] = useState('');

  const calculatedPatRemaining = Math.max(0, (Number(patStayValue) || 0) - (Number(patFirstPayment) || 0));
  const calculatedNetRevenue = (Number(patStayValue) || 0) - (Number(patInitialExpenses) || 0);

  // --- Form 2: Payment State ---
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('كاش');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');

  // --- Form 3: Patient Expense State ---
  const [pexDesc, setPexDesc] = useState('');
  const [pexCategory, setPexCategory] = useState('أدوية');
  const [pexAmount, setPexAmount] = useState('');
  const [pexDate, setPexDate] = useState(new Date().toISOString().split('T')[0]);
  const [pexNotes, setPexNotes] = useState('');

  // Discharge & Renew State
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewEntryDate, setRenewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewExpectedExit, setRenewExpectedExit] = useState('');
  const [renewStayValue, setRenewStayValue] = useState('');
  const [renewMode, setRenewMode] = useState('add');
  const [renewFirstPayment, setRenewFirstPayment] = useState('');
  const [renewPaymentMethod, setRenewPaymentMethod] = useState('كاش');
  const [renewNotes, setRenewNotes] = useState('');

  useEffect(() => {
    if (!activeModal) return;
    if (activeModal === 'ADD_PATIENT') {
      setPatName('');
      setPatStayValue('');
      setPatFirstPayment('');
      setPatInitialExpenses('');
      setPatNotes('');
      if (branches.length > 0 && !patBranchId) {
        setPatBranchId(branches[0].id || branches[0]._id);
      }
    }
    if (activeModal === 'EDIT_PATIENT' && modalData) {
      setPatName(modalData.name || '');
      setPatEntryDate(
        modalData.entryDate
          ? new Date(modalData.entryDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPatExpectedExit(
        modalData.exitDate
          ? new Date(modalData.exitDate).toISOString().split('T')[0]
          : (modalData.expectedExitDate ? new Date(modalData.expectedExitDate).toISOString().split('T')[0] : '')
      );
      setPatStayValue(modalData.stayValue ?? modalData.accommodationAmount ?? '');
      setPatExpenseDeposit(modalData.expenseDeposit ?? modalData.expensesDeposit ?? '');
      setPatNotes(modalData.notes || '');
    }
    if (activeModal === 'RENEW_PATIENT' && modalData) {
      setRenewEntryDate(new Date().toISOString().split('T')[0]);
      setRenewExpectedExit('');
      setRenewStayValue('');
      setRenewMode('add');
      setRenewFirstPayment('');
      setRenewPaymentMethod('كاش');
      setRenewNotes('');
    }
  }, [activeModal, modalData, branches]);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative animate-fade-in my-8 text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <h2 className="text-lg font-bold text-white">
            {activeModal === 'ADD_PATIENT' && 'إضافة نزيل جديد بالمنظومة'}
            {activeModal === 'EDIT_PATIENT' && `تعديل بيانات النزيل: ${modalData?.name}`}
            {activeModal === 'RENEW_PATIENT' && `تجديد إقامة النزيل: ${modalData?.name}`}
            {activeModal === 'ADD_PAYMENT' && `إضافة دفعة سداد: ${modalData?.patientName || modalData?.name}`}
            {activeModal === 'ADD_PATIENT_EXPENSE' && `إضافة مصروف نزيل: ${modalData?.patientName || modalData?.name}`}
            {activeModal === 'DISCHARGE_PATIENT' && `تسجيل خروج النزيل: ${modalData?.name}`}
            {activeModal === 'DELETE_PATIENT' && `تأكيد حذف النزيل: ${modalData?.name}`}
          </h2>
          <button
            onClick={closeModal}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ADD PATIENT */}
        {activeModal === 'ADD_PATIENT' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPatientMutation.mutate({
                data: {
                  name: patName,
                  entryDate: patEntryDate,
                  expectedExitDate: patExpectedExit,
                  accommodationAmount: Number(patStayValue),
                  firstPayment: Number(patFirstPayment) || 0,
                  initialExpenses: Number(patInitialExpenses) || 0,
                  stayValue: patStayValue,
                  notes: patNotes,
                  branchId: patBranchId
                },
                branchId: patBranchId
              }, { onSuccess: closeModal });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">اختر الفرع *</label>
              <select
                required
                value={patBranchId}
                onChange={(e) => setPatBranchId(e.target.value)}
                className="mono-input text-sm"
              >
                {branches.map(b => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">اسم النزيل *</label>
              <input
                type="text"
                required
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي للنزيل"
                className="mono-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الدخول *</label>
                <input
                  type="date"
                  required
                  value={patEntryDate}
                  onChange={(e) => setPatEntryDate(e.target.value)}
                  className="mono-input text-xs dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الخروج المتوقع</label>
                <input
                  type="date"
                  value={patExpectedExit}
                  onChange={(e) => setPatExpectedExit(e.target.value)}
                  className="mono-input text-xs dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">قيمة الإقامة (جنيه) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={patStayValue}
                  onChange={(e) => setPatStayValue(e.target.value)}
                  placeholder="25000"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">الدفعة الأولى (جنيه)</label>
                <input
                  type="number"
                  min="0"
                  value={patFirstPayment}
                  onChange={(e) => setPatFirstPayment(e.target.value)}
                  placeholder="10000"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Calculator className="w-4 h-4 text-white" />
                <span>المبلغ المتبقي من الإقامة:</span>
              </div>
              <div className="text-base font-black text-white">
                {formatCurrency(calculatedPatRemaining)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ملاحظات الإقامة</label>
              <textarea
                value={patNotes}
                onChange={(e) => setPatNotes(e.target.value)}
                placeholder="حالة النزيل، الطبيب المتابع، توصيات..."
                className="mono-input text-xs h-20"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button type="submit" disabled={addPatientMutation.isPending} className="mono-btn-primary text-xs">
                {addPatientMutation.isPending ? 'جاري الحفظ...' : 'حفظ النزيل'}
              </button>
            </div>
          </form>
        )}

        {/* 2. EDIT PATIENT */}
        {activeModal === 'EDIT_PATIENT' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePatientMutation.mutate(
                {
                  id: modalData?.id || modalData?._id,
                  data: {
                    name: patName,
                    entryDate: patEntryDate,
                    expectedExitDate: patExpectedExit,
                    stayValue: patStayValue,
                    expenseDeposit: Number(patExpenseDeposit) || 0,
                    notes: patNotes
                  }
                },
                { onSuccess: closeModal }
              );
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">اسم النزيل *</label>
              <input
                type="text"
                required
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي للنزيل"
                className="mono-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الدخول *</label>
                <input
                  type="date"
                  required
                  value={patEntryDate}
                  onChange={(e) => setPatEntryDate(e.target.value)}
                  className="mono-input text-xs dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الخروج المتوقع</label>
                <input
                  type="date"
                  value={patExpectedExit}
                  onChange={(e) => setPatExpectedExit(e.target.value)}
                  className="mono-input text-xs dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">قيمة الإقامة (جنيه) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={patStayValue}
                  onChange={(e) => setPatStayValue(e.target.value)}
                  placeholder="10000"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">وديعة المصاريف (جنيه)</label>
                <input
                  type="number"
                  min="0"
                  value={patExpenseDeposit}
                  onChange={(e) => setPatExpenseDeposit(e.target.value)}
                  placeholder="1000"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ملاحظات الإقامة</label>
              <textarea
                rows="3"
                value={patNotes}
                onChange={(e) => setPatNotes(e.target.value)}
                placeholder="تفاصيل الإقامة..."
                className="mono-input text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button type="submit" disabled={updatePatientMutation.isPending} className="mono-btn-primary text-xs">
                {updatePatientMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        )}

        {/* 3. RENEW PATIENT */}
        {activeModal === 'RENEW_PATIENT' && (() => {
          const prevStay = Number(modalData?.stayValue ?? modalData?.accommodationAmount ?? 0);
          const addStay = Number(renewStayValue) || 0;
          const newTotalStay = renewMode === 'replace' ? addStay : (prevStay + addStay);
          const firstPay = Number(renewFirstPayment) || 0;

          return (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const patientId = modalData?.id || modalData?._id;
                renewPatientMutation.mutate(
                  {
                    id: patientId,
                    data: {
                      renewDate: renewEntryDate,
                      expectedExitDate: renewExpectedExit || null,
                      accommodationAmount: addStay,
                      mode: renewMode,
                      firstPayment: firstPay,
                      paymentMethod: renewPaymentMethod,
                      notes: renewNotes
                    }
                  },
                  {
                    onSuccess: () => {
                      closeModal();
                    }
                  }
                );
              }}
              className="space-y-4"
            >
              {/* Patient Badge */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 block">النزيل المستهدف:</span>
                  <strong className="text-white text-sm">{modalData?.name}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    modalData?.status === 'حالي' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {modalData?.status || 'حالي'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">#{modalData?.id?.slice(-6) || modalData?._id?.slice(-6)}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ التجديد / بدء المدة *</label>
                  <input
                    type="date"
                    required
                    value={renewEntryDate}
                    onChange={(e) => setRenewEntryDate(e.target.value)}
                    className="mono-input text-xs dir-ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الخروج المتوقع</label>
                  <input
                    type="date"
                    value={renewExpectedExit}
                    onChange={(e) => setRenewExpectedExit(e.target.value)}
                    className="mono-input text-xs dir-ltr"
                  />
                </div>
              </div>

              {/* Stay Value & Mode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-300">
                    قيمة التجديد / الإقامة المضافة (جنيه) *
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRenewMode('add')}
                      className={`px-2 py-0.5 text-[11px] rounded transition-all font-medium ${
                        renewMode === 'add' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      إضافة للمبلغ السابق
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenewMode('replace')}
                      className={`px-2 py-0.5 text-[11px] rounded transition-all font-medium ${
                        renewMode === 'replace' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      مبلغ كلي جديد
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  required
                  min="0"
                  value={renewStayValue}
                  onChange={(e) => setRenewStayValue(e.target.value)}
                  placeholder="مثال: 15000"
                  className="mono-input text-sm dir-ltr font-mono"
                />
              </div>

              {/* First Payment & Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">الدفعة المسددة الآن (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    value={renewFirstPayment}
                    onChange={(e) => setRenewFirstPayment(e.target.value)}
                    placeholder="0"
                    className="mono-input text-sm dir-ltr font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">طريقة الدفع</label>
                  <select
                    value={renewPaymentMethod}
                    onChange={(e) => setRenewPaymentMethod(e.target.value)}
                    className="mono-input text-xs"
                    disabled={!Number(renewFirstPayment)}
                  >
                    <option value="كاش">كاش</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="فودافون كاش">فودافون كاش / إنستاباي</option>
                    <option value="فيزا">فيزا / بطاقة</option>
                  </select>
                </div>
              </div>

              {/* Live Financial Calculation Box */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>إجمالي قيمة الإقامة السابقة:</span>
                  <span className="font-mono text-zinc-300">{formatCurrency(prevStay)}</span>
                </div>
                {addStay > 0 && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>{renewMode === 'add' ? '+ قيمة التجديد المضافة:' : 'القيمة الجديدة المستبدلة:'}</span>
                    <span className="font-mono font-semibold text-emerald-400">+{formatCurrency(addStay)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-zinc-850 flex items-center justify-between font-bold text-white">
                  <span>إجمالي الإقامة بعد التجديد:</span>
                  <span className="font-mono text-sm text-white">{formatCurrency(newTotalStay)}</span>
                </div>
                {firstPay > 0 && (
                  <div className="flex items-center justify-between text-zinc-400 pt-1">
                    <span>دفعة مسددة فورية:</span>
                    <span className="font-mono font-semibold text-emerald-400">-{formatCurrency(firstPay)}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ملاحظات التجديد</label>
                <textarea
                  rows="2"
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  placeholder="مثال: تجديد حجز لشهر إضافي - اتفاق مع ولي الأمر..."
                  className="mono-input text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
                <button
                  type="submit"
                  disabled={renewPatientMutation.isPending}
                  className="mono-btn-primary text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${renewPatientMutation.isPending ? 'animate-spin' : ''}`} />
                  {renewPatientMutation.isPending ? 'جاري التجديد...' : 'تأكيد تجديد الإقامة'}
                </button>
              </div>
            </form>
          );
        })()}

        {/* 4. ADD PAYMENT */}
        {activeModal === 'ADD_PAYMENT' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPaymentMutation.mutate({
                patientId: modalData?.patientId || modalData?.id || modalData?._id,
                amount: Number(payAmount),
                paymentMethod: payMethod,
                method: payMethod,
                date: payDate,
                notes: payNotes
              }, { onSuccess: closeModal });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">المبلغ (جنيه) *</label>
              <input
                type="number"
                required
                min="1"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="5000"
                className="mono-input text-sm dir-ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">طريقة الدفع *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="mono-input text-sm"
                >
                  <option value="كاش">كاش</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="فيزا">فيزا / كارت</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الدفع *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="mono-input text-xs dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ملاحظات</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="بيان الدفعة..."
                className="mono-input text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button type="submit" disabled={addPaymentMutation.isPending} className="mono-btn-primary text-xs">
                {addPaymentMutation.isPending ? 'جاري التسجيل...' : 'حفظ الدفعة'}
              </button>
            </div>
          </form>
        )}

        {/* 5. ADD PATIENT EXPENSE */}
        {activeModal === 'ADD_PATIENT_EXPENSE' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPatientExpenseMutation.mutate({
                patientId: modalData?.patientId || modalData?.id || modalData?._id,
                description: pexDesc,
                category: pexCategory,
                amount: Number(pexAmount),
                date: pexDate,
                notes: pexNotes
              }, { onSuccess: closeModal });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">بيان المصروف *</label>
              <input
                type="text"
                required
                value={pexDesc}
                onChange={(e) => setPexDesc(e.target.value)}
                placeholder="شراء علاج خاص، تحاليل طبية..."
                className="mono-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">التصنيف *</label>
                <select
                  value={pexCategory}
                  onChange={(e) => setPexCategory(e.target.value)}
                  className="mono-input text-sm"
                >
                  <option value="أدوية">أدوية</option>
                  <option value="مستلزمات">مستلزمات</option>
                  <option value="تحاليل وأشعة">تحاليل وأشعة</option>
                  <option value="كافتيريا ومشتريات">كافتيريا ومشتريات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">المبلغ (جنيه) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pexAmount}
                  onChange={(e) => setPexAmount(e.target.value)}
                  placeholder="500"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">التاريخ *</label>
              <input
                type="date"
                required
                value={pexDate}
                onChange={(e) => setPexDate(e.target.value)}
                className="mono-input text-xs dir-ltr"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button type="submit" disabled={addPatientExpenseMutation.isPending} className="mono-btn-primary text-xs">
                {addPatientExpenseMutation.isPending ? 'جاري التسجيل...' : 'تسجيل وخصم المصروف'}
              </button>
            </div>
          </form>
        )}

        {/* 6. DISCHARGE PATIENT */}
        {activeModal === 'DISCHARGE_PATIENT' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              هل أنت تأكيد من تسوية وتسجيل خروج النزيل <strong className="text-white">{modalData?.name}</strong>؟
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الخروج *</label>
              <input
                type="date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="mono-input text-xs dir-ltr"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button
                type="button"
                disabled={dischargePatientMutation.isPending}
                onClick={() => {
                  dischargePatientMutation.mutate({
                    patientId: modalData?.id || modalData?._id,
                    exitDate: dischargeDate
                  }, { onSuccess: closeModal });
                }}
                className="mono-btn-danger text-xs"
              >
                {dischargePatientMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد تسجيل الخروج'}
              </button>
            </div>
          </div>
        )}

        {/* 7. DELETE PATIENT */}
        {activeModal === 'DELETE_PATIENT' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold mb-1 text-sm">تحذير حذف نهائي!</strong>
                هل أنت متأكد من حذف النزيل <strong className="text-white">{modalData?.name}</strong> نهائياً من النظام؟ سيتم مسح السجل وجميع الدفعات والمصروفات المرتبطة به.
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button
                type="button"
                disabled={deletePatientMutation.isPending}
                onClick={() => {
                  deletePatientMutation.mutate(modalData?.id || modalData?._id, { onSuccess: closeModal });
                }}
                className="mono-btn-danger text-xs"
              >
                {deletePatientMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
