import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'HCM UAE - Human Capital Management',
  description: 'UAE-compliant Human Capital Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
