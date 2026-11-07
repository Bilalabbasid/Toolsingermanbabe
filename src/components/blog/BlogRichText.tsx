import React from 'react';
import Link from 'next/link';
import { resolveContentHref } from '@/config/blog.config';

/**
 * Renders the small markup subset used in blog section content:
 * paragraphs ("\n\n"), "- " bullet lists, "1. " numbered lists, simple
 * Markdown tables ("| A | B |" rows with a "|---|---|" separator after the
 * header row, as their own paragraph), **bold** and
 * [Anker](tool:slug | blog:slug | /de/pfad) internal links.
 * Everything is rendered as React text nodes – no HTML injection possible.
 */

const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

function renderInline(text: string, locale: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let i = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const key = `${keyPrefix}-${i++}`;

    if (match[1] !== undefined && match[2] !== undefined) {
      const target = match[2];
      const href = resolveContentHref(target, locale);
      const isTool = target.startsWith('tool:');
      if (href.startsWith('/')) {
        nodes.push(
          <Link
            key={key}
            href={href}
            className={
              isTool
                ? 'font-semibold text-sky-700 underline decoration-sky-300 decoration-2 underline-offset-2 hover:text-sky-800 hover:decoration-sky-500'
                : 'font-medium text-sky-700 underline decoration-sky-200 underline-offset-2 hover:text-sky-800 hover:decoration-sky-500'
            }
          >
            {match[1]}
          </Link>
        );
      } else {
        // Unknown target types are rendered as plain text (never as external links).
        nodes.push(match[1]);
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {renderInline(match[3], locale, key)}
        </strong>
      );
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: 'p'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] };

const BULLET = /^\s*[-•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const TABLE_ROW = /^\|.*\|$/;
const TABLE_SEPARATOR = /^\|(\s*:?-{3,}:?\s*\|)+$/;

function splitRow(line: string): string[] {
  return line
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

/**
 * Parses a chunk as a Markdown table when every line is a "| … |" row and the
 * second line is a "|---|" separator. Anything else returns undefined and is
 * rendered as normal paragraphs/lists.
 */
function parseTable(lines: string[]): Block | undefined {
  if (lines.length < 3 || !lines.every((l) => TABLE_ROW.test(l)) || !TABLE_SEPARATOR.test(lines[1])) {
    return undefined;
  }
  const head = splitRow(lines[0]);
  const rows = lines.slice(2).map((l) => {
    const cells = splitRow(l);
    return head.map((_, i) => cells[i] ?? '');
  });
  return { type: 'table', head, rows };
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of content.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const table = parseTable(lines);
    if (table) {
      blocks.push(table);
      continue;
    }
    let current: Block | undefined;
    for (const line of lines) {
      if (BULLET.test(line) || NUMBERED.test(line)) {
        const type: 'ul' | 'ol' = BULLET.test(line) ? 'ul' : 'ol';
        const item = line.replace(type === 'ul' ? BULLET : NUMBERED, '');
        if (current && current.type === type) {
          current.items.push(item);
        } else {
          const list: Block = { type, items: [item] };
          current = list;
          blocks.push(list);
        }
      } else if (current && current.type === 'p') {
        current.lines.push(line);
      } else {
        const paragraph: Block = { type: 'p', lines: [line] };
        current = paragraph;
        blocks.push(paragraph);
      }
    }
  }
  return blocks;
}

interface BlogRichTextProps {
  content: string;
  locale?: string;
  className?: string;
}

export function BlogRichText({ content, locale = 'de', className = '' }: BlogRichTextProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-4 text-sm leading-relaxed text-ink-muted sm:text-base sm:leading-7 ${className}`}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        if (block.type === 'ul') {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5 marker:text-sky-500">
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, locale, `${key}-${ii}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'table') {
          return (
            <div key={key} className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-ink">
                  <tr>
                    {block.head.map((cell, ci) => (
                      <th key={ci} scope="col" className="border-b border-line px-3 py-2 font-bold">
                        {renderInline(cell, locale, `${key}-h${ci}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-line last:border-b-0">
                      {row.map((cell, ci) =>
                        ci === 0 ? (
                          <th key={ci} scope="row" className="px-3 py-2 align-top font-semibold text-ink">
                            {renderInline(cell, locale, `${key}-${ri}-${ci}`)}
                          </th>
                        ) : (
                          <td key={ci} className="px-3 py-2 align-top">
                            {renderInline(cell, locale, `${key}-${ri}-${ci}`)}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={key} className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-sky-600">
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, locale, `${key}-${ii}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={key}>
            {block.lines.map((line, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, locale, `${key}-${li}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Plain-text version (links/bold stripped) for meta snippets and word counts. */
export function toPlainText(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^\s*(?:[-•]|\d+[.)])\s+/gm, '')
    .replace(/^\|(\s*:?-{3,}:?\s*\|)+$/gm, '')
    .replace(/[ \t]*\|[ \t]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
