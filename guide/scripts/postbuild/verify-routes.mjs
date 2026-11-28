// Verifies the prerendered documents (build step 70): every expected file exists
// and carries the language, direction, base href and hydration markers of its route.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const LANGS = ["ar", "en"];
const DIR = { ar: "rtl", en: "ltr" };
/** Angular names the transfer-state script <APP_ID>-state; the guide's APP_ID is 'hwg' (app.config.ts). */
export const STATE_SCRIPT_ID = "hwg-state";

/**
 * The documents a build must contain, from features.json and the content manifest.
 * @param {{ features: { id: string, paths: string[] }[], manifest: { pages: { id: string, langs?: string[] }[] } | null }} input
 * @returns {{ file: string, lang: 'ar' | 'en', kind: 'page' | 'redirect', route: string }[]}
 */
export function expectedDocuments({ features, manifest }) {
  const docs = [
    { file: "index.html", lang: "ar", kind: "page", route: "" },
    { file: "404.html", lang: "ar", kind: "page", route: "404" },
  ];
  const paths = features.flatMap((f) => f.paths);
  for (const lang of LANGS) {
    if (!paths.includes("")) docs.push({ file: `${lang}/index.html`, lang, kind: "redirect", route: `${lang}` });
    for (const path of paths) {
      const params = path.split("/").filter((s) => s.startsWith(":"));
      let values = [{}];
      for (const param of params) {
        if (param !== ":id") throw new Error(`verify-routes: route ${path} has a parameter ${param} the verification does not know`);
        if (!manifest) throw new Error(`verify-routes: route ${path} needs src/generated/content/manifest.json`);
        // :id names a page of the kind of the route's first segment: guides/:id a guide, templates/:id a
        // template (their id inside the kind), any other route a component page.
        const kind = { guides: "guide", templates: "template" }[path.split("/")[0]] ?? null;
        const ids = manifest.pages
          .filter((p) => (p.kind ?? null) === kind && (!p.langs || p.langs.includes(lang)))
          .map((p) => (kind ? p.slug : p.id));
        values = values.flatMap((v) => ids.map((id) => ({ ...v, [param]: id })));
      }
      for (const value of values) {
        const route = path
          .split("/")
          .map((s) => (s.startsWith(":") ? value[s] : s))
          .filter(Boolean)
          .join("/");
        const file = route ? `${lang}/${route}/index.html` : `${lang}/index.html`;
        if (!docs.some((d) => d.file === file)) docs.push({ file, lang, kind: "page", route: route ? `${lang}/${route}` : lang });
      }
    }
  }
  return docs;
}

const attr = (html, tag, name) => {
  const open = new RegExp(`<${tag}\\b[^>]*>`, "i").exec(html)?.[0];
  if (!open) return null;
  return new RegExp(`\\s${name}="([^"]*)"`, "i").exec(open)?.[1] ?? null;
};

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

/** Problems of one prerendered page document. */
export function checkPage(html, { lang, basePath, preview }) {
  const problems = [];
  if (attr(html, "html", "lang") !== lang) problems.push(`html lang is ${attr(html, "html", "lang")}, expected ${lang}`);
  if (attr(html, "html", "dir") !== DIR[lang]) problems.push(`html dir is ${attr(html, "html", "dir")}, expected ${DIR[lang]}`);
  if (attr(html, "base", "href") !== basePath) problems.push(`base href is ${attr(html, "base", "href")}, expected ${basePath}`);
  if (!/<app-root\b[^>]*\sngh="[^"]*"/.test(html)) problems.push("app-root has no ngh attribute");
  if (!new RegExp(`<script\\b[^>]*\\sid="${STATE_SCRIPT_ID}"`).test(html)) problems.push(`no <script id="${STATE_SCRIPT_ID}">`);
  const robots = /<meta name="robots" content="noindex, nofollow">/.test(html);
  if (preview && !robots) problems.push("preview build without the robots meta");
  if (!preview && robots) problems.push("robots noindex meta outside a preview build");
  return problems;
}

/**
 * @param {{ browserDir: string, basePath: string, preview: boolean, features: object[], manifest: object | null, prerenderedRoutesFile?: string }} options
 * @returns {{ documents: number, pages: number }}
 */
export function verifyRoutes({ browserDir, basePath, preview, features, manifest, prerenderedRoutesFile }) {
  const expected = expectedDocuments({ features, manifest });
  const problems = [];
  for (const doc of expected) {
    const file = join(browserDir, doc.file);
    if (!existsSync(file)) {
      problems.push(`${doc.file}: missing`);
      continue;
    }
    const html = readFileSync(file, "utf8");
    if (doc.kind === "redirect") {
      if (!/<meta http-equiv="refresh" content="0; url=[^"]+">/.test(html)) problems.push(`${doc.file}: not a redirect page`);
      continue;
    }
    for (const p of checkPage(html, { lang: doc.lang, basePath, preview })) problems.push(`${doc.file}: ${p}`);
    const refresh = /<noscript><meta http-equiv="refresh"[^>]*><\/noscript>/.test(html);
    if (doc.file === "index.html" && !refresh) problems.push("index.html: no <noscript> refresh to the default language");
    if (doc.file !== "index.html" && refresh) problems.push(`${doc.file}: <noscript> refresh outside the root document`);
  }
  for (const file of htmlFiles(browserDir)) {
    if (/ngSkipHydration/i.test(readFileSync(file, "utf8"))) problems.push(`${relative(browserDir, file)}: contains ngSkipHydration`);
  }
  if (existsSync(join(browserDir, "404"))) problems.push("404/ still exists");
  if (existsSync(join(browserDir, "index.csr.html"))) problems.push("index.csr.html still exists");
  if (prerenderedRoutesFile && existsSync(prerenderedRoutesFile)) {
    const listed = Object.keys(JSON.parse(readFileSync(prerenderedRoutesFile, "utf8")).routes ?? {}).length;
    if (listed !== expected.length) problems.push(`Angular prerendered ${listed} routes, expected ${expected.length}`);
  }
  if (problems.length > 0) throw new Error(`verify-routes: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  return { documents: expected.length, pages: expected.filter((d) => d.kind === "page").length };
}

/** The number of routes the Angular build must report as prerendered, for the log scan. */
export function expectedPrerenderCount(input) {
  return expectedDocuments(input).length;
}
