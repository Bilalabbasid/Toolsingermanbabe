import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { serializeJsonLd } from '@/lib/json-ld';
import { generateBreadcrumbSchema } from '@/lib/seo';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BlogBreadcrumbsProps {
  /** Items after "Startseite"; the last item is the current page. */
  items: BreadcrumbItem[];
  className?: string;
  /** Emit BreadcrumbList JSON-LD (default true). */
  withSchema?: boolean;
}

export function BlogBreadcrumbs({ items, className = '', withSchema = true }: BlogBreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ name: 'Startseite', url: '/de' }, ...items];

  return (
    <>
      {withSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateBreadcrumbSchema(allItems)) }}
        />
      )}
      <nav aria-label="Brotkrumennavigation" className={`py-3 ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-subtle">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1;
            return (
              <li key={`${item.url}-${idx}`} className="flex min-w-0 items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />}
                {isLast ? (
                  <span className="max-w-[220px] truncate font-medium text-ink-muted sm:max-w-md" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="flex max-w-[180px] items-center gap-1 truncate transition-colors hover:text-sky-700"
                  >
                    {idx === 0 && <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                    <span className={idx === 0 ? 'sr-only sm:not-sr-only' : ''}>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
