import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import ClientShell from '../components/ClientShell';

export const metadata: Metadata = {
  title: 'TableHive | Exotic Café Collaborative Social Dining',
  description: 'A premium, real-time social dining and café experience. Scan your table QR, order together, split bills, and enjoy live entertainment.',
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
      <body className="antialiased selection:bg-caramel-500 selection:text-white bg-crema-50 text-roast-900">
        <StoreProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </StoreProvider>
      </body>
    </html>
  );
}
