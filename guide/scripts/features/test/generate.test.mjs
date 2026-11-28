import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { featuresModule, generateFeatures, listPages, parseFeature, routePaths } from "../generate.mjs";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const temps = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "guide-features-"));
  temps.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const run = (name, generatedDir = temp()) =>
  generateFeatures({
    featuresDir: join(fixtures, name, "features"),
    generatedDir,
    docsDir: join(fixtures, "basic", "docs"),
    componentsFile: join(fixtures, "basic", "components.json"),
  });

describe("routePaths", () => {
  it("joins child paths to their parent and ignores strings and comments", () => {
    const block = `[{ path: 'a', children: [{ path: '' }, { path: 'b' /* path: 'x' */ }] }, { path: "c", title: 'path: no' }]`;
    expect(routePaths(block)).toEqual(["a", "a/b", "c"]);
  });
});

describe("parseFeature", () => {
  it("reads id, order, paths and nav without importing the file", () => {
    const text = readFileSync(join(fixtures, "basic", "features", "catalogue", "feature.ts"), "utf8");
    expect(parseFeature(text, "catalogue")).toEqual({
      id: "catalogue",
      order: 20,
      paths: ["components"],
      nav: { path: "components/", label: { en: "Components", ar: "المكوّنات" }, header: true, footer: true },
    });
  });

  it("fails when a route path is not a string literal", () => {
    const text = readFileSync(join(fixtures, "no-routes", "features", "broken", "feature.ts"), "utf8");
    expect(() => parseFeature(text, "broken")).toThrow(/not a string literal/);
  });

  it("fails without a routes array", () => {
    expect(() => parseFeature("export const feature = { id: 'x', order: 1 };", "x")).toThrow(/no routes/);
  });

  it("fails on a nav entry without a trailing slash", () => {
    const text = `export const feature = { id: 'x', order: 1, routes: [], nav: { path: 'x', label: { en: 'X', ar: 'س' }, header: true, footer: false } };`;
    expect(() => parseFeature(text, "x")).toThrow(/end in '\/'/);
  });
});

describe("generateFeatures", () => {
  it("writes features.ts in directory order and features.json sorted by order", () => {
    const dir = temp();
    const { features } = run("basic", dir);
    expect(features.map((f) => f.id)).toEqual(["catalogue", "component-pages", "frame-runtime"]);
    expect(features[1].paths).toEqual(["components/:id", "components/:id/reference"]);
    expect(features[2]).toEqual({ id: "frame-runtime", order: 90, paths: [] });
    const source = readFileSync(join(dir, "features.ts"), "utf8");
    expect(source).toContain("import { feature as catalogueFeature } from '../app/features/catalogue/feature';");
    expect(source).toContain("import { feature as componentPagesFeature } from '../app/features/component-pages/feature';");
    expect(source).toContain("].sort((a, b) => a.order - b.order);");
    expect(JSON.parse(readFileSync(join(dir, "features.json"), "utf8"))).toEqual(features);
  });

  it("lists component pages that have a source and a components.json entry, sorted by id", () => {
    const dir = temp();
    const { pages } = run("basic", dir);
    expect(pages).toEqual({
      components: [
        { id: "button", name: "Button", labelAr: "زر" },
        { id: "tabs", name: "Tabs", labelAr: "تبويبات" },
      ],
      guides: [],
      templates: [],
    });
    expect(JSON.parse(readFileSync(join(dir, "pages.json"), "utf8"))).toEqual(pages);
  });

  // An English page without its Arabic sibling (pending translation) is in no generated file.
  it("leaves out a page whose Arabic sibling does not exist (accordion.md alone)", () => {
    const dir = temp();
    const { pages } = run("basic", dir);
    expect(pages.components.map((page) => page.id)).not.toContain("accordion");
    expect(readFileSync(join(dir, "pages.json"), "utf8")).not.toContain("accordion");
  });

  it("returns no pages when the docs directory does not exist", () => {
    expect(listPages({ docsDir: join(fixtures, "missing"), components: [{ id: "button" }] })).toEqual({ components: [], guides: [], templates: [] });
  });

  it("fails when the id differs from the directory name", () => {
    expect(() => run("bad-id")).toThrow(/differs from the directory name/);
  });

  it("emits an empty list when there is no feature", () => {
    expect(featuresModule([])).toContain("export const features: readonly GuideFeature[] = [\n].sort");
  });
});
