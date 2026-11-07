import type { BlogArticle } from './types';

/**
 * Cluster „Fotos, Website & Online-Shop“.
 * Alle beschriebenen Werkzeuge arbeiten lokal im Browser – Dateien verlassen das Gerät nicht.
 */
export const WEB_CLUSTER_ARTICLES: BlogArticle[] = [
  {
    slug: 'bilder-fuer-website-optimieren',
    title: 'Bilder für die Website optimieren: Format, Größe und Komprimierung',
    metaTitle: 'Bilder für Website optimieren: Format & Größe | Datei Tools',
    metaDescription: 'Bilder für die eigene Website optimieren: das passende Format (WebP, JPG, PNG) wählen, Pixelmaße anpassen und sinnvoll komprimieren – lokal im Browser.',
    h1: 'Bilder für die Website optimieren: So werden Fotos schnell und scharf',
    excerpt: 'Große Kamerafotos bremsen jede Website. Dieser Ratgeber erklärt, welches Bildformat wofür passt, welche Pixelmaße sinnvoll sind und wie Sie komprimieren, ohne dass die Qualität sichtbar leidet.',
    category: 'images',
    primaryKeyword: 'bilder für website optimieren',
    secondaryKeywords: ['bilder für webseite verkleinern', 'webp oder jpg website', 'bildgröße website', 'bilder komprimieren website', 'ladezeit bilder'],
    searchIntent: 'informational',
    primaryToolSlug: 'bild-komprimieren',
    ctaHeadline: 'Website-Bilder jetzt optimieren',
    ctaButtonLabel: 'Bild komprimieren',
    relatedToolSlugs: ['bildgroesse-aendern', 'jpg-in-webp-umwandeln', 'bild-zuschneiden'],
    relatedArticleSlugs: ['webp-vs-png-unterschied', 'bild-auf-100-kb-verkleinern', 'bild-zuschneiden-seitenverhaeltnis', 'bild-metadaten-exif-entfernen'],
    directAnswer: 'Optimieren Sie Website-Bilder in drei Schritten: zuerst auf die tatsächlich benötigte Breite verkleinern, dann ein passendes Format wählen (Fotos als WebP oder JPG, Grafiken mit Transparenz als PNG oder WebP) und zuletzt mit moderater Qualität komprimieren. Die größte Ersparnis bringt meist das Verkleinern der Pixelmaße.',
    steps: [
      { step: 1, title: 'Benötigte Breite ermitteln', text: 'Prüfen Sie, wie breit das Bild auf Ihrer Seite maximal angezeigt wird, und planen Sie für hochauflösende Bildschirme etwas Reserve ein.' },
      { step: 2, title: 'Pixelmaße verkleinern', text: 'Verkleinern Sie das Originalfoto auf diese Breite. Das Seitenverhältnis bleibt dabei erhalten, wenn Sie nur eine Kante vorgeben.' },
      { step: 3, title: 'Format wählen', text: 'Speichern Sie Fotos als WebP oder JPG. Logos, Screenshots und Grafiken mit Transparenz eignen sich besser für PNG oder WebP.' },
      { step: 4, title: 'Komprimieren und prüfen', text: 'Komprimieren Sie das Bild und vergleichen Sie es in Originalgröße mit der Vorlage. Achten Sie auf Kanten, Text und Farbverläufe.' }
    ],
    sections: [
      {
        heading: 'Warum bremsen unoptimierte Bilder eine Website?',
        content: 'Smartphone- und Kamerafotos haben oft mehrere tausend Pixel Kantenlänge und mehrere Megabyte Dateigröße. Auf einer Website wird ein solches Bild aber meist nur in einem Bruchteil dieser Breite angezeigt. Der Browser lädt trotzdem die volle Datei herunter – das kostet Ladezeit, gerade im Mobilfunknetz, und verschlechtert Kennzahlen wie den Largest Contentful Paint.\n\nDie gute Nachricht: Bilder sind meist der Teil einer Seite, der sich am leichtesten verkleinern lässt. Wer Pixelmaße, Format und Komprimierung bewusst wählt, spart viel Datenvolumen, ohne dass Besucher einen Unterschied sehen.'
      },
      {
        heading: 'Welches Bildformat passt wofür?',
        content: 'Das richtige Format hängt vom Bildinhalt ab, nicht von persönlichen Vorlieben.\n\n| Format | Geeignet für | Transparenz | Hinweis |\n|---|---|---|---|\n| WebP | Fotos und Grafiken | ja | in aktuellen Browsern breit unterstützt, meist kleiner als JPG/PNG |\n| JPG | Fotos | nein | sehr kompatibel, verlustbehaftet |\n| PNG | Logos, Screenshots, Text im Bild | ja | verlustfrei, bei Fotos sehr groß |\n| SVG | Logos und Icons aus Vektoren | ja | beliebig skalierbar, nicht für Fotos |\n\nFür Fotos ist WebP heute oft die beste Wahl; JPG bleibt eine sichere Alternative, wenn ein System kein WebP annimmt. Bestehende Fotos wandeln Sie mit [JPG in WebP umwandeln](tool:jpg-in-webp-umwandeln) um. Die Unterschiede zwischen verlustfreien und verlustbehafteten Formaten erklärt der Beitrag [WebP vs. PNG](blog:webp-vs-png-unterschied).'
      },
      {
        heading: 'Wie groß sollten Website-Bilder in Pixeln sein?',
        content: 'Orientieren Sie sich an der maximalen Anzeigebreite im Layout. Ein Bild in einer Textspalte braucht deutlich weniger Pixel als ein bildschirmbreites Titelbild. Für hochauflösende Displays ist es sinnvoll, etwa die doppelte Anzeigebreite vorzuhalten – mehr bringt in der Regel keinen sichtbaren Gewinn.\n\nMit [Bildgröße ändern](tool:bildgroesse-aendern) setzen Sie die gewünschte Breite; das Seitenverhältnis bleibt erhalten. Wenn Bilder in einem festen Raster (etwa 16:9 oder quadratisch) erscheinen sollen, schneiden Sie sie vorher zu. Wie das sauber gelingt, zeigt der Ratgeber [Bild auf ein Seitenverhältnis zuschneiden](blog:bild-zuschneiden-seitenverhaeltnis).'
      },
      {
        heading: 'Wie stark sollte man komprimieren?',
        content: 'Verlustbehaftete Komprimierung entfernt Bildinformationen, die das Auge kaum wahrnimmt. Bis zu einem gewissen Punkt sieht man keinen Unterschied, danach entstehen Blockartefakte, ausgefranste Kanten und Streifen in Farbverläufen. Wo diese Grenze liegt, hängt stark vom Motiv ab: Detailreiche Fotos vertragen mehr Komprimierung als Bilder mit glatten Flächen oder Schrift.\n\nArbeiten Sie deshalb mit Sichtkontrolle: Komprimieren Sie mit [Bild komprimieren](tool:bild-komprimieren), vergleichen Sie das Ergebnis in voller Größe und gehen Sie bei sichtbaren Artefakten eine Stufe zurück. Wenn ein Formular oder CMS eine feste Obergrenze verlangt, hilft die Anleitung [Bild auf 100 KB verkleinern](blog:bild-auf-100-kb-verkleinern).'
      },
      {
        heading: 'Was sollte man vor dem Hochladen noch prüfen?',
        content: '- **Metadaten:** Fotos enthalten oft EXIF-Daten mit Kameramodell, Aufnahmezeit und eventuell GPS-Standort. Für die Website werden sie nicht gebraucht. Mehr dazu im Beitrag [Bild-Metadaten entfernen](blog:bild-metadaten-exif-entfernen).\n- **Dateinamen:** Beschreibende Namen wie „blaue-keramiktasse.webp“ sind verständlicher als „IMG_4711.webp“.\n- **Alternativtext:** Hinterlegen Sie im CMS eine kurze Beschreibung des Bildinhalts – wichtig für Barrierefreiheit und Bildersuche.\n- **Original behalten:** Bewahren Sie die unbearbeitete Datei auf, damit Sie später in anderer Größe neu exportieren können.\n\nAlle genannten Schritte laufen bei Datei Tools lokal im Browser; Ihre Bilder werden nicht auf einen Server hochgeladen.'
      }
    ],
    faqs: [
      { question: 'Ist WebP besser als JPG für meine Website?', answer: 'Für Fotos erreicht WebP bei vergleichbarer Qualität meist kleinere Dateien und unterstützt zusätzlich Transparenz. JPG ist dafür noch universeller kompatibel. Wenn Ihr CMS WebP annimmt, ist es in der Regel die bessere Wahl.' },
      { question: 'Sollte ich Logos als JPG speichern?', answer: 'Besser nicht. JPG erzeugt an scharfen Kanten und Schrift sichtbare Artefakte und kennt keine Transparenz. Verwenden Sie für Logos SVG, PNG oder WebP.' },
      { question: 'Reicht es, Bilder nur zu komprimieren?', answer: 'Meist nicht. Ein Foto mit viel zu großen Pixelmaßen bleibt auch komprimiert unnötig schwer. Verkleinern Sie zuerst die Abmessungen und komprimieren Sie danach.' },
      { question: 'Werden meine Bilder beim Optimieren hochgeladen?', answer: 'Nein. Die Bildwerkzeuge von Datei Tools verarbeiten die Dateien im Browser auf Ihrem Gerät.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'handyfotos-vor-dem-teilen-verkleinern-standort-entfernen',
    title: 'Handyfotos vor dem Teilen verkleinern und Standort entfernen',
    metaTitle: 'Handyfotos verkleinern & Standort entfernen | Datei Tools',
    metaDescription: 'Fotos vom Handy vor dem Teilen verkleinern und GPS-Standort aus den Metadaten entfernen: So schützen Sie Ihre Privatsphäre – lokal im Browser.',
    h1: 'Handyfotos vor dem Teilen verkleinern und den Standort entfernen',
    excerpt: 'Handyfotos sind groß und verraten oft, wo sie aufgenommen wurden. So verkleinern Sie Bilder vor dem Versand und entfernen Metadaten wie den GPS-Standort, bevor Sie Fotos per E-Mail, Kleinanzeige oder Cloud teilen.',
    category: 'images',
    primaryKeyword: 'handyfotos verkleinern standort entfernen',
    secondaryKeywords: ['foto standort entfernen', 'gps daten aus foto löschen', 'handyfoto verkleinern', 'fotos vor dem teilen verkleinern', 'exif standort entfernen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-metadaten-entfernen',
    ctaHeadline: 'Metadaten jetzt lokal entfernen',
    ctaButtonLabel: 'Metadaten entfernen',
    relatedToolSlugs: ['bildgroesse-aendern', 'bild-komprimieren', 'heic-in-jpg-umwandeln'],
    relatedArticleSlugs: ['bild-metadaten-exif-entfernen', 'bild-auf-100-kb-verkleinern', 'iphone-fotos-als-jpg-speichern', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Entfernen Sie vor dem Teilen die Metadaten des Fotos, denn darin kann der GPS-Standort der Aufnahme gespeichert sein. Verkleinern Sie das Bild anschließend auf eine sinnvolle Größe, damit es schnell verschickt wird. Beides lässt sich im Browser erledigen, ohne die Fotos hochzuladen.',
    steps: [
      { step: 1, title: 'Format prüfen', text: 'Liegen iPhone-Fotos als HEIC vor, wandeln Sie sie zuerst in JPG um, damit Empfänger sie problemlos öffnen können.' },
      { step: 2, title: 'Metadaten entfernen', text: 'Öffnen Sie das Werkzeug zum Entfernen von Metadaten und wählen Sie die Fotos aus. Es wird eine bereinigte Kopie erzeugt.' },
      { step: 3, title: 'Bild verkleinern', text: 'Reduzieren Sie die Pixelmaße auf die benötigte Größe, zum Beispiel für E-Mail oder Kleinanzeige.' },
      { step: 4, title: 'Kopie teilen', text: 'Teilen Sie nur die bereinigte, verkleinerte Kopie und behalten Sie das Original auf Ihrem Gerät.' }
    ],
    sections: [
      {
        heading: 'Welche Informationen stecken in einem Handyfoto?',
        content: 'Neben dem eigentlichen Bild speichern Smartphones Metadaten, meist im EXIF-Format. Dazu gehören typischerweise:\n\n- Aufnahmedatum und -uhrzeit\n- Gerätehersteller und Modell\n- Kameraeinstellungen wie Belichtungszeit und Brennweite\n- GPS-Koordinaten, wenn die Standortfunktion der Kamera aktiv war\n\nGerade der Standort ist heikel: Ein Foto aus der eigenen Wohnung kann so die Wohnadresse verraten. Manche Plattformen entfernen Metadaten beim Hochladen, verlassen sollten Sie sich darauf aber nicht – vor allem nicht bei E-Mail-Anhängen, Cloud-Links oder Dateien in Messengern, die als Dokument verschickt werden. Hintergründe finden Sie im Ratgeber [Bild-Metadaten entfernen](blog:bild-metadaten-exif-entfernen).'
      },
      {
        heading: 'Wie entferne ich den Standort aus einem Foto?',
        content: 'Am zuverlässigsten ist es, die Metadaten vor dem Teilen zu entfernen. Mit [Bild-Metadaten entfernen](tool:bild-metadaten-entfernen) wählen Sie ein oder mehrere Fotos aus und erhalten bereinigte Kopien. Die Verarbeitung findet im Browser statt, die Fotos verlassen Ihr Gerät also nicht.\n\nFür künftige Aufnahmen können Sie zusätzlich in den Kameraeinstellungen des Smartphones das Speichern des Standorts deaktivieren. Das ersetzt aber nicht die Kontrolle älterer Fotos, die bereits Koordinaten enthalten.'
      },
      {
        heading: 'Wie stark sollte ich Fotos zum Teilen verkleinern?',
        content: 'Das hängt vom Zweck ab. Für die Ansicht am Bildschirm reichen deutlich geringere Pixelmaße als für einen Fotoabzug.\n\n| Zweck | Empfehlung |\n|---|---|\n| E-Mail oder Messenger zur Ansicht | lange Kante deutlich verkleinern, moderat komprimieren |\n| Kleinanzeige oder Formular-Upload | an die Vorgaben der Plattform halten |\n| Druck oder Fotoabzug | Original in voller Auflösung senden |\n| Archiv | immer das Original behalten |\n\nMit [Bildgröße ändern](tool:bildgroesse-aendern) verringern Sie die Pixelmaße, mit [Bild komprimieren](tool:bild-komprimieren) zusätzlich die Dateigröße. Wenn eine feste Obergrenze gilt, hilft die Anleitung [Bild auf 100 KB verkleinern](blog:bild-auf-100-kb-verkleinern).'
      },
      {
        heading: 'Was ist bei iPhone-Fotos im HEIC-Format zu beachten?',
        content: 'iPhones speichern Fotos häufig im HEIC-Format. Nicht jedes Programm und nicht jeder Empfänger kann HEIC öffnen. Wandeln Sie solche Bilder deshalb vor dem Teilen mit [HEIC in JPG umwandeln](tool:heic-in-jpg-umwandeln) um und prüfen Sie danach, ob die Metadaten entfernt sind. Weitere Wege beschreibt der Beitrag [iPhone-Fotos als JPG speichern](blog:iphone-fotos-als-jpg-speichern).'
      },
      {
        heading: 'Warum ist lokale Verarbeitung hier besonders sinnvoll?',
        content: 'Wer Metadaten entfernen möchte, will gerade verhindern, dass private Informationen in fremde Hände geraten. Ein Online-Dienst, der das Foto erst auf einen Server lädt, wäre deshalb ein Widerspruch. Bei Datei Tools bleiben die Fotos im Browser auf Ihrem Gerät. Warum das auch aus Sicht der DSGVO ein Vorteil ist, erklärt der Ratgeber [Dateien ohne Upload bearbeiten](blog:dateien-ohne-upload-bearbeiten-dsgvo).'
      }
    ],
    faqs: [
      { question: 'Entfernen WhatsApp oder soziale Netzwerke den Standort automatisch?', answer: 'Viele Plattformen entfernen Metadaten beim Hochladen von Bildern, die Praxis ist aber nicht einheitlich und kann sich ändern. Bei Versand als Datei, E-Mail-Anhang oder Cloud-Link bleiben Metadaten oft erhalten. Sicherer ist es, sie vorher selbst zu entfernen.' },
      { question: 'Verändert das Entfernen der Metadaten die Bildqualität?', answer: 'Das Ziel ist, nur die Zusatzinformationen zu entfernen. Prüfen Sie das Ergebnis dennoch kurz, bevor Sie das Original löschen – idealerweise behalten Sie das Original ohnehin.' },
      { question: 'Kann ich mehrere Fotos auf einmal bereinigen?', answer: 'Ja, Sie können mehrere Bilder gleichzeitig auswählen und erhalten für jedes Foto eine bereinigte Kopie.' },
      { question: 'Werden meine Fotos dabei hochgeladen?', answer: 'Nein. Die Verarbeitung läuft lokal im Browser, die Dateien verlassen Ihr Gerät nicht.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  }
];
