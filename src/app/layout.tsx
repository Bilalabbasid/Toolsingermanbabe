import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coolwave.cool'),
  title: {
    default: 'CoolWave – Alle wichtigen Datei- und PDF-Tools an einem Ort',
    template: '%s',
  },
  description:
    'PDFs bearbeiten, Dateien konvertieren, Bilder komprimieren und Dokumente zusammenführen – online mit Anleitungen zu Formaten und Dateilimits.',
  authors: [{ name: 'CoolWave' }],
  creator: 'CoolWave',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-512.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.className}>
      <body className="min-h-screen antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
