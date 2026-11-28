#!/usr/bin/env node
// node scripts/log-scan/cli.mjs <log> [--configuration production|development] [--expected-routes <n>]
// Prints 'log-scan: 0 findings (<configuration>)' and exits 0, or one line
// 'log-scan: <rule id> line <n>: <text>' per finding and exits 1.

import { readFileSync } from 'node:fs';
import { formatFinding, scanLog } from './scan.mjs';

function main(argv) {
  let file = null;
  let configuration = 'production';
  let expectedRoutes;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--configuration') configuration = argv[(index += 1)];
    else if (arg.startsWith('--configuration=')) configuration = arg.slice('--configuration='.length);
    else if (arg === '--expected-routes') expectedRoutes = Number(argv[(index += 1)]);
    else if (!arg.startsWith('--') && file === null) file = arg;
    else {
      console.error(`log-scan: unknown argument ${arg}`);
      return 2;
    }
  }
  if (!file) {
    console.error('log-scan: usage: node scripts/log-scan/cli.mjs <log> [--configuration production|development] [--expected-routes <n>]');
    return 2;
  }
  if (expectedRoutes !== undefined && !Number.isInteger(expectedRoutes)) {
    console.error('log-scan: --expected-routes needs a whole number');
    return 2;
  }
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    console.error(`log-scan: cannot read ${file} (${error.code ?? error.message})`);
    return 2;
  }
  const result = scanLog(text, configuration, { expectedRoutes });
  for (const item of result.findings) console.log(formatFinding(item));
  console.log(`log-scan: ${result.findings.length} findings (${configuration})`);
  return result.findings.length === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
