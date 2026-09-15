import type { ToolDefinition } from '@/types/tool';

// Intent-led editorial copy. Keywords support navigation, not meta-keyword stuffing.
const EDITORIAL: Record<string, Partial<ToolDefinition>> = {
  'pdf-zusammenfuegen': {
    titleDe: 'PDF zusammenfügen – mehrere PDFs verbinden | CoolWave',
    h1De: 'PDF zusammenfügen',
    shortDescriptionDe: 'Verbinden Sie mehrere PDF-Dateien in der gewünschten Reihenfolge zu einem Dokument. Die Bearbeitung erfolgt im Browser.',
    metaDescriptionDe: 'Mehrere PDF-Dateien zu einem Dokument verbinden: Dateien auswählen, Reihenfolge festlegen und das Ergebnis herunterladen. Verarbeitung im Browser.',
    introDe: 'Verbinden Sie zum Beispiel Anschreiben, Lebenslauf und Zeugnisse zu einer Bewerbungsdatei. Sortieren Sie die PDFs vor dem Zusammenfügen in der gewünschten Reihenfolge. Die Seiten behalten ihre ursprünglichen Abmessungen; unterschiedliche Papierformate werden nicht automatisch vereinheitlicht.',
    searchKeywordsDe: ['PDF verbinden', 'PDFs zusammenführen', 'mehrere PDF Dateien zusammenfügen', 'Bewerbung PDF zusammenfügen'],
    features: ['Dateien vor dem Zusammenfügen sortieren', 'PDF-Seiten zu einem Dokument verbinden', 'Dokumentverarbeitung im Browser'],
    faqDe: [
      { question: 'Kann ich PDFs mit unterschiedlichen Seitenformaten zusammenfügen?', answer: 'Ja. Die ursprünglichen Seitenmaße bleiben erhalten. Eine A4-Seite und eine kleinere Seite werden beim Verbinden nicht automatisch auf dieselbe Größe skaliert.' },
      { question: 'Werden die PDF-Dateien hochgeladen?', answer: 'Das Zusammenfügen erfolgt im Browser. Für diesen Bearbeitungsschritt werden Ihre Dokumente nicht an den Konvertierungsserver gesendet.' },
      { question: 'Warum lässt sich eine Datei nicht öffnen?', answer: 'Prüfen Sie, ob sie beschädigt oder verschlüsselt ist. Öffnen Sie geschützte Dokumente nur mit dem erforderlichen Passwort und speichern Sie eine freigegebene Kopie.' },
    ],
  },
  'pdf-komprimieren': {
    titleDe: 'PDF komprimieren – Dateigröße verkleinern | CoolWave',
    h1De: 'PDF komprimieren',
    shortDescriptionDe: 'Optimieren Sie die PDF-Struktur und prüfen Sie die Dateigröße des Ergebnisses. Bereits komprimierte Dateien werden nicht immer kleiner.',
    metaDescriptionDe: 'PDF-Dateien im Browser optimieren und die Ergebnisgröße prüfen. Wie stark sich eine PDF verkleinern lässt, hängt vom Inhalt und der bisherigen Kompression ab.',
    introDe: 'Eine kleinere PDF kann beim Versand per E-Mail oder beim Hochladen in ein Bewerbungsportal helfen. Dieses Werkzeug schreibt die PDF-Struktur neu. Bereits optimierte PDFs und bildreiche Scans lassen sich damit möglicherweise kaum verkleinern. Prüfen Sie nach dem Download die tatsächliche Dateigröße und die Lesbarkeit; eine feste Zielgröße wie 1 MB wird nicht garantiert.',
    searchKeywordsDe: ['PDF verkleinern', 'PDF Dateigröße reduzieren', 'PDF komprimieren online', 'PDF für E-Mail verkleinern'],
    features: ['PDF-Struktur im Browser neu speichern', 'Original und Ergebnis vor dem Weitergeben vergleichen'],
    faqDe: [
      { question: 'Kann jede PDF kleiner werden?', answer: 'Nein. Bereits komprimierte Dateien können gleich groß bleiben oder größer werden. Bewahren Sie das Original auf und vergleichen Sie die heruntergeladene Datei.' },
      { question: 'Kann ich eine bestimmte Größe in KB oder MB einstellen?', answer: 'Eine feste Ergebnisgröße wird nicht zugesichert. Bei bildreichen Scans kann es sinnvoll sein, schon beim Scannen eine geringere Auflösung zu wählen.' },
    ],
  },
  'pdf-in-word-umwandeln': {
    titleDe: 'PDF in Word umwandeln – PDF zu DOCX | CoolWave',
    h1De: 'PDF in Word umwandeln',
    shortDescriptionDe: 'Konvertieren Sie eine PDF in ein bearbeitbares DOCX-Dokument. Layout, Tabellen und Seitenumbrüche können sich dabei verändern.',
    metaDescriptionDe: 'PDF in ein bearbeitbares Word-Dokument umwandeln. Hinweise zu DOCX, eingescannten Seiten und möglichen Änderungen an Tabellen und Seitenumbrüchen.',
    introDe: 'Wenn Sie Text aus einer PDF weiterbearbeiten möchten, ist DOCX ein geeignetes Zielformat. Eine PDF beschreibt jedoch das fertige Seitenbild, nicht die ursprüngliche Word-Struktur. Tabellen, Spalten und Seitenumbrüche können deshalb anders aussehen. Für eingescannte Seiten ohne auswählbaren Text benötigen Sie Texterkennung. Prüfen Sie das Word-Dokument vor der Weitergabe.',
    searchKeywordsDe: ['PDF zu Word', 'PDF in DOCX umwandeln', 'PDF bearbeitbar machen', 'PDF Word Konverter'],
    features: ['Ausgabe als bearbeitbares DOCX', 'Konvertierung mit Server-Verarbeitung'],
    faqDe: [
      { question: 'Bleibt das Layout exakt erhalten?', answer: 'Eine identische Darstellung wird nicht garantiert. Besonders mehrspaltige Texte, Tabellen und eingebettete Schriften sollten Sie im Ergebnis kontrollieren.' },
      { question: 'Was mache ich mit einer eingescannten PDF?', answer: 'Wenn sich in der PDF kein Text markieren lässt, verwenden Sie ein OCR-Werkzeug. Kontrollieren Sie erkannte Namen, Zahlen und Sonderzeichen anschließend am Original.' },
    ],
  },
  'word-in-pdf-umwandeln': {
    titleDe: 'Word in PDF umwandeln – DOCX zu PDF | CoolWave',
    h1De: 'Word in PDF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie ein Word-Dokument in PDF. Prüfen Sie anschließend Schriften, Tabellen und Seitenumbrüche im Ergebnis.',
    howItWorksDe: [
      { step: 1, title: 'Word-Datei auswählen', text: 'Wählen Sie ein Dokument im unterstützten Word-Format aus. Die Datei wird zur Server-Konvertierung übertragen.' },
      { step: 2, title: 'Konvertierung starten', text: 'Klicken Sie auf „In PDF umwandeln“ und warten Sie auf das Ergebnis.' },
      { step: 3, title: 'PDF herunterladen und prüfen', text: 'Speichern Sie das Ergebnis und vergleichen Sie Seitenzahl, Schriften und Tabellen mit dem Original.' },
    ],
    metaDescriptionDe: 'Word-Dokumente online in PDF umwandeln. Datei auswählen, konvertieren und herunterladen. Prüfen Sie Schriften, Tabellen und Seitenumbrüche im Ergebnis.',
    introDe: 'Wandeln Sie ein Word-Dokument in PDF um, wenn Sie eine Fassung zum Lesen oder Weitergeben benötigen. Die Konvertierung verarbeitet das Dokument auf dem Server. Fehlende Schriften oder komplexe Tabellen können das Ergebnis verändern. Vergleichen Sie deshalb Seitenzahl, Umbrüche und Abbildungen mit dem Original.',
    searchKeywordsDe: ['Word als PDF speichern', 'DOCX in PDF', 'Word zu PDF', 'Word Datei in PDF umwandeln'],
    features: ['Word-Dokument als PDF herunterladen', 'Hinweise zur Prüfung von Layout und Schriften'],
    faqDe: [
      { question: 'Verlassen die Dokumente meinen Browser?', answer: 'Ja. Dieses Werkzeug überträgt die Datei zur Konvertierung an den Server und speichert sie vorübergehend. Weitere Informationen finden Sie in der Datenschutzerklärung.' },
      { question: 'Warum sehen die Seitenumbrüche anders aus?', answer: 'Schriften und komplexe Formatierungen können in der Konvertierung abweichen. Kontrollieren Sie das Ergebnis oder exportieren Sie die PDF direkt aus dem Programm, in dem das Dokument erstellt wurde.' },
    ],
  },
  'png-in-jpg-umwandeln': {
    titleDe: 'PNG in JPG umwandeln – Bilder konvertieren | CoolWave',
    h1De: 'PNG in JPG umwandeln',
    shortDescriptionDe: 'Wandeln Sie PNG-Bilder in JPG um und wählen Sie die Qualität. Transparente Flächen benötigen im JPG eine Hintergrundfarbe.',
    metaDescriptionDe: 'PNG-Bilder in JPG umwandeln und die Bildqualität wählen. Beachten Sie: JPG unterstützt keine Transparenz und verwendet verlustbehaftete Kompression.',
    introDe: 'JPG eignet sich häufig für Fotos und kleinere Dateien zur Weitergabe. Transparente Flächen einer PNG können im JPG nicht erhalten bleiben. Die Kompression kann sichtbare Artefakte erzeugen, besonders an Schrift und scharfen Kanten. Prüfen Sie das Ergebnis vor dem Ersetzen der Originaldatei.',
    searchKeywordsDe: ['PNG zu JPG', 'PNG in JPEG umwandeln', 'PNG als JPG speichern'],
    faqDe: [{ question: 'Bleibt der transparente Hintergrund erhalten?', answer: 'Nein. JPG kann keine Transparenz speichern. Verwenden Sie PNG, wenn Sie einen transparenten Hintergrund benötigen.' }],
  },
  'jpg-in-png-umwandeln': {
    titleDe: 'JPG in PNG umwandeln – JPEG konvertieren | CoolWave',
    h1De: 'JPG in PNG umwandeln',
    shortDescriptionDe: 'Speichern Sie JPG- und JPEG-Bilder als PNG. Die Umwandlung entfernt keinen Hintergrund und stellt verlorene Details nicht wieder her.',
    metaDescriptionDe: 'JPG- und JPEG-Bilder in PNG umwandeln. Das PNG bewahrt die vorhandenen Bilddaten, stellt aber keine Details wieder her, die im JPG bereits verloren gingen.',
    introDe: 'PNG ist hilfreich, wenn ein Programm dieses Format verlangt oder Sie das Bild ohne weitere JPEG-Kompression speichern möchten. Die Umwandlung verbessert die ursprüngliche Bildqualität nicht. Ein vorhandener Hintergrund bleibt bestehen, und die PNG-Datei kann deutlich größer als das JPG werden.',
    searchKeywordsDe: ['JPG zu PNG', 'JPEG in PNG', 'JPG als PNG speichern'],
    faqDe: [{ question: 'Wird das Bild durch PNG schärfer oder transparent?', answer: 'Nein. Die Umwandlung ändert das Dateiformat. Sie entfernt keinen Hintergrund und stellt verlorene Bilddetails nicht wieder her.' }],
  },
};

export function applyGermanEditorial(tool: ToolDefinition): ToolDefinition {
  const result = { ...tool, ...EDITORIAL[tool.slug] };
  if (result.processingEngine === 'doc-convert') {
    result.browserCapable = false;
    result.serverRequired = true;
    result.privacyExplanationDe = 'Dieses Werkzeug überträgt Ihre Datei zur Konvertierung an den Server. Die Verarbeitung nutzt temporäre Dateien; Hinweise zur Speicherung und Löschung finden Sie in der Datenschutzerklärung.';
  }
  return result;
}
