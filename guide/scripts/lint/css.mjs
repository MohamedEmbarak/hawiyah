// CSS rules L-CSS-1 to L-CSS-9 (lint.css) over every *.css file under src/
// except src/generated/, parsed with postcss and postcss-selector-parser.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { findColours } from './colours.mjs';
import { finding, listFiles } from './files.mjs';

const ALLOWED_STYLE_IMPORTS = ['@hawiyah/styles/reset.css', '@hawiyah/styles/styles.css', '@hawiyah/styles/fonts.css'];
const ALLOWED_COLOUR_KEYWORDS = new Set(['currentcolor', 'transparent', 'inherit', 'initial', 'unset']);
const MODE_ATTRIBUTES = new Set(['data-hw-mode', 'data-hw-theme', 'data-hw-density']);
const PHYSICAL_PROPERTIES = [
  /^(?:margin|padding|inset|scroll-margin|scroll-padding)-(?:top|right|bottom|left)$/,
  /^border-(?:top|right|bottom|left)(?:-(?:width|style|color))?$/,
  /^border-(?:top|bottom)-(?:left|right)-radius$/,
  /^(?:top|right|bottom|left|width|height|min-width|min-height|max-width|max-height|overflow-x|overflow-y|overscroll-behavior-x|overscroll-behavior-y)$/,
];
const TIMING_KEYWORDS = /(?<![\w-])(?:(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w(-])|(?:cubic-bezier|steps|linear)\()/;
const TIME_VALUE = /(?<![\w-])-?\d*\.?\d+m?s(?![\w-])/;

export function listCssFiles(root) {
  return listFiles(root, 'src', (path) => path.endsWith('.css'));
}

function ancestors(node) {
  const list = [];
  for (let current = node.parent; current; current = current.parent) list.push(current);
  return list;
}

const insideMedia = (node, pattern) => ancestors(node).some((parent) => parent.type === 'atrule'
  && parent.name.toLowerCase() === 'media' && pattern.test(parent.params));

/** Splits at a separator outside parentheses. */
function splitTop(text, separator) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth === 0 && text.startsWith(separator, index)) {
      parts.push(current);
      current = '';
      index += separator.length - 1;
    } else current += char;
  }
  parts.push(current);
  return parts;
}

/**
 * Whether a media query list applies only when the reader has not asked for
 * reduced motion: every query of the list has (prefers-reduced-motion:
 * no-preference) as a plain conjunct, and no query is negated or uses `or`.
 */
export function gatesMotion(params) {
  const queries = splitTop(params.toLowerCase().replace(/\s+/g, ' ').trim(), ',').map((query) => query.trim());
  return queries.length > 0 && queries.every((query) => {
    if (query === '' || /^(?:not|only not)\b/.test(query)) return false;
    const terms = splitTop(query, ' and ').map((term) => term.trim());
    if (terms.some((term) => /\bor\b|\bnot\b/.test(term))) return false;
    return terms.some((term) => term.replace(/\s+/g, '') === '(prefers-reduced-motion:no-preference)');
  });
}

const insideMotionGate = (node) => ancestors(node).some((parent) => parent.type === 'atrule'
  && parent.name.toLowerCase() === 'media' && gatesMotion(parent.params));

/** Shorthands whose four-value form (or, for border-radius, any multi-value form) names physical sides. */
const SIDE_SHORTHANDS = new Set(['margin', 'padding', 'scroll-margin', 'scroll-padding', 'border-width', 'border-style', 'border-color']);

function splitValue(value) {
  // Top-level whitespace-separated parts (parentheses kept together).
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of value.trim()) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (/\s/.test(char) && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else current += char;
  }
  if (current) parts.push(current);
  return parts;
}

function selectorFindings(rule, file, out) {
  const start = rule.source?.start ?? { line: 1, column: 1 };
  const position = (node) => {
    const local = node?.source?.start;
    if (!local) return [start.line, start.column];
    return local.line === 1 ? [start.line, start.column + local.column - 1] : [start.line + local.line - 1, local.column];
  };
  const raw = rule.selector;
  if (/::ng-deep|\/deep\/|>>>/.test(raw)) {
    const match = raw.match(/::ng-deep|\/deep\/|>>>/);
    out.push(finding('L-CSS-8', file, start.line, start.column, `selector uses ${match[0]}`));
  }
  let ast;
  try {
    ast = selectorParser().astSync(raw.replace(/\/deep\/|>>>/g, (match) => ' '.repeat(match.length)));
  } catch (error) {
    out.push(finding('L-CSS-PARSE', file, start.line, start.column, `selector cannot be parsed (${error.message})`));
    return;
  }
  ast.walk((node) => {
    if (node.type === 'class' && node.value.startsWith('hw-')) {
      const [line, column] = position(node);
      out.push(finding('L-CSS-1', file, line, column, `selector targets a package class .${node.value}`));
    } else if (node.type === 'tag' && node.value.toLowerCase().startsWith('hw-')) {
      const [line, column] = position(node);
      out.push(finding('L-CSS-2', file, line, column, `selector targets a package element ${node.value}`));
    } else if (node.type === 'attribute') {
      const name = node.attribute.toLowerCase();
      const [line, column] = position(node);
      if ((name === 'class' || name === 'id') && /hw/.test(node.value ?? '')) {
        out.push(finding('L-CSS-2', file, line, column, `selector matches package ${name} values ${node.toString().trim()}`));
      } else if ((name === 'class' || name === 'id') && node.operator && node.operator !== '=' && node.operator !== '~=') {
        out.push(finding('L-CSS-2', file, line, column, `selector matches part of a ${name} value ${node.toString().trim()}; use a whole guide class`));
      } else if (name === 'data-hw' || name.startsWith('data-hw-')) {
        const inHostContext = ancestors(node).some((parent) => parent.type === 'pseudo' && parent.value === ':host-context');
        let compound = node.prev();
        let rooted = false;
        while (compound && compound.type !== 'combinator') {
          if (compound.type === 'pseudo' && compound.value === ':root') rooted = true;
          compound = compound.prev();
        }
        if (!(MODE_ATTRIBUTES.has(name) && (inHostContext || rooted))) {
          out.push(finding('L-CSS-2', file, line, column, `selector targets the package attribute ${node.toString().trim()}`));
        }
      }
    }
  });
}

export function lintCssSource(file, text, allowlist) {
  const out = [];
  let root;
  try {
    root = postcss.parse(text, { from: file });
  } catch (error) {
    out.push(finding('L-CSS-PARSE', file, error.line ?? 1, error.column ?? 1, `stylesheet cannot be parsed (${error.reason ?? error.message})`));
    return out;
  }
  const allowedProperties = new Set(allowlist.cssCustomProperties ?? []);
  const isStyles = file === 'src/styles.css';
  let lastImport = -1;

  root.walk((node) => {
    const start = node.source?.start ?? { line: 1, column: 1 };
    if (node.type === 'rule') {
      selectorFindings(node, file, out);
      return;
    }
    if (node.type === 'atrule') {
      const name = node.name.toLowerCase();
      if (name === 'import') {
        const target = node.params.replace(/^url\(\s*/, '').replace(/\s*\).*$/, '').replace(/^['"]|['"](?:\s.*)?$/g, '').trim();
        if (!isStyles) {
          out.push(finding('L-CSS-6', file, start.line, start.column, `@import is allowed only in src/styles.css (found '${target}')`));
        } else {
          const index = ALLOWED_STYLE_IMPORTS.indexOf(target);
          if (index === -1) out.push(finding('L-CSS-6', file, start.line, start.column, `@import '${target}' is not one of ${ALLOWED_STYLE_IMPORTS.join(', ')}`));
          else if (index <= lastImport) out.push(finding('L-CSS-6', file, start.line, start.column, `@import '${target}' is out of order; the order is ${ALLOWED_STYLE_IMPORTS.join(', ')}`));
          else lastImport = index;
        }
        return;
      }
      if (name === 'font-face') out.push(finding('L-CSS-7', file, start.line, start.column, '@font-face is not allowed; fonts come from @hawiyah/styles/fonts.css'));
      if (/url\(/i.test(node.params)) out.push(finding('L-CSS-7', file, start.line, start.column, 'url() is not allowed'));
      return;
    }
    if (node.type !== 'decl') return;
    const prop = node.prop.toLowerCase();
    const value = node.value;

    // L-CSS-3 raw colours.
    const forced = insideMedia(node, /forced-colors\s*:\s*active/i);
    for (const colour of findColours(value)) {
      if (colour.kind === 'named' && ALLOWED_COLOUR_KEYWORDS.has(colour.value.toLowerCase())) continue;
      if (colour.kind === 'system' && forced) continue;
      const message = colour.kind === 'system'
        ? `system colour ${colour.value} is allowed only inside @media (forced-colors: active)`
        : `raw colour ${colour.value} in ${node.prop}; use a var(--hw-*) token`;
      out.push(finding('L-CSS-3', file, start.line, start.column, message));
    }

    // L-CSS-4 physical properties and values.
    if (!prop.startsWith('--')) {
      if (PHYSICAL_PROPERTIES.some((pattern) => pattern.test(prop))) {
        out.push(finding('L-CSS-4', file, start.line, start.column, `physical property ${node.prop}; use the logical property`));
      }
      const lowered = value.toLowerCase().trim();
      if (['float', 'clear', 'text-align'].includes(prop) && /^(?:left|right)$/.test(lowered)) {
        out.push(finding('L-CSS-4', file, start.line, start.column, `${node.prop}: ${value} is physical; use start or end (inline-start, inline-end)`));
      }
      if (prop === 'resize' && /^(?:horizontal|vertical)$/.test(lowered)) {
        out.push(finding('L-CSS-4', file, start.line, start.column, `resize: ${value} is physical; use inline or block`));
      }
      if (prop === 'inset' && splitValue(value).length > 1) {
        out.push(finding('L-CSS-4', file, start.line, start.column, 'inset with more than one value is physical; use inset-block and inset-inline'));
      }
      if (SIDE_SHORTHANDS.has(prop) && splitValue(value.replace(/!important\s*$/i, '')).length === 4) {
        out.push(finding('L-CSS-4', file, start.line, start.column, `${node.prop} with four values names physical sides; use the -block and -inline properties`));
      }
      if (prop === 'border-radius' && value.split('/').some((part) => splitValue(part.replace(/!important\s*$/i, '')).length > 1)) {
        out.push(finding('L-CSS-4', file, start.line, start.column, 'border-radius with more than one value names physical corners; use the logical corner properties'));
      }
    }

    // L-CSS-5 package custom properties.
    if (prop.startsWith('--hw-') && !allowedProperties.has(prop)) {
      out.push(finding('L-CSS-5', file, start.line, start.column, `declares the package custom property ${node.prop}`));
    }

    // L-CSS-7 url().
    if (/url\(/i.test(value)) out.push(finding('L-CSS-7', file, start.line, start.column, 'url() is not allowed'));

    // L-CSS-9 motion.
    if (/^(?:animation|transition)(?:-|$)/.test(prop)) {
      if (!insideMotionGate(node)) {
        out.push(finding('L-CSS-9', file, start.line, start.column, `${node.prop} outside @media (prefers-reduced-motion: no-preference)`));
      }
      const timed = /^(?:animation|transition)(?:-duration|-delay|-timing-function)?$/.test(prop);
      const withoutTokens = value.replace(/var\(\s*--hw-(?:duration|ease)-[\w-]+\s*\)/g, ' ');
      const rawTime = TIME_VALUE.test(withoutTokens) && !/^0m?s$/.test(withoutTokens.trim());
      const rawTiming = TIMING_KEYWORDS.test(withoutTokens);
      const otherVar = /-(?:duration|delay|timing-function)$/.test(prop) && /var\(/.test(withoutTokens);
      if (timed && (rawTime || rawTiming || otherVar)) {
        out.push(finding('L-CSS-9', file, start.line, start.column, `${node.prop} uses a raw duration or timing function; use var(--hw-duration-*) and var(--hw-ease-*)`));
      }
    }
  });
  return out;
}

export function lintCss(root, allowlist, files = listCssFiles(root)) {
  const findings = [];
  for (const file of files) findings.push(...lintCssSource(file, readFileSync(join(root, file), 'utf8'), allowlist));
  return { files: files.length, findings };
}
