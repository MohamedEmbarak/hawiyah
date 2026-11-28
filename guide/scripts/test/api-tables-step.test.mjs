// The success line of build step 30 states exactly what the step compares:
// names, kinds, required flags, types and defaults, where types and
// defaults come from, the rows compared against the stylesheet and by name only,
// the counts of the lead's lists, the parity data it writes, and the counts of
// the vocabulary pass.
import { describe, expect, it, vi } from 'vitest';

const stats = {
  tables: 16, pages: 4, rows: 136, stylesheetRows: 20, excluded: 2, defaultsEntries: 4, slotPatterns: 8, overrides: 7, parity: 85,
  vocabulary: { codes: 251, terms: 283, markup: 176, excepted: 0 },
};
vi.mock('../api-tables/cli.mjs', async (importOriginal) => ({
  ...(await importOriginal()),
  runApiTables: () => ({ findings: [], tables: 16, pages: 4, stats }),
}));

const { default: step } = await import('../build-steps/30-api-tables.mjs');
const { comparedLine } = await import('../api-tables/cli.mjs');

describe('step 30 success line', () => {
  it('names what is compared, with the counts of the run', async () => {
    const lines = [];
    await step.run({ guideDir: '/guide', generatedDir: 'src/generated', cacheDir: '.cache', repoDir: '/', log: (line) => lines.push(line) });
    expect(lines).toEqual([
      '16 API tables of 4 page models, 136 rows: names, kinds, required flags, types and defaults match the installed packages '
        + '(types in the written form of scripts/api-tables/types.mjs; defaults from the published JavaScript of React, Vue and Angular, an em dash for a default that is absent, generated or computed, '
        + 'and for vanilla options and stylesheet attributes unless defaults.json quotes the published line: 4 defaults.json entries; '
        + '20 rows of components without a controller compared with the styles contract and the attribute selectors of dist/styles.css, required flags not compared there; '
        + '2 rows of exclusions.json compared by name only; Vue slots read from the published build, 8 slot patterns; 7 target overrides); parity.json: members of 85 components; '
        + 'vocabulary: 251 code values outside the API tables (283 terms) and 176 classes, hooks and data attributes of html live blocks exist in the installed packages (0 vocabulary-exceptions.json entries)',
    ].map((line) => `api-tables: ${line}`));
    expect(lines[0]).toBe(`api-tables: ${comparedLine(stats)}`);
    expect(lines[0]).not.toMatch(/not compared yet|columns are not compared/);
  });
});
