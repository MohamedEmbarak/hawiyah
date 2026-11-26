// The pages generated from the installed packages (build step 32): the brand page and
// the foundations page, written per language to src/generated/package-pages/<page>.<lang>.json.
// Everything they show is read from the installed packages:
//
//   brand        the wordmark files of @hawiyah/styles (dist/assets/hawiyah-wordmark*.svg: the
//                plain and the mono file for light surfaces, the reverse and the white file for
//                dark surfaces), the loader the README names (hawiyah-loader.gif, and
//                hawiyah-loader-white.gif for the dark mode) in the markup of .hw-brand-loader of
//                dist/brand-loader.css, and the section "Self-contained branding assets" of the
//                README as the usage notes (English, as the README writes it);
//   foundations  the tokens of @hawiyah/tokens (its exports tokens, themes and tokenNames): the
//                colours of the default theme in the light and the dark mode, and spacing, type
//                (font, text, weight, leading), radius and motion (duration, ease), and the icons of
//                @hawiyah/styles (dist/assets/icons/provenance.json).
//
// Headings, the introduction, captions and column headers are the guide's text
// (src/app/i18n/package-pages.json). The files a page shows are served from brand/ by the
// asset entry of angular.json; a file the entry does not copy fails the step.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { codeBlock } from '../content/model.mjs';

export const PACKAGE_PAGES = ['brand', 'foundations'];
const LANGS = ['ar', 'en'];
const DIRECTION = { ar: 'rtl', en: 'ltr' };
/** The README section whose text is the usage notes of the brand page. */
export const BRAND_SECTION = 'Self-contained branding assets';
/** The loader files the README names, for the light and the dark mode. */
export const LOADER_FILES = { light: 'hawiyah-loader.gif', dark: 'hawiyah-loader-white.gif' };
/** The static wordmark shown in place of a loader under reduced motion, per mode. */
export const STATIC_FILES = { light: 'hawiyah-wordmark.svg', dark: 'hawiyah-wordmark-white.svg' };

const text = (value) => ({ type: 'text', value });
const code = (value) => ({ type: 'inlineCode', value: String(value) });
/** Inline nodes of a text of package-pages.json: a name between backticks is code (a package name). */
export const codeSpans = (value) => String(value).split('`').map((part, index) => (index % 2 ? code(part) : text(part))).filter((node) => node.value !== '');

/** The wordmark files of the installed @hawiyah/styles by surface: { light: [file], dark: [file] }. */
export function wordmarkFiles(assetsDir) {
  // The plain file first, then mono; reverse, then white.
  const rank = (name) => ['hawiyah-wordmark.svg', 'hawiyah-wordmark-mono.svg', 'hawiyah-wordmark-reverse.svg', 'hawiyah-wordmark-white.svg'].indexOf(name);
  const files = readdirSync(assetsDir).filter((name) => /^hawiyah-wordmark(?:-(?:reverse|mono|white))?\.svg$/.test(name)).sort((a, b) => rank(a) - rank(b));
  if (!files.includes('hawiyah-wordmark.svg')) throw new Error(`package-pages: ${assetsDir} has no hawiyah-wordmark.svg`);
  return {
    light: files.filter((name) => !/-(?:reverse|white)\.svg$/.test(name)),
    dark: files.filter((name) => /-(?:reverse|white)\.svg$/.test(name)),
  };
}

/** The text of the h2 section of a README (from its heading to the next h2), or null. */
export function readmeSection(readme, heading) {
  const lines = readme.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n').trim();
}

/** Inline nodes of a README paragraph: text, code, emphasis; a link keeps its text only (its target is a file of the package's repository). */
function inlines(nodes = []) {
  const out = [];
  for (const node of nodes) {
    if (node.type === 'text') out.push(text(node.value));
    else if (node.type === 'inlineCode') out.push(code(node.value));
    else if (node.type === 'strong' || node.type === 'emphasis') out.push({ type: node.type, children: inlines(node.children) });
    else if (node.type === 'break') out.push({ type: 'break' });
    else if (node.children) out.push(...inlines(node.children));
  }
  return out;
}

/** The blocks of a README section: paragraphs and code listings. */
export function readmeBlocks(markdown) {
  const tree = fromMarkdown(markdown);
  const blocks = [];
  for (const node of tree.children) {
    if (node.type === 'paragraph') blocks.push({ type: 'paragraph', children: inlines(node.children) });
    else if (node.type === 'code') blocks.push(codeBlock(node));
    else if (node.type === 'list') blocks.push({ type: 'list', ordered: Boolean(node.ordered), start: node.ordered ? (node.start ?? 1) : null, items: node.children.map((item) => item.children.filter((child) => child.type === 'paragraph').map((child) => ({ type: 'paragraph', children: inlines(child.children) }))) });
  }
  return blocks;
}

/** The brace list of the asset entry of angular.json that copies @hawiyah/styles assets to brand/. */
export function servedBrandFiles(angularJson) {
  const project = Object.values(angularJson.projects ?? {})[0];
  const assets = project?.architect?.build?.options?.assets ?? [];
  const entry = assets.find((item) => typeof item === 'object' && item.output === 'brand' && String(item.input).includes('@hawiyah/styles'));
  const glob = /^\{([^}]*)\}$/.exec(entry?.glob ?? '')?.[1];
  return new Set(glob ? glob.split(',').map((name) => name.trim()) : entry?.glob ? [entry.glob] : []);
}

const section = (id, title, blocks, extra = {}) => ({ id, level: 2, title: [text(title)], blocks, ...extra });

function pageModel(id, lang, texts, sections, data) {
  return {
    id,
    lang,
    dir: DIRECTION[lang],
    title: texts.title[lang],
    summary: codeSpans(texts.intro[lang]),
    headings: sections.map((item) => ({ id: item.id, level: 2, text: item.title[0].value })),
    sections,
    ...data,
  };
}

/** The brand page of a language. */
export function brandPage(lang, texts, { assetsDir, readme, version, served }) {
  const files = wordmarkFiles(assetsDir);
  const used = [...files.light, ...files.dark, ...Object.values(LOADER_FILES), ...Object.values(STATIC_FILES)];
  for (const name of used) {
    if (!existsSync(join(assetsDir, name))) throw new Error(`package-pages: the installed @hawiyah/styles has no dist/assets/${name}`);
    if (!served.has(name)) throw new Error(`package-pages: angular.json does not copy ${name} to brand/; add it to the brace list of the asset entry of @hawiyah/styles`);
  }
  const notes = readmeSection(readme, BRAND_SECTION);
  if (!notes) throw new Error(`package-pages: the README of the installed @hawiyah/styles has no section "${BRAND_SECTION}"`);
  const t = texts.brand;
  const sections = [
    section('wordmark', t.sections.wordmark[lang], []),
    section('loader', t.sections.loader[lang], []),
    section('usage', t.sections.usage[lang], []),
  ];
  return pageModel('brand', lang, t, sections, {
    brand: {
      wordmarks: Object.fromEntries(Object.entries(files).map(([surface, list]) => [surface, list.map((name) => ({ file: name, src: `brand/${name}` }))])),
      loader: Object.fromEntries(Object.keys(LOADER_FILES).map((mode) => [mode, { motion: `brand/${LOADER_FILES[mode]}`, still: `brand/${STATIC_FILES[mode]}` }])),
      notes: readmeBlocks(notes),
      source: { package: '@hawiyah/styles', version, section: BRAND_SECTION },
      labels: Object.fromEntries(Object.entries(t.labels).map(([key, value]) => [key, value[lang]])),
    },
  });
}

/** A table block of tokens: a name column and one value column per mode given. */
function tokenTable(caption, labels, rows, modes) {
  const columns = [{ key: 'c0', label: [text(labels.token)], align: null }, ...modes.map((mode, index) => ({ key: `c${index + 1}`, label: [text(labels[mode])], align: null }))];
  return {
    type: 'table',
    caption,
    columns,
    rows: rows.map((row) => Object.fromEntries([['c0', [code(row.name)]], ...modes.map((mode, index) => [`c${index + 1}`, [code(row[mode])]])])),
  };
}

/** The rows of token groups: [{ name, value }] in the order of the package. */
function rowsOf(tokens, names, groups) {
  return groups.flatMap((group) => Object.entries(tokens[group]).map(([key, value]) => ({ name: names[group][key], value })));
}

/** The foundations page of a language. */
export function foundationsPage(lang, texts, { tokens, provenance }) {
  const t = texts.foundations;
  const labels = Object.fromEntries(Object.entries(t.labels).map(([key, value]) => [key, value[lang]]));
  const theme = tokens.themes.dga;
  if (!theme?.light?.color || !theme?.dark?.color) throw new Error('package-pages: @hawiyah/tokens exports no light and dark colours of the default theme dga');
  const colour = Object.keys(theme.light.color).map((key) => ({ name: tokens.tokenNames.color[key], light: theme.light.color[key], dark: theme.dark.color[key] }));
  const missing = colour.filter((row) => !row.name || row.dark === undefined);
  if (missing.length) throw new Error(`package-pages: colour tokens without a name or a dark value: ${missing.map((row) => row.name ?? '?').join(', ')}`);
  const groups = { spacing: ['space'], type: ['font', 'text', 'weight', 'leading'], radius: ['radius'], motion: ['duration', 'ease'] };
  const caption = (id) => `${labels.caption}: ${t.sections[id][lang]}`;
  const modeless = { type: 'paragraph', children: [text(labels.modeless)] };
  const sections = [
    section('colour', t.sections.colour[lang], [tokenTable(caption('colour'), labels, colour, ['light', 'dark'])]),
    ...Object.entries(groups).map(([id, list]) => section(id, t.sections[id][lang], [modeless, tokenTable(caption(id), labels, rowsOf(tokens.tokens, tokens.tokenNames, list), ['value'])])),
    section('icons', t.sections.icons[lang], []),
  ];
  return pageModel('foundations', lang, t, sections, {
    icons: { label: labels.icons, names: provenance.icons.map((icon) => icon.name).sort() },
    counts: { colour: colour.length, ...Object.fromEntries(Object.entries(groups).map(([id, list]) => [id, rowsOf(tokens.tokens, tokens.tokenNames, list).length])), icons: provenance.icons.length },
  });
}

/**
 * Writes src/generated/package-pages/<page>.<lang>.json for both pages and languages.
 * @param {{ guideDir: string, generatedDir: string }} options
 */
export async function writePackagePages({ guideDir, generatedDir }) {
  const nodeModules = join(guideDir, 'node_modules');
  const styles = join(nodeModules, '@hawiyah', 'styles');
  const texts = JSON.parse(readFileSync(join(guideDir, 'src', 'app', 'i18n', 'package-pages.json'), 'utf8'));
  // The installed @hawiyah/tokens of guide/node_modules (an ES module package: imported, not required).
  const tokens = await import('@hawiyah/tokens');
  const provenance = JSON.parse(readFileSync(join(styles, 'dist', 'assets', 'icons', 'provenance.json'), 'utf8'));
  const readme = readFileSync(join(styles, 'README.md'), 'utf8');
  const version = JSON.parse(readFileSync(join(styles, 'package.json'), 'utf8')).version;
  const served = servedBrandFiles(JSON.parse(readFileSync(join(guideDir, 'angular.json'), 'utf8')));
  const out = join(generatedDir, 'package-pages');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const written = {};
  for (const lang of LANGS) {
    const brand = brandPage(lang, texts, { assetsDir: join(styles, 'dist', 'assets'), readme, version, served });
    const foundations = foundationsPage(lang, texts, { tokens, provenance });
    for (const page of [brand, foundations]) writeFileSync(join(out, `${page.id}.${lang}.json`), `${JSON.stringify(page, null, 2)}\n`);
    written[lang] = { brand, foundations };
  }
  return written.en;
}
