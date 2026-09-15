import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export interface SystemSettingItem {
  id?: string;
  key: string;
  value: any;
  description?: string | null;
  updatedAt?: Date;
}

const DEFAULT_SETTINGS: Record<string, { value: any; description: string }> = {
  'general.maintenance_mode': {
    value: false,
    description: 'Wartungsmodus: Deaktiviert alle Konvertierungstools für reguläre Benutzer.',
  },
  'monetization.ads_enabled': {
    value: true,
    description: 'Werbeanzeigen: Schaltet Google AdSense für Besucher ohne Pro-Abonnement ein.',
  },
  'monetization.billing_enabled': {
    value: true,
    description: 'Stripe Billing: Erlaubt Buchung von Pro-Abonnements.',
  },
  'limits.free_file_size_mb': {
    value: 50,
    description: 'Standard-Dateigrößenlimit für die kostenlose Version (MB).',
  },
  'limits.pro_file_size_mb': {
    value: 500,
    description: 'Standard-Dateigrößenlimit für Pro-Nutzer (MB).',
  },
  'storage.temp_retention_minutes': {
    value: 15,
    description: 'Aufbewahrungsdauer temporärer Dateien vor automatischer Bereinigung (Minuten).',
  },
};

export async function getAllSettings(): Promise<SystemSettingItem[]> {
  if (!isDatabaseConfigured()) {
    return Object.entries(DEFAULT_SETTINGS).map(([key, item]) => ({
      key,
      value: item.value,
      description: item.description,
    }));
  }

  try {
    const dbSettings = await prisma.adminSettings.findMany();
    const map = new Map(dbSettings.map((s) => [s.key, s]));

    return Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => {
      const existing = map.get(key);
      if (existing) {
        let parsed = fallback.value;
        try {
          parsed = JSON.parse(existing.value);
        } catch {
          parsed = existing.value;
        }
        return {
          id: existing.id,
          key: existing.key,
          value: parsed,
          description: existing.description || fallback.description,
          updatedAt: existing.updatedAt,
        };
      }

      return {
        key,
        value: fallback.value,
        description: fallback.description,
      };
    });
  } catch (err) {
    console.warn('[SettingsService] Failed to load DB settings:', err);
    return Object.entries(DEFAULT_SETTINGS).map(([key, item]) => ({
      key,
      value: item.value,
      description: item.description,
    }));
  }
}

export async function updateSetting(
  key: string,
  value: any,
  actorUserId?: string
): Promise<SystemSettingItem> {
  if (!isDatabaseConfigured()) {
    throw new Error('Datenbank ist nicht konfiguriert.');
  }

  const stringValue = JSON.stringify(value);
  const description = DEFAULT_SETTINGS[key]?.description;

  const result = await prisma.adminSettings.upsert({
    where: { key },
    create: {
      key,
      value: stringValue,
      description,
    },
    update: {
      value: stringValue,
      description: description || undefined,
    },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      actorUserId: actorUserId || null,
      action: 'SETTING_UPDATED',
      targetType: 'AdminSettings',
      targetId: key,
      metadata: JSON.stringify({ key, value, timestamp: new Date().toISOString() }),
    },
  }).catch(() => {});

  let parsed = value;
  try {
    parsed = JSON.parse(result.value);
  } catch {
    parsed = result.value;
  }

  return {
    id: result.id,
    key: result.key,
    value: parsed,
    description: result.description,
    updatedAt: result.updatedAt,
  };
}
