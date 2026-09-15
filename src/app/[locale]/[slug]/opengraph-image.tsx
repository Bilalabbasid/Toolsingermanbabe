import { ImageResponse } from 'next/og';
import { getToolBySlug } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import { ToolCategory } from '@/types/tool';

export const runtime = 'nodejs';
export const alt = 'CoolWave Online Tool';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  pdf: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)', glow: 'rgba(244, 63, 94, 0.2)' },
  images: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.2)' },
  documents: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.2)' },
  utilities: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)', glow: 'rgba(20, 184, 166, 0.2)' },
  security: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.2)' },
  ocr: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.2)' },
  audio: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)', glow: 'rgba(236, 72, 153, 0.2)' },
  archive: { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)', glow: 'rgba(14, 165, 233, 0.2)' },
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  const title = tool?.nameDe || 'Kostenlose Online-Datei-Tools';
  const description =
    tool?.shortDescriptionDe ||
    tool?.metaDescriptionDe ||
    'PDFs, Bilder und Dokumente direkt im Browser bearbeiten & konvertieren. 100% datenschutzkonform ohne Server-Upload.';
  
  const categoryKey = tool?.category as ToolCategory;
  const categoryName = (categoryKey && CATEGORIES[categoryKey]?.name) || 'Datei-Tool';
  const colors = (categoryKey && CATEGORY_COLORS[categoryKey]) || {
    bg: 'rgba(14, 165, 233, 0.15)',
    text: '#38bdf8',
    border: 'rgba(14, 165, 233, 0.3)',
    glow: 'rgba(14, 165, 233, 0.2)',
  };

  const hasFlow =
    tool &&
    tool.sourceFormats &&
    tool.sourceFormats.length > 0 &&
    tool.targetFormats &&
    tool.targetFormats.length > 0;

  const srcFmt = hasFlow ? tool.sourceFormats[0] : null;
  const dstFmt = hasFlow ? tool.targetFormats[0] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, ' +
            colors.glow +
            ' 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(14, 165, 233, 0.12) 0%, transparent 40%)',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#ffffff',
                  display: 'flex',
                }}
              >
                C
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                CoolWave
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Browser Tools
              </span>
            </div>
          </div>

          {/* Category Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {categoryName}
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '960px',
          }}
        >
          {/* Conversion Flow Badge if applicable */}
          {hasFlow && srcFmt && dstFmt && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
              >
                {srcFmt}
              </span>
              <span style={{ fontSize: '18px', color: '#64748b', display: 'flex' }}>➔</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '8px',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                {dstFmt}
              </span>
            </div>
          )}

          {/* Main Title */}
          <div
            style={{
              fontSize: title.length > 30 ? '48px' : '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '20px',
              lineHeight: 1.45,
              color: '#94a3b8',
              maxHeight: '62px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom Bar: Trust Badges + Domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span> 100% Kostenlos
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span> Kein Server-Upload
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span> Sicher im Browser
            </div>
          </div>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.02em',
            }}
          >
            coolwave.cool
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
