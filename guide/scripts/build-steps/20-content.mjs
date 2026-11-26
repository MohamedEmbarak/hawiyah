// Parses and checks docs/components/*.md, docs/guides/*.md and docs/templates/*.md
// (with their index.json) and writes src/generated/content/
// (pages/<id>.<lang>.json, manifest.json, loaders.ts) and
// .cache/content/live-groups.json for step 25 (contentPipeline).
import { join } from "node:path";
import { formatFinding } from "../content/config.mjs";
import { pendingLine, runContent } from "../content/pipeline.mjs";

export default {
  id: "20-content",
  configurations: ["production", "development"],
  generate: true,
  preview: true,
  async run(ctx) {
    const result = runContent({
      guideDir: ctx.guideDir,
      repoDir: ctx.repoDir,
      componentsDir: ctx.docsDir ?? join(ctx.repoDir, "docs", "components"),
      dirs: ctx.kindDirs,
      componentsFile: join(ctx.repoDir, "components.json"),
      outDir: join(ctx.guideDir, ctx.generatedDir, "content"),
      liveGroupsFile: join(ctx.guideDir, ctx.cacheDir, "content", "live-groups.json"),
    });
    if (result.findings.length > 0) {
      for (const item of result.findings) ctx.log(formatFinding(item));
      throw new Error(`content: ${result.findings.length} finding(s) in docs/components, docs/guides and docs/templates`);
    }
    ctx.log(`${result.pages} page model(s), ${result.groups} live group(s)`);
    ctx.log(pendingLine(result.pending));
  },
};
