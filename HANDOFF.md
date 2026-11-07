# Datei Tools – Handoff (Stand 2026-11-08)

Branch: `feat/browser-only-tools-seo` (pushed to `origin`). `main` is untouched.
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

### Deploy
1. Open the Vercel preview for branch `feat/browser-only-tools-seo` and click through: `/de`, `/de/pdf-komprimieren`, `/de/pdf-schuetzen`, `/de/word-in-pdf-umwandeln`, `/de/bild-zu-text`, `/de/video-in-mp4-umwandeln`, `/de/zip-entpacken`, `/de/impressum`, `/sitemap.xml`, `/robots.txt`.
2. Check the FFmpeg asset `/vendor/ffmpeg/ffmpeg-core.wasm` (~31 MB) is served on the preview (Vercel static file limits). If it is rejected, load it from a pinned CDN (`@ffmpeg/core@0.12.10`) in `src/lib/client/media/ffmpegClient.ts` and add that origin to CSP `connect-src`/`script-src`.
3. Merge to `main` → production. In Vercel set the domain `datei-tools.de` (+ `www` redirect). No env vars are required for the tools; `NEXT_PUBLIC_SITE_URL` is ignored (domain hard-coded).
4. Google Search Console: verify `datei-tools.de`, submit `https://datei-tools.de/sitemap.xml`.

### To finish the unfinished items
- **Article clusters**: open each `articles-cluster-*.ts`, review every article for accuracy against the engine code, remove anything incomplete, then add `import { STUDY_CLUSTER_ARTICLES } from './blog/articles-cluster-study'` (and WEB) to `src/config/blog.config.ts` and spread into `BLOG_ARTICLES`. Then run `validateBlogInternalLinks()` (must return `valid: true`) and rebuild.
- **New content rules** (Google + GEO): answer-first `directAnswer` (2–3 sentences), question-shaped headings, only claims the code really implements (check `src/components/engines/*` and `src/lib/client/*`), no invented statistics, honest dates, metaTitle ≤ 60 / metaDescription ≤ 160, link only to active tool slugs.
- **Never** link to hidden slugs (see `CLIENT_UNSUPPORTED_SLUGS`).
- **Adding a tool**: add it to the config, make sure its engine runs client-side, add the engine limit to `getClientFileLimitMB`, test in a real browser with the tab in front.

### Hand-off prompt (paste into a new Claude Code session)
> You are continuing work on the Next.js 16 project in this repo ("Datei Tools", https://datei-tools.de, German, all tools run 100 % in the browser). Read `HANDOFF.md` and `AGENTS.md` first. Work on branch `feat/browser-only-tools-seo`. Tasks, in order: (1) open an article containing a markdown table on a local build and confirm it renders as a table. (2) Review and, if accurate, merge `src/config/blog/articles-cluster-study.ts` and `articles-cluster-web.ts` into `BLOG_ARTICLES`; run `validateBlogInternalLinks()`. (3) Fix the engine UX issues listed in HANDOFF §2 (OCR savings bar, video 0 % progress, self-suggestion in DownloadBox). (4) Verify FAQ/HowTo JSON-LD matches visible content on article and tool pages. (5) Crawl all sitemap URLs on a local `next start` and fix titles > 60 chars, missing H1, broken internal links. (6) Ask the owner before deleting the unused server API routes. Run `npm run typecheck`, `npx vitest run`, `npm run build` before every commit; test changed tools in the built-in browser with real files; commit and push to the branch; don't merge to main without the owner's OK.
