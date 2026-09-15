import { prisma, isDatabaseConfigured } from '@/server/db/prisma';
import { TOOLS_CONFIG } from '@/config/tools.config';
import { ToolDefinition } from '@/types/tool';

export interface OperationalToolConfig {
  toolSlug: string;
  enabled: boolean;
  hidden: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  freeMaxFileSizeMB: number | null;
  proMaxFileSizeMB: number | null;
  freeMaxBatch: number | null;
  proMaxBatch: number | null;
  dailyLimit: number | null;
  customTitleDe: string | null;
  customMetaDescriptionDe: string | null;
  customH1De: string | null;
  updatedAt?: Date;
}

/**
 * Returns merged tool definitions where operational database configurations override static registry values
 */
export async function getMergedToolDefinitions(): Promise<ToolDefinition[]> {
  if (!isDatabaseConfigured()) {
    return TOOLS_CONFIG;
  }

  try {
    const overrides = await prisma.toolConfiguration.findMany();
    const overrideMap = new Map(overrides.map((o) => [o.toolSlug, o]));

    return TOOLS_CONFIG.map((tool) => {
      const dbConfig = overrideMap.get(tool.slug);
      if (!dbConfig) return tool;

      return {
        ...tool,
        status: !dbConfig.enabled
          ? 'maintenance'
          : dbConfig.isComingSoon
          ? 'beta'
          : tool.status,
        badge: dbConfig.isFeatured ? 'Beliebt' : tool.badge,
        freeLimits: {
          maxFileSizeMB: dbConfig.freeMaxFileSizeMB ?? tool.freeLimits.maxFileSizeMB,
          maxBatch: dbConfig.freeMaxBatch ?? tool.freeLimits.maxBatch,
        },
        proLimits: {
          maxFileSizeMB: dbConfig.proMaxFileSizeMB ?? tool.proLimits.maxFileSizeMB,
          maxBatch: dbConfig.proMaxBatch ?? tool.proLimits.maxBatch,
        },
        titleDe: dbConfig.customTitleDe || tool.titleDe,
        metaDescriptionDe: dbConfig.customMetaDescriptionDe || tool.metaDescriptionDe,
        h1De: dbConfig.customH1De || tool.h1De,
      };
    });
  } catch (err) {
    console.warn('[ToolConfigService] Failed to load DB overrides, using static tools:', err);
    return TOOLS_CONFIG;
  }
}

/**
 * Updates or creates operational configuration for a tool in the database
 */
export async function updateToolConfiguration(
  toolSlug: string,
  updates: Partial<OperationalToolConfig>,
  actorUserId?: string
): Promise<OperationalToolConfig | null> {
  if (!isDatabaseConfigured()) {
    throw new Error('Datenbank ist nicht konfiguriert.');
  }

  const existingTool = TOOLS_CONFIG.find((t) => t.slug === toolSlug);
  if (!existingTool) {
    throw new Error(`Tool mit Slug „${toolSlug}“ existiert nicht.`);
  }

  const config = await prisma.toolConfiguration.upsert({
    where: { toolSlug },
    create: {
      toolSlug,
      enabled: updates.enabled ?? true,
      hidden: updates.hidden ?? false,
      isFeatured: updates.isFeatured ?? false,
      isComingSoon: updates.isComingSoon ?? false,
      freeMaxFileSizeMB: updates.freeMaxFileSizeMB ?? null,
      proMaxFileSizeMB: updates.proMaxFileSizeMB ?? null,
      freeMaxBatch: updates.freeMaxBatch ?? null,
      proMaxBatch: updates.proMaxBatch ?? null,
      dailyLimit: updates.dailyLimit ?? null,
      customTitleDe: updates.customTitleDe ?? null,
      customMetaDescriptionDe: updates.customMetaDescriptionDe ?? null,
      customH1De: updates.customH1De ?? null,
    },
    update: {
      ...updates,
    },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      actorUserId: actorUserId || null,
      action: 'TOOL_CONFIG_UPDATED',
      targetType: 'ToolConfiguration',
      targetId: toolSlug,
      metadata: JSON.stringify({ updates, timestamp: new Date().toISOString() }),
    },
  }).catch(() => {});

  return config;
}

/**
 * Lists all tool configurations and statuses
 */
export interface AdminToolListItem extends ToolDefinition {
  isEnabled: boolean;
  isHidden: boolean;
  isProOnly: boolean;
  maxFileSizeMB: number;
  title: string;
  category: any;
  operational?: OperationalToolConfig;
}

export async function listToolConfigurations(): Promise<AdminToolListItem[]> {
  let overrideMap = new Map<string, OperationalToolConfig>();

  if (isDatabaseConfigured()) {
    try {
      const overrides = await prisma.toolConfiguration.findMany();
      overrideMap = new Map(overrides.map((o) => [o.toolSlug, o as OperationalToolConfig]));
    } catch {
      // ignore
    }
  }

  return TOOLS_CONFIG.map((tool) => {
    const op = overrideMap.get(tool.slug);
    return {
      ...tool,
      isEnabled: op?.enabled ?? (tool.status !== 'maintenance'),
      isHidden: op?.hidden ?? false,
      isProOnly: (tool as any).isProOnly || false,
      maxFileSizeMB: op?.freeMaxFileSizeMB ?? tool.freeLimits.maxFileSizeMB,
      title: tool.titleDe,
      category: tool.category,
      operational: op,
    };
  });
}

