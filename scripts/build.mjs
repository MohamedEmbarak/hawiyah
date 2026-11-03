import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
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
if (existsSync(resolve(root, "packages/tokens/scripts/generate.mjs")))
  run("node", ["packages/tokens/scripts/generate.mjs"]);
for (const name of [
  "tokens",
  "styles",
  "core",
  "vanilla",
  "react",
  "vue",
  "angular",
]) {
  const cwd = resolve(root, "packages", name);
  if (!existsSync(resolve(cwd, "package.json"))) continue;
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
  }
}
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
