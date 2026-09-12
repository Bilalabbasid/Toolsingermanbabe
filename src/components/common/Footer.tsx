import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, Globe, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">100% DSGVO-konform</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Rechtssichere Datenverarbeitung nach europäischen Datenschutzstandards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Lokale Browser-Verarbeitung</h4>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Die meisten Dateien werden direkt in Ihrem Browser berechnet und verlassen Ihr Gerät nicht.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-slate-800 text-sky-400 shrink-0 border border-slate-700">
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 text-sm">
          {/* Col 1: PDF Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Beliebte PDF-Tools
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/de/pdf-zusammenfuegen" className="hover:text-white transition-colors">
                  PDF zusammenfügen
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-komprimieren" className="hover:text-white transition-colors">
                  PDF komprimieren
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-bearbeiten" className="hover:text-white transition-colors">
                  PDF bearbeiten
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-teilen" className="hover:text-white transition-colors">
                  PDF teilen
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-unterschreiben" className="hover:text-white transition-colors">
                  PDF unterschreiben
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-in-word-umwandeln" className="hover:text-white transition-colors">
                  PDF in Word umwandeln
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Bild Tools */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Bild-Konverter
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/de/jpg-in-png-umwandeln" className="hover:text-white transition-colors">
                  JPG in PNG umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/png-in-jpg-umwandeln" className="hover:text-white transition-colors">
                  PNG in JPG umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/jpg-in-webp-umwandeln" className="hover:text-white transition-colors">
                  JPG in WebP umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/bild-komprimieren" className="hover:text-white transition-colors">
                  Bild komprimieren
                </Link>
              </li>
              <li>
                <Link href="/de/bildgroesse-aendern" className="hover:text-white transition-colors">
                  Bildgröße ändern
                </Link>
              </li>
              <li>
                <Link href="/de/jpg-in-pdf-umwandeln" className="hover:text-white transition-colors">
                  JPG in PDF umwandeln
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sicherheit & OCR */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Sicherheit & OCR
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/de/pdf-schuetzen" className="hover:text-white transition-colors">
                  PDF schützen (Passwort)
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-entsperren" className="hover:text-white transition-colors">
                  PDF entsperren
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-wasserzeichen" className="hover:text-white transition-colors">
                  PDF mit Wasserzeichen
                </Link>
              </li>
              <li>
                <Link href="/de/ocr-pdf" className="hover:text-white transition-colors">
                  OCR PDF (Texterkennung)
                </Link>
              </li>
              <li>
                <Link href="/de/pdf-drehen" className="hover:text-white transition-colors">
                  PDF drehen
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Text & Utilities */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Text & Utilities
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/de/wortzaehler" className="hover:text-white transition-colors">
                  Wortzähler & Zeichenzähler
                </Link>
              </li>
              <li>
                <Link href="/de/json-formatter" className="hover:text-white transition-colors">
                  JSON Formatter & Validator
                </Link>
              </li>
              <li>
                <Link href="/de/base64-umwandeln" className="hover:text-white transition-colors">
                  Base64 Encoder / Decoder
                </Link>
              </li>
              <li>
                <Link href="/de/word-in-pdf-umwandeln" className="hover:text-white transition-colors">
                  Word in PDF umwandeln
                </Link>
              </li>
              <li>
                <Link href="/de/preise" className="hover:text-white transition-colors text-amber-400 font-medium">
                  CoolWave Pro Pläne
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Company */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Rechtliches & Service
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/de/datenschutz" className="hover:text-white transition-colors">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link href="/de/impressum" className="hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/de/agb" className="hover:text-white transition-colors">
                  Allgemeine Geschäftsbedingungen
                </Link>
              </li>
              <li>
                <Link href="/de/cookie-richtlinie" className="hover:text-white transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <Link href="/de/blog" className="hover:text-white transition-colors">
                  Ratgeber & Anleitungen
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {currentYear} CoolWave (coolwave.cool). Alle Rechte vorbehalten.</span>
          </div>

          <div className="flex items-center gap-4">
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
