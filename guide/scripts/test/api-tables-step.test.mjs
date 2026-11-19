// The success line of build step 30 states exactly what the step compares (plan D-C):
// names, kinds and required flags, and that Type and Default are not compared.
import { describe, expect, it, vi } from 'vitest';

vi.mock('../api-tables/cli.mjs', async (importOriginal) => ({
  ...(await importOriginal()),
  runApiTables: () => ({ findings: [], tables: 16, pages: 4 }),
}));

const { default: step } = await import('../build-steps/30-api-tables.mjs');

describe('step 30 success line', () => {
  it('names what is compared and what is not', async () => {
    const lines = [];
    await step.run({ guideDir: '/guide', generatedDir: 'src/generated', repoDir: '/', log: (line) => lines.push(line) });
    expect(lines).toEqual([
      '16 API tables of 4 page models: member names, kinds (Vue and Angular tables) and required flags match the declarations '
        + '(required flags not compared for stylesheet-contract tables); Type and Default columns are not compared',
    ]);
  });
});
