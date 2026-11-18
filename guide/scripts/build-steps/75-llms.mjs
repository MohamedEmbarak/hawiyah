// Writes <out>/browser/llms.txt from the content manifest, build-info.json and
// install.json (contentPipeline.generated). Production configuration only.
import { writeLlms } from "../llms/generate.mjs";

export default {
  id: "75-llms",
  configurations: ["production"],
  generate: false,
  preview: true,
  async run(ctx) {
    const text = writeLlms({ guideDir: ctx.guideDir, generatedDir: ctx.generatedDir, browserDir: ctx.browserDir });
    const pages = text.split("\n").filter((line) => line.startsWith("- [")).length;
    ctx.log(`llms.txt with ${pages} page link(s)`);
  },
};
