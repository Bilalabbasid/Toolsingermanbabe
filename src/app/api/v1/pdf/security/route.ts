import { NextRequest, NextResponse } from 'next/server';
import { pdfSecurityService, PdfPermissions, RedactionZone } from '@/server/services/adapters/PdfSecurityService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = (formData.get('action') as string) || 'protect';

    if (!file) {
      return NextResponse.json(
        { error: 'Keine PDF-Datei übertragen (Feld: file erforderlich).' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Ungültiges Dateiformat. Bitte laden Sie eine PDF-Datei hoch.' },
        { status: 400 }
      );
    }

    // Limit free file sizes to 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Die Datei überschreitet die maximale Größe von 50 MB.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    let resultBuffer: Buffer;
    let outputFilename: string;

    switch (action) {
      case 'protect':
      case 'encrypt': {
        const userPassword = (formData.get('userPassword') as string) || (formData.get('password') as string) || '';
        const ownerPassword = (formData.get('ownerPassword') as string) || undefined;
        let perms: PdfPermissions | undefined;

        const rawPerms = formData.get('permissions') as string | null;
        if (rawPerms) {
          try {
            perms = JSON.parse(rawPerms);
          } catch {
            // Ignore parse errors
          }
        }

        if (!userPassword && !ownerPassword) {
          return NextResponse.json(
            { error: 'Bitte geben Sie ein Passwort zum Schutz der Datei an.' },
            { status: 400 }
          );
        }

        resultBuffer = await pdfSecurityService.protectPdf(buffer, userPassword, ownerPassword, perms);
        outputFilename = `coolwave_geschuetzt_${file.name}`;
        break;
      }

      case 'unlock':
      case 'decrypt':
      case 'remove_password': {
        const password = (formData.get('password') as string) || (formData.get('userPassword') as string) || undefined;
        resultBuffer = await pdfSecurityService.unlockPdf(buffer, password);
        outputFilename = `coolwave_entsperrt_${file.name}`;
        break;
      }

      case 'permissions': {
        const password = (formData.get('password') as string) || undefined;
        const newOwnerPassword = (formData.get('newOwnerPassword') as string) || undefined;
        let perms: PdfPermissions = {};

        const rawPerms = formData.get('permissions') as string | null;
        if (rawPerms) {
          try {
            perms = JSON.parse(rawPerms);
          } catch {
            // Ignore parse errors
          }
        }

        resultBuffer = await pdfSecurityService.changePermissions(buffer, password, perms, newOwnerPassword);
        outputFilename = `coolwave_berechtigungen_${file.name}`;
        break;
      }

      case 'redact': {
        let terms: string[] = [];
        const rawTerms = formData.get('terms') as string | null;
        if (rawTerms) {
          try {
            terms = JSON.parse(rawTerms);
          } catch {
            terms = rawTerms.split(',').map((t) => t.trim());
          }
        }

        let zones: RedactionZone[] = [];
        const rawZones = formData.get('zones') as string | null;
        if (rawZones) {
          try {
            zones = JSON.parse(rawZones);
          } catch {
            // Ignore invalid zones
          }
        }

        if (terms.length === 0 && zones.length === 0) {
          return NextResponse.json(
            { error: 'Bitte geben Sie mindestens einen zu schwärzenden Begriff oder Bereich an.' },
            { status: 400 }
          );
        }

        resultBuffer = await pdfSecurityService.trueRedact(buffer, terms, zones);
        outputFilename = `coolwave_geschwaerzt_${file.name}`;
        break;
      }

      case 'metadata_remove': {
        resultBuffer = await pdfSecurityService.stripMetadata(buffer);
        outputFilename = `coolwave_bereinigt_${file.name}`;
        break;
      }

      case 'sign': {
        const signaturePngBase64 = (formData.get('signature') as string) || undefined;
        const signerName = (formData.get('signerName') as string) || 'CoolWave Benutzer';
        const reason = (formData.get('reason') as string) || 'Dokumentenfreigabe & Integrität';
        const location = (formData.get('location') as string) || 'Deutschland';

        let pageIndex: number | undefined;
        const rawPage = formData.get('pageIndex') as string | null;
        if (rawPage !== null) pageIndex = parseInt(rawPage, 10);

        resultBuffer = await pdfSecurityService.signPdf(buffer, {
          signaturePngBase64,
          signerName,
          reason,
          location,
          pageIndex,
        });
        outputFilename = `coolwave_signiert_${file.name}`;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unbekannte Sicherheitsaktion: ${action}` },
          { status: 400 }
        );
    }

    // Return the processed PDF directly as downloadable binary with security headers
    return new NextResponse(resultBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(outputFilename)}"`,
        'X-Output-Filename': encodeURIComponent(outputFilename),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || 'Fehler bei der Sicherheitsverarbeitung.';
    return NextResponse.json({ error: errorMsg }, { status: 422 });
  }
}
