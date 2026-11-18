// Wraps, type-checks and compiles the live groups of .cache/content/live-groups.json
// (written by step 20); writes src/generated/examples/ (native Angular example
// components and their loaders) and .cache/examples/ (frame payloads and the
// generated projects of each framework). Fails on any HWC-LIVE4 to HWC-LIVE6,
// HWC-V1 to HWC-V3, HWC-R1, HWC-U1 or HWC-A1 finding after reporting all of them.
import { join } from 'node:path';
import { runExamples } from '../examples/cli.mjs';

export default {
  id: '25-examples',
  configurations: ['production', 'development'],
  generate: true,
  preview: true,
  async run(ctx) {
    const result = await runExamples({
      groups: join(ctx.guideDir, ctx.cacheDir, 'content', 'live-groups.json'),
      out: join(ctx.guideDir, ctx.cacheDir, 'examples'),
      generated: join(ctx.guideDir, ctx.generatedDir, 'examples'),
    });
    for (const finding of result.findings) console.log(finding.text);
    if (result.findings.length) throw new Error(`${result.findings.length} finding(s) in live examples`);
    ctx.log(`${result.groups} live groups compiled for 4 frameworks: ${result.payloads.length} payloads, ${result.natives.length} native Angular components`);
  },
};
