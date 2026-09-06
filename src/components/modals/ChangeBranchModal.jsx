'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useUpdateUser, useBranches } from '../../hooks/useDashboardQueries';
import { X, GitFork, CheckCircle2 } from 'lucide-react';

export default function ChangeBranchModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const updateUserMutation = useUpdateUser();
  const { data: branches = [] } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalData) {
      setSelectedBranchId(modalData.branchId || '');
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userId = modalData?.id || modalData?._id;
      const targetBranch = branches.find(b => b.id === selectedBranchId || b._id === selectedBranchId);

      await updateUserMutation.mutateAsync({
        id: userId,
        userData: {
          branchId: selectedBranchId || null,
          revokePreviousManagers: true
        }
      });

      const branchName = targetBranch ? targetBranch.name : 'بدون فرع';
      showToast(`تم تعيين فرع المستخدم "${modalData?.name}" إلى (${branchName}) وإلغاء صلاحية الإدارة السابقة بنجاح`);
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تغيير الفرع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-6 shadow-2xl relative text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تغيير / تعيين الفرع للمستخدم</h2>
              <p className="text-xs text-zinc-400">{modalData?.name}</p>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs space-y-1.5">
            <p className="text-zinc-300 leading-relaxed">
              اختر الفرع الجديد المنسوب لهذا المستخدم ليمكّنه من الدخول على لوحة تحكم هذا الفرع وإدارة البيانات الخاصة به:
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">
              💡 سيتم نقل إدارة الفرع للمستخدم الجديد وسحب وصول المدير السابق لهذا الفرع تلقائياً.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">الفرع المستهدف *</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="mono-input text-xs"
            >
              <option value="" className="bg-zinc-900 text-white">بدون فرع (عام)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                  {b.name} ({b.status === 'active' || b.status === 'نشط' ? 'نشط' : 'معطل'})
                </option>
              ))}
            </select>
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
              type="submit"
              disabled={updateUserMutation.isPending}
              className="mono-btn-primary text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {updateUserMutation.isPending ? 'جاري التعيين...' : 'تأكيد تغيير الفرع'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
