import type { BlogArticle } from './types';

/**
 * Ratgeber-Cluster „Studium & Schule“.
 * Alle beschriebenen Werkzeuge arbeiten lokal im Browser – Dateien verlassen das Gerät nicht.
 */
export const STUDY_CLUSTER_ARTICLES: BlogArticle[] = [
  {
    slug: 'vorlesungsfolien-zu-einer-pdf-zusammenfuegen',
    title: 'Vorlesungsfolien und Skripte zu einer PDF zusammenfügen',
    metaTitle: 'Vorlesungsfolien zu einer PDF zusammenfügen | Datei Tools',
    metaDescription: 'Folien und Skripte eines Semesters zu einer durchsuchbaren PDF bündeln: zusammenfügen, sortieren, Seitenzahlen setzen – kostenlos im Browser, ohne Upload.',
    h1: 'Vorlesungsfolien und Skripte zu einer PDF zusammenfügen und durchsuchbar machen',
    excerpt: 'Zwölf Foliensätze, drei Übungsblätter und ein eingescanntes Skript: Für die Prüfungsvorbereitung ist eine einzige, durchsuchbare PDF deutlich praktischer. So bündeln Sie Ihre Unterlagen sauber.',
    category: 'pdf',
    primaryKeyword: 'vorlesungsfolien zusammenfügen',
    secondaryKeywords: ['skript pdf zusammenfügen', 'folien zu einer pdf', 'vorlesung pdf durchsuchbar', 'lernunterlagen pdf bündeln'],
    searchIntent: 'informational',
    primaryToolSlug: 'pdf-zusammenfuegen',
    ctaHeadline: 'Lernunterlagen jetzt bündeln',
    ctaButtonLabel: 'PDFs zusammenfügen',
    relatedToolSlugs: ['pdf-seiten-neu-anordnen', 'pdf-durchsuchbar-machen', 'pdf-seiten-nummerieren'],
    relatedArticleSlugs: ['pdf-zusammenfuegen-anleitung', 'pdf-durchsuchbar-machen-anleitung', 'pdf-seitenzahlen-einfuegen', 'pdf-seiten-sortieren-reihenfolge-aendern'],
    directAnswer: 'Benennen Sie die Foliensätze zuerst nach Termin (z. B. „01_Einführung.pdf“), fügen Sie sie dann in dieser Reihenfolge zu einer PDF zusammen und setzen Sie anschließend durchgehende Seitenzahlen. Eingescannte Skripte machen Sie vorher per Texterkennung durchsuchbar, damit die Suche (Strg+F) im ganzen Dokument funktioniert.',
    steps: [
      { step: 1, title: 'Dateien nummerieren', text: 'Benennen Sie alle Foliensätze und Skripte mit führender Nummer, damit die Reihenfolge schon beim Auswählen stimmt.' },
      { step: 2, title: 'Scans durchsuchbar machen', text: 'Eingescannte oder fotografierte Seiten enthalten oft keinen Text. Machen Sie diese Dateien vorab per OCR durchsuchbar.' },
      { step: 3, title: 'Zusammenfügen', text: 'Wählen Sie alle PDFs im Werkzeug aus, prüfen Sie die Reihenfolge in der Liste und speichern Sie die Gesamt-PDF.' },
      { step: 4, title: 'Seitenzahlen ergänzen', text: 'Setzen Sie durchgehende Seitenzahlen, damit Sie in Notizen und Lerngruppen auf konkrete Seiten verweisen können.' }
    ],
    sections: [
      {
        heading: 'Warum lohnt sich eine Gesamt-PDF für die Prüfungsvorbereitung?',
        content: 'Eine einzige Datei pro Modul hat im Lernalltag mehrere Vorteile: Sie durchsuchen alle Termine auf einmal, statt zwölf Dateien nacheinander zu öffnen, Sie markieren und kommentieren an einem Ort, und auf Tablet oder E-Reader müssen Sie nicht ständig zwischen Dokumenten wechseln.\n\n- Suche nach Fachbegriffen über das ganze Semester\n- Ein Dokument für Anmerkungen in der PDF-App\n- Einfache Weitergabe an die Lerngruppe\n\nDie Grundlagen zum Zusammenfügen erklärt die [Anleitung zum PDF-Zusammenfügen](blog:pdf-zusammenfuegen-anleitung).'
      },
      {
        heading: 'Wie bringe ich die Unterlagen in die richtige Reihenfolge?',
        content: 'Die Dateien werden in der Reihenfolge der Liste aneinandergehängt; innerhalb jeder Datei bleibt die Seitenfolge erhalten. Am zuverlässigsten sind nummerierte Dateinamen nach Vorlesungstermin. Übungsblätter können Sie entweder direkt hinter den passenden Termin stellen oder gesammelt ans Ende.\n\n| Ordnung | Vorteil | Geeignet für |\n|---|---|---|\n| Nach Termin | entspricht dem Semesterverlauf | Vorlesungen mit aufbauendem Stoff |\n| Nach Thema | Zusammenhänge auf einen Blick | Wiederholung vor der Klausur |\n| Folien, dann Übungen | klare Trennung | Module mit vielen Übungsblättern |\n\nSteht danach eine Seite falsch, verschieben Sie sie mit [PDF-Seiten neu anordnen](tool:pdf-seiten-neu-anordnen).'
      },
      {
        heading: 'Wie mache ich eingescannte Skripte durchsuchbar?',
        content: 'Foliensätze, die direkt aus PowerPoint oder LaTeX exportiert wurden, enthalten meist bereits echten Text. Eingescannte Skripte oder abfotografierte Tafelbilder sind dagegen nur Bilder – die Suche findet darin nichts. Mit [PDF durchsuchbar machen](tool:pdf-durchsuchbar-machen) erkennt eine Texterkennung (OCR) den Text und legt ihn als unsichtbare Textebene ab.\n\nDie Texterkennung von Datei Tools unterstützt Deutsch und Englisch; pro Durchgang sind Dateien bis 50 MB bzw. 50 Seiten vorgesehen. Größere Skripte teilen Sie vorher auf. Wie gut die Erkennung klappt, hängt stark von Scanqualität, Kontrast und Schrift ab – Handschrift wird in der Regel kaum zuverlässig erkannt. Mehr dazu im Ratgeber [PDF durchsuchbar machen](blog:pdf-durchsuchbar-machen-anleitung).'
      },
      {
        heading: 'Sollte ich Seitenzahlen ergänzen?',
        content: 'Ja, wenn Sie mit anderen lernen oder sich Notizen machen. Die Folien tragen meist eigene Nummern pro Termin, die sich in der Gesamt-PDF wiederholen. Durchgehende Seitenzahlen sorgen für eindeutige Verweise wie „siehe S. 214“. Mit [PDF-Seiten nummerieren](tool:pdf-seiten-nummerieren) setzen Sie die Zahlen im Browser; Details im Beitrag [Seitenzahlen in PDF einfügen](blog:pdf-seitenzahlen-einfuegen).'
      },
      {
        heading: 'Darf ich die Gesamt-PDF teilen?',
        content: 'Vorlesungsunterlagen sind in der Regel urheberrechtlich geschützt und oft nur für Teilnehmende einer Lehrveranstaltung freigegeben. Für das eigene Lernen ist das Bündeln unproblematisch; bevor Sie die Datei weitergeben oder öffentlich hochladen, prüfen Sie die Hinweise der Lehrenden oder der Lernplattform. Da Datei Tools lokal im Browser arbeitet, verlassen die Unterlagen beim Bearbeiten Ihr Gerät nicht.'
      }
    ],
    faqs: [
      { question: 'Bleiben Lesezeichen der einzelnen Foliensätze erhalten?', answer: 'Nein, Lesezeichen und Inhaltsverzeichnisse der Einzeldateien werden beim Zusammenfügen nicht übernommen. Seiteninhalte, Texte und Bilder bleiben erhalten.' },
      { question: 'Kann ich auch Fotos von Tafelbildern einfügen?', answer: 'Ja. Wandeln Sie die Fotos zuerst in PDF um und fügen Sie sie dann mit den übrigen Dateien zusammen.' },
      { question: 'Wird die Datei durch das Zusammenfügen schlechter?', answer: 'Nein, die Seiten werden nicht neu berechnet. Die Gesamtdatei ist etwa so groß wie alle Einzeldateien zusammen.' }
    ],
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  },
  {
    slug: 'hausarbeit-als-pdf-abgeben',
    title: 'Hausarbeit als PDF abgeben: Checkliste für die Abgabe',
    metaTitle: 'Hausarbeit als PDF abgeben: Checkliste | Datei Tools',
    metaDescription: 'Hausarbeit oder Bachelorarbeit als PDF abgeben: Word in PDF umwandeln, Seitenzahlen, Schriften und Dateigröße prüfen – kostenlos im Browser, ohne Upload.',
    h1: 'Hausarbeit als PDF abgeben: So vermeiden Sie Fehler bei der Abgabe',
    excerpt: 'Die Arbeit ist fertig, jetzt muss sie als PDF ins Abgabeportal. Diese Checkliste zeigt, wie Sie aus Word eine saubere PDF erzeugen und was Sie vor dem Hochladen prüfen sollten.',
    category: 'documents',
    primaryKeyword: 'hausarbeit als pdf abgeben',
    secondaryKeywords: ['hausarbeit pdf umwandeln', 'bachelorarbeit pdf abgeben', 'word in pdf hausarbeit', 'seitenzahlen hausarbeit pdf'],
    searchIntent: 'informational',
    primaryToolSlug: 'word-in-pdf-umwandeln',
    ctaHeadline: 'Hausarbeit jetzt in PDF umwandeln',
    ctaButtonLabel: 'Word in PDF umwandeln',
    relatedToolSlugs: ['pdf-seiten-nummerieren', 'pdf-zusammenfuegen', 'pdf-komprimieren'],
    relatedArticleSlugs: ['word-in-pdf-umwandeln-anleitung', 'pdf-seitenzahlen-einfuegen', 'pdf-zusammenfuegen-anleitung', 'pdf-metadaten-entfernen-vor-dem-versenden'],
    directAnswer: 'Am zuverlässigsten exportieren Sie die Hausarbeit direkt in Word über „Speichern unter > PDF“. Ohne Word wandeln Sie die DOCX im Browser um; bei komplexen Layouts kann die Darstellung dabei abweichen. Prüfen Sie danach immer Seitenzahlen, Umbrüche, Fußnoten, Sonderzeichen und die Vorgaben Ihres Lehrstuhls.',
    steps: [
      { step: 1, title: 'Vorgaben prüfen', text: 'Lesen Sie die Abgabehinweise: Dateiformat, Dateiname, maximale Größe und ob eine Eigenständigkeitserklärung enthalten sein muss.' },
      { step: 2, title: 'PDF erzeugen', text: 'Exportieren Sie die Arbeit in Word als PDF oder wandeln Sie die DOCX-Datei im Browser um.' },
      { step: 3, title: 'Ergebnis durchsehen', text: 'Blättern Sie die PDF vollständig durch und vergleichen Sie Umbrüche, Tabellen, Abbildungen und Fußnoten mit dem Original.' },
      { step: 4, title: 'Unterlagen ergänzen', text: 'Fügen Sie bei Bedarf Deckblatt oder unterschriebene Erklärung als eigene PDF hinzu und setzen Sie Seitenzahlen.' },
      { step: 5, title: 'Abgeben', text: 'Benennen Sie die Datei nach Vorgabe, prüfen Sie die Größe und laden Sie sie rechtzeitig vor Fristende hoch.' }
    ],
    sections: [
      {
        heading: 'Warum wird eine Hausarbeit als PDF abgegeben?',
        content: 'Eine PDF sieht auf jedem Gerät gleich aus: Seitenumbrüche, Schriften und Abbildungen bleiben dort, wo Sie sie gesetzt haben. Eine Word-Datei kann dagegen je nach Programmversion und installierten Schriften anders umbrechen – Seitenangaben im Inhaltsverzeichnis stimmen dann womöglich nicht mehr. Viele Hochschulen verlangen deshalb ausdrücklich eine PDF, oft auch für die Plagiatsprüfung.'
      },
      {
        heading: 'Wie wandle ich die Hausarbeit von Word in PDF um?',
        content: 'Der sicherste Weg ist der Export aus dem Programm, in dem Sie geschrieben haben, denn dort sind alle Schriften und Einstellungen vorhanden. Haben Sie Word gerade nicht zur Hand, wandeln Sie die Datei mit [Word in PDF umwandeln](tool:word-in-pdf-umwandeln) direkt im Browser um. Die Datei wird dabei lokal dargestellt und als PDF gespeichert; bei komplexen Layouts mit vielen Textfeldern, verschachtelten Tabellen oder besonderen Schriften kann das Ergebnis vom Original abweichen.\n\n| Weg | Stärke | Darauf achten |\n|---|---|---|\n| Word: Speichern unter > PDF | höchste Layouttreue | Option für Lesezeichen aus Überschriften nutzen |\n| Browser-Umwandlung | ohne installiertes Office | Ergebnis gründlich gegenlesen |\n\nWeitere Tipps finden Sie in der Anleitung [Word in PDF umwandeln](blog:word-in-pdf-umwandeln-anleitung).'
      },
      {
        heading: 'Was sollte ich vor der Abgabe in der PDF prüfen?',
        content: 'Nehmen Sie sich zehn Minuten für eine Endkontrolle:\n\n- **Seitenzahlen:** stimmen sie mit dem Inhaltsverzeichnis überein?\n- **Umbrüche:** keine einzelnen Zeilen oder Überschriften am Seitenende\n- **Fußnoten und Literaturverzeichnis:** vollständig und richtig nummeriert\n- **Sonderzeichen und Formeln:** Umlaute, griechische Buchstaben und Formeln korrekt dargestellt\n- **Abbildungen und Tabellen:** scharf und nicht abgeschnitten\n- **Dateieigenschaften:** Titel und Autor sinnvoll gesetzt\n\nWer die Dokumenteigenschaften prüfen oder bereinigen möchte, findet Hinweise im Beitrag [PDF-Metadaten vor dem Versenden entfernen](blog:pdf-metadaten-entfernen-vor-dem-versenden).'
      },
      {
        heading: 'Wie füge ich Deckblatt und Eigenständigkeitserklärung hinzu?',
        content: 'Viele Prüfungsordnungen verlangen eine unterschriebene Erklärung. Liegt sie als Scan vor, fügen Sie die Dateien mit [PDF zusammenfügen](tool:pdf-zusammenfuegen) in der richtigen Reihenfolge zu einer Abgabedatei zusammen. Fehlen danach Seitenzahlen oder sollen sie neu gesetzt werden, hilft [PDF-Seiten nummerieren](tool:pdf-seiten-nummerieren). Ob Deckblatt und Verzeichnisse mitgezählt werden, legt Ihr Lehrstuhl fest – richten Sie sich nach dessen Vorgaben.'
      },
      {
        heading: 'Was tun, wenn die PDF zu groß für das Abgabeportal ist?',
        content: 'Meist sind hochauflösende Fotos oder eingescannte Seiten die Ursache. Verkleinern Sie die fertige Datei mit [PDF komprimieren](tool:pdf-komprimieren) und prüfen Sie danach, ob Abbildungen noch gut lesbar sind. Reine Textseiten schrumpfen kaum, weil sie bereits kompakt gespeichert sind. Planen Sie für den Upload etwas Puffer vor der Frist ein.'
      }
    ],
    faqs: [
      { question: 'Ist die Browser-Umwandlung genauso gut wie der Word-Export?', answer: 'Bei einfachen Textdokumenten meist ja. Bei komplexen Layouts kann es Abweichungen geben, deshalb sollten Sie das Ergebnis immer vollständig durchsehen oder im Zweifel aus Word exportieren.' },
      { question: 'Wird meine Hausarbeit bei der Umwandlung hochgeladen?', answer: 'Nein. Datei Tools verarbeitet die Datei im Browser auf Ihrem Gerät; sie wird nicht an einen Server übertragen.' },
      { question: 'Welcher Dateiname ist sinnvoll?', answer: 'Halten Sie sich an die Vorgabe Ihres Lehrstuhls. Fehlt eine, ist ein Muster wie „Nachname_Matrikelnummer_Modul.pdf“ ohne Leer- und Sonderzeichen eine sichere Wahl.' },
      { question: 'Funktionieren Links im Literaturverzeichnis in der PDF?', answer: 'Beim Export aus Word bleiben Hyperlinks in der Regel erhalten. Prüfen Sie stichprobenartig, ob sie in der PDF anklickbar sind.' }
    ],
    readingTimeMinutes: 6,
    publishedAt: '2026-11-08',
    updatedAt: '2026-11-08',
    author: 'Datei Tools Redaktion'
  }
];
