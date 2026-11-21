#!/usr/bin/env node
// Step runner of the guide build. Imports scripts/build-steps/*.mjs in file-name
// order and runs the steps enabled for the configuration.
//
//   node scripts/build.mjs [--configuration production|development] [--generate-only]
//                          [--only <id,id>] [--preview <commit>]
//                          [--pages <id,id>] [--docs <dir>] [--defer-equivalence]
//
// --pages and --docs are scope options for local gates (scripts/build-scope.mjs):
// step 80 compares only the groups of the named pages, or the component pages are
// read from another directory. Such a build, and every --only run, is not
// deployable; its plan leaves out step 90. --defer-equivalence leaves step 80 to
// the shard jobs of guide.yml.
//
// A step is `export default { id, configurations, generate, preview, async run(ctx) }`
// and throws to fail the build. The files of scripts/build-steps must be exactly
// PLANNED_STEPS: a planned step whose file is missing, a step file that is not
// planned, an unknown --only id, or a step whose declaration disagrees with the
// plan for the requested configuration fails the build before any step runs.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contentManifestHash, limits, notDeployableReasons, removeRecord, scopeOf, writeRecord } from "./build-scope.mjs";
import { componentsDirOf } from "./content/hash.mjs";

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
  const options = { configuration: "production", generateOnly: false, only: null, preview: null, pages: null, docs: null, deferEquivalence: false };
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
    else if (arg === "--pages") options.pages = value().split(",").filter(Boolean);
    else if (arg === "--docs") options.docs = value();
    else if (arg === "--defer-equivalence") options.deferEquivalence = true;
    else throw new Error(`unknown option ${arg}`);
  }
  if (!CONFIGURATIONS.includes(options.configuration)) {
    throw new Error(`--configuration must be production or development (got ${options.configuration})`);
  }
  if (options.preview !== null && !/^[0-9a-f]{7,40}$/.test(options.preview)) {
    throw new Error(`--preview needs a commit sha (got ${options.preview})`);
  }
  if (options.pages !== null) {
    const bad = options.pages.filter((id) => !/^[a-z0-9-]+$/.test(id));
    if (options.pages.length === 0 || bad.length > 0) throw new Error(`--pages needs component ids separated by commas (got ${bad.join(",") || "none"})`);
  }
  const scoped = options.pages !== null || options.docs !== null || options.deferEquivalence;
  if (scoped && options.only) throw new Error("--only cannot be combined with --pages, --docs or --defer-equivalence");
  if ((options.pages !== null || options.deferEquivalence) && (options.configuration !== "production" || options.generateOnly)) {
    throw new Error(`${options.pages !== null ? "--pages" : "--defer-equivalence"} concerns step 80, which runs in the full production build only`);
  }
  // --docs with --defer-equivalence builds the scale fixture (scripts/test/scale) as guide.yml builds the
  // deployable output, for the measurement of lead decision L10 of 5a; --docs keeps it not deployable.
  if (options.deferEquivalence && (options.pages !== null || options.preview !== null)) {
    throw new Error("--defer-equivalence is for the build of guide.yml and of the scale fixture: not with --pages or --preview");
  }
  return options;
}

/**
 * Steps a scope option leaves out: step 90 certifies a deployable output only, so a
 * build limited by --pages or --docs does not run it; --defer-equivalence leaves
 * step 80 to the shard jobs.
 */
export function scopeSkips(options) {
  const skips = [];
  if (options.pages || options.docs) skips.push("90-registry-dist");
  if (options.deferEquivalence) skips.push("80-equivalence");
  return skips;
}

/** Whether the plan runs step `id` for these options (files present or not). */
export function planned(id, options) {
  if (options.only) return options.only.includes(id);
  if (options.generateOnly) return GENERATE_STEPS.includes(id);
  if (scopeSkips(options).includes(id)) return false;
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
  if (scopeSkips(options).includes(step.id)) return false;
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

/** The components directory of --docs: <dir>/components when it exists, else <dir>. */
export function docsComponentsDir(docs, cwd = process.cwd()) {
  const dir = componentsDirOf(resolve(cwd, docs));
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`--docs: ${docs} is not a directory`);
  return dir;
}

/** The last line of a successful build. */
export function finalLine(options, { basePath, pages, ran }) {
  const stepsLine = `${ran.length} steps: ${ran.join(" ")}`;
  const limited = limits(options);
  const scope = limited.length > 0 ? `not deployable (${limited.join(" ")}), ` : "";
  if (options.generateOnly || options.only) {
    return `build: ${options.generateOnly ? "generate-only" : "partial"} ${options.configuration} OK, ${scope}base ${basePath}, ${stepsLine}`;
  }
  const deferred = options.deferEquivalence ? "; 80-equivalence deferred to the shard jobs: deployable only with their merged report" : "";
  return `build: ${options.configuration} OK, ${scope}${pages} prerendered pages, 404.html, base ${basePath}, ${stepsLine}${deferred}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const docsDir = options.docs ? docsComponentsDir(options.docs) : join(guideDir, "..", "docs", "components");
  process.chdir(guideDir);
  const outDir = options.configuration === "development" ? "dist-dev" : "dist";
  const notDeployable = notDeployableReasons(options);
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
    docsDir,
    pages: options.pages,
    scope: scopeOf(options),
    deployable: notDeployable.length === 0,
    notDeployable,
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

  // The output of an --only run is no longer that of one complete build: its record goes.
  if (options.only) removeRecord(join(guideDir, outDir));
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

  if (!options.generateOnly && !options.only) {
    // The record of the build in its output directory (dist/build-info.json, outside
    // the deployed dist/browser/): guide.yml deploys only an output whose record is deployable.
    const info = JSON.parse(readFileSync(join(guideDir, ctx.generatedDir, "build-info.json"), "utf8"));
    writeRecord(join(guideDir, outDir), { ...info, configuration: options.configuration, steps: ran, contentManifest: contentManifestHash(join(guideDir, ctx.generatedDir, "content", "manifest.json")) });
  }
  console.log(finalLine(options, { basePath: ctx.basePath, pages: ctx.summary.prerenderedPages ?? 0, ran }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.log(`build: FAILED ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
