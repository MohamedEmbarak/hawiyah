// Headings contract and per-file rules (contentPipeline.frontMatter,
// headingsContract, tables, alerts and the placement of live groups).
// analysePage() checks one file and returns its outline for the model and the
// parity checks.

import { parse as parseYaml } from 'yaml';
import {
  ALERTS, API_COLUMNS, API_H3, API_HEADERS, API_KINDS, CAPTION_PREFIX, EM_DASH, H2, finding,
} from './config.mjs';
import { keyNameFindings, keyboardTable } from './keys.mjs';
import { groupLive, isLive } from './live.mjs';
import { plainText } from './parse.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
/** At most this many live groups per page: step 80 time grows with the groups. */
export const MAX_LIVE_GROUPS = 8;
/** Calls that make an example depend on the date, the time zone, chance or the network. */
const UNREPRODUCIBLE = /\bDate\.now\s*\(|\bnew\s+Date\s*\(\s*\)|\bMath\.random\s*\(|\bcrypto\.(?:getRandomValues|randomUUID)\s*\(|\bfetch\s*\(|\bXMLHttpRequest\b|\.resolvedOptions\s*\(\s*\)\.timeZone\b/;
/** A typed install command: install text has one source, the generated install data. */
const INSTALL_COMMAND = /^\s*(?:\$\s*)?(?:npm\s+(?:install|i|ci|add)|pnpm\s+(?:add|install|i)|yarn\s+add|bun\s+add)\b/m;
const SENTENCE_END = /[.!?؟](\s|$)/g;

/** Kind of a GitHub alert blockquote ('note', 'tip', ...) or null. */
export function alertKind(node) {
  if (node.type !== 'blockquote') return null;
  const paragraph = node.children[0];
  const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : null;
  if (text?.type !== 'text') return null;
  const match = /^\[!([A-Za-z]+)\][ \t]*(?:\n|$)/.exec(text.value);
  if (!match) return null;
  const kind = Object.keys(ALERTS).find((key) => ALERTS[key].marker === match[1].toUpperCase());
  return kind ?? null;
}

/** Whether a paragraph is a table caption in some language, and its prefix. */
export function captionPrefix(node) {
  if (node?.type !== 'paragraph') return null;
  const first = node.children[0];
  if (first?.type !== 'text') return null;
  for (const [lang, prefix] of Object.entries(CAPTION_PREFIX)) if (first.value.startsWith(prefix)) return { lang, prefix };
  return null;
}

function checkFrontMatter(page, push) {
  const { lang, frontMatter } = page;
  if (lang === 'en') {
    if (frontMatter) push('HWC-FM1', frontMatter.line, 'an English page has no front matter; remove the block');
    return null;
  }
  if (!frontMatter) {
    push('HWC-FM2', 1, 'an Arabic page starts with a front matter block with the key source; run npm run content:hash -- <id> to print it');
    return null;
  }
  let data;
  try {
    data = parseYaml(frontMatter.value, { schema: 'failsafe' });
  } catch (error) {
    push('HWC-FM2', frontMatter.line, `the front matter is not valid YAML: ${String(error.message).split('\n')[0]}`);
    return null;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    push('HWC-FM2', frontMatter.line, 'the front matter must be a map with the single key source');
    return null;
  }
  for (const key of Object.keys(data)) {
    if (key !== 'source') push('HWC-FM2', frontMatter.line, `unknown front matter key "${key}"; the only key is source`);
  }
  const source = data.source;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    push('HWC-FM2', frontMatter.line, 'the key source must map each section id to a 12-character hash');
    return null;
  }
  const out = {};
  for (const [id, value] of Object.entries(source)) {
    const text = String(value);
    if (!/^[0-9a-f]{12}$/.test(text)) push('HWC-FM2', frontMatter.line, `source.${id} is "${text}"; expected the first 12 hex characters of a sha256`);
    else out[id] = text;
  }
  return out;
}

function checkApiTable(table, h3, lang, push) {
  const header = table.children[0];
  const expected = API_HEADERS[lang][h3.id];
  const actual = header.children.map((cell) => plainText(cell).trim());
  if (actual.join('|') !== expected.join('|')) {
    push('HWC-API', lineOf(table), `the ${h3.text} table header is "| ${actual.join(' | ')} |"; expected "| ${expected.join(' | ')} |"`);
    return;
  }
  const roles = API_COLUMNS[h3.id];
  for (const row of table.children.slice(1)) {
    roles.forEach((role, index) => {
      const cell = row.children[index];
      const inlines = cell?.children ?? [];
      const code = inlines.length === 1 && inlines[0].type === 'inlineCode' ? inlines[0].value : null;
      const text = plainText(cell).trim();
      const at = lineOf(row);
      if (role === 'name') {
        if (code === null) push('HWC-API', at, `the ${role} cell "${text}" of the ${h3.text} table must be inline code`);
      } else if (role === 'type') {
        // A slot or content row, and a row whose type no published file declares, has no type (step 30 decides which).
        if (code === null && text !== EM_DASH) push('HWC-API', at, `the type cell "${text}" of the ${h3.text} table must be inline code or an em dash`);
      } else if (role === 'default') {
        if (code === null && text !== EM_DASH) push('HWC-API', at, `the default cell "${text}" of the ${h3.text} table must be inline code or an em dash`);
      } else if (role === 'required') {
        if (code !== 'true' && code !== 'false') push('HWC-API', at, `the required cell "${text}" of the ${h3.text} table must be \`true\` or \`false\``);
      } else if (role === 'kind') {
        if (!API_KINDS[h3.id].includes(text)) push('HWC-API', at, `the kind "${text}" of the ${h3.text} table must be one of ${API_KINDS[h3.id].join(', ')}`);
      }
    });
  }
}

function checkApiSection(section, lang, push) {
  const h3s = section.children.filter((node) => node.type === 'heading' && node.depth === 3);
  const texts = h3s.map((node) => plainText(node).trim());
  const expected = API_H3.map((entry) => entry.text);
  if (texts.join('|') !== expected.join('|')) {
    push('HWC-API', lineOf(section.node), `the API section has the h3 headings ${texts.length ? texts.join(', ') : 'none'}; expected exactly ${expected.join(', ')} in this order`);
  }
  for (const node of section.children) {
    if (node.type === 'heading' && node.depth === 4) push('HWC-API', lineOf(node), 'the API section has no h4 headings');
  }
  const apiTables = [];
  h3s.forEach((h3node, index) => {
    const h3 = API_H3.find((entry) => entry.text === texts[index]);
    const start = section.children.indexOf(h3node) + 1;
    const next = section.children.findIndex((node, i) => i >= start && node.type === 'heading' && node.depth <= 3);
    const body = section.children.slice(start, next < 0 ? undefined : next);
    const tables = body.filter((node) => node.type === 'table');
    if (!h3) return;
    if (tables.length !== 1 || body[1] !== tables[0] || !captionPrefix(body[0])) {
      push('HWC-API', lineOf(h3node), `the ${h3.text} heading is followed by its caption paragraph and exactly one API table, then the descriptions`);
    }
    if (tables[0]) {
      checkApiTable(tables[0], h3, lang, push);
      apiTables.push({ node: tables[0], h3: h3.id });
    }
  });
  return apiTables;
}

/**
 * Checks one page and returns its outline.
 * @param {{ tree: any, frontMatter: any, lang: 'ar'|'en', file: string, id: string, entry: { name: string, labelAr: string } }} page
 */
export function analysePage(page) {
  const { tree, lang, file, entry } = page;
  const findings = [];
  const push = (code, line, message) => findings.push(finding(code, file, line, message));
  const source = checkFrontMatter(page, push);
  const body = tree.children.filter((node) => node.type !== 'yaml');

  // h1
  const h1s = body.filter((node) => node.type === 'heading' && node.depth === 1);
  const h1 = body[0]?.type === 'heading' && body[0].depth === 1 ? body[0] : null;
  const expectedLine = page.frontMatter ? (tree.children[0].position.end.line + 1) : 1;
  const expectedTitle = lang === 'en' ? entry.name : entry.labelAr;
  if (!h1) push('HWC-H1', lineOf(body[0]), 'the page starts with its h1 on the first line after the front matter');
  else {
    if (lineOf(h1) !== expectedLine) push('HWC-H1', lineOf(h1), `the h1 must be on line ${expectedLine}, the first line after the front matter`);
    const title = plainText(h1).trim();
    if (title !== expectedTitle) push('HWC-H1', lineOf(h1), `the h1 is "${title}"; components.json gives "${expectedTitle}" (${lang === 'en' ? 'name' : 'labelAr'})`);
  }
  for (const extra of h1s.filter((node) => node !== h1)) push('HWC-H1', lineOf(extra), 'a page has exactly one h1');

  // Headings anywhere other than the top level, h5 and h6.
  const walk = (node, depth) => {
    for (const child of node.children ?? []) {
      if (child.type === 'heading' && depth > 0) push('HWC-MD', lineOf(child), 'headings inside lists or quotations are not allowed');
      if (child.type === 'heading' && child.depth >= 5) push('HWC-H5', lineOf(child), `h${child.depth} is not allowed; use h3 and h4 only`);
      if (isLive(child) && depth > 0) push('HWC-LIVE2', lineOf(child), 'a live block stands at the top level of its section, not inside a list or quotation');
      walk(child, depth + 1);
    }
  };
  walk({ children: body }, 0);

  // Summary and sections.
  const firstH2 = body.findIndex((node) => node.type === 'heading' && node.depth === 2);
  const summaryNodes = body.slice(h1 ? 1 : 0, firstH2 < 0 ? undefined : firstH2).filter((node) => !(node.type === 'heading' && node.depth === 1));
  const summaryLine = lineOf(summaryNodes[0] ?? h1);
  if (summaryNodes.some(isLive)) push('HWC-SUM', summaryLine, 'the summary has no live block');
  if (summaryNodes.length !== 1 || summaryNodes[0].type !== 'paragraph') {
    push('HWC-SUM', summaryLine, `the summary between the h1 and the first h2 is exactly one paragraph (found ${summaryNodes.length ? summaryNodes.map((n) => n.type).join(', ') : 'nothing'})`);
  } else {
    const sentences = (plainText(summaryNodes[0]).match(SENTENCE_END) ?? []).length;
    if (sentences < 1 || sentences > 2) push('HWC-SUM', summaryLine, `the summary has ${sentences} sentences; write one or two`);
  }

  const sections = [];
  let current = null;
  for (const node of firstH2 < 0 ? [] : body.slice(firstH2)) {
    if (node.type === 'heading' && node.depth === 2) {
      const text = plainText(node).trim();
      const known = H2.find((entry) => entry[lang] === text);
      current = { id: known?.id ?? null, text, node, children: [] };
      sections.push(current);
      if (!known) {
        const other = H2.find((entry) => entry[lang === 'en' ? 'ar' : 'en'] === text);
        push('HWC-H2', lineOf(node), other
          ? `the h2 "${text}" is in the other language; write "${other[lang]}"`
          : `the h2 "${text}" is not one of ${H2.map((entry) => `"${entry[lang]}"`).join(', ')}`);
      }
    } else current.children.push(node);
  }
  let lastIndex = -1;
  for (const section of sections) {
    if (!section.id) continue;
    const index = H2.findIndex((entry) => entry.id === section.id);
    if (index === lastIndex) push('HWC-H2', lineOf(section.node), `the h2 "${section.text}" appears more than once`);
    else if (index < lastIndex) push('HWC-H2', lineOf(section.node), `the h2 "${section.text}" is out of order; the order is ${H2.map((entry) => entry[lang]).join(', ')}`);
    lastIndex = Math.max(lastIndex, index);
  }
  for (const entry of H2.filter((item) => item.required)) {
    if (!sections.some((section) => section.id === entry.id)) push('HWC-H2', lineOf(h1), `the required h2 "${entry[lang]}" is missing`);
  }

  // Headings per section: free text only where allowed; h4 only under h3.
  for (const section of sections) {
    let seenH3 = false;
    for (const node of section.children) {
      if (node.type !== 'heading') continue;
      if (node.depth === 3) seenH3 = true;
      if (section.id === 'example' && (node.depth === 3 || node.depth === 4)) {
        push('HWC-H2', lineOf(node), 'the Example section contains paragraphs and one live group only, without headings');
      } else if (node.depth === 4 && !seenH3 && section.id !== 'api') {
        push('HWC-H5', lineOf(node), 'an h4 stands under an h3');
      }
    }
  }
  const sectionOf = new Map();
  for (const section of sections) for (const node of section.children) sectionOf.set(node, section);

  // Tables and captions.
  const tables = [];
  const tableWalk = (node, sectionId) => {
    const children = node.children ?? [];
    children.forEach((child, index) => {
      const sid = sectionId ?? sectionOf.get(child)?.id ?? null;
      const caption = captionPrefix(child);
      if (caption && children[index + 1]?.type !== 'table') push('HWC-TAB1', lineOf(child), `a paragraph that starts with "${caption.prefix.trim()}" is a table caption and stands directly above its table`);
      if (child.type === 'table') {
        const before = captionPrefix(children[index - 1]);
        if (!before) push('HWC-TAB1', lineOf(child), `the table has no caption; write a paragraph that starts with "${CAPTION_PREFIX[lang]}" directly above it`);
        else if (before.lang !== lang) push('HWC-TAB1', lineOf(children[index - 1]), `the caption starts with "${before.prefix.trim()}"; this page uses "${CAPTION_PREFIX[lang].trim()}"`);
        tables.push({ node: child, captionNode: children[index - 1] ?? null, section: sid });
      }
      tableWalk(child, sid);
    });
  };
  tableWalk({ children: body }, null);

  // Key elements and the keyboard table (5a.7, 5a.8).
  findings.push(...keyNameFindings(body, lang, file));
  const keyboard = keyboardTable(tables, lang, entry, file);
  findings.push(...keyboard.findings);

  // API section.
  const apiSection = sections.find((section) => section.id === 'api');
  const apiTables = apiSection ? checkApiSection(apiSection, lang, push) : [];
  for (const table of tables) table.api = apiTables.find((item) => item.node === table.node)?.h3 ?? null;

  // Live groups and their placement.
  const live = groupLive(body, file, { id: page.id, kind: page.kind ?? 'component' });
  findings.push(...live.findings);
  const placement = new Map();
  for (const group of live.groups) {
    const section = sectionOf.get(group.first);
    let h3 = null;
    if (section) {
      const before = section.children.slice(0, section.children.indexOf(group.first));
      h3 = [...before].reverse().find((node) => node.type === 'heading' && node.depth === 3) ?? null;
    }
    const allowed = section?.id === 'example' || (section?.id === 'variants-and-states' && h3);
    if (!allowed) {
      push('HWC-LIVE2', group.line, `the live group "${group.example}" stands in the Example section or under an h3 of Variants and states`);
      continue;
    }
    group.section = section.id;
    group.h3 = h3;
    const key = h3 ?? section.node;
    placement.set(key, [...(placement.get(key) ?? []), group]);
  }
  // Size and reproducibility of the examples (pageContractChanges of milestone 5).
  if (live.groups.length > MAX_LIVE_GROUPS) push('HWC-LIVE2', live.groups[MAX_LIVE_GROUPS].line, `a page has at most ${MAX_LIVE_GROUPS} live groups (found ${live.groups.length}); move an example into the prose or propose another page`);
  for (const group of live.groups) {
    for (const block of Object.values(group.blocks)) {
      const found = UNREPRODUCIBLE.exec(block.code);
      if (found) push('HWC-LIVE2', block.line, `the live block "${group.example}" uses ${found[0].trim()}; an example does not depend on today's date, the time zone, random values or a request, so its screenshots can be compared`);
    }
  }
  const exampleSection = sections.find((section) => section.id === 'example');
  if (exampleSection) {
    const count = (placement.get(exampleSection.node) ?? []).length;
    if (count !== 1) push('HWC-LIVE2', lineOf(exampleSection.node), `the Example section contains exactly one live group (found ${count})`);
    for (const node of exampleSection.children) {
      if (node.type !== 'paragraph' && !isLive(node) && node.type !== 'heading') push('HWC-H2', lineOf(node), `the Example section contains paragraphs and one live group only (found ${node.type})`);
    }
  }
  const variants = sections.find((section) => section.id === 'variants-and-states');
  if (variants) {
    for (const node of variants.children.filter((child) => child.type === 'heading' && child.depth === 3)) {
      const count = (placement.get(node) ?? []).length;
      if (count !== 1) push('HWC-LIVE2', lineOf(node), `the h3 "${plainText(node).trim()}" of Variants and states contains exactly one live group (found ${count})`);
    }
  }

  // Alerts in document order.
  const alerts = [];
  const alertWalk = (node, sectionId) => {
    for (const child of node.children ?? []) {
      const sid = sectionId ?? sectionOf.get(child)?.id ?? (summaryNodes.includes(child) ? 'summary' : null);
      const kind = alertKind(child);
      if (kind) alerts.push({ kind, section: sid, node: child });
      alertWalk(child, sid);
    }
  };
  alertWalk({ children: body }, null);

  // Code blocks that are not live, in order.
  const codeBlocks = [];
  const codeWalk = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'code' && !isLive(child)) {
        codeBlocks.push(child);
        if (INSTALL_COMMAND.test(child.value ?? '')) push('HWC-MD', lineOf(child), 'a component page types no install command; the guide generates install text from the pinned version (install.json)');
      }
      codeWalk(child);
    }
  };
  codeWalk({ children: body });

  const headings = body.filter((node) => node.type === 'heading').map((node) => ({ level: node.depth, text: plainText(node).trim(), node, section: sectionOf.get(node)?.id ?? null }));

  return {
    lang, file, source, h1, summaryNodes, sections, headings, tables, alerts, codeBlocks, keyboard: keyboard.table,
    groups: live.groups.filter((group) => group.section), groupOf: live.groupOf, findings,
  };
}
