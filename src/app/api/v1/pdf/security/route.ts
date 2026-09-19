import { boundedFormData, isProRequest, requestError, RequestError } from '@/server/security/request';
import { NextRequest, NextResponse } from 'next/server';
import { pdfSecurityService, PdfPermissions, RedactionZone } from '@/server/services/adapters/PdfSecurityService';
import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { validateUploadedFile } from '@/server/security/fileValidator';
import { privacyLog } from '@/server/utils/privacyLogger';
import { featureFlags } from '@/config/featureFlags.config';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const isPro = await isProRequest(req);
    const expandedAccess = isPro || !featureFlags.enableStripeCheckout;

    // 0. Rate limiting
    const ip = getClientIp(req);
    const rateLimit = rateLimiter.check(ip, 'security', expandedAccess);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Zu viele Sicherheitsoperationen. Bitte warten Sie einen Moment.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const formData = await boundedFormData(req, (expandedAccess ? 250 : 50) * 1024 * 1024 + 65536);
    const file = formData.get('file') as File | null;
    const action = (formData.get('action') as string) || 'protect';

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Keine PDF-Datei übertragen (Feld: file erforderlich).' },
        { status: 400 }
      );
    }

    // Limit free file sizes to 50MB
    const maxMB = expandedAccess ? 250 : 50;
    if (file.size > maxMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Die Datei überschreitet die maximale Größe von ${maxMB} MB.` },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deep file validation (ensuring real %PDF- signature, not spoofed executable)
    const validation = validateUploadedFile(buffer, file.name, 'application/pdf');
    if (!validation.valid || validation.detectedFormat !== 'pdf') {
      return NextResponse.json(
        {
          error: validation.error || 'Die hochgeladene Datei ist kein gültiges PDF-Dokument.',
          code: validation.code || 'INVALID_PDF',
        },
        { status: 400 }
      );
    }

    const safeFilename = validation.safeFilename;
    const baseName = safeFilename.replace(/\.[^/.]+$/, '');

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
        outputFilename = `coolwave_geschuetzt_${safeFilename}`;
        break;
      }

      case 'unlock':
      case 'decrypt':
      case 'remove_password': {
        const password = (formData.get('password') as string) || (formData.get('userPassword') as string) || undefined;
        resultBuffer = await pdfSecurityService.unlockPdf(buffer, password);
        outputFilename = `coolwave_entsperrt_${safeFilename}`;
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
        outputFilename = `coolwave_berechtigungen_${safeFilename}`;
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
        outputFilename = `coolwave_geschwaerzt_${safeFilename}`;
        break;
      }

      case 'metadata_remove': {
        resultBuffer = await pdfSecurityService.stripMetadata(buffer);
        outputFilename = `coolwave_bereinigt_${safeFilename}`;
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
        outputFilename = `coolwave_signiert_${safeFilename}`;
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
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || 'Fehler bei der Sicherheitsverarbeitung.';
    privacyLog('error', '[PDF Security Error]', { error: errorMsg });
    return err instanceof RequestError ? requestError(err) : NextResponse.json({ error: 'PDF-Verarbeitung fehlgeschlagen. Bitte pruefen Sie Datei und Passwort.', code: 'INVALID_PDF' }, { status: 422 });
  }
}
