// Defaults of React props, read from the published JavaScript of @hawiyah/react:
// the destructuring defaults of the component function's props parameter
// (`function Button({ variant = 'primary', ... })`), or of the first
// destructuring of a props parameter in the body (`const { variant = 'segmented' }
// = props`). A component made by a local factory (`nativeLayout('div', 'stack')`)
// is the function the factory returns; a component that renders another local
// component with its props spread (`_jsx(Choice, { ...props, kind })`) takes that
// component's defaults. A literal initialiser is the default in the written form
// (types.mjs literalOf); any other initialiser is computed and gives an em dash.
import { functionOf, resolveLocal, resolvePackageExport, returnedExpressions, sourceOf } from './published-js.mjs';
import { EM_DASH, literalOf } from './types.mjs';

function bindingName(ts, element) {
  const key = element.propertyName ?? element.name;
  if (ts.isIdentifier(key) || ts.isStringLiteral(key)) return key.text;
  return null;
}

/** The component function of an export: a function, or the function a local factory returns. */
function componentFunction(published, found) {
  const { ts } = published;
  const direct = functionOf(ts, found.node);
  if (direct) return { module: found.module, fn: direct };
  const init = ts.isVariableDeclaration(found.node) ? found.node.initializer : null;
  if (init && ts.isIdentifier(init)) {
    const followed = resolveLocal(published, found.module, init.text);
    return followed ? componentFunction(published, followed) : null;
  }
  if (init && ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
    const factory = resolveLocal(published, found.module, init.expression.text);
    const fn = factory && functionOf(ts, factory.node);
    if (fn) {
      for (const expression of returnedExpressions(ts, fn)) {
        const inner = functionOf(ts, expression);
        if (inner) return { module: factory.module, fn: inner };
      }
    }
  }
  return null;
}

/** Calls in a function body that render a local component with the props spread: _jsx(Inner, { ...props }). */
function delegations(ts, fn, propsName) {
  const out = [];
  const visit = (node) => {
    if (node !== fn && (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))) return;
    if (ts.isCallExpression(node) && node.arguments.length >= 2 && ts.isIdentifier(node.arguments[0]) && ts.isObjectLiteralExpression(node.arguments[1])) {
      const spreads = node.arguments[1].properties.some((item) => ts.isSpreadAssignment(item) && ts.isIdentifier(item.expression) && item.expression.text === propsName);
      if (spreads && /^_?jsxs?$|^createElement$/.test(node.expression.getText())) out.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(fn.body);
  return out;
}

function readFunction(published, module, fn, seen) {
  const { ts } = published;
  const defaults = new Map();
  const parameter = fn.parameters[0];
  if (!parameter) return { defaults, found: false };
  const add = (pattern) => {
    for (const element of pattern.elements) {
      if (element.dotDotDotToken) continue;
      const name = bindingName(ts, element);
      if (!name || defaults.has(name)) continue;
      if (element.initializer) {
        const text = literalOf(ts, element.initializer);
        defaults.set(name, { text: text ?? EM_DASH, computed: text === null, source: sourceOf(published, module, element) });
      } else defaults.set(name, { text: EM_DASH, computed: false, source: null });
    }
  };
  if (ts.isObjectBindingPattern(parameter.name)) {
    add(parameter.name);
    return { defaults, found: true };
  }
  if (!ts.isIdentifier(parameter.name) || !fn.body || !ts.isBlock(fn.body)) return { defaults, found: false };
  const propsName = parameter.name.text;
  let found = false;
  for (const statement of fn.body.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isObjectBindingPattern(declaration.name) && declaration.initializer && ts.isIdentifier(declaration.initializer) && declaration.initializer.text === propsName) {
        add(declaration.name);
        found = true;
      }
    }
  }
  for (const name of delegations(ts, fn, propsName)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const inner = resolveLocal(published, module, name);
    const innerFn = inner && functionOf(ts, inner.node);
    if (!innerFn) continue;
    const read = readFunction(published, inner.module, innerFn, seen);
    if (!read.found) continue;
    found = true;
    for (const [key, value] of read.defaults) if (!defaults.has(key)) defaults.set(key, value);
  }
  return { defaults, found };
}

/**
 * Defaults of the props of a React export.
 * @returns {{ defaults: Map<string, { text: string, computed: boolean, source: any }>, problems: string[] }}
 */
export function reactDefaults(published, exportName) {
  const found = resolvePackageExport(published, exportName);
  if (!found) return { defaults: new Map(), problems: [`the published JavaScript of @hawiyah/react has no export ${exportName}`] };
  const component = componentFunction(published, found);
  if (!component) return { defaults: new Map(), problems: [`the default reader finds no component function for ${exportName} in the published JavaScript of @hawiyah/react`] };
  const read = readFunction(published, component.module, component.fn, new Set([exportName]));
  if (!read.found) return { defaults: new Map(), problems: [`the default reader finds no destructuring of the props of ${exportName} in the published JavaScript of @hawiyah/react`] };
  return { defaults: read.defaults, problems: [] };
}
