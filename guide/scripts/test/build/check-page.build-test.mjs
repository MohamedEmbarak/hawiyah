// check:page against a production build (5a.6 of milestone 5): run by
// `npm run test:check-page` after `HAWIYAH_BASE_PATH=/hawiyah/ npm run build`
// (it fails without that build). Three copies of tabs.md, read with --docs, fail
// with the code of their stage: a renamed prop in a table (HWC-APIX), a block that
// does not compile (HWC-R1), one framework rendering another text (HWE-STRUCT),
// the Home row removed from the keyboard table (HWE-KEYS, 5a.8; --draft leaves
// that rule out).
// Two concurrent runs pass and leave dist/browser/examples and src/generated as
// they were (leadAmendments A8).
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkPage } from '../../check-page.mjs';
import { relink } from '../scale/generate.mjs';

const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
const scratch = join(guideDir, '.cache', 'test-check-page-build', String(process.pid));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

beforeAll(() => {
  if (!existsSync(join(guideDir, 'dist', 'browser', 'runtime', 'import-map.json')) || !existsSync(join(guideDir, 'src', 'generated', 'content', 'manifest.json'))) {
    throw new Error('npm run test:check-page needs a production build: run HAWIYAH_BASE_PATH=/hawiyah/ npm run build first');
  }
});

/** A components directory with tabs.md changed by `edit` (the change must apply). */
function tabsCopy(name, edit) {
  const dir = join(scratch, name, 'components');
  mkdirSync(dir, { recursive: true });
  const source = relink(readFileSync(join(repoDir, 'docs', 'components', 'tabs.md'), 'utf8'), dir);
  const changed = edit(source);
  if (changed === source) throw new Error(`the copy ${name} did not change tabs.md`);
  writeFileSync(join(dir, 'tabs.md'), changed);
  return dir;
}

const run = (docs, options = {}) => {
  const lines = [];
  return checkPage({ id: 'tabs', lang: 'en', docs, log: (line) => lines.push(line), ...options }).then((result) => ({ ...result, lines }));
};

function hashTree(dir) {
  const hash = createHash('sha256');
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else hash.update(`${relative(dir, path)}\0`).update(readFileSync(path));
    }
  };
  walk(dir);
  return hash.digest('hex');
}

describe('check:page fails a wrong copy of tabs.md with the code of its stage', () => {
  it('a prop renamed in a table: HWC-APIX', async () => {
    const docs = tabsCopy('renamed-prop', (text) => text.replace('| `overflowLabel` | `string` | `false` | — |\n\nA `TabItem` is `{ value, label, content, disabled? }`', '| `overflowText` | `string` | `false` | — |\n\nA `TabItem` is `{ value, label, content, disabled? }`'));
    const result = await run(docs);
    expect(result.ok).toBe(false);
    expect(result.findings.filter((line) => line.startsWith('HWC-APIX'))).toEqual([
      expect.stringContaining('React table lists overflowText (prop, required false); the declarations have no overflowText'),
      expect.stringContaining('React table lists no overflowLabel'),
    ]);
  }, 600_000);
  it('a block that does not compile: HWC-R1', async () => {
    const docs = tabsCopy('no-compile', (text) => text.replace('```tsx live example=basic\n<Tabs', '```tsx live example=basic\n<Tabs closeLabel="Close"'));
    const result = await run(docs);
    expect(result.ok).toBe(false);
    expect(result.findings.some((line) => /^HWC-R1 .*tabs\.md:\d+: .*closeLabel/.test(line))).toBe(true);
    expect(result.lines).toContain('check:page: equivalence not run: the live groups do not compile');
  }, 600_000);
  it('one framework rendering another text: HWE-STRUCT', async () => {
    const docs = tabsCopy('other-text', (text) => {
      const start = text.indexOf('```vue live example=basic');
      const end = text.indexOf('```\n', start + 10);
      return text.slice(0, start) + text.slice(start, end).replace("label: 'Overview'", "label: 'Summary'") + text.slice(end);
    });
    const result = await run(docs);
    expect(result.ok).toBe(false);
    expect(result.findings.some((line) => /^HWE-STRUCT docs\/components\/tabs\.md:\d+: basic \(en, rest\)/.test(line))).toBe(true);
  }, 600_000);
});

describe('the keyboard table drives the checks (5a.8)', () => {
  it('the Home row removed from the keyboard table: HWE-KEYS, and --draft leaves the rule out', async () => {
    const docs = tabsCopy('no-home', (text) => text.replace('| <kbd>Home</kbd>, <kbd>End</kbd> | Moves focus to the first or the last enabled tab. |', '| <kbd>End</kbd> | Moves focus to the last enabled tab. |'));
    const result = await run(docs);
    expect(result.ok).toBe(false);
    // The copy has no Arabic sibling (HWC-FILE), as in the other cases; nothing else fails.
    const other = (findings) => findings.filter((line) => !line.startsWith('HWC-FILE'));
    // tabs-activate presses Home too since G24 of the 5a fix round (manual activation).
    expect(other(result.findings)).toEqual([
      expect.stringMatching(/^HWE-KEYS docs\/components\/tabs\.md:\d+: the step tabs-keyboard\/home, tabs-keyboard-vertical\/home, tabs-activate\/home presses Home, which the keyboard table does not document$/),
    ]);
    const draft = await run(docs, { draft: true });
    expect(other(draft.findings)).toEqual([]);
    expect(draft.lines.some((line) => /HWE-KEYS left out \(--draft\)$/.test(line))).toBe(true);
  }, 600_000);
});

describe('two concurrent runs (leadAmendments A8)', () => {
  it('both pass, one step 80 at a time, and the build output is unchanged', async () => {
    const before = { examples: hashTree(join(guideDir, 'dist', 'browser', 'examples')), generated: hashTree(join(guideDir, 'src', 'generated')) };
    const spawnRun = (id) => new Promise((done) => {
      const child = spawn(process.execPath, ['scripts/check-page.mjs', id], { cwd: guideDir, env: process.env });
      let output = '';
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.on('close', (code) => done({ id, code, output }));
    });
    const results = await Promise.all([spawnRun('button'), spawnRun('tabs')]);
    for (const result of results) expect(result.code, `${result.id}:\n${result.output.split('\n').slice(-15).join('\n')}`).toBe(0);
    expect(results.some((result) => /waited \d+ ms for another check:page to finish its step 80|step 80 of another check:page/.test(result.output))).toBe(true);
    expect({ examples: hashTree(join(guideDir, 'dist', 'browser', 'examples')), generated: hashTree(join(guideDir, 'src', 'generated')) }).toEqual(before);
  }, 900_000);
});
