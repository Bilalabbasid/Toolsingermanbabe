import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Cpu, Globe, Heart,
  FileText, Image as ImageIcon, FileSpreadsheet, 
  Wrench, Scale, ScanText, Trash2, Music,
} from 'lucide-react';
import { CookiePreferencesButton } from './CookiePreferencesButton';
import { featureFlags } from '@/config/featureFlags.config';


export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 sm:pt-16 pb-12 safe-area-bottom border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pb-8 sm:pb-12 mb-8 sm:mb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5 p-3 sm:p-0 rounded-xl bg-slate-800/50 sm:bg-transparent border border-slate-700/50 sm:border-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Informationen zum Datenschutz</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Hinweise zu Verarbeitung, Speicherung und Ihren Rechten finden Sie in der Datenschutzerklärung.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 sm:p-0 rounded-xl bg-slate-800/50 sm:bg-transparent border border-slate-700/50 sm:border-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Lokale Browser-Verarbeitung</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Einige Werkzeuge arbeiten direkt im Browser. Andere übertragen Dateien zur Konvertierung an den Server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 sm:p-0 rounded-xl bg-slate-800/50 sm:bg-transparent border border-slate-700/50 sm:border-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Automatische Löschung</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Sollte eine Serververarbeitung nötig sein, werden Daten nach maximal 15 Minuten restlos entfernt.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-12 text-sm">
          {/* Col 1: PDF Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 sm:mb-4 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              Beliebte PDF-Tools
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <Link href="/de/pdf-zusammenfuegen" className="py-1 block hover:text-white transition-colors">
                  PDF zusammenfügen
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-komprimieren" className="py-1 block hover:text-white transition-colors">
                  PDF komprimieren
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-bearbeiten" className="py-1 block hover:text-white transition-colors">
                  PDF bearbeiten
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-teilen" className="py-1 block hover:text-white transition-colors">
                  PDF teilen
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-unterschreiben" className="py-1 block hover:text-white transition-colors">
                  PDF unterschreiben
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-in-word-umwandeln" className="py-1 block hover:text-white transition-colors">
                  PDF in Word umwandeln
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Bild Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 sm:mb-4 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              Bild-Konverter
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <Link href="/de/jpg-in-png-umwandeln" className="py-1 block hover:text-white transition-colors">
                  JPG in PNG umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/png-in-jpg-umwandeln" className="py-1 block hover:text-white transition-colors">
                  PNG in JPG umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/jpg-in-webp-umwandeln" className="py-1 block hover:text-white transition-colors">
                  JPG in WebP umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/bild-komprimieren" className="py-1 block hover:text-white transition-colors">
                  Bild komprimieren
                </Link>
              </li>
              <li>
                <Link href="/de/bildgroesse-aendern" className="py-1 block hover:text-white transition-colors">
                  Bildgröße ändern
                </Link>
              </li>
              <li>
                <Link href="/de/jpg-in-pdf-umwandeln" className="py-1 block hover:text-white transition-colors">
                  JPG in PDF umwandeln
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sicherheit & OCR */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 sm:mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Sicherheit &amp; OCR
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <Link href="/de/pdf-schuetzen" className="py-1 block hover:text-white transition-colors">
                  PDF schützen (Passwort)
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-passwort-entfernen" className="py-1 block hover:text-white transition-colors">
                  PDF entsperren
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-berechtigungen-aendern" className="py-1 block hover:text-white transition-colors">
                  Berechtigungen verwalten
                </Link>
              </li>
              <li>
                <Link href="/de/ocr-pdf" className="py-1 block hover:text-white transition-colors">
                  PDF-OCR-Texterkennung
                </Link>
              </li>
              <li>
                <Link href="/de/scan-zu-word" className="py-1 block hover:text-white transition-colors">
                  Gescannte PDF in Word (OCR)
                </Link>
              </li>
              <li>
                <Link href="/de/bild-zu-text" className="py-1 block hover:text-white transition-colors">
                  Bild in Text (OCR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Dokumente & Audio/Video */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 sm:mb-4 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Office &amp; Medien
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <Link href="/de/word-in-pdf-umwandeln" className="py-1 block hover:text-white transition-colors">
                  Word in PDF umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/excel-in-pdf-umwandeln" className="py-1 block hover:text-white transition-colors">
                  Excel in PDF umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/powerpoint-in-pdf-umwandeln" className="py-1 block hover:text-white transition-colors">
                  PowerPoint in PDF umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/audio-konvertieren" className="py-1 block hover:text-white transition-colors">
                  Audio konvertieren
                </Link>
              </li>
              <li>
                <Link href="/de/video-in-mp3-umwandeln" className="py-1 block hover:text-white transition-colors">
                  Video zu MP3
                </Link>
              </li>
              <li>
                <Link href="/de/zip-entpacken" className="py-1 block hover:text-white transition-colors">
                  ZIP entpacken
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Rechtliches & Service */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 sm:mb-4 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              Rechtliches &amp; Service
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <Link href="/de/datenschutz" className="py-1 block hover:text-white transition-colors">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link href="/de/impressum" className="py-1 block hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/de/agb" className="py-1 block hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/de/cookie-richtlinie" className="py-1 block hover:text-white transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <CookiePreferencesButton variant="link" label="Cookie-Einstellungen" className="py-1 block text-slate-400 hover:text-white text-xs" />
              </li>
              <li>
                <Link href="/de/blog" className="py-1 block hover:text-white transition-colors text-sky-400 font-medium">
                  Ratgeber &amp; Anleitungen
                </Link>
              </li>
              <li>
                <Link href="/de/kontakt" className="py-1 block hover:text-white transition-colors text-slate-300 font-medium">
                  Kontakt &amp; Support
                </Link>
              </li>
              {featureFlags.enableStripeCheckout && <li>
                <Link href="/de/preise" className="py-1 block hover:text-white transition-colors text-amber-400 font-semibold">
                  CoolWave Pro
                </Link>
              </li>}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <span>© {currentYear} CoolWave (coolwave.cool). Alle Rechte vorbehalten.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Deutsch (DE)</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Hostinger & European Cloud Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
