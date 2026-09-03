'use client';

import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useCreateBranch } from '../../hooks/useDashboardQueries';
import { X, GitFork, User, Mail, Lock, Building2 } from 'lucide-react';

export default function AddBranchModal() {
  const closeModal = useUIStore(s => s.closeModal);
  const showToast = useUIStore(s => s.showToast);

  const createBranchMutation = useCreateBranch();

  // Branch form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Manager creation state
  const [createManager, setCreateManager] = useState(true);
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('123456');

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('اسم الفرع مطلوب');
      return;
    }

    if (createManager && (!managerName.trim() || !managerEmail.trim())) {
      setError('يرجى كتابة اسم وإيميل مدير الفرع');
      return;
    }

    try {
      const branchData = { name, code, phone, address };
      const managerData = createManager ? {
        name: managerName,
        email: managerEmail,
        password: managerPassword
      } : null;

      await createBranchMutation.mutateAsync({ branchData, managerData });

      showToast(createManager ? 'تم إنشاء الفرع وتعيين مدير الفرع بنجاح' : 'تم إنشاء الفرع بنجاح');
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الفرع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-lg p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">إضافة فرع جديد للمنظومة</h2>
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
          
          {/* Branch Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">بيانات الفرع</h3>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم الفرع *</label>
              <input
                type="text"
                required
                placeholder="مثال: فرع الشيخ زايد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mono-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">كود الفرع (اختياري)</label>
                <input
                  type="text"
                  placeholder="SZ-04"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mono-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="01000000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mono-input dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">العنوان</label>
              <input
                type="text"
                placeholder="تفاصيل العنوان..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mono-input"
              />
            </div>
          </div>

          {/* Branch Manager Toggle */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createManager}
                onChange={(e) => setCreateManager(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0"
              />
              <span className="text-xs font-bold text-emerald-400">
                إنشاء حساب مدير الفرع (Branch Manager) تلقائياً لهذا الفرع
              </span>
            </label>

            {createManager && (
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم مدير الفرع *</label>
                  <input
                    type="text"
                    required={createManager}
                    placeholder="مثال: د. محمد سامي"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="mono-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">البريد الإلكتروني لمدير الفرع *</label>
                  <input
                    type="email"
                    required={createManager}
                    placeholder="manager.sz@clinic.com"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="mono-input dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">كلمة المرور الإفتراضية</label>
                  <input
                    type="text"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    className="mono-input dir-ltr text-right"
                  />
                </div>
              </div>
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
              disabled={createBranchMutation.isPending}
              className="mono-btn-primary text-xs"
            >
              {createBranchMutation.isPending ? 'جاري الحفظ...' : 'حفظ الفرع الجديد'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
