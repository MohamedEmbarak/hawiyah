#!/usr/bin/env node
// Lint negative controls (lint.tests): every directory under
// test/fixtures/bad/ is a small tree laid out like guide/ with an
// expected.json listing [{ rule, file, line }]. The three linters run over
// it and must report exactly the listed findings (rule, file and line); the
// good fixtures under test/fixtures/good/ must report none.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintTree } from './cli.mjs';
import { formatFinding } from './files.mjs';

const fixtures = fileURLToPath(new URL('./test/fixtures/', import.meta.url));
const key = (item) => `${item.rule} ${item.file}:${item.line}`;

export function runNegative() {
  const lines = [];
  const bad = readdirSync(join(fixtures, 'bad'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  let rejected = 0;
  for (const name of bad) {
    const root = join(fixtures, 'bad', name);
    const expectedFile = join(root, 'expected.json');
    if (!existsSync(expectedFile)) {
      lines.push(`lint negative ${name}: expected.json is missing`);
      continue;
    }
    const expected = JSON.parse(readFileSync(expectedFile, 'utf8')).map(key).sort();
    const found = lintTree(root).findings;
    const actual = found.map(key).sort();
    const missing = expected.filter((item) => !actual.includes(item));
    const unexpected = actual.filter((item) => !expected.includes(item));
    if (expected.length > 0 && missing.length === 0 && unexpected.length === 0) {
      rejected += 1;
      lines.push(`lint negative ${name}: rejected with ${[...new Set(found.map((item) => item.rule))].join(', ')}`);
    } else {
      lines.push(`lint negative ${name}: NOT as expected`);
      for (const item of missing) lines.push(`  missing ${item}`);
      for (const item of found.filter((entry) => unexpected.includes(key(entry)))) lines.push(`  unexpected ${formatFinding(item)}`);
    }
  }
  const good = readdirSync(join(fixtures, 'good'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  let clean = 0;
  for (const name of good) {
    const found = lintTree(join(fixtures, 'good', name)).findings;
    if (found.length === 0) clean += 1;
    else for (const item of found) lines.push(`lint good ${name}: unexpected ${formatFinding(item)}`);
  }
  return { lines, rejected, total: bad.length, clean, goodTotal: good.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = runNegative();
  for (const line of result.lines) console.log(line);
  console.log(`lint good fixtures: ${result.clean} of ${result.goodTotal} without findings`);
  console.log(`lint negative controls: ${result.rejected} of ${result.total} bad fixtures rejected with the expected rule ids`);
  process.exitCode = result.rejected === result.total && result.clean === result.goodTotal && result.total > 0 ? 0 : 1;
}
