#!/usr/bin/env node
// content:sync-ar: brings an existing Arabic page up to date with its English
// page in place (leadAmendments A10), keeping the translated prose:
//   - every live block is rewritten from the English block of the same group and
//     framework, with the reader strings replaced from the string map that the
//     existing pair gives (scripts/content/string-map.mjs deriveStringMap);
//   - every other code listing is copied from the English page (HWC-PAR2 requires
//     them identical), when both pages have the same number of listings;
//   - the four API tables are rewritten from the installed packages, with their
//     fixed Arabic captions and the generated note (content:api-tables).
// Headings, paragraphs, lists, alerts and the other tables are not touched; the
// front matter is not touched either: the command lists the sections whose
// English text changed since they were translated (HWC-STALE), which the writer
// reviews before running content:hash, and the translations it read only from
// blocks of those sections (an English string changed in place keeps the old
// Arabic string until the writer corrects it).
//
//   npm run content:sync-ar -- <id> [--docs <dir>] [--check]
//
// --check changes nothing and exits 1 when the page would change. The command
// lists the reader strings it could not translate (new English strings), and the
// groups the two pages do not share, which the writer adds by hand.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../api-tables/members.mjs';
import { stylesVersion } from '../api-tables/notes.mjs';
import { captionLine } from '../api-tables/write.mjs';
import { rewriteApiTables } from './api-tables.mjs';
import { componentsDirOf, sectionHashes } from './hash.mjs';
import { normalise, parseMarkdown } from './parse.mjs';
import { codeBodyEdit, outline } from './scaffold-ar.mjs';
import { tableProblems } from './scaffold.mjs';
import { applyStringMap, deriveStringMap, liveBlocks, readerNames } from './string-map.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');

function listings(source) {
  const { tree } = parseMarkdown(source, 'page.md');
  const out = [];
  const visit = (node) => {
    if (node.type === 'code' && !(node.meta ?? '').split(/\s+/).includes('live')) out.push(node);
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
  return out;
}

/**
 * Rewrites the code blocks and API tables of an Arabic page from its English page.
 * @returns {{ text: string, missing: string[], review: string[], unmatched: string[], conflicts: string[], unaligned: string[], stale: string[] }}
 */
export function syncArabic(englishText, arabicText, { entry, declared, version }) {
  const english = normalise(englishText);
  let arabic = normalise(arabicText);
  const current = sectionHashes(english);
  const recorded = /^---\n([\s\S]*?)\n---/.exec(arabic)?.[1] ?? '';
  const stale = Object.entries(current).filter(([id, hash]) => !new RegExp(`^  ${id}: ${hash}$`, 'm').test(recorded)).map(([id]) => id);
  const derived = deriveStringMap(english, arabic);
  // A translation read only from blocks of sections whose English changed since they were
  // translated may belong to an earlier English string: the writer reviews it.
  const review = Object.entries(derived.origins).filter(([, sections]) => sections.every((id) => stale.includes(id))).map(([key]) => `"${key}" as "${derived.map[key]}"`);
  const names = readerNames();
  const missing = new Set();
  const unmatched = [];
  const edits = [];
  const englishBlocks = liveBlocks(english);
  for (const block of liveBlocks(arabic)) {
    const source = englishBlocks.find((item) => item.example === block.example && item.framework === block.framework);
    if (!source) {
      unmatched.push(`the Arabic page has the live block ${block.example} (${block.framework}), which the English page does not have`);
      continue;
    }
    const result = applyStringMap(source.lang, source.code, derived.map, names);
    result.missing.forEach((text) => missing.add(text));
    const edit = codeBodyEdit(arabic, block.node, result.code);
    if (edit) edits.push(edit);
  }
  for (const block of englishBlocks) {
    if (!liveBlocks(arabic).some((item) => item.example === block.example && item.framework === block.framework)) {
      unmatched.push(`the English page has the live block ${block.example} (${block.framework}), which the Arabic page does not have`);
    }
  }
  const enListings = listings(english);
  const arListings = listings(arabic);
  if (enListings.length === arListings.length) {
    arListings.forEach((node, index) => {
      const edit = codeBodyEdit(arabic, node, enListings[index].value ?? '');
      if (edit) edits.push(edit);
    });
  } else unmatched.push(`the English page has ${enListings.length} code listings and the Arabic page ${arListings.length}; copy them by hand`);
  for (const edit of edits.sort((a, b) => b.from - a.from)) arabic = arabic.slice(0, edit.from) + edit.text + arabic.slice(edit.to);

  // API tables, then their fixed captions.
  arabic = rewriteApiTables(arabic, 'ar', declared, version).text;
  const captions = [];
  for (const item of outline(arabic)) {
    if (item.section === 'api' && item.h3 && item.node.type === 'paragraph' && item.next?.type === 'table') {
      captions.push({ from: item.node.position.start.offset, to: item.node.position.end.offset, text: captionLine(item.h3, 'ar', declared, entry) });
    }
  }
  for (const edit of captions.sort((a, b) => b.from - a.from)) arabic = arabic.slice(0, edit.from) + edit.text + arabic.slice(edit.to);

  return { text: arabic, missing: [...missing], review, unmatched, conflicts: derived.conflicts, unaligned: derived.unaligned, stale };
}

function parseArgs(argv) {
  const options = { id: null, docs: join(repoDir, 'docs', 'components'), check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--check') options.check = true;
    else if (arg === '--docs') {
      if (argv[i + 1] === undefined) throw new Error('--docs needs a directory');
      options.docs = resolve(argv[i + 1]);
      i += 1;
    } else if (!arg.startsWith('--') && options.id === null) options.id = arg;
    else throw new Error(`content:sync-ar: unknown argument ${arg}`);
  }
  if (!options.id || !/^[a-z0-9-]+$/.test(options.id)) throw new Error('usage: npm run content:sync-ar -- <id> [--docs <dir>] [--check]');
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const entry = readers.components.get(options.id);
  if (!entry) throw new Error(`content:sync-ar: "${options.id}" is not a component id in components.json`);
  const declared = declaredMembers(readers, options.id);
  const problems = tableProblems(declared);
  if (problems.length) throw new Error(`content:sync-ar: the tables of ${options.id} cannot be written:\n  ${problems.join('\n  ')}`);
  const dir = componentsDirOf(options.docs);
  const englishFile = join(dir, `${options.id}.md`);
  const arabicFile = join(dir, `${options.id}.ar.md`);
  for (const file of [englishFile, arabicFile]) if (!existsSync(file)) throw new Error(`content:sync-ar: ${file} does not exist`);
  const before = readFileSync(arabicFile, 'utf8');
  const result = syncArabic(readFileSync(englishFile, 'utf8'), before, { entry, declared, version: stylesVersion(nodeModules) });
  const changed = result.text !== normalise(before);
  const say = (line) => process.stdout.write(`content:sync-ar: ${line}\n`);
  for (const line of [...result.unaligned, ...result.conflicts.map((item) => `the string ${item}`), ...result.unmatched]) say(line);
  for (const text of result.missing) say(`no translation for the reader string "${text}"; translate it in the Arabic block`);
  for (const text of result.review) say(`the translation ${text} was read only from blocks whose English section changed; check it`);
  if (options.check) {
    say(changed ? `${options.id}.ar.md differs from what its English page gives` : `${options.id}.ar.md is in step with its English page`);
    if (changed) process.exit(1);
    return;
  }
  if (changed) writeFileSync(arabicFile, result.text);
  say(changed ? `rewrote the code blocks and API tables of ${options.id}.ar.md` : `${options.id}.ar.md is in step with its English page`);
  if (result.stale.length) say(`sections translated from an earlier English text: ${result.stale.join(', ')}; review them, then npm run content:hash -- ${options.id}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
