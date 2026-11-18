// Writes src/generated/install.json: install commands for three package managers
// and four frameworks with the exact pin, style import lines and file names, the
// pin and the number of components in components.json (landing.installData).
import { join } from "node:path";
import { writeInstall } from "../install/generate.mjs";

export default {
  id: "32-install",
  configurations: ["production", "development"],
  generate: true,
  preview: true,
  async run(ctx) {
    const data = writeInstall({
      generatedDir: join(ctx.guideDir, ctx.generatedDir),
      componentsFile: join(ctx.repoDir, "components.json"),
    });
    const pairs = data.managers.length * data.frameworks.length;
    ctx.log(`${pairs} install commands at ${data.pin}; ${data.componentCount} components in components.json`);
  },
};
