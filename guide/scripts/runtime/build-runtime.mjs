// Orchestrates the runtime step (editor.runtimeFiles): writes <runtimeDir>/
//   npm/<package>@<version>/<file>      published files, unmodified
//   linked/<package>@<version>/<file>   Angular packages after the linker
//   bundled/react@<v>/, bundled/rxjs@<v>/  esbuild facades
//   bundles/<framework>.js               fallback IIFE bundles
//   import-map.json, manifest.json
// from guide/node_modules (verified by the registry check, step 05).
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { bundleReact } from './bundle-react.mjs';
import { bundleRxjs } from './bundle-rxjs.mjs';
import { BUNDLE_PACKAGES, buildBundles } from './bundles.mjs';
import { importMapOf, importMapText, runtimeRelative } from './import-map.mjs';
import { hasPartialDeclarationCall, linkFile, linkerTool } from './link-angular.mjs';
import { lockInfo, manifestEntry, manifestOf, manifestText, readLock } from './manifest.mjs';
import { resolveClosure, servedPath } from './resolve.mjs';

/** Published files served besides the import closure (editor.runtimeFiles.published). */
export const PUBLISHED_EXTRA = Object.freeze([
  { package: '@hawiyah/core', dir: 'dist', match: /^[^/]+\.js$/ },
  { package: '@hawiyah/vanilla', dir: 'dist', match: /^[^/]+\.js$/ },
  { package: '@hawiyah/react', dir: 'dist', match: /^[^/]+\.js$/ },
  { package: '@hawiyah/vue', dir: 'dist', match: /^[^/]+\.js$/ },
  { package: '@hawiyah/styles', dir: 'dist', match: /^(?:styles|reset|fonts)\.css$/ },
  { package: '@hawiyah/styles', dir: 'dist/assets', match: /.*/, prefix: 'assets/' },
]);

/** The stylesheets every frame document links, relative to runtime/. */
export function stylesheetPaths(stylesVersion) {
  return ['reset.css', 'styles.css', 'fonts.css'].map((name) => `npm/@hawiyah/styles@${stylesVersion}/dist/${name}`);
}

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, base, out);
    else out.push(relative(base, path).split('\\').join('/'));
  }
  return out;
}

function esbuildTool(nodeModules) {
  return `esbuild ${JSON.parse(readFileSync(join(nodeModules, 'esbuild', 'package.json'), 'utf8')).version}`;
}

/**
 * Builds the runtime. Returns { files, entries, importMap, frameworks, bytes }.
 * `runtimeDir` is emptied first.
 */
export async function buildRuntime({ guideDir, runtimeDir }) {
  const nodeModules = join(guideDir, 'node_modules');
  const lock = readLock(guideDir);
  const tools = { linked: linkerTool(nodeModules), bundled: esbuildTool(nodeModules) };
  rmSync(runtimeDir, { recursive: true, force: true });
  mkdirSync(runtimeDir, { recursive: true });

  const entries = [];
  const write = (path, data) => {
    const target = join(runtimeDir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
  };
  const pkgInfo = (name) => {
    const info = lockInfo(lock, name);
    return { pkg: name, version: info.version, integrity: info.integrity };
  };

  const closure = await resolveClosure({ nodeModules });

  // Published and linked files of the closure.
  for (const [path, item] of closure.files) {
    const info = pkgInfo(item.package);
    if (info.version !== item.version) throw new Error(`runtime: ${item.package} ${item.version} differs from the lockfile ${info.version}`);
    if (item.source === 'linked') {
      const linked = await linkFile(nodeModules, item.package, item.file);
      write(path, linked.code);
      entries.push(manifestEntry({
        path,
        data: linked.code,
        source: linked.changed ? 'linked' : 'published',
        ...info,
        file: item.file,
        tool: linked.changed ? tools.linked : undefined,
      }));
    } else {
      const data = readFileSync(join(nodeModules, item.package, item.file));
      write(path, data);
      entries.push(manifestEntry({ path, data, source: 'published', ...info, file: item.file }));
    }
  }

  // Further published files: every dist/*.js of the four JavaScript packages, the stylesheets and their assets.
  const listed = new Set(entries.map((entry) => entry.path));
  for (const extra of PUBLISHED_EXTRA) {
    const info = pkgInfo(extra.package);
    const dir = join(nodeModules, extra.package, extra.dir);
    for (const name of walk(dir)) {
      if (!extra.match.test(name)) continue;
      const file = `${extra.dir}/${name}`;
      const path = servedPath('published', extra.package, info.version, file);
      if (listed.has(path)) continue;
      const data = readFileSync(join(dir, name));
      write(path, data);
      entries.push(manifestEntry({ path, data, source: 'published', ...info, file }));
      listed.add(path);
    }
  }

  // Bundled facades of React and rxjs.
  const react = await bundleReact({ guideDir });
  const reactInfo = pkgInfo('react');
  const reactInputs = ['react-dom', 'scheduler'].map((name) => {
    const info = lockInfo(lock, name);
    return { package: name, version: info.version, packageIntegrity: info.integrity };
  });
  for (const { file, text } of react.files) {
    const path = servedPath('bundled', 'react', reactInfo.version, file);
    write(path, text);
    entries.push(manifestEntry({ path, data: text, source: 'bundled', ...reactInfo, tool: tools.bundled, inputs: reactInputs }));
  }
  const rxjs = await bundleRxjs({ guideDir });
  const rxjsInfo = pkgInfo('rxjs');
  for (const { file, text } of rxjs.files) {
    const path = servedPath('bundled', 'rxjs', rxjsInfo.version, file);
    write(path, text);
    entries.push(manifestEntry({ path, data: text, source: 'bundled', ...rxjsInfo, tool: tools.bundled }));
  }

  // Import map.
  const importMap = importMapOf(closure.specifiers);
  writeFileSync(join(runtimeDir, 'import-map.json'), importMapText(importMap));

  // Fallback bundles, built from the files written above.
  const bundles = await buildBundles({ runtimeDir, frameworks: closure.frameworks, importMap: runtimeRelative(importMap) });
  for (const bundle of bundles) {
    write(bundle.file, bundle.text);
    entries.push(manifestEntry({
      path: bundle.file,
      data: bundle.text,
      source: 'bundled',
      ...pkgInfo(BUNDLE_PACKAGES[bundle.framework]),
      tool: tools.bundled,
      inputs: bundle.inputs,
    }));
  }

  for (const entry of entries) {
    if (entry.source === 'linked' && hasPartialDeclarationCall(readFileSync(join(runtimeDir, entry.path), 'utf8'))) {
      throw new Error(`runtime: ${entry.path} still calls a partial declaration`);
    }
  }
  const manifest = manifestOf(entries);
  writeFileSync(join(runtimeDir, 'manifest.json'), manifestText(manifest));
  const bytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  return { entries: manifest.entries, importMap, frameworks: closure.frameworks, bytes, names: { react: react.names, rxjs: rxjs.names } };
}
