import { cpSync, mkdirSync, copyFileSync, writeFileSync, appendFileSync } from "node:fs";
import { collectEditorNotices } from "./editor-notices.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const dest = resolve(root, "apps/playground/public");
mkdirSync(dest, { recursive: true });
for (const entry of [
  "assets", "previews", "third-party", "brand.css", "fonts.css", "index.html", "index-en.html",
  "README.md", "decision.json", "editable-wordmark.svg", "palette.json", "nasaq-brand-kit.zip",
]) {
  cpSync(resolve(root, "brand", entry), resolve(dest, "brand", entry), { recursive: true });
}
for (const file of ['LICENSE', 'NOTICE']) copyFileSync(resolve(root, file), resolve(dest, file));
copyFileSync(
  resolve(root, "brand/assets/favicon.svg"),
  resolve(dest, "favicon.svg"),
);
mkdirSync(resolve(dest, "licenses"), { recursive: true });
copyFileSync(resolve(root, "packages/styles/src/assets/icons/LICENSE"), resolve(dest, "licenses/hugeicons-LICENSE.txt"));
copyFileSync(resolve(root, "packages/styles/src/assets/icons/provenance.json"), resolve(dest, "licenses/icon-provenance.json"));
copyFileSync(resolve(root, "packages/styles/src/assets/fonts/riyal-LICENSE.txt"), resolve(dest, "licenses/riyal-LICENSE.txt"));
copyFileSync(resolve(root, "packages/styles/src/assets/fonts/riyal-provenance.json"), resolve(dest, "licenses/riyal-provenance.json"));
appendFileSync(resolve(dest, "NOTICE"), "\nThe NasaqRiyal symbol font is a U+20C1-only derivative of Noto Naskh Arabic 2.021, Copyright 2022 The Noto Project Authors, licensed under SIL OFL 1.1. Its license and reproducible provenance accompany this guide in licenses/riyal-LICENSE.txt and licenses/riyal-provenance.json.\n");
appendFileSync(resolve(dest, "NOTICE"), "\nThe curated Stroke Rounded icons are Copyright (c) 2025 Hugeicons, MIT licensed. Their notice and source mapping accompany this guide in licenses/hugeicons-LICENSE.txt and licenses/icon-provenance.json.\n");
writeFileSync(resolve(dest, "licenses/editor.txt"), collectEditorNotices());
copyFileSync(resolve(root, "apps/playground/third-party/framework-icons-LICENSE.md"), resolve(dest, "licenses/framework-icons-LICENSE.md"));
copyFileSync(resolve(root, "apps/playground/third-party/framework-icons-provenance.json"), resolve(dest, "licenses/framework-icons-provenance.json"));
appendFileSync(resolve(dest, "NOTICE"), "\nThe guide identifies supported frameworks and languages using Simple Icons silhouettes (CC0-1.0). Their license and source mapping accompany this guide in licenses/framework-icons-LICENSE.md and licenses/framework-icons-provenance.json. Names and logos belong to their respective owners.\n");
appendFileSync(resolve(dest, "NOTICE"), "\nThe live documentation editor includes CodeMirror, Lezer, and their runtime dependencies. Their full license notices accompany this guide in licenses/editor.txt.\n");
copyFileSync(resolve(root, "packages/core/third-party/hijridate-LICENSE.txt"), resolve(dest, "licenses/hijridate-LICENSE.txt"));
copyFileSync(resolve(root, "packages/core/third-party/provenance.json"), resolve(dest, "licenses/calendar-provenance.json"));
appendFileSync(resolve(dest, "NOTICE"), "The calendar table license and provenance accompany this guide in licenses/hijridate-LICENSE.txt and licenses/calendar-provenance.json.\n");
for (const [packagePath, name] of [
  ["@fontsource/ibm-plex-sans", "IBM-Plex-Sans"],
  ["@fontsource/ibm-plex-sans-arabic", "IBM-Plex-Sans-Arabic"],
  ["@fontsource-variable/inter", "Inter"],
]) {
  copyFileSync(
    resolve(root, "node_modules", packagePath, "LICENSE"),
    resolve(dest, "licenses", `${name}-OFL.txt`),
  );
}
