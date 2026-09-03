'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useResetPassword } from '../../hooks/useDashboardQueries';
import { X, Lock, KeyRound } from 'lucide-react';

export default function ResetPasswordModal() {
  const closeModal = useUIStore(s => s.closeModal);
  const modalData = useUIStore(s => s.modalData);
  const showToast = useUIStore(s => s.showToast);

  const resetPasswordMutation = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('يرجى ادخال كلمة المرور الجديدة');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        id: modalData.id,
        newPassword
      });

      showToast(`تم تغيير كلمة المرور للمستخدم ${modalData.name} بنجاح`);
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إعاده التعيين');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">إعادة تعيين كلمة المرور</h2>
              <p className="text-xs text-zinc-400">{modalData?.name}</p>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">كلمة المرور الجديدة *</label>
            <input
              type="text"
              required
              placeholder="أدخل كلمة المرور..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mono-input dir-ltr text-right"
            />
          </div>

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
              disabled={resetPasswordMutation.isPending}
              className="mono-btn-primary text-xs"
            >
              {resetPasswordMutation.isPending ? 'جاري التحديث...' : 'تأكيد الحفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
