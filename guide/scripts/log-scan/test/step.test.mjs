// Build step 50 over a temporary guide tree: the log of step 40 is scanned
// with the route count expected from features.json.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import step, { expectedRoutes } from '../../build-steps/50-log-scan.mjs';

const clean = readFileSync(new URL('./fixtures/clean.log', import.meta.url), 'utf8');
let guideDir;

function tree(log, configuration = 'production') {
  guideDir = mkdtempSync(join(tmpdir(), 'hw-log-step-'));
  mkdirSync(join(guideDir, 'src', 'generated'), { recursive: true });
  writeFileSync(join(guideDir, 'src', 'generated', 'features.json'), JSON.stringify([{ id: 'catalogue', order: 20, paths: ['components'] }]));
  if (log !== null) {
    mkdirSync(join(guideDir, '.cache', 'logs'), { recursive: true });
    writeFileSync(join(guideDir, '.cache', 'logs', `build-${configuration}.log`), log);
  }
  const lines = [];
  return { guideDir, configuration, logDir: '.cache/logs', generatedDir: 'src/generated', log: (line) => lines.push(line), lines };
}

afterEach(() => rmSync(guideDir, { recursive: true, force: true }));

describe('build step 50-log-scan', () => {
  it('expects the root, 404, two language roots and two catalogue pages for the stage 4a features', () => {
    expect(expectedRoutes(tree(clean))).toBe(6);
  });

  it('passes a clean log with the expected route count', async () => {
    const ctx = tree(clean.replace('Prerendered 13 static routes', 'Prerendered 6 static routes'));
    await step.run(ctx);
    expect(ctx.lines).toEqual(['log-scan: 0 findings (production)']);
  });

  it('fails a clean log with another route count', async () => {
    await expect(step.run(tree(clean))).rejects.toThrow('log-scan: LS-ROUTES line 9: Prerendered 13 static routes; expected 6\nlog-scan: 1 findings (production)');
  });

  it('fails when the log is missing', async () => {
    await expect(step.run(tree(null))).rejects.toThrow('log-scan: .cache/logs/build-production.log is missing; step 40 writes it');
  });

  it('applies the development rules to the development log', async () => {
    const log = clean.replace('Prerendered 13 static routes', 'Hawiyah: missing text "x"\nPrerendered 6 static routes');
    await expect(step.run(tree(log, 'development'))).rejects.toThrow(/log-scan: LS-10 line 9: Hawiyah: missing text "x"/);
  });
});
