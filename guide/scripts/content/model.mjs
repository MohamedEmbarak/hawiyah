// mdast outline to the content model (contentPipeline.model). The types are
// declared in src/app/content/model.ts; keep both in step.

import GithubSlugger from 'github-slugger';
import { DIRECTION, GITHUB_BLOB, H2, LANGUAGE_NAMES, finding } from './config.mjs';
import { resolveLink } from './links.mjs';
import { isLive } from './live.mjs';
import { plainText } from './parse.mjs';
import { highlight } from './highlight.mjs';
import { alertKind, captionPrefix } from './structure.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const ALIGN = { left: 'start', center: 'center', right: 'end' };

/**
 * Ids of every heading of a page, in document order (h1 to h4).
 * English: GitHub's slugs (github-slugger over all headings in order), the
 * fixed ids for h2. Arabic: the id of the English heading at the same position.
 * @param {any} outline
 * @param {string[] | null} englishIds
 * @param {number[] | null} englishLevels
 */
export function headingIds(outline, englishIds = null, englishLevels = null) {
  const slugger = new GithubSlugger();
  return outline.headings.map((heading, index) => {
    const own = heading.level === 2 ? (H2.find((entry) => entry[outline.lang] === heading.text)?.id ?? null) : null;
    const slug = slugger.slug(heading.level === 2 && own ? (H2.find((entry) => entry.id === own).en) : heading.text);
    if (englishIds && englishLevels?.[index] === heading.level && englishIds[index]) return englishIds[index];
    return own ?? slug;
  });
}

/** Title of a code listing: title="..." in the info string, else the language name, else null. */
export function codeTitle(node) {
  const match = /(?:^|\s)title="([^"]*)"/.exec(node.meta ?? '');
  if (match) return match[1];
  return LANGUAGE_NAMES[(node.lang ?? '').toLowerCase()] ?? null;
}

export function codeBlock(node) {
  const lang = node.lang ?? null;
  return { type: 'code', lang, title: codeTitle(node), text: node.value, lines: highlight(lang, node.value) };
}

/**
 * Builds the page model.
 * @param {any} outline Result of analysePage().
 * @param {{ id: string, fileName: string, filePath: string, repoDir: string, componentsDir: string,
 *           sourcePath: string, built: Set<string>, englishIds?: string[], englishLevels?: number[] }} ctx
 * @returns {{ page: any, findings: any[], ids: string[] }}
 */
export function buildModel(outline, ctx) {
  const findings = [];
  const crossLinks = [];
  const ids = headingIds(outline, ctx.englishIds ?? null, ctx.englishLevels ?? null);
  const idOf = new Map(outline.headings.map((heading, index) => [heading.node, ids[index]]));
  const headingIdSet = new Set(ids);
  const linkCtx = {
    lang: outline.lang, id: ctx.id, filePath: ctx.filePath, repoDir: ctx.repoDir,
    componentsDir: ctx.componentsDir, built: ctx.built, headingIds: headingIdSet,
  };

  const inlines = (nodes) => {
    const out = [];
    for (const node of nodes ?? []) {
      switch (node.type) {
        case 'text': out.push({ type: 'text', value: node.value }); break;
        case 'emphasis': out.push({ type: 'emphasis', children: inlines(node.children) }); break;
        case 'strong': out.push({ type: 'strong', children: inlines(node.children) }); break;
        case 'inlineCode': out.push({ type: 'inlineCode', value: node.value }); break;
        case 'break': out.push({ type: 'break' }); break;
        case 'link': {
          const resolved = resolveLink(node.url, linkCtx);
          const children = inlines(node.children);
          if ('error' in resolved) {
            findings.push(finding('HWC-LINK', outline.file, lineOf(node), resolved.error));
            out.push(...children);
          } else {
            if (resolved.crossPage) crossLinks.push({ file: outline.file, line: lineOf(node), url: node.url, ...resolved.crossPage });
            out.push({ type: 'link', href: resolved.href, internal: resolved.internal, external: resolved.external, children });
          }
          break;
        }
        default: break;
      }
    }
    return out;
  };

  const blocks = (nodes) => {
    const out = [];
    nodes.forEach((node, index) => {
      switch (node.type) {
        case 'heading':
          if (node.depth === 3 || node.depth === 4) out.push({ type: 'heading', level: node.depth, id: idOf.get(node), children: inlines(node.children) });
          break;
        case 'paragraph':
          if (captionPrefix(node) && nodes[index + 1]?.type === 'table') break;
          out.push({ type: 'paragraph', children: inlines(node.children) });
          break;
        case 'list':
          out.push({
            type: 'list',
            ordered: Boolean(node.ordered),
            start: node.ordered ? (node.start ?? 1) : null,
            items: node.children.map((item) => blocks(item.children)),
          });
          break;
        case 'blockquote': {
          const kind = alertKind(node);
          if (!kind) {
            out.push({ type: 'blockquote', blocks: blocks(node.children) });
            break;
          }
          const [first, ...rest] = node.children;
          const [text, ...others] = first.children;
          const remaining = text.value.replace(/^\[![A-Za-z]+\][ \t]*\n?/, '');
          const firstChildren = remaining ? [{ ...text, value: remaining }, ...others] : others;
          const body = firstChildren.length ? [{ ...first, children: firstChildren }, ...rest] : rest;
          out.push({ type: 'alert', kind, blocks: blocks(body) });
          break;
        }
        case 'table': {
          const prefix = captionPrefix(nodes[index - 1]);
          const caption = prefix ? plainText(nodes[index - 1]).slice(prefix.prefix.length).trim() : '';
          const [head, ...rows] = node.children;
          const columns = head.children.map((cell, column) => ({
            key: `c${column}`,
            label: inlines(cell.children),
            align: ALIGN[node.align?.[column] ?? ''] ?? null,
          }));
          out.push({
            type: 'table',
            caption,
            columns,
            rows: rows.map((row) => Object.fromEntries(columns.map((column, column_) => [column.key, inlines(row.children[column_]?.children ?? [])]))),
          });
          break;
        }
        case 'code':
          if (isLive(node)) {
            const group = outline.groupOf.get(node);
            if (group && group.first === node && group.section) out.push({ type: 'live', example: group.example });
          } else out.push(codeBlock(node));
          break;
        case 'thematicBreak':
          out.push({ type: 'thematicBreak' });
          break;
        default:
          break;
      }
    });
    return out;
  };

  const summary = outline.summaryNodes[0]?.type === 'paragraph' ? inlines(outline.summaryNodes[0].children) : [];
  const sections = outline.sections.filter((section) => section.id).map((section) => ({
    id: section.id,
    level: 2,
    title: inlines(section.node.children),
    blocks: blocks(section.children),
  }));
  const page = {
    id: ctx.id,
    lang: outline.lang,
    dir: DIRECTION[outline.lang],
    title: outline.h1 ? plainText(outline.h1).trim() : '',
    summary,
    headings: outline.headings
      .map((heading, index) => ({ id: ids[index], level: heading.level, text: heading.text }))
      .filter((heading) => heading.level >= 2 && heading.level <= 4),
    sections,
    liveGroups: outline.groups.map((group) => group.example),
    sourcePath: ctx.sourcePath,
    githubUrl: `${GITHUB_BLOB}${ctx.sourcePath}`,
  };
  return { page, findings, ids, crossLinks };
}

/** Plain text of a list of model inlines (for the manifest). */
export function inlineText(nodes) {
  return nodes.map((node) => {
    if (node.type === 'text' || node.type === 'inlineCode') return node.value;
    if (node.type === 'break') return ' ';
    return inlineText(node.children ?? []);
  }).join('').replace(/\s+/g, ' ').trim();
}
