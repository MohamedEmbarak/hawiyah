// Writes src/generated/install.json (build step 32) from scripts/install/data.mjs,
// the pin of src/generated/build-info.json (step 00) and the number of entries in
// components.json at the repository root.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ADAPTERS, MANAGERS, PACKAGES, STYLE_IMPORTS, installCommand } from "./data.mjs";

/**
 * The content of install.json.
 * @param {{ pin: string, componentCount: number }} input
 */
export function installData({ pin, componentCount }) {
  if (!Number.isInteger(componentCount) || componentCount < 1) {
    throw new Error(`install: components.json must list at least one component (got ${componentCount})`);
  }
  const managers = Object.keys(MANAGERS);
  const frameworks = Object.keys(ADAPTERS);
  const commands = Object.fromEntries(
    managers.map((manager) => [manager, Object.fromEntries(frameworks.map((framework) => [framework, installCommand(manager, framework, pin)]))]),
  );
  return {
    pin,
    componentCount,
    packages: PACKAGES.map((name) => ({ name, spec: `${name}@${pin}` })),
    managers,
    frameworks,
    adapters: { ...ADAPTERS },
    commands,
    styleImports: Object.fromEntries(frameworks.map((framework) => [framework, { ...STYLE_IMPORTS[framework] }])),
  };
}

/**
 * Reads the inputs and writes <generatedDir>/install.json.
 * @param {{ generatedDir: string, componentsFile: string }} options
 */
export function writeInstall({ generatedDir, componentsFile }) {
  const info = JSON.parse(readFileSync(join(generatedDir, "build-info.json"), "utf8"));
  const catalogue = JSON.parse(readFileSync(componentsFile, "utf8"));
  if (!Array.isArray(catalogue.components)) throw new Error("install: components.json has no components array");
  const data = installData({ pin: info.pin, componentCount: catalogue.components.length });
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(join(generatedDir, "install.json"), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}
