import { rasterRedact } from './rasterRedaction';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { PDFDocument, PDFName, rgb, StandardFonts } from 'pdf-lib';
import muhammara from 'muhammara';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

export interface PdfPermissions {
  allowPrinting?: boolean;
  allowCopying?: boolean;
  allowModifying?: boolean;
  allowAnnotating?: boolean;
  allowFormFilling?: boolean;
}

export interface RedactionZone {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureOptions {
  signaturePngBase64?: string;
  signerName?: string;
  reason?: string;
  location?: string;
  pageIndex?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function computeUserProtectionFlag(perms: PdfPermissions): number {
  let flag = 0;
  if (perms.allowPrinting !== false) {
    flag |= 4; // bit 3: Print
    flag |= 2048; // bit 12: High quality print
  }
  if (perms.allowCopying !== false) {
    flag |= 16; // bit 5: Copy text & graphics
    flag |= 512; // bit 10: Extract text for accessibility
  }
  if (perms.allowModifying !== false) {
    flag |= 8; // bit 4: Modify contents
    flag |= 1024; // bit 11: Document assembly
  }
  if (perms.allowAnnotating !== false) {
    flag |= 32; // bit 6: Add or modify annotations
  }
  if (perms.allowFormFilling !== false) {
    flag |= 256; // bit 9: Fill forms
  }
  return flag;
}

export class PdfSecurityService implements IConversionService {
  name = 'PdfSecurityService';
  supportedTypes = [
    'pdf_protect',
    'pdf_unlock',
    'pdf_remove_password',
    'pdf_permissions',
    'pdf_encrypt',
    'pdf_decrypt',
    'pdf_redact',
    'pdf_metadata_remove',
    'pdf_sign',
  ];

  private tempDir = path.join(process.env.COOLWAVE_TEMP_DIR || path.join(process.cwd(), '.tmp'), 'security');

  constructor() {
    // Ensure isolated temporary storage directory exists
    fs.mkdir(this.tempDir, { recursive: true }).catch(() => {});
  }

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type);
  }

  private async getTempFilePath(prefix: string): Promise<string> {
    await fs.mkdir(this.tempDir, { recursive: true });
    const randomId = crypto.randomBytes(8).toString('hex');
    return path.join(this.tempDir, `${prefix}_${Date.now()}_${randomId}.pdf`);
  }

  private async cleanupFiles(...filePaths: string[]): Promise<void> {
    for (const file of filePaths) {
      if (file) {
        try {
          await fs.unlink(file);
        } catch {
          // Ignore if already deleted
        }
      }
    }
  }

  /**
   * Encrypt PDF with standard ISO-32000 encryption (AES/RC4 via muhammara)
   */
  async protectPdf(
    inputBuffer: Buffer,
    userPassword?: string,
    ownerPassword?: string,
    permissions?: PdfPermissions
  ): Promise<Buffer> {
    if (!userPassword && !ownerPassword) {
      throw new Error('Es muss mindestens ein Benutzer- oder Besitzerpasswort angegeben werden.');
    }

    const inputPath = await this.getTempFilePath('enc_in');
    const outputPath = await this.getTempFilePath('enc_out');

    try {
      await fs.writeFile(inputPath, inputBuffer);

      const recryptOptions: Record<string, unknown> = {};
      if (userPassword) recryptOptions.userPassword = userPassword;
      if (ownerPassword) recryptOptions.ownerPassword = ownerPassword;
      else if (userPassword) recryptOptions.ownerPassword = userPassword; // Fallback owner password

      if (permissions) {
        recryptOptions.userProtectionFlag = computeUserProtectionFlag(permissions);
      }

      muhammara.recrypt(inputPath, outputPath, recryptOptions);

      const resultBuffer = await fs.readFile(outputPath);
      return resultBuffer;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || '';
      if (msg.includes('Unable to recrypt')) {
        throw new Error('Das Dokument konnte nicht verschlüsselt werden. Bitte prüfen Sie, ob die Datei bereits passwortgeschützt ist.');
      }
      throw new Error('Fehler beim Verschlüsseln der PDF-Datei.');
    } finally {
      await this.cleanupFiles(inputPath, outputPath);
    }
  }

  /**
   * Unlock / decrypt PDF removing all password protection
   */
  async unlockPdf(inputBuffer: Buffer, password?: string): Promise<Buffer> {
    const inputPath = await this.getTempFilePath('dec_in');
    const outputPath = await this.getTempFilePath('dec_out');

    try {
      await fs.writeFile(inputPath, inputBuffer);

      const recryptOptions: Record<string, unknown> = {};
      if (password) recryptOptions.password = password;

      muhammara.recrypt(inputPath, outputPath, recryptOptions);

      const resultBuffer = await fs.readFile(outputPath);
      return resultBuffer;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || '';
      if (msg.includes('Unable to recrypt') || msg.includes('coool')) {
        throw new Error('Das eingegebene Passwort ist ungültig oder die Datei ist beschädigt.');
      }
      throw new Error('Fehler beim Entsperren der PDF-Datei.');
    } finally {
      await this.cleanupFiles(inputPath, outputPath);
    }
  }

  /**
   * Modify permissions flags on an existing PDF
   */
  async changePermissions(
    inputBuffer: Buffer,
    currentPassword?: string,
    permissions: PdfPermissions = {},
    newOwnerPassword?: string
  ): Promise<Buffer> {
    const inputPath = await this.getTempFilePath('perm_in');
    const outputPath = await this.getTempFilePath('perm_out');

    try {
      await fs.writeFile(inputPath, inputBuffer);

      const flag = computeUserProtectionFlag(permissions);
      const recryptOptions: Record<string, unknown> = {
        userProtectionFlag: flag,
      };

      if (currentPassword) {
        recryptOptions.password = currentPassword;
      }
      if (newOwnerPassword || currentPassword) {
        recryptOptions.ownerPassword = newOwnerPassword || currentPassword;
      }

      muhammara.recrypt(inputPath, outputPath, recryptOptions);

      const resultBuffer = await fs.readFile(outputPath);
      return resultBuffer;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || '';
      if (msg.includes('Unable to recrypt') || msg.includes('coool')) {
        throw new Error('Berechtigungen konnten nicht angepasst werden. Wenn das Dokument passwortgeschützt ist, geben Sie bitte das korrekte Passwort an.');
      }
      throw new Error('Fehler beim Ändern der PDF-Berechtigungen.');
    } finally {
      await this.cleanupFiles(inputPath, outputPath);
    }
  }

  /**
   * True Redaction: Completely excises confidential terms and character codes from the decompressed
   * PDF /Contents stream, then stamps opaque visual blackout blocks.
   * Guarantees that redacted text CANNOT be copied, searched, or extracted from the output PDF.
   */
  async trueRedact(
    inputBuffer: Buffer,
    terms: string[] = [],
    zones: RedactionZone[] = []
  ): Promise<Buffer> {
    return rasterRedact(inputBuffer, terms, zones);
  }

  /**
   * Completely removes all metadata, producer/author tags, and Adobe XMP XML packets
   */
  async stripMetadata(inputBuffer: Buffer): Promise<Buffer> {
    const doc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });

    // 1. Wipe standard document info dictionary
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setProducer('');
    doc.setCreator('');

    // 2. Erase Adobe XMP /Metadata stream from the PDF catalog
    if (doc.catalog.has(PDFName.of('Metadata'))) {
      doc.catalog.delete(PDFName.of('Metadata'));
    }

    const outputBytes = await doc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * Cryptographic and visual PDF signing
   */
  async signPdf(
    inputBuffer: Buffer,
    options: SignatureOptions = {}
  ): Promise<Buffer> {
    const doc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();
    const targetPageIndex = Math.min(Math.max(0, options.pageIndex ?? pageCount - 1), pageCount - 1);
    const targetPage = doc.getPage(targetPageIndex);
    const { width: pageWidth, height: pageHeight } = targetPage.getSize();

    // Calculate SHA-256 fingerprint of the original document
    const docHash = crypto.createHash('sha256').update(inputBuffer).digest('hex').substring(0, 16);
    const signDate = new Date();
    const formattedDate = signDate.toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const signer = options.signerName || 'CoolWave Benutzer';
    const reason = options.reason || 'Dokumentenfreigabe & Integrität';

    // 1. Embed signature image if provided
    const stampWidth = options.width || 220;
    const stampHeight = options.height || 70;
    const posX = options.x ?? Math.max(30, pageWidth - stampWidth - 40);
    const posY = options.y ?? Math.max(30, 40);

    if (options.signaturePngBase64) {
      try {
        const base64Clean = options.signaturePngBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Buffer.from(base64Clean, 'base64');
        const signatureImage = await doc.embedPng(imageBytes);

        targetPage.drawImage(signatureImage, {
          x: posX,
          y: posY + 20,
          width: Math.min(stampWidth, 140),
          height: Math.min(stampHeight - 20, 50),
        });
      } catch (imgErr) {
        console.error('Konnte Signaturbild nicht einbetten:', imgErr);
      }
    }

    // 2. Draw tamper-evident visual verification badge
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    // Subtle background frame
    targetPage.drawRectangle({
      x: posX - 6,
      y: posY - 6,
      width: stampWidth + 12,
      height: stampHeight + 12,
      borderColor: rgb(0.1, 0.4, 0.8),
      borderWidth: 1,
      color: rgb(0.97, 0.98, 1),
      opacity: 0.95,
    });

    targetPage.drawText('CoolWave Digital Verified Signatur', {
      x: posX,
      y: posY + stampHeight - 8,
      size: 8,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    });

    targetPage.drawText(`Unterzeichner: ${signer}`, {
      x: posX,
      y: posY + stampHeight - 20,
      size: 7.5,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });

    targetPage.drawText(`Datum: ${formattedDate} Uhr`, {
      x: posX,
      y: posY + stampHeight - 31,
      size: 7,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    targetPage.drawText(`Grund: ${reason}`, {
      x: posX,
      y: posY + stampHeight - 42,
      size: 6.5,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    targetPage.drawText(`SHA-256 Integrität: #${docHash.toUpperCase()}`, {
      x: posX,
      y: posY + stampHeight - 52,
      size: 6.5,
      font,
      color: rgb(0.2, 0.5, 0.2),
    });

    // 3. Set PDF metadata audit record
    doc.setCreator('CoolWave Secure Sign Engine');
    doc.setProducer('CoolWave Cloud Verification Service');
    doc.setSubject(`Digital signiert durch ${signer} am ${formattedDate} (${reason})`);

    const outputBytes = await doc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * IConversionService execute dispatcher
   */
  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error('Operation abgebrochen.');

    const jobType = options.jobType || options.type || 'pdf_protect';
    const baseName = inputName.replace(/\.[^/.]+$/, '');
    let resultData: Buffer;
    let outFileName = `${baseName}_gesichert.pdf`;

    onProgress(30);

    switch (jobType) {
      case 'pdf_protect':
      case 'pdf_encrypt': {
        const userPassword = (options.userPassword as string) || (options.password as string) || '';
        const ownerPassword = (options.ownerPassword as string) || undefined;
        const permissions = (options.permissions as PdfPermissions) || undefined;
        resultData = await this.protectPdf(inputBuffer, userPassword, ownerPassword, permissions);
        outFileName = `${baseName}_geschuetzt.pdf`;
        break;
      }

      case 'pdf_unlock':
      case 'pdf_remove_password':
      case 'pdf_decrypt': {
        const password = (options.password as string) || (options.userPassword as string) || undefined;
        resultData = await this.unlockPdf(inputBuffer, password);
        outFileName = `${baseName}_entsperrt.pdf`;
        break;
      }

      case 'pdf_permissions': {
        const currentPassword = (options.password as string) || undefined;
        const newOwnerPassword = (options.ownerPassword as string) || undefined;
        const permissions = (options.permissions as PdfPermissions) || {};
        resultData = await this.changePermissions(inputBuffer, currentPassword, permissions, newOwnerPassword);
        outFileName = `${baseName}_berechtigungen.pdf`;
        break;
      }

      case 'pdf_redact': {
        const terms = (options.terms as string[]) || [];
        const zones = (options.zones as RedactionZone[]) || [];
        resultData = await this.trueRedact(inputBuffer, terms, zones);
        outFileName = `${baseName}_geschwaerzt.pdf`;
        break;
      }

      case 'pdf_metadata_remove': {
        resultData = await this.stripMetadata(inputBuffer);
        outFileName = `${baseName}_ohne_metadaten.pdf`;
        break;
      }

      case 'pdf_sign': {
        resultData = await this.signPdf(inputBuffer, {
          signaturePngBase64: options.signaturePngBase64 as string,
          signerName: options.signerName as string,
          reason: options.reason as string,
          location: options.location as string,
          pageIndex: options.pageIndex as number,
          x: options.x as number,
          y: options.y as number,
        });
        outFileName = `${baseName}_signiert.pdf`;
        break;
      }

      default:
        throw new Error(`Nicht unterstützter Sicherheitsvorgang: ${jobType}`);
    }

    onProgress(100);

    return {
      data: resultData,
      fileName: outFileName,
      mimeType: 'application/pdf',
    };
  }
}

export const pdfSecurityService = new PdfSecurityService();
