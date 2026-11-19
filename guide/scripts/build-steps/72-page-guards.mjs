// Build step 72: icon and text guards over the prerendered pages and the
// guide's templates and text sources (scripts/page-guards/guards.mjs): packaged
// icons only, no svg, icon font or emoji, and no Latin-script run of four or
// more words in the reader text of an Arabic page outside code, kbd and
// elements with their own lang, unless latin-allowlist.json lists it.
import { join } from "node:path";
import { runGuards } from "../page-guards/guards.mjs";

export default {
  id: "72-page-guards",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const result = runGuards({
      guideDir: ctx.guideDir,
      browserDir: join(ctx.guideDir, ctx.browserDir),
      allowlistFile: join(ctx.guideDir, "scripts", "page-guards", "latin-allowlist.json"),
    });
    if (result.findings.length > 0) {
      throw new Error(result.findings.map((item) => `page-guards ${item.code} ${item.file}:${item.line}: ${item.message}`).join("\n"));
    }
    ctx.log(`page-guards: ${result.pages} pages and the guide sources: every data-icon in the packaged set (${result.icons} icons), no svg, icon font or emoji, no unmarked Latin run on Arabic pages (${result.allowlist} allow-list entries)`);
  },
};
