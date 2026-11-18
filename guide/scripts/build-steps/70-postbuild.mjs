// 404.html, removal of index.csr.html, licences, preview files, verification of the
// prerendered routes.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLicences } from "../postbuild/licences.mjs";
import { addRootNoscript, moveNotFound, removeClientShell, writePreviewFiles } from "../postbuild/postbuild.mjs";
import { verifyRoutes } from "../postbuild/verify-routes.mjs";

export default {
  id: "70-postbuild",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const browserDir = join(ctx.guideDir, ctx.browserDir);
    const generatedDir = join(ctx.guideDir, ctx.generatedDir);
    moveNotFound(browserDir);
    removeClientShell(browserDir);
    addRootNoscript(browserDir);
    const licences = writeLicences({ guideDir: ctx.guideDir, browserDir, noticeFile: join(ctx.guideDir, "../NOTICE") });
    if (ctx.preview) {
      const manifest = JSON.parse(readFileSync(join(ctx.guideDir, "package.json"), "utf8"));
      const versions = Object.fromEntries(Object.entries(manifest.dependencies).filter(([name]) => name.startsWith("@hawiyah/")));
      writePreviewFiles(browserDir, ctx.preview, versions);
    }
    const manifestFile = join(generatedDir, "content", "manifest.json");
    const result = verifyRoutes({
      browserDir,
      basePath: ctx.basePath,
      preview: ctx.preview !== null,
      features: JSON.parse(readFileSync(join(generatedDir, "features.json"), "utf8")),
      manifest: existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : null,
      prerenderedRoutesFile: join(ctx.guideDir, ctx.outDir, "prerendered-routes.json"),
    });
    ctx.summary.prerenderedPages = result.pages;
    ctx.log(`${result.documents} documents verified (${result.pages} pages), ${licences.length} licence files`);
  },
};
