// Source rules L-SRC-1 to L-SRC-9 (lint.sources) over every *.ts and *.mjs
// file under src/ and scripts/ except test fixtures (and src/generated/),
// parsed with the TypeScript compiler. *.spec.ts files are exempt from
// L-SRC-3 only.

import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { findColours } from './colours.mjs';
import { finding, listFiles } from './files.mjs';

const SERVER_DOM_SHIMS = ['@angular/platform-server/init', 'domino', '@angular/domino', 'jsdom', 'happy-dom', 'linkedom', 'undom'];
const DOM_GLOBALS = /^(?:window|document|navigator|location|history|localStorage|sessionStorage|self|customElements|matchMedia|getComputedStyle|requestAnimationFrame|cancelAnimationFrame|DOMParser|MutationObserver|ResizeObserver|IntersectionObserver|CSS|Node|Element|Document|DocumentFragment|ShadowRoot|Text|Comment|Event|CustomEvent|EventTarget|KeyboardEvent|MouseEvent|PointerEvent|FocusEvent|InputEvent|HTMLElement|SVGElement|(?:HTML|SVG)\w*Element|Window)$/;
const BANNED_HYDRATION = ['withNoDomReuse', 'withIncrementalHydration', 'ngSkipHydration'];
const COLOUR_FILES = new Set(['src/app/features/editor/code-theme.ts', 'src/app/examples/frame/document.ts']);
const PREVIEW_FRAME = 'src/app/examples/frame/preview-frame.ts';
const LINK_NAVIGATION = 'src/app/core/link-navigation.ts';
const REPOSITORY_DIRS = /^(?:packages|apps|examples)(?:\/|$)/;
const UNSAFE_HTML = ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'setHTMLUnsafe', 'parseHTMLUnsafe', 'createContextualFragment'];

export function listSourceFiles(root) {
  const accept = (path) => /\.(?:ts|mjs)$/.test(path) && !path.endsWith('.d.ts');
  return [...listFiles(root, 'src', accept), ...listFiles(root, 'scripts', accept)].sort();
}

function specifierTarget(root, file, specifier) {
  // Path of a relative specifier, relative to the repository (root/..).
  return relative(resolve(root, '..'), resolve(dirname(join(root, file)), specifier)).split('\\').join('/');
}

export function lintSourceText(file, text, { root = '.' } = {}) {
  const out = [];
  const kind = file.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const at = (node) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    return [line + 1, character + 1];
  };
  const push = (rule, node, message) => out.push(finding(rule, file, ...at(node), message));
  const inSrc = file.startsWith('src/');
  const inApp = file.startsWith('src/app/');
  const isSpec = file.endsWith('.spec.ts');

  const checkSpecifier = (node, specifier) => {
    if (inSrc && SERVER_DOM_SHIMS.some((shim) => specifier === shim || specifier.startsWith(`${shim}/`))) {
      push('L-SRC-1', node, `imports the server DOM shim '${specifier}'`);
    }
    const repoPath = /^\.\.?\//.test(specifier)
      ? REPOSITORY_DIRS.test(specifierTarget(root, file, specifier))
      : /(?:^|\/)(?:packages|apps|examples)\//.test(specifier) && !specifier.startsWith('@');
    if (repoPath || /^\/(?:home|tmp|Users)\//.test(specifier)) {
      push('L-SRC-7', node, `imports '${specifier}' from a repository path; use the installed package`);
    }
  };

  const globalTarget = (expression) => {
    // globalThis.window, global.document, globalThis['navigator'].
    if (!ts.isPropertyAccessExpression(expression) && !ts.isElementAccessExpression(expression)) return null;
    let object = expression.expression;
    while (ts.isParenthesizedExpression(object) || ts.isAsExpression(object) || ts.isNonNullExpression(object)
      || ts.isTypeAssertionExpression(object) || ts.isSatisfiesExpression(object)) object = object.expression;
    if (!ts.isIdentifier(object) || !['globalThis', 'global'].includes(object.text)) return null;
    const name = ts.isPropertyAccessExpression(expression)
      ? expression.name.text
      : (ts.isStringLiteralLike(expression.argumentExpression) ? expression.argumentExpression.text : '');
    return DOM_GLOBALS.test(name) ? `${object.text}.${name}` : null;
  };

  const visit = (node) => {
    // Imports (L-SRC-1, L-SRC-7).
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      checkSpecifier(node.moduleSpecifier, node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      checkSpecifier(node.arguments[0], node.arguments[0].text);
    }

    // L-SRC-2: DOM globals assigned on the global object.
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
      && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const target = globalTarget(node.left);
      if (target) push('L-SRC-2', node, `assigns ${target}; the server render has no DOM shim`);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression) && ['Object', 'Reflect'].includes(node.expression.expression.text)
      && ['defineProperty', 'set'].includes(node.expression.name.text)) {
      const [object, key] = node.arguments;
      if (object && ts.isIdentifier(object) && ['globalThis', 'global'].includes(object.text)
        && key && ts.isStringLiteralLike(key) && DOM_GLOBALS.test(key.text)) {
        push('L-SRC-2', node, `defines ${object.text}.${key.text}; the server render has no DOM shim`);
      }
    }

    // L-SRC-3: platform checks in src/app/.
    if (inApp && !isSpec) {
      if (ts.isTypeOfExpression(node) && ts.isIdentifier(node.expression) && ['window', 'document', 'navigator'].includes(node.expression.text)) {
        push('L-SRC-3', node, `typeof ${node.expression.text}; use afterNextRender or afterRenderEffect for browser-only work`);
      }
      if (ts.isIdentifier(node) && ['isPlatformBrowser', 'isPlatformServer', 'PLATFORM_ID'].includes(node.text)
        && !(ts.isImportSpecifier(node.parent) && node.parent.propertyName === node)) {
        push('L-SRC-3', node, `${node.text}; use afterNextRender or afterRenderEffect for browser-only work`);
      }
    }

    // L-SRC-4: banned hydration options anywhere.
    if (ts.isIdentifier(node) && BANNED_HYDRATION.includes(node.text)) {
      push('L-SRC-4', node, `${node.text} is not allowed`);
    }
    if (inSrc && ts.isStringLiteralLike(node)) {
      const banned = BANNED_HYDRATION.find((word) => node.text.includes(word));
      if (banned) push('L-SRC-4', node, `${banned} is not allowed`);
    }

    // L-SRC-5: unsafe HTML in src/app/.
    if (inApp) {
      if (ts.isIdentifier(node) && (node.text === 'DomSanitizer' || node.text.startsWith('bypassSecurityTrust'))) {
        if (!(ts.isImportSpecifier(node.parent) && node.parent.propertyName === node)) push('L-SRC-5', node, `${node.text} is not allowed`);
      }
      if (ts.isPropertyAccessExpression(node) && UNSAFE_HTML.includes(node.name.text)) {
        push('L-SRC-5', node.name, `.${node.name.text} is not allowed`);
      }
      if (ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression)
        && [...UNSAFE_HTML, 'srcdoc'].includes(node.argumentExpression.text) && !(node.argumentExpression.text === 'srcdoc' && file === PREVIEW_FRAME)) {
        push('L-SRC-5', node.argumentExpression, `['${node.argumentExpression.text}'] is not allowed`);
      }
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
        && ['setAttribute', 'setAttributeNS'].includes(node.expression.name.text)) {
        const nameArgument = node.arguments[node.expression.name.text === 'setAttributeNS' ? 1 : 0];
        if (nameArgument && ts.isStringLiteralLike(nameArgument) && nameArgument.text.toLowerCase() === 'srcdoc' && file !== PREVIEW_FRAME) {
          push('L-SRC-5', nameArgument, "setAttribute('srcdoc') is not allowed");
        }
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(node.left) && node.left.name.text === 'srcdoc' && file !== PREVIEW_FRAME) {
        push('L-SRC-5', node.left.name, '.srcdoc is assigned only in examples/frame/preview-frame.ts');
      }
    }

    // L-SRC-6: @Component metadata.
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const callee = node.expression.expression;
      const name = ts.isIdentifier(callee) ? callee.text : '';
      const [argument] = node.expression.arguments;
      if (name === 'Component' && argument && ts.isObjectLiteralExpression(argument)) {
        for (const property of argument.properties) {
          const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : '';
          if (key === 'styles') push('L-SRC-6', property, 'component metadata has styles; use a styleUrl file');
          // Only the default, written out: an alias, a constant or a number could hide None or ShadowDom.
          if (key === 'encapsulation' && (!ts.isPropertyAssignment(property) || property.initializer.getText(source) !== 'ViewEncapsulation.Emulated')) {
            push('L-SRC-6', property, `encapsulation ${ts.isPropertyAssignment(property) ? property.initializer.getText(source) : property.getText(source)} is not allowed; omit it or write ViewEncapsulation.Emulated`);
          }
        }
      }
    }

    // L-SRC-6: ViewEncapsulation under another name.
    if (ts.isImportSpecifier(node) && (node.propertyName?.text ?? node.name.text) === 'ViewEncapsulation' && node.name.text !== 'ViewEncapsulation') {
      push('L-SRC-6', node, `ViewEncapsulation imported as ${node.name.text}; import it under its own name`);
    }

    // L-SRC-8: raw colours in the editor theme and the frame document.
    if (COLOUR_FILES.has(file) && (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node))) {
      for (const colour of findColours(node.text)) {
        if (colour.kind === 'system' || ['transparent'].includes(colour.value.toLowerCase())) continue;
        push('L-SRC-8', node, `raw colour ${colour.value}; use a var(--hw-*) token`);
      }
    }

    // L-SRC-9: console in src/app/.
    if (inApp && ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'console') {
      const method = node.expression.name.text;
      if (method === 'log') push('L-SRC-9', node, 'console.log is not allowed');
      else if ((method === 'warn' || method === 'error') && file !== LINK_NAVIGATION) {
        push('L-SRC-9', node, `console.${method} is allowed only in core/link-navigation.ts error paths`);
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(source);

  // L-SRC-4: app.config.ts provides hydration exactly once, with event replay only.
  if (file === 'src/app/app.config.ts') {
    const calls = [];
    const collect = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'provideClientHydration') calls.push(node);
      ts.forEachChild(node, collect);
    };
    collect(source);
    const exact = (call) => call.arguments.length === 1 && ts.isCallExpression(call.arguments[0])
      && ts.isIdentifier(call.arguments[0].expression) && call.arguments[0].expression.text === 'withEventReplay'
      && call.arguments[0].arguments.length === 0;
    for (const call of calls) {
      if (!exact(call)) push('L-SRC-4', call, `${call.getText(source)} must be provideClientHydration(withEventReplay())`);
    }
    if (calls.length !== 1) {
      out.push(finding('L-SRC-4', file, 1, 1, `provideClientHydration(withEventReplay()) appears ${calls.length} times; expected exactly once`));
    }
  }
  return out;
}

export function lintSources(root, files = listSourceFiles(root)) {
  const findings = [];
  for (const file of files) findings.push(...lintSourceText(file, readFileSync(join(root, file), 'utf8'), { root }));
  return { files: files.length, findings };
}
