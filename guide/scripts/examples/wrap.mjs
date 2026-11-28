// Fragment and module forms of live blocks to complete files per framework
// (contentPipeline.liveBlocks.forms). A fragment is wrapped with the automatic
// imports of the components it uses; a module is used as written. Each result
// records lineOffset: the generated line of block line 1 minus one, so that a
// diagnostic on the generated file maps back to the Markdown source.
import { parse as parseVueSfc } from '@vue/compiler-sfc';
import ts from 'typescript';
import { angularImports } from './angular-imports.mjs';
import { reactExports, vueExports } from './exports.mjs';

export const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];
export const FRAME_SELECTOR = 'guide-example';

const indent = (code, prefix) => code.split('\n').map((line) => (line.trim() === '' ? '' : prefix + line)).join('\n');
const trimBlock = (code) => code.replace(/^\s*\n/, '').replace(/\s+$/, '');

/** 'fragment' or 'module' for a block of the given framework. */
export function detectForm(framework, code) {
  if (framework === 'react') return /\bexport\s+default\s+function\b/.test(code) ? 'module' : 'fragment';
  if (framework === 'vue') return /^<template[\s>]/m.test(code) ? 'module' : 'fragment';
  if (framework === 'angular') return code.includes('@Component(') && /\bexport\s+class\b/.test(code) ? 'module' : 'fragment';
  return 'fragment';
}

export const pascal = (value) => value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join('');

/** Class name of a native Angular example: <Pascal(id)><Pascal(example)><Lang>. */
export const nativeClassName = (id, example, lang) => `${pascal(id)}${pascal(example)}${pascal(lang)}`;

// ---------------------------------------------------------------- vanilla

export const VANILLA_MAIN = "import { enhance } from '@hawiyah/vanilla';\nenhance(document.getElementById('app'));\n";

export function wrapVanilla(code) {
  const html = `${trimBlock(code)}\n`;
  return {
    form: 'fragment',
    lineOffset: 0 - leadingBlankLines(code),
    files: { 'index.html': html, 'main.js': VANILLA_MAIN },
    primaryFile: 'index.html',
    html: trimBlock(code),
    unknown: [],
    imports: [],
  };
}

// ---------------------------------------------------------------- react

export const REACT_MAIN = "import { createRoot } from 'react-dom/client';\nimport Example from './Example';\n\ncreateRoot(document.getElementById('app')!).render(<Example />);\n";

/** Capitalised JSX tag names of a TSX source: [{ name, line }] (line is 1-based in `source`). */
export function jsxComponentTags(source, fileName = 'Example.tsx') {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const tags = [];
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      let root = node.tagName;
      while (ts.isPropertyAccessExpression(root)) root = root.expression;
      if (ts.isIdentifier(root) && /^[A-Z]/.test(root.text)) {
        tags.push({ name: root.text, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return tags;
}

export function wrapReact(code, fromDir) {
  const form = detectForm('react', code);
  const body = trimBlock(code);
  if (form === 'module') {
    return { form, lineOffset: 0 - leadingBlankLines(code), source: `${body}\n`, unknown: [], imports: [] };
  }
  const exportsOf = reactExports(fromDir);
  const tags = jsxComponentTags(`<>${body}</>`);
  const names = [...new Set(tags.map((tag) => tag.name))];
  const unknown = tags.filter((tag) => !exportsOf.has(tag.name)).map((tag) => ({ ...tag, line: tag.line + leadingBlankLines(code) }));
  const imports = names.filter((name) => exportsOf.has(name)).sort();
  const head = imports.length ? `import { ${imports.join(', ')} } from '@hawiyah/react';\n\n` : '';
  const prefix = `${head}export default function Example() {\n  return (\n    <>\n`;
  const source = `${prefix}${indent(body, '      ')}\n    </>\n  );\n}\n`;
  return { form, lineOffset: prefix.split('\n').length - 1 - leadingBlankLines(code), source, unknown, imports };
}

function leadingBlankLines(code) {
  const match = /^(\s*\n)*/.exec(code);
  return match ? match[0].split('\n').length - 1 : 0;
}

// ---------------------------------------------------------------- vue

export const VUE_MAIN = "import { createApp } from 'vue';\nimport Example from './Example.vue';\n\ncreateApp(Example).mount('#app');\n";

/** Capitalised element tags of a Vue SFC template: [{ name, line }] (line in the SFC source). */
export function vueComponentTags(sfcSource) {
  const { descriptor } = parseVueSfc(sfcSource, { filename: 'Example.vue' });
  const tags = [];
  const visit = (node) => {
    if (node.type === 1 && /^[A-Z]/.test(node.tag)) tags.push({ name: node.tag.split('.')[0], line: node.loc.start.line });
    for (const child of node.children ?? []) visit(child);
    for (const branch of node.branches ?? []) visit(branch);
  };
  if (descriptor.template?.ast) visit(descriptor.template.ast);
  return tags;
}

export function wrapVue(code, fromDir) {
  const form = detectForm('vue', code);
  const body = trimBlock(code);
  if (form === 'module') return { form, lineOffset: 0 - leadingBlankLines(code), source: `${body}\n`, unknown: [], imports: [] };
  const exportsOf = vueExports(fromDir);
  const probe = `<template>\n${body}\n</template>\n`;
  const tags = vueComponentTags(probe).map((tag) => ({ ...tag, line: tag.line - 1 }));
  const names = [...new Set(tags.map((tag) => tag.name))];
  const unknown = tags.filter((tag) => !exportsOf.has(tag.name)).map((tag) => ({ ...tag, line: tag.line + leadingBlankLines(code) }));
  const imports = names.filter((name) => exportsOf.has(name)).sort();
  const script = imports.length
    ? `<script setup lang="ts">\nimport { ${imports.join(', ')} } from '@hawiyah/vue';\n</script>\n\n`
    : '<script setup lang="ts">\n</script>\n\n';
  const prefix = `${script}<template>\n`;
  const source = `${prefix}${indent(body, '  ')}\n</template>\n`;
  return { form, lineOffset: prefix.split('\n').length - 1 - leadingBlankLines(code), source, unknown, imports };
}

// ---------------------------------------------------------------- angular

// No .catch: a rejected bootstrap (a template error of edited code) reaches the
// frame as an unhandled rejection, which fails the run at once with its message.
export const ANGULAR_MAIN = "import { bootstrapApplication } from '@angular/platform-browser';\nimport { Example } from './example.component';\n\nbootstrapApplication(Example);\n";

const FRAGMENT_TEMPLATE = /^template\s*:\s*`((?:[^`\\]|\\.)*)`\s*,?$/;

/** The exported @Component class of an Angular module source: { node, file, metadata } or null. */
export function findExampleClass(source) {
  const file = ts.createSourceFile('example.component.ts', source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  for (const statement of file.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue;
    if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    const decorator = (ts.getDecorators(statement) ?? []).find((d) => ts.isCallExpression(d.expression)
      && ts.isIdentifier(d.expression.expression) && d.expression.expression.text === 'Component');
    if (!decorator) continue;
    const metadata = decorator.expression.arguments[0];
    if (!metadata || !ts.isObjectLiteralExpression(metadata)) continue;
    return { node: statement, file, metadata };
  }
  return null;
}

const propertyNamed = (object, name) => object.properties.find((p) => ts.isPropertyAssignment(p) && p.name
  && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === name);

/** Template text and its 1-based start line in `source` for an Angular module source. */
export function moduleTemplate(source) {
  const found = findExampleClass(source);
  if (!found) return null;
  const property = propertyNamed(found.metadata, 'template');
  if (!property) return null;
  const init = property.initializer;
  if (!ts.isNoSubstitutionTemplateLiteral(init) && !ts.isStringLiteral(init)) return null;
  const line = found.file.getLineAndCharacterOfPosition(init.getStart(found.file)).line + 1;
  return { template: init.text, line };
}

/** Rewrites the exported component class: name and selector. */
export function rewriteAngularModule(source, { className, selector }) {
  const found = findExampleClass(source);
  if (!found) throw new Error('no exported @Component class');
  const edits = [];
  const oldName = found.node.name.text;
  const visit = (node) => {
    if (ts.isIdentifier(node) && node.text === oldName) edits.push([node.getStart(found.file), node.getEnd(), className]);
    ts.forEachChild(node, visit);
  };
  visit(found.file);
  const selectorProperty = propertyNamed(found.metadata, 'selector');
  const quoted = `'${selector}'`;
  if (selectorProperty) {
    edits.push([selectorProperty.initializer.getStart(found.file), selectorProperty.initializer.getEnd(), quoted]);
  } else {
    const brace = found.metadata.getStart(found.file) + 1;
    edits.push([brace, brace, `\n  selector: ${quoted},`]);
  }
  let out = source;
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, start) + text + out.slice(end);
  return out;
}

/**
 * Angular block to example.component.ts. `className` and `selector` name the
 * generated class (Example / guide-example for frames, the native name for the guide).
 */
export function wrapAngular(code, fromDir, { className = 'Example', selector = FRAME_SELECTOR } = {}) {
  const form = detectForm('angular', code);
  const body = trimBlock(code);
  const lead = leadingBlankLines(code);
  if (form === 'module') {
    const found = moduleTemplate(body);
    const source = `${rewriteAngularModule(body, { className, selector })}\n`;
    // The selector line may have been inserted: compute the offset from the template position.
    const after = moduleTemplate(source);
    const shift = found && after ? after.line - found.line : 0;
    return {
      form, source, lineOffset: shift - lead, unknown: [], imports: [], errors: [],
      template: found?.template ?? null, templateLine: found ? found.line + lead : 1,
    };
  }
  const match = FRAGMENT_TEMPLATE.exec(body.trim());
  if (!match) {
    return { form, source: null, lineOffset: 0, unknown: [], imports: [], template: null, templateLine: 1 + lead,
      errors: [{ line: 1 + lead, message: 'an Angular fragment is exactly one property: template: `...`' }] };
  }
  const template = match[1].replace(/\\`/g, '`');
  const { classes, unknown, errors } = angularImports(template, fromDir);
  const importLine = classes.length ? `import { ${classes.join(', ')} } from '@hawiyah/angular';\n` : '';
  const prefix = `import { Component } from '@angular/core';\n${importLine}\n@Component({\n  selector: '${selector}',\n  imports: [${classes.join(', ')}],\n`;
  const property = indent(body.trim().replace(/,\s*$/, ''), '  ');
  const source = `${prefix}${property},\n})\nexport class ${className} {}\n`;
  return {
    form, source, lineOffset: prefix.split('\n').length - 1 - lead, imports: classes, template, templateLine: 1 + lead,
    unknown: unknown.map((u) => ({ name: u.tag, line: u.line + lead })),
    errors: errors.map((e) => ({ line: e.line + lead, message: e.message })),
  };
}
