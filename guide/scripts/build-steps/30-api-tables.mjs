// Compares the API tables of every built page (the models step 20 wrote to
// src/generated/content/) with the declarations of the installed adapter
// packages: vanilla create<Name> options (or the stylesheet contract and
// scripts/api-tables/exclusions.json for a component without a controller),
// React props, Vue props, emits and slots, Angular inputs, outputs and content
// selectors (contentPipeline.apiTables). Fails on any HWC-APIX finding after
// reporting all of them.
import { join } from 'node:path';
import { COMPARED, formatFinding, runApiTables } from '../api-tables/cli.mjs';

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
    });
    for (const item of result.findings) ctx.log(formatFinding(item));
    if (result.findings.length) throw new Error(`${result.findings.length} API table finding(s) (HWC-APIX)`);
    ctx.log(`${result.tables} API tables of ${result.pages} page models: ${COMPARED}`);
  },
};
