'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useDeleteEmployee } from '../../hooks/useDashboardQueries';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteEmployeeModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const deleteMutation = useDeleteEmployee();
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    try {
      const id = modalData?.id || modalData?._id;
      await deleteMutation.mutateAsync(id);
      showToast(`تم حذف الموظف "${modalData?.name}" بنجاح`, 'success');
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حذف الموظف');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-5 shadow-2xl text-right dir-rtl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">حذف الموظف</h2>
          </div>
          <button onClick={closeModal} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-rose-300">هل أنت متأكد من حذف هذا الموظف نهائياً؟</p>
            <p className="text-xs text-zinc-300">
              الموظف: <span className="text-white font-bold">{modalData?.name}</span> ({modalData?.type || modalData?.role})
            </p>
            <p className="text-xs text-zinc-400">
              الفرع: <span className="text-zinc-200">{modalData?.branchName || 'غير محدد'}</span>
            </p>
            <p className="text-xs text-rose-500 mt-1">لا يمكن التراجع عن هذه العملية.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={closeModal} className="mono-btn-secondary text-xs">إلغاء</button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
}
