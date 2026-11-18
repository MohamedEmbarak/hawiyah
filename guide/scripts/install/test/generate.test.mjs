import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ADAPTERS, MANAGERS, PACKAGES, STYLE_IMPORTS, installCommand } from "../data.mjs";
import { installData, writeInstall } from "../generate.mjs";

const temps = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "guide-install-"));
  temps.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const PIN = "0.3.0";

describe("install commands", () => {
  it("cover all twelve pairs with the exact pin in every package spec", () => {
    const data = installData({ pin: PIN, componentCount: 85 });
    expect(data.managers).toEqual(["npm", "pnpm", "yarn"]);
    expect(data.frameworks).toEqual(["vanilla", "react", "vue", "angular"]);
    let count = 0;
    for (const manager of data.managers) {
      for (const framework of data.frameworks) {
        const command = data.commands[manager][framework];
        count += 1;
        expect(command).toBe(`${MANAGERS[manager]} @hawiyah/styles@${PIN} ${ADAPTERS[framework]}@${PIN}`);
        const specs = command.split(" ").filter((part) => part.startsWith("@hawiyah/"));
        expect(specs).toHaveLength(2);
        for (const spec of specs) expect(spec.endsWith(`@${PIN}`), spec).toBe(true);
      }
    }
    expect(count).toBe(12);
  });

  it("write the commands the landing acceptance names", () => {
    const data = installData({ pin: PIN, componentCount: 85 });
    expect(data.commands.npm.angular).toBe("npm install @hawiyah/styles@0.3.0 @hawiyah/angular@0.3.0");
    expect(data.commands.pnpm.react).toBe("pnpm add @hawiyah/styles@0.3.0 @hawiyah/react@0.3.0");
    expect(data.commands.yarn.vanilla).toBe("yarn add @hawiyah/styles@0.3.0 @hawiyah/vanilla@0.3.0");
  });

  it("refuse a range, a tag or an unknown pair", () => {
    expect(() => installCommand("npm", "angular", "^0.3.0")).toThrow(/exact version/);
    expect(() => installCommand("npm", "angular", "next")).toThrow(/exact version/);
    expect(() => installCommand("bun", "angular", PIN)).toThrow(/package manager/);
    expect(() => installCommand("npm", "svelte", PIN)).toThrow(/framework/);
  });
});

describe("install.json", () => {
  it("carries the style imports with their file names, the seven packages, the pin and the count", () => {
    const data = installData({ pin: PIN, componentCount: 85 });
    expect(data.pin).toBe(PIN);
    expect(data.componentCount).toBe(85);
    expect(data.packages.map((p) => p.name)).toEqual([...PACKAGES]);
    expect(data.packages.every((p) => p.spec === `${p.name}@${PIN}`)).toBe(true);
    expect(data.styleImports).toEqual({
      vanilla: { file: "src/main.js", text: "import '@hawiyah/styles/styles.css';" },
      react: { file: "src/main.tsx", text: "import '@hawiyah/styles/styles.css';" },
      vue: { file: "src/main.ts", text: "import '@hawiyah/styles/styles.css';" },
      angular: { file: "src/styles.css", text: "@import '@hawiyah/styles/styles.css';" },
    });
    expect(Object.keys(STYLE_IMPORTS)).toEqual(Object.keys(ADAPTERS));
  });

  it("is written from build-info.json and the length of components.json", () => {
    const dir = temp();
    writeFileSync(join(dir, "build-info.json"), JSON.stringify({ pin: "1.2.3" }));
    const components = join(dir, "components.json");
    writeFileSync(components, JSON.stringify({ components: [{ id: "a" }, { id: "b" }, { id: "c" }] }));
    writeInstall({ generatedDir: dir, componentsFile: components });
    const written = JSON.parse(readFileSync(join(dir, "install.json"), "utf8"));
    expect(written.pin).toBe("1.2.3");
    expect(written.componentCount).toBe(3);
    expect(written.commands.npm.vue).toBe("npm install @hawiyah/styles@1.2.3 @hawiyah/vue@1.2.3");
  });

  it("fails without components", () => {
    expect(() => installData({ pin: PIN, componentCount: 0 })).toThrow(/at least one component/);
  });
});
