// The single source of install facts (landing.installData). The landing, the
// generated install.json and llms.txt read them from here; no other file states
// an install command.

/** Package managers in the order of the landing chooser, with their add verb. */
export const MANAGERS = Object.freeze({
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
});

/** Frameworks in the order of the landing chooser, with their adapter package. */
export const ADAPTERS = Object.freeze({
  vanilla: "@hawiyah/vanilla",
  react: "@hawiyah/react",
  vue: "@hawiyah/vue",
  angular: "@hawiyah/angular",
});

/** The seven packages, which share one version. */
export const PACKAGES = Object.freeze([
  "@hawiyah/tokens",
  "@hawiyah/styles",
  "@hawiyah/core",
  "@hawiyah/vanilla",
  "@hawiyah/react",
  "@hawiyah/vue",
  "@hawiyah/angular",
]);

const STYLE_IMPORT = "import '@hawiyah/styles/styles.css';";

/** Where each framework loads the stylesheet once. */
export const STYLE_IMPORTS = Object.freeze({
  vanilla: Object.freeze({ file: "src/main.js", text: STYLE_IMPORT }),
  react: Object.freeze({ file: "src/main.tsx", text: STYLE_IMPORT }),
  vue: Object.freeze({ file: "src/main.ts", text: STYLE_IMPORT }),
  angular: Object.freeze({ file: "src/styles.css", text: "@import '@hawiyah/styles/styles.css';" }),
});

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/**
 * The install command of one pair. The exact pin is written for both packages,
 * because the latest dist-tag may name an older release.
 * @param {keyof typeof MANAGERS} manager
 * @param {keyof typeof ADAPTERS} framework
 * @param {string} pin
 */
export function installCommand(manager, framework, pin) {
  const verb = MANAGERS[manager];
  const adapter = ADAPTERS[framework];
  if (!verb) throw new Error(`install: unknown package manager ${manager}`);
  if (!adapter) throw new Error(`install: unknown framework ${framework}`);
  if (typeof pin !== "string" || !EXACT_VERSION.test(pin)) throw new Error(`install: the pin must be an exact version (got ${pin})`);
  return `${verb} @hawiyah/styles@${pin} ${adapter}@${pin}`;
}
