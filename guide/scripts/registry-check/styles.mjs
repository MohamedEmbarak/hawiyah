// HWREG-R8, package stylesheet: the served package bundle (<distDir>/styles-<hash>.css)
// and the media files it references are derived again from the verified installed
// @hawiyah/styles and must equal the derivation byte for byte. The derivation
// bundles an entry that holds exactly the three @hawiyah/styles imports with the
// esbuild options of the Angular application builder for a global stylesheet in
// the production configuration (bundle, minify, the targets of the guide's
// browserslist, media/[name]-[hash] for referenced files). src/styles.css is never
// read: a guide rule written there differs from the derivation.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, sep } from 'node:path';
import { checkMetafile } from './resolved.mjs';

export const PACKAGE_STYLE_IMPORTS = ['@hawiyah/styles/reset.css', '@hawiyah/styles/styles.css', '@hawiyah/styles/fonts.css'];

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const SERVED = /^styles-[A-Za-z0-9]+\.css$/;
const FILE_LOADERS = ['.woff2', '.woff', '.ttf', '.otf', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.cur', '.ico'];

/**
 * The package bundle derived from guide/node_modules. Returns the CSS text, the
 * media files by their path relative to the output root, and the esbuild metafile.
 */
export async function deriveStylesBundle({ guideDir }) {
  const require = createRequire(join(guideDir, 'package.json'));
  const esbuild = require('esbuild');
  const angular = require('@angular/build/private');
  const target = angular.transformSupportedBrowsersToTargets(angular.getSupportedBrowsers(guideDir, { warn() {} }));
  const result = await esbuild.build({
    absWorkingDir: guideDir,
    bundle: true,
    entryNames: '[name]-[hash]',
    assetNames: 'media/[name]-[hash]',
    logLevel: 'silent',
    minify: true,
    metafile: true,
    outdir: guideDir,
    write: false,
    platform: 'browser',
    target,
    conditions: ['style', 'sass', 'less', 'production'],
    mainFields: ['style', 'sass'],
    resolveExtensions: [],
    stdin: {
      contents: PACKAGE_STYLE_IMPORTS.map((path) => `@import '${path}';\n`).join(''),
      loader: 'css',
      resolveDir: join(guideDir, 'src'),
      sourcefile: 'package-styles.css',
    },
    loader: Object.fromEntries(FILE_LOADERS.map((extension) => [extension, 'file'])),
  });
  let css = null;
  const media = new Map();
  for (const file of result.outputFiles) {
    const path = relative(guideDir, file.path).split(sep).join('/');
    if (path.endsWith('.css')) css = file.text;
    else media.set(path, Buffer.from(file.contents));
  }
  if (css === null) throw new Error('esbuild wrote no stylesheet');
  return { css, media, metafile: result.metafile };
}

/** Compares <distDir>/styles-*.css and its media with the derivation. */
export async function ruleStylesDerived(ctx, derive = deriveStylesBundle) {
  const served = readdirSync(ctx.distDir).filter((name) => SERVED.test(name));
  if (served.length !== 1) {
    ctx.report('r8StylesServed', { count: served.length, names: served.join(', ') || 'none' });
    return;
  }
  let derived;
  try {
    derived = await derive({ guideDir: ctx.guideDir });
  } catch (error) {
    ctx.report('r8StylesDerive', { error: error instanceof Error ? error.message : String(error) });
    return;
  }
  for (const [key, params] of checkMetafile(derived.metafile, { label: 'package stylesheet', baseDir: ctx.guideDir, guideDir: ctx.guideDir })) {
    ctx.report(key, params);
  }
  const name = served[0];
  if (readFileSync(join(ctx.distDir, name), 'utf8') !== derived.css) ctx.report('r8StylesDiffers', { path: name });
  const mediaDir = join(ctx.distDir, 'media');
  if (existsSync(mediaDir)) {
    for (const file of readdirSync(mediaDir)) {
      if (!derived.media.has(`media/${file}`)) ctx.report('r8StylesMedia', { path: `media/${file}`, reason: 'is not a file of the package bundle derived from @hawiyah/styles' });
    }
  }
  for (const [path, buffer] of derived.media) {
    const file = join(ctx.distDir, path);
    if (!existsSync(file)) ctx.report('r8StylesMedia', { path, reason: 'missing from the output' });
    else if (sha256(readFileSync(file)) !== sha256(buffer)) ctx.report('r8StylesMedia', { path, reason: 'differs from the derived file' });
  }
  ctx.derivedStyles = { name, bytes: Buffer.byteLength(derived.css), media: derived.media.size };
}
