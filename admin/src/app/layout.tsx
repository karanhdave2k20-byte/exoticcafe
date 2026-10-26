import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import AdminShell from '../components/AdminShell';

export const metadata: Metadata = {
  title: 'TableHive Admin Portal',
  description: 'Authorized management for tables, live orders, menu catalog, payments, customer insights, and AI analytics.',
  icons: {
    icon: '/tablehive_logo.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8FAFC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="antialiased selection:bg-caramel-500 selection:text-white bg-crema-50 text-roast-900 min-h-screen">
        <StoreProvider>
          <AdminShell>
            {children}
          </AdminShell>
        </StoreProvider>
      </body>
    </html>
  );
}
