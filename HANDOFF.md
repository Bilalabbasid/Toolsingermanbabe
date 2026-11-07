# Datei Tools – Handoff (Stand 2026-11-08)

Branch: everything is merged and pushed to **`main`** (also kept on `feat/browser-only-tools-seo`). Repo: https://github.com/Bilalabbasid/Toolsingermanbabe
Live domain: **https://datei-tools.de** (hard-coded in `src/lib/seo.ts`, `src/app/layout.tsx`, `src/config/env.config.ts`).
Operator shown on legal pages: **Bil Al, 20095 Hamburg, Deutschland, info@datei-tools.de**.

---

## 1. What this release contains (done)

### All tools run 100 % in the browser (no backend needed)
- **159 active tools**, every one processes files locally (pdf-lib, pdf.js, WebAssembly builds of qpdf, 7-Zip, FFmpeg, Tesseract). Files never leave the device.
- **Hidden** (can't be done faithfully in a browser): `eps-in-svg-umwandeln`, `eps-in-pdf-umwandeln`, `pdfa-umwandeln`, `pptx-in-ppt-umwandeln`.
  Single source of truth: `CLIENT_UNSUPPORTED_SLUGS` in `src/config/deployment.config.ts`. Hidden slugs 404 and are excluded from sitemap/search/footer.
- WASM runtimes are copied from `node_modules` into `public/vendor/` by `scripts/copy-wasm-assets.mjs` (runs on `postinstall` and in `npm run build`). `public/vendor/` is git-ignored.
- Client code lives in `src/lib/client/{pdf,image,design,docs,ocr,media,archive}/`; engines in `src/components/engines/*`.
- Per-engine file limits shown on tool pages: `getClientFileLimitMB()` in `src/config/deployment.config.ts` (PDF security/compress/sign/repair 100 MB, image/doc/design 300 MB, OCR 50 MB, media/archive 500 MB). Batch limits: `src/config/batch.config.ts` (30 files, 300 MB, 1 GB total).
- `next.config.ts`: CSP allows `'wasm-unsafe-eval'`, `worker-src 'self' blob:`, `media-src 'self' blob:`, `connect-src blob: data:`; webpack client fallbacks for `fs/path/https/...` and `node:` scheme; `/vendor/*` cached 30 days. Build uses **webpack** (`next build --webpack`, `npm run dev` = `next dev --webpack`). Turbopack is not supported for this project (FFmpeg/qpdf workers).
- pdf.js page rendering for processing uses `intent: 'print'` so jobs keep running in background tabs.

### Verified in a real browser (production build)
PDF protect (AES-256) + unlock (wrong-password error), compress (575→208 KB), redact (text really removed), sign; Word→PDF→Word round trip incl. umlauts/€; OCR (DE/EN, exact text); audio WAV→MP3; video WebM→MP4; ZIP create/extract; PNG→ICO (16–256 px), PNG→TIFF, PNG→PSD→PNG (pixel-exact).
All other tools: unit/Node-tested by the implementing agents, **not** individually clicked through in a browser (see §3).

### UI, SEO, content
- New header (mega menu, ⌘K search), server-rendered footer with internal links, new home page, new tool page layout.
- Blog: **88 articles** (82 + 6 in `src/config/blog/articles-guides-2.ts`) with in-content links (`[x](tool:slug)`, `[x](blog:slug)`), 10 blog hub pages `/de/blog/kategorie/*`, related tools/articles.
- Sitemap (`src/app/sitemap.ts`), robots (`src/app/robots.ts`), canonical/OG/Twitter metadata, JSON-LD (Organization, WebSite, BreadcrumbList, BlogPosting, FAQPage, HowTo, SoftwareApplication). Tool, article, category and blog-hub pages are statically generated.
- Article dates are honest: new articles `publishedAt` 2026-11-08; revised ones `updatedAt` 2026-11-08. **Do not bump dates without real changes** (Google helpful-content guidance).
- Contact everywhere: `info@datei-tools.de`. No "Über uns" page (owner decision).

---

## 2. Unfinished work (stopped mid-way at owner request)

| Item | State | Where |
|---|---|---|
| 2 extra article clusters (students, photos/web) | Files exist but are **not imported** and **not reviewed** | `src/config/blog/articles-cluster-study.ts`, `src/config/blog/articles-cluster-web.ts` |
| 2 clusters (office/admin, developer/data) | Never written | – |
| GEO/helpful-content pass on articles | Partly done (directAnswers + some tables). Not reviewed: body text of `articles-core.ts`; partial on `articles-docs-images.ts`, `articles-media-dev.ts`, `articles-pdf-security.ts` | `src/config/blog/` |
| Markdown **table** rendering in articles | Implemented in `BlogRichText.tsx`; spot-check one article with a table on the preview | `BlogRichText.tsx` |
| Structured data ↔ visible text check | Not done | `src/app/[locale]/blog/[slug]/page.tsx`, `src/app/[locale]/[slug]/page.tsx` |
| Tool-page copy pass (answer-first intros/FAQs) | Not done | `src/config/tools.config.ts`, `utilities.config.ts`, `media_archive.config.ts`, `categories.config.ts` |
| QA crawl of all URLs | Not done | – |
| Unit tests for `src/lib/client/**` | Not written | `test/client/` |
| Engine UX polish | Partly done (agent stopped; typecheck + build pass). Known open issues: OCR success box shows a meaningless "100 % kleiner" savings bar; video progress stays at 0 % when input has no duration (browser-recorded WebM); "Direkt weiterbearbeiten" can suggest the current tool | `src/components/engines/OcrEngine.tsx`, `MediaEngine.tsx`, `src/components/tools/DownloadBox.tsx` |
| Performance + security review | Not completed | – |
| Old server API routes | Still present but unused by the UI (`/api/v1/jobs*`, `/api/v1/convert`, `/api/v1/pdf/security`, `src/server/**`). They pull heavy native deps into Vercel functions. Recommended: delete (needs owner OK) | `src/app/api/v1/**` |
| Fact spot-checks flagged by writers | Windows 11 native 7z/RAR; digital passport photo rule since 1 May 2025; Excel "Daten > Aus PDF" availability; macOS Preview AVIF | blog articles |
| Analytics | `/api/v1/analytics/track` writes to a local JSON file; on Vercel it silently doesn't persist. Swap for Vercel Analytics or remove | `src/server/analytics/**` |
| Dark mode | Tokens prepared (`data-theme="dark"`), not enabled — many engine/blog pages hard-code light colours | `src/app/globals.css` |

---

## 3. Directions for the next person / agent

### Setup
```bash
npm install          # also runs prisma generate + copies WASM to public/vendor
npm run typecheck
npx vitest run       # 47 tests should pass
npm run build        # next build --webpack
npx next start -p 3200
```

### Deploy (main is pushed — Vercel builds production from it)
1. Check the Vercel deployment of `main` succeeded (build command `npm run build` = `prisma generate && node scripts/copy-wasm-assets.mjs && next build --webpack`). If the build fails, read the Vercel build log first.
2. Click through on the deployment: `/de`, `/de/pdf-komprimieren`, `/de/pdf-schuetzen`, `/de/word-in-pdf-umwandeln`, `/de/bild-zu-text`, `/de/video-in-mp4-umwandeln`, `/de/zip-entpacken`, `/de/impressum`, `/sitemap.xml`, `/robots.txt`.
3. Check the FFmpeg asset `/vendor/ffmpeg/ffmpeg-core.wasm` (~31 MB) is served (Vercel static file limits). If it is missing/rejected, load it from a pinned CDN (`@ffmpeg/core@0.12.10`) in `src/lib/client/media/ffmpegClient.ts` and add that origin to CSP `connect-src`/`script-src` in `next.config.ts`. Same check for `/vendor/tesseract/*`, `/vendor/tessdata/*`, `/vendor/qpdf/qpdf.wasm`, `/vendor/7z/*`.
4. In Vercel set the domain `datei-tools.de` (+ `www` → apex redirect). No env vars are required for the tools; `NEXT_PUBLIC_SITE_URL` is ignored (domain hard-coded). `DATABASE_URL`/Stripe only matter for the (disabled) accounts/billing pages.
5. Google Search Console: verify `datei-tools.de`, submit `https://datei-tools.de/sitemap.xml`, request indexing for `/de` and the top tools.

### To finish the unfinished items
- **Article clusters**: open each `articles-cluster-*.ts`, review every article for accuracy against the engine code, remove anything incomplete, then add `import { STUDY_CLUSTER_ARTICLES } from './blog/articles-cluster-study'` (and WEB) to `src/config/blog.config.ts` and spread into `BLOG_ARTICLES`. Then run `validateBlogInternalLinks()` (must return `valid: true`) and rebuild.
- **New content rules** (Google + GEO): answer-first `directAnswer` (2–3 sentences), question-shaped headings, only claims the code really implements (check `src/components/engines/*` and `src/lib/client/*`), no invented statistics, honest dates, metaTitle ≤ 60 / metaDescription ≤ 160, link only to active tool slugs.
- **Never** link to hidden slugs (see `CLIENT_UNSUPPORTED_SLUGS`).
- **Adding a tool**: add it to the config, make sure its engine runs client-side, add the engine limit to `getClientFileLimitMB`, test in a real browser with the tab in front.

### Hand-off prompt (paste this whole block into a new AI coding session)

```text
You are taking over "Datei Tools" (https://datei-tools.de), a German free file-conversion website.
Repo: https://github.com/Bilalabbasid/Toolsingermanbabe — work on branch `main` (production deploys from it on Vercel).
Owner: Bil Al, 20095 Hamburg, contact info@datei-tools.de. The site is ONLY browser-based conversion — no accounts needed,
no "Über uns" page wanted, no server processing.

READ FIRST: HANDOFF.md (this file) and AGENTS.md. This is Next.js 16 (App Router, React 19, Tailwind v4) — APIs differ from
older Next versions; read node_modules/next/dist/docs/ before using Next APIs. Build/dev use webpack (`next build --webpack`,
`npm run dev` = `next dev --webpack`); Turbopack is not supported for this project.

ARCHITECTURE YOU MUST KEEP:
- Every tool processes files 100 % in the visitor's browser. Never add server-side file processing or uploads.
- Tool registry: src/config/tools.config.ts, utilities.config.ts, media_archive.config.ts; getActiveTools() filters hidden slugs
  via CLIENT_UNSUPPORTED_SLUGS in src/config/deployment.config.ts (hidden: eps-in-svg-umwandeln, eps-in-pdf-umwandeln,
  pdfa-umwandeln, pptx-in-ppt-umwandeln). Never link to hidden slugs.
- Engines: src/components/engines/*; dispatcher src/components/tools/ToolDispatcher.tsx; client libraries src/lib/client/{pdf,image,design,docs,ocr,media,archive}/.
- WebAssembly runtimes (qpdf, 7-Zip, FFmpeg, Tesseract + tessdata) are copied from node_modules to public/vendor/ by
  scripts/copy-wasm-assets.mjs (postinstall + build). public/vendor/ is git-ignored. CSP in next.config.ts allows 'wasm-unsafe-eval', blob: workers/media.
- pdf.js rendering for processing must use `intent: 'print'` (keeps working in background tabs).
- Per-engine file limits displayed on tool pages: getClientFileLimitMB() in deployment.config.ts — keep in sync with engine checks.
- Blog: src/config/blog/*.ts merged in src/config/blog.config.ts (BLOG_ARTICLES). Section text supports [Anker](tool:slug),
  [Anker](blog:slug), [Anker](/de/...), **bold**, lists, markdown tables (rendered by src/components/blog/BlogRichText.tsx).
  validateBlogInternalLinks() must return valid: true.
- SEO: SITE_URL hard-coded https://datei-tools.de (src/lib/seo.ts); sitemap src/app/sitemap.ts; robots src/app/robots.ts;
  JSON-LD in src/lib/json-ld.ts. Tool/article/category pages are statically generated (generateStaticParams, dynamicParams=false).

CONTENT RULES (Google helpful-content + AI-search/GEO):
- German, "Sie" form. Answer-first: each article's directAnswer = 2–3 standalone sentences answering the H1.
- Question/task-shaped headings; only claim what the engine code really does (check src/components/engines + src/lib/client);
  no invented statistics or laws; metaTitle <= 60 chars, metaDescription <= 160.
- Honest dates: new article publishedAt = the real date; only bump updatedAt for substantial changes.
- Structured data (FAQPage/HowTo) must match text visible on the page.

TASKS, IN ORDER:
1. Confirm the Vercel production deployment of main succeeded and that /vendor/ffmpeg/ffmpeg-core.wasm (~31 MB),
   /vendor/tesseract/*, /vendor/tessdata/*, /vendor/qpdf/qpdf.wasm and /vendor/7z/* are served. If ffmpeg-core.wasm is
   too large for Vercel, load @ffmpeg/core@0.12.10 from a pinned CDN in src/lib/client/media/ffmpegClient.ts and add the
   origin to the CSP.
2. Smoke-test in a real browser (tab in front) with real files: pdf-komprimieren, pdf-schuetzen, pdf-passwort-entfernen,
   pdf-schwaerzen, pdf-unterschreiben, pdf-zusammenfuegen, word-in-pdf-umwandeln, pdf-in-word-umwandeln, excel-in-pdf-umwandeln,
   heic-in-jpg-umwandeln, png-in-ico-umwandeln, bild-komprimieren, bild-zu-text, ocr-pdf, audio-konvertieren,
   video-in-mp4-umwandeln, zip-entpacken, 7z-entpacken. Fix anything broken.
3. Fix known engine UX issues: OCR success box shows a meaningless "100 % kleiner" savings bar (OcrEngine/DownloadBox);
   video progress stays 0 % when the input has no duration — show elapsed time/indeterminate (MediaEngine, src/lib/client/media);
   DownloadBox "Direkt weiterbearbeiten" can suggest the current tool — exclude it.
4. Review src/config/blog/articles-cluster-study.ts and articles-cluster-web.ts for accuracy/completeness; if good, import and
   spread them into BLOG_ARTICLES in src/config/blog.config.ts; run validateBlogInternalLinks().
5. Optionally write the missing clusters (office/admin: Bewerbung, Belege digitalisieren, Ausweiskopie schwärzen, Rechnungen
   archivieren; developer/data: JWT, SHA-256 prüfen, JSON→CSV, Regex) following the content rules.
6. Finish the GEO pass on article bodies (src/config/blog/articles-*.ts) and tool-page copy (introDe/faqDe in the tool configs):
   answer-first, remove fluff/unverifiable claims, keep slugs/dates.
7. Crawl every sitemap URL on a local `npx next start -p 3200`: HTTP 200, exactly one H1, unique titles <= 60 chars with brand,
   descriptions <= 160, canonical = https://datei-tools.de + path, no broken internal links, images with alt, valid JSON-LD. Fix issues.
8. Add vitest tests for pure modules in src/lib/client/** (qpdfArgs, image/binary encoders, archive tar/safety, media args,
   docs csv/xlsx converters) under test/client/.
9. Spot-check facts flagged in articles: Windows 11 native 7z/RAR support; digital passport photo rule since 1 May 2025;
   Excel "Daten > Aus PDF" availability; macOS Preview AVIF support.
10. ASK THE OWNER before deleting the unused server routes (src/app/api/v1/jobs*, /convert, /pdf/security, src/server/**,
    heavy native deps) and before replacing the local-file analytics (/api/v1/analytics/track) with Vercel Analytics.

WORKFLOW: before every commit run `npm run typecheck`, `npx vitest run` (47+ tests pass), `npm run build`. Don't commit
data/analytics/events_ledger.json changes or .claude/. Commit with clear messages and push to main only after the build passes.
Report to the owner in short, plain English what changed and what is still open; update HANDOFF.md at the end.
```
