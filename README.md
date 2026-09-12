# CoolWave — Production-Grade Online File & Document SaaS

> **Domain**: [coolwave.cool](https://coolwave.cool)  
> **Target Market**: German-first (DE), European SaaS, expanding to ES, NL, FR, IT, PT.  
> **Direct Competitors**: Sejda, iLovePDF, Smallpdf, PDF24, Convertio.

---

## 🌟 Key Highlights

1. **European SaaS Aesthetics**:
   - Clean, trustworthy, monochrome styling with slate typography, crisp 1px borders, royal utility blue accents.
   - **Zero AI-slop**: No generic illustrations, rainbow buttons, or bloated glassmorphism.
2. **Dual-Pipeline Execution (Privacy First)**:
   - **100% In-Browser (Tier A)**: Image conversions, compression, PDF merge, split, rotate, watermark, page extract, and interactive PDF editing run directly on client hardware via HTML5 Canvas & WebAssembly (`pdf-lib`, `tesseract.js`). Zero server bandwidth or privacy risks.
   - **Server-Side Fallback (Tier B)**: Ephemeral, encrypted worker processing with automatic 15-minute file lifecycle cleanup.
3. **Data-Driven Programmatic SEO**:
   - Centralized `src/config/tools.config.ts` powers all dedicated keyword landing pages (`/de/pdf-in-word-umwandeln`, `/de/pdf-komprimieren`, `/de/pdf-zusammenfuegen`, `/de/pdf-bearbeiten`, etc.).
   - Schema.org structured data (`WebApplication`, `FAQPage`, `BreadcrumbList`) automatically generated for Google Search Console.
   - Bidirectional semantic link network connecting related tools.
4. **Monetization & GDPR Ready**:
   - Non-intrusive Ad slots (Google AdSense ready).
   - Pro tier pricing page & Stripe subscription architecture (€6.99/Monat, €59/Jahr).
   - Compliant DSGVO cookie banner, Impressum, Datenschutz, AGB, and Cookie-Richtlinie.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.x, 20.x, or 24.x LTS
- npm 10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000/de](http://localhost:3000/de) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛠️ Adding a New Tool

CoolWave is built with a data-driven tool registry. To launch a new tool with its own dedicated SEO landing page, schema, and engine, simply add an entry to `src/config/tools.config.ts`:

```typescript
{
  id: 'neues-tool',
  slug: 'neues-tool-umwandeln',
  germanName: 'Neues Tool umwandeln',
  category: 'pdf',
  categoryLabel: 'PDF Tools',
  icon: 'FileText',
  badge: 'Neu',
  isClientSide: true,
  metaTitle: 'Neues Tool – kostenlos online | CoolWave',
  metaDescription: 'SEO optimierte deutsche Beschreibung...',
  h1: 'Neues Tool kostenlos & online',
  shortDesc: 'Kurzbeschreibung für die Werkzeug-Karte...',
  longIntro: 'Ausführliche deutsche Einleitung für Google Rankings...',
  acceptedMimeTypes: ['application/pdf'],
  acceptedExtensions: ['.pdf'],
  outputFormat: 'PDF',
  outputMimeType: 'application/pdf',
  maxFileSizeFreeMB: 50,
  maxFileSizeProMB: 500,
  engineType: 'pdf-compress',
  features: ['Vorteil 1', 'Vorteil 2'],
  howItWorks: [
    { step: 1, title: 'Hochladen', text: '...' },
    { step: 2, title: 'Einstellen', text: '...' },
    { step: 3, title: 'Herunterladen', text: '...' }
  ],
  faqs: [
    { question: 'Ist das kostenlos?', answer: 'Ja...' }
  ],
  relatedToolSlugs: ['pdf-zusammenfuegen', 'pdf-komprimieren']
}
```

The system will automatically:
1. Generate the `/de/neues-tool-umwandeln` URL.
2. Add it to `/sitemap.xml`.
3. Generate `WebApplication` and `FAQPage` JSON-LD schemas.
4. Link it bidirectionally with related tools.

---

## 🌐 Hostinger Deployment

See [DEPLOYMENT_HOSTINGER.md](DEPLOYMENT_HOSTINGER.md) for full Nginx, PM2, and SSL configuration.
