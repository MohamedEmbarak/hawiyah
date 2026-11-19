// The data-hw-* attributes that a selector of the installed @hawiyah/styles uses,
// each with the compound selectors that use it (attribute values and pseudo-classes
// removed, so the compound matches any value and any state). The structure
// comparison keeps such an attribute on every element that one of its compounds
// matches; a vanilla configuration hook is left out only where no rule of the
// package stylesheet can select it.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

/** { 'data-hw-<name>': [compound, ...] } from guide/node_modules/@hawiyah/styles/dist/styles.css. */
export function styledAttributes(guideDir) {
  const css = readFileSync(join(guideDir, 'node_modules', '@hawiyah', 'styles', 'dist', 'styles.css'), 'utf8');
  return styledAttributesOf(css);
}

export function styledAttributesOf(css) {
  const found = new Map();
  const add = (name, compound) => {
    if (!found.has(name)) found.set(name, new Set());
    found.get(name).add(compound);
  };
  const compoundOf = (attribute) => {
    // The simple selectors next to the attribute, up to a combinator on each side.
    const nodes = attribute.parent.nodes;
    let start = nodes.indexOf(attribute);
    let end = start;
    while (start > 0 && nodes[start - 1].type !== 'combinator') start -= 1;
    while (end < nodes.length - 1 && nodes[end + 1].type !== 'combinator') end += 1;
    const parts = [];
    for (const node of nodes.slice(start, end + 1)) {
      if (node.type === 'pseudo' || node.type === 'comment' || node.type === 'nesting') continue;
      if (node.type === 'attribute') parts.push(node.attribute.startsWith('data-hw') ? `[${node.attribute}]` : node.toString().trim());
      else parts.push(node.toString().trim());
    }
    // A type or universal selector has to come first.
    parts.sort((a, b) => Number(/^[a-z*]/i.test(b)) - Number(/^[a-z*]/i.test(a)));
    return parts.join('') || `[${attribute.attribute}]`;
  };
  postcss.parse(css).walkRules((rule) => {
    selectorParser((root) => {
      root.walkAttributes((attribute) => {
        if (/^data-hw-[a-z0-9-]+$/.test(attribute.attribute)) add(attribute.attribute, compoundOf(attribute));
      });
    }).processSync(rule.selector);
  });
  return Object.fromEntries([...found].sort(([a], [b]) => a.localeCompare(b)).map(([name, compounds]) => [name, [...compounds].sort()]));
}
