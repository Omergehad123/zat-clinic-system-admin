'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = response.user;

      if (user.role === 'super_admin') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">نظام إدارة المصحة الطبية</h1>
          <p className="text-sm text-zinc-400">تسجيل الدخول الموحد لمنظومة الفروع والإدارة العليا</p>
        </div>

        {/* Login Card */}
        <div className="mono-card p-6 md:p-8 space-y-6 shadow-2xl">
          
          {error && (
            <div className="p-3.5 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinic.com"
                  className="mono-input pl-10 dir-ltr text-right"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mono-input pl-10 dir-ltr text-right"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mono-btn-primary py-3 font-bold text-sm shadow-lg mt-2"
            >
              {loading ? (
                <span>جاري التحقق...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  تسجيل الدخول
                  <ArrowLeft className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Preset Demo Accounts */}
          <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
            <p className="font-semibold text-zinc-300 text-center">حسابات تجريبية للاختبار:</p>
            <div className="grid grid-cols-1 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => { setEmail('admin@clinic.com'); setPassword('123456'); }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 text-zinc-300 flex items-center justify-between px-3"
              >
                <span className="font-medium text-emerald-400">مدير النظام (Super Admin)</span>
                <span className="text-[11px] text-zinc-500">admin@clinic.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('manager@clinic.com'); setPassword('123456'); }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 text-zinc-300 flex items-center justify-between px-3"
              >
                <span className="font-medium text-blue-400">مدير فرع مدينة نصر</span>
                <span className="text-[11px] text-zinc-500">manager@clinic.com</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
