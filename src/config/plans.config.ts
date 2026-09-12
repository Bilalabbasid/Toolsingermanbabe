export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'business';
  name: string;
  badge?: string;
  priceMonthlyEUR: number;
  priceYearlyEUR: number;
  periodLabel: string;
  description: string;
  ctaText: string;
  isPopular?: boolean;
  features: PlanFeature[];
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
    description: 'Perfekt für gelegentliche Konvertierungen und Standard-Bearbeitungen ohne Anmeldung.',
    ctaText: 'Jetzt kostenlos nutzen',
    isPopular: false,
    features: [
      { text: 'Alle Standard-PDF- und Bild-Tools', included: true },
      { text: '100% lokale Browser-Verarbeitung für Datenschutz', included: true },
      { text: 'Dateigröße bis zu 50 MB', included: true },
      { text: 'Einzeldokument-Verarbeitung', included: true },
      { text: 'Keine Registrierung erforderlich', included: true },
      { text: 'Keine Werbung', included: false },
      { text: 'Stapelverarbeitung (Batch-Modus)', included: false },
      { text: 'Prioritäts-Warteschlange', included: false },
      { text: 'API-Zugriff', included: false },
    ],
    limits: {
      maxFileSizeMB: 50,
      batchLimit: 1,
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
    priceYearlyEUR: 59.0, // approx 4.92 / mo
    periodLabel: 'pro Monat, jährlich abgerechnet',
    description: 'Für Vielnutzer, Selbstständige und Teams, die maximale Geschwindigkeit und Freiheit benötigen.',
    ctaText: '7 Tage kostenlos testen',
    isPopular: true,
    features: [
      { text: 'Alle Standard- und Premium-Tools', included: true },
      { text: 'Vollständig werbefreies Arbeiten', included: true },
      { text: 'Dateigröße bis zu 500 MB', included: true },
      { text: 'Batch-Verarbeitung (bis zu 50 Dateien gleichzeitig)', included: true },
      { text: 'Prioritäts-Konvertierung ohne Wartezeit', included: true },
      { text: 'Unbegrenzte OCR-Texterkennung mit Hochpräzision', included: true },
      { text: 'Erweiterter PDF-Editor mit Signatur-Bibliothek', included: true },
      { text: 'Persönlicher E-Mail-Support', included: true },
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
