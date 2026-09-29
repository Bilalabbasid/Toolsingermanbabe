import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://datei-tools.de'),
  title: {
    default: 'Datei Tools – Alle wichtigen Datei- und PDF-Tools an einem Ort',
    template: '%s',
  },
  description:
    'PDFs bearbeiten, Dateien konvertieren, Bilder komprimieren und Dokumente zusammenführen – online mit Anleitungen zu Formaten und Dateilimits.',
  authors: [{ name: 'Datei Tools' }],
  creator: 'Datei Tools',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-512.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
