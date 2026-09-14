import { ToolDefinition } from '@/types/tool';
import { UTILITIES_TOOLS } from './utilities.config';
import { MEDIA_ARCHIVE_TOOLS } from './media_archive.config';

export const TOOLS_CONFIG: ToolDefinition[] = [
  // ==========================================
  // PDF CORE SUITE
  // ==========================================
  {
    id: 'pdf-zusammenfuegen',
    slug: 'pdf-zusammenfuegen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF zusammenfügen',
    shortDescriptionDe: 'Fügen Sie mehrere PDF-Dateien in der gewünschten Reihenfolge zu einem einzigen Dokument zusammen – schnell, sicher und direkt im Browser.',
    titleDe: 'PDF zusammenfügen – kostenlos mehrere PDFs verbinden | CoolWave',
    metaDescriptionDe: 'Mehrere PDF-Dateien kostenlos und sekundenschnell online zusammenfügen. Reihenfolge per Drag-and-Drop anpassen. 100% Datenschutz ohne Upload zum Server.',
    h1De: 'PDF zusammenfügen – kostenlos online verbinden',
    introDe: 'Mit dem CoolWave PDF-Zusammenfügen-Tool kombinieren Sie zwei oder mehr PDF-Dokumente blitzschnell zu einer einzigen Datei. Die Bearbeitung findet zu 100% lokal auf Ihrem Endgerät statt: Ihre vertraulichen Dokumente verlassen niemals Ihren Computer oder Ihr Smartphone. Ordnen Sie die Seiten einfach per Drag-and-Drop an und laden Sie Ihr fertiges PDF mit einem Klick herunter.',
    howItWorksDe: [
      { step: 1, title: 'PDFs auswählen', text: 'Ziehen Sie Ihre PDF-Dateien in den Upload-Bereich oder wählen Sie diese von Ihrem Gerät aus.' },
      { step: 2, title: 'Reihenfolge sortieren', text: 'Verschieben Sie die Vorschaublöcke per Drag-and-Drop in die von Ihnen gewünschte Reihenfolge.' },
      { step: 3, title: 'Zusammenfügen & Download', text: 'Klicken Sie auf „PDF zusammenfügen“ und laden Sie Ihr fertiges Gesamtdokument sofort herunter.' }
    ],
    faqDe: [
      { question: 'Ist das Zusammenfügen von PDFs kostenlos?', answer: 'Ja, Sie können beliebig viele PDF-Dateien vollständig kostenlos und ohne Registrierung kombinieren.' },
      { question: 'Werden meine Dateien auf Ihren Server hochgeladen?', answer: 'Nein! Dieses Tool nutzt moderne Browser-Technologie (pdf-lib). Die Dateien verbleiben vollständig in Ihrem lokalen Arbeitsspeicher.' },
      { question: 'Gibt es eine Beschränkung der Seitenzahl?', answer: 'In der kostenlosen Version können Sie Dokumente bis zu 50 MB zusammenführen, was typischerweise mehreren hundert Seiten entspricht.' },
      { question: 'Funktioniert das Tool auch auf dem Smartphone?', answer: 'Ja, CoolWave ist uneingeschränkt auf allen mobilen Browsern wie Safari (iOS) und Chrome (Android) nutzbar.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Eine der ausgewählten PDF-Dateien lässt sich nicht hinzufügen oder wirft einen Fehler.',
        solution: 'Überprüfen Sie, ob die Datei mit einem Passwort geschützt oder beschädigt ist. Entsperren Sie geschützte Dateien zuerst mit unserem Tool „PDF entsperren“.'
      },
      {
        issue: 'Die Reihenfolge der Seiten im fertigen Dokument stimmt nicht.',
        solution: 'Nutzen Sie vor dem Klick auf „Zusammenfügen“ die Pfeiltasten oder das Drag-and-Drop-Feld in der Dateiliste, um die Reihenfolge exakt festzulegen.'
      }
    ],
    privacyExplanationDe: '100% clientseitige Ausführung via WebAssembly / pdf-lib. Es findet kein Netzwerk-Upload der Dokumentinhalte statt. Ihre sensiblen Daten verbleiben vollständig in Ihrer lokalen Browser-Sandbox.',
    searchKeywordsDe: ['PDF verbinden', 'PDF zusammenbinden', 'Mehrere PDFs zu einer', 'PDF kombinieren'],
    supportedFormats: 'PDF zu PDF (Mehrfachauswahl)',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 20 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 100 },
    processingEngine: 'pdf-merge',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-teilen', 'pdf-komprimieren', 'pdf-bearbeiten', 'pdf-drehen', 'word-in-pdf-umwandeln'],
    icon: 'Combine',
    status: 'active',
    badge: 'Beliebt',
    features: [
      'Beliebige Anzahl an PDF-Dokumenten gleichzeitig verbinden',
      'Visuelle Dateiliste und intuitive Reihenfolge per Drag-and-Drop',
      '100% Datenschutz: Lokale Verarbeitung direkt im Browser',
      'Keine Dateiverluste oder Qualitätsminderung',
      'Funktioniert auf allen Plattformen ohne Installation'
    ]
  },
  {
    id: 'pdf-teilen',
    slug: 'pdf-teilen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf', '.zip'],
    nameDe: 'PDF teilen',
    shortDescriptionDe: 'Trennen Sie einzelne Seiten aus einer PDF-Datei heraus oder teilen Sie ein großes Dokument in handliche Einzeldateien auf.',
    titleDe: 'PDF teilen – Seiten einzeln oder als Bereich trennen | CoolWave',
    metaDescriptionDe: 'PDF-Dateien kostenlos online aufteilen. Wählen Sie einzelne Seiten oder Seitenbereiche aus und extrahieren Sie diese blitzschnell direkt im Browser.',
    h1De: 'PDF teilen & Seiten extrahieren',
    introDe: 'Mit dem CoolWave PDF-Splitter zerlegen Sie umfangreiche PDF-Dateien nach Ihren Vorgaben. Wählen Sie gezielt Seitenbereiche (z. B. Seite 1-3, 5) oder extrahieren Sie jede Seite als separates Dokument. Alles geschieht sicher in Ihrem Browser ohne Weitergabe an Dritte.',
    howItWorksDe: [
      { step: 1, title: 'PDF öffnen', text: 'Laden Sie das PDF-Dokument hoch, das Sie aufteilen möchten.' },
      { step: 2, title: 'Modus & Seiten festlegen', text: 'Geben Sie den gewünschten Seitenbereich ein (z. B. 1-3) oder wählen Sie „Alle Seiten einzeln extrahieren“.' },
      { step: 3, title: 'Download starten', text: 'Laden Sie das extrahierte PDF oder das praktische ZIP-Archiv mit allen Einzelseiten herunter.' }
    ],
    faqDe: [
      { question: 'Kann ich nur bestimmte Seiten aus dem PDF entnehmen?', answer: 'Ja, mit der Bereichsauswahl (z. B. „2-5“) extrahieren Sie exakt die gewünschten Einzelseiten.' },
      { question: 'Wie erhalte ich alle Seiten als separate Dokumente?', answer: 'Wählen Sie die Option „Jede Seite als separates PDF“, um ein kompaktes ZIP-Archiv mit allen Einzelseiten zu erhalten.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Der angegebene Seitenbereich wird als ungültig markiert.',
        solution: 'Stellen Sie sicher, dass die Seitenzahlen die Gesamtseitenzahl des Dokuments nicht überschreiten (z. B. nicht Seite 15 anfordern, wenn das PDF nur 10 Seiten hat).'
      }
    ],
    privacyExplanationDe: 'Lokale Zerlegung direkt im Browser-Speicher. Das Dokument wird zu keinem Zeitpunkt an externe Server übertragen.',
    searchKeywordsDe: ['PDF trennen', 'PDF Seiten extrahieren', 'PDF aufteilen', 'Einzelseiten aus PDF speichern'],
    supportedFormats: 'PDF zu PDF oder ZIP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-split',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-zusammenfuegen', 'pdf-komprimieren', 'pdf-drehen'],
    icon: 'Split',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'pdf-seiten-extrahieren',
    slug: 'pdf-seiten-extrahieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Seiten extrahieren',
    shortDescriptionDe: 'Wählen Sie gezielt einzelne Seiten oder Seitenbereiche aus einer PDF aus und speichern Sie diese als neues Dokument.',
    titleDe: 'PDF Seiten extrahieren – Einzelseiten kostenlos als PDF speichern | CoolWave',
    metaDescriptionDe: 'Extrahieren Sie gezielt bestimmte Seiten aus einer PDF-Datei. Bereich eingeben oder Seiten anklicken. Schnell, kostenlos und 100% datenschutzkonform.',
    h1De: 'PDF Seiten extrahieren – Einzelseiten gezielt speichern',
    introDe: 'Benötigen Sie aus einem umfangreichen Bericht nur bestimmte Seiten oder die Zusammenfassung? Mit dem CoolWave Seiten-Extraktor wählen Sie die gewünschten Seiten per Klick oder Bereichsangabe (z. B. 1, 3-5) aus und erstellen sofort ein kompaktes neues PDF.',
    howItWorksDe: [
      { step: 1, title: 'PDF laden', text: 'Wählen Sie das PDF-Dokument aus.' },
      { step: 2, title: 'Seiten bestimmen', text: 'Klicken Sie auf die gewünschten Seiten oder geben Sie z. B. „1, 3-5“ ein.' },
      { step: 3, title: 'Extrahiertes PDF speichern', text: 'Klicken Sie auf Extrahiertes PDF erstellen und laden Sie das Ergebnis herunter.' }
    ],
    faqDe: [
      { question: 'Bleibt die Original-PDF unverändert?', answer: 'Ja, Ihr Originaldokument auf Ihrem Computer bleibt unberührt. Es wird eine neue PDF mit den ausgewählten Seiten generiert.' },
      { question: 'Kann ich mehrere nicht zusammenhängende Seiten wählen?', answer: 'Ja, tragen Sie kommagetrennte Einzelseiten oder Bereiche ein (z. B. „1, 4, 7-9“).' }
    ],
    troubleshootingDe: [
      {
        issue: 'Seitenzahlen sind nicht fortlaufend im neuen Dokument.',
        solution: 'Das extrahierte PDF nummeriert die ausgewählten Seiten im neuen Dokument von 1 aufsteigend durch.'
      }
    ],
    privacyExplanationDe: '100% lokale Browser-Verarbeitung mit pdf-lib.',
    searchKeywordsDe: ['Einzelseiten aus PDF speichern', 'PDF Seiten herauslösen', 'Bestimmte Seiten aus PDF ziehen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-organize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-teilen', 'pdf-seiten-loeschen', 'pdf-zusammenfuegen'],
    icon: 'Scissors',
    status: 'active',
    badge: 'Neu'
  },
  {
    id: 'pdf-seiten-loeschen',
    slug: 'pdf-seiten-loeschen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Seiten löschen',
    shortDescriptionDe: 'Entfernen Sie überflüssige, leere oder vertrauliche Seiten aus Ihrem PDF-Dokument mit einem Klick.',
    titleDe: 'PDF Seiten löschen – unerwünschte Seiten online entfernen | CoolWave',
    metaDescriptionDe: 'Löschen Sie einzelne oder mehrere Seiten dauerhaft aus einer PDF-Datei. Seiten per Klick markieren und bereinigtes Dokument sofort herunterladen.',
    h1De: 'PDF Seiten löschen – überflüssige Seiten entfernen',
    introDe: 'Befinden sich in Ihrem Scan leere Rückseiten oder vertrauliche Anhänge, die nicht für Dritte bestimmt sind? Markieren Sie die ungewünschten Seiten in der visuellen Übersicht und entfernen Sie diese unwiderruflich aus dem PDF.',
    howItWorksDe: [
      { step: 1, title: 'PDF öffnen', text: 'Laden Sie Ihre Datei in das Lösch-Werkzeug.' },
      { step: 2, title: 'Seiten zum Löschen markieren', text: 'Klicken Sie auf alle Seiten, die entfernt werden sollen (werden rot markiert).' },
      { step: 3, title: 'Bereinigtes PDF speichern', text: 'Klicken Sie auf „Seiten löschen & PDF speichern“.' }
    ],
    faqDe: [
      { question: 'Kann ich versehentlich gelöschte Seiten wiederherstellen?', answer: 'Ihr Ausgangsdokument auf Ihrer Festplatte bleibt unangetastet. Sie können den Vorgang jederzeit erneut starten.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Fehlermeldung „Sie können nicht alle Seiten löschen“.',
        solution: 'Ein PDF-Dokument muss mindestens eine verbleibende Seite enthalten.'
      }
    ],
    privacyExplanationDe: '100% lokale Seitenbereinigung im Browser. Keine Datenübertragung.',
    searchKeywordsDe: ['PDF Seite entfernen', 'Leere Seiten aus PDF löschen', 'PDF Seiten rausschneiden'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-organize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-seiten-extrahieren', 'pdf-seiten-neu-anordnen', 'pdf-zusammenfuegen'],
    icon: 'Trash2',
    status: 'active'
  },
  {
    id: 'pdf-seiten-neu-anordnen',
    slug: 'pdf-seiten-neu-anordnen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF-Seiten neu anordnen',
    shortDescriptionDe: 'Sortieren Sie durcheinander geratene Seiten in Ihrer PDF-Datei intuitiv in die richtige Lesereihenfolge.',
    titleDe: 'PDF-Seiten neu anordnen – Seitenreihenfolge online sortieren | CoolWave',
    metaDescriptionDe: 'Seitenreihenfolge in PDF-Dateien kostenlos online ändern. Verschieben Sie Seiten nach links oder rechts und speichern Sie die neue Sortierung.',
    h1De: 'PDF-Seiten neu anordnen – Reihenfolge intuitiv sortieren',
    introDe: 'Wurden Seiten beim Einscannen vertauscht oder soll ein Deckblatt an den Anfang gestellt werden? Mit CoolWave verschieben Sie PDF-Seiten per Pfeilklick an die richtige Position und erzeugen ein logisch sortiertes Gesamtdokument.',
    howItWorksDe: [
      { step: 1, title: 'PDF laden', text: 'Öffnen Sie Ihr Dokument in der Sortier-Übersicht.' },
      { step: 2, title: 'Positionen verschieben', text: 'Nutzen Sie die Pfeiltasten unter jeder Seite, um sie an die gewünschte Position zu setzen.' },
      { step: 3, title: 'Neue Reihenfolge sichern', text: 'Klicken Sie auf Download, um das sortierte PDF zu speichern.' }
    ],
    faqDe: [
      { question: 'Werden Formatierungen und Lesezeichen beibehalten?', answer: 'Ja, alle Seiteninhalte und Vektorelemente werden in der neuen Reihenfolge exakt erhalten.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Bei sehr vielen Seiten verliert man den Überblick.',
        solution: 'Jede Kachel zeigt deutlich die Original-Seitenzahl und die neue Zielposition an.'
      }
    ],
    privacyExplanationDe: '100% lokale Seitenverschiebung im Browser via pdf-lib.',
    searchKeywordsDe: ['PDF Seiten sortieren', 'PDF Reihenfolge ändern', 'Seitenreihenfolge PDF anpassen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-organize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-zusammenfuegen', 'pdf-teilen', 'pdf-drehen'],
    icon: 'Layers',
    status: 'active'
  },
  {
    id: 'pdf-komprimieren',
    slug: 'pdf-komprimieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF komprimieren',
    shortDescriptionDe: 'Verkleinern Sie Ihre PDF-Dateien für den E-Mail-Versand oder Online-Uploads, ohne sichtbare Qualitätsverluste bei Text und Grafiken.',
    titleDe: 'PDF komprimieren – PDF kostenlos online verkleinern | CoolWave',
    metaDescriptionDe: 'PDF-Dateigröße online reduzieren bei bester Qualität. Transparente Anzeige der Ersparnis in % und MB. 100% datenschutzkonform im Browser.',
    h1De: 'PDF komprimieren – Dateigröße kostenlos verkleinern',
    introDe: 'Große PDF-Dateien sind oft zu sperrig für E-Mail-Anhänge oder Web-Portale. Mit CoolWave komprimieren Sie Ihre PDFs effizient. Wählen Sie zwischen starker, mittlerer oder leichter Kompression. Nach der Optimierung sehen Sie sofort die genaue Ersparnis in Megabyte und Prozent.',
    howItWorksDe: [
      { step: 1, title: 'PDF einfügen', text: 'Ziehen Sie die zu verkleinernde PDF-Datei in das Tool.' },
      { step: 2, title: 'Komprimierungsstufe wählen', text: 'Wählen Sie zwischen Starker (maximale Reduktion), Ausgewogener (empfohlen) oder Leichter Kompression.' },
      { step: 3, title: 'Optimiertes PDF herunterladen', text: 'Sehen Sie Ihre Ersparnis (z. B. „68% kleiner“) und laden Sie die Datei herunter.' }
    ],
    faqDe: [
      { question: 'Leidet die Textschärfe unter der Kompression?', answer: 'Nein. Vektortext bleibt gestochen scharf. Die Optimierung zielt auf redundante Datenstrukturen, ungenutzte Schriftarten und Bild-Streams ab.' },
      { question: 'Wie viel Speicherplatz kann eingespart werden?', answer: 'Je nach Inhalt der PDF sind Einsparungen zwischen 30% und bis zu 80% üblich.' },
      { question: 'Werden meine Daten vertraulich behandelt?', answer: 'Absolut. Da die Komprimierung direkt in Ihrem Webbrowser berechnet wird, verlassen Ihre Daten zu keinem Zeitpunkt Ihr Gerät.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Datei wird kaum kleiner (nur wenige Prozent Ersparnis).',
        solution: 'Wenn das PDF fast ausschließlich reinen Vektortext enthält oder bereits voroptimiert wurde, lässt sich die Dateigröße nicht weiter verlustfrei schrumpfen. Bei PDFs mit vielen Scans erzielen Sie die höchste Reduktion.'
      },
      {
        issue: 'Das PDF ist nach der Komprimierung für den Druck ungeeignet.',
        solution: 'Wählen Sie die Stufe „Leichte Kompression“, um eine höhere Bildauflösung für den Druck beizubehalten.'
      }
    ],
    privacyExplanationDe: '100% lokale Optimierung im Browser. Ihre Dokumente verbleiben auf Ihrem Computer.',
    searchKeywordsDe: ['PDF verkleinern', 'PDF-Dateigröße reduzieren', 'PDF kleiner machen für E-Mail', 'PDF KB verringern'],
    supportedFormats: 'PDF Optimierung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 25 },
    processingEngine: 'pdf-compress',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-zusammenfuegen', 'pdf-in-word-umwandeln', 'pdf-in-jpg-umwandeln'],
    icon: 'Minimize2',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'pdf-bearbeiten',
    slug: 'pdf-bearbeiten',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF bearbeiten',
    shortDescriptionDe: 'Vollwertiger PDF-Editor: Fügen Sie Text, Freihandzeichnungen, Formen, Unterschriften, Datumsstempel und Schwärzungen direkt in Ihre PDF ein.',
    titleDe: 'PDF bearbeiten – kostenloser Online-PDF-Editor | CoolWave',
    metaDescriptionDe: 'Kostenloser Online-PDF-Editor: Text einfügen, Zeichnen, Formen platzieren, Schwärzen und Unterschreiben. Direkt im Browser ohne Registrierung.',
    h1De: 'PDF bearbeiten – kostenloser Online-Editor',
    introDe: 'Korrigieren oder ergänzen Sie PDF-Dokumente direkt im Browser. Unser moderner PDF-Editor erlaubt das Hinzufügen von Textblöcken, Freihand-Skizzen, Rechtecken, Pfeilen, vertraulichen Schwärzungen und Genehmigungs-Stempeln. Alles wird sauber direkt in die PDF eingebrannt.',
    howItWorksDe: [
      { step: 1, title: 'PDF laden', text: 'Öffnen Sie Ihr PDF-Dokument im interaktiven Editor.' },
      { step: 2, title: 'Werkzeug wählen & bearbeiten', text: 'Wählen Sie Text, Stift, Form, Schwärzung oder Stempel in der oberen Leiste und platzieren Sie die Elemente.' },
      { step: 3, title: 'Änderungen speichern', text: 'Klicken Sie auf „Änderungen anwenden & Download“, um das fertige PDF herunterzuladen.' }
    ],
    faqDe: [
      { question: 'Kann ich bestehenden Text im PDF überschreiben?', answer: 'Verwenden Sie das Schwärzungs-/Abdeck-Werkzeug (Weißer Kasten), um bestehenden Text zu überdecken, und platzieren Sie neuen Text darüber.' },
      { question: 'Ist meine Unterschrift sicher?', answer: 'Ja, die Zeichnung wird lokal in Ihrem Browser generiert und nicht an externe Server übertragen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Der hinzugefügte Text sitzt nicht an der gewünschten Stelle.',
        solution: 'Klicken Sie auf das Textfeld, um es zu verschieben oder die Schriftgröße in den Werkzeugoptionen anzupassen.'
      },
      {
        issue: 'Elemente verschwinden beim Speichern.',
        solution: 'Stellen Sie sicher, dass Sie vor dem Download auf „Änderungen anwenden & Download“ klicken, damit die Canvas-Ebene in das PDF eingebrannt wird.'
      }
    ],
    privacyExplanationDe: 'Vollständige Bearbeitung auf Canvas-Basis direkt im Browser. Keine Speicherung extern.',
    searchKeywordsDe: ['PDF Editor online', 'PDF ausfüllen', 'PDF Text hinzufügen', 'PDF schwärzen'],
    supportedFormats: 'PDF Bearbeitung',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 5 },
    processingEngine: 'pdf-editor',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-unterschreiben', 'pdf-komprimieren', 'pdf-zusammenfuegen'],
    icon: 'Edit3',
    status: 'active',
    badge: 'Neu'
  },
  {
    id: 'pdf-unterschreiben',
    slug: 'pdf-unterschreiben',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF unterschreiben',
    shortDescriptionDe: 'Unterschreiben Sie Verträge, Anträge und Dokumente digital ohne Ausdrucken und Einscannen.',
    titleDe: 'PDF unterschreiben – digital signieren online kostenlos | CoolWave',
    metaDescriptionDe: 'PDF-Dokumente kostenlos online unterschreiben. Unterschrift per Maus oder Touchpad zeichnen und direkt ins Dokument einfügen. 100% datenschutzkonform.',
    h1De: 'PDF unterschreiben – digital & rechtssicher vorbereiten',
    introDe: 'Unterschreiben Sie Dokumente in Sekundenschnelle ohne Drucker oder Scanner. Zeichnen Sie Ihre Signatur mit der Maus, dem Finger oder Stift auf dem Touchscreen und platzieren Sie diese präzise auf der gewünschten Vertragsseite.',
    howItWorksDe: [
      { step: 1, title: 'Dokument öffnen', text: 'Laden Sie das zu unterzeichnende PDF-Dokument hoch.' },
      { step: 2, title: 'Signatur zeichnen', text: 'Wählen Sie das Stift-Werkzeug und zeichnen Sie Ihre Unterschrift.' },
      { step: 3, title: 'Signiertes PDF laden', text: 'Klicken Sie auf Download, um das rechtswirksam vorbereitete Dokument zu speichern.' }
    ],
    faqDe: [
      { question: 'Ist eine elektronische Unterschrift rechtlich gültig?', answer: 'Für die meisten Verträge und Vereinbarungen des täglichen Lebens genügt die einfache elektronische Form nach eIDAS.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Unterschrift wirkt zittrig.',
        solution: 'Öffnen Sie das Dokument auf einem Smartphone oder Tablet, um Ihre Signatur flüssig mit dem Finger oder Eingabestift zu zeichnen.'
      }
    ],
    privacyExplanationDe: 'Ihre Unterschrift verlässt Ihr Gerät zu keinem Zeitpunkt. Lokale Einbettung in die PDF-Struktur.',
    searchKeywordsDe: ['PDF signieren', 'Vertrag online unterschreiben', 'PDF elektronisch unterschreiben'],
    supportedFormats: 'PDF Signatur',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 5 },
    processingEngine: 'pdf-sign',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-bearbeiten', 'pdf-schuetzen', 'pdf-signieren'],
    icon: 'PenTool',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'pdf-drehen',
    slug: 'pdf-drehen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF drehen',
    shortDescriptionDe: 'Bringen Sie falsch gescannte oder querliegende PDF-Seiten schnell in die richtige Leseposition.',
    titleDe: 'PDF drehen – Seiten dauerhaft um 90°, 180° rotieren | CoolWave',
    metaDescriptionDe: 'PDF-Seiten kostenlos online drehen. Drehen Sie das gesamte Dokument oder einzelne Seiten um 90, 180 oder 270 Grad. Sofort speichern.',
    h1De: 'PDF drehen – Ausrichtung dauerhaft korrigieren',
    introDe: 'Falsch ausgerichtete Scans oder Querformat-Seiten lassen sich mit CoolWave im Handumdrehen rotieren. Drehen Sie Ihr Dokument um 90°, 180° oder 270° im Uhrzeigersinn. Die Ausrichtung wird dauerhaft in den Metadaten des PDFs gespeichert.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie Ihre Datei in das Dreh-Werkzeug.' },
      { step: 2, title: 'Winkel wählen', text: 'Klicken Sie auf 90° rechts, 180° oder 270°, um die gewünschte Ansicht einzustellen.' },
      { step: 3, title: 'Gedrehtes PDF speichern', text: 'Laden Sie Ihr dauerhaft korrekt ausgerichtetes Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Wird das PDF dauerhaft gedreht gespeichert?', answer: 'Ja, der Drehwinkel wird im PDF-Header fest verankert, sodass die Datei in allen PDF-Viewern korrekt geöffnet wird.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das PDF öffnet sich in Acrobat immer noch quer.',
        solution: 'Stellen Sie sicher, dass Sie nach der Drehung auf „PDF dauerhaft drehen“ geklickt und die neu heruntergeladene Datei geöffnet haben.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Header-Modifikation.',
    searchKeywordsDe: ['PDF Seiten drehen', 'PDF rotieren online', 'PDF Querformat in Hochformat'],
    supportedFormats: 'PDF Drehung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'pdf-rotate',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-zusammenfuegen', 'pdf-teilen'],
    icon: 'RotateCw',
    status: 'active'
  },
  {
    id: 'pdf-schuetzen',
    slug: 'pdf-schuetzen',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF schützen',
    shortDescriptionDe: 'Verhindern Sie unbefugten Zugriff auf vertrauliche Dokumente durch Vergabe eines sicheren Öffnungspassworts.',
    titleDe: 'PDF schützen – PDF mit Passwort verschlüsseln | CoolWave',
    metaDescriptionDe: 'Schützen Sie vertrauliche PDF-Dateien mit einem starken Passwort. Sichere Verschlüsselung direkt im Browser ohne Server-Upload.',
    h1De: 'PDF schützen & mit Passwort verschlüsseln',
    introDe: 'Sichern Sie sensible Verträge, Gehaltsabrechnungen oder persönliche Unterlagen vor neugierigen Blicken. Mit CoolWave vergeben Sie ein sicheres Öffnungskennwort, das vor jedem Ansehen der Datei abgefragt wird.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie das zu schützende Dokument hoch.' },
      { step: 2, title: 'Passwort vergeben', text: 'Geben Sie Ihr gewünschtes Kennwort ein und bestätigen Sie es.' },
      { step: 3, title: 'Geschütztes PDF herunterladen', text: 'Laden Sie Ihre verschlüsselte Datei herunter.' }
    ],
    faqDe: [
      { question: 'Kann CoolWave mein vergessenes Passwort wiederherstellen?', answer: 'Nein. Da die Verschlüsselung lokal erfolgt und wir Ihre Passwörter nicht speichern, sollten Sie Ihr Passwort an einem sicheren Ort notieren.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das Passwort wird beim Öffnen in älteren PDF-Readern nicht akzeptiert.',
        solution: 'Verwenden Sie Standardzeichen (Buchstaben, Ziffern) ohne seltene Sonderzeichen, um maximale Kompatibilität mit allen Leseprogrammen zu gewährleisten.'
      }
    ],
    privacyExplanationDe: 'Ende-zu-Ende-Sicherheit. Weder Ihr Passwort noch Ihre Datei werden an Server übermittelt.',
    searchKeywordsDe: ['PDF Passwort vergeben', 'PDF verschlüsseln online', 'PDF Kennwort einrichten'],
    supportedFormats: 'PDF Verschlüsselung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-protect',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-entsperren', 'pdf-bearbeiten'],
    icon: 'Lock',
    status: 'active',
    badge: 'DSGVO'
  },
  {
    id: 'pdf-entsperren',
    slug: 'pdf-entsperren',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF entsperren',
    shortDescriptionDe: 'Entfernen Sie das Öffnungskennwort aus einer geschützten PDF-Datei für den bequemen Zugriff ohne ständige Passworteingabe.',
    titleDe: 'PDF entsperren – Passwort aus PDF entfernen online | CoolWave',
    metaDescriptionDe: 'Entfernen Sie den Passwortschutz aus Ihren PDF-Dateien. Einmal Kennwort eingeben und ungeschütztes PDF dauerhaft herunterladen.',
    h1De: 'PDF entsperren & Passwortschutz entfernen',
    introDe: 'Nervt Sie die ständige Passworteingabe bei Ihren eigenen PDF-Unterlagen? Wenn Sie das Kennwort kennen, können Sie den Schutz mit CoolWave dauerhaft entfernen und das Dokument ungeschützt abspeichern.',
    howItWorksDe: [
      { step: 1, title: 'Geschütztes PDF laden', text: 'Ziehen Sie die passwortgeschützte PDF in das Tool.' },
      { step: 2, title: 'Passwort eingeben', text: 'Geben Sie das aktuelle Öffnungskennwort einmalig ein.' },
      { step: 3, title: 'Ungeschütztes PDF downloaden', text: 'Laden Sie die entsperrte Datei ohne Passwortabfrage herunter.' }
    ],
    faqDe: [
      { question: 'Funktioniert das Entsperren ohne Passwort?', answer: 'Aus Sicherheitsgründen müssen Sie das gültige Passwort kennen, um den Schutz dauerhaft aufzuheben.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Fehlermeldung „Falsches Passwort“.',
        solution: 'Achten Sie genau auf Groß- und Kleinschreibung sowie auf die Feststelltaste.'
      }
    ],
    privacyExplanationDe: 'Lokale Entschlüsselung im Browser-Arbeitsspeicher.',
    searchKeywordsDe: ['PDF Passwort entfernen', 'PDF Schutz aufheben', 'PDF entschlüsseln online'],
    supportedFormats: 'PDF Entschlüsselung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-unlock',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-schuetzen', 'pdf-passwort-entfernen', 'pdf-entschluesseln'],
    icon: 'Unlock',
    status: 'active'
  },
  {
    id: 'pdf-signieren',
    slug: 'pdf-signieren',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF signieren',
    shortDescriptionDe: 'Signieren Sie Verträge und PDF-Dokumente digital mit eigener Unterschrift und fälschungssicherer SHA-256 Integritätsprüfung.',
    titleDe: 'PDF signieren – kostenlos digital & elektronisch unterschreiben | CoolWave',
    metaDescriptionDe: 'PDF kostenlos online digital signieren. Eigene Unterschrift zeichnen, tippen oder hochladen. Mit Zeitstempel & SHA-256 Prüfmarke nach europäischen Standards.',
    h1De: 'PDF signieren – digital, schnell & rechtssicher',
    introDe: 'Bringen Sie Ihre verbindliche Unterschrift schnell und unkompliziert auf PDF-Dokumente. Zeichnen Sie per Maus oder Touchscreen, tippen Sie Ihren Namen in ansprechender Handschrift oder laden Sie ein Signaturbild hoch. Zusätzlich bettet CoolWave auf Wunsch eine kryptografische SHA-256 Prüfmarke mit exaktem Zeitstempel ein.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie das zu unterzeichnende Dokument in das Signatur-Tool hoch.' },
      { step: 2, title: 'Signatur erstellen', text: 'Zeichnen Sie Ihre Unterschrift, tippen Sie Ihren Namen oder laden Sie eine transparente Bilddatei hoch.' },
      { step: 3, title: 'Signiertes PDF laden', text: 'Klicken Sie auf „PDF jetzt signieren“ und laden Sie Ihr rechtssicher vorbereitetes Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Ist die Signatur mit CoolWave rechtlich bindend?', answer: 'Für die meisten vertraglichen Vereinbarungen des Alltags (z. B. Mietverträge, Angebote, Genehmigungen) ist die einfache elektronische Signatur gemäß eIDAS vollumfänglich anerkannt.' },
      { question: 'Wird meine Unterschrift auf fremden Servern gespeichert?', answer: 'Nein! CoolWave speichert Ihre Unterschrift niemals in Benutzerprofilen oder Datenbanken. Nach Abschluss der Verarbeitung wird der temporäre Speicher sofort gelöscht.' },
      { question: 'Was bedeutet der SHA-256 Integritätsstempel?', answer: 'Er berechnet einen eindeutigen mathematischen Fingerabdruck der Originaldatei, sodass spätere Manipulationen am Dokument sofort auffallen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die gezeichnete Unterschrift ist zu dick oder ungenau.',
        solution: 'Nutzen Sie die Tippen-Option für eine saubere Schriftart oder öffnen Sie das Tool auf einem Touch-Display (Tablet/Smartphone).'
      }
    ],
    privacyExplanationDe: 'Streng vertrauliche Verarbeitung. Keine Speicherung von Unterschriften oder Profilen.',
    searchKeywordsDe: ['PDF signieren online', 'PDF elektronisch unterschreiben', 'Vertrag digital unterschreiben', 'PDF Signatur einfügen'],
    supportedFormats: 'PDF mit Signatur',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'pdf-sign',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-unterschreiben', 'pdf-bearbeiten', 'pdf-schuetzen'],
    icon: 'CheckCircle',
    status: 'active',
    badge: 'Beliebt',
    features: [
      '3 Signatur-Modi: Zeichnen, Tippen oder Bild-Upload',
      'Integrierter SHA-256 Integritäts-Prüfstempel',
      'DSGVO-konforme, flüchtige Verarbeitung ohne Signaturspeicherung',
      'Perfekt für Verträge, Anträge, Kündigungen und Freigaben'
    ]
  },
  {
    id: 'pdf-passwort-entfernen',
    slug: 'pdf-passwort-entfernen',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF-Passwort entfernen',
    shortDescriptionDe: 'Heben Sie den Kennwortschutz einer geschützten PDF-Datei dauerhaft auf, um das Dokument frei zu verwenden.',
    titleDe: 'PDF-Passwort entfernen – Kennwortschutz online löschen | CoolWave',
    metaDescriptionDe: 'PDF-Passwort kostenlos online entfernen. Geben Sie Ihr bekanntes Dokumentenkennwort ein und speichern Sie die Datei dauerhaft ungeschützt.',
    h1De: 'PDF-Passwort entfernen – Schutz dauerhaft aufheben',
    introDe: 'Entfernen Sie das bekannte Öffnungspasswort aus Ihren PDF-Dokumenten, um diese ohne wiederholte Passworteingabe auf all Ihren Endgeräten öffnen, weiterleiten oder archivieren zu können.',
    howItWorksDe: [
      { step: 1, title: 'Geschütztes PDF hochladen', text: 'Wählen Sie Ihre passwortgeschützte PDF-Datei aus.' },
      { step: 2, title: 'Passwort eingeben', text: 'Tippen Sie das aktuelle Dokumentenkennwort ein.' },
      { step: 3, title: 'Passwortfreies PDF laden', text: 'Laden Sie das dauerhaft entsperrte PDF herunter.' }
    ],
    faqDe: [
      { question: 'Kann ich ein Passwort entfernen, das ich vergessen habe?', answer: 'Nein. Aus rechtlichen und sicherheitstechnischen Gründen muss das korrekte Passwort zur Entschlüsselung einmalig eingegeben werden.' },
      { question: 'Wird mein Passwort protokolliert?', answer: 'Niemals. Passwörter werden ausschließlich im flüchtigen Speicher zur Entschlüsselung verarbeitet und zu keinem Zeitpunkt geloggt oder gespeichert.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Fehlermeldung „Ungültiges Passwort“.',
        solution: 'Prüfen Sie eventuelle Leerzeichen am Anfang oder Ende des Kennworts sowie die Groß-/Kleinschreibung.'
      }
    ],
    privacyExplanationDe: 'Zero-Knowledge-Verarbeitung: Passwörter werden niemals geloggt oder auf Festplatte gespeichert.',
    searchKeywordsDe: ['PDF Passwort entfernen', 'PDF Kennwort löschen', 'PDF Passwort aufheben', 'PDF Entsperren'],
    supportedFormats: 'Passwortgeschütztes PDF zu ungeschütztem PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-unlock',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-entsperren', 'pdf-entschluesseln', 'pdf-schuetzen'],
    icon: 'Key',
    status: 'active'
  },
  {
    id: 'pdf-berechtigungen-aendern',
    slug: 'pdf-berechtigungen-aendern',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Berechtigungen ändern',
    shortDescriptionDe: 'Steuern Sie Zugriffsrechte für Drucken, Kopieren und Bearbeiten Ihrer PDF-Dokumente nach ISO-32000.',
    titleDe: 'PDF Berechtigungen ändern – Drucken, Kopieren & Bearbeiten steuern | CoolWave',
    metaDescriptionDe: 'PDF-Berechtigungen präzise festlegen. Schützen Sie Inhalte vor unerlaubtem Kopieren, Drucken oder Verändern mit granularen Sicherheitsflags.',
    h1De: 'PDF Berechtigungen ändern – Druck- & Kopierschutz anpassen',
    introDe: 'Legen Sie präzise fest, was Empfänger mit Ihren PDF-Dokumenten tun dürfen. Schränken Sie das Kopieren von Texten, das Ausdrucken in hoher Auflösung oder das Verändern von Inhalten gezielt ein.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie das gewünschte Dokument hoch.' },
      { step: 2, title: 'Rechte konfigurieren', text: 'Wählen Sie per Mausklick, ob Drucken, Kopieren oder Bearbeiten gestattet sein sollen.' },
      { step: 3, title: 'PDF speichern', text: 'Laden Sie das mit den neuen Zugriffsflags versehene PDF herunter.' }
    ],
    faqDe: [
      { question: 'Welche Berechtigungen können eingeschränkt werden?', answer: 'Sie können das Drucken, das Extrahieren/Kopieren von Texten und Grafiken sowie Änderungen am Dokumentinhalt unabhängig voneinander steuern.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Mein PDF-Betrachter ignoriert die Berechtigungseinschränkungen.',
        solution: 'Standardkonforme Programme wie Adobe Acrobat Reader beachten die ISO-32000 Flags vollständig. Manche Open-Source-Betrachter setzen optionale Rechte nicht strikt durch.'
      }
    ],
    privacyExplanationDe: 'Standardkonforme Sicherheitsmodifikation ohne Speicherung auf externen Servern.',
    searchKeywordsDe: ['PDF Berechtigungen einstellen', 'PDF Drucken verbieten', 'PDF Kopierschutz einrichten', 'PDF Rechte anpassen'],
    supportedFormats: 'PDF Berechtigungen',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-permissions',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-schuetzen', 'pdf-verschluesseln'],
    icon: 'ShieldCheck',
    status: 'active'
  },
  {
    id: 'pdf-verschluesseln',
    slug: 'pdf-verschluesseln',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF verschlüsseln',
    shortDescriptionDe: 'Verschlüsseln Sie PDF-Dateien mit modernem 128-Bit oder 256-Bit Standard nach ISO-32000.',
    titleDe: 'PDF verschlüsseln – hochsichere AES-Verschlüsselung online | CoolWave',
    metaDescriptionDe: 'PDFs mit sicherem AES-Standard verschlüsseln. Höchste Sicherheit für vertrauliche Geschäftsberichte und persönliche Daten.',
    h1De: 'PDF verschlüsseln – standardkonformer AES-Schutz',
    introDe: 'Schützen Sie Ihre sensiblen Geschäfts- und Privatdaten mit starker kryptografischer Chiffrierung. Verschlüsseln Sie Ihre PDF-Dokumente nach dem weltweiten ISO-32000 Sicherheitsstandard, sodass unbefugte Dritte ohne das Kennwort keinen Einblick erhalten.',
    howItWorksDe: [
      { step: 1, title: 'PDF ablegen', text: 'Ziehen Sie die zu verschlüsselnde Datei in den Arbeitsbereich.' },
      { step: 2, title: 'Passwort definieren', text: 'Geben Sie ein sicheres Kennwort ein.' },
      { step: 3, title: 'Verschlüsseltes PDF laden', text: 'Laden Sie das kryptografisch versiegelte PDF herunter.' }
    ],
    faqDe: [
      { question: 'Welcher Verschlüsselungsalgorithmus wird verwendet?', answer: 'Wir nutzen standardkonforme AES-Verschlüsselung nach ISO-32000 Spezifikation.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Wie erstelle ich ein sicheres Kennwort?',
        solution: 'Verwenden Sie mindestens 8 Zeichen mit einer Mischung aus Groß- und Kleinbuchstaben sowie Zahlen.'
      }
    ],
    privacyExplanationDe: 'Kryptografische Sicherheit. Passwörter werden zu keinem Zeitpunkt im Klartext gespeichert.',
    searchKeywordsDe: ['PDF AES verschlüsseln', 'PDF Chiffrierung', 'PDF sicher verschlüsseln', 'PDF Schutz'],
    supportedFormats: 'PDF Verschlüsselung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-protect',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-schuetzen', 'pdf-entschluesseln'],
    icon: 'Lock',
    status: 'active'
  },
  {
    id: 'pdf-entschluesseln',
    slug: 'pdf-entschluesseln',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF entschlüsseln',
    shortDescriptionDe: 'Entschlüsseln Sie passwortgeschützte PDFs durch Verifizierung des Schlüssels und entfernen Sie die Chiffrierung.',
    titleDe: 'PDF entschlüsseln – gesicherte PDFs online dechiffrieren | CoolWave',
    metaDescriptionDe: 'PDF-Dateien sicher entschlüsseln. Geben Sie das Passwort ein und erhalten Sie das uneingeschränkt lesbare Dokument zurück.',
    h1De: 'PDF entschlüsseln – Chiffrierung aufheben',
    introDe: 'Haben Sie ein verschlüsseltes Dokument erhalten und möchten es dauerhaft ohne Passwortabfrage aufbewahren? Mit CoolWave entschlüsseln Sie die Datei nach Passworteingabe und entfernen die Chiffrierung vollständig.',
    howItWorksDe: [
      { step: 1, title: 'Verschlüsseltes PDF wählen', text: 'Laden Sie das chiffrierte PDF hoch.' },
      { step: 2, title: 'Passwort eingeben', text: 'Geben Sie das Entschlüsselungskennwort an.' },
      { step: 3, title: 'Klartext-PDF laden', text: 'Laden Sie das dauerhaft entschlüsselte PDF herunter.' }
    ],
    faqDe: [
      { question: 'Werden meine Passwörter gespeichert?', answer: 'Nein, das Passwort wird unmittelbar nach der Entschlüsselung aus dem Speicher gelöscht.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Datei kann nicht entschlüsselt werden.',
        solution: 'Stellen Sie sicher, dass das Passwort exakt eingegeben wurde und keine Sonderzeichen versehentlich falsch übertragen wurden.'
      }
    ],
    privacyExplanationDe: 'Flüchtige Entschlüsselung ohne persistente Speicherung.',
    searchKeywordsDe: ['PDF dechiffrieren', 'PDF Entschlüsselung online', 'PDF Passwort aufheben'],
    supportedFormats: 'PDF Entschlüsselung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-unlock',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-entsperren', 'pdf-verschluesseln'],
    icon: 'Unlock',
    status: 'active'
  },
  {
    id: 'pdf-schwaerzen',
    slug: 'pdf-schwaerzen',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF schwärzen',
    shortDescriptionDe: 'Entfernen Sie vertrauliche Begriffe, IBANs und Personendaten physisch und unwiderruflich aus dem PDF-Datenstrom.',
    titleDe: 'PDF schwärzen – vertrauliche Daten echt & unwiderruflich redigieren | CoolWave',
    metaDescriptionDe: 'PDF kostenlos und sicher schwärzen. True Redaction: Sensible Daten werden dauerhaft aus dem Datenstrom gelöscht und können nicht mehr kopiert werden.',
    h1De: 'PDF schwärzen – vertrauliche Daten unwiderruflich löschen',
    introDe: 'Schützen Sie vertrauliche Geschäftsdaten, persönliche Namen, IBAN-Nummern oder Adressen vor unbefugter Weitergabe. Im Gegensatz zu oberflächlichen Markierungen löscht CoolWave die Textzeichenfolgen physisch aus den PDF-Inhaltsströmen und deckt sie mit blickdichten Sperrbalken ab. Die geschwärzten Inhalte können danach weder kopiert, durchsucht noch wiederhergestellt werden.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Ziehen Sie die zu bereinigende PDF-Datei in das Tool.' },
      { step: 2, title: 'Begriffe festlegen', text: 'Geben Sie Namen, Kontonummern oder vertrauliche Begriffe ein, die geschwärzt werden sollen.' },
      { step: 3, title: 'Unwiderruflich schwärzen', text: 'Klicken Sie auf den Button und laden Sie das datenschutzsichere PDF herunter.' }
    ],
    faqDe: [
      { question: 'Kann jemand den Text unter den schwarzen Balken kopieren?', answer: 'Nein! CoolWave führt eine echte Redigierung (True Redaction) durch: Die Textzeichen werden physisch aus dem internen PDF-Datenstrom herausgeschnitten. Selbst mit Suchfunktionen oder Programmier-Tools lässt sich der Text nicht wiederherstellen.' },
      { question: 'Erfüllt dies die Anforderungen der DSGVO?', answer: 'Ja. Durch die vollständige Tilgung der Daten aus dem Dokument entspricht das Ergebnis den strengen Vorgaben zur Anonymisierung und Vertraulichkeit.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Ein Begriff wurde nicht auf allen Seiten geschwärzt.',
        solution: 'Stellen Sie sicher, dass Sie den Begriff exakt so geschrieben haben, wie er im Dokument vorkommt.'
      }
    ],
    privacyExplanationDe: 'Echte Datenstrom-Redigierung. Die geschwärzten Zeichenfolgen werden unwiderruflich zerstört.',
    searchKeywordsDe: ['PDF schwärzen', 'PDF Text unkenntlich machen', 'PDF redigieren', 'PDF vertrauliche Daten löschen', 'PDF Zensur'],
    supportedFormats: 'PDF Redigierung',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-redact',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-metadaten-entfernen', 'pdf-schuetzen', 'pdf-bearbeiten'],
    icon: 'EyeOff',
    status: 'active',
    badge: 'DSGVO',
    features: [
      'True Redaction: Physische Löschung der Textzeichen aus dem Content Stream',
      'Blickdichte visuelle Überdeckung mit Tiefschwarz',
      'Verhindert Textauswahl, Copy-Paste und automatisierte Extrahierung',
      'DSGVO-konform für Behörden, Anwälte, Banken und Unternehmen'
    ]
  },
  {
    id: 'pdf-wasserzeichen',
    slug: 'pdf-wasserzeichen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Wasserzeichen',
    shortDescriptionDe: 'Fügen Sie Text-Wasserzeichen wie „Vertraulich“, „Entwurf“ oder Ihren Firmennamen diagonal oder horizontal auf allen Seiten ein.',
    titleDe: 'PDF Wasserzeichen einfügen – kostenlos online | CoolWave',
    metaDescriptionDe: 'Wasserzeichen in PDF-Dateien einfügen. Text, Farbe, Transparenz und Winkel individuell anpassen. Schutz vor unbefugter Weitergabe.',
    h1De: 'PDF Wasserzeichen online einfügen',
    introDe: 'Schützen Sie Ihre Entwürfe und vertraulichen Dokumente vor Urheberrechtsverletzungen. Platzieren Sie individuelle Text-Wasserzeichen diagonal über alle Seiten Ihrer PDF-Datei – mit anpassbarer Deckkraft und Schriftgröße.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Wählen Sie das Dokument aus, das markiert werden soll.' },
      { step: 2, title: 'Wasserzeichen konfigurieren', text: 'Geben Sie den Text ein (z. B. „KOPIE“, „VERTRAULICH“) und wählen Sie Deckkraft sowie Winkel.' },
      { step: 3, title: 'PDF speichern', text: 'Laden Sie das mit Wasserzeichen versehene Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Kann das Wasserzeichen nachträglich entfernt werden?', answer: 'Das Wasserzeichen wird als feste Vektorgrafikschicht in das PDF gerendert und ist nicht trivial entfernbar.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das Wasserzeichen verdeckt den Text darunter zu stark.',
        solution: 'Reduzieren Sie die Deckkraft (Transparenz) auf 15-25% in den Wasserzeichen-Einstellungen.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Wasserzeichen-Generierung.',
    searchKeywordsDe: ['PDF Wasserzeichen hinzufügen', 'Vertraulich Stempel PDF', 'Wasserzeichen Dokument'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-watermark',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-bearbeiten', 'pdf-schuetzen'],
    icon: 'Stamp',
    status: 'active'
  },
  {
    id: 'pdf-metadaten-anzeigen',
    slug: 'pdf-metadaten-anzeigen',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.txt'],
    nameDe: 'PDF Metadaten anzeigen',
    shortDescriptionDe: 'Sehen Sie verborgene Metadaten wie Autor, Erstellungsprogramm, Titel und Datumsangaben Ihrer PDF ein.',
    titleDe: 'PDF Metadaten anzeigen – verborgene Datei-Informationen einsehen | CoolWave',
    metaDescriptionDe: 'PDF-Metadaten kostenlos online auslesen. Sehen Sie Autor, Ersteller, Producer, Erstellungsdatum und Schlagwörter direkt im Browser ein.',
    h1De: 'PDF Metadaten anzeigen & verborgene Details prüfen',
    introDe: 'PDF-Dateien speichern unbemerkt zahlreiche Hintergrundinformationen: den Namen des Computers, den Autor, das genaue Erstellungsdatum und die verwendete Software. Prüfen Sie mit CoolWave vor dem Weiterversand, welche Daten in Ihrem Dokument hinterlegt sind.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Ziehen Sie die zu analysierende PDF in das Tool.' },
      { step: 2, title: 'Metadaten prüfen', text: 'Lesen Sie Titel, Autor, Ersteller und Datumsstempel in der übersichtlichen Tabelle ab.' },
      { step: 3, title: 'Werte kopieren', text: 'Kopieren Sie beliebige Metadaten mit einem Klick in Ihre Zwischenablage.' }
    ],
    faqDe: [
      { question: 'Welche Metadaten speichert ein typisches PDF?', answer: 'Üblich sind Titel, Verfassername, Betriebssystem-Benutzername, Erstellungsprogramm (z. B. Word, InDesign) und Zeitstempel.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Felder zeigen „Nicht hinterlegt“ an.',
        solution: 'Wenn der Ersteller der PDF keine Metadaten eingetragen hat oder diese bereits bereinigt wurden, sind die Felder leer.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Metadaten-Analyse.',
    searchKeywordsDe: ['PDF Metadaten auslesen', 'PDF Autor herausfinden', 'PDF Erstellungsdatum prüfen'],
    supportedFormats: 'PDF Analyse',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'pdf-metadata',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-metadaten-entfernen', 'pdf-schuetzen'],
    icon: 'Info',
    status: 'active'
  },
  {
    id: 'pdf-metadaten-entfernen',
    slug: 'pdf-metadaten-entfernen',
    category: 'security',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Metadaten entfernen',
    shortDescriptionDe: 'Löschen Sie Autorenangaben, Erstellungssoftware und Zeitstempel restlos aus Ihren PDFs für maximale Diskretion.',
    titleDe: 'PDF Metadaten entfernen – sensible Datei-Infos restlos löschen | CoolWave',
    metaDescriptionDe: 'PDF-Metadaten kostenlos online entfernen. Löschen Sie Autor, Ersteller-Software, Titel und Zeitstempel vor der Weitergabe für 100% Datenschutz.',
    h1De: 'PDF Metadaten entfernen – Dokumente anonymisieren',
    introDe: 'Schützen Sie Ihre Privatsphäre und Geschäftsgeheimnisse: Bevor Sie Angebote, Verträge oder Veröffentlichungen versenden, sollten Sie verborgene Autorendaten und Tracking-Metadaten entfernen. CoolWave bereinigt alle Header-Einträge mit einem Klick.',
    howItWorksDe: [
      { step: 1, title: 'PDF laden', text: 'Wählen Sie das zu bereinigende Dokument aus.' },
      { step: 2, title: 'Metadaten löschen', text: 'Klicken Sie auf „Alle Metadaten restlos löschen“.' },
      { step: 3, title: 'Anonymisiertes PDF speichern', text: 'Laden Sie das saubere, metadatenfreie PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Werden dabei auch Textinhalte verändert?', answer: 'Nein, Ihre Texte, Formatierungen und Bilder bleiben zu 100% unverändert. Nur verborgene Meta-Informationen werden gelöscht.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Prüfprogramme zeigen immer noch Metadaten an.',
        solution: 'CoolWave überschreibt alle Standard-Felder (Titel, Autor, Betreff, Keywords, Creator, Producer). Nutzen Sie anschließend unser Tool „PDF Metadaten anzeigen“, um das bereinigte Ergebnis zu überprüfen.'
      }
    ],
    privacyExplanationDe: '100% lokale Bereinigung im Browser.',
    searchKeywordsDe: ['PDF anonymisieren', 'PDF Autor löschen', 'Metadaten aus PDF entfernen online'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'pdf-metadata',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-metadaten-anzeigen', 'pdf-schuetzen'],
    icon: 'ShieldCheck',
    status: 'active',
    badge: 'DSGVO'
  },

  // ==========================================
  // DOCUMENT & OFFICE CONVERSIONS
  // ==========================================
  {
    id: 'pdf-in-word-umwandeln',
    slug: 'pdf-in-word-umwandeln',
    category: 'documents',
    sourceFormats: ['.pdf'],
    targetFormats: ['.docx', '.doc'],
    nameDe: 'PDF in Word umwandeln',
    shortDescriptionDe: 'Konvertieren Sie PDF-Dateien in bearbeitbare Word-Dokumente (DOCX), um Texte und Tabellen in Microsoft Word oder LibreOffice weiterzubearbeiten.',
    titleDe: 'PDF in Word umwandeln – kostenlos online konvertieren | CoolWave',
    metaDescriptionDe: 'Wandeln Sie PDF-Dateien kostenlos und ohne Registrierung in editierbare Word-Dokumente um. Layouts und Texte bleiben präzise erhalten.',
    h1De: 'PDF in Word umwandeln – kostenlos & online',
    introDe: 'Sie müssen ein PDF-Dokument überarbeiten, besitzen aber die Originaldatei nicht mehr? Unser PDF-zu-Word-Konverter extrahiert Textstrukturen, Absätze und Formatierungen und erzeugt ein sauberes, in Microsoft Word voll editierbares Dokument. Ob Lebenslauf, Vertrag oder wissenschaftliche Arbeit – sparen Sie sich mühsames Abtippen.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Ziehen Sie die PDF-Datei in das Konvertierungsfeld.' },
      { step: 2, title: 'Konvertierung starten', text: 'Klicken Sie auf „In Word umwandeln“.' },
      { step: 3, title: 'Word-Datei herunterladen', text: 'Öffnen und bearbeiten Sie die Datei direkt in Microsoft Word, Google Docs oder LibreOffice.' }
    ],
    faqDe: [
      { question: 'Kann ich die erstellte Word-Datei frei bearbeiten?', answer: 'Ja, Sie erhalten ein Standard-Dokument, in dem Sie Texte überschreiben, löschen und formatieren können.' },
      { question: 'Können auch gescannte Dokumente konvertiert werden?', answer: 'Für reine Bildscans ohne Textschicht empfehlen wir unser spezielles Tool „OCR PDF“, um den Text per Zeichenerkennung auszulesen.' },
      { question: 'Gibt es einen Unterschied zwischen „PDF in Word“ und „PDF zu Word“?', answer: 'Nein, beide Begriffe beschreiben dieselbe Funktion: die Umwandlung eines PDF-Dokuments in eine bearbeitbare Word-Datei (DOCX).' }
    ],
    troubleshootingDe: [
      {
        issue: 'Nach der Umwandlung enthält die Word-Datei nur uneditierbare Bilder statt echtem Text.',
        solution: 'Ihre PDF besteht aus einem reinen Bildscan. Nutzen Sie unser Tool „OCR PDF“, um eine optische Zeichenerkennung durchzuführen.'
      },
      {
        issue: 'Sonderzeichen oder Umlaute werden falsch dargestellt.',
        solution: 'Stellen Sie sicher, dass die Ausgangs-PDF standardisierte UTF-8-Schriftarten nutzt. Bei exotischen Schriften hilft die vorherige OCR-Verarbeitung.'
      }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung. Bei Server-Verarbeitung werden alle temporären Daten nach 15 Minuten restlos geschreddert.',
    searchKeywordsDe: ['PDF zu Word', 'PDF in DOCX', 'PDF in Word kostenlos', 'PDF bearbeitbar machen Word'],
    supportedFormats: 'PDF zu DOCX / Word',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 25 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'pdf-bearbeiten', 'pdf-komprimieren', 'ocr-pdf', 'pdf-in-excel-umwandeln'],
    icon: 'FileCode2',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'word-in-pdf-umwandeln',
    slug: 'word-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.docx', '.doc'],
    targetFormats: ['.pdf'],
    nameDe: 'Word in PDF umwandeln',
    shortDescriptionDe: 'Erstellen Sie aus Ihren Word-Dokumenten (DOCX, DOC) professionelle PDFs mit unveränderlichem Schriftbild und perfekter Druckqualität.',
    titleDe: 'Word in PDF umwandeln – kostenlos online konvertieren | CoolWave',
    metaDescriptionDe: 'Word-Dokumente (DOCX, DOC) kostenlos online in PDF umwandeln. Layouttreu, sicher und ohne Microsoft Office direkt im Browser nutzen.',
    h1De: 'Word in PDF umwandeln – layouttreu & sicher',
    introDe: 'Verwandeln Sie Word-Dateien (DOCX, DOC) in universell lesbare PDF-Dokumente. PDFs garantieren, dass Schriftarten, Zeilenumbrüche und Grafiken auf jedem Computer, Smartphone oder Tablet exakt so aussehen wie von Ihnen beabsichtigt. Ideal für Bewerbungen, Rechnungen und offizielle Mitteilungen.',
    howItWorksDe: [
      { step: 1, title: 'Word-Datei hochladen', text: 'Wählen Sie Ihre DOCX- oder DOC-Datei aus.' },
      { step: 2, title: 'Konvertieren', text: 'Klicken Sie auf „In PDF umwandeln“.' },
      { step: 3, title: 'Fertiges PDF speichern', text: 'Laden Sie Ihr druckfertiges, layoutgetreues PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Benötige ich Microsoft Office auf meinem PC?', answer: 'Nein, CoolWave führt die gesamte Umwandlung eigenständig online durch.' },
      { question: 'Werden Bilder und Schriftarten exakt übernommen?', answer: 'Ja, Standardlayouts und Schriften werden präzise in die PDF-Vektorstruktur übertragen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Ältere .doc-Dateien schlagen fehl.',
        solution: 'Speichern Sie das Dokument nach Möglichkeit im modernen .docx-Format ab, um optimale Konvertierungsergebnisse zu erzielen.'
      }
    ],
    privacyExplanationDe: 'Sichere Dokumentenverarbeitung mit sofortiger automatischer Bereinigung.',
    searchKeywordsDe: ['DOCX in PDF', 'Word zu PDF', 'DOC in PDF kostenlos', 'Word Datei als PDF speichern'],
    supportedFormats: 'DOCX / DOC zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 25 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-in-word-umwandeln', 'pdf-komprimieren', 'pdf-zusammenfuegen'],
    icon: 'FileUp',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'pdf-in-excel-umwandeln',
    slug: 'pdf-in-excel-umwandeln',
    category: 'documents',
    sourceFormats: ['.pdf'],
    targetFormats: ['.xlsx', '.xls', '.csv'],
    nameDe: 'PDF in Excel umwandeln',
    shortDescriptionDe: 'Extrahieren Sie Tabellen und Zahlen aus PDF-Berichten, Rechnungen und Auswertungen direkt in bearbeitbare Excel-Tabellen (XLSX, CSV).',
    titleDe: 'PDF in Excel umwandeln – Tabellen kostenlos online extrahieren | CoolWave',
    metaDescriptionDe: 'Wandeln Sie PDF-Dateien mit Tabellen kostenlos in bearbeitbare Excel-Tabellen (XLSX, CSV) um. Spalten und Zeilen sauber extrahieren.',
    h1De: 'PDF in Excel umwandeln – Tabellen online extrahieren',
    introDe: 'Das manuelle Abtippen von Tabellen, Finanzberichten oder Preiskatalogen aus PDF-Dateien kostet wertvolle Zeit. CoolWave erkennt Tabellenstrukturen in Ihren PDFs und extrahiert Zellendaten, Spalten und Zeilen direkt in das Microsoft Excel- oder CSV-Format für die sofortige Weiterverarbeitung.',
    howItWorksDe: [
      { step: 1, title: 'PDF mit Tabelle hochladen', text: 'Ziehen Sie die PDF-Datei mit den Tabellendaten in das Tool.' },
      { step: 2, title: 'Tabellenextraktion starten', text: 'Klicken Sie auf „In Excel umwandeln“.' },
      { step: 3, title: 'Excel-Datei öffnen', text: 'Laden Sie Ihre Tabelle herunter und öffnen Sie sie direkt in Excel oder Google Sheets.' }
    ],
    faqDe: [
      { question: 'Werden Zahlenformate und Formeln übernommen?', answer: 'Zahlen und Texte werden exakt extrahiert. Rechenformeln (z. B. SUMME) können Sie in Excel anschließend mit einem Klick neu anlegen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Tabellenspalten sind nach der Umwandlung verschoben.',
        solution: 'Wenn die Tabelle in der PDF keine sichtbaren Gitterlinien hat, nutzen Sie das CSV-Format oder die OCR-Vorverarbeitung für klar getrennte Spalten.'
      }
    ],
    privacyExplanationDe: 'Vertrauliche Geschäfts- und Finanzdaten werden verschlüsselt verarbeitet und nach 15 Minuten gelöscht.',
    searchKeywordsDe: ['PDF zu Excel', 'PDF in XLSX', 'Tabelle aus PDF kopieren', 'PDF Daten nach Excel'],
    supportedFormats: 'PDF zu XLSX / CSV',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['excel-in-pdf-umwandeln', 'pdf-in-word-umwandeln', 'ocr-pdf'],
    icon: 'Table',
    status: 'active',
    badge: 'Neu'
  },
  {
    id: 'excel-in-pdf-umwandeln',
    slug: 'excel-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.xlsx', '.xls', '.csv'],
    targetFormats: ['.pdf'],
    nameDe: 'Excel in PDF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie Excel-Tabellen (XLSX, XLS) in druckfertige PDFs mit sauberer Spaltenaufteilung.',
    titleDe: 'Excel in PDF umwandeln – Tabellen kostenlos als PDF speichern | CoolWave',
    metaDescriptionDe: 'Excel-Arbeitsblätter (XLSX, XLS, CSV) kostenlos online in PDF umwandeln. Layouts und Tabellenformate bleiben erhalten.',
    h1De: 'Excel in PDF umwandeln – Tabellen sauber sichern',
    introDe: 'Exportieren Sie Kalkulationen, Bilanzen und Übersichten als unveränderbare PDF-Dateien. Dadurch verhindern Sie versehentliche Formeländerungen durch Dritte und stellen sicher, dass Ihre Tabelle auf jedem Bildschirm sauber auf DIN-A4-Seiten dargestellt wird.',
    howItWorksDe: [
      { step: 1, title: 'Excel-Datei wählen', text: 'Laden Sie Ihre XLSX-, XLS- oder CSV-Datei hoch.' },
      { step: 2, title: 'In PDF umwandeln', text: 'Starten Sie die Konvertierung mit einem Klick.' },
      { step: 3, title: 'PDF herunterladen', text: 'Speichern Sie das fertige Tabellen-PDF.' }
    ],
    faqDe: [
      { question: 'Passt die Tabelle auf eine Seite?', answer: 'Die Konvertierung optimiert breite Tabellen automatisch auf das A4-Format.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Rechte Spalten werden abgeschnitten.',
        solution: 'Stellen Sie im Tabellenblatt sicher, dass der Druckbereich auf „Auf 1 Seite anpassen“ konfiguriert ist.'
      }
    ],
    privacyExplanationDe: 'Sichere verschlüsselte Tabellenkonvertierung mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['XLSX in PDF', 'Excel zu PDF', 'Tabelle als PDF speichern'],
    supportedFormats: 'XLSX / XLS zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-in-excel-umwandeln', 'word-in-pdf-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'pdf-in-powerpoint-umwandeln',
    slug: 'pdf-in-powerpoint-umwandeln',
    category: 'documents',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pptx', '.ppt'],
    nameDe: 'PDF in PowerPoint umwandeln',
    shortDescriptionDe: 'Wandeln Sie PDF-Präsentationen in bearbeitbare PowerPoint-Folien (PPTX) um, um Vorträge flexibel anzupassen.',
    titleDe: 'PDF in PowerPoint umwandeln – Folien online bearbeiten | CoolWave',
    metaDescriptionDe: 'PDF-Folien kostenlos online in PowerPoint (PPTX) umwandeln. Folienlayouts und Texte bleiben erhalten.',
    h1De: 'PDF in PowerPoint umwandeln – Präsentationen reaktivieren',
    introDe: 'Haben Sie eine Präsentation nur noch als PDF-Datei vorliegen? Unser PDF-zu-PowerPoint-Konverter erstellt editierbare Folien (PPTX), sodass Sie Texte aktualisieren, Diagramme anpassen und Folien neu anordnen können.',
    howItWorksDe: [
      { step: 1, title: 'PDF-Folien hochladen', text: 'Ziehen Sie die PDF-Präsentation in das Upload-Feld.' },
      { step: 2, title: 'In PPTX umwandeln', text: 'Klicken Sie auf „In PowerPoint umwandeln“.' },
      { step: 3, title: 'Präsentation herunterladen', text: 'Öffnen Sie die PPTX-Datei direkt in Microsoft PowerPoint oder Keynote.' }
    ],
    faqDe: [
      { question: 'Wird jede PDF-Seite eine separate Folie?', answer: 'Ja, jede Seite der Ausgangs-PDF wird als eigenständige PowerPoint-Folie angelegt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Schriften wirken nach dem Öffnen in PowerPoint anders.',
        solution: 'Wenn in der PDF seltene Schriften eingebettet waren, ersetzt PowerPoint diese durch Standardschriften wie Arial oder Calibri.'
      }
    ],
    privacyExplanationDe: 'Verschlüsselte Verarbeitung mit automatischer Bereinigung.',
    searchKeywordsDe: ['PDF in PPTX', 'PDF zu PowerPoint', 'PDF Folien bearbeiten'],
    supportedFormats: 'PDF zu PPTX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['powerpoint-in-pdf-umwandeln', 'pdf-in-word-umwandeln'],
    icon: 'Presentation',
    status: 'active'
  },
  {
    id: 'powerpoint-in-pdf-umwandeln',
    slug: 'powerpoint-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.pptx', '.ppt'],
    targetFormats: ['.pdf'],
    nameDe: 'PowerPoint in PDF umwandeln',
    shortDescriptionDe: 'Speichern Sie Ihre PowerPoint-Präsentationen (PPTX, PPT) als kompakte PDF für Handouts und Vorträge.',
    titleDe: 'PowerPoint in PDF umwandeln – PPTX kostenlos online konvertieren | CoolWave',
    metaDescriptionDe: 'PowerPoint-Folien (PPTX, PPT) kostenlos in PDF konvertieren. Perfekt für Handouts, E-Mail-Versand und plattformunabhängige Vorträge.',
    h1De: 'PowerPoint in PDF umwandeln – Folien sicher teilen',
    introDe: 'Vermeiden Sie Pannen bei Kundenvorträgen: Wenn der Präsentations-Laptop andere Schriften installiert hat, verschieben sich Folienlayouts. Als PDF abgespeichert sieht Ihre Präsentation auf jedem Gerät garantiert perfekt aus.',
    howItWorksDe: [
      { step: 1, title: 'PPTX-Datei hochladen', text: 'Wählen Sie Ihre Präsentationsdatei aus.' },
      { step: 2, title: 'In PDF konvertieren', text: 'Starten Sie die Umwandlung.' },
      { step: 3, title: 'Folien-PDF herunterladen', text: 'Speichern Sie das fertige Handout-PDF.' }
    ],
    faqDe: [
      { question: 'Bleiben Folienanimationen im PDF erhalten?', answer: 'Nein, PDFs stellen Folien als feste statische Seiten dar – perfekt für Handouts und zum Nachlesen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Ausgeblendete Folien sind im PDF sichtbar.',
        solution: 'Löschen Sie vertrauliche ausgeblendete Folien vor der Konvertierung aus der PowerPoint-Datei.'
      }
    ],
    privacyExplanationDe: 'Sichere Konvertierung mit automatischer Dateilöschung.',
    searchKeywordsDe: ['PPTX in PDF', 'PowerPoint zu PDF', 'Präsentation als PDF speichern'],
    supportedFormats: 'PPTX / PPT zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-in-powerpoint-umwandeln', 'pdf-komprimieren'],
    icon: 'Presentation',
    status: 'active'
  },
  {
    id: 'doc-in-pdf-umwandeln',
    slug: 'doc-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.doc'],
    targetFormats: ['.pdf'],
    nameDe: 'DOC in PDF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie ältere Microsoft Word-Dokumente (DOC-Format) sicher und schnell in moderne, universell lesbare PDF-Dateien.',
    titleDe: 'DOC in PDF umwandeln – ältere Word-Dokumente kostenlos konvertieren | CoolWave',
    metaDescriptionDe: 'Klassische DOC-Dateien (Word 97-2003) kostenlos und sicher in PDF umwandeln. Layouts und Texte universell sichern ohne Qualitätsverlust.',
    h1De: 'DOC in PDF umwandeln – ältere Word-Dateien sichern',
    introDe: 'Ältere Word-Dateien mit der Endung .doc lassen sich auf modernen Smartphones oder ohne installiertes Microsoft Office oft nicht öffnen. Wandeln Sie Ihre Dokumente mit CoolWave in standardisierte PDF-Dateien um, die auf jedem Gerät gestochen scharf angezeigt werden.',
    howItWorksDe: [
      { step: 1, title: 'DOC-Datei auswählen', text: 'Ziehen Sie Ihre .doc-Datei in das Upload-Feld oder wählen Sie sie aus.' },
      { step: 2, title: 'Konvertierung starten', text: 'Klicken Sie auf „In PDF umwandeln“ für eine präzise Umwandlung.' },
      { step: 3, title: 'PDF herunterladen', text: 'Laden Sie Ihr fertiges PDF-Dokument direkt herunter.' }
    ],
    faqDe: [
      { question: 'Was ist der Unterschied zwischen DOC und DOCX?', answer: 'DOC ist das ältere Binärformat von Microsoft Word bis 2003. DOCX ist das moderne XML-basierte Standardformat ab Word 2007. CoolWave unterstützt beide Formate zuverlässig.' },
      { question: 'Bleibt die Formatierung erhalten?', answer: 'Ja, Schriftarten, Absätze und Tabellenstrukturen werden so originalgetreu wie technisch möglich in das PDF übertragen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Datei kann nicht konvertiert werden oder meldet ein ungültiges Format.',
        solution: 'Prüfen Sie, ob es sich um eine passwortgeschützte DOC-Datei handelt. Entfernen Sie das Passwort zuvor in Word oder speichern Sie die Datei als .docx ab.'
      }
    ],
    privacyExplanationDe: 'Verarbeitung über geschützte Worker mit automatischer 15-minütiger Datenlöschung.',
    searchKeywordsDe: ['DOC in PDF', 'Word 2003 in PDF', 'Altes Word zu PDF', 'DOC Konverter'],
    supportedFormats: 'DOC zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'pdf-in-word-umwandeln', 'pdf-komprimieren'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'odt-in-pdf-umwandeln',
    slug: 'odt-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.odt'],
    targetFormats: ['.pdf'],
    nameDe: 'ODT in PDF umwandeln',
    shortDescriptionDe: 'Verwandeln Sie OpenOffice- und LibreOffice Writer-Dokumente (ODT) in universell kompatible PDF-Dateien.',
    titleDe: 'ODT in PDF umwandeln – OpenOffice & LibreOffice Dateien kostenlos speichern | CoolWave',
    metaDescriptionDe: 'ODT-Textdokumente kostenlos online in PDF umwandeln. Kompatibel mit OpenOffice und LibreOffice Writer. Sofortiger Download ohne Installation.',
    h1De: 'ODT in PDF umwandeln – OpenDocument-Texte archivieren',
    introDe: 'Dokumente im OpenDocument Text-Format (.odt) sind der Open-Source-Standard von LibreOffice und OpenOffice. Um sicherzustellen, dass Empfänger Ihr Dokument ohne spezielle Office-Suite öffnen können, konvertieren Sie ODT mit CoolWave in ein universelles PDF.',
    howItWorksDe: [
      { step: 1, title: 'ODT-Datei hochladen', text: 'Wählen Sie Ihre OpenDocument-Datei aus.' },
      { step: 2, title: 'In PDF überführen', text: 'Starten Sie den Konvertierungsauftrag mit einem Klick.' },
      { step: 3, title: 'Fertige PDF sichern', text: 'Speichern Sie das fertige PDF-Dokument auf Ihrem Gerät.' }
    ],
    faqDe: [
      { question: 'Benötige ich LibreOffice auf meinem PC?', answer: 'Nein, CoolWave konvertiert ODT-Dokumente serverseitig in der Cloud – Sie benötigen keinerlei Software-Installation.' },
      { question: 'Werden Tabellen und Aufzählungen übernommen?', answer: 'Ja, das Dokument wird strukturell analysiert und alle Absätze, Überschriften und Tabellen werden in das PDF gerendert.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Schriftart sieht im PDF anders aus.',
        solution: 'Wenn Sie exotische Schriftarten in LibreOffice verwendet haben, werden diese im PDF durch hochwertige Standardschriften (Helvetica) ersetzt, um universelle Lesbarkeit zu garantieren.'
      }
    ],
    privacyExplanationDe: 'Sichere Übertragung und automatische Vernichtung temporärer Arbeitsdateien nach 15 Minuten.',
    searchKeywordsDe: ['ODT in PDF', 'OpenOffice zu PDF', 'LibreOffice in PDF konvertieren', 'ODT Datei umwandeln'],
    supportedFormats: 'ODT zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'pdf-in-word-umwandeln', 'txt-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'rtf-in-pdf-umwandeln',
    slug: 'rtf-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.rtf'],
    targetFormats: ['.pdf'],
    nameDe: 'RTF in PDF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie Rich Text Format-Dateien (RTF) in kompakte, druckfertige PDF-Dokumente.',
    titleDe: 'RTF in PDF umwandeln – Rich Text Dateien online konvertieren | CoolWave',
    metaDescriptionDe: 'RTF-Dokumente kostenlos online in PDF konvertieren. Formatierter Text, Tabellen und Schriftstile sauber als PDF speichern.',
    h1De: 'RTF in PDF umwandeln – Rich-Text universell lesbar machen',
    introDe: 'Das Rich Text Format (.rtf) wurde für den plattformübergreifenden Textaustausch entwickelt. Da verschiedene Texteditoren RTF unterschiedlich interpretieren, sorgt die Umwandlung in PDF für ein einheitliches, unveränderliches Erscheinungsbild.',
    howItWorksDe: [
      { step: 1, title: 'RTF-Dokument auswählen', text: 'Ziehen Sie Ihre .rtf-Datei in den Konverter.' },
      { step: 2, title: 'In PDF transformieren', text: 'Klicken Sie auf „In PDF umwandeln“.' },
      { step: 3, title: 'PDF speichern', text: 'Laden Sie Ihre fehlerfrei gerenderte PDF-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Bleiben Textformatierungen wie Fett oder Kursiv erhalten?', answer: 'Ja, CoolWave analysiert die RTF-Steuerzeichen und überträgt alle Textstile sauber in das PDF.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Sonderzeichen oder Umlaute werden fehlerhaft dargestellt.',
        solution: 'Stellen Sie sicher, dass die RTF-Datei mit einem Standardzeichensatz (z. B. UTF-8 oder Windows-1252) exportiert wurde.'
      }
    ],
    privacyExplanationDe: '100% datenschutzkonform mit automatischer Löschung nach Abschluss des Prozesses.',
    searchKeywordsDe: ['RTF in PDF', 'Rich Text zu PDF', 'RTF konvertieren', 'RTF Dokument drucken'],
    supportedFormats: 'RTF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'txt-in-pdf-umwandeln', 'doc-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'txt-in-pdf-umwandeln',
    slug: 'txt-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.txt'],
    targetFormats: ['.pdf'],
    nameDe: 'TXT in PDF umwandeln',
    shortDescriptionDe: 'Verwandeln Sie einfache Textdateien (.txt) in professionell paginierte PDF-Dokumente mit sauberen Seitenrändern.',
    titleDe: 'TXT in PDF umwandeln – Textdateien als druckreifes PDF sichern | CoolWave',
    metaDescriptionDe: 'Reine Textdateien (TXT) kostenlos in PDF konvertieren. Automatische Zeilenumbrüche, Randabstände und Seitenzahlen direkt im Browser.',
    h1De: 'TXT in PDF umwandeln – Textdokumente professionell formatieren',
    introDe: 'Einfache Textdateien (.txt) haben keine feste Seitenstruktur oder Ränder. CoolWave setzt Ihre Textdateien professionell in DIN A4-Seiten mit sauberen Rändern, proportionalem Schriftsatz und automatischer Seitennummerierung.',
    howItWorksDe: [
      { step: 1, title: 'Textdatei hochladen', text: 'Wählen Sie Ihre .txt-Datei aus.' },
      { step: 2, title: 'PDF layouten', text: 'Starten Sie die Generierung mit optimaler Paginierung.' },
      { step: 3, title: 'Fertiges PDF herunterladen', text: 'Speichern Sie das druckreife PDF sofort ab.' }
    ],
    faqDe: [
      { question: 'Werden lange Zeilen automatisch umgebrochen?', answer: 'Ja, CoolWave führt einen intelligenten Zeilenumbruch durch, sodass keine Wörter am Seitenrand abgeschnitten werden.' },
      { question: 'Gibt es eine Beschränkung der Textlänge?', answer: 'Sie können Textdateien mit bis zu mehreren tausend Zeilen und 50 MB problemlos konvertieren.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Deutsche Umlaute (ä, ö, ü, ß) wirken verzerrt.',
        solution: 'Speichern Sie die TXT-Datei vor dem Upload mit der Zeichenkodierung UTF-8 ab.'
      }
    ],
    privacyExplanationDe: 'Lokale oder verschlüsselte Worker-Generierung mit sofortiger Entsorgung.',
    searchKeywordsDe: ['TXT in PDF', 'Text zu PDF', 'Textdatei drucken als PDF', 'TXT umwandeln'],
    supportedFormats: 'TXT zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 5 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'rtf-in-pdf-umwandeln', 'pdf-komprimieren'],
    icon: 'FileCode',
    status: 'active'
  },
  {
    id: 'html-in-pdf-umwandeln',
    slug: 'html-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.html', '.htm'],
    targetFormats: ['.pdf'],
    nameDe: 'HTML in PDF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie HTML-Dateien und Webcode in druckreife PDF-Dokumente mit Überschriften, Listen und Tabellen.',
    titleDe: 'HTML in PDF umwandeln – Webseiten & HTML-Code als PDF speichern | CoolWave',
    metaDescriptionDe: 'HTML-Dateien kostenlos und sauber in druckfertige PDF-Dokumente umwandeln. Überschriften, Tabellen, Listen und Links erhalten.',
    h1De: 'HTML in PDF umwandeln – HTML-Dateien und Webcode als PDF drucken',
    introDe: 'Konvertieren Sie HTML-Dokumente, Rechnungs-Templates oder Webseiten-Quelltexte in druckreife PDF-Dateien. CoolWave analysiert semantische Tags wie Überschriften, Absätze, Aufzählungen und Tabellenstrukturen für ein exzellentes Druckergebnis.',
    howItWorksDe: [
      { step: 1, title: 'HTML-Datei auswählen', text: 'Ziehen Sie Ihre .html- oder .htm-Datei in das Upload-Feld.' },
      { step: 2, title: 'In PDF rendern', text: 'Klicken Sie auf „In PDF umwandeln“.' },
      { step: 3, title: 'PDF herunterladen', text: 'Laden Sie das formatierte PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Werden Bilder und CSS-Stile mit konvertiert?', answer: 'Semantische Elemente und Textstrukturen werden 1:1 übernommen. Bei extern verlinkten Stylesheets empfiehlt es sich, Stile inline einzubinden.' },
      { question: 'Werden Hyperlinks im PDF klickbar sein?', answer: 'Ja, Links bleiben als anklickbare Verweise im generierten PDF erhalten.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Umlaute oder Zeichen werden falsch dargestellt.',
        solution: 'Stellen Sie sicher, dass im HTML-Header <meta charset="utf-8"> deklariert ist.'
      }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung ohne Speicherung Ihrer Webdaten.',
    searchKeywordsDe: ['HTML in PDF', 'HTML zu PDF', 'Webseite als PDF speichern', 'HTML Dokument konvertieren'],
    supportedFormats: 'HTML / HTM zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['word-in-pdf-umwandeln', 'pdf-in-word-umwandeln', 'txt-in-pdf-umwandeln'],
    icon: 'Code',
    status: 'active'
  },

  // ==========================================
  // IMAGE & MEDIA CONVERSIONS
  // ==========================================
  {
    id: 'pdf-in-jpg-umwandeln',
    slug: 'pdf-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.pdf'],
    targetFormats: ['.jpg'],
    nameDe: 'PDF in JPG umwandeln',
    shortDescriptionDe: 'Extrahieren Sie alle Seiten oder gezielte Abschnitte einer PDF-Datei als hochwertige JPG-Bilder.',
    titleDe: 'PDF in JPG umwandeln – PDF-Seiten kostenlos als Bild speichern | CoolWave',
    metaDescriptionDe: 'PDF-Seiten kostenlos online in JPG-Bilder umwandeln. Hohe Bildqualität, sofortiger Download ohne Upload zum Server.',
    h1De: 'PDF in JPG umwandeln – PDF-Seiten als Bilder sichern',
    introDe: 'Konvertieren Sie PDF-Seiten in universell teilbare JPG-Bilder. Ideal, um Dokumente in PowerPoint-Präsentationen, Websites oder Social-Media-Beiträge einzubinden.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Ziehen Sie Ihre PDF-Datei in den Konverter.' },
      { step: 2, title: 'Umwandlung starten', text: 'Klicken Sie auf „In JPG umwandeln“.' },
      { step: 3, title: 'Bilder herunterladen', text: 'Speichern Sie das fertige JPG-Bild.' }
    ],
    faqDe: [
      { question: 'Werden alle Seiten umgewandelt?', answer: 'Ja, die Seiten werden als hochauflösende JPG-Grafiken gerendert.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Kleine Schriften im Bild wirken unscharf.',
        solution: 'Nutzen Sie für gestochen scharfe Grafiken und Textdokumente stattdessen unser Tool „PDF in PNG umwandeln“.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Rendering.',
    searchKeywordsDe: ['PDF zu JPG', 'PDF als Bild speichern', 'PDF Foto umwandeln'],
    supportedFormats: 'PDF zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-to-image',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['jpg-in-pdf-umwandeln', 'pdf-in-png-umwandeln', 'bild-komprimieren'],
    icon: 'Image',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'jpg-in-pdf-umwandeln',
    slug: 'jpg-in-pdf-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.pdf'],
    nameDe: 'JPG in PDF umwandeln',
    shortDescriptionDe: 'Verbinden Sie ein oder mehrere JPG-Fotos und Grafiken zu einem kompakten, sauberen PDF-Dokument.',
    titleDe: 'JPG in PDF umwandeln – Bilder kostenlos zusammenfügen | CoolWave',
    metaDescriptionDe: 'JPG-Bilder kostenlos online in PDF umwandeln. Mehrere Fotos zu einem Dokument zusammenfügen. 100% lokal im Browser.',
    h1De: 'JPG in PDF umwandeln – Fotos als Dokument sichern',
    introDe: 'Machen Sie aus Ihren Fotos, Scans und Belegen ein professionelles PDF. Sie können mehrere JPGs gleichzeitig hochladen und in der gewünschten Reihenfolge zu einem einzigen Gesamtdokument verbinden.',
    howItWorksDe: [
      { step: 1, title: 'JPGs hochladen', text: 'Wählen Sie Ihre Fotos oder Grafiken aus.' },
      { step: 2, title: 'In PDF konvertieren', text: 'Starten Sie die lokale Erstellung mit einem Klick.' },
      { step: 3, title: 'PDF herunterladen', text: 'Laden Sie Ihr fertiges PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Kann ich mehrere Bilder zu einem PDF verbinden?', answer: 'Ja, wählen Sie einfach mehrere JPG-Dateien gleichzeitig aus.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Fotos stehen auf dem Kopf.',
        solution: 'Nutzen Sie nach dem Erstellen das Tool „PDF drehen“, um die Seitenlage anzupassen.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Bildverarbeitung.',
    searchKeywordsDe: ['JPG zu PDF', 'Bilder in PDF umwandeln', 'Fotos als PDF zusammenfassen'],
    supportedFormats: 'JPG zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 20 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 100 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-in-jpg-umwandeln', 'png-in-pdf-umwandeln', 'pdf-komprimieren'],
    icon: 'FileImage',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'pdf-in-png-umwandeln',
    slug: 'pdf-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.pdf'],
    targetFormats: ['.png'],
    nameDe: 'PDF in PNG umwandeln',
    shortDescriptionDe: 'Extrahieren Sie PDF-Seiten als verlustfreie PNG-Bilder mit scharfen Kanten und optionaler Transparenz.',
    titleDe: 'PDF in PNG umwandeln – verlustfreie Bilder online | CoolWave',
    metaDescriptionDe: 'PDF kostenlos in PNG umwandeln. Gestochen scharfe Text- und Vektordarstellung ohne Kompressionsartefakte.',
    h1De: 'PDF in PNG umwandeln – verlustfrei & gestochen scharf',
    introDe: 'Während JPG kompressionsbedingt leichte Unschärfen an Texträndern erzeugt, liefert das PNG-Format eine 100% pixelgenaue und verlustfreie Abbildung Ihrer PDF-Dokumente. Perfekt für Grafiken, Logos und Textdokumente.',
    howItWorksDe: [
      { step: 1, title: 'PDF wählen', text: 'Ziehen Sie Ihre PDF in den Konverter.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Starten Sie die Umwandlung.' },
      { step: 3, title: 'PNG-Datei speichern', text: 'Laden Sie Ihre verlustfreie PNG-Grafik herunter.' }
    ],
    faqDe: [
      { question: 'Was ist der Vorteil gegenüber JPG?', answer: 'PNG bietet verlustfreie Bildqualität ohne Artefakte um Buchstaben herum.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die PNG-Datei ist sehr groß.',
        solution: 'Nutzen Sie anschließend unser Tool „Bild komprimieren“, um die PNG-Größe bei erhaltener Qualität zu minimieren.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Rendering.',
    searchKeywordsDe: ['PDF zu PNG', 'PDF als PNG speichern', 'PDF verlustfrei in Bild'],
    supportedFormats: 'PDF zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-to-image',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-in-jpg-umwandeln', 'png-in-pdf-umwandeln', 'bild-komprimieren'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-pdf-umwandeln',
    slug: 'png-in-pdf-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.pdf'],
    nameDe: 'PNG in PDF umwandeln',
    shortDescriptionDe: 'Wandeln Sie transparente PNG-Grafiken und Screenshots in ein kompaktes, druckreifes PDF um.',
    titleDe: 'PNG in PDF umwandeln – Grafiken online als PDF speichern | CoolWave',
    metaDescriptionDe: 'PNG-Bilder kostenlos online in PDF umwandeln. Schnell, verlustfrei und direkt im Browser ohne Server-Upload.',
    h1De: 'PNG in PDF umwandeln – Grafiken & Screenshots sichern',
    introDe: 'Konvertieren Sie Screenshots, Diagramme und PNG-Grafiken in ein sauberes PDF-Dokument. Ideal für die Archivierung oder das Zusammenfassen mehrerer Bildnachweise.',
    howItWorksDe: [
      { step: 1, title: 'PNG auswählen', text: 'Laden Sie Ihre PNG-Datei hoch.' },
      { step: 2, title: 'In PDF umwandeln', text: 'Starten Sie die Konvertierung mit einem Klick.' },
      { step: 3, title: 'PDF herunterladen', text: 'Speichern Sie das fertige PDF.' }
    ],
    faqDe: [
      { question: 'Bleibt die Bildqualität erhalten?', answer: 'Ja, die PNG-Pixeldaten werden 1:1 in das PDF-Format eingebettet.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Transparente Bereiche werden schwarz dargestellt.',
        solution: 'CoolWave hinterlegt transparente PNGs automatisch mit einem neutralen weißen Hintergrund für optimalen Druck.'
      }
    ],
    privacyExplanationDe: '100% clientseitig im Browser.',
    searchKeywordsDe: ['PNG zu PDF', 'PNG Bild als PDF speichern', 'Screenshots in PDF umwandeln'],
    supportedFormats: 'PNG zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 20 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 100 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['jpg-in-pdf-umwandeln', 'pdf-in-png-umwandeln'],
    icon: 'FileImage',
    status: 'active'
  },
  {
    id: 'jpg-in-png-umwandeln',
    slug: 'jpg-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.png'],
    nameDe: 'JPG in PNG umwandeln',
    shortDescriptionDe: 'Wandeln Sie JPG-Fotos in das transparente, verlustfreie PNG-Format um.',
    titleDe: 'JPG in PNG umwandeln – kostenlos online konvertieren | CoolWave',
    metaDescriptionDe: 'JPG-Dateien kostenlos online in PNG umwandeln. Verlustfreie Konvertierung direkt im Browser ohne Server-Upload.',
    h1De: 'JPG in PNG umwandeln – schnell & verlustfrei',
    introDe: 'Konvertieren Sie JPG-Bilder in das PNG-Format, um transparente Hintergründe nutzen zu können oder weitere Qualitätsverluste bei wiederholter Bearbeitung zu verhindern.',
    howItWorksDe: [
      { step: 1, title: 'JPG wählen', text: 'Laden Sie Ihre JPG-Datei hoch.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf den Button.' },
      { step: 3, title: 'PNG downloaden', text: 'Speichern Sie Ihr neues PNG-Bild.' }
    ],
    faqDe: [
      { question: 'Wird die Bilddatei durch die Umwandlung größer?', answer: 'Da PNG verlustfrei speichert, kann die Dateigröße im Vergleich zu komprimiertem JPG leicht ansteigen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Der Hintergrund ist nach der Umwandlung noch nicht transparent.',
        solution: 'Eine Formatkonvertierung von JPG nach PNG ändert das Dateiformat. Um einen Hintergrund freizustellen, muss der Bildinhalt entsprechend maskiert werden.'
      }
    ],
    privacyExplanationDe: '100% In-Browser HTML5 Canvas Verarbeitung.',
    searchKeywordsDe: ['JPG zu PNG', 'JPG Bild in PNG umwandeln', 'JPEG zu PNG online'],
    supportedFormats: 'JPG zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['png-in-jpg-umwandeln', 'bild-komprimieren'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-jpg-umwandeln',
    slug: 'png-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.jpg'],
    nameDe: 'PNG in JPG umwandeln',
    shortDescriptionDe: 'Reduzieren Sie die Dateigröße großer PNG-Grafiken durch Umwandlung in das universelle JPG-Format.',
    titleDe: 'PNG in JPG umwandeln – PNG kostenlos verkleinern | CoolWave',
    metaDescriptionDe: 'PNG-Bilder online kostenlos in JPG umwandeln. Deutliche Speicherplatzersparnis, schnelle Ladezeiten direkt im Browser.',
    h1De: 'PNG in JPG umwandeln – Speicherplatz sparen',
    introDe: 'PNG-Dateien können bei großen Fotos schnell mehrere Megabyte groß sein. Wandeln Sie diese in JPG um, um die Dateigröße um bis zu 80% zu reduzieren – ideal für E-Mail-Anhänge oder Web-Uploads.',
    howItWorksDe: [
      { step: 1, title: 'PNG hochladen', text: 'Wählen Sie das PNG-Bild aus.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'Kompaktes JPG speichern', text: 'Laden Sie das optimierte Bild herunter.' }
    ],
    faqDe: [
      { question: 'Was passiert mit transparenten Flächen?', answer: 'Transparente Bildbereiche werden automatisch mit einem sauberen weißen Hintergrund hinterlegt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Kanten wirken nach der Konvertierung leicht verwaschen.',
        solution: 'Wählen Sie bei Bedarf unser Tool „Bild komprimieren“, um die JPG-Qualitätsstufe auf 90% oder höher zu stellen.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Verarbeitung.',
    searchKeywordsDe: ['PNG zu JPG', 'PNG Bild verkleinern', 'PNG nach JPG konvertieren'],
    supportedFormats: 'PNG zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['jpg-in-png-umwandeln', 'bild-komprimieren'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'bild-komprimieren',
    slug: 'bild-komprimieren',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png', '.webp'],
    nameDe: 'Bild komprimieren',
    shortDescriptionDe: 'Verkleinern Sie JPG-, PNG- und WebP-Bilder interaktiv mit Schieberegler für Qualität und direkter Vorher/Nachher-Größenberechnung.',
    titleDe: 'Bild komprimieren – Fotos kostenlos online verkleinern | CoolWave',
    metaDescriptionDe: 'Bilder online komprimieren: JPG, PNG und WebP ohne Qualitätsverlust verkleinern. Interaktiver Schieberegler mit Live-Vorschau.',
    h1De: 'Bild komprimieren – Dateigröße online verkleinern',
    introDe: 'Optimieren Sie Fotos für Webseiten, Online-Shops oder E-Mail-Anhänge. Mit dem interaktiven Qualitäts-Schieberegler bestimmen Sie die exakte Balance zwischen Dateigröße und Bildschärfe. Die Ersparnis in Megabyte und Prozent wird in Echtzeit berechnet.',
    howItWorksDe: [
      { step: 1, title: 'Bild auswählen', text: 'Laden Sie Ihr Foto (JPG, PNG oder WebP) hoch.' },
      { step: 2, title: 'Qualität einstellen', text: 'Verschieben Sie den Regler (z. B. auf 75%), um die gewünschte Dateigröße zu erzielen.' },
      { step: 3, title: 'Komprimiertes Bild laden', text: 'Laden Sie das optimierte Bild mit maximaler Ersparnis herunter.' }
    ],
    faqDe: [
      { question: 'Welche Qualitätsstufe wird empfohlen?', answer: 'Ein Wert zwischen 75% und 85% liefert für das menschliche Auge unsichtbare Qualitätsunterschiede bei enormer Speicherersparnis.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Dateigröße verringert sich bei PNGs kaum.',
        solution: 'Wandeln Sie PNG-Fotos vorab mit dem Tool „PNG in JPG umwandeln“ um, da JPG für fotorealistische Motive wesentlich stärkere Kompressionsraten bietet.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Kompression. Keine Bildübertragung an externe Server.',
    searchKeywordsDe: ['Bild verkleinern', 'Foto komprimieren', 'KB verringern Bild', 'JPG Bildgröße reduzieren'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-compress',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bildgroesse-aendern', 'jpg-in-webp-umwandeln', 'pdf-komprimieren'],
    icon: 'Shrink',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'bildgroesse-aendern',
    slug: 'bildgroesse-aendern',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png', '.webp'],
    nameDe: 'Bildgröße ändern',
    shortDescriptionDe: 'Skalieren Sie Fotos und Grafiken auf exakte Pixelmaße (Breite × Höhe) oder reduzieren Sie die Maße prozentual mit festem Seitenverhältnis.',
    titleDe: 'Bildgröße ändern – Fotos kostenlos online skalieren | CoolWave',
    metaDescriptionDe: 'Bildgröße online ändern: Exakte Pixelmaße eingeben oder Fotos prozentual verkleinern. Seitenverhältnis sperren und direkt herunterladen.',
    h1De: 'Bildgröße ändern – Fotos exakt skalieren',
    introDe: 'Passen Sie die Abmessungen Ihrer Fotos millimetergenau an. Geben Sie die gewünschte Breite oder Höhe in Pixeln ein – das Seitenverhältnis bleibt automatisch gesperrt, um Verzerrungen zu verhindern.',
    howItWorksDe: [
      { step: 1, title: 'Foto laden', text: 'Wählen Sie das zu skalierende Bild aus.' },
      { step: 2, title: 'Maße anpassen', text: 'Tragen Sie die gewünschte Breite ein (die Höhe passt sich automatisch an).' },
      { step: 3, title: 'Skaliertes Bild speichern', text: 'Laden Sie das perfekt dimensionierte Foto herunter.' }
    ],
    faqDe: [
      { question: 'Werden meine Fotos verzerrt?', answer: 'Nein, das proportionale Seitenverhältnis bleibt standardmäßig gesperrt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das Bild wirkt nach dem Vergrößern pixelig.',
        solution: 'Beim Hochskalieren über die Originalauflösung hinaus entstehen Unschärfen. Wir empfehlen, Bilder nur zu verkleinern oder in Originalauflösung zu belassen.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Skalierung via HTML5 Canvas.',
    searchKeywordsDe: ['Bild skalieren', 'Pixel ändern Bild', 'Foto verkleinern Pixel', 'Breite Höhe anpassen'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-resize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-komprimieren', 'jpg-in-png-umwandeln'],
    icon: 'Maximize2',
    status: 'active'
  },
  {
    id: 'heic-in-jpg-umwandeln',
    slug: 'heic-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.heic', '.heif'],
    targetFormats: ['.jpg'],
    nameDe: 'HEIC in JPG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie Apple iPhone-Fotos (HEIC, HEIF) in universell lesbare JPG-Bilder für Windows, Android und Webseiten.',
    titleDe: 'HEIC in JPG umwandeln – iPhone Fotos kostenlos konvertieren | CoolWave',
    metaDescriptionDe: 'HEIC-Fotos vom Apple iPhone kostenlos online in JPG umwandeln. Öffnen Sie HEIC-Dateien problemlos auf Windows und Android.',
    h1De: 'HEIC in JPG umwandeln – iPhone Fotos universell lesbar machen',
    introDe: 'Apples Standard-Fotoformat HEIC lässt sich auf vielen Windows-PCs, älteren Android-Smartphones oder Webportalen nicht öffnen. Mit CoolWave wandeln Sie HEIC- und HEIF-Bilder in Sekunden in standardisiertes JPG um – ohne Qualitätsverlust und mit allen Originalfarben.',
    howItWorksDe: [
      { step: 1, title: 'HEIC-Foto auswählen', text: 'Ziehen Sie Ihre iPhone-Aufnahmen (.heic) in das Tool.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'JPG herunterladen', text: 'Speichern Sie das universell kompatible JPG-Foto.' }
    ],
    faqDe: [
      { question: 'Was ist HEIC?', answer: 'HEIC (High Efficiency Image Container) ist das von Apple seit iOS 11 genutzte Speicherformat für Fotos.' },
      { question: 'Kann ich HEIC auf Windows ohne Zusatzsoftware öffnen?', answer: 'Nach der Umwandlung in JPG können Sie das Foto auf jedem Windows-PC ohne Zusatz-Codecs direkt ansehen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Datei wird vom Browser nicht erkannt.',
        solution: 'Stellen Sie sicher, dass die Dateiendung tatsächlich .heic oder .heif lautet.'
      }
    ],
    privacyExplanationDe: 'Sichere lokale bzw. sandboxed Konvertierung mit sofortiger Bereinigung.',
    searchKeywordsDe: ['iPhone Fotos umwandeln', 'HEIC zu JPG', 'HEIC Konverter online', 'HEIF in JPG'],
    supportedFormats: 'HEIC / HEIF zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 5 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 50 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['jpg-in-png-umwandeln', 'bild-komprimieren', 'jpg-in-pdf-umwandeln'],
    icon: 'Smartphone',
    status: 'active',
    badge: 'Neu'
  },
  {
    id: 'webp-in-jpg-umwandeln',
    slug: 'webp-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.webp'],
    targetFormats: ['.jpg'],
    nameDe: 'WebP in JPG umwandeln',
    shortDescriptionDe: 'Machen Sie aus WebP-Grafiken universell lesbare JPG-Bilder für Bildbetrachter und Bildbearbeitungsprogramme.',
    titleDe: 'WebP in JPG umwandeln – modernes WebP kostenlos konvertieren | CoolWave',
    metaDescriptionDe: 'WebP-Bilder kostenlos online in JPG umwandeln. Schnelle Konvertierung für Photoshop und Bildbetrachter ohne Server-Upload.',
    h1De: 'WebP in JPG umwandeln – Web-Grafiken universell öffnen',
    introDe: 'Aus dem Internet heruntergeladene Grafiken liegen heute häufig im WebP-Format vor, das von älteren Grafikprogrammen oder Office-Suiten nicht unterstützt wird. Wandeln Sie WebP mit CoolWave in Sekunden in Standard-JPG um.',
    howItWorksDe: [
      { step: 1, title: 'WebP wählen', text: 'Laden Sie Ihre WebP-Datei hoch.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Klicken Sie auf den Button.' },
      { step: 3, title: 'JPG downloaden', text: 'Speichern Sie das fertige JPG-Bild.' }
    ],
    faqDe: [
      { question: 'Funktioniert die Datei danach in Photoshop?', answer: 'Ja, JPG wird von jeder Version von Photoshop, Paint und allen Bildbetrachtern unterstützt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Animierte WebP-Dateien werden statisch.',
        solution: 'JPG unterstützt keine Bildanimationen. Es wird das erste Einzelbild der Sequenz exportiert.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Canvas Konvertierung.',
    searchKeywordsDe: ['WebP zu JPG', 'WebP Datei umwandeln', 'Google WebP in JPEG'],
    supportedFormats: 'WebP zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['jpg-in-webp-umwandeln', 'bild-komprimieren'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'jpg-in-webp-umwandeln',
    slug: 'jpg-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.webp'],
    nameDe: 'JPG in WebP umwandeln',
    shortDescriptionDe: 'Optimieren Sie Ihre Website-Ladezeiten mit dem modernen WebP-Format von Google.',
    titleDe: 'JPG in WebP umwandeln – Ladezeiten für Websites optimieren | CoolWave',
    metaDescriptionDe: 'JPG kostenlos in WebP umwandeln. Bis zu 35% kleinere Dateigrößen bei gleicher Bildqualität für schnellere Webseiten.',
    h1De: 'JPG in WebP umwandeln – Google PageSpeed steigern',
    introDe: 'WebP ist Googles modernes Bildformat der Wahl für das Internet. Durch die Umwandlung Ihrer JPG-Fotos in WebP sparen Sie durchschnittlich 25% bis 35% an Dateigröße ein – bei exakt gleicher visueller Qualität. Dadurch lädt Ihre Website spürbar schneller.',
    howItWorksDe: [
      { step: 1, title: 'JPG-Foto wählen', text: 'Laden Sie Ihre Website-Bilder hoch.' },
      { step: 2, title: 'In WebP umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'WebP herunterladen', text: 'Binden Sie das optimierte WebP direkt in Ihre Webseite ein.' }
    ],
    faqDe: [
      { question: 'Wird WebP von allen Browsern unterstützt?', answer: 'Ja, alle modernen Browser wie Chrome, Safari, Firefox und Edge unterstützen WebP uneingeschränkt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das Bild wird im lokalen Windows-Explorer ohne Miniaturansicht dargestellt.',
        solution: 'Der Standard-Explorer älterer Windows-Versionen benötigt WebP-Erweiterungen. Auf Websites und in Browsern funktioniert das Bild jedoch einwandfrei.'
      }
    ],
    privacyExplanationDe: '100% In-Browser WebP Enkodierung.',
    searchKeywordsDe: ['JPG zu WebP', 'Website Bilder optimieren', 'Google WebP Format erstellen'],
    supportedFormats: 'JPG zu WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['webp-in-jpg-umwandeln', 'bild-komprimieren'],
    icon: 'Sparkles',
    status: 'active',
    badge: 'Neu'
  },
  {
    id: 'schwarz-weiss-filter',
    slug: 'schwarz-weiss-filter',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.png'],
    nameDe: 'Schwarz-Weiß Bildfilter',
    shortDescriptionDe: 'Konvertieren Sie Farbbilder mit einem Klick in stilvolle Schwarzweiß- und Graustufen-Grafiken.',
    titleDe: 'Schwarz-Weiß Bildfilter online – Fotos in Graustufen umwandeln | CoolWave',
    metaDescriptionDe: 'Fotos kostenlos online in Schwarzweiß und Graustufen umwandeln. Natürliche Luminanz-Berechnung direkt im Browser.',
    h1De: 'Schwarz-Weiß Bildfilter – Fotos in edle Graustufen verwandeln',
    introDe: 'Verleihen Sie Ihren Fotos einen zeitlosen Schwarzweiß-Look. CoolWave nutzt die standardisierte Rec. 709 Luminanz-Formel, um Farbwerte in naturgetreue Helligkeitsstufen umzurechnen – ohne Farbverfälschungen.',
    howItWorksDe: [
      { step: 1, title: 'Farbbild laden', text: 'Wählen Sie das umzuwandelnde Foto aus.' },
      { step: 2, title: 'In Schwarzweiß umwandeln', text: 'Klicken Sie auf den Filter-Button.' },
      { step: 3, title: 'Graustufen-Bild laden', text: 'Laden Sie Ihr fertiges Schwarzweiß-Foto herunter.' }
    ],
    faqDe: [
      { question: 'Werden Graustufen natürlich berechnet?', answer: 'Ja, es wird die physiologische Farbwahrnehmung des menschlichen Auges (Grün 71,5%, Rot 21,2%, Blau 7,2%) berücksichtigt.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Das Bild wirkt zu kontrastarm.',
        solution: 'Nutzen Sie vorab ein kontrastreicheres Ausgangsbild oder skalieren Sie die Farbsättigung.'
      }
    ],
    privacyExplanationDe: '100% In-Browser Pixelverarbeitung via Canvas.',
    searchKeywordsDe: ['Foto in Schwarz Weiß', 'Graustufen Filter online', 'Schwarzweiß Konverter'],
    supportedFormats: 'JPG, PNG, WebP zu PNG',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-bw',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-komprimieren', 'bildgroesse-aendern'],
    icon: 'Palette',
    status: 'active'
  },
  {
    id: 'png-in-webp-umwandeln',
    slug: 'png-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.webp'],
    nameDe: 'PNG in WebP umwandeln',
    shortDescriptionDe: 'Konvertieren Sie PNG-Bilder in WebP mit erhaltener Transparenz (Alpha-Kanal) und bis zu 30% geringerer Dateigröße.',
    titleDe: 'PNG in WebP umwandeln – Transparenz erhalten & Ladezeit optimieren | CoolWave',
    metaDescriptionDe: 'PNG kostenlos online in WebP umwandeln. Volle Alpha-Transparenz erhalten bei drastisch kleinerer Dateigröße für Webseiten.',
    h1De: 'PNG in WebP umwandeln – Transparente Grafiken fürs Web komprimieren',
    introDe: 'Das WebP-Format unterstützt wie PNG verlustfreie Kompression und Alpha-Transparenz, erzeugt jedoch bis zu 30% kleinere Dateien. Konvertieren Sie Logos, Grafiken und Illustrationen direkt im Browser in modernes WebP.',
    howItWorksDe: [
      { step: 1, title: 'PNG-Datei wählen', text: 'Ziehen Sie Ihr PNG-Bild in den Upload-Bereich.' },
      { step: 2, title: 'In WebP umwandeln', text: 'Starten Sie die blitzschnelle Konvertierung.' },
      { step: 3, title: 'WebP herunterladen', text: 'Speichern Sie das optimierte WebP mit voller Transparenz.' }
    ],
    faqDe: [
      { question: 'Bleibt der transparente Hintergrund erhalten?', answer: 'Ja! WebP unterstützt volle Alpha-Transparenz exakt wie PNG.' },
      { question: 'Wird die Bildqualität verringert?', answer: 'Nein, CoolWave nutzt qualitativ hochwertige Algorithmen für gestochen scharfe Kanten.' }
    ],
    troubleshootingDe: [
      { issue: 'Transparenz erscheint weiß in älteren Programmen.', solution: 'Manche alte Bildbearbeitungsprogramme zeigen WebP-Transparenz als weiß an. Im Browser und modernen Programmen ist der Hintergrund transparent.' }
    ],
    privacyExplanationDe: '100% clientseitig im Browser verarbeitet. Ihre Grafiken bleiben auf Ihrem Rechner.',
    searchKeywordsDe: ['PNG zu WebP', 'PNG transparent in WebP', 'WebP Konverter online', 'PNG verkleinern'],
    supportedFormats: 'PNG zu WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['webp-in-png-umwandeln', 'jpg-in-webp-umwandeln', 'png-in-jpg-umwandeln'],
    icon: 'Sparkles',
    status: 'active',
    features: ['Erhalt aller Alpha-Transparenzen', 'Bis zu 30% kleinere Dateigröße', 'Kein Qualitätsverlust', 'Direkt im Browser ohne Upload']
  },
  {
    id: 'webp-in-png-umwandeln',
    slug: 'webp-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.webp'],
    targetFormats: ['.png'],
    nameDe: 'WebP in PNG umwandeln',
    shortDescriptionDe: 'Wandeln Sie WebP-Bilder in verlustfreies PNG mit vollem Erhalt aller transparenten Bereiche um.',
    titleDe: 'WebP in PNG umwandeln – kostenlos mit Transparenz konvertieren | CoolWave',
    metaDescriptionDe: 'WebP online in PNG umwandeln. Volle Transparenz erhalten für Photoshop, InDesign und Office. Schnell, kostenlos und ohne Upload.',
    h1De: 'WebP in PNG umwandeln – kompatibles Bildformat mit Transparenz',
    introDe: 'WebP-Bilder aus dem Internet lassen sich in vielen Grafikprogrammen oder Office-Dokumenten nicht direkt einfügen. Mit CoolWave wandeln Sie WebP in Sekunden in standardisiertes PNG um – mit transparentem Hintergrund.',
    howItWorksDe: [
      { step: 1, title: 'WebP laden', text: 'Wählen Sie Ihre WebP-Datei aus.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf den Konvertieren-Button.' },
      { step: 3, title: 'PNG speichern', text: 'Laden Sie das verlustfreie PNG herunter.' }
    ],
    faqDe: [
      { question: 'Kann ich die PNG-Datei in Word oder Photoshop öffnen?', answer: 'Ja, PNG wird von jeder Software, jedem Betriebssystem und allen Office-Programmen unterstützt.' }
    ],
    troubleshootingDe: [
      { issue: 'Animiertes WebP verliert Bewegung.', solution: 'Das Standard-PNG-Format unterstützt keine Animationen. Es wird das erste Frame exportiert.' }
    ],
    privacyExplanationDe: '100% In-Browser Konvertierung via Canvas.',
    searchKeywordsDe: ['WebP zu PNG', 'WebP Bild umwandeln', 'WebP in PNG transparent'],
    supportedFormats: 'WebP zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['png-in-webp-umwandeln', 'webp-in-jpg-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'gif-in-jpg-umwandeln',
    slug: 'gif-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.gif'],
    targetFormats: ['.jpg'],
    nameDe: 'GIF in JPG umwandeln',
    shortDescriptionDe: 'Extrahieren Sie Standbilder aus GIF-Dateien und wandeln Sie diese in universell kompatibles JPG um.',
    titleDe: 'GIF in JPG umwandeln – GIF-Grafiken in JPG konvertieren | CoolWave',
    metaDescriptionDe: 'GIF kostenlos online in JPG umwandeln. Machen Sie GIF-Bilder kompatibel für alle Bildbetrachter und soziale Medien.',
    h1De: 'GIF in JPG umwandeln – Standbilder und Animationen konvertieren',
    introDe: 'GIF-Dateien sind oft farblich auf 256 Farben begrenzt und haben eine hohe Dateigröße. Wandeln Sie Standbilder aus GIFs in kompaktes, millionenfarbiges JPG um.',
    howItWorksDe: [
      { step: 1, title: 'GIF auswählen', text: 'Laden Sie Ihre GIF-Datei hoch.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Umwandlung.' },
      { step: 3, title: 'JPG downloaden', text: 'Speichern Sie das fertige JPG-Bild.' }
    ],
    faqDe: [
      { question: 'Was passiert mit animierten GIFs?', answer: 'Es wird das repräsentative erste Einzelbild in bester Qualität als JPG exportiert.' }
    ],
    troubleshootingDe: [
      { issue: 'Transparenter Hintergrund wird weiß.', solution: 'JPG unterstützt keine Transparenz. Transparente Bildbereiche werden mit weißem Hintergrund gefüllt.' }
    ],
    privacyExplanationDe: 'Sichere Konvertierung direkt im Browser oder über isolierte Worker.',
    searchKeywordsDe: ['GIF zu JPG', 'GIF Bild in JPG', 'GIF umwandeln online'],
    supportedFormats: 'GIF zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['gif-in-png-umwandeln', 'jpg-in-gif-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'gif-in-png-umwandeln',
    slug: 'gif-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.gif'],
    targetFormats: ['.png'],
    nameDe: 'GIF in PNG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie GIF-Bilder in verlustfreies PNG mit sauberem transparentem Hintergrund.',
    titleDe: 'GIF in PNG umwandeln – GIF kostenlos mit Transparenz konvertieren | CoolWave',
    metaDescriptionDe: 'GIF online in PNG umwandeln. Volle Transparenz erhalten bei besserer Bildqualität und ohne Farbstufen-Artefakte.',
    h1De: 'GIF in PNG umwandeln – gestochen scharfe Grafiken mit Transparenz',
    introDe: 'Befreien Sie Ihre GIF-Grafiken von der 256-Farben-Begrenzung. Wandeln Sie GIFs in PNG um, um saubere Kanten und transparente Bereiche verlustfrei zu speichern.',
    howItWorksDe: [
      { step: 1, title: 'GIF hochladen', text: 'Wählen Sie Ihre GIF-Datei aus.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'PNG herunterladen', text: 'Speichern Sie das hochwertige PNG-Bild.' }
    ],
    faqDe: [
      { question: 'Bleibt die Transparenz erhalten?', answer: 'Ja, transparente Bereiche im GIF werden nahtlos als PNG-Alpha-Kanal übernommen.' }
    ],
    troubleshootingDe: [
      { issue: 'Ränder wirken ausgefranst.', solution: 'Ältere GIFs nutzen 1-Bit-Transparenz. PNG glättet die Kanten im Rahmen der vorhandenen Bildinformationen.' }
    ],
    privacyExplanationDe: '100% In-Browser Verarbeitung.',
    searchKeywordsDe: ['GIF zu PNG', 'GIF transparent in PNG', 'GIF konvertieren'],
    supportedFormats: 'GIF zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['png-in-gif-umwandeln', 'gif-in-jpg-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-gif-umwandeln',
    slug: 'png-in-gif-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.gif'],
    nameDe: 'PNG in GIF umwandeln',
    shortDescriptionDe: 'Erstellen Sie aus Ihren PNG-Bildern standardkonforme GIF-Dateien für Foren, Webseiten und E-Mails.',
    titleDe: 'PNG in GIF umwandeln – Grafiken online in GIF konvertieren | CoolWave',
    metaDescriptionDe: 'PNG kostenlos online in GIF umwandeln. Perfekt für Foren-Avatare, Newsletter und Retro-Webgrafiken.',
    h1De: 'PNG in GIF umwandeln – universelle GIF-Dateien erstellen',
    introDe: 'Erstellen Sie aus PNG-Dateien standardkonforme GIF-Bilder. Der CoolWave Worker optimiert die Farbpalette für maximale Kompatibilität mit E-Mail-Clients und älteren Systemen.',
    howItWorksDe: [
      { step: 1, title: 'PNG auswählen', text: 'Laden Sie Ihre PNG-Datei hoch.' },
      { step: 2, title: 'In GIF umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'GIF herunterladen', text: 'Speichern Sie Ihr fertiges GIF-Bild.' }
    ],
    faqDe: [
      { question: 'Werden Transparenzen unterstützt?', answer: 'Ja, GIF unterstützt transparente Bereiche mit binärer Maske.' }
    ],
    troubleshootingDe: [
      { issue: 'Farbverläufe wirken gerastert.', solution: 'GIF unterstützt maximal 256 Farben. Bei feinen Farbverläufen wird Dithering angewendet.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung mit automatischer Bereinigung.',
    searchKeywordsDe: ['PNG zu GIF', 'PNG in GIF umwandeln', 'GIF Ersteller aus PNG'],
    supportedFormats: 'PNG zu GIF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['gif-in-png-umwandeln', 'jpg-in-gif-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'jpg-in-gif-umwandeln',
    slug: 'jpg-in-gif-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.gif'],
    nameDe: 'JPG in GIF umwandeln',
    shortDescriptionDe: 'Wandeln Sie JPG-Fotos in standardisierte GIF-Dateien mit optimierter Farbpalette um.',
    titleDe: 'JPG in GIF umwandeln – Fotos kostenlos in GIF konvertieren | CoolWave',
    metaDescriptionDe: 'JPG online in GIF umwandeln. Optimierte Farbreduktion für universelle Kompatibilität in Foren und E-Mails.',
    h1De: 'JPG in GIF umwandeln – Fotos in kompakte GIF-Bilder konvertieren',
    introDe: 'Konvertieren Sie JPG-Aufnahmen in das bewährte GIF-Format. Unser Algorithmus berechnet eine hochwertige 256-Farben-Palette für natürliche Bildübergänge.',
    howItWorksDe: [
      { step: 1, title: 'JPG hochladen', text: 'Wählen Sie das JPG-Foto aus.' },
      { step: 2, title: 'In GIF umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'GIF speichern', text: 'Laden Sie das GIF sofort herunter.' }
    ],
    faqDe: [
      { question: 'Ist die Umwandlung kostenlos?', answer: 'Ja, vollständig kostenlos und ohne Registrierung.' }
    ],
    troubleshootingDe: [
      { issue: 'Die Dateigröße ist größer als beim JPG.', solution: 'JPG nutzt verlustbehaftete DCT-Kompression, während GIF LZW nutzt. Bei Fotos ist JPG oft kleiner.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung im isolated Worker.',
    searchKeywordsDe: ['JPG zu GIF', 'JPEG in GIF', 'Foto in GIF umwandeln'],
    supportedFormats: 'JPG zu GIF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['gif-in-jpg-umwandeln', 'png-in-gif-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'svg-in-png-umwandeln',
    slug: 'svg-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.png'],
    nameDe: 'SVG in PNG umwandeln',
    shortDescriptionDe: 'Rastern Sie Vektorgrafiken (SVG) in gestochen scharfe PNG-Bilder mit transparentem Hintergrund.',
    titleDe: 'SVG in PNG umwandeln – Vektorgrafiken online in PNG rastern | CoolWave',
    metaDescriptionDe: 'SVG kostenlos online in PNG umwandeln. Transparenter Hintergrund und gestochen scharfe Kanten für Web und Print.',
    h1De: 'SVG in PNG umwandeln – Vektorgrafiken in Pixelbilder rastern',
    introDe: 'Wandeln Sie Vektorgrafiken (.svg) in hochauflösende PNG-Rasterbilder um. Transparenzen, Schriften und Farbverläufe werden pixelgenau gerendert – ideal für Social Media und Präsentationen.',
    howItWorksDe: [
      { step: 1, title: 'SVG auswählen', text: 'Ziehen Sie Ihre SVG-Grafik in den Upload-Bereich.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Starten Sie die Rasterung.' },
      { step: 3, title: 'PNG herunterladen', text: 'Speichern Sie das fertige PNG mit transparenter Ebene.' }
    ],
    faqDe: [
      { question: 'Bleibt die Transparenz erhalten?', answer: 'Ja, transparente Bereiche in der SVG-Datei bleiben im PNG vollständig transparent.' }
    ],
    troubleshootingDe: [
      { issue: 'Schriftarten werden nicht korrekt dargestellt.', solution: 'Betten Sie Schriftarten als Pfade (Kurven) in der SVG-Datei ein, um eine identische Darstellung auf allen Systemen zu garantieren.' }
    ],
    privacyExplanationDe: '100% In-Browser Rendering via Canvas und librsvg.',
    searchKeywordsDe: ['SVG zu PNG', 'Vektorgrafik in PNG umwandeln', 'SVG rastern'],
    supportedFormats: 'SVG zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['svg-in-jpg-umwandeln', 'svg-in-webp-umwandeln', 'png-in-svg-umwandeln'],
    icon: 'Vector',
    status: 'active',
    features: ['Perfekte Vektor-zu-Pixel-Rasterung', 'Volle Alpha-Transparenz', 'Hohe DPI-Schärfe', 'Direkt im Browser']
  },
  {
    id: 'svg-in-jpg-umwandeln',
    slug: 'svg-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.jpg'],
    nameDe: 'SVG in JPG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie SVG-Vektoren in Standard-JPG-Bilder mit weißem oder gewähltem Hintergrund.',
    titleDe: 'SVG in JPG umwandeln – Vektoren kostenlos in JPG konvertieren | CoolWave',
    metaDescriptionDe: 'SVG online in JPG umwandeln. Perfekt für Bildbetrachter, PowerPoint und Webseiten ohne SVG-Unterstützung.',
    h1De: 'SVG in JPG umwandeln – Vektorgrafiken als JPG speichern',
    introDe: 'Konvertieren Sie SVG-Vektorgrafiken in universell kompatible JPG-Bilder. Transparente Bereiche werden harmonisch mit weißem Hintergrund hinterlegt.',
    howItWorksDe: [
      { step: 1, title: 'SVG laden', text: 'Wählen Sie die SVG-Vektordatei aus.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Klicken Sie auf Konvertieren.' },
      { step: 3, title: 'JPG downloaden', text: 'Laden Sie das gerasterte JPG-Bild herunter.' }
    ],
    faqDe: [
      { question: 'Welcher Hintergrund wird verwendet?', answer: 'Transparente SVG-Bereiche werden standardmäßig mit weißem Hintergrund gefüllt.' }
    ],
    troubleshootingDe: [
      { issue: 'Bildgröße ist zu klein.', solution: 'Geben Sie in der SVG-Datei passende width- und height-Attribute an.' }
    ],
    privacyExplanationDe: '100% In-Browser Rendering.',
    searchKeywordsDe: ['SVG zu JPG', 'SVG in JPEG umwandeln', 'Vektoren in JPG'],
    supportedFormats: 'SVG zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['svg-in-png-umwandeln', 'svg-in-webp-umwandeln'],
    icon: 'Vector',
    status: 'active'
  },
  {
    id: 'svg-in-webp-umwandeln',
    slug: 'svg-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.webp'],
    nameDe: 'SVG in WebP umwandeln',
    shortDescriptionDe: 'Rastern Sie SVG-Vektoren in modernes, hochkomprimiertes WebP mit voller Transparenz.',
    titleDe: 'SVG in WebP umwandeln – Vektoren in modernes WebP rastern | CoolWave',
    metaDescriptionDe: 'SVG kostenlos in WebP umwandeln. Extrem kleine Dateigröße bei gestochen scharfen Details für Web-Entwickler.',
    h1De: 'SVG in WebP umwandeln – Vektoren für das Web optimieren',
    introDe: 'Erstellen Sie aus komplexen SVG-Dateien performante WebP-Grafiken. Reduziert die CPU-Last des Browsers beim Rendering von aufwendigen Vektor-Pfaden.',
    howItWorksDe: [
      { step: 1, title: 'SVG hochladen', text: 'Wählen Sie die SVG-Grafik aus.' },
      { step: 2, title: 'In WebP umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'WebP speichern', text: 'Laden Sie das optimierte WebP herunter.' }
    ],
    faqDe: [
      { question: 'Warum SVG in WebP umwandeln?', answer: 'Sehr komplexe SVGs mit tausenden Pfaden verlangsamen das Rendering im Browser. WebP rastern eliminiert diese CPU-Last.' }
    ],
    troubleshootingDe: [
      { issue: 'Farbverläufe wirken verwaschen.', solution: 'Erhöhen Sie den Qualitätsregler auf 100% für maximale Detailtreue.' }
    ],
    privacyExplanationDe: '100% lokale Browser-Ausführung.',
    searchKeywordsDe: ['SVG zu WebP', 'SVG in WebP umwandeln', 'Vektorgrafik komprimieren'],
    supportedFormats: 'SVG zu WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['svg-in-png-umwandeln', 'png-in-webp-umwandeln'],
    icon: 'Sparkles',
    status: 'active'
  },
  {
    id: 'png-in-svg-umwandeln',
    slug: 'png-in-svg-umwandeln',
    category: 'images',
    sourceFormats: ['.png', '.jpg', '.jpeg'],
    targetFormats: ['.svg'],
    nameDe: 'PNG in SVG umwandeln (Vektorisieren)',
    shortDescriptionDe: 'Vektorisieren Sie Pixelbilder (PNG, JPG) in skalierbare SVG-Vektorpfade mit sauberen Kurven.',
    titleDe: 'PNG in SVG umwandeln – Pixelbilder online vektorisieren | CoolWave',
    metaDescriptionDe: 'PNG kostenlos online in SVG vektorisieren. Verwandeln Sie Logos und Grafiken in verlustfrei skalierbare Vektorgrafiken.',
    h1De: 'PNG in SVG umwandeln – Pixelbilder in Vektorgrafiken vektorisieren',
    introDe: 'Konvertieren Sie Rastergrafiken wie Logos, Icons, Skizzen und Strichzeichnungen in skalierbare Vektorgrafiken (.svg). Der integrierte Potrace-Vektorisierungs-Algorithmus erkennt Kanten und erzeugt saubere Bezier-Kurven.',
    howItWorksDe: [
      { step: 1, title: 'PNG hochladen', text: 'Laden Sie Ihr Logo oder Ihre Rastergrafik hoch.' },
      { step: 2, title: 'Vektorisierung starten', text: 'Die Vektor-Engine berechnet glatte Kantenpfade.' },
      { step: 3, title: 'SVG herunterladen', text: 'Speichern Sie die verlustfrei skalierbare SVG-Vektordatei.' }
    ],
    faqDe: [
      { question: 'Welche Bilder eignen sich am besten?', answer: 'Logos, Strichzeichnungen, Icons, Silhouetten und Grafiken mit klaren Kontrasten liefern die besten Vektorergebnisse.' },
      { question: 'Ist die erzeugte SVG beliebig vergrößerbar?', answer: 'Ja! Als echte Vektordatei kann die SVG ohne jeden Qualitätsverlust auf Plakatgröße skaliert werden.' }
    ],
    troubleshootingDe: [
      { issue: 'Fotos wirken unnatürlich.', solution: 'Vektorisierung eignet sich primär für Grafiken, Icons und Logos, nicht für komplexe Fotomotive.' }
    ],
    privacyExplanationDe: 'Sichere Vektorisierung auf isolierten Workern.',
    searchKeywordsDe: ['PNG vektorisieren', 'PNG zu SVG', 'Pixel in Vektor umwandeln', 'Bild nachzeichnen SVG'],
    supportedFormats: 'PNG / JPG zu SVG (Vektor)',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['svg-in-png-umwandeln', 'png-in-jpg-umwandeln'],
    icon: 'Vector',
    status: 'active',
    features: ['Echte Vektorisierung mit Bezier-Kurven', 'Verlustfreie Skalierbarkeit für Print & Web', 'Optimiert für Logos und Icons', 'Automatischer Kanten-Trace']
  },
  {
    id: 'heic-in-png-umwandeln',
    slug: 'heic-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.heic', '.heif'],
    targetFormats: ['.png'],
    nameDe: 'HEIC in PNG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie Apple iPhone HEIC-Fotos in verlustfreies PNG mit vollem Farbumfang.',
    titleDe: 'HEIC in PNG umwandeln – iPhone Fotos verlustfrei in PNG | CoolWave',
    metaDescriptionDe: 'HEIC kostenlos in PNG umwandeln. Öffnen Sie Apple HEIC/HEIF-Fotos auf jedem PC in gestochen scharfer PNG-Qualität.',
    h1De: 'HEIC in PNG umwandeln – iPhone Fotos in verlustfreies PNG',
    introDe: 'Öffnen und bearbeiten Sie Ihre iPhone-Fotos (.heic) ohne Kompressionsverluste. CoolWave dekodiert HEIC-Dateien und exportiert sie als universell kompatibles PNG.',
    howItWorksDe: [
      { step: 1, title: 'HEIC-Datei wählen', text: 'Ziehen Sie Ihre iPhone-Aufnahme in das Tool.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Starten Sie die Dekodierung.' },
      { step: 3, title: 'PNG herunterladen', text: 'Laden Sie das kompatible PNG herunter.' }
    ],
    faqDe: [
      { question: 'Werden Live Photos unterstützt?', answer: 'Es wird das hochauflösende Hauptfoto der HEIC-Datei in voller Qualität konvertiert.' }
    ],
    troubleshootingDe: [
      { issue: 'Datei wird abgelehnt.', solution: 'Überprüfen Sie, ob die Datei unbeschädigt direkt vom iPhone exportiert wurde.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung mit automatischer Bereinigung.',
    searchKeywordsDe: ['HEIC zu PNG', 'iPhone Fotos in PNG', 'HEIF zu PNG'],
    supportedFormats: 'HEIC zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['heic-in-jpg-umwandeln', 'heic-in-webp-umwandeln'],
    icon: 'Smartphone',
    status: 'active'
  },
  {
    id: 'heic-in-webp-umwandeln',
    slug: 'heic-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.heic', '.heif'],
    targetFormats: ['.webp'],
    nameDe: 'HEIC in WebP umwandeln',
    shortDescriptionDe: 'Konvertieren Sie iPhone-Fotos direkt in optimiertes WebP für Websites und Online-Galerien.',
    titleDe: 'HEIC in WebP umwandeln – iPhone Fotos fürs Web optimieren | CoolWave',
    metaDescriptionDe: 'HEIC online in WebP umwandeln. Kleinere Dateigrößen bei brillanten Farben für schnellen Web-Upload.',
    h1De: 'HEIC in WebP umwandeln – iPhone-Fotos für Webseiten optimieren',
    introDe: 'Möchten Sie iPhone-Fotos direkt auf Ihrer Website oder im Blog veröffentlichen? Wandeln Sie HEIC in das von Google empfohlene WebP-Format um.',
    howItWorksDe: [
      { step: 1, title: 'HEIC hochladen', text: 'Wählen Sie das iPhone-Foto aus.' },
      { step: 2, title: 'In WebP umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'WebP speichern', text: 'Speichern Sie das kompakte WebP-Bild.' }
    ],
    faqDe: [
      { question: 'Spart WebP Speicherplatz?', answer: 'Ja, WebP komprimiert Fotos hocheffizient bei hervorragender visueller Qualität.' }
    ],
    troubleshootingDe: [
      { issue: 'Farbverschiebung.', solution: 'CoolWave übernimmt das Farbprofil der Originalaufnahme automatisch.' }
    ],
    privacyExplanationDe: 'Verarbeitung im isolierten Server-Worker.',
    searchKeywordsDe: ['HEIC zu WebP', 'iPhone Foto WebP', 'HEIF in WebP'],
    supportedFormats: 'HEIC zu WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['heic-in-jpg-umwandeln', 'jpg-in-webp-umwandeln'],
    icon: 'Smartphone',
    status: 'active'
  },
  {
    id: 'avif-in-jpg-umwandeln',
    slug: 'avif-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.avif'],
    targetFormats: ['.jpg'],
    nameDe: 'AVIF in JPG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie moderne AVIF-Bilder in universell lesbares Standard-JPG für alle Geräte.',
    titleDe: 'AVIF in JPG umwandeln – AVIF-Grafiken kostenlos in JPG | CoolWave',
    metaDescriptionDe: 'AVIF online in JPG umwandeln. Öffnen Sie AVIF-Bilder auf älteren PCs, Photoshop und Bildbetrachtern.',
    h1De: 'AVIF in JPG umwandeln – modernes AVIF universell öffnen',
    introDe: 'AVIF bietet herausragende Kompression, wird jedoch von vielen älteren Bildbetrachtern und Programmen noch nicht unterstützt. Mit CoolWave wandeln Sie AVIF in Sekunden in kompatibles JPG um.',
    howItWorksDe: [
      { step: 1, title: 'AVIF hochladen', text: 'Wählen Sie Ihre AVIF-Datei aus.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'JPG downloaden', text: 'Speichern Sie das fertige JPG-Foto.' }
    ],
    faqDe: [
      { question: 'Was ist AVIF?', answer: 'AVIF (AV1 Image File Format) ist ein modernes, offenes Bildformat basierend auf dem AV1-Videocodec.' }
    ],
    troubleshootingDe: [
      { issue: 'Datei wird nicht geöffnet.', solution: 'Stellen Sie sicher, dass die AVIF-Datei nicht beschädigt ist.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung mit Sharp.',
    searchKeywordsDe: ['AVIF zu JPG', 'AVIF Bild umwandeln', 'AV1 Foto konvertieren'],
    supportedFormats: 'AVIF zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['avif-in-png-umwandeln', 'avif-in-webp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'avif-in-png-umwandeln',
    slug: 'avif-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.avif'],
    targetFormats: ['.png'],
    nameDe: 'AVIF in PNG umwandeln',
    shortDescriptionDe: 'Wandeln Sie AVIF-Dateien in verlustfreies PNG mit transparenten Bereichen um.',
    titleDe: 'AVIF in PNG umwandeln – AVIF mit Transparenz in PNG konvertieren | CoolWave',
    metaDescriptionDe: 'AVIF kostenlos in PNG umwandeln. Behalten Sie transparente Bildbereiche für Photoshop und Grafikdesign.',
    h1De: 'AVIF in PNG umwandeln – verlustfreies PNG mit Transparenz',
    introDe: 'Konvertieren Sie AVIF-Grafiken in kompatibles PNG. Transparente Ebenen bleiben exakt erhalten – ideal für Webdesigner und Illustratoren.',
    howItWorksDe: [
      { step: 1, title: 'AVIF laden', text: 'Wählen Sie die AVIF-Datei aus.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf Konvertieren.' },
      { step: 3, title: 'PNG herunterladen', text: 'Speichern Sie das fertige PNG.' }
    ],
    faqDe: [
      { question: 'Wird Transparenz unterstützt?', answer: 'Ja, AVIF-Transparenzen werden nahtlos in den PNG-Alpha-Kanal übertragen.' }
    ],
    troubleshootingDe: [
      { issue: 'Kanten sind pixelig.', solution: 'CoolWave verwendet bikubische Interpolation für absolut glatte Konturen.' }
    ],
    privacyExplanationDe: 'Sichere Konvertierung mit automatischer Bereinigung.',
    searchKeywordsDe: ['AVIF zu PNG', 'AVIF transparent', 'AVIF in PNG umwandeln'],
    supportedFormats: 'AVIF zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['avif-in-jpg-umwandeln', 'png-in-webp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'avif-in-webp-umwandeln',
    slug: 'avif-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.avif'],
    targetFormats: ['.webp'],
    nameDe: 'AVIF in WebP umwandeln',
    shortDescriptionDe: 'Konvertieren Sie AVIF-Bilder in universell von allen Browsern unterstütztes WebP.',
    titleDe: 'AVIF in WebP umwandeln – universelle Web-Grafiken erstellen | CoolWave',
    metaDescriptionDe: 'AVIF in WebP umwandeln. Maximale Browser-Kompatibilität bei minimaler Dateigröße für Webseiten.',
    h1De: 'AVIF in WebP umwandeln – Web-Kompatibilität maximieren',
    introDe: 'Während ältere Browser AVIF noch nicht immer darstellen, wird WebP von über 98% aller weltweiten Browser unterstützt. Wandeln Sie AVIF in WebP um.',
    howItWorksDe: [
      { step: 1, title: 'AVIF wählen', text: 'Laden Sie die AVIF-Datei hoch.' },
      { step: 2, title: 'In WebP umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'WebP downloaden', text: 'Laden Sie das WebP-Bild herunter.' }
    ],
    faqDe: [
      { question: 'Welcher Vorteil bietet WebP gegenüber AVIF?', answer: 'WebP wird auch von älteren Browserversionen und gängigen Bildbearbeitungsprogrammen unterstützt.' }
    ],
    troubleshootingDe: [
      { issue: 'Qualitätsverlust.', solution: 'Passen Sie den Qualitätsschieberegler auf bis zu 100% an.' }
    ],
    privacyExplanationDe: '100% In-Browser Verarbeitung.',
    searchKeywordsDe: ['AVIF zu WebP', 'AVIF in WebP konvertieren', 'AV1 zu WebP'],
    supportedFormats: 'AVIF zu WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['avif-in-jpg-umwandeln', 'jpg-in-webp-umwandeln'],
    icon: 'Sparkles',
    status: 'active'
  },
  {
    id: 'tiff-in-jpg-umwandeln',
    slug: 'tiff-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.tiff', '.tif'],
    targetFormats: ['.jpg'],
    nameDe: 'TIFF in JPG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie schwere Scanner- und Druck-TIFFs in schlanke, universelle JPG-Fotos.',
    titleDe: 'TIFF in JPG umwandeln – Scanner-TIFFs kostenlos in JPG | CoolWave',
    metaDescriptionDe: 'TIFF online in JPG umwandeln. Verkleinern Sie große Scanner-Dateien drastisch für E-Mail und Web.',
    h1De: 'TIFF in JPG umwandeln – große Scanner-Dateien in kompaktes JPG',
    introDe: 'Scanner und hochauflösende Kameras erzeugen oft riesige TIFF-Dateien von mehreren hundert Megabyte. Mit CoolWave komprimieren Sie TIFFs in Sekunden zu handlichen JPGs.',
    howItWorksDe: [
      { step: 1, title: 'TIFF auswählen', text: 'Ziehen Sie Ihre TIFF-Datei (.tif, .tiff) in das Tool.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Umwandlung.' },
      { step: 3, title: 'JPG herunterladen', text: 'Laden Sie das kompakte JPG-Bild herunter.' }
    ],
    faqDe: [
      { question: 'Werden CMYK-TIFFs unterstützt?', answer: 'Ja, CMYK-Farbprofile werden automatisch in sRGB für Bildschirme umgewandelt.' }
    ],
    troubleshootingDe: [
      { issue: 'Die Datei ist sehr groß (>100 MB).', solution: 'CoolWave unterstützt Dateien bis 50 MB (kostenlos) und 500 MB (Pro).' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung auf isolierten Workern mit sofortiger Löschung.',
    searchKeywordsDe: ['TIFF zu JPG', 'TIF in JPG umwandeln', 'Scanner TIFF verkleinern'],
    supportedFormats: 'TIFF zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['tiff-in-png-umwandeln', 'jpg-in-tiff-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'tiff-in-png-umwandeln',
    slug: 'tiff-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.tiff', '.tif'],
    targetFormats: ['.png'],
    nameDe: 'TIFF in PNG umwandeln',
    shortDescriptionDe: 'Wandeln Sie TIFF-Dateien in verlustfreies PNG mit transparenten Bereichen um.',
    titleDe: 'TIFF in PNG umwandeln – TIFF verlustfrei in PNG konvertieren | CoolWave',
    metaDescriptionDe: 'TIFF online in PNG umwandeln. Verlustfreie Konvertierung für Grafikprogramme und Webseiten.',
    h1De: 'TIFF in PNG umwandeln – verlustfreie Grafiken ohne Qualitätseinbußen',
    introDe: 'Konvertieren Sie TIFF-Dateien in standardisiertes PNG, ohne Bildinformationen zu verlieren. Perfekt für Druckgrafiken, Pläne und Transparenzen.',
    howItWorksDe: [
      { step: 1, title: 'TIFF hochladen', text: 'Wählen Sie Ihre TIFF-Datei aus.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'PNG speichern', text: 'Speichern Sie das verlustfreie PNG.' }
    ],
    faqDe: [
      { question: 'Bleibt die volle Schärfe erhalten?', answer: 'Ja, PNG arbeitet vollständig verlustfrei.' }
    ],
    troubleshootingDe: [
      { issue: 'Transparenz fehlt.', solution: 'Wenn das Ausgangs-TIFF einen Alpha-Kanal besitzt, wird dieser übernommen.' }
    ],
    privacyExplanationDe: 'Sichere Worker-Verarbeitung mit Sharp.',
    searchKeywordsDe: ['TIFF zu PNG', 'TIF in PNG konvertieren', 'TIFF umwandeln'],
    supportedFormats: 'TIFF zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['tiff-in-jpg-umwandeln', 'png-in-tiff-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'bmp-in-jpg-umwandeln',
    slug: 'bmp-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.bmp'],
    targetFormats: ['.jpg'],
    nameDe: 'BMP in JPG umwandeln',
    shortDescriptionDe: 'Konvertieren Sie unkomprimierte Windows-Bitmap-Dateien (BMP) in kompakte JPG-Fotos.',
    titleDe: 'BMP in JPG umwandeln – Windows Bitmaps kostenlos in JPG | CoolWave',
    metaDescriptionDe: 'BMP online in JPG umwandeln. Bis zu 90% Dateigröße sparen bei unkomprimierten Bitmaps.',
    h1De: 'BMP in JPG umwandeln – Windows Bitmaps drastisch verkleinern',
    introDe: 'Windows Bitmap (.bmp) speichert jeden Pixel unkomprimiert ab, was zu extrem großen Dateien führt. Konvertieren Sie BMPs in schlanke, internetfähige JPGs.',
    howItWorksDe: [
      { step: 1, title: 'BMP wählen', text: 'Ziehen Sie Ihre BMP-Datei in den Upload.' },
      { step: 2, title: 'In JPG umwandeln', text: 'Starten Sie die Kompression.' },
      { step: 3, title: 'JPG herunterladen', text: 'Laden Sie das kompakte JPG-Foto herunter.' }
    ],
    faqDe: [
      { question: 'Wieviel Speicherplatz spare ich?', answer: 'Typischerweise wird die Dateigröße um 80% bis 95% reduziert.' }
    ],
    troubleshootingDe: [
      { issue: 'Farben wirken verändert.', solution: 'BMP unterstützt 24-Bit RGB, das exakt in JPG übertragen wird.' }
    ],
    privacyExplanationDe: '100% In-Browser Konvertierung via Canvas.',
    searchKeywordsDe: ['BMP zu JPG', 'Bitmap in JPG umwandeln', 'BMP verkleinern'],
    supportedFormats: 'BMP zu JPG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bmp-in-png-umwandeln', 'jpg-in-bmp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'bmp-in-png-umwandeln',
    slug: 'bmp-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.bmp'],
    targetFormats: ['.png'],
    nameDe: 'BMP in PNG umwandeln',
    shortDescriptionDe: 'Wandeln Sie unkomprimierte Bitmaps in verlustfrei komprimiertes PNG ohne jeden Qualitätsverlust um.',
    titleDe: 'BMP in PNG umwandeln – Bitmaps verlustfrei in PNG konvertieren | CoolWave',
    metaDescriptionDe: 'BMP online in PNG umwandeln. 100% verlustfreie Kompression für Windows-Bitmaps direkt im Browser.',
    h1De: 'BMP in PNG umwandeln – verlustfreie Kompression für Bitmaps',
    introDe: 'Sparen Sie wertvollen Speicherplatz, ohne ein einziges Pixel an Bildqualität zu opfern. Die verlustfreie PNG-Kompression reduziert BMP-Dateien um bis zu 70%.',
    howItWorksDe: [
      { step: 1, title: 'BMP hochladen', text: 'Wählen Sie die BMP-Datei aus.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf Konvertieren.' },
      { step: 3, title: 'PNG speichern', text: 'Laden Sie das optimierte PNG herunter.' }
    ],
    faqDe: [
      { question: 'Geht Bildqualität verloren?', answer: 'Nein! PNG ist ein mathematisch verlustfreies Format. Jeder Pixel bleibt exakt identisch.' }
    ],
    troubleshootingDe: [
      { issue: 'Alte 16-Farben BMPs.', solution: 'CoolWave konvertiert alle Bitmap-Farbtiefen zuverlässig in modernes 32-Bit RGBA PNG.' }
    ],
    privacyExplanationDe: '100% lokale Browser-Ausführung.',
    searchKeywordsDe: ['BMP zu PNG', 'Bitmap in PNG umwandeln', 'BMP verlustfrei komprimieren'],
    supportedFormats: 'BMP zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bmp-in-jpg-umwandeln', 'png-in-bmp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'ico-in-png-umwandeln',
    slug: 'ico-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.ico'],
    targetFormats: ['.png'],
    nameDe: 'ICO in PNG umwandeln',
    shortDescriptionDe: 'Extrahieren Sie Favicons und Windows-Icons (.ico) in hochauflösende PNG-Bilder mit Transparenz.',
    titleDe: 'ICO in PNG umwandeln – Windows Icons & Favicons in PNG | CoolWave',
    metaDescriptionDe: 'ICO kostenlos online in PNG umwandeln. Extrahieren Sie Icons und Favicons mit voller Transparenz.',
    h1De: 'ICO in PNG umwandeln – Favicons und Icons in PNG extrahieren',
    introDe: 'Extrahieren Sie aus Windows-Symboldateien (.ico) oder Website-Favicons gestochen scharfe PNG-Grafiken. Transparenzen und alle Farbinformationen bleiben erhalten.',
    howItWorksDe: [
      { step: 1, title: 'ICO-Datei wählen', text: 'Laden Sie Ihre .ico-Datei hoch.' },
      { step: 2, title: 'In PNG umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'PNG downloaden', text: 'Laden Sie das extrahierte PNG-Icon herunter.' }
    ],
    faqDe: [
      { question: 'Welche Icon-Größe wird extrahiert?', answer: 'Es wird automatisch die höchstauflösende Version (z. B. 256 × 256 Pixel) aus der ICO-Datei extrahiert.' }
    ],
    troubleshootingDe: [
      { issue: 'Icon wirkt klein.', solution: 'Manche alte ICO-Dateien enthalten nur 16x16 oder 32x32 Pixel.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung direkt im Browser oder über Worker.',
    searchKeywordsDe: ['ICO zu PNG', 'Favicon in PNG umwandeln', 'Windows Icon extrahieren'],
    supportedFormats: 'ICO zu PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['png-in-ico-umwandeln', 'jpg-in-ico-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-ico-umwandeln',
    slug: 'png-in-ico-umwandeln',
    category: 'images',
    sourceFormats: ['.png', '.jpg', '.jpeg'],
    targetFormats: ['.ico'],
    nameDe: 'PNG in ICO umwandeln (Favicon Generator)',
    shortDescriptionDe: 'Erstellen Sie aus Ihren Logos und PNG-Grafiken standardkonforme Windows-Icons und Website-Favicons.',
    titleDe: 'PNG in ICO umwandeln – Favicon online erstellen | CoolWave',
    metaDescriptionDe: 'PNG kostenlos online in ICO umwandeln. Erstellen Sie professionelle Favicons (favicon.ico) mit voller Transparenz.',
    h1De: 'PNG in ICO umwandeln – Favicon.ico und Windows-Icons erstellen',
    introDe: 'Erstellen Sie aus Ihren Grafiken und Logos offizielle Windows-Symboldateien (.ico) und Website-Favicons (`favicon.ico`). Unterstützt mehrere Standard-Größen und volle Alpha-Transparenz.',
    howItWorksDe: [
      { step: 1, title: 'PNG hochladen', text: 'Laden Sie Ihr quadratisches Logo hoch.' },
      { step: 2, title: 'In ICO umwandeln', text: 'Die Engine generiert standardkonforme Icon-Ebenen.' },
      { step: 3, title: 'Favicon.ico speichern', text: 'Binden Sie das fertige Icon in Ihre Website ein.' }
    ],
    faqDe: [
      { question: 'Welche Auflösung ist optimal?', answer: 'Ein quadratisches PNG von 512x512 Pixeln mit transparentem Hintergrund liefert das beste Ergebnis.' },
      { question: 'Funktioniert das Favicon in allen Browsern?', answer: 'Ja, .ico ist der älteste und am breitesten unterstützte Favicon-Standard für Webbrowser.' }
    ],
    troubleshootingDe: [
      { issue: 'Das Icon wird verzerrt.', solution: 'Nutzen Sie ein quadratisches Ausgangsbild (1:1 Seitenverhältnis).' }
    ],
    privacyExplanationDe: 'Sichere Generierung im isolierten Worker.',
    searchKeywordsDe: ['PNG zu ICO', 'Favicon Generator online', 'favicon.ico erstellen', 'Icon aus PNG machen'],
    supportedFormats: 'PNG / JPG zu ICO',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['ico-in-png-umwandeln', 'jpg-in-ico-umwandeln', 'svg-in-ico-umwandeln'],
    icon: 'Sparkles',
    status: 'active',
    features: ['Multi-Resolution Windows ICO Format', 'Volle Alpha-Transparenz', 'Optimiert für favicon.ico', 'Kompatibel mit allen Webbrowsern']
  },
  {
    id: 'jpg-in-bmp-umwandeln',
    slug: 'jpg-in-bmp-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.bmp'],
    nameDe: 'JPG in BMP umwandeln',
    shortDescriptionDe: 'Konvertieren Sie JPG-Bilder in das Standard-Bitmap-Format (BMP) für Spezialanwendungen und Industriegeräte.',
    titleDe: 'JPG in BMP umwandeln – Fotos in Windows Bitmap konvertieren | CoolWave',
    metaDescriptionDe: 'JPG online in BMP umwandeln. Standard Windows 24-Bit Bitmap für industrielle Bildverarbeitung und Altsysteme.',
    h1De: 'JPG in BMP umwandeln – Fotos in unkomprimierte Bitmaps konvertieren',
    introDe: 'Manche industrielle Maschinen, Steuerungssysteme oder ältere Windows-Programme erfordern strikt Bitmap-Dateien (.bmp). Konvertieren Sie JPGs in standardisiertes BMP.',
    howItWorksDe: [
      { step: 1, title: 'JPG laden', text: 'Wählen Sie das JPG-Foto aus.' },
      { step: 2, title: 'In BMP umwandeln', text: 'Starten Sie die Dekodierung.' },
      { step: 3, title: 'BMP speichern', text: 'Laden Sie die BMP-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Welches BMP-Format wird erzeugt?', answer: 'Standard Windows DIB (Device Independent Bitmap) mit 24-Bit Farbtiefe.' }
    ],
    troubleshootingDe: [
      { issue: 'Datei wird viel größer.', solution: 'BMP ist unkomprimiert. Dies ist das normale Verhalten dieses Formats.' }
    ],
    privacyExplanationDe: 'Sichere Worker-Verarbeitung mit automatischer Bereinigung.',
    searchKeywordsDe: ['JPG zu BMP', 'JPEG in Bitmap umwandeln', 'JPG zu Windows Bitmap'],
    supportedFormats: 'JPG zu BMP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['bmp-in-jpg-umwandeln', 'png-in-bmp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-bmp-umwandeln',
    slug: 'png-in-bmp-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.bmp'],
    nameDe: 'PNG in BMP umwandeln',
    shortDescriptionDe: 'Konvertieren Sie PNG-Dateien in standardkonforme Windows-Bitmaps (BMP).',
    titleDe: 'PNG in BMP umwandeln – PNG kostenlos in Windows Bitmap | CoolWave',
    metaDescriptionDe: 'PNG online in BMP umwandeln. Schnelle Konvertierung für Windows-Spezialanwendungen.',
    h1De: 'PNG in BMP umwandeln – PNG in Windows-Bitmaps transformieren',
    introDe: 'Konvertieren Sie PNG-Bilder in das klassische Windows-Bitmap-Format (.bmp). Transparenzen werden auf Wunsch mit weißer Hintergrundfarbe hinterlegt.',
    howItWorksDe: [
      { step: 1, title: 'PNG wählen', text: 'Laden Sie Ihre PNG-Datei hoch.' },
      { step: 2, title: 'In BMP umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'BMP downloaden', text: 'Speichern Sie das fertige BMP-Bild.' }
    ],
    faqDe: [
      { question: 'Bleibt Transparenz erhalten?', answer: 'Standard-BMPs unterstützen keine Transparenz; transparente Pixel werden weiß dargestellt.' }
    ],
    troubleshootingDe: [
      { issue: 'Schwarzer Hintergrund.', solution: 'Wählen Sie in den Optionen den weißen Hintergrund aus.' }
    ],
    privacyExplanationDe: 'Sichere Worker-Verarbeitung.',
    searchKeywordsDe: ['PNG zu BMP', 'PNG in Bitmap konvertieren'],
    supportedFormats: 'PNG zu BMP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['bmp-in-png-umwandeln', 'jpg-in-bmp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'jpg-in-tiff-umwandeln',
    slug: 'jpg-in-tiff-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.tiff'],
    nameDe: 'JPG in TIFF umwandeln',
    shortDescriptionDe: 'Wandeln Sie JPG-Bilder in hochwertige TIFF-Dateien für Druckvorstufe, OCR und Archivierung um.',
    titleDe: 'JPG in TIFF umwandeln – Fotos in Druck-TIFF konvertieren | CoolWave',
    metaDescriptionDe: 'JPG online in TIFF umwandeln. Hochauflösendes TIFF-Format für Druckereien, Verlage und Archive.',
    h1De: 'JPG in TIFF umwandeln – Fotos in hochauflösende Druck-TIFFs konvertieren',
    introDe: 'Druckereien und Verlage fordern für Printprodukte häufig TIFF-Dateien. Wandeln Sie JPG-Fotos in standardisierte TIFF-Container um.',
    howItWorksDe: [
      { step: 1, title: 'JPG hochladen', text: 'Wählen Sie das JPG-Foto aus.' },
      { step: 2, title: 'In TIFF umwandeln', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'TIFF speichern', text: 'Laden Sie die TIFF-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Verbessert TIFF die Qualität des JPGs?', answer: 'TIFF verhindert weitere Kompressionsverluste bei der weiteren Bearbeitung, kann jedoch zuvor verloren gegangene Details nicht herbeizaubern.' }
    ],
    troubleshootingDe: [
      { issue: 'Druckerei verlangt 300 DPI.', solution: 'CoolWave speichert das Bild mit vollständigen DPI-Metadaten.' }
    ],
    privacyExplanationDe: 'Sichere Server-Worker Verarbeitung mit Sharp.',
    searchKeywordsDe: ['JPG zu TIFF', 'JPEG in TIF umwandeln', 'Druck TIFF erstellen'],
    supportedFormats: 'JPG zu TIFF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['tiff-in-jpg-umwandeln', 'png-in-tiff-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'png-in-tiff-umwandeln',
    slug: 'png-in-tiff-umwandeln',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.tiff'],
    nameDe: 'PNG in TIFF umwandeln',
    shortDescriptionDe: 'Konvertieren Sie verlustfreie PNGs in druckfertige TIFF-Dateien mit vollem Farbumfang.',
    titleDe: 'PNG in TIFF umwandeln – Grafiken verlustfrei in TIFF konvertieren | CoolWave',
    metaDescriptionDe: 'PNG online in TIFF umwandeln. Ideal für Druckereien, Verlage und Archivierung ohne Qualitätsverlust.',
    h1De: 'PNG in TIFF umwandeln – verlustfreie Grafiken für den Druck vorbereiten',
    introDe: 'Wandeln Sie PNG-Grafiken und Illustrationen in das professionelle Druckformat TIFF (.tif) um. Volle Schärfe und Transparenzen bleiben erhalten.',
    howItWorksDe: [
      { step: 1, title: 'PNG wählen', text: 'Laden Sie Ihre PNG-Datei hoch.' },
      { step: 2, title: 'In TIFF umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'TIFF herunterladen', text: 'Speichern Sie das druckfertige TIFF.' }
    ],
    faqDe: [
      { question: 'Bleibt der transparente Hintergrund erhalten?', answer: 'Ja, TIFF unterstützt Alpha-Kanäle.' }
    ],
    troubleshootingDe: [
      { issue: 'Dateigröße steigt an.', solution: 'TIFF nutzt schonendere Kompressionsverfahren, um Druckschärfe zu sichern.' }
    ],
    privacyExplanationDe: 'Verarbeitung im isolierten Server-Worker.',
    searchKeywordsDe: ['PNG zu TIFF', 'PNG in TIF konvertieren', 'Druckgrafik TIFF'],
    supportedFormats: 'PNG zu TIFF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['tiff-in-png-umwandeln', 'jpg-in-tiff-umwandeln'],
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'jpg-in-ico-umwandeln',
    slug: 'jpg-in-ico-umwandeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg'],
    targetFormats: ['.ico'],
    nameDe: 'JPG in ICO umwandeln',
    shortDescriptionDe: 'Erstellen Sie aus beliebigen JPG-Fotos Windows-Icons und Website-Favicons.',
    titleDe: 'JPG in ICO umwandeln – Favicon online aus JPG erstellen | CoolWave',
    metaDescriptionDe: 'JPG online in ICO umwandeln. Erstellen Sie favicon.ico für Ihre Homepage direkt im Browser.',
    h1De: 'JPG in ICO umwandeln – Favicons und Symboldateien erstellen',
    introDe: 'Konvertieren Sie JPG-Bilder in das Windows-Icon-Format (.ico). Perfekt als Website-Favicon für Ihren Webserver.',
    howItWorksDe: [
      { step: 1, title: 'JPG laden', text: 'Wählen Sie das JPG-Bild aus.' },
      { step: 2, title: 'In ICO umwandeln', text: 'Klicken Sie auf Umwandeln.' },
      { step: 3, title: 'ICO speichern', text: 'Laden Sie Ihr Favicon herunter.' }
    ],
    faqDe: [
      { question: 'Unterstützt JPG transparente Icons?', answer: 'JPG hat keinen Alpha-Kanal. Nutzen Sie PNG, wenn Sie ein transparentes Favicon wünschen.' }
    ],
    troubleshootingDe: [
      { issue: 'Icon wirkt verzerrt.', solution: 'Achten Sie darauf, ein quadratisches Foto zu verwenden.' }
    ],
    privacyExplanationDe: 'Sichere Worker-Verarbeitung.',
    searchKeywordsDe: ['JPG zu ICO', 'JPG in Favicon', 'favicon.ico aus JPG'],
    supportedFormats: 'JPG zu ICO',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['png-in-ico-umwandeln', 'ico-in-png-umwandeln'],
    icon: 'Sparkles',
    status: 'active'
  },
  {
    id: 'svg-in-ico-umwandeln',
    slug: 'svg-in-ico-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.ico'],
    nameDe: 'SVG in ICO umwandeln',
    shortDescriptionDe: 'Erstellen Sie aus SVG-Vektorgrafiken gestochen scharfe Favicons mit transparentem Hintergrund.',
    titleDe: 'SVG in ICO umwandeln – gestochen scharfe Favicons aus SVG | CoolWave',
    metaDescriptionDe: 'SVG online in ICO umwandeln. Verwandeln Sie Vektor-Logos in perfekte favicon.ico-Dateien.',
    h1De: 'SVG in ICO umwandeln – perfekte Favicons aus Vektorgrafiken',
    introDe: 'Die sauberste Art, ein Favicon zu erstellen: Rastern Sie Ihre Vektorgrafik (.svg) direkt in das Multi-Resolution-Icon-Format (.ico) mit voller Transparenz.',
    howItWorksDe: [
      { step: 1, title: 'SVG hochladen', text: 'Ziehen Sie Ihre Vektordatei in den Upload.' },
      { step: 2, title: 'In ICO umwandeln', text: 'Starten Sie die Icon-Generierung.' },
      { step: 3, title: 'Favicon.ico laden', text: 'Speichern Sie das fertige Favicon.' }
    ],
    faqDe: [
      { question: 'Welche Auflösungen sind im ICO enthalten?', answer: 'Es werden die Webstandard-Größen bis 256x256 Pixel generiert.' }
    ],
    troubleshootingDe: [
      { issue: 'Details gehen verloren.', solution: 'Favicons sind klein (16x16 bis 32x32 Pixel). Verwenden Sie vereinfachte Vektor-Icons.' }
    ],
    privacyExplanationDe: 'Sichere Worker-Generierung.',
    searchKeywordsDe: ['SVG zu ICO', 'SVG in Favicon', 'Vektor Favicon erstellen'],
    supportedFormats: 'SVG zu ICO',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['png-in-ico-umwandeln', 'svg-in-png-umwandeln'],
    icon: 'Sparkles',
    status: 'active'
  },

  // ==========================================
  // OCR & TEXT-RECOGNITION
  // ==========================================
  {
    id: 'ocr-pdf',
    slug: 'ocr-pdf',
    category: 'ocr',
    sourceFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.pdf', '.docx', '.txt'],
    nameDe: 'OCR PDF Texterkennung',
    shortDescriptionDe: 'Extrahieren Sie Text aus gescannten PDFs und Bildern mit intelligenter Zeichenerkennung für 6 europäische Sprachen.',
    titleDe: 'OCR PDF – gescannte Dokumente & Bilder in Text umwandeln | CoolWave',
    metaDescriptionDe: 'Kostenlose Online-OCR für PDFs und Scans. Verwandeln Sie gescannte Seiten in durchsuchbare PDFs, Word-Dokumente oder Textdateien.',
    h1De: 'OCR PDF – Scans in durchsuchbare Dokumente verwandeln',
    introDe: 'Konvertieren Sie gescannte PDF-Dokumente, Quittungen, Verträge oder Buchseiten in durchsuchbaren und editierbaren Text. Der isolierte CoolWave OCR-Worker verarbeitet mehrseitige Scans mit Kontrastoptimierung und unterstützt Deutsch, Englisch, Französisch, Spanisch, Italienisch und Niederländisch.',
    howItWorksDe: [
      { step: 1, title: 'Dokument auswählen', text: 'Laden Sie Ihre gescannte PDF-Datei oder Bilddatei hoch.' },
      { step: 2, title: 'Sprache & Format wählen', text: 'Wählen Sie die Dokumentsprache und das Zielformat (PDF, Word oder Text).' },
      { step: 3, title: 'OCR starten & downloaden', text: 'Der OCR-Worker erkennt Zeichen zeilenweise und stellt Ihr fertiges Dokument bereit.' }
    ],
    faqDe: [
      { question: 'Werden mehrseitige gescannte PDFs unterstützt?', answer: 'Ja! Der OCR-Worker analysiert mehrseitige Scans Seite für Seite und fügt sie zu einem vollständigen Gesamtdokument zusammen.' },
      { question: 'Welche Sprachen werden unterstützt?', answer: 'Deutsch (inklusive aller Umlaute ä, ö, ü und ß), Englisch, Französisch, Spanisch, Italienisch und Niederländisch.' },
      { question: 'Kann ich das Ergebnis als Word-Dokument erhalten?', answer: 'Ja, Sie können zwischen durchsuchbarem PDF, Microsoft Word (.docx) und unformatiertem Text (.txt) wählen.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Schlechte Erkennungsgenauigkeit bei schiefen Scans.',
        solution: 'CoolWave führt eine automatische Kontrastspreizung durch. Bei sehr dunklen Fotos empfiehlt sich ein kontrastreicher neuer Scan mit guter Beleuchtung.'
      }
    ],
    privacyExplanationDe: 'Isolierte temporäre Verarbeitung im Worker mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['PDF OCR online', 'Gescannte PDF in Text', 'PDF Texterkennung kostenlos', 'OCR Deutsch'],
    supportedFormats: 'PDF, JPG, PNG zu PDF, DOCX, TXT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-durchsuchbar-machen', 'scan-zu-word', 'bild-zu-text'],
    icon: 'ScanText',
    status: 'active',
    badge: 'Beliebt',
    features: [
      'Multi-Page-Unterstützung für mehrseitige gescannte Dokumente',
      '6 europäische Sprachen (DE, EN, FR, ES, IT, NL)',
      'Export als durchsuchbares PDF, Word (.docx) oder Text (.txt)',
      'Automatische Schärfung und Rauschunterdrückung vor der Analyse'
    ]
  },
  {
    id: 'pdf-durchsuchbar-machen',
    slug: 'pdf-durchsuchbar-machen',
    category: 'ocr',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF durchsuchbar machen',
    shortDescriptionDe: 'Fügen Sie gescannten PDF-Seiten eine unsichtbare, markierbare Textebene hinzu, damit sie voll durchsuchbar werden.',
    titleDe: 'PDF durchsuchbar machen – unsichtbare Textebene hinzufügen | CoolWave',
    metaDescriptionDe: 'Gescannte PDFs kostenlos durchsuchbar machen. Fügen Sie eine durchsuchbare OCR-Textebene hinzu. Texte markieren, kopieren und mit Strg+F finden.',
    h1De: 'PDF durchsuchbar machen – Volltextsuche für gescannte PDFs',
    introDe: 'Können Sie in Ihren gescannten PDFs nicht mit Strg+F suchen oder Textstellen markieren? Mit CoolWave machen Sie Ihre Scans volltextfähig. Unsere OCR-Engine legt eine unsichtbare, exakt ausgerichtete Textebene über die Original-Scanbilder, sodass das visuelle Layout perfekt erhalten bleibt.',
    howItWorksDe: [
      { step: 1, title: 'Scan hochladen', text: 'Ziehen Sie die undurchsuchbare PDF-Datei in den Arbeitsbereich.' },
      { step: 2, title: 'Sprache festlegen', text: 'Wählen Sie die Hauptsprache des Dokuments (z. B. Deutsch mit Umlauten).' },
      { step: 3, title: 'Durchsuchbares PDF laden', text: 'Laden Sie das optimierte PDF herunter – jetzt volltextfähig mit Suchfunktion.' }
    ],
    faqDe: [
      { question: 'Bleibt das ursprüngliche Aussehen der Seiten erhalten?', answer: 'Ja, das visuelle Erscheinungsbild des Scans bleibt unverändert. Die erkannte Schrift wird als transparente Schicht direkt über die Bilddaten gelegt.' },
      { question: 'Funktioniert Strg+F in allen PDF-Betrachtern?', answer: 'Ja, standardkonforme Betrachter wie Adobe Acrobat Reader, Apple Vorschau, Chrome und Edge erkennen die Textebene sofort.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Die Suchfunktion findet bestimmte Sonderzeichen nicht.',
        solution: 'Stellen Sie sicher, dass die korrekte Ausgangssprache (z. B. Deutsch für ä, ö, ü, ß) ausgewählt wurde.'
      }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung auf isolierten Workern mit garantierter flüchtiger Löschung.',
    searchKeywordsDe: ['PDF durchsuchbar machen', 'Searchable PDF erstellen', 'Scan mit Volltextsuche', 'OCR Textebene PDF'],
    supportedFormats: 'Gescannte PDF zu durchsuchbarer PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['ocr-pdf', 'scan-zu-pdf', 'scan-zu-word'],
    icon: 'FileSearch',
    status: 'active',
    badge: 'Beliebt',
    features: [
      'Originalgetreue Optik mit unsichtbarer, suchbarer Textebene',
      'Sofort kompatibel mit Strg+F / Cmd+F in jedem PDF-Viewer',
      'Zuverlässige Erkennung von Umlauten und Ligaturen',
      'Perfekt für Archivierung und digitale Aktenführung'
    ]
  },
  {
    id: 'bild-zu-text',
    slug: 'bild-zu-text',
    category: 'ocr',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'],
    targetFormats: ['.txt', '.docx'],
    nameDe: 'Bild zu Text',
    shortDescriptionDe: 'Extrahieren Sie gedruckten oder fotografierten Text aus JPG, PNG und WebP-Bildern in editierbaren Text.',
    titleDe: 'Bild zu Text Konverter – Fotos & Grafiken online extrahieren | CoolWave',
    metaDescriptionDe: 'Bild in Text umwandeln kostenlos online. Extrahieren Sie Texte aus Fotos, Screenshots und Scans. Sofort kopieren oder als Datei speichern.',
    h1De: 'Bild zu Text – Fotos & Screenshots sofort extrahieren',
    introDe: 'Möchten Sie einen Text aus einem Screenshot, einem Foto von einem Schild oder einem abfotografierten Dokument nicht mühsam abtippen? Unser Bild-zu-Text Konverter analysiert Pixelstrukturen in Sekunden und liefert Ihnen sauberen Text zum Kopieren.',
    howItWorksDe: [
      { step: 1, title: 'Bild auswählen', text: 'Laden Sie ein Foto oder einen Screenshot hoch (JPG, PNG, WebP).' },
      { step: 2, title: 'OCR starten', text: 'Klicken Sie auf „Texterkennung jetzt starten“.' },
      { step: 3, title: 'Text kopieren', text: 'Kopieren Sie den Text mit einem Klick in Ihre Zwischenablage.' }
    ],
    faqDe: [
      { question: 'Funktionieren auch Screenshots von Websites?', answer: 'Ja, Screenshots weisen meist eine hervorragende Schärfe auf und werden mit nahezu 100% Genauigkeit erkannt.' },
      { question: 'Welche Bildformate werden akzeptiert?', answer: 'Alle gängigen Formate: JPG, JPEG, PNG, WebP, BMP und TIFF.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Texterkennung schlägt bei schrägen Handyfotos fehl.',
        solution: 'Schneiden Sie das Foto vorab so zu, dass der Text horizontal ausgerichtet ist und füllen Sie das Bild möglichst mit dem Textbereich aus.'
      }
    ],
    privacyExplanationDe: 'Bilder werden ausschließlich für den Erkennungsvorgang verarbeitet und niemals dauerhaft gespeichert.',
    searchKeywordsDe: ['Bild in Text', 'Foto zu Text', 'Screenshot Text kopieren', 'JPG in Text'],
    supportedFormats: 'JPG, PNG, WebP zu Text / Word',
    freeLimits: { maxFileSizeMB: 30, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['ocr-pdf', 'scan-zu-word'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'scan-zu-pdf',
    slug: 'scan-zu-pdf',
    category: 'ocr',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'Scan zu PDF',
    shortDescriptionDe: 'Verwandeln Sie Papierscans und Smartphone-Fotos in saubere, standardisierte und durchsuchbare PDF-Dokumente.',
    titleDe: 'Scan zu PDF – gescannte Dokumente in durchsuchbare PDFs umwandeln | CoolWave',
    metaDescriptionDe: 'Scans und Fotos kostenlos in professionelle PDFs umwandeln. Mit automatischer Bildoptimierung und integrierter OCR-Texterkennung.',
    h1De: 'Scan zu PDF – professionelle Dokumente mit Texterkennung',
    introDe: 'Verwandeln Sie lose Papierscans, Quittungen und mobile Kameraaufnahmen in einheitliche PDF-Dateien. CoolWave begradigt Kontraste, schärft Buchstaben und bettet auf Wunsch direkt eine durchsuchbare OCR-Textebene ein.',
    howItWorksDe: [
      { step: 1, title: 'Scan ablegen', text: 'Laden Sie Ihre Bilddatei oder den Scan hoch.' },
      { step: 2, title: 'Optimierung anwenden', text: 'Das Dokument wird automatisch kontrastoptimiert und per OCR verarbeitet.' },
      { step: 3, title: 'PDF speichern', text: 'Laden Sie das fertige PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Ist das resultierende PDF für Behörden geeignet?', answer: 'Ja, das Dokument erfüllt die standardisierten ISO-PDF-Vorgaben und eignet sich hervorragend zur Einreichung bei Behörden oder Finanzämtern.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Der Scan hat graue Ränder.',
        solution: 'Die integrierte Normalisierung filtert leichte Grauschleier automatisch heraus.'
      }
    ],
    privacyExplanationDe: 'DSGVO-konforme Dokumentenverarbeitung mit flüchtigem Arbeitsspeicher.',
    searchKeywordsDe: ['Scan in PDF umwandeln', 'Scan zu PDF', 'Foto in PDF umwandeln', 'Papierdokument digitalisieren'],
    supportedFormats: 'Bilder & Scans zu durchsuchbarem PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-durchsuchbar-machen', 'scan-zu-word', 'ocr-pdf'],
    icon: 'FileType',
    status: 'active'
  },
  {
    id: 'scan-zu-word',
    slug: 'scan-zu-word',
    category: 'ocr',
    sourceFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    targetFormats: ['.docx'],
    nameDe: 'Scan zu Word',
    shortDescriptionDe: 'Konvertieren Sie gescannte Papiere und PDFs direkt in bearbeitbare Microsoft Word-Dateien (.docx).',
    titleDe: 'Scan zu Word – gescannte Dokumente in Word umwandeln | CoolWave',
    metaDescriptionDe: 'Gescannte Dokumente und PDFs kostenlos in Word (.docx) umwandeln. Echte OCR-Texterkennung mit Absätzen und Formatierung.',
    h1De: 'Scan zu Word – gescannte Dokumente in Microsoft Word bearbeiten',
    introDe: 'Haben Sie ein gedrucktes Dokument oder einen Scan vorliegen und müssen diesen überarbeiten? Mit unserem Scan-zu-Word-Konverter wandeln Sie Bilddaten direkt in eine bearbeitbare .docx-Datei um. Die intelligente Texterkennung rekonstruiert Absätze, Überschriften und Fließtexte.',
    howItWorksDe: [
      { step: 1, title: 'Scan oder PDF wählen', text: 'Laden Sie den Scan oder das gescannte PDF hoch.' },
      { step: 2, title: 'Sprache wählen', text: 'Wählen Sie die Dokumentsprache für höchste Genauigkeit.' },
      { step: 3, title: 'Word-Dokument laden', text: 'Öffnen und bearbeiten Sie die Datei direkt in Microsoft Word.' }
    ],
    faqDe: [
      { question: 'Kann ich die erstellte Datei in Word frei bearbeiten?', answer: 'Ja, Sie erhalten ein echtes .docx-Dokument, in dem Sie Texte, Absätze und Schriftarten nach Belieben anpassen können.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Tabellenstrukturen werden als reiner Text dargestellt.',
        solution: 'Bei sehr komplexen Formularen empfehlen wir zusätzlich unser Tool „PDF in Excel umwandeln“.'
      }
    ],
    privacyExplanationDe: '100% vertrauliche Konvertierung. Ihre Dokumente werden nach Fertigstellung gelöscht.',
    searchKeywordsDe: ['Scan in Word umwandeln', 'Gescannte PDF zu Word', 'Scan zu DOCX', 'OCR zu Word'],
    supportedFormats: 'PDF, JPG, PNG zu Word (.docx)',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['ocr-pdf', 'pdf-in-word-umwandeln', 'bild-zu-text'],
    icon: 'FileText',
    status: 'active',
    badge: 'Beliebt',
    features: [
      'Direkte Konvertierung von Scans in echte Microsoft Word .docx Dateien',
      'Automatische Absatz- und Zeilenumbruchserkennung',
      'Unterstützung für mehrseitige gescannte Verträge',
      'Vollständig editierbar in Office 365, Word 2016+ und LibreOffice'
    ]
  },
  {
    id: 'pdf-ocr',
    slug: 'pdf-ocr',
    category: 'ocr',
    sourceFormats: ['.pdf', '.jpg', '.png'],
    targetFormats: ['.pdf', '.docx', '.txt'],
    nameDe: 'PDF OCR',
    shortDescriptionDe: 'Hochpräzise optische Zeichenerkennung für gescannte PDF-Dokumente und Rechnungen.',
    titleDe: 'PDF OCR online – Texterkennung für gescannte PDFs | CoolWave',
    metaDescriptionDe: 'PDF OCR online kostenlos nutzen. Gescannte PDFs und Rechnungen sekundenschnell in Text, Word oder durchsuchbare PDFs umwandeln.',
    h1De: 'PDF OCR – intelligente Texterkennung für Ihre Dokumente',
    introDe: 'Digitalisieren und archivieren Sie Ihre Belege, Rechnungen und Verträge mit modernster OCR-Technologie. CoolWave erkennt Schriftzeichen zuverlässig, filtert Scan-Rauschen heraus und liefert Ihnen durchsuchbare Ergebnisse in Sekunden.',
    howItWorksDe: [
      { step: 1, title: 'PDF laden', text: 'Ziehen Sie Ihre gescannte PDF-Datei in das Werkzeug.' },
      { step: 2, title: 'Sprache einstellen', text: 'Wählen Sie die Dokumentsprache.' },
      { step: 3, title: 'Ergebnis herunterladen', text: 'Laden Sie das durchsuchbare PDF oder die Textdatei herunter.' }
    ],
    faqDe: [
      { question: 'Gibt es eine Beschränkung der Dateigröße?', answer: 'In der kostenlosen Version können Sie Dokumente bis zu 50 MB und bis zu 20 Seiten verarbeiten.' }
    ],
    troubleshootingDe: [
      {
        issue: 'Sehr kleine Schrift wird ungenau erkannt.',
        solution: 'Scannen Sie Dokumente mit winziger Schriftgröße mit mindestens 400 DPI ein, um optimale Lesbarkeit zu gewährleisten.'
      }
    ],
    privacyExplanationDe: 'Flüchtige Verarbeitung auf gesicherten Server-Workern.',
    searchKeywordsDe: ['PDF OCR', 'PDF Texterkennung', 'Scan OCR online'],
    supportedFormats: 'PDF zu durchsuchbarem PDF, DOCX, TXT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 20 },
    processingEngine: 'ocr',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['ocr-pdf', 'pdf-durchsuchbar-machen', 'scan-zu-word'],
    icon: 'ScanText',
    status: 'active'
  },

  // ==========================================
  // TEXT & DEVELOPER UTILITIES (24 TOOLS)
  // ==========================================
  ...UTILITIES_TOOLS,

  // ==========================================
  // MEDIA & ARCHIVE UTILITIES (13 TOOLS)
  // ==========================================
  ...MEDIA_ARCHIVE_TOOLS,
  // ==========================================
  // IMAGE EDITING & OPTIMIZATION
  // ==========================================
  {

    id: 'bildgroesse-aendern',
    slug: 'bildgroesse-aendern',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png', '.webp'],
    nameDe: 'Bildgröße ändern',
    shortDescriptionDe: 'Bildbreite und -höhe in Pixeln anpassen – mit Seitenverhältnis-Sperre und prozentualer Schnellskalierung.',
    titleDe: 'Bildgröße ändern – kostenlos online skalieren | CoolWave',
    metaDescriptionDe: 'Bildgröße online kostenlos ändern. Breite und Höhe in Pixeln festlegen oder prozentual skalieren. Seitenverhältnis automatisch beibehalten. 100% im Browser.',
    h1De: 'Bildgröße ändern – schnell und kostenlos',
    introDe: 'Passen Sie die Abmessungen von Fotos, Screenshots und Grafiken in Sekunden an. Geben Sie die gewünschte Breite oder Höhe in Pixeln ein – das Seitenverhältnis wird auf Wunsch automatisch berechnet. Alternativ skalieren Sie das Bild auf 25, 50 oder 75 Prozent der Originalgröße. Die Verarbeitung erfolgt vollständig in Ihrem Browser.',
    howItWorksDe: [
      { step: 1, title: 'Bild auswählen', text: 'Ziehen Sie ein JPG, PNG oder WebP in den Upload-Bereich.' },
      { step: 2, title: 'Maße festlegen', text: 'Geben Sie die gewünschte Breite/Höhe ein oder wählen Sie einen Prozentsatz.' },
      { step: 3, title: 'Herunterladen', text: 'Klicken Sie auf „Bildgröße anpassen" und laden Sie das skalierte Bild herunter.' }
    ],
    faqDe: [
      { question: 'Verliere ich Qualität beim Verkleinern?', answer: 'Beim Verkleinern gehen Pixel verloren, was unvermeidlich ist. Beim Vergrößern können leichte Unschärfen entstehen. CoolWave nutzt hochwertiges Downsampling.' },
      { question: 'Bleiben transparente Hintergründe erhalten?', answer: 'Ja, bei PNG-Ausgabe bleibt der Alphakanal vollständig erhalten.' }
    ],
    troubleshootingDe: [
      { issue: 'Das Bild wirkt gestreckt.', solution: 'Aktivieren Sie die Seitenverhältnis-Sperre. Wenn Sie nur Breite oder Höhe ändern, passt sich das jeweils andere Maß automatisch an.' }
    ],
    privacyExplanationDe: '100% clientseitige Verarbeitung. Kein Upload auf externe Server.',
    searchKeywordsDe: ['Bild skalieren', 'Bildaufloesung aendern', 'Foto verkleinern online', 'Bild Pixel aendern'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-resize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-komprimieren', 'bild-zuschneiden', 'bild-drehen', 'dpi-aendern'],
    icon: 'Maximize2',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'bild-komprimieren',
    slug: 'bild-komprimieren',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png', '.webp'],
    nameDe: 'Bild komprimieren',
    shortDescriptionDe: 'Dateigröße von Fotos und Grafiken erheblich reduzieren – mit einstellbarer Qualitätsstufe, direkt im Browser.',
    titleDe: 'Bild komprimieren – Dateigröße reduzieren ohne Qualitätsverlust | CoolWave',
    metaDescriptionDe: 'Bilder kostenlos online komprimieren. JPG, PNG und WebP ohne sichtbaren Qualitätsverlust verkleinern. Qualitätsstufe frei einstellbar. 100% datenschutzkonform.',
    h1De: 'Bild komprimieren – Dateigröße reduzieren',
    introDe: 'Mit CoolWave können Sie Fotos, Produktbilder und Grafiken auf einen Bruchteil ihrer ursprünglichen Dateigröße komprimieren. Die Qualitätsstufe ist von 10 bis 95 Prozent stufenlos einstellbar. Alle Verarbeitungsschritte finden lokal in Ihrem Browser statt.',
    howItWorksDe: [
      { step: 1, title: 'Bild hochladen', text: 'Wählen Sie ein JPG, PNG oder WebP-Bild aus.' },
      { step: 2, title: 'Qualität einstellen', text: 'Schieberegler auf den gewünschten Komprimierungsgrad stellen.' },
      { step: 3, title: 'Herunterladen', text: 'Komprimiertes Bild sofort speichern.' }
    ],
    faqDe: [
      { question: 'Um wie viel kann ich eine Datei verkleinern?', answer: 'Typisch sind 40–80% Einsparung bei Qualität 80%. Das Ergebnis hängt vom Bildinhalt ab.' },
      { question: 'Ändert sich das Format beim Komprimieren?', answer: 'Nein, JPG bleibt JPG und PNG bleibt PNG. Es wird nur der Komprimierungsgrad angepasst.' }
    ],
    troubleshootingDe: [
      { issue: 'Das komprimierte Bild ist größer als das Original.', solution: 'Das tritt auf, wenn das Original bereits stark komprimiert ist. Versuchen Sie eine niedrigere Qualitätsstufe.' }
    ],
    privacyExplanationDe: '100% clientseitige Komprimierung über Canvas-API.',
    searchKeywordsDe: ['Bild verkleinern', 'Foto komprimieren online', 'Bildgroesse reduzieren', 'JPG verkleinern kostenlos'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-compress',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bildgroesse-aendern', 'bild-zuschneiden', 'bildqualitaet-optimieren'],
    icon: 'Shrink',
    status: 'active',
    badge: 'Beliebt'
  },
  {
    id: 'bild-zuschneiden',
    slug: 'bild-zuschneiden',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild zuschneiden',
    shortDescriptionDe: 'Interaktiven Bildausschnitt per Drag-and-Drop festlegen – mit Seitenverhältnis-Presets und Drittel-Raster.',
    titleDe: 'Bild zuschneiden – kostenlos online & präzise | CoolWave',
    metaDescriptionDe: 'Bild online kostenlos zuschneiden. Ausschnitt per Maus ziehen, Seitenverhältnis wählen (1:1, 16:9, 4:3). Keine Registrierung erforderlich.',
    h1De: 'Bild zuschneiden – Ausschnitt frei wählen',
    introDe: 'Ziehen Sie Ihren gewünschten Bildausschnitt direkt in der Vorschau auf – präzise auf den Pixel. Wählen Sie vordefinierte Seitenverhältnisse wie 1:1 (quadratisch), 16:9 (Widescreen) oder 4:3 (klassisch). Das Drittel-Raster hilft bei der Bildkomposition.',
    howItWorksDe: [
      { step: 1, title: 'Bild laden', text: 'JPG, PNG, WebP, GIF oder BMP hochladen.' },
      { step: 2, title: 'Ausschnitt ziehen', text: 'Rahmen auf der Vorschau aufziehen. Seitenverhältnis-Preset wählen.' },
      { step: 3, title: 'Zuschneiden', text: 'Auf „Bild zuschneiden" klicken und das Ergebnis herunterladen.' }
    ],
    faqDe: [
      { question: 'Kann ich das Seitenverhältnis sperren?', answer: 'Ja, wählen Sie eines der Presets (1:1, 4:3 etc.) und der Rahmen wird automatisch proportional gezogen.' },
      { question: 'Werden transparente Hintergründe unterstützt?', answer: 'Ja, bei PNG-Quellen bleibt die Transparenz im zugeschnittenen Bereich erhalten.' }
    ],
    troubleshootingDe: [
      { issue: 'Der Ausschnitt ist verschwommen.', solution: 'Das Ausgangsbild hat eine niedrige Auflösung. Verwenden Sie ein höher aufgelöstes Bild für scharfe Ergebnisse.' }
    ],
    privacyExplanationDe: '100% lokal im Browser. Keine Daten verlassen Ihr Gerät.',
    searchKeywordsDe: ['Foto zuschneiden online', 'Bild Ausschnitt', 'Crop-Tool kostenlos'],
    supportedFormats: 'JPG, PNG, WebP, GIF, BMP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-crop',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-in-kreis-zuschneiden', 'bildgroesse-aendern', 'bild-drehen'],
    icon: 'Crop',
    status: 'active'
  },
  {
    id: 'bild-drehen',
    slug: 'bild-drehen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild drehen',
    shortDescriptionDe: 'Bilder in 90-Grad-Schritten drehen oder präzise auf 0, 90, 180 und 270 Grad setzen – mit Live-Vorschau.',
    titleDe: 'Bild drehen – kostenlos online in alle Richtungen | CoolWave',
    metaDescriptionDe: 'Bild online kostenlos drehen. 90°, 180° oder 270° links/rechts, mit Echtzeit-Vorschau. Funktioniert auf PC, Tablet und Smartphone.',
    h1De: 'Bild drehen – in Sekunden online',
    introDe: 'Drehen Sie ein falsch ausgerichtetes Foto oder eine Grafik mit einem Klick in die richtige Position. Wählen Sie zwischen Links- und Rechtsdrehung in 90-Grad-Schritten oder setzen Sie einen genauen Zielwinkel. Die Vorschau aktualisiert sich sofort.',
    howItWorksDe: [
      { step: 1, title: 'Bild hochladen', text: 'Beliebiges Bildformat auswählen oder per Drag-and-Drop einfügen.' },
      { step: 2, title: 'Winkel wählen', text: 'Per Schaltfläche links/rechts drehen oder exakten Winkel setzen.' },
      { step: 3, title: 'Speichern', text: 'Gedrehtes Bild herunterladen.' }
    ],
    faqDe: [
      { question: 'Kann ich auch um 180 Grad drehen?', answer: 'Ja, klicken Sie einfach zweimal auf „90° rechts" oder wählen Sie direkt 180°.' }
    ],
    troubleshootingDe: [
      { issue: 'Das Bild erscheint nach dem Drehen ausgeschnitten.', solution: 'Bei 90° und 270° werden Breite und Höhe getauscht. CoolWave berechnet die neue Leinwandgröße automatisch.' }
    ],
    privacyExplanationDe: '100% lokale Canvas-Verarbeitung.',
    searchKeywordsDe: ['Bild rotieren online', 'Foto drehen kostenlos', 'Bild seitwärts drehen'],
    supportedFormats: 'JPG, PNG, WebP, GIF, BMP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-rotate-flip',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-spiegeln', 'bild-zuschneiden', 'bildgroesse-aendern'],
    icon: 'RotateCw',
    status: 'active'
  },
  {
    id: 'bild-spiegeln',
    slug: 'bild-spiegeln',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild spiegeln',
    shortDescriptionDe: 'Bilder horizontal oder vertikal spiegeln – für perfekte Spiegeleffekte und Selfie-Korrekturen.',
    titleDe: 'Bild spiegeln – horizontal & vertikal kostenlos | CoolWave',
    metaDescriptionDe: 'Bild online kostenlos spiegeln. Horizontal (links-rechts) oder vertikal (oben-unten) spiegeln. Mit Drehung kombinierbar. Kein Upload nötig.',
    h1De: 'Bild spiegeln – kostenlos online',
    introDe: 'Spiegeln Sie ein Bild in Echtzeit horizontal (links-rechts) oder vertikal (oben-unten) – ideal für Selfie-Korrekturen, Logodesigns oder kreative Spiegeleffekte. Die Transformationen können auch mit einer Drehung kombiniert werden.',
    howItWorksDe: [
      { step: 1, title: 'Bild wählen', text: 'Bild hochladen oder per Drag-and-Drop einsetzen.' },
      { step: 2, title: 'Spiegeln', text: 'Horizontal, vertikal oder beides aktivieren.' },
      { step: 3, title: 'Download', text: 'Gespiegeltes Bild sofort herunterladen.' }
    ],
    faqDe: [
      { question: 'Kann ich gleichzeitig spiegeln und drehen?', answer: 'Ja! Das CoolWave-Tool erlaubt die Kombination von Drehung und Spiegelung in einem einzigen Schritt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% clientseitige Bildverarbeitung.',
    searchKeywordsDe: ['Foto spiegeln online', 'Bild horizontal spiegeln', 'Bild vertikal invertieren'],
    supportedFormats: 'JPG, PNG, WebP, GIF, BMP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-rotate-flip',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-drehen', 'bild-zuschneiden'],
    icon: 'FlipHorizontal',
    status: 'active'
  },
  {
    id: 'bild-schaerfen',
    slug: 'bild-schaerfen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild schärfen',
    shortDescriptionDe: 'Unscharfe Fotos durch konvolutionsbasierten Schärfe-Filter verbessern – mit einstellbarer Stärke.',
    titleDe: 'Bild schärfen – Fotos online schärfer machen | CoolWave',
    metaDescriptionDe: 'Unscharf gewordene Fotos online kostenlos schärfen. Kantenschärfe mit präzisem Schärfe-Filter verbessern. Ergebnis in Echtzeit sehen.',
    h1De: 'Bild schärfen – Fotos online verbessern',
    introDe: 'Unscharfe Fotos durch einen konvolutionsbasierten Unschärfemaske-Algorithmus nachschärfen. Die Schärfestärke ist von 1 bis 10 frei einstellbar. Eine Echtzeit-Vorschau zeigt das Ergebnis sofort.',
    howItWorksDe: [
      { step: 1, title: 'Unscharfes Bild laden', text: 'JPG, PNG oder WebP hochladen.' },
      { step: 2, title: 'Schärfe anpassen', text: 'Schieberegler auf die gewünschte Stärke ziehen.' },
      { step: 3, title: 'Herunterladen', text: 'Geschärftes Bild speichern.' }
    ],
    faqDe: [
      { question: 'Kann ich stark unscharfe Bilder vollständig reparieren?', answer: 'Schärfe-Filter können Kanten hervorheben, können aber Bewegungsunschärfe nicht vollständig eliminieren. Für beste Ergebnisse sollte das Original möglichst scharf sein.' }
    ],
    troubleshootingDe: [
      { issue: 'Bei hoher Schärfe erscheinen hässliche Artefakte.', solution: 'Reduzieren Sie die Schärfestufe. Schärfewerte über 7 können bei bereits komprimierten JPEGs zu Halos führen.' }
    ],
    privacyExplanationDe: '100% lokale Pixel-Filterverarbeitung.',
    searchKeywordsDe: ['Foto schaerfer machen', 'unscharfes Bild verbessern', 'Bild schaerfe erhoehen'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-effects',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-weichzeichnen', 'bild-komprimieren', 'bildqualitaet-optimieren'],
    icon: 'Focus',
    status: 'active'
  },
  {
    id: 'bild-weichzeichnen',
    slug: 'bild-weichzeichnen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild weichzeichnen',
    shortDescriptionDe: 'Gaussschen Weichzeichner auf Fotos anwenden – für Unschärfe-Effekte, Hintergrundunschärfe und Datenschutz.',
    titleDe: 'Bild weichzeichnen – Gauß-Blur online kostenlos | CoolWave',
    metaDescriptionDe: 'Bilder online kostenlos weichzeichnen. Gaussschen Blur-Radius einstellen. Ideal für Datenschutz, kreative Effekte und Hintergrundunschärfe.',
    h1De: 'Bild weichzeichnen – Gauß-Blur anwenden',
    introDe: 'Wenden Sie einen Gaussschen Weichzeichner auf Ihre Bilder an – für kreative Unschärfe-Effekte, Hintergrundverwischung oder zum Schützen sensibler Bereiche. Der Blur-Radius ist von 1 bis 30 Pixel einstellbar.',
    howItWorksDe: [
      { step: 1, title: 'Bild laden', text: 'JPG, PNG oder WebP hochladen.' },
      { step: 2, title: 'Radius wählen', text: 'Blur-Stärke mit dem Schieberegler einstellen.' },
      { step: 3, title: 'Download', text: 'Weichgezeichnetes Bild herunterladen.' }
    ],
    faqDe: [
      { question: 'Kann ich mit diesem Tool Gesichter unkenntlich machen?', answer: 'Sie können das gesamte Bild weichzeichnen. Für selektive Unschärfe einzelner Bereiche empfehlen wir das Zuschneiden in Kombination mit diesem Werkzeug.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% lokale Verarbeitung.',
    searchKeywordsDe: ['Bild blur', 'Foto unscharf machen', 'Gauss Weichzeichner online', 'Bild verpixeln'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-effects',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-schaerfen', 'bild-zuschneiden'],
    icon: 'Blend',
    status: 'active'
  },
  {
    id: 'bild-in-schwarzweiss',
    slug: 'bild-in-schwarzweiss',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild in Schwarzweiß umwandeln',
    shortDescriptionDe: 'Farbfotos in stimmungsvolle Schwarz-Weiß-Bilder umwandeln – mit Rec.709-Luminanz-Algorithmus für natürliche Graustufen.',
    titleDe: 'Bild in Schwarzweiß umwandeln – kostenlos online | CoolWave',
    metaDescriptionDe: 'Farbbilder kostenlos in Schwarz-Weiß umwandeln. Professionelle Graustufen-Konvertierung mit Luminanz-Algorithmus. JPG, PNG, WebP – kein Upload nötig.',
    h1De: 'Bild in Schwarzweiß umwandeln',
    introDe: 'Verleihen Sie Ihren Fotos einen zeitlosen Schwarz-Weiß-Look. CoolWave nutzt den Rec.709-Luminanz-Algorithmus (0.299R + 0.587G + 0.114B), der natürlichere Graustufen erzeugt als einfaches Averaging – besonders bei Hauttönen und Landschaften.',
    howItWorksDe: [
      { step: 1, title: 'Farbbild laden', text: 'JPG, PNG oder WebP hochladen.' },
      { step: 2, title: 'Vorschau prüfen', text: 'Die Live-Vorschau zeigt das Schwarzweiß-Ergebnis.' },
      { step: 3, title: 'Speichern', text: 'Schwarzweiß-Bild herunterladen.' }
    ],
    faqDe: [
      { question: 'Welcher Algorithmus wird verwendet?', answer: 'CoolWave nutzt die Rec.709-Luminanz-Formel, die an das menschliche Auge angepasst ist. Grün wird stärker gewichtet, da es die wahrgenommene Helligkeit am stärksten beeinflusst.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% lokale Canvas-Verarbeitung.',
    searchKeywordsDe: ['Foto schwarz-weiss', 'Bild entsaettigen', 'Graustufenbild online', 'SW Foto kostenlos'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-bw',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-schaerfen', 'bild-komprimieren'],
    icon: 'CircleHalf',
    status: 'active'
  },
  {
    id: 'bild-in-kreis-zuschneiden',
    slug: 'bild-in-kreis-zuschneiden',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.png'],
    nameDe: 'Bild in Kreis zuschneiden',
    shortDescriptionDe: 'Fotos auf einen perfekten Kreis zuschneiden – ideal für Profilbilder, Avatare und runde Icons.',
    titleDe: 'Bild in Kreis zuschneiden – Profilbild rund machen | CoolWave',
    metaDescriptionDe: 'Bild kostenlos in einen Kreis zuschneiden. Perfekte runde Profilbilder für LinkedIn, Instagram, WhatsApp und Co. Transparenter Hintergrund als PNG.',
    h1De: 'Bild in Kreis zuschneiden – runde Profilbilder',
    introDe: 'Erstellen Sie perfekte runde Profilbilder für LinkedIn, Instagram, GitHub und alle anderen Plattformen. CoolWave schneidet Ihr Bild auf einen exakten Kreis zu und gibt das Ergebnis als PNG mit transparentem Hintergrund aus.',
    howItWorksDe: [
      { step: 1, title: 'Foto laden', text: 'Beliebiges Foto oder Bild hochladen.' },
      { step: 2, title: 'Kreis positionieren', text: 'Der Kreis wird automatisch auf die kürzere Seite zentriert.' },
      { step: 3, title: 'Download', text: 'Rund zugeschnittenes PNG herunterladen.' }
    ],
    faqDe: [
      { question: 'Welches Format hat das Ergebnis?', answer: 'Immer PNG mit transparentem Hintergrund, damit der kreisförmige Ausschnitt auf jedem farbigen Hintergrund optimal wirkt.' },
      { question: 'Kann ich den Kreis verschieben?', answer: 'Ja, der Kreis kann auf der Vorschau gezogen werden, um den gewünschten Mittelpunkt zu setzen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% clientseitige Canvas-Verarbeitung mit clip()-Pfad.',
    searchKeywordsDe: ['Profilbild rund', 'Bild kreisfoermig zuschneiden', 'Avatar kreisfoermig', 'Foto rund schneiden'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-crop-circle',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-zuschneiden', 'favicon-erstellen', 'bildgroesse-aendern'],
    icon: 'Circle',
    status: 'active'
  },
  {
    id: 'dpi-aendern',
    slug: 'dpi-aendern',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'DPI ändern',
    shortDescriptionDe: 'DPI-Wert (Punkte pro Inch) von JPEG- und PNG-Dateien für Druck und Veröffentlichung anpassen.',
    titleDe: 'DPI ändern – Bildauflösung für Druck anpassen | CoolWave',
    metaDescriptionDe: 'DPI-Wert von Bildern kostenlos online ändern. 72 DPI für Web, 300 DPI für Profidruck. JPEG und PNG unterstützt. Metadaten direkt im Browser anpassen.',
    h1De: 'DPI ändern – Bildauflösung für Druck anpassen',
    introDe: 'Ändern Sie die Druckauflösung (DPI) Ihrer Bilder für unterschiedliche Ausgabemedien. 72 DPI für Web und Bildschirm, 150 DPI für Qualitätsdruck, 300 DPI für Profidruck und 600 DPI für Hochauflösungs-Druck. Die Pixelanzahl des Bildes bleibt unverändert – nur die Metadaten werden angepasst.',
    howItWorksDe: [
      { step: 1, title: 'Bild laden', text: 'JPG oder PNG hochladen.' },
      { step: 2, title: 'DPI wählen', text: 'Preset oder benutzerdefinierten DPI-Wert einstellen.' },
      { step: 3, title: 'Herunterladen', text: 'Bild mit neuem DPI-Wert speichern.' }
    ],
    faqDe: [
      { question: 'Ändert sich die Bildgröße beim DPI-Ändern?', answer: 'Nein. DPI ist ein Metadatenwert. Die Pixelanzahl und damit die Dateigröße bleiben identisch. Nur die Druckersteuerung interpretiert die Pixeldichte anders.' },
      { question: 'Welchen DPI-Wert brauche ich für Profidruck?', answer: '300 DPI ist der Industriestandard für Qualitätsdruck. Für Großformate reichen 150 DPI.' }
    ],
    troubleshootingDe: [
      { issue: 'Das Bild erscheint nach dem DPI-Ändern unverändert.', solution: 'DPI ändert nur Metadaten, nicht die Pixelanzahl. Das Bild sieht am Bildschirm identisch aus; der Unterschied zeigt sich erst beim Drucken.' }
    ],
    privacyExplanationDe: '100% lokale Metadaten-Manipulation. Keine Serverübertragung.',
    searchKeywordsDe: ['DPI aendern online', 'Bildaufloesung anpassen', '300 DPI fuer Druck', 'JPEG DPI setzen'],
    supportedFormats: 'JPG, PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-dpi',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-metadaten-entfernen', 'bildgroesse-aendern', 'bild-komprimieren'],
    icon: 'Printer',
    status: 'active'
  },
  {
    id: 'bild-metadaten-entfernen',
    slug: 'bild-metadaten-entfernen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild Metadaten entfernen',
    shortDescriptionDe: 'EXIF, IPTC, GPS-Daten und alle Metadaten aus JPEG und PNG löschen – für maximalen Datenschutz.',
    titleDe: 'Bild Metadaten entfernen – EXIF löschen kostenlos | CoolWave',
    metaDescriptionDe: 'EXIF-Daten aus Fotos kostenlos entfernen. GPS-Standort, Kameramodell und Aufnahmedatum aus JPEG und PNG löschen. 100% datenschutzkonform im Browser.',
    h1De: 'Bild Metadaten entfernen – EXIF & GPS löschen',
    introDe: 'Bevor Sie Fotos online teilen, sollten Sie die enthaltenen Metadaten entfernen. EXIF-Daten können Ihren GPS-Standort, das genaue Aufnahmedatum, Kameramodell und weitere persönliche Informationen preisgeben. CoolWave löscht alle Metadaten in Sekunden.',
    howItWorksDe: [
      { step: 1, title: 'Foto laden', text: 'JPEG oder PNG mit Metadaten hochladen.' },
      { step: 2, title: 'Prüfen', text: 'Überblick über enthaltene Metadatentypen.' },
      { step: 3, title: 'Bereinigen', text: 'Alle Metadaten entfernen und bereinigtes Bild speichern.' }
    ],
    faqDe: [
      { question: 'Welche Metadaten werden entfernt?', answer: 'EXIF (GPS, Kamera, Datum), IPTC (Urheberrecht, Titel), XMP (Adobe-Daten), eingebettete Thumbnails und Kommentare.' },
      { question: 'Bleibt die Bildqualität erhalten?', answer: 'Ja. Die Bilddaten bleiben vollständig unverändert. Nur die Metadaten-Blöcke werden entfernt.' }
    ],
    troubleshootingDe: [
      { issue: 'Manche Tools zeigen nach dem Bereinigen noch Metadaten.', solution: 'Einige Metadatenfelder sind tief in den Bildpixeln verankert (Steganographie). CoolWave bereinigt alle standardkonformen EXIF/IPTC/XMP-Blöcke.' }
    ],
    privacyExplanationDe: 'Canvas-Re-Encoding im Browser entfernt alle Metadaten-Anhänge.',
    searchKeywordsDe: ['EXIF entfernen', 'GPS aus Foto loeschen', 'Metadaten Bild entfernen', 'Foto anonym machen'],
    supportedFormats: 'JPG, PNG',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-metadata-strip',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['dpi-aendern', 'bild-komprimieren'],
    icon: 'ShieldOff',
    status: 'active',
    badge: 'DSGVO'
  },
  {
    id: 'bildqualitaet-optimieren',
    slug: 'bildqualitaet-optimieren',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bildqualität optimieren',
    shortDescriptionDe: 'Helligkeit, Kontrast und Bildqualität professionell anpassen – mit Echtzeit-Vorschau.',
    titleDe: 'Bildqualität optimieren – Helligkeit & Kontrast online | CoolWave',
    metaDescriptionDe: 'Bildqualität kostenlos verbessern. Helligkeit und Kontrast anpassen, Farben aufwerten. Echtzeit-Vorschau ohne Upload auf externe Server.',
    h1De: 'Bildqualität optimieren – Helligkeit & Kontrast anpassen',
    introDe: 'Optimieren Sie die Bildqualität Ihrer Fotos direkt im Browser. Passen Sie Helligkeit und Kontrast mit präzisen Schiebereglern an und sehen Sie das Ergebnis in Echtzeit in der Vorschau.',
    howItWorksDe: [
      { step: 1, title: 'Bild laden', text: 'JPG, PNG oder WebP hochladen.' },
      { step: 2, title: 'Regler anpassen', text: 'Helligkeit und Kontrast mit Schiebereglern einstellen.' },
      { step: 3, title: 'Speichern', text: 'Optimiertes Bild herunterladen.' }
    ],
    faqDe: [
      { question: 'Kann ich das Ergebnis rückgängig machen?', answer: 'Setzen Sie einfach beide Schieberegler auf 100%, um die Original-Einstellungen zu restaurieren. Die Quelle bleibt unverändert.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% lokale Canvas-Filter-Verarbeitung.',
    searchKeywordsDe: ['Bild Helligkeit erhoehen', 'Kontrast anpassen online', 'Foto Qualitaet verbessern'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 10 },
    processingEngine: 'image-effects',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-komprimieren', 'bild-schaerfen', 'bild-in-schwarzweiss'],
    icon: 'SunMedium',
    status: 'active'
  },
  {
    id: 'bild-skalieren',
    slug: 'bild-skalieren',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.jpg', '.png'],
    nameDe: 'Bild skalieren',
    shortDescriptionDe: 'Bilder prozentual oder auf exakte Pixelmaße skalieren – schnell und verlustfrei im Browser.',
    titleDe: 'Bild skalieren – prozentual oder in Pixel | CoolWave',
    metaDescriptionDe: 'Bild skalieren kostenlos online. Prozentual auf 25%, 50%, 75% verkleinern oder exakte Pixelmaße eingeben. Seitenverhältnis bleibt erhalten.',
    h1De: 'Bild skalieren – kostenlos und schnell',
    introDe: 'Skalieren Sie Bilder auf beliebige Prozent-Stufen oder geben Sie exakte Pixelabmessungen ein. Ideal für E-Mail-Anhänge, Web-Uploads und Social-Media-Anforderungen.',
    howItWorksDe: [
      { step: 1, title: 'Bild wählen', text: 'JPG, PNG oder WebP hochladen.' },
      { step: 2, title: 'Skalierung festlegen', text: 'Prozentwert oder Pixelabmessungen eingeben.' },
      { step: 3, title: 'Download', text: 'Skaliertes Bild herunterladen.' }
    ],
    faqDe: [
      { question: 'Was ist der Unterschied zwischen Skalieren und Bildgröße ändern?', answer: 'Funktional sind es identische Operationen. „Skalieren" betont das proportionale Anpassen, während „Bildgröße ändern" individuelle Breite/Höhe erlaubt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% lokale Verarbeitung.',
    searchKeywordsDe: ['Bild skalieren online', 'Foto verkleinern prozentual', 'Bild Prozent Skalierung'],
    supportedFormats: 'JPG, PNG, WebP',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 200, maxBatch: 20 },
    processingEngine: 'image-resize',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bildgroesse-aendern', 'bild-komprimieren'],
    icon: 'ZoomOut',
    status: 'active'
  },
  {
    id: 'favicon-erstellen',
    slug: 'favicon-erstellen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    targetFormats: ['.png', '.ico'],
    nameDe: 'Favicon erstellen',
    shortDescriptionDe: 'Favicon in allen Standardgrößen (16×16 bis 512×512) aus einem Logo oder Bild generieren – als PNG-Paket oder ICO-Datei.',
    titleDe: 'Favicon erstellen – alle Größen kostenlos generieren | CoolWave',
    metaDescriptionDe: 'Favicon kostenlos erstellen. Logo hochladen, Größen wählen (16x16 bis 512x512) und als ZIP-Paket oder ICO herunterladen. Für Browser, PWA und Apple.',
    h1De: 'Favicon erstellen – Browser, PWA & Apple Icons',
    introDe: 'Generieren Sie ein vollständiges Favicon-Paket für Ihre Website: Browser-Favicons (16×16, 32×32), Apple Touch Icon (180×180), PWA-Icons (192×192, 512×512) und weitere Größen. Inklusive fertigem HTML-Snippet und manifest.json.',
    howItWorksDe: [
      { step: 1, title: 'Logo hochladen', text: 'PNG, JPG, SVG oder WebP hochladen. Quadratische Logos eignen sich am besten.' },
      { step: 2, title: 'Größen wählen', text: 'Benötigte Favicon-Größen auswählen.' },
      { step: 3, title: 'Herunterladen', text: 'Alle Icons als ZIP inkl. HTML-Snippet herunterladen.' }
    ],
    faqDe: [
      { question: 'Welche Favicon-Größen benötige ich?', answer: '16×16 und 32×32 für Browser-Tabs, 180×180 für Apple-Geräte und 192×192 sowie 512×512 für Progressive Web Apps (PWA).' },
      { question: 'Was ist der Unterschied zwischen ICO und PNG-Favicons?', answer: 'ICO ist das klassische Browser-Format. PNG wird von allen modernen Browsern unterstützt und liefert bessere Qualität. CoolWave empfiehlt PNG für moderne Websites.' }
    ],
    troubleshootingDe: [
      { issue: 'Das Favicon erscheint auf Apple-Geräten nicht.', solution: 'Stellen Sie sicher, dass der 180×180 Apple Touch Icon generiert und als <link rel="apple-touch-icon"> im HTML verlinkt ist.' }
    ],
    privacyExplanationDe: '100% browserbasierte Canvas-Verarbeitung.',
    searchKeywordsDe: ['Favicon generator', 'Favicon erstellen online', 'Browser Icon erstellen', 'PWA Icon generator'],
    supportedFormats: 'JPG, PNG, WebP, SVG → PNG/ICO',
    freeLimits: { maxFileSizeMB: 10, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 50, maxBatch: 10 },
    processingEngine: 'favicon-create',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['bild-in-kreis-zuschneiden', 'bild-zuschneiden', 'bildgroesse-aendern'],
    icon: 'Star',
    status: 'active'
  },
  {
    id: 'ico-erstellen',
    slug: 'ico-erstellen',
    category: 'images',
    sourceFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    targetFormats: ['.ico'],
    nameDe: 'ICO erstellen',
    shortDescriptionDe: 'Windows ICO-Dateien aus PNG oder JPG erstellen – für Desktop-Anwendungen und klassische Browser-Favicons.',
    titleDe: 'ICO erstellen – Windows Icon aus PNG/JPG | CoolWave',
    metaDescriptionDe: 'ICO-Datei kostenlos erstellen. PNG oder JPG in Windows .ico Format konvertieren. Mehrere Größen in einer ICO-Datei bündeln.',
    h1De: 'ICO erstellen – Windows .ico Icon generieren',
    introDe: 'Erstellen Sie Windows-Icons im ICO-Format für Desktop-Anwendungen, Browser-Favicons und Systemicons. Wählen Sie die gewünschten Größen und erhalten Sie eine fertige .ico-Datei.',
    howItWorksDe: [
      { step: 1, title: 'Bild laden', text: 'PNG, JPG oder WebP hochladen.' },
      { step: 2, title: 'Größen wählen', text: 'ICO-Größen für die Ausgabe auswählen.' },
      { step: 3, title: 'ICO herunterladen', text: 'Fertige .ico-Datei speichern.' }
    ],
    faqDe: [
      { question: 'Was ist der Unterschied zwischen ICO und PNG?', answer: 'ICO ist ein Windows-natives Format, das mehrere Größen in einer Datei bündelt. Für Favicons werden heute beide Formate unterstützt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% lokale Verarbeitung im Browser.',
    searchKeywordsDe: ['ICO erstellen online', 'PNG zu ICO', 'Windows Icon kostenlos', 'favicon.ico erstellen'],
    supportedFormats: 'JPG, PNG, WebP → ICO',
    freeLimits: { maxFileSizeMB: 10, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 50, maxBatch: 10 },
    processingEngine: 'favicon-create',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['favicon-erstellen', 'bild-zuschneiden', 'bildgroesse-aendern'],
    icon: 'Monitor',
    status: 'active'
  }

  // ==========================================
  // DESIGN FILE CONVERSIONS
  // ==========================================
  ,{
    id: 'psd-in-png-umwandeln',
    slug: 'psd-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.psd'],
    targetFormats: ['.png'],
    nameDe: 'PSD in PNG umwandeln',
    shortDescriptionDe: 'Photoshop PSD-Dateien in PNG konvertieren – liest das zusammengesetzte Vorschau-Bild der PSD-Datei.',
    titleDe: 'PSD in PNG umwandeln – Photoshop-Datei online konvertieren | CoolWave',
    metaDescriptionDe: 'PSD in PNG umwandeln kostenlos online. Photoshop PSD-Dateien als PNG exportieren. Keine Photoshop-Installation noetig.',
    h1De: 'PSD in PNG umwandeln – Photoshop-Datei exportieren',
    introDe: 'Konvertieren Sie Adobe Photoshop PSD-Dateien in das universelle PNG-Format ohne Photoshop-Installation. CoolWave liest das zusammengesetzte Vorschau-Bild der PSD-Datei. Einzelne Ebenen oder Smartobjekte werden nicht separat exportiert.',
    howItWorksDe: [{step:1,title:'PSD hochladen',text:'Laden Sie Ihre .psd-Datei hoch.'},{step:2,title:'Konvertieren',text:'CoolWave liest das zusammengesetzte Bild.'},{step:3,title:'PNG herunterladen',text:'Die fertige PNG-Datei herunterladen.'}],
    faqDe: [{question:'Werden Ebenen exportiert?',answer:'Nein. CoolWave exportiert das flach zusammengesetzte Bild.'},{question:'Geht die Transparenz verloren?',answer:'Nein. PNG unterstuetzt Transparenz (Alphakanal).'}],
    troubleshootingDe: [{issue:'PSD-Datei kann nicht geoeffnet werden.',solution:'Stellen Sie sicher, dass die PSD-Datei nicht beschaedigt und kleiner als 50 MB ist.'}],
    privacyExplanationDe: 'Dateien werden serverseitig verarbeitet und automatisch geloescht.',
    searchKeywordsDe: ['PSD zu PNG','Photoshop in PNG','PSD exportieren'],
    supportedFormats: 'PSD zu PNG',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['psd-in-jpg-umwandeln','psd-in-webp-umwandeln','png-in-psd','svg-in-png-umwandeln'],
    icon: 'Image',
    status: 'active'
  },{
    id: 'psd-in-jpg-umwandeln',
    slug: 'psd-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.psd'],
    targetFormats: ['.jpg'],
    nameDe: 'PSD in JPG umwandeln',
    shortDescriptionDe: 'Photoshop PSD-Dateien ohne Photoshop in JPG konvertieren.',
    titleDe: 'PSD in JPG umwandeln – Photoshop PSD exportieren | CoolWave',
    metaDescriptionDe: 'PSD-Datei kostenlos in JPG umwandeln. Photoshop-Dokument als JPEG exportieren ohne Software-Installation.',
    h1De: 'PSD in JPG umwandeln',
    introDe: 'Exportieren Sie das zusammengesetzte Bild einer Photoshop PSD-Datei als JPEG. Transparente Bereiche werden automatisch auf weissem Hintergrund ausgefuellt.',
    howItWorksDe: [{step:1,title:'PSD auswaehlen',text:'PSD-Datei hochladen.'},{step:2,title:'Konvertieren',text:'Das Vorschau-Bild wird als JPG kodiert.'},{step:3,title:'Herunterladen',text:'JPG-Datei herunterladen.'}],
    faqDe: [{question:'Warum kein transparenter Hintergrund?',answer:'JPEG unterstuetzt keine Transparenz. Transparente Bereiche werden automatisch weiss hinterlegt.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Dateien werden serverseitig verarbeitet und automatisch geloescht.',
    searchKeywordsDe: ['PSD zu JPG','PSD in JPEG'],
    supportedFormats: 'PSD zu JPG',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['psd-in-png-umwandeln','psd-in-webp-umwandeln'],
    icon: 'Image',
    status: 'active'
  },{
    id: 'psd-in-webp-umwandeln',
    slug: 'psd-in-webp-umwandeln',
    category: 'images',
    sourceFormats: ['.psd'],
    targetFormats: ['.webp'],
    nameDe: 'PSD in WebP umwandeln',
    shortDescriptionDe: 'Photoshop PSD-Dateien in das moderne WebP-Format konvertieren.',
    titleDe: 'PSD in WebP umwandeln – Photoshop fuer Web optimieren | CoolWave',
    metaDescriptionDe: 'PSD in WebP konvertieren kostenlos. Photoshop-Dateien als WebP exportieren fuer moderne Websites.',
    h1De: 'PSD in WebP umwandeln',
    introDe: 'Konvertieren Sie Photoshop PSD-Dateien in das moderne WebP-Format. WebP bietet bis zu 30% kleinere Dateien als PNG bei gleicher Qualitaet.',
    howItWorksDe: [{step:1,title:'PSD hochladen',text:'PSD-Datei auswaehlen.'},{step:2,title:'Konvertieren',text:'Flaches Bild wird als WebP kodiert.'},{step:3,title:'Herunterladen',text:'WebP-Datei speichern.'}],
    faqDe: [{question:'Unterstuetzt WebP Transparenz?',answer:'Ja! WebP unterstuetzt Transparenz bei kleinerer Dateigröße als PNG.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Serverseitige Verarbeitung. Automatische Loeschung nach Download.',
    searchKeywordsDe: ['PSD zu WebP','Photoshop WebP Export'],
    supportedFormats: 'PSD zu WebP',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['psd-in-png-umwandeln','psd-in-jpg-umwandeln'],
    icon: 'Image',
    status: 'active'
  },{
    id: 'png-in-psd',
    slug: 'png-in-psd',
    category: 'images',
    sourceFormats: ['.png'],
    targetFormats: ['.psd'],
    nameDe: 'PNG in PSD umwandeln',
    shortDescriptionDe: 'PNG-Bild als PSD-Datei exportieren – erzeugt eine flache PSD ohne editierbare Photoshop-Ebenen.',
    titleDe: 'PNG in PSD umwandeln – Bild als Photoshop-Datei speichern | CoolWave',
    metaDescriptionDe: 'PNG kostenlos in PSD umwandeln. Erzeugt eine PSD-Datei mit dem Bild als flache Ebene. Keine editierbaren Photoshop-Ebenen.',
    h1De: 'PNG in PSD umwandeln – flache PSD erstellen',
    introDe: 'Exportieren Sie ein PNG-Bild als Adobe Photoshop PSD-Datei. Wichtiger Hinweis: Die erzeugte PSD enthaelt das Bild als einzelne flache Ebene (Flat PSD). Es werden KEINE editierbaren Photoshop-Ebenen oder Masken erstellt.',
    howItWorksDe: [{step:1,title:'PNG hochladen',text:'PNG-Datei auswaehlen.'},{step:2,title:'PSD erstellen',text:'Bild wird in eine flache PSD-Datei geschrieben.'},{step:3,title:'PSD herunterladen',text:'PSD-Datei in Photoshop oeffnen.'}],
    faqDe: [{question:'Kann ich die PSD in Photoshop bearbeiten?',answer:'Ja! Die PSD-Datei kann in Photoshop geoeffnet werden. Da sie nur eine flache Ebene enthaelt, koennen Sie in Photoshop neue Ebenen hinzufuegen.'},{question:'Werden separate Ebenen erstellt?',answer:'Nein. CoolWave erstellt eine einzige zusammengefasste Ebene.'}],
    troubleshootingDe: [{issue:'PSD oeffnet sich nicht in Photoshop.',solution:'Stellen Sie sicher, dass Sie eine aktuelle Version von Photoshop oder GIMP verwenden.'}],
    privacyExplanationDe: 'Serverseitige Verarbeitung mit automatischer Loeschung.',
    searchKeywordsDe: ['PNG zu PSD','PNG Photoshop Export'],
    supportedFormats: 'PNG zu PSD (flach)',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['jpg-in-psd','psd-in-png-umwandeln'],
    icon: 'Layers',
    status: 'active'
  },{
    id: 'jpg-in-psd',
    slug: 'jpg-in-psd',
    category: 'images',
    sourceFormats: ['.jpg','.jpeg'],
    targetFormats: ['.psd'],
    nameDe: 'JPG in PSD umwandeln',
    shortDescriptionDe: 'JPEG-Foto als PSD-Datei exportieren – flache PSD fuer Photoshop, ohne Ebenentrennung.',
    titleDe: 'JPG in PSD umwandeln – JPEG als Photoshop-Datei speichern | CoolWave',
    metaDescriptionDe: 'JPG kostenlos in PSD umwandeln. JPEG-Foto als Adobe Photoshop PSD exportieren. Flache PSD ohne Layer-Stack.',
    h1De: 'JPG in PSD umwandeln',
    introDe: 'Konvertieren Sie ein JPEG-Foto in eine Adobe Photoshop PSD-Datei. Die Datei kann in Photoshop geoeffnet werden. Hinweis: Die erzeugte PSD enthaelt das Bild als einzelne flache Ebene.',
    howItWorksDe: [{step:1,title:'JPG hochladen',text:'JPEG-Foto auswaehlen.'},{step:2,title:'PSD erzeugen',text:'Bild wird als flache PSD-Datei exportiert.'},{step:3,title:'PSD herunterladen',text:'PSD in Photoshop oeffnen.'}],
    faqDe: [{question:'Kann ich JPG auch direkt in Photoshop oeffnen?',answer:'Ja. Der PSD-Export ist sinnvoll fuer Workflows, die PSD erfordern.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Automatische Loeschung nach der Verarbeitung.',
    searchKeywordsDe: ['JPG zu PSD','JPEG Photoshop Export'],
    supportedFormats: 'JPG/JPEG zu PSD (flach)',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['png-in-psd','psd-in-jpg-umwandeln'],
    icon: 'Layers',
    status: 'active'
  },{
    id: 'svg-in-pdf-umwandeln',
    slug: 'svg-in-pdf-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.pdf'],
    nameDe: 'SVG in PDF umwandeln',
    shortDescriptionDe: 'SVG-Vektorgrafiken in PDF-Dateien umwandeln – fuer Druck und professionelle Weitergabe.',
    titleDe: 'SVG in PDF umwandeln – Vektorgrafik als PDF exportieren | CoolWave',
    metaDescriptionDe: 'SVG kostenlos in PDF umwandeln. SVG wird auf 150 DPI gerendert und in PDF eingebettet.',
    h1De: 'SVG in PDF umwandeln',
    introDe: 'Konvertieren Sie SVG-Vektorgrafiken in PDF-Dateien. Hinweis: Die SVG-Vektorpfade bleiben im PDF nicht als skalierbare Vektoren erhalten – der Prozess erfordert Rasterung.',
    howItWorksDe: [{step:1,title:'SVG hochladen',text:'SVG-Datei auswaehlen.'},{step:2,title:'Rendern',text:'SVG wird auf 150 DPI gerendert und in PDF eingebettet.'},{step:3,title:'PDF herunterladen',text:'Fertige PDF-Datei speichern.'}],
    faqDe: [{question:'Bleiben SVG-Vektoren im PDF erhalten?',answer:'Nein. CoolWave rastert die SVG-Grafik fuer die PDF-Ausgabe.'}],
    troubleshootingDe: [{issue:'SVG erscheint verzerrt.',solution:'Stellen Sie sicher, dass die SVG-Datei absolute Maesse hat.'}],
    privacyExplanationDe: 'Serverseitige Verarbeitung mit automatischer Loeschung.',
    searchKeywordsDe: ['SVG in PDF','Vektorgrafik als PDF','SVG PDF Export'],
    supportedFormats: 'SVG zu PDF',
    freeLimits: {maxFileSizeMB:20,maxBatch:1},
    proLimits: {maxFileSizeMB:100,maxBatch:10},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['svg-in-png-umwandeln','svg-in-jpg-umwandeln','pdf-zusammenfuegen'],
    icon: 'FileImage',
    status: 'active'
  },{
    id: 'pdf-in-svg-umwandeln',
    slug: 'pdf-in-svg-umwandeln',
    category: 'images',
    sourceFormats: ['.pdf'],
    targetFormats: ['.svg'],
    nameDe: 'PDF in SVG umwandeln',
    shortDescriptionDe: 'PDF-Seiten als SVG exportieren – Ergebnis enthaelt Rasterbild, keine extrahierten Vektordaten.',
    titleDe: 'PDF in SVG umwandeln – PDF als SVG exportieren | CoolWave',
    metaDescriptionDe: 'PDF in SVG umwandeln kostenlos. Erste PDF-Seite als SVG-Datei exportieren. Hinweis: Keine echten Vektordaten werden extrahiert.',
    h1De: 'PDF in SVG umwandeln',
    introDe: 'Exportieren Sie die erste Seite eines PDFs als SVG-Datei. Wichtiger Hinweis: Echte PDF-Vektordaten koennen nicht in editierbare SVG-Elemente extrahiert werden. Fuer echte Vektorextraktion ist Inkscape oder Adobe Acrobat Pro erforderlich.',
    howItWorksDe: [{step:1,title:'PDF hochladen',text:'PDF-Datei auswaehlen.'},{step:2,title:'SVG erstellen',text:'Erste PDF-Seite wird als SVG exportiert.'},{step:3,title:'SVG herunterladen',text:'SVG-Datei herunterladen.'}],
    faqDe: [{question:'Kann ich das SVG in Inkscape bearbeiten?',answer:'Begrenzt. Das SVG enthaelt keine editierbaren Vektorpfade aus dem PDF.'},{question:'Werden alle Seiten konvertiert?',answer:'Aktuell wird nur die erste PDF-Seite verarbeitet.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Automatische Dateiloeschung nach der Verarbeitung.',
    searchKeywordsDe: ['PDF zu SVG','PDF SVG Export'],
    supportedFormats: 'PDF (Seite 1) zu SVG',
    freeLimits: {maxFileSizeMB:50,maxBatch:1},
    proLimits: {maxFileSizeMB:200,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['pdf-in-png-umwandeln','svg-in-pdf-umwandeln'],
    icon: 'FileCode',
    status: 'active'
  },{
    id: 'eps-in-svg-umwandeln',
    slug: 'eps-in-svg-umwandeln',
    category: 'images',
    sourceFormats: ['.eps'],
    targetFormats: ['.svg'],
    nameDe: 'EPS in SVG umwandeln',
    shortDescriptionDe: 'EPS-Vektorgrafiken in SVG umwandeln – erfordert Ghostscript auf dem Server.',
    titleDe: 'EPS in SVG umwandeln – Encapsulated PostScript konvertieren | CoolWave',
    metaDescriptionDe: 'EPS in SVG umwandeln kostenlos. Encapsulated PostScript Dateien in SVG konvertieren. Serverbasiert ueber Ghostscript.',
    h1De: 'EPS in SVG umwandeln',
    introDe: 'Konvertieren Sie EPS-Dateien (Encapsulated PostScript) in SVG. Die Konvertierung erfolgt serverseitig ueber Ghostscript. Hinweis: Falls Ghostscript nicht verfuegbar ist, wird eine klare Fehlermeldung mit Alternativen angezeigt.',
    howItWorksDe: [{step:1,title:'EPS hochladen',text:'EPS-Datei hochladen.'},{step:2,title:'Konvertieren',text:'Ghostscript rendert die EPS-Datei.'},{step:3,title:'SVG herunterladen',text:'Konvertierte SVG-Datei speichern.'}],
    faqDe: [{question:'Was ist eine EPS-Datei?',answer:'EPS (Encapsulated PostScript) ist ein Vektordateiformat, haeufig fuer Logos verwendet.'},{question:'Was passiert wenn Ghostscript nicht verfuegbar ist?',answer:'CoolWave zeigt eine klare Fehlermeldung an.'}],
    troubleshootingDe: [{issue:'Fehler: EPS konnte nicht verarbeitet werden.',solution:'Konvertieren Sie die EPS-Datei mit Inkscape oder Illustrator in PDF oder PNG und laden Sie das dann hoch.'}],
    privacyExplanationDe: 'Dateien werden nach der Verarbeitung automatisch geloescht.',
    searchKeywordsDe: ['EPS zu SVG','EPS konvertieren online','PostScript SVG'],
    supportedFormats: 'EPS zu SVG',
    freeLimits: {maxFileSizeMB:20,maxBatch:1},
    proLimits: {maxFileSizeMB:100,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['eps-in-pdf-umwandeln','svg-in-png-umwandeln'],
    icon: 'PenTool',
    status: 'active'
  },{
    id: 'eps-in-pdf-umwandeln',
    slug: 'eps-in-pdf-umwandeln',
    category: 'images',
    sourceFormats: ['.eps'],
    targetFormats: ['.pdf'],
    nameDe: 'EPS in PDF umwandeln',
    shortDescriptionDe: 'EPS-Vektordateien in PDF umwandeln – serverbasiert fuer druckfertige PDF-Ausgabe.',
    titleDe: 'EPS in PDF umwandeln – Encapsulated PostScript als PDF | CoolWave',
    metaDescriptionDe: 'EPS kostenlos in PDF umwandeln. EPS-Dateien ueber Ghostscript in druckfertige PDF konvertieren.',
    h1De: 'EPS in PDF umwandeln – druckfertige PDF aus EPS',
    introDe: 'Wandeln Sie EPS-Vektordateien in universelle PDF-Dokumente um. Ideal fuer Druckereien und Designworkflows, die PDF als Austauschformat erfordern.',
    howItWorksDe: [{step:1,title:'EPS hochladen',text:'EPS-Datei hochladen.'},{step:2,title:'Zu PDF konvertieren',text:'Ghostscript erstellt die PDF-Ausgabe.'},{step:3,title:'PDF herunterladen',text:'PDF fuer Druck und Weitergabe speichern.'}],
    faqDe: [{question:'Welche EPS-Versionen werden unterstuetzt?',answer:'In der Regel werden EPS-Dateien der Versionen 1 bis 3.x unterstuetzt.'}],
    troubleshootingDe: [{issue:'EPS kann nicht konvertiert werden.',solution:'Oeffnen Sie die EPS-Datei in Inkscape und speichern Sie sie als PDF.'}],
    privacyExplanationDe: 'Automatische Loeschung nach der Verarbeitung.',
    searchKeywordsDe: ['EPS zu PDF','EPS PDF Export','PostScript in PDF'],
    supportedFormats: 'EPS zu PDF',
    freeLimits: {maxFileSizeMB:20,maxBatch:1},
    proLimits: {maxFileSizeMB:100,maxBatch:5},
    processingEngine: 'design-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['eps-in-svg-umwandeln','svg-in-pdf-umwandeln'],
    icon: 'Printer',
    status: 'active'
  },{
    id: 'ico-in-png-umwandeln',
    slug: 'ico-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.ico'],
    targetFormats: ['.png'],
    nameDe: 'ICO in PNG umwandeln',
    shortDescriptionDe: 'Windows ICO-Dateien in PNG-Bilder umwandeln – extrahiert die hoechste verfuegbare Aufloesung.',
    titleDe: 'ICO in PNG umwandeln – Windows Icon als PNG exportieren | CoolWave',
    metaDescriptionDe: 'ICO kostenlos in PNG umwandeln. Windows .ico Icons in PNG konvertieren. Hoechste Aufloesung wird automatisch extrahiert.',
    h1De: 'ICO in PNG umwandeln',
    introDe: 'Konvertieren Sie Windows ICO-Dateien in PNG-Bilder. CoolWave extrahiert automatisch die hoechste verfuegbare Aufloesung aus der ICO-Datei.',
    howItWorksDe: [{step:1,title:'ICO hochladen',text:'Windows .ico-Datei hochladen.'},{step:2,title:'Extrahieren',text:'Hoechste Aufloesung wird automatisch gewaehlt.'},{step:3,title:'PNG herunterladen',text:'PNG-Bild speichern.'}],
    faqDe: [{question:'Welche Aufloesung hat das exportierte PNG?',answer:'Die hoechste in der ICO-Datei enthaltene Aufloesung – meist 256x256 Pixel.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Serverseitige Verarbeitung.',
    searchKeywordsDe: ['ICO zu PNG','Icon in PNG','favicon in PNG'],
    supportedFormats: 'ICO zu PNG',
    freeLimits: {maxFileSizeMB:5,maxBatch:1},
    proLimits: {maxFileSizeMB:20,maxBatch:10},
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['favicon-erstellen','ico-erstellen'],
    icon: 'Monitor',
    status: 'active'
  },{
    id: 'svg-in-png-umwandeln',
    slug: 'svg-in-png-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.png'],
    nameDe: 'SVG in PNG umwandeln',
    shortDescriptionDe: 'SVG-Vektorgrafiken in hochaufloesende PNG-Bilder umwandeln.',
    titleDe: 'SVG in PNG umwandeln – Vektorgrafik als PNG exportieren | CoolWave',
    metaDescriptionDe: 'SVG kostenlos in PNG umwandeln. Vektorgrafiken als PNG exportieren. Transparenz wird erhalten.',
    h1De: 'SVG in PNG umwandeln',
    introDe: 'Konvertieren Sie SVG-Vektorgrafiken in PNG-Bilder. Die Transparenz des SVGs wird im PNG erhalten.',
    howItWorksDe: [{step:1,title:'SVG hochladen',text:'SVG-Datei hochladen.'},{step:2,title:'Rendern',text:'SVG wird mit 150 DPI als PNG gerendert.'},{step:3,title:'PNG herunterladen',text:'PNG mit Transparenz herunterladen.'}],
    faqDe: [{question:'Welche Aufloesung hat das PNG?',answer:'Das PNG wird mit 150 DPI gerendert.'},{question:'Bleibt die Transparenz erhalten?',answer:'Ja. Der transparente Hintergrund wird als PNG-Alphakanal beibehalten.'}],
    troubleshootingDe: [{issue:'SVG erscheint sehr klein.',solution:'Stellen Sie sicher, dass die SVG-Datei width/height-Attribute oder ein viewBox-Attribut enthaelt.'}],
    privacyExplanationDe: 'Serverseitige Verarbeitung via sharp/libvips.',
    searchKeywordsDe: ['SVG zu PNG','Vektorgrafik in PNG','SVG PNG Logo'],
    supportedFormats: 'SVG zu PNG',
    freeLimits: {maxFileSizeMB:20,maxBatch:1},
    proLimits: {maxFileSizeMB:100,maxBatch:10},
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['svg-in-jpg-umwandeln','svg-in-pdf-umwandeln','favicon-erstellen'],
    icon: 'FileImage',
    status: 'active'
  },{
    id: 'svg-in-jpg-umwandeln',
    slug: 'svg-in-jpg-umwandeln',
    category: 'images',
    sourceFormats: ['.svg'],
    targetFormats: ['.jpg'],
    nameDe: 'SVG in JPG umwandeln',
    shortDescriptionDe: 'SVG-Vektorgrafiken in JPEG-Bilder umwandeln – fuer Foto-Workflows und Social-Media.',
    titleDe: 'SVG in JPG umwandeln – Vektorgrafik als JPEG exportieren | CoolWave',
    metaDescriptionDe: 'SVG kostenlos in JPG umwandeln. SVG-Grafiken als JPEG exportieren. Transparenz wird weiss hinterlegt.',
    h1De: 'SVG in JPG umwandeln',
    introDe: 'Exportieren Sie SVG-Vektorgrafiken als JPEG-Bilder. Transparente Bereiche werden automatisch weiss hinterlegt.',
    howItWorksDe: [{step:1,title:'SVG hochladen',text:'SVG-Datei hochladen.'},{step:2,title:'Rendern',text:'SVG wird auf weissem Hintergrund als JPG gerendert.'},{step:3,title:'JPG herunterladen',text:'JPEG-Bild speichern.'}],
    faqDe: [{question:'Warum wird der Hintergrund weiss?',answer:'JPEG unterstuetzt keine Transparenz. Transparente Bereiche werden automatisch weiss eingefaerbt.'}],
    troubleshootingDe: [],
    privacyExplanationDe: 'Serverseitige Verarbeitung mit automatischer Loeschung.',
    searchKeywordsDe: ['SVG zu JPG','SVG JPEG Export'],
    supportedFormats: 'SVG zu JPG',
    freeLimits: {maxFileSizeMB:20,maxBatch:1},
    proLimits: {maxFileSizeMB:100,maxBatch:10},
    processingEngine: 'image-convert',
    browserCapable: false,
    serverRequired: true,
    relatedTools: ['svg-in-png-umwandeln','svg-in-pdf-umwandeln'],
    icon: 'FileImage',
    status: 'active'
  },
  {
    id: 'doc-in-docx-umwandeln',
    slug: 'doc-in-docx-umwandeln',
    category: 'documents',
    sourceFormats: ['.doc'],
    targetFormats: ['.docx'],
    nameDe: 'DOC in DOCX umwandeln',
    shortDescriptionDe: 'Alte Word 97-2003 Dokumente (.doc) in das moderne Microsoft Word DOCX-Format umwandeln.',
    titleDe: 'DOC in DOCX umwandeln – Altes Word in modernes DOCX konvertieren | CoolWave',
    metaDescriptionDe: 'Alte .doc Word-Dateien kostenlos und sicher in modernes .docx umwandeln. Volle Kompatibilität mit aktuellem Microsoft Word, LibreOffice und Google Docs.',
    h1De: 'DOC in DOCX umwandeln – Word-Dokumente modernisieren',
    introDe: 'Alte Word-Dateien im binären DOC-Format (Word 97-2003) lassen sich in modernen Programmen oder mobilen Apps oft nur eingeschränkt bearbeiten. CoolWave konvertiert Ihre DOC-Dateien blitzschnell und verlustfrei in das aktuelle OpenXML-Format DOCX.',
    howItWorksDe: [
      { step: 1, title: 'DOC-Datei hochladen', text: 'Ziehen Sie Ihre .doc-Datei in den Konverter oder wählen Sie sie aus.' },
      { step: 2, title: 'Konvertierung durchführen', text: 'Klicken Sie auf „DOC in DOCX umwandeln“ zur Konvertierung in das OpenXML-Format.' },
      { step: 3, title: 'DOCX herunterladen', text: 'Laden Sie das fertige Word-Dokument (.docx) direkt herunter.' }
    ],
    faqDe: [
      { question: 'Was ist der Vorteil von DOCX gegenüber DOC?', answer: 'DOCX basiert auf komprimiertem OpenXML, ist wesentlich platzsparender, sicherer gegen Dateibeschädigungen und mit allen aktuellen Office-Programmen kompatibel.' },
      { question: 'Werden Formatierungen beibehalten?', answer: 'Ja, Textinhalte, Absätze und grundlegende Layoutstrukturen werden sauber in das DOCX-Format übertragen.' }
    ],
    troubleshootingDe: [
      { issue: 'Die DOC-Datei wird als ungültig gemeldet.', solution: 'Stellen Sie sicher, dass es sich um eine echte Word-Datei handelt und nicht um eine beschädigte oder passwortgeschützte Datei.' }
    ],
    privacyExplanationDe: 'Sichere Übertragung und automatische Vernichtung temporärer Arbeitsdateien nach 15 Minuten.',
    searchKeywordsDe: ['DOC in DOCX', 'DOC zu DOCX umwandeln', 'Word 97-2003 zu DOCX', 'DOC konvertieren'],
    supportedFormats: 'DOC zu DOCX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['docx-in-doc-umwandeln', 'word-in-pdf-umwandeln', 'pdf-in-word-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'docx-in-doc-umwandeln',
    slug: 'docx-in-doc-umwandeln',
    category: 'documents',
    sourceFormats: ['.docx'],
    targetFormats: ['.doc'],
    nameDe: 'DOCX in DOC umwandeln',
    shortDescriptionDe: 'Moderne DOCX-Dateien in das klassische Word 97-2003 DOC-Format abwärtskompatibel umwandeln.',
    titleDe: 'DOCX in DOC umwandeln – Word-Dateien abwärtskompatibel speichern | CoolWave',
    metaDescriptionDe: 'DOCX-Dokumente kostenlos online in klassisches DOC (Word 97-2003) konvertieren. Maximale Kompatibilität für ältere Office-Systeme.',
    h1De: 'DOCX in DOC umwandeln – Für ältere Word-Versionen',
    introDe: 'Sie müssen ein Word-Dokument für ältere Computer, Behörden-Schnittstellen oder archivierte Software im klassischen .doc-Format bereitstellen? CoolWave exportiert moderne DOCX-Dateien in das abwärtskompatible Format.',
    howItWorksDe: [
      { step: 1, title: 'DOCX-Datei auswählen', text: 'Laden Sie Ihre .docx-Datei hoch.' },
      { step: 2, title: 'In DOC konvertieren', text: 'Starten Sie die Konvertierung mit einem Klick.' },
      { step: 3, title: 'DOC herunterladen', text: 'Speichern Sie das kompatible .doc-Dokument auf Ihrem Computer.' }
    ],
    faqDe: [
      { question: 'Kann Microsoft Word 2003 diese Datei öffnen?', answer: 'Ja, die Datei ist so strukturiert, dass sie in Word 97, 2000, XP und 2003 sowie in LibreOffice und modernem Word problemlos geöffnet werden kann.' },
      { question: 'Gehen moderne Word-Funktionen verloren?', answer: 'Spezielle Funktionen wie moderne SmartArt oder neue Diagrammtypen werden in kompatible Darstellungen umgewandelt.' }
    ],
    troubleshootingDe: [
      { issue: 'Die Datei öffnet sich im Kompatibilitätsmodus.', solution: 'Das ist bei .doc-Dateien normal und beabsichtigt, da es sich um das Format für ältere Versionen handelt.' }
    ],
    privacyExplanationDe: 'Sichere Verarbeitung mit automatischer Datenlöschung.',
    searchKeywordsDe: ['DOCX in DOC', 'DOCX zu DOC konvertieren', 'DOCX als altes Word speichern'],
    supportedFormats: 'DOCX zu DOC',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['doc-in-docx-umwandeln', 'word-in-pdf-umwandeln', 'pdf-in-word-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'odt-in-docx-umwandeln',
    slug: 'odt-in-docx-umwandeln',
    category: 'documents',
    sourceFormats: ['.odt'],
    targetFormats: ['.docx'],
    nameDe: 'ODT in DOCX umwandeln',
    shortDescriptionDe: 'OpenOffice- und LibreOffice-Writer-Dokumente (.odt) in Microsoft-Word-Dateien (.docx) umwandeln.',
    titleDe: 'ODT in DOCX umwandeln – OpenDocument in Word konvertieren | CoolWave',
    metaDescriptionDe: 'ODT kostenlos online in DOCX umwandeln. OpenDocument-Dateien aus LibreOffice und OpenOffice direkt in Microsoft-Word-Dokumente konvertieren.',
    h1De: 'ODT in DOCX umwandeln – OpenDocument zu Word',
    introDe: 'Haben Sie ein Textdokument aus LibreOffice oder OpenOffice erhalten und möchten es in Microsoft Word bearbeiten? Wandeln Sie ODT-Dokumente sauber und verlustfrei in das standardmäßige DOCX-Format um.',
    howItWorksDe: [
      { step: 1, title: 'ODT hochladen', text: 'Wählen Sie Ihre LibreOffice- oder OpenOffice-Textdatei aus.' },
      { step: 2, title: 'In DOCX überführen', text: 'Klicken Sie auf „ODT in DOCX umwandeln“.' },
      { step: 3, title: 'Word-Datei speichern', text: 'Laden Sie das fertige DOCX-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Bleiben Absätze und Überschriften erhalten?', answer: 'Ja, das Dokument wird analysiert und die semantischen Überschriften und Absätze werden nativ in Microsoft Word Formatvorlagen überführt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Streng vertrauliche Verarbeitung mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['ODT in DOCX', 'ODT zu Word', 'OpenOffice zu Word konvertieren', 'LibreOffice ODT DOCX'],
    supportedFormats: 'ODT zu DOCX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['docx-in-odt-umwandeln', 'odt-in-pdf-umwandeln', 'word-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'docx-in-odt-umwandeln',
    slug: 'docx-in-odt-umwandeln',
    category: 'documents',
    sourceFormats: ['.docx'],
    targetFormats: ['.odt'],
    nameDe: 'DOCX in ODT umwandeln',
    shortDescriptionDe: 'Microsoft-Word-Dokumente (.docx) in das freie OpenDocument-Format (.odt) konvertieren.',
    titleDe: 'DOCX in ODT umwandeln – Word in OpenDocument Writer konvertieren | CoolWave',
    metaDescriptionDe: 'DOCX-Dateien kostenlos in ODT umwandeln. Perfekt für OpenOffice- und LibreOffice-Writer-Nutzer. Sicher und ohne Software-Installation.',
    h1De: 'DOCX in ODT umwandeln – Für OpenOffice & LibreOffice',
    introDe: 'Konvertieren Sie Word-Dokumente (.docx) in das herstellerunabhängige OpenDocument-Format (.odt), um sie nahtlos in LibreOffice Writer, OpenOffice oder Behörden-Standards zu nutzen.',
    howItWorksDe: [
      { step: 1, title: 'DOCX auswählen', text: 'Laden Sie Ihre Word-Datei hoch.' },
      { step: 2, title: 'Konvertieren', text: 'Klicken Sie auf „In ODT umwandeln“.' },
      { step: 3, title: 'ODT herunterladen', text: 'Laden Sie die OpenDocument-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Ist ODT ein offizieller Standard?', answer: 'Ja, ODT (OpenDocument Text) ist ein international genormter ISO-Standard für bürobasierte Textdokumente.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Alle Dokumente werden nach 15 Minuten unwiderruflich gelöscht.',
    searchKeywordsDe: ['DOCX in ODT', 'Word zu ODT', 'Word in OpenOffice umwandeln'],
    supportedFormats: 'DOCX zu ODT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['odt-in-docx-umwandeln', 'word-in-pdf-umwandeln', 'odt-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'rtf-in-docx-umwandeln',
    slug: 'rtf-in-docx-umwandeln',
    category: 'documents',
    sourceFormats: ['.rtf'],
    targetFormats: ['.docx'],
    nameDe: 'RTF in DOCX umwandeln',
    shortDescriptionDe: 'Rich-Text-Format (.rtf) in modernes Microsoft-Word-Dokument (.docx) umwandeln.',
    titleDe: 'RTF in DOCX umwandeln – Rich Text in Word-Dokument konvertieren | CoolWave',
    metaDescriptionDe: 'RTF-Dateien kostenlos und schnell in DOCX umwandeln. Textformatierung und Absätze sauber in Microsoft Word übernehmen.',
    h1De: 'RTF in DOCX umwandeln – Rich Text formatieren',
    introDe: 'Rich-Text-Dateien (.rtf) werden von vielen Editoren wie WordPad oder macOS TextEdit genutzt. Konvertieren Sie RTF-Dateien mit CoolWave in vollwertige Microsoft-Word-DOCX-Dateien.',
    howItWorksDe: [
      { step: 1, title: 'RTF hochladen', text: 'Wählen Sie Ihre RTF-Datei aus.' },
      { step: 2, title: 'In DOCX konvertieren', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'DOCX sichern', text: 'Laden Sie die fertige Word-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Werden Fett- und Kursivdruck übernommen?', answer: 'Ja, Schriftstile, Hervorhebungen und Zeilenumbrüche werden zuverlässig in das Word-Dokument übertragen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere TLS-Übertragung und automatische Datenlöschung.',
    searchKeywordsDe: ['RTF in DOCX', 'Rich Text zu Word', 'RTF in Word umwandeln'],
    supportedFormats: 'RTF zu DOCX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['rtf-in-pdf-umwandeln', 'doc-in-docx-umwandeln', 'word-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'txt-in-docx-umwandeln',
    slug: 'txt-in-docx-umwandeln',
    category: 'documents',
    sourceFormats: ['.txt'],
    targetFormats: ['.docx'],
    nameDe: 'TXT in DOCX umwandeln',
    shortDescriptionDe: 'Reine Textdateien (.txt) in professionell formatierte Word-Dokumente (.docx) umwandeln.',
    titleDe: 'TXT in DOCX umwandeln – Textdatei in Word-Dokument umwandeln | CoolWave',
    metaDescriptionDe: 'TXT kostenlos in Word DOCX umwandeln. Automatische Erkennung von Überschriften und Absätzen für saubere Textdokumente.',
    h1De: 'TXT in DOCX umwandeln – Text in Word layouten',
    introDe: 'Wandeln Sie einfache Notizen, Quelltexte oder TXT-Dateien in saubere Microsoft-Word-Dokumente um. CoolWave erkennt automatisch Titel, Absätze und Strukturmerkmale.',
    howItWorksDe: [
      { step: 1, title: 'TXT hochladen', text: 'Laden Sie Ihre .txt-Datei hoch.' },
      { step: 2, title: 'Formatieren', text: 'Klicken Sie auf „TXT in Word umwandeln“.' },
      { step: 3, title: 'Word-Dokument herunterladen', text: 'Laden Sie Ihre fertige DOCX-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Werden Sonderzeichen und Umlaute unterstützt?', answer: 'Ja, CoolWave unterstützt UTF-8 codierte Textdateien inklusive aller deutschen Umlaute (ä, ö, ü, ß) und internationaler Zeichen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% datenschutzkonform mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['TXT in DOCX', 'Text in Word umwandeln', 'TXT zu Word Konverter'],
    supportedFormats: 'TXT zu DOCX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['txt-in-pdf-umwandeln', 'doc-in-docx-umwandeln', 'word-in-pdf-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'xls-in-xlsx-umwandeln',
    slug: 'xls-in-xlsx-umwandeln',
    category: 'documents',
    sourceFormats: ['.xls'],
    targetFormats: ['.xlsx'],
    nameDe: 'XLS in XLSX umwandeln',
    shortDescriptionDe: 'Klassische Excel 97-2003 Tabellen (.xls) in das moderne XLSX-Format umwandeln.',
    titleDe: 'XLS in XLSX umwandeln – Altes Excel in modernes XLSX konvertieren | CoolWave',
    metaDescriptionDe: 'XLS-Tabellen kostenlos und sicher in XLSX umwandeln. Tabellen, Formeln und Zahlen für modernes Excel, Google Sheets und Apple Numbers optimieren.',
    h1De: 'XLS in XLSX umwandeln – Excel-Tabellen modernisieren',
    introDe: 'Ältere Excel-Dateien mit der Endung .xls sind oft auf 65.536 Zeilen begrenzt und werden von modernen Cloud-Anwendungen nur eingeschränkt unterstützt. Konvertieren Sie XLS mit CoolWave in das moderne XLSX-Format.',
    howItWorksDe: [
      { step: 1, title: 'XLS-Tabelle hochladen', text: 'Wählen Sie Ihre .xls-Datei aus.' },
      { step: 2, title: 'In XLSX umwandeln', text: 'Klicken Sie auf „XLS in XLSX umwandeln“.' },
      { step: 3, title: 'XLSX herunterladen', text: 'Speichern Sie die fertige Excel-Arbeitsmappe.' }
    ],
    faqDe: [
      { question: 'Werden Zahlen und Formeln übernommen?', answer: 'Ja, alle Tabellenblätter, Zellwerte und Zahlenformate werden intakt in das neue XLSX-Format überführt.' },
      { question: 'Ist XLSX kleiner als XLS?', answer: 'Ja, da XLSX eine ZIP-komprimierte XML-Architektur nutzt, ist die Dateigröße meist deutlich geringer.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Verarbeitung Ihrer geschäftlichen Tabellendaten mit garantierter Löschung.',
    searchKeywordsDe: ['XLS in XLSX', 'Excel 2003 zu XLSX', 'XLS modernisieren', 'Altes Excel konvertieren'],
    supportedFormats: 'XLS zu XLSX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['xlsx-in-xls-umwandeln', 'excel-in-pdf-umwandeln', 'csv-in-xlsx-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'xlsx-in-xls-umwandeln',
    slug: 'xlsx-in-xls-umwandeln',
    category: 'documents',
    sourceFormats: ['.xlsx'],
    targetFormats: ['.xls'],
    nameDe: 'XLSX in XLS umwandeln',
    shortDescriptionDe: 'Moderne XLSX-Tabellen in das klassische Excel 97-2003 XLS-Format abwärtskompatibel speichern.',
    titleDe: 'XLSX in XLS umwandeln – Excel-Datei abwärtskompatibel speichern | CoolWave',
    metaDescriptionDe: 'XLSX-Dateien kostenlos online in XLS (Excel 97-2003) umwandeln. Für ältere Tabellenkalkulationen und Schnittstellen.',
    h1De: 'XLSX in XLS umwandeln – Für ältere Excel-Versionen',
    introDe: 'Exportieren Sie moderne Excel-Tabellen (.xlsx) in das klassische binäre BIFF8-Format (.xls), um sie auf älteren Rechnern oder Legacy-Schnittstellen ohne Fehler zu öffnen.',
    howItWorksDe: [
      { step: 1, title: 'XLSX auswählen', text: 'Laden Sie Ihre .xlsx-Arbeitsmappe hoch.' },
      { step: 2, title: 'Als XLS speichern', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'XLS sichern', text: 'Laden Sie die abwärtskompatible .xls-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Gibt es Begrenzungen im alten XLS-Format?', answer: 'Das klassische XLS-Format unterstützt bis zu 65.536 Zeilen und 256 Spalten pro Tabellenblatt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Datenverarbeitung mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['XLSX in XLS', 'XLSX zu altem Excel', 'XLSX abwärtskompatibel speichern'],
    supportedFormats: 'XLSX zu XLS',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['xls-in-xlsx-umwandeln', 'excel-in-pdf-umwandeln', 'xlsx-in-csv-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'csv-in-xlsx-umwandeln',
    slug: 'csv-in-xlsx-umwandeln',
    category: 'documents',
    sourceFormats: ['.csv'],
    targetFormats: ['.xlsx'],
    nameDe: 'CSV in XLSX umwandeln',
    shortDescriptionDe: 'CSV-Dateien (komma- oder semikolongetrennt) in formatierte Excel-Arbeitsmappen (.xlsx) umwandeln.',
    titleDe: 'CSV in XLSX umwandeln – CSV-Tabelle in echtes Excel konvertieren | CoolWave',
    metaDescriptionDe: 'CSV kostenlos in XLSX umwandeln. Automatische Trennzeichen-Erkennung, Spaltenformatierung und Kopfzeilen-Hervorhebung.',
    h1De: 'CSV in XLSX umwandeln – CSV in formatiertes Excel',
    introDe: 'Konvertieren Sie unformatierte CSV-Exportdateien aus Onlineshops, Banken oder CRM-Systemen in übersichtlich formatierte Excel-Arbeitsmappen mit optimierten Spaltenbreiten.',
    howItWorksDe: [
      { step: 1, title: 'CSV hochladen', text: 'Wählen Sie Ihre .csv-Datei aus.' },
      { step: 2, title: 'In Excel konvertieren', text: 'Klicken Sie auf „CSV in Excel umwandeln“.' },
      { step: 3, title: 'XLSX herunterladen', text: 'Speichern Sie die fertige Excel-Tabelle.' }
    ],
    faqDe: [
      { question: 'Erkennt das Tool Semikolon und Komma?', answer: 'Ja, CoolWave erkennt automatisch, ob Ihre CSV-Datei durch Semikolons (deutsche Standards) oder Kommas (internationale Standards) getrennt ist.' },
      { question: 'Werden Zahlen als Zahlen formatiert?', answer: 'Ja, numerische Werte werden automatisch als Zahlen erkannt, sodass Sie sofort mit Summen und Formeln rechnen können.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Geschützte Verarbeitung über temporäre Worker mit garantierter Datenlöschung.',
    searchKeywordsDe: ['CSV in XLSX', 'CSV in Excel umwandeln', 'CSV Tabelle zu Excel', 'CSV zu XLSX Konverter'],
    supportedFormats: 'CSV zu XLSX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['xlsx-in-csv-umwandeln', 'csv-in-pdf-umwandeln', 'excel-in-pdf-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'xlsx-in-csv-umwandeln',
    slug: 'xlsx-in-csv-umwandeln',
    category: 'documents',
    sourceFormats: ['.xlsx'],
    targetFormats: ['.csv'],
    nameDe: 'XLSX in CSV umwandeln',
    shortDescriptionDe: 'Excel-Arbeitsmappen (.xlsx) in standardisierte CSV-Textdateien für Datenbanken und Auswertungen exportieren.',
    titleDe: 'XLSX in CSV umwandeln – Excel als CSV-Datei exportieren | CoolWave',
    metaDescriptionDe: 'Excel-Dateien kostenlos online in CSV konvertieren. Saubere Zeichencodierung (UTF-8) für fehlerfreie Weiterverarbeitung in Datenbanken.',
    h1De: 'XLSX in CSV umwandeln – Excel-Tabellen als CSV exportieren',
    introDe: 'Exportieren Sie Excel-Tabellen in das universelle CSV-Format (Comma Separated Values), um sie in MySQL, PostgreSQL, Python-Skripten oder Buchhaltungssoftware einzulesen.',
    howItWorksDe: [
      { step: 1, title: 'Excel-Datei hochladen', text: 'Laden Sie Ihre .xlsx-Tabelle hoch.' },
      { step: 2, title: 'Als CSV exportieren', text: 'Klicken Sie auf „In CSV umwandeln“.' },
      { step: 3, title: 'CSV herunterladen', text: 'Laden Sie die UTF-8 codierte CSV-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Welches Trennzeichen wird verwendet?', answer: 'Standardmäßig wird das universelle Komma-Trennzeichen verwendet, wobei Textfelder mit Kommas automatisch in Anführungszeichen gesetzt werden.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Datenverarbeitung mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['XLSX in CSV', 'Excel zu CSV', 'Excel als CSV speichern', 'XLSX CSV Export'],
    supportedFormats: 'XLSX zu CSV',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['csv-in-xlsx-umwandeln', 'excel-in-pdf-umwandeln', 'csv-in-pdf-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'csv-in-pdf-umwandeln',
    slug: 'csv-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.csv'],
    targetFormats: ['.pdf'],
    nameDe: 'CSV in PDF umwandeln',
    shortDescriptionDe: 'CSV-Tabellendaten in ein übersichtliches, druckbares PDF-Dokument im Querformat verwandeln.',
    titleDe: 'CSV in PDF umwandeln – CSV-Daten als druckbare PDF-Tabelle speichern | CoolWave',
    metaDescriptionDe: 'CSV kostenlos online in PDF umwandeln. Professionelle Tabellenformatierung im Querformat für übersichtliche Berichte und Ausdrucke.',
    h1De: 'CSV in PDF umwandeln – Tabellen druckreif formatieren',
    introDe: 'Möchten Sie Rohdaten aus einer CSV-Datei an Kunden oder Vorgesetzte weitergeben? Wandeln Sie CSV-Dateien mit CoolWave direkt in ansprechende PDF-Tabellen mit automatischer Paginierung um.',
    howItWorksDe: [
      { step: 1, title: 'CSV auswählen', text: 'Wählen Sie Ihre .csv-Datei aus.' },
      { step: 2, title: 'In PDF layouten', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'Druckfähiges PDF sichern', text: 'Laden Sie Ihre fertige PDF-Tabelle herunter.' }
    ],
    faqDe: [
      { question: 'Warum wird das Querformat gewählt?', answer: 'Das Querformat bietet mehr Platz für Tabellenspalten und verhindert unleserliche Zeilenumbrüche.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Vertrauliche Tabellendaten werden nach 15 Minuten rückstandsfrei gelöscht.',
    searchKeywordsDe: ['CSV in PDF', 'CSV als PDF drucken', 'CSV Tabelle zu PDF', 'CSV in PDF konvertieren'],
    supportedFormats: 'CSV zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['csv-in-xlsx-umwandeln', 'excel-in-pdf-umwandeln', 'pdf-in-excel-umwandeln'],
    icon: 'FileSpreadsheet',
    status: 'active'
  },
  {
    id: 'ppt-in-pptx-umwandeln',
    slug: 'ppt-in-pptx-umwandeln',
    category: 'documents',
    sourceFormats: ['.ppt'],
    targetFormats: ['.pptx'],
    nameDe: 'PPT in PPTX umwandeln',
    shortDescriptionDe: 'Alte PowerPoint 97-2003 Präsentationen (.ppt) in das moderne PPTX-Format konvertieren.',
    titleDe: 'PPT in PPTX umwandeln – Altes PowerPoint in modernes PPTX konvertieren | CoolWave',
    metaDescriptionDe: 'PPT kostenlos in PPTX umwandeln. Alte Präsentationen modernisieren und für Microsoft PowerPoint 365, Keynote und Google Präsentationen fit machen.',
    h1De: 'PPT in PPTX umwandeln – Präsentationen modernisieren',
    introDe: 'Alte Folien im binären PPT-Format lassen sich auf Tablets, Smartphones oder in modernen Präsentationsprogrammen oft nicht öffnen. Konvertieren Sie Ihre PPT-Dateien mit CoolWave in standardmäßiges PPTX.',
    howItWorksDe: [
      { step: 1, title: 'PPT hochladen', text: 'Laden Sie Ihre alte .ppt-Datei hoch.' },
      { step: 2, title: 'In PPTX modernisieren', text: 'Klicken Sie auf „In PPTX umwandeln“.' },
      { step: 3, title: 'PPTX herunterladen', text: 'Speichern Sie die fertige PowerPoint-Datei.' }
    ],
    faqDe: [
      { question: 'Funktioniert PPTX mit Google Präsentationen und Apple Keynote?', answer: 'Ja, PPTX ist der weltweite Standard und wird von allen modernen Präsentationsprogrammen nativ unterstützt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Übertragung und automatische Datenlöschung nach 15 Minuten.',
    searchKeywordsDe: ['PPT in PPTX', 'PowerPoint 2003 in PPTX', 'PPT modernisieren', 'PPT zu PPTX Konverter'],
    supportedFormats: 'PPT zu PPTX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pptx-in-ppt-umwandeln', 'powerpoint-in-pdf-umwandeln', 'pdf-in-powerpoint-umwandeln'],
    icon: 'Presentation',
    status: 'active'
  },
  {
    id: 'pptx-in-ppt-umwandeln',
    slug: 'pptx-in-ppt-umwandeln',
    category: 'documents',
    sourceFormats: ['.pptx'],
    targetFormats: ['.ppt'],
    nameDe: 'PPTX in PPT umwandeln',
    shortDescriptionDe: 'PowerPoint PPTX-Präsentationen in das klassische PPT-Format für ältere Systeme speichern.',
    titleDe: 'PPTX in PPT umwandeln – PowerPoint-Präsentation kompatibel speichern | CoolWave',
    metaDescriptionDe: 'PPTX kostenlos online in PPT (PowerPoint 97-2003) umwandeln. Hohe Kompatibilität für ältere Rechner und Schulungsräume.',
    h1De: 'PPTX in PPT umwandeln – Für ältere PowerPoint-Systeme',
    introDe: 'Exportieren Sie moderne PowerPoint-Folien (.pptx) in das klassische PPT-Format, um Präsentationen auf Schulungsrechnern, älteren Beamer-PCs oder Konferenzsystemen abzuspielen.',
    howItWorksDe: [
      { step: 1, title: 'PPTX auswählen', text: 'Laden Sie Ihre Präsentation (.pptx) hoch.' },
      { step: 2, title: 'In PPT konvertieren', text: 'Starten Sie die Konvertierung.' },
      { step: 3, title: 'PPT herunterladen', text: 'Speichern Sie die kompatible Datei auf Ihrem Gerät.' }
    ],
    faqDe: [
      { question: 'Kann PowerPoint 2003 diese Datei öffnen?', answer: 'Ja, die Datei wird für maximale Kompatibilität mit früheren Office-Versionen vorbereitet.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Automatische Datenlöschung nach 15 Minuten.',
    searchKeywordsDe: ['PPTX in PPT', 'PowerPoint als PPT speichern', 'PPTX abwärtskompatibel speichern'],
    supportedFormats: 'PPTX zu PPT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['ppt-in-pptx-umwandeln', 'powerpoint-in-pdf-umwandeln', 'pdf-in-powerpoint-umwandeln'],
    icon: 'Presentation',
    status: 'active'
  },
  {
    id: 'odp-in-pptx-umwandeln',
    slug: 'odp-in-pptx-umwandeln',
    category: 'documents',
    sourceFormats: ['.odp'],
    targetFormats: ['.pptx'],
    nameDe: 'ODP in PPTX umwandeln',
    shortDescriptionDe: 'OpenOffice und LibreOffice Impress Präsentationen (.odp) in Microsoft PowerPoint (.pptx) umwandeln.',
    titleDe: 'ODP in PPTX umwandeln – OpenDocument-Präsentation in PowerPoint konvertieren | CoolWave',
    metaDescriptionDe: 'ODP kostenlos in PPTX umwandeln. LibreOffice Impress Präsentationen direkt in Microsoft PowerPoint Folien konvertieren.',
    h1De: 'ODP in PPTX umwandeln – OpenDocument zu PowerPoint',
    introDe: 'Wandeln Sie Folienpräsentationen aus LibreOffice Impress oder OpenOffice (.odp) in das weltweit verbreitete Microsoft PowerPoint Format (.pptx) um.',
    howItWorksDe: [
      { step: 1, title: 'ODP-Datei hochladen', text: 'Wählen Sie Ihre Impress-Präsentation aus.' },
      { step: 2, title: 'In PPTX übertragen', text: 'Klicken Sie auf „In PPTX umwandeln“.' },
      { step: 3, title: 'PowerPoint-Datei sichern', text: 'Laden Sie Ihre fertige PPTX-Präsentation herunter.' }
    ],
    faqDe: [
      { question: 'Werden Folientexte und Stichpunkte übernommen?', answer: 'Ja, CoolWave extrahiert alle Folienseiten, Folientitel und Aufzählungspunkte strukturiert in neue PowerPoint-Folien.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Datenverarbeitung mit automatischer Löschung nach 15 Minuten.',
    searchKeywordsDe: ['ODP in PPTX', 'LibreOffice Impress in PowerPoint', 'OpenOffice Präsentation zu PPTX'],
    supportedFormats: 'ODP zu PPTX',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['powerpoint-in-pdf-umwandeln', 'ppt-in-pptx-umwandeln', 'pdf-in-powerpoint-umwandeln'],
    icon: 'Presentation',
    status: 'active'
  },
  {
    id: 'epub-in-pdf-umwandeln',
    slug: 'epub-in-pdf-umwandeln',
    category: 'documents',
    sourceFormats: ['.epub'],
    targetFormats: ['.pdf'],
    nameDe: 'EPUB in PDF umwandeln',
    shortDescriptionDe: 'EPUB-E-Books in druckbare, universell lesbare PDF-Dokumente auf DIN A4 umwandeln.',
    titleDe: 'EPUB in PDF umwandeln – E-Book als druckbares PDF speichern | CoolWave',
    metaDescriptionDe: 'EPUB-E-Books kostenlos online in PDF konvertieren. Saubere Kapitelüberschriften, automatischer Seitenumbruch und Lesbarkeit auf jedem Gerät.',
    h1De: 'EPUB in PDF umwandeln – E-Books als PDF lesen und drucken',
    introDe: 'Konvertieren Sie EPUB-E-Books in feste, druckbare PDF-Dokumente. Perfekt zum Lesen auf dem Computer, zum Markieren von Textstellen oder für den Ausdruck auf DIN A4.',
    howItWorksDe: [
      { step: 1, title: 'EPUB-E-Book hochladen', text: 'Wählen Sie Ihre .epub-Buchdatei aus.' },
      { step: 2, title: 'PDF rendern', text: 'Klicken Sie auf „EPUB in PDF umwandeln“.' },
      { step: 3, title: 'PDF-Buch herunterladen', text: 'Laden Sie das fertige PDF-Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Werden Kapitel und Überschriften berücksichtigt?', answer: 'Ja, CoolWave liest die Buchstruktur (Spine) aus und formatiert Kapitelüberschriften und Absätze sauber auf A4-Seiten.' },
      { question: 'Funktioniert das mit DRM-geschützten Büchern?', answer: 'Es können nur DRM-freie EPUB-Dateien konvertiert werden. Kopiergeschützte Dateien (Adobe DRM) müssen zuvor unverschlüsselt sein.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% vertraulich – Ihre E-Books werden nach 15 Minuten automatisch vom Server gelöscht.',
    searchKeywordsDe: ['EPUB in PDF', 'E-Book in PDF umwandeln', 'EPUB als PDF drucken', 'EPUB zu PDF Konverter'],
    supportedFormats: 'EPUB zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['epub-in-txt-umwandeln', 'pdf-in-word-umwandeln', 'pdf-komprimieren'],
    icon: 'BookOpen',
    status: 'active'
  },
  {
    id: 'epub-in-txt-umwandeln',
    slug: 'epub-in-txt-umwandeln',
    category: 'documents',
    sourceFormats: ['.epub'],
    targetFormats: ['.txt'],
    nameDe: 'EPUB in TXT umwandeln',
    shortDescriptionDe: 'Den reinen Text aus EPUB-E-Books extrahieren und als universelle TXT-Textdatei speichern.',
    titleDe: 'EPUB in TXT umwandeln – Text aus E-Book extrahieren | CoolWave',
    metaDescriptionDe: 'EPUB kostenlos in TXT umwandeln. Extrahiert den gesamten Buchtext ohne HTML-Tags und Formatierungsreste für Sprachausgabe und Notizen.',
    h1De: 'EPUB in TXT umwandeln – Buchtext extrahieren',
    introDe: 'Extrahieren Sie den gesamten Text eines E-Books als schlanke, universelle TXT-Datei. Ideal für Textanalyse, Barrierefreiheit (Screenreader), Vorlese-Apps oder Notizen.',
    howItWorksDe: [
      { step: 1, title: 'EPUB auswählen', text: 'Laden Sie Ihre .epub-Datei hoch.' },
      { step: 2, title: 'Text extrahieren', text: 'Klicken Sie auf „In TXT umwandeln“.' },
      { step: 3, title: 'Textdatei speichern', text: 'Laden Sie die fertige .txt-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Wird der HTML-Code entfernt?', answer: 'Ja, alle Formatierungs-Tags, Stylesheets und HTML-Steuerzeichen werden sauber gefiltert, sodass nur der reine Fließtext übrig bleibt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Vertrauliche Verarbeitung mit automatischer Datenlöschung nach 15 Minuten.',
    searchKeywordsDe: ['EPUB in TXT', 'E-Book Text extrahieren', 'EPUB zu Text', 'EPUB als TXT'],
    supportedFormats: 'EPUB zu TXT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'doc-convert',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['epub-in-pdf-umwandeln', 'txt-in-docx-umwandeln', 'txt-in-pdf-umwandeln'],
    icon: 'BookOpen',
    status: 'active'
  },
  {
    id: 'pdf-seiten-nummerieren',
    slug: 'pdf-seiten-nummerieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Seiten nummerieren',
    shortDescriptionDe: 'Fügen Sie flexible Seitenzahlen („Seite X von Y“) mit individueller Positionierung in PDF-Dokumente ein.',
    titleDe: 'PDF Seiten nummerieren – Seitenzahlen kostenlos online einfügen | CoolWave',
    metaDescriptionDe: 'PDF-Seiten kostenlos und flexibel nummerieren. Wählen Sie Position, Format („Seite X von Y“) und Schriftdesign. Sicher im Browser verarbeitet.',
    h1De: 'PDF Seiten nummerieren – Seitenzahlen einfügen',
    introDe: 'Versehen Sie Ihre PDF-Dokumente mit professionellen Seitenzahlen. Wählen Sie individuelle Formate wie „Seite X von Y“, flexible Platzierungen und schließen Sie das Deckblatt bei Bedarf automatisch aus.',
    howItWorksDe: [
      { step: 1, title: 'PDF-Datei hochladen', text: 'Ziehen Sie Ihre PDF in den Konverter oder wählen Sie sie aus.' },
      { step: 2, title: 'Nummerierung anpassen', text: 'Wählen Sie Zahlenformat, Position (z. B. Unten Mitte) und Schriftgröße.' },
      { step: 3, title: 'Nummerierte PDF speichern', text: 'Klicken Sie auf „Seiten nummerieren“ und laden Sie das Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Kann ich das Deckblatt von der Nummerierung ausschließen?', answer: 'Ja, die Option „Deckblatt überspringen“ lässt die erste Seite frei und beginnt die Nummerierung ab Seite 2.' },
      { question: 'Welche Formate werden unterstützt?', answer: 'Sie können beliebige Formate wählen, z. B. „Seite {n} von {total}“, „{n}/{total}“ oder einfache Ziffern „{n}“.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Verarbeitung erfolgt 100% lokal im Browser – Ihre Dokumente verlassen Ihren Computer nicht.',
    searchKeywordsDe: ['PDF Seiten nummerieren', 'Seitenzahlen in PDF einfügen', 'PDF durchnummerieren', 'PDF Seitennummer'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-numbering',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-kopfzeile-hinzufuegen', 'pdf-fusszeile-hinzufuegen', 'pdf-wasserzeichen'],
    icon: 'Hash',
    status: 'active'
  },
  {
    id: 'pdf-kopfzeile-hinzufuegen',
    slug: 'pdf-kopfzeile-hinzufuegen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Kopfzeile hinzufügen',
    shortDescriptionDe: 'Fügen Sie einheitliche Kopfzeilen mit Dokumententitel, Datum oder Autorenangaben in PDF-Seiten ein.',
    titleDe: 'PDF Kopfzeile hinzufügen – Titel & Datum in PDF einfügen | CoolWave',
    metaDescriptionDe: 'Individuelle Kopfzeilen in PDF-Dokumente einfügen. Titel, Datum oder Autorenangaben links, mittig oder rechts platzieren.',
    h1De: 'PDF Kopfzeile hinzufügen – Einheitliche Dokumententitel',
    introDe: 'Ergänzen Sie Ihre PDF-Seiten um einheitliche Kopfzeilen mit Dokumententiteln, Firmennamen oder Datumsangaben. Mit flexiblem 3-Zonen-Layout und optionaler Trennlinie.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie Ihr PDF-Dokument hoch.' },
      { step: 2, title: 'Kopfzeile gestalten', text: 'Geben Sie gewünschte Texte für links, mittig oder rechts ein.' },
      { step: 3, title: 'PDF herunterladen', text: 'Wenden Sie die Kopfzeile an und speichern Sie das fertige Dokument.' }
    ],
    faqDe: [
      { question: 'Kann das aktuelle Datum automatisch eingefügt werden?', answer: 'Ja, mit dem Platzhalter {date} wird automatisch das aktuelle Tagesdatum eingesetzt.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere clientseitige Verarbeitung ohne Speicherung auf externen Servern.',
    searchKeywordsDe: ['PDF Kopfzeile', 'Kopfzeile in PDF einfügen', 'PDF Header hinzufügen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-header-footer',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-fusszeile-hinzufuegen', 'pdf-seiten-nummerieren', 'pdf-wasserzeichen'],
    icon: 'Layers',
    status: 'active'
  },
  {
    id: 'pdf-fusszeile-hinzufuegen',
    slug: 'pdf-fusszeile-hinzufuegen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Fußzeile hinzufügen',
    shortDescriptionDe: 'Fügen Sie rechtliche Hinweise, Vertraulichkeitsvermerke oder Copyright in die Fußzeile Ihrer PDF ein.',
    titleDe: 'PDF Fußzeile hinzufügen – Fußnoten & Hinweistexte einbinden | CoolWave',
    metaDescriptionDe: 'Fußzeilen mit Vertraulichkeitshinweisen, Copyright oder Seitenzahlen in PDF-Dokumente einfügen. Schnell und sicher online.',
    h1De: 'PDF Fußzeile hinzufügen – Rechtliche Hinweise & Fußtexte',
    introDe: 'Bringen Sie rechtliche Hinweise, Vertraulichkeitsvermerke oder Seitenzahlen am unteren Rand Ihrer PDF-Seiten an. Übersichtliche Aufteilung in Links, Mitte und Rechts.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Wählen Sie Ihre PDF-Datei aus.' },
      { step: 2, title: 'Fußzeilentexte definieren', text: 'Passen Sie Text und Position der Fußnoten an.' },
      { step: 3, title: 'Ergebnis sichern', text: 'Laden Sie Ihre mit Fußzeilen versehene PDF herunter.' }
    ],
    faqDe: [
      { question: 'Kann eine Trennlinie über der Fußzeile gezeichnet werden?', answer: 'Ja, aktivieren Sie einfach das Kontrollkästchen „Dezente horizontale Trennlinie zeichnen“.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Vollständig geschützte Bearbeitung direkt im Browser.',
    searchKeywordsDe: ['PDF Fußzeile', 'Fußzeile in PDF einfügen', 'PDF Footer hinzufügen', 'PDF Copyright Vermerk'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-header-footer',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-kopfzeile-hinzufuegen', 'pdf-seiten-nummerieren', 'pdf-wasserzeichen'],
    icon: 'AlignLeft',
    status: 'active'
  },
  {
    id: 'pdf-vergleichen',
    slug: 'pdf-vergleichen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF vergleichen',
    shortDescriptionDe: 'Zwei PDF-Dokumente seitenweise vergleichen und textliche Unterschiede farblich visualisieren.',
    titleDe: 'PDF vergleichen – Zwei PDF-Dokumente auf Unterschiede prüfen | CoolWave',
    metaDescriptionDe: 'Zwei PDF-Dateien online vergleichen. Textliche und visuelle Änderungen seitenweise erkennen, farblich hervorheben und als Bericht exportieren.',
    h1De: 'PDF vergleichen – Unterschiede präzise erkennen',
    introDe: 'Vergleichen Sie zwei Versionen eines Vertrags, Berichts oder Manuskripts. CoolWave analysiert alle Seiten semantisch und markiert hinzugefügte und gelöschte Passagen auf einen Blick.',
    howItWorksDe: [
      { step: 1, title: 'Beide PDFs hochladen', text: 'Laden Sie Dokument A (Original) und Dokument B (Vergleich) hoch.' },
      { step: 2, title: 'Vergleich starten', text: 'Klicken Sie auf „Dokumente jetzt vergleichen“ zur Textanalyse.' },
      { step: 3, title: 'Unterschiede prüfen', text: 'Sehen Sie farblich hervorgehobene Änderungen und exportieren Sie den Prüfbericht.' }
    ],
    faqDe: [
      { question: 'Vergleicht das Tool nur Dateihashes oder echten Inhalt?', answer: 'CoolWave vergleicht den tatsächlichen seitenweisen Textinhalt auf Wort- und Zeichenebene und berechnet einen echten semantischen Übereinstimmungsgrad.' },
      { question: 'Können die Unterschiede exportiert werden?', answer: 'Ja, Sie können einen detaillierten Textbericht mit allen Wortabweichungen herunterladen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% vertrauliche Client-Verarbeitung – Dokumenteninhalte bleiben auf Ihrem Gerät.',
    searchKeywordsDe: ['PDF vergleichen', 'Zwei PDFs abgleichen', 'PDF Diff Tool', 'PDF Unterschiede finden', 'Verträge vergleichen PDF'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 2 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-compare',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-text-extrahieren', 'pdf-eigenschaften-anzeigen', 'pdf-bearbeiten'],
    icon: 'GitCompare',
    status: 'active'
  },
  {
    id: 'pdf-reparieren',
    slug: 'pdf-reparieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF reparieren',
    shortDescriptionDe: 'Stellen Sie beschädigte oder nicht mehr lesbare PDF-Dateien wieder her.',
    titleDe: 'PDF reparieren – Beschädigte & defekte PDF-Dateien retten | CoolWave',
    metaDescriptionDe: 'Beschädigte PDF-Dateien online reparieren. Stellt fehlerhafte Querverweistabellen (Xref) und unvollständige Seitenstrukturen zuverlässig wieder her.',
    h1De: 'PDF reparieren – Defekte Dokumente wiederherstellen',
    introDe: 'Lässt sich Ihre PDF-Datei nicht mehr öffnen oder meldet der Reader einen Formatfehler? CoolWave rekonstruiert beschädigte Xref-Tabellen und holt unbeschädigte Seiteninhalte zurück.',
    howItWorksDe: [
      { step: 1, title: 'Defekte PDF hochladen', text: 'Wählen Sie die beschädigte PDF-Datei aus.' },
      { step: 2, title: 'Reparatur durchführen', text: 'Klicken Sie auf „Beschädigte PDF reparieren“.' },
      { step: 3, title: 'Gerettete PDF sichern', text: 'Laden Sie das reparierte Dokument wieder lesbar herunter.' }
    ],
    faqDe: [
      { question: 'Welche Fehler können behoben werden?', answer: 'Häufige Fehler wie unvollständige Download-Trailer, korrupte Xref-Indexe, beschädigte Stream-Längen und fehlende End-of-File-Marker können erfolgreich repariert werden.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Wiederherstellung ohne Speicherung auf externen Servern.',
    searchKeywordsDe: ['PDF reparieren', 'Defekte PDF retten', 'PDF beschädigt reparieren', 'PDF wiederherstellen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-repair',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-optimieren', 'pdf-komprimieren', 'pdf-eigenschaften-anzeigen'],
    icon: 'Wrench',
    status: 'active'
  },
  {
    id: 'pdf-optimieren',
    slug: 'pdf-optimieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF optimieren',
    shortDescriptionDe: 'Reduzieren Sie Dateigrößen und beschleunigen Sie Web-Ladezeiten durch Stream-Kompression.',
    titleDe: 'PDF optimieren – Dateigröße reduzieren & Web-Ladezeit beschleunigen | CoolWave',
    metaDescriptionDe: 'PDF-Dokumente optimieren: Unnötige Metadaten und doppelte Objekte entfernen, Datenströme komprimieren für blitzschnelles Laden.',
    h1De: 'PDF optimieren – Schlanke & schnelle Dokumente',
    introDe: 'Befreien Sie PDF-Dokumente von überflüssigen internen Objekten und komprimieren Sie Datenströme ohne sichtbaren Qualitätsverlust für schnelles Versenden per E-Mail.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie Ihre zu große PDF-Datei hoch.' },
      { step: 2, title: 'Optimierung anstoßen', text: 'Klicken Sie auf „PDF-Dateigröße optimieren“.' },
      { step: 3, title: 'Optimierte PDF laden', text: 'Speichern Sie die schlankere Datei auf Ihrem Rechner.' }
    ],
    faqDe: [
      { question: 'Was ist der Unterschied zu PDF komprimieren?', answer: 'Die Optimierung konzentriert sich auf die interne PDF-Struktur (Entfernung redundanter Objekte, Deflate-Stream-Kompression, Lineariserung), ohne Bildpixel aggressiv herunterzurechnen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Schnelle Datenverarbeitung mit garantierter Datenlöschung.',
    searchKeywordsDe: ['PDF optimieren', 'PDF schlank machen', 'PDF Stream Kompression', 'PDF für Web optimieren'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-optimize',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-komprimieren', 'pdf-reparieren', 'pdf-abflachen'],
    icon: 'Zap',
    status: 'active'
  },
  {
    id: 'pdfa-umwandeln',
    slug: 'pdfa-umwandeln',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF in PDF/A umwandeln',
    shortDescriptionDe: 'Konvertieren Sie Dokumente in das revisionssichere ISO 19005-1 PDF/A-Format für Langzeitarchivierung.',
    titleDe: 'PDF in PDF/A umwandeln – Langzeitarchivierung nach ISO 19005-1 | CoolWave',
    metaDescriptionDe: 'PDF-Dateien in revisionssicheres PDF/A-1b für die Langzeitarchivierung konvertieren. sRGB OutputIntent und XMP-Konformität inklusive.',
    h1De: 'PDF in PDF/A umwandeln – Revisionssichere Archivierung',
    introDe: 'Konvertieren Sie Geschäftsberichte, Rechnungen und Verträge in das standardisierte PDF/A-1b Format nach ISO 19005-1 für lückenlose behördliche Revisionssicherheit.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Wählen Sie das zu archivierende Dokument aus.' },
      { step: 2, title: 'In PDF/A umwandeln', text: 'Starten Sie die Einbettung von Farbprofilen und Archivmetadaten.' },
      { step: 3, title: 'PDF/A herunterladen', text: 'Laden Sie Ihre archivkonforme PDF/A-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Was ist PDF/A-1b?', answer: 'PDF/A-1b ist der internationale ISO-Standard für die elektronische Langzeitarchivierung von Dokumenten. Er stellt sicher, dass Dokumente auch in Jahrzehnten noch exakt gleich angezeigt werden.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere Verarbeitung für sensible behördliche und geschäftliche Dokumente.',
    searchKeywordsDe: ['PDF in PDFA', 'PDFA umwandeln', 'PDF ISO 19005-1', 'PDF Langzeitarchivierung', 'PDF/A-1b Konverter'],
    supportedFormats: 'PDF zu PDF/A',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-pdfa',
    browserCapable: true,
    serverRequired: true,
    relatedTools: ['pdf-optimieren', 'pdf-abflachen', 'pdf-schuetzen'],
    icon: 'FileCheck',
    status: 'active'
  },
  {
    id: 'pdf-abflachen',
    slug: 'pdf-abflachen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF abflachen',
    shortDescriptionDe: 'Brennen Sie Formulareingaben, Häkchen und Anmerkungen dauerhaft in die Seitengrafik ein.',
    titleDe: 'PDF abflachen – Interaktive Formulare & Ebenen sperren | CoolWave',
    metaDescriptionDe: 'Formularfelder, Kontrollkästchen und Anmerkungen in PDF fest einbrennen. Verhindert nachträgliche Bearbeitung vor dem Versand.',
    h1De: 'PDF abflachen – Formulareingaben unveränderbar sichern',
    introDe: 'Wandeln Sie ausgefüllte Formulare und Kommentare dauerhaft in die Seitengrafik um, sodass Empfänger die Eingaben nicht mehr verändern können.',
    howItWorksDe: [
      { step: 1, title: 'Ausgefüllte PDF hochladen', text: 'Wählen Sie Ihre PDF mit Formularfeldern aus.' },
      { step: 2, title: 'Felder abflachen', text: 'Klicken Sie auf „Formulare & Anmerkungen abflachen“.' },
      { step: 3, title: 'Gesperrte PDF speichern', text: 'Laden Sie das abwärtskompatible, geschützte Dokument herunter.' }
    ],
    faqDe: [
      { question: 'Können die Formularfelder danach noch geändert werden?', answer: 'Nein, nach dem Abflachen sind alle Eingaben fester Bestandteil der Grafik und können in keinem PDF-Reader mehr umgeschrieben werden.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Lokale Ausführung direkt in Ihrem Browser – kein Datenabfluss.',
    searchKeywordsDe: ['PDF abflachen', 'PDF flatten', 'Formularfelder sperren PDF', 'PDF interaktiv entfernen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-flatten',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-anmerkungen-entfernen', 'pdfa-umwandeln', 'pdf-schuetzen'],
    icon: 'Layers',
    status: 'active'
  },
  {
    id: 'pdf-anmerkungen-entfernen',
    slug: 'pdf-anmerkungen-entfernen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.pdf'],
    nameDe: 'PDF Anmerkungen entfernen',
    shortDescriptionDe: 'Löschen Sie Kommentare, Haftnotizen, Textmarkierungen und Korrekturskizzen restlos.',
    titleDe: 'PDF Anmerkungen entfernen – Kommentare & Markierungen löschen | CoolWave',
    metaDescriptionDe: 'Alle Anmerkungen, Haftnotizen, Markierungen und Zeichnungen mit einem Klick aus der PDF löschen. Der Grundtext bleibt unberührt.',
    h1De: 'PDF Anmerkungen entfernen – Saubere Dokumente ohne Notizen',
    introDe: 'Entfernen Sie interne Korrekturhinweise, Leuchtmarker-Hervorhebungen und Notizen aus PDF-Dokumenten, bevor Sie diese an externe Partner versenden.',
    howItWorksDe: [
      { step: 1, title: 'PDF mit Notizen hochladen', text: 'Wählen Sie Ihre kommentierte PDF-Datei aus.' },
      { step: 2, title: 'Anmerkungen löschen', text: 'Klicken Sie auf „Alle Anmerkungen entfernen“.' },
      { step: 3, title: 'Saubere PDF herunterladen', text: 'Speichern Sie das bereinigte Dokument auf Ihrem PC.' }
    ],
    faqDe: [
      { question: 'Bleibt der Originaltext erhalten?', answer: 'Ja, nur die überlagerten Anmerkungs-Objekte (/Annots) werden entfernt. Der gesamte Basistext und alle Bilder bleiben zu 100% erhalten.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% clientseitig im Browser verarbeitet.',
    searchKeywordsDe: ['PDF Anmerkungen entfernen', 'Kommentare aus PDF löschen', 'PDF Markierungen entfernen'],
    supportedFormats: 'PDF zu PDF',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-annotations-remove',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-abflachen', 'pdf-metadaten-entfernen', 'pdf-schwaerzen'],
    icon: 'MessageSquareOff',
    status: 'active'
  },
  {
    id: 'pdf-bilder-extrahieren',
    slug: 'pdf-bilder-extrahieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.png', '.jpg', '.zip'],
    nameDe: 'PDF Bilder extrahieren',
    shortDescriptionDe: 'Extrahieren Sie alle in einer PDF eingebetteten Fotos und Abbildungen in Originalauflösung.',
    titleDe: 'PDF Bilder extrahieren – Eingebettete Fotos & Grafiken speichern | CoolWave',
    metaDescriptionDe: 'Alle Bilder aus einer PDF-Datei in voller Auflösung extrahieren. Einzeln herunterladen oder gebündelt als ZIP-Archiv.',
    h1De: 'PDF Bilder extrahieren – Fotos & Grafiken exportieren',
    introDe: 'Extrahieren Sie alle in einer PDF eingebetteten Fotos und Abbildungen in Originalqualität als PNG-Dateien – inklusive praktischem ZIP-Download.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie Ihre PDF-Datei mit Bildern hoch.' },
      { step: 2, title: 'Bilder lokalisieren', text: 'CoolWave scannt alle Seiten nach Bildobjekten.' },
      { step: 3, title: 'Bilder herunterladen', text: 'Laden Sie einzelne Fotos oder alle Bilder als ZIP herunter.' }
    ],
    faqDe: [
      { question: 'Werden die Bilder komprimiert?', answer: 'Nein, die Bilder werden in ihrer vollen Originalauflösung und Farbqualität aus den Datenströmen extrahiert.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Verarbeitung läuft lokal in Ihrem Browser – keine Übertragung.',
    searchKeywordsDe: ['PDF Bilder extrahieren', 'Bilder aus PDF speichern', 'Fotos aus PDF extrahieren', 'PDF Image Extractor'],
    supportedFormats: 'PDF zu Bildern (PNG/ZIP)',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-extract',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-text-extrahieren', 'pdf-in-png-umwandeln', 'pdf-in-jpg-umwandeln'],
    icon: 'ImageIcon',
    status: 'active'
  },
  {
    id: 'pdf-text-extrahieren',
    slug: 'pdf-text-extrahieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.txt'],
    nameDe: 'PDF Text extrahieren',
    shortDescriptionDe: 'Extrahieren Sie den gesamten Text aus einer PDF-Datei seitenweise zur Weiterverarbeitung.',
    titleDe: 'PDF Text extrahieren – Text aus PDF-Seiten kopieren & speichern | CoolWave',
    metaDescriptionDe: 'Den gesamten Text aus PDF-Dokumenten seitenweise extrahieren. Mit einem Klick kopieren oder als saubere TXT-Datei herunterladen.',
    h1De: 'PDF Text extrahieren – Dokumententext weiterverwenden',
    introDe: 'Kopieren Sie den gesamten Text Ihrer PDF-Dateien ohne störende Sonderzeichen oder Formatierungsfehler heraus und speichern Sie ihn als Textdatei.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Wählen Sie das Dokument mit Text aus.' },
      { step: 2, title: 'Text auslesen', text: 'CoolWave extrahiert alle Textblöcke seitenweise.' },
      { step: 3, title: 'Kopieren oder Speichern', text: 'Kopieren Sie den Text in die Zwischenablage oder laden Sie eine TXT-Datei herunter.' }
    ],
    faqDe: [
      { question: 'Funktioniert das auch bei eingescannten PDFs?', answer: 'Für reine Bildscans ohne Textschicht nutzen Sie unser spezialisiertes Tool „Scan zu Text (OCR)“. Bei normalen PDFs wird der Text direkt digital ausgelesen.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Sichere lokale Extraktion im Browser.',
    searchKeywordsDe: ['PDF Text extrahieren', 'Text aus PDF kopieren', 'PDF in TXT auslesen', 'PDF Text rippen'],
    supportedFormats: 'PDF zu TXT',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-extract',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-bilder-extrahieren', 'bild-zu-text', 'pdf-in-word-umwandeln'],
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'pdf-anhaenge-extrahieren',
    slug: 'pdf-anhaenge-extrahieren',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.zip'],
    nameDe: 'PDF Anhänge extrahieren',
    shortDescriptionDe: 'Laden Sie eingebettete Dateianhänge und ZUGFeRD / Factur-X Rechnungs-XMLs herunter.',
    titleDe: 'PDF Anhänge extrahieren – Eingebettete Dateien & ZUGFeRD-Daten | CoolWave',
    metaDescriptionDe: 'Eingebettete Dateianhänge und ZUGFeRD / Factur-X Rechnungs-XMLs aus PDF-Dateien extrahieren und herunterladen.',
    h1De: 'PDF Anhänge extrahieren – Verborgene Dateien sichern',
    introDe: 'Laden Sie in PDF-Dokumenten eingebettete Begleitdateien oder Rechnungsdaten (wie ZUGFeRD-XML) schnell und unkompliziert herunter.',
    howItWorksDe: [
      { step: 1, title: 'PDF auswählen', text: 'Laden Sie die PDF mit Anhängen hoch.' },
      { step: 2, title: 'Dateibaum scannen', text: 'CoolWave durchsucht das Dokument nach eingebetteten Dateien.' },
      { step: 3, title: 'Dateien herunterladen', text: 'Speichern Sie gefundene Anhänge einzeln oder als ZIP-Archiv.' }
    ],
    faqDe: [
      { question: 'Was sind typische PDF-Dateianhänge?', answer: 'Häufig handelt es sich um elektronische XML-Rechnungsdaten (ZUGFeRD / Factur-X), Quelldateien, Kalkulationstabellen oder hochauflösende Begleitgrafiken.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: 'Keine Übertragung auf Server – Extraktion erfolgt auf Ihrem Gerät.',
    searchKeywordsDe: ['PDF Anhänge extrahieren', 'ZUGFeRD XML extrahieren', 'Embedded Files PDF', 'Dateianhang aus PDF speichern'],
    supportedFormats: 'PDF zu Anhängen (ZIP)',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-extract',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-bilder-extrahieren', 'pdf-eigenschaften-anzeigen', 'pdf-text-extrahieren'],
    icon: 'Paperclip',
    status: 'active'
  },
  {
    id: 'pdf-eigenschaften-anzeigen',
    slug: 'pdf-eigenschaften-anzeigen',
    category: 'pdf',
    sourceFormats: ['.pdf'],
    targetFormats: ['.json', '.txt'],
    nameDe: 'PDF Eigenschaften anzeigen',
    shortDescriptionDe: 'Analysieren Sie technische PDF-Eigenschaften: Maße (mm/pt), PDF-Version, Formularfelder und PDF/A-Status.',
    titleDe: 'PDF Eigenschaften anzeigen – Version, Maße & Metadaten prüfen | CoolWave',
    metaDescriptionDe: 'Detaillierte PDF-Eigenschaften analysieren: Seitenmaße (mm/pt), PDF-Version, Erstellungsdatum, Formularfelder und PDF/A-Konformität.',
    h1De: 'PDF Eigenschaften anzeigen – Vollständige Dokumentenanalyse',
    introDe: 'Erhalten Sie detaillierten Einblick in die technischen Eigenschaften Ihrer PDF-Datei: Seitenabmessungen, PDF-Version, Sicherheitseinstellungen und Formularfelder.',
    howItWorksDe: [
      { step: 1, title: 'PDF hochladen', text: 'Wählen Sie das zu prüfende PDF-Dokument aus.' },
      { step: 2, title: 'Eigenschaften einsehen', text: 'Betrachten Sie Version, Maße, Autoren und PDF/A-Status.' },
      { step: 3, title: 'Report exportieren', text: 'Exportieren Sie die technischen Daten bei Bedarf als JSON-Bericht.' }
    ],
    faqDe: [
      { question: 'Welche technischen Daten werden angezeigt?', answer: 'PDF-Version, exakte Seitenmaße in Millimetern und Punkten, Seitenzahl, Formularfelderanzahl, PDF/A-Konformität sowie alle Standardmetadaten.' }
    ],
    troubleshootingDe: [],
    privacyExplanationDe: '100% anonyme und sichere Prüfung direkt im Browser.',
    searchKeywordsDe: ['PDF Eigenschaften anzeigen', 'PDF Version prüfen', 'PDF Seitenmaße ermitteln', 'PDF Metadaten Viewer'],
    supportedFormats: 'PDF Inspektion',
    freeLimits: { maxFileSizeMB: 50, maxBatch: 1 },
    proLimits: { maxFileSizeMB: 500, maxBatch: 10 },
    processingEngine: 'pdf-metadata',
    browserCapable: true,
    serverRequired: false,
    relatedTools: ['pdf-metadaten-anzeigen', 'pdf-metadaten-entfernen', 'pdf-vergleichen'],
    icon: 'Info',
    status: 'active'
  }
];


// ==========================================
// REGISTRY ACCESSORS & QUERY HELPERS
// ==========================================

export function getActiveTools(): ToolDefinition[] {
  return TOOLS_CONFIG.filter((t) => t.status === 'active' || t.status === 'beta');
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_CONFIG.find((tool) => tool.slug === slug && tool.status !== 'maintenance');
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return getActiveTools().filter((tool) => tool.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return getActiveTools().filter((tool) => tool.badge === 'Beliebt');
}

export function getRelatedTools(relatedSlugs: string[]): ToolDefinition[] {
  return getActiveTools().filter((tool) => relatedSlugs.includes(tool.slug));
}

export function searchTools(query: string): ToolDefinition[] {
  if (!query.trim()) return getActiveTools().slice(0, 8);
  const q = query.toLowerCase().trim();
  return getActiveTools().filter(
    (tool) =>
      tool.nameDe.toLowerCase().includes(q) ||
      tool.slug.toLowerCase().includes(q) ||
      tool.shortDescriptionDe.toLowerCase().includes(q) ||
      tool.sourceFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
      tool.targetFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
      (tool.searchKeywordsDe && tool.searchKeywordsDe.some((k) => k.toLowerCase().includes(q)))
  );
}


