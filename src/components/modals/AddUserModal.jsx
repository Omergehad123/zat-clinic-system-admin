'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useBranches, useCreateUser } from '../../hooks/useDashboardQueries';
import { ROLE_LABELS } from '../../utils/permissions';
import { X, User, Mail, Lock, ShieldCheck, MapPin } from 'lucide-react';

export default function AddUserModal() {
  const closeModal = useUIStore(s => s.closeModal);
  const showToast = useUIStore(s => s.showToast);

  const { data: branches = [] } = useBranches();
  const createUserMutation = useCreateUser();

  const modalData = useUIStore(s => s.modalData);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState(modalData?.role || 'branch_manager');
  const [branchId, setBranchId] = useState(modalData?.branchId || '');

  useEffect(() => {
    if (modalData?.branchId) {
      setBranchId(modalData.branchId);
    } else if (branches.length > 0 && !branchId) {
      setBranchId(branches[0]._id || branches[0].id);
    }
  }, [branches, branchId, modalData]);

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    if (role !== 'super_admin' && !branchId) {
      setError('يرجى اختيار الفرع للمستخدم');
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name,
        email,
        password,
        role,
        branchId: role === 'super_admin' ? null : branchId
      });

      showToast('تم إضافة المستخدم بنجاح');
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إضافة المستخدم');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">إضافة مستخدم جديد للنظام</h2>
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الاسم الكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: د. ياسر جلال"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mono-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">البريد الإلكتروني *</label>
            <input
              type="email"
              required
              placeholder="yasser@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mono-input dir-ltr text-right"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">كلمة المرور *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mono-input dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">الدور / الصلاحية *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mono-input"
              >
                {Object.keys(ROLE_LABELS).map(roleKey => (
                  <option key={roleKey} value={roleKey} className="bg-zinc-900 text-white">
                    {ROLE_LABELS[roleKey]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الفرع المنسوب إليه *</label>
            {role === 'super_admin' ? (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>مدير النظام لديه صلاحية الوصول لكافة الفروع تلقائياً</span>
              </div>
            ) : (
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="mono-input"
              >
                {branches.map(b => (
                  <option key={b._id || b.id} value={b._id || b.id} className="bg-zinc-900 text-white">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            )}
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
              disabled={createUserMutation.isPending}
              className="mono-btn-primary text-xs"
            >
              {createUserMutation.isPending ? 'جاري الإضافة...' : 'حفظ المستخدم'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
