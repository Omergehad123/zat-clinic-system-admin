'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useUpdateBranch } from '../../hooks/useDashboardQueries';
import { X, Building2 } from 'lucide-react';

export default function EditBranchModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const updateBranchMutation = useUpdateBranch();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalData) {
      setName(modalData.name || '');
      setPhone(modalData.phone || '');
      setAddress(modalData.address || '');
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('اسم الفرع مطلوب');
      return;
    }

    try {
      const branchId = modalData?.id || modalData?._id;
      await updateBranchMutation.mutateAsync({
        id: branchId,
        branchData: { name, phone, address }
      });

      showToast(`تم تحديث بيانات الفرع "${name}" بنجاح`);
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تعديل بيانات الفرع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">تعديل بيانات الفرع</h2>
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
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم الفرع *</label>
            <input
              type="text"
              required
              placeholder="اسم الفرع"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mono-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">رقم الهاتف</label>
            <input
              type="text"
              placeholder="01000000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mono-input text-xs dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">العنوان</label>
            <input
              type="text"
              placeholder="تفاصيل العنوان..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mono-input text-xs"
            />
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
              disabled={updateBranchMutation.isPending}
              className="mono-btn-primary text-xs"
            >
              {updateBranchMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
