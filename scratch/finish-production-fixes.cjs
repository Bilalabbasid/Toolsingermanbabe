const fs = require('node:fs');
function edit(p, fn) { fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); }
edit('src/lib/monetization/subscription.ts', s => s.slice(0, s.indexOf('export function resolveTierFromApiKey')) + `// Paid accounts are unavailable until durable server-side subscriptions are integrated.
// Neither localStorage, unsigned cookies nor key prefixes establish entitlement.
export function resolveTierFromApiKey(_apiKey?: string | null): SubscriptionTier { return 'free'; }
export function getServerSubscription(_headers: Headers): UserSubscription { return freeSubscription(); }
function freeSubscription(): UserSubscription { return { tier: 'free', isPro: false, status: 'none', entitlements: getEntitlements('free') }; }
export function getClientSubscription(): UserSubscription { return freeSubscription(); }
export function setClientSubscription(_tier: SubscriptionTier, _active = true) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('coolwave_pro_active'); } catch {}
  document.cookie = 'coolwave_pro_active=; path=/; max-age=0; SameSite=Lax';
  window.dispatchEvent(new Event('coolwave_subscription_changed'));
}
`);
// Migrate the documented Next.js convention and create the owner before parallel uploads.
let proxy = fs.readFileSync('src/middleware.ts', 'utf8');
proxy = "import { ownerId, setOwnerCookie, isAdminRequest } from '@/server/security/request';\n" + proxy.replace('export function middleware(', 'export function proxy(');
proxy = proxy.replace('  // 1. Skip', `  if (/^\\/(?:[a-z]{2}\\/)?admin(?:\\/|$)/.test(pathname) && !isAdminRequest(request)) {
    return new NextResponse('Nicht autorisiert.', { status: 401, headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } });
  }
  // 1. Skip`);
const last = proxy.lastIndexOf('return NextResponse.next();');
proxy = proxy.slice(0, last) + 'return setOwnerCookie(request, NextResponse.next(), ownerId(request));' + proxy.slice(last + 'return NextResponse.next();'.length);
fs.writeFileSync('src/proxy.ts', proxy);
fs.unlinkSync('src/middleware.ts');
edit('src/components/engines/PdfRepairOptimizeEngine.tsx', s => s.replace("} else if (mode === 'pdfa') {", "} else if (mode === 'pdfa') {\n      throw new Error('PDF/A-Konvertierung ist derzeit nicht verfuegbar. Es wird keine ungepruefte Archivdatei erstellt.');"));
// Whiteout is an overlay, not physical redaction. Make that limitation explicit.
edit('src/components/engines/PdfEditorEngine.tsx', s => s.replace('Rechtssichere Bearbeitung:', 'Bearbeitung mit Ebenen:').replace('Text, Formen, Zeichnungen und Schwärzungen werden als', 'Text, Formen und Zeichnungen werden als').replace('normgerechte Vektor- und Textebenen präzise über das Originaldokument eingebettet.', 'Vektor- und Textebenen ueber das Original gelegt. Abdecken entfernt keinen Text. Fuer vertrauliche Inhalte verwenden Sie das separate Werkzeug PDF schwaerzen.').replace('aria-label="Schwärzen und abdecken"', 'aria-label="Optisch abdecken (Text bleibt erhalten)"').replace('title="Schwärzen / Abdecken"', 'title="Optisch abdecken – keine sichere Schwaerzung"'));
// Enforce format allowlists before native output-path construction.
for (const service of ['Audio', 'Video']) edit(`src/server/services/adapters/${service}Service.ts`, s => {
  const marker = "    // 2. Prepare isolated workspace";
  const formats = service === 'Audio' ? 'mp3|wav|aac|flac|ogg|m4a' : 'mp4|webm|gif|mov|avi|mkv';
  s = s.replace(marker, `    if (options.targetFormat && !/^\\.?(${formats})$/i.test(String(options.targetFormat))) throw new Error('Unsupported output format.');\n${marker}`);
  // Pipe-only protocols prevent file/URL references inside media playlists from reading host files.
  s = s.replace("['-y', '-i', inputPath]", "['-y', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'mov,mp3,wav,aac,flac,ogg,matroska,avi', '-i', inputPath]");
  s = s.replace('{ timeout: timeoutMs, maxBuffer:', '{ cwd: workDir, windowsHide: true, timeout: timeoutMs, maxBuffer:');
  return s;
});
console.log('Applied UI compatibility, session and format fixes.');
