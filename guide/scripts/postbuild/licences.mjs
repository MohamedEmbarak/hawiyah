// Licence files the guide distributes (build step 70): <browserDir>/licenses/ holds
// the LICENSE and NOTICE of every installed @hawiyah package, the third-party notices
// the packages carry and the licences of the packaged fonts; NOTICE.txt repeats the
// repository NOTICE and lists those files. JavaScript bundled by the Angular build is
// covered by 3rdpartylicenses.txt, which the production build extracts next to
// browser/ and this step copies into it.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export const HAWIYAH_PACKAGES = ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"];

function copy(from, to, written, browserDir) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  written.push(relative(browserDir, to).split("\\").join("/"));
}

function copyTree(from, to, written, browserDir) {
  for (const name of readdirSync(from).sort()) {
    const source = join(from, name);
    if (statSync(source).isDirectory()) copyTree(source, join(to, name), written, browserDir);
    else copy(source, join(to, name), written, browserDir);
  }
}

/**
 * @param {{ guideDir: string, browserDir: string, noticeFile: string }} options
 * @returns {string[]} Written paths relative to browserDir.
 */
export function writeLicences({ guideDir, browserDir, noticeFile }) {
  const written = [];
  const target = join(browserDir, "licenses");
  for (const name of HAWIYAH_PACKAGES) {
    const dir = join(guideDir, "node_modules", "@hawiyah", name);
    if (!existsSync(dir)) throw new Error(`licences: @hawiyah/${name} is not installed`);
    for (const file of ["LICENSE", "NOTICE"]) {
      if (!existsSync(join(dir, file))) throw new Error(`licences: @hawiyah/${name} has no ${file}`);
      copy(join(dir, file), join(target, "hawiyah", name, file), written, browserDir);
    }
    if (existsSync(join(dir, "third-party"))) {
      copyTree(join(dir, "third-party"), join(target, "hawiyah", name, "third-party"), written, browserDir);
    }
  }
  const fonts = join(guideDir, "node_modules", "@hawiyah", "styles", "dist", "assets", "fonts");
  for (const name of readdirSync(fonts).sort()) {
    if (/-(LICENSE\.txt|provenance\.json)$/.test(name)) copy(join(fonts, name), join(target, "fonts", name), written, browserDir);
  }
  if (!existsSync(noticeFile)) throw new Error("licences: the repository NOTICE is missing");
  const notice = readFileSync(noticeFile, "utf8").trimEnd();
  // The Angular builder writes the extracted licences next to browser/, which is not deployed.
  const extracted = join(browserDir, "..", "3rdpartylicenses.txt");
  if (existsSync(extracted)) copy(extracted, join(browserDir, "3rdpartylicenses.txt"), written, browserDir);
  const listed = written;
  const text = [
    notice,
    "",
    "In this guide, the provenance of the NIC image is in assets/nic-logo.README.md.",
    "",
    "Licence files distributed with this guide:",
    ...listed.map((path) => `- ${path}`),
    "",
  ].join("\n");
  writeFileSync(join(browserDir, "NOTICE.txt"), text);
  return [...written, "NOTICE.txt"];
}
