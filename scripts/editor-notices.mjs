import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const editorPackages = [
  'codemirror',
  '@codemirror/lang-css',
  '@codemirror/lang-html',
  '@codemirror/lang-javascript',
  '@codemirror/language',
  '@codemirror/state',
  '@lezer/highlight',
  'typescript', 'react', 'react-dom', 'vue', '@angular/core', '@angular/common',
  '@angular/forms', '@angular/compiler', '@angular/platform-browser',
];
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function packageManifest(name, from) {
  const require = createRequire(from);
  try {
    return require.resolve(`${name}/package.json`);
  } catch (error) {
    if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED' && error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  // Some packages hide package.json through exports. Resolve their runtime entry
  // from the importer, then walk upward; this also follows pnpm's actual graph.
  let directory = dirname(require.resolve(name));
  for (;;) {
    const candidate = join(directory, 'package.json');
    if (existsSync(candidate) && JSON.parse(readFileSync(candidate, 'utf8')).name === name) return candidate;
    const parent = dirname(directory);
    if (parent === directory) throw new Error(`Cannot locate the manifest for editor dependency ${name}`);
    directory = parent;
  }
}

/** Complete installed editor runtime notices, without timestamps or local paths. */
export function collectEditorNotices() {
  const visited = new Set();
  const notices = new Map();
  function visit(name, from, optional = false) {
    let manifest;
    try {
      manifest = packageManifest(name, from);
    } catch (error) {
      if (optional && error.code === 'MODULE_NOT_FOUND') return;
      throw error;
    }
    if (visited.has(manifest)) return;
    visited.add(manifest);
    const directory = dirname(manifest);
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    const files = readdirSync(directory, { withFileTypes: true })
      .filter(file => file.isFile() && /^(?:licen[cs]e|copying|notice)(?:[.-].*)?$/i.test(file.name))
      .map(file => file.name).sort(compare);
    if (!files.some(file => /^(?:licen[cs]e|copying)(?:[.-].*)?$/i.test(file))) {
      throw new Error(`Missing license file for editor dependency ${pkg.name}@${pkg.version}`);
    }
    const identity = `${pkg.name}@${pkg.version}`;
    const text = files.map(file => `${file}\n\n${readFileSync(join(directory, file), 'utf8')}`).join('\n');
    if (notices.has(identity) && notices.get(identity) !== text) {
      throw new Error(`Conflicting license text for editor dependency ${identity}`);
    }
    notices.set(identity, text);
    const dependencies = {
      ...pkg.peerDependencies,
      ...pkg.dependencies,
      ...pkg.optionalDependencies,
    };
    for (const dependency of Object.keys(dependencies).sort(compare)) {
      const isOptional = Object.hasOwn(pkg.optionalDependencies ?? {}, dependency)
        || (!Object.hasOwn(pkg.dependencies ?? {}, dependency) && pkg.peerDependenciesMeta?.[dependency]?.optional === true);
      visit(dependency, manifest, isOptional);
    }
  }
  for (const name of editorPackages) visit(name, new URL('../package.json', import.meta.url));
  return 'Nasaq guide editor — third-party licenses\n\n'
    + 'CodeMirror, Lezer, TypeScript, native framework previews, and their installed runtime dependencies.\n'
    + [...notices].sort(([a], [b]) => compare(a, b))
      .map(([identity, text]) => `\n${'='.repeat(72)}\n${identity}\n${'='.repeat(72)}\n\n${text}${text.endsWith('\n') ? '' : '\n'}`)
      .join('');
}
