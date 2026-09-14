import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { PricingClient } from '@/components/pricing/PricingClient';

interface PricingPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;

  return generatePageMetadata({
    title: 'Preise & Tarife – Faire, transparente Angebote | CoolWave',
    description: 'Alle Standard-Tools dauerhaft kostenlos nutzen. CoolWave Pro für Vielnutzer & Teams: Bis zu 500 MB Dateigröße, 50 Dateien im Batch & 100% werbefrei.',
    path: '/preise',
    locale,
  });
}

export default function PricingPage() {
  return <PricingClient />;
}
