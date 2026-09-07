import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '../services/patients.service';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const usePatients = (branchId = 'all', search = '', statusFilter = 'ALL') => {
  return useQuery({
    queryKey: ['patients', branchId, search, statusFilter],
    queryFn: () => patientsService.getPatients(branchId, search, statusFilter)
  });
};

export const usePatientDetails = (patientId) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientsService.getPatientById(patientId),
    enabled: !!patientId
  });
};

export const useAddPatient = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: ({ data, branchId }) => patientsService.addPatient(data, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      showToast('تمت إضافة النزيل الجديد بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء إضافة النزيل', 'error');
    }
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: (data) => patientsService.addPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showToast('تم إضافة الدفعة بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء تسجيل الدفعة', 'error');
    }
  });
};

export const useAddPatientExpense = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: (data) => patientsService.addPatientExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showToast('تم إضافة مصروف النزيل بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء تسجيل المصروف', 'error');
    }
  });
};

export const useDischargePatient = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: ({ patientId, exitDate }) => patientsService.dischargePatient(patientId, exitDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showToast('تم تسجيل خروج النزيل بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء تسجيل خروج النزيل', 'error');
    }
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: (patientId) => patientsService.deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showToast('تم حذف النزيل نهائياً بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء حذف النزيل', 'error');
    }
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore(s => s.showToast);

  return useMutation({
    mutationFn: ({ id, data }) => patientsService.updatePatient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showToast('تم تحديث بيانات النزيل بنجاح', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'حدث خطأ أثناء تعديل بيانات النزيل', 'error');
    }
  });
};
