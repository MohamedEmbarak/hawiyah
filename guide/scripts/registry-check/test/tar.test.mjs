// Tar reader tests on tarballs created by 'npm pack' of a fixture folder.

import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { gunzipSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readTarEntries, readTarFile, sha512Integrity } from '../tar.mjs';
import { sha256 } from './helpers.mjs';

const run = promisify(execFile);
let base;
let tarball;
let packed;
const longDir = `dist/${'nested-directory-name/'.repeat(5)}`;
const files = {
  'package.json': `${JSON.stringify({ name: 'tar-fixture', version: '1.0.0', files: ['dist', 'NOTICE'] }, null, 2)}\n`,
  NOTICE: 'Fixture notice.\n',
  'dist/index.js': 'export const value = 1;\n',
  'dist/empty.txt': '',
  'dist/arabic-هوية.txt': 'هوية\n',
  [`${longDir}deep-file-with-a-long-name.js`]: 'export {};\n',
};

beforeAll(async () => {
  base = mkdtempSync(join(tmpdir(), 'hw-tar-'));
  const source = join(base, 'source');
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(source, path, '..'), { recursive: true });
    writeFileSync(join(source, path), content);
  }
  const { stdout } = await run('npm', ['pack', source, '--pack-destination', base, '--json', '--loglevel=error']);
  [packed] = JSON.parse(stdout);
  tarball = join(base, packed.filename);
}, 60000);

afterAll(() => rmSync(base, { recursive: true, force: true }));

describe('readTarFile', () => {
  it('lists every regular file under package/ with its sha256', () => {
    const entries = readTarFile(tarball);
    const byPath = Object.fromEntries(entries.map((entry) => [entry.path, entry]));
    expect(Object.keys(byPath).sort()).toEqual(Object.keys(files).sort());
    for (const [path, content] of Object.entries(files)) {
      expect(byPath[path].sha256).toBe(sha256(Buffer.from(content)));
      expect(byPath[path].size).toBe(Buffer.byteLength(content));
    }
  });

  it('agrees with the file list npm reports for the tarball', () => {
    const entries = readTarFile(tarball);
    expect(entries.map((entry) => entry.path).sort()).toEqual(packed.files.map((file) => file.path).sort());
  });

  it('reads an uncompressed archive the same way', () => {
    const plain = gunzipSync(readFileSync(tarball));
    expect(readTarEntries(plain)).toEqual(readTarFile(tarball));
  });

  it('computes the same sha512 integrity as npm', () => {
    expect(sha512Integrity(readFileSync(tarball))).toBe(packed.integrity);
  });
});
