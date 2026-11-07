import type { BlogArticle } from './types';

/**
 * Media, OCR, archive, developer and productivity articles (writer C batch).
 */
export const MEDIA_DEV_ARTICLES: BlogArticle[] = [
  {
    slug: 'svg-in-png-umwandeln-anleitung',
    title: 'SVG in PNG umwandeln: Vektorgrafik scharf als Bild speichern',
    metaTitle: 'SVG in PNG umwandeln – scharf & transparent | Datei Tools',
    metaDescription: 'SVG in PNG umwandeln: So wählen Sie die richtige Pixelgröße, behalten die Transparenz und vermeiden Schriftfehler – kostenlos und ohne Upload.',
    h1: 'SVG in PNG umwandeln: So wird aus der Vektorgrafik ein scharfes Pixelbild',
    excerpt: 'SVG-Dateien sind ideal für Logos und Icons, lassen sich aber nicht überall einfügen. Hier erfahren Sie, wie Sie eine SVG verlustarm in PNG umwandeln und welche Pixelgröße Sie dafür wählen sollten.',
    category: 'images',
    primaryKeyword: 'svg in png umwandeln',
    secondaryKeywords: ['svg in png konvertieren', 'svg als png speichern', 'svg zu png transparent', 'vektorgrafik in png umwandeln'],
    searchIntent: 'transactional',
    primaryToolSlug: 'svg-in-png-umwandeln',
    ctaHeadline: 'SVG jetzt kostenlos in PNG umwandeln',
    ctaButtonLabel: 'SVG in PNG umwandeln',
    relatedToolSlugs: ['svg-in-jpg-umwandeln', 'svg-in-webp-umwandeln', 'svg-in-ico-umwandeln', 'png-in-svg-umwandeln'],
    relatedArticleSlugs: ['jpg-oder-png-welches-bildformat-ist-besser', 'webp-vs-png-unterschied', 'favicon-erstellen-png-in-ico', 'bildgroesse-aendern-richtige-aufloesung-pixel'],
    directAnswer: 'Um eine SVG in PNG umzuwandeln, rendern Sie die Vektorgrafik in einer festen Pixelgröße und speichern sie als PNG – bei Datei Tools wahlweise in einfacher, doppelter oder vierfacher Größe, direkt im Browser. Das PNG ist nur bis zu dieser Größe scharf, wählen Sie sie daher lieber großzügig. Transparente Bereiche bleiben erhalten, weil PNG einen Alphakanal hat.',
    steps: [
      { step: 1, title: 'SVG-Datei auswählen', text: 'Öffnen Sie den Konverter im Browser und ziehen Sie Ihre SVG-Datei per Drag & Drop hinein oder wählen Sie sie über den Dateidialog aus.' },
      { step: 2, title: 'Auflösung wählen', text: 'Legen Sie fest, ob das PNG in der Originalgröße der SVG, in doppelter oder in vierfacher Größe berechnet wird. Die doppelte Größe passt für hochauflösende Displays, die vierfache für Druck und große Darstellungen.' },
      { step: 3, title: 'Umwandlung starten', text: 'Die Grafik wird direkt in Ihrem Browser gerendert und als Pixelbild berechnet. Bei sehr großen Ausgabegrößen kann das auf älteren Geräten etwas dauern.' },
      { step: 4, title: 'PNG prüfen und speichern', text: 'Kontrollieren Sie in der Vorschau Schriften, Farben und transparente Bereiche und laden Sie das PNG anschließend herunter.' },
    ],
    sections: [
      {
        heading: 'Was unterscheidet SVG von PNG?',
        content: 'SVG ist ein Vektorformat, PNG ein Rasterformat. SVG (Scalable Vector Graphics) beschreibt eine Grafik nicht über einzelne Pixel, sondern über Formen, Linien, Farben und Text in einer XML-Datei. Deshalb lässt sich ein SVG-Logo beliebig vergrößern, ohne unscharf zu werden. Ein PNG besteht dagegen aus einer festen Anzahl von Pixeln, die verlustfrei gespeichert werden.\n\n| Eigenschaft | SVG | PNG |\n|---|---|---|\n| Bildtyp | Vektorgrafik | Pixelgrafik |\n| Vergrößern | ohne Qualitätsverlust | nur bis zur gespeicherten Pixelgröße scharf |\n| Transparenz | ja | ja (Alphakanal) |\n| Unterstützung | Browser, Grafikprogramme | praktisch überall |\n\nBeim Umwandeln wird die Vektorgrafik also einmalig „gerastert“. Ab diesem Moment hat das Bild eine feste Auflösung. Vergrößern Sie ein PNG später stark, wird es weich oder pixelig. Der Vorteil von PNG: Es wird praktisch überall unterstützt – in Office-Programmen, Messengern, E-Mail-Signaturen, Bildbearbeitungen und Online-Formularen, die SVG häufig ablehnen. Wenn Sie unsicher sind, ob PNG überhaupt das passende Zielformat ist, hilft unser Vergleich [JPG oder PNG – welches Bildformat ist besser](blog:jpg-oder-png-welches-bildformat-ist-besser).'
      },
      {
        heading: 'Welche Pixelgröße ist die richtige?',
        content: 'Die richtige Pixelgröße hängt davon ab, wo das PNG später eingesetzt wird. Bei Datei Tools wählen Sie dafür ein Vielfaches der in der SVG hinterlegten Größe (einfach, doppelt oder vierfach); hat die SVG keine Breiten- und Höhenangabe, dient ihre viewBox als Grundmaß. Als Orientierung für die benötigte Breite:\n\n- **Webseite oder App-Icon:** die tatsächliche Anzeigegröße, für hochauflösende Displays besser die doppelte Breite\n- **Präsentation oder Word-Dokument:** etwa 1.500 bis 2.000 Pixel Breite reichen für eine Folie oder eine Seitenbreite meist aus\n- **Druck:** Pixelbreite = Druckbreite in Zoll × gewünschte Auflösung, also für 10 cm (rund 3,9 Zoll) bei 300 dpi etwa 1.180 Pixel\n- **Social-Media-Profilbild:** quadratisch und eher großzügig, die Plattform skaliert selbst herunter\n\nIm Zweifel ist ein zu großes PNG besser als ein zu kleines, denn verkleinern können Sie später jederzeit ohne Qualitätsverlust. Wie Pixelmaße und Auflösung zusammenhängen, erklärt der Artikel [Bildgröße ändern: richtige Auflösung in Pixeln](blog:bildgroesse-aendern-richtige-aufloesung-pixel).'
      },
      {
        heading: 'Bleibt die Transparenz erhalten – und wann passen JPG oder WebP?',
        content: 'Transparente Flächen einer SVG bleiben im PNG erhalten, weil PNG einen Alphakanal unterstützt. Das ist wichtig, denn viele Logos und Icons haben keinen Hintergrund – und es ist der Hauptgrund, warum PNG für Logos meist die bessere Wahl ist als JPG. Wandeln Sie eine SVG dagegen mit dem Werkzeug [SVG in JPG umwandeln](tool:svg-in-jpg-umwandeln) um, werden transparente Bereiche zwangsläufig mit einer Farbe gefüllt, üblicherweise Weiß, denn JPG kennt keine Transparenz.\n\nFür Webseiten ist auch WebP eine Option: Es unterstützt ebenfalls Transparenz und erzeugt oft kleinere Dateien als PNG. Die Unterschiede beschreibt der Beitrag [WebP vs. PNG](blog:webp-vs-png-unterschied). Und wenn aus Ihrem SVG-Logo ein Browser-Symbol werden soll, ist ein ICO-Favicon mit mehreren Größen sinnvoller als ein einzelnes PNG.'
      },
      {
        heading: 'Warum sieht das PNG anders aus als die SVG?',
        content: 'Nicht jede SVG wird überall gleich dargestellt. Die häufigsten Stolperfallen:\n\n- **Falsche Schriftart:** Enthält die SVG Text, der nicht in Pfade umgewandelt wurde, wird die Schrift beim Rendern nur verwendet, wenn sie auf Ihrem Gerät installiert ist. Sonst springt eine Ersatzschrift ein. Lösung: Text im Grafikprogramm vor dem Export in Pfade bzw. Konturen umwandeln.\n- **Fehlende Bilder:** Verweist die SVG auf externe Bilddateien, fehlen diese im Ergebnis. Eingebettete Bilder funktionieren dagegen.\n- **Winziges Ergebnis:** Fehlen in der SVG sowohl Breiten- und Höhenangabe als auch eine viewBox, nehmen Browser eine Standardgröße von 300 × 150 Pixeln an. Ergänzen Sie dann width und height in der SVG oder wählen Sie eine höhere Vergrößerungsstufe.\n- **Abgeschnittene Ränder:** Liegt die Zeichnung außerhalb der viewBox, wird sie beschnitten. Das lässt sich nur in der SVG selbst korrigieren.\n- **Sehr große Exporte dauern:** Ein PNG mit vielen tausend Pixeln Kantenlänge braucht Arbeitsspeicher. Auf älteren Smartphones kann die Berechnung länger dauern.'
      },
      {
        heading: 'Bleibt die SVG beim Umwandeln auf meinem Gerät?',
        content: 'Ja, bei Datei Tools wird die SVG lokal in Ihrem Browser gerendert und nicht an einen Server übertragen. Das ist relevant, weil Logos, Entwürfe und Kundengrafiken oft vertraulich sind, solange ein Projekt nicht veröffentlicht ist. Die Umwandlung funktioniert unter Windows, macOS und Linux genauso wie auf iPhone und Android, solange Sie einen aktuellen Browser verwenden.\n\nEin Hinweis zur Sicherheit: SVG-Dateien können Skripte und Verweise auf externe Ressourcen enthalten. Öffnen Sie SVGs aus unbekannten Quellen daher mit derselben Vorsicht wie andere Dateien. Für reine Bildkonvertierungen ist das unkritisch, für die Weitergabe von SVGs an Dritte ist ein PNG manchmal sogar die robustere Variante.'
      },
    ],
    faqs: [
      { question: 'Verliert eine SVG beim Umwandeln in PNG an Qualität?', answer: 'Bis zur gewählten Pixelgröße ist das PNG scharf und verlustfrei gespeichert. Was verloren geht, ist die Skalierbarkeit: Wird das PNG später stark vergrößert, wird es unscharf. Bewahren Sie deshalb die originale SVG immer auf.' },
      { question: 'Bleibt der transparente Hintergrund erhalten?', answer: 'Ja, PNG unterstützt Transparenz. Flächen, die in der SVG keinen Hintergrund haben, bleiben im PNG durchsichtig. Nur beim Export nach JPG wird der Hintergrund gefüllt, weil JPG keine Transparenz kennt.' },
      { question: 'Kann ich ein PNG wieder in eine SVG zurückverwandeln?', answer: 'Technisch ja, aber nicht verlustfrei. Dabei wird das Pixelbild nachgezeichnet (vektorisiert). Bei einfachen Logos mit klaren Flächen klappt das oft ordentlich, bei Fotos oder feinen Verläufen entstehen ungenaue Formen.' },
      { question: 'Warum sieht die Schrift im PNG anders aus als im Grafikprogramm?', answer: 'Wahrscheinlich ist die verwendete Schrift auf dem Gerät, auf dem gerendert wird, nicht installiert. Wandeln Sie Text vor dem SVG-Export in Pfade um, dann ist die Darstellung unabhängig von installierten Schriften.' },
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'avif-dateien-oeffnen-umwandeln',
    title: 'AVIF-Datei öffnen und in JPG oder PNG umwandeln',
    metaTitle: 'AVIF-Datei öffnen & umwandeln: So geht es',
    metaDescription: 'AVIF-Datei lässt sich nicht öffnen? So zeigen Sie AVIF unter Windows, Mac und Smartphone an und wandeln es kostenlos ohne Upload in JPG oder PNG um.',
    h1: 'AVIF-Datei öffnen: Anzeigen, verstehen und in JPG oder PNG umwandeln',
    excerpt: 'Immer mehr Webseiten liefern Bilder im AVIF-Format aus. Wer ein solches Bild speichert, kann es in älteren Programmen oft nicht öffnen. Wir zeigen, welche Programme AVIF verstehen und wann sich die Umwandlung lohnt.',
    category: 'images',
    primaryKeyword: 'avif datei öffnen',
    secondaryKeywords: ['avif in jpg umwandeln', 'was ist avif', 'avif öffnen windows', 'avif in png konvertieren'],
    searchIntent: 'informational',
    primaryToolSlug: 'avif-in-jpg-umwandeln',
    ctaHeadline: 'AVIF jetzt kostenlos in JPG umwandeln',
    ctaButtonLabel: 'AVIF in JPG umwandeln',
    relatedToolSlugs: ['avif-in-png-umwandeln', 'avif-in-webp-umwandeln', 'bild-komprimieren'],
    relatedArticleSlugs: ['webp-bild-als-jpg-speichern', 'webp-oder-jpg-unterschiede-qualitaet-dateigroesse', 'was-ist-heic-warum-iphone-dieses-format', 'svg-in-png-umwandeln-anleitung'],
    directAnswer: 'Eine AVIF-Datei öffnen Sie am einfachsten, indem Sie sie in einen aktuellen Browser wie Chrome, Edge, Firefox oder Safari ziehen. Die Windows-Fotos-App zeigt AVIF meist erst nach Installation der kostenlosen AV1-Erweiterung aus dem Microsoft Store an. Für ältere Programme wandeln Sie das Bild in JPG (Fotos) oder PNG (Transparenz) um – mit Datei Tools lokal im Browser, ohne Upload.',
    steps: [
      { step: 1, title: 'AVIF-Datei auswählen', text: 'Ziehen Sie die AVIF-Datei in den Konverter oder wählen Sie sie aus Ihrem Download-Ordner aus. Mehrere Dateien lassen sich in der Regel nacheinander verarbeiten.' },
      { step: 2, title: 'Zielformat bestimmen', text: 'Wählen Sie JPG für maximale Kompatibilität oder PNG, wenn das Bild transparente Bereiche enthält oder verlustfrei weiterbearbeitet werden soll.' },
      { step: 3, title: 'Lokal umwandeln lassen', text: 'Das Bild wird in Ihrem Browser dekodiert und neu gespeichert. Die Geschwindigkeit hängt von der Leistung Ihres Geräts und der Bildgröße ab.' },
      { step: 4, title: 'Ergebnis speichern', text: 'Laden Sie die umgewandelte Datei herunter und öffnen Sie sie in Ihrem gewohnten Programm.' },
    ],
    sections: [
      {
        heading: 'Was ist AVIF und warum taucht es plötzlich überall auf?',
        content: 'AVIF steht für „AV1 Image File Format“. Das Format wurde von der Alliance for Open Media entwickelt, zu der unter anderem große Browser- und Streaming-Anbieter gehören. Es nutzt die Kompressionstechnik des Videocodecs AV1 und speichert Einzelbilder darin besonders effizient. Bei vergleichbarer sichtbarer Qualität sind AVIF-Bilder häufig deutlich kleiner als JPGs – wie stark, hängt aber vom Motiv und den Einstellungen ab.\n\nAußerdem unterstützt AVIF Transparenz, eine höhere Farbtiefe und HDR. Für Webseitenbetreiber bedeutet das schnellere Ladezeiten, weshalb viele Shops, Nachrichtenseiten und Bilddienste AVIF automatisch an Browser ausliefern, die es verstehen. Speichern Sie ein solches Bild per Rechtsklick, landet eine .avif-Datei auf Ihrer Festplatte. Ganz ähnlich verhält es sich mit WebP, wie der Beitrag [WebP oder JPG: Unterschiede bei Qualität und Dateigröße](blog:webp-oder-jpg-unterschiede-qualitaet-dateigroesse) zeigt.'
      },
      {
        heading: 'Wie öffne ich AVIF unter Windows, Mac, iPhone und Android?',
        content: 'Ob Ihr Gerät AVIF direkt anzeigt, hängt von Betriebssystem und Programmversion ab; aktuelle Browser können das Format auf allen Plattformen anzeigen:\n\n- **Windows 10 und 11:** Die Fotos-App zeigt AVIF in der Regel an, sobald die kostenlose „AV1 Video Extension“ aus dem Microsoft Store installiert ist. Ältere Bildbetrachter und viele Office-Versionen können AVIF nicht einfügen.\n- **macOS:** Aktuelle Versionen von Safari zeigen AVIF an, auch die Vorschau kann AVIF auf neueren macOS-Versionen öffnen. Auf älteren Macs klappt es oft nicht.\n- **iPhone und iPad:** Seit iOS 16 wird AVIF in Safari unterstützt. Ob andere Apps die Datei öffnen, hängt von der jeweiligen App ab.\n- **Android:** Neuere Android-Versionen und Chrome zeigen AVIF an, Galerie-Apps einzelner Hersteller aber nicht immer.\n\nDer zuverlässigste Universal-Betrachter ist ein aktueller Browser: Ziehen Sie die Datei einfach in ein leeres Browserfenster.'
      },
      {
        heading: 'In welches Format sollten Sie AVIF umwandeln?',
        content: 'Für Fotos ist JPG das passende Zielformat, für Grafiken mit Transparenz PNG und für Webseiten WebP. Eine Umwandlung lohnt sich, sobald Sie ein Bild weitergeben, drucken oder in einem älteren Programm bearbeiten wollen:\n\n| Zielformat | Kompression | Transparenz | Geeignet für |\n|---|---|---|---|\n| JPG | verlustbehaftet | nein | Fotos, Weitergabe, Druck |\n| PNG | verlustfrei | ja | Logos, Grafiken, Screenshots |\n| WebP | verlustbehaftet oder verlustfrei | ja | Webseiten |\n\n- **JPG** ist der kleinste gemeinsame Nenner und funktioniert praktisch überall. Transparente Bereiche werden dabei mit einer Hintergrundfarbe gefüllt.\n- **PNG** erhält transparente Bereiche. Mit [AVIF in PNG umwandeln](tool:avif-in-png-umwandeln) bleibt jedes Pixel erhalten – die Datei wird allerdings deutlich größer.\n- **WebP** ist ein Kompromiss für Webseiten, die AVIF nicht ausliefern können oder wollen. Dafür gibt es [AVIF in WebP umwandeln](tool:avif-in-webp-umwandeln).\n\nWichtig: Die Umwandlung kann keine Details zurückholen, die bei der AVIF-Kompression bereits verworfen wurden. Ein stark komprimiertes AVIF wird als PNG nicht schärfer, nur größer.'
      },
      {
        heading: 'Warum lässt sich eine AVIF-Datei nicht öffnen?',
        content: 'Die meisten AVIF-Probleme entstehen, weil ein Programm das Format nicht kennt oder Besonderheiten wie HDR und Animation nicht unterstützt:\n\n- **„Dateiformat wird nicht unterstützt“:** Das Programm kennt AVIF nicht. Lösung: Datei in JPG oder PNG umwandeln oder ein Update installieren.\n- **Farben wirken nach der Umwandlung flau:** HDR-Bilder mit großer Farbtiefe müssen für JPG auf 8 Bit pro Farbkanal reduziert werden. Dabei kann sich der Bildeindruck verändern.\n- **Animierte AVIFs:** Das Format kann auch kurze Animationen enthalten. Bei der Umwandlung in JPG oder PNG bleibt in der Regel nur ein Einzelbild übrig.\n- **Dateiendung passt nicht:** Manchmal liefert eine Webseite AVIF-Daten mit der Endung .jpg aus. Programme, die nach der Endung gehen, melden dann eine beschädigte Datei. Benennen Sie die Datei in .avif um, dann lässt sie sich wie jede andere AVIF-Datei öffnen und umwandeln.\n\nÄhnliche Kompatibilitätsprobleme kennen iPhone-Nutzer vom HEIC-Format, das im Artikel [Was ist HEIC?](blog:was-ist-heic-warum-iphone-dieses-format) erklärt wird.'
      },
      {
        heading: 'Werden die Bilder beim Umwandeln übertragen?',
        content: 'Nein, die Umwandlung bei Datei Tools läuft vollständig lokal in Ihrem Browser, die Bilder verlassen Ihr Gerät nicht. Das ist besonders bei privaten Fotos oder internen Produktbildern angenehm, die noch nicht veröffentlicht sind.\n\nWeil die Rechenarbeit auf Ihrem Gerät stattfindet, hängt die Dauer von dessen Leistung ab. Ein einzelnes Foto ist meist schnell umgewandelt, sehr große Bilder brauchen auf älteren Geräten mehr Zeit. Wer häufig WebP-Bilder aus dem Netz speichert, findet im Beitrag [WebP-Bild als JPG speichern](blog:webp-bild-als-jpg-speichern) die passende Anleitung für dieses Format.'
      },
    ],
    faqs: [
      { question: 'Ist AVIF besser als JPG?', answer: 'Für Webseiten ist AVIF technisch meist effizienter: Bei ähnlicher Qualität entstehen oft kleinere Dateien, außerdem unterstützt es Transparenz und HDR. JPG ist dafür nahezu überall lesbar. Für den Austausch mit anderen Menschen ist JPG deshalb weiterhin die sicherere Wahl.' },
      { question: 'Warum speichert mein Browser Bilder als AVIF?', answer: 'Viele Webseiten liefern Bilder abhängig vom Browser in modernen Formaten aus. Unterstützt Ihr Browser AVIF, bekommt er diese Variante, und beim Speichern landet genau diese Datei auf Ihrem Gerät.' },
      { question: 'Verliert ein Bild beim Umwandeln von AVIF in JPG an Qualität?', answer: 'Da JPG ebenfalls verlustbehaftet komprimiert, entsteht eine weitere, meist kaum sichtbare Qualitätsstufe. Bei hoher JPG-Qualität ist der Unterschied in der Praxis gering. Wer jede weitere Verlustquelle vermeiden will, wählt PNG.' },
      { question: 'Kann ich AVIF auf dem iPhone in JPG umwandeln?', answer: 'Ja. Öffnen Sie den Konverter in Safari, wählen Sie die AVIF-Datei aus der Dateien-App oder der Fotomediathek aus und speichern Sie das Ergebnis anschließend wieder in „Dateien“ oder in den Fotos.' },
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'ocr-texterkennung-erklaert',
    title: 'OCR-Texterkennung erklärt: So liest der Computer gescannten Text',
    metaTitle: 'OCR-Texterkennung einfach erklärt | Datei Tools',
    metaDescription: 'OCR-Texterkennung verständlich erklärt: Wie Software Text in Scans und Fotos erkennt, wovon die Genauigkeit abhängt und wie Sie OCR lokal nutzen.',
    h1: 'OCR-Texterkennung erklärt: Funktionsweise, Grenzen und praktische Tipps',
    excerpt: 'OCR macht aus gescannten Seiten und Fotos durchsuchbaren, kopierbaren Text. Wir erklären verständlich, wie die Texterkennung arbeitet, warum sie manchmal danebenliegt und wie Sie bessere Ergebnisse erzielen.',
    category: 'ocr',
    primaryKeyword: 'ocr texterkennung',
    secondaryKeywords: ['was ist ocr', 'ocr software', 'texterkennung pdf', 'optische zeichenerkennung', 'ocr genauigkeit verbessern'],
    searchIntent: 'informational',
    primaryToolSlug: 'ocr-pdf',
    ctaHeadline: 'Texterkennung jetzt kostenlos ausprobieren',
    ctaButtonLabel: 'OCR starten',
    relatedToolSlugs: ['bild-zu-text', 'pdf-durchsuchbar-machen', 'scan-zu-word'],
    relatedArticleSlugs: ['text-aus-bild-kopieren', 'pdf-durchsuchbar-machen-anleitung', 'gescannte-pdf-bearbeiten-ocr-verwenden', 'text-aus-gescannter-pdf-kopieren'],
    directAnswer: 'OCR (Optical Character Recognition, optische Zeichenerkennung) erkennt Buchstaben in Bildern und gescannten Dokumenten und wandelt sie in echten, durchsuchbaren und kopierbaren Text um. Dazu bereitet die Software das Bild auf, findet Textzeilen und ordnet Zeichen und Wörter mithilfe eines Sprachmodells zu. Wie genau das gelingt, hängt vor allem von Bildqualität, Schrift und der eingestellten Sprache ab.',
    steps: [
      { step: 1, title: 'Scan oder Foto auswählen', text: 'Öffnen Sie das OCR-Werkzeug und wählen Sie Ihre gescannte PDF oder ein Bild mit Text aus, etwa JPG, PNG oder TIFF.' },
      { step: 2, title: 'Sprache und Ausgabe wählen', text: 'Wählen Sie Deutsch, Englisch oder die Kombination aus beiden sowie das Ergebnisformat: durchsuchbare PDF, Word-Dokument oder reiner Text. Die passende Sprache verbessert die Erkennung von Umlauten und ß.' },
      { step: 3, title: 'Erkennung lokal ausführen', text: 'Die Texterkennung läuft in Ihrem Browser. Bei mehrseitigen Dokumenten kann das je nach Gerät einige Zeit dauern.' },
      { step: 4, title: 'Ergebnis kontrollieren', text: 'Prüfen Sie den erkannten Text stichprobenartig, besonders Zahlen, Namen und Beträge, bevor Sie ihn weiterverwenden.' },
    ],
    sections: [
      {
        heading: 'Wie funktioniert OCR Schritt für Schritt?',
        content: 'OCR arbeitet in mehreren Stufen: Bild aufbereiten, Textbereiche finden, Zeichen erkennen und das Ergebnis sprachlich prüfen. Für einen Computer ist eine gescannte Seite zunächst nur ein Bild aus hellen und dunklen Pixeln:\n\n1. **Bildaufbereitung:** Das Bild wird gerade ausgerichtet, Kontrast und Helligkeit werden angepasst, oft wird es in reines Schwarz-Weiß umgerechnet.\n2. **Layout-Analyse:** Die Software sucht Textblöcke, Spalten, Zeilen und trennt sie von Bildern, Linien und Tabellenrahmen.\n3. **Zeichen- und Worterkennung:** Moderne Systeme nutzen trainierte neuronale Netze, die ganze Zeilen auswerten statt einzelner Buchstaben. So werden auch leicht verbundene Zeichen erkannt.\n4. **Sprachmodell und Wörterbuch:** Mehrdeutige Zeichen wie „l“, „1“ und „I“ werden anhand der Sprache und des Wortzusammenhangs aufgelöst.\n\nAm Ende steht entweder reiner Text oder eine PDF mit unsichtbarer Textebene, die über dem Bild liegt. Diese zweite Variante beschreibt der Artikel [PDF durchsuchbar machen](blog:pdf-durchsuchbar-machen-anleitung) im Detail.'
      },
      {
        heading: 'Wovon hängt die Genauigkeit der Texterkennung ab?',
        content: 'OCR liefert bei sauberen, gedruckten Vorlagen gute Ergebnisse, ist aber nie fehlerfrei. Diese Faktoren entscheiden über das Ergebnis:\n\n- **Auflösung:** Für normale Textgröße hat sich ein Scan mit etwa 300 dpi bewährt. Deutlich weniger führt zu verwaschenen Buchstaben, deutlich mehr bringt meist keinen Vorteil.\n- **Kontrast und Licht:** Schatten, Knicke, Vergilbung und Spiegelungen auf Handyfotos verschlechtern die Erkennung spürbar.\n- **Schriftart:** Gedruckte Standardschriften funktionieren am besten. Frakturschrift, sehr kleine Schriftgrößen oder stark dekorative Schriften sind schwierig.\n- **Handschrift:** Allgemeine OCR-Programme sind auf Druckschrift ausgelegt. Handschriftliche Notizen werden oft nur teilweise oder gar nicht erkannt.\n- **Layout:** Mehrspaltige Texte, Tabellen und Formulare können zu vertauschter Lesereihenfolge führen.\n- **Sprache:** Ist die falsche Sprache eingestellt, werden Umlaute und Sonderzeichen häufiger verwechselt.'
      },
      {
        heading: 'Wofür kann ich OCR im Alltag nutzen?',
        content: 'OCR spart vor allem Abtipparbeit und macht Papierablagen durchsuchbar. Typische Anwendungsfälle sind:\n\n- eingescannte Verträge, Rechnungen und Bescheide per Suchfunktion durchsuchen\n- Zitate aus Büchern, Skripten oder Zeitungsartikeln übernehmen\n- Text aus einem Foto oder Screenshot kopieren, etwa eine Adresse oder eine Fehlermeldung\n- eine gescannte Seite wieder in ein bearbeitbares Word-Dokument überführen\n\nFür einzelne Bilder eignet sich das Werkzeug [Bild zu Text](tool:bild-zu-text), für mehrseitige Scans eine OCR-PDF. Wie Sie gezielt Abschnitte aus einem Scan übernehmen, zeigt der Beitrag [Text aus gescannter PDF kopieren](blog:text-aus-gescannter-pdf-kopieren). Wer Text vor allem aus Fotos braucht, findet in [Text aus Bild kopieren](blog:text-aus-bild-kopieren) auch die Bordmittel von iPhone, Android und Windows im Vergleich.'
      },
      {
        heading: 'Kann OCR ohne Upload im Browser laufen?',
        content: 'Ja, moderne Browser sind leistungsfähig genug, um die Texterkennung direkt auf dem eigenen Gerät auszuführen. Datei Tools nutzt dafür die Open-Source-Engine Tesseract: Ihre Scans werden nicht an einen Server übertragen – ein Vorteil bei Gehaltsnachweisen, Arztbriefen oder Verträgen. Erkannt werden deutsche und englische Texte, pro Durchgang bis zu 50 Seiten. Je nach Zweck wählen Sie das passende Ergebnisformat:\n\n| Ergebnis | Was Sie erhalten | Geeignet für |\n|---|---|---|\n| Durchsuchbare PDF | Seitenbild mit unsichtbarer Textebene | Archiv, Suche, Weitergabe |\n| Word (DOCX) | Fließtext in Absätzen, ohne Originallayout | Weiterbearbeiten |\n| Text (TXT) | reiner Text | Kopieren, Weiterverarbeiten |\n\nBeim ersten Einsatz lädt der Browser einmalig die Programmbestandteile und Sprachdaten, danach geht es schneller. Die Rechenarbeit übernimmt Ihr Gerät: Ein moderner Laptop erkennt eine Seite meist zügig, auf einem älteren Smartphone braucht ein dickes Dokument deutlich länger.'
      },
      {
        heading: 'Welche OCR-Fehler sind typisch und wie vermeiden Sie sie?',
        content: 'Die meisten OCR-Fehler gehen auf eine schwache Vorlage zurück, nicht auf die Software. Prüfen Sie deshalb zuerst die Vorlage: Ist die Seite schief, unscharf oder sehr dunkel, scannen oder fotografieren Sie sie neu – flach, gerade von oben und bei gleichmäßigem Licht. Schneiden Sie Ränder und störende Bildteile vorher weg.\n\nHäufige Verwechslungen sind „rn“ und „m“, „0“ und „O“ sowie Kommas und Punkte in Zahlen. Gerade bei Beträgen, IBANs, Aktenzeichen und Telefonnummern sollten Sie das Ergebnis deshalb immer mit dem Original vergleichen. OCR erkennt außerdem nur Text, keine Formatierung im engeren Sinne: Fettungen, Tabellenstrukturen und Seitenumbrüche gehen in einer reinen Textausgabe verloren. Für bearbeitbare Dokumente mit Struktur lohnt sich ein Blick auf [gescannte PDF bearbeiten mit OCR](blog:gescannte-pdf-bearbeiten-ocr-verwenden).'
      },
    ],
    faqs: [
      { question: 'Was bedeutet OCR auf Deutsch?', answer: 'OCR steht für „Optical Character Recognition“, auf Deutsch optische Zeichenerkennung. Gemeint ist die automatische Umwandlung von Text in Bildern oder Scans in maschinenlesbaren, kopierbaren Text.' },
      { question: 'Kann OCR auch Handschrift lesen?', answer: 'Klassische OCR ist auf gedruckten Text ausgelegt. Saubere Druckbuchstaben in Handschrift werden teilweise erkannt, Schreibschrift meist nur unzuverlässig. Für handschriftliche Dokumente sollten Sie das Ergebnis immer vollständig prüfen.' },
      { question: 'Ist OCR immer fehlerfrei?', answer: 'Nein. Auch bei guten Vorlagen können einzelne Zeichen verwechselt werden. Je schlechter Auflösung, Kontrast oder Ausrichtung sind, desto mehr Fehler entstehen. Wichtige Angaben wie Zahlen und Namen sollten Sie deshalb immer gegenlesen.' },
      { question: 'Welche Auflösung sollte ein Scan für OCR haben?', answer: 'Für normal große Schrift sind etwa 300 dpi ein bewährter Richtwert. Bei sehr kleiner Schrift kann eine höhere Auflösung helfen. Wichtiger als hohe Werte sind aber Schärfe, gerade Ausrichtung und guter Kontrast.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'text-aus-bild-kopieren',
    title: 'Text aus Bild kopieren: Foto, Screenshot und Scan auslesen',
    metaTitle: 'Text aus Bild kopieren – so geht es | Datei Tools',
    metaDescription: 'Text aus Bild kopieren: So lesen Sie Fotos und Screenshots mit OCR aus – im Browser ohne Upload, plus Live Text, Google Lens und Windows im Vergleich.',
    h1: 'Text aus Bild kopieren: Fotos und Screenshots in bearbeitbaren Text verwandeln',
    excerpt: 'Ob Rezept, Visitenkarte oder Fehlermeldung im Screenshot: Abtippen ist selten nötig. Wir zeigen, wie Sie Text aus einem Bild kopieren – mit Datei Tools im Browser und mit den Bordmitteln von iPhone, Android, Mac und Windows.',
    category: 'ocr',
    primaryKeyword: 'text aus bild kopieren',
    secondaryKeywords: ['text aus foto kopieren', 'bild in text umwandeln', 'text aus screenshot kopieren', 'text aus bild extrahieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-zu-text',
    ctaHeadline: 'Text jetzt kostenlos aus Bild auslesen',
    ctaButtonLabel: 'Bild zu Text',
    relatedToolSlugs: ['ocr-pdf', 'scan-zu-word', 'bild-zuschneiden'],
    relatedArticleSlugs: ['ocr-texterkennung-erklaert', 'text-aus-gescannter-pdf-kopieren', 'dokumente-mit-dem-handy-scannen-pdf', 'bild-drehen-handyfoto-falsch-herum'],
    directAnswer: 'Um Text aus einem Bild zu kopieren, brauchen Sie eine Texterkennung (OCR): Bild auswählen, Sprache einstellen, Erkennung starten und den Text kopieren. Mit Datei Tools „Bild zu Text“ geht das lokal im Browser für deutsche und englische Texte, ohne Upload. Für einzelne Fotos bieten auch iPhone und Mac (Live Text), Android (Google Lens) und Windows 11 (Snipping Tool) eigene Funktionen.',
    steps: [
      { step: 1, title: 'Bild auswählen', text: 'Öffnen Sie das Werkzeug „Bild zu Text“ und wählen Sie ein Foto, einen Screenshot oder einen Scan aus, zum Beispiel als JPG, PNG, WebP oder TIFF.' },
      { step: 2, title: 'Sprache wählen', text: 'Stellen Sie Deutsch, Englisch oder die Kombination aus beiden ein. Bei deutschen Texten verbessert die richtige Sprache die Erkennung von Umlauten und ß deutlich.' },
      { step: 3, title: 'Texterkennung starten', text: 'Die Erkennung läuft direkt in Ihrem Browser und dauert pro Bild meist einige Sekunden. Beim ersten Start kommt das einmalige Laden der Sprachdaten hinzu.' },
      { step: 4, title: 'Text kopieren und prüfen', text: 'Kopieren Sie den erkannten Text in die Zwischenablage oder speichern Sie ihn als Textdatei. Lesen Sie Zahlen und Namen vor der Weiterverwendung gegen.' },
    ],
    sections: [
      {
        heading: 'Wie funktioniert das Kopieren von Text aus einem Bild?',
        content: 'Text aus einem Bild lässt sich erst kopieren, nachdem eine Texterkennung (OCR) die Buchstabenformen in echte Zeichen übersetzt hat. Ein Foto oder Screenshot enthält nämlich keinen Text im eigentlichen Sinne, sondern nur Pixel, die für uns wie Buchstaben aussehen. Moderne Erkennungssoftware arbeitet dabei mit trainierten Modellen, die ganze Zeilen und Wörter auswerten.\n\nDas Ergebnis ist reiner Text ohne Formatierung: Schriftgrößen, Farben und die genaue Anordnung im Bild gehen dabei verloren. Für Adressen, Zitate, Seriennummern oder kurze Absätze ist das genau richtig. Wie die Erkennung im Detail abläuft und warum sie manchmal danebenliegt, erklärt der Grundlagenartikel [OCR-Texterkennung erklärt](blog:ocr-texterkennung-erklaert).'
      },
      {
        heading: 'Welche Bordmittel gibt es auf iPhone, Android, Mac und Windows?',
        content: 'Alle großen Betriebssysteme haben inzwischen eine eigene Texterkennung für einzelne Bilder. Die wichtigsten Wege im Überblick:\n\n| Weg | Geräte | Wo wird erkannt? | Gut für |\n|---|---|---|---|\n| Datei Tools „Bild zu Text“ | jeder aktuelle Browser | lokal im Browser | Bilddateien, Ausgabe als Text, Word oder PDF |\n| Live Text (Apple) | iPhone, iPad, Mac | auf dem Gerät | Text direkt in Fotos und im Kamerabild |\n| Google Lens | Android, Google-App | je nach Funktion über Google-Dienste | schnelle Auswahl aus Kamera und Google Fotos |\n\n- **iPhone und iPad (Live Text):** In der Fotos-App oder der Kamera erkennt iOS Text automatisch. Halten Sie den Finger auf ein Wort und markieren Sie den gewünschten Bereich, dann „Kopieren“ wählen.\n- **Mac:** Live Text funktioniert auf neueren macOS-Versionen auch in Vorschau und Fotos. Sie können Text im Bild einfach mit der Maus markieren.\n- **Android (Google Lens):** In Google Fotos oder der Google-App öffnen Sie das Bild mit Lens und wählen „Text“. Je nach Gerät und Funktion kann die Auswertung über Google-Dienste laufen.\n- **Windows 11:** Das Snipping Tool bietet auf aktuellen Versionen Textaktionen, mit denen Sie Text aus einem Bildschirmausschnitt kopieren. Mit den kostenlosen Microsoft PowerToys gibt es zusätzlich einen „Text Extractor“.\n\nDiese Werkzeuge sind praktisch für schnelle Einzelfälle. Für Bilder, die bereits als Datei vorliegen, für mehrere Dateien oder wenn Sie genau wissen wollen, wo die Daten verarbeitet werden, ist ein Browser-Werkzeug oft bequemer.'
      },
      {
        heading: 'Wie verbessere ich die Texterkennung?',
        content: 'Die Qualität der Vorlage ist der wichtigste Hebel für ein gutes Ergebnis. Diese Punkte helfen am meisten:\n\n- **Zuschneiden:** Entfernen Sie alles, was kein Text ist – Ränder, Fotos, Logos. Dafür eignet sich das Werkzeug [Bild zuschneiden](tool:bild-zuschneiden).\n- **Gerade ausrichten:** Schräge oder auf dem Kopf stehende Bilder verschlechtern die Erkennung. Steht ein Handyfoto falsch herum, hilft der Beitrag [Bild drehen: Handyfoto falsch herum](blog:bild-drehen-handyfoto-falsch-herum).\n- **Gutes Licht:** Fotografieren Sie Papier bei gleichmäßigem Tageslicht, ohne Schatten der eigenen Hand und ohne Blitzreflexe.\n- **Nah genug heran:** Der Text sollte im Bild groß und scharf sein. Ein Screenshot in Originalgröße ist besser als ein verkleinertes Vorschaubild.\n- **Richtige Sprache:** Für deutsch-englische Mischtexte wählen Sie die Kombination aus Deutsch und Englisch statt nur einer Sprache.'
      },
      {
        heading: 'Was tun, wenn der erkannte Text Fehler enthält?',
        content: 'Wenn der erkannte Text Lücken oder seltsame Zeichen enthält, hilft meist einer dieser Ansätze:\n\n- **Zeichensalat:** Das Bild ist zu klein oder unscharf. Verwenden Sie eine höher aufgelöste Version oder fotografieren Sie neu.\n- **Falsche Reihenfolge:** Bei mehrspaltigem Text oder Tabellen springt die Erkennung zwischen Spalten. Schneiden Sie die Spalten einzeln aus und erkennen Sie sie nacheinander.\n- **Text auf farbigem oder gemustertem Hintergrund:** Ein höherer Kontrast oder eine Schwarz-Weiß-Version des Bildes kann helfen.\n- **Handschrift:** Wird oft nur teilweise erkannt. Hier ist Nacharbeit fast immer nötig.\n- **Mehrseitige Dokumente:** Für ganze Scans ist eine OCR-PDF sinnvoller als viele Einzelbilder. Wie Sie gezielt Passagen aus solchen Dateien übernehmen, steht in [Text aus gescannter PDF kopieren](blog:text-aus-gescannter-pdf-kopieren).'
      },
      {
        heading: 'Warum ist lokale Texterkennung bei privaten Bildern sinnvoll?',
        content: 'Lokale Texterkennung hält persönliche Daten auf dem eigenen Gerät – und Bilder mit Text enthalten oft mehr davon, als man denkt: Kontoauszüge, Ausweisfotos, Briefe mit Adressen oder Screenshots aus Chats. Bei Datei Tools läuft die Erkennung deshalb vollständig in Ihrem Browser; das Bild wird nicht an einen Server übertragen.\n\nDie Rechenleistung kommt dafür von Ihrem Computer oder Smartphone. Beim ersten Start lädt der Browser einmalig die Erkennungsdaten, danach geht es meist zügig. Möchten Sie das Ergebnis nicht nur kopieren, sondern als bearbeitbares Dokument weiterverarbeiten, bietet sich das Werkzeug [Scan zu Word](tool:scan-zu-word) an.'
      },
    ],
    faqs: [
      { question: 'Kann ich Text aus einem Screenshot kopieren?', answer: 'Ja. Screenshots eignen sich sogar besonders gut, weil die Schrift scharf und gerade ist. Verwenden Sie möglichst den Screenshot in Originalgröße und schneiden Sie störende Bereiche vorher weg.' },
      { question: 'Funktioniert das auch mit dem Handy?', answer: 'Ja. Sie können das Browser-Werkzeug auf iPhone und Android nutzen. Zusätzlich bieten iOS mit Live Text und Android mit Google Lens eigene Funktionen, um Text direkt in Fotos zu markieren.' },
      { question: 'Warum werden Umlaute falsch erkannt?', answer: 'Meist ist eine andere Sprache als Deutsch eingestellt oder das Bild ist zu klein. Wählen Sie Deutsch als Erkennungssprache und verwenden Sie eine schärfere, größere Vorlage.' },
      { question: 'Bleibt die Formatierung beim Kopieren erhalten?', answer: 'Nein, die Texterkennung liefert reinen Text. Absätze bleiben meist erhalten, Schriftarten, Farben und Tabellenstrukturen aber nicht. Diese müssen Sie bei Bedarf in Ihrem Textprogramm neu anlegen.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'pdf-durchsuchbar-machen-anleitung',
    title: 'PDF durchsuchbar machen: Gescannte Dokumente mit OCR erschließen',
    metaTitle: 'PDF durchsuchbar machen mit OCR | Datei Tools',
    metaDescription: 'PDF durchsuchbar machen: So fügen Sie gescannten PDFs per OCR eine Textebene hinzu, damit Suche und Kopieren funktionieren – kostenlos, ohne Upload.',
    h1: 'PDF durchsuchbar machen: Anleitung für gescannte Dokumente',
    excerpt: 'Strg+F findet nichts, Text lässt sich nicht markieren? Dann besteht Ihre PDF nur aus Bildern. So machen Sie gescannte PDFs per Texterkennung durchsuchbar und worauf Sie dabei achten sollten.',
    category: 'ocr',
    primaryKeyword: 'pdf durchsuchbar machen',
    secondaryKeywords: ['gescannte pdf durchsuchbar machen', 'pdf texterkennung', 'pdf mit textebene', 'pdf suchbar machen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-durchsuchbar-machen',
    ctaHeadline: 'PDF jetzt kostenlos durchsuchbar machen',
    ctaButtonLabel: 'PDF durchsuchbar machen',
    relatedToolSlugs: ['ocr-pdf', 'pdf-text-extrahieren', 'pdf-komprimieren'],
    relatedArticleSlugs: ['ocr-texterkennung-erklaert', 'gescannte-pdf-bearbeiten-ocr-verwenden', 'text-aus-gescannter-pdf-kopieren', 'dokumente-mit-dem-handy-scannen-pdf'],
    directAnswer: 'Eine gescannte PDF machen Sie durchsuchbar, indem eine Texterkennung (OCR) den Text in den Seitenbildern erkennt und als unsichtbare Textebene hinzufügt. Danach funktionieren Suchen, Markieren und Kopieren, während die Seiten optisch nahezu gleich bleiben. Mit Datei Tools geht das kostenlos im Browser für deutsche und englische Texte, bis 50 Seiten und 50 MB pro Durchgang, ohne dass die PDF Ihr Gerät verlässt.',
    steps: [
      { step: 1, title: 'Prüfen, ob die PDF Text enthält', text: 'Öffnen Sie die PDF und suchen Sie mit Strg+F bzw. Cmd+F nach einem sichtbaren Wort. Findet der Betrachter nichts, besteht die Seite nur aus einem Bild.' },
      { step: 2, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug „PDF durchsuchbar machen“ und ziehen Sie Ihre gescannte PDF per Drag & Drop hinein.' },
      { step: 3, title: 'Sprache wählen und Erkennung starten', text: 'Stellen Sie die Dokumentsprache ein (Deutsch, Englisch oder beides) und starten Sie die Texterkennung. Bei vielen Seiten dauert die lokale Verarbeitung je nach Gerät einige Minuten.' },
      { step: 4, title: 'Durchsuchbare PDF speichern und testen', text: 'Laden Sie die neue PDF herunter und testen Sie die Suchfunktion mit einigen Begriffen aus dem Dokument.' },
    ],
    sections: [
      {
        heading: 'Warum ist meine PDF nicht durchsuchbar?',
        content: 'Eine PDF ist nicht durchsuchbar, wenn ihre Seiten nur aus Bildern bestehen – typisch für Scans. Wenn Sie ein Dokument aus Word oder einem anderen Programm als PDF speichern, enthält die Datei echten Text: Jedes Zeichen ist als Zeichen gespeichert und damit such- und kopierbar. Ein Scanner oder eine Handy-Scan-App erzeugt dagegen ein Foto der Seite und packt dieses Bild in eine PDF-Hülle. Für den PDF-Betrachter ist das nur eine Grafik.\n\nSie erkennen eine solche „Bild-PDF“ daran, dass sich kein Text markieren lässt, die Suche keine Treffer liefert und beim Kopieren nichts in der Zwischenablage landet. Auch Programme, die Text aus PDFs auslesen sollen, finden dann nichts. Ein Werkzeug wie [PDF-Text extrahieren](tool:pdf-text-extrahieren) funktioniert erst, nachdem eine Textebene vorhanden ist. Wie die Texterkennung grundsätzlich arbeitet, erklärt [OCR-Texterkennung erklärt](blog:ocr-texterkennung-erklaert).'
      },
      {
        heading: 'Was passiert beim Durchsuchbarmachen genau?',
        content: 'Beim Durchsuchbarmachen erkennt die OCR-Software Textzeilen und Wörter samt Position und schreibt den Text als unsichtbare Ebene genau an die Stelle, an der er im Bild steht. Bei Datei Tools wird dazu jede Seite mit bis zu 300 dpi neu als Bild berechnet und zusammen mit der Textebene in eine neue PDF geschrieben; das Erscheinungsbild bleibt dabei weitgehend gleich.\n\nDadurch ergeben sich mehrere Vorteile:\n\n- Die Suchfunktion Ihres PDF-Betrachters findet Begriffe und springt zur richtigen Stelle.\n- Sie können Textpassagen markieren und kopieren.\n- Desktop-Suchen und Dokumentenverwaltungen können den Inhalt indexieren.\n- Vorlesefunktionen erhalten zumindest den Text, auch wenn eine vollständig barrierefreie PDF zusätzlich Strukturinformationen bräuchte.\n\nWichtig zu wissen: Der sichtbare Inhalt wird nicht korrigiert. Ist ein Wort falsch erkannt, sehen Sie das erst beim Suchen oder Kopieren.'
      },
      {
        heading: 'Wie scanne ich Dokumente für eine gute Texterkennung?',
        content: 'Die Qualität der Textebene hängt direkt von der Qualität der Seitenbilder ab. Wenn Sie noch neu scannen können, beachten Sie:\n\n- Scannen Sie Text mit etwa 300 dpi. Für Belege mit sehr kleiner Schrift kann mehr sinnvoll sein.\n- Legen Sie Seiten gerade auf und vermeiden Sie Schatten am Buchfalz.\n- Graustufen reichen für Textdokumente meist aus und erzeugen kleinere Dateien als Farbe.\n- Bei Handy-Scans helfen gleichmäßiges Licht und eine dunkle, ruhige Unterlage.\n\nTipps speziell für Smartphones finden Sie im Beitrag [Dokumente mit dem Handy scannen und als PDF speichern](blog:dokumente-mit-dem-handy-scannen-pdf). Ist die fertige Datei anschließend zu groß für E-Mail oder ein Behördenportal, können Sie sie mit [PDF komprimieren](tool:pdf-komprimieren) verkleinern. Prüfen Sie danach kurz, ob die Suche noch funktioniert.'
      },
      {
        heading: 'Welche Probleme gibt es beim Durchsuchbarmachen?',
        content: 'Die meisten Probleme betreffen geschützte, signierte oder sehr umfangreiche PDFs:\n\n- **Die PDF ist passwortgeschützt:** Das Werkzeug verarbeitet keine verschlüsselten PDFs. Entsperren Sie die Datei zuerst mit dem bekannten Passwort – das ist nur zulässig, wenn Sie dazu berechtigt sind.\n- **Die PDF ist digital signiert:** Jede Änderung, auch eine hinzugefügte Textebene, macht eine bestehende digitale Signatur ungültig. Bewahren Sie das signierte Original daher immer auf.\n- **Links, Formularfelder und Lesezeichen fehlen:** Weil die Seiten als Bild neu aufgebaut werden, übernimmt die neue PDF solche interaktiven Elemente nicht.\n- **Die Dateigröße ändert sich:** Durch die neu gespeicherten Seitenbilder und die Textebene kann die PDF größer oder kleiner werden als das Original.\n- **Mischdokumente:** Enthält die PDF teils echten Text, werden auch diese Seiten als Bild neu berechnet und per OCR erkannt. Das ist unnötig und kann Erkennungsfehler einführen; wandeln Sie nach Möglichkeit nur die gescannten Seiten um.\n- **Sehr viele Seiten:** Pro Durchgang verarbeitet das Werkzeug bis zu 50 Seiten und Dateien bis 50 MB. Teilen Sie größere Dokumente vorher auf.'
      },
      {
        heading: 'Warum sollten vertrauliche Scans lokal verarbeitet werden?',
        content: 'Gescannte Dokumente wie Steuerbescheide, Arztberichte, Arbeitsverträge oder Kontoauszüge gehören nicht auf fremde Server. Bei Datei Tools läuft die Texterkennung deshalb vollständig in Ihrem Browser, die PDF verlässt Ihr Gerät nicht.\n\nDer Ablauf ist auf Windows, macOS, Linux, iPhone und Android identisch, solange ein aktueller Browser genutzt wird. Für sehr umfangreiche Dokumente empfiehlt sich ein Laptop oder Desktop-PC, weil dort mehr Rechenleistung und Arbeitsspeicher zur Verfügung stehen. Wenn Sie den erkannten Text anschließend in einem Textprogramm weiterbearbeiten möchten, lesen Sie [gescannte PDF bearbeiten mit OCR](blog:gescannte-pdf-bearbeiten-ocr-verwenden).'
      },
    ],
    faqs: [
      { question: 'Wie erkenne ich, ob eine PDF bereits durchsuchbar ist?', answer: 'Suchen Sie mit Strg+F oder Cmd+F nach einem Wort, das sichtbar auf der Seite steht, oder versuchen Sie, Text zu markieren. Klappt beides, besitzt die PDF bereits eine Textebene.' },
      { question: 'Verändert OCR das Aussehen meiner PDF?', answer: 'Kaum. Die erkannte Textebene ist unsichtbar. Datei Tools speichert die Seiten allerdings mit bis zu 300 dpi neu als Bild, sodass feine Details minimal abweichen und sich die Dateigröße verändern kann.' },
      { question: 'Kann ich nach der Texterkennung den Text direkt in der PDF bearbeiten?', answer: 'Nur eingeschränkt. Die Textebene dient dem Suchen und Kopieren, das sichtbare Bild bleibt ein Bild. Um Inhalte zu ändern, wandeln Sie den Scan besser in ein Word-Dokument um und bearbeiten ihn dort.' },
      { question: 'Funktioniert das auch mit Handschrift?', answer: 'Handschrift wird von allgemeiner OCR oft nur teilweise erkannt. Gedruckter Text ist deutlich zuverlässiger. Bei handschriftlichen Notizen sollten Sie keine vollständige Durchsuchbarkeit erwarten.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'dokumente-mit-dem-handy-scannen-pdf',
    title: 'Dokumente mit dem Handy scannen und als PDF speichern',
    metaTitle: 'Dokumente mit dem Handy scannen: PDF-Anleitung',
    metaDescription: 'Dokumente mit dem Handy scannen: So erstellen Sie mit iPhone und Android saubere PDFs, fügen Seiten zusammen und machen sie durchsuchbar – ohne Upload.',
    h1: 'Dokumente mit dem Handy scannen: Von der Aufnahme zur fertigen PDF',
    excerpt: 'Ein Scanner ist für die meisten Briefe, Belege und Formulare nicht mehr nötig. Wir zeigen, wie Sie mit iPhone und Android ordentliche Scans erstellen, mehrere Seiten zu einer PDF zusammenfassen und Text durchsuchbar machen.',
    category: 'ocr',
    primaryKeyword: 'dokumente mit handy scannen',
    secondaryKeywords: ['mit iphone scannen', 'mit android scannen pdf', 'handy scan als pdf', 'dokument scannen ohne scanner'],
    searchIntent: 'informational',
    primaryToolSlug: 'scan-zu-pdf',
    ctaHeadline: 'Scans jetzt kostenlos in eine PDF umwandeln',
    ctaButtonLabel: 'Scan zu PDF',
    relatedToolSlugs: ['jpg-in-pdf-umwandeln', 'pdf-komprimieren', 'ocr-pdf', 'heic-in-jpg-umwandeln'],
    relatedArticleSlugs: ['mehrere-bilder-als-eine-pdf-speichern', 'fotos-in-pdf-umwandeln-so-funktioniert-es', 'pdf-durchsuchbar-machen-anleitung', 'pdf-unter-5-mb-verkleinern'],
    directAnswer: 'Mit dem iPhone scannen Sie Dokumente direkt in der Notizen- oder Dateien-App über „Dokumente scannen“, unter Android zum Beispiel mit der Scan-Funktion von Google Drive. Liegen die Seiten nur als Fotos vor, fassen Sie sie mit einem Werkzeug wie „JPG in PDF umwandeln“ in der richtigen Reihenfolge zu einer PDF zusammen. Eine anschließende Texterkennung, etwa mit „Scan zu PDF“, macht den Scan durchsuchbar.',
    steps: [
      { step: 1, title: 'Dokument vorbereiten', text: 'Legen Sie das Blatt flach auf eine dunkle, ruhige Unterlage und sorgen Sie für gleichmäßiges Licht ohne Schatten.' },
      { step: 2, title: 'Seiten fotografieren oder scannen', text: 'Nutzen Sie die Scan-Funktion Ihres Smartphones oder fotografieren Sie jede Seite gerade von oben, sodass das Blatt das Bild möglichst ausfüllt.' },
      { step: 3, title: 'Bilder zu einer PDF zusammenfassen', text: 'Wählen Sie die Fotos im Werkzeug „JPG in PDF umwandeln“ aus, bringen Sie die Seiten in die richtige Reihenfolge und erstellen Sie die PDF direkt im Browser.' },
      { step: 4, title: 'Optional: durchsuchbar machen und verkleinern', text: 'Lassen Sie die PDF mit „Scan zu PDF“ durch die Texterkennung laufen, damit Sie später darin suchen können. Komprimieren Sie sie bei Bedarf für E-Mail oder Portale und prüfen Sie danach, ob die Suche noch funktioniert.' },
    ],
    sections: [
      {
        heading: 'Wie scanne ich Dokumente mit dem iPhone?',
        content: 'Das iPhone hat eine Scan-Funktion fest eingebaut, eine zusätzliche App ist nicht nötig. Sie finden sie an zwei Stellen:\n\n- **Notizen-App:** Neue Notiz öffnen, auf das Kamera- bzw. Anhang-Symbol tippen und „Dokumente scannen“ wählen.\n- **Dateien-App:** Im gewünschten Ordner oben auf das Menü mit den drei Punkten tippen und „Dokumente scannen“ auswählen. Der Scan wird direkt als PDF in diesem Ordner gespeichert.\n\nDie Kamera erkennt die Blattränder automatisch, entzerrt die Seite und löst bei ruhiger Hand selbst aus. Mehrere Seiten scannen Sie nacheinander, bevor Sie auf „Sichern“ tippen. Haben Sie Dokumente stattdessen mit der normalen Kamera fotografiert, liegen sie eventuell im HEIC-Format vor. Diese lassen sich mit [HEIC in JPG umwandeln](tool:heic-in-jpg-umwandeln) kompatibel machen, bevor Sie sie weiterverarbeiten.'
      },
      {
        heading: 'Wie scanne ich Dokumente mit Android?',
        content: 'Unter Android scannen Sie am einfachsten mit Google Drive oder der Kamera-App des Herstellers. Bei Google Drive funktioniert es so: In der App auf das Plus-Symbol tippen und „Scannen“ wählen. Drive erkennt die Blattkanten, schneidet zu und speichert das Ergebnis als PDF. Viele Hersteller, etwa Samsung, haben zusätzlich eine Dokumentenerkennung in der Kamera-App integriert, die beim Fotografieren eines Blatts einen Scan-Vorschlag anzeigt.\n\nBeachten Sie bei Cloud-Apps, dass die Scans in Ihrem Online-Speicher landen. Wenn Sie das nicht möchten, fotografieren Sie die Seiten mit der Kamera und erstellen die PDF anschließend lokal im Browser. Wie Sie mehrere Fotos sauber zu einem Dokument zusammenfassen, zeigt auch der Beitrag [mehrere Bilder als eine PDF speichern](blog:mehrere-bilder-als-eine-pdf-speichern).'
      },
      {
        heading: 'Wie gelingen Handy-Scans in guter Qualität?',
        content: 'Ob ein Handy-Scan sauber wirkt, entscheidet sich bei der Aufnahme. Diese Punkte machen den größten Unterschied:\n\n- **Licht:** Gleichmäßiges Tageslicht oder eine helle Deckenlampe sind ideal. Vermeiden Sie den Blitz, er erzeugt Reflexe auf glänzendem Papier.\n- **Schatten:** Halten Sie das Smartphone so, dass weder Hand noch Handy einen Schatten auf das Blatt werfen.\n- **Untergrund:** Ein dunkler, einfarbiger Tisch hilft der automatischen Randerkennung.\n- **Perspektive:** Fotografieren Sie möglichst senkrecht von oben. Schräge Aufnahmen werden zwar entzerrt, verlieren aber an Schärfe.\n- **Knicke:** Glätten Sie gefaltete Briefe vorher, sonst entstehen Schattenlinien, die auch die Texterkennung stören.\n\nGute Aufnahmen zahlen sich doppelt aus: Sie sind besser lesbar und werden von einer anschließenden OCR zuverlässiger erkannt.'
      },
      {
        heading: 'Wie wird aus Handyfotos eine durchsuchbare, kleine PDF?',
        content: 'Einzelne Fotos fassen Sie mit [JPG in PDF umwandeln](tool:jpg-in-pdf-umwandeln) zu einem Dokument zusammen; dort lässt sich die Seitenreihenfolge vor dem Erstellen ändern. Achten Sie darauf, dass alle Seiten richtig herum stehen. Das Werkzeug „Scan zu PDF“ ist dagegen für die Texterkennung gedacht: Es verarbeitet jeweils ein Bild oder eine PDF und legt eine durchsuchbare Textebene über die Seiten.\n\nHandyfotos sind oft mehrere Megabyte groß. Eine mehrseitige PDF kann daher schnell zu groß für E-Mail-Anhänge oder Upload-Grenzen von Behörden- und Bewerbungsportalen werden. Komprimieren Sie die fertige PDF in diesem Fall; wie Sie gezielt unter eine bestimmte Grenze kommen, erklärt [PDF unter 5 MB verkleinern](blog:pdf-unter-5-mb-verkleinern). Soll das Dokument durchsuchbar sein, lassen Sie die Texterkennung vor dem Komprimieren laufen und prüfen danach kurz die Suche – Details dazu im Beitrag [PDF durchsuchbar machen](blog:pdf-durchsuchbar-machen-anleitung).'
      },
      {
        heading: 'Wie bleiben Handy-Scans privat und was tun bei Problemen?',
        content: 'Handy-Scans enthalten oft Ausweisdaten, Kontonummern oder Gesundheitsinformationen und sollten deshalb möglichst lokal verarbeitet werden. Bei Datei Tools werden Ihre Fotos im Browser zu einer PDF verarbeitet und nicht an einen Server übertragen. Die Verarbeitung funktioniert auch direkt auf dem Smartphone, kann bei vielen hochauflösenden Fotos aber etwas Zeit brauchen.\n\nHäufige Probleme und Lösungen:\n\n- **Seite steht kopf oder liegt quer:** Drehen Sie das Foto vor dem Zusammenfügen oder drehen Sie die Seite in der fertigen PDF.\n- **Scan ist grau und flau:** Ein Schwarz-Weiß-Filter in der Scan-App erhöht den Kontrast für reine Textseiten.\n- **PDF ist zu groß:** Fotos vorher verkleinern oder die PDF komprimieren.\n- **Text lässt sich nicht kopieren:** Ein Scan ist zunächst nur ein Bild. Erst die Texterkennung fügt eine Textebene hinzu.'
      },
    ],
    faqs: [
      { question: 'Brauche ich eine Scanner-App auf dem iPhone?', answer: 'Nein. Die Notizen-App und die Dateien-App haben eine eingebaute Funktion „Dokumente scannen“, die Ränder erkennt, die Seite entzerrt und das Ergebnis als PDF speichern kann.' },
      { question: 'Ist ein Handy-Scan für Behörden ausreichend?', answer: 'Für viele Online-Formulare und Portale werden Handy-Scans akzeptiert, solange sie gut lesbar, vollständig und im verlangten Format sind. Verbindliche Vorgaben zu Dateiformat, Größe und Qualität entnehmen Sie bitte der jeweiligen Stelle.' },
      { question: 'Wie scanne ich mehrere Seiten in eine PDF?', answer: 'In den Scan-Funktionen von iPhone und Google Drive scannen Sie einfach mehrere Seiten nacheinander, bevor Sie speichern. Liegen die Seiten als einzelne Fotos vor, fassen Sie sie mit einem Werkzeug wie „JPG in PDF umwandeln“ in der gewünschten Reihenfolge zusammen.' },
      { question: 'Kann ich den Text eines Handy-Scans durchsuchen?', answer: 'Erst nach einer Texterkennung. Ein Scan ist zunächst nur ein Bild der Seite. Mit einer OCR wird eine unsichtbare Textebene ergänzt, danach funktionieren Suchen und Kopieren.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'video-in-mp3-umwandeln-anleitung',
    title: 'Video in MP3 umwandeln: Tonspur aus eigenen Videos speichern',
    metaTitle: 'Video in MP3 umwandeln: Anleitung | Datei Tools',
    metaDescription: 'Video in MP3 umwandeln: So speichern Sie die Tonspur eigener Videos als MP3, wählen die passende Bitrate und beachten das Urheberrecht – ohne Upload.',
    h1: 'Video in MP3 umwandeln: Tonspur aus Videos extrahieren und richtig speichern',
    excerpt: 'Sprachmemo im Video, Mitschnitt eines Vortrags oder das eigene Konzertvideo: Oft wird nur der Ton gebraucht. Wir zeigen, wie Sie die Tonspur als MP3 speichern, welche Qualität sinnvoll ist und was rechtlich erlaubt ist.',
    category: 'media',
    primaryKeyword: 'video in mp3 umwandeln',
    secondaryKeywords: ['mp4 in mp3 umwandeln', 'ton aus video extrahieren', 'audio aus video speichern', 'video zu mp3 konvertieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'video-in-mp3-umwandeln',
    ctaHeadline: 'Tonspur jetzt kostenlos als MP3 speichern',
    ctaButtonLabel: 'Video in MP3 umwandeln',
    relatedToolSlugs: ['audio-konvertieren', 'audio-komprimieren', 'video-konvertieren'],
    relatedArticleSlugs: ['mov-in-mp4-umwandeln-iphone-videos', 'mp4-komprimieren-video-verkleinern', 'video-in-gif-umwandeln-anleitung', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Um ein Video in MP3 umzuwandeln, wird die Tonspur aus der Videodatei ausgelesen und als MP3 neu kodiert; das Bild wird verworfen. Mit Datei Tools geht das lokal im Browser für Videos bis 500 MB, mit wählbarer Bitrate von 64 bis 256 kbit/s – für Sprache genügen 64 bis 128, für Musik sind 192 kbit/s oder mehr sinnvoll. Wandeln Sie nur eigene Videos oder Material um, für das Sie die Rechte haben.',
    steps: [
      { step: 1, title: 'Videodatei auswählen', text: 'Öffnen Sie den Konverter und wählen Sie ein Video aus, das auf Ihrem Gerät gespeichert ist, etwa MP4, MOV, WebM oder MKV.' },
      { step: 2, title: 'Audioqualität wählen', text: 'Wählen Sie eine Bitrate zwischen 64 und 256 kbit/s, voreingestellt sind 192 kbit/s. Für Sprache reicht eine niedrigere Bitrate, für Musik ist eine höhere sinnvoll.' },
      { step: 3, title: 'Tonspur extrahieren', text: 'Das Video wird in Ihrem Browser verarbeitet und die Tonspur als MP3 kodiert. Beim ersten Start lädt der Browser einmalig die Konvertierungs-Engine (rund 31 MB); lange Videos brauchen je nach Gerät eine Weile.' },
      { step: 4, title: 'MP3 speichern und anhören', text: 'Laden Sie die MP3-Datei herunter und hören Sie kurz hinein, ob Anfang, Ende und Lautstärke stimmen.' },
    ],
    sections: [
      {
        heading: 'Was passiert beim Umwandeln von Video in MP3?',
        content: 'Beim Umwandeln in MP3 wird die Tonspur aus dem Video ausgelesen, dekodiert und neu als MP3 kodiert. Eine Videodatei wie MP4 oder MOV ist nämlich ein Container mit mehreren Spuren: mindestens einer Bildspur und meist einer Tonspur, die in Smartphone-Videos in der Regel im Format AAC vorliegt. Die Bildspur wird verworfen, deshalb ist die MP3-Datei deutlich kleiner als das Video.\n\nWichtig zu verstehen: Sowohl AAC als auch MP3 sind verlustbehaftete Formate. Bei der Umwandlung entsteht also eine weitere Kompressionsstufe. Bei ausreichender Bitrate ist der Unterschied meist kaum hörbar, besser als die ursprüngliche Tonspur kann die MP3 aber nie klingen. Wenn Sie stattdessen ein anderes Audioformat benötigen, etwa WAV für die Weiterbearbeitung, hilft das Werkzeug [Audio konvertieren](tool:audio-konvertieren).'
      },
      {
        heading: 'Welche MP3-Bitrate ist sinnvoll?',
        content: 'Für Sprache reichen 64 bis 128 kbit/s, für Musik sind 192 kbit/s oder mehr sinnvoll. Die Bitrate bestimmt, wie viele Daten pro Sekunde für den Ton verwendet werden – und damit Klangqualität und Dateigröße. Die Dateigröße pro Minute ergibt sich direkt aus der Bitrate (kbit/s × 60 ÷ 8):\n\n| Bitrate | Geeignet für | Größe pro Minute |\n|---|---|---|\n| 64 kbit/s | Sprache, Sprachnotizen | ca. 0,5 MB |\n| 128 kbit/s | Vorträge, Podcasts, einfache Musik | ca. 1 MB |\n| 192 kbit/s (Voreinstellung) | Musik zum normalen Anhören | ca. 1,4 MB |\n| 256 kbit/s | Musik in hoher Qualität | ca. 1,9 MB |\n\n256 kbit/s ist die höchste Stufe im Werkzeug von Datei Tools; das MP3-Format selbst erlaubt bis 320 kbit/s.\n\nEine höhere Bitrate als die der Originaltonspur bringt keinen Gewinn, sondern nur eine größere Datei. Hat Ihr Handyvideo eine Tonspur mit 128 kbit/s, klingt eine MP3 mit 256 kbit/s nicht besser. Ist die fertige Datei zu groß für den Versand, können Sie sie nachträglich mit [Audio komprimieren](tool:audio-komprimieren) verkleinern.'
      },
      {
        heading: 'Ist es erlaubt, Videos in MP3 umzuwandeln?',
        content: 'Bei eigenen oder freigegebenen Inhalten ja, bei fremdem Material nicht ohne Weiteres. Technisch lässt sich aus fast jedem Video eine MP3 erstellen, rechtlich ist das aber nicht immer erlaubt. Unproblematisch sind eigene Aufnahmen, etwa ein Vortrag, den Sie selbst gefilmt haben, oder Inhalte mit einer Lizenz, die die Weiterverwendung gestattet.\n\nBei fremden Musikvideos, Filmen oder Streams greift das Urheberrecht. Plattformen wie YouTube untersagen in ihren Nutzungsbedingungen außerdem das Herunterladen von Inhalten außerhalb der dafür vorgesehenen Funktionen. Datei Tools lädt deshalb keine Videos von Webseiten oder Plattformen herunter, sondern verarbeitet ausschließlich Dateien, die bereits auf Ihrem Gerät liegen.\n\nDiese Hinweise sind keine Rechtsberatung. Wenn Sie unsicher sind, ob Sie ein bestimmtes Material verwenden dürfen, klären Sie das vorab mit dem Rechteinhaber oder einer fachkundigen Stelle.'
      },
      {
        heading: 'Was tun, wenn die Umwandlung in MP3 nicht klappt?',
        content: 'Die meisten Probleme betreffen ungewöhnliche Codecs, fehlende Tonspuren oder sehr große Dateien:\n\n- **Das Video wird nicht angenommen:** Manche exotischen Codecs kann die Browser-Version von FFmpeg nicht lesen. Exportieren Sie das Video dann in einem anderen Programm als MP4 mit H.264.\n- **Die MP3 ist stumm oder es kommt eine Fehlermeldung:** Das Video hat möglicherweise gar keine Tonspur, etwa bei Bildschirmaufnahmen ohne Mikrofon.\n- **Die Datei ist zu groß:** Das Werkzeug verarbeitet Videos bis 500 MB; auf Smartphones sind wegen des begrenzten Arbeitsspeichers Dateien unter 200 MB empfehlenswert.\n- **Die Verarbeitung dauert sehr lange oder bricht ab:** Die Umwandlung läuft auf Ihrem Gerät. Lange Videos brauchen auf Smartphones und älteren Rechnern spürbar mehr Zeit; schließen Sie andere Tabs oder nutzen Sie einen Computer.\n- **iPhone-Videos im MOV-Format:** Diese funktionieren in der Regel direkt. Mehr zum Format lesen Sie in [MOV in MP4 umwandeln](blog:mov-in-mp4-umwandeln-iphone-videos).'
      },
      {
        heading: 'Welche Vorteile hat die Umwandlung im Browser?',
        content: 'Die Umwandlung im Browser hält private Videos auf dem eigenen Gerät – etwa Familienfeiern, Sprachnachrichten oder Aufnahmen aus Besprechungen. Bei Datei Tools wird die Tonspur mit FFmpeg direkt im Browser extrahiert und kodiert.\n\nNeben dem Datenschutz hat das einen praktischen Vorteil: Sie müssen keine großen Dateien über eine eventuell langsame Internetverbindung übertragen. Der Nachteil ist, dass die Rechenleistung Ihres Geräts das Tempo bestimmt. Was bei der Auswahl eines Online-Werkzeugs grundsätzlich zu beachten ist, beschreibt der Beitrag [Dateien ohne Upload bearbeiten](blog:dateien-ohne-upload-bearbeiten-dsgvo). Und wenn Sie das Video selbst nur verkleinern statt den Ton herauslösen möchten, lesen Sie [MP4 komprimieren](blog:mp4-komprimieren-video-verkleinern).'
      },
    ],
    faqs: [
      { question: 'Darf ich YouTube-Videos in MP3 umwandeln?', answer: 'YouTube untersagt das Herunterladen außerhalb seiner eigenen Funktionen in den Nutzungsbedingungen, und bei fremder Musik greift zusätzlich das Urheberrecht. Datei Tools verarbeitet nur Dateien, die bereits auf Ihrem Gerät liegen. Wandeln Sie nur eigene Videos oder Inhalte um, für die Sie die Rechte haben.' },
      { question: 'Verliert der Ton beim Umwandeln an Qualität?', answer: 'Die Tonspur wird neu kodiert, wodurch eine weitere verlustbehaftete Stufe entsteht. Bei ausreichender Bitrate ist das kaum hörbar. Besser als die Originaltonspur kann die MP3 aber nicht werden.' },
      { question: 'Funktioniert das auch auf dem Smartphone?', answer: 'Ja, in einem aktuellen Browser auf iPhone und Android. Bei langen Videos ist die Verarbeitung auf dem Handy jedoch langsamer als am Computer, und sehr große Dateien können an Speichergrenzen stoßen.' },
      { question: 'Welches Audioformat ist besser als MP3?', answer: 'Für maximale Kompatibilität ist MP3 weiterhin die sichere Wahl. AAC bzw. M4A klingt bei gleicher Bitrate oft etwas besser, WAV ist verlustfrei, aber sehr groß. Die Wahl hängt davon ab, wo Sie die Datei abspielen oder weiterbearbeiten.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'mp4-komprimieren-video-verkleinern',
    title: 'MP4 komprimieren: Videos verkleinern für E-Mail und Messenger',
    metaTitle: 'MP4 komprimieren: Video verkleinern | Datei Tools',
    metaDescription: 'MP4 komprimieren: Welche Stellschrauben (Auflösung, Bitrate, Bildrate) wirklich helfen und wie Sie Videos kostenlos und ohne Upload im Browser verkleinern.',
    h1: 'MP4 komprimieren: So machen Sie Videos kleiner, ohne sie unbrauchbar zu machen',
    excerpt: 'Smartphones filmen in hoher Auflösung, und schon eine kurze Aufnahme sprengt das Limit von E-Mail-Anhängen. Wir erklären, welche Einstellungen die Dateigröße bestimmen und wie Sie ein MP4 sinnvoll verkleinern.',
    category: 'media',
    primaryKeyword: 'mp4 komprimieren',
    secondaryKeywords: ['video verkleinern', 'video komprimieren', 'mp4 verkleinern', 'video für e-mail verkleinern', 'videodatei kleiner machen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'video-komprimieren',
    ctaHeadline: 'Video jetzt kostenlos komprimieren',
    ctaButtonLabel: 'Video komprimieren',
    relatedToolSlugs: ['video-konvertieren', 'video-in-mp4-umwandeln', 'mp4-in-webm-umwandeln'],
    relatedArticleSlugs: ['mov-in-mp4-umwandeln-iphone-videos', 'video-in-mp3-umwandeln-anleitung', 'zip-datei-erstellen-anleitung', 'video-in-gif-umwandeln-anleitung'],
    directAnswer: 'Ein MP4 komprimieren Sie, indem Sie das Video mit geringerer Auflösung und stärkerer Kompression neu kodieren; bei 4K-Aufnahmen bringt die kleinere Auflösung meist am meisten. Datei Tools bietet dafür drei Stufen (H.264 mit CRF 32 oder 28 bei max. 1.280 Pixel Breite, CRF 24 bei max. 1.920 Pixel) und rechnet direkt im Browser, für Videos bis 500 MB. Bewahren Sie das Original auf, denn verlorene Details lassen sich nicht zurückholen.',
    steps: [
      { step: 1, title: 'Video auswählen', text: 'Öffnen Sie das Werkzeug „Video komprimieren“ und wählen Sie Ihr MP4 oder ein anderes Video von Ihrem Gerät aus.' },
      { step: 2, title: 'Kompressionsstufe festlegen', text: 'Wählen Sie eine der drei Stufen. Die starke und die ausgewogene Stufe begrenzen die Breite auf 1.280 Pixel (720p im Querformat), die leichte auf 1.920 Pixel (1080p). Für Messenger und E-Mail reicht oft 720p.' },
      { step: 3, title: 'Video lokal neu kodieren', text: 'Die Kompression läuft in Ihrem Browser. Längere Videos brauchen je nach Leistung Ihres Geräts einige Minuten.' },
      { step: 4, title: 'Ergebnis prüfen und speichern', text: 'Sehen Sie sich das komprimierte Video kurz an, besonders bewegte Szenen, und laden Sie es herunter, wenn Qualität und Größe passen.' },
    ],
    sections: [
      {
        heading: 'Warum sind Videodateien so groß?',
        content: 'Die Größe eines Videos hängt vor allem von Auflösung, Bitrate, Bildrate, Codec und Länge ab. Ein Video besteht aus vielen Einzelbildern pro Sekunde plus Tonspur:\n\n- **Auflösung:** 4K hat viermal so viele Bildpunkte wie Full HD (1080p).\n- **Bitrate:** die Datenmenge pro Sekunde. Sie hat den direktesten Einfluss auf die Dateigröße.\n- **Bildrate:** 60 Bilder pro Sekunde erzeugen mehr Daten als 30.\n- **Codec:** H.264 (AVC) ist sehr kompatibel, H.265 (HEVC) und AV1 erreichen bei gleicher Qualität oft kleinere Dateien, werden aber nicht überall abgespielt.\n- **Länge und Motiv:** Viel Bewegung, Wackeln und feine Details wie Laub oder Wasser brauchen mehr Daten als ein ruhiges Gesprächsvideo.\n\nMP4 selbst ist übrigens nur der Container. Was darin steckt, entscheidet über Größe und Kompatibilität. iPhone-Videos liegen dagegen oft als MOV vor, wie der Beitrag [MOV in MP4 umwandeln](blog:mov-in-mp4-umwandeln-iphone-videos) erklärt.'
      },
      {
        heading: 'Welche Einstellungen machen ein Video wirklich kleiner?',
        content: 'Am stärksten wirken eine geringere Auflösung und eine niedrigere Qualitätsstufe; Kürzen hilft proportional zur entfernten Länge. Die Qualitätsstufe wird bei H.264 oft als CRF (Constant Rate Factor) angegeben: Höhere Werte bedeuten stärkere Kompression und weniger Details.\n\n| Stellschraube | Wirkung auf die Größe | Nebenwirkung | Bei Datei Tools |\n|---|---|---|---|\n| Auflösung | groß | weniger Details auf großen Bildschirmen | max. 1.280 bzw. 1.920 Pixel Breite |\n| Qualitätsstufe (CRF) | groß | Blockbildung bei zu starker Kompression | CRF 32, 28 oder 24 |\n| Länge | etwa proportional | keine | vorher kürzen |\n| Bildrate | gering bis mittel | Ruckeln bei schnellen Bewegungen | bleibt unverändert |\n| Audio-Bitrate | gering | bei Sprache kaum hörbar | 96 bzw. 128 kbit/s |\n\nAuf Smartphone-Bildschirmen ist der Unterschied zwischen 4K und 1080p oder 720p oft kaum zu sehen. Wie stark sich ein Video verkleinern lässt, hängt aber vom Ausgangsmaterial ab: Ein bereits stark komprimiertes Messenger-Video wird kaum noch kleiner, ohne sichtbar zu leiden.'
      },
      {
        heading: 'Wie verkleinere ich ein Video für E-Mail oder WhatsApp?',
        content: 'Für E-Mail und Messenger komprimieren Sie das Video vorher selbst, statt es dem Dienst zu überlassen. E-Mail-Anbieter begrenzen Anhänge meist auf wenige Dutzend Megabyte – Gmail erlaubt laut Google zum Beispiel bis 25 MB pro E-Mail; die Grenzen unterscheiden sich je nach Anbieter und können sich ändern. Messenger komprimieren Videos beim Versand oft selbst, teilweise stark sichtbar. Wenn Sie die Qualität selbst steuern wollen, komprimieren Sie vorher gezielt.\n\nEin verbreiteter Irrtum: Ein Video in eine ZIP-Datei zu packen, macht es kaum kleiner. MP4 ist bereits stark komprimiert, ZIP findet darin kaum noch Einsparpotenzial. Warum das so ist und wofür ZIP-Archive wirklich sinnvoll sind, erklärt [ZIP-Datei erstellen](blog:zip-datei-erstellen-anleitung).\n\nFür sehr lange Aufnahmen ist ein Freigabelink über einen Cloud-Speicher oft die bessere Lösung als ein stark komprimierter Anhang. Für Webseiten kann außerdem WebM sinnvoll sein; dafür gibt es [MP4 in WebM umwandeln](tool:mp4-in-webm-umwandeln).'
      },
      {
        heading: 'Was tun, wenn das komprimierte Video nicht passt?',
        content: 'Die häufigsten Probleme sind sichtbare Artefakte, zu geringe Einsparung und lange Rechenzeiten:\n\n- **Klötzchen und Schlieren:** Die Kompression ist zu stark. Wählen Sie eine mildere Stufe.\n- **Video wird kaum kleiner:** Das Ausgangsvideo ist bereits effizient komprimiert oder schon klein. Hier hilft vor allem Kürzen.\n- **Kompatibilität:** Das Werkzeug erzeugt MP4 mit H.264 und AAC, das praktisch überall abspielbar ist. Wollen Sie nur das Format ändern statt zu komprimieren, nutzen Sie [Video in MP4 umwandeln](tool:video-in-mp4-umwandeln).\n- **Datei zu groß:** Verarbeitet werden Videos bis 500 MB. Größere Aufnahmen teilen Sie vorher auf.\n- **Verarbeitung dauert sehr lange oder der Browser bricht ab:** Videokodierung ist rechenintensiv und läuft auf Ihrem Gerät. Lange 4K-Videos sind auf Smartphones mühsam; ein Computer ist hier deutlich schneller. Schließen Sie andere Tabs, um Arbeitsspeicher freizugeben.'
      },
      {
        heading: 'Wo wird das Video beim Komprimieren verarbeitet?',
        content: 'Bei Datei Tools wird das Video lokal in Ihrem Browser mit FFmpeg neu kodiert und nicht an einen Server übertragen. Das ist bei Aufnahmen von Kindern, Familienfeiern, Wohnungsbesichtigungen oder internen Schulungen ein wichtiger Punkt.\n\nZudem müssen keine großen Dateien über eine eventuell langsame Internetverbindung geschickt werden; die Verarbeitungsdauer hängt dafür von Ihrem Prozessor ab. Beim ersten Start lädt der Browser einmalig die Konvertierungs-Engine (rund 31 MB). Wenn Sie aus dem Video nur den Ton benötigen, ist eine MP3 die deutlich kleinere Alternative – siehe [Video in MP3 umwandeln](blog:video-in-mp3-umwandeln-anleitung).'
      },
    ],
    faqs: [
      { question: 'Wie stark kann ich ein MP4 komprimieren?', answer: 'Das hängt vom Ausgangsmaterial ab, eine feste Prozentzahl gibt es nicht. 4K-Videos direkt aus dem Smartphone lassen sich durch eine geringere Auflösung oft deutlich verkleinern. Bereits komprimierte Videos, etwa aus Messengern, bieten wenig Spielraum, ohne dass die Qualität sichtbar leidet.' },
      { question: 'Verliert das Video beim Komprimieren an Qualität?', answer: 'Ja, Videokompression ist verlustbehaftet. Bei moderaten Einstellungen fällt das kaum auf, bei starker Kompression entstehen Unschärfe und Blockartefakte. Behalten Sie deshalb immer das Original.' },
      { question: 'Hilft es, ein Video zu zippen?', answer: 'Kaum. MP4-Videos sind bereits komprimiert, ein ZIP-Archiv spart deshalb meist nur sehr wenig. Wirksam sind eine geringere Auflösung, eine niedrigere Bitrate oder das Kürzen des Videos.' },
      { question: 'Kann ich Videos auf dem iPhone komprimieren?', answer: 'Ja, das Browser-Werkzeug funktioniert auch in Safari auf dem iPhone. Bei langen Videos ist die Verarbeitung auf dem Smartphone allerdings deutlich langsamer als auf einem Computer.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'mov-in-mp4-umwandeln-iphone-videos',
    title: 'MOV in MP4 umwandeln: iPhone-Videos überall abspielen',
    metaTitle: 'MOV in MP4 umwandeln: iPhone-Videos | Datei Tools',
    metaDescription: 'MOV in MP4 umwandeln: Warum iPhone-Videos unter Windows Probleme machen, was HEVC damit zu tun hat und wie Sie MOV kostenlos ohne Upload konvertieren.',
    h1: 'MOV in MP4 umwandeln: iPhone-Videos kompatibel machen',
    excerpt: 'iPhone-Videos landen als MOV-Datei auf dem Rechner und lassen sich dort nicht immer abspielen oder hochladen. Wir erklären den Unterschied zwischen Container und Codec und zeigen, wie Sie MOV zuverlässig in MP4 umwandeln.',
    category: 'media',
    primaryKeyword: 'mov in mp4 umwandeln',
    secondaryKeywords: ['iphone video in mp4 umwandeln', 'mov datei abspielen windows', 'mov zu mp4 konvertieren', 'hevc video umwandeln'],
    searchIntent: 'transactional',
    primaryToolSlug: 'video-in-mp4-umwandeln',
    ctaHeadline: 'MOV jetzt kostenlos in MP4 umwandeln',
    ctaButtonLabel: 'Video in MP4 umwandeln',
    relatedToolSlugs: ['video-konvertieren', 'video-komprimieren', 'video-in-mp3-umwandeln'],
    relatedArticleSlugs: ['iphone-fotos-als-jpg-speichern', 'mp4-komprimieren-video-verkleinern', 'was-ist-heic-warum-iphone-dieses-format', 'video-in-mp3-umwandeln-anleitung'],
    directAnswer: 'Um MOV in MP4 umzuwandeln, kodieren Sie das Video mit dem weit verbreiteten Codec H.264 (Ton: AAC) neu und speichern es als MP4 – danach spielt es auf nahezu allen Geräten und Plattformen. Datei Tools erledigt das lokal im Browser für Videos bis 500 MB und verkleinert breitere Aufnahmen wie 4K dabei auf 1.920 Pixel Breite. Die Dauer hängt von Videolänge und Gerät ab.',
    steps: [
      { step: 1, title: 'MOV-Datei auswählen', text: 'Öffnen Sie das Werkzeug „Video in MP4 umwandeln“ und wählen Sie die MOV-Datei von Ihrem Computer oder direkt aus der Mediathek Ihres iPhones aus.' },
      { step: 2, title: 'Umwandlung starten', text: 'Das Video wird im Browser mit H.264 (Bild) und AAC (Ton) neu kodiert und als MP4 gespeichert. Videos, die breiter als 1.920 Pixel sind, etwa 4K-Aufnahmen, werden dabei auf Full-HD-Breite verkleinert.' },
      { step: 3, title: 'Fortschritt abwarten', text: 'Kurze Clips sind schnell fertig. Lange HEVC-Videos in 4K benötigen mehr Rechenzeit, besonders auf Smartphones.' },
      { step: 4, title: 'MP4 speichern und testen', text: 'Laden Sie das MP4 herunter und spielen Sie es testweise auf dem Zielgerät oder in der Zielanwendung ab.' },
    ],
    sections: [
      {
        heading: 'Was ist der Unterschied zwischen MOV und MP4?',
        content: 'MOV und MP4 sind eng verwandte Containerformate: MOV ist das QuickTime-Format von Apple, MP4 ein internationaler Standard (MPEG-4 Part 14). Ein Container ist nur die Verpackung: Er legt fest, wie Bild, Ton, Untertitel und Metadaten in der Datei organisiert sind. Wie das Bild selbst komprimiert ist, bestimmt der **Codec**.\n\n| Eigenschaft | MOV (iPhone) | MP4 |\n|---|---|---|\n| Herkunft | Apple QuickTime | ISO-Standard |\n| Typischer Video-Codec | HEVC (H.265) oder H.264 | meist H.264, auch HEVC |\n| Abspielbar | Apple-Geräte, viele Player | nahezu alle Geräte, Webseiten und Portale |\n\niPhones speichern Videos im MOV-Container, je nach Einstellung mit dem Codec HEVC (H.265) oder H.264. HEVC erzeugt bei gleicher Qualität kleinere Dateien, wird aber nicht von jedem Programm und jeder Webseite unterstützt. Viele Abspielprobleme liegen deshalb nicht am Container MOV, sondern am Codec HEVC. Dasselbe Prinzip – effizienter, aber weniger kompatibel – gilt bei Fotos für das HEIC-Format, das im Artikel [Was ist HEIC?](blog:was-ist-heic-warum-iphone-dieses-format) erklärt wird.'
      },
      {
        heading: 'Warum spielt Windows iPhone-Videos manchmal nicht ab?',
        content: 'Wenn Windows ein iPhone-Video nicht abspielt, ist fast immer der Codec HEVC die Ursache: Das Bild bleibt schwarz oder es läuft nur der Ton. Windows benötigt für HEVC eine zusätzliche Codec-Erweiterung aus dem Microsoft Store, die nicht auf allen Systemen vorinstalliert ist. Videoplayer mit eigenen Codecs umgehen das Problem, helfen aber nicht, wenn eine andere Person oder eine Webseite das Video abspielen soll.\n\nAuch Videoschnittprogramme, Lernplattformen, Behördenportale oder Smart-TVs akzeptieren häufig nur MP4 mit H.264. Eine Umwandlung in dieses Format ist deshalb der zuverlässigste Weg, wenn Sie ein iPhone-Video weitergeben möchten. Für andere Zielformate steht zusätzlich [Video konvertieren](tool:video-konvertieren) zur Verfügung.'
      },
      {
        heading: 'Wie stelle ich das iPhone auf kompatiblere Videos um?',
        content: 'Zwei iPhone-Einstellungen sorgen dafür, dass neue Videos von vornherein kompatibler sind:\n\n- **Einstellungen > Kamera > Formate:** Mit „Maximale Kompatibilität“ nimmt das iPhone Videos in H.264 und Fotos als JPG auf. Die Dateien werden dadurch größer, sind aber kompatibler. Einige Aufnahmemodi wie 4K mit 60 Bildern pro Sekunde setzen allerdings HEVC voraus.\n- **Einstellungen > Fotos > Auf Mac oder PC übertragen:** Mit „Automatisch“ wandelt das iPhone Dateien beim Übertragen per Kabel in ein kompatibles Format um. Mit „Originale behalten“ erhalten Sie die unveränderten Dateien.\n\nBeide Optionen wirken nur auf neue Aufnahmen bzw. Übertragungen. Für bereits vorhandene MOV-Dateien bleibt die Umwandlung der einfachste Weg. Die entsprechende Anleitung für Fotos finden Sie unter [iPhone-Fotos als JPG speichern](blog:iphone-fotos-als-jpg-speichern).'
      },
      {
        heading: 'Warum sieht das umgewandelte Video anders aus?',
        content: 'Die meisten Auffälligkeiten nach der Umwandlung gehen auf HDR, die Neukodierung oder iPhone-Spezialeffekte zurück:\n\n- **4K-Video ist danach Full HD:** Das Werkzeug begrenzt die Breite auf 1.920 Pixel, damit die Umwandlung im Browser machbar bleibt. Für die meisten Bildschirme reicht das aus; das Original sollten Sie trotzdem behalten.\n- **Farben wirken nach der Umwandlung blass oder überstrahlt:** Neuere iPhones filmen standardmäßig in HDR (Dolby Vision). Wird das Video in ein normales SDR-Video umgewandelt, kann der Bildeindruck abweichen. Abhilfe schafft für künftige Aufnahmen das Deaktivieren von „HDR-Video“ in den Kameraeinstellungen.\n- **Datei wird größer:** H.264 ist weniger effizient als HEVC. Ein umgewandeltes Video kann daher größer sein als das Original. Mit [Video komprimieren](tool:video-komprimieren) lässt sich das ausgleichen.\n- **Umwandlung dauert lange:** Die Neukodierung nach H.264 ist rechenintensiv. Auf einem Computer geht es meist deutlich schneller als auf dem Smartphone.\n- **Hochkant-Video liegt quer:** Die Drehung ist bei iPhone-Videos oft nur als Metadatum gespeichert. Prüfen Sie das Ergebnis und drehen Sie bei Bedarf nach.\n- **Slow-Motion- oder Zeitraffer-Effekte fehlen:** Einige Effekte werden erst beim Export aus der Fotos-App fest ins Video übernommen.'
      },
      {
        heading: 'Bleiben private Videos beim Umwandeln auf dem Gerät?',
        content: 'Bei Datei Tools wird das Video direkt in Ihrem Browser verarbeitet und nicht an einen Server übertragen – wichtig, weil Handyvideos oft Kinder, Wohnungen, Gesichter und Orte zeigen. Sie können die Umwandlung auf dem Windows-PC, dem Mac oder direkt auf dem iPhone in Safari durchführen.\n\nBeachten Sie dabei: Videos enthalten neben Bild und Ton häufig Metadaten wie Aufnahmezeit, Gerätemodell und je nach Einstellung den Aufnahmeort. Ob diese bei der Umwandlung erhalten bleiben, kann variieren. Prüfen Sie bei sensiblen Aufnahmen vor der Weitergabe, welche Informationen enthalten sind. Ist das umgewandelte MP4 für den Versand zu groß, hilft der Beitrag [MP4 komprimieren](blog:mp4-komprimieren-video-verkleinern) weiter.'
      },
    ],
    faqs: [
      { question: 'Verliert ein Video beim Umwandeln von MOV in MP4 an Qualität?', answer: 'Wird nur der Container gewechselt, bleibt die Qualität identisch. Datei Tools kodiert das Video jedoch immer neu in H.264 und verkleinert Videos über 1.920 Pixel Breite auf Full HD. Diese zusätzliche verlustbehaftete Kompression ist bei normaler Betrachtung meist kaum sichtbar.' },
      { question: 'Kann ich MOV-Dateien einfach in .mp4 umbenennen?', answer: 'Manchmal funktioniert das, weil beide Container eng verwandt sind. Zuverlässig ist es aber nicht, und am HEVC-Codec ändert das Umbenennen nichts. Eine echte Umwandlung ist der sichere Weg.' },
      { question: 'Warum ist mein umgewandeltes Video größer als das Original?', answer: 'iPhone-Videos nutzen oft HEVC, das effizienter komprimiert als das kompatiblere H.264. Bei gleicher Qualität braucht H.264 mehr Speicher. Bei Bedarf können Sie das MP4 anschließend komprimieren.' },
      { question: 'Wie stelle ich das iPhone auf MP4 um?', answer: 'Das iPhone speichert Videos immer im MOV-Container. Unter Einstellungen > Kamera > Formate > „Maximale Kompatibilität“ nutzt es aber den Codec H.264, wodurch die Dateien deutlich kompatibler werden.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'video-in-gif-umwandeln-anleitung',
    title: 'Video in GIF umwandeln: Kurze Clips als Animation speichern',
    metaTitle: 'Video in GIF umwandeln – Tipps & Anleitung',
    metaDescription: 'Video in GIF umwandeln: So erstellen Sie aus kurzen Clips kompakte GIF-Animationen mit passender Länge, Breite und Bildrate – kostenlos und ohne Upload.',
    h1: 'Video in GIF umwandeln: Anleitung für kleine, flüssige Animationen',
    excerpt: 'GIFs funktionieren in Präsentationen, Dokumentationen und Chats, wo Videos manchmal nicht abgespielt werden. Wir zeigen, wie Sie aus einem Video ein GIF erstellen, das gut aussieht und trotzdem nicht riesig wird.',
    category: 'media',
    primaryKeyword: 'video in gif umwandeln',
    secondaryKeywords: ['mp4 in gif umwandeln', 'gif aus video erstellen', 'animiertes gif erstellen', 'video zu gif'],
    searchIntent: 'transactional',
    primaryToolSlug: 'video-in-gif-umwandeln',
    ctaHeadline: 'Jetzt kostenlos GIF aus Video erstellen',
    ctaButtonLabel: 'Video in GIF umwandeln',
    relatedToolSlugs: ['video-komprimieren', 'mp4-in-webm-umwandeln', 'gif-in-png-umwandeln'],
    relatedArticleSlugs: ['mp4-komprimieren-video-verkleinern', 'mov-in-mp4-umwandeln-iphone-videos', 'webp-vs-png-unterschied', 'foto-komprimieren-bilder-kleiner-machen'],
    directAnswer: 'Um ein Video in ein GIF umzuwandeln, kürzen Sie den Clip auf wenige Sekunden, reduzieren Breite und Bildrate und speichern das Ergebnis als animiertes GIF. Datei Tools nutzt dafür im Browser höchstens die ersten 30 Sekunden, 10 oder 15 Bilder pro Sekunde und maximal 480 bzw. 400 Pixel Breite. GIFs haben keinen Ton und höchstens 256 Farben pro Einzelbild, für längere Clips ist ein MP4 meist kleiner.',
    steps: [
      { step: 1, title: 'Video auswählen', text: 'Öffnen Sie das Werkzeug „Video in GIF umwandeln“ und wählen Sie ein MP4, MOV, WebM oder ein anderes gängiges Video von Ihrem Gerät aus.' },
      { step: 2, title: 'Ausschnitt vorbereiten', text: 'Das Werkzeug verwendet höchstens die ersten 30 Sekunden des Videos. Soll ein anderer oder kürzerer Ausschnitt ins GIF, schneiden Sie das Video vorher in einem Videoprogramm zu.' },
      { step: 3, title: 'Bildrate wählen', text: 'Wählen Sie 10 Bilder pro Sekunde für eine kompakte Datei oder 15 für flüssigere Bewegungen. Die Breite wird automatisch auf höchstens 480 bzw. 400 Pixel begrenzt.' },
      { step: 4, title: 'GIF erzeugen und speichern', text: 'Das GIF wird lokal in Ihrem Browser berechnet. Prüfen Sie die Vorschau und laden Sie die Datei herunter.' },
    ],
    sections: [
      {
        heading: 'Was kann ein GIF – und was nicht?',
        content: 'Ein GIF spielt fast überall automatisch ab, ist aber technisch stark begrenzt. Das Format stammt aus den späten 1980er-Jahren und wurde nie für Videos entwickelt; beliebt ist es trotzdem, weil es in E-Mails, Präsentationen, Wikis, Ticket-Systemen und Chats ohne Player funktioniert. Die wichtigsten Grenzen:\n\n- **Maximal 256 Farben pro Bild:** Farbverläufe, Hauttöne und Himmel wirken dadurch oft fleckig oder gerastert.\n- **Kein Ton:** Die Tonspur des Videos fällt komplett weg.\n- **Ineffiziente Kompression:** GIFs sind bei gleicher Länge meist viel größer als das ursprüngliche MP4.\n- **Einfache Transparenz:** Ein Pixel ist entweder voll sichtbar oder voll durchsichtig, weiche Kanten gibt es nicht.\n\nFür Bildschirmaufnahmen, Diagramme oder Reaktionsclips mit wenigen Farben ist GIF trotzdem gut geeignet. Für Fotos und lange Szenen ist es die schlechteste Wahl.'
      },
      {
        heading: 'Wie bleibt ein GIF klein?',
        content: 'Ein GIF bleibt klein, wenn Länge, Bildfläche und Bildrate gering sind – mit jedem dieser Werte steigt die Dateigröße stark an. Datei Tools begrenzt deshalb automatisch die Breite auf 480 Pixel (bei 15 Bildern pro Sekunde auf 400 Pixel), verwendet höchstens die ersten 30 Sekunden und berechnet für das Video eine eigene Palette mit bis zu 256 Farben. Darüber hinaus helfen:\n\n- **Länge:** Zwei bis sechs Sekunden reichen für eine Schleife oder eine kurze Demonstration.\n- **Breite:** 320 bis 480 Pixel sind für Chats und Dokumentationen meist genug. Eine doppelte Breite bedeutet ungefähr die vierfache Pixelmenge.\n- **Bildrate:** 10 bis 15 Bilder pro Sekunde wirken noch flüssig. 30 oder 60 Bilder pro Sekunde blähen die Datei unnötig auf.\n- **Ruhiges Motiv:** Wenig Bewegung und wenige Farben komprimieren deutlich besser als Kameraschwenks.\n- **Zuschnitt:** Schneiden Sie das Video auf den relevanten Bildbereich zu, statt den ganzen Bildschirm zu zeigen.\n\nBleibt das GIF trotzdem zu groß, ist oft ein kurzes, stummes Video die bessere Alternative. Wie Sie das Ausgangsvideo verkleinern, erklärt [MP4 komprimieren](blog:mp4-komprimieren-video-verkleinern).'
      },
      {
        heading: 'GIF oder Video: Wann ist MP4 oder WebM die bessere Wahl?',
        content: 'Für Webseiten und längere Clips ist ein kurzes MP4- oder WebM-Video meist besser als ein GIF, weil es deutlich kleiner ist und alle Farben darstellt. Einige große Plattformen, die „GIFs“ anzeigen, liefern im Hintergrund deshalb tatsächlich kurze Videos aus.\n\n| Eigenschaft | GIF | MP4 (H.264) | WebM |\n|---|---|---|---|\n| Farben | max. 256 pro Bild | volle Farbtiefe | volle Farbtiefe |\n| Ton | nein | ja | ja |\n| Dateigröße bei gleicher Länge | groß | klein | klein |\n| Abspielen in E-Mails und Wikis | fast überall | selten | selten |\n\nFür Webseiten eignet sich ein stummes, automatisch abspielendes Video, etwa mit [MP4 in WebM umwandeln](tool:mp4-in-webm-umwandeln).\n\nAuch animiertes WebP ist eine Option: Es unterstützt mehr Farben und weiche Transparenz und ist in aktuellen Browsern verbreitet. Einen Überblick über die Stärken von WebP gibt der Beitrag [WebP vs. PNG](blog:webp-vs-png-unterschied).\n\nGIF bleibt die richtige Wahl, wenn die Zielumgebung keine Videos einbettet, etwa in manchen E-Mail-Programmen, Foren oder Dokumentationssystemen. Brauchen Sie nur ein einzelnes Standbild aus einem GIF, wandeln Sie es mit [GIF in PNG umwandeln](tool:gif-in-png-umwandeln) um.'
      },
      {
        heading: 'Was tun, wenn das GIF zu groß ist oder ruckelt?',
        content: 'Wenn das Ergebnis nicht überzeugt, liegt es meist an Länge, Bildrate oder der Farbbegrenzung:\n\n- **Datei ist riesig:** Kürzen Sie das Video vorher und wählen Sie 10 statt 15 Bilder pro Sekunde. Kurze Clips wirken am stärksten.\n- **GIF zeigt nur den Anfang:** Das Werkzeug verwendet höchstens die ersten 30 Sekunden. Schneiden Sie die gewünschte Szene vorher heraus.\n- **Farbstreifen und Rauschen:** Typisch für Verläufe bei nur 256 Farben. Ein Motiv mit weniger Farben oder ein Video statt GIF ist die Lösung.\n- **GIF ruckelt:** Wählen Sie 15 statt 10 Bilder pro Sekunde.\n- **GIF läuft nur einmal:** Manche Programme ignorieren die Endlosschleife oder spielen GIFs erst nach einem Klick ab.\n- **Verarbeitung dauert lange:** Die Umwandlung läuft auf Ihrem Gerät. Längere oder hochauflösende Videos brauchen besonders auf Smartphones mehr Zeit.'
      },
      {
        heading: 'Worauf sollte ich bei GIFs aus Bildschirmaufnahmen achten?',
        content: 'GIFs aus Bildschirmaufnahmen sollten Sie vor dem Teilen auf sensible Inhalte prüfen, denn darin stecken schnell interne Daten, E-Mail-Adressen oder Kundennamen. In einem GIF ist jeder Frame sichtbar, auch wenn er nur kurz erscheint; schneiden Sie das Video im Zweifel enger zu.\n\nBei Datei Tools wird das Video lokal in Ihrem Browser verarbeitet und nicht an einen Server übertragen. Die Umwandlung funktioniert auf Windows, Mac, Linux, iPhone und Android, solange ein aktueller Browser verwendet wird. Weitere Hinweise zum Verkleinern von Bilddateien finden Sie in [Foto komprimieren: Bilder kleiner machen](blog:foto-komprimieren-bilder-kleiner-machen).'
      },
    ],
    faqs: [
      { question: 'Wie lang darf ein GIF sein?', answer: 'Das Format selbst kennt keine feste Grenze, aber GIFs werden mit jeder Sekunde deutlich größer. Das Werkzeug von Datei Tools verwendet höchstens die ersten 30 Sekunden eines Videos. Für Chats und Dokumentationen haben sich wenige Sekunden bewährt, für längere Sequenzen ist ein kurzes Video die bessere Wahl.' },
      { question: 'Warum ist mein GIF größer als das Video?', answer: 'Moderne Videocodecs speichern nur die Änderungen zwischen Bildern sehr effizient, GIF kann das nur begrenzt. Zusätzlich ist die Kompression des GIF-Formats veraltet. Deshalb ist ein GIF bei gleicher Länge oft um ein Vielfaches größer als ein MP4.' },
      { question: 'Hat ein GIF Ton?', answer: 'Nein. Das GIF-Format unterstützt keine Tonspur. Wenn Ton wichtig ist, verwenden Sie ein Video im MP4- oder WebM-Format.' },
      { question: 'Kann ich ein GIF mit transparentem Hintergrund aus einem Video erstellen?', answer: 'Normale Videos haben keinen transparenten Hintergrund, daher entsteht auch im GIF keiner. Transparente GIFs setzen eine Vorlage mit Transparenz voraus, und selbst dann sind nur harte Kanten möglich.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'zip-datei-entpacken-anleitung',
    title: 'ZIP-Datei entpacken: Anleitung für Windows, Mac, iPhone und Android',
    metaTitle: 'ZIP entpacken auf PC, Mac & Handy | Datei Tools',
    metaDescription: 'ZIP-Datei entpacken: Anleitung für Windows, Mac, iPhone, Android und den Browser – plus Lösungen bei Umlaut-Fehlern, beschädigten Archiven und Passwort-ZIPs.',
    h1: 'ZIP-Datei entpacken: So öffnen Sie Archive auf jedem Gerät',
    excerpt: 'ZIP-Dateien begegnen Ihnen bei Downloads, Bewerbungsunterlagen oder Fotos von Freunden. Hier erfahren Sie, wie Sie ZIP-Archive auf jedem Gerät entpacken und was Sie bei Fehlermeldungen tun können.',
    category: 'archives',
    primaryKeyword: 'zip entpacken',
    secondaryKeywords: ['zip datei öffnen', 'zip entpacken windows', 'zip entpacken iphone', 'zip datei entpacken mac', 'zip entpacken android'],
    searchIntent: 'transactional',
    primaryToolSlug: 'zip-entpacken',
    ctaHeadline: 'ZIP-Datei jetzt kostenlos entpacken',
    ctaButtonLabel: 'ZIP entpacken',
    relatedToolSlugs: ['7z-entpacken', 'tar-entpacken', 'zip-erstellen'],
    relatedArticleSlugs: ['zip-7z-rar-unterschiede', '7z-datei-oeffnen-ohne-programm', 'zip-datei-erstellen-anleitung', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Unter Windows entpacken Sie eine ZIP-Datei per Rechtsklick und „Alle extrahieren“, auf dem Mac genügt ein Doppelklick. Auf dem iPhone tippen Sie die ZIP-Datei in der Dateien-App an, unter Android hilft „Extrahieren“ in Files by Google. Auf jedem Gerät funktioniert außerdem Datei Tools im Browser: Archive bis 500 MB werden lokal entpackt, ohne Upload – passwortgeschützte ZIPs allerdings nicht.',
    steps: [
      { step: 1, title: 'ZIP-Datei auswählen', text: 'Öffnen Sie das Werkzeug „ZIP entpacken“ und ziehen Sie das Archiv per Drag & Drop hinein oder wählen Sie es über den Dateidialog aus.' },
      { step: 2, title: 'Inhalt ansehen', text: 'Das Archiv wird direkt im Browser entpackt. Anschließend sehen Sie die Liste der enthaltenen Dateien mit ihren Ordnerpfaden.' },
      { step: 3, title: 'Dateien speichern', text: 'Laden Sie die benötigten Dateien einzeln herunter und speichern Sie sie in einem Ordner Ihrer Wahl.' },
      { step: 4, title: 'Dateien prüfen', text: 'Öffnen Sie die entpackten Dateien und löschen Sie das ZIP-Archiv anschließend, wenn Sie es nicht mehr benötigen.' },
    ],
    sections: [
      {
        heading: 'Wie entpacke ich eine ZIP-Datei unter Windows?',
        content: 'Unter Windows entpacken Sie ZIP-Archive ohne Zusatzprogramm über „Alle extrahieren“. Der zuverlässigste Weg:\n\n1. Klicken Sie mit der rechten Maustaste auf die ZIP-Datei.\n2. Wählen Sie „Alle extrahieren…“.\n3. Bestätigen oder ändern Sie den Zielordner und klicken Sie auf „Extrahieren“.\n\nEin Doppelklick öffnet das Archiv zwar ebenfalls wie einen Ordner, die Dateien sind dann aber noch nicht wirklich entpackt. Programme, Installationsdateien oder Office-Dokumente, die Sie direkt aus dem Archiv öffnen, funktionieren dann oft nicht richtig oder Änderungen gehen verloren. Entpacken Sie deshalb immer vollständig.\n\nAktuelle Windows-11-Versionen können zusätzlich weitere Formate wie 7z, RAR oder TAR öffnen. Unter Windows 10 und älteren Systemen klappt das ohne Zusatzsoftware nicht. Hilfe dazu gibt der Beitrag [7z-Datei öffnen ohne Programm](blog:7z-datei-oeffnen-ohne-programm).'
      },
      {
        heading: 'Wie entpacke ich ZIP-Dateien auf Mac, iPhone und Android?',
        content: 'Auch Mac, iPhone und Android entpacken ZIP-Dateien mit Bordmitteln:\n\n- **Mac:** Doppelklicken Sie auf die ZIP-Datei. Das integrierte Archivierungsprogramm entpackt sie automatisch in einen Ordner gleichen Namens am selben Ort.\n- **iPhone und iPad:** Öffnen Sie die Dateien-App und tippen Sie auf die ZIP-Datei. iOS entpackt den Inhalt in einen Ordner daneben. ZIP-Dateien aus Mail oder Safari sichern Sie zuvor über „Teilen“ > „In Dateien sichern“.\n- **Android:** In Files by Google tippen Sie die ZIP-Datei an und wählen „Extrahieren“. Dateimanager anderer Hersteller bieten meist eine ähnliche Funktion, die Bezeichnungen unterscheiden sich jedoch.\n\nWenn das Bordmittel streikt, etwa bei ungewöhnlichen Archiven oder auf einem fremden Rechner ohne Rechte zur Software-Installation, ist das Browser-Werkzeug eine gute Ausweichlösung. Für andere Archivformate gibt es zusätzlich [7z entpacken](tool:7z-entpacken), das auch RAR-Dateien öffnet, sowie Werkzeuge für TAR und GZIP.'
      },
      {
        heading: 'Was tun, wenn sich eine ZIP-Datei nicht entpacken lässt?',
        content: 'Die häufigsten Fehler beim Entpacken betreffen Dateinamen, unvollständige Downloads und Passwörter:\n\n- **Umlaute in Dateinamen sind kaputt:** Ältere Programme speichern Dateinamen in einer anderen Zeichenkodierung als UTF-8. Aus „Präsentation.pdf“ wird dann etwas wie „Pr„sentation.pdf“. Der Dateiinhalt ist intakt, Sie können die Datei einfach umbenennen. Das Browser-Werkzeug von Datei Tools erkennt die alte Windows-Kodierung (CP437) und zeigt solche Umlaute korrekt an.\n- **„Das Archiv ist beschädigt“:** Häufig ist der Download unvollständig. Laden Sie die Datei erneut herunter und vergleichen Sie die Dateigröße.\n- **Passwortabfrage:** Verschlüsselte ZIPs benötigen das Passwort des Absenders. Ältere Windows-Versionen unterstützen zudem nicht jede Verschlüsselungsart, etwa AES. Das Browser-Werkzeug von Datei Tools kann passwortgeschützte Archive derzeit nicht öffnen; nutzen Sie dafür ein Packprogramm wie 7-Zip.\n- **Pfad zu lang:** Unter Windows scheitern tief verschachtelte Ordner manchmal an der Längenbegrenzung für Pfade. Entpacken Sie in einen kurzen Zielordner wie C:\\Entpackt.\n- **Zu wenig Speicher:** Der entpackte Inhalt kann ein Vielfaches größer sein als das Archiv. Im Browser entpackt Datei Tools Archive bis 500 MB mit höchstens 1 GB Inhalt und 10.000 Dateien – das schützt auch vor sogenannten ZIP-Bomben.'
      },
      {
        heading: 'Wie gefährlich sind ZIP-Dateien aus unbekannter Quelle?',
        content: 'ZIP-Dateien aus unbekannter Quelle können Schadsoftware enthalten, denn der Inhalt ist auf den ersten Blick nicht sichtbar. Seien Sie besonders vorsichtig bei unerwarteten E-Mail-Anhängen, angeblichen Rechnungen oder Paketbenachrichtigungen.\n\nAchten Sie nach dem Entpacken auf die Dateiendungen: Dateien mit Endungen wie .exe, .bat, .js, .vbs oder .scr sind ausführbar und sollten nur aus vertrauenswürdigen Quellen gestartet werden. Blenden Sie unter Windows die Dateiendungen ein, damit Sie eine „rechnung.pdf.exe“ nicht für ein PDF halten. Lassen Sie im Zweifel Ihr Virenschutzprogramm die entpackten Dateien prüfen.\n\nWarum es neben ZIP noch weitere Archivformate gibt und worin sie sich unterscheiden, erklärt der Beitrag [ZIP, 7z und RAR: die Unterschiede](blog:zip-7z-rar-unterschiede).'
      },
      {
        heading: 'Welche Grenzen gelten beim Entpacken im Browser?',
        content: 'Bei Datei Tools wird das Archiv direkt in Ihrem Browser entpackt; die Dateien werden nicht an einen Server übertragen. Das zählt, weil in ZIP-Dateien oft ganze Sammlungen persönlicher Dokumente stecken: Bewerbungsunterlagen, Steuerbelege, Urlaubsfotos oder Projektdateien.\n\nPraktisch ist das vor allem auf fremden oder verwalteten Computern, auf denen Sie keine Software installieren dürfen. Weil alles im Arbeitsspeicher passiert, gelten die genannten Grenzen von 500 MB pro Archiv; auf älteren Smartphones kann schon weniger knapp werden. Möchten Sie selbst Dateien bündeln, um sie zu versenden, lesen Sie [ZIP-Datei erstellen](blog:zip-datei-erstellen-anleitung) oder nutzen direkt [ZIP erstellen](tool:zip-erstellen). Löschen Sie das ZIP-Archiv nach dem Entpacken, wenn Sie es nicht mehr benötigen, damit keine doppelten Kopien sensibler Unterlagen auf dem Gerät liegen bleiben.'
      },
    ],
    faqs: [
      { question: 'Brauche ich ein Programm, um ZIP-Dateien zu öffnen?', answer: 'Nein. Windows, macOS, iOS und die meisten Android-Geräte können ZIP-Archive mit Bordmitteln entpacken. Ein Browser-Werkzeug ist eine Alternative, wenn das Bordmittel nicht funktioniert oder Sie keine Software installieren können.' },
      { question: 'Warum kann ich Dateien im ZIP nicht bearbeiten?', answer: 'Wenn Sie ein Archiv nur per Doppelklick öffnen, arbeiten Sie mit einer temporären Kopie. Änderungen werden dann nicht im Archiv gespeichert. Entpacken Sie die Dateien zuerst vollständig in einen normalen Ordner.' },
      { question: 'Wie öffne ich eine passwortgeschützte ZIP-Datei?', answer: 'Sie benötigen das Passwort, das der Absender festgelegt hat, und ein Packprogramm wie 7-Zip; das Browser-Werkzeug von Datei Tools unterstützt passwortgeschützte Archive derzeit nicht. Ohne Passwort lässt sich der Inhalt nicht entschlüsseln. Fragen Sie im Zweifel beim Absender nach, idealerweise über einen anderen Kanal als die E-Mail mit dem Anhang.' },
      { question: 'Kann ich ZIP-Dateien auf dem iPhone entpacken?', answer: 'Ja. Speichern Sie die ZIP-Datei in der Dateien-App und tippen Sie sie an. iOS erstellt automatisch einen Ordner mit dem entpackten Inhalt am selben Ort.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: '7z-datei-oeffnen-ohne-programm',
    title: '7z-Datei öffnen ohne Programm: So entpacken Sie 7-Zip-Archive',
    metaTitle: '7z-Datei öffnen ohne Programm | Datei Tools',
    metaDescription: '7z-Datei öffnen ohne Installation: So entpacken Sie 7-Zip-Archive unter Windows, Mac, iPhone und Android direkt im Browser – kostenlos und ohne Upload.',
    h1: '7z-Datei öffnen ohne Programm: Anleitung für alle Geräte',
    excerpt: 'Eine .7z-Datei bekommen, aber kein passendes Programm installiert? Wir erklären, was hinter dem Format steckt, welche Systeme es von Haus aus können und wie Sie 7z-Archive ohne Installation im Browser entpacken.',
    category: 'archives',
    primaryKeyword: '7z öffnen',
    secondaryKeywords: ['7z datei öffnen', '7z entpacken', '7z öffnen mac', '7z ohne programm öffnen', '7z öffnen iphone'],
    searchIntent: 'transactional',
    primaryToolSlug: '7z-entpacken',
    ctaHeadline: '7z-Archiv jetzt kostenlos entpacken',
    ctaButtonLabel: '7z entpacken',
    relatedToolSlugs: ['zip-entpacken', 'tar-entpacken', 'gzip-entpacken'],
    relatedArticleSlugs: ['zip-7z-rar-unterschiede', 'zip-datei-entpacken-anleitung', 'zip-datei-erstellen-anleitung', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Eine 7z-Datei öffnen Sie ohne Installation am einfachsten mit einem Browser-Werkzeug wie „7z entpacken“ von Datei Tools: Archiv auswählen, Inhalt lokal entpacken lassen und Dateien speichern – für Archive bis 500 MB, ohne Passwortschutz. Aktuelle Windows-11-Versionen entpacken 7z auch selbst im Explorer. macOS, iPhone und viele Android-Geräte brauchen dagegen eine Zusatz-App oder eben den Browser.',
    steps: [
      { step: 1, title: '7z-Archiv auswählen', text: 'Öffnen Sie das Werkzeug „7z entpacken“ und wählen Sie die .7z-Datei aus oder ziehen Sie sie in das Browserfenster.' },
      { step: 2, title: 'Archiv prüfen lassen', text: 'Das Werkzeug liest zuerst die Dateiliste und prüft Größe und Anzahl der enthaltenen Dateien. Passwortgeschützte Archive kann es derzeit nicht öffnen.' },
      { step: 3, title: 'Archiv lokal entpacken', text: 'Das Archiv wird mit einer WebAssembly-Version von 7-Zip in Ihrem Browser dekomprimiert. Große Archive brauchen je nach Gerät etwas Zeit.' },
      { step: 4, title: 'Dateien herunterladen', text: 'Speichern Sie die gewünschten Dateien auf Ihrem Gerät und prüfen Sie, ob alles vollständig ist.' },
    ],
    sections: [
      {
        heading: 'Was ist eine 7z-Datei?',
        content: '7z ist das Archivformat des freien Packprogramms 7-Zip. Es nutzt standardmäßig die Kompressionsverfahren LZMA bzw. LZMA2, die viele Dateitypen stärker verdichten als das klassische ZIP-Verfahren. Zusätzlich unterstützt 7z eine sogenannte solide Kompression: Mehrere Dateien werden als zusammenhängender Datenstrom gepackt, was bei vielen ähnlichen Dateien deutlich Platz spart.\n\nAußerdem kann ein 7z-Archiv mit AES-256 verschlüsselt werden, auf Wunsch einschließlich der Dateinamen. Deshalb wird 7z gern für große Downloads, Software-Pakete, Backups und vertrauliche Dateisammlungen verwendet. Der Nachteil: ZIP wird von praktisch jedem Gerät verstanden, 7z nicht. Einen ausführlichen Vergleich der Formate finden Sie im Beitrag [ZIP, 7z und RAR: die Unterschiede](blog:zip-7z-rar-unterschiede).'
      },
      {
        heading: 'Kann ich 7z unter Windows, Mac, iPhone und Android ohne Zusatzprogramm öffnen?',
        content: 'Ohne Zusatzprogramm öffnen nur aktuelle Windows-11-Versionen 7z-Archive; auf den anderen Systemen brauchen Sie eine App oder den Browser:\n\n- **Windows 11:** Aktuelle Versionen können 7z-, RAR- und TAR-Archive direkt im Explorer öffnen und per Rechtsklick „Alle extrahieren“ entpacken. Halten Sie Windows dafür auf dem neuesten Stand.\n- **Windows 10:** Kann 7z nicht von Haus aus öffnen. Üblich ist die Installation von 7-Zip, alternativ das Browser-Werkzeug.\n- **macOS:** Das integrierte Archivierungsprogramm ist auf ZIP und einige andere Formate ausgelegt, 7z gehört nicht dazu. Ohne Zusatz-App hilft der Browser.\n- **iPhone und iPad:** Die Dateien-App entpackt ZIP zuverlässig, bei 7z sollten Sie sich nicht darauf verlassen.\n- **Android:** Viele vorinstallierte Dateimanager beherrschen nur ZIP.\n\nWer kein Programm installieren kann oder will, etwa auf einem Firmenrechner oder einem fremden Mac, entpackt das Archiv direkt im Browser. Das funktioniert auf allen genannten Plattformen gleich; das Werkzeug von Datei Tools öffnet neben 7z auch RAR-Archive.'
      },
      {
        heading: 'Was tun bei Fehlermeldungen beim Entpacken von 7z?',
        content: 'Die meisten Fehlermeldungen bei 7z gehen auf geteilte, verschlüsselte oder beschädigte Archive zurück:\n\n- **Mehrteilige Archive (.7z.001, .7z.002 …):** Große Archive werden oft in Teile gesplittet. Sie benötigen alle Teile vollständig im selben Ordner; ein fehlender Teil macht das Entpacken unmöglich. Das Browser-Werkzeug von Datei Tools verarbeitet nur einzelne Archivdateien – für geteilte Archive brauchen Sie ein Programm wie 7-Zip.\n- **Passwortgeschützte Archive:** Bei verschlüsselten Dateinamen sehen Sie ohne Passwort nicht einmal die Dateiliste. Datei Tools kann verschlüsselte Archive derzeit nicht entpacken; mit dem Passwort öffnen Sie sie in 7-Zip oder einem vergleichbaren Programm. Achten Sie auf Groß- und Kleinschreibung.\n- **„Daten-Fehler“ oder „CRC-Fehler“:** Das Archiv ist beschädigt oder unvollständig heruntergeladen. Laden Sie es erneut herunter.\n- **Entpacken dauert lange:** Bei solider Kompression muss für eine einzelne Datei unter Umständen ein großer Teil des Archivs dekomprimiert werden.\n- **Endung .tar.7z oder .tar.gz:** Hier stecken zwei Schichten ineinander. Enthält ein 7z-Archiv nur ein TAR-Archiv, entpackt Datei Tools dieses automatisch mit; .tar.gz-Dateien öffnen Sie direkt mit [TAR entpacken](tool:tar-entpacken).'
      },
      {
        heading: 'Welche Grenzen gelten beim Entpacken von 7z im Browser?',
        content: 'Bei Datei Tools wird das Archiv vollständig lokal in Ihrem Browser entpackt; weder Archiv noch Inhalt werden an einen Server übertragen. Das ist sinnvoll, weil 7z-Archive oft Software-Pakete, Backups oder Dateisammlungen enthalten, die nicht auf fremden Servern landen sollen.\n\nDie Verarbeitung nutzt Rechenleistung und Arbeitsspeicher Ihres Geräts. Deshalb gelten Grenzen: Archive bis 500 MB, entpackt höchstens 1 GB und 10.000 Dateien. Auf Smartphones oder älteren Geräten kann schon weniger an Speichergrenzen stoßen. Allgemeine Kriterien, an denen Sie vertrauenswürdige Online-Werkzeuge erkennen, finden Sie im Beitrag [Dateien ohne Upload bearbeiten](blog:dateien-ohne-upload-bearbeiten-dsgvo).'
      },
      {
        heading: 'Wann ist ZIP die bessere Wahl als 7z?',
        content: 'Für den Austausch mit anderen ist ZIP meist die bessere Wahl, weil es überall ohne Zusatzsoftware funktioniert. Die wichtigsten Unterschiede:\n\n| Eigenschaft | ZIP | 7z |\n|---|---|---|\n| Kompression | meist Deflate | LZMA/LZMA2, oft stärker |\n| Verschlüsselung | AES in modernen Programmen, alte ZIP-Verschlüsselung gilt als schwach | AES-256, optional mit Dateinamen |\n| Öffnen ohne Zusatzsoftware | Windows, macOS, iOS, die meisten Android-Geräte | nur aktuelle Windows-11-Versionen |\n\n7z ist sinnvoll, wenn die Empfänger technisch versiert sind, die Dateien sehr groß sind und der zusätzliche Platzgewinn wirklich zählt, oder wenn Sie eine starke Verschlüsselung samt verborgenen Dateinamen benötigen.\n\nFür den Alltag – Fotos an Familie, Unterlagen an Behörden, Dokumente an Kunden – ist ZIP meist die bessere Wahl, weil jeder Empfänger es ohne Zusatzsoftware öffnen kann. Hinzu kommt: Viele Dateitypen wie JPG, MP4 oder PDF sind bereits komprimiert und werden auch von 7z kaum kleiner. Wie Sie ein ZIP-Archiv auf jedem Gerät anlegen, zeigt [ZIP-Datei erstellen](blog:zip-datei-erstellen-anleitung). Wenn Sie ein empfangenes ZIP öffnen möchten, hilft [ZIP entpacken](tool:zip-entpacken).'
      },
    ],
    faqs: [
      { question: 'Kann Windows 7z-Dateien ohne 7-Zip öffnen?', answer: 'Aktuelle Versionen von Windows 11 unterstützen 7z direkt im Explorer. Windows 10 und ältere Versionen können das nicht von Haus aus. Dort helfen 7-Zip oder ein Browser-Werkzeug, das ohne Installation auskommt – solange das Archiv nicht passwortgeschützt ist.' },
      { question: 'Wie öffne ich eine 7z-Datei auf dem Mac?', answer: 'Das integrierte Archivierungsprogramm von macOS unterstützt 7z nicht. Sie können entweder eine Zusatz-App installieren oder das Archiv ohne Installation in einem Browser-Werkzeug entpacken.' },
      { question: 'Ist 7z sicherer als ZIP?', answer: '7z verwendet für die Verschlüsselung AES-256 und kann auch die Dateinamen verbergen. Moderne ZIP-Programme bieten ebenfalls AES, ältere ZIP-Verschlüsselung gilt dagegen als schwach. Entscheidend ist in beiden Fällen ein langes, zufälliges Passwort.' },
      { question: 'Was mache ich mit Dateien wie .7z.001?', answer: 'Das ist der erste Teil eines geteilten Archivs. Laden Sie alle Teile herunter, legen Sie sie in denselben Ordner und öffnen Sie den ersten Teil mit einem Programm, das geteilte Archive unterstützt, etwa 7-Zip. Das Browser-Werkzeug von Datei Tools verarbeitet solche Archive nicht.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'zip-datei-erstellen-anleitung',
    title: 'ZIP-Datei erstellen: Dateien und Ordner richtig bündeln',
    metaTitle: 'ZIP-Datei erstellen: Anleitung für alle Geräte',
    metaDescription: 'ZIP-Datei erstellen unter Windows, Mac, iPhone und im Browser: So bündeln Sie Dateien für E-Mail und Portale und wissen, wann ZIP wirklich Platz spart.',
    h1: 'ZIP-Datei erstellen: So packen Sie mehrere Dateien in ein Archiv',
    excerpt: 'Zehn Anhänge einzeln verschicken oder einen ganzen Ordner weitergeben? Ein ZIP-Archiv fasst alles in einer Datei zusammen. Wir zeigen, wie das auf jedem Gerät funktioniert und warum ZIP nicht jede Datei kleiner macht.',
    category: 'archives',
    primaryKeyword: 'zip datei erstellen',
    secondaryKeywords: ['ordner zippen', 'dateien zippen', 'zip erstellen windows', 'zip ordner erstellen mac', 'zip datei erstellen iphone'],
    searchIntent: 'transactional',
    primaryToolSlug: 'zip-erstellen',
    ctaHeadline: 'ZIP-Archiv jetzt kostenlos erstellen',
    ctaButtonLabel: 'ZIP erstellen',
    relatedToolSlugs: ['zip-entpacken', '7z-entpacken', 'pdf-komprimieren'],
    relatedArticleSlugs: ['zip-datei-entpacken-anleitung', 'zip-7z-rar-unterschiede', 'pdf-fuer-email-verkleinern', 'mp4-komprimieren-video-verkleinern'],
    directAnswer: 'Eine ZIP-Datei erstellen Sie unter Windows per Rechtsklick auf die markierten Dateien und „Komprimieren in“ bzw. „Senden an > ZIP-komprimierter Ordner“, auf dem Mac über „Komprimieren“ im Kontextmenü. Auf dem iPhone geht das in der Dateien-App. Im Browser fassen Sie mit Datei Tools beliebige Dateien (zusammen bis 1 GB) lokal zu einem ZIP zusammen, ohne Upload; Unterordner werden dabei nicht übernommen.',
    steps: [
      { step: 1, title: 'Dateien zusammenstellen', text: 'Legen Sie alle Dateien, die ins Archiv sollen, möglichst in einen gemeinsamen Ordner und benennen Sie sie verständlich.' },
      { step: 2, title: 'Dateien auswählen', text: 'Öffnen Sie das Werkzeug „ZIP erstellen“ und wählen Sie die Dateien aus oder ziehen Sie sie per Drag & Drop hinein. Das Werkzeug packt einzelne Dateien; Unterordner werden nicht übernommen.' },
      { step: 3, title: 'Archiv erzeugen', text: 'Das ZIP wird direkt in Ihrem Browser erstellt. Bei vielen großen Dateien dauert das je nach Gerät etwas länger.' },
      { step: 4, title: 'ZIP speichern und testen', text: 'Laden Sie das Archiv herunter und öffnen Sie es testweise, um zu prüfen, ob alle Dateien enthalten sind.' },
    ],
    sections: [
      {
        heading: 'Wofür ist eine ZIP-Datei gut?',
        content: 'Ein ZIP-Archiv fasst beliebig viele Dateien und Ordner in einer einzigen Datei zusammen und komprimiert sie dabei verlustfrei. Nach dem Entpacken sind alle Dateien bitgenau wieder da. Das ist praktisch, wenn Sie:\n\n- viele Anhänge auf einmal per E-Mail verschicken möchten\n- eine Ordnerstruktur erhalten wollen, etwa bei Projektdateien\n- in einem Portal nur eine einzige Datei hochladen dürfen\n- Dateien übersichtlich archivieren möchten\n\nZIP ist das am weitesten verbreitete Archivformat: Windows, macOS, iOS und Android können es ohne Zusatzsoftware öffnen. Für den Austausch mit anderen ist es deshalb meist die beste Wahl. Alternativen wie 7z oder RAR packen manchmal etwas dichter, setzen beim Empfänger aber passende Software voraus – mehr dazu in [ZIP, 7z und RAR: die Unterschiede](blog:zip-7z-rar-unterschiede).'
      },
      {
        heading: 'Wie erstelle ich eine ZIP-Datei unter Windows, Mac, iPhone und Android?',
        content: 'Alle großen Systeme können ZIP-Dateien ohne Zusatzsoftware erstellen:\n\n- **Windows 11:** Dateien oder Ordner markieren, Rechtsklick und „Komprimieren in“ > „ZIP-Datei“ wählen. Je nach Version heißt der Eintrag auch „In ZIP-Datei komprimieren“.\n- **Windows 10:** Rechtsklick auf die Auswahl, dann „Senden an“ > „ZIP-komprimierter Ordner“.\n- **Mac:** Dateien markieren, Rechtsklick und „Komprimieren“ wählen. Es entsteht eine Datei namens „Archiv.zip“ oder, bei einer einzelnen Datei, eine ZIP mit deren Namen.\n- **iPhone und iPad:** In der Dateien-App oben rechts auf „Auswählen“ tippen, Dateien markieren, dann über das Menü mit den drei Punkten „Komprimieren“ wählen.\n- **Android:** Viele Dateimanager bieten eine Komprimieren-Funktion an, Name und Ort im Menü unterscheiden sich je nach Hersteller.\n\nDas Browser-Werkzeug funktioniert unabhängig davon auf jedem Gerät gleich, auch dort, wo das Bordmittel fehlt. Es bündelt die ausgewählten Dateien (zusammen bis 1 GB) ohne Unterordner; soll eine Ordnerstruktur erhalten bleiben, nutzen Sie die Funktion Ihres Betriebssystems.'
      },
      {
        heading: 'Spart ZIP wirklich Speicherplatz?',
        content: 'ZIP spart nur bei unkomprimierten Dateien nennenswert Platz. Weil ZIP verlustfrei arbeitet, findet es Einsparungen nur in Daten, die sich wiederholen:\n\n| Dateityp | Beispiele | Wird durch ZIP kleiner? |\n|---|---|---|\n| Text und Daten | TXT, CSV, Logdateien, Quellcode | meist deutlich |\n| Unkomprimierte Medien | BMP, WAV | oft deutlich |\n| Bereits komprimierte Medien | JPG, PNG, MP3, MP4 | kaum |\n| Dokumente | PDF, DOCX, XLSX (intern selbst ZIP) | kaum |\n\nEin Ordner voller Urlaubsfotos wird als ZIP daher praktisch nicht kleiner. Datei Tools legt solche Dateitypen deshalb ohne erneute Kompression im Archiv ab, was Zeit spart.\n\nWollen Sie wirklich Platz sparen, setzen Sie bei den Dateien selbst an: Bilder mit Bildkompression, Videos durch Neukodierung (siehe [MP4 komprimieren](blog:mp4-komprimieren-video-verkleinern)) und PDFs mit [PDF komprimieren](tool:pdf-komprimieren). Erst danach lohnt es sich, alles in ein ZIP zu packen.'
      },
      {
        heading: 'Welche Probleme gibt es beim Versand von ZIP-Dateien?',
        content: 'Die meisten Probleme mit ZIP-Dateien zeigen sich erst beim Versand oder beim Empfänger:\n\n- **E-Mail wird abgelehnt:** Viele Mailserver blockieren ZIP-Anhänge, die ausführbare Dateien enthalten, und alle Anbieter haben Größenlimits. Tipps zur Größe finden Sie in [PDF für E-Mail verkleinern](blog:pdf-fuer-email-verkleinern).\n- **Seltsame Ordner wie „__MACOSX“:** Der Mac legt beim Komprimieren versteckte Zusatzdaten an, die unter Windows als eigener Ordner sichtbar werden. Sie sind harmlos und können gelöscht werden.\n- **Umlaute in Dateinamen werden falsch angezeigt:** Je nach Programm werden Dateinamen unterschiedlich kodiert. Für maximale Kompatibilität verzichten Sie bei Dateinamen auf Umlaute und Sonderzeichen.\n- **Passwortschutz fehlt:** Die Bordmittel von Windows und macOS können per Klick keine verschlüsselten ZIP-Dateien erstellen, und auch das Browser-Werkzeug von Datei Tools erzeugt unverschlüsselte Archive. Für vertrauliche PDFs ist ein Passwortschutz direkt in der PDF oft die einfachere Lösung.\n- **Archiv sehr groß:** Teilen Sie die Inhalte auf mehrere Archive auf oder nutzen Sie einen Freigabelink.'
      },
      {
        heading: 'Wie erstelle ich ein ZIP im Browser, ohne Dateien hochzuladen?',
        content: 'Bei Datei Tools wird das ZIP-Archiv vollständig lokal in Ihrem Browser erzeugt; Ihre Dateien werden nicht an einen Server übertragen. Das ist wichtig, weil gebündelte Dateien oft persönliche Dokumente sind: Bewerbungsunterlagen, Zeugnisse, Ausweiskopien oder Rechnungen.\n\nDie Geschwindigkeit hängt von der Leistung Ihres Geräts und der Gesamtgröße der Dateien ab; auf älteren Smartphones dauert es bei großen Dateien länger. Testen Sie das fertige Archiv vor dem Versand am besten einmal selbst, wie in [ZIP-Datei entpacken](blog:zip-datei-entpacken-anleitung) beschrieben. So stellen Sie sicher, dass alle Dateien vollständig enthalten sind und sich auch auf einem anderen Gerät öffnen lassen.'
      },
    ],
    faqs: [
      { question: 'Wird eine Datei durch ZIP schlechter?', answer: 'Nein. ZIP komprimiert verlustfrei. Nach dem Entpacken ist jede Datei exakt identisch mit dem Original, egal ob Foto, Dokument oder Programm.' },
      { question: 'Warum ist mein ZIP fast genauso groß wie die Originaldateien?', answer: 'Ihre Dateien sind vermutlich bereits komprimiert, etwa JPG-Fotos, MP4-Videos, PDFs oder DOCX-Dokumente. ZIP findet darin kaum weiteres Einsparpotenzial. Hier hilft nur, die Dateien selbst zu verkleinern.' },
      { question: 'Kann ich eine ZIP-Datei mit Passwort schützen?', answer: 'Die eingebauten Funktionen von Windows und macOS bieten das per Kontextmenü nicht an. Spezielle Packprogramme können verschlüsselte ZIPs erstellen, idealerweise mit AES. Teilen Sie das Passwort dann über einen anderen Kanal als die Datei mit.' },
      { question: 'Wie erstelle ich eine ZIP-Datei auf dem iPhone?', answer: 'Öffnen Sie die Dateien-App, wählen Sie die gewünschten Dateien über „Auswählen“ aus und tippen Sie im Menü mit den drei Punkten auf „Komprimieren“. Das ZIP wird im selben Ordner gespeichert.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'json-formatieren-und-validieren',
    title: 'JSON formatieren und validieren: Fehler finden und lesbar machen',
    metaTitle: 'JSON formatieren & validieren | Datei Tools',
    metaDescription: 'JSON formatieren und validieren: So machen Sie unlesbares JSON übersichtlich, finden Syntaxfehler schnell und prüfen API-Daten kostenlos ohne Upload.',
    h1: 'JSON formatieren und validieren: Lesbare Daten und schnelle Fehlersuche',
    excerpt: 'API-Antworten, Konfigurationsdateien und Exporte kommen oft als eine einzige, endlos lange Zeile. Wir zeigen, wie Sie JSON lesbar formatieren, typische Syntaxfehler erkennen und worauf Sie bei sensiblen Daten achten sollten.',
    category: 'developer',
    primaryKeyword: 'json formatieren',
    secondaryKeywords: ['json validieren', 'json formatter', 'json lesbar machen', 'json syntax prüfen', 'json beautify'],
    searchIntent: 'transactional',
    primaryToolSlug: 'json-formatter',
    ctaHeadline: 'JSON jetzt kostenlos formatieren',
    ctaButtonLabel: 'JSON formatieren',
    relatedToolSlugs: ['json-validator', 'json-in-csv-umwandeln', 'csv-in-json-umwandeln', 'jwt-decoder'],
    relatedArticleSlugs: ['base64-kodieren-dekodieren-erklaert', 'unix-timestamp-umrechnen', 'csv-in-excel-umwandeln-umlaute', 'woerter-und-zeichen-zaehlen'],
    directAnswer: 'Um JSON zu formatieren, fügen Sie den Text in einen JSON-Formatter ein: Er rückt verschachtelte Objekte und Arrays mit zwei oder vier Leerzeichen ein und setzt Zeilenumbrüche, ohne den Inhalt zu verändern. Ist das JSON ungültig, meldet der Validator den Fehler mit ungefährer Position – typisch sind ein Komma zu viel oder einfache statt doppelter Anführungszeichen. Bei Datei Tools geschieht beides lokal im Browser.',
    steps: [
      { step: 1, title: 'JSON einfügen', text: 'Kopieren Sie den JSON-Text, zum Beispiel eine API-Antwort oder den Inhalt einer Konfigurationsdatei, und fügen Sie ihn in den Formatter ein.' },
      { step: 2, title: 'Formatieren lassen', text: 'Wählen Sie eine Einrückung von zwei oder vier Leerzeichen. Alternativ können Sie das JSON minimieren, also alle überflüssigen Leerzeichen entfernen.' },
      { step: 3, title: 'Fehlermeldungen prüfen', text: 'Ist das JSON ungültig, erscheint eine Fehlermeldung des Browsers, die meist die ungefähre Fehlerstelle nennt. Korrigieren Sie die Syntax und prüfen Sie erneut.' },
      { step: 4, title: 'Ergebnis übernehmen', text: 'Kopieren Sie das formatierte oder minimierte JSON zurück in Ihren Editor, Ihre Anwendung oder Ihre Dokumentation.' },
    ],
    sections: [
      {
        heading: 'Was ist JSON und warum muss man es formatieren?',
        content: 'JSON (JavaScript Object Notation) ist ein textbasiertes Datenformat, das heute in fast allen Web-APIs, vielen Konfigurationsdateien und Datenexporten verwendet wird. Es besteht aus Objekten in geschweiften Klammern, Arrays in eckigen Klammern sowie Schlüssel-Wert-Paaren wie „\"name\": \"Anna\"“.\n\nFür Maschinen spielt die Formatierung keine Rolle. Deshalb liefern Server JSON oft „minifiziert“ aus, also ohne Leerzeichen und Zeilenumbrüche, um Bandbreite zu sparen. Für Menschen ist eine solche Zeile mit Tausenden Zeichen praktisch unlesbar. Ein Formatter (auch „Beautifier“ oder „Pretty Printer“ genannt) fügt Einrückungen und Umbrüche ein, ohne den Inhalt zu verändern. Umgekehrt entfernt das Minifizieren alle überflüssigen Leerzeichen wieder. Beide Varianten sind inhaltlich identisch.'
      },
      {
        heading: 'Welche Syntaxregeln gelten für JSON?',
        content: 'JSON ist strenger als JavaScript oder Python: Die häufigsten Fehler entstehen, weil man Gewohnheiten aus diesen Sprachen überträgt:\n\n- **Doppelte Anführungszeichen:** Schlüssel und Zeichenketten müssen in doppelten Anführungszeichen stehen. Einfache Anführungszeichen sind ungültig.\n- **Kein Komma am Ende:** Nach dem letzten Element eines Objekts oder Arrays darf kein Komma stehen.\n- **Keine Kommentare:** Standard-JSON kennt weder // noch /* */. Manche Werkzeuge akzeptieren Varianten wie JSONC oder JSON5, das ist aber kein Standard.\n- **Kleingeschriebene Literale:** Erlaubt sind nur true, false und null – nicht True, None oder undefined.\n- **Zahlen ohne Besonderheiten:** Keine führenden Nullen, kein NaN, kein Infinity, Dezimaltrennzeichen ist der Punkt.\n- **Sonderzeichen escapen:** Anführungszeichen, Backslashes und Zeilenumbrüche in Zeichenketten müssen mit einem Backslash maskiert werden.\n\nEin [JSON-Validator](tool:json-validator) prüft genau diese Regeln und zeigt an, wo das Problem liegt.'
      },
      {
        heading: 'Was bedeuten typische JSON-Fehlermeldungen?',
        content: 'JSON-Fehlermeldungen wirken kryptisch, folgen aber einem Muster. „Unexpected token“ bedeutet, dass an einer Stelle ein Zeichen steht, das dort nicht erlaubt ist – häufig ein einfaches Anführungszeichen oder ein Komma zu viel. „Unexpected end of JSON input“ weist auf eine fehlende schließende Klammer oder einen abgeschnittenen Text hin, etwa weil beim Kopieren nicht alles markiert war.\n\nDie gemeldete Position zeigt oft auf die Stelle, an der der Parser aufgegeben hat, nicht auf die eigentliche Ursache. Ein fehlendes Komma fällt zum Beispiel erst beim nächsten Schlüssel auf. Schauen Sie deshalb auch in die Zeile davor.\n\nEine weitere Falle betrifft sehr große Zahlen: JavaScript kann Ganzzahlen nur bis etwa 9 Billiarden exakt darstellen. Lange IDs werden bei der Verarbeitung im Browser daher unter Umständen gerundet – das gilt für alle Formatter, die das JSON im Browser vollständig einlesen, auch für den von Datei Tools. Viele APIs liefern solche IDs deshalb als Zeichenkette aus.'
      },
      {
        heading: 'Wie verarbeite ich JSON nach dem Formatieren weiter?',
        content: 'Nach dem Formatieren geht die Arbeit oft weiter. Einige typische Anschlussaufgaben:\n\n- **Tabellen erstellen:** Ein Array aus gleichartigen Objekten lässt sich mit [JSON in CSV umwandeln](tool:json-in-csv-umwandeln) in eine Tabelle überführen. Worauf Sie beim Öffnen in Excel achten müssen, erklärt [CSV in Excel umwandeln](blog:csv-in-excel-umwandeln-umlaute).\n- **Kodierte Inhalte lesen:** Manche Felder enthalten Base64-kodierte Daten, etwa Bilder oder Zertifikate. Was es damit auf sich hat, lesen Sie in [Base64 kodieren und dekodieren](blog:base64-kodieren-dekodieren-erklaert).\n- **Zeitangaben verstehen:** Felder wie „created_at“ enthalten oft Unix-Zeitstempel als Zahl. Wie Sie diese in ein lesbares Datum umrechnen, zeigt [Unix-Timestamp umrechnen](blog:unix-timestamp-umrechnen).\n- **Tokens prüfen:** JSON Web Tokens (JWT) enthalten Base64URL-kodiertes JSON, das ein JWT-Decoder lesbar macht.'
      },
      {
        heading: 'Warum sollte JSON lokal formatiert werden?',
        content: 'JSON sollte lokal formatiert werden, weil es oft vertrauliche Daten enthält: API-Antworten mit Kundendaten, E-Mail-Adressen und internen IDs, Konfigurationsdateien manchmal sogar Zugangsschlüssel oder Tokens. Wer solche Inhalte in einen beliebigen Online-Formatter kopiert, gibt sie potenziell an Dritte weiter.\n\nBei Datei Tools wird JSON vollständig in Ihrem Browser formatiert und validiert; der Text wird nicht an einen Server übertragen. Trotzdem gilt als gute Praxis: Entfernen oder ersetzen Sie Passwörter, API-Schlüssel und Tokens, bevor Sie JSON in Tickets, Chats oder Dokumentationen teilen. Ein formatiertes JSON macht solche Felder übrigens leichter auffindbar – ein weiterer Grund, Daten vor der Weitergabe einmal sauber zu formatieren und durchzusehen.'
      },
    ],
    faqs: [
      { question: 'Was ist der Unterschied zwischen JSON formatieren und validieren?', answer: 'Formatieren ändert nur die Darstellung: Einrückungen und Zeilenumbrüche machen die Struktur lesbar. Validieren prüft, ob der Text den JSON-Syntaxregeln entspricht. Ein guter Formatter validiert dabei automatisch mit, denn ungültiges JSON lässt sich nicht zuverlässig formatieren.' },
      { question: 'Warum sind Kommentare in JSON nicht erlaubt?', answer: 'Der JSON-Standard sieht bewusst keine Kommentare vor, um das Format einfach und eindeutig zu halten. Einige Programme akzeptieren Erweiterungen wie JSONC, etwa für Konfigurationsdateien. Für den Datenaustausch sollten Sie Kommentare aber weglassen.' },
      { question: 'Verändert das Formatieren meine Daten?', answer: 'Inhaltlich in der Regel nicht: Es werden nur Leerzeichen und Zeilenumbrüche außerhalb von Zeichenketten hinzugefügt oder entfernt. Formatter, die das JSON im Browser vollständig einlesen, wie der von Datei Tools, können aber sehr große Ganzzahlen runden, doppelte Schlüssel zusammenfassen und Schlüssel, die nur aus Ziffern bestehen, nach vorn sortieren. Bei solchen Daten sollten Sie das Ergebnis prüfen.' },
      { question: 'Zwei oder vier Leerzeichen Einrückung – was ist richtig?', answer: 'Beides ist gültig. Zwei Leerzeichen sind in vielen Web-Projekten üblich und sparen Platz, vier Leerzeichen sind bei tief verschachtelten Daten manchmal übersichtlicher. Wichtig ist vor allem, im Projekt einheitlich zu bleiben.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'base64-kodieren-dekodieren-erklaert',
    title: 'Base64 kodieren und dekodieren: Was steckt dahinter?',
    metaTitle: 'Base64 einfach erklärt: kodieren & dekodieren',
    metaDescription: 'Base64 kodieren und dekodieren verständlich erklärt: Wofür das Verfahren dient, warum es keine Verschlüsselung ist und wie Sie Base64 ohne Upload umwandeln.',
    h1: 'Base64 kodieren und dekodieren: Funktionsweise, Einsatzzwecke und Irrtümer',
    excerpt: 'Base64 begegnet Ihnen in E-Mails, Data-URLs, API-Schnittstellen und Tokens. Wir erklären, wie die Kodierung funktioniert, wofür sie gedacht ist und warum Base64 keine Daten schützt.',
    category: 'developer',
    primaryKeyword: 'base64',
    secondaryKeywords: ['base64 dekodieren', 'base64 kodieren', 'base64 encode decode', 'was ist base64', 'base64 in text umwandeln'],
    searchIntent: 'informational',
    primaryToolSlug: 'base64-umwandeln',
    ctaHeadline: 'Base64 jetzt kostenlos umwandeln',
    ctaButtonLabel: 'Base64 umwandeln',
    relatedToolSlugs: ['base64-encoder', 'base64-decoder', 'jwt-decoder', 'url-encoder'],
    relatedArticleSlugs: ['json-formatieren-und-validieren', 'unix-timestamp-umrechnen', 'pdf-mit-passwort-schuetzen', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Base64 ist ein Verfahren, das beliebige Binärdaten in eine Zeichenkette aus 64 druckbaren Zeichen (A–Z, a–z, 0–9, + und /) übersetzt. So lassen sich Bilder oder Dateien in Textformaten wie E-Mail, JSON oder HTML transportieren. Base64 ist keine Verschlüsselung: Jeder kann die Daten ohne Schlüssel wieder dekodieren.',
    steps: [
      { step: 1, title: 'Eingabe einfügen', text: 'Fügen Sie den Text oder die Base64-Zeichenkette in das Eingabefeld ein. Achten Sie darauf, die Zeichenkette vollständig zu kopieren.' },
      { step: 2, title: 'Richtung wählen', text: 'Entscheiden Sie, ob Sie Text in Base64 kodieren oder eine Base64-Zeichenkette zurück in lesbaren Text dekodieren möchten.' },
      { step: 3, title: 'Umwandeln', text: 'Die Umwandlung erfolgt sofort in Ihrem Browser. Text wird dabei als UTF-8 behandelt, damit Umlaute korrekt bleiben.' },
      { step: 4, title: 'Ergebnis kopieren und prüfen', text: 'Kopieren Sie das Ergebnis in die Zwischenablage. Erscheint beim Dekodieren Zeichensalat, enthält die Zeichenkette vermutlich Binärdaten wie ein Bild statt Text.' },
    ],
    sections: [
      {
        heading: 'Wie funktioniert Base64?',
        content: 'Base64 wandelt jeweils drei Bytes in vier druckbare Zeichen um. Das ist nötig, weil Computer Daten als Bytes speichern, also als Werte von 0 bis 255, von denen viele keine druckbaren Zeichen sind und in Textprotokollen Probleme verursachen. Dazu teilt Base64 jeweils drei Bytes (24 Bit) in vier Gruppen zu je sechs Bit auf. Jede Sechs-Bit-Gruppe steht für einen Wert von 0 bis 63 und wird durch ein Zeichen aus dem Base64-Alphabet ersetzt: A–Z, a–z, 0–9 sowie + und /.\n\nGeht die Länge der Eingabe nicht glatt in Dreiergruppen auf, wird das Ergebnis mit einem oder zwei Gleichheitszeichen (=) aufgefüllt. Daran erkennt man Base64 oft schon auf den ersten Blick. Aus dem Wort „Hallo“ wird so zum Beispiel „SGFsbG8=“.\n\nDer Preis dieser Umwandlung: Aus drei Bytes werden vier Zeichen. Base64-kodierte Daten sind daher rund ein Drittel größer als das Original.'
      },
      {
        heading: 'Wofür wird Base64 eingesetzt?',
        content: 'Base64 ist überall dort nützlich, wo Binärdaten durch ein reines Textmedium müssen:\n\n- **E-Mail-Anhänge:** Das MIME-Format kodiert Dateianhänge in Base64, damit sie sicher über Mailserver transportiert werden.\n- **Data-URLs:** Kleine Bilder oder Schriften lassen sich direkt in HTML oder CSS einbetten, etwa als „data:image/png;base64,…“.\n- **APIs und JSON:** Dateien, Zertifikate oder Signaturen werden in JSON-Feldern oft Base64-kodiert übertragen. Wie Sie solche Daten lesbar machen, erklärt [JSON formatieren und validieren](blog:json-formatieren-und-validieren).\n- **HTTP Basic Authentication:** Benutzername und Passwort werden Base64-kodiert im Header gesendet.\n- **JSON Web Tokens:** Die Bestandteile eines JWT nutzen die URL-sichere Variante Base64URL. Mit einem [JWT-Decoder](tool:jwt-decoder) sehen Sie den Inhalt eines Tokens im Klartext.'
      },
      {
        heading: 'Ist Base64 eine Verschlüsselung?',
        content: 'Nein, Base64 ist eine öffentlich dokumentierte Kodierung ohne Schlüssel – jeder kann sie zurückwandeln. Weil die Zeichenkette unlesbar aussieht, wird sie trotzdem oft für verschlüsselt gehalten. Der Unterschied zu Verschlüsselung und Hashing:\n\n| Verfahren | Zweck | Umkehrbar? | Beispiel |\n|---|---|---|---|\n| Kodierung | Daten in ein anderes Format übertragen | ja, ohne Schlüssel | Base64, URL-Kodierung |\n| Verschlüsselung | Daten vor Unbefugten schützen | nur mit Schlüssel oder Passwort | AES |\n| Hashing | Prüfwert oder Fingerabdruck bilden | nein | SHA-256 |\n\nDaraus folgen wichtige Konsequenzen:\n\n- Passwörter, API-Schlüssel oder personenbezogene Daten sind durch Base64 in keiner Weise geschützt.\n- HTTP Basic Authentication ist nur über eine verschlüsselte HTTPS-Verbindung sicher, weil die Zugangsdaten sonst praktisch im Klartext übertragen werden.\n- Die Nutzdaten eines JWT kann jeder lesen. Die Signatur schützt nur vor Veränderung, nicht vor dem Mitlesen.\n\nWenn Sie Daten tatsächlich vor fremdem Zugriff schützen wollen, brauchen Sie eine echte Verschlüsselung mit Passwort oder Schlüssel. Für Dokumente zeigt der Beitrag [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen), wie das geht.'
      },
      {
        heading: 'Warum lässt sich eine Base64-Zeichenkette nicht dekodieren?',
        content: 'Wenn sich eine Base64-Zeichenkette nicht dekodieren lässt oder Unsinn ergibt, liegt es meist an einer dieser Ursachen:\n\n- **Unvollständig kopiert:** Fehlen am Ende Zeichen oder die Gleichheitszeichen, schlägt die Dekodierung fehl.\n- **Base64URL statt Base64:** Die URL-sichere Variante ersetzt + durch - und / durch _ und lässt die Gleichheitszeichen oft weg. Viele Decoder, auch der von Datei Tools, erwarten die Standardvariante; ersetzen Sie die Zeichen dann zurück oder nutzen Sie für Tokens einen JWT-Decoder.\n- **Zeilenumbrüche:** In E-Mails wird Base64 alle 76 Zeichen umbrochen. Gute Decoder ignorieren das, andere nicht.\n- **Falsche Zeichenkodierung:** Wird ein deutscher Text nicht als UTF-8 kodiert und dekodiert, werden Umlaute zu Zeichensalat wie „Ã¤“.\n- **Binärdaten als Text angezeigt:** Ist das Ergebnis ein Bild oder eine PDF, ergibt die Textanzeige keinen Sinn. Das Base64-Werkzeug von Datei Tools ist für Text gedacht; Binärdateien dekodieren Sie mit einem Programm oder Skript, das das Ergebnis als Datei speichert.\n\nFür einzelne Richtungen gibt es auch die spezialisierten Werkzeuge [Base64-Decoder](tool:base64-decoder) und Base64-Encoder.'
      },
      {
        heading: 'Warum sollte Base64 lokal umgewandelt werden?',
        content: 'Base64-Zeichenketten enthalten oft Zugangsdaten, Tokens oder Dateiinhalte und gehören deshalb nicht in beliebige Online-Dienste. Bei Datei Tools erfolgt das Kodieren und Dekodieren vollständig in Ihrem Browser; die Daten werden nicht an einen Server übertragen.\n\nDas ist besonders relevant, wenn Sie Inhalte aus Produktivsystemen untersuchen, etwa einen Authorization-Header aus einem Fehlerprotokoll oder einen Token aus einer Browser-Sitzung. Behandeln Sie solche Werte wie Passwörter: nicht in Tickets oder Chats teilen und nach dem Testen ungültig machen, falls sie versehentlich offengelegt wurden. Welche Kriterien Sie bei Online-Werkzeugen allgemein prüfen sollten, beschreibt [Dateien ohne Upload bearbeiten](blog:dateien-ohne-upload-bearbeiten-dsgvo).'
      },
    ],
    faqs: [
      { question: 'Ist Base64 sicher?', answer: 'Base64 bietet keinerlei Sicherheit. Es ist eine reine Kodierung, die jeder ohne Schlüssel rückgängig machen kann. Zum Schutz von Daten benötigen Sie eine echte Verschlüsselung.' },
      { question: 'Warum endet Base64 oft mit = oder ==?', answer: 'Base64 verarbeitet Daten in Blöcken zu drei Bytes. Fehlen am Ende ein oder zwei Bytes für einen vollständigen Block, wird mit einem bzw. zwei Gleichheitszeichen aufgefüllt.' },
      { question: 'Wie viel größer werden Daten durch Base64?', answer: 'Aus jeweils drei Bytes werden vier Zeichen. Die kodierten Daten sind deshalb etwa ein Drittel größer als das Original, zuzüglich eventueller Zeilenumbrüche.' },
      { question: 'Was ist der Unterschied zwischen Base64 und Base64URL?', answer: 'Base64URL ersetzt die Zeichen + und / durch - und _, weil diese in URLs und Dateinamen keine Sonderbedeutung haben. Die Gleichheitszeichen am Ende werden häufig weggelassen. Verwendet wird die Variante zum Beispiel in JSON Web Tokens.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'unix-timestamp-umrechnen',
    title: 'Unix-Timestamp umrechnen: Zeitstempel in Datum und Uhrzeit',
    metaTitle: 'Unix-Timestamp in Datum umrechnen | Datei Tools',
    metaDescription: 'Unix-Timestamp umrechnen: Sekunden oder Millisekunden erkennen, UTC in MEZ/MESZ übertragen und typische Fehler vermeiden – mit kostenlosem Online-Rechner.',
    h1: 'Unix-Timestamp umrechnen: So wird aus einer Zahl ein Datum',
    excerpt: 'In Logdateien, Datenbanken und API-Antworten stehen Zeitangaben oft als lange Zahl. Wir erklären, was ein Unix-Timestamp ist, wie Sie Sekunden und Millisekunden unterscheiden und warum die Zeitzone so wichtig ist.',
    category: 'developer',
    primaryKeyword: 'unix timestamp umrechnen',
    secondaryKeywords: ['timestamp in datum umwandeln', 'unix zeit umrechnen', 'epoch time umrechnen', 'zeitstempel umrechnen', 'unix timestamp millisekunden'],
    searchIntent: 'transactional',
    primaryToolSlug: 'timestamp-umrechnen',
    ctaHeadline: 'Zeitstempel jetzt kostenlos umrechnen',
    ctaButtonLabel: 'Timestamp umrechnen',
    relatedToolSlugs: ['jwt-decoder', 'json-formatter', 'uuid-generator'],
    relatedArticleSlugs: ['json-formatieren-und-validieren', 'base64-kodieren-dekodieren-erklaert', 'csv-in-excel-umwandeln-umlaute', 'woerter-und-zeichen-zaehlen'],
    directAnswer: 'Ein Unix-Timestamp zählt die Sekunden seit Jahresbeginn 1970 um 00:00:00 Uhr UTC. Zum Umrechnen prüfen Sie zuerst, ob der Wert in Sekunden (heute 10 Stellen) oder Millisekunden (13 Stellen) vorliegt, und wandeln ihn dann in ein Datum um. Für die deutsche Zeit addieren Sie zur UTC-Zeit im Winter eine Stunde (MEZ) und im Sommer zwei Stunden (MESZ).',
    steps: [
      { step: 1, title: 'Zeitstempel einfügen', text: 'Kopieren Sie den Zeitstempel aus Ihrer Logdatei, Datenbank oder API-Antwort und fügen Sie ihn in den Rechner ein.' },
      { step: 2, title: 'Einheit prüfen', text: 'Ein aktueller Zeitstempel mit 10 Ziffern ist in Sekunden, einer mit 13 Ziffern in Millisekunden angegeben. Der Rechner von Datei Tools erkennt die Einheit anhand der Größe der Zahl automatisch.' },
      { step: 3, title: 'Ergebnis ablesen', text: 'Lesen Sie das Datum als deutsche Ortszeit (Berlin) und als UTC im Format ISO 8601 ab. Die Umstellung zwischen MEZ und MESZ wird dabei automatisch berücksichtigt.' },
      { step: 4, title: 'Aktuellen Zeitstempel nutzen', text: 'Der Rechner zeigt zusätzlich die aktuelle Unix-Zeit in Sekunden an. Diese können Sie für Tests direkt übernehmen und mit Werten aus Ihren Daten vergleichen.' },
    ],
    sections: [
      {
        heading: 'Was ist ein Unix-Timestamp?',
        content: 'Der Unix-Timestamp, auch Unix-Zeit oder Epoch Time genannt, ist die Anzahl der Sekunden, die seit dem 1. Januar 1970 um 00:00:00 Uhr UTC vergangen sind. Dieser Zeitpunkt heißt „Unix-Epoche“. Der Zeitstempel 0 entspricht also genau diesem Moment, 86400 dem Beginn des 2. Januar 1970.\n\nDer große Vorteil: Ein Zeitstempel ist eine einfache Zahl ohne Zeitzone, ohne Datumsformat und ohne Sommerzeit. Computer können damit leicht rechnen, sortieren und vergleichen. Deshalb verwenden Betriebssysteme, Datenbanken, Programmiersprachen und viele APIs dieses Format.\n\nEin Beispiel: Der Zeitstempel 1700000000 entspricht dem 14. November 2023, 22:13:20 Uhr UTC, in deutscher Winterzeit also 23:13:20 Uhr. Schaltsekunden werden in der Unix-Zeit übrigens nicht mitgezählt, für den Alltag spielt das keine Rolle.'
      },
      {
        heading: 'Ist der Timestamp in Sekunden oder Millisekunden?',
        content: 'Für heutige Daten gilt: 10 Ziffern bedeuten Sekunden, 13 Ziffern Millisekunden. Die Einheit ist die häufigste Fehlerquelle beim Umrechnen, denn nicht alle Systeme zählen in Sekunden:\n\n| Einheit | Stellen (heute) | Beispiel | Typische Quelle |\n|---|---|---|---|\n| Sekunden | 10 | 1700000000 | Unix, PHP time(), JWT-Felder „exp“ und „iat“ |\n| Millisekunden | 13 | 1700000000000 | JavaScript Date.now(), Java System.currentTimeMillis() |\n| Sekunden mit Nachkommastellen | 10 + Dezimalstellen | 1700000000.5 | Python time.time() |\n\nDer Rechner von Datei Tools wertet Zahlen unter 10.000.000.000 als Sekunden und größere als Millisekunden. Interpretieren Sie einen Millisekundenwert als Sekunden, landen Sie Zehntausende Jahre in der Zukunft. Im umgekehrten Fall erhalten Sie ein Datum im Januar 1970 – ein sicheres Zeichen für eine verwechselte Einheit. Wer Tokens prüft, kann die Ablaufzeit direkt mit einem [JWT-Decoder](tool:jwt-decoder) auslesen und anschließend umrechnen.'
      },
      {
        heading: 'Wie berücksichtige ich UTC, MEZ und MESZ richtig?',
        content: 'Ein Unix-Timestamp bezieht sich immer auf UTC, die koordinierte Weltzeit; erst bei der Anzeige wird er in eine lokale Zeitzone übertragen. Für Deutschland, Österreich und die Schweiz gilt:\n\n- **MEZ (Winterzeit):** UTC + 1 Stunde\n- **MESZ (Sommerzeit):** UTC + 2 Stunden\n\nDie Umstellung erfolgt in der EU am letzten Sonntag im März und am letzten Sonntag im Oktober. Um diese Termine herum verschieben sich Zeitangaben schnell um eine Stunde, wenn ein System mit festem Versatz rechnet.\n\nTypisches Problem: Ein Server protokolliert in UTC, Ihre Anwendung zeigt lokale Zeit. Plötzlich scheinen Ereignisse eine oder zwei Stunden auseinanderzuliegen. Prüfen Sie daher immer, in welcher Zeitzone eine angezeigte Uhrzeit gemeint ist. Für den Datenaustausch empfiehlt sich das Format ISO 8601 mit Zeitzonenangabe, etwa „2023-11-14T22:13:20Z“, wobei das Z für UTC steht.'
      },
      {
        heading: 'Wie rechne ich Zeitstempel in Excel, JSON und Logdateien um?',
        content: 'Zeitstempel begegnen Ihnen auch außerhalb der Programmierung – in Tabellen, API-Antworten und Logdateien – und lassen sich dort mit einfachen Mitteln umrechnen:\n\n- **Excel und Tabellen:** Liegt in Zelle A1 ein Zeitstempel in Sekunden, liefert die Formel =A1/86400+DATUM(1970;1;1) ein Datum in UTC, sobald die Zelle als Datum mit Uhrzeit formatiert ist. Für Millisekunden teilen Sie zusätzlich durch 1000. Wie Sie CSV-Exporte korrekt in Excel öffnen, erklärt [CSV in Excel umwandeln](blog:csv-in-excel-umwandeln-umlaute).\n- **JSON-APIs:** Felder wie „created_at“ oder „updated“ enthalten oft Zeitstempel. Formatieren Sie die Antwort zuerst, um sie lesbar zu machen – siehe [JSON formatieren und validieren](blog:json-formatieren-und-validieren).\n- **Logdateien:** Viele Systeme schreiben Zeitstempel an den Zeilenanfang. Beim Abgleich mehrerer Logs sollten alle in derselben Zeitzone betrachtet werden.'
      },
      {
        heading: 'Was gilt für das Jahr 2038 und negative Zeitstempel?',
        content: 'Zwei Sonderfälle sollten Entwickler kennen: das Jahr-2038-Problem und negative Zeitstempel. Das **Jahr-2038-Problem**: Systeme, die den Zeitstempel als vorzeichenbehaftete 32-Bit-Zahl speichern, laufen am 19. Januar 2038 um 03:14:07 Uhr UTC über. Moderne Systeme verwenden 64-Bit-Werte, ältere Embedded-Geräte und Datenbankfelder können aber betroffen sein.\n\n**Negative Zeitstempel** stehen für Zeitpunkte vor 1970 und sind gültig, werden aber nicht von jeder Software unterstützt – auch der Rechner von Datei Tools wertet nur positive Werte aus. Geburtsdaten vor 1970 sind ein typischer Stolperstein.\n\nZum Datenschutz: Zeitstempel selbst sind unkritisch, stammen aber oft aus Protokollen oder Tokens mit personenbezogenen Daten. Die Umrechnung bei Datei Tools erfolgt vollständig in Ihrem Browser, Ihre Eingaben werden nicht an einen Server übertragen. Wenn Sie für Tests eindeutige Kennungen brauchen, hilft zusätzlich der [UUID-Generator](tool:uuid-generator).'
      },
    ],
    faqs: [
      { question: 'Wie erkenne ich, ob ein Timestamp in Sekunden oder Millisekunden ist?', answer: 'Für Daten aus der heutigen Zeit gilt: 10 Ziffern stehen für Sekunden, 13 Ziffern für Millisekunden. Ergibt die Umrechnung ein Datum im Jahr 1970 oder weit in der Zukunft, wurde wahrscheinlich die falsche Einheit angenommen.' },
      { question: 'Ist der Unix-Timestamp in deutscher Zeit?', answer: 'Nein, ein Unix-Timestamp bezieht sich immer auf UTC. Für die deutsche Ortszeit addieren Sie im Winter eine Stunde (MEZ) und im Sommer zwei Stunden (MESZ).' },
      { question: 'Was passiert im Jahr 2038?', answer: 'Systeme, die Zeitstempel als 32-Bit-Zahl mit Vorzeichen speichern, können Zeitpunkte nach dem 19. Januar 2038, 03:14:07 Uhr UTC, nicht mehr darstellen. Aktuelle 64-Bit-Systeme sind davon nicht betroffen.' },
      { question: 'Wie rechne ich einen Timestamp in Excel um?', answer: 'Bei Sekunden verwenden Sie die Formel =A1/86400+DATUM(1970;1;1) und formatieren die Zelle als Datum mit Uhrzeit. Das Ergebnis ist UTC. Für die deutsche Zeit addieren Sie 1/24 (MEZ) bzw. 2/24 (MESZ).' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
  {
    slug: 'woerter-und-zeichen-zaehlen',
    title: 'Wörter und Zeichen zählen: Für Hausarbeit, Bewerbung und Social Media',
    metaTitle: 'Wörter & Zeichen zählen – online | Datei Tools',
    metaDescription: 'Wörter und Zeichen zählen: Mit und ohne Leerzeichen, für Hausarbeit, Bewerbung und Social Media – plus Zählfunktionen in Word und Google Docs. Ohne Upload.',
    h1: 'Wörter und Zeichen zählen: So ermitteln Sie die Textlänge richtig',
    excerpt: 'Ob Hausarbeit mit Zeichenvorgabe, Anschreiben mit Wortlimit oder Beitrag mit Zeichenbegrenzung: Die richtige Textlänge ist oft Pflicht. Wir zeigen, wie gezählt wird und warum Programme manchmal unterschiedliche Ergebnisse liefern.',
    category: 'productivity',
    primaryKeyword: 'wörter zählen',
    secondaryKeywords: ['zeichen zählen', 'zeichen zählen mit leerzeichen', 'wortzähler online', 'wörter zählen word', 'textlänge prüfen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'wortzaehler',
    ctaHeadline: 'Wörter und Zeichen jetzt kostenlos zählen',
    ctaButtonLabel: 'Wörter zählen',
    relatedToolSlugs: ['zeichenzaehler', 'zeilen-zaehlen', 'text-vergleichen', 'gross-kleinschreibung-aendern'],
    relatedArticleSlugs: ['word-in-pdf-umwandeln-anleitung', 'text-aus-bild-kopieren', 'pdf-oder-word-welches-format-eignet-sich-wann', 'json-formatieren-und-validieren'],
    directAnswer: 'Um Wörter und Zeichen zu zählen, fügen Sie Ihren Text in einen Wortzähler ein: Er zeigt sofort Wörter, Zeichen mit und ohne Leerzeichen sowie Sätze und Absätze – bei Datei Tools lokal im Browser. In Word finden Sie die Funktion unter „Überprüfen“ > „Wörter zählen“, in Google Docs unter „Tools“ > „Wortzählung“. Kleine Abweichungen zwischen Programmen sind normal, weil Sonderfälle wie „z. B.“ unterschiedlich gezählt werden.',
    steps: [
      { step: 1, title: 'Text kopieren', text: 'Markieren Sie den Text in Ihrem Dokument, Ihrer E-Mail oder Ihrem Entwurf und kopieren Sie ihn in die Zwischenablage.' },
      { step: 2, title: 'Text einfügen', text: 'Fügen Sie den Text in das Eingabefeld des Wortzählers ein oder tippen Sie direkt dort.' },
      { step: 3, title: 'Ergebnis ablesen', text: 'Wörter, Zeichen mit und ohne Leerzeichen sowie weitere Kennzahlen werden sofort angezeigt und beim Weiterschreiben aktualisiert.' },
      { step: 4, title: 'Mit der Vorgabe abgleichen', text: 'Vergleichen Sie das Ergebnis mit der geforderten Länge und prüfen Sie, welche Textteile laut Vorgabe mitgezählt werden.' },
    ],
    sections: [
      {
        heading: 'Wie wird ein Wort eigentlich gezählt?',
        content: 'Die meisten Programme zählen als Wort jede Zeichenfolge, die durch Leerzeichen oder Zeilenumbrüche getrennt ist – so auch der Wortzähler von Datei Tools. Daraus ergeben sich einige Besonderheiten:\n\n- **Bindestrich-Wörter** wie „E-Mail-Adresse“ zählen meist als ein Wort.\n- **Abkürzungen mit Leerzeichen** wie „z. B.“ werden oft als zwei Wörter gezählt.\n- **Zahlen, Daten und Paragrafenzeichen** wie „§ 3“ zählen ebenfalls als Wörter.\n- **URLs und E-Mail-Adressen** gelten in der Regel als ein Wort.\n- **Gedankenstriche mit Leerzeichen** davor und dahinter können je nach Programm als eigenes Wort zählen.\n\nDeshalb weichen Word, Google Docs, LibreOffice und Online-Zähler bei demselben Text manchmal um einige Wörter voneinander ab. Bei strengen Vorgaben sollten Sie im Zweifel nachfragen, mit welchem Programm geprüft wird, oder einen kleinen Puffer einplanen.'
      },
      {
        heading: 'Zählen Zeichen mit oder ohne Leerzeichen?',
        content: 'Ob Leerzeichen mitzählen, entscheidet die jeweilige Vorgabe – der Unterschied ist erheblich. Weil zwischen fast allen Wörtern ein Leerzeichen steht, liegt ein Text mit 1.000 Wörtern ohne Leerzeichen um rund 1.000 Zeichen niedriger.\n\nAn Hochschulen werden Umfänge für Hausarbeiten und Abschlussarbeiten oft in Zeichen angegeben; ob mit oder ohne Leerzeichen, legt der Lehrstuhl fest. Klären Sie außerdem, ob Deckblatt, Inhaltsverzeichnis, Fußnoten, Literaturverzeichnis und Anhang mitzählen; das regelt meist die Prüfungsordnung oder der Lehrstuhl.\n\nFür reine Zeichenbegrenzungen in Formularfeldern, etwa in Bewerbungsportalen, zählen meist alle Zeichen einschließlich Leerzeichen und Zeilenumbrüchen. Wenn Sie nur die Zeichenzahl brauchen, ist der [Zeichenzähler](tool:zeichenzaehler) die schnellste Lösung. Überflüssige doppelte Leerzeichen, die Ihre Zeichenzahl künstlich erhöhen, entfernen Sie mit [Leerzeichen entfernen](tool:leerzeichen-entfernen).'
      },
      {
        heading: 'Wie zähle ich Wörter in Word, Google Docs und LibreOffice?',
        content: 'Alle gängigen Textprogramme haben eine eingebaute Zählfunktion:\n\n- **Microsoft Word:** In der Statusleiste unten wird die Wortzahl laufend angezeigt. Ein Klick darauf oder „Überprüfen“ > „Wörter zählen“ öffnet die Statistik mit Zeichen mit und ohne Leerzeichen. Optional lassen sich Textfelder, Fuß- und Endnoten einbeziehen.\n- **Google Docs:** Unter „Tools“ > „Wortzählung“ oder mit Strg+Umschalt+C (Mac: Cmd+Umschalt+C). Dort lässt sich auch eine laufende Anzeige beim Schreiben aktivieren.\n- **LibreOffice Writer:** Unter „Extras“ > „Wortanzahl“; die Statusleiste zeigt die Zahl ebenfalls an.\n- **Apple Pages:** Über „Darstellung“ > „Wortanzahl einblenden“.\n\nEin Online-Wortzähler ist praktisch, wenn Sie Text aus E-Mails, Webformularen, PDFs oder Notiz-Apps prüfen wollen, ohne ihn erst in ein Textprogramm zu kopieren. Soll das fertige Dokument anschließend als PDF eingereicht werden, hilft [Word in PDF umwandeln](blog:word-in-pdf-umwandeln-anleitung).'
      },
      {
        heading: 'Welche Zeichenlimits gelten bei SMS, X und Suchmaschinen?',
        content: 'Feste Zeichenlimits gibt es vor allem bei SMS und vielen Social-Media-Plattformen; Plattformgrenzen können sich allerdings ändern und hängen teils vom Kontotyp ab. Prüfen Sie im Zweifel die aktuellen Angaben des Anbieters. Einige Orientierungspunkte:\n\n- **SMS:** Eine klassische SMS fasst laut GSM-Standard 160 Zeichen im Standardzeichensatz. Enthält sie Emojis oder bestimmte Sonderzeichen, sinkt die Grenze auf 70 Zeichen pro Nachrichtenteil.\n- **X (ehemals Twitter):** Für Konten ohne Abo gilt seit 2017 eine Grenze von 280 Zeichen pro Beitrag; Abonnenten dürfen längere Beiträge schreiben.\n- **Meta-Beschreibungen für Webseiten:** Google kürzt Suchergebnis-Texte nach verfügbarer Breite und nennt keine feste Zeichengrenze.\n\nAchtung bei Emojis: Viele Emojis bestehen intern aus mehreren Codeeinheiten und werden deshalb als zwei oder mehr Zeichen gezählt. Auch der Zeichenzähler von Datei Tools zählt diese Codeeinheiten, sodass er bei Emojis von der Anzeige einer Plattform abweichen kann.'
      },
      {
        heading: 'Welche Tipps helfen, eine Längenvorgabe einzuhalten?',
        content: 'Bei Datei Tools wird Ihr Text ausschließlich in Ihrem Browser gezählt und nicht an einen Server übertragen. Das ist wichtig, weil Texte, deren Länge man prüft, oft unveröffentlicht sind: Bewerbungsanschreiben, Abschlussarbeiten, Vertragsentwürfe oder interne Berichte.\n\nNoch ein paar Tipps aus der Praxis:\n\n- Zählen Sie zuerst den Rohtext und kürzen Sie dann gezielt, statt beim Schreiben ständig auf die Zahl zu schauen.\n- Für Zeilenvorgaben, etwa bei Gedichten oder Code, hilft der [Zeilenzähler](tool:zeilen-zaehlen).\n- Liegt Ihr Text nur als Foto oder Scan vor, wandeln Sie ihn zuerst per Texterkennung um, wie in [Text aus Bild kopieren](blog:text-aus-bild-kopieren) beschrieben.\n- Bei mehreren Fassungen eines Textes zeigt ein Textvergleich, was sich zwischen den Versionen geändert hat.'
      },
    ],
    faqs: [
      { question: 'Zählen Leerzeichen als Zeichen?', answer: 'Das hängt von der Vorgabe ab. Wortzähler zeigen deshalb meist beide Werte an: Zeichen mit und ohne Leerzeichen. Bei Hausarbeiten legen Prüfungsordnung oder Lehrstuhl fest, was gilt; im Zweifel sollten Sie nachfragen.' },
      { question: 'Warum zeigt Word eine andere Wortzahl als ein Online-Zähler?', answer: 'Programme behandeln Sonderfälle wie Abkürzungen mit Leerzeichen, Gedankenstriche, Zahlen oder Fußnoten unterschiedlich. Die Abweichungen sind meist gering. Bei strengen Grenzen sollten Sie mit dem Programm prüfen, das auch der Empfänger verwendet.' },
      { question: 'Wie viele Wörter hat eine Seite?', answer: 'Eine feste Umrechnung gibt es nicht, denn die Zahl hängt von Schriftart, Schriftgröße, Zeilenabstand und Seitenrändern ab. Am zuverlässigsten zählen Sie eine typische Seite Ihres Dokuments mit den vorgegebenen Formatierungen aus und rechnen von dort hoch.' },
      { question: 'Werden Emojis als ein Zeichen gezählt?', answer: 'Nicht immer. Viele Emojis bestehen intern aus mehreren Codeeinheiten oder sogar mehreren kombinierten Zeichen. Je nach Plattform und Zählmethode kann ein Emoji daher als ein, zwei oder mehr Zeichen gewertet werden; der Zeichenzähler von Datei Tools zählt die Codeeinheiten.' },
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion',
  },
];
