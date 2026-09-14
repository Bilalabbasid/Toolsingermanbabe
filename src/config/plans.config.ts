export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanEntitlements {
  noAds: boolean;
  maxFileSizeMB: number;
  maxBatchFiles: number;
  priorityQueue: boolean;
  ocrUnlimited: boolean;
  advancedTools: boolean;
  conversionHistory: boolean;
  historyRetentionDays: number;
  apiAccess: boolean;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'business';
  name: string;
  badge?: string;
  priceMonthlyEUR: number;
  priceYearlyEUR: number; // total for the year
  periodLabel: string;
  description: string;
  ctaText: string;
  isPopular?: boolean;
  features: PlanFeature[];
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  entitlements: PlanEntitlements;
  limits: {
    maxFileSizeMB: number;
    batchLimit: number;
    hasAds: boolean;
    ocrProcessing: 'standard' | 'priority' | 'unlimited';
    retentionTimeMinutes: number;
    apiAccess: boolean;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Kostenlos',
    priceMonthlyEUR: 0,
    priceYearlyEUR: 0,
    periodLabel: 'dauerhaft kostenlos',
    description: 'Perfekt für gelegentliche Konvertierungen und Standard-Bearbeitungen ohne Registrierung.',
    ctaText: 'Jetzt kostenlos nutzen',
    isPopular: false,
    stripePriceIdMonthly: undefined,
    stripePriceIdYearly: undefined,
    entitlements: {
      noAds: false,
      maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_FREE || '50', 10),
      maxBatchFiles: parseInt(process.env.MAX_BATCH_FREE || '5', 10),
      priorityQueue: false,
      ocrUnlimited: false,
      advancedTools: false,
      conversionHistory: false,
      historyRetentionDays: 0,
      apiAccess: false,
    },
    features: [
      { text: 'Alle Standard-PDF- und Bild-Tools', included: true },
      { text: '100% DSGVO-konforme lokale Verarbeitung', included: true },
      { text: 'Dateigröße bis zu 50 MB', included: true },
      { text: 'Stapelverarbeitung bis zu 5 Dateien', included: true },
      { text: 'Keine Registrierung erforderlich', included: true },
      { text: 'Werbefreies Arbeiten', included: false },
      { text: 'Große Dateien bis 500 MB', included: false },
      { text: 'Prioritäts-Konvertierung ohne Wartezeit', included: false },
      { text: 'Gespeicherte Konvertierungs-Historie', included: false },
    ],
    limits: {
      maxFileSizeMB: 50,
      batchLimit: 5,
      hasAds: true,
      ocrProcessing: 'standard',
      retentionTimeMinutes: 15,
      apiAccess: false,
    },
  },
  {
    id: 'pro',
    name: 'CoolWave Pro',
    badge: 'Empfohlen',
    priceMonthlyEUR: 6.99,
    priceYearlyEUR: 59.0, // ~4.92 / mo (over 29% savings)
    periodLabel: 'pro Monat, jährlich abgerechnet',
    description: 'Für Vielnutzer, Selbstständige und Teams, die maximale Geschwindigkeit und Freiheit benötigen.',
    ctaText: '7 Tage kostenlos testen',
    isPopular: true,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly_test',
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || 'price_pro_yearly_test',
    entitlements: {
      noAds: true,
      maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_PRO || '500', 10),
      maxBatchFiles: parseInt(process.env.MAX_BATCH_PRO || '50', 10),
      priorityQueue: true,
      ocrUnlimited: true,
      advancedTools: true,
      conversionHistory: true,
      historyRetentionDays: 30,
      apiAccess: false,
    },
    features: [
      { text: 'Alle Standard- und Premium-Tools', included: true },
      { text: '100% werbefreies Arbeiten (keine Banner)', included: true },
      { text: 'Dateigröße bis zu 500 MB je Datei', included: true },
      { text: 'Stapelverarbeitung bis zu 50 Dateien gleichzeitig', included: true },
      { text: 'Prioritäts-Konvertierung (VIP-Queue)', included: true },
      { text: 'Unbegrenzte Hochpräzisions-OCR', included: true },
      { text: 'Konvertierungs-Historie für 30 Tage gespeichert', included: true },
      { text: '1-Klick-Sammeldownloads als ZIP', included: true },
      { text: 'Jederzeit monatlich kündbar', included: true },
    ],
    limits: {
      maxFileSizeMB: 500,
      batchLimit: 50,
      hasAds: false,
      ocrProcessing: 'priority',
      retentionTimeMinutes: 60,
      apiAccess: false,
    },
  },
  {
    id: 'business',
    name: 'Business & Team',
    badge: 'Für Unternehmen',
    priceMonthlyEUR: 19.99,
    priceYearlyEUR: 180.0,
    periodLabel: 'pro Monat für das Team',
    description: 'Maßgeschneiderte Lösung für Kanzleien, Agenturen, Unternehmen und Entwickler.',
    ctaText: 'Vertrieb kontaktieren',
    isPopular: false,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_BIZ_MONTHLY || 'price_biz_monthly_test',
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_BIZ_YEARLY || 'price_biz_yearly_test',
    entitlements: {
      noAds: true,
      maxFileSizeMB: 2048,
      maxBatchFiles: 250,
      priorityQueue: true,
      ocrUnlimited: true,
      advancedTools: true,
      conversionHistory: true,
      historyRetentionDays: 90,
      apiAccess: true,
    },
    features: [
      { text: 'Alle Pro-Features für bis zu 10 Benutzer', included: true },
      { text: 'Zentralisierte Abrechnung & Rechnungsverwaltung', included: true },
      { text: 'REST-API-Zugriff (10.000 Anfragen / Monat)', included: true },
      { text: 'Dedizierte Cloud-Worker für Großaufträge', included: true },
      { text: 'Individuelle AVV (Auftragsverarbeitungsvertrag nach DSGVO)', included: true },
      { text: 'SLA-Garantie & 24/7 Priority Support', included: true },
    ],
    limits: {
      maxFileSizeMB: 2048,
      batchLimit: 250,
      hasAds: false,
      ocrProcessing: 'unlimited',
      retentionTimeMinutes: 1440,
      apiAccess: true,
    },
  },
];

export function getPlan(planId: string): PricingPlan {
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  return plan || PRICING_PLANS[0];
}

export function getAllPlans(): PricingPlan[] {
  return PRICING_PLANS;
}

export function formatPlanPrice(plan: PricingPlan, interval: 'monthly' | 'yearly', locale: string = 'de-DE'): string {
  if (plan.priceMonthlyEUR === 0) return 'Kostenlos';

  const amount = interval === 'yearly' ? plan.priceYearlyEUR / 12 : plan.priceMonthlyEUR;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateAnnualSavings(plan: PricingPlan): number {
  if (plan.priceMonthlyEUR === 0) return 0;
  const yearlyRegular = plan.priceMonthlyEUR * 12;
  const savings = yearlyRegular - plan.priceYearlyEUR;
  return Math.max(0, Math.round((savings / yearlyRegular) * 100));
}
