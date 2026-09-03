'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const token = useAuthStore(s => s.token);
  const checkAuth = useAuthStore(s => s.checkAuth);
  const toast = useUIStore(s => s.toast);
  const hideToast = useUIStore(s => s.hideToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token && !isAuthenticated) {
      router.push('/login');
    } else {
      checkAuth();
    }
  }, [token, isAuthenticated]);

  if (!mounted || (!isAuthenticated && !token)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-cairo">
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          onClick={hideToast}
          className={`
            fixed bottom-5 left-5 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold cursor-pointer transition-all animate-bounce
            ${toast.type === 'error' ? 'bg-red-950 border-red-700 text-red-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'}
          `}
        >
          {toast.message}
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pr-64 flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
