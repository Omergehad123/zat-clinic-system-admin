import { apiFetch, getAuthToken } from './api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const reportsService = {
  getMonthlyReport: async (month = 9, year = 2026, branchId = 'all') => {
    let query = `?month=${month}&year=${year}`;
    if (branchId && branchId !== 'all') {
      query += `&branchId=${branchId}`;
    }
    const res = await apiFetch(`/reports/monthly${query}`);
    const data = res.data || {};
    const exp = data.expenseBreakdown || {};

    const categoryBreakdown = [
      { name: 'أكل', value: exp.Food || 0 },
      { name: 'أدوية', value: exp.Medicine || 0 },
      { name: 'مرافق', value: exp.Utilities || 0 },
      { name: 'صيانة', value: exp.Maintenance || 0 },
      { name: 'مستلزمات', value: exp.Supplies || 0 },
      { name: 'سلف', value: exp.Advances || 0 },
      { name: 'أخرى', value: exp.Other || 0 },
    ];

    return {
      totals: {
        totalRevenue: data.totalIncome || 0,
        totalExpenses: data.totalExpenses || 0,
        netRevenue: data.netIncome || 0,
        totalAdvances: data.employeeMetrics?.advancesTotal || exp.Advances || 0,
        totalOutstanding: data.patientMetrics?.outstandingPayments || 0
      },
      categoryBreakdown,
      raw: data
    };
  },

  getOutstandingPaymentsReport: async (branchId = 'all') => {
    let query = '?';
    if (branchId && branchId !== 'all') {
      query += `branchId=${branchId}&`;
    }
    const res = await apiFetch(`/patients${query}`);
    const patients = res.data || [];

    let totalRemaining = 0;
    const list = [];

    patients.forEach(p => {
      const remaining = Number(p.financials?.remaining) || Number(p.remaining) || 0;
      if (remaining > 0) {
        totalRemaining += remaining;
        list.push({
          id: p._id || p.id,
          patientName: p.name,
          branchName: p.branchName || 'الفرع الرئيسي',
          entryDate: p.entryDate || p.createdAt,
          stayValue: Number(p.financials?.stayValue) || Number(p.stayValue) || 0,
          paid: Number(p.financials?.paid) || Number(p.paid) || 0,
          remaining,
          notes: p.notes || ''
        });
      }
    });

    return {
      totalRemaining,
      list
    };
  },

  getBranchComparison: async (month, year) => {
    let query = `?month=${month}&year=${year}`;
    const res = await apiFetch(`/reports/comparison${query}`);
    return res.data;
  },

  exportToExcel: async (month = 9, year = 2026, branchId = 'all') => {
    const token = getAuthToken();
    let query = `?month=${month}&year=${year}`;
    if (branchId && branchId !== 'all') {
      query += `&branchId=${branchId}`;
    }

    const response = await fetch(`${BASE_URL}/reports/excel${query}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('فشل تصدير التقرير');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monthly_Report_${month}_${year}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
