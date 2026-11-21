// Icon and text guards (review finding R1[6], fix plan item 7), run by build
// step 72 over the prerendered pages and over the guide's own templates and
// text sources:
//   HWP-ICON   every data-icon value of a prerendered page has a rule in the
//              installed @hawiyah/styles stylesheet (the packaged icon set);
//   HWP-SVG    no <svg> element in a prerendered page or a guide template;
//   HWP-FONT   no icon-font class (fa-*, material-icons, bi-*, glyphicon, ...);
//   HWP-EMOJI  no emoji in a prerendered page or a template or text source;
//   HWP-LATIN  on an Arabic page, no run of four or more Latin-script words in
//              reader text outside code, kbd, pre, samp and elements that carry
//              their own non-Arabic lang (a hyphenated word counts as its parts
//              unless it is an hw- name or a name of vocabulary-allow.json), unless
//              latin-allowlist.json lists the
//              whole run (12 characters at least) with a reason.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'parse5';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const toPosix = (value) => value.split(sep).join('/');

/** Characters that render as emoji (default emoji presentation, or followed by VS16). */
export const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u;
const ICON_FONT_CLASS = /^(?:fa|fas|far|fab|fal|fad|fa-[\w-]+|material-icons(?:-[\w-]+)?|material-symbols(?:-[\w-]+)?|bi|bi-[\w-]+|glyphicon(?:-[\w-]+)?|icon-[\w-]+|ion-[\w-]+|ionicons|mdi|mdi-[\w-]+|codicon(?:-[\w-]+)?|ti|ti-[\w-]+|feather(?:-[\w-]+)?)$/;
/**
 * Four or more Latin-script words in a row, separated by spaces or light
 * punctuation (G15 of the 5a fix round). A hyphen joins the parts of one word only
 * when the hyphenated word is a name: an hw- name (hw-mobile-top-bar, the element of
 * a generated API table caption) or a hyphenated name of vocabulary-allow.json
 * (aria-label, v-model). Any other hyphenated word counts as its parts
 * (the-request-is-approved is four words), and a hyphen next to a space separates.
 */
const LATIN_WORD = /\p{Script=Latin}[\p{Script=Latin}\p{M}'’]*(?:-+\p{Script=Latin}[\p{Script=Latin}\p{M}'’]*)*/gu;
const SEPARATOR = /^[-–—]*[\s,;:()/"“”–—][\s,;:()/"“”–—-]*$/;
const MIN_WORDS = 4;
let allowNames = null;
/** Hyphenated names that count as one word: hw- names and the names of vocabulary-allow.json. */
function isHyphenatedName(word) {
  if (/^hw-[a-z0-9-]+$/.test(word)) return true;
  allowNames ??= new Set(JSON.parse(readFileSync(new URL('../api-tables/vocabulary-allow.json', import.meta.url), 'utf8')).groups.flatMap((group) => group.names));
  return allowNames.has(word);
}
const wordCount = (word) => (word.includes('-') && !isHyphenatedName(word) ? word.split(/-+/).filter(Boolean).length : 1);

/** The runs of four or more Latin-script words in a text (HWP-LATIN). */
export function latinRuns(text) {
  const runs = [];
  let run = null;
  for (const match of text.matchAll(LATIN_WORD)) {
    const word = { from: match.index, to: match.index + match[0].length, count: wordCount(match[0]) };
    if (run && SEPARATOR.test(text.slice(run.to, word.from))) {
      run.to = word.to;
      run.count += word.count;
    } else {
      if (run && run.count >= MIN_WORDS) runs.push(text.slice(run.from, run.to).trim());
      run = { ...word };
    }
  }
  if (run && run.count >= MIN_WORDS) runs.push(text.slice(run.from, run.to).trim());
  return runs;
}
const SKIP_TEXT = new Set(['code', 'kbd', 'pre', 'samp', 'script', 'style', 'template', 'svg', 'math']);
const TEXT_ATTRIBUTES = ['aria-label', 'aria-description', 'aria-roledescription', 'title', 'alt', 'placeholder'];

/** The data-icon values that the packaged stylesheet styles. */
export function iconRules(css) {
  const icons = new Set();
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    try {
      selectorParser((selectors) => {
        selectors.walkAttributes((node) => {
          if (node.attribute === 'data-icon' && node.operator === '=' && node.value) icons.add(node.value);
        });
      }).processSync(rule.selector);
    } catch {
      // A selector postcss-selector-parser cannot read names no icon.
    }
  });
  return icons;
}

function htmlFiles(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'runtime' && name !== 'examples') htmlFiles(path, base, out);
    } else if (name.endsWith('.html')) out.push(toPosix(relative(base, path)));
  }
  return out;
}

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;

function lineOf(node) {
  return node.sourceCodeLocation?.startLine ?? 1;
}

/** Whether `run` on `page` is covered by an allow-list entry: the entry names the whole run (G13 of the 5a fix round). */
function allowed(allowlist, page, run) {
  return allowlist.some((entry) => run === entry.text && (!entry.pages || entry.pages.includes(page)));
}

/** The shortest text an allow-list entry may name. */
export const MIN_ALLOWLIST_TEXT = 12;

/** Checks one prerendered document. Returns findings { code, file, line, message }. */
export function checkPage(file, html, { icons, allowlist = [], used = new Set() }) {
  const findings = [];
  const document = parse(html, { sourceCodeLocationInfo: true });
  const htmlElement = document.childNodes.find((node) => node.nodeName === 'html');
  const arabic = (attr(htmlElement ?? {}, 'lang') ?? '').toLowerCase().startsWith('ar');
  const push = (code, node, message) => findings.push({ code, file, line: lineOf(node), message });

  const latin = (node, text, where) => {
    for (const run of latinRuns(text)) {
      if (allowed(allowlist, file, run)) {
        used.add(run);
        continue;
      }
      push('HWP-LATIN', node, `${where} has the Latin-script run "${run.slice(0, 80)}" on an Arabic page; write it in Arabic, mark it with lang, or list it in latin-allowlist.json with a reason`);
    }
  };

  const visit = (node, skipText) => {
    if (node.nodeName === '#text') {
      if (EMOJI.test(node.value)) push('HWP-EMOJI', node, `text contains an emoji: "${node.value.trim().slice(0, 40)}"`);
      if (arabic && !skipText) latin(node, node.value, 'text');
      return;
    }
    if (!node.tagName) {
      for (const child of node.childNodes ?? []) visit(child, skipText);
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === 'svg') push('HWP-SVG', node, '<svg> element; icons come from the packaged set through data-icon');
    const icon = attr(node, 'data-icon');
    if (icon !== undefined && !icons.has(icon)) push('HWP-ICON', node, `data-icon="${icon}" has no rule in @hawiyah/styles`);
    for (const name of (attr(node, 'class') ?? '').split(/\s+/).filter(Boolean)) {
      if (ICON_FONT_CLASS.test(name)) push('HWP-FONT', node, `class "${name}" is an icon-font class`);
    }
    const lang = node === htmlElement ? undefined : attr(node, 'lang');
    const skip = skipText || SKIP_TEXT.has(tag) || (lang !== undefined && !lang.toLowerCase().startsWith('ar'));
    for (const name of TEXT_ATTRIBUTES) {
      const value = attr(node, name);
      if (value === undefined) continue;
      if (EMOJI.test(value)) push('HWP-EMOJI', node, `${name} contains an emoji`);
      if (arabic && !skip) latin(node, value, `${name}`);
    }
    if (tag === 'meta' && attr(node, 'name') === 'description' && arabic) latin(node, attr(node, 'content') ?? '', 'meta description');
    for (const child of node.childNodes ?? []) visit(child, skip);
    if (node.content) visit(node.content, true);
  };
  visit(document, false);
  return findings;
}

/** Template and text sources of the guide: no <svg>, icon-font class or emoji. */
export function checkSources(guideDir) {
  const findings = [];
  const walk = (rel) => {
    for (const dirent of readdirSync(join(guideDir, rel), { withFileTypes: true })) {
      const path = `${rel}/${dirent.name}`;
      if (dirent.isDirectory()) {
        if (path !== 'src/generated' && dirent.name !== 'node_modules') walk(path);
      } else if (/\.(?:ts|html)$/.test(dirent.name) && !dirent.name.endsWith('.spec.ts')) {
        const lines = readFileSync(join(guideDir, path), 'utf8').split('\n');
        lines.forEach((line, index) => {
          if (/<svg\b/i.test(line)) findings.push({ code: 'HWP-SVG', file: path, line: index + 1, message: '<svg> in a template; icons come from the packaged set through data-icon' });
          if (EMOJI.test(line)) findings.push({ code: 'HWP-EMOJI', file: path, line: index + 1, message: 'emoji in a template or text source' });
          for (const match of line.matchAll(/class\s*=\s*["']([^"']*)["']/g)) {
            for (const name of match[1].split(/\s+/).filter(Boolean)) {
              if (ICON_FONT_CLASS.test(name)) findings.push({ code: 'HWP-FONT', file: path, line: index + 1, message: `class "${name}" is an icon-font class` });
            }
          }
        });
      }
    }
  };
  if (existsSync(join(guideDir, 'src'))) walk('src');
  return findings;
}

/**
 * Reads latin-allowlist.json and validates it: [{ text, reason, approvedBy, pages? }]. The list is the
 * lead's (leadAmendments A4 of milestone 5; scripts/api-tables/lists.mjs caps the entries per page).
 */
export function readAllowlist(file) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error(`${file} must be an array`);
  for (const [index, entry] of list.entries()) {
    const keys = Object.keys(entry ?? {});
    const filled = (value) => typeof value === 'string' && value.trim() !== '';
    if (!filled(entry?.text) || !filled(entry.reason) || !filled(entry.approvedBy)
      || keys.some((key) => !['text', 'reason', 'approvedBy', 'pages'].includes(key))
      || (entry.pages !== undefined && (!Array.isArray(entry.pages) || entry.pages.some((page) => typeof page !== 'string')))) {
      throw new Error(`${file} entry ${index} must be { text, reason, approvedBy, pages? } with non-empty text, reason and approvedBy`);
    }
    if (entry.text.trim().length < MIN_ALLOWLIST_TEXT) throw new Error(`${file} entry ${index}: the text "${entry.text}" is shorter than ${MIN_ALLOWLIST_TEXT} characters; an entry names the whole run it allows`);
  }
  return list;
}

/** Runs every guard over <browserDir> and the guide sources. */
export function runGuards({ guideDir, browserDir, allowlistFile }) {
  const icons = iconRules(readFileSync(join(guideDir, 'node_modules', '@hawiyah', 'styles', 'dist', 'styles.css'), 'utf8'));
  const allowlist = readAllowlist(allowlistFile);
  const used = new Set();
  const pages = htmlFiles(browserDir);
  const findings = [];
  for (const page of pages) findings.push(...checkPage(page, readFileSync(join(browserDir, page), 'utf8'), { icons, allowlist, used }));
  findings.push(...checkSources(guideDir));
  // An entry that no run matches has outlived its reason.
  for (const entry of allowlist) {
    if (![...used].some((run) => run === entry.text)) {
      findings.push({ code: 'HWP-LATIN', file: toPosix(relative(guideDir, allowlistFile)), line: 1, message: `allow-list entry "${entry.text}" matches no run; remove it` });
    }
  }
  return { pages: pages.length, icons: icons.size, allowlist: allowlist.length, findings };
}
