import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Providers from './providers';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'BittyBox - Kid Friendly Music Player',
  description: 'A pink and girlie music player for young children',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <Providers>
          <main className="min-h-screen p-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
} 