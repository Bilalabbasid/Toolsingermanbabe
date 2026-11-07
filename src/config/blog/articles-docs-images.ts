import type { BlogArticle } from './types';

/**
 * Documents, formats and images articles (writer B batch).
 */
export const DOCS_IMAGES_ARTICLES: BlogArticle[] = [
  {
    slug: 'word-in-pdf-umwandeln-anleitung',
    title: 'Word in PDF umwandeln: Anleitung für DOCX und DOC',
    metaTitle: 'Word in PDF umwandeln – so klappt es | Datei Tools',
    metaDescription: 'Word in PDF umwandeln: mit Word, LibreOffice, am Smartphone oder kostenlos im Browser ohne Upload. Mit Tipps zu Schriften, Links und Layout.',
    h1: 'Word in PDF umwandeln: So wird aus DOCX und DOC ein sauberes PDF',
    excerpt: 'Ob Bewerbung, Rechnung oder Hausarbeit: Ein PDF sieht beim Empfänger genauso aus wie bei Ihnen. Wir zeigen alle gängigen Wege von Word zu PDF und worauf Sie bei Schriften, Links und Seitenumbrüchen achten sollten.',
    category: 'documents',
    primaryKeyword: 'word in pdf umwandeln',
    secondaryKeywords: ['docx in pdf umwandeln', 'word dokument als pdf speichern', 'doc in pdf', 'word in pdf ohne word', 'word in pdf kostenlos'],
    searchIntent: 'transactional',
    primaryToolSlug: 'word-in-pdf-umwandeln',
    ctaHeadline: 'Word-Dokument jetzt kostenlos in PDF umwandeln',
    ctaButtonLabel: 'Word in PDF umwandeln',
    relatedToolSlugs: ['doc-in-pdf-umwandeln', 'odt-in-pdf-umwandeln', 'pdf-komprimieren', 'pdf-in-word-umwandeln'],
    relatedArticleSlugs: ['dokument-in-pdf-umwandeln-wichtigste-moeglichkeiten', 'pdf-oder-word-welches-format-eignet-sich-wann', 'docx-vs-doc-unterschied', 'pdf-fuer-email-verkleinern', 'pdf-a-erklaert-archivierung'],
    directAnswer: 'Am zuverlässigsten wandeln Sie Word in PDF um, indem Sie in Word „Datei > Speichern unter“ wählen und als Dateityp PDF einstellen; so bleiben Layout, Schriften und Links erhalten. Ohne Word nutzen Sie LibreOffice oder einen Browser-Konverter, der Text, Tabellen und Bilder neu auf A4-Seiten setzt – Schriftarten sowie Kopf- und Fußzeilen können dabei vom Original abweichen.',
    steps: [
      { step: 1, title: 'Dokument fertigstellen', text: 'Nehmen Sie alle Änderungen an und blenden Sie Kommentare aus, bevor Sie exportieren. Was in der Druckansicht sichtbar ist, landet in der Regel auch im PDF.' },
      { step: 2, title: 'Datei auswählen', text: 'Öffnen Sie den Word-in-PDF-Konverter und ziehen Sie Ihre DOCX- oder DOC-Datei per Drag & Drop in das Fenster oder wählen Sie sie über den Dateidialog aus.' },
      { step: 3, title: 'Umwandlung im Browser abwarten', text: 'Die Konvertierung erfolgt direkt in Ihrem Browser. Bei langen Dokumenten mit vielen Bildern hängt die Dauer von der Leistung Ihres Geräts ab.' },
      { step: 4, title: 'PDF speichern und kontrollieren', text: 'Laden Sie das PDF herunter und blättern Sie es einmal vollständig durch. Achten Sie besonders auf Tabellen, Seitenumbrüche, Sonderzeichen und Links.' }
    ],
    sections: [
      {
        heading: 'Warum sollte man Word-Dokumente als PDF verschicken?',
        content: 'Ein PDF sieht beim Empfänger so aus wie bei Ihnen, ein Word-Dokument nur dann, wenn dort dieselbe Word-Version und dieselben Schriften installiert sind. Schon eine fehlende Schriftart kann Zeilen verschieben und Seitenumbrüche verändern. Ein PDF dagegen fixiert das Layout: Text, Bilder und Seitenaufteilung bleiben auf jedem Gerät gleich, egal ob am Windows-PC, am Mac oder auf dem Smartphone.\n\nHinzu kommt, dass ein PDF nicht versehentlich verändert wird. Für Bewerbungen, Angebote, Rechnungen oder Abschlussarbeiten ist das meist genau das gewünschte Verhalten. Wann welches Format sinnvoller ist, lesen Sie ausführlich im Beitrag [PDF oder Word – welches Format wann passt](blog:pdf-oder-word-welches-format-eignet-sich-wann). Faustregel: Solange noch jemand am Text arbeiten soll, bleibt es bei DOCX. Sobald das Dokument fertig ist und verteilt wird, ist PDF die bessere Wahl.'
      },
      {
        heading: 'Word in PDF umwandeln mit Word, LibreOffice und am Mac',
        content: 'Word und LibreOffice exportieren Dokumente direkt als PDF, ein Zusatzprogramm brauchen Sie dafür nicht:\n\n- **Word unter Windows:** „Datei > Speichern unter“ und als Dateityp „PDF“ wählen. Alternativ „Datei > Exportieren > PDF/XPS-Dokument erstellen“. Unter „Optionen“ legen Sie fest, ob Textmarken aus Überschriften erzeugt werden.\n- **Word für Mac:** „Datei > Speichern unter“ und als Dateiformat PDF einstellen. Die Variante für elektronische Verteilung nutzt laut Microsoft einen Online-Dienst, die Druckvariante arbeitet lokal.\n- **LibreOffice:** „Datei > Exportieren als > Als PDF exportieren“ bietet viele Optionen, darunter Bildqualität und PDF/A.\n- **Microsoft Print to PDF:** Funktioniert aus jedem Programm über den Druckdialog, verliert aber anklickbare Links und Lesezeichen.\n\nEinen Überblick über weitere Dokumenttypen finden Sie unter [Dokumente in PDF umwandeln: die wichtigsten Möglichkeiten](blog:dokument-in-pdf-umwandeln-wichtigste-moeglichkeiten).'
      },
      {
        heading: 'Word in PDF ohne Word: Was leistet ein Browser-Konverter?',
        content: 'Ein Browser-Konverter liest den Inhalt der Word-Datei und setzt ihn als PDF neu, statt das Word-Layout eins zu eins zu übernehmen. Das ist praktisch, wenn kein Office installiert ist, etwa auf einem Leih-Laptop, einem Chromebook oder einem Linux-System. Der [Word-in-PDF-Konverter von Datei Tools](tool:word-in-pdf-umwandeln) arbeitet dabei lokal im Browser: Die Datei wird nicht an einen Server geschickt, was bei Lebensläufen, Arbeitsverträgen oder Gutachten mit personenbezogenen Daten ein echter Vorteil ist.\n\nWas Sie vom Ergebnis erwarten können:\n\n- **Übernommen:** Überschriften, Absätze, Listen, Tabellen, Bilder, Fett- und Kursivschrift, Ausrichtung, manuelle Seitenumbrüche und anklickbare Weblinks.\n- **Neu gesetzt:** Der Text erscheint in einer Standardschrift auf DIN-A4-Seiten, mehrseitige Dokumente erhalten Seitenzahlen. Zeilen- und Seitenumbrüche fallen deshalb anders aus als in Word.\n- **Nicht übernommen:** Originalschriftarten, Kopf- und Fußzeilen, die Position frei platzierter Textfelder sowie Vektorgrafiken im EMF- oder WMF-Format. Zeichen außerhalb des westeuropäischen Zeichensatzes, etwa kyrillische oder asiatische Schrift, werden ersetzt.\n\nFür ältere Dateien im Format .doc aus Word 97 bis 2003 gibt es einen eigenen DOC-in-PDF-Konverter. Er überträgt Text, Tabellen und Grundformatierung, aber keine Bilder, Textfelder, Kopf- und Fußzeilen oder Fußnoten. Für eine Hausarbeit mit Fließtext und Überschriften reicht das meist; soll ein gestalteter Flyer oder Briefbogen exakt wie in Word aussehen, exportieren Sie direkt aus Word oder LibreOffice.'
      },
      {
        heading: 'Schriften, Links und Barrierefreiheit: worauf es beim Export ankommt',
        content: 'Ein gutes PDF enthält die verwendeten Schriften eingebettet, damit es überall gleich aussieht. Word erledigt das beim Export meist automatisch. Probleme entstehen, wenn eine Schrift aus Lizenzgründen nicht eingebettet werden darf; dann ersetzt der Betrachter sie durch eine ähnliche.\n\nWeitere Punkte, die sich lohnen:\n\n- **Überschriften als Formatvorlagen:** Wer „Überschrift 1“ und „Überschrift 2“ nutzt, bekommt beim Export ein Inhaltsverzeichnis als Lesezeichenleiste.\n- **Links prüfen:** Hyperlinks bleiben beim Export als PDF erhalten, beim Umweg über einen virtuellen Drucker meist nicht.\n- **Barrierefreiheit:** Die Word-Option für Dokumentstrukturtags erzeugt ein getaggtes PDF, das Screenreader besser vorlesen können.\n- **Archivierung:** Soll das Dokument langfristig aufbewahrt werden, kann ein PDF/A sinnvoll sein. Mehr dazu im Artikel [PDF/A verständlich erklärt](blog:pdf-a-erklaert-archivierung).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Seitenumbrüche verschoben:** Meist fehlt eine Schrift oder das Papierformat ist falsch eingestellt (Letter statt A4). Prüfen Sie unter „Layout > Format“ das Papierformat.\n- **Kommentare oder Änderungen im PDF sichtbar:** Nehmen Sie Änderungen an oder stellen Sie die Markup-Ansicht auf „Keine Markups“, bevor Sie exportieren.\n- **Felder zeigen falsche Werte:** Datumsfelder und Inhaltsverzeichnisse vorher aktualisieren, in Word mit F9 nach dem Markieren des gesamten Texts.\n- **PDF ist zu groß:** Große Fotos im Dokument treiben die Dateigröße in die Höhe. Komprimieren Sie Bilder in Word oder verkleinern Sie das fertige PDF, wie in [PDF für die E-Mail verkleinern](blog:pdf-fuer-email-verkleinern) beschrieben.\n- **Leere Seite am Ende:** Häufig ein Absatzzeichen nach einer Tabelle. Blenden Sie Formatierungszeichen ein und verkleinern Sie diesen Absatz auf 1 pt.'
      },
      {
        heading: 'Word in PDF am iPhone und Android-Smartphone: so geht’s',
        content: 'Am Smartphone exportieren Sie Word-Dokumente am einfachsten aus der Word-App für iOS oder Android: Ein geöffnetes Dokument lässt sich dort über das Teilen- oder Datei-Menü als PDF speichern. Am iPhone können Sie ein Word-Dokument auch in Pages öffnen und über „Exportieren“ als PDF sichern; dabei kann sich das Layout jedoch stärker verändern, weil Pages das Dokument zunächst in sein eigenes Format übersetzt.\n\nOhne App funktioniert der Weg über den Browser: Öffnen Sie die Datei aus der Dateien-App am iPhone oder aus „Files by Google“ unter Android im Konverter. Bei sehr langen Dokumenten kann die Umwandlung auf älteren Smartphones etwas dauern, da die Rechenarbeit vollständig auf dem Gerät stattfindet.'
      }
    ],
    faqs: [
      { question: 'Kann ich Word in PDF umwandeln, ohne Word installiert zu haben?', answer: 'Ja. Sie können das kostenlose LibreOffice nutzen oder einen Browser-Konverter. Bei Datei Tools wird die Datei lokal im Browser umgewandelt; Text, Tabellen und Bilder werden dabei neu auf A4-Seiten gesetzt, Schriftarten sowie Kopf- und Fußzeilen werden nicht übernommen.' },
      { question: 'Bleiben Hyperlinks im PDF anklickbar?', answer: 'Beim Export über „Speichern unter > PDF“ in Word oder LibreOffice bleiben Links in der Regel erhalten. Wenn Sie über einen virtuellen Drucker wie „Microsoft Print to PDF“ gehen, sind sie danach meist nicht mehr anklickbar.' },
      { question: 'Warum sieht mein PDF anders aus als das Word-Dokument?', answer: 'Häufigste Ursachen sind fehlende Schriften, ein abweichendes Papierformat oder komplexe Elemente wie Textfelder und schwebende Grafiken. Browser-Konverter setzen das Dokument zudem mit einer Standardschrift neu. Wenn das Layout exakt stimmen muss, exportieren Sie direkt aus Word.' },
      { question: 'Kann ich das PDF später wieder in Word bearbeiten?', answer: 'Grundsätzlich ja, über eine PDF-in-Word-Umwandlung. Das Layout wird dabei aber neu aufgebaut und ist nicht immer identisch. Bewahren Sie deshalb die originale DOCX-Datei immer auf.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'excel-in-pdf-umwandeln-tabellen',
    title: 'Excel in PDF umwandeln, ohne dass Spalten abgeschnitten werden',
    metaTitle: 'Excel in PDF: Tabellen sauber auf eine Seite bringen',
    metaDescription: 'Excel in PDF umwandeln ohne abgeschnittene Spalten: Druckbereich, Skalierung und Seitenumbrüche richtig setzen. Kostenlos im Browser ohne Upload.',
    h1: 'Excel in PDF umwandeln: Druckbereich, Seitenumbrüche und Breite im Griff',
    excerpt: 'Eine Excel-Tabelle als PDF zu speichern ist schnell erledigt – ein lesbares PDF ohne zerschnittene Spalten dagegen nicht immer. So bereiten Sie Arbeitsblätter so vor, dass das Ergebnis passt.',
    category: 'documents',
    primaryKeyword: 'excel in pdf umwandeln',
    secondaryKeywords: ['excel als pdf speichern', 'xlsx in pdf', 'excel pdf auf eine seite', 'excel druckbereich pdf', 'excel tabelle als pdf'],
    searchIntent: 'transactional',
    primaryToolSlug: 'excel-in-pdf-umwandeln',
    ctaHeadline: 'Excel-Tabelle jetzt kostenlos als PDF speichern',
    ctaButtonLabel: 'Excel in PDF umwandeln',
    relatedToolSlugs: ['csv-in-pdf-umwandeln', 'pdf-in-excel-umwandeln', 'pdf-zusammenfuegen'],
    relatedArticleSlugs: ['pdf-in-excel-tabellen-uebernehmen', 'csv-in-excel-umwandeln-umlaute', 'word-in-pdf-umwandeln-anleitung', 'dokument-in-pdf-umwandeln-wichtigste-moeglichkeiten'],
    directAnswer: 'Um Excel sauber in PDF umzuwandeln, legen Sie in Excel einen Druckbereich fest, wählen Querformat und stellen die Skalierung auf „Alle Spalten auf einer Seite darstellen“; danach speichern Sie über „Datei > Speichern unter“ als PDF. Ohne Excel setzt ein Browser-Konverter alle sichtbaren Tabellenblätter als Tabellen auf A4-Seiten, übernimmt aber weder Druckbereich noch Zellfarben oder Diagramme.',
    steps: [
      { step: 1, title: 'Tabelle aufräumen', text: 'Blenden Sie Hilfsspalten, Notizen und leere Bereiche aus oder legen Sie in Excel einen Druckbereich fest. Ausgeblendete Zeilen, Spalten und Blätter erscheinen weder beim Excel-Export noch im Browser-Konverter.' },
      { step: 2, title: 'Ausrichtung und Skalierung wählen', text: 'Breite Tabellen passen meist besser ins Querformat. In Excel bringen Sie über die Skalierung im Druckdialog alle Spalten auf eine Seitenbreite; im Browser-Konverter wählen Sie Hochformat, Querformat oder die automatische Ausrichtung.' },
      { step: 3, title: 'PDF erzeugen', text: 'Speichern Sie in Excel über „Datei > Speichern unter“ als PDF oder ziehen Sie die XLSX- oder XLS-Datei in den Excel-in-PDF-Konverter, der lokal im Browser arbeitet.' },
      { step: 4, title: 'Ergebnis prüfen', text: 'Kontrollieren Sie im PDF, ob alle Spalten vollständig sind, ob Kopfzeilen auf jeder Seite stehen und ob Zahlenformate korrekt angezeigt werden.' }
    ],
    sections: [
      {
        heading: 'Warum werden Excel-Tabellen im PDF zerschnitten?',
        content: 'Excel-Tabellen werden im PDF zerschnitten, weil ein Arbeitsblatt keine Seiten kennt: Es kann Hunderte Spalten breit und Tausende Zeilen lang sein, und erst beim Drucken oder Exportieren entscheidet Excel, wie diese Fläche auf DIN-A4-Blätter verteilt wird. Ohne Vorgaben teilt Excel die Tabelle einfach dort, wo der Platz endet: Die Spalten A bis F landen auf Seite 1, G bis K auf Seite 2, und die Zeilen werden zusätzlich nach unten aufgeteilt.\n\nDas Ergebnis ist ein PDF, in dem man zwischen Seiten hin- und herblättern muss, um eine Zeile zu lesen. Die gute Nachricht: Mit drei Einstellungen – Druckbereich, Ausrichtung und Skalierung – lässt sich das beim Export aus Excel fast immer vermeiden. Excel speichert diese Einstellungen in der Datei, doch nicht jedes Programm wertet sie aus: Einfache Browser-Konverter setzen die Tabelle nach eigenen Regeln.'
      },
      {
        heading: 'Wie bringe ich eine Excel-Tabelle auf eine PDF-Seite?',
        content: 'In Excel steuern Umbruchvorschau, Skalierung und Drucktitel, wie eine Tabelle auf die PDF-Seiten verteilt wird:\n\n- **Umbruchvorschau:** Unter „Ansicht > Umbruchvorschau“ sehen Sie blaue Linien, die die Seitengrenzen markieren. Ziehen Sie diese Linien mit der Maus, um Umbrüche gezielt zu setzen.\n- **Skalierung:** Im Druckdialog („Datei > Drucken“) finden Sie Optionen wie „Blatt auf einer Seite darstellen“ oder „Alle Spalten auf einer Seite darstellen“. Letztere ist für lange Listen meist die bessere Wahl, weil die Schrift lesbar bleibt.\n- **Drucktitel:** Über „Seitenlayout > Drucktitel“ legen Sie Zeilen fest, die oben auf jeder Seite wiederholt werden, etwa die Spaltenüberschriften.\n- **Ränder und Zentrierung:** Schmale Ränder schaffen Platz; „horizontal zentrieren“ wirkt bei schmalen Tabellen aufgeräumter.\n- **Gitternetzlinien:** Sie werden standardmäßig nicht gedruckt. Setzen Sie Rahmen, wenn Linien im PDF sichtbar sein sollen.\n\nBei sehr breiten Tabellen ist die ehrliche Antwort: Irgendwann wird die Schrift zu klein. Dann lohnt es sich, Spalten auszublenden oder die Tabelle auf mehrere Blätter aufzuteilen.'
      },
      {
        heading: 'Excel ohne Office in PDF umwandeln: Was macht der Browser-Konverter?',
        content: 'Ohne Microsoft 365 öffnen Sie die Datei in LibreOffice Calc und sichern sie über „Datei > Exportieren als > Als PDF exportieren“. Alternativ setzt der [Excel-in-PDF-Konverter](tool:excel-in-pdf-umwandeln) von Datei Tools die Arbeitsmappe direkt im Browser als PDF; die Tabelle verlässt Ihr Gerät dabei nicht, was bei Gehaltslisten oder Kundenumsätzen zählt.\n\nDer Konverter arbeitet anders als der Excel-Export:\n\n- Jedes sichtbare Tabellenblatt wird als Tabelle auf DIN-A4-Seiten gesetzt; ausgeblendete Zeilen, Spalten und Blätter werden übersprungen.\n- Ab sieben Spalten wählt die automatische Ausrichtung das Querformat. Hoch- oder Querformat können Sie auch fest einstellen.\n- Tabellen mit mehr als 14 Spalten werden in Spaltengruppen wie „Spalten A–N“ aufgeteilt, die nacheinander folgen.\n- Eine erkannte Kopfzeile wird auf Folgeseiten wiederholt, verbundene Zellen bleiben verbunden.\n- Druckbereich, Skalierung, Zellfarben, Schriftarten und Diagramme werden nicht übernommen; im PDF stehen die angezeigten Zellwerte.\n\nLiegen Ihre Daten nur als CSV-Export vor, etwa aus einer Buchhaltungssoftware, nutzen Sie den [CSV-in-PDF-Konverter](tool:csv-in-pdf-umwandeln) oder bereiten die Datei zuerst in Excel auf, wie im Beitrag [CSV in Excel umwandeln ohne Umlaut-Chaos](blog:csv-in-excel-umwandeln-umlaute) beschrieben.'
      },
      {
        heading: 'Was geht bei der Umwandlung von Excel in PDF verloren?',
        content: 'Ein PDF ist eine Momentaufnahme: Es zeigt die Werte, die Excel im Moment des Exports berechnet hat, aber keine Formeln. Wer im PDF auf eine Summe klickt, sieht keine Formel dahinter. Das ist beim Versand an Kunden oft sogar erwünscht.\n\nAuch Filter, ausgeblendete Zeilen und Gruppierungen werden nicht interaktiv übernommen: Ausgeblendetes erscheint nicht, eingeklappte Gruppen bleiben eingeklappt. Beim Export aus Excel werden Diagramme als Grafik eingebettet und bedingte Formatierungen als Farben dargestellt. Kommentare und Notizen erscheinen nur, wenn Sie das im Seitenlayout ausdrücklich einstellen.\n\nMöchten Sie später doch wieder mit den Zahlen rechnen, ist der Rückweg möglich, aber aufwendiger. Lesen Sie dazu [Tabellen aus PDF in Excel übernehmen](blog:pdf-in-excel-tabellen-uebernehmen). Bewahren Sie deshalb immer die Original-XLSX auf.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Nur das erste Blatt landet im PDF:** In Excel können Sie beim Export in den Optionen wählen, ob nur das aktive Blatt oder die gesamte Arbeitsmappe gespeichert wird. Der Browser-Konverter übernimmt automatisch alle sichtbaren Blätter.\n- **Leere Seiten im PDF:** Oft liegt irgendwo weit rechts oder unten eine formatierte, aber leere Zelle. Setzen Sie einen Druckbereich, dann ignoriert Excel den Rest.\n- **Zahlen erscheinen als ####:** Die Spalte ist zu schmal für den Wert. Verbreitern Sie die Spalte vor dem Export.\n- **Schrift winzig klein:** „Blatt auf einer Seite darstellen“ bei sehr langen Listen staucht alles. Wählen Sie stattdessen „Alle Spalten auf einer Seite“ und lassen Sie die Zeilen über mehrere Seiten laufen.\n- **Kopfzeile fehlt ab Seite 2:** Drucktitel setzen, damit die Überschriftenzeile wiederholt wird.'
      }
    ],
    faqs: [
      { question: 'Wie bekomme ich eine Excel-Tabelle auf eine PDF-Seite?', answer: 'Stellen Sie im Druckdialog die Skalierung auf „Blatt auf einer Seite darstellen“ und wählen Sie gegebenenfalls Querformat. Bei großen Tabellen wird die Schrift dadurch sehr klein, dann ist „Alle Spalten auf einer Seite darstellen“ meist die lesbarere Lösung.' },
      { question: 'Werden Formeln ins PDF übernommen?', answer: 'Nein. Das PDF enthält nur die berechneten Werte zum Zeitpunkt der Umwandlung. Wer die Formeln weitergeben möchte, muss die Excel-Datei selbst verschicken.' },
      { question: 'Kann ich mehrere Tabellenblätter in ein PDF packen?', answer: 'Ja. Excel bietet beim Export die Möglichkeit, die gesamte Arbeitsmappe zu speichern. Der Excel-in-PDF-Konverter von Datei Tools setzt alle sichtbaren Tabellenblätter nacheinander in ein PDF, jedes Blatt beginnt auf einer neuen Seite.' },
      { question: 'Funktioniert die Umwandlung auch mit XLS-Dateien?', answer: 'Ja, auch das ältere XLS-Format und OpenDocument-Tabellen (ODS) lassen sich umwandeln. Der Browser-Konverter übernimmt die Zellwerte; Diagramme, Makros und Zellfarben erscheinen im PDF nicht.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-in-excel-tabellen-uebernehmen',
    title: 'PDF in Excel umwandeln: Tabellen aus PDFs übernehmen',
    metaTitle: 'PDF in Excel umwandeln: Tabellen richtig übernehmen',
    metaDescription: 'PDF in Excel umwandeln: So übernehmen Sie Tabellen aus Kontoauszügen und Berichten, vermeiden Zahlenfehler und nutzen OCR für Scans. Ohne Upload.',
    h1: 'PDF in Excel umwandeln: Tabellen aus PDF-Dateien sauber übernehmen',
    excerpt: 'Kontoauszüge, Preislisten oder Berichte liegen oft nur als PDF vor. Wir erklären, wann die Umwandlung in Excel gut funktioniert, wo die Grenzen liegen und wie Sie Zahlenfehler vermeiden.',
    category: 'documents',
    primaryKeyword: 'pdf in excel umwandeln',
    secondaryKeywords: ['pdf tabelle in excel', 'pdf in xlsx', 'tabelle aus pdf kopieren', 'kontoauszug pdf in excel', 'pdf in excel konvertieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'pdf-in-excel-umwandeln',
    ctaHeadline: 'PDF-Tabellen jetzt kostenlos in Excel übernehmen',
    ctaButtonLabel: 'PDF in Excel umwandeln',
    relatedToolSlugs: ['ocr-pdf', 'pdf-text-extrahieren', 'pdf-seiten-extrahieren', 'excel-in-pdf-umwandeln'],
    relatedArticleSlugs: ['excel-in-pdf-umwandeln-tabellen', 'gescannte-pdf-bearbeiten-ocr-verwenden', 'csv-in-excel-umwandeln-umlaute', 'pdf-umwandeln-welche-formate-eignen-sich'],
    directAnswer: 'Um eine PDF-Tabelle in Excel zu übernehmen, öffnen Sie die Datei in einem PDF-in-Excel-Konverter, der Zeilen und Spalten anhand der Textpositionen erkennt und eine XLSX-Datei erzeugt. Das klappt gut bei digital erzeugten PDFs mit echtem Text, gescannte Dokumente brauchen vorher eine Texterkennung (OCR); prüfen Sie danach Spaltenzuordnung, Zahlen und Datumswerte.',
    steps: [
      { step: 1, title: 'PDF-Typ prüfen', text: 'Versuchen Sie, im PDF Text zu markieren. Lässt er sich auswählen, liegt echter Text vor. Ist alles nur ein Bild, handelt es sich um einen Scan, der zuerst per OCR erkannt werden muss.' },
      { step: 2, title: 'Relevante Seiten auswählen', text: 'Enthält das Dokument viele Seiten, aber nur wenige Tabellen, extrahieren Sie die benötigten Seiten vorab. Das spart Zeit und macht das Ergebnis übersichtlicher.' },
      { step: 3, title: 'PDF im Konverter öffnen', text: 'Ziehen Sie die Datei in den PDF-in-Excel-Konverter. Die Erkennung läuft lokal im Browser, jede PDF-Seite wird zu einem eigenen Tabellenblatt.' },
      { step: 4, title: 'Tabelle in Excel nacharbeiten', text: 'Öffnen Sie die XLSX-Datei, prüfen Sie Spaltenzuordnung und Zahlenformate und vergleichen Sie Stichproben oder Summen mit dem Original.' }
    ],
    sections: [
      {
        heading: 'Warum ist eine PDF-Tabelle keine echte Tabelle?',
        content: 'Was im PDF wie eine Tabelle aussieht, ist technisch meist nur eine Sammlung von Textstücken, die an bestimmten Koordinaten auf der Seite stehen, plus ein paar gezeichnete Linien. Das PDF weiß nicht, dass „1.250,00“ in Zeile 3, Spalte „Betrag“ steht. Ein Konverter muss diese Struktur aus der Position der Texte rekonstruieren.\n\nDas gelingt gut, wenn die Tabelle klar aufgebaut ist: gleichmäßige Spalten, eine Zeile pro Datensatz, gut erkennbare Kopfzeile. Schwieriger wird es bei mehrzeiligen Zellen, verbundenen Überschriften, Tabellen ohne Linien oder Seiten mit mehreren Tabellen nebeneinander. Hier kann es passieren, dass Werte in die falsche Spalte rutschen oder eine Zeile in zwei aufgeteilt wird. Ein Konverter liefert deshalb eine gute Ausgangsbasis, ersetzt aber nicht den kritischen Blick auf das Ergebnis.'
      },
      {
        heading: 'Digital erzeugtes PDF oder Scan: Was ist der Unterschied?',
        content: 'Entscheidend für die Umwandlung ist, ob das PDF echten Text enthält. Kontoauszüge aus dem Online-Banking, Rechnungen aus Buchhaltungsprogrammen und exportierte Berichte sind in der Regel digital erzeugt. Hier liest der [PDF-in-Excel-Konverter](tool:pdf-in-excel-umwandeln) die Zeichen direkt aus, statt sie zu erkennen; Verwechslungen wie bei einer Texterkennung entstehen dabei nicht.\n\nAnders bei eingescannten oder abfotografierten Dokumenten. Dort gibt es nur Pixel, keine Zeichen. Der PDF-in-Excel-Konverter enthält selbst keine Texterkennung und meldet in diesem Fall, dass kein auslesbarer Text vorhanden ist. Bevor eine Tabelle erkannt werden kann, muss also zuerst eine OCR den Inhalt lesen. Wie das funktioniert und wo die Grenzen liegen, erklärt der Beitrag [Gescannte PDF bearbeiten mit OCR](blog:gescannte-pdf-bearbeiten-ocr-verwenden). Wichtig: OCR kann Ziffern verwechseln, etwa 1 und 7, 0 und 8 oder Komma und Punkt. Bei Finanzdaten ist eine Kontrolle deshalb Pflicht, am besten über Summen, die Sie mit dem Original vergleichen.'
      },
      {
        heading: 'Wie korrigiere ich Zahlen, Datumswerte und Trennzeichen?',
        content: 'Übernommene Werte müssen in Excel als echte Zahlen vorliegen, sonst rechnen Formeln nicht mit ihnen. Der Konverter von Datei Tools wandelt Beträge im deutschen (1.250,00) und im englischen Format (1,250.00) sowie Werte mit €-, $- oder £-Zeichen bereits in Zahlen um; Werte mit führender Null bleiben Text. Typische Restfehler und Abhilfen:\n\n- **Zahlen als Text:** Ein kleines grünes Dreieck in der Zelle verrät es. Markieren Sie die Spalte und wählen Sie „In eine Zahl umwandeln“ oder nutzen Sie „Daten > Text in Spalten“.\n- **Ungewöhnliche Schreibweisen:** Beträge mit Leerzeichen als Tausendertrenner oder Prozentzeichen bleiben oft Text. Mit „Suchen und Ersetzen“ bringen Sie das in Ordnung.\n- **Minuszeichen am Ende:** Manche Kontoauszüge schreiben „150,00-“. Eine Hilfsformel oder Power Query wandelt das in −150 um.\n- **Datumswerte:** 03/04 kann der 3. April oder der 4. März sein. Prüfen Sie, welches Format das Original verwendet.\n\nWenn Sie die Daten anschließend als CSV weitergeben, lesen Sie [CSV in Excel umwandeln ohne Umlaut-Chaos](blog:csv-in-excel-umwandeln-umlaute) – dort geht es um dieselben Formatfallen in umgekehrter Richtung.'
      },
      {
        heading: 'Kontoauszüge und Finanzdaten ohne Upload umwandeln',
        content: 'Kontoauszüge, Gehaltsabrechnungen und Steuerunterlagen lassen sich in Excel übernehmen, ohne sie einem fremden Server anzuvertrauen. Viele Online-Konverter verarbeiten solche Dateien auf ihren Servern; bei Datei Tools läuft die Erkennung dagegen vollständig in Ihrem Browser, das PDF verlässt Ihr Gerät nicht.\n\nDas bedeutet auch: Die Geschwindigkeit hängt von Ihrem Rechner ab. Ein mehrseitiger Kontoauszug ist auf einem aktuellen Laptop schnell umgewandelt, ein 200-seitiger Geschäftsbericht braucht spürbar länger, besonders auf älteren Smartphones. Benötigen Sie nur einzelne Tabellen aus einem großen Dokument, ziehen Sie die betreffenden Seiten vorher mit [Seiten aus PDF extrahieren](tool:pdf-seiten-extrahieren) heraus.'
      },
      {
        heading: 'Welche Alternativen gibt es zum PDF-in-Excel-Konverter?',
        content: 'Kleine Tabellen lassen sich oft auch ohne Konverter per Kopieren und Einfügen übernehmen: Text im PDF-Betrachter markieren, in Excel einfügen und mit „Daten > Text in Spalten“ aufteilen. Das ist bei mehr als einer Handvoll Zeilen allerdings mühsam.\n\nExcel aus Microsoft 365 für Windows bietet zudem unter „Daten > Daten abrufen > Aus Datei > Aus PDF“ einen eigenen Import über Power Query. Er erkennt Tabellen und lässt sich bei wiederkehrenden Berichten automatisieren. Auf dem Mac und in älteren Versionen fehlt diese Funktion.\n\nGeht es gar nicht um Tabellen, sondern um Fließtext, ist eine Umwandlung nach Word oder ein reiner Textexport sinnvoller. Einen Überblick über alle Zielformate gibt der Artikel [PDF umwandeln: Welche Formate eignen sich?](blog:pdf-umwandeln-welche-formate-eignen-sich).'
      }
    ],
    faqs: [
      { question: 'Kann ich eine gescannte PDF in Excel umwandeln?', answer: 'Ja, aber nur mit vorheriger Texterkennung (OCR), denn der PDF-in-Excel-Konverter selbst liest nur vorhandenen Text. Die Qualität hängt stark vom Scan ab: sauber und gerade gescannte Seiten liefern deutlich bessere Ergebnisse als schiefe Handyfotos. Zahlen sollten Sie anschließend stichprobenartig prüfen.' },
      { question: 'Warum landen Werte in der falschen Spalte?', answer: 'Der Konverter muss Spalten anhand der Textposition erraten. Bei Tabellen ohne Linien, mit mehrzeiligen Zellen oder verbundenen Überschriften kann das danebengehen. Verschieben Sie die betroffenen Zellen manuell oder passen Sie die Auswahl der Seiten an.' },
      { question: 'Werden Formeln aus dem PDF übernommen?', answer: 'Nein, ein PDF enthält keine Formeln, sondern nur Ergebnisse. In Excel erhalten Sie die reinen Werte und können neue Formeln, etwa Summen zur Kontrolle, selbst anlegen.' },
      { question: 'Ist die Umwandlung von Kontoauszügen sicher?', answer: 'Bei Datei Tools wird das PDF lokal in Ihrem Browser verarbeitet und nicht übertragen. Damit bleiben die Kontodaten auf Ihrem Gerät. Speichern Sie die erzeugte Excel-Datei anschließend ebenso sorgfältig wie das Original.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'odt-dateien-oeffnen-und-umwandeln',
    title: 'ODT-Datei öffnen: So klappt es mit und ohne LibreOffice',
    metaTitle: 'ODT-Datei öffnen und in DOCX oder PDF umwandeln',
    metaDescription: 'ODT-Datei öffnen unter Windows, Mac und am Handy: mit Word, LibreOffice oder Google Docs – oder kostenlos ohne Upload in DOCX bzw. PDF umwandeln.',
    h1: 'ODT-Datei öffnen und umwandeln: Was Sie über das OpenDocument-Format wissen sollten',
    excerpt: 'Eine Datei mit der Endung .odt lässt sich per Doppelklick nicht öffnen? Wir erklären, was hinter dem OpenDocument-Format steckt, welche Programme es lesen und wie Sie es verlustarm in DOCX oder PDF umwandeln.',
    category: 'documents',
    primaryKeyword: 'odt datei öffnen',
    secondaryKeywords: ['odt in docx umwandeln', 'odt in word öffnen', 'was ist eine odt datei', 'odt in pdf', 'opendocument text öffnen'],
    searchIntent: 'informational',
    primaryToolSlug: 'odt-in-docx-umwandeln',
    ctaHeadline: 'ODT-Datei jetzt kostenlos in DOCX umwandeln',
    ctaButtonLabel: 'ODT in DOCX umwandeln',
    relatedToolSlugs: ['odt-in-pdf-umwandeln', 'docx-in-odt-umwandeln', 'odp-in-pptx-umwandeln'],
    relatedArticleSlugs: ['docx-vs-doc-unterschied', 'word-in-pdf-umwandeln-anleitung', 'pdf-oder-word-welches-format-eignet-sich-wann', 'dokument-in-pdf-umwandeln-wichtigste-moeglichkeiten', 'epub-in-pdf-umwandeln'],
    directAnswer: 'Eine ODT-Datei ist ein Textdokument im offenen OpenDocument-Format, wie es LibreOffice und OpenOffice standardmäßig speichern. Sie öffnen es kostenlos mit LibreOffice, in aktuellen Word-Versionen oder in Google Docs. Ohne passendes Programm wandeln Sie die Datei im Browser in DOCX oder PDF um; Text, Tabellen und Bilder bleiben erhalten, Feinheiten des Layouts können abweichen.',
    steps: [
      { step: 1, title: 'Ziel festlegen', text: 'Möchten Sie das Dokument weiterbearbeiten, wählen Sie DOCX als Ziel. Wollen Sie es nur lesen, drucken oder weiterleiten, ist PDF die robustere Wahl.' },
      { step: 2, title: 'ODT-Datei auswählen', text: 'Öffnen Sie den passenden Konverter und ziehen Sie die ODT-Datei hinein oder wählen Sie sie über den Dateidialog aus.' },
      { step: 3, title: 'Umwandlung starten', text: 'Die Datei wird in Ihrem Browser umgewandelt. Es ist keine Installation und keine Registrierung nötig.' },
      { step: 4, title: 'Ergebnis öffnen und prüfen', text: 'Öffnen Sie die DOCX-Datei in Word oder das PDF in einem Betrachter und kontrollieren Sie Tabellen, Aufzählungen und Kopf- und Fußzeilen.' }
    ],
    sections: [
      {
        heading: 'Was ist eine ODT-Datei?',
        content: 'ODT steht für „OpenDocument Text“. Das Format gehört zur OpenDocument-Familie, die als internationaler Standard ISO/IEC 26300 festgeschrieben ist. Dazu zählen auch ODS für Tabellen und ODP für Präsentationen. Entwickelt wurde das Format, damit Dokumente nicht an das Programm eines einzelnen Herstellers gebunden sind.\n\nTechnisch ist eine ODT-Datei ein ZIP-Archiv mit XML-Dateien für Inhalt, Formatierung und Metadaten sowie eingebetteten Bildern. Das ähnelt dem DOCX-Format von Microsoft, beide Formate sind aber nicht identisch. Wer sich für die Unterschiede innerhalb der Word-Welt interessiert, findet sie im Beitrag [DOCX und DOC: die Unterschiede](blog:docx-vs-doc-unterschied).\n\nODT-Dateien begegnen Ihnen vor allem, wenn der Absender LibreOffice oder OpenOffice nutzt, etwa in Schulen, Vereinen, an Hochschulen oder in Verwaltungen. Einige öffentliche Stellen, zum Beispiel in Schleswig-Holstein, setzen bewusst auf offene Formate.'
      },
      {
        heading: 'Wie öffne ich eine ODT-Datei unter Windows, Mac und am Smartphone?',
        content: 'ODT-Dateien öffnen Sie kostenlos mit LibreOffice, in aktuellen Word-Versionen oder in Google Docs:\n\n- **Microsoft Word:** Aktuelle Word-Versionen öffnen ODT-Dateien direkt über „Datei > Öffnen“. Einfache Dokumente sehen dabei meist korrekt aus, bei komplexen Layouts kann es Abweichungen geben.\n- **LibreOffice:** Das kostenlose Office-Paket für Windows, macOS und Linux ist das „Heimatprogramm“ des Formats und zeigt ODT-Dateien am originalgetreuesten.\n- **Google Docs:** Datei in Google Drive ablegen und mit Google Docs öffnen. Das funktioniert im Browser und am Smartphone, setzt aber ein Google-Konto voraus und speichert das Dokument in der Cloud.\n- **Mac:** Neben Word und LibreOffice kann auch TextEdit einfache ODT-Dateien öffnen, Layout-Details gehen dabei aber verloren.\n- **iPhone und Android:** Hier fehlt oft eine passende App. Der einfachste Weg ist die Umwandlung in PDF direkt im Browser.'
      },
      {
        heading: 'ODT in DOCX oder PDF umwandeln: welches Ziel wofür?',
        content: 'DOCX ist das richtige Ziel, wenn Sie ein ODT-Dokument in Word weiterbearbeiten oder an Personen mit Microsoft Office weitergeben möchten. Mit dem [ODT-in-DOCX-Konverter](tool:odt-in-docx-umwandeln) erledigen Sie das im Browser. Soll das Dokument nur gelesen, gedruckt oder archiviert werden, nehmen Sie den [ODT-in-PDF-Konverter](tool:odt-in-pdf-umwandeln). Wie die Umwandlung aus Word heraus funktioniert, beschreibt der Artikel [Word in PDF umwandeln](blog:word-in-pdf-umwandeln-anleitung).\n\nBeide Konverter übernehmen Überschriften, Absätze, Listen, Tabellen und Bilder. Kopf- und Fußzeilen, die Position von Textrahmen und Formatvorlagen können abweichen; das PDF wird auf DIN-A4-Seiten in einer Standardschrift gesetzt. Die Dateien werden lokal in Ihrem Browser verarbeitet, was bei Elternbriefen, Vereinsprotokollen mit Mitgliederdaten oder Bewerbungsunterlagen zählt. Der umgekehrte Weg ist ebenfalls möglich: Wer mit LibreOffice-Nutzern zusammenarbeitet, wandelt DOCX in ODT um.'
      },
      {
        heading: 'Was kann sich bei der Umwandlung von ODT verändern?',
        content: 'ODT und DOCX beschreiben Dokumente mit ähnlichen, aber nicht deckungsgleichen Mitteln, deshalb kann sich bei jeder Umwandlung das Layout verschieben. Prüfen Sie danach vor allem folgende Punkte:\n\n- **Schriften:** LibreOffice nutzt standardmäßig andere Schriften als Word, etwa Liberation Serif statt Times New Roman. Fehlt die Schrift, wird sie ersetzt, und Zeilenumbrüche verschieben sich.\n- **Nummerierungen und Aufzählungen:** Mehrstufige Listen werden unterschiedlich gespeichert und können nach der Umwandlung anders eingerückt sein.\n- **Tabellen und Textrahmen:** Verschachtelte Tabellen oder frei positionierte Rahmen sind die häufigste Quelle für Layoutabweichungen.\n- **Felder und Verzeichnisse:** Inhaltsverzeichnisse sollten Sie nach der Umwandlung in Word einmal aktualisieren.\n- **Änderungsverfolgung und Kommentare:** Nicht jedes Programm überträgt sie. Nehmen Sie Änderungen vor der Umwandlung an und löschen Sie Kommentare, die nicht weitergegeben werden sollen.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Windows zeigt ein unbekanntes Symbol:** Es ist kein Programm mit der Endung .odt verknüpft. Öffnen Sie Word oder LibreOffice und laden Sie die Datei über „Datei > Öffnen“, oder legen Sie per Rechtsklick „Öffnen mit“ ein Standardprogramm fest.\n- **Word meldet einen Fehler:** Die Datei ist eventuell beschädigt oder stammt aus einer sehr neuen LibreOffice-Version mit Funktionen, die Word nicht kennt. Eine Umwandlung in PDF zeigt zumindest den Inhalt.\n- **Datei heißt .fodt:** Das ist eine „flache“ ODT-Variante als einzelne XML-Datei. LibreOffice öffnet sie problemlos.\n- **Präsentation statt Text:** Endet die Datei auf .odp, handelt es sich um eine Präsentation. Dafür gibt es den Konverter für ODP in PPTX.'
      }
    ],
    faqs: [
      { question: 'Kann Word ODT-Dateien öffnen?', answer: 'Ja, aktuelle Word-Versionen öffnen und speichern ODT-Dateien. Bei einfachen Dokumenten klappt das zuverlässig, bei komplexen Layouts mit Rahmen, speziellen Listen oder Feldern kann die Darstellung abweichen.' },
      { question: 'Ist ODT dasselbe wie DOCX?', answer: 'Nein. Beide sind XML-basierte Formate in einem ZIP-Container, folgen aber unterschiedlichen Standards. ODT ist der offene OpenDocument-Standard, DOCX das Office-Open-XML-Format von Microsoft.' },
      { question: 'Wie öffne ich eine ODT-Datei am iPhone?', answer: 'Viele iPhone-Apps können ODT nicht direkt anzeigen. Am einfachsten wandeln Sie die Datei im Browser in PDF um und öffnen das PDF anschließend in der Dateien-App.' },
      { question: 'Gehen bei der Umwandlung Inhalte verloren?', answer: 'Der Text bleibt erhalten. Formatierungen wie Schriften, mehrstufige Listen oder Textrahmen können sich jedoch verändern. Prüfen Sie wichtige Dokumente deshalb nach der Umwandlung und behalten Sie das Original.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'csv-in-excel-umwandeln-umlaute',
    title: 'CSV in Excel umwandeln: Umlaute, Trennzeichen und Nullen retten',
    metaTitle: 'CSV in Excel umwandeln – ohne kaputte Umlaute',
    metaDescription: 'CSV in Excel umwandeln ohne Ã¤ statt ä, falsche Spalten oder verlorene Nullen: So klappt es mit UTF-8 und Semikolon – kostenlos, ohne Upload.',
    h1: 'CSV in Excel umwandeln: So vermeiden Sie Umlaut-Chaos und falsche Spalten',
    excerpt: 'Doppelklick auf die CSV-Datei – und plötzlich steht alles in einer Spalte, aus „Müller“ wird „MÃ¼ller“ und die Postleitzahl 01067 heißt 1067. Hier erfahren Sie, warum das passiert und wie Sie es dauerhaft vermeiden.',
    category: 'documents',
    primaryKeyword: 'csv in excel umwandeln',
    secondaryKeywords: ['csv umlaute excel', 'csv utf-8 excel', 'csv semikolon komma', 'csv in xlsx', 'führende nullen csv excel'],
    searchIntent: 'transactional',
    primaryToolSlug: 'csv-in-xlsx-umwandeln',
    ctaHeadline: 'CSV jetzt kostenlos in eine Excel-Datei umwandeln',
    ctaButtonLabel: 'CSV in XLSX umwandeln',
    relatedToolSlugs: ['xlsx-in-csv-umwandeln', 'csv-in-json-umwandeln', 'csv-in-pdf-umwandeln'],
    relatedArticleSlugs: ['pdf-in-excel-tabellen-uebernehmen', 'excel-in-pdf-umwandeln-tabellen', 'json-formatieren-und-validieren', 'odt-dateien-oeffnen-und-umwandeln'],
    directAnswer: 'Damit eine CSV-Datei in Excel korrekt erscheint, importieren Sie sie über „Daten > Aus Text/CSV“, wählen als Dateiursprung „65001: Unicode (UTF-8)“ und das passende Trennzeichen. Spalten wie Postleitzahlen oder Artikelnummern setzen Sie auf „Text“, damit führende Nullen erhalten bleiben. Alternativ wandeln Sie die CSV in eine XLSX-Datei um, etwa mit einem Browser-Konverter, der Trennzeichen und Zeichensatz automatisch erkennt.',
    steps: [
      { step: 1, title: 'CSV-Datei kurz ansehen', text: 'Öffnen Sie die Datei in einem einfachen Texteditor. So sehen Sie sofort, ob Semikolon, Komma oder Tabulator als Trennzeichen dient und ob Umlaute korrekt dargestellt werden.' },
      { step: 2, title: 'Datei im Konverter auswählen', text: 'Ziehen Sie die CSV-Datei in den CSV-in-XLSX-Konverter. Die Datei wird lokal im Browser gelesen und nicht übertragen.' },
      { step: 3, title: 'Automatische Erkennung prüfen', text: 'Trennzeichen und Zeichensatz erkennt der Konverter selbst. Kontrollieren Sie im Ergebnis, ob die Spalten korrekt getrennt und Umlaute richtig dargestellt sind.' },
      { step: 4, title: 'XLSX speichern und Spalten kontrollieren', text: 'Öffnen Sie die XLSX-Datei in Excel und prüfen Sie besonders Postleitzahlen, lange Nummern und Datumswerte.' }
    ],
    sections: [
      {
        heading: 'Warum öffnet Excel CSV-Dateien oft falsch?',
        content: 'Excel öffnet CSV-Dateien oft falsch, weil das Format weder Zeichensatz noch Trennzeichen festlegt. CSV steht für „Comma-Separated Values“: eine reine Textdatei, in der jede Zeile ein Datensatz ist und die Werte durch ein Trennzeichen getrennt sind. Das Format ist simpel, aber es fehlt jede Angabe dazu, welcher Zeichensatz verwendet wurde und welches Trennzeichen gilt. Excel muss raten – und rät beim Doppelklick nach den Regionaleinstellungen von Windows.\n\nIn Deutschland ist das Komma das Dezimaltrennzeichen. Deshalb erwartet ein deutsches Excel beim Doppelklick ein **Semikolon** als Spaltentrenner. Kommt die Datei aus einem englischsprachigen System mit Kommas, landet alles in Spalte A. Beim Zeichensatz nimmt Excel ohne weitere Hinweise oft eine ältere Windows-Codierung an. Ist die Datei aber in **UTF-8** gespeichert, wie es bei Webanwendungen und Shops üblich ist, werden Umlaute zu Zeichenfolgen wie „Ã¤“ oder „Ã¼“. Die Daten selbst sind nicht beschädigt, sie werden nur falsch interpretiert.'
      },
      {
        heading: 'CSV richtig in Excel importieren: so geht’s',
        content: 'Der Importassistent ist der sichere Weg, weil Sie dort Zeichensatz, Trennzeichen und Spaltentypen selbst festlegen:\n\n1. Excel öffnen, eine leere Arbeitsmappe anlegen.\n2. „Daten > Aus Text/CSV“ wählen und die Datei auswählen.\n3. Unter „Dateiursprung“ den Eintrag „65001: Unicode (UTF-8)“ wählen, falls Umlaute falsch aussehen.\n4. Beim Trennzeichen Semikolon, Komma oder Tabstopp einstellen, bis die Vorschau stimmt.\n5. Auf „Daten transformieren“ klicken und Spalten wie PLZ, Kundennummer oder IBAN auf den Typ „Text“ setzen.\n6. „Schließen & laden“ – fertig.\n\nIn älteren Excel-Versionen heißt der Weg „Daten > Externe Daten abrufen > Aus Text“. Das Prinzip ist dasselbe. Unter macOS bietet Excel einen ähnlichen Import über „Datei > Importieren“.'
      },
      {
        heading: 'Wie bleiben führende Nullen und lange Nummern erhalten?',
        content: 'Führende Nullen und lange Nummern bleiben nur erhalten, wenn die Spalte als Text importiert wird. Neben Umlauten gibt es drei Klassiker, die beim Öffnen unbemerkt Daten verfälschen:\n\n- **Führende Nullen:** Postleitzahlen wie 01067 (Dresden) oder Artikelnummern wie 000123 werden als Zahl gelesen und verlieren ihre Nullen. Lösung: Spalte als Text importieren.\n- **Lange Nummern:** Excel speichert Zahlen mit höchstens 15 signifikanten Stellen. Längere Ziffernfolgen, etwa Kartennummern oder EAN-Codes mit Zusatz, erscheinen in Exponentialschreibweise oder verlieren die letzten Ziffern. Auch hier hilft nur der Texttyp.\n- **Automatische Datumswerte:** Einträge wie „1-2“ oder „3.4“ verwandelt Excel gern in ein Datum. Wer Größen, Versionsnummern oder Hausnummern-Zusätze importiert, sollte die Spalte ebenfalls als Text festlegen.\n\nWichtig: Wurde die Datei einmal falsch geöffnet und wieder als CSV gespeichert, sind die Nullen dauerhaft verloren. Arbeiten Sie deshalb immer mit einer Kopie der Originaldatei.'
      },
      {
        heading: 'CSV ohne Importassistent in XLSX umwandeln',
        content: 'Eine XLSX-Datei speichert Spaltenaufteilung und Datentypen fest, sodass die Tabelle auf jedem Rechner gleich aussieht. Wenn Sie nicht jedes Mal den Importassistenten nutzen möchten oder kein Excel installiert haben, wandeln Sie die CSV mit dem [CSV-in-XLSX-Konverter](tool:csv-in-xlsx-umwandeln) direkt in eine Arbeitsmappe um:\n\n- **Trennzeichen:** Semikolon, Komma, Tabulator oder senkrechter Strich werden automatisch erkannt.\n- **Zeichensatz:** UTF-8 mit oder ohne BOM, UTF-16 und die ältere Windows-Codierung (Windows-1252) werden erkannt, Umlaute bleiben korrekt.\n- **Datentypen:** Werte mit führender Null, Ziffernfolgen ab 16 Stellen und Werte in Anführungszeichen bleiben Text. Zahlen wie 1.234,56 werden als Zahl gespeichert, eine automatische Umwandlung in Datumswerte findet nicht statt.\n\nCSV-Exporte enthalten häufig personenbezogene Daten wie Kundenlisten oder Mitgliederverzeichnisse. Der Konverter verarbeitet die Datei im Browser, die Daten bleiben auf Ihrem Gerät. Für Entwickler und Datenaufbereitung gibt es zusätzlich den [CSV-in-JSON-Konverter](tool:csv-in-json-umwandeln); wie Sie das Ergebnis prüfen, steht im Beitrag [JSON formatieren und validieren](blog:json-formatieren-und-validieren).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: 'Die meisten CSV-Probleme in Excel lassen sich einer von wenigen Ursachen zuordnen:\n\n| Problem | Ursache | Lösung |\n|---|---|---|\n| Alles steht in Spalte A | Trennzeichen passt nicht zur Regionaleinstellung | Import mit passendem Trennzeichen |\n| „Ã¤“ statt „ä“ | UTF-8-Datei mit älterem Zeichensatz gelesen | Dateiursprung „65001: Unicode (UTF-8)“ |\n| Fragezeichen statt Umlaut | Zeichen schon beim Export verloren | Neu als UTF-8 exportieren |\n| 01067 wird zu 1067 | Spalte als Zahl gelesen | Spaltentyp „Text“ |\n| Lange Nummer in E-Schreibweise | als Zahl gelesen, nur 15 Stellen genau | Spaltentyp „Text“ |\n\nWeitere Stolpersteine:\n\n- **Zeilen sind zerrissen:** Ein Feld enthält einen Zeilenumbruch, ist aber nicht in Anführungszeichen gesetzt. Das muss im Quellsystem korrigiert werden.\n- **Zurück nach CSV für einen Import:** Viele Shops und Tools erwarten UTF-8 mit Komma. Excel bietet beim Speichern die Variante „CSV UTF-8 (durch Trennzeichen getrennt)“. Wer Excel nicht nutzt, nimmt den Konverter für XLSX in CSV und wählt dort Semikolon, Komma oder Tabulator sowie auf Wunsch UTF-8 mit BOM.\n\nLiegen Ihre Tabellen nicht als CSV, sondern nur als PDF vor, hilft der Artikel [PDF in Excel umwandeln](blog:pdf-in-excel-tabellen-uebernehmen) weiter.'
      }
    ],
    faqs: [
      { question: 'Warum zeigt Excel bei meiner CSV „Ã¤“ statt „ä“?', answer: 'Die Datei ist in UTF-8 gespeichert, Excel hat sie aber mit einem älteren Zeichensatz geöffnet. Importieren Sie die Datei über „Daten > Aus Text/CSV“ und wählen Sie als Dateiursprung UTF-8, oder wandeln Sie sie direkt in XLSX um.' },
      { question: 'Semikolon oder Komma – was ist richtig?', answer: 'Beides ist zulässig. Deutsche Excel-Versionen erwarten wegen des Dezimalkommas meist ein Semikolon, internationale Systeme ein Komma. Entscheidend ist, dass Sie beim Import das tatsächlich verwendete Trennzeichen angeben.' },
      { question: 'Wie behalte ich führende Nullen bei Postleitzahlen?', answer: 'Setzen Sie die betreffende Spalte beim Import auf den Datentyp „Text“. Öffnen Sie die CSV nicht per Doppelklick, denn dann wandelt Excel die Werte sofort in Zahlen um.' },
      { question: 'Ist eine XLSX-Datei besser als eine CSV?', answer: 'Für die Arbeit in Excel ja, weil Formatierungen, mehrere Blätter und Formeln gespeichert werden. Für den Datenaustausch zwischen Programmen ist CSV oft die bessere Wahl, da fast jede Software sie lesen kann.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'epub-in-pdf-umwandeln',
    title: 'EPUB in PDF umwandeln: Was geht, was nicht und was erlaubt ist',
    metaTitle: 'EPUB in PDF umwandeln: Anleitung und DRM-Hinweise',
    metaDescription: 'EPUB in PDF umwandeln zum Drucken oder Lesen auf jedem Gerät: kostenlos im Browser ohne Upload. Mit ehrlichen Hinweisen zu Layout und Kopierschutz.',
    h1: 'EPUB in PDF umwandeln: Anleitung, Grenzen und rechtliche Hinweise',
    excerpt: 'E-Books im EPUB-Format passen sich an jeden Bildschirm an, lassen sich aber schlecht drucken oder kommentieren. So wandeln Sie DRM-freie EPUBs in PDF um und erfahren, warum geschützte E-Books außen vor bleiben.',
    category: 'documents',
    primaryKeyword: 'epub in pdf umwandeln',
    secondaryKeywords: ['epub als pdf speichern', 'e-book in pdf', 'epub drucken', 'epub öffnen ohne reader', 'epub konvertieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'epub-in-pdf-umwandeln',
    ctaHeadline: 'DRM-freies EPUB jetzt kostenlos in PDF umwandeln',
    ctaButtonLabel: 'EPUB in PDF umwandeln',
    relatedToolSlugs: ['epub-in-txt-umwandeln', 'pdf-komprimieren', 'pdf-seiten-extrahieren'],
    relatedArticleSlugs: ['pdf-umwandeln-welche-formate-eignen-sich', 'pdf-datei-verkleinern', 'odt-dateien-oeffnen-und-umwandeln', 'woerter-und-zeichen-zaehlen'],
    directAnswer: 'Ein DRM-freies EPUB wandeln Sie in PDF um, indem Sie die Datei in einem EPUB-in-PDF-Konverter öffnen; Datei Tools erledigt das lokal im Browser. Weil EPUB-Text fließt und PDF feste Seiten hat, wird das Layout dabei neu umbrochen. Kopiergeschützte E-Books lassen sich nicht umwandeln, und das Umgehen des Schutzes ist in Deutschland nicht erlaubt.',
    steps: [
      { step: 1, title: 'Prüfen, ob das E-Book DRM-frei ist', text: 'Freie E-Books, eigene Texte oder Titel mit Wasserzeichen sind in der Regel nicht hart geschützt. Lässt sich das EPUB nur in einer bestimmten Lese-App öffnen, ist es vermutlich kopiergeschützt.' },
      { step: 2, title: 'EPUB-Datei auswählen', text: 'Öffnen Sie den EPUB-in-PDF-Konverter und ziehen Sie die Datei hinein. Sie wird im Browser gelesen und nicht übertragen.' },
      { step: 3, title: 'PDF erzeugen lassen', text: 'Der Konverter setzt den Fließtext auf DIN-A4-Seiten. Bei umfangreichen Büchern mit vielen Bildern kann das auf langsameren Geräten etwas dauern.' },
      { step: 4, title: 'PDF prüfen und speichern', text: 'Blättern Sie das Ergebnis durch, achten Sie auf Kapitelanfänge, Bilder und Sonderzeichen und speichern Sie das PDF.' }
    ],
    sections: [
      {
        heading: 'Was unterscheidet EPUB von PDF?',
        content: 'EPUB ist ein offenes E-Book-Format mit fließendem Text, PDF ein Format mit festen Seiten. Im Kern besteht ein EPUB aus HTML-Seiten, Stylesheets und Bildern, verpackt in einem ZIP-Container. Der Text ist **umbrechbar**: Der E-Reader entscheidet je nach Bildschirmgröße und gewählter Schrift, wie viel auf eine Seite passt. Es gibt daher keine festen Seitenzahlen.\n\nPDF ist das Gegenteil: Jede Seite hat ein festes Format, und jedes Element sitzt an einer festen Position. Das macht PDFs ideal zum Drucken, Zitieren mit Seitenangabe und Kommentieren, aber unhandlich auf kleinen Smartphone-Displays.\n\nBei der Umwandlung muss der Konverter also Entscheidungen treffen, die beim EPUB der Reader trifft: Seitengröße, Ränder, Schriftgröße. Das Ergebnis ist ein lesbares PDF, sieht aber nicht aus wie eine gedruckte Buchausgabe. Fixed-Layout-EPUBs, wie sie bei Bilderbüchern oder Comics vorkommen, sind auf feste Seiten gestaltet; ein Konverter, der den Text neu umbricht, gibt diese Gestaltung nur eingeschränkt wieder.'
      },
      {
        heading: 'Welche E-Books darf ich in PDF umwandeln?',
        content: 'Umwandeln dürfen und können Sie nur E-Books ohne harten Kopierschutz. Viele gekaufte E-Books sind mit einem solchen Kopierschutz (DRM) versehen, etwa Adobe DRM oder herstellerspezifischen Verfahren. Solche Dateien sind verschlüsselt und lassen sich nur in autorisierten Apps öffnen. Ein Konverter kann sie nicht lesen – und das Umgehen wirksamer technischer Schutzmaßnahmen ist in Deutschland nach § 95a Urheberrechtsgesetz verboten, auch für den privaten Gebrauch.\n\nUmwandeln können Sie dagegen:\n\n- E-Books ohne DRM, zum Beispiel gemeinfreie Klassiker aus freien Bibliotheken\n- eigene Texte, die Sie als EPUB exportiert haben\n- Titel mit „weichem“ DRM, also einem personalisierten Wasserzeichen – hier gilt aber: nur für den eigenen Gebrauch, keine Weitergabe\n\nKindle-Bücher von Amazon liegen übrigens meist gar nicht als EPUB vor, sondern in eigenen Formaten, und sind fast immer geschützt.'
      },
      {
        heading: 'EPUB im Browser in PDF umwandeln: Was passiert dabei?',
        content: 'Der [EPUB-in-PDF-Konverter](tool:epub-in-pdf-umwandeln) von Datei Tools erzeugt das PDF direkt in Ihrem Browser, das E-Book bleibt auf Ihrem Gerät. Dabei gilt:\n\n- Kapitel, Überschriften, Absätze, Listen, Tabellen und Bilder werden auf DIN-A4-Seiten mit Seitenzahlen gesetzt.\n- Das CSS-Layout des E-Books, also Schriftarten, Farben und Abstände, wird nicht übernommen; der Text erscheint in einer Standardschrift.\n- Zeichen außerhalb des westeuropäischen Zeichensatzes, etwa griechische oder kyrillische Buchstaben, werden ersetzt.\n- Ist ein E-Book DRM-geschützt, bricht der Konverter mit einem Hinweis ab.\n\nBenötigen Sie den reinen Text, etwa für eine Analyse oder um den Umfang festzustellen, ist der [EPUB-in-TXT-Konverter](tool:epub-in-txt-umwandeln) die schlankere Wahl. Wörter und Zeichen zählen Sie anschließend wie im Beitrag [Wörter und Zeichen zählen](blog:woerter-und-zeichen-zaehlen) beschrieben. Bilderreiche E-Books können als PDF recht groß werden. Tipps zur Verkleinerung finden Sie unter [PDF-Datei verkleinern](blog:pdf-datei-verkleinern).'
      },
      {
        heading: 'EPUB lesen ohne Umwandlung: welche Alternativen gibt es?',
        content: 'Zum bloßen Lesen eines EPUB brauchen Sie kein PDF, sondern nur eine passende App: Am iPhone, iPad und Mac öffnet Apple Books EPUB-Dateien direkt. Unter Android gibt es zahlreiche kostenlose Reader, und auch Google Play Bücher kann eigene, DRM-freie EPUBs importieren. Unter Windows ist die Auswahl kleiner; hier helfen kostenlose Reader-Programme.\n\nWer regelmäßig E-Books konvertiert, greift häufig zum kostenlosen Desktop-Programm Calibre, das zahlreiche Formate beherrscht und viele Einstellungen für Seitengröße und Ränder bietet. Für eine schnelle, einmalige Umwandlung ohne Installation ist der Browser-Weg bequemer.\n\nEinen Überblick, in welche Richtungen sich PDFs generell umwandeln lassen, gibt der Artikel [PDF umwandeln: Welche Formate eignen sich?](blog:pdf-umwandeln-welche-formate-eignen-sich).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Datei lässt sich nicht öffnen:** Meist ist das EPUB kopiergeschützt oder beschädigt. Eine geschützte Datei lässt sich nur in der vorgesehenen App lesen.\n- **Format passt nicht zum Lesegerät:** Der Browser-Konverter setzt das E-Book auf DIN-A4-Seiten. Brauchen Sie ein kleineres Seitenformat, etwa für ein Tablet, bietet Calibre entsprechende Einstellungen.\n- **Bilder sind verschoben:** Bilder, die im EPUB frei fließen, landen im PDF manchmal auf der nächsten Seite. Das ist eine Folge des festen Seitenlayouts.\n- **Sonderzeichen erscheinen falsch:** Zeichen außerhalb des westeuropäischen Zeichensatzes werden ersetzt. Prüfen Sie besonders Texte mit mathematischen Symbolen oder fremden Schriftsystemen.\n- **Inhaltsverzeichnis nicht anklickbar:** Das PDF enthält keine Lesezeichen, und Verweise innerhalb des Buchs sind nicht anklickbar. Navigieren Sie über die Seitenzahlen oder nutzen Sie zum Lesen eine EPUB-App.'
      }
    ],
    faqs: [
      { question: 'Kann ich gekaufte E-Books in PDF umwandeln?', answer: 'Nur wenn sie keinen harten Kopierschutz haben. E-Books mit DRM sind verschlüsselt und können nicht konvertiert werden. Das Entfernen des Schutzes ist nach deutschem Urheberrecht unzulässig.' },
      { question: 'Warum stimmen die Seitenzahlen nicht mit dem gedruckten Buch überein?', answer: 'Ein EPUB hat keine festen Seiten. Der Konverter umbricht den Text neu, deshalb entstehen andere Seitenzahlen als in der Printausgabe. Für Zitate mit Seitenangabe sollten Sie die gedruckte Ausgabe verwenden.' },
      { question: 'Bleiben Bilder und Kapitel erhalten?', answer: 'Bilder, Kapitel und Überschriften werden übernommen. Die Platzierung von Bildern kann sich durch den festen Seitenumbruch verschieben, und das PDF enthält keine anklickbaren Lesezeichen für die Kapitel.' },
      { question: 'Funktioniert die Umwandlung auch am Smartphone?', answer: 'Ja, der Konverter läuft in einem aktuellen Browser auch auf iPhone und Android. Bei umfangreichen, bildreichen E-Books ist ein Computer meist schneller, weil die Umwandlung auf dem Gerät selbst stattfindet.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'docx-vs-doc-unterschied',
    title: 'DOCX oder DOC? Die Unterschiede einfach erklärt',
    metaTitle: 'DOCX vs. DOC: Unterschied der Word-Formate',
    metaDescription: 'DOCX oder DOC? Wir erklären den Unterschied der Word-Formate, Kompatibilität, Makro-Risiken und wie Sie alte DOC-Dateien kostenlos ohne Upload umwandeln.',
    h1: 'DOCX vs. DOC: Was unterscheidet die beiden Word-Formate?',
    excerpt: 'Word speichert seit vielen Jahren standardmäßig als DOCX, trotzdem tauchen alte DOC-Dateien immer wieder auf. Wir erklären die technischen Unterschiede, wann welches Format sinnvoll ist und wie Sie sicher umwandeln.',
    category: 'formats',
    primaryKeyword: 'docx doc unterschied',
    secondaryKeywords: ['was ist docx', 'doc in docx umwandeln', 'docx oder doc', 'word kompatibilitätsmodus', 'docx in doc speichern'],
    searchIntent: 'informational',
    primaryToolSlug: 'doc-in-docx-umwandeln',
    ctaHeadline: 'Alte DOC-Datei jetzt kostenlos in DOCX umwandeln',
    ctaButtonLabel: 'DOC in DOCX umwandeln',
    relatedToolSlugs: ['docx-in-doc-umwandeln', 'doc-in-pdf-umwandeln', 'docx-in-odt-umwandeln'],
    relatedArticleSlugs: ['odt-dateien-oeffnen-und-umwandeln', 'pdf-in-word-docx-oder-doc', 'word-in-pdf-umwandeln-anleitung', 'zip-7z-rar-unterschiede'],
    directAnswer: 'DOC ist das binäre Dateiformat von Word 97 bis 2003, DOCX das seit Word 2007 verwendete Office-Open-XML-Format aus XML-Dateien in einem ZIP-Container. DOCX-Dateien sind meist kleiner, offen genormt und können keine Makros enthalten; DOC brauchen Sie nur noch für sehr alte Software, die DOCX nicht lesen kann.',
    steps: [
      { step: 1, title: 'Format erkennen', text: 'Lassen Sie sich im Explorer oder Finder die Dateiendungen anzeigen. Endet die Datei auf .doc, handelt es sich um das alte Binärformat.' },
      { step: 2, title: 'DOC-Datei auswählen', text: 'Öffnen Sie den DOC-in-DOCX-Konverter und ziehen Sie die Datei hinein. Die Umwandlung erfolgt lokal in Ihrem Browser.' },
      { step: 3, title: 'DOCX speichern', text: 'Speichern Sie die neue DOCX-Datei unter einem eindeutigen Namen und behalten Sie das Original, bis Sie das Ergebnis geprüft haben.' },
      { step: 4, title: 'In Word kontrollieren', text: 'Öffnen Sie die DOCX-Datei und prüfen Sie Tabellen und Nummerierungen sowie, ob Bilder, Kopfzeilen oder Fußnoten fehlen. Aktualisieren Sie Inhaltsverzeichnisse bei Bedarf.' }
    ],
    sections: [
      {
        heading: 'Was ist eine DOC-Datei?',
        content: 'Eine DOC-Datei ist ein Word-Dokument im alten binären Format, das über viele Word-Generationen der Standard war. Seine endgültige Form erhielt es mit Word 97 und blieb bis Word 2003 im Einsatz. Technisch handelt es sich um ein **binäres** Format: Text, Formatierung und eingebettete Objekte sind in einer komplexen, von Microsoft lange nur teilweise dokumentierten Struktur abgelegt.\n\nDas hatte Nachteile. Andere Programme mussten das Format durch Analyse nachbauen, was oft zu Darstellungsfehlern führte. Beschädigte DOC-Dateien sind schwer zu retten, weil schon ein defektes Byte die Struktur durcheinanderbringen kann. Und DOC-Dateien können Makros enthalten, also kleine Programme in VBA. Über solche Makros wurden in der Vergangenheit zahlreiche Schadprogramme verbreitet. Eine unerwartete DOC-Datei im E-Mail-Anhang verdient deshalb bis heute besondere Vorsicht.'
      },
      {
        heading: 'Was ist der Unterschied zwischen DOC und DOCX?',
        content: 'DOCX ist das XML-basierte Nachfolgeformat von DOC, das Microsoft mit Word 2007 eingeführt hat. Die wichtigsten Unterschiede im Überblick:\n\n| Merkmal | DOC | DOCX |\n|---|---|---|\n| Standardformat | Word 97 bis 2003 | seit Word 2007 |\n| Aufbau | binär | XML-Dateien im ZIP-Container |\n| Normierung | Herstellerformat | ECMA-376, ISO/IEC 29500 |\n| Makros | möglich | nicht möglich (dafür .docm) |\n| Dateigröße | größer | meist kleiner |\n\nEine DOCX-Datei ist im Grunde ein ZIP-Archiv. Benennen Sie eine Kopie testweise in .zip um und öffnen Sie sie, sehen Sie Ordner mit XML-Dateien für Text, Stile und Einstellungen sowie einen Ordner mit den eingebetteten Bildern. Wie solche Archivformate funktionieren, erklärt der Artikel [ZIP, 7z und RAR im Vergleich](blog:zip-7z-rar-unterschiede).\n\nDaraus ergeben sich mehrere Vorteile:\n\n- **Kleinere Dateien:** Durch die ZIP-Kompression sind DOCX-Dateien meist kleiner als vergleichbare DOC-Dateien.\n- **Robuster:** Ist ein Teil beschädigt, lassen sich andere Teile oft noch retten.\n- **Keine Makros:** Eine DOCX-Datei kann keine Makros ausführen. Dokumente mit Makros tragen die Endung .docm, was die Gefahr leichter erkennbar macht.\n- **Bessere Kompatibilität:** Andere Programme wie LibreOffice oder Google Docs können das dokumentierte Format zuverlässiger lesen.'
      },
      {
        heading: 'Wann braucht man heute noch das DOC-Format?',
        content: 'Im Alltag gibt es kaum noch Gründe, Dokumente als DOC zu speichern. Alle Word-Versionen seit 2007 öffnen DOCX nativ, ebenso LibreOffice, Google Docs, Pages und Word für iPhone und Android. Ausnahmen sind:\n\n- sehr alte Branchensoftware oder Formularsysteme, die nur DOC importieren\n- Arbeitsplätze mit Word 2003 oder älter, auf denen kein Kompatibilitätspaket installiert ist\n- Ausschreibungen oder Portale, die ausdrücklich DOC verlangen\n\nSpeichern Sie in Word als „Word 97–2003-Dokument“, werden Funktionen, die es in alten Versionen noch nicht gab, etwa bestimmte Diagrammtypen oder neue Formeleditor-Inhalte, vereinfacht oder in Grafiken umgewandelt; ein Rückweg ohne Verlust ist dann nicht mehr möglich. Der [DOCX-in-DOC-Konverter](tool:docx-in-doc-umwandeln) von Datei Tools speichert das Dokument im Rich Text Format (RTF) mit der Endung .doc. Word und LibreOffice öffnen solche Dateien wie ein Word-97–2003-Dokument; Überschriften, Listen, Tabellen und Bilder bleiben erhalten, Kopf- und Fußzeilen nicht. Verlangt ein System streng das binäre DOC-Format, ist der Export aus Word der sicherere Weg.\n\nWer Dokumente an Personen mit LibreOffice weitergibt, kann auch das offene Format ODT nutzen. Mehr dazu im Beitrag [ODT-Dateien öffnen und umwandeln](blog:odt-dateien-oeffnen-und-umwandeln).'
      },
      {
        heading: 'Wie wandle ich DOC in DOCX um?',
        content: 'Am vollständigsten wandeln Sie DOC in DOCX direkt in Word um. Öffnen Sie eine DOC-Datei in einer aktuellen Word-Version, erscheint in der Titelleiste der Hinweis „Kompatibilitätsmodus“, und neue Funktionen sind gesperrt. Über „Datei > Informationen > Konvertieren“ wandelt Word das Dokument in das aktuelle Format um; anschließend speichern Sie es als DOCX.\n\nOhne Word geht es mit dem [DOC-in-DOCX-Konverter](tool:doc-in-docx-umwandeln) von Datei Tools, der lokal im Browser arbeitet. Er überträgt Text, Überschriften, Listen, Tabellen und Grundformatierung wie Fett, Kursiv und Ausrichtung. Bilder, Textfelder, Kopf- und Fußzeilen sowie Fußnoten übernimmt er nicht. Für reine Textdokumente aus alten Archivbeständen, etwa Verträge oder Gutachten, reicht das oft; bei bebilderten Dokumenten ist Word oder LibreOffice die bessere Wahl.\n\nSoll das Dokument ohnehin nicht mehr bearbeitet werden, ist PDF oft das bessere Ziel. Wie es um die Rückrichtung steht, erklärt der Artikel [PDF in Word: DOCX oder DOC?](blog:pdf-in-word-docx-oder-doc).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Word öffnet die DOC-Datei nur in der geschützten Ansicht:** Das ist eine Sicherheitsfunktion für Dateien aus dem Internet oder E-Mail-Anhängen. Aktivieren Sie die Bearbeitung nur, wenn Sie dem Absender vertrauen.\n- **Makros fehlen nach der Umwandlung:** Beim Speichern als DOCX werden Makros entfernt. Wer sie benötigt, speichert als DOCM.\n- **Layout verschiebt sich leicht:** Alte DOC-Dateien wurden mit anderen Standardschriften und Abständen erstellt. Kleine Abweichungen in Zeilenumbrüchen sind normal.\n- **Datei wird nicht erkannt:** Manchmal ist eine Datei mit Endung .doc in Wahrheit eine RTF- oder HTML-Datei. Word öffnet sie trotzdem, und die Konverter von Datei Tools erkennen solche Dateien am Inhalt statt an der Endung.'
      }
    ],
    faqs: [
      { question: 'Was ist der Hauptunterschied zwischen DOC und DOCX?', answer: 'DOC ist ein binäres Format aus der Zeit von Word 97 bis 2003. DOCX basiert auf XML-Dateien in einem ZIP-Container, ist dokumentiert, meist kleiner und kann keine Makros enthalten.' },
      { question: 'Kann jedes Word-Programm DOCX öffnen?', answer: 'Alle Word-Versionen ab 2007 öffnen DOCX ohne Zusatz. Für Word 2003 gab es ein Kompatibilitätspaket von Microsoft. Auch LibreOffice, Google Docs und Pages lesen DOCX.' },
      { question: 'Gehen beim Umwandeln von DOC in DOCX Inhalte verloren?', answer: 'Bei der Umwandlung in Word bleiben Text, Bilder und Formatierungen in der Regel erhalten, nur Makros werden entfernt. Der Browser-Konverter von Datei Tools überträgt Text, Tabellen, Listen und Grundformatierung, aber keine Bilder, Textfelder, Kopf- und Fußzeilen oder Fußnoten. Behalten Sie das Original, bis Sie das Ergebnis geprüft haben.' },
      { question: 'Sind DOC-Dateien gefährlich?', answer: 'Nicht grundsätzlich, aber sie können Makros enthalten, die beim Öffnen Schaden anrichten können. Öffnen Sie unerwartete DOC-Anhänge nur, wenn Sie den Absender kennen, und aktivieren Sie Makros nie ungeprüft.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'webp-vs-png-unterschied',
    title: 'WebP oder PNG? Welches Format wann die bessere Wahl ist',
    metaTitle: 'WebP vs. PNG: Unterschiede, Vor- und Nachteile',
    metaDescription: 'WebP vs. PNG: Wie unterscheiden sich Kompression, Transparenz und Kompatibilität? Mit Praxisempfehlungen und kostenloser Umwandlung ohne Upload.',
    h1: 'WebP vs. PNG: Kompression, Transparenz und Kompatibilität im Vergleich',
    excerpt: 'PNG gilt als sicherer Standard für Grafiken mit Transparenz, WebP als modernes Web-Format. Wir zeigen, worin sich beide technisch unterscheiden und wann Sie zu welchem greifen sollten.',
    category: 'formats',
    primaryKeyword: 'webp vs png',
    secondaryKeywords: ['webp oder png', 'webp png unterschied', 'png in webp umwandeln', 'webp transparenz', 'webp verlustfrei'],
    searchIntent: 'informational',
    primaryToolSlug: 'png-in-webp-umwandeln',
    ctaHeadline: 'PNG jetzt kostenlos in WebP umwandeln',
    ctaButtonLabel: 'PNG in WebP umwandeln',
    relatedToolSlugs: ['webp-in-png-umwandeln', 'jpg-in-webp-umwandeln', 'bild-komprimieren', 'svg-in-png-umwandeln'],
    relatedArticleSlugs: ['webp-oder-jpg-unterschiede-qualitaet-dateigroesse', 'jpg-oder-png-welches-bildformat-ist-besser', 'webp-bild-als-jpg-speichern', 'svg-in-png-umwandeln-anleitung', 'favicon-erstellen-png-in-ico'],
    directAnswer: 'PNG speichert Bilder immer verlustfrei und wird von praktisch jeder Software unterstützt. WebP kann sowohl verlustfrei als auch verlustbehaftet komprimieren, unterstützt ebenfalls Transparenz und Animation und erzeugt meist kleinere Dateien. Für Websites ist WebP oft die bessere Wahl, für Bearbeitung, Druckvorlagen und den Austausch mit älteren Programmen bleibt PNG sicherer.',
    steps: [
      { step: 1, title: 'Verwendungszweck klären', text: 'Soll das Bild auf einer Website erscheinen, lohnt sich WebP. Wird es weiterbearbeitet, gedruckt oder in Office-Dokumente eingefügt, ist PNG meist praktischer.' },
      { step: 2, title: 'PNG-Datei auswählen', text: 'Öffnen Sie den PNG-in-WebP-Konverter und ziehen Sie ein oder mehrere Bilder hinein. Die Verarbeitung erfolgt im Browser.' },
      { step: 3, title: 'Qualität einstellen', text: 'Stellen Sie die Bildqualität mit dem Regler ein. Für Logos und Screenshots mit Text sind hohe Werte sinnvoll, für Fotos genügen mittlere. Safari kann im Browser keine WebP-Dateien erzeugen; nutzen Sie dafür Chrome, Edge oder Firefox.' },
      { step: 4, title: 'Ergebnis vergleichen', text: 'Vergleichen Sie Dateigröße und Bildeindruck mit dem Original, besonders an Kanten, Schrift und transparenten Bereichen.' }
    ],
    sections: [
      {
        heading: 'Was zeichnet das PNG-Format aus?',
        content: 'PNG (Portable Network Graphics) ist ein verlustfreies Bildformat mit Transparenz, das in den 1990er-Jahren als freie Alternative zu GIF entwickelt wurde. Es komprimiert **immer verlustfrei**: Jeder Pixel bleibt exakt so, wie er gespeichert wurde. Dazu kommt ein vollwertiger Alphakanal, also stufenlose Transparenz – ideal für Logos, Icons und freigestellte Objekte.\n\nDie Stärke von PNG ist seine Universalität. Jedes Betriebssystem, jeder Browser, jedes Office-Programm und jede Bildbearbeitung liest PNG. Die Schwäche ist die Dateigröße bei Fotos: Weil PNG nichts verwerfen darf, werden Fotos mit vielen feinen Farbübergängen sehr groß. Für Screenshots, Diagramme und Grafiken mit großen einfarbigen Flächen ist PNG dagegen effizient. Mehr zum Vergleich mit JPG lesen Sie unter [JPG oder PNG – welches Bildformat ist besser?](blog:jpg-oder-png-welches-bildformat-ist-besser).'
      },
      {
        heading: 'Was ist der Unterschied zwischen WebP und PNG?',
        content: 'WebP ist ein von Google entwickeltes Bildformat, das anders als PNG sowohl verlustfrei als auch verlustbehaftet komprimieren kann; alle aktuellen Browser unterstützen es.\n\n| Eigenschaft | PNG | WebP |\n|---|---|---|\n| Kompression | immer verlustfrei | verlustfrei oder verlustbehaftet |\n| Transparenz | ja | ja, in beiden Modi |\n| Animation | nur als APNG | ja |\n| Dateigröße | größer | meist kleiner |\n| Unterstützung | praktisch überall | Browser ja, nicht jede Software |\n\n- **Verlustfreies WebP** arbeitet wie PNG, nutzt aber effizientere Verfahren. Die Dateien sind dadurch bei gleichem Inhalt meist kleiner als PNG, ohne dass sich ein Pixel ändert.\n- **Verlustbehaftetes WebP** arbeitet ähnlich wie JPG und spart bei Fotos viel Speicherplatz. Anders als JPG kann es dabei trotzdem Transparenz speichern.\n- **Animiertes WebP** ersetzt GIF und ist meist kompakter.\n\nWie stark sich eine Datei verkleinert, hängt vom Motiv ab und lässt sich nicht pauschal vorhersagen. Bei Fotos mit Transparenz, etwa freigestellten Produktbildern, ist der Unterschied oft am größten, weil PNG hier besonders ineffizient ist. Den Vergleich mit JPG beleuchtet der Artikel [WebP oder JPG: Qualität und Dateigröße](blog:webp-oder-jpg-unterschiede-qualitaet-dateigroesse).'
      },
      {
        heading: 'Wo wird WebP nicht unterstützt?',
        content: 'Im Browser ist WebP kein Problem mehr, außerhalb des Browsers sieht es gemischter aus. Aktuelle Versionen von Windows und macOS zeigen WebP in der Fotos-App bzw. in der Vorschau an, und gängige Bildbearbeitungen wie Photoshop, GIMP oder Affinity lesen und schreiben das Format. Ältere Programme, manche Office-Versionen, Druckereiportale, E-Mail-Programme oder Fachsoftware lehnen WebP aber mitunter ab.\n\nGenau hier entsteht im Alltag oft Frust: Ein Bild wurde von einer Website gespeichert, ist eine WebP-Datei und lässt sich nicht in die Präsentation einfügen. Die Lösung ist eine Umwandlung, etwa mit dem [WebP-in-PNG-Konverter](tool:webp-in-png-umwandeln), wenn Transparenz erhalten bleiben soll, oder in JPG für Fotos. Eine ausführliche Anleitung gibt es im Beitrag [WebP-Bild als JPG speichern](blog:webp-bild-als-jpg-speichern).'
      },
      {
        heading: 'WebP oder PNG: Welches Format für welchen Zweck?',
        content: 'Für Bilder im Web ist WebP meist die bessere Wahl, für Bearbeitung, Druck und Office bleibt PNG sicherer:\n\n- **Website-Bilder, Blog, Onlineshop:** WebP. Kleinere Dateien bedeuten schnellere Ladezeiten, besonders auf dem Smartphone. Der [PNG-in-WebP-Konverter](tool:png-in-webp-umwandeln) erledigt die Umwandlung im Browser.\n- **Logos und Icons für die Website:** Wenn möglich SVG, sonst WebP oder PNG. Für Favicons gelten eigene Regeln.\n- **Screenshots für Anleitungen und Dokumentationen:** PNG, wenn die Bilder in Word, PowerPoint oder Wikis landen; WebP, wenn sie direkt im Web erscheinen.\n- **Druckvorlagen und Weitergabe an Agenturen:** PNG oder TIFF, da hier maximale Kompatibilität zählt.\n- **Bilder, die weiterbearbeitet werden:** PNG als verlustfreies Arbeitsformat.\n\nEine Regel gilt immer: Haben Sie ein PNG einmal in verlustbehaftetes WebP umgewandelt, bringt der Rückweg nach PNG die verlorenen Details nicht zurück. Bewahren Sie Originale daher auf.'
      },
      {
        heading: 'PNG in WebP umwandeln: Was passiert im Browser?',
        content: 'Datei Tools wandelt Bilder direkt in Ihrem Browser um, die Dateien verlassen Ihr Gerät nicht. Das ist bei Screenshots mit Kundendaten, Fotos von Dokumenten oder internen Diagrammen ein Vorteil gegenüber Konvertern, die Dateien auf einen Server übertragen.\n\nBeim Umwandeln von PNG in WebP bestimmen Sie die Bildqualität über einen Regler: Je niedriger der Wert, desto kleiner die Datei und desto eher werden feine Details und Kanten unscharf. Transparente Bereiche bleiben erhalten. Mehrere Bilder lassen sich in einem Durchgang umwandeln; die Geschwindigkeit hängt von Ihrem Gerät ab. Weil das Erzeugen von WebP im Browser geschieht, funktioniert es in Chrome, Edge und Firefox, nicht aber in Safari. Der Rückweg von WebP nach PNG ist dagegen in jedem aktuellen Browser möglich und verlustfrei, bringt aber bereits verworfene Details nicht zurück.'
      }
    ],
    faqs: [
      { question: 'Ist WebP besser als PNG?', answer: 'Für Websites in den meisten Fällen ja, weil die Dateien kleiner sind und Transparenz trotzdem möglich ist. Für Bearbeitung, Druck und den Austausch mit älterer Software ist PNG wegen der breiteren Unterstützung oft die bessere Wahl.' },
      { question: 'Unterstützt WebP Transparenz?', answer: 'Ja, sowohl verlustfreies als auch verlustbehaftetes WebP kann einen Alphakanal speichern. Damit eignet sich WebP auch für Logos und freigestellte Produktfotos.' },
      { question: 'Verliert ein Bild beim Umwandeln von PNG in WebP an Qualität?', answer: 'Bei verlustfreiem WebP nicht. Bei verlustbehafteter Kompression werden Details verworfen, was bei hoher Qualitätsstufe meist kaum sichtbar ist, bei Text und feinen Linien aber auffallen kann.' },
      { question: 'Warum kann ich WebP-Bilder nicht in Word einfügen?', answer: 'Ältere Office-Versionen unterstützen WebP nicht oder nur eingeschränkt. Wandeln Sie das Bild in PNG oder JPG um, dann lässt es sich problemlos einfügen.' },
      { question: 'Ist SVG nicht besser als PNG und WebP?', answer: 'Für Logos, Icons und einfache Grafiken oft ja, weil SVG als Vektorformat in jeder Größe scharf bleibt und meist sehr klein ist. Für Fotos und Screenshots eignet sich SVG dagegen nicht; hier bleiben PNG und WebP die richtige Wahl.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'pdf-a-erklaert-archivierung',
    title: 'PDF/A erklärt: Was das Archivformat ausmacht und wann Sie es brauchen',
    metaTitle: 'PDF/A erklärt: Varianten, Einsatz und Prüfung',
    metaDescription: 'Was ist PDF/A? Unterschiede zwischen PDF/A-1, -2 und -3, wann das Archivformat verlangt wird und wie Sie prüfen, ob Ihre PDF konform ist.',
    h1: 'PDF/A erklärt: Das Archivformat für langfristig lesbare Dokumente',
    excerpt: 'Hochschulen, Gerichte oder Archive verlangen manchmal ausdrücklich PDF/A. Doch was unterscheidet PDF/A von einem normalen PDF, welche Variante ist die richtige und wie erkennen Sie, ob eine Datei die Anforderungen erfüllt?',
    category: 'formats',
    primaryKeyword: 'pdf/a',
    secondaryKeywords: ['was ist pdf/a', 'pdf/a unterschied pdf', 'pdf/a-1b pdf/a-2b pdf/a-3', 'pdf/a prüfen', 'pdf archivierung'],
    searchIntent: 'informational',
    primaryToolSlug: 'pdf-eigenschaften-anzeigen',
    ctaHeadline: 'Eigenschaften Ihrer PDF jetzt kostenlos anzeigen',
    ctaButtonLabel: 'PDF-Eigenschaften anzeigen',
    relatedToolSlugs: ['pdf-metadaten-anzeigen', 'word-in-pdf-umwandeln', 'pdf-reparieren'],
    relatedArticleSlugs: ['word-in-pdf-umwandeln-anleitung', 'dokument-in-pdf-umwandeln-wichtigste-moeglichkeiten', 'pdf-mit-passwort-schuetzen', 'pdf-metadaten-entfernen-vor-dem-versenden'],
    directAnswer: 'PDF/A ist eine nach ISO 19005 genormte Variante von PDF für die Langzeitarchivierung. Eine PDF/A-Datei muss alles enthalten, was zur Darstellung nötig ist, etwa eingebettete Schriften und definierte Farbprofile, und darf keine Verschlüsselung, keine externen Verweise und keine aktiven Inhalte wie JavaScript enthalten. So bleibt sie auch in Jahrzehnten identisch darstellbar.',
    steps: [
      { step: 1, title: 'Anforderung klären', text: 'Fragen Sie nach, welche PDF/A-Variante verlangt wird, etwa PDF/A-1b, PDF/A-2b oder PDF/A-3. Die Angabe steht oft in den Einreichungsrichtlinien.' },
      { step: 2, title: 'PDF/A beim Export erzeugen', text: 'Erstellen Sie die Datei direkt aus dem Ursprungsprogramm als PDF/A, zum Beispiel über die entsprechende Option im PDF-Export von Word oder LibreOffice.' },
      { step: 3, title: 'Eigenschaften prüfen', text: 'Öffnen Sie die Datei im Tool zum Anzeigen der PDF-Eigenschaften und kontrollieren Sie PDF-Version, erzeugende Software und Metadaten.' },
      { step: 4, title: 'Bei Bedarf validieren', text: 'Für eine verbindliche Prüfung nutzen Sie einen Validator wie das kostenlose veraPDF, der die Datei gegen die Norm testet.' }
    ],
    sections: [
      {
        heading: 'Was unterscheidet PDF/A von einem normalen PDF?',
        content: 'PDF/A ist ein gezielt eingeschränktes PDF, das ohne äußere Hilfsmittel dauerhaft gleich dargestellt werden kann. Ein gewöhnliches PDF darf dagegen vieles: Schriften nur referenzieren statt einbetten, auf externe Inhalte verweisen, Videos und Skripte enthalten oder per Passwort verschlüsselt sein. Für den Alltag ist das praktisch, für ein Archiv ein Risiko. Fehlt in 20 Jahren eine Schrift oder ist ein Passwort vergessen, ist das Dokument womöglich nicht mehr korrekt lesbar.\n\nPDF/A schränkt PDF deshalb gezielt ein. Die wichtigsten Regeln:\n\n- Alle Schriften müssen eingebettet sein.\n- Farben müssen geräteunabhängig über Farbprofile definiert sein.\n- Verschlüsselung und Passwortschutz sind nicht erlaubt.\n- JavaScript, Audio, Video und ausführbare Inhalte sind verboten.\n- Inhalte dürfen nicht von externen Quellen abhängen.\n- Metadaten müssen im standardisierten XMP-Format vorliegen.\n\nDaraus folgt auch: Ein PDF mit Kennwortschutz, wie im Beitrag [PDF mit Passwort schützen](blog:pdf-mit-passwort-schuetzen) beschrieben, kann niemals PDF/A-konform sein.'
      },
      {
        heading: 'Welche PDF/A-Varianten gibt es?',
        content: 'Die Norm ISO 19005 umfasst mehrere Teile, die aufeinander aufbauen. Die drei verbreitetsten unterscheiden sich so:\n\n| Variante | Basis | Transparenz, JPEG2000 | Eingebettete Dateien |\n|---|---|---|---|\n| PDF/A-1 (2005) | PDF 1.4 | nein | nein |\n| PDF/A-2 (2011) | PDF 1.7 | ja | nur PDF/A-Dateien |\n| PDF/A-3 (2012) | PDF 1.7 | ja | beliebige Dateien |\n\n- **PDF/A-1** ist die strengste und am längsten unterstützte Variante.\n- **PDF/A-2** erlaubt zusätzlich Ebenen und eignet sich für Dokumente mit transparenten Grafiken.\n- **PDF/A-3** nutzen zum Beispiel E-Rechnungsformate wie ZUGFeRD und Factur-X, die eine XML-Datei mit den Rechnungsdaten im PDF mitführen.\n- **PDF/A-4** (2020) basiert auf PDF 2.0 und vereinfacht die Konformitätsstufen.\n\nZusätzlich gibt es Konformitätsstufen: **b** (basic) sichert die visuelle Darstellung, **a** (accessible) verlangt zusätzlich eine logische Struktur mit Tags für Barrierefreiheit, **u** (Unicode) bei PDF/A-2 und -3 stellt sicher, dass Text zuverlässig durchsucht und kopiert werden kann.'
      },
      {
        heading: 'Wann ist PDF/A Pflicht?',
        content: 'Eine allgemeine Pflicht gibt es nicht. PDF/A wird verlangt, wenn eine Stelle es in ihren Vorgaben festlegt. Typische Beispiele:\n\n- Hochschulen, die Abschlussarbeiten oder Dissertationen elektronisch veröffentlichen\n- Archive, Bibliotheken und Behörden für die Langzeitaufbewahrung\n- Unternehmen, die ihre Dokumentenarchivierung auf ein einheitliches Format umstellen\n- E-Rechnungen im ZUGFeRD-Format, die technisch auf PDF/A-3 aufbauen\n\nIm steuerlichen Kontext ist Vorsicht bei pauschalen Aussagen geboten. Die GoBD schreiben kein bestimmtes Dateiformat vor, verlangen aber unter anderem Unveränderbarkeit, Vollständigkeit und maschinelle Auswertbarkeit. PDF/A wird in diesem Zusammenhang häufig als geeignetes Archivformat genutzt, ersetzt aber kein ordnungsgemäßes Archivierungsverfahren. Klären Sie im Zweifel mit Ihrer Steuerberatung, was für Ihre Unterlagen gilt. Auch im elektronischen Rechtsverkehr mit Gerichten gelten eigene, wiederholt angepasste technische Vorgaben.'
      },
      {
        heading: 'Wie erstelle und prüfe ich ein PDF/A?',
        content: 'Am zuverlässigsten entsteht PDF/A direkt im Ursprungsprogramm. Word bietet im Exportdialog unter „Optionen“ eine Einstellung für PDF/A-Kompatibilität, LibreOffice hat im PDF-Export eine PDF/A-Option mit Auswahl der Variante. Wie der Export aus Word generell funktioniert, steht im Artikel [Word in PDF umwandeln](blog:word-in-pdf-umwandeln-anleitung).\n\nUm eine vorhandene Datei einzuschätzen, öffnen Sie sie mit dem Tool [PDF-Eigenschaften anzeigen](tool:pdf-eigenschaften-anzeigen). Dort sehen Sie unter anderem PDF-Version, erzeugende Software und Metadaten. Findet das Tool am Dateianfang eine PDF/A-Kennung, weist es darauf hin; fehlt der Hinweis, kann die Kennung trotzdem an anderer Stelle stehen. Eine solche Kennung zeigt nur, dass die Datei als PDF/A erstellt wurde, und beweist noch keine Konformität. Für eine verbindliche Prüfung gegen die Norm brauchen Sie einen Validator wie veraPDF. Die Metadaten selbst können Sie auch mit [PDF-Metadaten anzeigen](tool:pdf-metadaten-anzeigen) gezielt einsehen – die Datei wird dabei lokal in Ihrem Browser gelesen und nicht übertragen.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Validator meldet nicht eingebettete Schriften:** Exportieren Sie erneut aus dem Ursprungsprogramm mit aktivierter PDF/A-Option. Nachträgliches Reparieren ist deutlich aufwendiger.\n- **Datei ist verschlüsselt:** Entfernen Sie den Schutz zuerst, sofern Sie berechtigt sind, und erzeugen Sie dann ein PDF/A.\n- **Transparenzfehler bei PDF/A-1:** Grafiken mit Transparenz sind in PDF/A-1 nicht zulässig. Wählen Sie PDF/A-2, wenn die Stelle das akzeptiert.\n- **Formulare funktionieren nicht mehr:** Interaktive Elemente sind eingeschränkt. Füllen Sie das Formular aus und erzeugen Sie dann die Archivfassung.\n- **Datei wird größer:** Eingebettete Schriften und Farbprofile kosten Speicherplatz. Das ist bei PDF/A normal und gewollt.'
      }
    ],
    faqs: [
      { question: 'Was bedeutet das „b“ in PDF/A-1b?', answer: 'Das „b“ steht für „basic“ und garantiert die zuverlässige visuelle Darstellung. Die Stufe „a“ verlangt zusätzlich eine logische Dokumentstruktur mit Tags, die etwa für Screenreader wichtig ist.' },
      { question: 'Kann ich ein PDF/A mit Passwort schützen?', answer: 'Nein. Verschlüsselung ist in PDF/A ausdrücklich ausgeschlossen, damit das Dokument auch langfristig ohne Kennwort lesbar bleibt.' },
      { question: 'Welche PDF/A-Variante soll ich wählen?', answer: 'Richten Sie sich nach den Vorgaben der Stelle, die die Datei verlangt. Ohne Vorgabe ist PDF/A-2b ein häufig genutzter Kompromiss, da es Transparenz erlaubt und breit unterstützt wird.' },
      { question: 'Sieht man einem PDF an, ob es PDF/A ist?', answer: 'Manche Betrachter blenden einen Hinweis ein, wenn eine Datei sich als PDF/A ausweist. Auch die Metadaten verraten es. Ob die Datei die Norm tatsächlich erfüllt, zeigt aber nur eine Prüfung mit einem Validator.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'zip-7z-rar-unterschiede',
    title: 'ZIP, 7z oder RAR? Archivformate im Vergleich',
    metaTitle: 'ZIP vs. 7z vs. RAR: Unterschiede im Überblick',
    metaDescription: 'ZIP, 7z oder RAR? Kompression, Verschlüsselung, Kompatibilität und Lizenz im Vergleich – plus Tipps, wie Sie Archive kostenlos ohne Upload entpacken.',
    h1: 'ZIP vs. 7z vs. RAR: Welches Archivformat eignet sich wofür?',
    excerpt: 'Alle drei Formate packen Dateien zusammen und machen sie kleiner, doch bei Kompatibilität, Kompressionsstärke und Verschlüsselung gibt es deutliche Unterschiede. Ein praxisnaher Vergleich mit klaren Empfehlungen.',
    category: 'formats',
    primaryKeyword: 'zip vs 7z vs rar',
    secondaryKeywords: ['unterschied zip rar', '7z oder zip', 'welches archivformat', 'rar öffnen', '7z kompression'],
    searchIntent: 'informational',
    primaryToolSlug: '7z-entpacken',
    ctaHeadline: '7z-Archiv jetzt kostenlos im Browser entpacken',
    ctaButtonLabel: '7z entpacken',
    relatedToolSlugs: ['zip-entpacken', 'zip-erstellen', 'tar-entpacken', 'gzip-entpacken'],
    relatedArticleSlugs: ['zip-datei-entpacken-anleitung', '7z-datei-oeffnen-ohne-programm', 'zip-datei-erstellen-anleitung', 'docx-vs-doc-unterschied'],
    directAnswer: 'ZIP ist das kompatibelste Archivformat und öffnet sich auf praktisch jedem Gerät ohne Zusatzsoftware, deshalb eignet es sich am besten zum Weitergeben. 7z komprimiert meist stärker und verschlüsselt mit AES-256 auf Wunsch auch die Dateinamen; RAR ist proprietär, bietet Wiederherstellungsdaten für beschädigte Archive und lässt sich offiziell nur mit WinRAR erstellen.',
    steps: [
      { step: 1, title: 'Archivformat erkennen', text: 'Achten Sie auf die Dateiendung: .zip, .7z, .rar oder bei Linux-Archiven .tar.gz. Blenden Sie Dateiendungen im Explorer bei Bedarf ein.' },
      { step: 2, title: 'Passendes Werkzeug wählen', text: 'ZIP öffnen alle gängigen Systeme direkt. Für 7z- und RAR-Archive ohne Passwort können Sie den 7z-Entpacker von Datei Tools im Browser nutzen, ohne ein Programm zu installieren.' },
      { step: 3, title: 'Archiv auswählen und entpacken', text: 'Ziehen Sie das Archiv in das Tool. Der Inhalt wird lokal ausgelesen; einzelne Dateien oder alles zusammen können Sie anschließend speichern.' },
      { step: 4, title: 'Inhalt prüfen', text: 'Kontrollieren Sie, ob alle Dateien vollständig sind, und seien Sie bei ausführbaren Dateien aus unbekannten Quellen vorsichtig.' }
    ],
    sections: [
      {
        heading: 'Warum ist ZIP das kompatibelste Archivformat?',
        content: 'ZIP stammt aus dem Jahr 1989 und wird heute von praktisch jedem Betriebssystem ohne Zusatzprogramm unterstützt. Windows, macOS, iOS, iPadOS und gängige Linux-Oberflächen öffnen und erstellen ZIP-Dateien mit Bordmitteln, unter Android entpacken Dateimanager wie „Files by Google“ ZIP-Archive. Standardmäßig wird das Verfahren Deflate genutzt, das schnell arbeitet, aber nicht die stärkste Kompression erreicht.\n\nDie größte Schwäche von ZIP betrifft die Sicherheit. Das klassische ZIP-Passwort („ZipCrypto“) gilt als schwach und sollte nicht für vertrauliche Inhalte genutzt werden. Programme wie 7-Zip können ZIP-Archive zwar mit AES-256 verschlüsseln, diese lassen sich dann aber nicht mehr mit allen Bordmitteln öffnen. Zudem bleiben bei ZIP die Dateinamen im Archiv in der Regel auch ohne Passwort sichtbar.\n\nWas Sie beim Erstellen beachten sollten, lesen Sie im Beitrag [ZIP-Datei erstellen](blog:zip-datei-erstellen-anleitung). Übrigens begegnen Ihnen ZIP-Container auch dort, wo Sie sie nicht erwarten: DOCX, XLSX, ODT und EPUB sind technisch ZIP-Archive.'
      },
      {
        heading: 'Was kann 7z besser als ZIP?',
        content: '7z erzeugt meist kleinere Archive als ZIP und verschlüsselt sicherer. Es ist das Format des kostenlosen Open-Source-Programms 7-Zip und nutzt in der Regel die Verfahren LZMA oder LZMA2, die bei vielen Dateiarten spürbar kleinere Archive erzeugen als ZIP, dafür aber mehr Rechenzeit und Arbeitsspeicher benötigen. Wie groß der Vorteil ist, hängt vom Inhalt ab: Textdateien, Programmcode und Datenbanken profitieren stark, bereits komprimierte Dateien wie JPG, MP4 oder PDF kaum.\n\nBei der Sicherheit punktet 7z mit AES-256 und der Möglichkeit, auch die Dateinamen zu verschlüsseln. Wer das Archiv ohne Passwort öffnet, sieht dann nicht einmal, welche Dateien enthalten sind.\n\nDer Nachteil: Nicht jedes System öffnet 7z direkt. Aktuelle Windows-11-Versionen können 7z im Explorer entpacken, ältere Windows-Versionen und macOS brauchen meist eine Zusatz-App. Ohne Installation geht es mit dem [7z-Entpacker im Browser](tool:7z-entpacken). Eine ausführliche Anleitung bietet der Artikel [7z-Datei öffnen ohne Programm](blog:7z-datei-oeffnen-ohne-programm).'
      },
      {
        heading: 'Was ist RAR und braucht man es noch?',
        content: 'RAR ist ein proprietäres Archivformat, das Eugene Roshal entwickelt hat und das eng mit dem Programm WinRAR verbunden ist. Entpacken können viele Programme, RAR-Archive erstellen lässt sich offiziell nur mit der Software des Herstellers, etwa dem kostenpflichtigen WinRAR.\n\nEine Besonderheit von RAR sind **Wiederherstellungsdaten**: Beim Erstellen lassen sich zusätzliche Informationen einbetten, mit denen leicht beschädigte Archive repariert werden können. Das war in Zeiten unzuverlässiger Datenträger und Downloads ein echter Vorteil. Auch das Aufteilen großer Archive in mehrere Teile ist bei RAR verbreitet.\n\nZum Öffnen von RAR-Dateien reicht unter aktuellen Windows-11-Versionen der Explorer, alternativ das kostenlose 7-Zip. Unter macOS helfen Apps wie The Unarchiver oder Keka, und der 7z-Entpacker von Datei Tools öffnet RAR-Archive ohne Passwort auch im Browser. Für neue Archive gibt es heute kaum einen Grund, RAR zu wählen, da ZIP und 7z frei verfügbar sind.'
      },
      {
        heading: 'ZIP, 7z oder RAR: Welches Format eignet sich wofür?',
        content: 'Die drei Formate unterscheiden sich vor allem bei Kompatibilität, Kompression und Verschlüsselung:\n\n| Kriterium | ZIP | 7z | RAR |\n|---|---|---|---|\n| Öffnen ohne Zusatzsoftware | fast überall | aktuelles Windows 11 | aktuelles Windows 11 |\n| Kompression | solide (Deflate) | meist am stärksten | meist stark |\n| Verschlüsselung | klassisch schwach, AES optional | AES-256, auch Dateinamen | AES, auch Dateinamen |\n| Erstellen | frei | frei (7-Zip) | nur mit WinRAR |\n| Reparatur | nein | nein | Wiederherstellungsdaten |\n\nWie stark die Kompression ausfällt, hängt immer vom Inhalt ab. Empfehlung für den Alltag: Wenn Sie Dateien an andere schicken, nehmen Sie ZIP – das spart Rückfragen. Für Backups und Archive, bei denen jedes Megabyte zählt oder die vertraulich sind, ist 7z mit Passwort die bessere Wahl. Unter Linux und auf Servern sind außerdem TAR-Archive mit gzip-Kompression (.tar.gz) verbreitet; dafür gibt es eigene Entpacker. Wie Sie ZIP-Dateien auf allen Systemen öffnen, zeigt [ZIP-Datei entpacken: Anleitung für alle Geräte](blog:zip-datei-entpacken-anleitung).'
      },
      {
        heading: 'Archive sicher entpacken: worauf sollten Sie achten?',
        content: 'Archive entpacken Sie am sichersten lokal und nur aus Quellen, denen Sie vertrauen. Bei Datei Tools werden ZIP-, 7z- und RAR-Archive direkt im Browser entpackt; der Inhalt verlässt Ihr Gerät nicht. Passwortgeschützte Archive kann der Browser-Entpacker derzeit nicht öffnen, und sehr große Archive mit mehreren Gigabyte sind mit einem Desktop-Programm wie 7-Zip besser aufgehoben.\n\nUnabhängig vom Werkzeug gilt: Archive aus unbekannten Quellen können Schadsoftware enthalten. Seien Sie besonders vorsichtig bei ausführbaren Dateien wie .exe, .bat, .js oder Office-Dokumenten mit Makros. Ein passwortgeschütztes Archiv aus einer unerwarteten E-Mail ist ein klassisches Warnsignal, weil Virenscanner verschlüsselte Inhalte nicht prüfen können.'
      }
    ],
    faqs: [
      { question: 'Welches Archivformat komprimiert am stärksten?', answer: 'In vielen Fällen erzeugt 7z die kleinsten Archive, gefolgt von RAR und ZIP. Bei bereits komprimierten Dateien wie Fotos oder Videos ist der Unterschied jedoch gering.' },
      { question: 'Kann Windows 7z- und RAR-Dateien ohne Zusatzprogramm öffnen?', answer: 'Aktuelle Versionen von Windows 11 können 7z und RAR im Explorer entpacken. Unter Windows 10 und älteren Versionen benötigen Sie ein Programm wie 7-Zip oder ein Browser-Tool.' },
      { question: 'Ist ein ZIP-Passwort sicher?', answer: 'Die klassische ZIP-Verschlüsselung gilt als schwach. Für vertrauliche Daten ist 7z mit AES-256 und verschlüsselten Dateinamen die bessere Wahl. Wählen Sie in jedem Fall ein langes, zufälliges Passwort.' },
      { question: 'Warum sollte ich zum Verschicken ZIP verwenden?', answer: 'Weil jeder Empfänger ZIP ohne zusätzliche Software öffnen kann, egal ob am PC, Mac oder Smartphone. Bei 7z oder RAR müssen manche Empfänger erst ein passendes Programm suchen.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'iphone-fotos-als-jpg-speichern',
    title: 'iPhone-Fotos als JPG speichern statt HEIC',
    metaTitle: 'iPhone-Fotos als JPG speichern – so geht es',
    metaDescription: 'iPhone-Fotos als JPG speichern: Kamera auf „Maximale Kompatibilität“ stellen und vorhandene HEIC-Bilder kostenlos ohne Upload in JPG umwandeln.',
    h1: 'iPhone-Fotos als JPG speichern: Einstellungen und Umwandlung vorhandener HEIC-Bilder',
    excerpt: 'Ihr iPhone speichert Fotos als HEIC, doch Behördenportale, ältere PCs oder Fotodienste wollen JPG? So stellen Sie die Kamera um und wandeln bereits aufgenommene Bilder um, ohne sie aus der Hand zu geben.',
    category: 'images',
    primaryKeyword: 'iphone fotos als jpg speichern',
    secondaryKeywords: ['iphone heic in jpg', 'iphone kamera jpg einstellen', 'maximale kompatibilität iphone', 'iphone bilder jpg statt heic', 'heic in jpg umwandeln'],
    searchIntent: 'transactional',
    primaryToolSlug: 'heic-in-jpg-umwandeln',
    ctaHeadline: 'HEIC-Fotos jetzt kostenlos in JPG umwandeln',
    ctaButtonLabel: 'HEIC in JPG umwandeln',
    relatedToolSlugs: ['heic-in-png-umwandeln', 'bild-komprimieren', 'bild-metadaten-entfernen'],
    relatedArticleSlugs: ['was-ist-heic-warum-iphone-dieses-format', 'heic-fotos-unter-windows-oeffnen-und-umwandeln', 'bild-metadaten-exif-entfernen', 'bild-auf-100-kb-verkleinern'],
    directAnswer: 'Damit Ihr iPhone künftig JPG statt HEIC speichert, öffnen Sie „Einstellungen > Kamera > Formate“ und wählen „Maximale Kompatibilität“. Bereits aufgenommene HEIC-Fotos ändert das nicht. Diese wandeln Sie mit einem HEIC-in-JPG-Konverter um – bei Datei Tools direkt im Browser, auch am iPhone selbst, ohne dass die Fotos übertragen werden.',
    steps: [
      { step: 1, title: 'Kameraformat umstellen', text: 'Öffnen Sie „Einstellungen > Kamera > Formate“ und wählen Sie „Maximale Kompatibilität“. Neue Fotos werden nun als JPG gespeichert.' },
      { step: 2, title: 'Vorhandene HEIC-Fotos auswählen', text: 'Öffnen Sie den HEIC-in-JPG-Konverter und wählen Sie die Bilder aus der Fotomediathek oder der Dateien-App aus.' },
      { step: 3, title: 'Umwandlung im Browser', text: 'Die Fotos werden lokal auf Ihrem Gerät in JPG umgewandelt. Bei vielen Bildern hängt die Dauer von der Leistung Ihres iPhones oder Computers ab.' },
      { step: 4, title: 'JPG-Dateien sichern', text: 'Speichern Sie die JPG-Dateien in der Dateien-App, in Ihren Fotos oder auf dem Computer und verwenden Sie sie wie gewohnt.' }
    ],
    sections: [
      {
        heading: 'Warum speichert das iPhone Fotos als HEIC?',
        content: 'Seit iOS 11 speichert das iPhone Fotos standardmäßig im Format HEIC (High Efficiency Image Container), um Speicherplatz zu sparen: HEIC nutzt eine modernere Kompression als JPG und erreicht bei vergleichbarer Bildqualität meist kleinere Dateien. Außerdem kann HEIC Zusatzinformationen wie Tiefendaten für den Porträtmodus oder HDR-Informationen speichern.\n\nDas Problem: Nicht jede Software kann HEIC öffnen. Ältere Windows-PCs, manche Bewerbungs- und Behördenportale, Online-Druckdienste oder Fachprogramme akzeptieren nur JPG oder PNG. Die technischen Hintergründe erklärt der Beitrag [Was ist HEIC und warum nutzt das iPhone dieses Format?](blog:was-ist-heic-warum-iphone-dieses-format). Hier geht es um die praktische Frage: Wie kommen Sie an JPG-Dateien?'
      },
      {
        heading: 'Wie stelle ich die iPhone-Kamera dauerhaft auf JPG um?',
        content: 'Für alle künftigen Aufnahmen genügt eine einzige Einstellung in der Kamera-App:\n\n1. Öffnen Sie die App „Einstellungen“.\n2. Tippen Sie auf „Kamera“ und dann auf „Formate“.\n3. Wählen Sie „Maximale Kompatibilität“ statt „High Efficiency“.\n\nAb sofort speichert das iPhone Fotos als JPG und Videos im verbreiteten H.264-Format. Bedenken Sie die Nachteile: Die Dateien werden größer, Ihr iCloud- oder Gerätespeicher füllt sich schneller. Einige Aufnahmefunktionen, etwa bestimmte hohe Bildraten bei Videos, setzen das effizientere Format voraus und stehen dann nicht mehr zur Verfügung. Bei neueren Pro-Modellen gibt es zudem Formate wie ProRAW, die von dieser Einstellung unabhängig sind.\n\nViele Nutzer fahren gut damit, HEIC beizubehalten und nur bei Bedarf umzuwandeln. Das spart Speicher und erhält die volle Qualität.'
      },
      {
        heading: 'Wandelt das iPhone Fotos beim Übertragen auf den PC automatisch um?',
        content: 'Ja, wenn die passende Einstellung aktiv ist, wandelt das iPhone Fotos beim Kopieren auf einen Computer um. Unter „Einstellungen > Fotos“ finden Sie ganz unten den Bereich „Auf Mac oder PC übertragen“. Steht er auf „Automatisch“, wandelt das iPhone Fotos beim Kopieren per USB-Kabel in ein kompatibles Format um, in der Regel JPG. Bei „Originale behalten“ landen die HEIC-Dateien unverändert auf dem Computer.\n\nAuch beim Teilen per Mail oder Messenger wandelt iOS Bilder oft automatisch um, wenn die Ziel-App HEIC nicht unterstützt. Verlassen können Sie sich darauf aber nicht – je nach App und Weg erhalten Sie mal JPG, mal HEIC.\n\nWenn die HEIC-Dateien bereits auf dem Windows-Rechner liegen, hilft der Artikel [HEIC-Fotos unter Windows öffnen und umwandeln](blog:heic-fotos-unter-windows-oeffnen-und-umwandeln) weiter.'
      },
      {
        heading: 'Vorhandene HEIC-Fotos in JPG umwandeln',
        content: 'Fotos, die bereits als HEIC vorliegen, wandeln Sie mit dem [HEIC-in-JPG-Konverter](tool:heic-in-jpg-umwandeln) um. Er läuft in Safari auf dem iPhone ebenso wie am Windows-PC oder Mac, und die Umwandlung findet direkt im Browser statt; Familienbilder, Ausweisfotos oder Aufnahmen von Dokumenten werden nicht an einen Server übertragen. Die JPG-Qualität stellen Sie über einen Regler ein.\n\nBenötigen Sie eine verlustfreie Kopie für die weitere Bearbeitung, ist der HEIC-in-PNG-Konverter die Alternative, allerdings mit deutlich größeren Dateien.\n\nWichtig zu wissen: Der Konverter schreibt die Bildpunkte neu und übernimmt dabei keine EXIF-Metadaten. Aufnahmeort, Aufnahmedatum und Kameramodell sind im JPG also nicht mehr enthalten. Das ist beim Teilen ein Vorteil, kann aber die Sortierung in Fotoalben durcheinanderbringen. Andere Wege, etwa die automatische Umwandlung beim Übertragen auf den PC, behalten die Metadaten meist bei; worauf Sie dann achten sollten, erklärt [EXIF-Daten aus Bildern entfernen](blog:bild-metadaten-exif-entfernen).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Portal lehnt das Foto trotzdem ab:** Oft ist die Datei zu groß. JPGs aus aktuellen iPhones haben häufig mehrere Megabyte. Verkleinern Sie Abmessungen und Dateigröße, wie im Beitrag [Bild auf 100 KB verkleinern](blog:bild-auf-100-kb-verkleinern) beschrieben.\n- **Live Photo verliert die Bewegung:** Ein JPG ist ein Einzelbild. Die kurze Videosequenz eines Live Photos lässt sich darin nicht speichern.\n- **Farben wirken flauer:** HEIC-Fotos können HDR-Informationen enthalten, die beim Umwandeln in JPG teilweise verloren gehen. Auf HDR-fähigen Displays sieht das Original daher brillanter aus.\n- **Datei heißt noch .HEIC:** Das Umbenennen der Endung wandelt nichts um. Die Datei muss tatsächlich konvertiert werden.\n- **Konverter kann die Datei nicht lesen:** Manche HEIC-Varianten, etwa 10-Bit-HDR-Aufnahmen oder Bildsequenzen, lassen sich im Browser nicht dekodieren. Übertragen Sie solche Fotos mit der Einstellung „Automatisch“ auf den Computer.\n- **Bild ist gedreht:** Steht ein Foto nach der Umwandlung auf der Seite, drehen Sie es nachträglich dauerhaft.'
      }
    ],
    faqs: [
      { question: 'Wie stelle ich das iPhone auf JPG um?', answer: 'Öffnen Sie „Einstellungen > Kamera > Formate“ und wählen Sie „Maximale Kompatibilität“. Ab dann werden neue Fotos als JPG gespeichert, bereits vorhandene Bilder bleiben HEIC.' },
      { question: 'Verliere ich beim Umwandeln von HEIC in JPG Qualität?', answer: 'JPG komprimiert verlustbehaftet, daher ist ein minimaler Qualitätsverlust möglich, bei hoher Qualitätsstufe aber kaum sichtbar. HDR-Informationen und Tiefendaten können verloren gehen.' },
      { question: 'Kann ich HEIC direkt auf dem iPhone in JPG umwandeln?', answer: 'Ja. Öffnen Sie den HEIC-in-JPG-Konverter in Safari, wählen Sie die Fotos aus und speichern Sie die JPGs. Die Umwandlung erfolgt auf dem iPhone selbst.' },
      { question: 'Reicht es, die Endung von .heic in .jpg umzubenennen?', answer: 'Nein. Der Inhalt bleibt dann HEIC, und viele Programme melden einen Fehler. Die Datei muss mit einem Konverter tatsächlich umgewandelt werden.' },
      { question: 'Bleiben Aufnahmedatum und Ort beim Umwandeln erhalten?', answer: 'Das hängt vom Weg ab. Der HEIC-in-JPG-Konverter von Datei Tools übernimmt keine EXIF-Metadaten, das JPG enthält also weder Aufnahmeort noch Aufnahmedatum. Die automatische Umwandlung des iPhones beim Übertragen auf den PC behält diese Angaben dagegen in der Regel bei.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'bild-auf-100-kb-verkleinern',
    title: 'Bild auf 100 KB verkleinern: So klappt es für jedes Portal',
    metaTitle: 'Bild auf 100 KB verkleinern – Schritt für Schritt',
    metaDescription: 'Bild auf 100 KB verkleinern für Bewerbungs- und Behördenportale: erst Pixelmaße, dann Kompression anpassen. Kostenlos im Browser, ganz ohne Upload.',
    h1: 'Bild auf 100 KB verkleinern: Die richtige Kombination aus Größe und Kompression',
    excerpt: 'Viele Bewerbungs-, Hochschul- und Behördenportale erlauben nur Bilder bis 100 KB. Mit der richtigen Reihenfolge aus Zuschneiden, Verkleinern und Komprimieren erreichen Sie das Limit, ohne dass das Foto verwaschen aussieht.',
    category: 'images',
    primaryKeyword: 'bild auf 100 kb verkleinern',
    secondaryKeywords: ['foto unter 100 kb', 'bild kb verkleinern', 'bewerbungsfoto 100 kb', 'jpg auf 100 kb komprimieren', 'bildgröße in kb reduzieren'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-komprimieren',
    ctaHeadline: 'Bild jetzt kostenlos auf die gewünschte Größe bringen',
    ctaButtonLabel: 'Bild komprimieren',
    relatedToolSlugs: ['bildgroesse-aendern', 'bild-zuschneiden', 'png-in-jpg-umwandeln', 'bild-metadaten-entfernen'],
    relatedArticleSlugs: ['bild-verkleinern-oder-komprimieren-unterschied', 'jpeg-komprimieren-dateigroesse-richtig-reduzieren', 'pdf-fuer-bewerbung-verkleinern', 'bild-zuschneiden-seitenverhaeltnis', 'iphone-fotos-als-jpg-speichern'],
    directAnswer: 'Um ein Bild auf 100 KB zu verkleinern, reduzieren Sie zuerst die Pixelmaße auf das, was das Portal tatsächlich anzeigt, etwa 600 bis 1200 Pixel Breite, und speichern es dann als JPG mit mittlerer Qualität. Liegt die Datei noch über dem Limit, senken Sie die Qualität schrittweise und peilen etwa 90 bis 95 KB an, weil Systeme Kilobyte unterschiedlich berechnen.',
    steps: [
      { step: 1, title: 'Bild zuschneiden', text: 'Schneiden Sie überflüssige Ränder weg und wählen Sie das vom Portal geforderte Seitenverhältnis. Jeder entfernte Pixel spart Speicher.' },
      { step: 2, title: 'Pixelmaße reduzieren', text: 'Verkleinern Sie das Bild auf die benötigte Breite, für Profil- und Bewerbungsfotos genügen oft 600 bis 800 Pixel. Achten Sie darauf, das Seitenverhältnis beizubehalten.' },
      { step: 3, title: 'Als JPG komprimieren', text: 'Öffnen Sie das verkleinerte JPG im Komprimierungs-Tool und wählen Sie eine mittlere Qualitätsstufe. Fotos im PNG-Format wandeln Sie vorher in JPG um, denn der Kompressor behält das Ausgangsformat bei.' },
      { step: 4, title: 'Feinjustieren und speichern', text: 'Liegt die Datei noch über 100 KB, senken Sie die Qualität in kleinen Schritten. Speichern Sie das Ergebnis, sobald es knapp unter dem Limit liegt.' }
    ],
    sections: [
      {
        heading: 'Warum begrenzen Portale Bilder auf 100 KB?',
        content: 'Portale begrenzen Bilder meist aus technischen Gründen auf 100 KB: Bewerbungsplattformen, Hochschulportale, Vereinsverwaltungen oder Online-Formulare von Behörden speichern viele Bilder und zeigen sie nur klein an, etwa als Profilfoto oder Vorschaubild. Ein 5-MB-Foto aus dem Smartphone wäre dafür völlig überdimensioniert.\n\nFür Sie bedeutet das: Das Foto muss nicht in voller Kameraauflösung vorliegen. Ein aktuelles Smartphone liefert schnell 12 Megapixel oder mehr, also etwa 4000 × 3000 Pixel. Angezeigt wird im Portal vielleicht ein Bild mit 300 Pixel Breite. Wer das Foto nur stärker komprimiert, ohne die Abmessungen zu ändern, erhält Artefakte und Matsch. Wer zuerst die Größe anpasst, kommt mit milder Kompression ans Ziel. Den Unterschied zwischen beiden Schritten erklärt der Artikel [Bild verkleinern oder komprimieren?](blog:bild-verkleinern-oder-komprimieren-unterschied).'
      },
      {
        heading: 'In welcher Reihenfolge verkleinere ich ein Bild auf 100 KB?',
        content: 'Erst zuschneiden, dann skalieren, zuletzt komprimieren: In dieser Reihenfolge bleibt das Bild bei kleiner Datei am schärfsten.\n\n1. **Zuschneiden:** Entfernen Sie unwichtige Bildbereiche und bringen Sie das Foto ins geforderte Format, etwa Hochformat für Bewerbungsfotos. Hinweise zu gängigen Formaten finden Sie unter [Bild zuschneiden: Seitenverhältnisse richtig wählen](blog:bild-zuschneiden-seitenverhaeltnis).\n2. **Skalieren:** Mit [Bildgröße ändern](tool:bildgroesse-aendern) reduzieren Sie die Pixelmaße. Als Richtwert genügen für Porträts 600 × 800 Pixel, für Dokumentfotos etwa 1200 Pixel Breite.\n3. **Komprimieren:** Erst jetzt speichern Sie das Bild mit dem [Bildkompressor](tool:bild-komprimieren) als JPG mit passender Qualität; nach dem Komprimieren sehen Sie die neue Dateigröße. Beide Tools arbeiten lokal im Browser, das Foto verlässt Ihr Gerät nicht.\n4. **Metadaten entfernen:** EXIF-Daten wie Kameramodell, Aufnahmedatum oder GPS-Position belegen einige Kilobyte und gehören ohnehin nicht in ein Bewerbungsportal. Beim Skalieren und Komprimieren mit Datei Tools entfallen sie automatisch, weil das Bild neu gespeichert wird.\n\nEin Porträtfoto mit etwa 600 × 800 Pixeln landet als JPG mit mittlerer Qualität häufig deutlich unter 100 KB. Garantiert ist das nicht: Fotos mit viel Struktur, etwa Haare vor unruhigem Hintergrund, brauchen mehr Speicher als Motive vor einfarbiger Wand.'
      },
      {
        heading: 'Wie verkleinere ich PNGs, Screenshots und Dokumentfotos?',
        content: 'Für PNGs, Screenshots und fotografierte Dokumente gelten andere Strategien als für Fotos:\n\n- **Fotos als PNG:** PNG speichert verlustfrei und ist für Fotos sehr groß. Wandeln Sie das Bild mit einem PNG-in-JPG-Konverter um, dann reicht oft schon das für eine drastische Verkleinerung.\n- **Screenshots mit Text:** Hier ist PNG oft kleiner als JPG und die Schrift bleibt scharf. Verkleinern Sie zuerst die Abmessungen und prüfen Sie dann beide Formate.\n- **Fotografierte Dokumente:** Graustufen oder Schwarzweiß sparen viel Speicher, da Farbinformationen entfallen. Achten Sie darauf, dass der Text lesbar bleibt.\n- **Mehrseitige Unterlagen:** Wenn Zeugnisse oder Nachweise als ein Dokument verlangt werden, ist ein PDF meist sinnvoller. Wie Sie es auf die Größe bringen, steht in [PDF für die Bewerbung verkleinern](blog:pdf-fuer-bewerbung-verkleinern).'
      },
      {
        heading: 'Warum meldet das Portal „zu groß“, obwohl die Datei unter 100 KB liegt?',
        content: 'Ein Bild mit „99 KB“ kann für ein Portal trotzdem zu groß sein, weil Kilobyte unterschiedlich definiert werden. Streng genommen sind 100 KB (Kilobyte) 100.000 Byte, 100 KiB (Kibibyte) dagegen 102.400 Byte. Windows zeigt im Explorer KiB-Werte an, beschriftet sie aber mit „KB“. macOS rechnet in echten Kilobyte. Webportale verwenden mal die eine, mal die andere Definition.\n\nDie praktische Lösung: Halten Sie etwas Abstand zum Limit. Ein Ziel von etwa 90 bis 95 KB liegt nach beiden Definitionen unter 100 KB.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Bild wirkt blockig oder verwaschen:** Die Qualität ist zu niedrig eingestellt. Verkleinern Sie lieber die Pixelmaße etwas stärker und komprimieren Sie milder.\n- **Datei wird nicht kleiner:** Prüfen Sie, ob das Bild als PNG gespeichert wird. Für Fotos ist JPG die richtige Wahl.\n- **Portal verlangt Mindestmaße:** Manche Portale fordern zugleich eine Mindestauflösung, etwa 400 Pixel Breite. Verkleinern Sie dann nicht unter diesen Wert und regeln Sie die Größe über die Qualität.\n- **Foto ist seitlich gedreht:** Die Ausrichtung steckt in den Metadaten. Drehen Sie das Bild dauerhaft, bevor Sie Metadaten entfernen.\n- **HEIC wird nicht akzeptiert:** iPhone-Fotos zuerst in JPG umwandeln, entweder über die Kameraeinstellung „Maximale Kompatibilität“ oder mit einem HEIC-in-JPG-Konverter.'
      }
    ],
    faqs: [
      { question: 'Wie viele Pixel darf ein Bild mit 100 KB haben?', answer: 'Das hängt vom Motiv und der Kompression ab. Als grober Richtwert lassen sich Porträtfotos mit etwa 600 × 800 Pixeln als JPG mit mittlerer Qualität meist unter 100 KB speichern. Motive mit vielen feinen Details benötigen mehr Speicher.' },
      { question: 'Verliert mein Foto beim Verkleinern an Qualität?', answer: 'Beim Reduzieren der Pixelmaße gehen Details verloren, die im Portal aber ohnehin nicht sichtbar wären. Kritischer ist zu starke JPG-Kompression. Wer erst skaliert und dann mild komprimiert, erhält das beste Ergebnis.' },
      { question: 'Warum zeigt mein PC 98 KB, das Portal sagt aber zu groß?', answer: 'Windows rechnet mit 1.024 Byte pro Kilobyte, viele Portale mit 1.000. Dadurch können sich die Angaben unterscheiden. Bleiben Sie mit etwa 90 bis 95 KB auf der sicheren Seite.' },
      { question: 'Kann ich ein Bild auch am Handy auf 100 KB verkleinern?', answer: 'Ja. Die Tools laufen in einem aktuellen Browser auf iPhone und Android. Wählen Sie das Foto aus der Galerie, verkleinern und komprimieren Sie es und speichern Sie das Ergebnis.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'favicon-erstellen-png-in-ico',
    title: 'Favicon erstellen: Vom Logo zur ICO-Datei für Ihre Website',
    metaTitle: 'Favicon erstellen: PNG in ICO umwandeln | Datei Tools',
    metaDescription: 'Favicon erstellen aus PNG oder SVG: welche Größen nötig sind, wie Sie die ICO-Datei einbinden und warum der Browser alte Icons zeigt. Kostenlos, ohne Upload.',
    h1: 'Favicon erstellen: Größen, Formate und Einbindung Schritt für Schritt',
    excerpt: 'Das kleine Symbol im Browser-Tab prägt den Wiedererkennungswert Ihrer Website. Wir zeigen, wie Sie aus einem Logo ein scharfes Favicon erstellen, welche Formate und Größen heute sinnvoll sind und wie Sie es korrekt einbinden.',
    category: 'images',
    primaryKeyword: 'favicon erstellen',
    secondaryKeywords: ['png in ico umwandeln', 'favicon größe', 'favicon.ico erstellen', 'favicon einbinden', 'ico datei erstellen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'favicon-erstellen',
    ctaHeadline: 'Favicon jetzt kostenlos aus Ihrem Logo erstellen',
    ctaButtonLabel: 'Favicon erstellen',
    relatedToolSlugs: ['png-in-ico-umwandeln', 'svg-in-ico-umwandeln', 'ico-in-png-umwandeln', 'bild-zuschneiden'],
    relatedArticleSlugs: ['svg-in-png-umwandeln-anleitung', 'webp-vs-png-unterschied', 'bild-zuschneiden-seitenverhaeltnis', 'jpg-oder-png-welches-bildformat-ist-besser'],
    directAnswer: 'Ein Favicon erstellen Sie aus einer quadratischen Grafik, idealerweise einem PNG mit transparentem Hintergrund oder einer SVG-Datei. Daraus erzeugen Sie eine favicon.ico mit den Größen 16, 32 und 48 Pixel sowie PNG-Varianten wie 180 × 180 Pixel für Apple-Geräte, legen die ICO-Datei im Stammverzeichnis der Website ab und verweisen im HTML-Kopf darauf.',
    steps: [
      { step: 1, title: 'Quadratische Vorlage vorbereiten', text: 'Schneiden Sie Ihr Logo oder Symbol quadratisch zu. Am besten eignet sich eine Grafik mit mindestens 512 × 512 Pixeln oder eine SVG-Datei.' },
      { step: 2, title: 'PNG-Größen erzeugen', text: 'Ziehen Sie die Vorlage in den Favicon-Generator und wählen Sie die Größen, etwa 16, 32, 48, 180 und 192 Pixel. Die Bilder entstehen lokal in Ihrem Browser.' },
      { step: 3, title: 'ICO-Datei erstellen', text: 'Wandeln Sie die Vorlage mit dem PNG-in-ICO- oder SVG-in-ICO-Konverter in eine ICO-Datei mit den Größen 16, 32 und 48 Pixel um und benennen Sie sie in favicon.ico um.' },
      { step: 4, title: 'Auf der Website einbinden', text: 'Legen Sie die Datei im Stammverzeichnis ab, ergänzen Sie den Verweis im HTML-Kopf und prüfen Sie das Ergebnis in mehreren Browsern.' }
    ],
    sections: [
      {
        heading: 'Was ist ein Favicon und wo erscheint es?',
        content: 'Ein Favicon ist das kleine Symbol, das Browser im Tab, in der Lesezeichenliste und im Verlauf neben dem Seitentitel anzeigen. Es erscheint außerdem, wenn Nutzer eine Website auf dem Startbildschirm ihres Smartphones ablegen, und in den Suchergebnissen von Google neben dem Seitennamen.\n\nDamit ist das Favicon eines der am häufigsten gesehenen Elemente Ihres Auftritts, obwohl es nur wenige Pixel misst. Fehlt es, zeigt der Browser ein neutrales Standardsymbol, was bei vielen offenen Tabs die Orientierung erschwert und unprofessionell wirkt. Zudem fragen Browser automatisch die Adresse /favicon.ico ab. Existiert sie nicht, entstehen unnötige Fehlermeldungen in den Server-Logs.'
      },
      {
        heading: 'Welche Formate und Größen braucht ein Favicon?',
        content: 'Ein Favicon braucht heute eine favicon.ico als Grundlage und ergänzend einige PNG- oder SVG-Varianten. Das klassische Format ist **ICO**. Eine ICO-Datei ist ein Container, der mehrere Bildgrößen enthalten kann; der Browser wählt die passende aus. Üblich sind 16 × 16, 32 × 32 und 48 × 48 Pixel. Die favicon.ico im Stammverzeichnis ist nach wie vor die zuverlässigste Grundlage, weil sie auch ältere Browser und Programme verstehen.\n\nModerne Websites ergänzen weitere Varianten:\n\n- **PNG-Favicons** in 32 × 32 oder 48 × 48 Pixeln, eingebunden per link-Element im HTML-Kopf.\n- **SVG-Favicons**, die in jeder Größe scharf bleiben und von den meisten aktuellen Browsern unterstützt werden. Per CSS-Media-Query im SVG lässt sich sogar eine Variante für den Dunkelmodus hinterlegen.\n- **Apple Touch Icon** mit 180 × 180 Pixeln für den iPhone-Startbildschirm.\n- **Icons im Web-App-Manifest** mit 192 × 192 und 512 × 512 Pixeln für Android und installierbare Web-Apps.\n\nFür die Google-Suche empfiehlt Google laut eigener Dokumentation ein quadratisches Favicon, das größer als 48 × 48 Pixel ist. Wie Sie aus einer SVG-Vorlage hochauflösende PNGs erzeugen, beschreibt [SVG in PNG umwandeln](blog:svg-in-png-umwandeln-anleitung).'
      },
      {
        heading: 'Wie bleibt ein Favicon bei 16 Pixeln erkennbar?',
        content: 'Ein Favicon bleibt bei 16 Pixeln nur erkennbar, wenn es auf ein einfaches Zeichen reduziert ist; ein vollständiges Logo ist dafür oft unbrauchbar. Bei 16 × 16 Pixeln verschwinden Schriftzüge, feine Linien und Details. Bewährt haben sich folgende Regeln:\n\n- **Reduzieren:** Verwenden Sie nur das Bildzeichen oder einen einzelnen Buchstaben statt des kompletten Logos mit Schriftzug.\n- **Kontrast:** Kräftige Farben und klare Formen bleiben erkennbar, Pastelltöne und Verläufe weniger.\n- **Quadratisch denken:** Breite Logos werden auf ein Quadrat gestaucht oder bekommen große leere Ränder. Schneiden Sie die Vorlage mit einem Zuschneide-Werkzeug gezielt quadratisch zu, statt das Quadrat dem Generator zu überlassen. Mehr zu Formaten im Artikel [Bild zuschneiden: Seitenverhältnisse richtig wählen](blog:bild-zuschneiden-seitenverhaeltnis).\n- **Transparenz:** Ein transparenter Hintergrund wirkt in hellen und dunklen Browser-Themes gleichermaßen gut. Prüfen Sie aber, ob dunkle Logos auf dunklen Tabs noch sichtbar sind.\n- **Testen:** Betrachten Sie das Ergebnis in Originalgröße, nicht vergrößert.'
      },
      {
        heading: 'Favicon erstellen und einbinden: so geht’s',
        content: 'Ein vollständiges Favicon-Set besteht aus mehreren PNG-Größen und einer favicon.ico. Der [Favicon-Generator von Datei Tools](tool:favicon-erstellen) erzeugt aus JPG, PNG, WebP oder SVG die PNG-Größen von 16 bis 512 Pixeln; Sie laden sie einzeln oder als ZIP-Paket mit einem Ausschnitt für das Web-App-Manifest herunter. Nicht quadratische Vorlagen schneidet der Generator dabei mittig zu. Die favicon.ico erstellen Sie mit dem [PNG-in-ICO-Konverter](tool:png-in-ico-umwandeln) oder bei Vektorgrafiken mit dem Konverter für SVG in ICO; er fasst wählbare Größen von 16 bis 256 Pixeln in einer Datei zusammen und setzt nicht quadratische Bilder mit transparentem Rand ins Quadrat. Alles läuft im Browser, Ihr unveröffentlichtes Logo verlässt Ihr Gerät nicht.\n\nZum Einbinden legen Sie die Datei als favicon.ico im Stammverzeichnis ab, sodass sie unter ihre-domain.de/favicon.ico erreichbar ist. Zusätzlich verweisen Sie im head-Bereich Ihrer Seiten mit einem link-Element mit rel="icon" auf die Datei. Wenn Sie PNG- oder SVG-Varianten anbieten, nennen Sie diese ebenfalls mit rel="icon" und passender Größenangabe. Content-Management-Systeme wie WordPress bieten dafür meist eine eigene Einstellung, etwa „Website-Icon“ im Customizer.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Browser zeigt noch das alte Icon:** Favicons werden sehr hartnäckig zwischengespeichert. Laden Sie die Seite mit geleertem Cache neu, testen Sie in einem privaten Fenster oder hängen Sie im Link einen Versionsparameter wie ?v=2 an.\n- **Favicon erscheint nicht in der Google-Suche:** Google aktualisiert Favicons nicht sofort. Die Datei muss für den Crawler erreichbar sein, und die Grafik sollte quadratisch und groß genug sein.\n- **Icon wirkt unscharf:** Die ICO enthält nur eine große Bildgröße, die der Browser herunterrechnet. Erzeugen Sie die Datei mit mehreren Größen.\n- **Schwarzer statt transparenter Hintergrund:** Die Vorlage war ein JPG. JPG kennt keine Transparenz; verwenden Sie PNG oder SVG. Hintergründe dazu im Beitrag [WebP oder PNG?](blog:webp-vs-png-unterschied).\n- **ICO lässt sich nicht bearbeiten:** Wandeln Sie die Datei zuerst in PNG um, bearbeiten Sie diese und erzeugen Sie dann eine neue ICO.'
      }
    ],
    faqs: [
      { question: 'Welche Größe sollte ein Favicon haben?', answer: 'Für die favicon.ico sind 16 × 16, 32 × 32 und 48 × 48 Pixel in einer Datei üblich. Zusätzlich empfehlen sich ein Apple Touch Icon mit 180 × 180 Pixeln und für Web-App-Manifeste 192 und 512 Pixel.' },
      { question: 'Brauche ich heute noch eine ICO-Datei?', answer: 'Moderne Browser kommen auch mit PNG oder SVG zurecht. Eine favicon.ico im Stammverzeichnis ist aber als Rückfallebene sinnvoll, weil viele Programme und ältere Browser automatisch danach suchen.' },
      { question: 'Kann ich ein JPG als Favicon verwenden?', answer: 'Technisch ist das möglich, aber nicht empfehlenswert. JPG unterstützt keine Transparenz und neigt bei kleinen Grafiken zu Artefakten. Besser sind PNG oder SVG als Vorlage.' },
      { question: 'Warum sehe ich mein neues Favicon nicht?', answer: 'Browser speichern Favicons lange zwischen. Leeren Sie den Cache, testen Sie in einem privaten Fenster oder ändern Sie den Dateinamen bzw. hängen Sie einen Versionsparameter an.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'webp-bild-als-jpg-speichern',
    title: 'WebP-Bild als JPG speichern: Wege für PC, Mac und Handy',
    metaTitle: 'WebP in JPG umwandeln: Bilder als JPG speichern',
    metaDescription: 'WebP-Bild als JPG speichern: mit Paint, Mac-Vorschau oder kostenlos im Browser ohne Upload. Plus Tipps zu Transparenz, Qualität und Animationen.',
    h1: 'WebP-Bild als JPG speichern: So wandeln Sie WebP in JPG um',
    excerpt: 'Sie speichern ein Bild aus dem Internet und erhalten eine .webp-Datei, die sich nirgends einfügen lässt? Wir zeigen, wie Sie WebP schnell in JPG umwandeln und worauf Sie bei Transparenz und Qualität achten sollten.',
    category: 'images',
    primaryKeyword: 'webp in jpg umwandeln',
    secondaryKeywords: ['webp als jpg speichern', 'webp öffnen', 'webp in jpg windows', 'webp in jpg mac', 'webp datei umwandeln'],
    searchIntent: 'transactional',
    primaryToolSlug: 'webp-in-jpg-umwandeln',
    ctaHeadline: 'WebP jetzt kostenlos in JPG umwandeln',
    ctaButtonLabel: 'WebP in JPG umwandeln',
    relatedToolSlugs: ['webp-in-png-umwandeln', 'jpg-in-webp-umwandeln', 'bild-komprimieren'],
    relatedArticleSlugs: ['webp-oder-jpg-unterschiede-qualitaet-dateigroesse', 'webp-vs-png-unterschied', 'jpg-oder-png-welches-bildformat-ist-besser', 'avif-dateien-oeffnen-umwandeln'],
    directAnswer: 'Um ein WebP-Bild als JPG zu speichern, öffnen Sie es in einem WebP-in-JPG-Konverter und laden das Ergebnis herunter; bei Datei Tools geschieht das lokal im Browser. Alternativ öffnen Sie die Datei unter Windows in Paint und speichern sie als JPEG oder nutzen am Mac die Vorschau mit „Exportieren“. Transparente Bereiche werden im JPG gefüllt.',
    steps: [
      { step: 1, title: 'WebP-Datei auswählen', text: 'Öffnen Sie den WebP-in-JPG-Konverter und ziehen Sie eine oder mehrere WebP-Dateien hinein oder wählen Sie sie über den Dateidialog aus.' },
      { step: 2, title: 'Qualität und Hintergrund festlegen', text: 'Stellen Sie den Qualitätsregler auf einen hohen Wert, etwa 90 %, denn WebP-Bilder sind meist schon komprimiert. Wählen Sie außerdem eine Hintergrundfarbe für transparente Bereiche, zum Beispiel Weiß.' },
      { step: 3, title: 'Umwandeln im Browser', text: 'Die Umwandlung findet auf Ihrem Gerät statt. Auch mehrere Bilder sind in der Regel schnell verarbeitet.' },
      { step: 4, title: 'JPG speichern und verwenden', text: 'Laden Sie die JPG-Dateien herunter und fügen Sie sie in Word, PowerPoint, E-Mails oder Portale ein.' }
    ],
    sections: [
      {
        heading: 'Warum speichert der Browser Bilder als WebP?',
        content: 'Der Browser speichert ein Bild in dem Format, in dem die Website es ausliefert, und viele Websites liefern Bilder heute im WebP-Format aus, weil es bei vergleichbarer Qualität meist kleinere Dateien erzeugt als JPG und Seiten so schneller laden. Wenn Sie ein solches Bild per Rechtsklick und „Bild speichern unter“ sichern, erhalten Sie eben diese WebP-Datei, auch wenn Sie eigentlich ein JPG erwartet hätten.\n\nIm Browser ist das kein Problem. Schwierig wird es, wenn Sie das Bild weiterverwenden möchten: Ältere Office-Versionen, manche E-Mail-Programme, Druckdienste, Bildbearbeitungen oder Upload-Formulare akzeptieren WebP nicht. Die Unterschiede der Formate erklärt der Beitrag [WebP oder JPG: Qualität und Dateigröße](blog:webp-oder-jpg-unterschiede-qualitaet-dateigroesse).\n\nEin Hinweis vorab: Bilder aus dem Internet sind in aller Regel urheberrechtlich geschützt. Das Umwandeln des Formats ändert daran nichts. Verwenden Sie fremde Bilder nur, wenn Sie die nötigen Rechte haben.'
      },
      {
        heading: 'WebP in JPG umwandeln unter Windows und macOS: so geht’s',
        content: 'Windows und macOS können WebP mit Bordmitteln in JPG umwandeln:\n\n- **Windows 10 und 11:** Öffnen Sie die WebP-Datei per Rechtsklick „Öffnen mit > Paint“. Wählen Sie dann „Datei > Speichern unter > JPEG-Bild“. Das funktioniert für einzelne Bilder gut, für viele Dateien ist es mühsam.\n- **macOS:** Öffnen Sie die Datei in der Vorschau, wählen Sie „Ablage > Exportieren“ und als Format JPEG. Mit dem Qualitätsregler bestimmen Sie die Kompression. Mehrere Bilder lassen sich in der Vorschau gemeinsam markieren und exportieren.\n\nEinen Nachteil haben die Bordmittel: Transparente Bereiche werden je nach Programm unterschiedlich gefüllt, manchmal schwarz statt weiß. Prüfen Sie das Ergebnis deshalb, besonders bei Logos und Produktbildern.'
      },
      {
        heading: 'WebP in JPG im Browser umwandeln, auch am Smartphone',
        content: 'Besonders bei mehreren Bildern geht es schneller mit dem [WebP-in-JPG-Konverter](tool:webp-in-jpg-umwandeln). Sie wählen die Dateien aus, der Browser wandelt sie direkt auf Ihrem Gerät um, und Sie speichern die JPGs; es wird nichts an einen Server übertragen. Qualität und Hintergrundfarbe für transparente Bereiche (Weiß, Schwarz oder eine eigene Farbe) legen Sie vorher fest. Das funktioniert am Windows-PC, Mac, Linux-Rechner, iPhone und Android-Smartphone.\n\nAm iPhone liegen gespeicherte Web-Bilder meist in der Fotos-App oder in „Dateien“. Unter Android finden Sie sie im Download-Ordner, etwa über „Files by Google“. Wählen Sie das Bild im Konverter aus und speichern Sie das Ergebnis wieder in der Galerie oder in einem Ordner.\n\nSoll das Bild seine Transparenz behalten, ist der [WebP-in-PNG-Konverter](tool:webp-in-png-umwandeln) die bessere Wahl. Wann PNG und wann WebP sinnvoller ist, steht im Artikel [WebP oder PNG?](blog:webp-vs-png-unterschied).'
      },
      {
        heading: 'Was passiert mit Transparenz, Animation und Qualität?',
        content: 'JPG kann weniger als WebP, deshalb gehen beim Umwandeln Transparenz und Animation verloren:\n\n- **Transparenz:** JPG kennt keine transparenten Bereiche. Beim Umwandeln wird der Hintergrund mit einer Farbe gefüllt, meist Weiß. Für Logos, die auf farbigem Hintergrund stehen sollen, ist das unpassend; nehmen Sie dann PNG.\n- **Animierte WebPs:** WebP kann wie GIF Animationen enthalten. Ein JPG speichert nur ein Einzelbild, die Animation geht verloren. Prüfen Sie, welches Bild im Ergebnis landet.\n- **Doppelte Kompression:** Die meisten WebP-Bilder aus dem Web sind bereits verlustbehaftet komprimiert. Beim Speichern als JPG wird erneut komprimiert. Mit hoher Qualitätsstufe bleibt der zusätzliche Verlust gering, mit niedriger summieren sich Artefakte.\n- **Keine Qualitätsverbesserung:** Ein kleines, unscharfes WebP wird durch die Umwandlung nicht schärfer oder größer. Die Bildinformationen bleiben die gleichen.'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Dateiendung umbenannt, aber Bild öffnet nicht:** Das Ändern von .webp in .jpg wandelt nichts um. Manche Programme erkennen den echten Inhalt und melden einen Fehler. Die Datei muss tatsächlich konvertiert werden.\n- **JPG ist größer als das WebP:** Das ist normal. WebP komprimiert effizienter, das gleiche Bild braucht als JPG mehr Speicher. Bei Bedarf reduzieren Sie die Größe danach mit einem Bildkompressor.\n- **Hintergrund ist schwarz:** Das Programm hat den transparenten Bereich schwarz gefüllt. Wählen Sie im Konverter Weiß als Hintergrundfarbe oder speichern Sie als PNG.\n- **Bild ist eigentlich AVIF:** Manche Websites liefern statt WebP das neuere AVIF-Format. Dafür gibt es eigene Konverter; Hintergründe im Beitrag [AVIF-Dateien öffnen und umwandeln](blog:avif-dateien-oeffnen-umwandeln).'
      }
    ],
    faqs: [
      { question: 'Wie speichere ich ein WebP-Bild als JPG?', answer: 'Am einfachsten öffnen Sie die Datei in einem WebP-in-JPG-Konverter und speichern das Ergebnis. Unter Windows geht es auch mit Paint über „Speichern unter > JPEG-Bild“, am Mac mit der Vorschau über „Ablage > Exportieren“.' },
      { question: 'Verliert das Bild beim Umwandeln an Qualität?', answer: 'Da JPG verlustbehaftet komprimiert, kann ein geringer zusätzlicher Verlust entstehen. Mit einer hohen Qualitätsstufe ist dieser in der Praxis kaum sichtbar.' },
      { question: 'Was passiert mit transparenten Bereichen?', answer: 'JPG unterstützt keine Transparenz. Transparente Bereiche werden mit einer Hintergrundfarbe gefüllt, meist Weiß. Wenn Sie Transparenz brauchen, wandeln Sie WebP in PNG um.' },
      { question: 'Kann ich mehrere WebP-Dateien auf einmal umwandeln?', answer: 'Ja, Sie können mehrere Dateien gleichzeitig auswählen. Die Umwandlung läuft lokal im Browser, die Dauer hängt von Anzahl und Größe der Bilder sowie von Ihrem Gerät ab.' },
      { question: 'Kann ich verhindern, dass der Browser Bilder als WebP speichert?', answer: 'Nur bedingt. Welches Format Sie erhalten, entscheidet die Website. Manche Seiten liefern je nach Browser unterschiedliche Formate aus, verlässlich steuern lässt sich das aber nicht. Der praktikable Weg ist, das gespeicherte Bild bei Bedarf umzuwandeln.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'bild-zuschneiden-seitenverhaeltnis',
    title: 'Bild zuschneiden: Das richtige Seitenverhältnis für jeden Zweck',
    metaTitle: 'Bild zuschneiden: 1:1, 4:5, 16:9 & Co. erklärt',
    metaDescription: 'Bild zuschneiden im richtigen Seitenverhältnis: 1:1, 4:5, 9:16, 16:9 und Passfoto-Formate erklärt. Kostenlos im Browser ohne Upload zuschneiden.',
    h1: 'Bild zuschneiden: Seitenverhältnisse von 1:1 bis 16:9 richtig wählen',
    excerpt: 'Profilbild, Instagram-Beitrag, Präsentation oder Bewerbungsfoto: Jeder Zweck verlangt ein anderes Format. Wir erklären die gängigen Seitenverhältnisse und zeigen, wie Sie Bilder sauber zuschneiden, ohne Wichtiges abzuschneiden.',
    category: 'images',
    primaryKeyword: 'bild zuschneiden',
    secondaryKeywords: ['seitenverhältnis bild', 'bild quadratisch zuschneiden', 'foto 16:9 zuschneiden', 'bild 4:5 zuschneiden', 'foto zuschneiden online'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-zuschneiden',
    ctaHeadline: 'Bild jetzt kostenlos im passenden Format zuschneiden',
    ctaButtonLabel: 'Bild zuschneiden',
    relatedToolSlugs: ['bild-in-kreis-zuschneiden', 'bildgroesse-aendern', 'bild-drehen', 'bild-komprimieren'],
    relatedArticleSlugs: ['bildgroesse-aendern-richtige-aufloesung-pixel', 'bild-auf-100-kb-verkleinern', 'favicon-erstellen-png-in-ico', 'dpi-aendern-fuer-druck', 'bild-online-verkleinern-abmessungen'],
    directAnswer: 'Beim Zuschneiden entfernen Sie Bildränder und legen das Seitenverhältnis fest, also das Verhältnis von Breite zu Höhe. Gängig sind 1:1 für Profilbilder, 4:5 für Hochformat-Beiträge, 9:16 für Stories, 16:9 für Präsentationen und Videos sowie 3:2 und 4:3 für klassische Fotos. Wählen Sie zuerst das Verhältnis, dann den Bildausschnitt.',
    steps: [
      { step: 1, title: 'Bild auswählen', text: 'Öffnen Sie das Zuschneide-Tool und ziehen Sie das Foto hinein. Das Bild wird lokal in Ihrem Browser geöffnet.' },
      { step: 2, title: 'Seitenverhältnis festlegen', text: 'Wählen Sie ein festes Verhältnis wie 1:1 oder 16:9 oder ziehen Sie den Rahmen frei auf, wenn das gewünschte Format nicht vorgegeben ist.' },
      { step: 3, title: 'Ausschnitt positionieren', text: 'Verschieben Sie den Rahmen, bis das Motiv gut platziert ist. Achten Sie auf genug Abstand zu Köpfen, Händen und wichtigen Details.' },
      { step: 4, title: 'Zugeschnittenes Bild speichern', text: 'Speichern Sie das Ergebnis. Bei Bedarf verkleinern Sie es anschließend auf die benötigten Pixelmaße.' }
    ],
    sections: [
      {
        heading: 'Was bedeutet das Seitenverhältnis eines Bildes?',
        content: 'Das Seitenverhältnis beschreibt, wie breit ein Bild im Verhältnis zu seiner Höhe ist. Ein Bild mit 1200 × 800 Pixeln hat das Verhältnis 3:2, eines mit 1920 × 1080 Pixeln das Verhältnis 16:9. Das Verhältnis sagt also nichts über die Auflösung aus, sondern nur über die Form.\n\nWarum das wichtig ist: Plattformen, Präsentationsvorlagen und Druckformate haben feste Rahmen. Passt Ihr Bild nicht hinein, wird es automatisch beschnitten, mit Rändern versehen oder verzerrt – und dabei verschwindet womöglich genau der Teil, auf den es ankommt. Wer selbst zuschneidet, entscheidet bewusst über den Ausschnitt.\n\nZuschneiden ist dabei etwas anderes als Verkleinern: Beim Zuschneiden fallen Bildteile weg, beim Verkleinern bleibt der ganze Inhalt erhalten, nur mit weniger Pixeln. Mehr dazu im Artikel [Bildgröße ändern: richtige Auflösung in Pixeln](blog:bildgroesse-aendern-richtige-aufloesung-pixel).'
      },
      {
        heading: 'Welches Seitenverhältnis eignet sich für welchen Zweck?',
        content: 'Welches Seitenverhältnis passt, hängt davon ab, wo das Bild erscheint. Die Pixelangaben in der Tabelle sind übliche Beispiele; die Vorgaben der Plattformen können sich ändern.\n\n| Verhältnis | Typischer Einsatz | Übliche Pixelmaße |\n|---|---|---|\n| 1:1 | Profilbilder, Produktfotos, Icons | 1080 × 1080 |\n| 4:5 | Hochformat-Beiträge in sozialen Netzwerken | 1080 × 1350 |\n| 9:16 | Stories, Reels, Shorts | 1080 × 1920 |\n| 16:9 | Präsentationen, Videos, Banner | 1920 × 1080 |\n| 3:2 | Kamerafotos, Abzug 10 × 15 cm | 3000 × 2000 |\n| 4:3 | Smartphone-Kameras | 4000 × 3000 |\n\n- **4:5** nimmt im Feed mehr Fläche ein als ein Quadrat und ist deshalb für Bildbeiträge beliebt.\n- **9:16** füllt den Smartphone-Bildschirm im Hochformat und passt auch für Hintergrundbilder.\n- **3:2** ist das klassische Kleinbildformat vieler Digitalkameras, **4:3** das Standardformat vieler Smartphone-Kameras.\n- **7:9 bzw. 35 × 45 mm** ist das übliche Format für Passbilder und klassische Bewerbungsfotos.\n\nFür quadratische Website-Symbole lesen Sie [Favicon erstellen](blog:favicon-erstellen-png-in-ico).'
      },
      {
        heading: 'Kann ich ein Passfoto selbst zuschneiden?',
        content: 'Für Bewerbungen und nicht amtliche Ausweise ja, für Personalausweis und Reisepass nicht. Ein Bild im Format 35 × 45 mm entspricht dem Seitenverhältnis 7:9 und lässt sich leicht zuschneiden. Für Bewerbungen, Vereinsausweise, Schülerausweise oder Mitarbeiterkarten ist das völlig ausreichend.\n\nFür amtliche Ausweisdokumente sieht es anders aus. Seit dem 1. Mai 2025 müssen Lichtbilder für Personalausweis und Reisepass in Deutschland digital erstellt und auf gesichertem Weg an die Behörde übermittelt werden, etwa durch zertifizierte Fotostudios oder direkt im Bürgeramt. Ein selbst zugeschnittenes Foto wird dafür nicht akzeptiert. Darüber hinaus gelten biometrische Vorgaben zu Kopfgröße, Blickrichtung und Hintergrund.\n\nFür Bewerbungsportale, die eine bestimmte Dateigröße verlangen, schneiden Sie das Foto zuerst zu und verkleinern es dann. Die genaue Vorgehensweise beschreibt [Bild auf 100 KB verkleinern](blog:bild-auf-100-kb-verkleinern).'
      },
      {
        heading: 'Bild zuschneiden am Smartphone, PC und im Browser',
        content: 'Alle gängigen Systeme haben eine Zuschneidefunktion an Bord:\n\n- **iPhone:** Foto in der Fotos-App öffnen, „Bearbeiten“ und dann das Zuschneide-Symbol wählen. Über das Format-Symbol stellen Sie Verhältnisse wie Quadrat, 16:9 oder 4:5 ein.\n- **Android:** In Google Fotos auf „Bearbeiten“ und „Zuschneiden“ tippen; auch hier lassen sich feste Verhältnisse wählen.\n- **Windows:** In der Fotos-App über „Bild bearbeiten“ und „Zuschneiden“, mit vorgegebenen Seitenverhältnissen.\n- **Mac:** In der Vorschau einen Bereich mit dem Rechteckwerkzeug markieren und „Werkzeuge > Beschneiden“ wählen.\n\nPlattformunabhängig funktioniert das [Zuschneide-Tool von Datei Tools](tool:bild-zuschneiden) im Browser; das Bild wird dabei auf Ihrem Gerät bearbeitet und nicht übertragen. Es bietet feste Verhältnisse für 1:1, 4:3, 3:4, 3:2, 16:9 und 9:16 sowie einen frei ziehbaren Rahmen. Für Formate wie 4:5 oder 7:9 ziehen Sie den Rahmen frei auf und orientieren sich an den angezeigten Pixelmaßen des Ausschnitts. PNG-Dateien bleiben PNG, andere Formate werden als JPG gespeichert. Für runde Profilbilder gibt es zusätzlich ein Werkzeug, das Bilder kreisförmig zuschneidet.'
      },
      {
        heading: 'Gestaltungstipps und typische Probleme',
        content: '- **Drittel-Regel:** Platzieren Sie das Hauptmotiv nicht immer mittig, sondern auf einer der gedachten Linien, die das Bild horizontal und vertikal in Drittel teilen. Das wirkt oft lebendiger.\n- **Kein Anschnitt an Gelenken:** Bei Personen nicht genau an Knien, Ellbogen oder Handgelenken schneiden, das wirkt unglücklich.\n- **Blickrichtung beachten:** Lassen Sie in Blickrichtung etwas mehr Raum.\n- **Bild zu klein nach dem Zuschneiden:** Starkes Zuschneiden reduziert die Pixelzahl. Für den Druck kann das Bild dann zu wenig Auflösung haben; Hintergründe dazu in [DPI ändern für den Druck](blog:dpi-aendern-fuer-druck).\n- **Bild ist schief:** Drehen Sie das Foto vor dem Zuschneiden gerade, sonst wird der Ausschnitt unnötig klein.\n- **Verzerrte Gesichter:** Das passiert beim Strecken, nicht beim Zuschneiden. Ändern Sie die Form eines Bildes immer durch Zuschneiden, nie durch ungleichmäßiges Skalieren.'
      }
    ],
    faqs: [
      { question: 'Welches Seitenverhältnis hat ein Passbild?', answer: 'Das übliche Format ist 35 × 45 mm, was einem Seitenverhältnis von 7:9 entspricht. Für Personalausweis und Reisepass gelten in Deutschland zusätzlich biometrische Vorgaben, und das Foto muss digital über einen zugelassenen Weg übermittelt werden.' },
      { question: 'Verliert ein Bild beim Zuschneiden an Qualität?', answer: 'Die verbleibenden Pixel bleiben unverändert, es fallen nur Bildteile weg. Allerdings sinkt die Gesamtauflösung. Wird das zugeschnittene Bild danach stark vergrößert, kann es unscharf wirken.' },
      { question: 'Was ist der Unterschied zwischen 16:9 und 4:3?', answer: '16:9 ist ein breites Querformat, wie es bei Fernsehern, Monitoren und Präsentationen üblich ist. 4:3 ist etwas höher und entspricht dem Standardformat vieler Smartphone-Kameras.' },
      { question: 'Kann ich ein Bild ohne App zuschneiden?', answer: 'Ja. Neben den Bordmitteln von Windows, macOS, iOS und Android können Sie Bilder im Browser zuschneiden. Bei Datei Tools wird das Bild dabei lokal verarbeitet und nicht übertragen.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'dpi-aendern-fuer-druck',
    title: 'DPI ändern für den Druck: Was 300 dpi wirklich bedeuten',
    metaTitle: 'DPI ändern: Auflösung für den Druck richtig setzen',
    metaDescription: 'DPI ändern für den Druck: Warum Pixel wichtiger sind als der DPI-Wert, was 300 dpi bedeuten und wie Sie die Auflösung kostenlos ohne Upload anpassen.',
    h1: 'DPI ändern für den Druck: Pixel, Auflösung und der 300-dpi-Mythos',
    excerpt: 'Die Druckerei verlangt 300 dpi, Ihr Foto hat angeblich nur 72? Oft ist das kein Problem. Wir erklären, was der DPI-Wert wirklich aussagt, wie Sie die nötige Pixelzahl berechnen und wann Sie den Wert einfach anpassen können.',
    category: 'images',
    primaryKeyword: 'dpi ändern',
    secondaryKeywords: ['bild auf 300 dpi ändern', 'dpi pixel unterschied', 'auflösung für druck', 'dpi berechnen', 'bild dpi erhöhen'],
    searchIntent: 'informational',
    primaryToolSlug: 'dpi-aendern',
    ctaHeadline: 'DPI-Wert Ihres Bildes jetzt kostenlos anpassen',
    ctaButtonLabel: 'DPI ändern',
    relatedToolSlugs: ['bildgroesse-aendern', 'bild-skalieren', 'jpg-in-pdf-umwandeln'],
    relatedArticleSlugs: ['bildgroesse-aendern-richtige-aufloesung-pixel', 'bilder-ohne-qualitaetsverlust-verkleinern', 'bild-zuschneiden-seitenverhaeltnis', 'jpeg-verkleinern-aufloesung-und-dateigroesse'],
    directAnswer: 'Der DPI-Wert eines digitalen Bildes ist nur eine Angabe dafür, wie groß es gedruckt werden soll; entscheidend für die Druckqualität ist die Pixelzahl. Ein Foto mit 3000 × 2000 Pixeln ergibt bei 300 dpi einen Druck von etwa 25,4 × 16,9 cm, und hat das Bild genug Pixel, können Sie den DPI-Wert ändern, ohne die Pixel neu zu berechnen.',
    steps: [
      { step: 1, title: 'Pixelmaße prüfen', text: 'Sehen Sie in den Dateieigenschaften nach, wie viele Pixel Ihr Bild in Breite und Höhe hat.' },
      { step: 2, title: 'Benötigte Pixel berechnen', text: 'Teilen Sie die gewünschte Druckgröße in Zentimetern durch 2,54 und multiplizieren Sie mit dem geforderten DPI-Wert. So erhalten Sie die nötige Pixelzahl.' },
      { step: 3, title: 'DPI-Wert anpassen', text: 'Reichen die Pixel aus, öffnen Sie das JPG- oder PNG-Bild im DPI-Tool und setzen den geforderten Wert, etwa 300. Die Pixelmaße bleiben dabei unverändert.' },
      { step: 4, title: 'Ergebnis speichern und prüfen', text: 'Speichern Sie das Bild und kontrollieren Sie in den Eigenschaften oder in der Druckvorschau die neue Angabe.' }
    ],
    sections: [
      {
        heading: 'Was ist der Unterschied zwischen DPI, PPI und Pixeln?',
        content: 'Pixel bestimmen, wie viele Details ein Bild enthält, DPI und PPI nur, wie dicht diese Pixel gedruckt werden. Ein digitales Bild besteht aus Pixeln, zum Beispiel 4000 × 3000. Diese Zahl bestimmt, wie viele Details das Bild enthält. Eine physische Größe in Zentimetern hat das Bild zunächst nicht.\n\nErst wenn es gedruckt wird, muss festgelegt werden, wie dicht die Pixel auf dem Papier liegen. Dafür steht **PPI** (Pixels per Inch, Pixel pro Zoll). Im Alltag hat sich dafür der Begriff **DPI** (Dots per Inch) eingebürgert, obwohl DPI streng genommen die Druckpunkte eines Druckers beschreibt. Wenn Druckereien und Portale „300 dpi“ verlangen, meinen sie fast immer 300 Pixel pro Zoll.\n\nDer DPI-Wert, der in einer Bilddatei gespeichert ist, ist also nur eine Metainformation: eine Empfehlung, wie groß das Bild gedruckt werden soll. Ein Bild mit 72 dpi und eines mit 300 dpi können exakt dieselben Pixel enthalten. Mehr zum Zusammenhang zwischen Pixeln und Abmessungen lesen Sie unter [Bildgröße ändern: richtige Auflösung in Pixeln](blog:bildgroesse-aendern-richtige-aufloesung-pixel).'
      },
      {
        heading: 'Wie viele Pixel brauche ich für einen Druck?',
        content: 'Die nötige Pixelzahl ergibt sich aus Druckgröße und DPI-Wert; ein Zoll entspricht dabei 2,54 Zentimetern:\n\n**Pixel = Druckgröße in cm ÷ 2,54 × DPI**\n\nDaraus ergeben sich diese gerundeten Werte:\n\n| Druckformat | Pixel bei 300 dpi | Pixel bei 150 dpi |\n|---|---|---|\n| 10 × 15 cm | 1181 × 1772 | 591 × 886 |\n| 13 × 18 cm | 1535 × 2126 | 768 × 1063 |\n| DIN A4 (21 × 29,7 cm) | 2480 × 3508 | 1240 × 1754 |\n| DIN A3 (29,7 × 42 cm) | 3508 × 4961 | 1754 × 2480 |\n\nUmgekehrt gilt: **Druckgröße in cm = Pixel ÷ DPI × 2,54.** Ein Foto mit 3000 × 2000 Pixeln ergibt bei 300 dpi rund 25,4 × 16,9 cm, bei 150 dpi rund 50,8 × 33,9 cm.\n\nWenn Ihr Bild genug Pixel für die gewünschte Größe hat, ist alles in Ordnung, egal welcher DPI-Wert in der Datei steht. Fehlen Pixel, hilft kein Ändern des Werts: Hochrechnen erfindet keine Details, sondern macht das Bild nur größer und weicher.'
      },
      {
        heading: 'Braucht jeder Druck 300 dpi?',
        content: 'Nein: 300 dpi sind ein bewährter Richtwert für Drucke, die aus normaler Leseentfernung betrachtet werden, etwa Fotos, Flyer oder Broschüren, aber keine Pflicht für jedes gedruckte Bild.\n\nEntscheidend ist der Betrachtungsabstand. Ein Poster an der Wand wird aus einem bis zwei Metern betrachtet; hier reichen oft 150 dpi oder weniger, ohne dass jemand einen Unterschied bemerkt. Großflächige Banner und Plakatwände kommen mit noch deutlich geringerer Auflösung aus. Umgekehrt profitieren sehr feine Inhalte wie kleine Schrift in Grafiken von höheren Werten.\n\nFragen Sie im Zweifel bei der Druckerei nach, welche Auflösung für Ihr Format sinnvoll ist. Viele Druckdienste geben bei Bestellung auch eine Warnung aus, wenn ein Bild für die gewählte Größe zu wenig Pixel hat.'
      },
      {
        heading: 'Wie ändere ich den DPI-Wert, ohne das Bild zu verschlechtern?',
        content: 'Den DPI-Wert ändern Sie ohne Qualitätsverlust, indem Sie nur die Angabe anpassen und die Pixel nicht neu berechnen. Grundsätzlich gibt es zwei Arten:\n\n1. **Ohne Neuberechnung:** Nur die Metainformation wird angepasst, die Pixel bleiben exakt gleich. Das Bild wird dadurch nicht besser oder schlechter, nur die vorgeschlagene Druckgröße ändert sich. Das ist der richtige Weg, wenn ein Portal oder eine Druckerei „300 dpi“ verlangt und Ihr Bild genug Pixel hat.\n2. **Mit Neuberechnung:** Die Pixelzahl wird verändert, das Bild wird also skaliert. Verkleinern ist meist unproblematisch, Vergrößern bringt keine neuen Details.\n\nMit dem [DPI-Tool von Datei Tools](tool:dpi-aendern) setzen Sie den Wert für JPG- und PNG-Bilder direkt im Browser, etwa über die Vorgaben 72, 96, 150, 300 oder 600 dpi. Die Pixelmaße bleiben gleich; JPG-Dateien werden dabei mit hoher Qualitätsstufe neu gespeichert, PNG-Dateien verlustfrei. Andere Metadaten wie EXIF-Angaben enthält das Ergebnis nicht mehr. Am Mac geht es auch in der Vorschau über „Werkzeuge > Größenkorrektur“: Deaktivieren Sie „Bild neu berechnen“, dann ändern Sie nur die Auflösungsangabe. Unter Windows sehen Sie den aktuellen Wert per Rechtsklick in „Eigenschaften > Details“. Wenn Sie die Pixelmaße tatsächlich ändern wollen, nutzen Sie [Bildgröße ändern](tool:bildgroesse-aendern); worauf Sie dabei achten sollten, steht in [Bilder ohne Qualitätsverlust verkleinern](blog:bilder-ohne-qualitaetsverlust-verkleinern).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Portal meldet „Auflösung zu gering“ trotz vieler Pixel:** Das Portal liest den DPI-Wert aus der Datei. Setzen Sie ihn ohne Neuberechnung auf den geforderten Wert.\n- **Bild hat 72 dpi:** Das ist ein häufiger Standardwert von Software und sagt nichts über die Qualität. Entscheidend ist die Pixelzahl.\n- **Druck wirkt unscharf:** Das Bild hatte für die Druckgröße zu wenig Pixel. Wählen Sie ein kleineres Format oder eine Originaldatei mit höherer Auflösung.\n- **Bild aus Messenger oder Social Media:** Diese Dienste verkleinern Fotos oft stark. Verwenden Sie für den Druck immer das Original von der Kamera oder dem Smartphone.\n- **Mehrere Bilder für ein Druck-PDF:** Fassen Sie die fertigen Bilder mit einem JPG-in-PDF-Konverter zusammen; die Pixel bleiben dabei erhalten.'
      }
    ],
    faqs: [
      { question: 'Wird ein Bild besser, wenn ich die DPI erhöhe?', answer: 'Nein. Ohne Neuberechnung ändert sich nur die gespeicherte Angabe, die Pixel bleiben gleich. Mit Neuberechnung entstehen zwar mehr Pixel, aber keine neuen Details. Die Qualität hängt von der ursprünglichen Pixelzahl ab.' },
      { question: 'Wie viele Pixel brauche ich für einen A4-Druck?', answer: 'Bei 300 dpi sind es etwa 2480 × 3508 Pixel. Für viele Zwecke reichen auch 200 dpi, was etwa 1654 × 2339 Pixeln entspricht.' },
      { question: 'Was ist der Unterschied zwischen DPI und PPI?', answer: 'PPI beschreibt die Pixeldichte eines digitalen Bildes, DPI die Druckpunkte eines Druckers. Im Alltag werden beide Begriffe meist gleichbedeutend verwendet, wenn es um die Auflösung von Bildern für den Druck geht.' },
      { question: 'Warum zeigt mein Bild 72 dpi an?', answer: '72 dpi ist ein verbreiteter Standardwert vieler Programme und Kameras. Er hat keine Bedeutung für die Bildqualität. Hat das Bild genug Pixel, können Sie den Wert für den Druck einfach anpassen.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'bild-drehen-handyfoto-falsch-herum',
    title: 'Handyfoto falsch herum? Bild drehen und dauerhaft speichern',
    metaTitle: 'Bild drehen: Wenn das Handyfoto falsch herum ist',
    metaDescription: 'Handyfoto falsch herum? Warum Bilder wegen der EXIF-Ausrichtung gedreht erscheinen und wie Sie sie dauerhaft richtig drehen – kostenlos ohne Upload.',
    h1: 'Bild drehen: Warum Handyfotos falsch herum erscheinen und wie Sie es dauerhaft beheben',
    excerpt: 'Auf dem Smartphone steht das Foto richtig, in der E-Mail oder im Portal liegt es plötzlich auf der Seite. Schuld ist meist die EXIF-Ausrichtung. Wir erklären das Phänomen und zeigen, wie Sie Bilder dauerhaft korrekt drehen.',
    category: 'images',
    primaryKeyword: 'bild drehen',
    secondaryKeywords: ['foto falsch herum', 'bild dauerhaft drehen', 'exif orientierung', 'handyfoto gedreht', 'bild um 90 grad drehen'],
    searchIntent: 'transactional',
    primaryToolSlug: 'bild-drehen',
    ctaHeadline: 'Bild jetzt kostenlos dauerhaft richtig drehen',
    ctaButtonLabel: 'Bild drehen',
    relatedToolSlugs: ['bild-spiegeln', 'bild-metadaten-entfernen', 'pdf-drehen', 'bild-zuschneiden'],
    relatedArticleSlugs: ['bild-metadaten-exif-entfernen', 'pdf-drehen-und-dauerhaft-speichern', 'iphone-fotos-als-jpg-speichern', 'bild-zuschneiden-seitenverhaeltnis'],
    directAnswer: 'Handyfotos erscheinen oft falsch herum, weil das Smartphone die Pixel in Sensorausrichtung speichert und die richtige Drehung nur als EXIF-Angabe vermerkt, die manche Programme ignorieren. Die Lösung ist, das Bild dauerhaft zu drehen, sodass die Pixel selbst richtig stehen – etwa in der Fotos-App oder mit einem Dreh-Werkzeug im Browser.',
    steps: [
      { step: 1, title: 'Foto auswählen', text: 'Öffnen Sie das Dreh-Tool und ziehen Sie das falsch ausgerichtete Foto hinein. Das Bild wird lokal im Browser geöffnet.' },
      { step: 2, title: 'Richtung wählen', text: 'Drehen Sie das Bild in 90-Grad-Schritten nach links oder rechts, bis es in der Vorschau richtig steht.' },
      { step: 3, title: 'Dauerhaft speichern', text: 'Speichern Sie das Ergebnis. Die Pixel sind nun tatsächlich gedreht, unabhängig von der EXIF-Angabe.' },
      { step: 4, title: 'Gegenprobe machen', text: 'Öffnen Sie das gespeicherte Bild in einem anderen Programm oder fügen Sie es in eine E-Mail ein, um sicherzugehen, dass es überall richtig angezeigt wird.' }
    ],
    sections: [
      {
        heading: 'Warum erscheinen Handyfotos falsch herum?',
        content: 'Handyfotos erscheinen falsch herum, wenn ein Programm die gespeicherte Ausrichtungsangabe nicht auswertet. Der Bildsensor eines Smartphones ist fest eingebaut und hat eine feste Ausrichtung, meist Querformat. Halten Sie das Telefon hochkant, nimmt der Sensor das Bild trotzdem quer auf. Statt die Pixel aufwendig umzurechnen, speichert die Kamera sie in Sensorrichtung und schreibt in die EXIF-Metadaten einen Vermerk: „Dieses Bild bitte um 90 Grad gedreht anzeigen.“\n\nDer EXIF-Eintrag „Orientation“ kennt acht Werte für die verschiedenen Kombinationen aus Drehung und Spiegelung. Die Fotos-App des Smartphones, aktuelle Browser und moderne Bildbetrachter werten diesen Eintrag aus und zeigen das Bild korrekt an.\n\nProbleme entstehen, wenn eine Software den Eintrag ignoriert. Das kommt bei älteren Programmen, manchen E-Mail-Clients, einigen Content-Management-Systemen, Druckdiensten oder Upload-Formularen vor. Dann sehen Sie die Pixel so, wie sie wirklich gespeichert sind: auf der Seite oder auf dem Kopf.'
      },
      {
        heading: 'Warum liegt ein Foto nach dem Entfernen der Metadaten falsch?',
        content: 'Mit den Metadaten verschwindet auch die Ausrichtungsangabe. Wer vor dem Teilen die Metadaten entfernt, etwa um den GPS-Standort zu löschen, entfernt dabei auch die Ausrichtungsangabe. Waren die Pixel nicht tatsächlich gedreht, liegt das Bild danach in jedem Programm falsch herum.\n\nDie richtige Reihenfolge ist deshalb:\n\n1. Bild dauerhaft drehen, sodass die Pixel richtig stehen.\n2. Erst danach Metadaten entfernen.\n\nGute Werkzeuge berücksichtigen die Ausrichtung beim Entfernen der Metadaten automatisch. Verlassen sollten Sie sich darauf aber nicht, eine kurze Kontrolle danach schadet nie. Warum das Entfernen von EXIF-Daten vor dem Teilen trotzdem sinnvoll ist, lesen Sie im Beitrag [EXIF-Daten aus Bildern entfernen](blog:bild-metadaten-exif-entfernen).'
      },
      {
        heading: 'Wie drehe ich ein Bild dauerhaft im Browser?',
        content: 'Mit dem Tool [Bild drehen](tool:bild-drehen) richten Sie Fotos in 90-Grad-Schritten aus und speichern sie mit korrekt gedrehten Pixeln. Die Bearbeitung findet in Ihrem Browser statt, das Foto wird nicht an einen Server übertragen – bei Familienfotos, Bildern von Ausweisen oder abfotografierten Unterlagen ein klarer Vorteil.\n\nZur Qualität: JPG-Bilder lassen sich theoretisch in 90-Grad-Schritten verlustfrei drehen, wenn die Software die komprimierten Daten nur umsortiert. Das Dreh-Tool von Datei Tools speichert JPG-Bilder dagegen neu, mit hoher Qualitätsstufe; PNG-Dateien bleiben verlustfrei, WebP-, GIF- und BMP-Dateien werden als JPG gespeichert. Weil das Bild neu geschrieben wird, enthält das Ergebnis keine EXIF-Metadaten mehr und damit auch keinen alten Ausrichtungsvermerk, der es erneut verdrehen könnte. Mehrfaches Drehen und Speichern sollten Sie trotzdem vermeiden.\n\nIst das Bild seitenverkehrt statt gedreht, etwa bei Selfies mit Schrift im Hintergrund, hilft das Tool zum Spiegeln. Für gescannte Dokumente im PDF-Format lesen Sie [PDF drehen und dauerhaft speichern](blog:pdf-drehen-und-dauerhaft-speichern).'
      },
      {
        heading: 'Bild drehen auf iPhone, Android, Windows und Mac',
        content: 'Alle gängigen Systeme können Fotos mit Bordmitteln drehen:\n\n- **iPhone:** Foto in der Fotos-App öffnen, „Bearbeiten“, dann das Zuschneide-Symbol wählen und über das Dreh-Symbol oben links in 90-Grad-Schritten drehen. Mit „Fertig“ speichern.\n- **Android:** In Google Fotos „Bearbeiten“, dann „Zuschneiden“ und das Dreh-Symbol antippen.\n- **Windows:** Im Explorer per Rechtsklick „Nach rechts drehen“ oder „Nach links drehen“ wählen, alternativ in der Fotos-App.\n- **Mac:** In der Vorschau mit Befehl+R nach rechts oder Befehl+L nach links drehen und sichern. Im Finder gibt es zudem eine Schnellaktion zum Drehen.\n\nNicht jedes Bordmittel dreht die Pixel tatsächlich; manche ändern nur den EXIF-Vermerk. Wenn ein Bild nach dem Drehen in einem anderen Programm wieder falsch erscheint, nutzen Sie ein Werkzeug, das die Pixel neu ausrichtet. Hintergründe zu iPhone-Fotos und HEIC finden Sie unter [iPhone-Fotos als JPG speichern](blog:iphone-fotos-als-jpg-speichern).'
      },
      {
        heading: 'Typische Probleme und Lösungen',
        content: '- **Foto steht am Handy richtig, im Portal falsch:** Das Portal ignoriert die EXIF-Ausrichtung. Drehen Sie das Bild dauerhaft und reichen Sie es im Portal erneut ein.\n- **Foto ist auch am Handy falsch:** Das Smartphone hat die Lage bei der Aufnahme falsch erkannt, typisch beim Fotografieren flach liegender Dokumente von oben. Drehen Sie das Bild manuell.\n- **Nach dem Drehen ist das Bild doppelt gedreht:** Das Programm hat die Pixel gedreht, aber den alten EXIF-Vermerk behalten. Entfernen Sie die Metadaten oder drehen Sie mit einem anderen Werkzeug.\n- **Viele Fotos betroffen:** Drehen Sie zuerst ein Testbild und prüfen Sie es, bevor Sie eine ganze Serie bearbeiten.\n- **Leichte Schieflage:** Für kleine Korrekturen, etwa einen schiefen Horizont, nutzen Sie die Begradigungsfunktion der Fotos-App und schneiden das Bild anschließend zu.'
      }
    ],
    faqs: [
      { question: 'Warum ist mein Foto in der E-Mail gedreht?', answer: 'Das Smartphone speichert die Drehung nur als EXIF-Angabe. Manche E-Mail-Programme ignorieren diese Angabe und zeigen die Pixel in Sensorausrichtung an. Drehen Sie das Bild dauerhaft, dann erscheint es überall richtig.' },
      { question: 'Verliert ein Bild beim Drehen an Qualität?', answer: 'Das Drehen selbst ist in 90-Grad-Schritten verlustfrei möglich. Wird das JPG danach aber neu gespeichert, entsteht eine minimale zusätzliche Kompression, die bei hoher Qualitätsstufe nicht sichtbar ist.' },
      { question: 'Was ist die EXIF-Ausrichtung?', answer: 'Ein Eintrag in den Bildmetadaten, der angibt, wie ein Foto gedreht oder gespiegelt angezeigt werden soll. Er erspart der Kamera das Umrechnen der Pixel, wird aber nicht von jeder Software beachtet.' },
      { question: 'Kann ich mehrere Fotos gleichzeitig drehen?', answer: 'Mit Bordmitteln wie dem Windows-Explorer oder der Mac-Vorschau können Sie mehrere markierte Bilder auf einmal drehen. Prüfen Sie danach stichprobenartig, ob die Pixel tatsächlich gedreht wurden.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
];
