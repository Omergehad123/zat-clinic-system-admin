'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useBranches, useUpdateEmployee } from '../../hooks/useDashboardQueries';
import { X, UserCheck } from 'lucide-react';

export default function EditEmployeeModal() {
  const { modalData, closeModal, showToast } = useUIStore();
  const updateMutation = useUpdateEmployee();
  const { data: branches = [] } = useBranches();

  const [name, setName] = useState('');
  const [role, setRole] = useState('doctor');
  const [specialization, setSpecialization] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalData) {
      setName(modalData.name || '');
      setRole(modalData.role || (modalData.type === 'دكتور' ? 'doctor' : modalData.type === 'تمريض' ? 'nurse' : modalData.type === 'مشرف' ? 'supervisor' : 'worker'));
      setSpecialization(modalData.specialization !== '-' ? (modalData.specialization || '') : '');
      setBranchId(modalData.branchId || '');
      setStatus(modalData.status === 'نشط' ? 'active' : (modalData.status === 'معطل' ? 'inactive' : (modalData.status || 'active')));
    }
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('اسم الموظف مطلوب');
      return;
    }
    try {
      const id = modalData?.id || modalData?._id;
      await updateMutation.mutateAsync({
        id,
        employeeData: {
          name: name.trim(),
          role,
          specialization: role === 'doctor' ? specialization : undefined,
          branchId: branchId || undefined,
          status
        }
      });
      showToast(`تم تعديل بيانات الموظف "${name}" بنجاح`, 'success');
      closeModal();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تعديل بيانات الموظف');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="mono-card w-full max-w-md p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right dir-rtl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">تعديل بيانات الموظف</h2>
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الاسم *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mono-input text-sm"
              placeholder="اسم الموظف"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الوظيفة *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mono-input text-sm"
            >
              <option value="doctor" className="bg-zinc-900 text-white">دكتور</option>
              <option value="nurse" className="bg-zinc-900 text-white">تمريض</option>
              <option value="supervisor" className="bg-zinc-900 text-white">مشرف</option>
              <option value="worker" className="bg-zinc-900 text-white">عامل / سائق</option>
            </select>
          </div>

          {role === 'doctor' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">التخصص</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="mono-input text-sm"
                placeholder="مثال: جراحة العظام، أطفال..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">الفرع</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="mono-input text-sm"
            >
              <option value="" className="bg-zinc-900 text-white">-- بدون تحديد فرع --</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">حالة العمل</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mono-input text-sm"
            >
              <option value="active" className="bg-zinc-900 text-white">نشط (على رأس العمل)</option>
              <option value="inactive" className="bg-zinc-900 text-white">معطل / غير نشط</option>
            </select>
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
