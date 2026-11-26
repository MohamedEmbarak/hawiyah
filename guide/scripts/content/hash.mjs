#!/usr/bin/env node
// Section hashes (contentPipeline.frontMatter.sectionHash) and the CLI behind
// `npm run content:hash -- <id> [--docs <dir>]`, which prints the front matter
// block for docs/components/<id>.ar.md from the English page. It edits nothing.
//
// A section is the Markdown source from an h2 line up to the next h2 or the end
// of the file, line endings normalised to \n and trailing white space of each
// line removed; blank lines at its start and end are not part of it. The text
// between the h1 and the first h2 is the section 'summary'. Lines inside fenced
// code blocks are never read as headings.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { H2 } from './config.mjs';
import { TEMPLATE_H2, kindDirs, parseKey } from './kinds.mjs';
import { normalise } from './parse.mjs';

/** The lines of a file after its front matter block, with their 1-based line numbers. */
function bodyLines(text) {
  const lines = normalise(text).split('\n');
  let start = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) start = end + 1;
  }
  return lines.slice(start).map((content, index) => ({ content: content.replace(/[ \t]+$/, ''), line: start + index + 1 }));
}

function trimBlank(lines) {
  let from = 0;
  let to = lines.length;
  while (from < to && lines[from].content === '') from += 1;
  while (to > from && lines[to - 1].content === '') to -= 1;
  return lines.slice(from, to);
}

/** Section id of an h2 text in either language (the h2 of a component page or a template); unknown headings take the GitHub slug. */
export function sectionId(text) {
  const known = [...H2, ...TEMPLATE_H2].find((entry) => entry.en === text || entry.ar === text);
  return known ? known.id : new GithubSlugger().slug(text);
}

/**
 * Splits a page into its summary and h2 sections.
 * @param {string} text
 * @param {{ kind?: 'component' | 'guide' | 'template', ids?: string[] }} [options] kind 'guide': the id
 *   of an h2 is the slug GitHub generates with every heading of the page counted in order (the
 *   ids of the page model); ids: the section ids by position, summary first (an Arabic guide
 *   takes the ids of its English page).
 * @returns {{ id: string, text: string, line: number }[]}
 */
export function splitSections(text, options = {}) {
  const lines = bodyLines(text);
  const sections = [];
  let current = null;
  let fence = null;
  let seenH1 = false;
  const slugger = options.kind === 'guide' ? new GithubSlugger() : null;
  for (const entry of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(entry.content);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length
        && /^ {0,3}[`~]+\s*$/.test(entry.content)) fence = null;
      if (current) current.lines.push(entry);
      continue;
    }
    if (fenceMatch) fence = fenceMatch[1];
    const h1 = !fenceMatch && /^ {0,3}#(?:\s|$)/.test(entry.content);
    const h2 = !fenceMatch && /^ {0,3}##(?:\s+(.*?))?(?:\s+#+)?\s*$/.exec(entry.content);
    const anyHeading = !fenceMatch && /^ {0,3}#{1,6}(?:\s+(.*?))?(?:\s+#+)?\s*$/.exec(entry.content);
    const slug = slugger && anyHeading ? slugger.slug((anyHeading[1] ?? '').trim()) : null;
    if (h1 && !seenH1) {
      seenH1 = true;
      current = { id: 'summary', lines: [], line: entry.line + 1 };
      sections.push(current);
      continue;
    }
    if (h2) {
      current = { id: slug ?? sectionId((h2[1] ?? '').trim()), lines: [entry], line: entry.line };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(entry);
  }
  return sections.map((section, index) => {
    const kept = trimBlank(section.lines);
    return { id: options.ids?.[index] ?? section.id, text: kept.map((entry) => entry.content).join('\n'), line: kept[0]?.line ?? section.line };
  });
}

/** First 12 hex characters of the sha256 of a section text. */
export function hashText(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 12);
}

/** { [sectionId]: hash } for a page, in document order (options as for splitSections). */
export function sectionHashes(text, options = {}) {
  const out = {};
  for (const section of splitSections(text, options)) {
    if (!(section.id in out)) out[section.id] = hashText(section.text);
  }
  return out;
}

/** The YAML front matter block for the Arabic page of an English source (kind: as for splitSections). */
export function frontMatterBlock(englishText, kind = 'component') {
  const hashes = sectionHashes(englishText, { kind });
  return ['---', 'source:', ...Object.entries(hashes).map(([id, hash]) => `  ${id}: ${hash}`), '---'].join('\n');
}

/** The directory holding <id>.md: <dir>/components when it exists, else <dir>. */
export function componentsDirOf(dir) {
  const nested = resolve(dir, 'components');
  return existsSync(nested) ? nested : resolve(dir);
}

function main(argv) {
  const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  let id = null;
  let docs = resolve(guideDir, '..', 'docs', 'components');
  let docsGiven = false;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--docs') {
      if (argv[i + 1] === undefined) throw new Error('--docs needs a directory');
      docs = resolve(argv[i + 1]);
      docsGiven = true;
      i += 1;
    } else if (argv[i].startsWith('--docs=')) {
      docs = resolve(argv[i].slice(7));
      docsGiven = true;
    }
    else if (!argv[i].startsWith('--') && id === null) id = argv[i];
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  const key = parseKey(id);
  if (!key) throw new Error('usage: npm run content:hash -- <id> | guide:<id> | template:<id> [--docs <dir>]');
  const dir = key.kind === 'component' ? componentsDirOf(docs) : kindDirs({ repoDir: resolve(guideDir, '..'), docsDir: docsGiven ? docs : null })[key.kind];
  const file = resolve(dir, `${key.id}.md`);
  if (!existsSync(file)) throw new Error(`content:hash: ${key.id}.md does not exist in ${dir}`);
  process.stdout.write(`${frontMatterBlock(readFileSync(file, 'utf8'), key.kind)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
