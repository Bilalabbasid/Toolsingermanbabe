import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { ContactClient } from '@/components/contact/ContactClient';

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;

  return generatePageMetadata({
    title: 'Kontakt & Kundenservice – Hilfe & Feedback | CoolWave',
    description: 'Haben Sie Fragen zu unseren Datei- & PDF-Tools oder Ihrem Pro-Abonnement? Unser Support-Team hilft Ihnen gerne weiter. Schnelle Antwort garantiert.',
    path: '/kontakt',
    locale,
  });
}

export default function KontaktPage() {
  return <ContactClient />;
}
