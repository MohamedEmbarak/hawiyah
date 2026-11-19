// Build step 90: the registry check in dist mode after the build. Every input of
// the Angular build (browser-stats.json, server-stats.json) must lie in guide/
// and every @hawiyah input in guide/node_modules/@hawiyah/<name>/ (HWREG-R6);
// the served runtime files (<browserDir>/runtime/) must equal the files derived
// again from the verified installed packages, byte for byte (HWREG-R8); in the
// production configuration the package stylesheet styles-<hash>.css and its media
// must equal the bundle derived again from @hawiyah/styles (HWREG-R8).
import { resolve } from "node:path";
import { checkRegistry, failureLines, successLines } from "../registry-check/check.mjs";

/** The options of the check for a build context (exported for scripts/test/registry-dist.test.mjs). */
export function stepOptions(ctx) {
  const distDir = resolve(ctx.guideDir, ctx.browserDir);
  const outDir = resolve(ctx.guideDir, ctx.outDir);
  const modeOptions = ctx.preview ? { mode: "preview", previewDir: ctx.preview.tarballsDir, distDir } : { mode: "dist", distDir };
  // What the Angular build resolved (ng build --stats-json, step 40), the runtime
  // derived again from the verified packages (steps 60 and 62), and the package
  // stylesheet derived again (production only: the development bundle is not minified).
  const metafiles = ["browser-stats.json", "server-stats.json"].map((name) => ({ label: name, file: resolve(outDir, name) }));
  return {
    guideDir: ctx.guideDir,
    repoDir: ctx.repoDir,
    ...modeOptions,
    metafiles,
    derive: true,
    deriveStyles: ctx.configuration === "production",
  };
}

/**
 * A passing check in dist mode counts only when the comparisons ran: the runtime
 * derived again, and in production the package stylesheet derived again.
 */
export function requireDerived(result, ctx) {
  if (result.mode !== "dist") return;
  const missing = [];
  if (!result.derived) missing.push("the runtime was not derived again from the verified packages");
  if (ctx.configuration === "production" && !result.derivedStyles) missing.push("the package stylesheet was not derived again from @hawiyah/styles");
  if (missing.length > 0) throw new Error(`registry-check: step 90 compared less than it must: ${missing.join("; ")}`);
}

export default {
  id: "90-registry-dist",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx, check = checkRegistry) {
    const options = stepOptions(ctx);
    const result = await check(options);
    if (!result.ok) throw new Error(failureLines(result).join("\n"));
    requireDerived(result, ctx);
    for (const line of successLines(result, { distLabel: ctx.browserDir, previewLabel: options.previewDir ?? "" })) ctx.log(line);
  },
};
