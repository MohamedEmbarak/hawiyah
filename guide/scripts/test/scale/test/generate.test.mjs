// The scale fixture stays valid as
// the tools change: its 85 pages pass step 20 and step 30 (API tables and
// vocabulary) in both languages. The build of the fixture itself is measured by
// hand (README.md, Scale); this test does not run it.
import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { formatFinding, runApiTables } from '../../../api-tables/cli.mjs';
import { runContent } from '../../../content/pipeline.mjs';
import { DEFAULT_GROUPS, REAL_PAGES, generateScale, genericGroup } from '../generate.mjs';

const guideDir = resolve(fileURLToPath(new URL('../../../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
const scratch = join(guideDir, '.cache', 'test-scale', String(process.pid));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('the scale fixture', () => {
  it('writes 85 pages in two languages that pass steps 20 and 30', () => {
    mkdirSync(scratch, { recursive: true });
    const result = generateScale({ out: join(scratch, 'docs') });
    expect(result).toMatchObject({ pages: 85, generated: 83, copied: 2, groups: DEFAULT_GROUPS });
    const out = join(scratch, 'content');
    const content = runContent({
      guideDir, repoDir, componentsDir: result.dir, componentsFile: join(repoDir, 'components.json'), outDir: out, liveGroupsFile: join(out, 'live-groups.json'), pending: new Set(),
    });
    expect(content.findings.map((item) => `${item.code} ${item.file}:${item.line}: ${item.message}`)).toEqual([]);
    expect(content.pages).toBe(170);
    expect(content.groups).toBe(83 * DEFAULT_GROUPS * 2 + 2 * (4 + 5));
    const api = runApiTables({ contentDir: out, liveGroupsFile: join(out, 'live-groups.json'), parityFile: null });
    expect(api.findings.map(formatFinding)).toEqual([]);
    expect(api.tables).toBe(680);
  }, 300_000);
  it('a generic group is static and the same markup in the four frameworks', () => {
    const group = genericGroup('example-2', 2, 'Accordion');
    expect(group).toContain('```html live example=example-2 static');
    expect(group.match(/Generic group 2 of Accordion\./g)).toHaveLength(4);
    expect(REAL_PAGES).toEqual(['button', 'tabs']);
  });
});
