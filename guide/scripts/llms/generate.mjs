// llms.txt of the built guide (build step 75): written from the content manifest
// (src/generated/content/manifest.json), build-info.json and install.json, with the
// English compliance sentence of src/app/i18n/compliance.json (the footer
// description) as the summary (contentPipeline.generated). Only pages the build
// produced are listed.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const TITLE = "# Hawiyah — هوية";
export const REPOSITORY = "https://github.com/MohamedEmbarak/hawiyah";

const FRAMEWORK_NAMES = { vanilla: "JavaScript", react: "React", vue: "Vue", angular: "Angular" };

/**
 * The compliance sentence of a language from src/app/i18n/compliance.json, the one
 * source the footer and the landing import (docs/components/README.md, Writing style).
 * @param {string} json
 * @param {'en' | 'ar'} [lang]
 */
export function complianceSentence(json, lang = "en") {
  const value = JSON.parse(json)?.[lang];
  if (typeof value === "string" && value.trim() !== "") return value;
  throw new Error(`llms: src/app/i18n/compliance.json has no string for ${lang}`);
}

/** One line of Markdown text: whitespace collapsed. */
const oneLine = (text) => String(text).replace(/\s+/g, " ").trim();

/**
 * The text of llms.txt.
 * @param {{
 *   manifest: { pages: { id: string, langs: string[], title: Record<string, string>, summaryText: Record<string, string> }[] },
 *   buildInfo: { pin: string, siteOrigin: string, basePath: string },
 *   install: { pin: string, packages: { name: string, spec: string }[], frameworks: string[], commands: Record<string, Record<string, string>> },
 *   summary: string,
 * }} input
 */
export function llmsText({ manifest, buildInfo, install, summary }) {
  if (install.pin !== buildInfo.pin) throw new Error(`llms: install.json pin ${install.pin} differs from build-info.json pin ${buildInfo.pin}`);
  const site = `${buildInfo.siteOrigin}${buildInfo.basePath}`;
  const pages = [...manifest.pages].sort((a, b) => a.id.localeCompare(b.id));
  const reference = (lang, id) => `${site}${lang}/components/${id}/reference/`;
  const source = (lang, id) => `${REPOSITORY}/blob/main/docs/components/${id}${lang === "ar" ? ".ar" : ""}.md`;
  const pageLine = (lang, page) => {
    const name = oneLine(page.title[lang] ?? page.id);
    const text = oneLine(page.summaryText?.[lang] ?? "");
    return `- [${name}](${reference(lang, page.id)}): ${text ? `${text} ` : ""}Markdown source: ${source(lang, page.id)}`;
  };
  const lines = [
    TITLE,
    "",
    `> ${oneLine(summary)}`,
    "",
    `Guide: ${site}en/ (English), ${site}ar/ (Arabic). Repository: ${REPOSITORY}`,
    "",
    "## Packages",
    "",
    `All seven packages share one version, ${install.pin}.`,
    "",
    ...install.packages.map((entry) => `- ${entry.spec}`),
    "",
    "## Install",
    "",
    ...install.frameworks.map((framework) => `- ${FRAMEWORK_NAMES[framework] ?? framework}: \`${install.commands.npm[framework]}\``),
    "",
    "## Components",
    "",
    ...pages.filter((page) => page.langs.includes("en")).map((page) => pageLine("en", page)),
    "",
    "## Arabic",
    "",
    ...pages.filter((page) => page.langs.includes("ar")).map((page) => pageLine("ar", page)),
    "",
  ];
  return lines.join("\n");
}

/**
 * Reads the generated inputs and writes <browserDir>/llms.txt.
 * @param {{ guideDir: string, generatedDir: string, browserDir: string }} options
 */
export function writeLlms({ guideDir, generatedDir, browserDir }) {
  const read = (file) => JSON.parse(readFileSync(join(guideDir, generatedDir, file), "utf8"));
  const text = llmsText({
    manifest: read(join("content", "manifest.json")),
    buildInfo: read("build-info.json"),
    install: read("install.json"),
    summary: complianceSentence(readFileSync(join(guideDir, "src", "app", "i18n", "compliance.json"), "utf8")),
  });
  writeFileSync(join(guideDir, browserDir, "llms.txt"), text);
  return text;
}
