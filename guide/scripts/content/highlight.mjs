// Build-time highlighting with Lezer parsers into the hw-code-token roles of
// docs/code-and-prose.md, and the token sequence that live block parity
// (HWC-PAR4) compares.
//
//   ts, tsx, jsx, js   @lezer/javascript with dialect 'ts jsx'
//   html, vue          @lezer/html with nested @lezer/javascript (script) and @lezer/css (style)
//   css                @lezer/css
//   anything else      plain text, no roles

import { parser as cssParser } from '@lezer/css';
import { highlightCode, tagHighlighter, tags } from '@lezer/highlight';
import { configureNesting, parser as htmlBase } from '@lezer/html';
import { parser as jsBase } from '@lezer/javascript';

const tsParser = jsBase.configure({ dialect: 'ts jsx' });
const htmlParser = htmlBase.configure({
  wrap: configureNesting([
    { tag: 'script', parser: tsParser },
    { tag: 'style', parser: cssParser },
  ]),
});

const common = [
  { tag: tags.comment, class: 'comment' },
  { tag: [tags.punctuation, tags.operator, tags.bracket], class: 'punctuation' },
  { tag: [tags.keyword, tags.modifier], class: 'keyword' },
  { tag: tags.propertyName, class: 'property' },
  { tag: [tags.string, tags.regexp], class: 'string' },
  { tag: [tags.number, tags.bool, tags.atom, tags.unit], class: 'constant' },
  { tag: tags.attributeName, class: 'attribute' },
  { tag: tags.tagName, class: 'tag' },
  { tag: tags.typeName, class: 'type' },
  { tag: tags.function(tags.variableName), class: 'function' },
];
const codeHighlighter = tagHighlighter([...common, { tag: tags.className, class: 'type' }]);
const cssHighlighter = tagHighlighter([...common, { tag: tags.className, class: 'tag' }]);

export const ROLES = ['comment', 'punctuation', 'keyword', 'property', 'string', 'constant', 'attribute', 'tag', 'type', 'function'];

const SCRIPT = new Set(['ts', 'typescript', 'tsx', 'jsx', 'js', 'javascript', 'mjs']);
const MARKUP = new Set(['html', 'vue']);

function setup(lang) {
  const key = (lang ?? '').toLowerCase();
  if (SCRIPT.has(key)) return { parser: tsParser, highlighter: codeHighlighter };
  if (MARKUP.has(key)) return { parser: htmlParser, highlighter: codeHighlighter };
  if (key === 'css') return { parser: cssParser, highlighter: cssHighlighter };
  return null;
}

/**
 * Runs of a listing: [{ t, r?, from }] in order, with '\n' as separate runs.
 * @param {string | null} lang
 * @param {string} code
 */
function runs(lang, code) {
  const config = setup(lang);
  const out = [];
  let offset = 0;
  if (!config) {
    for (const [index, line] of code.split('\n').entries()) {
      if (index > 0) {
        out.push({ t: '\n', from: offset });
        offset += 1;
      }
      if (line) out.push({ t: line, from: offset });
      offset += line.length;
    }
    return { out, tree: null };
  }
  const tree = config.parser.parse(code);
  highlightCode(code, tree, config.highlighter, (text, classes) => {
    const role = classes.split(' ').find((name) => ROLES.includes(name));
    out.push(role ? { t: text, r: role, from: offset } : { t: text, from: offset });
    offset += text.length;
  }, () => {
    out.push({ t: '\n', from: offset });
    offset += 1;
  });
  return { out, tree };
}

/**
 * Highlights a listing into lines of runs: { t: string, r?: role }[][].
 * Adjacent runs with the same role are merged; every line is present, empty or not.
 * @param {string | null} lang
 * @param {string} code
 */
export function highlight(lang, code) {
  const lines = [[]];
  for (const run of runs(lang, code).out) {
    if (run.t === '\n') {
      lines.push([]);
      continue;
    }
    const line = lines[lines.length - 1];
    const last = line[line.length - 1];
    if (last && last.r === run.r) last.t += run.t;
    else line.push(run.r ? { t: run.t, r: run.r } : { t: run.t });
  }
  return lines;
}

/** Ranges of markup text nodes (HTML Text, JSX text) in a parsed listing. */
function textRanges(tree) {
  const ranges = [];
  if (!tree) return ranges;
  tree.iterate({
    enter(node) {
      if (node.name === 'Text' || node.name === 'JSXText') {
        ranges.push([node.from, node.to]);
        return false;
      }
      return undefined;
    },
  });
  return ranges;
}

/**
 * Token sequence of a listing for the parity check: [{ kind, text }], where kind
 * is a role, 'text' (markup text, one token per text run) or 'code' (other
 * unhighlighted source split at white space). Template literals in TypeScript
 * that contain markup (Angular templates) are tokenised as HTML.
 * @param {string | null} lang
 * @param {string} code
 */
export function tokens(lang, code) {
  const { out, tree } = runs(lang, code);
  const ranges = textRanges(tree);
  const inText = (index) => ranges.some(([from, to]) => index >= from && index < to);
  const result = [];
  let pendingText = '';
  const flushText = () => {
    const value = pendingText.replace(/\s+/g, ' ').trim();
    if (value) result.push({ kind: 'text', text: value });
    pendingText = '';
  };
  const script = SCRIPT.has((lang ?? '').toLowerCase());
  for (const run of out) {
    if (run.r) {
      flushText();
      if (run.r === 'string' && script && run.t.startsWith('`') && run.t.endsWith('`') && run.t.includes('<')) {
        result.push({ kind: 'punctuation', text: '`' });
        result.push(...tokens('html', run.t.slice(1, -1)));
        result.push({ kind: 'punctuation', text: '`' });
      } else {
        result.push({ kind: run.r, text: run.t });
      }
      continue;
    }
    // Unhighlighted: split into markup text and other code by position.
    let codePart = '';
    const flushCode = () => {
      for (const word of codePart.split(/\s+/)) if (word) result.push({ kind: 'code', text: word });
      codePart = '';
    };
    for (let i = 0; i < run.t.length; i += 1) {
      if (inText(run.from + i)) {
        flushCode();
        pendingText += run.t[i];
      } else {
        if (pendingText && /\S/.test(run.t[i])) flushText();
        codePart += run.t[i];
      }
    }
    flushCode();
  }
  flushText();
  return result;
}
