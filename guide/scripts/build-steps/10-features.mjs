// Writes src/generated/features.ts, features.json and pages.json.
import { join } from "node:path";
import { generateFeatures } from "../features/generate.mjs";

export default {
  id: "10-features",
  configurations: ["production", "development"],
  generate: true,
  preview: true,
  async run(ctx) {
    const { features, pages } = generateFeatures({
      featuresDir: join(ctx.guideDir, "src", "app", "features"),
      generatedDir: join(ctx.guideDir, ctx.generatedDir),
      docsDir: ctx.docsDir ?? join(ctx.guideDir, "../docs/components"),
      componentsFile: join(ctx.guideDir, "../components.json"),
      kindDirs: ctx.kindDirs,
    });
    ctx.log(`${features.length} feature(s): ${features.map((f) => f.id).join(", ")}; ${pages.components.length} component page source(s), ${pages.guides.length} guide(s), ${pages.templates.length} template(s)`);
  },
};
