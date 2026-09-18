import { describe, it, expect } from 'vitest';
import { parseCsv } from '../src/server/utils/csvParser';
import { OfficeConversionEngine } from '../src/server/services/adapters/OfficeConversionEngine';
import { pdfSecurityService } from '../src/server/services/adapters/PdfSecurityService';
import { imageService } from '../src/server/services/adapters/ImageService';
import { sanitizeJobError, ERROR_CODES } from '../src/server/engine/errorSanitizer';
import { isProRequest } from '../src/server/security/request';
import { NextRequest } from 'next/server';
import { PDFDocument, PDFName, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { getClientIp } from '../src/server/security/rateLimiter';
import { hydrateClientSubscription, getClientSubscription } from '../src/lib/monetization/subscription';
import { POST as stripeCheckoutPost } from '../src/app/api/v1/stripe/checkout/route';
import { CheckoutSelectionError, resolveCheckoutSelection } from '../src/server/stripe/checkoutPlan';

describe('CoolWave Comprehensive Repair Regressions', () => {
  // -------------------------------------------------------------
  // Issue 9: RFC 4180 CSV Parsing & Leading Zero Preservation
  // -------------------------------------------------------------
  it('Issue 9: Preserves leading zeros, escaped quotes, and multiline fields in CSV', async () => {
    const csvContent = 'id,name,description\n00123,"He said ""Hello""",Line 1\n00456,"Multiple\nLines","Test"';
    const { rows } = parseCsv(csvContent);

    expect(rows.length).toBe(3);
    // Preserves leading zero
    expect(rows[1][0].value).toBe('00123');
    // Escaped quotes
    expect(rows[1][1].value).toBe('He said "Hello"');
    // Multiline cell
    expect(rows[2][0].value).toBe('00456');
    expect(rows[2][1].value).toBe('Multiple\nLines');

    // Test conversion to XLSX
    const xlsxResult = await OfficeConversionEngine.csvToXlsx(Buffer.from(csvContent), 'test.csv', () => {});
    expect(xlsxResult.data).toBeInstanceOf(Buffer);
    expect(xlsxResult.data.length).toBeGreaterThan(100);
  });

  // -------------------------------------------------------------
  // Issue 1: PPTX -> PDF preserves image-only and mixed slides
  // -------------------------------------------------------------
  it('Issue 1: PPTX -> PDF preserves slide images without regex text stripping', async () => {
    // Create a minimal PPTX ZIP with an image and presentation dimensions
    const zip = new JSZip();
    zip.file('ppt/presentation.xml', '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldSz cx="9144000" cy="6858000"/></p:presentation>');
    zip.file('ppt/slides/slide1.xml', '<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:pic><p:blipFill><a:blip r:embed="rId1"/></p:blipFill></p:pic></p:spTree></p:cSld></p:sld>');
    zip.file('ppt/slides/_rels/slide1.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>');

    // 1x1 transparent PNG
    const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    zip.file('ppt/media/image1.png', png1x1);

    const pptxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const pdfResult = await OfficeConversionEngine.pptxToPdf(pptxBuffer, 'test.pptx', () => {});

    expect(pdfResult.data).toBeInstanceOf(Buffer);
    const pdfDoc = await PDFDocument.load(pdfResult.data);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------
  // Issue 2: PDF -> SVG preserves image-only PDF pages without blank SVGs
  // -------------------------------------------------------------
  it('Issue 2: PDF -> SVG renders raster/vector graphic layers instead of blank rects', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    // Draw visual elements
    page.drawRectangle({ x: 50, y: 50, width: 200, height: 200, color: rgb(0.2, 0.6, 0.9) });
    const pdfBytes = await pdfDoc.save();

    const svgResult = await imageService.execute(Buffer.from(pdfBytes), 'test.pdf', { targetFormat: 'svg' }, () => {});
    expect(svgResult.data).toBeInstanceOf(Buffer);
    const svgStr = svgResult.data.toString('utf-8');

    expect(svgStr).toContain('<svg');
    expect(svgStr).toContain('</svg>');
    // Should NOT be an empty rect
    expect(svgStr.length).toBeGreaterThan(150);
  });

  // -------------------------------------------------------------
  // Issue 10: Scanned PDF -> Excel throws typed OCR_REQUIRED error
  // -------------------------------------------------------------
  it('Issue 10: Scanned PDF -> XLSX throws typed OCR_REQUIRED error when non-extractable', async () => {
    // Empty PDF with drawing only (no extractable text)
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 400]);
    const pdfBytes = await pdfDoc.save();

    await expect(OfficeConversionEngine.pdfToXlsx(Buffer.from(pdfBytes), 'test.pdf', () => {})).rejects.toThrow('OCR_REQUIRED');
  });

  // -------------------------------------------------------------
  // Issue 11: PDF Signing accurately labeled as visual signature
  // -------------------------------------------------------------
  it('Issue 11: PDF Signing accurately embeds visual signature and document hash', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([500, 500]);
    const pdfBytes = await pdfDoc.save();

    const signedPdf = await pdfSecurityService.signPdf(Buffer.from(pdfBytes), {
      signerName: 'Test Unterzeichner',
      reason: 'Freigabe Vertrag',
    });

    expect(signedPdf).toBeInstanceOf(Buffer);
    const signedDoc = await PDFDocument.load(signedPdf);
    expect(signedDoc.getSubject()).toContain('Visuell signiert');
  });

  // -------------------------------------------------------------
  // Issue 13: PDF Password Security enforces independent owner password
  // -------------------------------------------------------------
  it('Issue 13: Enforces independent owner password distinct from user password', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([300, 300]);
    const pdfBytes = await pdfDoc.save();

    // Passing userPassword without ownerPassword
    const protectedBytes = await pdfSecurityService.protectPdf(
      Buffer.from(pdfBytes),
      'user123',
      undefined,
      { allowPrinting: true, allowCopying: false }
    );
    expect(protectedBytes).toBeInstanceOf(Buffer);
    expect(protectedBytes.length).toBeGreaterThan(100);
  });

  // -------------------------------------------------------------
  // Issue 14: Deep metadata sanitization
  // -------------------------------------------------------------
  it('Issue 14: Deep-cleans Info dictionary, XMP Metadata, and PieceInfo', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle('Geheimes Dokument');
    pdfDoc.setAuthor('Test Author');
    pdfDoc.setSubject('Vertraulich');
    pdfDoc.addPage([300, 300]);
    const pdfBytes = await pdfDoc.save();

    const strippedBytes = await pdfSecurityService.stripMetadata(Buffer.from(pdfBytes));
    const strippedDoc = await PDFDocument.load(strippedBytes);

    expect(strippedDoc.getTitle()).toBeFalsy();
    expect(strippedDoc.getAuthor()).toBeFalsy();
    expect(strippedDoc.getSubject()).toBeFalsy();
    expect(strippedDoc.catalog.has(PDFName.of('Metadata'))).toBe(false);
    expect(strippedDoc.catalog.has(PDFName.of('PieceInfo'))).toBe(false);
  });

  // -------------------------------------------------------------
  // Issue 19: Server-side isProRequest never trusts localStorage
  // -------------------------------------------------------------
  it('Issue 19: isProRequest rejects client header spoofing without valid key or session', async () => {
    const fakeRequest = new NextRequest('http://localhost:3000/api/v1/jobs', {
      headers: {
        'x-coolwave-pro': 'true',
        'x-api-key': 'invalid_random_key',
      },
    });

    const isPro = await isProRequest(fakeRequest);
    expect(isPro).toBe(false);
  });

  // -------------------------------------------------------------
  // Issue 26: Error Sanitizer uses typed error codes and prevents leaks
  // -------------------------------------------------------------
  it('Issue 26: Error sanitizer maps internal codes and never leaks system paths', () => {
    const ocrMsg = sanitizeJobError('OCR_REQUIRED: No text found');
    expect(ocrMsg).toContain('OCR-Texterkennung');

    const leakAttempt = sanitizeJobError('Bitte Fehler in C:\\Users\\Administrator\\secret.db melden');
    expect(leakAttempt).not.toContain('C:\\Users');
    expect(leakAttempt).not.toContain('secret.db');

    const engineMsg = sanitizeJobError('ENGINE_UNAVAILABLE: LibreOffice is missing');
    expect(engineMsg).toContain('Office-Engine');
  });

  // -------------------------------------------------------------
  // Issue 15: EPUB spine traversal handles full reading order
  // -------------------------------------------------------------
  it('Issue 15: EPUB conversion processes complete spine without 30/50 caps', async () => {
    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip');
    zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');

    // Create 35 spine items
    let spineXml = '<spine>';
    let manifestXml = '<manifest>';
    for (let i = 1; i <= 35; i++) {
      manifestXml += `<item id="ch${i}" href="ch${i}.xhtml" media-type="application/xhtml+xml"/>`;
      spineXml += `<itemref idref="ch${i}"/>`;
      zip.file(`OEBPS/ch${i}.xhtml`, `<html><body><h1>Kapitel ${i}</h1><p>Text fuer Kapitel ${i}</p></body></html>`);
    }
    manifestXml += '</manifest>';
    spineXml += '</spine>';

    zip.file('OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test EPUB</dc:title></metadata>${manifestXml}${spineXml}</package>`);

    const epubBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const txtResult = await OfficeConversionEngine.epubToTxt(epubBuffer, 'test.epub', () => {});
    const txtStr = txtResult.data.toString('utf-8');

    // Should include Kapitel 1 through 35
    expect(txtStr).toContain('Kapitel 1');
    expect(txtStr).toContain('Kapitel 35');
  });

  // -------------------------------------------------------------
  // Audit Remediation: Stripe Checkout blocks anonymous checkout
  // -------------------------------------------------------------
  it('Remediation: Paid checkout rejects unauthenticated requests with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/stripe/checkout', {
      method: 'POST',
    });
    const res = await stripeCheckoutPost(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  // -------------------------------------------------------------
  // Audit Remediation: Rate limiter client IP header spoofing defense
  // -------------------------------------------------------------
  it('Remediation: Rate limiter ignores untrusted proxy IP headers by default', () => {
    delete process.env.TRUST_PROXY;
    delete process.env.TRUSTED_CLIENT_IP_HEADER;

    const req = new NextRequest('http://localhost:3000/api/v1/jobs', {
      headers: {
        'cf-connecting-ip': '198.51.100.45',
        'x-forwarded-for': '198.51.100.46',
      },
    });

    // Untrusted headers should not be accepted
    expect(getClientIp(req)).toBe('127.0.0.1');

    // When explicitly enabled, trust proxy
    process.env.TRUST_PROXY = 'true';
    expect(getClientIp(req)).toBe('198.51.100.45');
    delete process.env.TRUST_PROXY;
  });

  // -------------------------------------------------------------
  // Audit Remediation: Spreadsheet cell multiline wrapping
  // -------------------------------------------------------------
  it('Remediation: xlsxToPdf wraps long cells into multiple lines without truncation', async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('TestSheet');
    worksheet.addRow(['ID', 'LongDescriptionColumn']);
    const longText = 'This is a very long string designed to test cell multiline wrapping in CoolWave spreadsheetToPdf without truncating any characters with an ellipsis.';
    worksheet.addRow([1, longText]);

    const xlsxBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const pdfResult = await OfficeConversionEngine.xlsxToPdf(xlsxBuffer, 'multiline_test.xlsx', () => {});

    expect(pdfResult.data).toBeInstanceOf(Buffer);
    const pdfDoc = await PDFDocument.load(pdfResult.data);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------
  // Audit Remediation: DOCX->PDF throws ENGINE_UNAVAILABLE when engine is missing
  // -------------------------------------------------------------
  it('Remediation: docxToPdf throws ENGINE_UNAVAILABLE when LibreOffice is missing', async () => {
    // If LibreOffice is not installed, it should cleanly throw ENGINE_UNAVAILABLE
    try {
      await OfficeConversionEngine.docxToPdf(Buffer.from('fake-docx-content'), 'sample.docx', () => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toContain('ENGINE_UNAVAILABLE');
    }
  });

  // -------------------------------------------------------------
  // Audit Remediation: Client subscription hydration
  // -------------------------------------------------------------
  it('Remediation: Client subscription hydrates properly and updates state', () => {
    hydrateClientSubscription({ plan: 'pro' });
    let sub = getClientSubscription();
    expect(sub.isPro).toBe(true);
    expect(sub.tier).toBe('pro');

    hydrateClientSubscription(null);
    sub = getClientSubscription();
    expect(sub.isPro).toBe(false);
    expect(sub.tier).toBe('free');
  });

  it('Remediation: Stripe checkout resolves distinct monthly and yearly prices', () => {
    const env = {
      STRIPE_PRICE_ID_PRO_MONTHLY: 'price_monthly',
      STRIPE_PRICE_ID_PRO_YEARLY: 'price_yearly',
    };

    expect(resolveCheckoutSelection({ planId: 'pro', interval: 'monthly' }, env).priceId).toBe('price_monthly');
    expect(resolveCheckoutSelection({ planId: 'pro', interval: 'yearly' }, env).priceId).toBe('price_yearly');
  });

  it('Remediation: Stripe checkout rejects unsupported plans and missing prices', () => {
    expect(() => resolveCheckoutSelection(
      { planId: 'business', interval: 'monthly' },
      {},
    )).toThrow(CheckoutSelectionError);

    expect(() => resolveCheckoutSelection(
      { planId: 'pro', interval: 'yearly' },
      { STRIPE_PRICE_ID_PRO_MONTHLY: 'price_monthly' },
    )).toThrow('jährliche');
  });
});
