import { apiFetch } from './api';

export const branchesService = {
  getBranches: async () => {
    const res = await apiFetch('/branches');
    return res.data || [];
  },

  getBranchById: async (id) => {
    const res = await apiFetch(`/branches/${id}`);
    return res.data;
  },

  createBranch: async (branchData, managerData = null) => {
    const body = {
      name: branchData.name,
      address: branchData.address || '',
      phone: branchData.phone || '',
      managerName: managerData?.name,
      managerEmail: managerData?.email,
      managerPassword: managerData?.password
    };
    const res = await apiFetch('/branches', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return { branch: res.data, manager: res.data.manager };
  },

  updateBranch: async (id, branchData) => {
    const res = await apiFetch(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData)
    });
    return res.data;
  },

  toggleBranchStatus: async (id) => {
    const branch = await branchesService.getBranchById(id);
    const newStatus = branch.status === 'active' || branch.status === 'نشط' ? 'inactive' : 'active';
    const res = await apiFetch(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    return res.data;
  },

  deleteBranch: async (id) => {
    const res = await apiFetch(`/branches/${id}?permanent=true`, {
      method: 'DELETE'
    });
    return res;
  },

  getBranchPerformance: async () => {
    const res = await apiFetch('/reports/comparison');
    return (res.data || []).map(b => ({
      id: b.branchId,
      name: b.branchName,
      status: b.status || 'نشط',
      revenues: b.income,
      expenses: b.expenses,
      netRevenue: b.netIncome,
      activePatients: b.patientsCount,
      totalAdvances: b.advancesTotal
    }));
  }
};
