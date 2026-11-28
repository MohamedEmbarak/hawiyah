// Tests of the step runner scripts/build.mjs: the step files are exactly the
// planned steps, and a missing or unplanned step stops the build.
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { afterAll } from 'vitest';
import { DEVELOPMENT_SKIPS, GENERATE_STEPS, PLANNED_STEPS, docsComponentsDir, finalLine, parseArgs, planned, resolvePlan } from '../build.mjs';
import { deployProblems, notDeployableReasons, readRecord, removeRecord, scopeOf, writeRecord } from '../build-scope.mjs';
import step90, { refuseLimited } from '../build-steps/90-registry-dist.mjs';
import { ngEnv, ngNodeOptions } from '../build-steps/40-angular.mjs';

const stepsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'build-steps');
const stepFiles = readdirSync(stepsDir).filter((f) => f.endsWith('.mjs'));

describe('build plan', () => {
  it('the files of scripts/build-steps are exactly PLANNED_STEPS', () => {
    expect(stepFiles.map((f) => f.replace(/\.mjs$/, '')).sort()).toEqual([...PLANNED_STEPS].sort());
    expect(readdirSync(stepsDir).filter((f) => !f.endsWith('.mjs'))).toEqual([]);
  });

  it('each step declares the configurations the plan runs it in', async () => {
    for (const id of PLANNED_STEPS) {
      const step = (await import(pathToFileURL(join(stepsDir, `${id}.mjs`)).href)).default;
      expect(step.id, id).toBe(id);
      expect(step.generate, id).toBe(GENERATE_STEPS.includes(id));
      expect(step.configurations.includes('production'), id).toBe(true);
      expect(step.configurations.includes('development'), id).toBe(!DEVELOPMENT_SKIPS.includes(id));
    }
  });

  it('fails when a planned step file is missing', () => {
    const files = stepFiles.filter((f) => f !== '80-equivalence.mjs' && f !== '90-registry-dist.mjs');
    expect(() => resolvePlan(files, parseArgs([]))).toThrow(
      'planned step file(s) missing in scripts/build-steps: 80-equivalence, 90-registry-dist',
    );
    // Also when the missing step is not run by the requested configuration.
    expect(() => resolvePlan(files, parseArgs(['--generate-only']))).toThrow('80-equivalence');
  });

  it('fails on a step file that is not planned and on an unknown --only id', () => {
    expect(() => resolvePlan([...stepFiles, '55-extra.mjs'], parseArgs([]))).toThrow('step file(s) not in PLANNED_STEPS: 55-extra');
    expect(() => resolvePlan(stepFiles, parseArgs(['--only', '20-content,21-nothing']))).toThrow('--only names unknown step(s): 21-nothing');
  });

  it('returns the planned steps of each configuration in order', () => {
    expect(resolvePlan(stepFiles, parseArgs([]))).toEqual(PLANNED_STEPS);
    expect(resolvePlan(stepFiles, parseArgs(['--configuration', 'development']))).toEqual(
      PLANNED_STEPS.filter((id) => !DEVELOPMENT_SKIPS.includes(id)),
    );
    expect(resolvePlan(stepFiles, parseArgs(['--generate-only']))).toEqual(GENERATE_STEPS);
    expect(resolvePlan(stepFiles, parseArgs(['--only', '90-registry-dist,20-content']))).toEqual(['20-content', '90-registry-dist']);
    expect(planned('80-equivalence', parseArgs(['--configuration', 'development']))).toBe(false);
  });
});

describe('scope options for local gates', () => {
  const ran = (options) => resolvePlan(stepFiles, options);

  it('--pages and --docs make the build not deployable and leave out step 90; the final line says so', () => {
    const pages = parseArgs(['--pages', 'button,tabs']);
    expect(pages.pages).toEqual(['button', 'tabs']);
    expect(ran(pages)).toEqual(PLANNED_STEPS.filter((id) => id !== '90-registry-dist'));
    expect(notDeployableReasons(pages)).toEqual(['--pages button,tabs']);
    expect(scopeOf(pages)).toMatchObject({ pages: ['button', 'tabs'], equivalence: 'pages' });
    const line = finalLine(pages, { basePath: '/hawiyah/', pages: 16, ran: ran(pages) });
    expect(line).toMatch(/^build: production OK, not deployable \(--pages button,tabs\), 16 prerendered pages, 404\.html, base \/hawiyah\/, 18 steps: /);
    expect(line).not.toContain('90-registry-dist');

    const docs = parseArgs(['--docs', '../docs']);
    expect(ran(docs)).toEqual(PLANNED_STEPS.filter((id) => id !== '90-registry-dist'));
    expect(notDeployableReasons(docs)).toEqual(['--docs ../docs']);
    expect(finalLine(docs, { basePath: '/hawiyah/', pages: 16, ran: ran(docs) })).toContain('not deployable (--docs ../docs)');
    // In the development configuration --docs leaves out step 90 as well.
    expect(ran(parseArgs(['--docs', '../docs', '--configuration', 'development']))).not.toContain('90-registry-dist');
  });

  it('a full production build is deployable and its final line is unchanged', () => {
    const options = parseArgs([]);
    expect(notDeployableReasons(options)).toEqual([]);
    expect(finalLine(options, { basePath: '/hawiyah/', pages: 16, ran: PLANNED_STEPS })).toBe(
      `build: production OK, 16 prerendered pages, 404.html, base /hawiyah/, 19 steps: ${PLANNED_STEPS.join(' ')}`,
    );
    expect(notDeployableReasons(parseArgs(['--configuration', 'development']))).toEqual(['--configuration development']);
    expect(notDeployableReasons(parseArgs(['--only', '90-registry-dist']))).toEqual(['--only 90-registry-dist']);
    expect(finalLine(parseArgs(['--only', '20-content']), { basePath: '/', pages: 0, ran: ['20-content'] })).toBe(
      'build: partial production OK, not deployable (--only 20-content), base /, 1 steps: 20-content',
    );
  });

  it('--defer-equivalence leaves step 80 to the shard jobs and keeps step 90', () => {
    const options = parseArgs(['--defer-equivalence']);
    expect(ran(options)).toEqual(PLANNED_STEPS.filter((id) => id !== '80-equivalence'));
    expect(notDeployableReasons(options)).toEqual([]);
    expect(scopeOf(options).equivalence).toBe('deferred');
    expect(finalLine(options, { basePath: '/hawiyah/', pages: 16, ran: ran(options) })).toMatch(/18 steps: .* 90-registry-dist; 80-equivalence deferred to the shard jobs: deployable only with their merged report$/);
  });

  it('--docs with --defer-equivalence (the scale fixture) leaves out steps 80 and 90 and is not deployable', () => {
    const options = parseArgs(['--docs', 'x', '--defer-equivalence']);
    expect(ran(options)).toEqual(PLANNED_STEPS.filter((id) => id !== '80-equivalence' && id !== '90-registry-dist'));
    expect(notDeployableReasons(options)).toEqual(['--docs x']);
    expect(finalLine(options, { basePath: '/hawiyah/', pages: 340, ran: ran(options) })).toMatch(/^build: production OK, not deployable \(--docs x\), 340 prerendered pages, .*17 steps: .*; 80-equivalence deferred to the shard jobs: deployable only with their merged report$/);
  });

  it('refuses combinations that would hide what a build covers', () => {
    expect(() => parseArgs(['--pages', 'button', '--only', '80-equivalence'])).toThrow('--only cannot be combined');
    expect(() => parseArgs(['--pages', 'button', '--configuration', 'development'])).toThrow('--pages concerns step 80');
    expect(() => parseArgs(['--pages', 'button', '--generate-only'])).toThrow('--pages concerns step 80');
    expect(() => parseArgs(['--pages', 'Button'])).toThrow('--pages needs page keys (a component id, guide:<id>, template:<id>)');
    expect(() => parseArgs(['--pages', ','])).toThrow('--pages needs page keys (a component id, guide:<id>, template:<id>)');
    expect(() => parseArgs(['--defer-equivalence', '--pages', 'button'])).toThrow('--defer-equivalence is for the build of guide.yml and of the scale fixture');
    expect(() => parseArgs(['--defer-equivalence', '--preview', 'abcdef1'])).toThrow('--defer-equivalence is for the build of guide.yml and of the scale fixture');
    expect(() => parseArgs(['--docs'])).toThrow('--docs needs a value');
  });

  it('step 90 refuses a build limited by --pages, --docs or --only', async () => {
    for (const args of [['--pages', 'button'], ['--docs', 'x'], ['--only', '90-registry-dist']]) {
      const ctx = { notDeployable: notDeployableReasons(parseArgs(args)) };
      expect(() => refuseLimited(ctx), args.join(' ')).toThrow('step 90 checks the output of a complete build only; this build is not deployable');
      await expect(step90.run(ctx, async () => ({ ok: true })), args.join(' ')).rejects.toThrow('this build is not deployable');
    }
    expect(() => refuseLimited({ notDeployable: notDeployableReasons(parseArgs([])) })).not.toThrow();
    expect(() => refuseLimited({ notDeployable: notDeployableReasons(parseArgs(['--configuration', 'development'])) })).not.toThrow();
  });

  const scratch = mkdtempSync(join(tmpdir(), 'hawiyah-build-scope-'));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it('the record of the output decides whether it may be deployed', () => {
    expect(deployProblems(null)).toEqual(['build-info.json is missing: the output is not that of one complete build']);
    writeRecord(scratch, { deployable: false, notDeployable: ['--pages button'], configuration: 'production', steps: [] });
    expect(deployProblems(readRecord(scratch))).toEqual(['the build is not deployable (--pages button)']);
    writeRecord(scratch, { deployable: true, notDeployable: [], configuration: 'production', steps: PLANNED_STEPS });
    expect(deployProblems(readRecord(scratch))).toEqual([]);
    removeRecord(scratch);
    expect(readRecord(scratch)).toBeNull();
  });

  it('--docs names a directory, or one that holds components/', () => {
    mkdirSync(join(scratch, 'docs', 'components'), { recursive: true });
    expect(docsComponentsDir(join(scratch, 'docs'))).toBe(join(scratch, 'docs', 'components'));
    expect(docsComponentsDir(join(scratch, 'docs', 'components'))).toBe(join(scratch, 'docs', 'components'));
    expect(() => docsComponentsDir(join(scratch, 'nothing'))).toThrow('is not a directory');
  });
});

describe('step 40 heap', () => {
  it('gives ng build a heap of 8192 MB unless the caller set one', () => {
    expect(ngNodeOptions(undefined)).toBe('--max-old-space-size=8192');
    expect(ngNodeOptions('--enable-source-maps')).toBe('--enable-source-maps --max-old-space-size=8192');
    expect(ngNodeOptions('--max-old-space-size=12288')).toBe('--max-old-space-size=12288');
    expect(ngEnv({ PATH: '/bin' })).toMatchObject({ PATH: '/bin', NODE_OPTIONS: '--max-old-space-size=8192', NG_CLI_ANALYTICS: 'false', CI: '1' });
  });
});
