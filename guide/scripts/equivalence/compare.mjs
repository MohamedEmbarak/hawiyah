// Comparisons of the equivalence harness (contentPipeline.equivalence): the
// normalised DOM trees (every differing JSON path, at most 20 printed per pair), the aria snapshots (first
// differing line) and the element screenshots (pixelmatch against vanilla).
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/** Frameworks in group order; vanilla is the reference of every pair. */
export const FRAMEWORKS = ['vanilla', 'react', 'vue', 'angular'];
export const REFERENCE = 'vanilla';

/**
 * pixelmatch options and the allowed number of differing pixels. Threshold 0.005,
 * the lowest of 0.005 and 0.01 that stayed green in three full runs of step 80 (four
 * in a row, after the pointer is moved out of the frames at the start of a group and
 * of a check). Measured with pixelmatch 8.0.0 over a uniform 200x50 area: of the 112
 * hex colours of @hawiyah/tokens, one pair passes as equal (#b54708 and #b54707);
 * a neutral 249,250,251 against the same grey lowered by 1 passes, by 2 fails.
 * includeAA false keeps anti-aliasing out; the pixel-count limit covers geometry.
 */
export const PIXEL_THRESHOLD = 0.005;
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

/**
 * Every JSON path at which a and b differ, with both values, in the order in which
 * firstDifference walks the trees (its result is the first item): a path whose kinds
 * differ, a key that one side lacks, an index beyond the shorter array, and every
 * differing leaf below paths where both sides have the same kind. Each path is listed
 * once.
 */
export function differences(a, b, path = '$', out = []) {
  const ka = kindOf(a);
  const kb = kindOf(b);
  if (ka !== kb) out.push({ path, a, b });
  else if (ka === 'array') {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) differences(a[i], b[i], `${path}[${i}]`, out);
    for (let i = n; i < Math.max(a.length, b.length); i += 1) out.push({ path: `${path}[${i}]`, a: a[i], b: b[i] });
  } else if (ka === 'object') {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const name of keys) {
      if (!(name in a) || !(name in b)) out.push({ path: key(path, name), a: a[name], b: b[name] });
      else differences(a[name], b[name], key(path, name), out);
    }
  } else if (!Object.is(a, b)) out.push({ path, a, b });
  return out;
}

/** At most this many differences of one pair are printed (HWE-STRUCT); the rest are counted. */
export const PRINTED_DIFFERENCES = 20;

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

/**
 * A copy of a normalised tree without the designed differences of its component
 * (the lists empty-elements.json and vanilla-hooks.json):
 * every element whose class list has a class of `emptyClasses` and that has no child
 * and no text is left out, in every framework's tree, so an adapter that always
 * renders the empty region compares equal with one that renders it only with
 * content (a non-empty element is compared as before); and on the vanilla tree only,
 * each attribute of `vanillaAttributes` (a configuration hook that the vanilla
 * controller reads) is left out of every element. Nothing else is changed.
 */
export function withoutDesigned(tree, { emptyClasses = [], vanillaAttributes = [] } = {}, framework = REFERENCE) {
  if (emptyClasses.length === 0 && (vanillaAttributes.length === 0 || framework !== REFERENCE)) return tree;
  const empty = (node) => (node.children ?? []).length === 0;
  const strip = (node) => {
    if (Array.isArray(node)) {
      return node.filter((child) => !(child && typeof child === 'object' && !Array.isArray(child) && empty(child)
        && typeof child.attrs?.class === 'string' && child.attrs.class.split(' ').some((name) => emptyClasses.includes(name)))).map(strip);
    }
    if (!node || typeof node !== 'object') return node;
    const attrs = { ...node.attrs };
    if (framework === REFERENCE) for (const attribute of vanillaAttributes) delete attrs[attribute];
    return { ...node, ...(node.attrs ? { attrs } : {}), ...(node.children ? { children: strip(node.children) } : {}) };
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
 * `ignore` documents attributes the reference does not write:
 * they are left out of the other frameworks' trees only, so
 * - a reference that does write one fails as a stale entry, and
 * - the other frameworks are also compared with each other in full, so a wrong
 *   value of an ignored attribute in one of them is still reported.
 * Returns one result per pair: { pair, equal, path?, message?, differences?, more? },
 * where path and message are those of the first difference, differences lists the
 * first PRINTED_DIFFERENCES differences as { path, message } and more counts the rest.
 */
export function compareStructure(trees, ignore = []) {
  const line = (a, b, found) => `${a} and ${b} differ at ${found.path}: ${a} ${brief(found.a)}, ${b} ${brief(found.b)}`;
  // Every difference of the pair: the first PRINTED_DIFFERENCES of them with their
  // message (the first is the message of the pair), and the number of the rest.
  const compared = (a, b, x, y) => {
    const found = differences(x, y);
    if (found.length === 0) return { pair: `${a}-${b}`, equal: true };
    return {
      pair: `${a}-${b}`,
      equal: false,
      path: found[0].path,
      message: line(a, b, found[0]),
      differences: found.slice(0, PRINTED_DIFFERENCES).map((item) => ({ path: item.path, message: line(a, b, item) })),
      more: Math.max(0, found.length - PRINTED_DIFFERENCES),
    };
  };
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
    return compared(a, b, trees[a], withoutIgnored(trees[b], ignore));
  });
  if (ignore.length === 0) return results;
  const others = FRAMEWORKS.filter((framework) => framework !== REFERENCE && framework in trees);
  for (const framework of others.slice(1)) results.push(compared(others[0], framework, trees[others[0]], trees[framework]));
  return results;
}

/**
 * The messages of a structure result that differs: one per printed difference, the
 * first being the result's message, and, when more differences exist, one line that
 * counts them. A result without a list of differences (a stale entry) has its message.
 */
export function structureMessages(result) {
  if (!Array.isArray(result.differences)) return [result.message];
  const [a, b] = result.pair.split('-');
  const rest = result.more > 0
    ? [`${a} and ${b}: ${result.more} further ${result.more === 1 ? 'difference' : 'differences'} not printed (at most ${PRINTED_DIFFERENCES} per pair)`]
    : [];
  return [...result.differences.map((item) => item.message), ...rest];
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
 * and at most pixelLimit(width, height) differing pixels (threshold 0.005,
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
    // Where they differ, so a failure can be read from a log without the images:
    // the box around the differing pixels (drawn in red by pixelmatch) and the
    // colour of the first one in each screenshot.
    let left = width, top = height, right = -1, bottom = -1, first = -1;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i] !== 255 || out.data[i + 1] !== 0 || out.data[i + 2] !== 0) continue;
      const x = (i / 4) % width, y = Math.floor(i / 4 / width);
      if (first < 0) first = i;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
    const rgb = (data, i) => `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
    const where = first < 0 ? '' : `, inside ${right - left + 1}x${bottom - top + 1} at ${left},${top}, first ${rgb(a.data, first)} against ${rgb(b.data, first)}`;
    result.message = `${differing} differing pixels in ${width}x${height} (limit ${limit})${where}`;
    result.diff = PNG.sync.write(out);
  }
  return result;
}

/** compareScreenshot for each framework against vanilla. */
export function compareScreenshots(images) {
  return pairs(images).map(([a, b]) => ({ pair: `${a}-${b}`, framework: b, ...compareScreenshot(images[a], images[b]) }));
}
