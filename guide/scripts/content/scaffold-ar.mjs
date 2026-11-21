#!/usr/bin/env node
// content:scaffold-ar: the Arabic page built from the English page (5a.4,
// leadAmendments A10). Taken from fixed lists: the h1 (components.json labelAr),
// the h2 headings, the captions and header rows of the four API tables, the
// generated note of a table read from the stylesheet, the compliance sentence.
// Copied: the API table bodies and every code listing. Copied with the reader
// strings replaced from the writer's string map (scripts/content/string-map.mjs,
// once per string, applied to all four frameworks of every group): the live
// blocks. Left in English for the writer to translate in place: every other
// heading, paragraph, list, alert, the captions and cells of other tables. The
// front matter carries the section hashes of the English page.
//
//   npm run content:scaffold-ar -- <id> --strings <map.json> [--docs <dir>] [--force]
//   npm run content:scaffold-ar -- <id> --placeholder --docs <dir> [--strings <map.json>] [--force]
//
// --placeholder writes a stand-in sibling for the prerender-level tests of an
// English page before its translation (5a.6): every text left in English and every
// reader string the map does not translate becomes PLACEHOLDER. It writes only
// into a directory outside the repository, which the build reads with --docs (not
// deployable).
//
// <map.json> is { "<English string>": "<Arabic string>", ... }. The command
// lists the reader strings the map does not translate and the entries it did not
// use. An existing <id>.ar.md is kept unless --force is given; to bring an
// existing Arabic page up to date with its English page use content:sync-ar.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../api-tables/members.mjs';
import { generatedNote, generatedNoteMarkdown, stylesVersion } from '../api-tables/notes.mjs';
import { captionLine } from '../api-tables/write.mjs';
import { API_HEADERS, CAPTION_PREFIX, H2, KEYBOARD_TABLE, KEY_NAMES, keyId } from './config.mjs';
import { componentsDirOf, frontMatterBlock } from './hash.mjs';
import { normalise, parseMarkdown, plainText } from './parse.mjs';
import { complianceSentence, tableProblems } from './scaffold.mjs';
import { applyStringMap, readerNames } from './string-map.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');

const H3_IDS = { JavaScript: 'javascript', React: 'react', Vue: 'vue', Angular: 'angular' };

/** Replaces the body of a fenced block (between its fence lines) in the source. */
export function codeBodyEdit(source, node, body) {
  const from = node.position.start.offset;
  const to = node.position.end.offset;
  const raw = source.slice(from, to);
  const first = raw.indexOf('\n');
  const last = raw.lastIndexOf('\n');
  if (node.position.start.column !== 1 || first < 0 || last <= first) return null;
  return { from: from + first + 1, to: from + last, text: body };
}

/** The top-level structure of a page: sections with their nodes. */
export function outline(source) {
  const { tree } = parseMarkdown(source, 'page.md');
  const nodes = tree.children.filter((node) => node.type !== 'yaml');
  let section = null;
  let h3 = null;
  return nodes.map((node, index) => {
    if (node.type === 'heading' && node.depth === 2) {
      const text = plainText(node).trim();
      section = H2.find((item) => item.en === text || item.ar === text)?.id ?? null;
      h3 = null;
    } else if (node.type === 'heading' && node.depth === 3) h3 = H3_IDS[plainText(node).trim()] ?? null;
    return { node, index, section, h3, next: nodes[index + 1] ?? null };
  });
}

const isKeyboardCaption = (source, item) => item.next?.type === 'table'
  && source.slice(item.node.position.start.offset + CAPTION_PREFIX.en.length).startsWith(KEYBOARD_TABLE.en.marker);

/** Edits that write the four arrow keys of key elements by their Arabic names (the glossary); other keys stay as printed. */
function keyEdits(source) {
  const edits = [];
  const visit = (node) => {
    if (node.type === 'kbd') {
      const id = keyId(node.value, 'en');
      if (id && KEY_NAMES[id].ar !== node.value) edits.push({ from: node.inner.start, to: node.inner.end, text: KEY_NAMES[id].ar });
      return;
    }
    if (node.type === 'code') return;
    for (const child of node.children ?? []) visit(child);
  };
  visit(parseMarkdown(source, 'page.md').tree);
  return edits;
}

const isApiTableCaption = (item) => item.section === 'api' && item.h3 && item.node.type === 'paragraph' && item.next?.type === 'table';
const noteText = (node) => plainText(node).replace(/\s+/g, ' ').trim().replace(/^\[!NOTE\]\s*/, '');

/**
 * Builds the Arabic page from the English page.
 * @returns {{ text: string, missing: string[], left: string[], unused: string[] }} left: strings
 *   that render as reader text under a name the map does not replace ('<name>: <text>')
 */
export function scaffoldArabic(englishText, { entry, declared, map, version, placeholder = false }) {
  const source = normalise(englishText);
  const edits = [];
  const used = new Set();
  const missing = new Set();
  const left = new Set();
  const names = readerNames();
  const englishNote = generatedNote('en', version);
  const compliance = { en: complianceSentence('en'), ar: complianceSentence('ar') };
  for (const item of outline(source)) {
    const { node } = item;
    const from = node.position.start.offset;
    const to = node.position.end.offset;
    if (node.type === 'heading' && node.depth === 1) edits.push({ from, to, text: `# ${entry.labelAr}` });
    else if (node.type === 'heading' && node.depth === 2 && item.section) edits.push({ from, to, text: `## ${H2.find((h2) => h2.id === item.section).ar}` });
    else if (node.type === 'paragraph' && source.slice(from, from + CAPTION_PREFIX.en.length) === CAPTION_PREFIX.en) {
      if (isApiTableCaption(item)) edits.push({ from, to, text: captionLine(item.h3, 'ar', declared, entry) });
      else if (isKeyboardCaption(source, item)) {
        // The keyboard table (5a.8): its fixed Arabic caption and headers.
        edits.push({ from, to, text: `${CAPTION_PREFIX.ar}${KEYBOARD_TABLE.ar.caption(entry)}` });
        const table = item.next.position.start.offset;
        edits.push({ from: table, to: source.indexOf('\n', table), text: `| ${KEYBOARD_TABLE.ar.headers.join(' | ')} |` });
      } else edits.push({ from, to: from + CAPTION_PREFIX.en.length, text: CAPTION_PREFIX.ar });
    } else if (node.type === 'table' && item.section === 'api' && item.h3) {
      const header = API_HEADERS.ar[item.h3];
      const lineEnd = source.indexOf('\n', from);
      edits.push({ from, to: lineEnd, text: `| ${header.join(' | ')} |` });
    } else if (node.type === 'blockquote' && item.section === 'api' && noteText(node) === englishNote) {
      edits.push({ from, to, text: generatedNoteMarkdown('ar', version) });
    } else if (node.type === 'code' && (node.meta ?? '').split(/\s+/).includes('live')) {
      const result = applyStringMap(node.lang, node.value ?? '', map, names);
      result.missing.forEach((text) => missing.add(text));
      result.left.forEach((text) => left.add(text));
      result.used.forEach((key) => used.add(key));
      // A placeholder sibling gives every reader string the map does not translate the placeholder text,
      // and so every other string that renders as reader text.
      const untranslated = [...result.missing, ...result.left.map((item) => item.slice(item.indexOf(': ') + 2))];
      const code = placeholder && untranslated.length
        ? applyStringMap(node.lang, result.code, Object.fromEntries(untranslated.map((text) => [text, PLACEHOLDER])), names, { text: true }).code
        : result.code;
      const edit = codeBodyEdit(source, node, code);
      if (edit) edits.push(edit);
    } else if (node.type === 'paragraph' && item.section === 'platforms-code-reference') {
      const at = source.indexOf(compliance.en, from);
      if (at >= 0 && at < to) edits.push({ from: at, to: at + compliance.en.length, text: compliance.ar });
    }
  }
  edits.push(...keyEdits(source));
  if (placeholder) edits.push(...placeholderEdits(source, edits));
  let body = source;
  for (const edit of edits.sort((a, b) => b.from - a.from)) body = body.slice(0, edit.from) + edit.text + body.slice(edit.to);
  const text = `${frontMatterBlock(source)}\n${body}`;
  return { text, missing: [...missing], left: [...left], unused: Object.keys(map).filter((key) => !used.has(key)) };
}

/** The text of a placeholder sibling (content:scaffold-ar --placeholder): Arabic, and never a translation. */
export const PLACEHOLDER = 'نص مؤقت إلى حين الترجمة.';

/**
 * Edits that replace every text left in English by PLACEHOLDER: the text nodes of
 * headings below h2 (not the API h3), paragraphs (not the API captions and the
 * compliance sentence, which have their fixed Arabic text), lists, alerts and
 * tables outside the API section. Code and inline code stay; the reader strings of
 * the live blocks are replaced where the live block edits are made.
 */
function placeholderEdits(source, made) {
  const edits = [];
  const visit = (node) => {
    if (node.type === 'code' || node.type === 'inlineCode' || node.type === 'yaml') return;
    if (node.type === 'text') {
      let from = node.position.start.offset;
      const to = node.position.end.offset;
      const raw = source.slice(from, to);
      if (raw.startsWith(CAPTION_PREFIX.en)) from += CAPTION_PREFIX.en.length; // the caption of another table: its prefix is translated
      from += /^\s*\[![A-Z]+\][ \t]*\n?/.exec(source.slice(from, to))?.[0].length ?? 0; // the marker of an alert stays
      // The parts of the text outside the edits already made (the compliance sentence inside a paragraph).
      let start = from;
      for (const edit of made.filter((item) => item.from < to && from < item.to).sort((a, b) => a.from - b.from)) {
        if (edit.from > start && /[A-Za-z]/.test(source.slice(start, edit.from))) edits.push({ from: start, to: edit.from, text: ` ${PLACEHOLDER} ` });
        start = Math.max(start, edit.to);
      }
      if (start < to && /[A-Za-z]/.test(source.slice(start, to))) edits.push({ from: start, to, text: start === from ? PLACEHOLDER : ` ${PLACEHOLDER}` });
      return;
    }
    for (const child of node.children ?? []) visit(child);
  };
  for (const item of outline(source)) {
    const { node } = item;
    if (node.type === 'heading' && node.depth <= 2) continue;
    if (item.section === 'api' && (node.type === 'heading' || isApiTableCaption(item) || node.type === 'table')) continue;
    visit(node);
  }
  return edits;
}

export function readStringMap(file) {
  const map = JSON.parse(readFileSync(file, 'utf8'));
  if (!map || typeof map !== 'object' || Array.isArray(map) || Object.entries(map).some(([key, value]) => typeof value !== 'string' || !key.trim() || !value.trim())) {
    throw new Error(`content:scaffold-ar: ${file} must be a JSON object { "<English string>": "<Arabic string>" } with non-empty strings`);
  }
  return map;
}

function parseArgs(argv) {
  const options = { id: null, strings: null, docs: join(repoDir, 'docs', 'components'), force: false, placeholder: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--placeholder') options.placeholder = true;
    else if (arg === '--docs' || arg === '--strings') {
      if (argv[i + 1] === undefined) throw new Error(`${arg} needs a value`);
      options[arg.slice(2)] = resolve(argv[i + 1]);
      i += 1;
    } else if (!arg.startsWith('--') && options.id === null) options.id = arg;
    else throw new Error(`content:scaffold-ar: unknown argument ${arg}`);
  }
  if (!options.id || !/^[a-z0-9-]+$/.test(options.id) || (!options.strings && !options.placeholder)) {
    throw new Error('usage: npm run content:scaffold-ar -- <id> --strings <map.json> [--docs <dir>] [--force]\n       npm run content:scaffold-ar -- <id> --placeholder --docs <dir outside the repository> [--strings <map.json>] [--force]');
  }
  if (options.placeholder && !outsideRepository(options.docs)) {
    throw new Error(`content:scaffold-ar: --placeholder writes a stand-in sibling only into a directory outside the repository (got ${options.docs}); copy the pages there and build it with --docs`);
  }
  return options;
}

/** Whether a directory lies outside the repository (a placeholder sibling never enters it). */
export function outsideRepository(dir) {
  const rel = relative(repoDir, resolve(dir));
  return rel.startsWith('..') || isAbsolute(rel);
}

function main(argv) {
  const options = parseArgs(argv);
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const entry = readers.components.get(options.id);
  if (!entry) throw new Error(`content:scaffold-ar: "${options.id}" is not a component id in components.json`);
  const declared = declaredMembers(readers, options.id);
  const problems = tableProblems(declared);
  if (problems.length) throw new Error(`content:scaffold-ar: the tables of ${options.id} cannot be written:\n  ${problems.join('\n  ')}`);
  const dir = componentsDirOf(options.docs);
  const english = join(dir, `${options.id}.md`);
  const arabic = join(dir, `${options.id}.ar.md`);
  if (!existsSync(english)) throw new Error(`content:scaffold-ar: ${english} does not exist`);
  if (existsSync(arabic) && !options.force) throw new Error(`content:scaffold-ar: ${arabic} exists; it is kept (use content:sync-ar to bring it up to date, or --force)`);
  const map = options.strings ? readStringMap(options.strings) : {};
  const result = scaffoldArabic(readFileSync(english, 'utf8'), { entry, declared, map, version: stylesVersion(nodeModules), placeholder: options.placeholder });
  writeFileSync(arabic, result.text);
  if (options.placeholder) {
    process.stdout.write(`content:scaffold-ar: wrote the placeholder sibling ${arabic} (not a translation; it never enters the repository or a deployable build: build it with --docs)\n`);
    return;
  }
  process.stdout.write(`content:scaffold-ar: wrote ${arabic}; translate the headings, paragraphs, lists, alerts and other tables in place\n`);
  for (const text of result.missing) process.stdout.write(`content:scaffold-ar: the map does not translate the reader string "${text}"\n`);
  for (const item of result.left) process.stdout.write(`content:scaffold-ar: left in English: "${item.slice(item.indexOf(': ') + 2)}" under ${item.slice(0, item.indexOf(': '))}, which renders as reader text; the map replaces only reader names, so translate it in the Arabic blocks\n`);
  for (const text of result.unused) process.stdout.write(`content:scaffold-ar: the map entry "${text}" is not used\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
