// Records what a clean package build writes to dist, so that
// scripts/check-packages.mjs can reject tarballs carrying anything else.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
export const manifestRoot = resolve(root, ".artifacts/build-manifest");
export const manifestPath = (name) => resolve(manifestRoot, `${name}.json`);
// Maps each file below dir (POSIX path relative to dir) to its SHA-256.
export function hashTree(dir) {
  const files = {};
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = resolve(entry.parentPath, entry.name);
    files[relative(dir, file).split(sep).join("/")] = createHash("sha256")
      .update(readFileSync(file))
      .digest("hex");
  }
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}
