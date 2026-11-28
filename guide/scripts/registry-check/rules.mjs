// One function per rule HWREG-R1 to HWREG-R9 (registryCheck in the guide
// specification). Each rule receives the shared context built by check.mjs and
// reports findings through ctx.report(key, params); no rule exits the process.

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
import { basename, dirname, extname, join, matchesGlob, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import { parse as parseYaml } from 'yaml';
import { NAMES, REGISTRY_URL } from './messages.mjs';
import { checkMetafile } from './resolved.mjs';
import { readTarEntries, sha512Integrity } from './tar.mjs';

export const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const DIRECT_SECTIONS = new Set(['dependencies', 'devDependencies', 'optionalDependencies']);
const PROTOCOL = /^(?:file:|link:|workspace:|portal:|git:|git\+|github:|gitlab:|bitbucket:|gist:|http:|https:)/;
const NPMRC_LINES = ['engine-strict=true', 'save-exact=true', 'fund=false', 'audit=false', `registry=${REGISTRY_URL}`];

const toPosix = (value) => value.split(sep).join('/');
const full = (name) => `@hawiyah/${name}`;
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
export const expectedTarballUrl = (name, pin) => `${REGISTRY_URL}@hawiyah/${name}/-/${name}-${pin}.tgz`;
export const previewTarballName = (name, version) => `hawiyah-${name}-${version}.tgz`;

export function isPathOrProtocol(value) {
  if (typeof value !== 'string') return false;
  if (PROTOCOL.test(value)) return true;
  if (/^[.~/\\]/.test(value)) return true;
  // GitHub shorthand such as user/repo or user/repo#ref.
  return /^[^@\s:]+\/[^\s]+$/.test(value);
}

function previewFile(ctx, value) {
  // 'file:<path>' resolved from guide/ to an absolute path, or null.
  if (typeof value !== 'string' || !value.startsWith('file:')) return null;
  return resolve(ctx.guideDir, value.slice('file:'.length));
}

/* ------------------------------------------------------------------ R1 */

export function ruleR1(ctx) {
  const pkg = ctx.pkg;
  const deps = pkg.dependencies ?? {};
  for (const name of NAMES) {
    if (!(full(name) in deps)) ctx.report('r1Missing', { name });
  }
  for (const section of ['devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const key of Object.keys(pkg[section] ?? {})) {
      if (key.startsWith('@hawiyah/')) ctx.report('r1Section', { name: key.slice(9), section });
    }
  }
  for (const section of ['bundleDependencies', 'bundledDependencies']) {
    const list = Array.isArray(pkg[section]) ? pkg[section] : [];
    for (const key of list) {
      if (String(key).startsWith('@hawiyah/')) ctx.report('r1Section', { name: String(key).slice(9), section });
    }
  }
  for (const key of Object.keys(deps)) {
    if (key.startsWith('@hawiyah/') && !NAMES.includes(key.slice(9))) ctx.report('r1Unknown', { name: key.slice(9) });
  }

  const versions = [];
  for (const name of NAMES) {
    const value = deps[full(name)];
    if (value === undefined) continue;
    if (ctx.mode === 'preview') {
      const file = previewFile(ctx, value);
      const match = file && basename(file).match(/^hawiyah-([a-z]+)-(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\.tgz$/);
      if (!file || !match || match[1] !== name || resolve(dirname(file)) !== resolve(ctx.previewDir)) {
        ctx.report('r1Preview', { name, value, dir: toPosix(relative(ctx.guideDir, ctx.previewDir)) || '.' });
        continue;
      }
      versions.push([name, match[2]]);
      continue;
    }
    if (isPathOrProtocol(value) || String(value).startsWith('npm:')) continue; // reported by R2
    if (!EXACT_VERSION.test(value)) {
      ctx.report('r1NotExact', { name, value });
      continue;
    }
    versions.push([name, value]);
  }
  const distinct = new Set(versions.map(([, version]) => version));
  if (distinct.size > 1) {
    const list = versions.map(([name, version]) => `${name}@${version}`).join(', ');
    ctx.report('r1Differ', { list });
  }
  const present = NAMES.filter((name) => deps[full(name)] !== undefined);
  if (present.length > 0 && versions.length === 0) ctx.report('r1NoPin', {});
  const angular = versions.find(([name]) => name === 'angular');
  ctx.pin = angular ? angular[1] : (versions[0]?.[1] ?? null);
}

/* ------------------------------------------------------------------ R2 */

function findKeys(value, keys, trail, found) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findKeys(entry, keys, `${trail}[${index}]`, found));
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (keys.has(key)) found.push(trail ? `${trail}.${key}` : key);
      findKeys(entry, keys, trail ? `${trail}.${key}` : key, found);
    }
  }
  return found;
}

export function ruleR2(ctx) {
  for (const section of SECTIONS) {
    for (const [name, value] of Object.entries(ctx.pkg[section] ?? {})) {
      const text = String(value);
      if (text.startsWith('npm:')) {
        ctx.report('r2Alias', { name, value: text });
      } else if (isPathOrProtocol(text)) {
        if (ctx.mode === 'preview' && name.startsWith('@hawiyah/') && text.startsWith('file:')) continue; // R1 preview
        ctx.report('r2Specifier', { name, value: text });
      } else if (DIRECT_SECTIONS.has(section) && !name.startsWith('@hawiyah/') && !EXACT_VERSION.test(text)) {
        ctx.report('r2Specifier', { name, value: text });
      }
    }
  }
  for (const key of findKeys(ctx.pkg, new Set(['overrides', 'resolutions', 'pnpm']), '', [])) {
    ctx.report('r2Key', { key });
  }
}

/* ------------------------------------------------------------------ R3 */

function lockName(key) {
  const index = key.lastIndexOf('node_modules/');
  return index === -1 ? key : key.slice(index + 'node_modules/'.length);
}

export function ruleR3(ctx) {
  const lock = ctx.lock;
  if (!lock) return;
  if (lock.lockfileVersion !== 3) ctx.report('r3Version', { n: lock.lockfileVersion });
  const packages = lock.packages ?? {};
  const root = packages[''] ?? {};
  for (const section of SECTIONS) {
    const inLock = root[section] ?? {};
    const inPkg = ctx.pkg[section] ?? {};
    const names = [...new Set([...Object.keys(inLock), ...Object.keys(inPkg)])].sort();
    const differ = names
      .filter((name) => inLock[name] !== inPkg[name])
      .map((name) => `${name} lock ${inLock[name] ?? 'absent'}, package.json ${inPkg[name] ?? 'absent'}`);
    if (differ.length) ctx.report('r3Root', { section, list: differ.join('; ') });
  }
  const seven = new Set(NAMES.map((name) => `node_modules/${full(name)}`));
  for (const [key, entry] of Object.entries(packages)) {
    if (key === '') continue;
    if (!key.startsWith('node_modules/')) ctx.report('r3Outside', { key });
    const name = lockName(key);
    if (entry && typeof entry.name === 'string' && entry.name !== name) {
      ctx.report('r3Alias', { key, name: entry.name });
    }
    // Every other entry: a registry tarball whose path names the entry's own
    // package at its version, with a sha512 integrity (the seven are checked below).
    if (seven.has(key) || !entry || typeof entry !== 'object') continue;
    if (entry.link) {
      ctx.report('r3EntryLink', { key });
      continue;
    }
    const expected = `${REGISTRY_URL}${name}/-/${name.split('/').pop()}-${entry.version}.tgz`;
    if (entry.resolved !== expected) ctx.report('r3EntryResolved', { key, resolved: entry.resolved, expected });
    if (typeof entry.integrity !== 'string' || !entry.integrity.startsWith('sha512-')) {
      ctx.report('r3EntryIntegrity', { key, value: entry.integrity });
    }
  }
  for (const name of NAMES) {
    const expectedKey = `node_modules/${full(name)}`;
    for (const key of Object.keys(packages)) {
      if (key !== expectedKey && key.endsWith(`node_modules/${full(name)}`)) ctx.report('r3Nested', { name, key });
    }
    const entry = packages[expectedKey];
    if (!entry) {
      if (full(name) in (ctx.pkg.dependencies ?? {})) ctx.report('r3MissingEntry', { name });
      continue;
    }
    if (entry.link) {
      ctx.report('r3Link', { name });
      continue;
    }
    if (ctx.pin && entry.version !== ctx.pin) ctx.report('r3EntryVersion', { name, value: entry.version, pin: ctx.pin });
    if (ctx.mode === 'preview') {
      const expected = resolve(ctx.previewDir, previewTarballName(name, ctx.pin));
      const actual = previewFile(ctx, entry.resolved);
      if (!actual || actual !== expected) {
        ctx.report('r3Resolved', { name, resolved: entry.resolved, expected: `file:${toPosix(relative(ctx.guideDir, expected))}` });
      }
    } else if (ctx.pin) {
      const expected = expectedTarballUrl(name, ctx.pin);
      if (entry.resolved !== expected) ctx.report('r3Resolved', { name, resolved: entry.resolved, expected });
    } else {
      // No pin (reported by R1): the entry must still come from the registry.
      const prefix = `${REGISTRY_URL}@hawiyah/${name}/-/${name}-`;
      const fromRegistry = typeof entry.resolved === 'string' && entry.resolved.startsWith(prefix) && entry.resolved.endsWith('.tgz');
      if (!fromRegistry) {
        ctx.report('r3Resolved', { name, resolved: entry.resolved, expected: expectedTarballUrl(name, '<version>') });
      }
    }
    if (typeof entry.integrity !== 'string' || !entry.integrity.startsWith('sha512-')) {
      ctx.report('r3Integrity', { name, value: entry.integrity });
    }
    for (const field of ['inBundle', 'name']) {
      if (field in entry) ctx.report('r3Field', { name, field });
    }
  }
}

/* ------------------------------------------------------------------ R4 */

export async function ruleR4(ctx) {
  if (!ctx.pin || !ctx.lock) return;
  const lockPackages = ctx.lock.packages ?? {};
  if (ctx.mode === 'preview') {
    for (const name of NAMES) {
      const file = resolve(ctx.previewDir, previewTarballName(name, ctx.pin));
      if (!existsSync(file)) {
        ctx.report('r4PreviewMissing', { file: toPosix(relative(ctx.guideDir, file)) });
        continue;
      }
      const buffer = readFileSync(file);
      const integrity = sha512Integrity(buffer);
      const lockIntegrity = lockPackages[`node_modules/${full(name)}`]?.integrity;
      if (lockIntegrity !== integrity) {
        ctx.report('r4PreviewIntegrity', { name, pin: ctx.pin, a: lockIntegrity, file: basename(file), b: integrity });
      }
      ctx.published.set(name, readTarEntries(buffer));
    }
    return;
  }
  const registry = ctx.registry;
  const results = await Promise.all(NAMES.map(async (name) => {
    const spec = `${full(name)}@${ctx.pin}`;
    try {
      const dist = await registry.view(spec);
      const file = await registry.tarball(spec);
      return { name, dist, buffer: readFileSync(file) };
    } catch (error) {
      return { name, error };
    }
  }));
  const unreachable = results.find((result) => result.error && result.error.kind !== 'not-found');
  if (unreachable) {
    ctx.report('r4Unreachable', { host: registry.host ?? 'registry.npmjs.org', error: unreachable.error.message });
    ctx.registryUnreachable = true;
    return;
  }
  for (const result of results) {
    const { name } = result;
    if (result.error) {
      ctx.report('r4NotPublished', { name, pin: ctx.pin, error: result.error.message });
      continue;
    }
    const expected = expectedTarballUrl(name, ctx.pin);
    if (result.dist.tarball !== expected) ctx.report('r4TarballUrl', { name, pin: ctx.pin, value: result.dist.tarball, expected });
    const lockIntegrity = lockPackages[`node_modules/${full(name)}`]?.integrity;
    if (lockIntegrity !== result.dist.integrity) {
      ctx.report('r4Integrity', { name, pin: ctx.pin, a: lockIntegrity, b: result.dist.integrity });
    }
    const actual = sha512Integrity(result.buffer);
    if (actual !== result.dist.integrity) {
      ctx.report('r4Tarball', { name, pin: ctx.pin, c: actual, b: result.dist.integrity });
      continue;
    }
    ctx.published.set(name, readTarEntries(result.buffer));
  }
}

/* ------------------------------------------------------------------ R5 */

function walkFiles(root, onEntry, prefix = '') {
  for (const dirent of readdirSync(join(root, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${dirent.name}` : dirent.name;
    if (dirent.isDirectory()) {
      if (onEntry(rel, 'directory', dirent.name) !== false) walkFiles(root, onEntry, rel);
    } else {
      onEntry(rel, dirent.isFile() ? 'file' : 'other', dirent.name);
    }
  }
}

/** Installed package directories of node_modules, nested node_modules included. */
function installedPackages(modulesDir, prefix, found) {
  if (!existsSync(modulesDir)) return found;
  for (const dirent of readdirSync(modulesDir, { withFileTypes: true })) {
    if (dirent.name.startsWith('.') || !(dirent.isDirectory() || dirent.isSymbolicLink())) continue;
    const dirs = dirent.name.startsWith('@')
      ? readdirSync(join(modulesDir, dirent.name), { withFileTypes: true })
        .filter((child) => child.isDirectory() || child.isSymbolicLink())
        .map((child) => `${dirent.name}/${child.name}`)
      : [dirent.name];
    for (const dir of dirs) {
      const rel = `${prefix}/${dir}`;
      found.push(rel);
      installedPackages(join(modulesDir, dir, 'node_modules'), `${rel}/node_modules`, found);
    }
  }
  return found;
}

export function ruleR5(ctx) {
  // No @hawiyah package is installed anywhere but at the seven directories.
  const sevenDirs = new Set(NAMES.map((name) => `node_modules/${full(name)}`));
  for (const rel of installedPackages(join(ctx.guideDir, 'node_modules'), 'node_modules', [])) {
    if (sevenDirs.has(rel)) continue;
    let value = null;
    try {
      value = JSON.parse(readFileSync(join(ctx.guideDir, rel, 'package.json'), 'utf8')).name;
    } catch {
      // Not a package: nothing to report here.
    }
    const named = typeof value === 'string' && value.startsWith('@hawiyah/');
    if (named || rel.split('/node_modules/').at(-1).startsWith('@hawiyah/') || rel.startsWith('node_modules/@hawiyah/')) {
      ctx.report('r5Foreign', { path: rel, value: value ?? 'a directory without package.json' });
    }
  }

  const hidden = ctx.hiddenLock?.packages ?? {};
  const lockPackages = ctx.lock?.packages ?? {};
  for (const name of NAMES) {
    const dir = join(ctx.guideDir, 'node_modules', '@hawiyah', name);
    let stat;
    try {
      stat = lstatSync(dir);
    } catch {
      ctx.report('r5NotInstalled', { name });
      continue;
    }
    if (stat.isSymbolicLink()) {
      ctx.report('r5Symlink', { name, target: readlinkSync(dir) });
      continue;
    }
    const real = realpathSync(dir);
    const expectedReal = join(realpathSync(dirname(dir)), name);
    if (real !== expectedReal) ctx.report('r5Realpath', { name, target: real });

    let manifest = {};
    try {
      manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    } catch {
      // A missing package.json is reported by the file comparison below.
    }
    if (manifest.name !== undefined && manifest.name !== full(name)) ctx.report('r5Name', { name, value: manifest.name });
    if (ctx.pin && manifest.version !== ctx.pin) ctx.report('r5Version', { name, v: manifest.version, pin: ctx.pin });

    const key = `node_modules/${full(name)}`;
    const lockIntegrity = lockPackages[key]?.integrity;
    const hiddenIntegrity = hidden[key]?.integrity;
    if (ctx.hiddenLock && lockIntegrity !== hiddenIntegrity) {
      ctx.report('r5HiddenLock', { name, a: hiddenIntegrity, b: lockIntegrity });
    }

    const installed = new Map();
    walkFiles(dir, (rel, type, base) => {
      if (type === 'directory') {
        if (base === 'node_modules') {
          ctx.report('r5NestedModules', { name, file: rel });
          return false;
        }
        return true;
      }
      if (type === 'file') installed.set(rel, sha256(readFileSync(join(dir, rel))));
      else ctx.report('r5Extra', { name, file: rel });
      return undefined;
    });
    ctx.installedCounts.set(name, installed.size);
    const published = ctx.published.get(name);
    if (!published) continue; // R4 has reported why the tarball is not available.
    const expected = new Map(published.map((entry) => [entry.path, entry.sha256]));
    for (const [rel, hash] of [...installed].sort()) {
      if (!expected.has(rel)) ctx.report('r5Extra', { name, file: rel });
      else if (expected.get(rel) !== hash) ctx.report('r5Differs', { name, file: rel });
    }
    for (const rel of [...expected.keys()].sort()) {
      if (!installed.has(rel)) ctx.report('r5Missing', { name, file: rel });
    }
  }
}

/* ------------------------------------------------------------------ R6 */

const SCANNED_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.css', '.html']);
const EXCLUDED_PREFIXES = ['scripts/registry-check/test/', 'scripts/lint/test/fixtures/'];
const SEVEN = NAMES.join('|');
const PACKAGE_PATH = new RegExp(`(?:^|[/:])packages/(?:${SEVEN})(?:[/'"]|$)`);
const APPS_PATH = /(?:^|\.\.\/|file:)apps\//;
const EXAMPLES_PATH = /(?:\.\.\/|file:)examples\//;
const ABSOLUTE_PATH = /(?:^|[\s'"(=,])(?:file:\/\/)?\/(?:home|tmp|Users)\//;
const ALLOWED_OUTSIDE = ['docs/components/', 'docs/guides/', 'components.json', 'LICENSE', 'NOTICE', 'pnpm-workspace.yaml'];
const REPOSITORY_DIRS = /^(?:packages|apps|examples)(?:\/|$)/;

function allowedTarget(target, fileRel) {
  const allowed = [...ALLOWED_OUTSIDE];
  if (fileRel.startsWith('scripts/preview/')) allowed.push('.artifacts/package-check/');
  return allowed.some((entry) => (entry.endsWith('/')
    ? target === entry.slice(0, -1) || target.startsWith(entry)
    : target === entry));
}

const STYLE_LANGUAGES = new Set(['.scss', '.sass', '.less', '.styl', '.stylus', '.pcss', '.postcss']);
const REMOTE = /^(?:https?:)?\/\//i;

/** True when a URL on another host names a @hawiyah package path (esm.sh/@hawiyah/core, ...). */
function remoteHawiyah(value) {
  const urls = String(value).match(/(?:https?:)?\/\/[^\s'"`)]+/gi) ?? [];
  return urls.some((url) => {
    let decoded = url;
    try {
      decoded = decodeURIComponent(url);
    } catch {
      // Keep the raw text.
    }
    return decoded.includes('@hawiyah/');
  });
}

/** Style files of another language under src/ (Angular would compile them). */
export function styleLanguageFiles(guideDir) {
  const files = [];
  if (!existsSync(join(guideDir, 'src'))) return files;
  walkFiles(join(guideDir, 'src'), (rel, type, base) => {
    if (type === 'directory') return base !== 'node_modules' && `src/${rel}` !== 'src/generated';
    if (STYLE_LANGUAGES.has(extname(rel).toLowerCase())) files.push(`src/${rel}`);
    return undefined;
  });
  return files.sort();
}

/** Remote loads and @hawiyah addresses on another host in a file under src/. */
function scanRemote(ctx, fileRel, text) {
  if (!fileRel.startsWith('src/')) return;
  const lines = text.split('\n');
  lines.forEach((content, index) => {
    const line = index + 1;
    if (remoteHawiyah(content)) {
      const value = content.match(/(?:https?:)?\/\/[^\s'"`)]*@hawiyah\/[^\s'"`)]*/i)?.[0] ?? content.trim();
      ctx.report('r6RemoteHawiyah', { file: fileRel, line, value });
    }
    const ext = extname(fileRel);
    const loads = [];
    if (ext === '.html') {
      for (const match of content.matchAll(/<script\b[^>]*\ssrc\s*=\s*["']?([^"'\s>]+)/gi)) loads.push(['a script', match[1]]);
      for (const match of content.matchAll(/<link\b[^>]*>/gi)) {
        const rel = match[0].match(/\srel\s*=\s*["']?([^"'>]+)/i)?.[1] ?? '';
        const href = match[0].match(/\shref\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '';
        if (/\b(?:stylesheet|modulepreload|preload|import)\b/i.test(rel)) loads.push([`a ${rel.trim()}`, href]);
      }
    } else if (ext === '.css') {
      for (const match of content.matchAll(/@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)/gi)) loads.push(['a stylesheet', match[1]]);
    }
    for (const [kind, value] of loads) if (REMOTE.test(value)) ctx.report('r6RemoteLoad', { file: fileRel, line, kind, value });
  });
}

export function scannedFiles(guideDir) {
  const files = [];
  for (const top of ['src', 'scripts']) {
    if (!existsSync(join(guideDir, top))) continue;
    walkFiles(join(guideDir, top), (rel, type, base) => {
      const path = `${top}/${rel}`;
      if (type === 'directory') {
        if (base === 'node_modules') return false;
        return !EXCLUDED_PREFIXES.some((prefix) => `${path}/`.startsWith(prefix));
      }
      if (type === 'file' && SCANNED_EXTENSIONS.has(extname(rel))) files.push(path);
      return undefined;
    });
  }
  return files.sort();
}

function checkString(ctx, fileRel, line, value, kind) {
  const fileAbs = join(ctx.guideDir, fileRel);
  let flagged = false;
  if (kind === 'import' && /^\.\.?\//.test(value)) {
    // A relative import is judged by where it resolves, so the guide's own
    // scripts/examples/ and src/app/examples/ stay importable as '../examples/'.
    const target = toPosix(relative(ctx.repoDir, resolve(dirname(fileAbs), value)));
    flagged = REPOSITORY_DIRS.test(target);
  } else {
    flagged = PACKAGE_PATH.test(value) || APPS_PATH.test(value) || EXAMPLES_PATH.test(value) || ABSOLUTE_PATH.test(value);
  }
  if (flagged) {
    ctx.report('r6Import', { file: fileRel, line, value });
    return;
  }
  const bare = value.startsWith('file:') ? value.slice(5) : value;
  if (!bare.startsWith('../') || bare === '../') return;
  const candidates = [resolve(dirname(fileAbs), bare)];
  if (kind === 'literal') candidates.push(resolve(ctx.guideDir, bare));
  const outside = candidates.every((candidate) => relative(ctx.guideDir, candidate).startsWith('..'));
  if (!outside) return;
  const targets = candidates.map((candidate) => toPosix(relative(ctx.repoDir, candidate)));
  if (targets.some((target) => allowedTarget(target, fileRel))) return;
  ctx.report('r6Outside', { file: fileRel, line, value, target: targets[0] });
}

function scanScript(ctx, fileRel, text) {
  const kind = fileRel.endsWith('x') ? ts.ScriptKind.TSX : (/\.[mc]?ts$/.test(fileRel) ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const source = ts.createSourceFile(fileRel, text, ts.ScriptTarget.Latest, true, kind);
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const imports = new Set();
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      imports.add(node.moduleSpecifier);
    } else if (ts.isCallExpression(node) && node.arguments.length > 0
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      imports.add(node.arguments[0]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      imports.add(node.argument.literal);
    }
    if (ts.isPropertyAssignment(node)) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : '';
      if (name === 'alias' && node.initializer.getText(source).includes('@hawiyah')) {
        ctx.report('r6Alias', { file: fileRel });
      }
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      checkString(ctx, fileRel, lineOf(node), node.text, imports.has(node) ? 'import' : 'literal');
      if (imports.has(node) && fileRel.startsWith('src/') && REMOTE.test(node.text)) {
        ctx.report('r6RemoteLoad', { file: fileRel, line: lineOf(node), kind: 'a module', value: node.text });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

function scanByPattern(ctx, fileRel, text, patterns) {
  const lines = text.split('\n');
  lines.forEach((content, index) => {
    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern)) checkString(ctx, fileRel, index + 1, match[1], 'import');
    }
  });
}

function walkJson(value, visit, trail = []) {
  if (Array.isArray(value)) value.forEach((entry, index) => walkJson(entry, visit, [...trail, index]));
  else if (value && typeof value === 'object') {
    visit(value, trail);
    for (const [key, entry] of Object.entries(value)) walkJson(entry, visit, [...trail, key]);
  } else visit(value, trail);
}

export function ruleR6(ctx) {
  for (const file of styleLanguageFiles(ctx.guideDir)) ctx.report('r6StyleLanguage', { file });
  for (const fileRel of scannedFiles(ctx.guideDir)) {
    const text = readFileSync(join(ctx.guideDir, fileRel), 'utf8');
    const ext = extname(fileRel);
    scanRemote(ctx, fileRel, text);
    if (ext === '.css') {
      scanByPattern(ctx, fileRel, text, [/@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)/g, /url\(\s*['"]?([^'")\s]+)/g]);
    } else if (ext === '.html') {
      scanByPattern(ctx, fileRel, text, [/\s(?:src|href)\s*=\s*["']([^"']+)["']/g]);
    } else {
      scanScript(ctx, fileRel, text);
    }
  }

  // The effective compiler options (extends followed) of every root tsconfig and
  // of every tsconfig that angular.json names.
  const angularFile = join(ctx.guideDir, 'angular.json');
  const angular = existsSync(angularFile) ? JSON.parse(readFileSync(angularFile, 'utf8')) : null;
  const tsconfigs = new Set(readdirSync(ctx.guideDir).filter((entry) => /^tsconfig.*\.json$/.test(entry)));
  if (angular) {
    walkJson(angular, (value, trail) => {
      if (typeof value === 'string' && trail.at(-1) === 'tsConfig') tsconfigs.add(toPosix(relative(ctx.guideDir, resolve(ctx.guideDir, value))));
    });
  }
  for (const file of [...tsconfigs].sort()) {
    const options = effectiveCompilerOptions(join(ctx.guideDir, file));
    if (options.error) {
      ctx.report('r6TsconfigUnreadable', { file, error: options.error });
      continue;
    }
    if (options.paths !== undefined) {
      if (JSON.stringify(options.paths).includes('@hawiyah')) ctx.report('r6Alias', { file });
      else ctx.report('r6TsconfigOption', { file, key: 'paths' });
    }
    if (options.baseUrl !== undefined) ctx.report('r6TsconfigOption', { file, key: 'baseUrl' });
  }

  // package.json subpath imports would alias a vendored copy.
  if (ctx.pkg && Object.hasOwn(ctx.pkg, 'imports')) ctx.report('r6PackageImports', {});

  // A node_modules directory anywhere below guide/ but guide/node_modules is
  // found by module resolution before the installed package.
  for (const dir of nodeModulesDirs(ctx.guideDir)) ctx.report('r6NodeModules', { dir });

  if (angular) {
    walkJson(angular, (value, trail) => {
      const key = trail.at(-1);
      if (value && typeof value === 'object' && !Array.isArray(value) && Object.hasOwn(value, 'fileReplacements')) {
        ctx.report('r6AngularKey', { key: 'fileReplacements' });
      }
      const listKey = trail.at(-2) === 'styles' || trail.at(-2) === 'scripts' ? trail.at(-2)
        : (key === 'input' && (trail.at(-3) === 'styles' || trail.at(-3) === 'scripts') ? trail.at(-3) : null);
      if (listKey && typeof value === 'string' && typeof (key === 'input' ? trail.at(-2) : key) === 'number'
        && !toPosix(value).replace(/^\.\//, '').startsWith('src/')) ctx.report('r6AngularStyle', { key: listKey, value });
      if (typeof value === 'string') {
        if (value.includes('../')) ctx.report('r6AngularParent', { value });
        if (trail.includes('assets') && value.includes('@hawiyah') && typeof trail.at(-1) === 'number'
          && !value.startsWith('node_modules/@hawiyah/')) ctx.report('r6AngularAsset', { value });
      } else if (value && typeof value === 'object' && !Array.isArray(value) && trail.includes('assets')
        && typeof value.input === 'string' && value.input.includes('@hawiyah')
        && !value.input.startsWith('node_modules/@hawiyah/')) {
        ctx.report('r6AngularAsset', { value: value.input });
      }
    });
  }
}

/** Compiler options of a tsconfig with every `extends` applied, or { error }. */
export function effectiveCompilerOptions(file) {
  if (!existsSync(file)) return { error: 'missing' };
  const read = ts.readConfigFile(file, ts.sys.readFile);
  if (read.error) return { error: ts.flattenDiagnosticMessageText(read.error.messageText, ' ') };
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(file), undefined, file);
  const fatal = parsed.errors.find((error) => error.code !== 18003); // 18003: no inputs found
  if (fatal) return { error: ts.flattenDiagnosticMessageText(fatal.messageText, ' ') };
  return parsed.options;
}

const OUTPUT_DIRS = new Set(['node_modules', '.angular', '.cache', 'dist', 'dist-dev', '.git']);

/** node_modules directories below guideDir other than guideDir/node_modules (build output skipped). */
export function nodeModulesDirs(guideDir) {
  const found = [];
  for (const dirent of readdirSync(guideDir, { withFileTypes: true })) {
    if (!dirent.isDirectory() || OUTPUT_DIRS.has(dirent.name)) continue;
    walkFiles(join(guideDir, dirent.name), (rel, type, base) => {
      if (type !== 'directory') return undefined;
      if (base === 'node_modules') {
        found.push(`${dirent.name}/${rel}`);
        return false;
      }
      return true;
    });
  }
  return found.sort();
}

/** HWREG-R6 on what the build resolved: the metafiles of the Angular build and of steps 60 and 62. */
export function ruleR6Resolved(ctx) {
  for (const item of ctx.metafiles ?? []) {
    let metafile = item.metafile;
    if (!metafile) {
      try {
        metafile = JSON.parse(readFileSync(item.file, 'utf8'));
      } catch (error) {
        ctx.report('r6Metafile', { file: item.label, error: existsSync(item.file) ? error.message : 'missing' });
        continue;
      }
    }
    for (const [key, params] of checkMetafile(metafile, { label: item.label, baseDir: item.baseDir ?? ctx.guideDir, guideDir: ctx.guideDir, roots: item.roots })) {
      ctx.report(key, params);
    }
  }
}

/* ------------------------------------------------------------------ R7 */

export async function ruleR7(ctx) {
  const registryValue = await ctx.registry.config('registry');
  if (registryValue !== REGISTRY_URL) ctx.report('r7Registry', { value: registryValue });
  const scope = await ctx.registry.config('@hawiyah:registry');
  if (scope !== 'undefined' && scope !== '') ctx.report('r7Scope', { value: scope });
  const file = join(ctx.guideDir, '.npmrc');
  const lines = existsSync(file)
    ? readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter((line) => line !== '')
    : [];
  for (const line of lines) {
    if (!NPMRC_LINES.includes(line)) ctx.report('r7Line', { line });
  }
  for (const line of NPMRC_LINES) {
    if (!lines.includes(line)) ctx.report('r7MissingLine', { line });
  }
}

/* ------------------------------------------------------------------ R8 */

const RUNTIME_EXEMPT = new Set(['manifest.json', 'import-map.json']);

export function ruleR8(ctx) {
  const runtime = join(ctx.distDir, 'runtime');
  ctx.runtime = { present: false, files: 0 };
  if (!existsSync(runtime)) {
    const runtimeStepExists = existsSync(join(ctx.guideDir, 'scripts', 'build-steps', '60-runtime.mjs'));
    if (ctx.requireRuntime || runtimeStepExists) ctx.report('r8Missing', {});
    return;
  }
  const manifestFile = join(runtime, 'manifest.json');
  if (!existsSync(manifestFile)) {
    ctx.report('r8Missing', {});
    return;
  }
  ctx.runtime.present = true;
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  } catch (error) {
    ctx.report('r8Invalid', { path: 'manifest.json', error: error.message });
    return;
  }
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const listed = new Set();
  const lockPackages = ctx.lock?.packages ?? {};
  for (const entry of entries) {
    const path = typeof entry?.path === 'string' ? entry.path.replace(/^\/+/, '') : '';
    if (!path || path.split('/').includes('..') || typeof entry.sha256 !== 'string') {
      ctx.report('r8Invalid', { path: path || JSON.stringify(entry?.path), error: 'path and sha256 are required' });
      continue;
    }
    listed.add(path);
    const file = join(runtime, path);
    const actual = existsSync(file) && lstatSync(file).isFile() ? sha256(readFileSync(file)) : null;
    if (actual !== entry.sha256) ctx.report('r8Listed', { path });
    const pkgName = entry.sourcePackage ?? entry.package;
    const version = entry.sourceVersion ?? entry.version;
    const integrity = entry.sourceIntegrity ?? entry.packageIntegrity;
    const lockEntry = pkgName ? lockPackages[`node_modules/${pkgName}`] : undefined;
    if (!['published', 'linked', 'bundled'].includes(entry.source) || !pkgName) {
      ctx.report('r8Invalid', { path, error: 'source must be published, linked or bundled, with its package' });
      continue;
    }
    if (!lockEntry || lockEntry.version !== version || lockEntry.integrity !== integrity) {
      ctx.report('r8Derived', { path, pkg: pkgName, v: version, a: integrity, b: lockEntry?.integrity ?? 'no entry' });
    }
    if (entry.source === 'published') {
      const inside = entry.file ?? path;
      const installed = join(ctx.guideDir, 'node_modules', pkgName, inside);
      const installedHash = existsSync(installed) ? sha256(readFileSync(installed)) : null;
      const published = pkgName.startsWith('@hawiyah/') ? ctx.published.get(pkgName.slice(9)) : null;
      const publishedHash = published?.find((item) => item.path === inside)?.sha256;
      if (installedHash !== entry.sha256 || (published && publishedHash !== entry.sha256)) ctx.report('r8Differs', { path });
    }
  }
  walkFiles(runtime, (rel, type) => {
    if (type === 'directory') return true;
    ctx.runtime.files += 1;
    if (!RUNTIME_EXEMPT.has(rel) && !listed.has(rel)) ctx.report('r8Unlisted', { path: rel });
    return undefined;
  });
}

/* ------------------------------------------------------------------ R9 */

export function ruleR9(ctx) {
  const file = join(ctx.repoDir, 'pnpm-workspace.yaml');
  if (!existsSync(file)) return;
  const workspace = parseYaml(readFileSync(file, 'utf8')) ?? {};
  const guide = toPosix(relative(ctx.repoDir, ctx.guideDir));
  for (const glob of Array.isArray(workspace.packages) ? workspace.packages : []) {
    const pattern = String(glob);
    if (pattern.startsWith('!')) continue;
    const normalised = pattern.replace(/^\.\//, '').replace(/\/+$/, '');
    if (normalised && (matchesGlob(guide, normalised) || matchesGlob(`${guide}/package.json`, `${normalised}/package.json`))) {
      ctx.report('r9Glob', { glob: pattern });
    }
  }
}
