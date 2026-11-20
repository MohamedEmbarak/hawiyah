// Runs the equivalence harness (contentPipeline.equivalence) over <browserDir>:
// every live group, in both languages, rendered by the vanilla, React, Vue and
// Angular packages in sandboxed frames, compared by normalised DOM, aria snapshot
// and screenshot at rest and after the group's interaction check. Production
// configuration only; a difference fails the build. The report is
// .cache/equivalence/report.json. With the build option --pages only the groups of
// the named pages are compared (a build that is not deployable); with
// --defer-equivalence the step does not run and guide.yml runs it in shards.
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
      pages: ctx.pages ?? null,
      log: ctx.log,
    });
    console.log(report.summary);
  },
};
