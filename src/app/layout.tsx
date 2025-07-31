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
      <body>{children}</body>
    </html>
  );
}
