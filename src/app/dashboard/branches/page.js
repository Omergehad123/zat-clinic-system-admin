'use client';

import Link from 'next/link';
import { useBranches, useBranchManagers, useToggleBranchStatus } from '../../../hooks/useDashboardQueries';
import { useUIStore } from '../../../store/useUIStore';
import AddBranchModal from '../../../components/modals/AddBranchModal';
import EditBranchModal from '../../../components/modals/EditBranchModal';
import DeleteBranchModal from '../../../components/modals/DeleteBranchModal';
import { GitFork, Plus, Phone, MapPin, ShieldCheck, ExternalLink, Power, Pencil, Trash2 } from 'lucide-react';

export default function BranchManagementPage() {
  const { openModal, activeModal, showToast } = useUIStore();
  const { data: branches = [], isLoading } = useBranches();
  const { data: managersInfo = [] } = useBranchManagers();
  const toggleBranchStatusMutation = useToggleBranchStatus();

  const handleToggleStatus = async (id, currentName) => {
    try {
      const res = await toggleBranchStatusMutation.mutateAsync(id);
      const isNowInactive = res.status === 'inactive' || res.status === 'معطل';
      showToast(`تم ${isNowInactive ? 'تعطيل' : 'تفعيل'} الفرع "${currentName}" بنجاح`);
    } catch (err) {
      showToast('حدث خطأ أثناء تغيير حالة الفرع', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GitFork className="w-6 h-6 text-emerald-400" />
            إدارة الفروع — Branch Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            إضافة وتعديل وتعطيل فروع المنظومة وتعيين مدراء الفروع المباشرين
          </p>
        </div>

        <button
          onClick={() => openModal('ADD_BRANCH')}
          className="mono-btn-primary text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          إضافة فرع جديد
        </button>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-500">جاري تحميل الفروع...</div>
        ) : branches.map(branch => {
          const managerName = branch.manager?.name || (branch.managerName && branch.managerName !== 'لا يوجد مدير' ? branch.managerName : null) || managersInfo.find(m => m.branchId === branch.id)?.manager?.name || 'غير معين';
          const isActive = branch.status === 'active' || branch.status === 'نشط';

          return (
            <div key={branch.id} className="mono-card p-6 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                    {branch.code || 'BRANCH'}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{branch.address || 'العنوان غير محدد'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      الهاتف:
                    </span>
                    <span className="font-mono text-zinc-200 dir-ltr">{branch.phone || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      مدير الفرع:
                    </span>
                    <span className="font-bold text-white">
                      {managerName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleToggleStatus(branch.id, branch.name)}
                    disabled={toggleBranchStatusMutation.isPending}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-zinc-900 border-zinc-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-700'
                        : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                    title={isActive ? 'تعطيل الفرع' : 'تفعيل الفرع'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? 'تعطيل' : 'تفعيل'}</span>
                  </button>

                  <button
                    onClick={() => openModal('EDIT_BRANCH', branch)}
                    className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg flex items-center gap-1 transition-colors"
                    title="تعديل بيانات الفرع"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => openModal('DELETE_BRANCH', branch)}
                    className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700 hover:border-rose-800 hover:bg-rose-950/30 text-rose-400 rounded-lg flex items-center gap-1 transition-colors"
                    title="حذف الفرع"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <Link
                  href={`/dashboard/branches/${branch.id}`}
                  className="px-3 py-1.5 text-xs bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0"
                >
                  التفاصيل
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {activeModal === 'ADD_BRANCH' && <AddBranchModal />}
      {activeModal === 'EDIT_BRANCH' && <EditBranchModal />}
      {activeModal === 'DELETE_BRANCH' && <DeleteBranchModal />}

    </div>
  );
}
