import { getActiveTools } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import type { ToolDefinition } from '@/types/tool';

import { CATEGORY_LABELS, CATEGORY_ORDER, type NavCategory, type NavTool } from './navMeta';

export type { NavCategory, NavTool } from './navMeta';
export { CATEGORY_ACCENTS, CATEGORY_LABELS, CATEGORY_ORDER } from './navMeta';

/**
 * Hand-curated "most wanted" order. Tools listed here bubble to the top of
 * their category; slugs that are not active are simply skipped.
 */
export const POPULAR_PRIORITY: string[] = [
  'pdf-zusammenfuegen',
  'pdf-komprimieren',
  'pdf-teilen',
  'pdf-bearbeiten',
  'pdf-unterschreiben',
  'pdf-in-word-umwandeln',
  'word-in-pdf-umwandeln',
  'pdf-in-jpg-umwandeln',
  'jpg-in-pdf-umwandeln',
  'pdf-drehen',
  'pdf-seiten-loeschen',
  'pdf-schuetzen',
  'bild-komprimieren',
  'jpg-in-png-umwandeln',
  'png-in-jpg-umwandeln',
  'heic-in-jpg-umwandeln',
  'bildgroesse-aendern',
  'jpg-in-webp-umwandeln',
  'webp-in-jpg-umwandeln',
  'bild-zuschneiden',
  'excel-in-pdf-umwandeln',
  'pdf-in-excel-umwandeln',
  'powerpoint-in-pdf-umwandeln',
  'csv-in-xlsx-umwandeln',
  'xlsx-in-csv-umwandeln',
  'doc-in-docx-umwandeln',
  'ocr-pdf',
  'bild-zu-text',
  'pdf-durchsuchbar-machen',
  'scan-zu-pdf',
  'pdf-passwort-entfernen',
  'pdf-schwaerzen',
  'pdf-berechtigungen-aendern',
  'pdf-metadaten-entfernen',
  'zip-erstellen',
  'zip-entpacken',
  'video-in-mp3-umwandeln',
  'audio-konvertieren',
  'wortzaehler',
  'json-formatter',
  'qr-code-erstellen',
  'passwort-generator',
];

function priorityOf(tool: ToolDefinition): number {
  const idx = POPULAR_PRIORITY.indexOf(tool.slug);
  if (idx !== -1) return idx;
  return tool.badge === 'Beliebt' ? 500 : 1000;
}

/** Active tools of a category, most popular first (stable for the rest). */
export function sortByPopularity(tools: ToolDefinition[]): ToolDefinition[] {
  return tools
    .map((tool, index) => ({ tool, index }))
    .sort((a, b) => priorityOf(a.tool) - priorityOf(b.tool) || a.index - b.index)
    .map(({ tool }) => tool);
}

export function toNavTool(tool: ToolDefinition): NavTool {
  return { slug: tool.slug, name: tool.nameDe, icon: tool.icon, category: tool.category };
}

/** Most popular active tools across all categories. */
export function getPopularActiveTools(limit = 12, tools: ToolDefinition[] = getActiveTools()): ToolDefinition[] {
  return sortByPopularity(tools).slice(0, limit);
}

/** Categories with counts and their top tools – the backbone of all navigation. */
export function getNavCategories(toolsPerCategory = 6, tools: ToolDefinition[] = getActiveTools()): NavCategory[] {
  return CATEGORY_ORDER.map((slug) => {
    const inCategory = tools.filter((t) => t.category === slug);
    const info = CATEGORIES[slug];
    return {
      slug,
      label: CATEGORY_LABELS[slug],
      name: info.name,
      description: info.shortDesc,
      count: inCategory.length,
      tools: sortByPopularity(inCategory).slice(0, toolsPerCategory).map(toNavTool),
    };
  }).filter((c) => c.count > 0);
}
