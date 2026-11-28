// Build step 50: scans the tee'd ng build log of step 40
// (.cache/logs/build-<configuration>.log) with the log scan (lint.logScan).
// The expected number of prerendered routes comes from features.json and the
// content manifest, computed by the route verification of step 70.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { formatFinding, scanLog } from "../log-scan/scan.mjs";
import { expectedPrerenderCount } from "../postbuild/verify-routes.mjs";

export function expectedRoutes(ctx) {
  const generated = resolve(ctx.guideDir, ctx.generatedDir);
  const featuresFile = join(generated, "features.json");
  if (!existsSync(featuresFile)) throw new Error(`log-scan: ${ctx.generatedDir}/features.json is missing; step 10 writes it`);
  const manifestFile = join(generated, "content", "manifest.json");
  return expectedPrerenderCount({
    features: JSON.parse(readFileSync(featuresFile, "utf8")),
    manifest: existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : null,
  });
}

export default {
  id: "50-log-scan",
  configurations: ["production", "development"],
  generate: false,
  preview: true,
  async run(ctx) {
    const logFile = resolve(ctx.guideDir, ctx.logDir, `build-${ctx.configuration}.log`);
    if (!existsSync(logFile)) throw new Error(`log-scan: ${ctx.logDir}/build-${ctx.configuration}.log is missing; step 40 writes it`);
    const result = scanLog(readFileSync(logFile, "utf8"), ctx.configuration, { expectedRoutes: expectedRoutes(ctx) });
    const summary = `log-scan: ${result.findings.length} findings (${ctx.configuration})`;
    if (result.findings.length > 0) throw new Error([...result.findings.map(formatFinding), summary].join("\n"));
    ctx.log(summary);
  },
};
