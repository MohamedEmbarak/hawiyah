// Compares the API tables of every built page (the models step 20 wrote to
// src/generated/content/) with the installed adapter packages: names, kinds,
// required flags, types (the written form of scripts/api-tables/types.mjs) and
// defaults (read from the published JavaScript of React, Vue and Angular;
// vanilla options and stylesheet attributes only through defaults.json with
// checked evidence). A component without a vanilla controller is compared with
// the styles README contract and the attribute selectors of dist/styles.css.
// Writes src/generated/parity.json with the members of every component of
// components.json. Then the vocabulary pass (scripts/api-tables/vocabulary.mjs):
// every code value outside the API tables and every class, data-hw hook and data
// attribute of an html live block must exist in the installed packages (HWC-VOCAB).
// Fails on any HWC-APIX or HWC-VOCAB finding after reporting all of them.
import { join } from 'node:path';
import { comparedLine, formatFinding, runApiTables } from '../api-tables/cli.mjs';

export default {
  id: '30-api-tables',
  configurations: ['production', 'development'],
  generate: true,
  preview: true,
  async run(ctx) {
    const result = runApiTables({
      contentDir: join(ctx.guideDir, ctx.generatedDir, 'content'),
      nodeModules: join(ctx.guideDir, 'node_modules'),
      componentsFile: join(ctx.repoDir, 'components.json'),
      parityFile: join(ctx.guideDir, ctx.generatedDir, 'parity.json'),
      liveGroupsFile: join(ctx.guideDir, ctx.cacheDir, 'content', 'live-groups.json'),
    });
    for (const item of result.findings) ctx.log(formatFinding(item));
    if (result.findings.length) throw new Error(`${result.findings.length} API table or vocabulary finding(s) (HWC-APIX, HWC-VOCAB)`);
    ctx.log(`api-tables: ${comparedLine(result.stats)}`);
  },
};
