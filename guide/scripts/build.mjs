#!/usr/bin/env node
// Step runner of the guide build. Imports scripts/build-steps/*.mjs in file-name
// order and runs the steps enabled for the configuration.
//
//   node scripts/build.mjs [--configuration production|development] [--generate-only]
//                          [--only <id,id>] [--preview <commit>]
//
// A step is `export default { id, configurations, generate, preview, async run(ctx) }`
// and throws to fail the build. A step of the milestone plan whose file does not
// exist yet is reported as MISSING; it is never skipped silently.
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PLANNED_STEPS = [
  "00-env",
  "03-lint",
  "05-registry",
  "10-features",
  "20-content",
  "25-examples",
  "30-api-tables",
  "32-install",
  "35-index-html",
  "40-angular",
  "45-example-files",
  "50-log-scan",
  "60-runtime",
  "62-editor-runtime",
  "70-postbuild",
  "75-llms",
  "80-equivalence",
  "90-registry-dist",
];
export const GENERATE_STEPS = ["00-env", "10-features", "20-content", "25-examples", "30-api-tables", "32-install", "35-index-html"];
export const DEVELOPMENT_SKIPS = ["75-llms", "80-equivalence"];
const CONFIGURATIONS = ["production", "development"];

const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stepsDir = join(guideDir, "scripts", "build-steps");

export function parseArgs(argv) {
  const options = { configuration: "production", generateOnly: false, only: null, preview: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) throw new Error(`${arg} needs a value`);
      i += 1;
      return next;
    };
    if (arg === "--configuration") options.configuration = value();
    else if (arg.startsWith("--configuration=")) options.configuration = arg.slice(16);
    else if (arg === "--generate-only") options.generateOnly = true;
    else if (arg === "--only") options.only = value().split(",").filter(Boolean);
    else if (arg === "--preview") options.preview = value();
    else throw new Error(`unknown option ${arg}`);
  }
  if (!CONFIGURATIONS.includes(options.configuration)) {
    throw new Error(`--configuration must be production or development (got ${options.configuration})`);
  }
  if (options.preview !== null && !/^[0-9a-f]{7,40}$/.test(options.preview)) {
    throw new Error(`--preview needs a commit sha (got ${options.preview})`);
  }
  return options;
}

/** Whether the plan runs step `id` for these options (files present or not). */
export function planned(id, options) {
  if (options.only) return options.only.includes(id);
  if (options.generateOnly) return GENERATE_STEPS.includes(id);
  if (options.configuration === "development") return !DEVELOPMENT_SKIPS.includes(id);
  return true;
}

function enabled(step, options) {
  if (options.only) return options.only.includes(step.id);
  if (options.generateOnly && !step.generate) return false;
  if (!step.configurations.includes(options.configuration)) return false;
  if (options.preview !== null && !step.preview) return false;
  return true;
}

function validate(step, file) {
  const id = file.replace(/\.mjs$/, "");
  if (!step || typeof step !== "object") throw new Error(`${file} has no default export`);
  if (step.id !== id) throw new Error(`${file} exports id '${step.id}', expected '${id}'`);
  if (!Array.isArray(step.configurations) || typeof step.run !== "function") {
    throw new Error(`${file} must export { id, configurations, generate, preview, run }`);
  }
  if (typeof step.generate !== "boolean" || typeof step.preview !== "boolean") {
    throw new Error(`${file} must declare generate and preview as booleans`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  process.chdir(guideDir);
  const outDir = options.configuration === "development" ? "dist-dev" : "dist";
  const ctx = {
    guideDir,
    repoDir: resolve(guideDir, ".."),
    basePath: process.env.HAWIYAH_BASE_PATH ?? "/",
    configuration: options.configuration,
    generateOnly: options.generateOnly,
    outDir,
    browserDir: `${outDir}/browser`,
    cacheDir: ".cache",
    logDir: ".cache/logs",
    generatedDir: "src/generated",
    preview: options.preview === null ? null : { commit: options.preview, tarballsDir: resolve(guideDir, "..", "..", "package-check") },
    summary: {},
    log: (message) => console.log(`  ${message}`),
  };

  const files = existsSync(stepsDir) ? readdirSync(stepsDir).filter((f) => /^\d\d-[a-z0-9-]+\.mjs$/.test(f)).sort() : [];
  const present = new Set(files.map((f) => f.replace(/\.mjs$/, "")));
  const missing = PLANNED_STEPS.filter((id) => planned(id, options) && !present.has(id));
  if (options.only) {
    for (const id of options.only) if (!present.has(id) && !missing.includes(id)) missing.push(id);
  }
  const order = [...new Set([...PLANNED_STEPS, ...present])].sort();

  for (const id of order) {
    if (!present.has(id)) {
      if (missing.includes(id)) console.log(`build: ${id} MISSING (scripts/build-steps/${id}.mjs does not exist yet)`);
      continue;
    }
    const file = `${id}.mjs`;
    const step = (await import(pathToFileURL(join(stepsDir, file)).href)).default;
    validate(step, file);
    if (!enabled(step, options)) continue;
    const started = Date.now();
    try {
      await step.run(ctx);
    } catch (error) {
      console.log(`build: ${id} FAILED`);
      console.log(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
    console.log(`build: ${id} ok (${Date.now() - started} ms)`);
  }

  if (missing.length > 0) {
    console.log(`build: ${missing.length} planned step(s) missing: ${missing.join(", ")}`);
  }
  if (options.generateOnly || options.only) {
    console.log(`build: ${options.generateOnly ? "generate-only" : "partial"} ${options.configuration} OK, base ${ctx.basePath}`);
  } else {
    const pages = ctx.summary.prerenderedPages ?? 0;
    console.log(`build: ${options.configuration} OK, ${pages} prerendered pages, 404.html, base ${ctx.basePath}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.log(`build: FAILED ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
