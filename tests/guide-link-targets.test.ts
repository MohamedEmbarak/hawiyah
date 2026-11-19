// The guide's lists of repository paths (guide/build-inputs.json, guide/link-targets.json)
// name files that exist. This test runs at the repository root, in the full checkout:
// the guide workflow builds from a sparse checkout that holds the build inputs only, so
// step 20 cannot see the link targets and accepts them from the list.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (name: string, key: string): { path: string; reason?: string }[] =>
  JSON.parse(readFileSync(join(root, "guide", name), "utf8"))[key];

/** Whether a listed path exists in the checkout, as a directory when it ends with a slash. */
function exists(path: string): boolean {
  const file = join(root, path);
  if (!existsSync(file)) return false;
  return path.endsWith("/") ? statSync(file).isDirectory() : statSync(file).isFile();
}

describe("guide repository path lists", () => {
  it("every build input exists", () => {
    const inputs = read("build-inputs.json", "inputs");
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs.filter((entry) => !exists(entry.path)).map((entry) => entry.path)).toEqual([]);
  });

  it("every link target exists and is outside the build inputs", () => {
    const inputs = read("build-inputs.json", "inputs").map((entry) => entry.path);
    const targets = read("link-targets.json", "targets");
    expect(targets.filter((entry) => !exists(entry.path)).map((entry) => entry.path)).toEqual([]);
    const inside = targets.filter((entry) => inputs.some((input) => (input.endsWith("/") ? entry.path.startsWith(input) : entry.path === input)));
    expect(inside.map((entry) => entry.path)).toEqual([]);
  });
});
