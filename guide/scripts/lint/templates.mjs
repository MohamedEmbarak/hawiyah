// Template rules L-TPL-1 to L-TPL-9 (lint.templates) over the inline
// templates of every *.ts under src/app/ and every *.html under src/ except
// src/generated/, parsed with parseTemplate from @angular/compiler.
// L-TPL-7: decorator metadata the lint cannot read (not an object literal, a
// spread, a template that is not a string literal); L-TPL-8: class or style
// set through host metadata or @HostBinding; L-TPL-9: <style> or a stylesheet
// <link> in a template.

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

const HOST_STYLE_KEY = /^(?:class|style|\[(?:class|style|ngclass|ngstyle|classname|attr\.class|attr\.style)(?:\.[^\]]*)?\])$/i;
const HOST_BINDING_STYLE = /^(?:class|style|attr\.class|attr\.style)(?:\.|$)/i;

// Inline templates and host metadata of @Component and @Directive decorators
// in a .ts file. `object` is null when the metadata is not an object literal;
// `hostBindings` lists the @HostBinding decorators.
export function componentMetadata(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const found = [];
  const hostBindings = [];
  const visit = (node) => {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const callee = node.expression.expression;
      const name = ts.isIdentifier(callee) ? callee.text : (ts.isPropertyAccessExpression(callee) ? callee.name.text : '');
      const [argument] = node.expression.arguments;
      if (name === 'Component' || name === 'Directive') {
        found.push({ source, kind: name, decorator: node, object: argument && ts.isObjectLiteralExpression(argument) ? argument : null });
      }
      if (name === 'HostBinding') hostBindings.push({ source, decorator: node, argument });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  found.hostBindings = hostBindings;
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
  // Angular turns <style> and <link rel="stylesheet"> into component styles.
  for (const match of template.matchAll(/<style\b|<link\b[^>]*>/gi)) {
    if (match[0].toLowerCase().startsWith('<link') && !/\brel\s*=\s*["']?[^"'>]*\bstylesheet\b/i.test(match[0])) continue;
    const [line, column] = toPosition(match.index);
    out.push(finding('L-TPL-9', file, line, column, `${match[0].toLowerCase().startsWith('<style') ? '<style>' : 'a stylesheet <link>'} is not allowed in a template`));
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
  const at = (source, node) => fileOffset(node.getStart(source));
  const metadata = componentMetadata(file, text);
  for (const { source, kind, decorator, object } of metadata) {
    if (!object) {
      out.push(finding('L-TPL-7', file, ...at(source, decorator), `@${kind} metadata must be an object literal`));
      continue;
    }
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) {
        if (!ts.isShorthandPropertyAssignment(property) || ['template', 'host'].includes(property.name.text)) {
          out.push(finding('L-TPL-7', file, ...at(source, property), `@${kind} metadata must list its properties literally (found ${property.getText(source).slice(0, 40)})`));
        }
        continue;
      }
      const name = propertyName(property);
      if (!name) {
        out.push(finding('L-TPL-7', file, ...at(source, property), `@${kind} metadata has a computed property name`));
        continue;
      }
      const init = property.initializer;
      if (name === 'template' && (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init))) {
        const start = init.getStart(source) + 1;
        out.push(...lintTemplateText(file, init.text, (offset) => fileOffset(start + offset), allowed));
      } else if (name === 'template' && ts.isTemplateExpression(init)) {
        out.push(finding('L-TPL-PARSE', file, ...at(source, init), 'template must be a literal without interpolation'));
      } else if (name === 'template') {
        out.push(finding('L-TPL-7', file, ...at(source, init), 'template must be a string literal written in the decorator'));
      } else if (name === 'host' && !ts.isObjectLiteralExpression(init)) {
        out.push(finding('L-TPL-7', file, ...at(source, init), 'host must be an object literal written in the decorator'));
      } else if (name === 'host') {
        for (const binding of init.properties) {
          const key = propertyName(binding);
          if (!ts.isPropertyAssignment(binding) || !key) {
            out.push(finding('L-TPL-7', file, ...at(source, binding), 'host must list its bindings literally'));
            continue;
          }
          if (/ngskiphydration/i.test(key)) {
            out.push(finding('L-TPL-5', file, ...at(source, binding), 'ngSkipHydration host binding is not allowed'));
          }
          if (HOST_STYLE_KEY.test(key)) {
            out.push(finding('L-TPL-8', file, ...at(source, binding), `host '${key}' sets class or style on the host element`));
          }
        }
      }
    }
  }
  for (const { source, decorator, argument } of metadata.hostBindings) {
    if (!argument) {
      // @HostBinding() binds the host property of the member's own name.
      const member = decorator.parent?.name;
      const target = member && (ts.isIdentifier(member) || ts.isStringLiteralLike(member)) ? member.text : '';
      if (/^(?:class|classname|style)$/i.test(target)) {
        out.push(finding('L-TPL-8', file, ...at(source, decorator), `@HostBinding() on '${target}' sets class or style on the host element`));
      }
    } else if (!ts.isStringLiteralLike(argument)) {
      out.push(finding('L-TPL-7', file, ...at(source, decorator), '@HostBinding must name its target with a string literal'));
    } else if (HOST_BINDING_STYLE.test(argument.text)) {
      out.push(finding('L-TPL-8', file, ...at(source, decorator), `@HostBinding('${argument.text}') sets class or style on the host element`));
    }
  }
  return out;
}

export function lintTemplates(root, allowlist, files = listTemplateFiles(root)) {
  const findings = [];
  for (const file of files) findings.push(...lintTemplateSource(file, readFileSync(join(root, file), 'utf8'), allowlist));
  return { files: files.length, findings };
}
