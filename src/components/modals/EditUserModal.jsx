'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useUpdateUser, useBranches } from '../../hooks/useDashboardQueries';
import { ROLE_LABELS } from '../../utils/permissions';
import { X, UserCog } from 'lucide-react';

export default function EditUserModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const updateUserMutation = useUpdateUser();
  const { data: branches = [] } = useBranches();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('branch_manager');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalData) {
      setName(modalData.name || '');
      setEmail(modalData.email || '');
      setRole(modalData.role || 'branch_manager');
      setBranchId(modalData.branchId || '');
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    try {
      const userId = modalData?.id || modalData?._id;
      await updateUserMutation.mutateAsync({
        id: userId,
        userData: {
          name,
          email,
          role,
          branchId: branchId || null
        }
      });

      showToast(`تم تحديث بيانات المستخدم "${name}" بنجاح`);
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تعديل المستخدم');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <UserCog className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">تعديل بيانات المستخدم</h2>
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mono-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">البريد الإلكتروني *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mono-input text-xs dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الدور / الصلاحية *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mono-input text-xs"
            >
              {Object.keys(ROLE_LABELS).map(rk => (
                <option key={rk} value={rk} className="bg-zinc-900 text-white">
                  {ROLE_LABELS[rk]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الفرع المنسوب إليه</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="mono-input text-xs"
            >
              <option value="" className="bg-zinc-900 text-white">بدون فرع (عام)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                  {b.name}
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
              className="mono-btn-primary text-xs"
            >
              {updateUserMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
