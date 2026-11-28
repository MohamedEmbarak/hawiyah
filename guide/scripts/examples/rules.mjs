// Forbidden constructs in live blocks (contentPipeline.liveBlocks):
//   HWC-LIVE4  a capitalised React or Vue tag that is not an export of the installed
//              adapter, or an hw- element that matches no @hawiyah/angular component
//              (reported from the wrap result, see unknownFindings);
//   HWC-LIVE5  a module form importing from anything but its adapter, @hawiyah/core
//              and its framework packages;
//   HWC-LIVE6  style attributes and style bindings, <style> elements, styles or
//              styleUrl in Angular metadata, raw colours, class names that do not
//              start with hw-, <script> and inline event handlers in HTML. The one
//              exception is a style attribute of the html (vanilla) block whose
//              declarations are all custom properties named --hw-* (the props of a
//              layout primitive, which the React, Vue and Angular adapters write as
//              custom properties on the element); see layoutStyleFindings.
// Every finding is { code, line, message } with line relative to the block (1-based).
import { BindingType, TmplAstBoundAttribute, TmplAstElement, TmplAstTextAttribute } from '@angular/compiler';
import { parse as parseVueSfc } from '@vue/compiler-sfc';
import { parseFragment } from 'parse5';
import postcss from 'postcss';
import ts from 'typescript';
import { findColours, stripVarNames } from '../lint/colours.mjs';
import { parseAngularTemplate, templateElements } from './angular-imports.mjs';
import { findExampleClass } from './wrap.mjs';

export const ALLOWED_IMPORTS = {
  react: ['@hawiyah/react', '@hawiyah/core', 'react'],
  vue: ['@hawiyah/vue', '@hawiyah/core', 'vue'],
  angular: ['@hawiyah/angular', '@hawiyah/core', '@angular/core', '@angular/common', '@angular/forms'],
};

// Attribute values that hold references or text, never presentation: not read for colours.
const REFERENCE_ATTRIBUTE = /^(?:href|src|id|for|name|value|label|title|alt|placeholder|aria-[a-z-]+|data-[a-z0-9-]+|[a-z]*Label|[a-z]*Message|text|caption)$/i;
// Attributes whose value is a paint: CSS named colours are also refused there.
const PAINT_ATTRIBUTE = /^(?:color|fill|stroke|bgcolor|background|stop-color|flood-color|lighting-color)$/i;
const STYLE_BINDINGS = new Set(['style', 'ngStyle']);

const finding = (code, line, message) => ({ code, line: Math.max(1, line), message });

function colourFindings(name, value, line) {
  if (REFERENCE_ATTRIBUTE.test(name)) return [];
  const found = findColours(stripVarNames(value), { identifiers: PAINT_ATTRIBUTE.test(name) });
  return found.map((colour) => finding('HWC-LIVE6', line, `raw colour ${colour.value} in ${name}; use the documented variants`));
}

function classFindings(attribute, value, line) {
  return value.split(/\s+/).filter((token) => token && !token.startsWith('hw-'))
    .map((token) => finding('HWC-LIVE6', line, `class "${token}" in ${attribute} does not start with hw-`));
}

function stringLiteralColours(file, node, lineOf) {
  const out = [];
  const visit = (child) => {
    if ((ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) && !ts.isImportDeclaration(child.parent)
      && !ts.isExportDeclaration(child.parent) && !ts.isJsxAttribute(child.parent)) {
      for (const colour of findColours(stripVarNames(child.text), { identifiers: false })) {
        out.push(finding('HWC-LIVE6', lineOf(child), `raw colour ${colour.value} in a string`));
      }
    }
    ts.forEachChild(child, visit);
  };
  visit(node ?? file);
  return out;
}

function importFindings(framework, file, lineOf) {
  const allowed = ALLOWED_IMPORTS[framework];
  const out = [];
  const check = (specifier, node) => {
    if (!allowed.includes(specifier)) {
      out.push(finding('HWC-LIVE5', lineOf(node), `import from '${specifier}' is not allowed; a ${framework} example imports only from ${allowed.join(', ')}`));
    }
  };
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      check(node.moduleSpecifier.text, node);
    } else if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteralLike(node.arguments[0])
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      check(node.arguments[0].text, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}

// ---------------------------------------------------------------- HTML (vanilla)

/** The name a custom property of a style attribute of the html block must have. */
export const LAYOUT_PROPERTY = /^--hw-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The declarations of a style attribute of the html block (docs/components/README.md,
 * Rules for the code): the attribute is accepted only when it holds at least one
 * declaration and every declaration sets a custom property named --hw-*. Anything
 * else (another property, a comment, a rule, text that is not a declaration list)
 * is HWC-LIVE6, and so is a raw colour in a value.
 */
export function layoutStyleFindings(value, line) {
  const refuse = (detail) => [finding('HWC-LIVE6', line, `style attribute ${detail}; in the html block a style attribute only sets custom properties named --hw-* (the props of a layout primitive), otherwise use hw- classes and documented variants`)];
  let rule;
  try {
    const root = postcss.parse(`x{${value}}`);
    rule = root.nodes.length === 1 && root.nodes[0].type === 'rule' ? root.nodes[0] : null;
  } catch {
    rule = null;
  }
  if (!rule) return refuse('is not a list of declarations');
  if (rule.nodes.length === 0) return refuse('declares nothing');
  const out = [];
  for (const node of rule.nodes) {
    if (node.type !== 'decl') out.push(...refuse(`holds a ${node.type}, not a declaration`));
    else if (!LAYOUT_PROPERTY.test(node.prop)) out.push(...refuse(`declares ${node.prop}`));
    else {
      // A value is a paint where a custom property can carry one: named colours are refused too.
      for (const colour of findColours(stripVarNames(node.value), { identifiers: true })) {
        out.push(finding('HWC-LIVE6', line, `raw colour ${colour.value} in ${node.prop}; use the documented variants`));
      }
    }
  }
  return out;
}

/** Rules over an HTML fragment; lines are 1-based in `html`. */
export function htmlRules(html) {
  const out = [];
  const tree = parseFragment(html, { sourceCodeLocationInfo: true });
  const visit = (node) => {
    if (node.tagName) {
      const line = node.sourceCodeLocation?.startLine ?? 1;
      if (node.tagName === 'script') out.push(finding('HWC-LIVE6', line, '<script> is not allowed in a live example; main.js runs enhance()'));
      if (node.tagName === 'style') out.push(finding('HWC-LIVE6', line, '<style> is not allowed in a live example'));
      for (const attribute of node.attrs ?? []) {
        const attrLine = node.sourceCodeLocation?.attrs?.[attribute.name]?.startLine ?? line;
        if (attribute.name === 'style') out.push(...layoutStyleFindings(attribute.value, attrLine));
        else if (/^on[a-z]/.test(attribute.name)) out.push(finding('HWC-LIVE6', attrLine, `inline event handler ${attribute.name} is not allowed`));
        else if (attribute.name === 'class') out.push(...classFindings('class', attribute.value, attrLine));
        else out.push(...colourFindings(attribute.name, attribute.value, attrLine));
      }
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(tree);
  return out;
}

// ---------------------------------------------------------------- React

/** Rules over a complete Example.tsx; lines are 1-based in `source`. */
export function reactRules(source, form) {
  const file = ts.createSourceFile('Example.tsx', source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const lineOf = (node) => file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
  const out = [];
  if (form === 'module') out.push(...importFindings('react', file, lineOf));
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      if (tag === 'style' || tag === 'script') out.push(finding('HWC-LIVE6', lineOf(node), `<${tag}> is not allowed in a live example`));
    }
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(file);
      const init = node.initializer;
      const text = init && ts.isStringLiteral(init) ? init.text
        : init && ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression) ? init.expression.text : null;
      if (name === 'style') out.push(finding('HWC-LIVE6', lineOf(node), 'style prop is not allowed; use hw- classes and documented variants'));
      else if (name === 'className' && text !== null) out.push(...classFindings('className', text, lineOf(node)));
      else if (text !== null) out.push(...colourFindings(name, text, lineOf(node)));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  out.push(...stringLiteralColours(file, null, lineOf));
  return out;
}

// ---------------------------------------------------------------- Vue

/** Rules over a complete Example.vue; lines are 1-based in `source`. */
export function vueRules(source, form) {
  const out = [];
  const { descriptor, errors } = parseVueSfc(source, { filename: 'Example.vue' });
  for (const error of errors) out.push(finding('HWC-U1', error.loc?.start?.line ?? 1, `Vue SFC: ${error.message}`));
  for (const style of descriptor.styles) out.push(finding('HWC-LIVE6', style.loc.start.line - 1, '<style> is not allowed in a live example'));
  for (const script of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
    const file = ts.createSourceFile('Example.ts', script.content, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    const base = script.loc.start.line - 1;
    const lineOf = (node) => base + file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
    if (form === 'module') out.push(...importFindings('vue', file, lineOf));
    out.push(...stringLiteralColours(file, null, lineOf));
  }
  const visit = (node) => {
    if (node.type === 1) {
      if (node.tag === 'style' || node.tag === 'script') out.push(finding('HWC-LIVE6', node.loc.start.line, `<${node.tag}> is not allowed in a live example`));
      for (const prop of node.props) {
        const line = prop.loc.start.line;
        if (prop.type === 6) {
          if (prop.name === 'style') out.push(finding('HWC-LIVE6', line, 'style attribute is not allowed; use hw- classes and documented variants'));
          else if (prop.name === 'class') out.push(...classFindings('class', prop.value?.content ?? '', line));
          else out.push(...colourFindings(prop.name, prop.value?.content ?? '', line));
        } else if (prop.type === 7 && prop.name === 'bind' && prop.arg?.content) {
          const arg = prop.arg.content;
          const literal = /^\s*(['"`])([^'"`]*)\1\s*$/.exec(prop.exp?.content ?? '');
          if (arg === 'style') out.push(finding('HWC-LIVE6', line, ':style binding is not allowed'));
          else if (arg === 'class' && literal) out.push(...classFindings(':class', literal[2], line));
          else if (literal) out.push(...colourFindings(arg, literal[2], line));
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
    for (const branch of node.branches ?? []) visit(branch);
  };
  if (descriptor.template?.ast) visit(descriptor.template.ast);
  return out;
}

// ---------------------------------------------------------------- Angular

/** Rules over an Angular template; lines are 1-based in the template. */
export function angularTemplateRules(template) {
  const out = [];
  const { nodes } = parseAngularTemplate(template);
  for (const node of templateElements(nodes)) {
    const line = (node.startSourceSpan?.start?.line ?? 0) + 1;
    if (node instanceof TmplAstElement && (node.name === 'style' || node.name === 'script')) {
      out.push(finding('HWC-LIVE6', line, `<${node.name}> is not allowed in a live example`));
    }
    for (const attribute of node.attributes ?? []) {
      if (!(attribute instanceof TmplAstTextAttribute)) continue;
      const attrLine = (attribute.sourceSpan?.start?.line ?? line - 1) + 1;
      if (attribute.name === 'style') out.push(finding('HWC-LIVE6', attrLine, 'style attribute is not allowed; use hw- classes and documented variants'));
      else if (attribute.name === 'class') out.push(...classFindings('class', attribute.value, attrLine));
      else out.push(...colourFindings(attribute.name, attribute.value, attrLine));
    }
    for (const input of node.inputs ?? []) {
      if (!(input instanceof TmplAstBoundAttribute)) continue;
      const inputLine = (input.sourceSpan?.start?.line ?? line - 1) + 1;
      if (input.type === BindingType.Style || STYLE_BINDINGS.has(input.name)) out.push(finding('HWC-LIVE6', inputLine, `[${input.type === BindingType.Style && input.name !== 'style' ? `style.${input.name}` : input.name}] binding is not allowed`));
      else if (input.type === BindingType.Class && !input.name.startsWith('hw-')) out.push(finding('HWC-LIVE6', inputLine, `class "${input.name}" in [class.${input.name}] does not start with hw-`));
    }
  }
  return out;
}

/**
 * Rules over a complete example.component.ts. `templateLine` is the source line of
 * the template literal; template findings are mapped onto source lines.
 */
export function angularRules(source, form) {
  const out = [];
  const file = ts.createSourceFile('example.component.ts', source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const lineOf = (node) => file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
  if (form === 'module') out.push(...importFindings('angular', file, lineOf));
  const found = findExampleClass(source);
  if (!found) return [...out, finding('HWC-A1', 1, 'no exported @Component class')];
  let templateNode = null;
  for (const property of found.metadata.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
    const name = property.name.getText(file).replace(/^['"]|['"]$/g, '');
    if (name === 'styles' || name === 'styleUrl' || name === 'styleUrls') {
      out.push(finding('HWC-LIVE6', lineOf(property), `${name} in the component metadata is not allowed`));
    }
    if (name === 'template' && ts.isPropertyAssignment(property)) templateNode = property.initializer;
  }
  if (templateNode && (ts.isNoSubstitutionTemplateLiteral(templateNode) || ts.isStringLiteral(templateNode))) {
    const base = lineOf(templateNode) - 1;
    for (const item of angularTemplateRules(templateNode.text)) out.push({ ...item, line: base + item.line });
  }
  // String literals outside the template.
  const visit = (node) => {
    if (node === templateNode) return;
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !ts.isImportDeclaration(node.parent)) {
      for (const colour of findColours(stripVarNames(node.text), { identifiers: false })) {
        out.push(finding('HWC-LIVE6', lineOf(node), `raw colour ${colour.value} in a string`));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}

/** HWC-LIVE4 findings from a wrap result (unknown capitalised tags or unmatched hw- elements). */
export function unknownFindings(framework, unknown) {
  const where = { react: 'an export of @hawiyah/react', vue: 'an export of @hawiyah/vue', angular: 'a component of @hawiyah/angular' }[framework];
  return unknown.map((tag) => finding('HWC-LIVE4', tag.line, `<${tag.name}> is not ${where}`));
}
