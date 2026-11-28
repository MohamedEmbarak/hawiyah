#!/usr/bin/env node
// content:api-tables: writes or checks the four API tables of a page from the
// installed packages (scripts/api-tables/write.mjs), in the English and the
// Arabic file. Captions, header rows and the prose after each table stay as
// written; the table bodies, and the generated note after a JavaScript table read
// from the stylesheet alone, are rewritten.
//
//   npm run content:api-tables -- <id> [--write | --check] [--docs <dir>]
//
// Without --write or --check it prints the four tables of the English page and
// changes nothing. --check exits 1 when a file would change. Run it when the pin
// moves, then review the prose after each table.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../api-tables/members.mjs';
import { generatedNote, generatedNoteMarkdown, stylesVersion } from '../api-tables/notes.mjs';
import { H3_FRAMEWORK, existingRows, tableSource } from '../api-tables/write.mjs';
import { componentsDirOf } from './hash.mjs';
import { normalise, parseMarkdown, plainText } from './parse.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');

const H3_IDS = { JavaScript: 'javascript', React: 'react', Vue: 'vue', Angular: 'angular' };
const API_H2 = new Set(['API', 'الواجهة البرمجية']);

function noteMatcher(lang) {
  const sample = generatedNote(lang, '\u0000');
  const [before, after] = sample.split('\u0000').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${before}[0-9A-Za-z.+-]+${after}$`);
}

function alertText(node) {
  const text = plainText(node).replace(/\s+/g, ' ').trim();
  return text.replace(/^\[!NOTE\]\s*/, '');
}

/** The API tables of a Markdown page: [{ h3, table, next }] with mdast nodes. */
export function locateApiTables(text) {
  const { tree } = parseMarkdown(text, 'page.md');
  const children = tree.children;
  const start = children.findIndex((node) => node.type === 'heading' && node.depth === 2 && API_H2.has(plainText(node).trim()));
  if (start < 0) return [];
  const end = children.findIndex((node, index) => index > start && node.type === 'heading' && node.depth === 2);
  const section = children.slice(start + 1, end < 0 ? undefined : end);
  const out = [];
  section.forEach((node, index) => {
    if (node.type !== 'heading' || node.depth !== 3) return;
    const h3 = H3_IDS[plainText(node).trim()];
    if (!h3) return;
    const stop = section.findIndex((item, i) => i > index && item.type === 'heading' && item.depth <= 3);
    const body = section.slice(index + 1, stop < 0 ? undefined : stop);
    const table = body.find((item) => item.type === 'table');
    if (table) out.push({ h3, table, next: body[body.indexOf(table) + 1] ?? null });
  });
  return out;
}

/**
 * Rewrites the API table bodies of a page.
 * @returns {{ text: string, changed: string[], missing: string[] }}
 */
export function rewriteApiTables(text, lang, declared, version) {
  const source = normalise(text);
  const located = locateApiTables(source);
  const missing = Object.keys(H3_FRAMEWORK).filter((h3) => !located.some((item) => item.h3 === h3));
  const edits = [];
  const changed = [];
  const matcher = noteMatcher(lang);
  for (const { h3, table, next } of located) {
    const from = table.position.start.offset;
    const to = table.position.end.offset;
    const old = source.slice(from, to);
    const lines = old.split('\n');
    const members = declared[H3_FRAMEWORK[h3]].members;
    const rebuilt = tableSource(h3, lang, members, existingRows(old)).split('\n');
    const replacement = [lines[0], lines[1], ...rebuilt.slice(2)].join('\n');
    if (replacement !== old) changed.push(h3);
    edits.push({ from, to, text: replacement });
    if (h3 === 'javascript') {
      const needs = declared.vanilla.source === 'stylesheet' && declared.vanilla.generatedNote;
      const hasNote = next && next.type === 'blockquote' && matcher.test(alertText(next));
      const note = generatedNoteMarkdown(lang, version);
      if (needs && hasNote) {
        const current = source.slice(next.position.start.offset, next.position.end.offset);
        if (current !== note) {
          edits.push({ from: next.position.start.offset, to: next.position.end.offset, text: note });
          changed.push('javascript note');
        }
      } else if (needs) {
        edits.push({ from: to, to, text: `\n\n${note}` });
        changed.push('javascript note');
      } else if (hasNote) {
        edits.push({ from: to, to: next.position.end.offset, text: '' });
        changed.push('javascript note');
      }
    }
  }
  let out = source;
  for (const edit of edits.sort((a, b) => b.from - a.from)) out = out.slice(0, edit.from) + edit.text + out.slice(edit.to);
  return { text: out, changed, missing };
}

function parseArgs(argv) {
  const options = { id: null, mode: 'print', docs: join(repoDir, 'docs', 'components') };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--write' || arg === '--check') options.mode = arg.slice(2);
    else if (arg === '--docs') {
      if (argv[i + 1] === undefined) throw new Error('--docs needs a directory');
      options.docs = resolve(argv[i + 1]);
      i += 1;
    } else if (!arg.startsWith('--') && options.id === null) options.id = arg;
    else throw new Error(`content:api-tables: unknown argument ${arg}`);
  }
  if (!options.id || !/^[a-z0-9-]+$/.test(options.id)) throw new Error('usage: npm run content:api-tables -- <id> [--write | --check] [--docs <dir>]');
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  if (!readers.components.has(options.id)) throw new Error(`content:api-tables: "${options.id}" is not a component id in components.json`);
  const declared = declaredMembers(readers, options.id);
  const problems = Object.values(H3_FRAMEWORK)
    .flatMap((framework) => [...declared[framework].problems, ...declared[framework].gaps, ...declared[framework].findings].map((problem) => `${framework}: ${problem}`));
  if (problems.length) throw new Error(`content:api-tables: the tables of ${options.id} cannot be written:\n  ${problems.join('\n  ')}`);
  const version = stylesVersion(nodeModules);
  const dir = componentsDirOf(options.docs);
  const files = [['en', join(dir, `${options.id}.md`)], ['ar', join(dir, `${options.id}.ar.md`)]].filter(([, file]) => existsSync(file));
  if (!files.length) throw new Error(`content:api-tables: ${options.id}.md does not exist in ${dir}; run npm run content:scaffold -- ${options.id} first`);
  let differs = false;
  for (const [lang, file] of files) {
    const text = readFileSync(file, 'utf8');
    const result = rewriteApiTables(text, lang, declared, version);
    if (result.missing.length) throw new Error(`content:api-tables: ${file} has no API table under ${result.missing.join(', ')}`);
    if (options.mode === 'print') {
      if (lang === 'en') process.stdout.write(`${locateApiTables(result.text).map(({ h3, table }) => `### ${h3}\n\n${result.text.slice(table.position.start.offset, table.position.end.offset)}`).join('\n\n')}\n`);
      continue;
    }
    const label = file.slice(repoDir.length + 1);
    if (result.text !== normalise(text)) {
      differs = true;
      if (options.mode === 'write') {
        writeFileSync(file, result.text);
        process.stdout.write(`content:api-tables: ${label}: rewrote ${result.changed.join(', ')}\n`);
      } else process.stdout.write(`content:api-tables: ${label}: ${result.changed.join(', ')} differ from the installed packages\n`);
    } else process.stdout.write(`content:api-tables: ${label}: the four API tables match the installed packages\n`);
  }
  if (options.mode === 'check' && differs) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
