import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
  console.error(
    "Usage: pnpm new:component kebab-case-name\nCreates an editable application block; never overwrites files.",
  );
  process.exit(1);
}
const root = fileURLToPath(new URL("../", import.meta.url));
const dest = resolve(root, "blocks", name);
if (existsSync(dest)) {
  console.error(`Block ${name} already exists.`);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
writeFileSync(
  resolve(dest, "index.html"),
  `<!-- Hawiyah 0.2 application block. Customize layout; keep primitive contracts. -->\n<section class="hw-card ${name}" aria-labelledby="${name}-title">\n  <div class="hw-card-body">\n    <h2 id="${name}-title">Your title</h2>\n    <p>Your content.</p>\n    <button type="button" class="hw-button">Continue</button>\n  </div>\n</section>\n`,
);
writeFileSync(
  resolve(dest, "styles.css"),
  `.${name} {\n  /* Use --hw-* semantic variables and logical properties. */\n}\n`,
);
writeFileSync(
  resolve(dest, "README.md"),
  `# ${name}\n\nApplication-owned block generated from Hawiyah 0.2.\n\nCheck Arabic/English, RTL/LTR, keyboard focus, reduced motion, contrast,\nmobile overflow, and all applicable loading/empty/error states.\nUse documented primitives; do not reach into private component internals.\n`,
);
console.log(`Created blocks/${name}`);
