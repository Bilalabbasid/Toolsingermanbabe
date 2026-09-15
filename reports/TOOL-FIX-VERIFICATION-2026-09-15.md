# CoolWave tool-fix verification — 15 September 2026

This is a read-only recheck of [the all-tools audit](ALL-TOOLS-AUDIT-2026-09-15.md), not a claim that every registered tool was exercised. I reviewed the current source and changed files, ran the test suite and TypeScript checker, and submitted the reported scanned résumé to the current local job API. The older isolated build on port 3112 was not used to assess these changes.

## Release check

- `npm test`: **57 passed, 2 skipped** across 10 files. A sandboxed run failed to start because Windows denied Vite's helper spawn; the unrestricted rerun passed. Many new tests verify ZIP/PDF magic bytes or invoke `sharp`, `pdf-lib`, JavaScript built-ins, or regexes directly. They do not verify the site's browser engines or document content/appearance. Signing tests do not verify a cryptographic signature.
- `npm run typecheck`: **failed** at `test/tools.test.ts:172`; `workbook.xlsx.load(result.data)` has an incompatible `Buffer` generic type. The earlier `PdfCompareEngine` missing `setError` error has since been fixed.
- Reported `wasay2 cv.pdf` → PPTX, current `localhost:3000`: completed, downloaded **494,993 bytes**, with `ppt/media/image-1-1.png` **450,023 bytes**. This fixes the prior empty-slide result for this image-only scan. Slide appearance in PowerPoint was not independently rendered.
- Same scanned PDF → XLSX: job **failed** with generic German error and no XLSX. It no longer throws `worksheet.columns.forEach` into the public status or falsely succeeds. A scanned document still cannot be converted to a spreadsheet, and the more useful OCR-specific error from the adapter is hidden by the wrapper.
- Reported scanned PDF → DOCX: four regression tests passed with `COOLWAVE_REGRESSION_PDF` set. Package/media and OCR-content assertions passed. Visual Word rendering remains unverified because `soffice.exe` is unavailable on this host.

## Prior findings, current state

“Partial” means an observed symptom or code path improved while the finding's full acceptance criteria remain unmet. “Open” means the principal defect is still present in current source. “Unverified” denotes a risk/test gap, not a proven current exploit.

| ID | State | Remaining problem or verification result |
| --- | --- | --- |
| T01 | Partial | Null worksheet crash/public raw exception fixed; image-only PDF now fails safely. No OCR/table extraction for scanned PDFs, and user sees a generic error. |
| T02 | Partial | Reported image-only résumé now produces a PPTX page image. Searchable PDF pages still become generic text slides and lose images, geometry and layout; mixed PDFs untested. |
| T03 | Open | PPTX → PDF still extracts text into generic pages rather than rendering slides and pictures. |
| T04 | Open | DOC/ODT/RTF/Word → PDF paths still flatten layout/assets to text. DOCX → PDF filename heading was removed earlier, but fidelity remains unverified. |
| T05 | Partial | TXT → PDF now strips BOM and maps unsupported WinAnsi characters, avoiding the reported crash. Symbols are replaced (and many become `?`), not faithfully preserved; other PDF-writing routes still need Unicode tests. |
| T06 | Open | Legacy DOC/PPT imports still scrape printable bytes rather than parse actual documents/slides. |
| T07 | Open | DOCX → DOC still produces RTF with a `.doc` identity; PPTX → PPT still throws while its page remains active. |
| T08 | Open | ODT/RTF/DOCX transformations still reduce structured documents to plain text and lose styling/media. |
| T09 | Partial | Scanned PDF → Word image mode fixes the reported empty output and filename heading. Searchable-PDF editable mode still approximates layout; OCR mode is not a formatted reconstruction. |
| T10 | Open | PDF/A conversion still unconditionally throws; the tool and ISO/PDF/A claim remain visible. PDF/A metadata hint is not conformance validation. |
| T11 | Partial | Signing stamp drawing order improved. Output still has a visual stamp/hash only, while UI advertises a legally secure SHA-256 digital signature; no signed byte range/certificate verification. |
| T12 | Partial | Independent random owner password is generated only when `permissions` are supplied. User-only password path still sets owner password equal to user password; change-permissions may reuse current password. |
| T13 | Open | Metadata removal does not comprehensively remove XMP, attachment and annotation metadata despite broad anonymization claims. |
| T14 | Partial | Two textless PDFs now return an OCR-needed error instead of “100% similar”. No visual comparison; text-only approximation persists. |
| T15 | Open | Embedded-image extraction still falls back silently to page screenshots capped at five; scan text extraction remains empty without OCR. |
| T16 | Open | PDF → SVG still serializes first-page text only and loses drawings, scans and later pages. |
| T17 | Open | PDF compression level remains unused for the actual PDF rewrite; advertised compression cannot be guaranteed. |
| T18 | Open | Repair/flatten claims and output need independent validation; source changes did not address the earlier fidelity concern. |
| T19 | Unverified high-risk | Editor whiteout/redaction equivalence remains unproven. A PDF.js worker change does not establish secure content removal; inspect saved PDF text/objects before claiming redaction. |
| T20 | Partial | PDF.js worker now loads locally in affected engines. Existing page/memory limits and multi-page failure handling are not resolved. |
| T21 | Partial | WebP MIME/extension and `toBlob` failure handling improved in resize/compress/effects. PNG quality control is still not a meaningful lossy quality setting; browser output/content tests missing. |
| T22 | Open | DPI/metadata claims and PNG-chunk correctness still require independent checks; no targeted repair observed. |
| T23 | Open | Design-format conversions still risk flattening/rasterizing elements while their copy implies editable vector/design fidelity. |
| T24 | Open | Spreadsheet/CSV transformations still need cell, quoting, delimiter and multi-sheet parity checks; previous truncation/fidelity issues remain. |
| T25 | Open | Excel → PDF still truncates displayed column count and long cell values (`substring(0, 22) + '...'`); charts/images/layout absent. |
| T26 | Open | EPUB → PDF reads only first 30 spine/HTML entries; EPUB → TXT caps HTML files at 50. Long books silently lose content. |
| T27 | Partial | Current failed-job status for the scanned Excel case is generic, no raw exception. `sanitizeJobError` returns any raw exception beginning with broad German prefixes verbatim, so sensitive appended details are not reliably excluded. |
| T28 | Unverified high-risk | Queue/storage remain process-local; multi-instance/restart behavior and cleanup require deployment tests. |
| T29 | Open | Browser infers Pro from `localStorage.coolwave_pro_active`; server checks `x-api-key`. Normal browser jobs may show Pro while enforced as free. |
| T30 | Open | Shared upload path still needs per-job format/content validation and a corrupt/empty/spoofed fixture matrix for browser and server tools. |
| T31 | Partial | German Unicode casing improved; text comparison still matches lines by position and misreports insertions. |
| T32 | Open | Regex tester still runs synchronous `matchAll` inside `useMemo`, with no worker timeout or match cap. |
| T33 | Open | HTML/CSS/JS formatters still use regex minification without syntax or semantic preservation. |
| T34 | Partial | `bildqualitaet-optimieren` now has an explicit effects mode with sharpening/contrast/saturation. Real quality improvement and output correctness are not tested. |
| T35 | Unverified | Archive/codec/traversal/bomb/cancellation, temporary-workdir cleanup, and deployed worker behavior still lack targeted fixtures. Do not infer an exploit from this gap. |
| T36 | Partial | OCR filename heading was removed earlier; columns/layout and searchable-PDF image preservation still lack visual/content parity tests. |

## Priority for the next repair pass

1. Resolve TypeScript failure so a production build can be validated.
2. Remove or implement misleading active security/PDF-A/legacy tool claims (T07, T10–T12), and stop any remaining substantial content loss (T02–T08, T15–T16, T25–T26).
3. Add independent content and visual regression assertions for office/PDF/image results. Current green tests do not certify all 165 tool routes.
4. Verify live production deployment with malformed inputs, expiry/cleanup, worker isolation, rate limiting, batch/Pro flows and multi-instance behavior. These were not established by this local recheck.

No application code was changed for this verification.
