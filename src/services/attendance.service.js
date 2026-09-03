import { apiFetch } from './api';

export const attendanceService = {
  getAttendance: async (branchId = 'all', month = 9, year = 2026) => {
    let query = '?';
    if (branchId && branchId !== 'all') query += `branchId=${branchId}&`;
    if (month && year) query += `month=${month}&year=${year}&`;

    const res = await apiFetch(`/attendance${query}`);
    return res.data || [];
  }
};
