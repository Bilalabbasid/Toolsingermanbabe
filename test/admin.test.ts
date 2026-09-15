import { describe, it, expect } from 'vitest';
import { listToolConfigurations } from '@/server/admin/toolConfig.service';
import { getAllSettings } from '@/server/admin/settings.service';

describe('Admin Service & Tool Configurations', () => {
  it('should list all tool configurations by merging static registry and fallbacks', async () => {
    const tools = await listToolConfigurations();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(50); // CoolWave has 170+ tools

    const pdfTool = tools.find((t) => t.slug === 'pdf-zusammenfuegen' || t.slug === 'pdf-teilen');
    expect(pdfTool).toBeDefined();
    expect(pdfTool?.isEnabled).toBe(true);
    expect(typeof pdfTool?.maxFileSizeMB).toBe('number');
  });

  it('should load default admin settings safely', async () => {
    const settings = await getAllSettings();
    expect(Array.isArray(settings)).toBe(true);
    expect(settings.length).toBeGreaterThanOrEqual(4);

    const maintenance = settings.find((s) => s.key === 'general.maintenance_mode');
    expect(maintenance).toBeDefined();
    expect(maintenance?.value).toBe(false);

    const ads = settings.find((s) => s.key === 'monetization.ads_enabled');
    expect(ads).toBeDefined();
    expect(ads?.value).toBe(true);
  });
});
