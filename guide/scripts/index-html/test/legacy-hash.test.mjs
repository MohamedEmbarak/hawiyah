import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEGACY_DOC_TOPICS, LEGACY_TEMPLATES, mapLegacyHash } from "../legacy-hash.mjs";

const guideDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const componentIds = JSON.parse(readFileSync(join(guideDir, "../components.json"), "utf8")).components.map((c) => c.id);

const stage4a = { components: ["button", "tabs"], landing: false };
const withLanding = { components: ["button", "tabs"], landing: true };
const nothingBuilt = { components: [], landing: false };

describe("mapLegacyHash", () => {
  for (const lang of ["ar", "en"]) {
    describe(lang, () => {
      it("maps the empty hash, #, #overview and #main to the language home", () => {
        for (const hash of ["", "#", "#overview", "#main"]) {
          expect(mapLegacyHash(hash, lang, stage4a)).toBe(`${lang}/components/`);
          expect(mapLegacyHash(hash, lang, withLanding)).toBe(`${lang}/`);
        }
      });

      it("maps #components and #components/<x> to the page when built, else the catalogue", () => {
        expect(mapLegacyHash("#components", lang, stage4a)).toBe(`${lang}/components/`);
        expect(mapLegacyHash("#components/button", lang, stage4a)).toBe(`${lang}/components/button/`);
        expect(mapLegacyHash("#components/anything", lang, stage4a)).toBe(`${lang}/components/`);
        expect(mapLegacyHash("#components/actions", lang, withLanding)).toBe(`${lang}/components/`);
      });

      it("maps #component/<id> for every one of the 85 ids", () => {
        expect(componentIds).toHaveLength(85);
        for (const id of componentIds) {
          const built = stage4a.components.includes(id);
          expect(mapLegacyHash(`#component/${id}`, lang, stage4a), id).toBe(built ? `${lang}/components/${id}/` : `${lang}/components/`);
          expect(mapLegacyHash(`#component/${id}`, lang, nothingBuilt), id).toBe(`${lang}/components/`);
        }
      });

      it("maps #inputs to the catalogue", () => {
        expect(mapLegacyHash("#inputs", lang, withLanding)).toBe(`${lang}/components/`);
      });

      it("maps foundations, brand and layouts to the home", () => {
        for (const hash of ["#foundations", "#brand", "#layouts"]) expect(mapLegacyHash(hash, lang, withLanding)).toBe(`${lang}/`);
      });

      it("maps every documentation topic to the home", () => {
        expect(mapLegacyHash("#docs", lang, withLanding)).toBe(`${lang}/`);
        for (const topic of LEGACY_DOC_TOPICS) expect(mapLegacyHash(`#docs/${topic}`, lang, withLanding)).toBe(`${lang}/`);
        expect(mapLegacyHash("#docs/react", lang, stage4a)).toBe(`${lang}/components/`);
      });

      it("maps every template to the home, also with a query", () => {
        expect(mapLegacyHash("#templates", lang, withLanding)).toBe(`${lang}/`);
        for (const id of LEGACY_TEMPLATES) {
          expect(mapLegacyHash(`#templates/${id}`, lang, withLanding)).toBe(`${lang}/`);
          expect(mapLegacyHash(`#templates/${id}?preview=template`, lang, withLanding)).toBe(`${lang}/`);
        }
      });

      it("maps the dropped journeys and any other hash to the home", () => {
        for (const hash of ["#discover", "#apply", "#workspace", "#something-else", "#%E0%A4%A", "#component/../../x"]) {
          expect(mapLegacyHash(hash, lang, withLanding), hash).toBe(hash.startsWith("#component/") ? `${lang}/components/` : `${lang}/`);
        }
      });

      it("tolerates trailing slashes and encoded hashes", () => {
        expect(mapLegacyHash("#component/button/", lang, stage4a)).toBe(`${lang}/components/button/`);
        expect(mapLegacyHash("#component%2Fbutton", lang, stage4a)).toBe(`${lang}/components/button/`);
      });
    });
  }

  it("always returns a base-relative path ending in a slash", () => {
    for (const hash of ["", "#x", "#component/button", "#docs/react"]) {
      const target = mapLegacyHash(hash, "en", stage4a);
      expect(target.startsWith("/")).toBe(false);
      expect(target.endsWith("/")).toBe(true);
    }
  });
});
