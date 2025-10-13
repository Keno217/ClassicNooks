import React from 'react';
import ReactQueryProvider from '@/utils/providers/ReactQueryProvider.tsx';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClassicNooks | Free Online Library & Reading App',
  description: 'Discover and read your favorite books',
  keywords: [
    'classicnooks',
    'classic',
    'nook',
    'books',
    'reading',
    'free ebooks',
    'online library',
    'book discovery',
    'book tracker',
    'Kenan Velagic',
    'reading app',
    'digital bookshelf',
    'literature',
    'authors',
    'novels',
    'classic books',
    'book collections',
  ],
  authors: [{ name: 'Kenan Velagic', url: 'https://kvelagic.com' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'ClassicNooks | Free Online Library & Reading App',
    description: 'Discover and read your favorite books',
    url: 'https://www.classicnooks.com',
    siteName: 'ClassicNooks',
    type: 'website',
    images: [
      {
        url: '/icons/heroImage.jpg',
        width: 1200,
        height: 630,
        alt: 'ClassicNooks App Preview',
      },
    ],
  },
  icons: {
    icon: '/icons/booksIcon.png',
  },
  metadataBase: new URL('https://www.classicnooks.com'),
  alternates: {
    canonical: 'https://www.classicnooks.com',
  },
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
