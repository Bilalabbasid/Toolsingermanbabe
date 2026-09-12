import { ToolCategory } from '@/types/tool';

export interface CategoryInfo {
  slug: ToolCategory;
  name: string;
  shortDesc: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
}

export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  pdf: {
    slug: 'pdf',
    name: 'PDF Tools',
    shortDesc: 'PDFs bearbeiten, zusammenfügen, komprimieren, teilen und konvertieren.',
    icon: 'FileText',
    metaTitle: 'PDF Tools online kostenlos – Bearbeiten, Zusammenfügen & Umwandeln | CoolWave',
    metaDescription: 'Alle wichtigen Online-PDF-Tools an einem Ort. PDF zusammenfügen, verkleinern, bearbeiten, schützen und in andere Formate konvertieren.',
    h1: 'Online-PDF-Tools – Schnell, einfach & sicher',
  },
  images: {
    slug: 'images',
    name: 'Bild Tools',
    shortDesc: 'Bilder umwandeln, verkleinern, zuschneiden, komprimieren und anpassen.',
    icon: 'Image',
    metaTitle: 'Bilder Tools online – Konvertieren, Komprimieren & Bearbeiten | CoolWave',
    metaDescription: 'Kostenlose Online-Bild-Werkzeuge: JPG in PNG, WebP konvertieren, Bilder komprimieren, skalieren und zuschneiden ohne Qualitätsverlust.',
    h1: 'Bilder konvertieren und bearbeiten im Browser',
  },
  documents: {
    slug: 'documents',
    name: 'Dokumente',
    shortDesc: 'Word-, Excel-, Text- und Office-Dokumente flexibel konvertieren.',
    icon: 'Files',
    metaTitle: 'Dokumenten-Konverter online – Word, Excel, TXT umwandeln | CoolWave',
    metaDescription: 'Dokumente schnell online konvertieren. Word in PDF, PDF in Word, Excel- und Text-Dateien sicher im Webbrowser transformieren.',
    h1: 'Dokumente und Office-Dateien konvertieren',
  },
  utilities: {
    slug: 'utilities',
    name: 'Text & Tools',
    shortDesc: 'Wortzähler, Zeichenzähler, JSON-Formatter und nützliche Hilfsprogramme.',
    icon: 'Wrench',
    metaTitle: 'Text-Tools & Entwickler-Hilfsmittel online | CoolWave',
    metaDescription: 'Kostenlose Web-Hilfsmittel: Wortzähler, Zeichenzähler, JSON Formatter, Base64 Encoder und nützliche Text-Werkzeuge.',
    h1: 'Praktische Text- und Produktivitäts-Tools',
  },
  security: {
    slug: 'security',
    name: 'Sicherheit & Schutz',
    shortDesc: 'PDFs verschlüsseln, entsperren, Passwörter verwalten und schwärzen.',
    icon: 'Shield',
    metaTitle: 'PDF Sicherheit online – Schützen, Entsperren & Schwärzen | CoolWave',
    metaDescription: 'Schützen Sie vertrauliche Dokumente mit Passwörtern oder entfernen Sie Zugriffsbeschränkungen – 100% lokal im Browser verarbeitet.',
    h1: 'Dokumentensicherheit & Datenschutz-Tools',
  },
  ocr: {
    slug: 'ocr',
    name: 'OCR & Texterkennung',
    shortDesc: 'Gescannte Dokumente und Bilder in durchsuchbaren Text umwandeln.',
    icon: 'ScanText',
    metaTitle: 'OCR PDF & Bild zu Text online – Kostenlose Texterkennung | CoolWave',
    metaDescription: 'Texte aus Scans und Bildern automatisch erkennen und extrahieren. Unterstützt Deutsch, Englisch und weitere Sprachen.',
    h1: 'Kostenlose OCR-Texterkennung im Browser',
  },
};
