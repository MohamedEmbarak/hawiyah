#!/usr/bin/env node
// Step runner of the guide build. Imports scripts/build-steps/*.mjs in file-name
// order and runs the steps enabled for the configuration.
//
//   node scripts/build.mjs [--configuration production|development] [--generate-only]
//                          [--only <id,id>] [--preview <commit>]
//
// A step is `export default { id, configurations, generate, preview, async run(ctx) }`
// and throws to fail the build. The files of scripts/build-steps must be exactly
// PLANNED_STEPS: a planned step whose file is missing, a step file that is not
// planned, an unknown --only id, or a step whose declaration disagrees with the
// plan for the requested configuration fails the build before any step runs.
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
  "72-page-guards",
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

/**
 * Checks the step files against the plan and returns the ids planned for these
 * options in run order. Throws with every problem found.
 */
export function resolvePlan(files, options) {
  const present = files.filter((f) => /^\d\d-[a-z0-9-]+\.mjs$/.test(f)).map((f) => f.replace(/\.mjs$/, ""));
  const problems = [];
  const missing = PLANNED_STEPS.filter((id) => !present.includes(id));
  if (missing.length > 0) problems.push(`planned step file(s) missing in scripts/build-steps: ${missing.join(", ")}`);
  const unplanned = present.filter((id) => !PLANNED_STEPS.includes(id));
  if (unplanned.length > 0) problems.push(`step file(s) not in PLANNED_STEPS: ${unplanned.join(", ")}`);
  const unknown = (options.only ?? []).filter((id) => !PLANNED_STEPS.includes(id));
  if (unknown.length > 0) problems.push(`--only names unknown step(s): ${unknown.join(", ")}`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return PLANNED_STEPS.filter((id) => planned(id, options));
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

  const files = existsSync(stepsDir) ? readdirSync(stepsDir) : [];
  const plan = resolvePlan(files, options);
  const steps = [];
  for (const id of PLANNED_STEPS) {
    const file = `${id}.mjs`;
    const step = (await import(pathToFileURL(join(stepsDir, file)).href)).default;
    validate(step, file);
    // The declaration of a step must agree with the plan; preview builds may
    // leave out a step that declares preview: false.
    const declared = enabled(step, { ...options, preview: null });
    if (declared !== plan.includes(id)) {
      throw new Error(`${file} declares that it ${declared ? "runs" : "does not run"} for this configuration, the plan says the opposite`);
    }
    if (declared && enabled(step, options)) steps.push({ id, step });
  }

  const ran = [];
  for (const { id, step } of steps) {
    const started = Date.now();
    try {
      await step.run(ctx);
    } catch (error) {
      console.log(`build: ${id} FAILED`);
      console.log(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
    ran.push(id);
    console.log(`build: ${id} ok (${Date.now() - started} ms)`);
  }

  const stepsLine = `${ran.length} steps: ${ran.join(" ")}`;
  if (options.generateOnly || options.only) {
    console.log(`build: ${options.generateOnly ? "generate-only" : "partial"} ${options.configuration} OK, base ${ctx.basePath}, ${stepsLine}`);
  } else {
    const pages = ctx.summary.prerenderedPages ?? 0;
    console.log(`build: ${options.configuration} OK, ${pages} prerendered pages, 404.html, base ${ctx.basePath}, ${stepsLine}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.log(`build: FAILED ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
