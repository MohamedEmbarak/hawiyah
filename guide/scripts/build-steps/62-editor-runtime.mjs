// Writes <out>/browser/runtime/compilers/ (editor.compilers): the compilers the
// editor loads for an edited run, recorded in runtime/manifest.json. Runs after
// step 60, which writes the runtime and its manifest; step 90 checks the result
// against the verified packages (HWREG-R8).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildCompilers } from '../editor/build-compilers.mjs';

export default {
  id: '62-editor-runtime',
  configurations: ['production', 'development'],
  generate: false,
  preview: true,
  async run(ctx) {
    const runtimeDir = join(ctx.guideDir, ctx.browserDir, 'runtime');
    if (!existsSync(join(runtimeDir, 'manifest.json'))) throw new Error(`${ctx.browserDir}/runtime/manifest.json does not exist; build step 60-runtime writes it`);
    const result = await buildCompilers({ guideDir: ctx.guideDir, runtimeDir });
    const files = result.entries.filter((entry) => !entry.path.startsWith('compilers/licenses/')).length;
    ctx.log(`editor compilers: ${files} files and ${result.entries.length - files} licence files, ${(result.bytes / 1024 / 1024).toFixed(1)} MB in ${ctx.browserDir}/runtime/compilers/`);
  },
};
