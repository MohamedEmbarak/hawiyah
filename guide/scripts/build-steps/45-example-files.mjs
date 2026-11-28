// Copies the example payloads written by step 25 and their downloadable sources into
// <out>/browser/examples/ (contentPipeline.compile.payload): the example block links
// its download buttons to these files and the preview frames fetch the payloads.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { copyExampleFiles } from '../examples/files.mjs';

export default {
  id: '45-example-files',
  configurations: ['production', 'development'],
  generate: false,
  preview: true,
  async run(ctx) {
    const browserDir = join(ctx.guideDir, ctx.browserDir);
    if (!existsSync(browserDir)) throw new Error(`${ctx.browserDir} does not exist; build step 40-angular writes it`);
    const { payloads, files } = copyExampleFiles(join(ctx.guideDir, ctx.cacheDir, 'examples', 'frames'), join(browserDir, 'examples'));
    ctx.log(`${payloads} payloads and ${files} source files in ${ctx.browserDir}/examples/`);
  },
};
