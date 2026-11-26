// Build-time highlighting with Lezer parsers into the hw-code-token roles of
// docs/code-and-prose.md, and the token sequence that live block parity
// (HWC-PAR4) compares.
//
//   ts, tsx, jsx, js   @lezer/javascript with dialect 'ts jsx'
//   html, vue          @lezer/html with nested @lezer/javascript (script) and @lezer/css (style);
//                      vue with the selfClosing dialect
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
/** Vue templates close any tag with '/>' (<Stat label="a" />): the selfClosing dialect reads them so (G9 of the 5a fix round). */
const vueParser = htmlParser.configure({ dialect: 'selfClosing' });

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
  if (key === 'vue') return { parser: vueParser, highlighter: codeHighlighter };
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

/**
 * Markup text nodes: HTML text, the text content of a textarea element (TextareaText,
 * which the browser shows as the value of the field) and JSX text.
 */
export const TEXT_NODES = new Set(['Text', 'TextareaText', 'JSXText']);

// A parenthesised expression of an Angular block, with parentheses nested two deep (@if (open()) {).
const PARENS = String.raw`\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)`;
/**
 * The control flow of an Angular template, which the template compiler reads as code
 * and the reader never sees: the opening of a block with or without its parenthesised
 * expression (@if (open()) {, @for (item of items; track item.id) {, @else {, @empty {),
 * a @let declaration and the closing brace of a block (outside an interpolation,
 * a brace in Angular text is always template syntax). An interpolation ({{ count }})
 * stays text.
 */
const ANGULAR_CONTROL_FLOW = new RegExp(String.raw`(?<interpolation>\{\{[\s\S]*?\}\})|@(?:else\s+if|if|for|switch|case|defer)\s*${PARENS}\s*\{|@(?:else|empty|default|defer|placeholder|loading|error)\s*(?:${PARENS}\s*)?\{|@let\s+[A-Za-z_$][\w$]*\s*=[^;]*;|\}`, 'g');

/**
 * Splits the text of an Angular template into control flow and text:
 * [{ code: boolean, from, to }] in order, empty parts left out.
 * @param {string} text
 */
export function angularTextParts(text) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(ANGULAR_CONTROL_FLOW)) {
    if (match.groups.interpolation) continue;
    if (match.index > last) parts.push({ code: false, from: last, to: match.index });
    parts.push({ code: true, from: match.index, to: match.index + match[0].length });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ code: false, from: last, to: text.length });
  return parts;
}

/**
 * The runs of a listing with every string that spans lines joined into one run: the
 * highlighter breaks a string at each line end, so a multi-line attribute value
 * (:items="[ ... ]") or template literal (an Angular template) would otherwise be
 * read as one string per line. A string run opens with a quote and runs on, through
 * line ends and string runs, to the run that ends with the same quote.
 * @param {{ t: string, r?: string, from: number }[]} out
 */
function joinStrings(out) {
  const joined = [];
  for (let i = 0; i < out.length; i += 1) {
    const run = out[i];
    const quote = run.r === 'string' ? /^['"`]/.exec(run.t)?.[0] : undefined;
    const closed = (text) => text.length > 1 && text.endsWith(quote) && !text.endsWith(`\\${quote}`);
    if (!quote || closed(run.t)) {
      joined.push(run);
      continue;
    }
    let text = run.t;
    let j = i + 1;
    while (j < out.length && (out[j].t === '\n' || out[j].r === 'string') && !closed(text)) {
      text += out[j].t;
      j += 1;
    }
    if (!closed(text)) {
      joined.push(run);
      continue;
    }
    joined.push({ t: text, r: 'string', from: run.from });
    i = j - 1;
  }
  return joined;
}

/** Ranges of markup text nodes (TEXT_NODES) in a parsed listing. */
function textRanges(tree) {
  const ranges = [];
  if (!tree) return ranges;
  tree.iterate({
    enter(node) {
      if (TEXT_NODES.has(node.name)) {
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
 * unhighlighted source split at white space). The text content of a textarea is
 * markup text. A string written over several lines is one token (joinStrings).
 * Template literals in TypeScript that contain markup (Angular templates) are
 * tokenised as HTML that closes any tag with '/>', and the control flow in their
 * text (angularTextParts) is code.
 * @param {string | null} lang
 * @param {string} code
 * @param {{ angular?: boolean }} [options] angular: the code is an Angular template
 */
export function tokens(lang, code, options = {}) {
  const { out, tree } = runs(lang, code);
  const ranges = textRanges(tree);
  const inText = (index) => ranges.some(([from, to]) => index >= from && index < to);
  const result = [];
  let pendingText = '';
  const pushText = (text) => {
    const value = text.replace(/\s+/g, ' ').trim();
    if (value) result.push({ kind: 'text', text: value });
  };
  const flushText = () => {
    if (!options.angular) pushText(pendingText);
    else {
      for (const part of angularTextParts(pendingText)) {
        const text = pendingText.slice(part.from, part.to);
        if (!part.code) pushText(text);
        else for (const word of text.split(/\s+/)) if (word) result.push({ kind: 'code', text: word });
      }
    }
    pendingText = '';
  };
  const script = SCRIPT.has((lang ?? '').toLowerCase());
  for (const run of joinStrings(out)) {
    if (run.r) {
      flushText();
      if (run.r === 'string' && script && run.t.startsWith('`') && run.t.endsWith('`') && run.t.includes('<')) {
        result.push({ kind: 'punctuation', text: '`' });
        // An Angular template closes any tag with '/>' (<hw-divider />), as a Vue template does.
        result.push(...tokens('vue', run.t.slice(1, -1), { angular: true }));
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
