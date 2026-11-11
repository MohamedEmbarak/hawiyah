import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, relative, resolve, sep } from "node:path";
import { hashTree, manifestPath, manifestRoot } from "./dist-manifest.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
// Resolves a bare stylesheet specifier such as @hawiyah/tokens/tokens.css
// through that workspace package's exports, exactly as a consumer would.
function resolveCssImport(specifier, fromDir) {
  if (/^\.{1,2}\//.test(specifier)) return resolve(fromDir, specifier);
  const match = /^@hawiyah\/([^/]+)\/(.+)$/.exec(specifier);
  if (!match) throw new Error(`Cannot inline @import '${specifier}'`);
  const pkg = resolve(root, "packages", match[1]);
  const target = JSON.parse(readFileSync(resolve(pkg, "package.json"), "utf8")).exports?.[`./${match[2]}`];
  if (typeof target !== "string") throw new Error(`@hawiyah/${match[1]} does not export ./${match[2]}`);
  const file = resolve(pkg, target);
  if (!existsSync(file)) throw new Error(`${specifier} resolves to ${relative(root, file)}, which is not built`);
  return file;
}
const isRelativeUrl = (url) => !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url);
const cssUrls = (css) => [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]);
// Inlines a stylesheet's @import chain into one file so that the published
// entry loads in a browser without a bundler. Files are inlined in source
// order. url() references stay relative to the source directory, whose layout
// dist mirrors; an imported file from elsewhere may only use absolute URLs.
function flattenCss(file, sourceRoot, stack = []) {
  if (stack.includes(file)) throw new Error(`Circular @import of ${relative(root, file)}`);
  const css = readFileSync(file, "utf8");
  const local = !relative(sourceRoot, file).startsWith("..");
  const imports = [];
  let body = css.replace(/@import\s+(['"])([^'"]+)\1\s*;/g, (_, _quote, specifier) => {
    imports.push(specifier);
    return `@import-placeholder ${imports.length - 1};`;
  });
  if (/@import\b(?!-placeholder)/.test(body))
    throw new Error(`${relative(root, file)}: unsupported @import form`);
  const urls = cssUrls(body).filter(isRelativeUrl);
  if (urls.length && !local)
    throw new Error(`${relative(root, file)}: relative url(${urls[0]}) cannot be inlined from outside ${relative(root, sourceRoot)}`);
  if (local && dirname(file) !== sourceRoot)
    body = body.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (whole, quote, url) => isRelativeUrl(url)
      ? `url(${quote}./${relative(sourceRoot, resolve(dirname(file), url)).split(sep).join("/")}${quote})`
      : whole);
  return body.replace(/@import-placeholder (\d+);/g, (_, index) => {
    const child = resolveCssImport(imports[Number(index)], dirname(file));
    return `/* ${imports[Number(index)]} */\n${flattenCss(child, sourceRoot, [...stack, file]).trim()}\n`;
  });
}
// --only <name>[,<name>] rebuilds just those packages' dist and manifests,
// without the previews, demo or examples (for example, --only styles).
const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex >= 0 ? (process.argv[onlyIndex + 1] || "").split(",").filter(Boolean) : null;
const packageNames = ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"];
if (only && (!only.length || only.some((name) => !packageNames.includes(name)))) {
  console.error(`--only expects one or more of: ${packageNames.join(", ")}`);
  process.exit(1);
}
if ((!only || only.includes("tokens")) && existsSync(resolve(root, "packages/tokens/scripts/generate.mjs")))
  run("node", ["packages/tokens/scripts/generate.mjs"]);
for (const name of packageNames.filter((name) => !only || only.includes(name))) {
  const cwd = resolve(root, "packages", name);
  if (!existsSync(resolve(cwd, "package.json"))) continue;
  // Start from an empty dist so files removed from the sources never ship.
  // Packages build in dependency order, so each dependent sees a fresh dist.
  const dist = resolve(cwd, "dist");
  rmSync(dist, { recursive: true, force: true });
  rmSync(manifestPath(name), { force: true });
  if (name === "angular")
    run(
      "pnpm",
      [
        "exec",
        "ng-packagr",
        "-p",
        "ng-package.json",
        "-c",
        "tsconfig.lib.json",
      ],
      cwd,
    );
  else if (existsSync(resolve(cwd, "tsconfig.json")))
    run("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], cwd);
  if (existsSync(resolve(cwd, "src"))) {
    mkdirSync(resolve(cwd, "dist"), { recursive: true });
    for (const file of readdirSync(resolve(cwd, "src")))
      if (file.endsWith(".css"))
        copyFileSync(resolve(cwd, "src", file), resolve(cwd, "dist", file));
  }
  if (name === "styles") {
    cpSync(resolve(root, "brand/assets"), resolve(cwd, "dist/assets"), {recursive: true});
    cpSync(resolve(cwd, "src/assets"), resolve(cwd, "dist/assets"), {recursive: true});
    // The published entry is one flat stylesheet with the tokens included; the
    // individual files stay beside it unchanged for existing references.
    const entry = resolve(cwd, "dist/styles.css");
    const flat = `/* @hawiyah/styles: generated from src/styles.css with every imported file inlined in order. */\n${flattenCss(resolve(cwd, "src/styles.css"), resolve(cwd, "src"))}`;
    for (const url of cssUrls(flat).filter(isRelativeUrl))
      if (!existsSync(resolve(dirname(entry), url.replace(/[?#].*$/, ""))))
        throw new Error(`styles: dist/styles.css references missing ${url}`);
    writeFileSync(entry, flat);
  }
  // Record the clean output; scripts/check-packages.mjs packs nothing else.
  mkdirSync(manifestRoot, { recursive: true });
  writeFileSync(manifestPath(name), JSON.stringify(hashTree(dist), null, 2) + "\n");
}
if (only) process.exit(0);
run("node", ["scripts/build-preview.mjs"]);
run("node", ["scripts/build-project-previews.mjs"]);
if (!process.argv.includes("--packages")) {
  run("node", ["scripts/prepare-demo.mjs"]);
  run("pnpm", [
    "exec",
    "tsc",
    "-p",
    "apps/playground/tsconfig.json",
    "--noEmit",
  ]);
  run("pnpm", [
    "exec",
    "vite",
    "build",
    "--config",
    "apps/playground/vite.config.ts",
  ]);
  for (const name of process.argv.includes("--docs") ? [] : ["react", "vue", "angular"]) {
    const cfg = `examples/${name}/vite.config.ts`;
    if (existsSync(resolve(root, cfg)))
      run("pnpm", ["exec", "vite", "build", "--config", cfg]);
  }
}
