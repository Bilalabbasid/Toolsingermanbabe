import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://datei-tools.de'),
  title: {
    default: 'Datei Tools – Dateien konvertieren, 100 % im Browser',
    template: '%s',
  },
  description:
    'PDFs bearbeiten, Bilder komprimieren und Dokumente umwandeln – kostenlos und vollständig in Ihrem Browser. Keine Uploads, keine Anmeldung, DSGVO-freundlich.',
  applicationName: 'Datei Tools',
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
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${inter.className}`}>
      <body className="min-h-screen antialiased bg-canvas text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
