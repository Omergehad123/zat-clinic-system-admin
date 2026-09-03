import { apiFetch } from './api';

export const advancesService = {
  getAdvances: async (branchIdOrFilters = 'all', search = '', role = 'ALL', date = '') => {
    let query = '?';
    if (typeof branchIdOrFilters === 'object' && branchIdOrFilters !== null) {
      const f = branchIdOrFilters;
      if (f.branchId && f.branchId !== 'all') query += `branchId=${f.branchId}&`;
      if (f.employeeId) query += `employeeId=${f.employeeId}&`;
      if (f.month && f.year) query += `month=${f.month}&year=${f.year}&`;
    } else {
      if (branchIdOrFilters && branchIdOrFilters !== 'all') query += `branchId=${branchIdOrFilters}&`;
    }

    const res = await apiFetch(`/advances${query}`);
    const rawAdvances = res.data || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayTotal = 0;
    let monthTotal = 0;
    let grandTotal = 0;

    const filtered = rawAdvances.filter(adv => {
      // Search filter
      if (search && search.trim() !== '') {
        const empName = adv.employeeName || '';
        if (!empName.toLowerCase().includes(search.toLowerCase().trim())) {
          return false;
        }
      }

      // Role filter
      if (role && role !== 'ALL') {
        let targetRole = role;
        if (role === 'دكتور' || role === 'طبيب') targetRole = 'doctor';
        else if (role === 'تمريض') targetRole = 'nurse';
        else if (role === 'مشرف') targetRole = 'supervisor';
        else if (role === 'عامل') targetRole = 'worker';

        if (adv.role !== targetRole && adv.employeeType !== role) {
          return false;
        }
      }

      return true;
    });

    rawAdvances.forEach(adv => {
      const amt = Number(adv.amount) || 0;
      grandTotal += amt;

      const advDate = adv.date ? new Date(adv.date) : null;
      if (advDate && !isNaN(advDate.getTime())) {
        const dateStr = advDate.toISOString().split('T')[0];
        if (dateStr === todayStr) {
          todayTotal += amt;
        }
        if (advDate.getMonth() === currentMonth && advDate.getFullYear() === currentYear) {
          monthTotal += amt;
        }
      }
    });

    return {
      advances: filtered,
      totalAmount: grandTotal,
      totals: {
        today: todayTotal,
        month: monthTotal || grandTotal,
        total: grandTotal
      },
      roleTotals: res.roleTotals || {}
    };
  },

  createAdvance: async (advanceData) => {
    const res = await apiFetch('/advances', {
      method: 'POST',
      body: JSON.stringify(advanceData)
    });
    return res.data;
  },

  addAdvance: async (advanceData) => {
    return advancesService.createAdvance(advanceData);
  }
};
