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
    name: 'PDF-Tools',
    shortDesc: 'PDFs bearbeiten, zusammenfügen, komprimieren, teilen und konvertieren.',
    icon: 'FileText',
    metaTitle: 'PDF-Tools kostenlos – lokal im Browser | Datei Tools',
    metaDescription: 'PDF zusammenfügen, teilen, komprimieren, drehen und bearbeiten: alle PDF-Tools kostenlos an einem Ort – die Verarbeitung läuft lokal im Browser, ohne Upload.',
    h1: 'Online-PDF-Tools – Schnell, einfach & sicher',
  },
  images: {
    slug: 'images',
    name: 'Bild-Tools',
    shortDesc: 'Bilder umwandeln, verkleinern, zuschneiden, komprimieren und anpassen.',
    icon: 'Image',
    metaTitle: 'Bild-Tools: Bilder umwandeln & verkleinern | Datei Tools',
    metaDescription: 'JPG, PNG, WebP und HEIC umwandeln, Bilder komprimieren, zuschneiden und skalieren – kostenlose Bild-Tools, die Ihre Fotos nicht hochladen.',
    h1: 'Bilder konvertieren und bearbeiten im Browser',
  },
  documents: {
    slug: 'documents',
    name: 'Dokumente',
    shortDesc: 'Word-, Excel-, Text- und Office-Dokumente flexibel konvertieren.',
    icon: 'Files',
    metaTitle: 'Word, Excel & PDF umwandeln – Dokumente | Datei Tools',
    metaDescription: 'Word in PDF, PDF in Word, Excel, ODT und CSV umwandeln: kostenlose Dokumenten-Konverter, die direkt in Ihrem Browser arbeiten – ohne Upload.',
    h1: 'Dokumente und Office-Dateien konvertieren',
  },
  utilities: {
    slug: 'utilities',
    name: 'Text-Tools & Hilfsmittel',
    shortDesc: 'Hier finden Sie Text-, Entwickler-, Medien- und Archiv-Tools, die vollständig im Browser laufen – Ihre Dateien werden nicht hochgeladen. Zählen Sie Wörter, formatieren Sie JSON, kodieren Sie Base64, wandeln Sie Video und Audio per FFmpeg um (bis 500 MB) und entpacken Sie ZIP-, 7z-, RAR- und TAR-Archive.',
    icon: 'Wrench',
    metaTitle: 'Text, Video, ZIP & Entwickler-Tools | Datei Tools',
    metaDescription: 'Wörter zählen, JSON formatieren, Base64 kodieren, Video in MP3 umwandeln und ZIP entpacken – nützliche Werkzeuge, lokal im Browser.',
    h1: 'Praktische Text- und Produktivitäts-Tools',
  },
  security: {
    slug: 'security',
    name: 'Sicherheit & Schutz',
    shortDesc: 'PDFs verschlüsseln, entsperren, Passwörter verwalten und schwärzen.',
    icon: 'Shield',
    metaTitle: 'PDF schützen, entsperren & schwärzen | Datei Tools',
    metaDescription: 'PDF mit Passwort schützen, Passwort entfernen, schwärzen und Metadaten löschen – Sicherheits-Tools, die vertrauliche Dateien lokal im Browser verarbeiten.',
    h1: 'Dokumentensicherheit & Datenschutz-Tools',
  },
  ocr: {
    slug: 'ocr',
    name: 'OCR & Texterkennung',
    shortDesc: 'Gescannte Dokumente und Bilder in durchsuchbaren Text umwandeln.',
    icon: 'ScanText',
    metaTitle: 'OCR Texterkennung: PDF & Bild zu Text | Datei Tools',
    metaDescription: 'Text aus Scans und Fotos erkennen, PDFs durchsuchbar machen und Scans in Word umwandeln – OCR kostenlos und lokal im Browser, ohne Upload.',
    h1: 'Kostenlose OCR-Texterkennung im Browser',
  },
};
