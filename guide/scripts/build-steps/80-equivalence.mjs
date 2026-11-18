// Runs the equivalence harness (contentPipeline.equivalence) over <browserDir>:
// every live group, in both languages, rendered by the vanilla, React, Vue and
// Angular packages in sandboxed frames, compared by normalised DOM, aria snapshot
// and screenshot at rest and after the group's interaction check. Production
// configuration only; a difference fails the build. The report is
// .cache/equivalence/report.json.
import { runEquivalence } from '../equivalence/run.mjs';

export default {
  id: '80-equivalence',
  configurations: ['production'],
  generate: false,
  preview: true,
  async run(ctx) {
    const report = await runEquivalence({
      guideDir: ctx.guideDir,
      browserDir: ctx.browserDir,
      basePath: ctx.basePath,
      cacheDir: ctx.cacheDir,
      log: ctx.log,
    });
    console.log(report.summary);
  },
};
