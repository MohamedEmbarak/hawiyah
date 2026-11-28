// llms.txt of the built guide (build step 75): written from the content manifest
// (src/generated/content/manifest.json), build-info.json and install.json, with the
// English compliance sentence of src/app/i18n/compliance.json (the footer
// description) as the summary (contentPipeline.generated). Only pages the build
// produced are listed.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KINDS, pageHref } from "../content/kinds.mjs";

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
 *   generatedPages?: { title: string, path: string, summary: string }[],
 * }} input
 *   manifest pages of a guide or a template carry kind and slug; generatedPages: the brand and
 *   foundations pages of the build (English title, path below <lang>/, English introduction).
 */
export function llmsText({ manifest, buildInfo, install, summary, generatedPages = [] }) {
  if (install.pin !== buildInfo.pin) throw new Error(`llms: install.json pin ${install.pin} differs from build-info.json pin ${buildInfo.pin}`);
  const site = `${buildInfo.siteOrigin}${buildInfo.basePath}`;
  // Component pages by id; guides and templates (kind, slug) in the order of their index.json.
  const pages = manifest.pages.filter((page) => !page.kind).sort((a, b) => a.id.localeCompare(b.id));
  const documents = (kind) => manifest.pages.filter((page) => page.kind === kind);
  const kindOf = (page) => page.kind ?? "component";
  const slugOf = (page) => page.slug ?? page.id;
  const reference = (lang, page) => `${site}${pageHref(kindOf(page), lang, slugOf(page))}`;
  const source = (lang, page) => `${REPOSITORY}/blob/main/docs/${KINDS[kindOf(page)].dir}/${slugOf(page)}${lang === "ar" ? ".ar" : ""}.md`;
  const pageLine = (lang, page) => {
    const name = oneLine(page.title[lang] ?? page.id);
    const text = oneLine(page.summaryText?.[lang] ?? "");
    return `- [${name}](${reference(lang, page)}): ${text ? `${text} ` : ""}Markdown source: ${source(lang, page)}`;
  };
  const section = (title, list, lang) => {
    const shown = list.filter((page) => page.langs.includes(lang));
    return shown.length ? [`## ${title}`, "", ...shown.map((page) => pageLine(lang, page)), ""] : [];
  };
  // The pages generated from the installed packages (the brand and the foundations), when the build has them.
  const generated = (generatedPages ?? []).length
    ? ["## Generated from the packages", "", ...generatedPages.map((entry) => `- [${entry.title}](${site}en/${entry.path}): ${oneLine(entry.summary)} Arabic: ${site}ar/${entry.path}`), ""]
    : [];
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
    ...section("Guides", documents("guide"), "en"),
    ...section("Templates", documents("template"), "en"),
    ...generated,
    "## Arabic",
    "",
    ...pages.filter((page) => page.langs.includes("ar")).map((page) => pageLine("ar", page)),
    "",
    ...section("Arabic guides", documents("guide"), "ar"),
    ...section("Arabic templates", documents("template"), "ar"),
  ];
  return lines.join("\n");
}

/**
 * The pages generated from the installed packages that the build has (a feature of
 * features.json whose id has an entry of src/app/i18n/package-pages.json, the guide's
 * text source of their headings and introductions): [{ title, path, summary }] in English.
 */
export function packagePages(guideDir, features) {
  const file = join(guideDir, "src", "app", "i18n", "package-pages.json");
  if (!existsSync(file)) return [];
  const texts = JSON.parse(readFileSync(file, "utf8"));
  return features.filter((feature) => texts[feature.id] && feature.nav).map((feature) => ({
    title: texts[feature.id].title.en, path: feature.nav.path, summary: texts[feature.id].intro.en,
  }));
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
    generatedPages: existsSync(join(guideDir, generatedDir, "features.json")) ? packagePages(guideDir, read("features.json")) : [],
  });
  writeFileSync(join(guideDir, browserDir, "llms.txt"), text);
  return text;
}
