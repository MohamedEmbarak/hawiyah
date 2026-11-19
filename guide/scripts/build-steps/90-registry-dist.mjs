// Build step 90: the registry check in dist mode after the build. Every input of
// the Angular build (browser-stats.json, server-stats.json) must lie in guide/
// and every @hawiyah input in guide/node_modules/@hawiyah/<name>/ (HWREG-R6);
// the served runtime files (<browserDir>/runtime/) must equal the files derived
// again from the verified installed packages, byte for byte (HWREG-R8).
import { resolve } from "node:path";
import { checkRegistry, failureLines, successLines } from "../registry-check/check.mjs";

export default {
  id: "90-registry-dist",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const distDir = resolve(ctx.guideDir, ctx.browserDir);
    const options = ctx.preview
      ? { mode: "preview", previewDir: ctx.preview.tarballsDir, distDir }
      : { mode: "dist", distDir };
    // What the Angular build resolved (ng build --stats-json, step 40), and the
    // runtime derived again from the verified packages (steps 60 and 62).
    const outDir = resolve(ctx.guideDir, ctx.outDir);
    const metafiles = ["browser-stats.json", "server-stats.json"].map((name) => ({ label: name, file: resolve(outDir, name) }));
    const result = await checkRegistry({ guideDir: ctx.guideDir, repoDir: ctx.repoDir, ...options, metafiles, derive: true });
    if (!result.ok) throw new Error(failureLines(result).join("\n"));
    for (const line of successLines(result, { distLabel: ctx.browserDir, previewLabel: options.previewDir ?? "" })) ctx.log(line);
  },
};
