# CoolWave German SEO audit

Audit date: 15 September 2026. Scope: repository changes and a local production build; no deployment or Search Console access was available. The earlier production/security audit is outside this narrowed task.

## Changes applied

| Finding | Change |
| --- | --- |
| Homepage metadata promised no uploads for a site with server conversions | Replaced with a factual description of the available tasks. Removed blanket compliance claims from shared home/footer copy. |
| Every tool inherited “ohne upload” meta keywords | Removed the meta-keyword block; retained German search synonyms for the site's own search. |
| Office tools could display a local-processing badge | Document-conversion registry entries now disclose server processing. |
| Exaggerated copy on six important landing pages | Rewrote titles, H1s, descriptions, introductions and FAQs around actual user questions and format limitations. Removed perfect-layout and guaranteed-size promises. |
| Duplicate tool records produced repeated sitemap entries | Deduplicated the public registry and final sitemap by URL. |
| Sitemap dates changed on every build without editorial changes | Removed artificial `lastModified` values. Restore only when real per-page modification dates exist. |
| Blog advertises article previews rather than full articles | Added `noindex` and removed it from the sitemap until substantive guides are published. |
| PDF/A conversion is unavailable | Excluded that tool from indexing and sitemap. Its existing route remains accessible. |
| Login, registration and account pages were indexable | Added `noindex` metadata. Admin metadata also excludes indexing. |
| Separate Googlebot/Bingbot rules omitted exclusions | Consolidated crawl rules; included `/de/admin`. Private-page security does not depend on robots.txt. |
| WebSite schema described an unimplemented query-URL search | Removed the unsupported SearchAction. |
| JSON-LD was interpolated without HTML escaping | Added a shared serializer and used it on home, category and tool pages. |
| Unsupported locale paths could render German pages | Added locale validation to the localized layout. |

Existing localized canonical URLs, German document language, crawlable category links, and tool-specific Open Graph images were retained.

## German search intent

These are qualitative search-intent choices based on German results and first-party German tool pages. No search-volume, keyword-difficulty, traffic or ranking numbers were obtained or invented. Copy is original, not copied from competitors.

| Primary phrase / landing page | Supporting phrases | Useful content added |
| --- | --- | --- |
| PDF zusammenfügen | PDF verbinden; PDFs zusammenführen; Bewerbung PDF zusammenfügen | Ordering application documents; mixed page sizes; encrypted files |
| PDF komprimieren | PDF verkleinern; PDF Dateigröße reduzieren | Already compressed files; no guaranteed MB target; inspect the downloaded file |
| PDF in Word umwandeln | PDF zu Word; PDF in DOCX umwandeln | Layout differences; tables; scanned PDFs require OCR |
| Word in PDF umwandeln | DOCX in PDF; Word als PDF speichern | Server upload disclosure; fonts and page breaks; compare with the original |
| PNG in JPG umwandeln | PNG zu JPG; PNG in JPEG umwandeln | Lossy compression and loss of transparency |
| JPG in PNG umwandeln | JPEG in PNG; JPG als PNG speichern | No restored detail, no automatic background removal, potentially larger files |

The editorial implementation is in `src/config/tool-editorial.config.ts`. This pass does not claim a manual rewrite or conversion-quality certification of all 165 registered tools. Remaining long-tail pages should receive editorial review based on actual user queries and verified tool behavior, rather than mass-generated keyword pages.

## Verification

- Production build passed, including TypeScript and static-page generation.
- Five focused SEO regression tests passed.
- HTTP crawl of the local production build: **177 sitemap pages**, all HTTP 200, each with exactly one H1, a description and matching canonical.
- **179 distinct internal destinations** checked; no broken links found.
- Zero duplicate sitemap URLs, duplicate titles or duplicate meta descriptions.
- Rendered JSON-LD parsed successfully throughout the crawl.
- Login, registration, account and blog pages returned `noindex`.
- A nonexistent tool URL returned 404; the Word-to-PDF Open Graph image returned 200 with `image/png`.
- Browser inspection confirmed the German Word-to-PDF title, server-processing disclosure and editorial content. It identified additional exaggerated short-description/how-to text, subsequently corrected and type-checked.

Machine-readable crawl evidence: `reports/seo-crawl.json`. Repeat after building and starting the site with `SEO_AUDIT_URL` pointing at the test server, then run `node scripts/seo-crawl.mjs`. This is an HTTP markup crawl, not a Lighthouse score or a complete mobile usability test.

## Remaining live-site verification

The public robots.txt and sitemap could not be retrieved through the web research tool in this session. Local fixes are not proof that the live domain serves them. After deployment, rerun the crawl against `https://coolwave.cool`, verify the canonical hostname and redirects, and submit the sitemap in the verified Search Console property. Review indexing exclusions, real German queries, clicks and impressions there. No Search Console verification token was fabricated.

Core Web Vitals field data, actual index coverage, backlinks and current rankings were not available. These remain unverified; no ranking guarantee or numerical SEO score is claimed. Original guides should be published only when complete and useful, with authorship and examples that can be substantiated.

## Research sources

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link) — descriptive page titles consistent with visible content.
- [Google: sitemap guidance in German](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=de) — canonical URLs and verifiable modification dates.
- [Google: helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — usefulness and accurate claims rather than search-engine-first filler.
- [PDF24 German tools](https://tools.pdf24.org/de/) and [PDF in Word](https://tools.pdf24.org/de/pdf-in-word) — German task vocabulary and intent, not evidence of CoolWave capabilities.
- [Adobe: JPEG versus PNG](https://www.adobe.com/de/creativecloud/file-types/image/comparison/jpeg-vs-png.html) — format tradeoffs and transparency.
