// Build step 03: the CSS, template and source lint (lint). Any finding fails
// the build; the findings are printed one per line before the summary.
import { lintTree, summary } from "../lint/cli.mjs";
import { formatFinding } from "../lint/files.mjs";

export default {
  id: "03-lint",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const result = lintTree(ctx.guideDir);
    if (result.findings.length > 0) {
      throw new Error([...result.findings.map(formatFinding), summary(result)].join("\n"));
    }
    ctx.log(summary(result));
  },
};
