import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrimeIntel — Internal Project Estimation Engine',
  description: 'Enterprise AI requirement extraction and deterministic project pricing engine for PrimeCore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
