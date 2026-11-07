import type { FaqItem } from '@/types/tool';

/** Home page FAQ – shared by the visible accordion and the FAQPage JSON-LD. */
export const HOME_FAQS: FaqItem[] = [
  {
    question: 'Werden meine Dateien auf einen Server hochgeladen?',
    answer:
      'Nein. Alle Tools von Datei Tools laufen mit JavaScript und WebAssembly direkt in Ihrem Browser. Ihre Dateien werden lokal auf Ihrem Gerät verarbeitet und zu keinem Zeitpunkt an unsere Server oder an Dritte übertragen.',
  },
  {
    question: 'Ist Datei Tools wirklich kostenlos?',
    answer:
      'Ja. Alle Tools sind kostenlos und ohne Registrierung nutzbar. Sie brauchen kein Konto und müssen keine Software installieren.',
  },
  {
    question: 'Warum ist die Verarbeitung im Browser schneller?',
    answer:
      'Weil das Hoch- und Herunterladen entfällt. Gerade bei großen PDFs oder vielen Bildern sparen Sie die Wartezeit für die Übertragung – die Rechenleistung Ihres Geräts erledigt die Arbeit sofort.',
  },
  {
    question: 'Funktioniert das auch auf dem Smartphone?',
    answer:
      'Ja. Die Tools funktionieren in aktuellen Versionen von Chrome, Safari, Firefox und Edge – auf Computer, Tablet und Smartphone. Bei sehr großen Dateien kann der Arbeitsspeicher älterer Mobilgeräte die Verarbeitung verlangsamen.',
  },
  {
    question: 'Wie groß dürfen meine Dateien sein?',
    answer:
      'Das Limit hängt vom jeweiligen Tool ab und steht direkt über dem Ablagebereich. Da die Verarbeitung auf Ihrem Gerät stattfindet, bestimmt vor allem dessen Arbeitsspeicher, wie große Dateien flüssig verarbeitet werden.',
  },
  {
    question: 'Ist Datei Tools DSGVO-freundlich?',
    answer:
      'Ja. Da Ihre Dateien Ihr Gerät nicht verlassen, erhalten wir keinen Zugriff auf deren Inhalte. Cookies für Analyse oder Werbung setzen wir nur mit Ihrer Einwilligung. Details finden Sie in unserer Datenschutzerklärung.',
  },
  {
    question: 'Brauche ich eine Internetverbindung?',
    answer:
      'Zum Aufrufen der Seite ja. Manche Tools laden beim ersten Start zusätzliche Programmbausteine nach, etwa Sprachdaten für die Texterkennung. Die eigentliche Verarbeitung Ihrer Dateien erfolgt anschließend lokal.',
  },
];
