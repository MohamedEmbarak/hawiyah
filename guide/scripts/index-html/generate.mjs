// Turns src/index.template.html into src/generated/index.html: the pre-paint script
// replaces <!--HW_PREPAINT--> and, in preview builds, the robots meta replaces
// <!--HW_ROBOTS-->.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { prepaintScript } from "./prepaint.mjs";

export const PREPAINT_PLACEHOLDER = "<!--HW_PREPAINT-->";
export const ROBOTS_PLACEHOLDER = "<!--HW_ROBOTS-->";
export const ROBOTS_META = '<meta name="robots" content="noindex, nofollow">';

function replaceOnce(html, placeholder, value) {
  const first = html.indexOf(placeholder);
  if (first < 0 || html.indexOf(placeholder, first + placeholder.length) >= 0) {
    throw new Error(`index-html: the template must contain ${placeholder} exactly once`);
  }
  return html.slice(0, first) + value + html.slice(first + placeholder.length);
}

/**
 * @param {string} template
 * @param {{ available: { components: string[], landing: boolean }, preview: boolean }} options
 */
export function renderIndexHtml(template, { available, preview }) {
  let html = replaceOnce(template, PREPAINT_PLACEHOLDER, `<script>${prepaintScript(available)}</script>`);
  html = replaceOnce(html, ROBOTS_PLACEHOLDER, preview ? ROBOTS_META : "");
  const base = html.indexOf("<base ");
  const script = html.indexOf("<script>");
  if (base < 0 || script < base || html.indexOf("<link") < script) {
    throw new Error("index-html: the pre-paint script must follow <base> and precede every link");
  }
  return html;
}

/**
 * What the build prerendered, for mapLegacyHash: component pages exist only when a
 * feature routes components/:id, and the language root is the landing only when a
 * feature claims ''.
 * Guides and templates exist when a feature routes guides/:id and templates/:id, their
 * index pages when it routes guides and templates, the brand and foundations pages when a
 * feature routes brand and foundations.
 * @param {{ features: { paths: string[] }[], pages: { components: { id: string }[], guides?: { id: string }[], templates?: { id: string }[] } }} input
 */
export function availableRoutes({ features, pages }) {
  const paths = features.flatMap((feature) => feature.paths);
  const componentPages = paths.includes("components/:id");
  return {
    components: componentPages ? pages.components.map((page) => page.id) : [],
    landing: paths.includes(""),
    guides: paths.includes("guides/:id") ? (pages.guides ?? []).map((page) => page.id) : [],
    templates: paths.includes("templates/:id") ? (pages.templates ?? []).map((page) => page.id) : [],
    guideIndex: paths.includes("guides"),
    templateIndex: paths.includes("templates"),
    brand: paths.includes("brand"),
    foundations: paths.includes("foundations"),
  };
}

/** Reads the template and the generated feature data, writes src/generated/index.html. */
export function generateIndexHtml({ guideDir, generatedDir, preview }) {
  const template = readFileSync(join(guideDir, "src", "index.template.html"), "utf8");
  const featuresFile = join(generatedDir, "features.json");
  const pagesFile = join(generatedDir, "pages.json");
  if (!existsSync(featuresFile) || !existsSync(pagesFile)) {
    throw new Error("index-html: src/generated/features.json and pages.json are missing (step 10 writes them)");
  }
  const available = availableRoutes({
    features: JSON.parse(readFileSync(featuresFile, "utf8")),
    pages: JSON.parse(readFileSync(pagesFile, "utf8")),
  });
  const html = renderIndexHtml(template, { available, preview });
  const out = join(generatedDir, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return { file: out, available };
}
