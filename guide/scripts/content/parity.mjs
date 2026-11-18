// Parity of the Arabic page with the English page (contentPipeline.parity):
// HWC-PAR1 to HWC-PAR6 and the section hash check HWC-STALE. Findings are
// reported against the Arabic file.

import { FRAMEWORKS, finding } from './config.mjs';
import { sectionHashes, splitSections } from './hash.mjs';
import { tokens } from './highlight.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const ARABIC = /[؀-ۿ]/;
const BCP47 = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
// Hawiyah class names ('hw-button') match the BCP 47 pattern; 'hw' is no
// language subtag, so they are never read as language tags.
const isLanguageTag = (value) => BCP47.test(value) && !value.startsWith('hw-');
const unquote = (text) => text.replace(/^(['"`])(.*)\1$/s, '$2');

/** Whether an English and an Arabic live token may differ (contentPipeline.liveBlocks.forms.text). */
export function tokensMatch(en, ar) {
  if (en.text === ar.text && en.kind === ar.kind) return true;
  const textual = (token) => token.kind === 'string' || token.kind === 'text';
  if (textual(en) && textual(ar) && en.kind === ar.kind && ARABIC.test(ar.text)) return true;
  const a = unquote(en.text);
  const b = unquote(ar.text);
  if (en.kind === ar.kind && isLanguageTag(a) && isLanguageTag(b)) return true;
  if (en.kind === ar.kind && new Set([a, b]).size === 2 && [a, b].every((value) => value === 'rtl' || value === 'ltr')) return true;
  return false;
}

/** First differing token of two live blocks, or null. */
export function liveTokenDifference(lang, englishCode, arabicCode) {
  const en = tokens(lang, englishCode);
  const ar = tokens(lang, arabicCode);
  const length = Math.max(en.length, ar.length);
  for (let i = 0; i < length; i += 1) {
    if (!en[i] || !ar[i] || !tokensMatch(en[i], ar[i])) return { index: i, en: en[i] ?? null, ar: ar[i] ?? null };
  }
  return null;
}

const tableShape = (table) => ({
  section: table.section,
  columns: table.node.children[0]?.children.length ?? 0,
  rows: Math.max(0, table.node.children.length - 1),
});

function rowSource(text, row) {
  return text.slice(row.position.start.offset, row.position.end.offset).replace(/[ \t]+$/gm, '');
}

/**
 * @param {any} en English outline
 * @param {any} ar Arabic outline
 * @param {{ enText: string, arText: string, id: string }} sources
 */
export function checkParity(en, ar, { enText, arText, id }) {
  const findings = [];
  const push = (code, line, message) => findings.push(finding(code, ar.file, line, message));

  // HWC-PAR1 heading tree.
  const describe = (heading) => (heading.level === 2 ? `h2 "${heading.section ?? heading.text}"` : `h${heading.level}`);
  const enHeadings = en.headings.map((heading) => ({ ...heading, section: heading.level === 2 ? en.sections.find((s) => s.node === heading.node)?.id : null }));
  const arHeadings = ar.headings.map((heading) => ({ ...heading, section: heading.level === 2 ? ar.sections.find((s) => s.node === heading.node)?.id : null }));
  for (let i = 0; i < Math.max(enHeadings.length, arHeadings.length); i += 1) {
    const e = enHeadings[i];
    const a = arHeadings[i];
    if (!e || !a || e.level !== a.level || (e.level === 2 && e.section !== a.section)) {
      push('HWC-PAR1', lineOf(a?.node ?? ar.h1), `heading ${i + 1} is ${a ? describe(a) : 'missing'} in Arabic and ${e ? describe(e) : 'missing'} in English; both pages have the same heading tree`);
      break;
    }
  }

  // HWC-PAR2 code blocks other than live blocks.
  for (let i = 0; i < Math.max(en.codeBlocks.length, ar.codeBlocks.length); i += 1) {
    const e = en.codeBlocks[i];
    const a = ar.codeBlocks[i];
    if (!e || !a || e.lang !== a.lang || e.value !== a.value) {
      push('HWC-PAR2', lineOf(a ?? ar.h1), `code block ${i + 1} differs from the English page; code blocks other than live blocks are identical in both languages, in the same order and language`);
      break;
    }
  }

  // HWC-PAR3 live groups; HWC-PAR4 live tokens.
  const signature = (group) => `${group.example} (${group.section}${group.h3 ? ', h3' : ''})`;
  const enGroups = en.groups.map(signature);
  const arGroups = ar.groups.map(signature);
  if (enGroups.join('|') !== arGroups.join('|')) {
    push('HWC-PAR3', lineOf(ar.groups[0]?.first ?? ar.h1), `the live groups are ${arGroups.join(', ') || 'none'} in Arabic and ${enGroups.join(', ') || 'none'} in English; both pages have the same groups, names and frameworks in the same order`);
  } else {
    en.groups.forEach((group, index) => {
      const other = ar.groups[index];
      for (const framework of FRAMEWORKS) {
        const e = group.blocks[framework];
        const a = other.blocks[framework];
        const difference = liveTokenDifference(e.lang, e.code, a.code);
        if (difference) {
          const show = (token) => (token ? `"${token.text}"` : 'nothing');
          push('HWC-PAR4', a.line, `live block "${group.example}" (${framework}) differs from the English block at token ${difference.index + 1}: ${show(difference.ar)} in Arabic, ${show(difference.en)} in English; only strings and text in Arabic, language tags and rtl/ltr may differ`);
        }
      }
    });
  }

  // HWC-PAR5 tables.
  if (en.tables.length !== ar.tables.length) {
    push('HWC-PAR5', lineOf(ar.tables[0]?.node ?? ar.h1), `the page has ${ar.tables.length} tables in Arabic and ${en.tables.length} in English`);
  } else {
    en.tables.forEach((table, index) => {
      const other = ar.tables[index];
      const a = tableShape(table);
      const b = tableShape(other);
      if (a.section !== b.section || a.columns !== b.columns || a.rows !== b.rows) {
        push('HWC-PAR5', lineOf(other.node), `table ${index + 1} has ${b.columns} columns and ${b.rows} rows in section ${b.section} in Arabic; English has ${a.columns} columns and ${a.rows} rows in section ${a.section}`);
        return;
      }
      if (table.api && other.api) {
        table.node.children.slice(1).forEach((row, rowIndex) => {
          const otherRow = other.node.children[rowIndex + 1];
          if (rowSource(enText, row) !== rowSource(arText, otherRow)) {
            push('HWC-PAR5', lineOf(otherRow), `row ${rowIndex + 1} of the ${table.api} API table differs from the English row; API table bodies are byte-identical in both languages`);
          }
        });
      }
    });
  }

  // HWC-PAR6 alerts.
  const enAlerts = en.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  const arAlerts = ar.alerts.map((alert) => `${alert.kind}@${alert.section}`);
  if (enAlerts.join('|') !== arAlerts.join('|')) {
    push('HWC-PAR6', lineOf(ar.alerts[0]?.node ?? ar.h1), `the alerts are ${arAlerts.join(', ') || 'none'} in Arabic and ${enAlerts.join(', ') || 'none'} in English; both pages have the same alert kinds at the same positions`);
  }

  // HWC-STALE section hashes (only when the front matter itself is valid).
  if (ar.source) {
    const current = sectionHashes(enText);
    const arSections = splitSections(arText);
    for (const section of arSections) {
      const now = current[section.id];
      if (now === undefined) continue;
      const old = ar.source[section.id];
      if (old !== now) {
        push('HWC-STALE', section.line, `section "${section.id}" was translated from an earlier English text (${old ?? 'no hash'}, now ${now}); update the translation, then run npm run content:hash -- ${id}`);
      }
    }
    for (const key of Object.keys(ar.source)) {
      if (!arSections.some((section) => section.id === key)) push('HWC-FM2', 1, `source lists the section "${key}", which this page does not have`);
    }
  }
  return findings;
}
