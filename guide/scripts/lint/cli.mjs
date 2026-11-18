#!/usr/bin/env node
// node scripts/lint/cli.mjs [--root <dir>]
// Runs the CSS, template and source lint over the guide tree (or another
// root laid out like it). Prints '<rule> <file>:<line>:<column>: <message>'
// per finding, then the summary line; exits 1 when any finding exists.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintCss } from './css.mjs';
import { formatFinding, sortFindings } from './files.mjs';
import { lintSources } from './sources.mjs';
import { lintTemplates } from './templates.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const allowlist = JSON.parse(readFileSync(new URL('./allowlist.json', import.meta.url), 'utf8'));

export function lintTree(root) {
  const css = lintCss(root, allowlist);
  const templates = lintTemplates(root, allowlist);
  const sources = lintSources(root);
  return { css, templates, sources, findings: sortFindings([...css.findings, ...templates.findings, ...sources.findings]) };
}

export function summary(result) {
  return `lint: css ${result.css.findings.length} findings in ${result.css.files} files; `
    + `templates ${result.templates.findings.length} findings in ${result.templates.files} files; `
    + `sources ${result.sources.findings.length} findings in ${result.sources.files} files`;
}

function main(argv) {
  let root = guideDir;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root' && argv[index + 1]) { root = resolve(argv[index + 1]); index += 1; }
    else { console.error(`lint: unknown argument ${argv[index]}`); return 2; }
  }
  const result = lintTree(root);
  for (const item of result.findings) console.error(formatFinding(item));
  console.log(summary(result));
  return result.findings.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
