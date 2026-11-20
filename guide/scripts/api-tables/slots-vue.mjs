// Slots a Vue component of the published @hawiyah/vue build reads at run time
// (0.3.0 types no slot in its declarations). The reader walks the setup function
// of the component's defineComponent options and collects every read of its
// `slots` context:
//   slots.name, slots['name']        a slot named 'name';
//   slots[<expression>]              a dynamic slot name, kept with the text of
//                                    its expression; a page writes it through a
//                                    pattern entry of targets.mjs (VUE_SLOT_PATTERNS);
//   h(Component, props, slots)       every slot of Component (forwarded).
// Any other use of the slots object is a problem the reader reports, so a
// changed build fails loudly instead of losing slots.
import { followIdentifier, functionOf, propertyOf } from './published-js.mjs';
import { optionsOf, vueOptions } from './defaults-vue.mjs';

function setupFunction(ts, object) {
  const property = propertyOf(ts, object, 'setup') ?? propertyOf(ts, object, 'render');
  if (!property) return null;
  if (ts.isMethodDeclaration(property)) return property;
  if (ts.isPropertyAssignment(property)) return functionOf(ts, property.initializer);
  return null;
}

/** Names that hold the slots object in a setup function: the destructured `slots` or `<ctx>.slots`. */
function slotHolders(ts, fn) {
  const context = fn.parameters[1];
  if (!context) return { names: new Set(), contexts: new Set() };
  if (ts.isObjectBindingPattern(context.name)) {
    const names = new Set();
    for (const element of context.name.elements) {
      const key = (element.propertyName ?? element.name);
      if (ts.isIdentifier(key) && key.text === 'slots' && ts.isIdentifier(element.name)) names.add(element.name.text);
    }
    return { names, contexts: new Set() };
  }
  if (ts.isIdentifier(context.name)) return { names: new Set(), contexts: new Set([context.name.text]) };
  return { names: new Set(), contexts: new Set() };
}

function normalise(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * @returns {{ named: string[], dynamic: string[], problems: string[] }}
 */
export function readSlots(published, module, object, label, seen = new Set()) {
  const { ts } = published;
  const named = new Set();
  const dynamic = new Set();
  const problems = [];
  const fn = setupFunction(ts, object);
  if (!fn) return { named: [], dynamic: [], problems };
  const { names, contexts } = slotHolders(ts, fn);
  const isSlots = (node) => (ts.isIdentifier(node) && names.has(node.text))
    || (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && contexts.has(node.expression.text) && node.name.text === 'slots');
  const visit = (node) => {
    if (isSlots(node)) {
      const parent = node.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === node) named.add(parent.name.text);
      else if (ts.isElementAccessExpression(parent) && parent.expression === node) {
        const argument = parent.argumentExpression;
        if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) named.add(argument.text);
        else dynamic.add(normalise(argument.getText()));
      } else if (ts.isCallExpression(parent) && parent.arguments[2] === node && ts.isIdentifier(parent.expression) && parent.expression.text === 'h') {
        const target = parent.arguments[0];
        const followed = followIdentifier(published, module, target);
        const options = followed ? optionsOf(published, followed.module, followed.node) : null;
        const key = target.getText();
        if (!options) problems.push(`${label} forwards its slots to ${key}, which the slot reader cannot follow`);
        else if (!seen.has(key)) {
          seen.add(key);
          const inner = readSlots(published, options.module, options.object, `${label} (forwarded to ${key})`, seen);
          inner.named.forEach((name) => named.add(name));
          inner.dynamic.forEach((name) => dynamic.add(name));
          problems.push(...inner.problems);
        }
      } else if (!(ts.isBindingElement(parent) || ts.isParameter(parent))) {
        problems.push(`${label} uses its slots object as "${normalise(parent.getText()).slice(0, 80)}", which the slot reader does not know`);
      }
      return;
    }
    if (ts.isIdentifier(node) && node.text === 'useSlots' && ts.isCallExpression(node.parent)) problems.push(`${label} calls useSlots(), which the slot reader does not follow`);
    ts.forEachChild(node, visit);
  };
  if (fn.body) visit(fn.body);
  return { named: [...named], dynamic: [...dynamic], problems };
}

/** Slots of a Vue export read at run time. */
export function vueSlots(published, exportName) {
  const options = vueOptions(published, exportName);
  if (!options) return { named: [], dynamic: [], problems: [`the slot reader finds no defineComponent options for ${exportName} in the published JavaScript of @hawiyah/vue`] };
  return readSlots(published, options.module, options.object, exportName, new Set([exportName]));
}

