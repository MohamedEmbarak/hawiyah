// Attribute selectors of the published stylesheet on component classes (5a.3).
// A component without a vanilla controller is compared with the union of its
// rows in the styles README contract and the attributes that a selector of the
// installed @hawiyah/styles dist/styles.css puts in the same compound as one of
// the component's classes (components.json cssClasses): `.hw-button[data-size='sm']`
// gives data-size with the value sm, `.hw-button[data-icon-only]` gives the
// presence attribute data-icon-only. Classes and attributes inside :is(), :where()
// and :not() of the compound count; those inside :has() belong to another element
// and do not. An attribute matched with another operator (^=, *=, ~=, ...) has no
// enumerable value.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export const PRESENCE = Symbol('presence');
export const OPEN = Symbol('any value');

const INNER = new Set([':is', ':where', ':not', ':matches', ':-webkit-any']);

/** Splits a selector's nodes into compounds at combinators. */
function compounds(selector) {
  const out = [[]];
  for (const node of selector.nodes) {
    if (node.type === 'combinator') out.push([]);
    else if (node.type !== 'comment') out[out.length - 1].push(node);
  }
  return out.filter((list) => list.length > 0);
}

/** Classes and attributes of one compound, with those of its :is(), :where() and :not() lists. */
function compoundParts(nodes) {
  const classes = new Set();
  const attributes = [];
  for (const node of nodes) {
    if (node.type === 'class') classes.add(node.value);
    else if (node.type === 'attribute') attributes.push(node);
    else if (node.type === 'pseudo' && INNER.has(node.value.toLowerCase())) {
      for (const inner of node.nodes) {
        const parts = compounds(inner);
        if (parts.length !== 1) continue; // a complex selector inside names another element
        const nested = compoundParts(parts[0]);
        if (node.value.toLowerCase() !== ':not') nested.classes.forEach((name) => classes.add(name));
        attributes.push(...nested.attributes);
      }
    }
  }
  return { classes, attributes };
}

/**
 * { [class]: Map<attribute, Set<value | PRESENCE | OPEN>> } for every class of the stylesheet
 * that shares a compound with an attribute selector, and the set of classes any rule selects.
 */
export function selectorAttributesOf(css) {
  const byClass = new Map();
  const selected = new Set();
  const add = (name, attribute) => {
    if (!byClass.has(name)) byClass.set(name, new Map());
    const map = byClass.get(name);
    const key = attribute.attribute.toLowerCase();
    if (!map.has(key)) map.set(key, new Set());
    const values = map.get(key);
    if (!attribute.operator) values.add(PRESENCE);
    else if (attribute.operator === '=') values.add(attribute.value);
    else values.add(OPEN);
  };
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    let root;
    try {
      root = selectorParser().astSync(rule.selector);
    } catch {
      return;
    }
    for (const selector of root.nodes) {
      for (const compound of compounds(selector)) {
        const { classes, attributes } = compoundParts(compound);
        classes.forEach((name) => selected.add(name));
        for (const name of classes) for (const attribute of attributes) add(name, attribute);
      }
    }
  });
  return { byClass, selected };
}

export function readSelectorAttributes(nodeModules) {
  return selectorAttributesOf(readFileSync(join(nodeModules, '@hawiyah', 'styles', 'dist', 'styles.css'), 'utf8'));
}

/**
 * The attributes the stylesheet selects on the given classes:
 * Map<attribute, { values: string[], presence: boolean, open: boolean }>, attribute names in stylesheet order.
 */
export function attributesFor(selectors, classes) {
  const out = new Map();
  for (const name of classes) {
    for (const [attribute, values] of selectors.byClass.get(name) ?? []) {
      if (!out.has(attribute)) out.set(attribute, { values: new Set(), presence: false, open: false });
      const entry = out.get(attribute);
      for (const value of values) {
        if (value === PRESENCE) entry.presence = true;
        else if (value === OPEN) entry.open = true;
        else entry.values.add(value);
      }
    }
  }
  return new Map([...out].map(([key, entry]) => [key, { values: [...entry.values].sort(), presence: entry.presence, open: entry.open }]));
}
