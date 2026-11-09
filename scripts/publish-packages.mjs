// Publishes the seven @nasaq packages to npm from the tarballs that
// check-packages.mjs builds and verifies. Without --publish this is a dry run.
//
//   node scripts/publish-packages.mjs              build, verify, npm publish --dry-run
//   node scripts/publish-packages.mjs --publish    build, verify, publish for real
//   --tag <name>                                   npm dist-tag (default: latest,
//                                                  or next for a prerelease version)
//
// Packages publish in dependency order. Versions already on the registry are
// skipped, so an interrupted release can be resumed by running it again.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const order = ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"];
const args = process.argv.slice(2);
const publish = args.includes("--publish");
const tagIndex = args.indexOf("--tag");
const requestedTag = tagIndex === -1 ? undefined : args[tagIndex + 1];
if (tagIndex !== -1 && (!requestedTag || requestedTag.startsWith("-")))
  throw new Error("--tag needs a dist-tag name");

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    env: { ...process.env, ...options.env },
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (!options.allowFailure && result.status !== 0)
    throw new Error(`${cmd} ${cmdArgs.join(" ")} failed (${result.status})`);
  return result;
}

const manifests = order.map((name) =>
  JSON.parse(readFileSync(resolve(root, "packages", name, "package.json"), "utf8")),
);
const versions = new Set(manifests.map((manifest) => manifest.version));
if (versions.size !== 1)
  throw new Error(`Packages must share one version; found ${[...versions].join(", ")}`);
const [version] = versions;
const tag = requestedTag || (version.includes("-") ? "next" : "latest");

function requireCleanTree(when) {
  if (!publish) return;
  const status = run("git", ["status", "--porcelain"], { capture: true }).stdout.trim();
  if (status) throw new Error(`Working tree must be clean ${when} publishing:\n${status}`);
}

requireCleanTree("before");
run(process.execPath, ["scripts/build.mjs", "--packages"]);
// The build must not rewrite tracked sources, or the release would not match its commit.
requireCleanTree("after building, before");
run(process.execPath, ["scripts/check-packages.mjs"], { env: { NASAQ_RELEASE: "1" } });

for (const [index, name] of order.entries()) {
  const id = manifests[index].name;
  const tarball = resolve(root, ".artifacts/package-check", `nasaq-${name}-${version}.tgz`);
  if (!existsSync(tarball)) throw new Error(`Missing verified tarball for ${id}`);
  const view = run("npm", ["view", `${id}@${version}`, "version"], {
    capture: true,
    allowFailure: true,
  });
  if (view.status === 0 && view.stdout.trim() === version) {
    console.log(`${id}@${version} is already on npm; skipping.`);
    continue;
  }
  if (view.status !== 0 && !/E404|404 Not Found/.test(view.stderr))
    throw new Error(`Could not check ${id}@${version} on npm:\n${view.stderr}`);
  run("npm", [
    "publish",
    tarball,
    "--access",
    "public",
    "--tag",
    tag,
    ...(publish ? [] : ["--dry-run"]),
  ]);
}
console.log(
  publish
    ? `Published @nasaq/* ${version} with dist-tag ${tag}.`
    : `Dry run complete for @nasaq/* ${version}. Re-run with --publish to release.`,
);
