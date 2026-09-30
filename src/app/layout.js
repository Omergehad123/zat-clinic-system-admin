import './globals.css';
import Providers from '../components/providers/Providers';

export const metadata = {
  title: 'Super Admin Dashboard — لوحة تحكم مدير المنظومة',
  description: 'نظام إدارة الفروع والمستخدمين والتقارير المالية والنزلاء لمنظومة المصحات الطبية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
