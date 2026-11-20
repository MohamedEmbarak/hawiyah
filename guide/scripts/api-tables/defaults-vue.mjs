// Defaults of Vue props, read from the runtime props object of the published
// @hawiyah/vue build: `defineComponent({ props: { variant: { type: String,
// default: 'primary' }, loading: Boolean } })`. A component made by a local
// factory (`textControl('input', 'hw-input', 'HwTextField')`) is the
// defineComponent object the factory returns; spread props objects
// (`...decorationProps`) are followed to their declaration in the package.
//   - `default: <literal>` is the default in the written form;
//   - a Boolean prop (alone or in a type array) without `default` is `false`: Vue
//     casts an absent Boolean prop to false;
//   - `default: undefined`, a default factory or any other expression, and a
//     required prop, give an em dash.
import { followIdentifier, functionOf, propertyOf, resolveLocal, resolvePackageExport, returnedExpressions, sourceOf } from './published-js.mjs';
import { EM_DASH, literalOf } from './types.mjs';

function isDefineComponent(ts, node) {
  return node && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'defineComponent';
}

/** The options object of a Vue export: { module, object } or null. */
export function vueOptions(published, exportName) {
  const { ts } = published;
  const found = resolvePackageExport(published, exportName);
  if (!found) return null;
  return optionsOf(published, found.module, found.node);
}

/** The options object behind a declaration (defineComponent call or factory call). */
export function optionsOf(published, module, node) {
  const { ts } = published;
  const init = ts.isVariableDeclaration(node) ? node.initializer : node;
  if (!init) return null;
  if (ts.isIdentifier(init)) {
    const followed = followIdentifier(published, module, init);
    return followed ? optionsOf(published, followed.module, followed.node) : null;
  }
  if (isDefineComponent(ts, init)) {
    const [argument] = init.arguments;
    if (argument && ts.isObjectLiteralExpression(argument)) return { module, object: argument };
    const followed = followIdentifier(published, module, argument);
    if (followed?.node && ts.isVariableDeclaration(followed.node) && followed.node.initializer && ts.isObjectLiteralExpression(followed.node.initializer)) {
      return { module: followed.module, object: followed.node.initializer };
    }
    return null;
  }
  if (ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
    const factory = resolveLocal(published, module, init.expression.text);
    const fn = factory && functionOf(ts, factory.node);
    if (!fn) return null;
    for (const expression of returnedExpressions(ts, fn)) {
      if (isDefineComponent(ts, expression)) return optionsOf(published, factory.module, expression);
      if (ts.isIdentifier(expression) && fn.body && ts.isBlock(fn.body)) {
        // const component = defineComponent({ ... }); return component;
        for (const statement of fn.body.statements) {
          if (!ts.isVariableStatement(statement)) continue;
          for (const declaration of statement.declarationList.declarations) {
            if (ts.isIdentifier(declaration.name) && declaration.name.text === expression.text && isDefineComponent(ts, declaration.initializer)) {
              return optionsOf(published, factory.module, declaration.initializer);
            }
          }
        }
      }
    }
  }
  return null;
}

function propEntries(published, module, expression, seen = new Set()) {
  const { ts } = published;
  if (!expression) return [];
  if (ts.isIdentifier(expression)) {
    if (seen.has(expression.text)) return [];
    seen.add(expression.text);
    const followed = followIdentifier(published, module, expression);
    const node = followed?.node;
    if (node && ts.isBindingElement(node) && node.dotDotDotToken && ts.isVariableDeclaration(node.parent.parent) && node.parent.parent.initializer) {
      // const { formatValue: _unused, ...rest } = numberProps: the rest of that object.
      const left = new Set(node.parent.elements.filter((item) => item !== node).map((item) => (item.propertyName ?? item.name).getText()));
      return propEntries(published, followed.module, node.parent.parent.initializer, seen).filter((entry) => !left.has(entry.name));
    }
    const init = node && ts.isVariableDeclaration(node) ? node.initializer : null;
    return init ? propEntries(published, followed.module, init, seen) : [{ unknown: expression.text }];
  }
  if (!ts.isObjectLiteralExpression(expression)) return [{ unknown: expression.getText() }];
  const out = [];
  for (const property of expression.properties) {
    if (ts.isSpreadAssignment(property)) out.push(...propEntries(published, module, property.expression, seen));
    else if (ts.isPropertyAssignment(property) && property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) {
      out.push({ name: property.name.text, value: property.initializer, module });
    } else if (ts.isShorthandPropertyAssignment(property)) out.push({ name: property.name.text, value: property.name, module });
  }
  return out;
}

function includesBoolean(ts, node) {
  if (!node) return false;
  if (ts.isIdentifier(node)) return node.text === 'Boolean';
  if (ts.isArrayLiteralExpression(node)) return node.elements.some((item) => ts.isIdentifier(item) && item.text === 'Boolean');
  return false;
}

/**
 * Defaults of the props of a Vue export.
 * @returns {{ defaults: Map<string, { text: string, computed: boolean, source: any }>, problems: string[] }}
 */
export function vueDefaults(published, exportName) {
  const { ts } = published;
  const options = vueOptions(published, exportName);
  if (!options) return { defaults: new Map(), problems: [`the default reader finds no defineComponent options for ${exportName} in the published JavaScript of @hawiyah/vue`] };
  const defaults = new Map();
  const problems = [];
  const props = propertyOf(ts, options.object, 'props');
  if (!props) return { defaults, problems };
  if (!ts.isPropertyAssignment(props)) return { defaults, problems: [`the props of ${exportName} are not an object the default reader can read`] };
  for (const entry of propEntries(published, options.module, props.initializer)) {
    if (entry.unknown) {
      problems.push(`the props of ${exportName} spread ${entry.unknown}, which the default reader cannot follow`);
      continue;
    }
    const { name, value, module } = entry;
    let text = EM_DASH;
    let computed = false;
    let source = null;
    if (ts.isObjectLiteralExpression(value)) {
      const required = propertyOf(ts, value, 'required');
      const fallback = propertyOf(ts, value, 'default');
      const type = propertyOf(ts, value, 'type');
      if (required && ts.isPropertyAssignment(required) && required.initializer.kind === ts.SyntaxKind.TrueKeyword) text = EM_DASH;
      else if (fallback && ts.isPropertyAssignment(fallback)) {
        const literal = literalOf(ts, fallback.initializer);
        text = literal ?? EM_DASH;
        computed = literal === null && !(ts.isIdentifier(fallback.initializer) && fallback.initializer.text === 'undefined');
        source = sourceOf(published, module, fallback);
      } else if (type && ts.isPropertyAssignment(type) && includesBoolean(ts, type.initializer)) {
        text = 'false';
        source = sourceOf(published, module, value.parent);
      }
    } else if (includesBoolean(ts, value)) {
      text = 'false';
      source = sourceOf(published, module, value.parent);
    }
    if (!defaults.has(name)) defaults.set(name, { text, computed, source });
  }
  return { defaults, problems };
}
