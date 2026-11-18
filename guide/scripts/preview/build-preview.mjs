#!/usr/bin/env node
// Preview build of the guide from the local package tarballs (previewWorkflow).
//
//   node scripts/preview/build-preview.mjs --commit <sha>
//
// Requires 'pnpm build:packages && pnpm check:packages' at the repository root,
// which write .artifacts/package-check/hawiyah-<name>-<version>.tgz. The script
// copies guide/ to .artifacts/guide-preview/guide/ and the other files of the
// working tree beside it (so that '..' of the copy is the repository, as the
// content pipeline and the registry check expect), points the copy's seven
// @hawiyah dependencies at the tarballs, installs, confirms that the strict
// registry check rejects the copy, and builds it with --preview <commit>.
// The repository's guide/package.json and package-lock.json are never modified:
// every write happens in the copy.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const NAMES = ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"];

/** Top-level entries of guide/ that are not copied (build output and installs). */
export const EXCLUDED = ["node_modules", "dist", "dist-dev", ".cache", ".angular", join("src", "generated")];

const TARBALL = /^hawiyah-([a-z]+)-(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\.tgz$/;

export class PreviewRefusal extends Error {}

/** Paths of the preview build for a guide directory inside the repository. */
export function previewPaths(guideDir) {
  const repoDir = resolve(guideDir, "..");
  const artifactsDir = join(repoDir, ".artifacts");
  const previewRoot = join(artifactsDir, "guide-preview");
  const copyDir = join(previewRoot, "guide");
  return {
    repoDir,
    previewRoot,
    tarballsDir: join(artifactsDir, "package-check"),
    copyDir,
    browserDir: join(copyDir, "dist", "browser"),
  };
}

/**
 * Finds the seven tarballs in `dir`. Refuses when the directory or any tarball
 * is missing, when a package has more than one tarball, or when the versions
 * differ. Returns { version, files: { name: fileName } }.
 */
export function findTarballs(dir) {
  if (!existsSync(dir)) {
    throw new PreviewRefusal(`${dir} does not exist; run 'pnpm build:packages && pnpm check:packages' at the repository root first`);
  }
  const found = new Map();
  for (const file of readdirSync(dir).sort()) {
    const match = file.match(TARBALL);
    if (!match || !NAMES.includes(match[1])) continue;
    const list = found.get(match[1]) ?? [];
    list.push({ file, version: match[2] });
    found.set(match[1], list);
  }
  const missing = NAMES.filter((name) => !found.has(name));
  if (missing.length > 0) {
    throw new PreviewRefusal(
      `tarballs missing in ${dir}: ${missing.map((name) => `hawiyah-${name}-<version>.tgz`).join(", ")}; run 'pnpm build:packages && pnpm check:packages' at the repository root first`,
    );
  }
  const several = NAMES.filter((name) => found.get(name).length > 1);
  if (several.length > 0) {
    const list = several.map((name) => found.get(name).map((entry) => entry.file).join(" and ")).join("; ");
    throw new PreviewRefusal(`more than one tarball for a package in ${dir}: ${list}; the seven packages share one version`);
  }
  const versions = new Set(NAMES.map((name) => found.get(name)[0].version));
  if (versions.size > 1) {
    const list = NAMES.map((name) => `@hawiyah/${name}@${found.get(name)[0].version}`).join(", ");
    throw new PreviewRefusal(`tarball versions differ in ${dir}: ${list}; the seven packages share one version`);
  }
  return {
    version: [...versions][0],
    files: Object.fromEntries(NAMES.map((name) => [name, found.get(name)[0].file])),
  };
}

/**
 * Returns a copy of the manifest whose seven @hawiyah dependencies point at the
 * tarballs, as seen from .artifacts/guide-preview/guide/. Nothing else changes.
 */
export function rewriteManifest(manifest, tarballs) {
  const next = structuredClone(manifest);
  next.dependencies = { ...(next.dependencies ?? {}) };
  for (const name of NAMES) {
    const key = `@hawiyah/${name}`;
    if (!(key in next.dependencies)) throw new PreviewRefusal(`guide/package.json has no dependency ${key}`);
    next.dependencies[key] = `file:../../package-check/${tarballs.files[name]}`;
  }
  return next;
}

/** Whether a path relative to guide/ is copied. */
export function copied(rel) {
  const normal = rel.split(sep).join("/");
  return !EXCLUDED.some((entry) => {
    const excluded = entry.split(sep).join("/");
    return normal === excluded || normal.startsWith(`${excluded}/`);
  });
}

/** Copies guide/ to the preview directory, replacing an earlier copy of guide/. */
export function copyGuide(guideDir, copyDir) {
  rmSync(copyDir, { recursive: true, force: true });
  mkdirSync(dirname(copyDir), { recursive: true });
  cpSync(guideDir, copyDir, {
    recursive: true,
    filter: (source) => copied(relative(guideDir, source)),
  });
}

/**
 * The files of the working tree that are placed beside the copy: what
 * 'git ls-files --cached --others --exclude-standard' lists (NUL separated),
 * without guide/ (copied separately) and .artifacts/, and only files that exist.
 */
export function repositoryFiles(listing, repoDir) {
  return [...new Set(listing.split("\0").filter(Boolean))]
    .filter((file) => !file.startsWith("guide/") && !file.startsWith(".artifacts/"))
    .filter((file) => existsSync(join(repoDir, file)))
    .sort();
}

/** Copies the listed repository files into previewRoot at the same relative paths. */
export function copyRepositoryFiles(repoDir, previewRoot, files) {
  for (const file of files) {
    const target = join(previewRoot, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(repoDir, file), target);
  }
  return files.length;
}

/** Writes the rewritten manifest into the copy and removes the copy's lockfile. */
export function prepareCopy(copyDir, tarballs) {
  const file = join(copyDir, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  writeFileSync(file, `${JSON.stringify(rewriteManifest(manifest, tarballs), null, 2)}\n`);
  rmSync(join(copyDir, "package-lock.json"), { force: true });
}

/**
 * Judges the strict registry check of the preview tree: it must fail (exit 1)
 * with HWREG-R1 and HWREG-R3 findings. Returns the reason when it does not.
 */
export function strictCheckProblem(status, output) {
  if (status !== 1) return `the strict registry check of the preview tree exited ${status}; expected 1`;
  const absent = ["HWREG-R1", "HWREG-R3"].filter((code) => !output.includes(code));
  if (absent.length > 0) return `the strict registry check of the preview tree reported no ${absent.join(" or ")} finding`;
  return null;
}

export function parseArgs(argv) {
  let commit = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--commit") {
      commit = argv[i + 1] ?? null;
      i += 1;
    } else if (arg.startsWith("--commit=")) {
      commit = arg.slice("--commit=".length);
    } else {
      throw new PreviewRefusal(`unknown argument ${arg}`);
    }
  }
  if (commit === null || !/^[0-9a-f]{7,40}$/.test(commit)) {
    throw new PreviewRefusal(`--commit needs a commit sha (got ${commit ?? "nothing"})`);
  }
  return { commit };
}

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: options.capture ? "pipe" : "inherit", encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  return result;
}

function main() {
  const { commit } = parseArgs(process.argv.slice(2));
  const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const paths = previewPaths(guideDir);

  // (1) The seven tarballs, one version.
  const tarballs = findTarballs(paths.tarballsDir);
  console.log(`preview: 7 tarballs @hawiyah/*@${tarballs.version} in ${relative(guideDir, paths.tarballsDir)}`);

  // (2) and (3) The copy, its manifest and no lockfile.
  const listing = run("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: paths.repoDir, capture: true });
  if (listing.status !== 0) throw new Error(`git ls-files exited ${listing.status}; the preview needs a git working tree`);
  rmSync(paths.previewRoot, { recursive: true, force: true });
  const count = copyRepositoryFiles(paths.repoDir, paths.previewRoot, repositoryFiles(listing.stdout, paths.repoDir));
  copyGuide(guideDir, paths.copyDir);
  prepareCopy(paths.copyDir, tarballs);
  console.log(`preview: copied the guide to ${relative(guideDir, paths.copyDir)} and ${count} repository files beside it`);

  // (4) Install in the copy.
  const install = run("npm", ["install", "--no-audit", "--no-fund"], { cwd: paths.copyDir });
  if (install.status !== 0) throw new Error(`npm install in the preview copy exited ${install.status}`);

  // (5) Negative control: the strict registry check never passes a preview tree.
  const strictEnv = { ...process.env };
  delete strictEnv.HAWIYAH_PREVIEW_BUILD;
  const strict = run(process.execPath, [join("scripts", "registry-check", "cli.mjs")], { cwd: paths.copyDir, env: strictEnv, capture: true });
  const strictOutput = `${strict.stdout ?? ""}${strict.stderr ?? ""}`;
  const problem = strictCheckProblem(strict.status, strictOutput);
  if (problem) {
    process.stdout.write(strictOutput);
    throw new Error(problem);
  }
  console.log("preview: the strict registry check rejects the preview tree as expected (HWREG-R1, HWREG-R3)");

  // (6) The preview build.
  const build = run(process.execPath, [join("scripts", "build.mjs"), "--preview", commit], {
    cwd: paths.copyDir,
    env: { ...process.env, HAWIYAH_PREVIEW_BUILD: "1" },
  });
  if (build.status !== 0) throw new Error(`the preview build exited ${build.status}`);
  if (!existsSync(join(paths.browserDir, "preview.json"))) throw new Error("the preview build wrote no preview.json");

  // (7) The result line.
  console.log(`preview: built from local tarballs at commit ${commit.slice(0, 7)} in ${relative(guideDir, paths.browserDir).split(sep).join("/")}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    const refusal = error instanceof PreviewRefusal;
    console.log(`preview: ${refusal ? "REFUSED" : "FAILED"} ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
