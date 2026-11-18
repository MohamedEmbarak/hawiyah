// Angular linker (editor.runtimeFiles.linked): every file of the import closure
// of the Angular packages and @hawiyah/angular passes through
// createEs2015LinkerPlugin from @angular/compiler-cli/linker/babel, run by
// @babel/core. The frame then runs the precompiled examples without the JIT
// compiler. A file the linker leaves byte-identical is served as published.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { transformAsync } from '@babel/core';
import { createEs2015LinkerPlugin } from '@angular/compiler-cli/linker/babel';

/** Versions of the tools, read from the installed packages (manifest `tool`). */
export function linkerTool(nodeModules) {
  const version = (name) => JSON.parse(readFileSync(join(nodeModules, name, 'package.json'), 'utf8')).version;
  return `@angular/compiler-cli ${version('@angular/compiler-cli')} linker with @babel/core ${version('@babel/core')}`;
}

/** Text the linker turns into definitions; none may remain after linking. */
export const PARTIAL_DECLARATION = /\bɵɵngDeclare(?:Component|Directive|Pipe|Injectable|Injector|NgModule|Factory|ClassMetadata|ClassMetadataAsync)\s*\(/;

/**
 * Whether `code` still calls a partial declaration function through a namespace
 * import (i0.ɵɵngDeclare...(...)), which is what the linker replaces. The
 * definitions of these functions in @angular/core itself are not calls.
 */
export function hasPartialDeclarationCall(code) {
  return /\.\s*ɵɵngDeclare[A-Za-z]*\s*\(/.test(code);
}

const silentLogger = {
  level: 1,
  debug() {},
  info() {},
  warn(message) {
    throw new Error(`Angular linker warning: ${message}`);
  },
  error(message) {
    throw new Error(`Angular linker error: ${message}`);
  },
};

/** Links one module. Returns { code, changed }. */
export async function linkModule(code, filename) {
  if (!code.includes('ɵɵngDeclare')) return { code, changed: false };
  const fileSystem = {
    // The linker only uses the file system for source maps, which are not read here.
    resolve: (...paths) => join(...paths),
    exists: () => false,
    dirname: (path) => path.replace(/\/[^/]*$/, ''),
    relative: (from, to) => to,
    basename: (path) => path.replace(/^.*\//, ''),
    extname: (path) => /\.[^./]*$/.exec(path)?.[0] ?? '',
    isRooted: (path) => path.startsWith('/'),
    readFile: (path) => readFileSync(path, 'utf8'),
    readFileBuffer: (path) => readFileSync(path),
    pwd: () => process.cwd(),
    isCaseSensitive: () => true,
    normalize: (path) => path,
    join: (...paths) => join(...paths),
    lstat: () => {
      throw new Error('not available');
    },
    stat: () => {
      throw new Error('not available');
    },
    realpath: (path) => path,
  };
  const plugin = createEs2015LinkerPlugin({
    fileSystem,
    logger: silentLogger,
    linkerJitMode: false,
    sourceMapping: false,
  });
  const result = await transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    compact: false,
    sourceMaps: false,
    comments: true,
    retainLines: false,
    plugins: [plugin],
  });
  const linked = result?.code ?? code;
  return { code: linked, changed: linked !== code };
}

/** Links a file of an installed package. */
export async function linkFile(nodeModules, name, file) {
  const absolute = join(nodeModules, name, file);
  const code = readFileSync(absolute, 'utf8');
  const result = await linkModule(code, absolute);
  if (result.changed && hasPartialDeclarationCall(result.code)) {
    throw new Error(`runtime: ${name}/${file} still calls a partial declaration after linking`);
  }
  return result;
}
