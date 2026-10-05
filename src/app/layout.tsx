import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrimeIntel — Internal Project Estimation Engine',
  description: 'Enterprise project estimation intelligence and deterministic pricing engine for PrimeCore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased font-sans selection:bg-primary-subtle selection:text-primary">
        {children}
      </body>
    </html>
  );
}
