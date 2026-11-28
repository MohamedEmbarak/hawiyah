#!/usr/bin/env node
// Coverage report of a component page: the
// enumerated values and the boolean members of the page's API that no live
// group of the page shows and that the section Variants and states does not
// list. It is a report, never a failure: check:page prints it as a section, and
//
//   npm run content:coverage -- [<id> ...] [--docs <dir>]
//
// prints it for the given pages (default: every page of docs/components/).
//
// A value is shown when a live block of the same framework holds it as a quoted
// string ("secondary", 'scroll'); a boolean member is shown when a live block of
// the same framework names it (disabled, :disabled, [loading], data-icon-only).
// The default value of a member is shown by every group that does not set it.
// Variants and states lists a value or member when its text (prose or code)
// names it as a word. Events, outputs, slots, content selectors, the class row
// and members without an enumerated or boolean type are not counted.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRAMEWORKS, createReaders, declaredMembers } from './members.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const guideDir = resolve(here, '..', '..');
const repoDir = resolve(guideDir, '..');

const literalValues = (type) => [...String(type ?? '').matchAll(/'([^']*)'/g)].map((match) => match[1]).filter(Boolean);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const word = (name) => new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`, 'i');

function inlineText(nodes = []) {
  return nodes.map((node) => (node.type === 'text' || node.type === 'inlineCode' ? node.value : inlineText(node.children ?? []))).join(' ');
}

function blockText(blocks = []) {
  return blocks.map((block) => {
    if (block.type === 'heading' || block.type === 'paragraph') return inlineText(block.children);
    if (block.type === 'list') return block.items.map(blockText).join(' ');
    if (block.type === 'alert' || block.type === 'blockquote') return blockText(block.blocks);
    if (block.type === 'table') return block.rows.map((row) => block.columns.map((column) => inlineText(row[column.key])).join(' ')).join(' ');
    return '';
  }).join(' ');
}

/**
 * @param {{ id: string, page: any, groups: any[], declared: any }} input page model (English), its live groups and declared members
 * @returns {{ id: string, missing: { framework: string, member: string, kind: 'value' | 'boolean', value?: string }[], counted: number }}
 */
export function coverageOf({ id, page, groups, declared }) {
  const variants = blockText(page.sections?.find((section) => section.id === 'variants-and-states')?.blocks ?? []);
  const missing = [];
  let counted = 0;
  for (const framework of FRAMEWORKS) {
    const code = groups.map((group) => group.blocks?.[framework]?.code ?? '').join('\n');
    for (const member of declared[framework].members) {
      if (!['prop', 'option', 'input'].includes(member.kind) || member.name === 'class') continue;
      const name = member.name.split(' ').at(-1);
      if (member.type === 'boolean') {
        counted += 1;
        if (!word(name).test(code) && !word(name).test(variants)) missing.push({ framework, member: member.name, kind: 'boolean' });
        continue;
      }
      const values = literalValues(member.type);
      if (!values.length || values.length !== String(member.type).split('|').length) continue;
      for (const value of values) {
        counted += 1;
        const quoted = new RegExp(`["'\`]${escape(value)}["'\`]`);
        const isDefault = literalValues(member.default).length === 1 && literalValues(member.default)[0] === value;
        if (!isDefault && !quoted.test(code) && !word(value).test(variants)) missing.push({ framework, member: member.name, kind: 'value', value });
      }
    }
  }
  return { id, missing, counted };
}

/** Lines of the report of one page. */
export function coverageLines(result) {
  const lines = [`coverage: ${result.id}: ${result.missing.length} of ${result.counted} enumerated values and boolean members of the API are shown by no live group and not listed in Variants and states (a report, not a gate)`];
  const byFramework = new Map();
  for (const item of result.missing) {
    if (!byFramework.has(item.framework)) byFramework.set(item.framework, []);
    byFramework.get(item.framework).push(item.kind === 'value' ? `${item.member} '${item.value}'` : `${item.member} (boolean)`);
  }
  for (const [framework, items] of byFramework) lines.push(`  ${framework}: ${items.join(', ')}`);
  return lines;
}

async function main(argv) {
  const { processPair, readComponents } = await import('../content/pipeline.mjs');
  const { componentsDirOf } = await import('../content/hash.mjs');
  let docs = join(repoDir, 'docs', 'components');
  const ids = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--docs') {
      docs = resolve(argv[i + 1] ?? '');
      i += 1;
    } else if (/^[a-z0-9-]+$/.test(argv[i])) ids.push(argv[i]);
    else throw new Error(`content:coverage: unknown argument ${argv[i]}`);
  }
  const componentsDir = componentsDirOf(docs);
  const componentsFile = join(repoDir, 'components.json');
  const known = readComponents(componentsFile);
  const list = ids.length ? ids : readdirSync(componentsDir).filter((name) => /^[a-z0-9-]+\.md$/.test(name)).map((name) => name.slice(0, -3)).filter((id) => known.has(id)).sort();
  const readers = createReaders({ nodeModules: join(guideDir, 'node_modules'), componentsFile });
  for (const id of list) {
    const enPath = join(componentsDir, `${id}.md`);
    const arPath = join(componentsDir, `${id}.ar.md`);
    if (!existsSync(enPath)) throw new Error(`content:coverage: ${enPath} does not exist`);
    const pair = processPair({
      id, entry: known.get(id), enText: readFileSync(enPath, 'utf8'), arText: existsSync(arPath) ? readFileSync(arPath, 'utf8') : '',
      enPath, arPath, repoDir, componentsDir, built: new Set(list), exceptions: [],
    });
    for (const line of coverageLines(coverageOf({ id, page: pair.models.en, groups: pair.groupEntries.en, declared: declaredMembers(readers, id) }))) console.log(line);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
