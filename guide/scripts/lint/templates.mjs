// Template rules L-TPL-1 to L-TPL-6 (lint.templates) over the inline
// templates of every *.ts under src/app/ and every *.html under src/ except
// src/generated/, parsed with parseTemplate from @angular/compiler.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BindingType, parseTemplate } from '@angular/compiler';
import ts from 'typescript';
import { finding, listFiles } from './files.mjs';

const MODE_ATTRIBUTES = new Set(['data-hw-theme', 'data-hw-mode', 'data-hw-density']);
const PREVIEW_FRAME = 'src/app/examples/frame/preview-frame.ts';
const CHILD_KEYS = ['children', 'branches', 'cases', 'groups', 'empty', 'placeholder', 'loading', 'error'];

export function listTemplateFiles(root) {
  return [
    ...listFiles(root, 'src/app', (path) => path.endsWith('.ts')),
    ...listFiles(root, 'src', (path) => path.endsWith('.html')),
  ].sort();
}

function classAllowed(name, allowed) {
  return allowed.has(name);
}

// Inline templates and host metadata of @Component decorators in a .ts file.
export function componentMetadata(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const found = [];
  const visit = (node) => {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const callee = node.expression.expression;
      const name = ts.isIdentifier(callee) ? callee.text : (ts.isPropertyAccessExpression(callee) ? callee.name.text : '');
      const [argument] = node.expression.arguments;
      if (name === 'Component' && argument && ts.isObjectLiteralExpression(argument)) {
        found.push({ source, object: argument });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const propertyName = (property) => (property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : '');

function lintTemplateText(file, template, toPosition, allowed) {
  const out = [];
  const parsed = parseTemplate(template, file, { preserveWhitespaces: true, preserveLineEndings: true });
  for (const error of parsed.errors ?? []) {
    const [line, column] = toPosition(error.span?.start?.offset ?? 0);
    out.push(finding('L-TPL-PARSE', file, line, column, `template cannot be parsed (${error.msg})`));
  }
  const at = (span) => toPosition(span?.start?.offset ?? 0);
  // Angular's template transform drops <script> elements, so they are found
  // in the source text.
  for (const match of template.matchAll(/<script\b/gi)) {
    const [line, column] = toPosition(match.index);
    out.push(finding('L-TPL-6', file, line, column, '<script> is not allowed in a template'));
  }
  const checkClassText = (span, text, origin) => {
    for (const match of text.matchAll(/(?<![\w-])hw-[a-z0-9-]+/g)) {
      if (!classAllowed(match[0], allowed)) {
        const [line, column] = at(span);
        out.push(finding('L-TPL-1', file, line, column, `${origin} uses the package class ${match[0]}; use the component or directive`));
      }
    }
  };
  const visitNode = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visitNode); return; }
    if (Array.isArray(node.attributes)) {
      const attributes = [...node.attributes, ...(node.templateAttrs ?? []).filter((attr) => attr.value !== undefined && attr.type === undefined)];
      for (const attr of attributes) {
        const name = attr.name;
        const lower = name.toLowerCase();
        const [line, column] = at(attr.sourceSpan);
        if (lower === 'class') checkClassText(attr.sourceSpan, attr.value ?? '', 'class attribute');
        if (lower === 'style') out.push(finding('L-TPL-2', file, line, column, 'style attribute is not allowed'));
        if ((lower === 'data-hw' || lower.startsWith('data-hw-')) && !MODE_ATTRIBUTES.has(lower)) {
          out.push(finding('L-TPL-3', file, line, column, `${name} attribute is a vanilla hook; use the Angular component`));
        }
        if (lower === 'ngskiphydration') out.push(finding('L-TPL-5', file, line, column, 'ngSkipHydration is not allowed'));
        if (/^on[a-z]+$/.test(lower)) out.push(finding('L-TPL-6', file, line, column, `${name} event attribute is not allowed`));
      }
      for (const input of [...(node.inputs ?? []), ...(node.templateAttrs ?? []).filter((attr) => attr.type !== undefined)]) {
        const name = input.name;
        const lower = name.toLowerCase();
        const key = input.keySpan?.toString() ?? name;
        const [line, column] = at(input.sourceSpan);
        const text = input.sourceSpan?.toString() ?? '';
        if (input.type === BindingType.Class) {
          checkClassText(input.sourceSpan, `${name} `, `[${key}] binding`);
        } else if (lower === 'class' || lower === 'ngclass' || lower === 'classname') {
          checkClassText(input.sourceSpan, text, `[${key}] binding`);
        }
        if (input.type === BindingType.Style || lower === 'style' || lower === 'ngstyle') {
          out.push(finding('L-TPL-2', file, line, column, `[${key}] binding is not allowed`));
        }
        if ((lower === 'data-hw' || lower.startsWith('data-hw-')) && !MODE_ATTRIBUTES.has(lower)) {
          out.push(finding('L-TPL-3', file, line, column, `[${key}] binding is a vanilla hook; use the Angular component`));
        }
        if (['innerhtml', 'outerhtml', 'srcdoc'].includes(lower) && !(lower === 'srcdoc' && file === PREVIEW_FRAME)) {
          out.push(finding('L-TPL-4', file, line, column, `[${key}] binding is not allowed`));
        }
        if (lower === 'ngskiphydration') out.push(finding('L-TPL-5', file, line, column, 'ngSkipHydration is not allowed'));
        if (/^on[a-z]+$/.test(lower)) out.push(finding('L-TPL-6', file, line, column, `[${key}] event property binding is not allowed`));
      }
    }
    for (const key of CHILD_KEYS) {
      if (node[key]) visitNode(node[key]);
    }
  };
  visitNode(parsed.nodes);
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}

function lineColumnOf(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) if (text[index] === '\n') starts.push(index + 1);
  return (offset) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (starts[mid] <= offset) low = mid; else high = mid - 1;
    }
    return [low + 1, offset - starts[low] + 1];
  };
}

export function lintTemplateSource(file, text, allowlist) {
  const allowed = new Set(allowlist.templateClasses ?? []);
  const fileOffset = lineColumnOf(text);
  if (file.endsWith('.html')) return lintTemplateText(file, text, fileOffset, allowed);
  const out = [];
  for (const { source, object } of componentMetadata(file, text)) {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = propertyName(property);
      const init = property.initializer;
      if (name === 'template' && (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init))) {
        const start = init.getStart(source) + 1;
        out.push(...lintTemplateText(file, init.text, (offset) => fileOffset(start + offset), allowed));
      } else if (name === 'template' && ts.isTemplateExpression(init)) {
        const [line, column] = fileOffset(init.getStart(source));
        out.push(finding('L-TPL-PARSE', file, line, column, 'template must be a literal without interpolation'));
      } else if (name === 'host' && ts.isObjectLiteralExpression(init)) {
        for (const binding of init.properties) {
          const key = propertyName(binding);
          if (/ngskiphydration/i.test(key)) {
            const [line, column] = fileOffset(binding.getStart(source));
            out.push(finding('L-TPL-5', file, line, column, 'ngSkipHydration host binding is not allowed'));
          }
        }
      }
    }
  }
  return out;
}

export function lintTemplates(root, allowlist, files = listTemplateFiles(root)) {
  const findings = [];
  for (const file of files) findings.push(...lintTemplateSource(file, readFileSync(join(root, file), 'utf8'), allowlist));
  return { files: files.length, findings };
}
