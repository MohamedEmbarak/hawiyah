// checkRegistry(): the registry-resolution check of the guide as a library.
// It collects the findings of every rule of the selected mode and returns
// them; it never exits the process. Modes (registryCheck.modes):
//   strict  R7, R9, R1, R2, R3, R4, R5, R6
//   dist    the strict rules, then R8 on <distDir>/runtime/
//   preview R1, R3 and R4 in their preview form (local tarballs), the rest
//           unchanged; with distDir also R8 (step 90 of a preview build)

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { format, NAMES } from './messages.mjs';
import { ruleR1, ruleR2, ruleR3, ruleR4, ruleR5, ruleR6, ruleR7, ruleR8, ruleR9 } from './rules.mjs';
import { npmRegistry } from './registry.mjs';

const RULE_ORDER = ['HWREG-R1', 'HWREG-R2', 'HWREG-R3', 'HWREG-R4', 'HWREG-R5', 'HWREG-R6', 'HWREG-R7', 'HWREG-R8', 'HWREG-R9'];

function readJson(ctx, file, label) {
  if (!existsSync(file)) {
    ctx.report('r3Unreadable', { file: label, error: 'missing' });
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    ctx.report('r3Unreadable', { file: label, error: error.message });
    return null;
  }
}

export async function checkRegistry({
  guideDir,
  repoDir,
  registry,
  mode = 'strict',
  distDir,
  previewDir,
  requireRuntime = false,
} = {}) {
  if (!guideDir) throw new Error('checkRegistry: guideDir is required');
  if (!['strict', 'dist', 'preview'].includes(mode)) throw new Error(`checkRegistry: unknown mode ${mode}`);
  if (mode === 'dist' && !distDir) throw new Error('checkRegistry: dist mode needs distDir');
  if (mode === 'preview' && !previewDir) throw new Error('checkRegistry: preview mode needs previewDir');
  const guide = resolve(guideDir);
  const findings = [];
  const ctx = {
    guideDir: guide,
    repoDir: resolve(repoDir ?? dirname(guide)),
    mode,
    distDir: distDir ? resolve(guide, distDir) : null,
    previewDir: previewDir ? resolve(guide, previewDir) : null,
    requireRuntime,
    registry: registry ?? npmRegistry({ cwd: guide }),
    pin: null,
    published: new Map(),
    installedCounts: new Map(),
    runtime: null,
    report(key, params) {
      findings.push(format(key, params));
    },
  };

  ctx.pkg = readJson(ctx, `${guide}/package.json`, 'package.json') ?? {};
  ctx.lock = readJson(ctx, `${guide}/package-lock.json`, 'package-lock.json');
  ctx.hiddenLock = readJson(ctx, `${guide}/node_modules/.package-lock.json`, 'node_modules/.package-lock.json');

  await ruleR7(ctx);
  ruleR9(ctx);
  ruleR1(ctx);
  ruleR2(ctx);
  ruleR3(ctx);
  await ruleR4(ctx);
  ruleR5(ctx);
  ruleR6(ctx);
  if (ctx.distDir) ruleR8(ctx);

  // Stable order: by rule, then in the order found.
  const ordered = findings
    .map((finding, index) => ({ finding, index }))
    .sort((a, b) => RULE_ORDER.indexOf(a.finding.code) - RULE_ORDER.indexOf(b.finding.code) || a.index - b.index)
    .map(({ finding }) => finding);

  return {
    ok: ordered.length === 0,
    mode,
    pin: ctx.pin,
    registryUrl: ctx.registry.url,
    previewDir: ctx.previewDir,
    findings: ordered,
    packages: NAMES.map((name) => ({ name: `@hawiyah/${name}`, version: ctx.pin, files: ctx.installedCounts.get(name) ?? 0 })),
    runtime: ctx.runtime,
  };
}

export function successLines(result, { distLabel, previewLabel } = {}) {
  const lines = [];
  const distLine = () => (result.runtime?.present
    ? `registry-check: DIST ${result.runtime.files} runtime files in ${distLabel} match the verified packages`
    : `registry-check: DIST ${distLabel} has no runtime/ directory; HWREG-R8 has nothing to compare before stage 4b`);
  if (result.mode === 'preview') {
    if (result.runtime) lines.push(distLine());
    lines.push(`registry-check: PREVIEW 7 packages from local tarballs at ${previewLabel}`);
    return lines;
  }
  for (const pkg of result.packages) {
    lines.push(`registry-check: ${pkg.name}@${pkg.version} ok (lock, registry, files ${pkg.files})`);
  }
  if (result.runtime) lines.push(distLine());
  lines.push(`registry-check: OK 7 packages @hawiyah/*@${result.pin} from ${result.registryUrl}`);
  return lines;
}

export function failureLines(result) {
  return [...result.findings.map((finding) => finding.message), `registry-check: FAILED ${result.findings.length} findings`];
}
