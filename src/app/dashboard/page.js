'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  useBranches, 
  useBranchPerformance, 
  usePatients, 
  useFinancialAnalytics, 
  useAdvances, 
  useOutstandingPayments 
} from '../../hooks/useDashboardQueries';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import AddBranchModal from '../../components/modals/AddBranchModal';
import AddUserModal from '../../components/modals/AddUserModal';
import { 
  GitFork, 
  Users, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  AlertCircle,
  Plus,
  UserPlus as UserPlusIcon,
  ArrowUpDown,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function SuperAdminDashboardPage() {
  const user = useAuthStore(s => s.user);
  const { selectedBranchId, openModal, activeModal } = useUIStore();

  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: performance = [], isLoading: loadingPerformance } = useBranchPerformance();
  const { data: patients = [], isLoading: loadingPatients } = usePatients(selectedBranchId);
  const { data: finance, isLoading: loadingFinance } = useFinancialAnalytics(selectedBranchId);
  const { data: advancesData, isLoading: loadingAdvances } = useAdvances(selectedBranchId);
  const { data: outstandingData, isLoading: loadingOutstanding } = useOutstandingPayments(selectedBranchId);

  const isLoading = loadingBranches || loadingPerformance || loadingPatients || loadingFinance || loadingAdvances || loadingOutstanding;

  // Table sorting state
  const [sortField, setSortField] = useState('netRevenue');
  const [sortAsc, setSortAsc] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const activeBranchesCount = branches.filter(b => b.status === 'نشط' || b.status === 'active').length;
  const currentPatientsCount = patients.filter(p => p.status !== 'خرج' && p.status !== 'discharged').length;
  const newPatientsCount = patients.filter(p => {
    if (p.status === 'جديد' || p.status === 'new') return true;
    const entryDate = p.entryDate ? new Date(p.entryDate) : (p.createdAt ? new Date(p.createdAt) : null);
    if (entryDate && !isNaN(entryDate.getTime())) {
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    }
    return false;
  }).length;

  const totalRevenue = finance?.totals?.totalIncome || 0;
  const totalExpenses = finance?.totals?.totalExpenses || 0;
  const netRevenue = finance?.totals?.netRevenue || 0;
  const totalAdvances = finance?.totals?.advancesTotal || advancesData?.totals?.month || 0;
  const totalOutstanding = outstandingData?.totalRemaining || 0;

  // Sorting Handler
  const sortedPerformance = [...performance].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (valA === undefined) valA = 0;
    if (valB === undefined) valB = 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const categoryData = finance?.categoryData?.length ? finance.categoryData : [
    { name: 'أكل', amount: 0 },
    { name: 'أدوية', amount: 0 },
    { name: 'مرافق', amount: 0 },
    { name: 'صيانة', amount: 0 },
    { name: 'مستلزمات', amount: 0 },
    { name: 'سلف', amount: totalAdvances || 0 },
    { name: 'أخرى', amount: 0 }
  ];

  const trendData = finance?.trendData?.length ? finance.trendData : [
    { name: 'الشهر الحالي', revenue: totalRevenue, expense: totalExpenses }
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              لوحة التحكم الرئيسية — Super Admin
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              تحكم شامل
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            متابعة أداء كافة الفروع، التدفقات المالية الشاملة، والتحليلات المركزية المنظومية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('ADD_BRANCH')}
            className="mono-btn-primary text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            إنشاء فرع جديد
          </button>
          <button
            onClick={() => openModal('ADD_USER')}
            className="mono-btn-secondary text-sm"
          >
            <UserPlusIcon className="w-4 h-4" />
            إضافة مستخدم
          </button>
        </div>
      </div>

      {/* Section 1: 8 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: الفروع */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي الفروع</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {isLoading ? '...' : formatNumber(branches.length)}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">{activeBranchesCount} فرع نشط</span>
          </div>
        </div>

        {/* Card 2: النزلاء الحاليين */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">النزلاء الحاليون (كافة الفروع)</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {isLoading ? '...' : formatNumber(currentPatientsCount)}
            </span>
            <span className="text-xs text-zinc-400">نزيل بالمصحات</span>
          </div>
        </div>

        {/* Card 3: دخول جديد */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">النزلاء الجدد هذا الشهر</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {isLoading ? '...' : formatNumber(newPatientsCount)}
            </span>
            <span className="text-xs text-zinc-400">دخول جديد</span>
          </div>
        </div>

        {/* Card 4: إجمالي الإيرادات */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي الإيرادات المجمعة</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {isLoading ? '...' : formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Card 5: إجمالي المصروفات */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي المصروفات الشاملة</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {isLoading ? '...' : formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Card 6: صافي الأرباح */}
        <div className="mono-card p-5 border-zinc-700 bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">صافي الإيرادات العامة</span>
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {isLoading ? '...' : formatCurrency(netRevenue)}
            </span>
          </div>
        </div>

        {/* Card 7: إجمالي السلف */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">إجمالي السلف الشاملة</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {isLoading ? '...' : formatCurrency(totalAdvances)}
            </span>
          </div>
        </div>

        {/* Card 8: المبالغ المتبقية */}
        <div className="mono-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">مستحقات النزلاء المتبقية</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              {isLoading ? '...' : formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>

      </div>

      {/* Section 2: Branch Performance Comparison Table */}
      <div className="mono-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              مقارنة أداء الفروع الشامل
            </h2>
            <p className="text-xs text-zinc-400">جدول مقارنة التدفقات المالية والنشاط بين مختلف الفروع</p>
          </div>
          <Link
            href="/dashboard/branches"
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 self-start sm:self-auto"
          >
            إدارة الفروع بالتفصيل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="mono-table-th">اسم الفرع</th>
                <th 
                  onClick={() => handleSort('revenues')}
                  className="mono-table-th cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>الإيرادات</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('expenses')}
                  className="mono-table-th cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>المصروفات</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('netRevenue')}
                  className="mono-table-th cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>الصافي</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('activePatients')}
                  className="mono-table-th cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>النزلاء الحاليين</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('totalAdvances')}
                  className="mono-table-th cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>إجمالي السلف</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="mono-table-th">الحالة</th>
                <th className="mono-table-th text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedPerformance.map(branch => (
                <tr key={branch.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="mono-table-td font-bold text-white">
                    <Link href={`/dashboard/branches/${branch.id}`} className="hover:underline">
                      {branch.name}
                    </Link>
                  </td>
                  <td className="mono-table-td text-emerald-400 font-semibold">
                    {formatCurrency(branch.revenues)}
                  </td>
                  <td className="mono-table-td text-rose-400 font-semibold">
                    {formatCurrency(branch.expenses)}
                  </td>
                  <td className="mono-table-td font-black text-white">
                    {formatCurrency(branch.netRevenue)}
                  </td>
                  <td className="mono-table-td font-semibold text-zinc-300">
                    {branch.activePatients} نزيل
                  </td>
                  <td className="mono-table-td text-zinc-400">
                    {formatCurrency(branch.totalAdvances)}
                  </td>
                  <td className="mono-table-td">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      branch.status === 'نشط' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="mono-table-td text-center">
                    <Link
                      href={`/dashboard/branches/${branch.id}`}
                      className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 rounded-lg inline-block font-medium"
                    >
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Financial Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: الإيرادات والمصروفات Trend */}
        <div className="mono-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">مقارنة حركة التدفقات المالية الإجمالية</h2>
              <p className="text-xs text-zinc-400">الإيرادات مقابل المصروفات عبر الشهور الأخيرة</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-white rounded-sm inline-block" />
                <span>الإيرادات</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-zinc-600 rounded-sm inline-block" />
                <span>المصروفات</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52525b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#52525b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#71717a" tickLine={false} fontSize={12} />
                <YAxis stroke="#71717a" tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${val} جنيه`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expense" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: المصروفات حسب التصنيف Bar Chart */}
        <div className="mono-card p-6 space-y-4">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-white">توزيع المصروفات</h2>
            <p className="text-xs text-zinc-400">المصروفات والسلف حسب التصنيف</p>
          </div>

          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" tickLine={false} fontSize={11} />
                <YAxis stroke="#71717a" tickLine={false} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${val} جنيه`, 'المبلغ']}
                />
                <Bar dataKey="amount" fill="#ffffff" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Modals rendering */}
      {activeModal === 'ADD_BRANCH' && <AddBranchModal />}
      {activeModal === 'ADD_USER' && <AddUserModal />}

    </div>
  );
}
