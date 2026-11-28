// Runs ng build for the configuration with the base href (and the preview define in
// preview builds) and tees its output to .cache/logs/build-<configuration>.log.
//
// The Angular compilation holds every page model, listing and native example of the
// guide in one program: at 85 component pages it needs more than Node's default heap
// (measured: out of memory at the default of about 2.2 GB, 6.3 GB peak with 8192 MB).
// The step therefore gives ng build its own heap limit (NG_HEAP_MB) in its spawn
// environment and logs the peak memory of the ng process tree where /proc exists.
// After the build it requires that no browser output has the content manifest among
// its inputs (scripts/features/bundle.mjs).
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkBrowserStats } from "../features/bundle.mjs";

/** Heap limit of ng build in MB. Taking the page JSON out of the program is the next step when the peak passes 10 GB. */
export const NG_HEAP_MB = 8192;

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

/**
 * NODE_OPTIONS of ng build: the caller's options with the step's heap limit added,
 * unless the caller set a heap limit of its own.
 */
export function ngNodeOptions(callerOptions = "") {
  const caller = String(callerOptions ?? "").trim();
  if (/--max-old-space-size(?:=|\s)/.test(caller)) return caller;
  return [caller, `--max-old-space-size=${NG_HEAP_MB}`].filter(Boolean).join(" ");
}

/** The environment of ng build. */
export function ngEnv(env = process.env) {
  return { ...env, NODE_OPTIONS: ngNodeOptions(env.NODE_OPTIONS), NG_CLI_ANALYTICS: "false", NO_COLOR: "1", FORCE_COLOR: "0", CI: env.CI ?? "1" };
}

/** Pids of a process and its descendants, from /proc/<pid>/stat. */
function processTree(root) {
  const children = new Map();
  for (const name of readdirSync("/proc")) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const stat = readFileSync(`/proc/${name}/stat`, "utf8");
      // The command name is in parentheses and may hold spaces; the parent pid follows the state.
      const ppid = Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[1]);
      if (!children.has(ppid)) children.set(ppid, []);
      children.get(ppid).push(Number(name));
    } catch {
      // The process ended while it was read.
    }
  }
  const out = [];
  const queue = [root];
  while (queue.length > 0) {
    const pid = queue.shift();
    out.push(pid);
    queue.push(...(children.get(pid) ?? []));
  }
  return out;
}

/** Memory of one process in kB: the proportional set size, else the resident set size. */
function memoryKb(pid) {
  try {
    const rollup = readFileSync(`/proc/${pid}/smaps_rollup`, "utf8");
    const pss = /^Pss:\s+(\d+) kB/m.exec(rollup);
    if (pss) return Number(pss[1]);
  } catch {
    // No smaps_rollup: fall back to the resident set size.
  }
  try {
    const status = readFileSync(`/proc/${pid}/status`, "utf8");
    return Number(/^VmRSS:\s+(\d+) kB/m.exec(status)?.[1] ?? 0);
  } catch {
    return 0;
  }
}

/** Samples the memory of a process tree every 250 ms; stop() returns the peak in MB, or null without /proc. */
export function samplePeakMemory(pid) {
  if (!existsSync("/proc/self/stat")) return { stop: () => null };
  let peak = 0;
  const sample = () => {
    const total = processTree(pid).reduce((sum, child) => sum + memoryKb(child), 0);
    if (total > peak) peak = total;
  };
  sample();
  const timer = setInterval(sample, 250);
  return {
    stop() {
      clearInterval(timer);
      return Math.round(peak / 1024);
    },
  };
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
    const env = ngEnv();
    let sampler = { stop: () => null };
    const code = await new Promise((resolvePromise, reject) => {
      const child = spawn(ng, ngArgs(ctx), { cwd: ctx.guideDir, env, stdio: ["ignore", "pipe", "pipe"] });
      sampler = samplePeakMemory(child.pid);
      for (const stream of [child.stdout, child.stderr]) {
        stream.on("data", (chunk) => {
          process.stdout.write(chunk);
          log.write(chunk);
        });
      }
      child.on("error", reject);
      child.on("close", resolvePromise);
    });
    const peak = sampler.stop();
    const memory = peak === null ? "peak memory not measured (no /proc)" : `peak memory ${peak} MB (proportional set size of the ng process tree, sampled every 250 ms)`;
    const line = `40-angular: ${memory}; NODE_OPTIONS ${env.NODE_OPTIONS}\n`;
    log.write(line);
    await new Promise((done) => log.end(done));
    ctx.log(line.trim());
    if (code !== 0) throw new Error(`ng build exited with ${code}; log in ${ctx.logDir}/build-${ctx.configuration}.log`);
    // The content manifest is a build-time file: no browser output may import it.
    const stats = checkBrowserStats(join(ctx.guideDir, ctx.outDir, "browser-stats.json"));
    ctx.log(`40-angular: none of the ${stats.outputs} browser outputs has src/generated/content/manifest.json among its inputs`);
  },
};
