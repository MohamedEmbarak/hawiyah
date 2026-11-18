// Registry adapter of the registry check. The npm adapter reads metadata with
// 'npm view <spec> dist --json' and downloads tarballs with 'npm pack <spec>'
// into <cacheDir>/registry/; npm verifies what it downloads and the check
// verifies again. A stub with the same shape is used by the unit tests.
//
// Shape: { url, host, view(spec) -> { integrity, tarball },
//          tarball(spec) -> absolute path of the .tgz, config(key) -> string }
// view() and tarball() throw a RegistryError whose kind is 'unreachable' or
// 'not-found'.

import { execFile } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { REGISTRY_URL } from './messages.mjs';

const run = promisify(execFile);

export class RegistryError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

function summarise(error) {
  const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
  let summary = '';
  try {
    const parsed = JSON.parse(String(error.stdout ?? '').trim());
    summary = parsed?.error?.summary ?? '';
  } catch {
    // npm printed no JSON error object.
  }
  if (!summary) {
    const line = output.split('\n').find((entry) => /npm error (?!A complete log)/.test(entry));
    summary = line ? line.replace(/^npm error\s*/, '') : error.message;
  }
  const notFound = /\bE404\b|404 Not Found|No match found for version|is not in this registry/.test(output);
  return new RegistryError(notFound ? 'not-found' : 'unreachable', summary.split('\n')[0].trim());
}

export function npmRegistry({ cwd, cacheDir, registryUrl } = {}) {
  const url = registryUrl ?? REGISTRY_URL;
  const host = new URL(url).host;
  const common = ['--prefer-online', '--fetch-retries=0', '--fetch-timeout=30000', '--loglevel=error'];
  if (registryUrl) common.push(`--registry=${registryUrl}`);
  const views = new Map();
  const tarballs = new Map();
  const destination = resolve(cwd ?? process.cwd(), cacheDir ?? '.cache', 'registry');

  async function npm(args) {
    return run('npm', [...args, ...common], { cwd, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, npm_config_update_notifier: 'false' } });
  }

  return {
    url,
    host,
    view(spec) {
      if (!views.has(spec)) {
        views.set(spec, (async () => {
          try {
            const { stdout } = await npm(['view', spec, 'dist', '--json']);
            const text = stdout.trim();
            if (!text) throw new RegistryError('not-found', `npm view ${spec} printed nothing`);
            const dist = JSON.parse(text);
            return { integrity: dist.integrity, tarball: dist.tarball };
          } catch (error) {
            throw error instanceof RegistryError ? error : summarise(error);
          }
        })());
      }
      return views.get(spec);
    },
    tarball(spec) {
      if (!tarballs.has(spec)) {
        tarballs.set(spec, (async () => {
          mkdirSync(destination, { recursive: true });
          try {
            const { stdout } = await npm(['pack', spec, '--pack-destination', destination, '--json']);
            const [packed] = JSON.parse(stdout);
            return join(destination, packed.filename);
          } catch (error) {
            throw error instanceof RegistryError ? error : summarise(error);
          }
        })());
      }
      return tarballs.get(spec);
    },
    async config(key) {
      const { stdout } = await run('npm', ['config', 'get', key], { cwd, env: { ...process.env, npm_config_update_notifier: 'false' } });
      return stdout.trim();
    },
  };
}
