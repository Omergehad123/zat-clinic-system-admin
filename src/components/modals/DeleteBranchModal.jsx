'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useDeleteBranch } from '../../hooks/useDashboardQueries';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteBranchModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const deleteBranchMutation = useDeleteBranch();
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    try {
      const branchId = modalData?.id || modalData?._id;
      await deleteBranchMutation.mutateAsync(branchId);
      showToast(`تم حذف الفرع "${modalData?.name}" نهائياً بنجاح`);
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حذف الفرع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-6 shadow-2xl relative text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">تأكيد حذف الفرع</h2>
          </div>
          <button 
            onClick={closeModal}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-bold mb-1 text-sm">تحذير حذف نهائي!</strong>
            هل أنت متأكد من حذف الفرع <strong className="text-white">"{modalData?.name}"</strong> نهائياً من المنظومة؟
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={closeModal}
            className="mono-btn-secondary text-xs"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={deleteBranchMutation.isPending}
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {deleteBranchMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
          </button>
        </div>

      </div>
    </div>
  );
}
