import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  copied,
  copyGuide,
  copyRepositoryFiles,
  findTarballs,
  NAMES,
  repositoryFiles,
  parseArgs,
  prepareCopy,
  PreviewRefusal,
  previewPaths,
  rewriteManifest,
  strictCheckProblem,
} from "../build-preview.mjs";

const temps = [];
function temp() {
  const dir = mkdtempSync(join(tmpdir(), "hawiyah-preview-test-"));
  temps.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tarballs(dir, versions = {}) {
  for (const name of NAMES) writeFileSync(join(dir, `hawiyah-${name}-${versions[name] ?? "0.4.0"}.tgz`), name);
  return dir;
}

const manifest = () => ({
  name: "hawiyah-guide",
  private: true,
  dependencies: {
    "@angular/core": "22.2.3",
    ...Object.fromEntries(NAMES.map((name) => [`@hawiyah/${name}`, "0.3.0"])),
    vue: "3.5.44",
  },
  devDependencies: { vitest: "5.0.5" },
});

describe("findTarballs", () => {
  it("finds the seven tarballs of one version", () => {
    const dir = tarballs(temp());
    writeFileSync(join(dir, "unrelated.txt"), "");
    const found = findTarballs(dir);
    expect(found.version).toBe("0.4.0");
    expect(found.files.angular).toBe("hawiyah-angular-0.4.0.tgz");
    expect(Object.keys(found.files)).toEqual(NAMES);
  });

  it("refuses without the tarball directory", () => {
    expect(() => findTarballs(join(temp(), "package-check"))).toThrow(PreviewRefusal);
    expect(() => findTarballs(join(temp(), "package-check"))).toThrow(/pnpm build:packages && pnpm check:packages/);
  });

  it("refuses when any tarball is missing", () => {
    const dir = tarballs(temp());
    rmSync(join(dir, "hawiyah-vue-0.4.0.tgz"));
    expect(() => findTarballs(dir)).toThrow(/tarballs missing .*hawiyah-vue-<version>\.tgz/);
    expect(() => findTarballs(temp())).toThrow(/hawiyah-tokens-<version>\.tgz, hawiyah-styles/);
  });

  it("refuses mixed versions", () => {
    const dir = tarballs(temp(), { react: "0.4.1" });
    expect(() => findTarballs(dir)).toThrow(PreviewRefusal);
    expect(() => findTarballs(dir)).toThrow(/versions differ .*@hawiyah\/react@0\.4\.1/);
  });

  it("refuses two tarballs of one package", () => {
    const dir = tarballs(temp());
    writeFileSync(join(dir, "hawiyah-core-0.3.0.tgz"), "old");
    expect(() => findTarballs(dir)).toThrow(/more than one tarball .*hawiyah-core-0\.3\.0\.tgz and hawiyah-core-0\.4\.0\.tgz/);
  });

  it("accepts a prerelease version", () => {
    const dir = tarballs(temp(), Object.fromEntries(NAMES.map((name) => [name, "0.4.0-next.1"])));
    expect(findTarballs(dir).version).toBe("0.4.0-next.1");
  });
});

describe("rewriteManifest", () => {
  it("points the seven dependencies at the tarballs and changes nothing else", () => {
    const original = manifest();
    const next = rewriteManifest(original, findTarballs(tarballs(temp())));
    for (const name of NAMES) {
      expect(next.dependencies[`@hawiyah/${name}`]).toBe(`file:../../package-check/hawiyah-${name}-0.4.0.tgz`);
    }
    expect(next.dependencies["@angular/core"]).toBe("22.2.3");
    expect(next.dependencies.vue).toBe("3.5.44");
    expect(next.devDependencies).toEqual({ vitest: "5.0.5" });
    expect(original.dependencies["@hawiyah/core"]).toBe("0.3.0");
  });

  it("refuses a manifest without one of the seven", () => {
    const original = manifest();
    delete original.dependencies["@hawiyah/styles"];
    expect(() => rewriteManifest(original, findTarballs(tarballs(temp())))).toThrow(/no dependency @hawiyah\/styles/);
  });
});

describe("copy", () => {
  it("leaves out installs, build output, caches and generated sources", () => {
    expect(copied("")).toBe(true);
    expect(copied("package.json")).toBe(true);
    expect(copied(["src", "app", "app.ts"].join(sep))).toBe(true);
    expect(copied(["scripts", "dist-tools.mjs"].join(sep))).toBe(true);
    for (const rel of ["node_modules", "dist", "dist-dev", ".cache", ".angular", ["src", "generated"].join(sep)]) {
      expect(copied(rel)).toBe(false);
      expect(copied(`${rel}${sep}x.json`)).toBe(false);
    }
  });

  it("copies the guide, rewrites the copy's manifest and removes only the copy's lockfile", () => {
    const guide = temp();
    writeFileSync(join(guide, "package.json"), JSON.stringify(manifest(), null, 2));
    writeFileSync(join(guide, "package-lock.json"), "{}");
    mkdirSync(join(guide, "src", "generated"), { recursive: true });
    writeFileSync(join(guide, "src", "generated", "build-info.json"), "{}");
    writeFileSync(join(guide, "src", "main.ts"), "");
    mkdirSync(join(guide, "node_modules", "x"), { recursive: true });
    const copy = join(temp(), "guide-preview", "guide");
    mkdirSync(copy, { recursive: true });
    writeFileSync(join(copy, "stale.txt"), "");

    copyGuide(guide, copy);
    prepareCopy(copy, findTarballs(tarballs(temp())));

    expect(existsSync(join(copy, "stale.txt"))).toBe(false);
    expect(existsSync(join(copy, "src", "main.ts"))).toBe(true);
    expect(existsSync(join(copy, "src", "generated"))).toBe(false);
    expect(existsSync(join(copy, "node_modules"))).toBe(false);
    expect(existsSync(join(copy, "package-lock.json"))).toBe(false);
    expect(JSON.parse(readFileSync(join(copy, "package.json"), "utf8")).dependencies["@hawiyah/vue"]).toBe(
      "file:../../package-check/hawiyah-vue-0.4.0.tgz",
    );
    expect(JSON.parse(readFileSync(join(guide, "package.json"), "utf8")).dependencies["@hawiyah/vue"]).toBe("0.3.0");
    expect(readFileSync(join(guide, "package-lock.json"), "utf8")).toBe("{}");
  });

  it("places the working tree's other files beside the copy", () => {
    const repo = temp();
    writeFileSync(join(repo, "components.json"), "{}");
    mkdirSync(join(repo, "docs", "components"), { recursive: true });
    writeFileSync(join(repo, "docs", "components", "button.md"), "# Button");
    const listing = ["components.json", "docs/components/button.md", "guide/package.json", ".artifacts/x.tgz", "deleted.md", "components.json", ""].join("\0");
    const files = repositoryFiles(listing, repo);
    expect(files).toEqual(["components.json", "docs/components/button.md"]);
    const root = join(temp(), "guide-preview");
    expect(copyRepositoryFiles(repo, root, files)).toBe(2);
    expect(readFileSync(join(root, "docs", "components", "button.md"), "utf8")).toBe("# Button");
    expect(existsSync(join(root, "guide"))).toBe(false);
  });

  it("places the copy so that file:../../package-check reaches the tarballs", () => {
    const paths = previewPaths(join(temp(), "guide"));
    expect(join(paths.copyDir, "..", "..", "package-check")).toBe(paths.tarballsDir);
    expect(join(paths.browserDir, "..", "..")).toBe(paths.copyDir);
    expect(join(paths.copyDir, "..")).toBe(paths.previewRoot);
  });
});

describe("strict check of the preview tree", () => {
  it("requires exit 1 with HWREG-R1 and HWREG-R3", () => {
    expect(strictCheckProblem(1, "HWREG-R1 a\nHWREG-R2 b\nHWREG-R3 c\n")).toBeNull();
    expect(strictCheckProblem(0, "registry-check: OK")).toMatch(/exited 0; expected 1/);
    expect(strictCheckProblem(2, "HWREG-R1 HWREG-R3")).toMatch(/exited 2/);
    expect(strictCheckProblem(1, "HWREG-R1 a")).toMatch(/no HWREG-R3 finding/);
  });
});

describe("arguments", () => {
  it("requires a commit sha", () => {
    expect(parseArgs(["--commit", "0123456789abcdef0123456789abcdef01234567"]).commit).toHaveLength(40);
    expect(parseArgs(["--commit=abcdef1"]).commit).toBe("abcdef1");
    expect(() => parseArgs([])).toThrow(/--commit needs a commit sha/);
    expect(() => parseArgs(["--commit", "HEAD"])).toThrow(PreviewRefusal);
    expect(() => parseArgs(["--other"])).toThrow(/unknown argument/);
  });
});
