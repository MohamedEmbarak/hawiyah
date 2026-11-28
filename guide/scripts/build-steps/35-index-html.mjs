// Writes src/generated/index.html from src/index.template.html with the pre-paint script.
import { join } from "node:path";
import { generateIndexHtml } from "../index-html/generate.mjs";

export default {
  id: "35-index-html",
  configurations: ["production", "development"],
  generate: true,
  preview: true,
  async run(ctx) {
    const { available } = generateIndexHtml({
      guideDir: ctx.guideDir,
      generatedDir: join(ctx.guideDir, ctx.generatedDir),
      preview: ctx.preview !== null,
    });
    ctx.log(`legacy redirects to ${available.components.length} component page(s), landing ${available.landing ? "present" : "absent"}`);
  },
};
