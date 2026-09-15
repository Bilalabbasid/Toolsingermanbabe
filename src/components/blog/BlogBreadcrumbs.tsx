import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { serializeJsonLd } from '@/lib/json-ld';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BlogBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BlogBreadcrumbs({ items, className = '' }: BlogBreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [
    { name: 'Startseite', url: '/de' },
    ...items,
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://coolwave.cool${item.url}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 overflow-x-auto no-scrollbar py-2 ${className}`}>
        <ol className="flex items-center gap-1.5 whitespace-nowrap">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1;

            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-sky-600 transition-colors flex items-center gap-1"
                  >
                    {idx === 0 && <Home className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.name}</span>
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
