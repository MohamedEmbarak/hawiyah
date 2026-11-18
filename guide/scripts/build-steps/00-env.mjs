// Validates HAWIYAH_BASE_PATH and HAWIYAH_SITE_ORIGIN, empties the output and log
// directories of a full build, and writes src/generated/build-info.json.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const BASE_PATH = /^\/(?:[A-Za-z0-9._-]+\/)*$/;
export const DEFAULT_SITE_ORIGIN = "https://mohamedembarak.github.io";

/** The pin and the seven @hawiyah entries of package.json and package-lock.json. */
export function readPackages(guideDir) {
  const manifest = JSON.parse(readFileSync(join(guideDir, "package.json"), "utf8"));
  const lock = JSON.parse(readFileSync(join(guideDir, "package-lock.json"), "utf8"));
  // A preview build (4b.5) names the tarball: the pin is the installed version.
  const declared = manifest.dependencies?.["@hawiyah/angular"];
  const pin = typeof declared === "string" && declared.startsWith("file:") ? lock.packages?.["node_modules/@hawiyah/angular"]?.version : declared;
  if (typeof pin !== "string" || !/^\d+\.\d+\.\d+$/.test(pin)) {
    throw new Error(`build: package.json pins @hawiyah/angular at ${pin}, not an exact version`);
  }
  const packages = {};
  for (const name of ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"]) {
    const full = `@hawiyah/${name}`;
    const entry = lock.packages?.[`node_modules/${full}`];
    if (!entry) throw new Error(`build: package-lock.json has no node_modules/${full}`);
    packages[full] = { version: entry.version, integrity: entry.integrity };
  }
  return { pin, packages };
}

export default {
  id: "00-env",
  configurations: ["production", "development"],
  generate: true,
  preview: true,
  async run(ctx) {
    if (!BASE_PATH.test(ctx.basePath)) {
      throw new Error(`build: HAWIYAH_BASE_PATH must start and end with / (got ${ctx.basePath})`);
    }
    const siteOrigin = process.env.HAWIYAH_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN;
    if (!/^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?$/.test(siteOrigin)) {
      throw new Error(`build: HAWIYAH_SITE_ORIGIN must be an origin without a path (got ${siteOrigin})`);
    }
    if (!ctx.generateOnly) {
      rmSync(join(ctx.guideDir, ctx.outDir), { recursive: true, force: true });
      rmSync(join(ctx.guideDir, ctx.logDir), { recursive: true, force: true });
      mkdirSync(join(ctx.guideDir, ctx.logDir), { recursive: true });
    }
    const { pin, packages } = readPackages(ctx.guideDir);
    const info = {
      pin,
      packages,
      basePath: ctx.basePath,
      siteOrigin,
      preview: ctx.preview ? { commit: ctx.preview.commit } : null,
    };
    mkdirSync(join(ctx.guideDir, ctx.generatedDir), { recursive: true });
    writeFileSync(join(ctx.guideDir, ctx.generatedDir, "build-info.json"), `${JSON.stringify(info, null, 2)}\n`);
    ctx.log(`base ${ctx.basePath}, pin ${pin}, ${ctx.configuration}${ctx.preview ? `, preview ${ctx.preview.commit.slice(0, 7)}` : ""}`);
  },
};
