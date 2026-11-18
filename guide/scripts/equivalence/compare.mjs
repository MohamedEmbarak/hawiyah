// Comparisons of the equivalence harness (contentPipeline.equivalence): the
// normalised DOM trees (first differing JSON path), the aria snapshots (first
// differing line) and the element screenshots (pixelmatch against vanilla).
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/** Frameworks in group order; vanilla is the reference of every pair. */
export const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];
export const REFERENCE = 'vanilla';

/** pixelmatch options and the allowed number of differing pixels. */
export const PIXEL_THRESHOLD = 0.1;
export const pixelLimit = (width, height) => Math.max(16, Math.floor(0.0005 * width * height));

const kindOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

function key(path, name) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? `${path}.${name}` : `${path}[${JSON.stringify(name)}]`;
}

/**
 * The first JSON path at which a and b differ, with both values, or null when they
 * are deep-equal. Arrays are compared index by index, then by length; objects by
 * their sorted key sets, then key by key.
 */
export function firstDifference(a, b, path = '$') {
  const ka = kindOf(a);
  const kb = kindOf(b);
  if (ka !== kb) return { path, a, b };
  if (ka === 'array') {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) {
      const found = firstDifference(a[i], b[i], `${path}[${i}]`);
      if (found) return found;
    }
    if (a.length !== b.length) return { path: `${path}[${n}]`, a: a[n], b: b[n] };
    return null;
  }
  if (ka === 'object') {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const name of keys) {
      if (!(name in a) || !(name in b)) return { path: key(path, name), a: a[name], b: b[name] };
      const found = firstDifference(a[name], b[name], key(path, name));
      if (found) return found;
    }
    return null;
  }
  return Object.is(a, b) ? null : { path, a, b };
}

const brief = (value) => {
  if (value === undefined) return '(absent)';
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

/** Pairs of the reference with each other framework present in `values`. */
function pairs(values) {
  return FRAMEWORKS.filter((framework) => framework !== REFERENCE && framework in values).map((framework) => [REFERENCE, framework]);
}

/**
 * A copy of a normalised tree without the attributes an approved known difference
 * leaves out: ignore is a list of { class, attribute }, and attribute is removed
 * only from elements whose hw- classes include class. Everything else is kept.
 */
export function withoutIgnored(tree, ignore = []) {
  if (ignore.length === 0) return tree;
  const strip = (node) => {
    if (Array.isArray(node)) return node.map(strip);
    if (!node || typeof node !== 'object') return node;
    const classes = typeof node.attrs?.class === 'string' ? node.attrs.class.split(' ') : [];
    const attrs = { ...node.attrs };
    for (const rule of ignore) {
      if (classes.includes(rule.class)) delete attrs[rule.attribute];
    }
    return { ...node, attrs, children: strip(node.children ?? []) };
  };
  return strip(tree);
}

/** True when an element with the rule's class carries the rule's attribute anywhere in the tree. */
function carries(tree, rule) {
  const visit = (node) => {
    if (Array.isArray(node)) return node.some(visit);
    if (!node || typeof node !== 'object') return false;
    const classes = typeof node.attrs?.class === 'string' ? node.attrs.class.split(' ') : [];
    if (classes.includes(rule.class) && rule.attribute in (node.attrs ?? {})) return true;
    return visit(node.children ?? []);
  };
  return visit(tree);
}

/**
 * Structure: every framework's normalised tree must deep-equal vanilla's.
 * `ignore` documents attributes the reference does not write (leadAmendments A8):
 * they are left out of the other frameworks' trees only, so
 * - a reference that does write one fails as a stale entry, and
 * - the other frameworks are also compared with each other in full, so a wrong
 *   value of an ignored attribute in one of them is still reported.
 * Returns one result per pair: { pair, equal, path?, message? }.
 */
export function compareStructure(trees, ignore = []) {
  const different = (a, b, found, note = '') => ({
    pair: `${a}-${b}`,
    equal: false,
    path: found.path,
    message: `${a} and ${b} differ at ${found.path}: ${a} ${brief(found.a)}, ${b} ${brief(found.b)}${note}`,
  });
  const results = pairs(trees).map(([a, b]) => {
    const stale = ignore.find((rule) => carries(trees[a], rule));
    if (stale) {
      return {
        pair: `${a}-${b}`,
        equal: false,
        path: '$',
        message: `the documented difference no longer applies: ${a} writes ${stale.attribute} on .${stale.class}; remove the entry`,
      };
    }
    const found = firstDifference(trees[a], withoutIgnored(trees[b], ignore));
    return found ? different(a, b, found) : { pair: `${a}-${b}`, equal: true };
  });
  if (ignore.length === 0) return results;
  const others = FRAMEWORKS.filter((framework) => framework !== REFERENCE && framework in trees);
  for (const framework of others.slice(1)) {
    const found = firstDifference(trees[others[0]], trees[framework]);
    results.push(found ? different(others[0], framework, found) : { pair: `${others[0]}-${framework}`, equal: true });
  }
  return results;
}

/** Accessibility: the aria snapshot strings must be equal; reports the first differing line. */
export function compareAria(snapshots) {
  return pairs(snapshots).map(([a, b]) => {
    if (snapshots[a] === snapshots[b]) return { pair: `${a}-${b}`, equal: true };
    const la = snapshots[a].split('\n');
    const lb = snapshots[b].split('\n');
    let line = 0;
    while (line < la.length && line < lb.length && la[line] === lb[line]) line += 1;
    return {
      pair: `${a}-${b}`,
      equal: false,
      line: line + 1,
      message: `${a} and ${b} aria snapshots differ at line ${line + 1}: ${a} ${brief(la[line])}, ${b} ${brief(lb[line])}`,
    };
  });
}

/**
 * Screenshot of one framework against the reference: equal size in device pixels
 * and at most pixelLimit(width, height) differing pixels (threshold 0.1,
 * includeAA false). Returns { equal, width, height, differing, limit, message?, diff? }
 * where diff is the PNG buffer of the pixelmatch output when the sizes match.
 */
export function compareScreenshot(reference, other) {
  const a = PNG.sync.read(reference);
  const b = PNG.sync.read(other);
  if (a.width !== b.width || a.height !== b.height) {
    return {
      equal: false,
      width: b.width,
      height: b.height,
      differing: null,
      limit: null,
      message: `size ${b.width}x${b.height} differs from ${a.width}x${a.height}`,
    };
  }
  const { width, height } = a;
  const out = new PNG({ width, height });
  const differing = pixelmatch(a.data, b.data, out.data, width, height, { threshold: PIXEL_THRESHOLD, includeAA: false });
  const limit = pixelLimit(width, height);
  const result = { equal: differing <= limit, width, height, differing, limit };
  if (!result.equal) {
    result.message = `${differing} differing pixels in ${width}x${height} (limit ${limit})`;
    result.diff = PNG.sync.write(out);
  }
  return result;
}

/** compareScreenshot for each framework against vanilla. */
export function compareScreenshots(images) {
  return pairs(images).map(([a, b]) => ({ pair: `${a}-${b}`, framework: b, ...compareScreenshot(images[a], images[b]) }));
}
