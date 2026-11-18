// llms.txt of the built guide (build step 75): written from the content manifest
// (src/generated/content/manifest.json), build-info.json and install.json, with the
// English footer description of src/app/i18n/shell.ts as the summary
// (contentPipeline.generated). Only pages the build produced are listed.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

export const TITLE = "# Hawiyah — هوية";
export const REPOSITORY = "https://github.com/MohamedEmbarak/hawiyah";

const FRAMEWORK_NAMES = { vanilla: "JavaScript", react: "React", vue: "Vue", angular: "Angular" };

/** Text of a string literal or of a template literal without substitutions. */
function literalText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function property(object, name) {
  for (const member of object.properties) {
    if (ts.isPropertyAssignment(member) && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) && member.name.text === name) {
      return member.initializer;
    }
  }
  return null;
}

/**
 * Reads shellTexts.<lang>.footerDescription from the source of src/app/i18n/shell.ts.
 * @param {string} source
 * @param {'en' | 'ar'} [lang]
 */
export function footerDescription(source, lang = "en") {
  const file = ts.createSourceFile("shell.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "shellTexts") continue;
      const texts = declaration.initializer;
      if (!texts || !ts.isObjectLiteralExpression(texts)) break;
      const dictionary = property(texts, lang);
      const value = dictionary && ts.isObjectLiteralExpression(dictionary) ? property(dictionary, "footerDescription") : null;
      const text = value ? literalText(value) : null;
      if (text) return text;
    }
  }
  throw new Error(`llms: src/app/i18n/shell.ts has no string shellTexts.${lang}.footerDescription`);
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
    summary: footerDescription(readFileSync(join(guideDir, "src", "app", "i18n", "shell.ts"), "utf8")),
  });
  writeFileSync(join(guideDir, browserDir, "llms.txt"), text);
  return text;
}
