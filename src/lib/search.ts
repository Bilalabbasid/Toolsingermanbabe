import { ToolDefinition } from '@/types/tool';
import { TOOLS_CONFIG, getActiveTools } from '@/config/tools.config';

/**
 * German Synonym & Stemming Map
 * Expands search terms to relevant file extensions, action words, and formats.
 */
const GERMAN_SYNONYMS: Record<string, string[]> = {
  word: ['doc', 'docx', 'word', 'dokument', 'textverarbeitung'],
  doc: ['word', 'docx', 'doc', 'dokument'],
  docx: ['word', 'doc', 'docx', 'dokument'],
  excel: ['xls', 'xlsx', 'csv', 'tabelle', 'spreadsheet', 'kalkulation'],
  xls: ['excel', 'xlsx', 'csv', 'tabelle'],
  xlsx: ['excel', 'xls', 'csv', 'tabelle'],
  csv: ['excel', 'xlsx', 'tabelle', 'json', 'daten'],
  powerpoint: ['ppt', 'pptx', 'praesentation', 'folien', 'slides'],
  ppt: ['powerpoint', 'pptx', 'praesentation'],
  pptx: ['powerpoint', 'ppt', 'praesentation'],
  bild: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'psd', 'foto', 'grafik', 'image'],
  bilder: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'psd', 'foto', 'grafik', 'image'],
  foto: ['jpg', 'jpeg', 'png', 'webp', 'bild', 'grafik'],
  jpg: ['jpeg', 'png', 'webp', 'bild', 'foto'],
  jpeg: ['jpg', 'png', 'webp', 'bild', 'foto'],
  png: ['jpg', 'jpeg', 'webp', 'svg', 'ico', 'transparent', 'bild'],
  webp: ['jpg', 'png', 'bild', 'web'],
  komprimieren: ['verkleinern', 'reduzieren', 'kompression', 'schrumpfen', 'sparen', 'datei verkleinern', 'optimieren'],
  verkleinern: ['komprimieren', 'reduzieren', 'kompression', 'sparen', 'optimieren'],
  signieren: ['unterschrift', 'signatur', 'unterschreiben', 'zertifikat'],
  unterschrift: ['signieren', 'signatur', 'unterschreiben'],
  schwaerzen: ['zensieren', 'anonymisieren', 'ausblenden', 'sensibel', 'verbergen'],
  zusammenfuegen: ['verbinden', 'kombinieren', 'mergen', 'zusammenfassen'],
  mergen: ['zusammenfuegen', 'verbinden', 'kombinieren'],
  teilen: ['splitten', 'trennen', 'aufteilen', 'extrahieren'],
  splitten: ['teilen', 'trennen', 'aufteilen'],
  loeschen: ['entfernen', 'seiten loeschen'],
  entfernen: ['loeschen', 'metadaten entfernen'],
  drehen: ['rotieren', 'ausrichten', 'orientierung', 'kippen'],
  ocr: ['texterkennung', 'durchsuchbar', 'scan', 'schrifterkennung'],
  texterkennung: ['ocr', 'durchsuchbar', 'scan'],
  scan: ['ocr', 'texterkennung', 'dokument'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'musik', 'ton', 'sound'],
  musik: ['audio', 'mp3', 'wav', 'sound'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'gif', 'film', 'clip'],
  film: ['video', 'mp4', 'mov', 'clip'],
  zip: ['archiv', 'komprimieren', 'entpacken', 'packen', '7z', 'tar', 'gzip'],
  archiv: ['zip', '7z', 'tar', 'gzip', 'entpacken', 'packen'],
  entpacken: ['dekomprimieren', 'oeffnen', 'extrahieren', 'zip', '7z', 'tar', 'gzip'],
  packen: ['komprimieren', 'buendeln', 'zip'],
  sicherheit: ['passwort', 'schuetzen', 'verschluesseln', 'entsperren', 'berechtigungen'],
  passwort: ['schuetzen', 'entsperren', 'verschluesseln', 'sicherheit'],
};

/**
 * Normalizes text: lowercase, trim, maps German umlauts (ä->ae, ö->oe, ü->ue, ß->ss)
 */
export function normalizeGermanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s\-_.]/g, ' ');
}

export interface SearchResultItem {
  tool: ToolDefinition;
  score: number;
  formatFlow: string;
  matchedField: string;
}

/**
 * Generates user-friendly Format Flow label (e.g. "PDF → Word (DOCX)", "JPG → PNG", or "Text / JSON")
 */
export function getFormatFlow(tool: ToolDefinition): string {
  const sources = tool.sourceFormats.map((f) => f.replace(/^\./, '').toUpperCase());
  const targets = tool.targetFormats.map((f) => f.replace(/^\./, '').toUpperCase());

  if (sources.includes('*/*') || sources.length === 0) {
    if (targets.length > 0) return `Alle → ${targets.join('/')}`;
    return 'Universal';
  }

  // If source and target are the same (e.g. PDF compression, rotation, editor)
  if (
    sources.length === 1 &&
    targets.length === 1 &&
    sources[0] === targets[0]
  ) {
    return `${sources[0]}-Optimierung`;
  }

  const srcStr = sources.slice(0, 3).join('/');
  const tgtStr = targets.slice(0, 3).join('/');

  if (tgtStr && srcStr !== tgtStr) {
    return `${srcStr} → ${tgtStr}`;
  }

  return tool.supportedFormats || srcStr || 'Universal';
}

/**
 * High-performance, German-aware search algorithm directly against TOOLS_CONFIG
 */
export function searchToolsWithRelevance(
  query: string,
  categoryFilter: string = 'all'
): SearchResultItem[] {
  const activeTools = getActiveTools();
  if (!query.trim()) {
    return activeTools
      .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
      .slice(0, 8)
      .map((tool) => ({
        tool,
        score: 1,
        formatFlow: getFormatFlow(tool),
        matchedField: 'default',
      }));
  }

  const rawQuery = query.toLowerCase().trim();
  const normQuery = normalizeGermanText(query);
  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length > 0);

  // Expand query tokens with synonyms
  const expandedTerms = new Set<string>();
  expandedTerms.add(rawQuery);
  expandedTerms.add(normQuery);

  queryTokens.forEach((token) => {
    expandedTerms.add(token);
    const syns = GERMAN_SYNONYMS[token];
    if (syns) {
      syns.forEach((s) => expandedTerms.add(s));
    }
  });

  const termsArray = Array.from(expandedTerms);

  const scoredResults: SearchResultItem[] = [];

  for (const tool of activeTools) {
    if (categoryFilter !== 'all' && tool.category !== categoryFilter) {
      continue;
    }

    let score = 0;
    let bestMatchedField = '';

    const normName = normalizeGermanText(tool.nameDe);
    const normSlug = tool.slug.toLowerCase();
    const normDesc = normalizeGermanText(tool.shortDescriptionDe);
    const normKeywords = (tool.searchKeywordsDe || []).map(normalizeGermanText);
    const sourceExts = tool.sourceFormats.map((f) => f.toLowerCase().replace(/^\./, ''));
    const targetExts = tool.targetFormats.map((f) => f.toLowerCase().replace(/^\./, ''));

    // 1. Exact match on title (Highest priority)
    if (normName === normQuery) {
      score += 200;
      bestMatchedField = 'name';
    } else if (normName.startsWith(normQuery)) {
      score += 120;
      bestMatchedField = 'name_prefix';
    } else if (normName.includes(normQuery)) {
      score += 70;
      bestMatchedField = 'name';
    }

    // 2. Exact match on slug
    if (normSlug === rawQuery || normSlug === normQuery) {
      score += 150;
      bestMatchedField = 'slug';
    } else if (normSlug.includes(normQuery)) {
      score += 50;
      bestMatchedField = 'slug';
    }

    // 3. Format matching (e.g. searching "Word" matching targetFormat DOCX, or "PDF" matching sourceFormat PDF)
    for (const term of termsArray) {
      const isFormatQuery =
        sourceExts.includes(term) || targetExts.includes(term);

      if (isFormatQuery) {
        // If query is specifically a target format (e.g. "word" or "excel" conversion)
        if (targetExts.includes(term)) {
          score += 45;
          if (!bestMatchedField) bestMatchedField = 'format_target';
        }
        if (sourceExts.includes(term)) {
          score += 35;
          if (!bestMatchedField) bestMatchedField = 'format_source';
        }
      }

      // Keyword match
      if (normKeywords.some((k) => k.includes(term))) {
        score += 30;
        if (!bestMatchedField) bestMatchedField = 'keyword';
      }

      // Title word token match
      if (normName.includes(term)) {
        score += 25;
        if (!bestMatchedField) bestMatchedField = 'title_synonym';
      }

      // Description match
      if (normDesc.includes(term)) {
        score += 10;
        if (!bestMatchedField) bestMatchedField = 'description';
      }
    }

    // Boost popular / featured tools slightly
    if (tool.badge === 'Beliebt') {
      score += 5;
    }

    if (score > 0) {
      scoredResults.push({
        tool,
        score,
        formatFlow: getFormatFlow(tool),
        matchedField: bestMatchedField || 'general',
      });
    }
  }

  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults;
}

// =========================================================================
// DISCOVERY FEEDS: POPULAR, RECENT, RECOMMENDED, RELATED
// =========================================================================

/**
 * Top popular tools
 */
export function getPopularTools(): ToolDefinition[] {
  const popularSlugs = [
    'pdf-zusammenfuegen',
    'pdf-komprimieren',
    'pdf-in-word-umwandeln',
    'word-in-pdf-umwandeln',
    'jpg-in-png-umwandeln',
    'pdf-in-jpg-umwandeln',
    'video-in-mp3-umwandeln',
    'zip-erstellen',
    'ocr-pdf',
    'pdf-schuetzen',
    'wortzaehler',
    'audio-konvertieren',
  ];

  return popularSlugs
    .map((slug) => TOOLS_CONFIG.find((t) => t.slug === slug))
    .filter((t): t is ToolDefinition => !!t);
}

/**
 * Curated recommended tools (high-utility workflows)
 */
export function getRecommendedTools(excludeSlug?: string): ToolDefinition[] {
  const recommendedSlugs = [
    'pdf-bearbeiten',
    'pdf-seiten-loeschen',
    'pdf-vergleichen',
    'bild-komprimieren',
    'video-in-gif-umwandeln',
    'jwt-decoder',
    'json-in-csv-umwandeln',
    'zip-entpacken',
    'pdf-signieren',
  ];

  return recommendedSlugs
    .filter((s) => s !== excludeSlug)
    .map((slug) => TOOLS_CONFIG.find((t) => t.slug === slug))
    .filter((t): t is ToolDefinition => !!t)
    .slice(0, 6);
}

/**
 * Related tools based on tool.relatedTools array
 */
export function getRelatedTools(slug: string): ToolDefinition[] {
  const current = TOOLS_CONFIG.find((t) => t.slug === slug);
  if (!current || !current.relatedTools) return [];

  const related = current.relatedTools
    .map((relSlug) => TOOLS_CONFIG.find((t) => t.slug === relSlug))
    .filter((t): t is ToolDefinition => !!t && t.slug !== slug);

  // If less than 4, fill with same category
  if (related.length < 4) {
    const categoryNeighbors = TOOLS_CONFIG.filter(
      (t) => t.category === current.category && t.slug !== slug && !related.some((r) => r.slug === t.slug)
    ).slice(0, 4 - related.length);
    related.push(...categoryNeighbors);
  }

  return related;
}

// =========================================================================
// RECENT TOOLS TRACKING (localStorage)
// =========================================================================

const RECENT_TOOLS_KEY = 'coolwave_recent_tools';
const MAX_RECENT_COUNT = 6;

/**
 * Records a tool slug in the user's local recently used list
 */
export function recordRecentTool(slug: string): void {
  if (typeof window === 'undefined' || !slug) return;
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    let recents: string[] = raw ? JSON.parse(raw) : [];
    // Remove if already present, then unshift to front
    recents = recents.filter((s) => s !== slug);
    recents.unshift(slug);
    if (recents.length > MAX_RECENT_COUNT) {
      recents = recents.slice(0, MAX_RECENT_COUNT);
    }
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recents));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Retrieves the user's recently visited tools
 */
export function getRecentTools(): ToolDefinition[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!raw) return [];
    const slugs: string[] = JSON.parse(raw);
    return slugs
      .map((slug) => TOOLS_CONFIG.find((t) => t.slug === slug))
      .filter((t): t is ToolDefinition => !!t);
  } catch {
    return [];
  }
}

/**
 * Clears recently used tools history
 */
export function clearRecentTools(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_TOOLS_KEY);
  } catch {}
}
