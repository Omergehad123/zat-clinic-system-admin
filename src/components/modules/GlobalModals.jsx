'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { 
  useAddPatient, 
  useAddPayment, 
  useAddPatientExpense, 
  useDischargePatient, 
  useDeletePatient, 
  useUpdatePatient 
} from '../../hooks/usePatients';
import { useBranches } from '../../hooks/useDashboardQueries';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Trash2, Calculator, AlertTriangle, Pencil, RotateCcw } from 'lucide-react';

export default function GlobalModals() {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { data: branches = [] } = useBranches();

  const addPatientMutation = useAddPatient();
  const updatePatientMutation = useUpdatePatient();
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
  const [renewFirstPayment, setRenewFirstPayment] = useState('');
  const [renewExpenseDeposit, setRenewExpenseDeposit] = useState('');
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
      setRenewStayValue(modalData.stayValue ?? modalData.accommodationAmount ?? '');
      setRenewFirstPayment('');
      setRenewExpenseDeposit('');
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
        {activeModal === 'RENEW_PATIENT' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const patientId = modalData?.id || modalData?._id;
              updatePatientMutation.mutate(
                {
                  id: patientId,
                  data: {
                    status: 'current',
                    entryDate: renewEntryDate,
                    exitDate: renewExpectedExit || null,
                    accommodationAmount: Number(renewStayValue) || 0,
                    notes: renewNotes
                      ? `${modalData?.notes || ''}\n[تجديد إقامة بتاريخ ${renewEntryDate}]: ${renewNotes}`
                      : (modalData?.notes || '')
                  }
                },
                {
                  onSuccess: () => {
                    if (Number(renewFirstPayment) > 0) {
                      addPaymentMutation.mutate({
                        patientId,
                        amount: Number(renewFirstPayment),
                        paymentMethod: 'كاش',
                        date: renewEntryDate,
                        notes: 'دفعة أولى عند تجديد الإقامة'
                      });
                    }
                    closeModal();
                  }
                }
              );
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">اسم النزيل</label>
              <input
                type="text"
                disabled
                value={modalData?.name || ''}
                className="mono-input text-sm opacity-70 bg-zinc-950 text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">تاريخ الدخول الجديد *</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">قيمة الإقامة (جنيه) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={renewStayValue}
                  onChange={(e) => setRenewStayValue(e.target.value)}
                  placeholder="10000"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">دفعة أولى (اختياري)</label>
                <input
                  type="number"
                  min="0"
                  value={renewFirstPayment}
                  onChange={(e) => setRenewFirstPayment(e.target.value)}
                  placeholder="0"
                  className="mono-input text-sm dir-ltr"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
              <button type="submit" disabled={updatePatientMutation.isPending} className="mono-btn-primary text-xs flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                {updatePatientMutation.isPending ? 'جاري التجديد...' : 'تأكيد تجديد الإقامة'}
              </button>
            </div>
          </form>
        )}

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
