'use client';

import { useState } from 'react';
import { 
  useUsers, 
  useBranches, 
  useBranchManagers, 
  useToggleUserStatus 
} from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import { ROLE_LABELS } from '../../../utils/permissions';
import AddUserModal from '../../../components/modals/AddUserModal';
import ResetPasswordModal from '../../../components/modals/ResetPasswordModal';
import { 
  UserCog, 
  Plus, 
  Search, 
  ShieldCheck, 
  KeyRound, 
  Power, 
  Building2, 
  Filter 
} from 'lucide-react';

export default function UserManagementPage() {
  const { openModal, activeModal, showToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const { data: users = [], isLoading } = useUsers({
    search,
    role: roleFilter,
    branchId: branchFilter
  });

  const { data: branches = [] } = useBranches();
  const { data: branchManagers = [] } = useBranchManagers();
  const toggleUserStatusMutation = useToggleUserStatus();

  const handleToggleStatus = async (id, name) => {
    try {
      const res = await toggleUserStatusMutation.mutateAsync(id);
      showToast(`تم ${res.status === 'معطل' ? 'تعطيل' : 'تفعيل'} حساب "${name}" بنجاح`);
    } catch (err) {
      showToast('حدث خطأ أثناء تغيير حالة المستخدم', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-400" />
            إدارة المستخدمين والصلاحيات — Users Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            إدارة كافة حسابات مستخدمي المنظومة، مدراء الفروع، والأدوار الوظيفية
          </p>
        </div>

        <button
          onClick={() => openModal('ADD_USER')}
          className="mono-btn-primary text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Branch Managers Card Grid Section */}
      <div className="mono-card p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          مدراء الفروع المباشرين (Branch Managers)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchManagers.map(bm => (
            <div key={bm.branchId} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{bm.branchName}</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  bm.branchStatus === 'نشط' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {bm.branchStatus}
                </span>
              </div>
              
              <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <span>المدير:</span>
                <span className="font-bold text-zinc-200">
                  {bm.manager ? bm.manager.name : 'غير معين'}
                </span>
              </div>
              
              {bm.manager && (
                <div className="text-[11px] text-zinc-500 text-left font-mono dir-ltr truncate">
                  {bm.manager.email}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mono-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالاسم أو الإيميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input pr-9"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3.5" />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل الدور الوظيفي</option>
            {Object.keys(ROLE_LABELS).map(rk => (
              <option key={rk} value={rk} className="bg-zinc-900 text-white">
                {ROLE_LABELS[rk]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="mono-input"
          >
            <option value="all" className="bg-zinc-900 text-white">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">الاسم الكامل</th>
                <th className="mono-table-th">البريد الإلكتروني</th>
                <th className="mono-table-th">الدور / الصلاحية</th>
                <th className="mono-table-th">الفرع المنسوب إليه</th>
                <th className="mono-table-th">الحالة</th>
                <th className="mono-table-th text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">جاري التحميل...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">لا يوجد مستخدمين مطابقين للبحث</td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-bold text-white">{u.name}</td>
                  <td className="mono-table-td font-mono dir-ltr text-zinc-300 text-left">{u.email}</td>
                  <td className="mono-table-td">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md">
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="mono-table-td text-zinc-300">{u.branchName}</td>
                  <td className="mono-table-td">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      u.status === 'نشط' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="mono-table-td text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal('RESET_PASSWORD', u)}
                        title="إعادة تعيين كلمة المرور"
                        className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        كلمة السر
                      </button>

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.name)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'نشط'
                              ? 'bg-zinc-900 border-zinc-700 text-rose-400 hover:bg-rose-950/40'
                              : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                          }`}
                          title={u.status === 'نشط' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'ADD_USER' && <AddUserModal />}
      {activeModal === 'RESET_PASSWORD' && <ResetPasswordModal />}

    </div>
  );
}
