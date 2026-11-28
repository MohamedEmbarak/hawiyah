// Build step 05: the registry check before content generation and the Angular
// build. Strict mode in every build; preview mode (local tarballs) only in a
// preview build, where ctx.preview names the tarball directory.
import { checkRegistry, failureLines, successLines } from "../registry-check/check.mjs";

export function registryMode(ctx, env = process.env) {
  if (ctx.preview) return { mode: "preview", previewDir: ctx.preview.tarballsDir };
  // A preview environment without a preview build context is refused.
  if (env.HAWIYAH_PREVIEW_BUILD === "1") throw new Error("registry-check: --preview is only valid in a preview build");
  return { mode: "strict" };
}

export default {
  id: "05-registry",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const options = registryMode(ctx);
    const result = await checkRegistry({ guideDir: ctx.guideDir, repoDir: ctx.repoDir, ...options });
    if (!result.ok) throw new Error(failureLines(result).join("\n"));
    for (const line of successLines(result, { previewLabel: options.previewDir ?? "" })) ctx.log(line);
  },
};
