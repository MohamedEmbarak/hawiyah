// Shared context of the step 30 tests: one declaration program and one set of
// readers over the installed packages of the guide.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_EXCLUSIONS, createReaders, readExclusions } from '../members.mjs';
import { createDeclarationProgram } from '../program.mjs';
import { readContract } from '../stylesheet-contract.mjs';

export const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');
export const nodeModules = join(guideDir, 'node_modules');
export const componentsFile = join(repoDir, 'components.json');

let context = null;
export function declarationContext() {
  context ??= createDeclarationProgram(nodeModules);
  return context;
}

let readers = null;
/** Readers over the installed packages; `overrides` replaces exclusions, defaults or slot patterns (a fresh set). */
export function testReaders(overrides = null) {
  if (overrides) return createReaders({ nodeModules, componentsFile, context: declarationContext(), ...overrides });
  readers ??= createReaders({ nodeModules, componentsFile, context: declarationContext() });
  return readers;
}

export function components() {
  const data = JSON.parse(readFileSync(componentsFile, 'utf8'));
  return new Map(data.components.map((entry) => [entry.id, entry]));
}

export const contractRows = () => readContract(nodeModules);
export const exclusions = () => readExclusions(DEFAULT_EXCLUSIONS);
