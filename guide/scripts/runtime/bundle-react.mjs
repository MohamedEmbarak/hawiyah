// ESM facades of React (editor.runtimeFiles.bundled). React is published as
// CommonJS only, so esbuild bundles react, react/jsx-runtime and react-dom/client
// from the installed packages into one module (react-runtime.js, production
// define), and three small facades re-export it under the export names that Node
// enumerates for each entry at build time.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { build } from 'esbuild';

/** Facade file -> the CommonJS entry it re-exports, and the namespace key in react-runtime.js. */
export const REACT_FACADES = Object.freeze([
  { file: 'react.js', entry: 'react', key: 'React' },
  { file: 'jsx-runtime.js', entry: 'react/jsx-runtime', key: 'JsxRuntime' },
  { file: 'react-dom-client.js', entry: 'react-dom/client', key: 'ReactDomClient' },
]);

export const REACT_RUNTIME_FILE = 'react-runtime.js';

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Export names of a CommonJS entry as Node sees them in production mode.
 * Names that are not identifiers (none today) are skipped.
 */
export function exportNames(guideDir, entry) {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const require = createRequire(join(guideDir, 'package.json'));
    const resolved = require.resolve(entry);
    // A fresh read: another entry may have loaded the development build.
    delete require.cache[resolved];
    const module = require(resolved);
    return Object.keys(module).filter((name) => IDENTIFIER.test(name) && name !== 'default' && name !== '__esModule').sort();
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
}

/** Source of a facade module. */
export function facadeSource(key, names) {
  const lines = [
    `// Facade of the bundled CommonJS entry; export names enumerated in Node at build time.`,
    `import { ${key} as ns } from './${REACT_RUNTIME_FILE}';`,
    `export default ns;`,
  ];
  if (names.length) {
    lines.push(`export const { ${names.join(', ')} } = ns;`);
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Builds the React runtime. Returns [{ file, text }] for react-runtime.js and the
 * three facades, plus the export names per facade.
 */
export async function bundleReact({ guideDir }) {
  const entrySource = REACT_FACADES.map(({ entry, key }) => `import * as ${key}Module from ${JSON.stringify(entry)};`)
    .concat(REACT_FACADES.map(({ key }) => `export const ${key} = ${key}Module.default ?? ${key}Module;`))
    .join('\n');
  const result = await build({
    stdin: { contents: entrySource, resolveDir: guideDir, sourcefile: 'react-runtime-entry.js', loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    minify: true,
    charset: 'utf8',
    legalComments: 'inline',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    nodePaths: [join(guideDir, 'node_modules')],
    absWorkingDir: guideDir,
    metafile: true,
  });
  const files = [{ file: REACT_RUNTIME_FILE, text: result.outputFiles[0].text }];
  const names = {};
  for (const { file, entry, key } of REACT_FACADES) {
    names[file] = exportNames(guideDir, entry);
    files.push({ file, text: facadeSource(key, names[file]) });
  }
  return { files, names, metafile: result.metafile };
}
