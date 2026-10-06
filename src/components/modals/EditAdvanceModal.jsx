'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useUpdateAdvance } from '../../hooks/useDashboardQueries';
import { X, Wallet } from 'lucide-react';

export default function EditAdvanceModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const updateMutation = useUpdateAdvance();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalData) {
      setAmount(modalData.amount || '');
      setDate(modalData.date ? new Date(modalData.date).toISOString().split('T')[0] : '');
      setNotes(modalData.notes || '');
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('المبلغ يجب أن يكون أكبر من الصفر');
      return;
    }
    try {
      const id = modalData?.id || modalData?._id;
      await updateMutation.mutateAsync({ id, advanceData: { amount: numAmount, date, notes } });
      showToast('تم تعديل السلفة بنجاح', 'success');
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تعديل السلفة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right dir-rtl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">تعديل السلفة</h2>
              <p className="text-xs text-zinc-400">{modalData?.employeeName}</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">مبلغ السلفة (ج.م) *</label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mono-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">التاريخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mono-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mono-input text-xs resize-none"
              placeholder="ملاحظات اختيارية..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
            <button type="submit" disabled={updateMutation.isPending} className="mono-btn-primary text-xs">
              {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
