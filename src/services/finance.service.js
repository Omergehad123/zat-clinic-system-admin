import { apiFetch } from './api';

export const financeService = {
  getTransactions: async (filters = {}) => {
    let query = '?';
    if (filters.branchId && filters.branchId !== 'all') {
      query += `branchId=${filters.branchId}&`;
    }
    if (filters.type) {
      query += `type=${filters.type}&`;
    }
    if (filters.category) {
      query += `category=${filters.category}&`;
    }
    if (filters.month && filters.year) {
      query += `month=${filters.month}&year=${filters.year}&`;
    }
    const res = await apiFetch(`/transactions${query}`);
    return {
      transactions: res.data || [],
      summary: res.summary || { totalIncome: 0, totalExpenses: 0, netIncome: 0 }
    };
  },

  getFinanceData: async (branchId = 'all', filters = {}) => {
    let query = '?';
    if (branchId && branchId !== 'all') {
      query += `branchId=${branchId}&`;
    }
    const res = await apiFetch(`/transactions${query}`);
    const rawTransactions = res.data || [];

    let totalIncome = 0;
    let totalExpenses = 0;
    let advancesTotal = 0;

    const categoriesMap = {
      'أكل': 0,
      'أدوية': 0,
      'مرافق': 0,
      'صيانة': 0,
      'مستلزمات': 0,
      'سلف': 0,
      'أخرى': 0
    };

    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyMap = {};

    const formattedTransactions = [];

    rawTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const d = t.date ? new Date(t.date) : new Date();
      const monthIdx = d.getMonth();
      const monthLabel = monthNamesAr[monthIdx] || 'شهر';

      let typeAr = t.type === 'income' ? 'إيراد' : 'مصروف';
      let catAr = 'أخرى';
      const cat = t.category || '';

      if (cat === 'Accommodation' || cat === 'إقامة' || cat.includes('إقامة')) {
        catAr = 'إيرادات إقامة';
      } else if (cat === 'Employee Advances' || cat.includes('سلف')) {
        catAr = 'سلف';
      } else if (cat === 'Food' || cat.includes('أكل')) {
        catAr = 'أكل';
      } else if (cat === 'Medicine' || cat.includes('أدوية')) {
        catAr = 'أدوية';
      } else if (cat === 'Utilities' || cat.includes('مرافق')) {
        catAr = 'مرافق';
      } else if (cat === 'Maintenance' || cat.includes('صيانة')) {
        catAr = 'صيانة';
      } else if (cat === 'Supplies' || cat.includes('مستلزمات')) {
        catAr = 'مستلزمات';
      }

      if (!monthlyMap[monthIdx]) {
        monthlyMap[monthIdx] = { name: monthLabel, revenue: 0, expense: 0, sortKey: monthIdx };
      }

      if (t.type === 'income') {
        totalIncome += amt;
        monthlyMap[monthIdx].revenue += amt;
      } else if (t.type === 'expense') {
        totalExpenses += amt;
        monthlyMap[monthIdx].expense += amt;

        if (catAr === 'سلف') {
          advancesTotal += amt;
          categoriesMap['سلف'] += amt;
        } else if (catAr === 'أكل') {
          categoriesMap['أكل'] += amt;
        } else if (catAr === 'أدوية') {
          categoriesMap['أدوية'] += amt;
        } else if (catAr === 'مرافق') {
          categoriesMap['مرافق'] += amt;
        } else if (catAr === 'صيانة') {
          categoriesMap['صيانة'] += amt;
        } else if (catAr === 'مستلزمات') {
          categoriesMap['مستلزمات'] += amt;
        } else {
          categoriesMap['أخرى'] += amt;
        }
      }

      const formattedItem = {
        id: t._id || t.id,
        _id: t._id || t.id,
        type: typeAr,
        rawType: t.type,
        title: t.description || t.title || 'معاملة مالية',
        category: catAr,
        branchName: t.branchId?.name || t.branchName || 'الفرع الرئيسي',
        amount: amt,
        date: t.date || t.createdAt,
        createdBy: t.createdBy?.name || t.createdBy || 'النظام'
      };

      // Filter check for finance page
      let keep = true;
      if (filters.kind && filters.kind !== 'all') {
        if (filters.kind !== typeAr) keep = false;
      }
      if (filters.category && filters.category !== 'all') {
        if (filters.category !== catAr) keep = false;
      }

      if (keep) {
        formattedTransactions.push(formattedItem);
      }
    });

    const categoryData = Object.keys(categoriesMap).map(k => ({
      name: k,
      amount: categoriesMap[k]
    }));

    const trendData = Object.values(monthlyMap).sort((a, b) => a.sortKey - b.sortKey);

    return {
      totals: {
        totalIncome,
        totalExpenses,
        netRevenue: totalIncome - totalExpenses,
        advancesTotal
      },
      categoryData,
      trendData,
      transactions: formattedTransactions
    };
  },

  createExpense: async (expenseData) => {
    const res = await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
    return res.data;
  }
};
