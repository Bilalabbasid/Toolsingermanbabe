import type { BlogCategory, BlogCategoryInfo } from './types';

/**
 * Blog topic hubs. `urlSlug` is the German path segment used for
 * /de/blog/kategorie/[urlSlug]. Order here is the display order.
 */
export const BLOG_CATEGORIES: Record<BlogCategory, BlogCategoryInfo> = {
  pdf: {
    slug: 'pdf',
    urlSlug: 'pdf',
    name: 'PDF-Tools',
    metaTitle: 'PDF-Ratgeber: Anleitungen & Tipps',
    metaDescription:
      'PDF-Anleitungen: zusammenfügen, teilen, drehen, verkleinern, Seiten löschen und unterschreiben – kostenlos und lokal im Browser, ohne Upload.',
    description:
      'Anleitungen zum Zusammenfügen, Teilen, Verkleinern, Sortieren und Bearbeiten von PDF-Dokumenten – direkt im Browser, ohne dass Dateien Ihr Gerät verlassen.',
    icon: 'FileText',
    toolCategory: 'pdf',
  },
  security: {
    slug: 'security',
    urlSlug: 'sicherheit-datenschutz',
    name: 'Sicherheit & Datenschutz',
    metaTitle: 'PDF-Sicherheit & Datenschutz: Ratgeber',
    metaDescription:
      'PDF mit Passwort schützen, Passwort entfernen, richtig schwärzen und Metadaten löschen: Anleitungen für sichere Dokumente – lokal und DSGVO-freundlich.',
    description:
      'Passwortschutz, Schwärzen, Metadaten und datensparsames Arbeiten: So geben Sie vertrauliche Dokumente sicher weiter.',
    icon: 'Shield',
    toolCategory: 'security',
  },
  documents: {
    slug: 'documents',
    urlSlug: 'dokumente',
    name: 'Word & Dokumente',
    metaTitle: 'Word, Excel & Dokumente: Ratgeber',
    metaDescription:
      'Word in PDF, PDF in Excel, ODT und CSV umwandeln: Praxisanleitungen für Office-Dokumente mit Hinweisen zu Layout, Schriften und Tabellen.',
    description:
      'Praxistipps zur Konvertierung zwischen Word, Excel, PowerPoint, OpenDocument und PDF – mit ehrlichen Hinweisen zu Layout und Formatierung.',
    icon: 'FileSpreadsheet',
    toolCategory: 'documents',
  },
  images: {
    slug: 'images',
    urlSlug: 'bilder',
    name: 'Bilder & Fotos',
    metaTitle: 'Bilder & Fotos bearbeiten: Ratgeber',
    metaDescription:
      'Bilder verkleinern, komprimieren, zuschneiden und umwandeln: HEIC, WebP, PNG, JPG und Favicons – Anleitungen mit lokaler Verarbeitung im Browser.',
    description:
      'Bildkonvertierung, Komprimierung und Optimierung von JPG, PNG, WebP, HEIC und Co. – für E-Mail, Web, Druck und Bewerbung.',
    icon: 'Image',
    toolCategory: 'images',
  },
  ocr: {
    slug: 'ocr',
    urlSlug: 'ocr-texterkennung',
    name: 'OCR & Texterkennung',
    metaTitle: 'OCR & Texterkennung: Ratgeber',
    metaDescription:
      'Text aus Scans und Fotos erkennen, PDFs durchsuchbar machen und Dokumente mit dem Handy scannen: OCR-Anleitungen mit Tipps für bessere Ergebnisse.',
    description:
      'Text aus gescannten Dokumenten und Fotos extrahieren und durchsuchbar machen – mit Tipps für saubere Erkennungsergebnisse.',
    icon: 'ScanText',
    toolCategory: 'ocr',
  },
  media: {
    slug: 'media',
    urlSlug: 'video-audio',
    name: 'Video & Audio',
    metaTitle: 'Video & Audio umwandeln: Ratgeber',
    metaDescription:
      'Video in MP3 umwandeln, MP4 komprimieren, MOV in MP4 konvertieren und GIFs erstellen: Anleitungen für Video- und Audiodateien direkt im Browser.',
    description:
      'Videos komprimieren, Tonspuren extrahieren und Formate umwandeln – verständlich erklärt, mit Hinweisen zu Qualität und Dateigröße.',
    icon: 'Video',
    toolCategory: 'utilities',
  },
  archives: {
    slug: 'archives',
    urlSlug: 'zip-archive',
    name: 'ZIP & Archive',
    metaTitle: 'ZIP, 7Z & Archive: Ratgeber',
    metaDescription:
      'ZIP entpacken, 7Z-Dateien öffnen und eigene ZIP-Archive erstellen – auf Windows, Mac, iPhone und Android oder direkt im Browser ohne Installation.',
    description:
      'ZIP-, 7Z- und TAR-Archive öffnen, entpacken und erstellen – auf jedem Gerät und ohne zusätzliche Software.',
    icon: 'Archive',
    toolCategory: 'utilities',
  },
  developer: {
    slug: 'developer',
    urlSlug: 'entwickler',
    name: 'Entwickler-Tools',
    metaTitle: 'JSON, Base64 & Co.: Entwickler-Ratgeber',
    metaDescription:
      'JSON formatieren und validieren, Base64 kodieren und Unix-Timestamps umrechnen: kurze Erklärungen und Anleitungen für Entwickler und Admins.',
    description:
      'JSON, Base64, Timestamps und andere Datenformate verstehen und bearbeiten – lokal im Browser, ohne sensible Daten preiszugeben.',
    icon: 'Code',
    toolCategory: 'utilities',
  },
  formats: {
    slug: 'formats',
    urlSlug: 'dateiformate',
    name: 'Dateiformate',
    metaTitle: 'Dateiformate erklärt: Vergleiche & Wissen',
    metaDescription:
      'WebP vs. PNG, DOCX vs. DOC, PDF/A, ZIP vs. 7Z: Dateiformate verständlich erklärt – mit Vergleichen, Einsatzempfehlungen und Umwandlungstipps.',
    description:
      'Hintergründe, Kompatibilität und Vergleiche moderner Bild-, Dokument- und Archivformate.',
    icon: 'Layers',
  },
  productivity: {
    slug: 'productivity',
    urlSlug: 'produktivitaet',
    name: 'Produktivität',
    metaTitle: 'Produktivität & Büro-Workflows: Ratgeber',
    metaDescription:
      'Effiziente Workflows für Homeoffice, Studium und Bewerbung: Wörter zählen, Unterlagen bündeln und papierlos arbeiten – mit kostenlosen Browser-Tools.',
    description:
      'Effiziente Workflows für Homeoffice, Studium, Bewerbung und papierloses Arbeiten.',
    icon: 'Sparkles',
    toolCategory: 'utilities',
  },
};

export const BLOG_CATEGORY_ORDER: BlogCategory[] = Object.keys(BLOG_CATEGORIES) as BlogCategory[];

export function getBlogCategoryByUrlSlug(urlSlug: string) {
  return Object.values(BLOG_CATEGORIES).find((c) => c.urlSlug === urlSlug);
}

export function getBlogCategoryPath(category: BlogCategory, locale: string = 'de'): string {
  return `/${locale}/blog/kategorie/${BLOG_CATEGORIES[category].urlSlug}`;
}
