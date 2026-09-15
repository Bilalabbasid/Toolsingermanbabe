# CoolWave production audit — 16 September 2026

## Verdict and scope

**Do not treat this checkout as production-ready yet.** This is a read-only audit of commit `5e9af16` on the local Windows production build, with no application-code fixes. `npm run build` and `npm run typecheck` pass; `npm test` passes 36 tests in eight files; `npm run lint` fails with **139 errors and 169 warnings**. The build generated 165 German tool routes. A running `next start` server on localhost:3202 supplied actual HTTP conversion, ownership, upload, download and sitemap evidence. This server uses Windows fallback converters because local LibreOffice, Ghostscript and Poppler executables are absent. Dockerfile installs those libraries, but **the Docker image and deployed site were not run**, so results for that runtime must be verified separately. A clean build cannot establish file fidelity, billing or mobile behavior.

The severity labels below reflect reproducible behavior and/or direct source inspection. “Confirmed local” describes this production-mode Windows runtime; “source-confirmed” describes behavior in the checked-in code; “deployment unverified” means the Docker/deployed behavior could differ. No claim that all 165 tools were fully exercised is made: their landing routes were crawled, and representative engines were executed end to end.

## Critical and high findings — exact changes to make

### P0 — Paid checkout can create a subscription that never belongs to an account

`src/app/api/v1/stripe/checkout/route.ts:38-110` allows checkout with `user === null`, labels its metadata `userId: 'anonymous'`, and creates a Stripe subscription. `src/app/api/v1/stripe/webhook/route.ts:84-113` only assigns the purchased plan when `userId !== 'anonymous'`. There is no later claim/reconciliation flow in this code. A buyer who checks out before logging in could pay but never receive the plan. The webhook also acknowledges events with HTTP 200 if the database is not configured (`webhook/route.ts:61-65`), and catches subscription-update errors but still records the event as processed and returns 200 (`:92-113`, `:148-169`). A transient database failure could therefore become permanent entitlement loss. **Source-confirmed; payment was not submitted.**

Fix: require a verified signed-in account and a working database before creating a paid Checkout Session. Store a durable user/customer association before redirecting. In the webhook, make subscription mutation and event-id recording one transaction; return a retriable failure when either fails. Reconcile Stripe customer/subscription state after outages and test anonymous, duplicate, failed-DB and recovered-DB events with Stripe test-mode fixtures. Do not process payment while entitlement persistence is unavailable.

### P0 — Server conversions are falsely labeled as local on the upload control and in SEO/privacy text

On `/de/pdf-in-word-umwandeln`, the actual upload control says **“100% lokal im Browser”** even though the page header correctly says “Server-Verarbeitung” and `src/components/engines/DocConvertEngine.tsx:264-285` calls `fetch('/api/v1/jobs')` with the file. `DocConvertEngine.tsx:566-573` does not pass `isLocal={false}`, while `src/components/tools/FileUploader.tsx:17-28` defaults `isLocal = true`. `src/components/common/CookieBanner.tsx:104` says documents are processed locally. `src/config/blog.config.ts:98-120` describes PDF→Word as “ohne Server-Upload”; `src/components/blog/BlogToolCTA.tsx:66` gives a blanket “100% Client-Side” claim. These statements can lead a person to upload a confidential file under a false privacy assumption. **Confirmed in the live desktop screenshot and source.**

Fix: pass the processing mode explicitly from each engine to `FileUploader`, use a centralized tool-capability indicator, and show server upload/retention before file selection. Correct the cookie banner, related CTAs, blog guides and OG text for the actual tool. Audit every server-required tool for the same default and test rendered copy against a network-request assertion. Stop claiming cryptographic shredding or guaranteed “100% DSGVO” without substantiation; deletion uses `fs.unlink`, not secure erasure.

### P1 — DOCX→PDF silently discards embedded images and formatting in the fallback runtime

`src/server/services/adapters/OfficeConversionEngine.ts:267-333` tries LibreOffice and then calls `mammoth.extractRawText`, drawing plain paragraphs into a PDF. A test DOCX containing text plus a red embedded PNG completed with a 6,830-byte PDF, one page, and **zero image-paint operations**. The same fallback also omits tables, shapes and pagination. This contradicts the `word-in-pdf-umwandeln` landing page claims of unchanged layout and perfect quality (`src/config/tools.config.ts:882-925`). The failure is silent: the API returns “completed” and a valid PDF. **Confirmed local; Docker with healthy LibreOffice unverified.**

Fix: require LibreOffice (or an equivalent renderer) for layout-preserving DOCX/PPTX/ODT routes; fail with `ENGINE_UNAVAILABLE` when unavailable or conversion fails. If a text-only conversion is explicitly offered, name it separately and warn that graphics/layout are removed. Add fixtures containing images, tables, headers and multiple pages; assert visible objects and page contents, not just `%PDF` bytes.

### P1 — Rate limits can be reset by changing a supplied IP header

`src/server/security/rateLimiter.ts:130-158` accepts `cf-connecting-ip`, `x-real-ip` and `x-forwarded-for` without verifying that the request came through a trusted proxy; buckets are also process-local. A local POST test from `cf-connecting-ip: 198.51.100.45` returned 400 for the first 30 malformed uploads and 429 for the 31st; a request with `198.51.100.46` immediately returned 400. If the public app is directly reachable, the limiter is bypassable. With multiple instances, limits are not shared. **Confirmed local, exposure depends on deployment ingress.**

Fix: configure and enforce one header overwritten by a trusted ingress, block direct access to the app port, and derive the peer address when trust cannot be established. Use a shared atomic limiter (Redis is declared in `docker-compose.yml` but unused here), with request tests that attempt forged proxy headers and multi-instance requests. Apply to auth, admin, security, checkout, jobs and downloads.

### P1 — Pro browser experience and ad suppression never reflect a paid session

`src/lib/monetization/subscription.ts:20-21` unconditionally returns the Free plan and clears a previous local plan. `src/components/engines/DocConvertEngine.tsx:76`, `BatchProcessingQueue.tsx:68`, `ImageConvertEngine.tsx:63`, `src/components/common/Header.tsx:46`, `src/lib/monetization/adsense.ts:11` and `src/components/common/AdSlot.tsx:32` use that value. Server job entitlement checks the authenticated plan in `src/server/security/request.ts:15-31`, so a paid user can get Pro processing server-side but a Free file-picker limit, Free badge, disabled client batch handling and ads client-side. A current paid session was unavailable to execute because the local database is unreachable. **Source-confirmed; end-to-end account behavior unverified.**

Fix: fetch `/api/v1/auth/me` once through a shared subscription context, hydrate it on login/webhook return, and use the server-returned entitlements for all limits and ad eligibility. Default to no personalized ads until paid status and consent are resolved. Keep server checks authoritative. Test a real Pro login, refresh, cancel and payment-failure state across tool and ad components.

### P1 — PDF→PowerPoint says editable, but content is a full-page image

`src/server/services/adapters/OfficeConversionEngine.ts:618-662` renders each PDF page to PNG and places it across the slide; the transparent text layer is tiny and does not reconstruct editable visual objects. The downloaded two-page test PDF yielded a valid two-slide PPTX, but slide 1 has one raster picture for the visual page. `src/config/tools.config.ts:990-1020` says “bearbeitbare PowerPoint-Folien,” “Folienlayouts und Texte bleiben erhalten,” and says text and diagrams can be adjusted. That promise is false for the produced slide. **Confirmed output structure.**

Fix: either describe the feature as page-image slides with rearrangeable pages, or build a genuine text/image/shape extraction path and clearly qualify its limits. Remove `.ppt` from this tool’s target-format promise unless it actually outputs it. Add a file-level test that edits a visible title text box and checks whether its rendered appearance changes.

### P1 — Current configured database is not ready; auth fails on the local production server

`GET /api/health/ready` returned **503** with `Database configured but unreachable`; an otherwise valid-shaped login request returned a sanitized **500**. `src/app/api/health/ready/route.ts` detects the issue correctly. However `docker-compose.yml:29-34` and `Dockerfile:95-97` use the weaker `/api/health` for container liveness, which returned **200** in this same unhealthy state. Current Docker behavior was not exercised; the local environment may simply be missing the DB service.

Fix: restore database connectivity and apply `npm run db:deploy` before validating auth/billing; use `/api/health/ready` for deployment readiness and keep `/api/health` only for liveness. Test login/register, admin role, Stripe webhook and Pro post-payment in an environment with a real database. Verify configured secrets without printing them. Do not infer deployed readiness from a localhost `/api/health` 200.

### P1 — SEO guide and landing-page claims exceed actual fidelity

`src/config/blog.config.ts:98-150` uses “ohne Formatierungsverlust,” “100% kostenlos im Browser,” “ohne Server-Upload,” and says formats automatically transfer. The actual tool page admits layout changes; scanned PDF→DOCX OCR gave editable text but cannot reconstruct exact columns or fonts; original-view scan DOCX instead contains only images. `src/config/tools.config.ts:1000-1020` similarly calls raster PPTX fully editable. Google’s [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) emphasizes helpful, reliable, first-hand content; from this audit, misleading promises are a content-quality risk, **not a proven ranking penalty or ranking guarantee**.

Fix: rewrite the affected German guides with tested before/after screenshots, clear scan-mode differences, supported formats, limitations and representative source/output files. Replace absolute titles with honest intent such as “PDF in Word umwandeln: Text bearbeiten und Layout prüfen.” Align the FAQ, CTA, schema and OG descriptions with behavior. Use Search Console query/page data and actual German user terms to decide subsequent guides; that external account data was unavailable, so keyword volume/rankings were not asserted.

### P2 — Spreadsheet PDF export silently shortens long cells in the fallback renderer

`src/server/services/adapters/OfficeConversionEngine.ts:550-567` slices text until it fits one cell width, then appends an ellipsis, despite a nearby comment promising no cell truncation. A 100-character cell converted successfully to a one-page PDF. The PDF is structurally valid, but the written text path is source-confirmed to omit characters when long. **Source-confirmed; visual output not independently rendered; Docker LibreOffice path may differ.**

Fix: wrap text into taller rows, scale according to print settings, or paginate columns, preserving full text; fail rather than silently dropping data. Assert extracted PDF text includes the full long-cell value and check multiple worksheets/charts/images.

### P2 — Browser image export errors can leave processing stuck

`src/components/engines/ImageCropEngine.tsx:182-193`, `ImageRotateFlipEngine.tsx:87-98` and `ImageDpiEngine.tsx:114-138` throw inside asynchronous `canvas.toBlob` callbacks. Their enclosing synchronous `try/catch` cannot catch that throw, so a null blob or metadata patch failure can leave the spinner running and give no controlled error. **Source-confirmed failure path; browser export failure not forced.**

Fix: await a Promise that rejects when `toBlob` returns null; catch it at the top-level export handler, set processing false in `finally`, and show an inline error. Test canvas export returning null and a rejected metadata patch.

### P2 — Regex utility still has an unbounded main-thread fallback

`src/components/engines/DevUtilityEngine.tsx:455-473` uses a timed Worker normally, but if Worker construction fails, calls `Array.from(input.matchAll(reg)).slice(0, 1000)` synchronously. That fully enumerates matches before slicing and can freeze the main thread for a pathological pattern. **Source-confirmed; not browser-reproduced.**

Fix: cap input length and match count before execution; if isolated execution is unavailable, reject complex patterns instead of running them on the UI thread. Cover Worker-disabled and catastrophic patterns in a browser test.

### P2 — CI lint gate is failing and regression coverage became narrower

`npm run lint` exits 1 with 139 errors (predominantly explicit `any`) and 169 warnings across `src`. The 36 passing Vitest tests do not prove 165 tool workflows. For instance `test/regression.repair.test.ts` checks PPTX→PDF PDF magic/pages and PDF→SVG length, but not visible image/object preservation; `test/security.test.ts` contains mocked role comparisons rather than actual admin-route integration. **Confirmed local.**

Fix: restore a passing lint gate with scoped typing corrections, then expand conversion assertions to actual output contents/visual rendering and run HTTP/browser tests against the production Docker image. Include a CI matrix for normal, malformed, corrupt, multi-page, scan, table, image, legacy Office, oversized and batch inputs; test failure cleanup and expired links with an injectable clock.

## Passed checks and limits of evidence

| Area | Current evidence | Result |
| --- | --- | --- |
| Homepage, main navigation, search | Homepage loads, navigation links exposed in accessibility tree, search for “OCR” returns results; search includes 19 results due synonym expansion | Working; search relevance could be tightened |
| Tool/category/blog/privacy/legal pages | Build generates 165 tool routes; all 208 sitemap-listed URLs return 200, one H1, title, description and matching canonical; no duplicate title/description in this crawl | Working at HTTP/metadata level, engine behaviors separately sampled |
| robots.txt/sitemap.xml | Both load; sitemap URLs unique; PDF/A intentionally omitted from sitemap, admin/API disallowed | Working in local build; live search indexing not verified |
| PDF→Word | Two-page text PDF gives editable DOCX with 45 text characters and no input filename in body. Actual scanned CV in `scanMode=text` gives editable OCR DOCX (43 text elements, no image or filename); original-view branch gives two page images and no editable text | Working in stated modes; OCR accuracy/layout not independently scored |
| PDF→PowerPoint→PDF | Two PDF pages give two PPTX slides and return two PDF pages; slides are raster backgrounds | Valid outputs, misleading editability promise |
| PDF→SVG | First page SVG has an embedded PNG and a text layer, as documented on its tool page | Working as raster-backed SVG, not vector extraction |
| CSV→XLSX | Quoted comma, quoted newline and leading-zero IDs survive into workbook rows | Working for this fixture |
| Image/archive/PDF | PNG→WebP RIFF output, PNG→one-page PDF, ZIP extraction with one intact file, PDF compression valid PDF | Working for these fixtures; local PDF/A fails clearly without Ghostscript |
| Input rejection | Empty: 400 `EMPTY_FILE`; fake PDF: 400 `SPOOFED_PDF`; PDF bytes named PNG: 400 `SPOOFED_PNG`; 51 MB: 413; traversal/XSS-style filename sanitized to `_evil_$.docx` | Working for sampled attacks |
| Wrong conversion type | PDF submitted as `office_docx_to_pdf` is accepted as a queued job, later fails with a generic sanitized error; uploaded input cleaned | Safe failure, avoidable wasted job; validate source/type pair before enqueue (`src/server/jobs.ts:48-62`) |
| Batch | Two valid files accepted with two job IDs; browser shows five-file Free batch despite the tool landing saying one file | API path working, promises inconsistent |
| Ownership/download | Other owner job polling 404; invalid/expired token 403; successful signed download 200 and no-store/noindex headers; input removed on successful job and output retained for download | Working in sample; 15-minute actual expiry not observed with wall clock |
| Temp files/failed jobs | Journal record for successful DOCX showed `inputExists=false`, `outputExists=true`; queue’s minute timer and storage cleanup remove expired/failed files (`src/server/queue/queue.ts:28-32`, `:145-170`). Paths are restricted under storage base (`src/server/storage/storage.ts:78-98`) | Source plus sample evidence; no deliberate symlink/race or clock-advance isolation test |
| Auth/admin | Unauthenticated admin APIs and jobs listing 401; `/de/admin` 401; error body for mismatched conversion does not expose server paths | Unauthorized access blocked; authenticated flows blocked by DB outage |
| Ads/Pro | Ads require marketing consent to load AdSense, but ad placeholder appears before consent and client subscription always Free; billing not exercised | Architecture incomplete for paid users |
| Desktop/mobile | Desktop screenshot of Word tool exposed false local-processing badge and a horizontal scrollbar at ~1127px. CSS uses responsive utility classes | Narrow-screen device and touch workflow **not tested**; needs real 375px/768px browser checks |

## Remaining production tests to run after fixing blockers

1. Build and run the **actual Docker standalone image** with its LibreOffice, Ghostscript, Poppler, FFmpeg, Tesseract and database, then compare outputs of DOCX images/tables, long XLSX cells, image-only PPTX, scanned and large multi-page PDF, PDF/A with an independent validator, legacy DOC/PPT, EPS and OCR in German/English. The local `next start` warns that standalone builds should use `node .next/standalone/server.js`.
2. Test Stripe checkout and signed webhooks in test mode: authenticated purchase, anonymous rejection, duplicate event, DB outage/retry/reconciliation, downgrade, refunds and Pro no-ads state. No real charge is needed.
3. Use controlled clock/short retention in an isolated test server to verify output and signed URL expiry, cleanup after failure/cancellation and restart, and file-worker isolation. Test rate limiting with spoofed headers and two app instances behind the actual ingress.
4. Run visible browser tests at 375px and 768px and desktop: menu, search/modal, keyboard, upload controls, PDF editor, downloads, cookie banner, batch progress, image canvas, and horizontal overflow. Run Lighthouse/Core Web Vitals on the deployed URL; this local audit did not measure field performance or rankings.
5. Verify the actual public domain’s crawl/index status and German query data in Search Console. The local [canonical/sitemap signals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) are consistent; search engines choose their own canonical/indexing, so a 200 response is not proof of rankings.

Application code was **not modified** during this audit. Audit-only scripts and JSON results are in `scratch/`; the report is the requested review artifact.
