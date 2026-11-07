import type { BlogArticle } from './types';

/**
 * PDF- und Sicherheits-Ratgeber (zweite Redaktionsrunde, Autor A).
 * Alle beschriebenen Werkzeuge arbeiten lokal im Browser – Dateien verlassen das Gerät nicht.
 */
export const PDF_SECURITY_ARTICLES: BlogArticle[] = [
  {
    slug: 'pdf-zusammenfuegen-anleitung',
    title: 'PDF zusammenfügen: Mehrere Dateien zu einer PDF verbinden',
    metaTitle: 'PDF zusammenfügen: Anleitung ohne Upload | Datei Tools',
    metaDescription: 'PDF zusammenfügen in wenigen Schritten: mehrere PDFs in der richtigen Reihenfolge zu einer Datei verbinden – kostenlos, im Browser und ohne Upload.',
    h1: 'PDF zusammenfügen: So verbinden Sie mehrere PDFs zu einer Datei',
    excerpt: 'Rechnungen, Anlagen oder Bewerbungsunterlagen sollen als eine einzige PDF verschickt werden? Diese Anleitung zeigt, wie Sie PDFs sauber zusammenfügen, worauf Sie bei Reihenfolge und Dateigröße achten und welche Stolperfallen es gibt.',
    category: 'pdf',
    primaryKeyword: 'pdf zusammenfügen',
    secondaryKeywords: ['pdf dateien zusammenfügen', 'mehrere pdf zu einer zusammenfügen', 'pdf zusammenführen', 'pdf verbinden kostenlos', 'pdf kombinieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-zusammenfuegen',
    ctaHeadline: 'PDFs jetzt kostenlos zusammenfügen',
    ctaButtonLabel: 'PDFs zusammenfügen',
    relatedToolSlugs: ['pdf-seiten-neu-anordnen', 'pdf-komprimieren', 'jpg-in-pdf-umwandeln'],
    relatedArticleSlugs: ['pdf-zusammenfuegen-mac-windows-iphone', 'pdf-seiten-sortieren-reihenfolge-aendern', 'mehrere-bilder-als-eine-pdf-speichern', 'pdf-fuer-bewerbung-verkleinern'],
    directAnswer: 'Um mehrere PDFs zusammenzufügen, wählen Sie alle Dateien in einem PDF-Werkzeug aus, bringen sie in die gewünschte Reihenfolge und speichern das Ergebnis als neue PDF. Innerhalb jeder Datei bleibt die Seitenfolge erhalten. Passwortgeschützte Dateien müssen Sie vorher mit dem bekannten Kennwort entsperren.',
    steps: [
      { step: 1, title: 'Dateien auswählen', text: 'Öffnen Sie das Werkzeug zum Zusammenfügen und wählen Sie alle PDFs aus oder ziehen Sie sie per Drag & Drop in das Browserfenster. Sie können mehrere Dateien gleichzeitig markieren.' },
      { step: 2, title: 'Reihenfolge festlegen', text: 'Prüfen Sie die Reihenfolge in der Dateiliste und verschieben Sie Dateien bei Bedarf nach oben oder unten. Die Datei, die zuoberst steht, bildet den Anfang des neuen Dokuments.' },
      { step: 3, title: 'Zusammenfügen starten', text: 'Starten Sie die Verarbeitung. Die Seiten werden lokal auf Ihrem Gerät zu einer neuen PDF kombiniert; bei sehr vielen oder großen Dateien dauert das je nach Rechenleistung etwas länger.' },
      { step: 4, title: 'Ergebnis prüfen und speichern', text: 'Laden Sie die neue PDF herunter und blättern Sie sie einmal durch. Kontrollieren Sie vor allem Seitenreihenfolge, Ausrichtung und Gesamtgröße der Datei.' }
    ],
    sections: [
      {
        heading: 'Wann lohnt es sich, PDFs zusammenzufügen?',
        content: 'Das Zusammenfügen lohnt sich immer dann, wenn ein Empfänger genau eine Datei erwartet. Bewerbungsportale akzeptieren oft nur einen Anhang, Behörden möchten Antrag und Nachweise gebündelt, und für die Buchhaltung ist eine Monats-PDF übersichtlicher als zwanzig Einzelrechnungen. Eine zusammengeführte PDF lässt sich außerdem leichter archivieren, weil keine Anlage verloren geht.\n\nTypische Einsatzfälle sind:\n\n- Bewerbungsmappe aus Anschreiben, Lebenslauf und Zeugnissen\n- Antrag mit eingescannten Belegen für Versicherung oder Amt\n- Sammelrechnung oder Quartalsunterlagen für die Steuer\n- Skript aus mehreren Kapitel-PDFs\n\nLiegen Unterlagen teilweise als Fotos vor, wandeln Sie diese zuerst um, etwa mit [JPG in PDF umwandeln](tool:jpg-in-pdf-umwandeln). Wie das bei vielen Bildern auf einmal funktioniert, beschreibt der Ratgeber [mehrere Bilder als eine PDF speichern](blog:mehrere-bilder-als-eine-pdf-speichern).'
      },
      {
        heading: 'In welcher Reihenfolge werden die Dateien zusammengefügt?',
        content: 'Die Dateien werden in der Reihenfolge hintereinandergehängt, in der sie in der Liste stehen; innerhalb einer Datei bleibt die Seitenreihenfolge unverändert. Steht in einem Dokument eine Seite an der falschen Stelle oder ist ein Scan verdreht, korrigieren Sie das am besten danach in einem eigenen Arbeitsschritt.\n\nPraktisch ist es, die Dateinamen vorab zu nummerieren, zum Beispiel „01_Anschreiben.pdf“ und „02_Lebenslauf.pdf“. So sehen Sie schon bei der Auswahl, ob alles vollständig ist. Müssen einzelne Seiten nach dem Zusammenfügen verschoben werden, hilft die Anleitung [PDF-Seiten sortieren und die Reihenfolge ändern](blog:pdf-seiten-sortieren-reihenfolge-aendern).\n\nUnterschiedliche Seitenformate wie A4 hoch, A4 quer oder US-Letter sind kein Problem: Jede Seite behält ihre ursprüngliche Größe. Im Viewer wirkt das Dokument dann eventuell uneinheitlich, inhaltlich geht aber nichts verloren.'
      },
      {
        heading: 'Was geht beim Zusammenfügen verloren?',
        content: 'Seiteninhalte, Texte, Bilder und Links zu Webseiten werden übernommen. Einige Zusatzinformationen der Einzeldateien gehen beim Zusammenfügen dagegen verloren oder verändern sich:\n\n- **Lesezeichen und Inhaltsverzeichnisse** der Einzeldateien übernimmt Datei Tools nicht in die neue Datei.\n- **Formularfelder** können ihre Funktion verlieren. Füllen Sie Formulare deshalb vorher aus und flachen Sie sie ab.\n- **Digitale Signaturen** werden ungültig, weil das signierte Dokument verändert wird. Signieren Sie erst die fertige Gesamtdatei.\n- **Dokumenteigenschaften** wie Titel und Autor der Quelldateien werden nicht übernommen.\n\nVerschlüsselte PDFs mit Öffnungspasswort lassen sich nicht direkt kombinieren. Entsperren Sie sie zunächst – vorausgesetzt, Sie kennen das Kennwort und sind zur Bearbeitung berechtigt.'
      },
      {
        heading: 'Wie groß wird die zusammengefügte PDF?',
        content: 'Die neue PDF ist ungefähr so groß wie alle Einzeldateien zusammen. Enthalten die Quellen eingescannte Seiten oder hochauflösende Fotos, entsteht schnell eine Datei, die E-Mail-Postfächer oder Upload-Formulare ablehnen.\n\nSinnvoll ist deshalb diese Reihenfolge: erst zusammenfügen, dann prüfen, dann bei Bedarf komprimieren. Mit [PDF komprimieren](tool:pdf-komprimieren) lassen sich vor allem eingebettete Bilder verkleinern; reine Textseiten schrumpfen kaum, weil sie bereits kompakt gespeichert sind. Wie stark die Datei kleiner wird, hängt vom Inhalt ab und lässt sich nicht vorab garantieren.\n\nFür Bewerbungen gelten oft feste Obergrenzen. Konkrete Tipps dazu finden Sie im Beitrag [PDF für die Bewerbung verkleinern](blog:pdf-fuer-bewerbung-verkleinern).'
      },
      {
        heading: 'Warum ist lokales Zusammenfügen beim Datenschutz sinnvoll?',
        content: 'Lokales Zusammenfügen ist sinnvoll, weil gerade die Dokumente, die man typischerweise bündelt, sensibel sind: Zeugnisse, Kontoauszüge, Arztrechnungen oder Verträge. Bei Datei Tools werden die Dateien im Browser auf Ihrem eigenen Gerät verarbeitet und nicht an einen Server übertragen.\n\nDas hat zwei Folgen: Sie müssen sich keine Gedanken über Speicherfristen bei einem Anbieter machen, und die Geschwindigkeit hängt von Ihrem Gerät ab. Bei hunderten Seiten braucht ein älteres Smartphone länger als ein Computer. Schließen Sie bei sehr großen Dateien andere speicherhungrige Tabs.\n\nNach dem Speichern liegt die neue Datei in Ihrem Download-Ordner. Die Ausgangsdateien bleiben unverändert erhalten, sodass Sie bei einem Fehler jederzeit neu beginnen können.'
      }
    ],
    faqs: [
      { question: 'Wie viele PDFs kann ich auf einmal zusammenfügen?', answer: 'Sie können mehrere Dateien in einem Durchgang zusammenfügen. Wie viele und wie große Dateien flüssig verarbeitet werden, hängt vor allem vom Arbeitsspeicher Ihres Geräts ab. Bei sehr vielen großen Scans ist es sinnvoll, in mehreren Durchgängen zu arbeiten.' },
      { question: 'Bleibt die Qualität beim Zusammenfügen erhalten?', answer: 'Ja. Beim Zusammenfügen werden die Seiten nicht neu berechnet, Texte und Bilder bleiben unverändert. Qualitätsverluste entstehen erst, wenn Sie die Datei anschließend bewusst komprimieren.' },
      { question: 'Kann ich auch Bilder und PDFs gemeinsam zusammenfügen?', answer: 'Wandeln Sie Bilder zuerst in PDF um und fügen Sie dann alle PDFs zusammen. So behalten Sie die Kontrolle über Seitenformat und Reihenfolge.' },
      { question: 'Warum lässt sich eine meiner PDFs nicht hinzufügen?', answer: 'Häufige Ursachen sind ein Öffnungspasswort oder eine beschädigte Datei. Entsperren Sie die PDF mit dem bekannten Kennwort oder versuchen Sie, sie vorher zu reparieren.' },
      { question: 'Bleiben Links und Lesezeichen beim Zusammenfügen erhalten?', answer: 'Links zu Webseiten bleiben in der Regel erhalten. Lesezeichen und Inhaltsverzeichnisse der Einzeldateien übernimmt Datei Tools nicht. Wenn Sie auf eine Navigation angewiesen sind, legen Sie wichtige Lesezeichen in einem PDF-Editor neu an.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-zusammenfuegen-mac-windows-iphone',
    title: 'PDF zusammenfügen auf Mac, Windows, iPhone und Android',
    metaTitle: 'PDF zusammenfügen: Mac, Windows & iPhone | Datei Tools',
    metaDescription: 'PDFs auf Mac, Windows, iPhone oder Android zusammenfügen: Bordmittel wie Vorschau und Dateien-App erklärt – plus kostenlose Lösung ohne Upload.',
    h1: 'PDF zusammenfügen auf Mac, Windows, iPhone und Android: Alle Wege im Überblick',
    excerpt: 'macOS und iOS bringen eigene Funktionen zum Zusammenfügen von PDFs mit, Windows und Android dagegen kaum. Wir zeigen die Bordmittel jedes Systems und wann ein Browser-Werkzeug der schnellere Weg ist.',
    category: 'pdf',
    primaryKeyword: 'pdf zusammenfügen mac windows iphone',
    secondaryKeywords: ['pdf zusammenfügen mac vorschau', 'pdf zusammenfügen windows ohne programm', 'pdf zusammenfügen iphone', 'pdf zusammenfügen android', 'pdf zusammenführen windows 11'],
    searchIntent: 'informational',
    primaryToolSlug: 'pdf-zusammenfuegen',
    ctaHeadline: 'Auf jedem Gerät PDFs zusammenfügen',
    ctaButtonLabel: 'Jetzt zusammenfügen',
    relatedToolSlugs: ['pdf-seiten-neu-anordnen', 'pdf-komprimieren', 'scan-zu-pdf'],
    relatedArticleSlugs: ['pdf-zusammenfuegen-anleitung', 'pdf-seiten-sortieren-reihenfolge-aendern', 'dokumente-mit-dem-handy-scannen-pdf', 'fotos-in-pdf-umwandeln-so-funktioniert-es'],
    directAnswer: 'Auf dem Mac fügen Sie PDFs in der Vorschau oder im Finder über „Schnellaktionen > PDF erstellen“ zusammen, auf iPhone und iPad in der Dateien-App über „PDF erstellen“. Windows und Android haben keine eingebaute Funktion dafür; dort ist ein Browser-Werkzeug, das ohne Installation auskommt, der einfachste Weg.',
    steps: [
      { step: 1, title: 'System-Bordmittel prüfen', text: 'Auf Mac und iPhone können Sie die eingebauten Funktionen nutzen. Unter Windows und Android greifen Sie direkt zum Browser.' },
      { step: 2, title: 'Dateien auswählen', text: 'Öffnen Sie das Werkzeug zum Zusammenfügen in einem aktuellen Browser wie Chrome, Edge, Firefox oder Safari und wählen Sie die PDFs aus dem Dateisystem aus.' },
      { step: 3, title: 'Reihenfolge anpassen', text: 'Bringen Sie die Dateien in die gewünschte Reihenfolge, indem Sie sie in der Liste nach oben oder unten verschieben. Dieser Schritt ist auf allen Systemen gleich.' },
      { step: 4, title: 'Gesamt-PDF speichern', text: 'Speichern Sie die neue Datei und prüfen Sie, wo sie abgelegt wurde: unter Windows und Android meist im Ordner „Downloads“, auf dem iPhone in der Dateien-App.' }
    ],
    sections: [
      {
        heading: 'Welche Systeme können PDFs ohne Zusatzprogramm zusammenfügen?',
        content: 'Nur macOS und iOS bzw. iPadOS bringen eine eingebaute Funktion zum Zusammenfügen von PDFs mit. Unter Windows und Android brauchen Sie dafür ein zusätzliches Werkzeug, etwa im Browser.\n\n| System | Eingebaute Funktion | Einschränkung |\n|---|---|---|\n| macOS | Vorschau, Finder-Schnellaktion „PDF erstellen“ | Reihenfolge folgt der Sortierung im Finder |\n| iPhone/iPad | Dateien-App: „PDF erstellen“ | kaum Umsortieren möglich |\n| Windows 10/11 | keine | Browser-Werkzeug nötig |\n| Android | keine allgemeine Funktion | Browser-Werkzeug oder App nötig |\n\nDie folgenden Abschnitte zeigen die Wege für jedes System im Detail.'
      },
      {
        heading: 'PDF auf dem Mac zusammenfügen: Vorschau und Finder',
        content: 'Auf dem Mac gibt es zwei eingebaute Wege. Der schnellste führt über den Finder: Markieren Sie die PDFs, klicken Sie mit der rechten Maustaste und wählen Sie „Schnellaktionen > PDF erstellen“. Der Mac legt daraufhin eine neue, kombinierte Datei im selben Ordner an. Die Reihenfolge richtet sich nach der Sortierung im Finder, deshalb lohnen sich nummerierte Dateinamen.\n\nMehr Kontrolle bietet die Vorschau:\n\n1. Öffnen Sie die erste PDF in der Vorschau.\n2. Blenden Sie über „Darstellung > Miniaturen“ die Seitenleiste ein.\n3. Ziehen Sie die weiteren PDFs aus dem Finder an die gewünschte Stelle in der Seitenleiste.\n4. Sichern Sie das Ergebnis über „Ablage > Als PDF exportieren“ als neue Datei.\n\nAchtung: Wenn Sie stattdessen einfach sichern, überschreiben Sie die erste Ausgangsdatei.'
      },
      {
        heading: 'PDF am iPhone und iPad zusammenfügen: Dateien-App und Kurzbefehle',
        content: 'Auf iPhone und iPad kombiniert die Dateien-App mehrere Dokumente über die Funktion „PDF erstellen“. Öffnen Sie den Ordner mit Ihren PDFs, tippen Sie oben rechts auf das Menü und dann auf „Auswählen“, markieren Sie die Dateien und wählen Sie über das Mehr-Menü (drei Punkte) „PDF erstellen“. Die neue Datei erscheint im selben Ordner. Auch Fotos und Scans lassen sich so mit PDFs mischen.\n\nWer das regelmäßig braucht, kann in der App Kurzbefehle einen eigenen Ablauf mit der Aktion „PDF erstellen“ anlegen und ihn ins Teilen-Menü aufnehmen.\n\nDie Grenzen: Die Reihenfolge richtet sich nach Auswahl bzw. Sortierung, ein bequemes Umsortieren gibt es nicht. Wenn Sie Dateien gezielt anordnen möchten, ist ein Browser-Werkzeug in Safari komfortabler. Wie Sie Papierunterlagen mit dem iPhone direkt als PDF erfassen, zeigt der Ratgeber [Dokumente mit dem Handy scannen](blog:dokumente-mit-dem-handy-scannen-pdf).'
      },
      {
        heading: 'Kann Windows PDFs ohne Zusatzprogramm zusammenfügen?',
        content: 'Nein, Windows 10 und 11 können PDFs anzeigen und über „Microsoft Print to PDF“ erzeugen, aber nicht mehrere PDFs zu einer Datei verbinden. Der Druckertrick hilft hier nicht weiter, weil immer nur ein Dokument gedruckt wird. Auch Microsoft Edge zeigt PDFs nur an und bietet keine Funktion zum Kombinieren.\n\nStatt ein Zusatzprogramm zu installieren, öffnen Sie [PDF zusammenfügen](tool:pdf-zusammenfuegen) im Browser. Markieren Sie im Auswahldialog mehrere Dateien mit gedrückter Strg-Taste oder ziehen Sie sie direkt aus dem Explorer ins Browserfenster. Das funktioniert in Edge, Chrome und Firefox gleichermaßen.\n\nDer Vorteil gegenüber vielen kostenlosen Desktop-Programmen: Sie installieren keine Software mit unbekannten Zusatzkomponenten und benötigen keine Administratorrechte, was auf Firmenrechnern oft entscheidend ist.'
      },
      {
        heading: 'PDF auf Android zusammenfügen: Browser statt App-Suche',
        content: 'Android bringt keine allgemeine Funktion zum Zusammenfügen von PDFs mit. Die App „Files by Google“ und die meisten Hersteller-Dateimanager können PDFs öffnen und teilen, aber nicht kombinieren. Im Play Store finden sich zahlreiche PDF-Apps; manche zeigen Werbung, verlangen weitreichende Berechtigungen oder schicken Dateien zur Verarbeitung an einen Server.\n\nEinfacher ist es, die Browser-Lösung in Chrome oder einem anderen aktuellen Browser zu öffnen. Über die Dateiauswahl greifen Sie auf den Download-Ordner, Google Drive oder andere eingebundene Speicher zu. Nach dem Zusammenfügen landet die Datei im Download-Ordner.\n\nBei sehr großen Dokumenten kann ein Smartphone an Speichergrenzen stoßen. Teilen Sie die Arbeit dann auf oder nutzen Sie einen Computer. Wenn Sie nach dem Zusammenfügen noch Seiten verschieben möchten, hilft [PDF-Seiten neu anordnen](tool:pdf-seiten-neu-anordnen).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Falsche Reihenfolge nach der Finder- oder Dateien-App-Aktion:** Die Systeme sortieren nach Name oder Auswahl. Nummerieren Sie die Dateinamen oder sortieren Sie nachträglich, wie im Beitrag [PDF-Seiten sortieren](blog:pdf-seiten-sortieren-reihenfolge-aendern) beschrieben.\n- **Eine Datei wird abgelehnt:** Meist ist sie passwortgeschützt oder beschädigt.\n- **Ergebnis ist zu groß für die E-Mail:** Komprimieren Sie die fertige Datei im Anschluss.\n- **Datei nicht auffindbar:** Ein Download aus Safari landet auf dem iPhone standardmäßig im Ordner „Downloads“ der Dateien-App, unter Android und Windows im Download-Ordner.\n\nEine systemunabhängige Schritt-für-Schritt-Erklärung finden Sie in der [Anleitung zum PDF-Zusammenfügen](blog:pdf-zusammenfuegen-anleitung).\n\nUnabhängig vom System gilt: Arbeiten Sie mit Kopien Ihrer Originale und löschen Sie diese erst, wenn die zusammengefügte Datei vollständig und korrekt ist.'
      }
    ],
    faqs: [
      { question: 'Kann Windows 11 PDFs ohne Zusatzprogramm zusammenfügen?', answer: 'Nein, eine eingebaute Funktion dafür gibt es nicht. Ein Browser-Werkzeug ist die einfachste Alternative, weil Sie nichts installieren müssen.' },
      { question: 'Wird beim Zusammenfügen in der Mac-Vorschau die Originaldatei verändert?', answer: 'Ja, wenn Sie nach dem Hineinziehen einfach sichern, wird die zuerst geöffnete Datei überschrieben. Nutzen Sie „Als PDF exportieren“, um eine neue Datei anzulegen.' },
      { question: 'Funktioniert die Browser-Lösung auch auf dem iPad?', answer: 'Ja, in einem aktuellen Safari oder Chrome auf dem iPad funktioniert sie genauso wie am Computer. Die Dateien wählen Sie über die Dateien-App aus.' },
      { question: 'Gehen beim Zusammenfügen auf dem Handy Daten an einen Server?', answer: 'Bei Datei Tools nicht: Die Verarbeitung läuft im Browser auf Ihrem Gerät. Bei Apps aus dem Store sollten Sie in der Datenschutzerklärung prüfen, wie die Verarbeitung erfolgt.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-teilen-seiten-trennen',
    title: 'PDF teilen: Seiten trennen und Dokumente aufsplitten',
    metaTitle: 'PDF teilen und Seiten trennen | Datei Tools',
    metaDescription: 'PDF teilen leicht gemacht: große Dokumente nach Seitenbereichen aufsplitten oder jede Seite einzeln speichern – kostenlos im Browser, ohne Upload.',
    h1: 'PDF teilen: So trennen Sie Seiten und splitten große Dokumente auf',
    excerpt: 'Ein Sammelscan enthält mehrere Dokumente, ein Portal akzeptiert nur kleine Dateien oder Sie brauchen nur ein Kapitel? So teilen Sie eine PDF gezielt nach Seitenbereichen oder in Einzelseiten.',
    category: 'pdf',
    primaryKeyword: 'pdf teilen',
    secondaryKeywords: ['pdf seiten trennen', 'pdf aufteilen', 'pdf splitten', 'pdf in einzelne seiten teilen', 'pdf trennen kostenlos'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-teilen',
    ctaHeadline: 'PDF jetzt kostenlos teilen',
    ctaButtonLabel: 'PDF teilen',
    relatedToolSlugs: ['pdf-seiten-extrahieren', 'pdf-seiten-loeschen', 'pdf-komprimieren'],
    relatedArticleSlugs: ['pdf-seiten-loeschen-anleitung', 'pdf-zusammenfuegen-anleitung', 'pdf-unter-5-mb-verkleinern', 'warum-ist-meine-pdf-so-gross'],
    directAnswer: 'Eine PDF teilen Sie, indem Sie in einem Teilen-Werkzeug entweder einen Seitenbereich wie „1-3, 5“ als neue Datei speichern oder alle Seiten in Einzeldateien trennen. Das Original bleibt dabei unverändert, und die Seiten werden ohne Neuberechnung übernommen, Text und Bilder behalten also ihre Qualität.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die PDF aus, die Sie aufteilen möchten, oder ziehen Sie sie in das Browserfenster.' },
      { step: 2, title: 'Aufteilungsart festlegen', text: 'Entscheiden Sie, ob Sie einen Seitenbereich als neue Datei speichern oder alle Seiten einzeln trennen möchten. Notieren Sie sich vorher die Seitenzahlen, an denen ein neues Dokument beginnt.' },
      { step: 3, title: 'Teilen starten', text: 'Starten Sie die Verarbeitung. Ein Seitenbereich ergibt eine neue PDF; beim Trennen aller Seiten erhalten Sie die Einzeldateien gebündelt als ZIP-Archiv.' },
      { step: 4, title: 'Teile benennen und prüfen', text: 'Speichern Sie die Dateien und geben Sie ihnen aussagekräftige Namen. Für weitere Teile wiederholen Sie den Vorgang mit dem nächsten Seitenbereich und prüfen jede Datei kurz.' }
    ],
    sections: [
      {
        heading: 'Teilen, extrahieren oder löschen: Was ist der Unterschied?',
        content: 'Teilen, Extrahieren und Löschen verteilen Seiten unterschiedlich auf Dateien, ohne ihren Inhalt zu verändern:\n\n- **PDF teilen** zerlegt ein Dokument in mehrere Dateien, etwa in Kapitel oder Einzelseiten.\n- **Seiten extrahieren** holt nur bestimmte Seiten heraus und speichert sie als neue Datei. Dafür eignet sich [PDF-Seiten extrahieren](tool:pdf-seiten-extrahieren).\n- **Seiten löschen** entfernt einzelne Seiten, alles andere bleibt in einer Datei.\n\nWenn Sie aus einem 40-seitigen Vertrag nur die Unterschriftenseite brauchen, ist Extrahieren der direkte Weg. Besteht ein Sammelscan aus fünf Rechnungen, ist Teilen richtig: Speichern Sie jeden Bereich nacheinander als eigene Datei. Und wenn nur leere Seiten stören, lesen Sie die Anleitung [PDF-Seiten löschen](blog:pdf-seiten-loeschen-anleitung).\n\nIn allen drei Fällen werden die Seiten nicht neu berechnet, sondern nur anders auf Dateien verteilt.'
      },
      {
        heading: 'Wie gebe ich Seitenbereiche richtig an?',
        content: 'Seitenbereiche beziehen sich immer auf die physische Seitenzahl im Dokument: Die erste Seite der Datei ist Seite 1, unabhängig davon, welche Zahl auf dem Papier gedruckt ist. Bei Büchern oder Berichten mit römisch nummeriertem Vorspann weicht das häufig ab.\n\nBei Datei Tools geben Sie einen Bereich mit Bindestrich und einzelne Seiten mit Komma an, etwa „1-3, 5“. So gehen Sie am sichersten vor:\n\n1. Öffnen Sie die PDF in einem Viewer mit Miniaturansicht.\n2. Notieren Sie, auf welcher Seite jeweils ein neues Dokument beginnt.\n3. Leiten Sie daraus die Bereiche ab, zum Beispiel 1-2, 3-7 und 8-12, und speichern Sie jeden Bereich als eigene Datei.\n\nPrüfen Sie bei Scans vom Einzugsscanner, ob leere Rückseiten mitgescannt wurden. Diese verschieben sonst alle folgenden Grenzen um eine Seite.'
      },
      {
        heading: 'Werden geteilte PDFs automatisch kleiner?',
        content: 'Geteilte PDFs werden kleiner, aber nicht immer proportional zur Seitenzahl. Eine PDF mit 20 MB ergibt bei zwei Teilen nicht zwingend zweimal 10 MB: Gemeinsam genutzte Bestandteile wie eingebettete Schriften oder ein Firmenlogo auf jeder Seite müssen in jeder Teildatei erneut enthalten sein. Umgekehrt kann ein Teil mit vielen Fotos deutlich größer sein als ein Teil mit reinem Text.\n\nWenn es nur um die Dateigröße geht, ist Komprimieren oft die bessere Lösung, weil das Dokument zusammenbleibt. Hintergründe dazu liefert der Beitrag [Warum ist meine PDF so groß?](blog:warum-ist-meine-pdf-so-gross). Für feste Grenzen wie 5 MB hilft zusätzlich die Anleitung [PDF unter 5 MB verkleinern](blog:pdf-unter-5-mb-verkleinern).'
      },
      {
        heading: 'Reicht Teilen, um vertrauliche Seiten zu schützen?',
        content: 'Teilen ändert nur, welche Seiten in welcher Datei landen; den Inhalt einer weitergegebenen Seite schützt es nicht. Steht auf einer solchen Seite eine Kontonummer, die der Empfänger nicht sehen soll, müssen Sie diese Stelle zusätzlich schwärzen. Prüfen Sie vor dem Versand außerdem die Dokumenteigenschaften der Teildatei.\n\nHäufig werden genau die Dokumente geteilt, die persönliche Daten enthalten: Sammelscans von Kontoauszügen, Personalakten oder Gesundheitsunterlagen, aus denen nur ein Teil weitergegeben werden soll. Bei Datei Tools werden die Seiten direkt in Ihrem Browser verarbeitet, die PDF verlässt Ihr Gerät nicht.'
      },
      {
        heading: 'Typische Probleme beim Teilen',
        content: '- **Das Werkzeug verlangt ein Passwort oder meldet einen Fehler:** Die PDF ist verschlüsselt. Entsperren Sie sie zuerst mit dem Ihnen bekannten Kennwort.\n- **Die Teile haben falsche Grenzen:** Meist wurden gedruckte statt physischer Seitenzahlen verwendet.\n- **Formularfelder fehlen oder sind leer:** Interaktive Formulare können beim Aufteilen ihre Feldlogik verlieren. Flachen Sie ausgefüllte Formulare vorher ab.\n- **Zu viele Einzeldateien:** Speichern Sie statt aller Einzelseiten gezielt Seitenbereiche oder fügen Sie Teile anschließend wieder zusammen, wie in der [Anleitung zum Zusammenfügen](blog:pdf-zusammenfuegen-anleitung) beschrieben.\n\nBenennen Sie die Teildateien gleich nach dem Speichern sinnvoll, etwa „2026-03_Rechnung_Stadtwerke.pdf“. Bei Sammelscans mit vielen Belegen ersparen Sie sich so später langes Suchen.'
      }
    ],
    faqs: [
      { question: 'Verliert die PDF beim Teilen an Qualität?', answer: 'Nein. Die Seiten werden unverändert in neue Dateien übernommen. Texte bleiben durchsuchbar und Bilder behalten ihre Auflösung.' },
      { question: 'Kann ich eine PDF in gleich große Teile aufteilen?', answer: 'Ja, nach Seitenzahl: Speichern Sie nacheinander feste Bereiche, etwa 1-10, 11-20 und so weiter. Eine Aufteilung nach exakter Dateigröße ist dagegen schwierig, weil Seiten unterschiedlich viel Speicher belegen.' },
      { question: 'Wird die Original-PDF beim Teilen verändert?', answer: 'Nein. Es entstehen neue Dateien, die Ausgangsdatei bleibt unverändert auf Ihrem Gerät.' },
      { question: 'Wie teile ich eine PDF auf dem Mac ohne Zusatzprogramm?', answer: 'In der Vorschau können Sie Miniaturen markieren und auf den Schreibtisch ziehen, um daraus eine neue PDF zu erzeugen. Für viele Bereiche auf einmal ist ein Teilen-Werkzeug im Browser schneller.' },
      { question: 'Kann ich eine PDF auch auf dem Smartphone teilen?', answer: 'Ja. Das Browser-Werkzeug funktioniert auch auf iPhone und Android. Die Teildateien landen anschließend im Download-Ordner bzw. in der Dateien-App. Bei sehr großen Dokumenten kann ein Computer schneller sein, weil die Verarbeitung auf dem Gerät selbst stattfindet.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-seiten-loeschen-anleitung',
    title: 'PDF-Seiten löschen: Leere und unnötige Seiten entfernen',
    metaTitle: 'PDF-Seiten löschen – kostenlos im Browser | Datei Tools',
    metaDescription: 'Einzelne Seiten aus einer PDF löschen: leere Scan-Seiten, Werbung oder vertrauliche Anlagen entfernen – kostenlos, ohne Installation und ohne Upload.',
    h1: 'PDF-Seiten löschen: So entfernen Sie einzelne Seiten aus einem Dokument',
    excerpt: 'Leere Rückseiten aus dem Scanner, überflüssige AGB-Seiten oder eine Anlage, die nicht mitgeschickt werden soll: So löschen Sie Seiten aus einer PDF, ohne das restliche Dokument anzutasten.',
    category: 'pdf',
    primaryKeyword: 'pdf seiten löschen',
    secondaryKeywords: ['seite aus pdf entfernen', 'pdf seite löschen kostenlos', 'leere seiten aus pdf entfernen', 'pdf einzelne seiten löschen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-seiten-loeschen',
    ctaHeadline: 'Überflüssige PDF-Seiten jetzt entfernen',
    ctaButtonLabel: 'Seiten löschen',
    relatedToolSlugs: ['pdf-seiten-extrahieren', 'pdf-seiten-neu-anordnen', 'pdf-schwaerzen'],
    relatedArticleSlugs: ['pdf-teilen-seiten-trennen', 'pdf-richtig-schwaerzen', 'pdf-datei-verkleinern', 'pdf-seiten-sortieren-reihenfolge-aendern'],
    directAnswer: 'Um Seiten aus einer PDF zu löschen, öffnen Sie die Datei in einem Werkzeug zum Seitenlöschen, markieren die überflüssigen Seiten und speichern eine neue PDF ohne diese Seiten. Die übrigen Seiten bleiben inhaltlich unverändert, und die Originaldatei bleibt erhalten, falls Sie neu beginnen möchten.',
    steps: [
      { step: 1, title: 'PDF öffnen', text: 'Wählen Sie die PDF aus oder ziehen Sie sie in das Browserfenster. Die Seiten erscheinen als nummerierte Kacheln.' },
      { step: 2, title: 'Seiten markieren', text: 'Klicken Sie die Seiten an, die entfernt werden sollen, zum Beispiel 2, 5 und 9 bis 11. Wenn Sie unsicher sind, welche Nummer eine Seite hat, prüfen Sie das vorher in der Miniaturansicht eines PDF-Viewers.' },
      { step: 3, title: 'Neue PDF erzeugen', text: 'Starten Sie die Verarbeitung. Es entsteht eine neue Datei ohne die markierten Seiten, die Originaldatei bleibt erhalten.' },
      { step: 4, title: 'Kontrollieren und speichern', text: 'Blättern Sie das Ergebnis durch und prüfen Sie, ob die richtigen Seiten fehlen. Speichern Sie die Datei unter einem neuen Namen.' }
    ],
    sections: [
      {
        heading: 'Wann sollte man Seiten aus einer PDF löschen?',
        content: 'Seiten zu löschen ist sinnvoll, wenn ganze Seiten überflüssig sind oder nicht weitergegeben werden sollen. Typische Situationen sind:\n\n- **Leere Seiten aus dem Scanner:** Beim beidseitigen Scannen entstehen für unbedruckte Rückseiten leere oder fast leere Seiten.\n- **Überflüssige Standardseiten:** AGB, Werbeseiten oder Deckblätter, die der Empfänger nicht braucht.\n- **Vertrauliche Anlagen:** Ein Gutachten soll ohne die Seite mit Gesundheitsdaten weitergegeben werden.\n- **Doppelte Seiten:** Nach dem Zusammenfügen ist eine Seite zweimal vorhanden.\n\nWenn Sie ein Dokument in mehrere Dateien aufteilen möchten, ist die Anleitung [PDF teilen und Seiten trennen](blog:pdf-teilen-seiten-trennen) passender. Und wenn Sie nur wenige Seiten behalten wollen, ist es oft schneller, diese mit [PDF-Seiten extrahieren](tool:pdf-seiten-extrahieren) herauszuholen.'
      },
      {
        heading: 'Reicht Löschen, um vertrauliche Inhalte zu entfernen?',
        content: 'Für ganze Seiten ja: Eine gelöschte Seite ist in der neuen Datei vollständig verschwunden, samt Text, Bildern und Kommentaren dieser Seite.\n\nSind dagegen nur einzelne Stellen auf einer Seite vertraulich, etwa eine IBAN oder ein Name, hilft Löschen nicht weiter. Ein schwarzer Kasten aus einem Zeichenwerkzeug genügt ebenfalls nicht, weil der Text darunter erhalten bleibt. Für solche Fälle brauchen Sie eine echte Schwärzung. Warum das so ist und wie Sie das Ergebnis prüfen, erklärt der Ratgeber [PDF richtig schwärzen](blog:pdf-richtig-schwaerzen).\n\nBeachten Sie außerdem: Datei Tools legt beim Löschen eine neue Datei an. Lesezeichen des Originals werden dabei nicht übernommen, was bei umfangreichen Dokumenten mit Inhaltsverzeichnis auffallen kann.'
      },
      {
        heading: 'PDF-Seiten löschen auf Mac, Windows und Smartphone',
        content: 'Auf dem **Mac** geht es mit der Vorschau: Blenden Sie über „Darstellung > Miniaturen“ die Seitenleiste ein, markieren Sie die Seite und drücken Sie die Rückschritttaste. Anschließend sichern oder exportieren Sie die Datei.\n\nUnter **Windows** gibt es kein eingebautes Werkzeug zum Löschen von PDF-Seiten. Ein Umweg ist „Microsoft Print to PDF“: Sie drucken nur die gewünschten Seitenbereiche in eine neue PDF. Dabei können allerdings Links, Formularfelder und durchsuchbarer Text verloren gehen oder sich verändern, deshalb ist ein echtes Löschwerkzeug die sauberere Wahl.\n\nAuf dem **iPhone** öffnen Sie die PDF in der Dateien-App, blenden die Seitenminiaturen ein und löschen eine Seite über das Kontextmenü, das bei längerem Drücken erscheint. Unter **Android** hängt das von der installierten PDF-App ab. Ein Browser-Werkzeug funktioniert dagegen auf allen Geräten gleich und übernimmt die verbleibenden Seiten unverändert.'
      },
      {
        heading: 'Wird die PDF durch das Löschen kleiner?',
        content: 'In den meisten Fällen ja, denn die Inhalte der entfernten Seiten werden nicht mehr gespeichert. Wie viel Platz Sie sparen, hängt davon ab, was auf den Seiten war: Eine gescannte Seite mit Foto spart deutlich mehr als eine reine Textseite. Ressourcen, die auch auf anderen Seiten genutzt werden, etwa Schriften oder ein Logo, bleiben enthalten.\n\nWenn die Datei trotzdem zu groß ist, kombinieren Sie das Löschen mit einer Komprimierung. Wie das sinnvoll funktioniert, zeigt der Beitrag [PDF-Datei verkleinern](blog:pdf-datei-verkleinern).\n\nZum Datenschutz: Da Datei Tools lokal im Browser arbeitet, verlassen auch die Seiten, die Sie löschen möchten, Ihr Gerät nicht. Das ist wichtig, wenn Sie Seiten gerade wegen vertraulicher Inhalte entfernen.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Falsche Seite entfernt:** Da das Original erhalten bleibt, starten Sie einfach neu. Überschreiben Sie die Ausgangsdatei erst, wenn das Ergebnis stimmt.\n- **Seitennummern stimmen nicht mehr:** Aufgedruckte Seitenzahlen ändern sich beim Löschen nicht automatisch. Fügen Sie bei Bedarf neue Seitenzahlen ein.\n- **Reihenfolge passt danach nicht:** Verschieben Sie die verbliebenen Seiten mit einem Sortierwerkzeug, wie in [PDF-Seiten sortieren](blog:pdf-seiten-sortieren-reihenfolge-aendern) beschrieben.\n- **Datei ist geschützt:** Bei einem Öffnungs- oder Berechtigungspasswort müssen Sie den Schutz mit dem bekannten Kennwort aufheben, bevor Sie Seiten entfernen können.\n\nTipp: Wenn Sie regelmäßig Scans mit leeren Rückseiten erzeugen, prüfen Sie die Einstellungen Ihrer Scan-App oder Ihres Scanners. Viele bieten eine Option, leere Seiten automatisch zu überspringen.'
      }
    ],
    faqs: [
      { question: 'Kann ich mehrere Seiten auf einmal löschen?', answer: 'Ja. Klicken Sie alle Seiten an, die entfernt werden sollen, zum Beispiel 1, 4 und 10 bis 15. Erst beim Speichern entsteht die neue Datei ohne diese Seiten.' },
      { question: 'Lassen sich gelöschte Seiten wiederherstellen?', answer: 'Aus der neuen Datei nicht. Da das Original unverändert bleibt, können Sie aber jederzeit von vorn beginnen. Bewahren Sie die Ausgangsdatei auf, bis Sie sicher sind.' },
      { question: 'Bleibt der Text auf den übrigen Seiten durchsuchbar?', answer: 'Ja. Die verbleibenden Seiten werden nicht neu gerendert, Text, Links und Bildqualität bleiben erhalten.' },
      { question: 'Wie erkenne ich leere Scan-Seiten schnell?', answer: 'Am einfachsten in der Miniaturansicht eines PDF-Viewers. Fast leere Seiten mit etwas Durchschein-Effekt vom Papier sehen dort hellgrau aus und lassen sich gut erkennen. Notieren Sie sich deren Nummern und markieren Sie sie anschließend im Löschwerkzeug.' },
      { question: 'Kann ich eine versehentlich gelöschte Seite wieder einfügen?', answer: 'Ja, über das Original: Extrahieren Sie die benötigte Seite aus der Ausgangsdatei und fügen Sie sie mit dem bearbeiteten Dokument zusammen. Die Position korrigieren Sie danach mit einem Sortierwerkzeug.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-drehen-und-dauerhaft-speichern',
    title: 'PDF drehen und dauerhaft speichern: So bleibt es gedreht',
    metaTitle: 'PDF drehen und Drehung speichern | Datei Tools',
    metaDescription: 'PDF-Seiten drehen und die Drehung dauerhaft speichern, nicht nur in der Ansicht: So richten Sie Seiten in 90-Grad-Schritten aus – kostenlos und ohne Upload.',
    h1: 'PDF drehen und speichern: So bleibt die richtige Ausrichtung dauerhaft erhalten',
    excerpt: 'Sie haben die PDF im Viewer gedreht, doch beim nächsten Öffnen steht sie wieder auf dem Kopf? Hier erfahren Sie, warum das passiert und wie Sie einzelne oder alle Seiten dauerhaft richtig ausrichten.',
    category: 'pdf',
    primaryKeyword: 'pdf drehen und speichern',
    secondaryKeywords: ['pdf drehen dauerhaft', 'pdf seite drehen', 'pdf drehen und speichern kostenlos', 'gescannte pdf drehen', 'pdf querformat drehen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-drehen',
    ctaHeadline: 'PDF-Seiten dauerhaft richtig drehen',
    ctaButtonLabel: 'PDF drehen',
    relatedToolSlugs: ['pdf-seiten-neu-anordnen', 'pdf-durchsuchbar-machen', 'bild-drehen'],
    relatedArticleSlugs: ['pdf-seiten-sortieren-reihenfolge-aendern', 'bild-drehen-handyfoto-falsch-herum', 'gescannte-pdf-bearbeiten-ocr-verwenden', 'dokumente-mit-dem-handy-scannen-pdf'],
    directAnswer: 'Die Drehen-Schaltfläche vieler PDF-Viewer ändert nur die Anzeige, nicht die Datei. Damit eine PDF dauerhaft gedreht bleibt, muss die Seitenausrichtung in der Datei selbst geändert und neu gespeichert werden, etwa mit einem Werkzeug zum PDF-Drehen in 90-Grad-Schritten. Text und Bilder bleiben dabei unverändert.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die PDF aus oder ziehen Sie sie in das Browserfenster.' },
      { step: 2, title: 'Richtung wählen', text: 'Wählen Sie 90 Grad nach rechts, 90 Grad nach links oder 180 Grad. Das Werkzeug PDF drehen wendet die Drehung auf alle Seiten an; einzelne Seiten drehen Sie im Werkzeug PDF bearbeiten.' },
      { step: 3, title: 'Neue PDF speichern', text: 'Starten Sie die Verarbeitung und laden Sie die neue PDF herunter. Die Drehung ist jetzt in der Datei gespeichert.' },
      { step: 4, title: 'In einem anderen Programm testen', text: 'Öffnen Sie die Datei zur Kontrolle in einem anderen Viewer, etwa im Browser oder auf dem Smartphone. Stimmt die Ausrichtung dort, ist sie dauerhaft gespeichert.' }
    ],
    sections: [
      {
        heading: 'Warum wird die Drehung im PDF-Viewer nicht gespeichert?',
        content: 'Die Drehen-Schaltfläche in Programmen wie Acrobat Reader oder der PDF-Anzeige von Chrome und Edge dreht nur die Darstellung auf Ihrem Bildschirm. In Acrobat Reader heißt die Funktion deshalb ausdrücklich „Ansicht drehen“. Die Datei bleibt unverändert, und beim nächsten Öffnen oder beim Empfänger erscheint die Seite wieder falsch.\n\nTechnisch besitzt jede PDF-Seite eine Angabe zur Drehung, die laut PDF-Standard ein Vielfaches von 90 Grad sein muss. Ein Drehwerkzeug ändert diesen Wert und speichert ihn in der Datei. Der Seiteninhalt selbst wird dabei nicht neu berechnet: Text bleibt Text, und Bilder behalten ihre Qualität.'
      },
      {
        heading: 'Einzelne Seiten oder das ganze Dokument drehen?',
        content: 'Das Werkzeug PDF drehen von Datei Tools dreht alle Seiten eines Dokuments gemeinsam um 90 Grad nach links, nach rechts oder um 180 Grad. Das passt, wenn die ganze Datei falsch ausgerichtet ist, etwa ein Stapel, der verkehrt herum in den Einzug gelegt wurde.\n\nOft ist aber nur ein Teil des Dokuments betroffen:\n\n- **Querformatige Tabellen** in einem sonst hochformatigen Bericht\n- **Einzelne gescannte Seiten**, die verkehrt herum lagen\n- **Handyscans**, bei denen der Lagesensor die Ausrichtung falsch erkannt hat\n- **Zusammengefügte PDFs**, bei denen eine Quelldatei anders ausgerichtet war\n\nIn solchen Fällen drehen Sie gezielt einzelne Seiten im Werkzeug [PDF bearbeiten](tool:pdf-bearbeiten), das eine Drehfunktion pro Seite bietet. Wenn danach auch die Reihenfolge nicht stimmt, hilft die Anleitung [PDF-Seiten sortieren](blog:pdf-seiten-sortieren-reihenfolge-aendern).'
      },
      {
        heading: 'Kann man eine schief gescannte PDF begradigen?',
        content: 'Nicht durch Drehen: PDF-Seiten lassen sich nur in 90-Grad-Schritten drehen. Ist ein Blatt beim Scannen um wenige Grad schräg eingezogen worden, brauchen Sie eine Begradigungsfunktion, die viele Scan-Apps und Scannerprogramme als „Deskew“ oder automatische Ausrichtung anbieten. Am zuverlässigsten ist es, die Seite erneut gerade zu scannen.\n\nBei Fotos, die schief stehen, ist die Situation ähnlich. Mehr zur Ausrichtung von Bildern und der versteckten EXIF-Orientierung lesen Sie im Ratgeber [Bild drehen, wenn das Handyfoto falsch herum ist](blog:bild-drehen-handyfoto-falsch-herum).\n\nWichtig für die Texterkennung: OCR-Programme arbeiten deutlich besser mit korrekt ausgerichteten Seiten. Drehen Sie gescannte PDFs deshalb, bevor Sie sie [durchsuchbar machen](tool:pdf-durchsuchbar-machen).'
      },
      {
        heading: 'PDF dauerhaft drehen auf Mac, Windows und Smartphone',
        content: 'Auf dem **Mac** speichert die Vorschau Drehungen dauerhaft: Seite in der Miniaturleiste markieren, mit Befehlstaste+R nach rechts oder Befehlstaste+L nach links drehen und anschließend sichern.\n\nUnter **Windows** gibt es keine eingebaute Möglichkeit, PDFs dauerhaft zu drehen. Die Drehtaste im Browser-Viewer wirkt in der Regel nur auf die Anzeige. Ein Browser-Werkzeug ist hier der direkte Weg.\n\nAuf **iPhone und iPad** können Sie in der Dateien-App eine PDF öffnen, die Miniaturen einblenden und einzelne Seiten über das Kontextmenü drehen. Unter **Android** hängt das von der installierten App ab.\n\nBei Datei Tools werden die Dateien unabhängig vom System lokal im Browser verarbeitet. Bei gescannten Ausweisen, Verträgen oder Arztbriefen entsteht so keine Kopie auf fremden Servern.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Seite erscheint nach dem Drehen wieder falsch:** Prüfen Sie, ob Sie die neue Datei geöffnet haben und nicht das Original.\n- **Text steht nach dem Drehen spiegelverkehrt:** Das ist durch Drehen nicht möglich. Vermutlich wurde das Blatt falsch herum gescannt oder fotografiert und muss neu erfasst werden.\n- **Querformat wird beim Drucken abgeschnitten:** Aktivieren Sie im Druckdialog die automatische Ausrichtung bzw. „An Seite anpassen“.\n- **Gescannter Text lässt sich nicht kopieren:** Drehen ändert daran nichts. Dafür benötigen Sie Texterkennung, wie im Beitrag [gescannte PDF mit OCR bearbeiten](blog:gescannte-pdf-bearbeiten-ocr-verwenden) erklärt.\n\nWenn mehrere Dokumente betroffen sind, drehen Sie jede Datei einzeln und fügen Sie sie erst danach zusammen. So behalten Sie den Überblick, welche Seiten bereits korrigiert sind.'
      }
    ],
    faqs: [
      { question: 'Verliert eine PDF beim Drehen an Qualität?', answer: 'Nein. Beim Drehen wird nur die Ausrichtungsangabe der Seite geändert. Inhalte werden nicht neu berechnet, daher bleibt die Qualität vollständig erhalten.' },
      { question: 'Kann ich nur eine einzelne Seite drehen?', answer: 'Ja, im Werkzeug PDF bearbeiten können Sie jede Seite einzeln drehen. PDF drehen dreht dagegen alle Seiten des Dokuments gemeinsam. Auf Mac und iPhone geht das auch mit Vorschau bzw. Dateien-App.' },
      { question: 'Warum ist meine PDF beim Empfänger wieder verdreht?', answer: 'Wahrscheinlich haben Sie nur die Ansicht gedreht. Speichern Sie die Drehung mit einem Werkzeug, das die Seitenausrichtung in der Datei ändert, und verschicken Sie die neue Datei.' },
      { question: 'Lässt sich eine PDF um 45 Grad drehen?', answer: 'Nein. Die Seitendrehung einer PDF ist im Standard auf Vielfache von 90 Grad festgelegt. Für kleine Schieflagen brauchen Sie eine Begradigungsfunktion beim Scannen oder einen erneuten, geraden Scan.' },
      { question: 'Kann ich eine PDF auf dem Handy dauerhaft drehen?', answer: 'Ja. Auf dem iPhone geht das in der Dateien-App über die Seitenminiaturen, auf allen Geräten mit einem Browser-Werkzeug. Speichern Sie die neue Datei und öffnen Sie sie zur Kontrolle erneut, um sicherzugehen, dass die Drehung übernommen wurde.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-seiten-sortieren-reihenfolge-aendern',
    title: 'PDF-Seiten sortieren: Reihenfolge einfach ändern',
    metaTitle: 'PDF-Seiten sortieren & Reihenfolge ändern | Datei Tools',
    metaDescription: 'PDF-Seiten neu sortieren, falsch gescannte Seiten verschieben und beidseitig gescannte Stapel ordnen – kostenlos im Browser und ohne Upload.',
    h1: 'PDF-Seiten sortieren: So ändern Sie die Reihenfolge in einer PDF',
    excerpt: 'Nach dem Scannen oder Zusammenfügen stimmt die Seitenfolge nicht? So bringen Sie PDF-Seiten in die richtige Reihenfolge – inklusive Trick für manuell beidseitig gescannte Stapel.',
    category: 'pdf',
    primaryKeyword: 'pdf seiten sortieren',
    secondaryKeywords: ['pdf seiten verschieben', 'pdf reihenfolge ändern', 'pdf seiten neu anordnen', 'pdf seiten umsortieren', 'duplex scan sortieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-seiten-neu-anordnen',
    ctaHeadline: 'PDF-Seiten jetzt neu anordnen',
    ctaButtonLabel: 'Seiten sortieren',
    relatedToolSlugs: ['pdf-zusammenfuegen', 'pdf-drehen', 'pdf-seiten-loeschen'],
    relatedArticleSlugs: ['pdf-zusammenfuegen-anleitung', 'pdf-seitenzahlen-einfuegen', 'pdf-drehen-und-dauerhaft-speichern', 'pdf-seiten-loeschen-anleitung'],
    directAnswer: 'Um PDF-Seiten zu sortieren, öffnen Sie die Datei in einem Werkzeug zum Neuanordnen, verschieben die Seiten an die richtige Position und speichern eine neue PDF. Die Seiteninhalte bleiben dabei unverändert, nur ihre Reihenfolge im Dokument ändert sich.',
    steps: [
      { step: 1, title: 'PDF öffnen', text: 'Wählen Sie die PDF aus oder ziehen Sie sie in das Browserfenster. Alle Seiten werden als nummerierte Kacheln angezeigt.' },
      { step: 2, title: 'Seiten verschieben', text: 'Verschieben Sie die Seiten mit den Pfeilen unter den Kacheln nach links oder rechts. Da die Kacheln Seitennummern statt Vorschaubildern zeigen, notieren Sie die Zielreihenfolge am besten vorher anhand eines PDF-Viewers.' },
      { step: 3, title: 'Ergebnis speichern', text: 'Erzeugen Sie die neue PDF und laden Sie sie herunter. Das Original bleibt erhalten, falls Sie noch einmal neu beginnen möchten.' },
      { step: 4, title: 'Durchblättern', text: 'Prüfen Sie das Dokument einmal vollständig, besonders an den Stellen, an denen Sie Seiten verschoben haben.' }
    ],
    sections: [
      {
        heading: 'Warum gerät die Seitenreihenfolge durcheinander?',
        content: 'Eine falsche Seitenreihenfolge entsteht meist beim Scannen oder Zusammenfügen. Häufige Ursachen sind:\n\n- **Scannen in mehreren Durchgängen**, wenn der Einzug nur einen Teil des Stapels fasst\n- **Manuelles beidseitiges Scannen** mit einem Scanner ohne Duplex-Funktion\n- **Zusammengefügte Dateien**, bei denen eine Anlage an der falschen Stelle gelandet ist\n- **Nachgereichte Seiten**, etwa eine unterschriebene Seite, die die alte ersetzen soll\n\nIn allen Fällen müssen Sie die Seiten nicht neu scannen. Ein Sortierwerkzeug verschiebt die vorhandenen Seiten, ohne sie neu zu berechnen. Wenn Sie mehrere Dateien erst kombinieren müssen, beginnen Sie mit der [Anleitung zum PDF-Zusammenfügen](blog:pdf-zusammenfuegen-anleitung) und sortieren danach.'
      },
      {
        heading: 'Wie sortiere ich manuell beidseitig gescannte Seiten?',
        content: 'Manuell beidseitig gescannte Stapel sortieren Sie, indem Sie abwechselnd eine Seite von vorn und eine von hinten nehmen. Ohne Duplex-Scanner scannt man oft erst alle Vorderseiten, dreht den Stapel um und scannt dann die Rückseiten. Je nachdem, wie der Stapel umgedreht wird, liegen die Rückseiten danach in umgekehrter Reihenfolge vor.\n\nBeispiel mit drei Blättern: Die Datei enthält Vorderseite 1, 2, 3 und anschließend Rückseite 3, 2, 1. Die richtige Reihenfolge erhalten Sie, wenn Sie die Seiten so anordnen:\n\n1. Seite 1 (Vorderseite Blatt 1)\n2. Seite 6 (Rückseite Blatt 1)\n3. Seite 2 (Vorderseite Blatt 2)\n4. Seite 5 (Rückseite Blatt 2)\n5. Seite 3 (Vorderseite Blatt 3)\n6. Seite 4 (Rückseite Blatt 3)\n\nSteht eine Rückseite zusätzlich auf dem Kopf, drehen Sie sie mit einem Drehwerkzeug wie [PDF drehen](tool:pdf-drehen). Leere Rückseiten entfernen Sie am besten im selben Zug.'
      },
      {
        heading: 'In welcher Reihenfolge sollte man eine PDF bearbeiten?',
        content: 'Seitenzahlen und Komprimierung gehören ans Ende, Zusammenfügen und Sortieren an den Anfang. Bewährt hat sich diese Reihenfolge:\n\n1. Dateien zusammenfügen\n2. Überflüssige oder leere Seiten löschen\n3. Seiten drehen und sortieren\n4. Seitenzahlen, Kopf- oder Fußzeilen einfügen\n5. Zum Schluss komprimieren und gegebenenfalls schützen\n\nSeitenzahlen sollten erst ganz am Ende hinzukommen, weil sie als fester Text auf die Seite geschrieben werden und sich beim späteren Umsortieren nicht anpassen. Wie Sie das richtig machen, zeigt der Ratgeber [Seitenzahlen in PDF einfügen](blog:pdf-seitenzahlen-einfuegen). Falls Sie beim Sortieren auch Seiten wegnehmen möchten, hilft die Anleitung [PDF-Seiten löschen](blog:pdf-seiten-loeschen-anleitung).\n\nDiese Reihenfolge ist keine starre Regel, verhindert aber die häufigsten Fehler: doppelte Arbeit nach einer Komprimierung und Seitenzahlen, die nach dem Verschieben nicht mehr stimmen.'
      },
      {
        heading: 'PDF-Seiten sortieren auf Mac, Windows, iPhone und Android',
        content: 'Auf dem **Mac** können Sie in der Vorschau die Miniaturleiste einblenden und Seiten per Maus verschieben. Das funktioniert gut, bei sehr langen Dokumenten ist das Scrollen in der schmalen Leiste aber mühsam.\n\n**Windows** bietet keine eingebaute Funktion zum Umsortieren von PDF-Seiten. Auch auf **iPhone und Android** fehlt eine komfortable Bordfunktion weitgehend.\n\nEin Browser-Werkzeug funktioniert auf allen Systemen gleich: Am Computer klicken, auf Tablet und Smartphone tippen Sie auf die Pfeile unter den Seitenkacheln. Für längere Dokumente ist ein größerer Bildschirm angenehmer.\n\nDa die Verarbeitung bei Datei Tools lokal im Browser erfolgt, bleiben auch vertrauliche Unterlagen wie Steuerbescheide oder Vertragsentwürfe auf Ihrem Gerät.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Seiten schwer zuzuordnen:** Das Werkzeug zeigt Seitennummern statt Vorschaubildern. Öffnen Sie die PDF parallel in einem Viewer und notieren Sie die Zielreihenfolge.\n- **Lesezeichen fehlen:** Beim Neuanordnen entsteht eine neue Datei, Lesezeichen des Originals werden dabei nicht übernommen.\n- **Aufgedruckte Seitenzahlen sind jetzt falsch:** Die alten Zahlen gehören zum Seiteninhalt. Sie lassen sich nur durch Schwärzen oder Neuerstellen entfernen; fügen Sie neue Zahlen nur bei Dokumenten ohne vorhandene Nummerierung ein.\n- **Seiten stehen quer:** Drehen Sie sie dauerhaft, wie im Beitrag [PDF drehen und dauerhaft speichern](blog:pdf-drehen-und-dauerhaft-speichern) beschrieben.\n\nTipp für lange Dokumente: Legen Sie vorher fest, welche Seiten sich bewegen müssen, und verschieben Sie nur diese. Alle übrigen Seiten behalten ihre Reihenfolge.'
      }
    ],
    faqs: [
      { question: 'Verändert das Sortieren den Inhalt der Seiten?', answer: 'Nein. Nur die Reihenfolge im Dokument ändert sich. Text, Bilder und Links der einzelnen Seiten bleiben unverändert.' },
      { question: 'Kann ich Seiten aus zwei PDFs ineinander sortieren?', answer: 'Ja. Fügen Sie die Dateien zuerst zusammen und sortieren Sie die Seiten anschließend in der gemeinsamen Datei.' },
      { question: 'Gibt es eine Möglichkeit, die Reihenfolge komplett umzukehren?', answer: 'Eine eigene Umkehrfunktion bietet das Sortierwerkzeug von Datei Tools nicht. Bei kurzen Dokumenten ist das Verschieben schnell erledigt; bei langen Dokumenten ist ein PDF-Editor mit Umkehrfunktion bequemer.' },
      { question: 'Was ist ein Duplex-Scan?', answer: 'Beim Duplex-Scan erfasst der Scanner Vorder- und Rückseite eines Blatts in einem Durchgang. Ohne diese Funktion müssen Sie beide Seiten getrennt scannen und anschließend sortieren.' },
      { question: 'Kann ich PDF-Seiten auf dem Smartphone sortieren?', answer: 'Ja, im Browser-Werkzeug tippen Sie auf die Pfeile unter den Seitenkacheln, um Seiten zu verschieben. Bei langen Dokumenten ist das auf einem kleinen Bildschirm mühsam; ein Tablet oder Computer ist dann komfortabler. Die Verarbeitung erfolgt in beiden Fällen lokal auf dem Gerät.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-seitenzahlen-einfuegen',
    title: 'Seitenzahlen in PDF einfügen: Anleitung mit Praxistipps',
    metaTitle: 'Seitenzahlen in PDF einfügen | Datei Tools',
    metaDescription: 'Seitenzahlen nachträglich in eine PDF einfügen: Position, Format und Deckblatt richtig wählen. Kostenlos im Browser, ohne Installation und ohne Upload.',
    h1: 'Seitenzahlen in PDF einfügen: So nummerieren Sie Ihr Dokument richtig',
    excerpt: 'Ein zusammengestelltes Dokument braucht durchgehende Seitenzahlen? So fügen Sie Nummern nachträglich in eine PDF ein, legen Position und Startwert fest und vermeiden Überschneidungen mit vorhandenem Inhalt.',
    category: 'pdf',
    primaryKeyword: 'pdf seitenzahlen einfügen',
    secondaryKeywords: ['pdf seiten nummerieren', 'seitenzahlen in pdf hinzufügen', 'pdf nummerierung einfügen', 'pdf seitenzahl ab seite 2'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-seiten-nummerieren',
    ctaHeadline: 'Seitenzahlen jetzt in Ihre PDF einfügen',
    ctaButtonLabel: 'PDF nummerieren',
    relatedToolSlugs: ['pdf-fusszeile-hinzufuegen', 'pdf-kopfzeile-hinzufuegen', 'pdf-seiten-neu-anordnen'],
    relatedArticleSlugs: ['pdf-seiten-sortieren-reihenfolge-aendern', 'pdf-zusammenfuegen-anleitung', 'word-in-pdf-umwandeln-anleitung', 'pdf-bearbeiten-was-kann-man-aendern'],
    directAnswer: 'Um Seitenzahlen in eine PDF einzufügen, öffnen Sie die Datei in einem Nummerierungswerkzeug, wählen Position und Format, etwa „Seite 3 von 12“, und speichern eine neue PDF. Die Zahlen werden als fester Text auf die Seiten geschrieben, deshalb fügen Sie sie erst ein, wenn Reihenfolge und Umfang des Dokuments feststehen.',
    steps: [
      { step: 1, title: 'Fertige PDF auswählen', text: 'Wählen Sie die PDF aus, deren Seiten bereits vollständig und richtig sortiert sind.' },
      { step: 2, title: 'Position und Format festlegen', text: 'Bestimmen Sie, wo die Seitenzahl erscheinen soll, etwa unten mittig oder unten rechts, und welches Format sie haben soll, zum Beispiel „Seite 3 von 12“ oder nur die Zahl.' },
      { step: 3, title: 'Deckblatt festlegen', text: 'Legen Sie fest, ob die erste Seite ohne Zahl bleiben soll. Sie wird dabei mitgezählt, die erste sichtbare Nummer ist dann die 2.' },
      { step: 4, title: 'Speichern und prüfen', text: 'Erzeugen Sie die neue PDF und kontrollieren Sie stichprobenartig, ob die Zahlen gut lesbar sind und nichts überdecken.' }
    ],
    sections: [
      {
        heading: 'Wofür braucht man nachträgliche Seitenzahlen?',
        content: 'Seitenzahlen machen ein Dokument zitierfähig und erleichtern Rückfragen: „Siehe Anlage, Seite 14“ ist eindeutiger als „irgendwo im hinteren Teil“. Nachträglich eingefügt werden sie vor allem dann, wenn ein Dokument aus mehreren Quellen zusammengesetzt wurde:\n\n- Bewerbungsmappen mit Anschreiben, Lebenslauf und Zeugnissen\n- Anlagenkonvolute für Behörden, Versicherungen oder Anwälte\n- Sitzungsunterlagen und Handouts aus verschiedenen Präsentationen\n- Gescannte Akten ohne gedruckte Nummerierung\n\nWenn Sie ein Dokument selbst in Word schreiben, legen Sie die Seitenzahlen besser direkt dort über „Einfügen > Seitenzahl“ an und exportieren erst dann. Wie die Umwandlung sauber gelingt, beschreibt der Beitrag [Word in PDF umwandeln](blog:word-in-pdf-umwandeln-anleitung).'
      },
      {
        heading: 'Warum sollte man erst sortieren und dann nummerieren?',
        content: 'Eingefügte Seitenzahlen werden als fester Text auf die jeweilige Seite geschrieben. Wenn Sie danach Seiten löschen, ergänzen oder verschieben, stimmen die Zahlen nicht mehr und lassen sich nicht automatisch aktualisieren.\n\nNummerieren ist deshalb einer der letzten Arbeitsschritte. Fügen Sie zuerst alle Dateien zusammen, wie in der [Anleitung zum Zusammenfügen](blog:pdf-zusammenfuegen-anleitung) beschrieben, bringen Sie die Seiten in die richtige Reihenfolge und entfernen Sie überflüssige Seiten. Hinweise zum Umsortieren finden Sie im Ratgeber [PDF-Seiten sortieren](blog:pdf-seiten-sortieren-reihenfolge-aendern). Erst wenn der Umfang feststeht, kommen die Seitenzahlen hinzu. Danach komprimieren oder schützen Sie die Datei bei Bedarf.\n\nMüssen Sie nach dem Nummerieren noch eine Seite austauschen, beginnen Sie am besten mit der unnummerierten Fassung von vorn.'
      },
      {
        heading: 'Position, Deckblatt und Startnummer richtig wählen',
        content: 'Bewährt hat sich die Seitenzahl **unten mittig** oder **unten rechts**. Oben ist sie nur sinnvoll, wenn der untere Rand bereits durch Fußnoten oder Firmenangaben belegt ist. [PDF-Seiten nummerieren](tool:pdf-seiten-nummerieren) von Datei Tools bietet dafür Positionen unten links, mittig und rechts sowie oben mittig und rechts.\n\nBeim **Deckblatt** ist es üblich, es mitzuzählen, aber keine Zahl darauf zu drucken; die erste sichtbare Nummer ist dann die 2. Genau so arbeitet das Werkzeug, wenn Sie die erste Seite auslassen. Soll die Zählung erst auf der zweiten Seite mit 1 beginnen, nummerieren Sie die Seiten ohne Deckblatt separat und fügen das Deckblatt danach wieder davor.\n\nEin Format wie „Seite 3 von 12“ zeigt dem Leser zusätzlich, ob das Dokument vollständig ist. Das ist bei rechtlich relevanten Unterlagen ein Vorteil.\n\nWer neben der Zahl weitere Angaben wie Aktenzeichen, Datum oder Namen braucht, nutzt dafür besser eine [Fußzeile](tool:pdf-fusszeile-hinzufuegen) oder eine [Kopfzeile](tool:pdf-kopfzeile-hinzufuegen).'
      },
      {
        heading: 'Was tun, wenn die Seitenzahl Inhalte überdeckt?',
        content: 'Die Seitenzahl wird an eine feste Position gesetzt, ohne den vorhandenen Inhalt zu analysieren. Bei Dokumenten mit sehr schmalem Rand oder bei Scans, deren Text bis an den Blattrand reicht, kann sie deshalb auf Text oder Bildern landen.\n\nSo vermeiden Sie das:\n\n- Wählen Sie eine Position, an der in Ihrem Dokument sicher Platz ist, zum Beispiel unten rechts statt mittig.\n- Verringern Sie die Schriftgröße; das Werkzeug erlaubt Werte zwischen 7 und 14 Punkt.\n- Kontrollieren Sie Seiten mit vollflächigen Bildern oder Tabellen besonders.\n\nHat das Dokument bereits gedruckte Seitenzahlen, sollten Sie keine zweite Nummerierung darüberlegen. Das verwirrt mehr, als es hilft.\n\nBei doppelseitig gedruckten Dokumenten wird die Zahl gern abwechselnd außen platziert. Eine solche wechselnde Position bietet das Werkzeug nicht; wählen Sie in diesem Fall die Mitte.'
      },
      {
        heading: 'Funktioniert das Nummerieren auf jedem Gerät?',
        content: 'Ja, das Nummerieren im Browser funktioniert unter Windows, macOS und Linux ebenso wie auf iPhone, iPad und Android, solange ein aktueller Browser verwendet wird. Bei Dokumenten mit mehreren hundert Seiten ist ein Computer spürbar schneller als ein Smartphone.\n\nNummeriert werden oft genau die Unterlagen, die vertraulich sind: Gerichtsakten, Personalunterlagen oder medizinische Befunde. Bei Datei Tools bleiben diese Dateien auf Ihrem Gerät, weil die Seitenzahlen direkt im Browser in die PDF geschrieben werden.\n\nDie Vorschau unter macOS bietet keine Funktion zum Einfügen von Seitenzahlen, Windows ebenfalls nicht. Ein Browser-Werkzeug ist daher auch auf Desktop-Systemen meist der einfachste Weg.'
      }
    ],
    faqs: [
      { question: 'Kann ich die Seitenzahlen später wieder entfernen?', answer: 'Nicht ohne Weiteres, da sie fest in den Seiteninhalt geschrieben werden. Bewahren Sie deshalb die Originaldatei ohne Nummerierung auf.' },
      { question: 'Wie lasse ich das Deckblatt ohne Seitenzahl?', answer: 'Lassen Sie im Werkzeug die erste Seite von der Nummerierung aus. Sie wird mitgezählt, die erste sichtbare Zahl ist dann die 2. Soll die Zählung erst nach dem Deckblatt mit 1 beginnen, extrahieren Sie die Seiten ohne Deckblatt, nummerieren sie und fügen das Deckblatt danach wieder davor.' },
      { question: 'Bleibt der vorhandene Text durchsuchbar?', answer: 'Ja. Die Seitenzahl wird zusätzlich auf die Seite gesetzt, der übrige Inhalt bleibt unverändert und durchsuchbar.' },
      { question: 'Funktioniert das auch bei gescannten PDFs?', answer: 'Ja. Die Zahl wird über das Scanbild gelegt. Achten Sie bei Scans darauf, dass der Rand frei ist, damit die Nummer nichts verdeckt.' },
      { question: 'Was ist der Unterschied zwischen Seitenzahl und Fußzeile?', answer: 'Eine Seitenzahl ist eine fortlaufende Nummer pro Seite. Eine Fußzeile kann beliebigen Text enthalten, etwa Name, Datum oder Aktenzeichen, und steht auf jeder Seite gleich. Beides lässt sich kombinieren, solange sich die Positionen nicht überschneiden.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-wasserzeichen-einfuegen',
    title: 'PDF-Wasserzeichen einfügen: Dokumente kennzeichnen',
    metaTitle: 'Wasserzeichen in PDF einfügen | Datei Tools',
    metaDescription: 'Wasserzeichen wie „Entwurf“ oder „Kopie“ in PDFs einfügen: Text, Deckkraft und Ausrichtung wählen, Ausweiskopien kennzeichnen – kostenlos und ohne Upload.',
    h1: 'Wasserzeichen in PDF einfügen: So kennzeichnen Sie Entwürfe, Kopien und vertrauliche Dokumente',
    excerpt: 'Ein Wasserzeichen zeigt auf einen Blick, dass ein Dokument ein Entwurf, vertraulich oder nur für einen bestimmten Zweck bestimmt ist. Erfahren Sie, wie Sie es lesbar platzieren – und was ein Wasserzeichen nicht leisten kann.',
    category: 'pdf',
    primaryKeyword: 'pdf wasserzeichen einfügen',
    secondaryKeywords: ['wasserzeichen in pdf', 'pdf wasserzeichen hinzufügen', 'ausweiskopie wasserzeichen', 'pdf als entwurf kennzeichnen', 'pdf stempel vertraulich'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-wasserzeichen',
    ctaHeadline: 'Wasserzeichen jetzt in Ihre PDF einfügen',
    ctaButtonLabel: 'Wasserzeichen einfügen',
    relatedToolSlugs: ['pdf-abflachen', 'pdf-schwaerzen', 'pdf-schuetzen'],
    relatedArticleSlugs: ['pdf-mit-passwort-schuetzen', 'pdf-richtig-schwaerzen', 'pdf-metadaten-entfernen-vor-dem-versenden', 'pdf-bearbeiten-was-kann-man-aendern'],
    directAnswer: 'Ein Wasserzeichen fügen Sie ein, indem Sie die PDF in einem Wasserzeichen-Werkzeug öffnen, einen Text oder ein Bild wählen, Größe und Deckkraft festlegen und eine neue PDF speichern. Es kennzeichnet ein Dokument sichtbar als Entwurf, Kopie oder vertraulich, ist aber kein Kopierschutz und lässt sich mit Bearbeitungsprogrammen unter Umständen entfernen.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Wasserzeichen-Werkzeug und wählen Sie die PDF aus, die gekennzeichnet werden soll.' },
      { step: 2, title: 'Text oder Bild festlegen', text: 'Geben Sie den Wasserzeichentext ein, etwa „ENTWURF“ oder „Kopie für Mietbewerbung, Mai 2026“, oder wählen Sie ein Logo als PNG- oder JPG-Bild.' },
      { step: 3, title: 'Darstellung anpassen', text: 'Stellen Sie Schrift- bzw. Bildgröße, Farbe und Deckkraft ein und wählen Sie, ob der Text diagonal oder waagerecht stehen soll. Der Inhalt darunter sollte gut lesbar bleiben.' },
      { step: 4, title: 'Speichern und kontrollieren', text: 'Erzeugen Sie die neue PDF, prüfen Sie die Lesbarkeit auf mehreren Seiten und bewahren Sie die Originaldatei ohne Wasserzeichen getrennt auf.' }
    ],
    sections: [
      {
        heading: 'Wofür eignet sich ein PDF-Wasserzeichen?',
        content: 'Ein Wasserzeichen ist eine sichtbare Kennzeichnung, die über dem Seiteninhalt liegt und den Status oder Zweck eines Dokuments zeigt. Typische Einsatzzwecke:\n\n- **Status kennzeichnen:** „Entwurf“, „Zur Abstimmung“ oder „Ungültig“ verhindert, dass eine Vorversion versehentlich als final gilt.\n- **Vertraulichkeit signalisieren:** „Vertraulich“ oder „Nur intern“ erinnert Empfänger an den Umgang mit dem Dokument.\n- **Zweck einer Kopie festhalten:** Bei Ausweis-, Gehalts- oder Kontoauszugskopien für Vermieter oder Banken.\n- **Urheberschaft zeigen:** Ein Logo oder Name auf Entwürfen, Portfolios und Angeboten.\n\nWenn es darum geht, Inhalte für bestimmte Empfänger unlesbar zu machen, ist ein Wasserzeichen das falsche Werkzeug. Dann brauchen Sie eine Schwärzung oder ein Passwort. Mehr dazu in den Ratgebern [PDF richtig schwärzen](blog:pdf-richtig-schwaerzen) und [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen).'
      },
      {
        heading: 'Wie kennzeichne ich eine Ausweiskopie richtig?',
        content: 'Eine Ausweiskopie kennzeichnen Sie am besten mit dem Vermerk „Kopie“ sowie Zweck, Empfänger und Datum. Wohnungsbewerbungen, Kontoeröffnungen oder Verträge verlangen oft Kopien von Ausweis, Gehaltsnachweisen oder Kontoauszügen. Gerät eine solche Kopie in falsche Hände, kann sie für Identitätsmissbrauch genutzt werden. Ein Wasserzeichen wie „Kopie nur für Mietbewerbung Musterstraße 5, 05/2026“ macht sie für andere Zwecke deutlich weniger brauchbar.\n\nFür den Personalausweis schreibt das Personalausweisgesetz zudem vor, dass eine Ablichtung eindeutig und dauerhaft als Kopie erkennbar sein muss. Ein deutlicher Vermerk wie „KOPIE“ erfüllt diesen Zweck.\n\nAngaben, die der Empfänger nicht benötigt, können Sie zusätzlich unkenntlich machen. Nutzen Sie dafür ein echtes [Schwärzungswerkzeug](tool:pdf-schwaerzen) und nicht nur einen aufgemalten Balken.\n\nVerwenden Sie für jede Weitergabe eine eigene, passend gekennzeichnete Kopie. Taucht eine Kopie später an unerwarteter Stelle auf, lässt sich so nachvollziehen, aus welcher Weitergabe sie stammt.'
      },
      {
        heading: 'Wie sollte ein Wasserzeichen aussehen?',
        content: 'Ein gutes Wasserzeichen ist deutlich sichtbar, ohne den Inhalt unbrauchbar zu machen. Bewährt haben sich:\n\n- **Diagonale Ausrichtung** über die Seitenmitte, weil sie sich schwer wegschneiden lässt\n- **Geringe Deckkraft** von etwa 20 bis 40 Prozent, damit der Text darunter lesbar bleibt\n- **Graue oder gedeckte Farbe** statt kräftigem Rot, besonders bei Dokumenten, die ausgedruckt werden\n- **Kurzer, eindeutiger Text**, denn lange Sätze werden auf der Diagonale schnell zu klein\n\nTesten Sie das Ergebnis auch auf Seiten mit Tabellen oder Fotos. Bei dunklen Bildbereichen kann ein helles Wasserzeichen nahezu verschwinden, während es auf weißem Papier gut zu sehen ist. Für ein Logo eignet sich eine PNG-Datei mit transparentem Hintergrund, damit kein weißer Kasten entsteht.'
      },
      {
        heading: 'Wie sicher ist ein Wasserzeichen?',
        content: 'Ein Wasserzeichen ist eine Kennzeichnung, kein Schutzmechanismus. Datei Tools schreibt es direkt in den Seiteninhalt und nicht als Kommentar, sodass es sich nicht einfach anklicken und löschen lässt. Wer über ein geeignetes PDF-Bearbeitungsprogramm verfügt, kann ein nachträglich eingefügtes Wasserzeichen unter Umständen trotzdem entfernen. Auch ein Screenshot mit anschließender Bildbearbeitung ist denkbar, wenn auch aufwendig.\n\nEine absolute Garantie gibt es deshalb nicht. Für echte Vertraulichkeit kombinieren Sie das Wasserzeichen mit einem Öffnungspasswort.\n\nPrüfen Sie vor dem Versand außerdem die Dokumenteigenschaften: Der Autorname oder ein interner Dateititel verrät manchmal mehr als der sichtbare Inhalt. Wie Sie solche Angaben entfernen, zeigt der Beitrag [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden).'
      },
      {
        heading: 'Warum Ausweiskopien lokal gekennzeichnet werden sollten',
        content: 'Eine Ausweiskopie zum Schutz vor Missbrauch ausgerechnet bei einem unbekannten Onlinedienst zu bearbeiten, der die Datei auf seinen Servern verarbeitet, wäre widersinnig. Datei Tools fügt das Wasserzeichen direkt in Ihrem Browser ein; die Datei verlässt Ihr Gerät nicht.\n\nDas funktioniert auf dem Computer genauso wie auf dem Smartphone. Wenn Sie Ihren Ausweis mit dem Handy fotografiert haben, wandeln Sie das Foto zuerst in eine PDF um und fügen dann das Wasserzeichen hinzu. Speichern Sie die gekennzeichnete Kopie getrennt vom unmarkierten Original, damit Sie nicht versehentlich die falsche Datei verschicken.'
      }
    ],
    faqs: [
      { question: 'Kann ich ein Wasserzeichen nur auf bestimmten Seiten einfügen?', answer: 'Bei Datei Tools können Sie die erste Seite, etwa ein Deckblatt, auslassen; alle übrigen Seiten erhalten das Wasserzeichen. Für eine andere Auswahl teilen Sie die PDF, kennzeichnen den gewünschten Teil und fügen die Dateien anschließend wieder zusammen.' },
      { question: 'Lässt sich ein Wasserzeichen wieder entfernen?', answer: 'Mit passender Bearbeitungssoftware ist das bei nachträglich eingefügten Wasserzeichen oft möglich. Bewahren Sie deshalb immer das Original auf und betrachten Sie das Wasserzeichen nicht als Kopierschutz.' },
      { question: 'Was sollte auf einer Ausweiskopie stehen?', answer: 'Empfehlenswert sind der Vermerk „Kopie“, der Zweck, der Empfänger und das Datum. So ist die Kopie für andere Zwecke deutlich weniger brauchbar.' },
      { question: 'Wird die PDF durch ein Wasserzeichen größer?', answer: 'Ein Textwasserzeichen vergrößert die Datei kaum. Ein Bildwasserzeichen kann die Datei etwas größer machen, abhängig von der Bildgröße.' },
      { question: 'Funktioniert das Einfügen von Wasserzeichen auch auf dem Smartphone?', answer: 'Ja. Das Browser-Werkzeug läuft auch auf iPhone und Android. Sie können zum Beispiel eine mit dem Handy erstellte Ausweiskopie direkt kennzeichnen, ohne sie zuvor auf einen Computer zu übertragen. Die Verarbeitung erfolgt auf dem Gerät selbst.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-unterschreiben-ohne-drucken',
    title: 'PDF unterschreiben ohne Drucken: Was rechtlich gilt',
    metaTitle: 'PDF unterschreiben ohne Drucken | Datei Tools',
    metaDescription: 'PDF unterschreiben ohne Ausdrucken und Scannen: so fügen Sie Ihre Unterschrift ein und wann eine qualifizierte elektronische Signatur nötig ist.',
    h1: 'PDF unterschreiben ohne Drucken: Anleitung und rechtliche Einordnung',
    excerpt: 'Drucken, unterschreiben, scannen – das geht auch einfacher. Wir zeigen, wie Sie eine Unterschrift direkt in die PDF setzen, und erklären ehrlich, wann das genügt und wann eine qualifizierte elektronische Signatur nötig ist.',
    category: 'pdf',
    primaryKeyword: 'pdf unterschreiben',
    secondaryKeywords: ['pdf unterschreiben ohne drucken', 'unterschrift in pdf einfügen', 'pdf digital unterschreiben', 'elektronische unterschrift pdf', 'pdf am handy unterschreiben'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-unterschreiben',
    ctaHeadline: 'PDF jetzt ohne Drucker unterschreiben',
    ctaButtonLabel: 'PDF unterschreiben',
    relatedToolSlugs: ['pdf-signieren', 'pdf-abflachen', 'pdf-bearbeiten'],
    relatedArticleSlugs: ['pdf-bearbeiten-was-kann-man-aendern', 'pdf-laesst-sich-nicht-bearbeiten-ursachen-loesungen', 'dokumente-mit-dem-handy-scannen-pdf', 'pdf-mit-passwort-schuetzen'],
    directAnswer: 'Um eine PDF ohne Drucken zu unterschreiben, zeichnen oder tippen Sie Ihre Unterschrift in einem Unterschriften-Werkzeug, platzieren sie auf der Unterschriftslinie und speichern die Datei. Rechtlich ist das eine einfache elektronische Signatur: Sie genügt für viele formfreie Dokumente, ersetzt aber nicht die gesetzliche Schriftform, für die in der Regel eine qualifizierte elektronische Signatur oder Papier nötig ist.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug zum Unterschreiben und wählen Sie die PDF aus. Füllen Sie Formularfelder am besten vorher aus.' },
      { step: 2, title: 'Unterschrift erstellen', text: 'Zeichnen Sie Ihre Unterschrift mit Maus, Touchpad, Stift oder Finger, tippen Sie Ihren Namen oder wählen Sie ein Foto Ihrer Unterschrift aus. Auf Tablet und Smartphone gelingt das Zeichnen meist natürlicher als mit der Maus.' },
      { step: 3, title: 'Platzieren und skalieren', text: 'Wählen Sie die Seite, setzen Sie die Unterschrift auf die Unterschriftslinie und passen Sie die Größe an, sodass sie zu den übrigen Angaben passt.' },
      { step: 4, title: 'Speichern und nicht mehr ändern', text: 'Speichern Sie die unterschriebene PDF unter einem neuen Namen. Nehmen Sie danach keine inhaltlichen Änderungen mehr vor.' }
    ],
    sections: [
      {
        heading: 'Welche Arten elektronischer Signaturen gibt es nach eIDAS?',
        content: 'Die EU-Verordnung über elektronische Identifizierung und Vertrauensdienste (eIDAS) unterscheidet drei Stufen elektronischer Signaturen. Welche davon nötig ist, hängt davon ab, welche Form das Gesetz oder der Empfänger verlangt.\n\n| Stufe | Typisches Beispiel | Ersetzt die Schriftform? |\n|---|---|---|\n| Einfache elektronische Signatur | eingefügtes Unterschriftsbild, getippter Name | nein |\n| Fortgeschrittene elektronische Signatur | zertifikatsbasierte Signatur, die Änderungen erkennbar macht | nein |\n| Qualifizierte elektronische Signatur (QES) | Signatur mit qualifiziertem Zertifikat eines Vertrauensdiensteanbieters | ja, sofern nicht gesetzlich ausgeschlossen |\n\n- **Einfach** ist jede elektronische Form, mit der jemand ein Dokument als seines kennzeichnet. Genau das entsteht, wenn Sie eine Unterschrift in eine PDF zeichnen.\n- **Fortgeschritten** ist eine Signatur, die eindeutig einer Person zugeordnet ist, unter deren alleiniger Kontrolle erstellt wird und nachträgliche Änderungen am Dokument erkennbar macht.\n- **Qualifiziert** ist eine fortgeschrittene Signatur, die zusätzlich auf einem qualifizierten Zertifikat beruht und mit einer qualifizierten Signaturerstellungseinheit erzeugt wird. Sie hat nach eIDAS die gleiche Rechtswirkung wie eine handschriftliche Unterschrift.\n\nFür eine QES brauchen Sie einen qualifizierten Vertrauensdiensteanbieter, der Ihre Identität prüft, etwa per Video-Ident oder Online-Ausweisfunktion. Ein Werkzeug wie Datei Tools, das ein Unterschriftsbild in die PDF setzt, erzeugt ausschließlich einfache elektronische Signaturen.'
      },
      {
        heading: 'Wann reicht eine eingefügte Unterschrift?',
        content: 'Eine eingefügte Unterschrift reicht, wenn das Gesetz keine bestimmte Form vorschreibt und der Empfänger sie akzeptiert. Das gilt für die meisten Verträge des Alltags; entscheidend ist dann eher, ob Sie im Streitfall beweisen können, dass Sie unterschrieben haben. Typische Fälle, in denen eine eingefügte Unterschrift in der Praxis genügt:\n\n- Auftragsbestätigungen, Angebote und Bestellungen\n- Einverständniserklärungen für Schule oder Verein\n- Interne Freigaben und Formulare\n- Dokumente, für die nur Textform verlangt ist\n\n**Nicht ausreichend** ist sie, wenn das Gesetz die Schriftform verlangt. Diese kann nach § 126a BGB grundsätzlich durch die elektronische Form mit einer QES ersetzt werden. Für manche Erklärungen ist die elektronische Form jedoch ausgeschlossen, etwa für die Kündigung eines Arbeitsverhältnisses (§ 623 BGB); sie müssen auf Papier eigenhändig unterschrieben werden. Im Zweifel fragen Sie beim Empfänger nach oder holen rechtlichen Rat ein. Dieser Beitrag ersetzt keine Rechtsberatung.'
      },
      {
        heading: 'Wie sieht eine digitale Unterschrift sauber aus?',
        content: 'Eine saubere digitale Unterschrift entsteht am ehesten mit Touchscreen, Stift oder einem Foto der echten Unterschrift; mit der Maus gezeichnet wirkt sie oft zittrig. Bewährt haben sich:\n\n- **Touchscreen oder Stift nutzen:** Auf Tablet oder Smartphone fällt die Unterschrift natürlicher aus.\n- **Unterschrift abfotografieren:** Unterschreiben Sie mit dunklem Stift auf weißem Papier, fotografieren Sie das Blatt bei gutem Licht und wählen Sie das Foto im Werkzeug aus. Den weißen Papierhintergrund kann das Werkzeug dabei transparent machen.\n- **Größe anpassen:** Die Unterschrift sollte etwa so groß sein wie auf Papier und nicht über das Feld hinausragen.\n\nOptional setzt das Werkzeug, ebenso wie [PDF signieren](tool:pdf-signieren), unter die Unterschrift einen sichtbaren Prüfvermerk mit Name, Datum und Uhrzeit, Grund und einer gekürzten SHA-256-Prüfsumme der Originaldatei. Datum und Uhrzeit stammen von Ihrem Gerät. Der Vermerk hilft nachzuvollziehen, welche Fassung Sie unterschrieben haben, ist aber keine kryptografische Signatur und macht spätere Änderungen nicht automatisch erkennbar.'
      },
      {
        heading: 'PDF unterschreiben mit Bordmitteln auf Mac, iPhone, Windows und Android',
        content: 'Auf dem **Mac** bietet die Vorschau in den Markierungswerkzeugen die Funktion „Signieren“. Dort erfassen Sie die Unterschrift per Trackpad oder halten ein unterschriebenes Blatt vor die Kamera. Auf **iPhone und iPad** öffnen Sie die PDF in der Dateien-App, tippen auf das Markieren-Symbol und fügen über das Plus-Symbol eine Signatur hinzu.\n\nUnter **Windows** gibt es keine eigene Unterschriftenfunktion. Der PDF-Viewer in Microsoft Edge erlaubt zwar freihändiges Zeichnen, mit der Maus sieht das Ergebnis aber selten gut aus. Auf **Android** hängt es von der installierten PDF-App ab.\n\nEin Browser-Werkzeug funktioniert auf allen Geräten gleich. Wenn sich die PDF nicht bearbeiten lässt, weil sie Berechtigungen einschränkt oder beschädigt ist, hilft der Beitrag [PDF lässt sich nicht bearbeiten](blog:pdf-laesst-sich-nicht-bearbeiten-ursachen-loesungen) weiter.'
      },
      {
        heading: 'Was ist nach dem Unterschreiben zu beachten?',
        content: 'Nach dem Unterschreiben sollten Sie das Dokument inhaltlich nicht mehr ändern, denn jede spätere Änderung schwächt die Aussagekraft der Unterschrift. Unterschreiben Sie deshalb immer zuletzt.\n\nDatei Tools zeichnet die Unterschrift direkt in den Seiteninhalt; sie liegt also nicht als verschiebbarer Kommentar auf der Seite. Haben Sie vorher Formularfelder ausgefüllt, können Sie die Datei zusätzlich [abflachen](tool:pdf-abflachen), damit die Eingaben fest in die Seite übernommen werden.\n\nZum Datenschutz: Ihre Unterschrift ist ein sensibles Merkmal. Bei Datei Tools wird sie im Browser erzeugt und direkt in Ihre PDF geschrieben; weder Unterschrift noch Dokument verlassen Ihr Gerät. Enthält der Vertrag vertrauliche Daten, können Sie ihn vor dem Versand zusätzlich verschlüsseln, wie im Ratgeber [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen) beschrieben.'
      }
    ],
    faqs: [
      { question: 'Ist eine eingefügte Unterschrift in einer PDF rechtsgültig?', answer: 'Sie ist eine einfache elektronische Signatur und für viele formfreie Verträge ausreichend, sofern der Empfänger sie akzeptiert. Wo das Gesetz die Schriftform verlangt, genügt sie nicht. Dort ist eine qualifizierte elektronische Signatur nötig oder, wenn die elektronische Form ausgeschlossen ist, die eigenhändige Unterschrift auf Papier.' },
      { question: 'Wie bekomme ich eine qualifizierte elektronische Signatur?', answer: 'Über einen qualifizierten Vertrauensdiensteanbieter, der Ihre Identität prüft, zum Beispiel per Online-Ausweisfunktion oder Video-Ident. Viele Anbieter rechnen pro Signatur oder im Abo ab.' },
      { question: 'Kann ich eine PDF auf dem Handy unterschreiben?', answer: 'Ja. Auf dem iPhone geht das mit der Dateien-App, auf allen Geräten mit einem Browser-Werkzeug. Mit dem Finger gelingt die Unterschrift oft natürlicher als mit der Maus.' },
      { question: 'Kann jemand meine eingefügte Unterschrift kopieren?', answer: 'Ja, grundsätzlich lässt sich ein Unterschriftsbild aus einer PDF herauslösen, genau wie aus einem Scan. Senden Sie unterschriebene Dokumente deshalb nur an vertrauenswürdige Empfänger und nutzen Sie für wichtige Verträge eine qualifizierte elektronische Signatur.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-in-jpg-umwandeln-anleitung',
    title: 'PDF in JPG umwandeln: Seiten als Bild speichern',
    metaTitle: 'PDF in JPG umwandeln: Seiten als Bild | Datei Tools',
    metaDescription: 'PDF in JPG umwandeln: jede Seite als Bild speichern, sinnvolle Auflösungen kennen und JPG oder PNG richtig einsetzen – kostenlos und ohne Upload.',
    h1: 'PDF in JPG umwandeln: So speichern Sie PDF-Seiten als Bilddateien',
    excerpt: 'Für Social Media, Präsentationen oder Portale, die nur Bilder annehmen, brauchen Sie PDF-Seiten als JPG. Hier erfahren Sie, welche Auflösung sinnvoll ist, wann PNG besser passt und was bei der Umwandlung verloren geht.',
    category: 'pdf',
    primaryKeyword: 'pdf in jpg umwandeln',
    secondaryKeywords: ['pdf als jpg speichern', 'pdf in bild umwandeln', 'pdf seite als bild speichern', 'pdf to jpg kostenlos', 'pdf in jpeg konvertieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-in-jpg-umwandeln',
    ctaHeadline: 'PDF-Seiten jetzt als JPG speichern',
    ctaButtonLabel: 'PDF in JPG umwandeln',
    relatedToolSlugs: ['pdf-in-png-umwandeln', 'bild-komprimieren', 'pdf-text-extrahieren'],
    relatedArticleSlugs: ['bilder-aus-pdf-extrahieren', 'jpg-oder-png-welches-bildformat-ist-besser', 'pdf-umwandeln-welche-formate-eignen-sich', 'foto-komprimieren-bilder-kleiner-machen'],
    directAnswer: 'Um eine PDF in JPG umzuwandeln, wählen Sie die Datei in einem Konvertierungswerkzeug aus; jede Seite wird gerendert und als eigenes JPG-Bild gespeichert. Für Bildschirm und Messenger genügt eine Auflösung um 150 dpi, für den Druck sind etwa 300 dpi üblich. Text ist im Bild nicht mehr markierbar oder durchsuchbar.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die PDF aus oder ziehen Sie sie in das Browserfenster.' },
      { step: 2, title: 'Seitenzahl prüfen', text: 'Das Werkzeug zeigt eine Vorschau der ersten Seite und die Seitenzahl an. Brauchen Sie nur einzelne Seiten, extrahieren Sie diese vorher in eine eigene PDF.' },
      { step: 3, title: 'Umwandlung starten', text: 'Jede Seite wird lokal gerendert und als JPG gespeichert. Bei vielen Seiten kann das je nach Gerät einen Moment dauern.' },
      { step: 4, title: 'Bilder speichern', text: 'Laden Sie das Ergebnis herunter: Eine einseitige PDF ergibt ein einzelnes JPG, bei mehrseitigen PDFs erhalten Sie alle Bilder gebündelt in einem ZIP-Archiv.' }
    ],
    sections: [
      {
        heading: 'Wofür braucht man PDF-Seiten als Bild?',
        content: 'PDF-Seiten als Bild braucht man überall dort, wo Programme oder Plattformen Bilder, aber keine PDFs anzeigen. Typische Gründe für die Umwandlung:\n\n- **Social Media und Messenger:** Ein Flyer oder eine Einladung als PDF wird dort nicht als Vorschau angezeigt, ein JPG schon.\n- **Präsentationen und Textdokumente:** Eine Seite als Bild lässt sich in PowerPoint oder Word frei platzieren und zuschneiden.\n- **Portale mit Bildpflicht:** Manche Formulare akzeptieren nur JPG oder PNG, zum Beispiel für Nachweise.\n- **Vorschaubilder:** Für Websites, Shops oder Dokumentationen.\n\nWenn Sie nicht die ganze Seite, sondern nur die darin enthaltenen Fotos brauchen, ist die Umwandlung der falsche Weg. Lesen Sie dazu den Ratgeber [Bilder aus PDF extrahieren](blog:bilder-aus-pdf-extrahieren).'
      },
      {
        heading: 'Welche Auflösung brauche ich für PDF-Seiten als Bild?',
        content: 'Die Auflösung bestimmt, wie viele Pixel das Bild einer PDF-Seite hat, denn die Seite selbst hat keine feste Pixelgröße. Angegeben wird sie in dpi (Punkte pro Zoll). Eine A4-Seite ergibt ungefähr diese Pixelmaße:\n\n- **72 dpi:** etwa 595 × 842 Pixel – reicht für kleine Vorschaubilder\n- **150 dpi:** etwa 1240 × 1754 Pixel – gut für Bildschirm, Messenger und Präsentationen\n- **300 dpi:** etwa 2480 × 3508 Pixel – für den Druck und gut lesbares Kleingedrucktes\n\nDatei Tools rendert jede Seite mit doppelter Grundauflösung. Das entspricht etwa 144 dpi oder rund 1190 × 1680 Pixeln bei A4 und passt für Bildschirm, Messenger und Präsentationen. Für einen Druck mit 300 dpi brauchen Sie ein Programm mit einstellbarer Auflösung.\n\nMehr Auflösung bedeutet größere Dateien. Ist die JPG-Datei am Ende zu groß, können Sie sie mit [Bild komprimieren](tool:bild-komprimieren) verkleinern, ohne die Umwandlung zu wiederholen. Bei Seiten in anderen Formaten wie A3 oder US-Letter ändern sich die Pixelmaße entsprechend der Papiergröße.'
      },
      {
        heading: 'JPG oder PNG: Welches Format passt zu Ihrer PDF?',
        content: 'JPG eignet sich für Seiten mit Fotos und Farbverläufen, PNG für Seiten mit Text, Tabellen und Linien. Die wichtigsten Unterschiede:\n\n| Kriterium | JPG | PNG |\n|---|---|---|\n| Kompression | verlustbehaftet | verlustfrei |\n| Schrift und feine Linien | leichte Artefakte an Kanten | scharf |\n| Dateigröße bei Fotos | klein | deutlich größer |\n| Transparenz | nicht möglich | möglich |\n\nFür textlastige Seiten ist deshalb [PDF in PNG umwandeln](tool:pdf-in-png-umwandeln) oft die bessere Wahl. Eine ausführlichere Gegenüberstellung finden Sie im Beitrag [JPG oder PNG – welches Bildformat ist besser?](blog:jpg-oder-png-welches-bildformat-ist-besser).\n\nDa JPG keine Transparenz kennt, werden transparente Bereiche einer PDF-Seite beim Umwandeln weiß dargestellt.'
      },
      {
        heading: 'Was geht bei der Umwandlung in JPG verloren?',
        content: 'Ein Bild ist eine Momentaufnahme der Seite, deshalb gehen alle interaktiven und textbezogenen Eigenschaften der PDF verloren:\n\n- **Text** ist nicht mehr markierbar, durchsuchbar oder kopierbar.\n- **Links** und Formularfelder funktionieren nicht mehr.\n- **Vektorgrafiken** sind nicht mehr verlustfrei skalierbar; beim starken Vergrößern wird das Bild pixelig.\n- **Mehrere Seiten** werden zu mehreren Dateien.\n\nBrauchen Sie den Text weiterhin, ist ein anderer Weg sinnvoller, etwa [Text aus PDF extrahieren](tool:pdf-text-extrahieren) oder die Umwandlung in ein Word-Dokument.\n\nZum Datenschutz: Bei Datei Tools rendert Ihr Browser die Seiten selbst, die PDF wird nicht an einen Server übertragen. Bei sehr langen Dokumenten braucht ein Smartphone dafür länger als ein Computer.'
      },
      {
        heading: 'PDF in JPG mit Bordmitteln und typische Probleme',
        content: 'Auf dem **Mac** kann die Vorschau eine PDF-Seite über „Ablage > Exportieren“ als JPEG speichern, allerdings jeweils nur die ausgewählte Seite. Unter **Windows** bleibt ohne Zusatzsoftware nur ein Screenshot, dessen Auflösung von Ihrem Bildschirm abhängt und für den Druck meist nicht reicht.\n\nTypische Probleme:\n\n- **Schrift wirkt unscharf:** Für Textseiten liefert PNG schärfere Kanten. Für mehr Pixel, etwa für den Druck, brauchen Sie ein Programm mit einstellbarer Auflösung.\n- **Zu viele Dateien:** Wandeln Sie nur die benötigten Seiten um, indem Sie sie vorher extrahieren.\n- **ZIP lässt sich nicht öffnen:** Unter Windows hilft „Alle extrahieren“ im Kontextmenü, auf dem Smartphone die Dateien-App.\n- **Farben wirken anders:** Druck-PDFs im CMYK-Farbraum werden für den Bildschirm umgerechnet, leichte Abweichungen sind normal.'
      }
    ],
    faqs: [
      { question: 'Wird jede PDF-Seite zu einem eigenen Bild?', answer: 'Ja. Jede Seite ergibt ein separates JPG. Bei mehrseitigen Dokumenten werden die Bilder nummeriert und gebündelt als ZIP-Archiv bereitgestellt.' },
      { question: 'Welche Auflösung sollte ich wählen?', answer: 'Für Bildschirm und Messenger genügen meist etwa 150 dpi, für den Druck oder sehr kleine Schrift sind 300 dpi sinnvoll. Datei Tools rendert die Seiten mit etwa 144 dpi, was für die Bildschirmanzeige ausreicht.' },
      { question: 'Kann ich aus den JPGs wieder eine PDF machen?', answer: 'Ja, mit einem Werkzeug wie JPG in PDF. Der Text bleibt dann allerdings ein Bild und ist ohne Texterkennung nicht durchsuchbar.' },
      { question: 'Warum ist die Schrift im JPG etwas verschwommen?', answer: 'JPG komprimiert verlustbehaftet und erzeugt an harten Kanten Artefakte. Für Textseiten liefert PNG schärfere Ergebnisse.' },
      { question: 'Kann ich nur einzelne Seiten einer PDF in JPG umwandeln?', answer: 'Extrahieren Sie die gewünschten Seiten zuerst in eine eigene PDF und wandeln Sie nur diese um. So vermeiden Sie viele überflüssige Bilddateien, besonders bei langen Dokumenten.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'bilder-aus-pdf-extrahieren',
    title: 'Bilder aus PDF extrahieren in Originalqualität',
    metaTitle: 'Bilder aus PDF extrahieren | Datei Tools',
    metaDescription: 'Bilder aus PDF extrahieren statt Screenshots: eingebettete Fotos in Originalauflösung speichern und typische Probleme verstehen – kostenlos, ohne Upload.',
    h1: 'Bilder aus PDF extrahieren: So speichern Sie eingebettete Fotos in Originalqualität',
    excerpt: 'Ein Screenshot liefert nur so viele Pixel wie Ihr Bildschirm. Wer Fotos aus einer PDF braucht, extrahiert sie besser direkt – in der Auflösung, in der sie gespeichert sind. Wir erklären, was dabei herauskommt und warum manches fehlt.',
    category: 'pdf',
    primaryKeyword: 'bilder aus pdf extrahieren',
    secondaryKeywords: ['bilder aus pdf speichern', 'fotos aus pdf exportieren', 'pdf bilder herausziehen', 'pdf bild extrahieren originalgröße'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-bilder-extrahieren',
    ctaHeadline: 'Bilder jetzt aus Ihrer PDF extrahieren',
    ctaButtonLabel: 'Bilder extrahieren',
    relatedToolSlugs: ['pdf-in-jpg-umwandeln', 'pdf-in-png-umwandeln', 'bild-komprimieren'],
    relatedArticleSlugs: ['pdf-in-jpg-umwandeln-anleitung', 'warum-ist-meine-pdf-so-gross', 'jpg-oder-png-welches-bildformat-ist-besser', 'pdf-datei-verkleinern'],
    directAnswer: 'Um Bilder aus einer PDF zu extrahieren, nutzen Sie ein Werkzeug, das die eingebetteten Bildobjekte ausliest und als einzelne Dateien speichert – in der Pixelauflösung, in der sie in der PDF gespeichert sind. Vektorgrafiken wie Diagramme oder Logos sowie Text werden dabei nicht als Bild ausgegeben.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die PDF aus, aus der Sie Bilder gewinnen möchten.' },
      { step: 2, title: 'Extraktion starten', text: 'Das Werkzeug durchsucht alle Seiten nach eingebetteten Bildern und listet die Funde auf.' },
      { step: 3, title: 'Bilder prüfen', text: 'Sehen Sie sich die Ergebnisse an. Kleine Symbole, Linien oder Hintergrundflächen sind oft ebenfalls als Bild gespeichert und können ignoriert werden.' },
      { step: 4, title: 'Speichern', text: 'Laden Sie die gewünschten Bilder einzeln oder gesammelt als ZIP-Archiv herunter.' }
    ],
    sections: [
      {
        heading: 'Bilder extrahieren oder Seite umwandeln: Was ist der Unterschied?',
        content: 'Extrahieren liest die in der PDF gespeicherten Bildobjekte aus, Umwandeln macht aus der ganzen Seite ein Bild. Die Unterschiede im Überblick:\n\n| Kriterium | Bilder extrahieren | Seite in Bild umwandeln |\n|---|---|---|\n| Ergebnis | einzelne eingebettete Bilder | ganze Seite mit Text und Layout |\n| Auflösung | wie in der PDF gespeichert | abhängig von der Render-Auflösung |\n| Vektorgrafiken | nicht enthalten | als Pixel enthalten |\n\nFür ein Produktfoto aus einem Katalog oder ein Bild aus einer Präsentation ist Extrahieren der richtige Weg, oft sogar in höherer Auflösung als auf der Seite sichtbar. Für eine Vorschau der kompletten Seite nutzen Sie [PDF in JPG umwandeln](tool:pdf-in-jpg-umwandeln). Wann sich welcher Weg eignet, erklärt auch die [Anleitung PDF in JPG umwandeln](blog:pdf-in-jpg-umwandeln-anleitung).'
      },
      {
        heading: 'Warum tauchen manche Grafiken nicht auf?',
        content: 'Nicht alles, was auf einer PDF-Seite wie ein Bild aussieht, ist auch als Bild gespeichert. Diagramme aus Excel, Logos aus Grafikprogrammen oder Icons liegen häufig als **Vektorgrafik** vor, also als mathematisch beschriebene Linien und Flächen. Diese werden beim Extrahieren nicht als Bilddatei ausgegeben. Datei Tools überspringt außerdem sehr kleine Bildobjekte von wenigen Pixeln, etwa Linien oder Punkte.\n\nWenn Sie Vektorgrafiken brauchen, lassen Sie die betreffende Seite als Bild ausgeben – das Extraktionswerkzeug bietet dafür an, alle Seiten als PNG zu rendern – und schneiden den Bereich anschließend zu.\n\nBei **gescannten PDFs** ist es umgekehrt: Hier besteht jede Seite aus einem einzigen großen Bild. Die Extraktion liefert dann die kompletten Seitenscans, nicht einzelne Fotos daraus. Auch in diesem Fall ist Zuschneiden der nächste Schritt.'
      },
      {
        heading: 'Warum sehen extrahierte Bilder manchmal anders aus?',
        content: 'Extrahierte Bilder sehen anders aus als erwartet, wenn die PDF sie anders speichert, als sie auf der Seite erscheinen. Typische Fälle:\n\n- **Bild in Streifen oder Kacheln:** Manche Programme zerlegen große Bilder in mehrere Teile. Sie erhalten dann mehrere Einzelbilder.\n- **Hintergrund statt Transparenz:** Transparenz ist in PDFs oft als separate Maske gespeichert. Je nach Werkzeug erscheint der Hintergrund dann schwarz oder weiß.\n- **Größeres Bild als sichtbar:** Ein Foto kann in der PDF zugeschnitten dargestellt werden, gespeichert ist aber das ganze Original.\n- **Abweichende Farben:** Druck-PDFs enthalten teils CMYK-Bilder, die für den Bildschirm in RGB umgerechnet werden.\n- **Geringe Auflösung:** Wurde die PDF zuvor komprimiert, sind die Bilder bereits verkleinert. Mehr Details als gespeichert lassen sich nicht zurückgewinnen.\n\nWarum Bilder so viel Platz in PDFs belegen, erklärt der Beitrag [Warum ist meine PDF so groß?](blog:warum-ist-meine-pdf-so-gross).'
      },
      {
        heading: 'Was ist bei Urheberrecht und Datenschutz zu beachten?',
        content: 'Technisch lassen sich Bilder aus nahezu jeder ungeschützten PDF extrahieren, rechtlich dürfen Sie sie aber nicht beliebig weiterverwenden. Fotos aus Katalogen, Zeitschriften oder fremden Präsentationen sind in der Regel urheberrechtlich geschützt. Für eigene Dokumente, eigene Fotos oder mit ausdrücklicher Erlaubnis ist die Extraktion unproblematisch.\n\nZum Datenschutz: In PDFs eingebettete Fotos können Metadaten enthalten, etwa Kameramodell oder GPS-Koordinaten, wenn ein Handyfoto unverändert eingefügt wurde. Das betrifft vor allem die Weitergabe der PDF selbst. Datei Tools speichert extrahierte Bilder als neue PNG-Dateien aus den reinen Bilddaten; eingebettete EXIF-Angaben werden dabei nicht übernommen.\n\nDie Bilder werden direkt in Ihrem Browser ausgelesen, die PDF wird dafür an keinen Server gesendet – wichtig etwa bei Gutachten mit Schadensfotos oder Unterlagen mit Personenfotos.'
      },
      {
        heading: 'Wie verarbeite ich extrahierte Bilder weiter?',
        content: 'Datei Tools speichert alle extrahierten Bilder als PNG, also ohne zusätzliche Kompressionsverluste. Ursprünglich als JPG eingebettete Fotos werden dadurch meist größer als in der PDF. Häufige nächste Schritte:\n\n1. **Verkleinern:** Für Website oder E-Mail sind die Dateien oft zu groß. [Bild komprimieren](tool:bild-komprimieren) reduziert die Dateigröße.\n2. **Format wechseln:** Für Fotos ist JPG oder WebP meist sparsamer, für Grafiken mit Text bleibt PNG die bessere Wahl.\n3. **Zuschneiden:** Bei Seitenscans schneiden Sie den gewünschten Bereich aus.\n\nWelches Format Sie für welchen Zweck wählen sollten, beschreibt der Ratgeber [JPG oder PNG – welches Bildformat ist besser?](blog:jpg-oder-png-welches-bildformat-ist-besser).\n\nBei vielen extrahierten Dateien lohnt es sich, sie nach Größe zu sortieren. Die großen Dateien sind meist die eigentlichen Fotos, die kleinen eher Symbole, Linien oder Hintergründe.'
      }
    ],
    faqs: [
      { question: 'Haben extrahierte Bilder die Originalqualität?', answer: 'Sie haben die Pixelauflösung, in der sie in der PDF gespeichert sind. Datei Tools speichert sie als PNG, also ohne zusätzliche Kompressionsverluste. Wurde die PDF vorher komprimiert, ist auch die Auflösung der Bilder bereits reduziert.' },
      { question: 'Warum finde ich ein Diagramm nicht unter den extrahierten Bildern?', answer: 'Diagramme sind oft als Vektorgrafik gespeichert und nicht als Bild. Wandeln Sie die Seite in PNG um und schneiden Sie den Bereich aus.' },
      { question: 'Kann ich Bilder aus einer passwortgeschützten PDF extrahieren?', answer: 'Nur, wenn Sie das Passwort kennen und die PDF vorher entsperren. Bei eingeschränkten Berechtigungen sollten Sie die Rechte des Erstellers respektieren.' },
      { question: 'Warum erhalte ich sehr viele kleine Bilder?', answer: 'Icons, Linien, Hintergründe oder in Kacheln zerlegte Fotos sind oft als einzelne Bildobjekte gespeichert. Sortieren Sie die Ergebnisse nach Größe und verwerfen Sie die kleinen Elemente.' },
      { question: 'Kann ich Bilder aus einer PDF auf dem Handy extrahieren?', answer: 'Ja, das Browser-Werkzeug funktioniert auch auf iPhone und Android. Die extrahierten Bilder speichern Sie anschließend in der Dateien-App bzw. im Download-Ordner und können sie von dort in Ihre Fotogalerie übernehmen.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-reparieren-beschaedigte-pdf-oeffnen',
    title: 'Beschädigte PDF reparieren: Ursachen und Lösungen',
    metaTitle: 'Beschädigte PDF reparieren und öffnen | Datei Tools',
    metaDescription: 'PDF lässt sich nicht öffnen? So reparieren Sie beschädigte PDF-Dateien, erkennen typische Ursachen und wissen, wann eine Rettung nicht mehr möglich ist.',
    h1: 'Beschädigte PDF reparieren: So öffnen Sie defekte PDF-Dateien wieder',
    excerpt: '„Datei beschädigt“ oder „Fehler beim Laden“: Eine PDF, die sich nicht öffnen lässt, ist ärgerlich. Wir zeigen, wie Sie die Ursache eingrenzen, was ein Reparaturwerkzeug leisten kann und wo seine Grenzen liegen.',
    category: 'pdf',
    primaryKeyword: 'beschädigte pdf reparieren',
    secondaryKeywords: ['pdf reparieren', 'pdf lässt sich nicht öffnen', 'pdf datei beschädigt', 'defekte pdf öffnen', 'pdf fehler beim laden'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-reparieren',
    ctaHeadline: 'Beschädigte PDF jetzt reparieren',
    ctaButtonLabel: 'PDF reparieren',
    relatedToolSlugs: ['pdf-eigenschaften-anzeigen', 'pdf-optimieren', 'pdf-entsperren'],
    relatedArticleSlugs: ['pdf-laesst-sich-nicht-bearbeiten-ursachen-loesungen', 'pdf-passwort-entfernen-anleitung', 'warum-ist-meine-pdf-so-gross', 'pdf-bearbeiten-was-kann-man-aendern'],
    directAnswer: 'Lässt sich eine PDF nicht öffnen, laden Sie sie zuerst erneut herunter und testen einen anderen Viewer. Hilft das nicht, kann ein Reparaturwerkzeug die interne Struktur der Datei neu aufbauen, etwa eine defekte Querverweistabelle. Fehlende Daten, zum Beispiel bei einem abgebrochenen Download, kann allerdings keine Reparatur zurückholen.',
    steps: [
      { step: 1, title: 'Ursache eingrenzen', text: 'Prüfen Sie Dateigröße und Herkunft. Eine Datei mit 0 KB oder auffällig geringer Größe ist meist unvollständig und sollte neu beschafft werden.' },
      { step: 2, title: 'Anderen Viewer testen', text: 'Öffnen Sie die PDF in einem anderen Programm, zum Beispiel im Browser. Viele Viewer tolerieren kleinere Fehler unterschiedlich gut.' },
      { step: 3, title: 'Reparatur starten', text: 'Wählen Sie die Datei im Reparaturwerkzeug aus. Es versucht, die Dateistruktur neu aufzubauen, und erzeugt eine neue PDF.' },
      { step: 4, title: 'Ergebnis prüfen', text: 'Öffnen Sie die reparierte Datei und kontrollieren Sie alle Seiten. Bewahren Sie das Original auf, bis Sie sicher sind.' }
    ],
    sections: [
      {
        heading: 'Woran erkenne ich eine beschädigte PDF?',
        content: 'Eine beschädigte PDF erkennen Sie meist an Fehlermeldungen beim Öffnen, an leeren Seiten oder an fehlenden Inhalten. Typische Symptome:\n\n- Der Viewer meldet, die Datei sei beschädigt oder könne nicht geladen werden.\n- Die PDF öffnet sich, zeigt aber leere oder graue Seiten.\n- Nur ein Teil der Seiten erscheint, der Rest fehlt.\n- Einzelne Bilder oder Schriften werden fehlerhaft dargestellt.\n- Das Programm stürzt beim Öffnen ab.\n\nNicht jede Meldung bedeutet einen Defekt. Fragt der Viewer nach einem Kennwort, ist die Datei verschlüsselt, nicht beschädigt. Hinweise zum Umgang damit finden Sie im Beitrag [PDF-Passwort entfernen](blog:pdf-passwort-entfernen-anleitung). Lässt sich die Datei öffnen, aber nicht ändern, liegt das meist an Berechtigungen oder am Dateityp; dazu passt der Ratgeber [PDF lässt sich nicht bearbeiten](blog:pdf-laesst-sich-nicht-bearbeiten-ursachen-loesungen).'
      },
      {
        heading: 'Warum gehen PDF-Dateien kaputt?',
        content: 'PDF-Dateien gehen meist kaputt, weil sie unvollständig übertragen oder gespeichert wurden. Häufige Ursachen:\n\n- **Abgebrochener Download oder unvollständige Übertragung:** Die Datei endet mitten im Inhalt.\n- **Fehler beim Speichern:** Ein Absturz, ein voller Datenträger oder das Abziehen eines USB-Sticks während des Schreibens.\n- **Defekte Speichermedien:** Alte Festplatten, Speicherkarten oder Sticks mit fehlerhaften Sektoren.\n- **Synchronisationskonflikte:** Cloud-Dienste, die eine Datei gleichzeitig auf mehreren Geräten ändern.\n- **Fehlerhafte Erzeugung:** Manche Programme oder Scanner schreiben PDFs, die nicht ganz dem Standard entsprechen.\n- **Falsche Datei:** Hinter der Endung .pdf steckt in Wirklichkeit eine Webseite, eine Fehlermeldung oder ein anderes Format.\n\nDen letzten Fall prüfen Sie einfach: Öffnen Sie die Datei mit einem Texteditor. Eine echte PDF beginnt mit den Zeichen „%PDF-“ und einer Versionsnummer. Steht dort HTML-Code, haben Sie statt der PDF eine Webseite gespeichert.'
      },
      {
        heading: 'Was kann eine PDF-Reparatur leisten – und was nicht?',
        content: 'Eine Reparatur kann die Struktur einer PDF neu aufbauen, aber keine fehlenden Daten zurückholen. Eine PDF besteht aus vielen einzelnen Objekten wie Seiten, Schriften und Bildern, die über eine Art Inhaltsverzeichnis, die Querverweistabelle, verknüpft sind. Häufig ist genau dieses Verzeichnis beschädigt, während die eigentlichen Inhalte noch vollständig vorhanden sind. In solchen Fällen sind die Erfolgsaussichten gut.\n\nDas [Reparaturwerkzeug](tool:pdf-reparieren) von Datei Tools geht in bis zu drei Stufen vor:\n\n1. Es schreibt die Datei neu und erzeugt dabei eine frische Querverweistabelle.\n2. Gelingt das nicht, liest es die Objekte einzeln ein und setzt das Dokument daraus neu zusammen.\n3. Als letzter Ausweg werden die noch lesbaren Seiten als Bilder in eine neue PDF übernommen. Text ist dann nicht mehr markierbar.\n\nGrenzen gibt es, wenn Daten tatsächlich fehlen: Bei einem abgebrochenen Download fehlen die hinteren Teile der Datei, die Reparatur kann bestenfalls die vorhandenen Seiten retten. Überschriebene Bild- und Textdaten lassen sich nicht rekonstruieren, und eine verschlüsselte Datei bleibt ohne Kennwort unlesbar. Je nach Schaden erhalten Sie deshalb eine vollständig, teilweise oder gar nicht lesbare Datei.'
      },
      {
        heading: 'In welcher Reihenfolge sollte ich eine defekte PDF retten?',
        content: 'Gehen Sie vom einfachsten zum aufwendigsten Schritt vor:\n\n1. **Neu beschaffen:** Laden Sie die Datei erneut herunter oder bitten Sie den Absender, sie noch einmal zu schicken. Das ist oft die schnellste Lösung.\n2. **Anderen Viewer probieren:** Browser, Acrobat Reader, die Mac-Vorschau und Smartphone-Apps nutzen unterschiedliche PDF-Programmbibliotheken.\n3. **Reparieren:** Lassen Sie ein Reparaturwerkzeug die Struktur neu aufbauen.\n4. **Neu ausgeben:** Öffnet ein Viewer die Datei, können Sie sie über die Druckfunktion als neue PDF speichern, etwa mit „Microsoft Print to PDF“ unter Windows oder „Als PDF sichern“ auf dem Mac. Dabei können allerdings Links und Formularfelder verloren gehen.\n5. **Backup prüfen:** Vorgängerversionen im Cloud-Speicher oder im Dateiversionsverlauf.\n\nNach einer erfolgreichen Reparatur lohnt ein Blick auf die [PDF-Eigenschaften](tool:pdf-eigenschaften-anzeigen), um Seitenzahl und PDF-Version zu kontrollieren.'
      },
      {
        heading: 'Beschädigte PDFs sicher reparieren und vorbeugen',
        content: 'Reparieren Sie defekte Dateien lokal und immer an einer Kopie. Defekte Dateien sind häufig wichtige Dateien: die einzige Kopie eines Vertrags, eine Steuerunterlage oder ein Befundbericht. Datei Tools repariert PDFs direkt in Ihrem Browser, die Datei verlässt Ihr Gerät nicht. Mit einer Kopie bleibt das Original für weitere Rettungsversuche erhalten, falls das erste Ergebnis nicht zufriedenstellend ist.\n\nVorbeugen ist einfacher als reparieren: Warten Sie, bis Downloads vollständig abgeschlossen sind, werfen Sie USB-Sticks vor dem Abziehen aus und halten Sie wichtige Dokumente an mindestens zwei Orten gesichert.'
      }
    ],
    faqs: [
      { question: 'Kann jede beschädigte PDF repariert werden?', answer: 'Nein. Ist nur die interne Struktur defekt, sind die Chancen gut. Fehlen dagegen Daten, etwa nach einem abgebrochenen Download, lassen sich diese Teile nicht zurückholen.' },
      { question: 'Warum öffnet der Browser die PDF, Acrobat aber nicht?', answer: 'Viewer nutzen unterschiedliche Programmbibliotheken und gehen verschieden tolerant mit Fehlern um. Öffnet ein Programm die Datei, können Sie sie von dort neu als PDF ausgeben.' },
      { question: 'Meine PDF hat 0 KB – ist da noch etwas zu retten?', answer: 'Nein. Eine Datei mit 0 KB enthält keine Daten. Beschaffen Sie die Datei neu oder suchen Sie nach einer Sicherung.' },
      { question: 'Ist eine passwortgeschützte PDF beschädigt?', answer: 'Nein. Die Passwortabfrage zeigt an, dass die Datei verschlüsselt ist. Mit dem richtigen Kennwort lässt sie sich normal öffnen.' },
      { question: 'Kann ich eine reparierte PDF wieder normal bearbeiten?', answer: 'In der Regel ja: Nach einer erfolgreichen Reparatur verhält sich die Datei wie jede andere PDF. Konnten die Seiten nur als Bilder wiederhergestellt werden, ist der Text allerdings nicht mehr markierbar; dann hilft eine Texterkennung. Speichern Sie Bearbeitungen am besten als neue Datei.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-passwort-entfernen-anleitung',
    title: 'PDF-Passwort entfernen: So heben Sie den Schutz auf',
    metaTitle: 'PDF-Passwort entfernen: Anleitung | Datei Tools',
    metaDescription: 'PDF-Passwort entfernen, wenn Sie es kennen: Öffnungs- und Berechtigungspasswort erklärt, Schritt für Schritt aufheben – kostenlos im Browser, ohne Upload.',
    h1: 'PDF-Passwort entfernen: Schutz aufheben, wenn Sie das Kennwort kennen',
    excerpt: 'Gehaltsabrechnungen, Kontoauszüge oder Versicherungsunterlagen kommen oft passwortgeschützt. Wenn das Eintippen bei jedem Öffnen nervt, können Sie den Schutz dauerhaft entfernen – vorausgesetzt, Sie kennen das Kennwort und dürfen es.',
    category: 'security',
    primaryKeyword: 'pdf passwort entfernen',
    secondaryKeywords: ['pdf kennwort entfernen', 'pdf schutz aufheben', 'pdf entsperren', 'pdf ohne passwort speichern', 'berechtigungspasswort pdf'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-passwort-entfernen',
    ctaHeadline: 'PDF-Passwort jetzt entfernen',
    ctaButtonLabel: 'Passwort entfernen',
    relatedToolSlugs: ['pdf-entsperren', 'pdf-berechtigungen-aendern', 'pdf-schuetzen'],
    relatedArticleSlugs: ['pdf-mit-passwort-schuetzen', 'pdf-laesst-sich-nicht-bearbeiten-ursachen-loesungen', 'pdf-reparieren-beschaedigte-pdf-oeffnen', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Ein PDF-Passwort entfernen Sie, indem Sie die Datei in einem Entsperr-Werkzeug öffnen, das Ihnen bekannte Kennwort eingeben und eine unverschlüsselte Kopie speichern. Ohne das richtige Öffnungspasswort ist das nicht möglich, Datei Tools errät oder knackt keine Passwörter. Reine Einschränkungen für Drucken oder Kopieren lassen sich dagegen auch ohne Kennwort aufheben, sofern Sie dazu berechtigt sind.',
    steps: [
      { step: 1, title: 'Geschützte PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die passwortgeschützte PDF aus.' },
      { step: 2, title: 'Bekanntes Passwort eingeben', text: 'Geben Sie das Öffnungspasswort ein, das Sie vom Absender erhalten oder selbst vergeben haben, und achten Sie auf Groß- und Kleinschreibung. Hat die Datei kein Öffnungspasswort, sondern nur Einschränkungen, ist keine Eingabe nötig.' },
      { step: 3, title: 'Ungeschützte Kopie erzeugen', text: 'Das Werkzeug entschlüsselt die Datei lokal in Ihrem Browser und erstellt eine neue PDF ohne Passwortschutz.' },
      { step: 4, title: 'Sicher ablegen', text: 'Speichern Sie die Kopie an einem geschützten Ort. Ohne Passwort kann jeder mit Zugriff auf die Datei den Inhalt lesen.' }
    ],
    sections: [
      {
        heading: 'Was ist der Unterschied zwischen Öffnungs- und Berechtigungspasswort?',
        content: 'Ein Öffnungspasswort schützt den Zugang zum Inhalt, ein Berechtigungspasswort regelt nur, was Sie nach dem Öffnen tun dürfen. Die beiden Kennwörter werden oft verwechselt:\n\n| Merkmal | Öffnungspasswort | Berechtigungspasswort |\n|---|---|---|\n| Auch genannt | Benutzerkennwort | Besitzer- oder Rechtekennwort |\n| Wirkung | Datei öffnet sich nur mit Kennwort | Datei öffnet sich, Drucken, Kopieren oder Bearbeiten sind eingeschränkt |\n| Schutz des Inhalts | stark, abhängig vom Kennwort | gering, Einschränkung wird vom Programm umgesetzt |\n| Entfernen mit Datei Tools | nur mit dem bekannten Kennwort | ohne Kennworteingabe möglich |\n\nSie erkennen den Unterschied schnell: Fragt der Viewer beim Öffnen nach einem Kennwort, handelt es sich um ein Öffnungspasswort. Öffnet sich die Datei, aber Sie können keinen Text markieren oder nicht drucken, liegt nur ein Berechtigungsschutz vor. Wollen Sie die Einschränkungen nicht ganz entfernen, sondern anpassen, ist [PDF-Berechtigungen ändern](tool:pdf-berechtigungen-aendern) das passende Werkzeug.\n\nManche Dateien haben beides: Dann benötigen Sie zum Öffnen das Benutzerkennwort, und das Berechtigungspasswort regelt zusätzlich, was nach dem Öffnen erlaubt ist.'
      },
      {
        heading: 'Wann darf ich den Passwortschutz entfernen?',
        content: 'Den Schutz zu entfernen ist in Ordnung, wenn Sie selbst der Urheber sind oder das Dokument Ihnen rechtmäßig mit Passwort zugeschickt wurde – etwa die eigene Gehaltsabrechnung, ein Kontoauszug oder ein Steuerbescheid, dessen Kennwort Sie kennen.\n\nNicht in Ordnung ist es, den Schutz fremder Dokumente zu umgehen, für die Sie kein Kennwort und keine Erlaubnis haben. Ein Öffnungspasswort entfernt Datei Tools deshalb nur, wenn Sie es eingeben; unbekannte Passwörter werden nicht erraten oder geknackt. Berechtigungseinschränkungen sind technisch nicht durch ein Geheimnis abgesichert. Heben Sie sie trotzdem nur bei Dokumenten auf, bei denen Sie dazu befugt sind.\n\nHaben Sie das Passwort vergessen, ist der richtige Weg, beim Absender nachzufragen. Viele Banken und Lohnbüros verwenden ein festes Schema, etwa ein Geburtsdatum oder eine Kundennummer, das in einem Begleitschreiben erklärt wird.'
      },
      {
        heading: 'Wann ist es sinnvoll, den Passwortschutz zu entfernen?',
        content: 'Sinnvoll ist das Entfernen vor allem bei eigenen Unterlagen, die Sie dauerhaft archivieren oder weiterverarbeiten möchten. Passwortgeschützte PDFs sind im Alltag oft unpraktisch:\n\n- Sie müssen das Kennwort bei jedem Öffnen eingeben, oft Jahre später, wenn es längst vergessen ist.\n- Desktop-Suchfunktionen und Dokumentenverwaltungen können verschlüsselte Inhalte nicht indexieren.\n- Viele Werkzeuge zum Zusammenfügen, Komprimieren oder Bearbeiten verweigern verschlüsselte Dateien.\n- Steuerberater oder Behördenportale akzeptieren teils keine geschützten Anhänge.\n\nDer Nachteil: Nach dem Entfernen ist der Inhalt für jeden lesbar, der auf die Datei zugreifen kann. Legen Sie entsperrte Dokumente deshalb in einem verschlüsselten Ordner oder auf einem geschützten Gerät ab. Wenn Sie die Datei später wieder sicher verschicken möchten, können Sie sie erneut schützen, wie im Ratgeber [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen) beschrieben.'
      },
      {
        heading: 'PDF-Passwort entfernen mit Bordmitteln auf Mac und Windows',
        content: 'Auf dem **Mac** öffnen Sie die PDF in der Vorschau, geben das Kennwort ein und speichern sie über „Ablage > Exportieren“ erneut als PDF. Achten Sie darauf, dass im Exportdialog keine Verschlüsselung aktiviert ist.\n\nUnter **Windows** gibt es keine eigene Funktion. Ein verbreiteter Umweg ist, die geöffnete PDF über „Microsoft Print to PDF“ neu zu drucken. Das klappt nur, wenn Drucken erlaubt ist, und hat Nachteile: Links, Lesezeichen und Formularfelder gehen meist verloren, und Text kann je nach Dokument anders umgebrochen oder gerastert werden.\n\nEin Werkzeug, das die Verschlüsselung direkt entfernt, lässt den Inhalt dagegen unverändert: Text bleibt durchsuchbar, Links funktionieren weiter. Wenn eine Datei trotz richtigem Passwort nicht aufgeht, ist sie möglicherweise beschädigt; dann hilft der Beitrag [Beschädigte PDF reparieren](blog:pdf-reparieren-beschaedigte-pdf-oeffnen).'
      },
      {
        heading: 'Warum sollte das Entsperren lokal passieren?',
        content: 'Bei einem gewöhnlichen Onlinedienst würden Sie zwei Dinge gleichzeitig aus der Hand geben: das vertrauliche Dokument und das passende Passwort. Genau diese Kombination sollte niemand Fremdes besitzen.\n\nDatei Tools entschlüsselt die PDF im Browser auf Ihrem Gerät. Weder die Datei noch das eingegebene Kennwort werden an einen Server gesendet. Wie diese Verarbeitung technisch funktioniert und wie Sie das bei jedem Online-Werkzeug selbst überprüfen können, erklärt der Beitrag [Dateien ohne Upload bearbeiten](blog:dateien-ohne-upload-bearbeiten-dsgvo).\n\nMüssen Sie viele gleichartige Dateien entsperren, etwa zwölf Monatsabrechnungen, wiederholen Sie die Schritte für jede Datei und fügen die entsperrten PDFs danach zu einem Jahresdokument zusammen.'
      }
    ],
    faqs: [
      { question: 'Kann ich ein PDF-Passwort entfernen, ohne es zu kennen?', answer: 'Ein Öffnungspasswort nicht: Datei Tools benötigt dafür das richtige Kennwort. Wenden Sie sich bei einem vergessenen Passwort an den Absender oder Ersteller des Dokuments. Hat die Datei nur Einschränkungen für Drucken, Kopieren oder Bearbeiten, ist dagegen keine Kennworteingabe nötig.' },
      { question: 'Ist das Entfernen eines PDF-Passworts legal?', answer: 'Bei eigenen Dokumenten und Dateien, deren Passwort Ihnen rechtmäßig mitgeteilt wurde, ist das unproblematisch. Den Schutz fremder Dokumente ohne Erlaubnis zu umgehen, kann dagegen rechtliche Folgen haben.' },
      { question: 'Bleibt der Inhalt beim Entfernen des Passworts unverändert?', answer: 'Ja. Es wird nur die Verschlüsselung entfernt. Text, Bilder, Links und Seitenaufbau bleiben gleich.' },
      { question: 'Was ist der Unterschied zwischen Entsperren und Entschlüsseln?', answer: 'Im Alltag meinen beide Begriffe dasselbe: Die Verschlüsselung wird mit dem bekannten Passwort aufgehoben und eine ungeschützte Kopie gespeichert.' },
      { question: 'Funktioniert das Entfernen des Passworts auch auf dem Smartphone?', answer: 'Ja. Das Browser-Werkzeug läuft auch auf iPhone und Android. Die entsperrte Datei sollten Sie danach allerdings nicht ungeschützt in geteilten Ordnern oder frei zugänglichen Cloud-Verzeichnissen ablegen.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-mit-passwort-schuetzen',
    title: 'PDF mit Passwort schützen: Sicher verschlüsseln',
    metaTitle: 'PDF mit Passwort schützen | Datei Tools',
    metaDescription: 'PDF mit Passwort schützen: Verschlüsselung, starke Kennwörter und sichere Weitergabe verständlich erklärt. Kostenlos im Browser, ohne Upload.',
    h1: 'PDF mit Passwort schützen: So verschlüsseln Sie vertrauliche Dokumente richtig',
    excerpt: 'Ein Passwort auf einer PDF ist schnell gesetzt. Ob es wirklich schützt, hängt aber von Verschlüsselungsverfahren, Passwortstärke und Weitergabe ab. Hier lesen Sie, worauf es ankommt.',
    category: 'security',
    primaryKeyword: 'pdf mit passwort schützen',
    secondaryKeywords: ['pdf verschlüsseln', 'pdf passwort setzen', 'pdf kennwort vergeben', 'pdf sicher versenden', 'pdf aes 256'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-schuetzen',
    ctaHeadline: 'PDF jetzt mit Passwort schützen',
    ctaButtonLabel: 'PDF schützen',
    relatedToolSlugs: ['pdf-verschluesseln', 'pdf-berechtigungen-aendern', 'pdf-metadaten-entfernen'],
    relatedArticleSlugs: ['pdf-passwort-entfernen-anleitung', 'pdf-metadaten-entfernen-vor-dem-versenden', 'pdf-richtig-schwaerzen', 'dateien-ohne-upload-bearbeiten-dsgvo'],
    directAnswer: 'Um eine PDF mit Passwort zu schützen, verschlüsseln Sie sie in einem Werkzeug mit einem langen, einmaligen Öffnungspasswort und speichern die geschützte Kopie. Empfehlenswert ist AES mit 256 Bit, das Datei Tools immer verwendet. Das Passwort teilen Sie dem Empfänger auf einem anderen Weg mit als die Datei, etwa per Telefon oder SMS.',
    steps: [
      { step: 1, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie die fertige PDF aus. Nehmen Sie alle Änderungen vorher vor, denn eine verschlüsselte Datei lässt sich ohne Passwort nicht mehr bearbeiten.' },
      { step: 2, title: 'Starkes Passwort vergeben', text: 'Geben Sie ein langes, einmaliges Kennwort ein, am besten eine Passphrase aus mehreren Wörtern. Das Werkzeug verlangt mindestens vier Zeichen, sicher wird ein Kennwort aber erst durch deutlich mehr Länge. Notieren Sie es in einem Passwortmanager.' },
      { step: 3, title: 'Verschlüsselte Kopie speichern', text: 'Die Verschlüsselung erfolgt lokal in Ihrem Browser. Speichern Sie die geschützte PDF unter einem neutralen Dateinamen.' },
      { step: 4, title: 'Testen und getrennt versenden', text: 'Öffnen Sie die Datei einmal zur Probe. Schicken Sie anschließend die PDF und das Passwort über zwei verschiedene Kanäle.' }
    ],
    sections: [
      {
        heading: 'Was bewirkt ein PDF-Passwort technisch?',
        content: 'Ein Öffnungspasswort verschlüsselt die Inhalte der PDF: Texte, Bilder und Schriften werden mit einem Schlüssel unlesbar gemacht, der aus dem Passwort abgeleitet wird. Ohne das richtige Kennwort sieht ein Programm nur Datensalat.\n\nDer PDF-Standard kennt mehrere Verfahren. Ältere Dateien nutzen RC4, das heute als unsicher gilt. Aktuell sind AES mit 128 oder 256 Bit Schlüssellänge. Datei Tools verschlüsselt beim Schützen und beim [PDF verschlüsseln](tool:pdf-verschluesseln) immer mit AES-256. Nur sehr alte PDF-Programme können solche Dateien nicht öffnen.\n\nWichtig zu wissen: Auch die beste Verschlüsselung ist nur so stark wie das Passwort. Wer die Datei besitzt, kann beliebig viele Passwörter automatisiert ausprobieren, ohne dass ihn eine Sperre bremst. Kurze oder naheliegende Kennwörter wie Namen oder Geburtsdaten bieten deshalb kaum Schutz.'
      },
      {
        heading: 'Wie wähle ich ein sicheres PDF-Passwort?',
        content: 'Ein PDF-Passwort muss einem Angriff standhalten, der beliebig lange offline laufen kann. Daraus ergeben sich einfache Regeln:\n\n- **Länge vor Komplexität:** Eine Passphrase aus vier bis fünf zufälligen Wörtern ist stärker und leichter zu tippen als ein kurzes Kennwort mit Sonderzeichen.\n- **Einmalig:** Verwenden Sie kein Passwort, das Sie schon für ein Konto nutzen.\n- **Nichts Persönliches:** Geburtsdaten, Namen oder Kundennummern sind leicht zu erraten.\n- **Sicher aufbewahren:** Ein Passwortmanager ist der richtige Ort. Ein vergessenes Öffnungspasswort lässt sich nicht zurücksetzen – es gibt keine „Passwort vergessen“-Funktion.\n\nDas Passwort teilen Sie dem Empfänger nie in derselben E-Mail mit wie die Datei. Ein Anruf, eine SMS oder ein Messenger sind getrennte Kanäle. Wer beide Wege abfangen müsste, hat es deutlich schwerer.'
      },
      {
        heading: 'Was leistet ein Berechtigungspasswort?',
        content: 'Ein Berechtigungspasswort schränkt Drucken, Kopieren oder Bearbeiten ein, während die Datei lesbar bleibt. Es ergänzt das Öffnungspasswort, ersetzt es aber nicht:\n\n| Merkmal | Öffnungspasswort | Berechtigungspasswort |\n|---|---|---|\n| Zweck | Inhalt nur mit Kennwort lesbar | Drucken, Kopieren, Bearbeiten einschränken |\n| Schutzwirkung | stark, abhängig vom Kennwort | gering, vom Programm abhängig |\n| Bei Datei Tools | Pflichtangabe beim Schützen | optional, sonst wird ein zufälliges gesetzt |\n\nBeim Schützen legen Sie bei Datei Tools zusätzlich fest, ob Drucken, Kopieren und Bearbeiten erlaubt sind. Lassen Sie das Besitzer-Kennwort leer, setzt das Werkzeug ein zufälliges; die Berechtigungen lassen sich dann nur durch Entsperren und erneutes Schützen ändern. Für bestehende Dateien gibt es außerdem [PDF-Berechtigungen ändern](tool:pdf-berechtigungen-aendern).\n\nSeien Sie sich der Grenzen bewusst: Die Einschränkungen werden von der Anzeigesoftware umgesetzt. Seriöse Programme halten sich daran, technisch erzwingen lassen sie sich aber nicht. Wer den Inhalt sehen kann, kann ihn notfalls abfotografieren oder abtippen. Für echte Vertraulichkeit brauchen Sie immer ein Öffnungspasswort. Wie Sie selbst einen Schutz aufheben, zeigt die Anleitung [PDF-Passwort entfernen](blog:pdf-passwort-entfernen-anleitung).'
      },
      {
        heading: 'Was verbirgt ein PDF-Passwort nicht?',
        content: 'Ein Passwort schützt den Inhalt, aber nicht alles rund um die Datei:\n\n- **Der Dateiname** bleibt sichtbar. „Kündigung_Mueller_Abmahnung.pdf“ verrät schon viel. Wählen Sie neutrale Namen.\n- **Die E-Mail selbst** mit Betreff und Text ist nicht durch das PDF-Passwort geschützt.\n- **Inhalte vor dem Verschlüsseln:** Wurde ein Text nur mit einem schwarzen Kasten überdeckt, kann jeder, der das Passwort kennt, ihn trotzdem lesen.\n\nPrüfen Sie deshalb vor dem Verschlüsseln, ob die Datei Angaben, Anhänge oder Kommentare enthält, die selbst berechtigte Empfänger nicht sehen sollen. Hilfreich sind die Ratgeber [PDF richtig schwärzen](blog:pdf-richtig-schwaerzen) und [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden).'
      },
      {
        heading: 'PDF verschlüsseln mit Word, Mac-Vorschau oder im Browser',
        content: 'Microsoft Word kann beim Speichern als PDF ein Passwort setzen: In „Datei > Speichern unter“ wählen Sie PDF als Dateityp, öffnen die „Optionen“ und aktivieren „Dokument mit einem Kennwort verschlüsseln“. Auf dem Mac bietet die Vorschau beim Exportieren als PDF je nach macOS-Version eine Verschlüsselungs- oder Berechtigungsoption. Für bereits vorhandene PDFs ohne passende Software ist ein Browser-Werkzeug der einfachste Weg.\n\nDatei Tools verschlüsselt die PDF direkt in Ihrem Browser. Das Dokument und das Passwort verlassen Ihr Gerät nicht, anders als bei Diensten, denen Sie beides auf einem fremden Server anvertrauen müssten. Prüfen Sie nach dem Verschlüsseln immer, ob sich die Datei mit dem Kennwort öffnen lässt, bevor Sie das ungeschützte Original löschen.'
      }
    ],
    faqs: [
      { question: 'Wie sicher ist eine PDF mit Passwort?', answer: 'Mit AES-Verschlüsselung und einem langen, zufälligen Passwort ist der Inhalt nach heutigem Stand gut geschützt. Schwach wird der Schutz durch kurze oder leicht zu erratende Passwörter und durch veraltete Verfahren wie RC4.' },
      { question: 'Kann ich ein vergessenes PDF-Passwort wiederherstellen?', answer: 'Nein, eine Wiederherstellungsfunktion gibt es nicht. Speichern Sie Passwörter deshalb in einem Passwortmanager und bewahren Sie bei Bedarf eine ungeschützte Kopie an einem sicheren Ort auf.' },
      { question: 'Kann der Empfänger die PDF auf dem Handy öffnen?', answer: 'Ja. Aktuelle PDF-Viewer auf iPhone und Android unterstützen AES-verschlüsselte PDFs und fragen beim Öffnen nach dem Kennwort.' },
      { question: 'Reicht ein Berechtigungspasswort, um Kopieren zu verhindern?', answer: 'Nur eingeschränkt. Viele Programme respektieren die Einschränkung, technisch erzwungen wird sie nicht. Für Vertraulichkeit brauchen Sie ein Öffnungspasswort.' },
      { question: 'Kann ich mehrere PDFs mit demselben Passwort schützen?', answer: 'Technisch ist das möglich. Für verschiedene Empfänger sollten Sie aber unterschiedliche Passwörter verwenden, damit ein weitergegebenes Kennwort nicht automatisch alle Dokumente öffnet.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-richtig-schwaerzen',
    title: 'PDF richtig schwärzen: Warum schwarze Balken nicht reichen',
    metaTitle: 'PDF richtig schwärzen – sicher statt nur abgedeckt',
    metaDescription: 'PDF schwärzen, aber richtig: Warum schwarze Kästen im Editor den Text nicht löschen, wie echte Schwärzung funktioniert und wie Sie das Ergebnis prüfen.',
    h1: 'PDF richtig schwärzen: So entfernen Sie vertrauliche Inhalte wirklich',
    excerpt: 'Ein schwarzer Kasten über einer IBAN sieht sicher aus – doch oft lässt sich der Text darunter einfach kopieren. Wir erklären, wie echte Schwärzung funktioniert, wo sich sonst noch Daten verstecken und wie Sie das Ergebnis testen.',
    category: 'security',
    primaryKeyword: 'pdf schwärzen',
    secondaryKeywords: ['pdf schwärzen kostenlos', 'pdf text unkenntlich machen', 'pdf sicher schwärzen', 'schwärzung pdf prüfen', 'pdf daten anonymisieren'],
    searchIntent: 'informational',
    primaryToolSlug: 'pdf-schwaerzen',
    ctaHeadline: 'Vertrauliche Inhalte jetzt sicher schwärzen',
    ctaButtonLabel: 'PDF schwärzen',
    relatedToolSlugs: ['pdf-metadaten-entfernen', 'pdf-text-extrahieren', 'pdf-anmerkungen-entfernen'],
    relatedArticleSlugs: ['pdf-metadaten-entfernen-vor-dem-versenden', 'text-aus-gescannter-pdf-kopieren', 'pdf-in-jpg-umwandeln-anleitung', 'pdf-mit-passwort-schuetzen', 'pdf-wasserzeichen-einfuegen'],
    directAnswer: 'Richtig schwärzen heißt, vertrauliche Inhalte aus der PDF zu entfernen und nicht nur zu überdecken. Ein schwarzer Kasten aus einem Zeichen- oder Kommentarwerkzeug lässt den Text darunter erhalten, er bleibt kopier- und durchsuchbar. Ein echtes Schwärzungswerkzeug löscht die Inhalte aus der Datei; prüfen Sie das Ergebnis anschließend mit Suchen und Kopieren.',
    steps: [
      { step: 1, title: 'Kopie der PDF verwenden', text: 'Arbeiten Sie mit einer Kopie, damit das Original für Ihre eigenen Unterlagen erhalten bleibt.' },
      { step: 2, title: 'Stellen festlegen', text: 'Geben Sie im Schwärzungswerkzeug die Begriffe ein, die entfernt werden sollen, etwa Namen oder IBANs. Text in Scans, Bildern oder Unterschriften markieren Sie zusätzlich von Hand als Bereich.' },
      { step: 3, title: 'Schwärzung anwenden und speichern', text: 'Lassen Sie die Schwärzung anwenden und speichern Sie die neue PDF unter einem anderen Namen. Achten Sie auf die Meldung, welche Begriffe nicht gefunden wurden.' },
      { step: 4, title: 'Ergebnis testen', text: 'Suchen Sie in der neuen Datei nach den geschwärzten Begriffen und versuchen Sie, den Bereich zu markieren und zu kopieren. Es darf nichts gefunden werden.' }
    ],
    sections: [
      {
        heading: 'Warum reicht ein schwarzer Kasten nicht?',
        content: 'Ein schwarzer Kasten verdeckt Text nur optisch, gelöscht wird dabei nichts. Eine PDF speichert Text als Zeichen mit Position, nicht als Bild. Wenn Sie mit einem Rechteck-, Kommentar- oder Hervorhebungswerkzeug einen schwarzen Balken darüberlegen, entsteht nur ein zusätzliches Objekt; die Zeichen darunter bleiben vollständig in der Datei.\n\nDie Folgen:\n\n- Der Text lässt sich markieren und in ein anderes Programm kopieren.\n- Die Suchfunktion findet die verdeckten Begriffe.\n- Screenreader lesen den Text vor.\n- Der Balken lässt sich in vielen Programmen einfach verschieben oder löschen.\n\nImmer wieder werden Fälle öffentlich, in denen vermeintlich geschwärzte Dokumente veröffentlicht wurden, deren Inhalt sich trotzdem lesen ließ. Dasselbe Problem entsteht, wenn man Text in Word schwarz hinterlegt und dann als PDF exportiert.'
      },
      {
        heading: 'Wie funktioniert echte Schwärzung?',
        content: 'Echte Schwärzung entfernt die betroffenen Inhalte aus der Datei, statt sie nur zu verdecken. Dafür gibt es zwei Ansätze: Ein PDF-Editor löscht die Zeichen aus dem Inhalt der Seite und setzt an ihre Stelle einen Balken, oder die betroffene Seite wird als Bild neu aufgebaut, in das die Balken fest eingebrannt sind.\n\n| Methode | Verdeckter Text danach | Seite noch durchsuchbar |\n|---|---|---|\n| Balken aus Zeichen- oder Kommentarwerkzeug | bleibt erhalten | ja, inklusive verdecktem Text |\n| Text in Word schwarz hinterlegt und exportiert | bleibt erhalten | ja, inklusive verdecktem Text |\n| Schwärzungsfunktion, die Zeichen löscht | entfernt | ja, übriger Text |\n| Seite als Bild neu aufbauen | entfernt | nein |\n\n[PDF schwärzen](tool:pdf-schwaerzen) von Datei Tools nutzt den zweiten Ansatz: Jede Seite mit einem Treffer oder einem markierten Bereich wird mit etwa 150 dpi als Bild gerendert, die Stellen werden schwarz übermalt, und die Seite wird durch dieses Bild ersetzt. Text, Vektorgrafiken und versteckte Ebenen dieser Seiten sind danach nicht mehr in der Datei. Der Preis: Geschwärzte Seiten sind nicht mehr durchsuchbar und etwas weniger scharf. Seiten ohne Treffer bleiben unverändert.\n\nDie Begriffssuche findet nur Text, der als Text in der PDF steht. Bei **gescannten Dokumenten** ohne Textebene markieren Sie die Stellen deshalb von Hand als Bereich. Hat ein Scan eine unsichtbare OCR-Textebene, wird sie durchsucht, die Position der Balken richtet sich dann aber nach der Texterkennung; kontrollieren Sie solche Seiten besonders genau. Wie Textebenen in Scans entstehen, erklärt der Beitrag [Text aus gescannter PDF kopieren](blog:text-aus-gescannter-pdf-kopieren).'
      },
      {
        heading: 'Wo verstecken sich vertrauliche Daten außerdem?',
        content: 'Vertrauliche Informationen stehen nicht nur im sichtbaren Seiteninhalt:\n\n- **Metadaten:** Titel, Autor, Betreff oder Stichwörter enthalten manchmal genau den Namen, den Sie geschwärzt haben.\n- **Kommentare und Notizen:** Anmerkungen anderer Bearbeiter bleiben oft unsichtbar zugeklappt erhalten.\n- **Lesezeichen:** Ein Lesezeichen „Gutachten Familie Schmidt“ verrät mehr als jede Seite.\n- **Formularfelder und Anhänge:** Ausgefüllte Felder oder eingebettete Dateien.\n- **Dateiname:** Er wird mitverschickt.\n\nDatei Tools übernimmt beim Schwärzen Dokumenteigenschaften wie Titel und Autor, Lesezeichen und Dateianhänge nicht in die neue Datei und entfernt Kommentare und Formularfelder im gesamten Dokument; nur Links bleiben erhalten. Den Dateinamen müssen Sie selbst anpassen. Arbeiten Sie mit anderen Werkzeugen, bereinigen Sie diese Stellen separat. Eine ausführliche Anleitung gibt der Beitrag [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden).'
      },
      {
        heading: 'Wie prüfe ich, ob eine PDF richtig geschwärzt ist?',
        content: 'Prüfen Sie jede geschwärzte Datei mit Suchen und Kopieren, bevor sie das Haus verlässt; der optische Eindruck allein genügt nicht:\n\n1. **Suche:** Öffnen Sie die neue PDF und suchen Sie mit Strg+F bzw. Befehlstaste+F nach den geschwärzten Begriffen.\n2. **Kopieren:** Markieren Sie den Bereich um den Balken, kopieren Sie ihn und fügen Sie ihn in einen Texteditor ein.\n3. **Gesamttext prüfen:** Lassen Sie den Text der gesamten Datei mit [Text aus PDF extrahieren](tool:pdf-text-extrahieren) ausgeben und durchsuchen Sie ihn.\n4. **Eigenschaften ansehen:** Kontrollieren Sie Titel, Autor und weitere Metadaten.\n5. **Anderer Viewer:** Öffnen Sie die Datei zusätzlich in einem zweiten Programm.\n\nTaucht ein Begriff irgendwo noch auf, war die Schwärzung unvollständig.'
      },
      {
        heading: 'Warum sollte man lokal schwärzen?',
        content: 'Geschwärzt wird, weil ein Dokument personenbezogene oder vertrauliche Daten enthält: Gesundheitsangaben, Bankdaten, Namen von Dritten. Würden Sie das ungeschwärzte Original dafür an einen fremden Onlinedienst schicken, hätten Sie das Problem nur verlagert.\n\nDatei Tools schwärzt direkt in Ihrem Browser, die Originaldatei mit allen Klardaten verlässt Ihr Gerät nicht. Das ist besonders relevant für Stellen, die regelmäßig mit sensiblen Daten arbeiten, etwa Arztpraxen, Vereine, Personalabteilungen oder Kanzleien.\n\nWenn Sie das Dokument selbst erstellt haben, ist der sicherste Weg oft, die vertraulichen Stellen schon in der Quelldatei zu ersetzen, etwa in Word durch den Vermerk „geschwärzt“, und erst dann die PDF zu erzeugen.'
      }
    ],
    faqs: [
      { question: 'Kann man eine Schwärzung rückgängig machen?', answer: 'Bei einer echten Schwärzung nicht, weil der Text aus der Datei gelöscht wurde. Bei einem aufgemalten Balken dagegen schon, da der Text darunter erhalten ist.' },
      { question: 'Reicht es, die PDF nach dem Schwärzen zu drucken und neu zu scannen?', answer: 'Ein Ausdruck mit erneutem Scan entfernt die Textebene zuverlässig, kostet aber Qualität und Zeit. Achten Sie darauf, dass der Scanner keine automatische Texterkennung auf verbliebene Inhalte anwendet, und prüfen Sie den Ausdruck vorher.' },
      { question: 'Werden auch Bilder geschwärzt?', answer: 'Ja, wenn Sie den Bereich von Hand markieren. Die Begriffssuche findet nur Text, der als Text in der PDF gespeichert ist; Text in Bildern, Scans oder Unterschriften erfasst sie nicht. Da die betroffene Seite als Bild neu aufgebaut wird, ist der markierte Bereich danach dauerhaft schwarz.' },
      { question: 'Wie erkenne ich, ob eine erhaltene PDF richtig geschwärzt wurde?', answer: 'Versuchen Sie, den Bereich unter dem Balken zu markieren und zu kopieren, oder nutzen Sie die Suchfunktion. Finden Sie dort Text, war die Schwärzung nur optisch.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-metadaten-entfernen-vor-dem-versenden',
    title: 'PDF-Metadaten entfernen, bevor Sie eine Datei versenden',
    metaTitle: 'PDF-Metadaten entfernen vor dem Versand | Datei Tools',
    metaDescription: 'PDF-Metadaten entfernen: Autor, Software, Zeitstempel und alte Titel aus PDFs löschen, bevor Sie sie verschicken – kostenlos und ohne Upload.',
    h1: 'PDF-Metadaten entfernen: Was Ihre PDF verrät und wie Sie es löschen',
    excerpt: 'Hinter jeder PDF stecken unsichtbare Angaben: Ihr Benutzername, das verwendete Programm, Erstellungsdatum und manchmal ein peinlicher alter Dokumenttitel. So prüfen und bereinigen Sie diese Daten vor dem Versand.',
    category: 'security',
    primaryKeyword: 'pdf metadaten entfernen',
    secondaryKeywords: ['pdf metadaten löschen', 'pdf autor entfernen', 'pdf eigenschaften löschen', 'pdf metadaten anzeigen', 'pdf anonymisieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-metadaten-entfernen',
    ctaHeadline: 'PDF-Metadaten jetzt entfernen',
    ctaButtonLabel: 'Metadaten entfernen',
    relatedToolSlugs: ['pdf-metadaten-anzeigen', 'pdf-anmerkungen-entfernen', 'pdf-anhaenge-extrahieren'],
    relatedArticleSlugs: ['pdf-richtig-schwaerzen', 'bild-metadaten-exif-entfernen', 'pdf-a-erklaert-archivierung', 'pdf-mit-passwort-schuetzen'],
    directAnswer: 'PDF-Metadaten sind versteckte Angaben wie Autor, Titel, Erstellungsprogramm und Zeitstempel. Sie entfernen sie, indem Sie die Datei in einem Bereinigungswerkzeug öffnen und eine Kopie ohne diese Angaben speichern. Prüfen Sie zusätzlich Kommentare, Anhänge und eingebettete Fotos, denn auch dort können persönliche Informationen stecken.',
    steps: [
      { step: 1, title: 'Metadaten ansehen', text: 'Kontrollieren Sie zuerst, welche Angaben die PDF enthält, zum Beispiel mit einem Werkzeug zum Anzeigen der Metadaten oder über die Dokumenteigenschaften Ihres Viewers.' },
      { step: 2, title: 'PDF auswählen', text: 'Öffnen Sie das Werkzeug zum Entfernen der Metadaten und wählen Sie die Datei aus.' },
      { step: 3, title: 'Bereinigte Kopie speichern', text: 'Lassen Sie die Metadaten entfernen und speichern Sie die neue PDF. Der sichtbare Inhalt bleibt dabei unverändert.' },
      { step: 4, title: 'Gegenprüfen', text: 'Öffnen Sie die Eigenschaften der neuen Datei und vergewissern Sie sich, dass Autor, Titel, Betreff und Stichwörter leer sind.' }
    ],
    sections: [
      {
        heading: 'Welche Metadaten stecken in einer PDF?',
        content: 'Jede PDF kann einen Satz beschreibender Angaben enthalten, die im Viewer nicht auf den Seiten erscheinen. Die wichtigsten sind:\n\n- **Autor:** Häufig automatisch der Benutzername aus Windows oder Office, manchmal der volle Name, manchmal ein Kürzel aus dem Firmennetz.\n- **Titel, Betreff und Stichwörter:** Werden oft aus der Vorlage übernommen und nie angepasst.\n- **Ersteller und Produzent:** Das Programm, mit dem das Dokument geschrieben wurde, und die Software, die die PDF erzeugt hat, oft mit Versionsnummer.\n- **Erstellungs- und Änderungsdatum:** Auf die Sekunde genau, inklusive Zeitzone.\n\nViele PDFs speichern diese Angaben doppelt: einmal im klassischen Dokumentinfo-Bereich und einmal als XMP-Metadaten. Programme aus Grafiksuiten schreiben dort teilweise sogar einen Bearbeitungsverlauf hinein. Einen schnellen Überblick verschafft [PDF-Metadaten anzeigen](tool:pdf-metadaten-anzeigen).\n\nDas Werkzeug PDF-Metadaten entfernen von Datei Tools leert Titel, Autor, Betreff und Stichwörter und ersetzt die Angaben zu Ersteller und Produzent. Das Erstellungsdatum bleibt erhalten, das Änderungsdatum wird auf den Zeitpunkt der Bereinigung gesetzt. Eine zusätzlich gespeicherte XMP-Kopie entfernt das Werkzeug nicht; bei besonders sensiblen Dateien erzeugen Sie die PDF deshalb besser neu aus der Quelldatei.'
      },
      {
        heading: 'Wann werden Metadaten zum Problem?',
        content: 'Metadaten werden zum Problem, wenn sie Namen, Kunden oder Abläufe verraten, die der Empfänger nicht kennen soll. Typische Fälle:\n\n- Ein Angebot für Kunde B trägt im Titel noch „Angebot Kunde A“, weil die Vorlage wiederverwendet wurde.\n- Eine anonyme Stellungnahme oder Beschwerde enthält im Autorfeld Ihren vollständigen Namen.\n- Ein Gutachten zeigt, dass es mit einer anderen Software oder an einem anderen Tag erstellt wurde als behauptet.\n- Interne Projektnamen oder Mandantennummern stehen in den Stichwörtern.\n\nBesonders heikel ist das nach einer Schwärzung: Steht der geschwärzte Name noch im Titel, war die Mühe umsonst. Deshalb gehört das Prüfen der Metadaten zu jeder Schwärzung dazu, wie im Ratgeber [PDF richtig schwärzen](blog:pdf-richtig-schwaerzen) beschrieben.'
      },
      {
        heading: 'Welche versteckten Daten gibt es außer Metadaten?',
        content: 'Neben den Dokumenteigenschaften können Kommentare, Anhänge, Fotos und ausgeblendete Inhalte persönliche Angaben enthalten. Prüfen Sie vor dem Versand sensibler Dateien deshalb auch diese Stellen:\n\n- **Kommentare und Anmerkungen**, die im Viewer zugeklappt sein können\n- **Eingebettete Dateien:** PDFs können Anhänge enthalten, etwa die ursprüngliche Excel-Tabelle. Ob welche vorhanden sind, zeigt [PDF-Anhänge extrahieren](tool:pdf-anhaenge-extrahieren).\n- **Fotos mit EXIF-Daten:** Eingebettete Handyfotos können Kameramodell und GPS-Position enthalten. Mehr dazu im Beitrag [Bild-Metadaten und EXIF entfernen](blog:bild-metadaten-exif-entfernen).\n- **Ausgeblendete Ebenen und Formularfelder**\n- **Der Dateiname**, der oft mehr erzählt als jede Metadatenangabe\n\nIm Zweifel ist es sicherer, eine PDF aus der Quelldatei neu zu erzeugen, als eine stark bearbeitete Datei zu bereinigen.'
      },
      {
        heading: 'Wie vermeide ich Metadaten schon beim Erstellen?',
        content: 'Am einfachsten ist es, unerwünschte Angaben gar nicht erst in die PDF gelangen zu lassen.\n\n**Microsoft Word:** Unter „Datei > Informationen > Auf Probleme überprüfen > Dokument prüfen“ finden und entfernen Sie Kommentare, Versionen und persönliche Angaben im Word-Dokument. Beim Speichern als PDF können Sie zudem in den „Optionen“ das Übernehmen der Dokumenteigenschaften abwählen.\n\n**Kontrolle in Viewern:** In Acrobat Reader zeigt „Datei > Eigenschaften“ die wichtigsten Angaben, auf dem Mac die Vorschau über „Werkzeuge > Informationen einblenden“.\n\nNicht immer ist das vollständige Entfernen sinnvoll. Für veröffentlichte Dokumente, Barrierefreiheit oder Archivierung ist ein korrekter Titel hilfreich, und Archivformate wie PDF/A setzen Metadaten sogar voraus. Mehr dazu lesen Sie im Beitrag [PDF/A erklärt](blog:pdf-a-erklaert-archivierung). In solchen Fällen ersetzen Sie persönliche Angaben besser durch neutrale, statt alles zu löschen.'
      },
      {
        heading: 'In welcher Reihenfolge bereinige ich eine PDF vor dem Versand?',
        content: 'Entfernen Sie die Metadaten nach allen anderen Bearbeitungen: erst schwärzen und bearbeiten, dann Metadaten entfernen, zum Schluss bei Bedarf mit Passwort schützen. Viele Bearbeitungswerkzeuge tragen beim Speichern nämlich erneut ihren Namen als Produzent ein. Wenn Sie zum Schluss noch einmal in die Eigenschaften schauen, sind Sie auf der sicheren Seite.\n\nWer Metadaten entfernt, will Informationen schützen. Es wäre daher widersprüchlich, die ungefilterte Originaldatei zuerst einem unbekannten Dienst anzuvertrauen. Datei Tools bereinigt die PDF direkt in Ihrem Browser, die Datei verlässt Ihr Gerät dabei nicht.\n\nDas gilt auch für Dateien, die Sie regelmäßig aus einer Vorlage erzeugen, etwa Rechnungen oder Angebote: Ein kurzer Blick in die Eigenschaften der Vorlage erspart Ihnen, denselben Fehler in jedem Dokument zu wiederholen.'
      }
    ],
    faqs: [
      { question: 'Verändert das Entfernen der Metadaten den Inhalt der PDF?', answer: 'Nein. Seiten, Text und Bilder bleiben unverändert. Entfernt bzw. ersetzt werden nur beschreibende Angaben wie Autor, Titel, Betreff, Stichwörter und die Programmangaben.' },
      { question: 'Wie sehe ich die Metadaten einer PDF?', answer: 'In Acrobat Reader über „Datei > Eigenschaften“, auf dem Mac in der Vorschau über „Werkzeuge > Informationen einblenden“ oder mit einem Werkzeug zum Anzeigen der Metadaten im Browser.' },
      { question: 'Werden beim Entfernen auch Kommentare gelöscht?', answer: 'Nein. Kommentare und Anmerkungen gehören zu den Seiten und bleiben beim Entfernen der Metadaten erhalten. Prüfen Sie sie deshalb zusätzlich und entfernen Sie sie bei Bedarf mit einem Werkzeug zum Löschen von Anmerkungen.' },
      { question: 'Sollte ich Metadaten immer entfernen?', answer: 'Nicht zwingend. Bei Dokumenten, die Sie an Dritte weitergeben, ist es oft sinnvoll. Für Archivierung oder öffentliche Dokumente sind korrekte, neutrale Angaben wie ein passender Titel dagegen nützlich.' },
      { question: 'Enthält eine gescannte PDF auch Metadaten?', answer: 'Ja. Scanner und Scan-Apps tragen meist ihren Namen und ein Datum ein, manchmal auch einen Gerätenamen. Persönliche Angaben sind seltener, ein kurzer Blick in die Eigenschaften lohnt sich aber trotzdem.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'bild-metadaten-exif-entfernen',
    title: 'EXIF-Daten entfernen: GPS-Standort aus Fotos löschen',
    metaTitle: 'EXIF-Daten entfernen & Standort löschen | Datei Tools',
    metaDescription: 'EXIF-Daten aus Fotos entfernen: GPS-Standort, Kameramodell und Aufnahmezeit löschen, bevor Sie Bilder teilen – auf iPhone, Android, Windows und Mac.',
    h1: 'EXIF-Daten entfernen: So löschen Sie Standort und Kameradaten aus Fotos',
    excerpt: 'Ein Foto vom Sofa für die Kleinanzeige kann Ihre Wohnadresse verraten, wenn der GPS-Standort in den EXIF-Daten steckt. So prüfen Sie, welche Metadaten Ihre Bilder enthalten, und entfernen sie vor dem Teilen.',
    category: 'security',
    primaryKeyword: 'exif daten entfernen',
    secondaryKeywords: ['bild metadaten entfernen', 'gps daten aus foto entfernen', 'standort aus foto löschen', 'exif daten löschen iphone', 'foto metadaten löschen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-metadaten-entfernen',
    ctaHeadline: 'Metadaten jetzt aus Ihren Fotos entfernen',
    ctaButtonLabel: 'EXIF-Daten entfernen',
    relatedToolSlugs: ['heic-in-jpg-umwandeln', 'bild-komprimieren', 'pdf-metadaten-entfernen'],
    relatedArticleSlugs: ['pdf-metadaten-entfernen-vor-dem-versenden', 'bild-drehen-handyfoto-falsch-herum', 'was-ist-heic-warum-iphone-dieses-format', 'iphone-fotos-als-jpg-speichern'],
    directAnswer: 'EXIF-Daten sind Zusatzinformationen in Fotos, etwa Kameramodell, Aufnahmezeit und oft der GPS-Standort. Sie entfernen sie, indem Sie das Bild in einem Bereinigungswerkzeug öffnen und eine Kopie ohne Metadaten speichern. Auf dem iPhone lässt sich der Standort zusätzlich direkt beim Teilen über „Optionen“ abschalten.',
    steps: [
      { step: 1, title: 'Foto auswählen', text: 'Öffnen Sie das Werkzeug und wählen Sie ein Foto im Format JPG oder PNG aus. iPhone-Fotos im HEIC-Format wandeln Sie vorher in JPG um.' },
      { step: 2, title: 'Metadaten entfernen', text: 'Starten Sie die Bereinigung. Das Bild wird in Ihrem Browser neu gespeichert; EXIF-, GPS- und weitere Metadaten werden dabei nicht übernommen.' },
      { step: 3, title: 'Bereinigte Kopie speichern', text: 'Laden Sie das bereinigte Bild herunter und wiederholen Sie die Schritte bei Bedarf für weitere Fotos. Behalten Sie die Originale für Ihr eigenes Fotoarchiv, falls Sie Aufnahmedatum und Ort später noch brauchen.' },
      { step: 4, title: 'Ausrichtung kontrollieren', text: 'Prüfen Sie, ob die Fotos richtig herum angezeigt werden, bevor Sie sie teilen.' }
    ],
    sections: [
      {
        heading: 'Was verraten EXIF-Daten über mich?',
        content: 'EXIF-Daten können verraten, wo, wann und womit ein Foto aufgenommen wurde. Digitalkameras und Smartphones speichern dazu in jedem Bild zahlreiche Zusatzinformationen:\n\n- **GPS-Koordinaten** des Aufnahmeorts, wenn der Standortzugriff der Kamera erlaubt ist, oft genau genug, um ein Haus zuzuordnen\n- **Datum und Uhrzeit** der Aufnahme\n- **Hersteller und Modell** des Geräts, bei manchen Kameras auch die Seriennummer\n- **Aufnahmeeinstellungen** wie Blende, Belichtungszeit und Brennweite\n- **Bearbeitungssoftware** sowie bei manchen Programmen ein eingebettetes Vorschaubild\n\nDazu kommen bei bearbeiteten Bildern oft IPTC- oder XMP-Angaben wie Autorname und Copyright. Für Ihr privates Fotoarchiv sind diese Daten nützlich. Wenn Sie Bilder aber öffentlich teilen, etwa in Kleinanzeigen, Foren oder auf Ihrer Website, können sie Ihren Wohnort, Ihre Gewohnheiten oder Ihre Ausrüstung preisgeben.'
      },
      {
        heading: 'Entfernen soziale Netzwerke EXIF-Daten automatisch?',
        content: 'Viele große soziale Netzwerke entfernen EXIF-Daten beim Veröffentlichen, und auch manche Messenger tun das bei normal versendeten Fotos. Darauf verlassen sollten Sie sich trotzdem nicht:\n\n- Nicht jeder Dienst bereinigt Bilder, und das Verhalten kann sich mit Updates ändern.\n- Fotos, die als **Datei oder Dokument** verschickt werden, bleiben in der Regel unverändert.\n- **E-Mail-Anhänge, Cloud-Freigaben und eigene Websites** übertragen das Original mit allen Metadaten.\n- Die Plattform selbst erhält die Metadaten, auch wenn andere Nutzer sie nicht sehen.\n\nWer sichergehen will, entfernt die Daten selbst, bevor das Bild das Gerät verlässt. Mit Datei Tools geschieht das im Browser auf Ihrem Gerät, die Fotos werden dafür nicht an einen Server gesendet. Dasselbe Prinzip gilt für Dokumente, wie der Beitrag [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden) zeigt.'
      },
      {
        heading: 'EXIF-Daten mit Bordmitteln entfernen: iPhone, Android, Windows und Mac',
        content: '**iPhone:** Tippen Sie im Teilen-Menü oben auf „Optionen“ und deaktivieren Sie „Ort“. Dauerhaft verhindern Sie Standortdaten unter „Einstellungen > Datenschutz & Sicherheit > Ortungsdienste > Kamera“ mit der Einstellung „Nie“.\n\n**Android:** In den Einstellungen der Kamera-App lässt sich das Speichern des Standorts meist abschalten. Die Bezeichnung unterscheidet sich je nach Hersteller, etwa „Standort-Tags“ oder „Standort speichern“.\n\n**Windows:** Rechtsklick auf das Bild, „Eigenschaften“, Registerkarte „Details“ und unten „Eigenschaften und persönliche Informationen entfernen“. Dort können Sie eine bereinigte Kopie erstellen lassen.\n\n**Mac:** In der Vorschau zeigt „Werkzeuge > Informationen einblenden“ die Metadaten. Enthält das Foto einen Ort, können Sie ihn im GPS-Bereich entfernen.\n\nEin Browser-Werkzeug funktioniert dagegen auf allen Systemen gleich und entfernt nicht nur den Standort, sondern sämtliche Metadaten.'
      },
      {
        heading: 'HEIC, Ausrichtung und Qualität: Was ist zu beachten?',
        content: 'Das Werkzeug Bild-Metadaten entfernen von Datei Tools verarbeitet JPG- und PNG-Dateien. iPhones speichern Fotos standardmäßig im HEIC-Format; wandeln Sie diese zuerst mit [HEIC in JPG umwandeln](tool:heic-in-jpg-umwandeln) um. Warum Apple dieses Format nutzt, erklärt der Beitrag [Was ist HEIC?](blog:was-ist-heic-warum-iphone-dieses-format).\n\nEin häufig übersehener Effekt betrifft die **Ausrichtung**: Viele Kameras speichern ein Hochformatfoto technisch quer und vermerken die Drehung nur in den EXIF-Daten. Löscht ein Werkzeug diese Angabe, ohne das Bild tatsächlich zu drehen, liegt es plötzlich auf der Seite. Datei Tools zeichnet das Bild neu; aktuelle Browser wenden die Drehangabe dabei an, sodass das Ergebnis in der Regel richtig herum steht. Prüfen Sie es trotzdem kurz. Hintergründe liefert der Ratgeber [Bild drehen, wenn das Handyfoto falsch herum ist](blog:bild-drehen-handyfoto-falsch-herum).\n\nBeim Neuzeichnen wird ein JPG mit hoher Qualitätsstufe neu komprimiert. Die Dateigröße kann sich dadurch ändern; sichtbare Qualitätsverluste sind in der Regel nicht zu erwarten.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Standort trotzdem sichtbar:** Prüfen Sie, ob Sie die bereinigte Kopie verschickt haben und nicht das Original aus der Galerie.\n- **Aufnahmedatum fehlt im Fotoarchiv:** Das ist die Kehrseite der Bereinigung. Entfernen Sie Metadaten nur bei Kopien, die Sie weitergeben.\n- **Foto steht auf dem Kopf:** Die Ausrichtungsangabe wurde entfernt. Drehen Sie das Bild und speichern Sie es erneut.\n- **Auf dem Bild selbst ist der Ort erkennbar:** Metadaten zu löschen hilft nicht gegen sichtbare Hinweise wie Hausnummern, Kennzeichen oder Straßenschilder. Schneiden Sie solche Bereiche weg oder machen Sie sie unkenntlich.'
      }
    ],
    faqs: [
      { question: 'Wie sehe ich, ob ein Foto GPS-Daten enthält?', answer: 'Unter Windows in den Dateieigenschaften auf der Registerkarte „Details“, auf dem Mac in der Vorschau über das Informationsfenster und auf dem iPhone in der Fotos-App durch Wischen nach oben. Wird dort ein Ort oder eine Karte angezeigt, sind Standortdaten enthalten.' },
      { question: 'Entfernt WhatsApp die EXIF-Daten?', answer: 'Bei normal versendeten Fotos werden Bilder komprimiert und Metadaten nach bisherigen Beobachtungen weitgehend entfernt. Beim Versand als Dokument bleibt das Original erhalten. Da sich das Verhalten ändern kann, ist eigenes Bereinigen der sichere Weg.' },
      { question: 'Verliert das Foto durch das Entfernen an Qualität?', answer: 'In der Regel nicht sichtbar. Ein JPG wird beim Bereinigen mit hoher Qualitätsstufe neu gespeichert, was die Dateigröße etwas verändern kann.' },
      { question: 'Kann ich EXIF-Daten aus mehreren Fotos auf einmal entfernen?', answer: 'Das Werkzeug von Datei Tools bereinigt ein Foto pro Durchgang. Für mehrere Bilder wiederholen Sie die Schritte; wie schnell das geht, hängt von Bildgröße und Gerät ab.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'dateien-ohne-upload-bearbeiten-dsgvo',
    title: 'Dateien ohne Upload bearbeiten: So geht DSGVO-freundlich',
    metaTitle: 'PDF-Tools ohne Upload: DSGVO-freundlich | Datei Tools',
    metaDescription: 'PDF-Tools ohne Upload: wie lokale Verarbeitung im Browser funktioniert, wie Sie sie selbst überprüfen und worauf Sie bei Online-Tools achten sollten.',
    h1: 'Dateien ohne Upload bearbeiten: Wie lokale Verarbeitung im Browser funktioniert und was die DSGVO damit zu tun hat',
    excerpt: 'Viele Online-Werkzeuge schicken Ihre Dateien an einen Server. Browser-Tools wie Datei Tools verarbeiten sie stattdessen auf Ihrem Gerät. Wir erklären die Technik, zeigen, wie Sie das selbst prüfen, und nennen ehrlich die Grenzen.',
    category: 'security',
    primaryKeyword: 'pdf tools ohne upload',
    secondaryKeywords: ['pdf bearbeiten ohne upload', 'dsgvo konforme pdf tools', 'dateien lokal im browser bearbeiten', 'online tool datenschutz prüfen', 'pdf komprimieren ohne upload'],
    searchIntent: 'commercial',
    primaryToolSlug: 'pdf-komprimieren',
    ctaHeadline: 'PDF lokal im Browser komprimieren',
    ctaButtonLabel: 'PDF ohne Upload komprimieren',
    relatedToolSlugs: ['pdf-schwaerzen', 'pdf-metadaten-entfernen', 'bild-metadaten-entfernen'],
    relatedArticleSlugs: ['pdf-mit-passwort-schuetzen', 'pdf-metadaten-entfernen-vor-dem-versenden', 'bild-metadaten-exif-entfernen', 'pdf-richtig-schwaerzen', 'pdf-datei-verkleinern'],
    directAnswer: 'Bei Werkzeugen ohne Upload lädt der Browser nur den Programmcode, nicht Ihre Datei: Die Verarbeitung läuft per JavaScript und WebAssembly direkt auf Ihrem Gerät, und das Ergebnis entsteht lokal. Ihre Dokumente gelangen so nicht zum Anbieter. Überprüfen lässt sich das mit dem Netzwerk-Reiter der Entwicklertools oder einem Offline-Test.',
    steps: [
      { step: 1, title: 'Werkzeug öffnen', text: 'Öffnen Sie das gewünschte Werkzeug, etwa zum Komprimieren einer PDF. Der Browser lädt dabei den Programmcode der Seite.' },
      { step: 2, title: 'Datei lokal auswählen', text: 'Wählen Sie die Datei aus. Der Browser liest sie in den Arbeitsspeicher Ihres Geräts, ohne sie zu versenden.' },
      { step: 3, title: 'Verarbeitung auf Ihrem Gerät', text: 'Die Berechnung erfolgt auf Ihrem Prozessor. Die Dauer hängt deshalb von Ihrem Gerät und der Dateigröße ab.' },
      { step: 4, title: 'Ergebnis speichern', text: 'Das Ergebnis wird direkt im Browser erzeugt und als Download gespeichert. Löschen Sie nicht mehr benötigte Kopien anschließend aus dem Download-Ordner.' }
    ],
    sections: [
      {
        heading: 'Was passiert bei klassischen Online-Tools mit meiner Datei?',
        content: 'Bei klassischen Online-Tools wird Ihre Datei über das Internet an einen Server des Anbieters übertragen, dort verarbeitet und das Ergebnis zurückgeschickt. Das funktioniert zuverlässig, bedeutet aber, dass Ihre Datei – vielleicht ein Arbeitsvertrag, ein Befund oder eine Steuererklärung – für eine gewisse Zeit auf fremder Infrastruktur liegt.\n\nDaraus ergeben sich Fragen, die Sie als Nutzer kaum überprüfen können: In welchem Land steht der Server? Wer hat Zugriff? Wann wird die Datei wirklich gelöscht? Werden Inhalte ausgewertet? Auch eine verschlüsselte Verbindung per HTTPS ändert daran nichts, denn sie schützt nur den Transport, nicht die Verarbeitung beim Empfänger.\n\nFür Unternehmen kommt hinzu: Werden personenbezogene Daten auf diese Weise verarbeitet, handelt es sich nach der DSGVO in der Regel um eine Auftragsverarbeitung, für die ein entsprechender Vertrag nötig ist.'
      },
      {
        heading: 'Wie funktioniert die Verarbeitung im Browser?',
        content: 'Bei der Verarbeitung im Browser übernimmt Ihr eigenes Gerät die Rechenarbeit, die sonst ein Server erledigt. Ein Werkzeug ohne Upload nutzt das so:\n\n1. Beim Aufruf der Seite lädt der Browser den Programmcode, also JavaScript und oft WebAssembly-Module. Das sind kompilierte Programmbibliotheken, etwa zum Lesen und Schreiben von PDFs.\n2. Wenn Sie eine Datei auswählen, liest der Browser sie über die File-API in den Arbeitsspeicher. Die Datei bleibt dabei auf Ihrem Gerät.\n3. Der Code verarbeitet die Daten lokal, zum Beispiel beim [PDF komprimieren](tool:pdf-komprimieren).\n4. Das Ergebnis wird im Browser als neue Datei erzeugt und als Download bereitgestellt.\n\nDie wichtigsten Unterschiede im Überblick:\n\n| Merkmal | Verarbeitung auf einem Server | Lokale Verarbeitung im Browser |\n|---|---|---|\n| Wo liegt die Datei? | zeitweise beim Anbieter | nur auf Ihrem Gerät |\n| Anbieter erhält den Inhalt | ja | nein |\n| Auftragsverarbeitungsvertrag nötig | bei personenbezogenen Daten in der Regel ja | für die Dateien in der Regel nein |\n| Geschwindigkeit hängt ab von | Upload und Serverleistung | Leistung Ihres Geräts |\n\nSo arbeitet Datei Tools bei allen Werkzeugen, etwa mit WebAssembly-Fassungen von qpdf, FFmpeg oder Tesseract. Besonders bei sensiblen Aufgaben wie [PDF schwärzen](tool:pdf-schwaerzen) oder dem Entfernen von Metadaten ist das ein wesentlicher Unterschied.'
      },
      {
        heading: 'Wie prüfe ich selbst, ob ein Werkzeug meine Datei überträgt?',
        content: 'Ob ein Online-Werkzeug Ihre Datei überträgt, prüfen Sie mit zwei einfachen Tests – Sie müssen keinem Anbieter blind vertrauen.\n\n**Netzwerk-Test:** Öffnen Sie die Entwicklertools des Browsers mit F12 bzw. unter macOS mit Befehlstaste+Wahltaste+I und wechseln Sie zum Reiter „Netzwerk“. Verarbeiten Sie nun eine Datei. Wird sie an einen Server geschickt, sehen Sie eine ausgehende Anfrage, deren Größe ungefähr der Dateigröße entspricht. Bei lokaler Verarbeitung erscheint keine solche Anfrage.\n\n**Offline-Test:** Laden Sie die Seite, öffnen Sie das Werkzeug einmal, trennen Sie dann die Internetverbindung, etwa per Flugmodus, und verarbeiten Sie eine Datei. Funktioniert es weiterhin, findet die Verarbeitung auf Ihrem Gerät statt. Einschränkung: Manche Werkzeuge laden benötigte Programmteile erst beim ersten Einsatz nach, deshalb sollten Sie das Werkzeug vorher einmal mit Verbindung benutzen.'
      },
      {
        heading: 'Worauf sollte ich bei Online-Werkzeugen achten?',
        content: 'Entscheidend ist, wo verarbeitet wird und wer den Dienst betreibt. Diese Fragen helfen bei der Einschätzung, egal ob lokal oder serverbasiert:\n\n- **Wo wird verarbeitet?** Lokal im Browser oder auf einem Server? Steht das klar in der Datenschutzerklärung?\n- **Wer betreibt den Dienst?** Gibt es ein Impressum mit Anschrift und eine nachvollziehbare Datenschutzerklärung?\n- **Was passiert mit den Dateien?** Bei Server-Diensten: Löschfristen, Serverstandort, Zugriffsrechte.\n- **Welche Dritten sind eingebunden?** Werbenetzwerke und Analysewerkzeuge zeigen sich oft im Cookie-Banner.\n- **Brauchen Sie ein Konto?** Für einfache Umwandlungen ist eine Registrierung selten nötig.\n- **Für Unternehmen:** Gibt es bei Server-Diensten einen Vertrag zur Auftragsverarbeitung?\n\nBei lokal arbeitenden Werkzeugen erhält der Anbieter den Dateiinhalt nicht, die Frage nach der Auftragsverarbeitung stellt sich für die Dateien daher in der Regel nicht. Ob ein Werkzeug im Unternehmen eingesetzt werden darf, entscheidet aber weiterhin Ihre IT-Richtlinie oder Ihr Datenschutzbeauftragter.'
      },
      {
        heading: 'Wo liegen die Grenzen der lokalen Verarbeitung?',
        content: 'Lokale Verarbeitung löst nicht jedes Datenschutzproblem. Beachten Sie diese Punkte:\n\n- **Die Webseite selbst** wird weiterhin von einem Server geladen. Dabei fallen technische Daten wie Ihre IP-Adresse an, und je nach Seite kommen Statistik- oder Einwilligungswerkzeuge hinzu.\n- **Browser-Erweiterungen** können den Inhalt von Webseiten lesen. Nutzen Sie für sensible Dateien einen Browser ohne fragwürdige Erweiterungen.\n- **Ihr Gerät** muss vertrauenswürdig sein. Schadsoftware auf dem Rechner gefährdet Dateien unabhängig vom Werkzeug.\n- **Leistung:** Sehr große Videos oder PDFs mit hunderten Seiten können auf älteren Smartphones lange dauern oder an Speichergrenzen stoßen.\n- **Downloads bleiben liegen:** Bereinigen Sie den Download-Ordner, wenn Sie Kopien nicht mehr brauchen.\n\nUnd: Ein lokales Werkzeug schützt nicht vor dem Inhalt der Datei selbst. Bevor Sie Dokumente weitergeben, lohnt sich ein Blick auf versteckte Angaben, wie in den Ratgebern [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden) und [EXIF-Daten aus Fotos entfernen](blog:bild-metadaten-exif-entfernen) beschrieben. Für den Versand selbst empfiehlt sich bei vertraulichen Inhalten ein Passwort, wie im Beitrag [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen) erklärt.'
      }
    ],
    faqs: [
      { question: 'Woran erkenne ich, ob ein Online-Tool meine Datei an einen Server sendet?', answer: 'Beobachten Sie im Netzwerk-Reiter der Entwicklertools, ob beim Verarbeiten eine große ausgehende Anfrage entsteht. Alternativ testen Sie, ob das Werkzeug nach dem Laden auch offline funktioniert.' },
      { question: 'Ist ein Werkzeug ohne Upload automatisch DSGVO-konform?', answer: 'Es vermeidet die Übertragung Ihrer Dateien, was ein großer Vorteil ist. Für die Webseite selbst gelten aber weiterhin Datenschutzpflichten, etwa beim Einsatz von Cookies oder Statistikdiensten. Prüfen Sie deshalb auch die Datenschutzerklärung.' },
      { question: 'Warum ist die Verarbeitung auf meinem Handy langsamer als am PC?', answer: 'Weil Ihr Gerät die gesamte Rechenarbeit übernimmt. Smartphones haben meist weniger Leistung und Arbeitsspeicher als Computer, was sich bei großen Dateien bemerkbar macht.' },
      { question: 'Brauche ich für Datei Tools eine Internetverbindung?', answer: 'Zum Laden der Seite und der benötigten Programmteile ja. Die eigentliche Verarbeitung Ihrer Dateien findet anschließend auf Ihrem Gerät statt.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  }
];
