import React from 'react';
import ReactQueryProvider from '@/utils/providers/ReactQueryProvider.tsx';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metdata = {
  title: 'BookWorm',
  description: 'Untitled.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
