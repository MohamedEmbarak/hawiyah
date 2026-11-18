// Shared context of the step 30 tests: one declaration program over the
// installed packages of the guide.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExclusions } from '../cli.mjs';
import { createDeclarationProgram } from '../program.mjs';
import { readContract } from '../stylesheet-contract.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');
export const nodeModules = join(guideDir, 'node_modules');

let context = null;
export function declarationContext() {
  context ??= createDeclarationProgram(nodeModules);
  return context;
}

export function components() {
  const data = JSON.parse(readFileSync(join(repoDir, 'components.json'), 'utf8'));
  return new Map(data.components.map((entry) => [entry.id, entry]));
}

export const contractRows = () => readContract(nodeModules);
export const exclusions = () => readExclusions(fileURLToPath(new URL('../exclusions.json', import.meta.url)));
