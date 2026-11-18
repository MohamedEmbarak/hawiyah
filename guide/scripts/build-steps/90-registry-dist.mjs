// Build step 90: the registry check in dist mode after the build. The served
// runtime files (<browserDir>/runtime/) must equal the verified installed
// packages (HWREG-R8). Until step 60 exists (stage 4b) a build without
// runtime/ passes; from then on runtime/manifest.json is required.
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
    const result = await checkRegistry({ guideDir: ctx.guideDir, repoDir: ctx.repoDir, ...options });
    if (!result.ok) throw new Error(failureLines(result).join("\n"));
    for (const line of successLines(result, { distLabel: ctx.browserDir, previewLabel: options.previewDir ?? "" })) ctx.log(line);
  },
};
