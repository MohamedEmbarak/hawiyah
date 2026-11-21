// Cheap gates on the text of a page (fix round of stage 5a, items G2 and G3).
// They prove that a page is not hollow, not a placeholder, not a page of another
// component and free of a small set of words; they do not prove that a sentence is
// true (that is the reviewer's reading, docs/components/README.md).
//
//   HWC-CLAIM  outside the compliance sentence, the text says that Hawiyah or a
//              component is certified, accredited, endorsed, approved, licensed,
//              official, conformant, or meant for government platforms (in English
//              or Arabic); a negated form passes only through an entry of
//              claim-exceptions.json (the lead's list).
//   HWC-EMPTY  a required section without a paragraph or list of its own beyond
//              the fixed text (captions, the generated note, the compliance
//              sentence), and an API h3 without prose after its table.
//   HWC-TODO   TODO, TBD, FIXME, lorem ipsum, or the placeholder text of
//              content:scaffold-ar --placeholder (the latter is accepted only in a
//              page read from outside docs/components, its documented use).
//   HWC-TONE   a term of marketing-terms.json (the lead's list).
//   HWC-LIVE7  a live group that does not contain the page's component: one of its
//              classes (components.json cssClasses) or its data-hw hook in the html
//              block, its export (React, Vue) or its selector or class (Angular) in
//              the other three; a group that legitimately does not is an entry of
//              live-component-exceptions.json (the lead's list).
//   HWC-MD     an install command or a @hawiyah/<name>@<version> in running text, as
//              in a code listing (structure.mjs).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { targetsFor } from '../api-tables/targets.mjs';
import { finding } from './config.mjs';

const lineOf = (node) => node?.position?.start.line ?? 1;
const json = (name) => JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

/** Arabic text without diacritics and tatweel, so that inflected and vowelled forms match one pattern. */
export function normaliseArabic(text) {
  return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
}

/**
 * Claims a page may not make (G2). English is matched without case; Arabic after
 * normaliseArabic(). Each pattern names a status Hawiyah does not have.
 */
export const CLAIM_PATTERNS = {
  en: [
    /\bcertif(?:y|ies|ied|ying|icate|icates|ication|ications)\b/i,
    /\baccredit\w*/i,
    /\bendors(?:e|ed|es|ing|ement|ements)\b/i,
    /\bapprov(?:ed|al|als)\b/i,
    /\blicen[cs]ed\b/i,
    /\bofficially\b/i,
    /\b(?:is|are|was|were|be|been|being|as|becomes?)\s+(?:an?\s+|the\s+)?official\b/i,
    /\bofficial\s+(?:DGA|Digital Government|government|Hawiyah|component|components|product|products|library|implementation|version|release|status|standard|design system|partner)\b/i,
    /\bfor\s+(?:use\s+(?:by|in|on)\s+)?(?:the\s+)?(?:saudi\s+)?government\b/i,
    /\bgovernment[-\s](?:platforms?|agencies|entities|bodies|use)\b/i,
    /\bconform(?:s|ed|ing|ant|ance|ity)?\b/i,
    /\bcompl(?:iant|ies)\b/i,
  ],
  ar: [
    /معتمد/,
    /مصدق|مصادق عليه/,
    /مرخص/,
    /شهاد(?:ة|ات)/,
    /رسميا|بصفة رسمية/,
    /رسمية?\s+(?:لل?هيئة|من\s+(?:ال)?هيئة)/,
    /(?:منتج|منتجات|مكون|مكونات|مكتبة|إصدار|اصدار|نسخة|تطبيق|معيار|شريك)\s+(?:ال)?رسمي/,
    /(?:^|[^\u0621-\u064A])و?لل?(?:منصات|منصة|جهات|جهة|هيئات|قطاع|قطاعات|استخدام|مواقع)\s+(?:ال)?حكومي/,
    /(?:مطابق|متوافق|ممتثل)\S*\s+(?:مع\s+|ل)(?:ال)?(?:كود المنصات|معايير|إرشادات|WCAG)/,
  ],
};

/** Placeholder text (G3): never in a page of docs/components. */
const PLACEHOLDER = [/\bTODO\b/, /\bTBD\b/, /\bFIXME\b/, /\blorem\s+ipsum\b/i, /قيد الكتابة/];
/** The placeholder sentence of content:scaffold-ar --placeholder (any wording that starts «نص مؤقت»). */
const SCAFFOLD_PLACEHOLDER = /نص مؤقت/;
/** An install command or a pinned package address in running text (G3). */
const INSTALL_IN_TEXT = /\b(?:npm\s+(?:install|i|ci|add)|pnpm\s+(?:add|install|i)|yarn\s+add|bun\s+add|npx\s+jsr\s+add)\s|@hawiyah\/[a-z-]+@\S/;

/** The lead's lists of this module, each entry with approvedBy and a reason. */
export const CLAIM_EXCEPTIONS_FILE = new URL('./claim-exceptions.json', import.meta.url);
export const LIVE_COMPONENT_EXCEPTIONS_FILE = new URL('./live-component-exceptions.json', import.meta.url);
export const MARKETING_TERMS_FILE = new URL('./marketing-terms.json', import.meta.url);

const filled = (value) => typeof value === 'string' && value.trim() !== '';
function readList(file, keys, name) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error(`${name} must hold an array`);
  list.forEach((entry, index) => {
    const own = Object.keys(entry ?? {}).sort();
    if (own.join(',') !== [...keys].sort().join(',') || own.some((key) => !filled(entry[key]))) {
      throw new Error(`${name} entry ${index + 1} must be { ${keys.join(', ')} } with non-empty values`);
    }
  });
  return list;
}
export const readClaimExceptions = (file = CLAIM_EXCEPTIONS_FILE) => readList(file, ['file', 'text', 'reason', 'approvedBy'], 'claim-exceptions.json');
export const readLiveComponentExceptions = (file = LIVE_COMPONENT_EXCEPTIONS_FILE) => readList(file, ['file', 'example', 'reason', 'approvedBy'], 'live-component-exceptions.json');
export const readMarketingTerms = (file = MARKETING_TERMS_FILE) => readList(file, ['lang', 'term', 'reason', 'approvedBy'], 'marketing-terms.json');

/** The text a reader reads in an inline node: text, emphasis, strong, link text; no inline code and no key element. */
function readerText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.type === 'inlineCode' || node.type === 'kbd') return ' ';
  if (node.type === 'break') return ' ';
  return (node.children ?? []).map(readerText).join('');
}
/** The text of an inline node with inline code kept (an install command written as code is still running text). */
function fullText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'kbd' || node.type === 'break') return ' ';
  return (node.children ?? []).map(fullText).join('');
}

/** Every paragraph, heading and table cell of a page (in lists, alerts and tables too), in document order. */
export function textUnits(tree) {
  const units = [];
  const visit = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'paragraph' || child.type === 'heading' || child.type === 'tableCell') {
        const text = readerText(child).replace(/^\[![A-Za-z]+\]/, '').replace(/\s+/g, ' ').trim();
        units.push({ node: child, line: lineOf(child), text, full: fullText(child).replace(/\s+/g, ' ').trim() });
      } else visit(child);
    }
  };
  visit(tree);
  return units;
}

/**
 * HWC-CLAIM, HWC-TODO, HWC-TONE and the install command in running text (HWC-MD) of one page.
 * @param {{ tree: any, groups: any[], lang: 'en'|'ar', file: string, compliance: string,
 *           claimExceptions: any[], marketing: any[], placeholderAllowed: boolean, used: Set<any> }} page
 */
export function textFindings(page) {
  const { tree, groups, lang, file, compliance, claimExceptions, marketing, placeholderAllowed, used } = page;
  const findings = [];
  const push = (code, line, message) => findings.push(finding(code, file, line, message));
  const norm = lang === 'ar' ? normaliseArabic : (text) => text;
  const terms = marketing.filter((entry) => entry.lang === lang).map((entry) => ({ entry, pattern: termPattern(norm(entry.term), lang) }));
  for (const unit of textUnits(tree)) {
    const text = norm(unit.text.split(compliance).join(' '));
    for (const pattern of CLAIM_PATTERNS[lang]) {
      const match = pattern.exec(text);
      if (!match) continue;
      const entry = claimExceptions.find((item) => item.file === file && item.text === unit.full);
      if (entry) {
        used.add(entry);
        break;
      }
      push('HWC-CLAIM', unit.line, `"${match[0]}" claims a status Hawiyah does not have: outside the compliance sentence a page does not say that Hawiyah or a component is certified, accredited, endorsed, approved, licensed, official, conformant or meant for government platforms; state the evidence instead (a negated form is an entry of scripts/content/claim-exceptions.json, the lead's list)`);
      break;
    }
    for (const pattern of PLACEHOLDER) {
      const match = pattern.exec(unit.text);
      if (match) push('HWC-TODO', unit.line, `"${match[0]}" is placeholder text; write the section`);
    }
    if (!placeholderAllowed && SCAFFOLD_PLACEHOLDER.test(unit.text)) push('HWC-TODO', unit.line, 'the text is the placeholder of content:scaffold-ar --placeholder, which only a copy outside docs/components may hold; translate it');
    for (const { entry, pattern } of terms) {
      const match = pattern.exec(text);
      if (match) push('HWC-TONE', unit.line, `"${match[0]}" is marketing language (scripts/content/marketing-terms.json: ${entry.term}); write in a formal register and state what the component does`);
    }
    const install = INSTALL_IN_TEXT.exec(unit.full);
    if (install) push('HWC-MD', unit.line, `"${install[0].trim()}" is an install command or a pinned package address in running text; the guide generates install text from the pinned version (install.json)`);
  }
  if (!placeholderAllowed) {
    for (const group of groups) {
      for (const block of Object.values(group.blocks)) {
        if (SCAFFOLD_PLACEHOLDER.test(block.code)) push('HWC-TODO', block.line, `the live block "${group.example}" holds the placeholder of content:scaffold-ar --placeholder, which only a copy outside docs/components may hold; translate it`);
      }
    }
  }
  return findings;
}

/** A term matched at the start of a word (English: also its inflections, delight -> delightful). */
function termPattern(term, lang) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-\s]+/g, '[-\\s]+');
  return lang === 'en' ? new RegExp(`\\b${escaped}`, 'i') : new RegExp(`(?<![\\u0621-\\u064A])(?:و|ب|ل|ال|وال|بال)?${escaped}`);
}

/**
 * HWC-EMPTY of one page: every required section has a paragraph or a list of its
 * own beyond the fixed text, and every API h3 has prose after its table.
 * A paragraph or list counts when it stands in the section itself (not in an alert,
 * so the generated note never counts) and is not a caption.
 * @param {{ outline: any, file: string, compliance: string, isCaption: (node: any) => boolean, required: Set<string> }} page
 */
export function emptyFindings({ outline, file, compliance, isCaption, required }) {
  const findings = [];
  const own = (node) => (node.type === 'list') || (node.type === 'paragraph' && !isCaption(node)
    && /[\p{L}\p{N}]/u.test(readerText(node).split(compliance).join(' ')));
  for (const section of outline.sections) {
    if (!section.id || !required.has(section.id)) continue;
    if (!section.children.some(own)) {
      findings.push(finding('HWC-EMPTY', file, lineOf(section.node), `the section "${section.text}" has no paragraph or list of its own beyond the fixed text (captions, the generated note, the compliance sentence); write it`));
    }
    if (section.id !== 'api') continue;
    section.children.forEach((node, index) => {
      if (node.type !== 'heading' || node.depth !== 3) return;
      const next = section.children.findIndex((item, i) => i > index && item.type === 'heading' && item.depth <= 3);
      const body = section.children.slice(index + 1, next < 0 ? undefined : next);
      const table = body.findIndex((item) => item.type === 'table');
      if (table < 0) return;
      if (!body.slice(table + 1).some(own)) {
        findings.push(finding('HWC-EMPTY', file, lineOf(node), `the ${readerText(node).trim()} table has no prose after it; describe its members after the table`));
      }
    });
  }
  return findings;
}

const FESM = (nodeModules) => join(nodeModules, '@hawiyah', 'angular', 'dist', 'fesm2022', 'hawiyah-angular.mjs');
let selectorCache = null;
/** Selectors of the Angular classes of the installed @hawiyah/angular, read from its FESM: Map<class, selector>. */
export function angularSelectors(nodeModules) {
  if (selectorCache?.nodeModules === nodeModules) return selectorCache.map;
  const map = new Map();
  const file = FESM(nodeModules);
  if (existsSync(file)) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/type:\s*(Hw\w+),\s*(?:isStandalone:\s*true,\s*)?selector:\s*"([^"]*)"/g)) map.set(match[1], match[2]);
  }
  selectorCache = { nodeModules, map };
  return map;
}

/**
 * The names by which a live block shows component `id` (G3): vanilla classes and
 * data-hw hook, React and Vue exports, Angular selectors and classes.
 */
export function componentNames(id, entry, nodeModules) {
  const selectors = angularSelectors(nodeModules);
  const targets = targetsFor(id, (framework, name) => framework !== 'angular' || selectors.has(name));
  const angular = targets.angular.flatMap((name) => (selectors.get(name) ?? '').split(',').map((part) => part.trim()).filter(Boolean));
  return {
    vanilla: { classes: [...(entry?.cssClasses ?? [])], hook: id },
    react: targets.react,
    vue: targets.vue,
    angular: { selectors: angular, classes: targets.angular },
  };
}

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether a block of `framework` shows the component of `names`. */
export function blockShows(framework, code, names) {
  if (framework === 'vanilla') {
    for (const match of code.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) {
      if (match[1].split(/\s+/).some((token) => names.vanilla.classes.includes(token))) return true;
    }
    return new RegExp(`\\bdata-hw\\s*=\\s*"${escape(names.vanilla.hook)}"`).test(code);
  }
  if (framework === 'react') return names.react.some((name) => new RegExp(`<${escape(name)}[\\s/>]`).test(code));
  if (framework === 'vue') {
    return names.vue.some((name) => [name, `Hw${name}`, kebab(name), `hw-${kebab(name)}`].some((tag) => new RegExp(`<${escape(tag)}[\\s/>]`).test(code)));
  }
  if (names.angular.classes.some((name) => new RegExp(`\\b${escape(name)}\\b`).test(code))) return true;
  return names.angular.selectors.some((selector) => {
    const element = /^([a-z][\w-]*)/.exec(selector)?.[1];
    const attribute = /\[([\w-]+)\]/.exec(selector)?.[1];
    if (attribute) return new RegExp(`[\\s\\[]${escape(attribute)}\\b`, 'i').test(code) && (!element || new RegExp(`<${escape(element)}\\b`).test(code));
    return element ? new RegExp(`<${escape(element)}[\\s/>]`).test(code) : false;
  });
}

/**
 * HWC-LIVE7 of one page: every live group contains the page's component in each of
 * its four blocks, unless live-component-exceptions.json lists the group, or the
 * fixture the page is read from declares a component its generic groups show.
 * @param {{ groups: any[], file: string, names: any, exceptions: any[], used: Set<any>, fixtureNames?: any }} page
 */
export function liveComponentFindings({ groups, file, names, exceptions, used, fixtureNames }) {
  const findings = [];
  for (const group of groups) {
    const missing = Object.entries(group.blocks).filter(([framework, block]) => !blockShows(framework, block.code, names)
      && !(fixtureNames && blockShows(framework, block.code, fixtureNames)));
    if (missing.length === 0) continue;
    const entry = exceptions.find((item) => item.file === file && item.example === group.example);
    if (entry) {
      used.add(entry);
      continue;
    }
    const list = (values) => values.length ? values.join(', ') : '(none)';
    findings.push(finding('HWC-LIVE7', file, group.line, `the live group "${group.example}" does not show the page's component in ${missing.map(([framework]) => framework).join(', ')}: a group contains one of its classes (${list(names.vanilla.classes)}) or data-hw="${names.vanilla.hook}" in html, ${list(names.react)} in React, ${list(names.vue)} in Vue and ${list([...names.angular.selectors, ...names.angular.classes])} in Angular; a group that legitimately does not is an entry of scripts/content/live-component-exceptions.json (the lead's list)`));
  }
  return findings;
}
