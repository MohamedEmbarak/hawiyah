import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { availableRoutes, renderIndexHtml } from "../generate.mjs";
import { prepaintScript } from "../prepaint.mjs";

const guideDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const template = readFileSync(join(guideDir, "src", "index.template.html"), "utf8");
const available = { components: ["button"], landing: false };

/** Runs the generated script with stubbed browser globals. */
function run({ path = "/hawiyah/", hash = "", storage = {}, dark = false, languages = [], storageThrows = false, base = "/hawiyah/" } = {}) {
  const attributes = {};
  const replaced = [];
  const context = {
    document: {
      baseURI: `https://example.org${base}`,
      documentElement: { setAttribute: (name, value) => (attributes[name] = value) },
    },
    location: { pathname: path, hash, replace: (url) => replaced.push(url) },
    navigator: { languages, language: languages[0] ?? "" },
    URL,
    window: {
      get localStorage() {
        if (storageThrows) throw new Error("SecurityError");
        return { getItem: (key) => (key in storage ? storage[key] : null) };
      },
      matchMedia: (query) => ({ matches: dark && query === "(prefers-color-scheme: dark)" }),
    },
  };
  runInNewContext(prepaintScript(available), context);
  return { mode: attributes["data-hw-mode"], replaced };
}

describe("pre-paint script", () => {
  it("uses the stored guide mode first, then the old guide mode, then the system preference", () => {
    expect(run({ storage: { "hawiyah-guide-mode": "dark", "hawiyah-mode": "light" } }).mode).toBe("dark");
    expect(run({ storage: { "hawiyah-mode": "dark" } }).mode).toBe("dark");
    expect(run({ storage: { "hawiyah-guide-mode": "sepia" }, dark: true }).mode).toBe("dark");
    expect(run({}).mode).toBe("light");
  });

  it("survives storage that throws", () => {
    const result = run({ storageThrows: true, dark: true, languages: ["en-GB"] });
    expect(result.mode).toBe("dark");
    expect(result.replaced).toEqual(["/hawiyah/en/components/"]);
  });

  it("redirects only on the base path or base index.html", () => {
    expect(run({ path: "/hawiyah/" }).replaced).toHaveLength(1);
    expect(run({ path: "/hawiyah/index.html" }).replaced).toHaveLength(1);
    expect(run({ path: "/hawiyah/en/components/" }).replaced).toEqual([]);
    expect(run({ path: "/hawiyah/404.html" }).replaced).toEqual([]);
  });

  it("chooses the language: guide key, old guide key, browser languages, Arabic", () => {
    expect(run({ storage: { "hawiyah-guide-lang": "en", "hawiyah-locale": "ar" }, languages: ["ar"] }).replaced).toEqual(["/hawiyah/en/components/"]);
    expect(run({ storage: { "hawiyah-locale": "en" }, languages: ["ar"] }).replaced).toEqual(["/hawiyah/en/components/"]);
    expect(run({ languages: ["fr-FR", "en-US", "ar"] }).replaced).toEqual(["/hawiyah/en/components/"]);
    expect(run({ languages: ["ar-SA"] }).replaced).toEqual(["/hawiyah/ar/components/"]);
    expect(run({ languages: ["fr", "de"] }).replaced).toEqual(["/hawiyah/ar/components/"]);
  });

  it("maps old hashes and drops the query", () => {
    expect(run({ hash: "#component/button", languages: ["en"] }).replaced).toEqual(["/hawiyah/en/components/button/"]);
    expect(run({ hash: "#component/accordion", languages: ["en"] }).replaced).toEqual(["/hawiyah/en/components/"]);
    expect(run({ hash: "#docs/react", languages: ["ar"] }).replaced).toEqual(["/hawiyah/ar/components/"]);
  });

  it("works under the root base path", () => {
    expect(run({ base: "/", path: "/", languages: ["en"] }).replaced).toEqual(["/en/components/"]);
  });
});

describe("index document", () => {
  it("places the script after base and before every link, and the robots meta only in previews", () => {
    const html = renderIndexHtml(template, { available, preview: false });
    expect(html.indexOf("<base href")).toBeLessThan(html.indexOf("<script>"));
    expect(html.indexOf("<script>")).toBeLessThan(html.indexOf("<link"));
    expect(html).not.toContain("<!--HW_");
    expect(html).not.toContain('name="robots"');
    expect(renderIndexHtml(template, { available, preview: true })).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('<html lang="ar" dir="rtl" data-hw-theme="dga" data-hw-mode="light" data-hw-density="comfortable">');
  });

  it("fails when a placeholder is missing or repeated", () => {
    expect(() => renderIndexHtml(template.replace("<!--HW_ROBOTS-->", ""), { available, preview: false })).toThrow(/HW_ROBOTS/);
    expect(() => renderIndexHtml(`${template}<!--HW_PREPAINT-->`, { available, preview: false })).toThrow(/HW_PREPAINT/);
  });

  it("embeds component pages only when a feature routes them, and the landing when a feature claims ''", () => {
    const pages = { components: [{ id: "button" }] };
    expect(availableRoutes({ features: [{ paths: ["components"] }], pages })).toEqual({ components: [], landing: false, guides: [], templates: [], guideIndex: false, templateIndex: false, brand: false, foundations: false });
    expect(availableRoutes({ features: [{ paths: ["components/:id"] }, { paths: [""] }], pages })).toEqual({ components: ["button"], landing: true, guides: [], templates: [], guideIndex: false, templateIndex: false, brand: false, foundations: false });
  });

  it("escapes markup in the embedded data", () => {
    expect(prepaintScript({ components: ["</script>"], landing: false })).not.toContain("</script>");
  });
});
