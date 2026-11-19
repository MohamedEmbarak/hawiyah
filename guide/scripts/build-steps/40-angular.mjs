// Runs ng build for the configuration with the base href (and the preview define in
// preview builds) and tees its output to .cache/logs/build-<configuration>.log.
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";

/** The ng build arguments for a build context. */
export function ngArgs(ctx) {
  // --stats-json writes browser-stats.json and server-stats.json (esbuild metafiles)
  // to the output root; step 90 checks the inputs they record.
  const args = ["build", "--configuration", ctx.configuration, "--base-href", ctx.basePath, "--stats-json"];
  if (ctx.outDir !== "dist") args.push("--output-path", ctx.outDir);
  // No shell runs in between, so the value is the JavaScript expression itself: '<sha>'.
  if (ctx.preview) args.push("--define", `HAWIYAH_PREVIEW_COMMIT='${ctx.preview.commit}'`);
  return args;
}

export default {
  id: "40-angular",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const logDir = join(ctx.guideDir, ctx.logDir);
    mkdirSync(logDir, { recursive: true });
    const logFile = join(logDir, `build-${ctx.configuration}.log`);
    const log = createWriteStream(logFile);
    const ng = join(ctx.guideDir, "node_modules", ".bin", "ng");
    const code = await new Promise((resolvePromise, reject) => {
      const child = spawn(ng, ngArgs(ctx), {
        cwd: ctx.guideDir,
        env: { ...process.env, NG_CLI_ANALYTICS: "false", NO_COLOR: "1", FORCE_COLOR: "0", CI: process.env.CI ?? "1" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      for (const stream of [child.stdout, child.stderr]) {
        stream.on("data", (chunk) => {
          process.stdout.write(chunk);
          log.write(chunk);
        });
      }
      child.on("error", reject);
      child.on("close", resolvePromise);
    });
    await new Promise((done) => log.end(done));
    if (code !== 0) throw new Error(`ng build exited with ${code}; log in ${ctx.logDir}/build-${ctx.configuration}.log`);
  },
};
