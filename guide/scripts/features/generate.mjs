// Feature aggregation (build step 10). Lists src/app/features/*/feature.ts in
// directory-name order and writes, without importing any of them:
//   src/generated/features.ts   static imports, sorted by order at run time
//   src/generated/features.json [{ id, order, paths, nav }] read from the source text
//   src/generated/pages.json    { components: [{ id, name, labelAr }] } for every
//                               docs/components/<id>.md whose id is in components.json
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const fail = (message) => {
  throw new Error(`features: ${message}`);
};

/** Index just past the bracket that closes the one at `open`, skipping strings and comments. */
function closing(text, open) {
  const pairs = { "[": "]", "{": "}", "(": ")" };
  const stack = [];
  for (let i = open; i < text.length; i += 1) {
    const c = text[i];
    if (c === "'" || c === '"' || c === "`") {
      i = skipString(text, i);
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      i = text.indexOf("\n", i);
      if (i < 0) return -1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2) + 1;
      if (i <= 0) return -1;
      continue;
    }
    if (pairs[c]) stack.push(pairs[c]);
    else if (c === "]" || c === "}" || c === ")") {
      if (stack.pop() !== c) return -1;
      if (stack.length === 0) return i + 1;
    }
  }
  return -1;
}

function skipString(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i += 1) {
    if (text[i] === "\\") i += 1;
    else if (text[i] === quote) return i;
  }
  return text.length;
}

/** The text of the bracketed value that follows `key:` (first occurrence), or null. */
function valueOf(text, key, open) {
  const match = new RegExp(`\\b${key}\\s*:\\s*\\${open}`).exec(text);
  if (!match) return null;
  const start = match.index + match[0].length - 1;
  const end = closing(text, start);
  if (end < 0) fail(`unbalanced ${key} value`);
  return text.slice(start, end);
}

/**
 * Full route paths of a routes array literal, children joined to their parent.
 * @param {string} block The routes array text, from '[' to ']'.
 */
export function routePaths(block) {
  const paths = [];
  // A frame per open bracket; route objects record their own path.
  const frames = [];
  const prefix = () => frames.filter((f) => f.path !== undefined).map((f) => f.path).filter(Boolean);
  for (let i = 0; i < block.length; i += 1) {
    const c = block[i];
    if (c === "'" || c === '"' || c === "`") {
      i = skipString(block, i);
      continue;
    }
    if (c === "/" && block[i + 1] === "/") {
      i = block.indexOf("\n", i);
      if (i < 0) break;
      continue;
    }
    if (c === "/" && block[i + 1] === "*") {
      i = block.indexOf("*/", i + 2) + 1;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") {
      frames.push({ c });
      continue;
    }
    if (c === "}" || c === "]" || c === ")") {
      frames.pop();
      continue;
    }
    if (c === "p" && /^path\s*:/.test(block.slice(i, i + 12)) && !/[\w$]/.test(block[i - 1] ?? "")) {
      const m = /^path\s*:\s*(['"])([^'"]*)\1/.exec(block.slice(i));
      if (!m) fail("a route path is not a string literal");
      const frame = frames[frames.length - 1];
      if (!frame || frame.c !== "{") fail("a path is outside a route object");
      const full = [...prefix(), m[2]].filter(Boolean).join("/");
      frame.path = m[2];
      if (!paths.includes(full)) paths.push(full);
      i += m[0].length - 1;
    }
  }
  return paths;
}

function parseNav(source, file) {
  const block = valueOf(source, "nav", "{");
  if (block === null) return undefined;
  const str = (re, what) => {
    const m = re.exec(block);
    if (!m) fail(`${file}: nav has no ${what}`);
    return m[2];
  };
  const bool = (key) => {
    const m = new RegExp(`\\b${key}\\s*:\\s*(true|false)`).exec(block);
    if (!m) fail(`${file}: nav has no ${key}: true or false`);
    return m[1] === "true";
  };
  const label = valueOf(block, "label", "{");
  if (label === null) fail(`${file}: nav has no label`);
  const path = str(/\bpath\s*:\s*(['"])([^'"]*)\1/, "path");
  if (!/^(?:[a-z0-9-]+\/)+$/.test(path)) fail(`${file}: nav path '${path}' must be relative and end in '/'`);
  const text = (lang) => {
    const m = new RegExp(`\\b${lang}\\s*:\\s*(['"])([^'"]+)\\1`).exec(label);
    if (!m) fail(`${file}: nav has no label.${lang}`);
    return m[2];
  };
  return {
    path,
    label: { en: text("en"), ar: text("ar") },
    header: bool("header"),
    footer: bool("footer"),
  };
}

/**
 * Reads one feature.ts source.
 * @param {string} text
 * @param {string} file For messages.
 */
export function parseFeature(text, file) {
  const id = /\bid\s*:\s*(['"])([a-z0-9-]+)\1/.exec(text)?.[2] ?? fail(`${file}: no id`);
  const orderMatch = /\border\s*:\s*(\d+)/.exec(text) ?? fail(`${file}: no numeric order`);
  const routes = valueOf(text, "routes", "[");
  if (routes === null) fail(`${file}: no routes array literal`);
  const paths = routePaths(routes);
  if (paths.length === 0 && /\{/.test(routes)) fail(`${file}: cannot read the route paths`);
  return { id, order: Number(orderMatch[1]), paths, nav: parseNav(text, file) };
}

const identifier = (id) => `${id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}Feature`;

/** The source of src/generated/features.ts. */
export function featuresModule(features) {
  const lines = [
    "// Generated by scripts/features/generate.mjs (build step 10). Do not edit.",
    "import type { GuideFeature } from '../app/core/feature';",
    ...features.map((f) => `import { feature as ${identifier(f.id)} } from '../app/features/${f.dir}/feature';`),
    "",
    "export const features: readonly GuideFeature[] = [",
    ...features.map((f) => `  ${identifier(f.id)},`),
    "].sort((a, b) => a.order - b.order);",
    "",
  ];
  return lines.join("\n");
}

/** Lists docs/components/<id>.md (not <id>.<lang>.md) whose id is in components.json. */
export function listPages({ docsDir, components }) {
  const known = new Map(components.map((c) => [c.id, c]));
  const files = existsSync(docsDir) ? readdirSync(docsDir) : [];
  const ids = files
    .filter((name) => /^[a-z0-9-]+\.md$/.test(name) && name !== "README.md")
    .map((name) => name.slice(0, -3))
    .filter((id) => known.has(id))
    .sort();
  return {
    components: ids.map((id) => {
      const entry = known.get(id);
      return { id, name: entry.name, labelAr: entry.labelAr };
    }),
  };
}

/**
 * @param {{ featuresDir: string, generatedDir: string, docsDir: string, componentsFile: string }} options
 */
export function generateFeatures({ featuresDir, generatedDir, docsDir, componentsFile }) {
  const dirs = existsSync(featuresDir)
    ? readdirSync(featuresDir)
        .filter((name) => statSync(join(featuresDir, name)).isDirectory())
        .filter((name) => existsSync(join(featuresDir, name, "feature.ts")))
        .sort()
    : [];
  const features = dirs.map((dir) => {
    const file = `src/app/features/${dir}/feature.ts`;
    const parsed = parseFeature(readFileSync(join(featuresDir, dir, "feature.ts"), "utf8"), file);
    if (parsed.id !== dir) fail(`${file}: id '${parsed.id}' differs from the directory name '${dir}'`);
    return { dir, ...parsed };
  });
  const seen = new Map();
  for (const f of features) {
    if (seen.has(f.order)) fail(`features ${seen.get(f.order)} and ${f.id} share order ${f.order}`);
    seen.set(f.order, f.id);
  }
  const sorted = [...features].sort((a, b) => a.order - b.order);
  const catalogue = JSON.parse(readFileSync(componentsFile, "utf8"));
  if (!Array.isArray(catalogue.components)) fail("components.json has no components array");
  const pages = listPages({ docsDir, components: catalogue.components });

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(join(generatedDir, "features.ts"), featuresModule(features));
  const json = sorted.map(({ id, order, paths, nav }) => (nav ? { id, order, paths, nav } : { id, order, paths }));
  writeFileSync(join(generatedDir, "features.json"), `${JSON.stringify(json, null, 2)}\n`);
  writeFileSync(join(generatedDir, "pages.json"), `${JSON.stringify(pages, null, 2)}\n`);
  return { features: json, pages };
}
