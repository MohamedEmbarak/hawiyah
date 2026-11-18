import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { writeLicences } from "../licences.mjs";
import { ROOT_NOSCRIPT, addRootNoscript, moveNotFound, removeClientShell, writePreviewFiles } from "../postbuild.mjs";
import { checkPage, expectedDocuments, verifyRoutes } from "../verify-routes.mjs";

const guideDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const temps = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "guide-postbuild-"));
  temps.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const write = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
const doc = (lang, { base = "/hawiyah/", extra = "" } = {}) =>
  `<!doctype html><html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}" data-hw-mode="light"><head><base href="${base}">${extra}</head>` +
  `<body><app-root ng-version="22.2.3" ngh="3"></app-root><script id="hwg-state" type="application/json">{}</script></body></html>`;
const root = () => doc("ar", { extra: "<script>prepaint()</script>" });
const redirect = (to) => `<html><head><meta http-equiv="refresh" content="0; url=${to}"></head></html>`;

const catalogueOnly = [{ id: "catalogue", order: 20, paths: ["components"] }];
const withPages = [...catalogueOnly, { id: "component-pages", order: 30, paths: ["components/:id", "components/:id/reference"] }];

/** A stage-4a output tree as the Angular build leaves it. */
function stage4aTree() {
  const dir = temp();
  write(dir, "index.html", root());
  write(dir, "404/index.html", doc("ar"));
  write(dir, "index.csr.html", "<html></html>");
  for (const lang of ["ar", "en"]) {
    write(dir, `${lang}/index.html`, redirect(`/hawiyah/${lang}/components`));
    write(dir, `${lang}/components/index.html`, doc(lang));
  }
  return dir;
}

describe("postbuild", () => {
  it("moves 404/index.html to 404.html and removes index.csr.html", () => {
    const dir = stage4aTree();
    moveNotFound(dir);
    expect(existsSync(join(dir, "404.html"))).toBe(true);
    expect(existsSync(join(dir, "404"))).toBe(false);
    expect(removeClientShell(dir)).toBe(true);
    expect(existsSync(join(dir, "index.csr.html"))).toBe(false);
  });

  it("adds the noscript refresh to the root document once, after the pre-paint script", () => {
    const dir = stage4aTree();
    addRootNoscript(dir);
    addRootNoscript(dir);
    const html = readFileSync(join(dir, "index.html"), "utf8");
    expect(html.split(ROOT_NOSCRIPT)).toHaveLength(2);
    expect(html).toContain(`<script>prepaint()</script>${ROOT_NOSCRIPT}`);
  });

  it("fails when the 404 route was not prerendered", () => {
    expect(() => moveNotFound(temp())).toThrow(/404\/index.html was not prerendered/);
  });

  it("writes preview.json and robots.txt from the tarballs", () => {
    const dir = temp();
    const tarballs = temp();
    write(tarballs, "hawiyah-core-0.3.0.tgz", "core");
    const json = writePreviewFiles(dir, { commit: "abcdef1234", tarballsDir: tarballs }, { "@hawiyah/core": "0.3.0" });
    expect(json.commit).toBe("abcdef1234");
    expect(json.packages["@hawiyah/core"].version).toBe("0.3.0");
    expect(readFileSync(join(dir, "robots.txt"), "utf8")).toBe("User-agent: *\nDisallow: /\n");
    expect(() => writePreviewFiles(dir, { commit: "abcdef1", tarballsDir: tarballs }, { "@hawiyah/vue": "0.3.0" })).toThrow(/missing/);
  });

  it("writes the licence files and NOTICE.txt", () => {
    const dir = join(temp(), "browser");
    mkdirSync(dir);
    write(dirname(dir), "3rdpartylicenses.txt", "angular licences");
    const written = writeLicences({ guideDir, browserDir: dir, noticeFile: join(guideDir, "../NOTICE") });
    expect(written).toContain("licenses/hawiyah/angular/LICENSE");
    expect(written).toContain("licenses/fonts/ibm-plex-LICENSE.txt");
    expect(written).toContain("3rdpartylicenses.txt");
    const notice = readFileSync(join(dir, "NOTICE.txt"), "utf8");
    expect(notice).toContain("Hawiyah");
    expect(notice).toContain("- licenses/hawiyah/core/NOTICE");
  });
});

describe("verify-routes", () => {
  it("expects the stage 4a documents", () => {
    expect(expectedDocuments({ features: catalogueOnly, manifest: null }).map((d) => d.file)).toEqual([
      "index.html",
      "404.html",
      "ar/index.html",
      "ar/components/index.html",
      "en/index.html",
      "en/components/index.html",
    ]);
  });

  it("expands component pages from the content manifest", () => {
    const files = expectedDocuments({ features: withPages, manifest: { pages: [{ id: "button", langs: ["ar", "en"] }] } }).map((d) => d.file);
    expect(files).toContain("ar/components/button/index.html");
    expect(files).toContain("en/components/button/reference/index.html");
    expect(files).toHaveLength(10);
    expect(() => expectedDocuments({ features: withPages, manifest: null })).toThrow(/manifest/);
  });

  it("drops the language redirect when a feature claims the language root", () => {
    const files = expectedDocuments({ features: [...catalogueOnly, { id: "landing", order: 10, paths: [""] }], manifest: null });
    expect(files.find((d) => d.file === "en/index.html")?.kind).toBe("page");
  });

  it("passes a correct tree", () => {
    const dir = stage4aTree();
    moveNotFound(dir);
    removeClientShell(dir);
    addRootNoscript(dir);
    expect(verifyRoutes({ browserDir: dir, basePath: "/hawiyah/", preview: false, features: catalogueOnly, manifest: null })).toEqual({
      documents: 6,
      pages: 4,
    });
  });

  it("reports wrong attributes, missing files and ngSkipHydration", () => {
    const dir = stage4aTree();
    moveNotFound(dir);
    removeClientShell(dir);
    write(dir, "en/components/index.html", doc("ar"));
    write(dir, "ar/components/index.html", doc("ar", { base: "/" }));
    write(dir, "index.html", root().replace(' ngh="3"', ""));
    write(dir, "extra.html", '<div ngSkipHydration=""></div>');
    rmSync(join(dir, "en/index.html"));
    let message = "";
    try {
      verifyRoutes({ browserDir: dir, basePath: "/hawiyah/", preview: false, features: catalogueOnly, manifest: null });
    } catch (error) {
      message = error.message;
    }
    expect(message).toContain("en/components/index.html: html lang is ar, expected en");
    expect(message).toContain("ar/components/index.html: base href is /, expected /hawiyah/");
    expect(message).toContain("index.html: app-root has no ngh attribute");
    expect(message).toContain("index.html: no <noscript> refresh to the default language");
    expect(message).toContain("extra.html: contains ngSkipHydration");
    expect(message).toContain("en/index.html: missing");
  });

  it("requires the robots meta in preview builds only", () => {
    expect(checkPage(doc("en"), { lang: "en", basePath: "/hawiyah/", preview: true })).toContain("preview build without the robots meta");
    const robots = '<meta name="robots" content="noindex, nofollow">';
    expect(checkPage(doc("en", { extra: robots }), { lang: "en", basePath: "/hawiyah/", preview: false })).toContain(
      "robots noindex meta outside a preview build",
    );
  });
});
