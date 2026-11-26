// Writes src/generated/install.json: install commands for three package managers
// and four frameworks with the exact pin, style import lines and file names, the
// pin and the number of components in components.json (landing.installData). Then
// writes the data of the pages generated from the installed packages, the brand page
// and the foundations page (scripts/package-pages/generate.mjs), to
// src/generated/package-pages/.
import { join } from "node:path";
import { writeInstall } from "../install/generate.mjs";
import { writePackagePages } from "../package-pages/generate.mjs";

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
    const pages = await writePackagePages({ guideDir: ctx.guideDir, generatedDir: join(ctx.guideDir, ctx.generatedDir) });
    const files = pages.brand.brand.wordmarks;
    ctx.log(`package pages: brand (${files.light.length + files.dark.length} wordmark files, the loader, the README section "${pages.brand.brand.source.section}"), foundations (${Object.entries(pages.foundations.counts).map(([group, count]) => `${count} ${group}`).join(", ")})`);
  },
};
