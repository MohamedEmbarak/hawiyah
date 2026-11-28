import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { installData } from "../../install/generate.mjs";
import { REPOSITORY, TITLE, complianceSentence, llmsText, writeLlms } from "../generate.mjs";

const guideDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const temps = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "guide-llms-"));
  temps.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const buildInfo = { pin: "0.3.0", siteOrigin: "https://example.test", basePath: "/hawiyah/" };
const install = installData({ pin: "0.3.0", componentCount: 85 });
const manifest = {
  pages: [
    {
      id: "tabs",
      langs: ["ar", "en"],
      title: { en: "Tabs", ar: "علامات التبويب" },
      summaryText: { en: "Tabs switch\nbetween panels.", ar: "تبدّل علامات التبويب بين اللوحات." },
    },
    {
      id: "button",
      langs: ["ar", "en"],
      title: { en: "Button", ar: "زر" },
      summaryText: { en: "Button starts an action.", ar: "يبدأ الزر إجراءً." },
    },
    { id: "only-en", langs: ["en"], title: { en: "Only English" }, summaryText: { en: "English only." } },
  ],
};
const summary = "Hawiyah is a UI component library built to comply with the DGA Platforms Code.";

const sections = (text) => text.split("\n").filter((line) => line.startsWith("## ")).map((line) => line.slice(3));
const section = (text, name) => {
  const lines = text.split("\n");
  const start = lines.indexOf(`## ${name}`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end < 0 ? rest : rest.slice(0, end)).filter((line) => line.startsWith("- "));
};

describe("llms.txt", () => {
  const text = llmsText({ manifest, buildInfo, install, summary });

  it("starts with the title and the summary paragraph, then four sections in order", () => {
    const lines = text.split("\n");
    expect(lines[0]).toBe(TITLE);
    expect(lines[0]).toBe("# Hawiyah — هوية");
    expect(lines[2]).toBe(`> ${summary}`);
    expect(sections(text)).toEqual(["Packages", "Install", "Components", "Arabic"]);
    expect(text.match(/^# /gm)).toHaveLength(1);
  });

  it("lists the seven packages with the pin", () => {
    const items = section(text, "Packages");
    expect(items).toEqual([
      "- @hawiyah/tokens@0.3.0",
      "- @hawiyah/styles@0.3.0",
      "- @hawiyah/core@0.3.0",
      "- @hawiyah/vanilla@0.3.0",
      "- @hawiyah/react@0.3.0",
      "- @hawiyah/vue@0.3.0",
      "- @hawiyah/angular@0.3.0",
    ]);
  });

  it("lists the npm command of each framework", () => {
    const items = section(text, "Install");
    expect(items).toHaveLength(4);
    for (const framework of install.frameworks) expect(items.join("\n")).toContain(`\`${install.commands.npm[framework]}\``);
    expect(items.some((line) => /pnpm|yarn/.test(line))).toBe(false);
  });

  it("links every built English page to its reference view and its Markdown source", () => {
    const items = section(text, "Components");
    expect(items).toHaveLength(3);
    expect(items[0]).toBe(
      `- [Button](https://example.test/hawiyah/en/components/button/reference/): Button starts an action. Markdown source: ${REPOSITORY}/blob/main/docs/components/button.md`,
    );
    expect(items[2]).toContain("[Tabs](https://example.test/hawiyah/en/components/tabs/reference/): Tabs switch between panels.");
    for (const line of items) expect(line).toMatch(/^- \[[^\]]+\]\(https:\/\/example\.test\/hawiyah\/en\/components\/[a-z0-9-]+\/reference\/\): .+ Markdown source: https:\/\/github\.com\/\S+\.md$/);
  });

  it("links the Arabic reference pages and their Arabic sources, only for pages built in Arabic", () => {
    const items = section(text, "Arabic");
    expect(items).toHaveLength(2);
    expect(items[0]).toContain("[زر](https://example.test/hawiyah/ar/components/button/reference/)");
    expect(items[0]).toContain(`${REPOSITORY}/blob/main/docs/components/button.ar.md`);
    expect(items.join("\n")).not.toContain("only-en");
  });

  it("refuses an install.json of another version", () => {
    expect(() => llmsText({ manifest, buildInfo: { ...buildInfo, pin: "0.3.1" }, install, summary })).toThrow(/differs/);
  });
});

describe("compliance sentence", () => {
  it("is read from the one source of the footer and the landing", () => {
    const json = readFileSync(join(guideDir, "src", "app", "i18n", "compliance.json"), "utf8");
    const text = complianceSentence(json);
    expect(text).toContain("built to comply with the DGA Platforms Code");
    expect(text).toContain("not an official DGA product");
  });

  it("fails when the language is missing", () => {
    expect(() => complianceSentence('{ "ar": "x" }')).toThrow(/compliance.json/);
  });
});

describe("writeLlms", () => {
  it("writes llms.txt into the browser directory", () => {
    const root = temp();
    mkdirSync(join(root, "gen", "content"), { recursive: true });
    mkdirSync(join(root, "out"), { recursive: true });
    mkdirSync(join(root, "src", "app", "i18n"), { recursive: true });
    writeFileSync(join(root, "gen", "content", "manifest.json"), JSON.stringify(manifest));
    writeFileSync(join(root, "gen", "build-info.json"), JSON.stringify(buildInfo));
    writeFileSync(join(root, "gen", "install.json"), JSON.stringify(install));
    writeFileSync(join(root, "src", "app", "i18n", "compliance.json"), JSON.stringify({ en: summary, ar: "x" }));
    writeLlms({ guideDir: root, generatedDir: "gen", browserDir: "out" });
    const written = readFileSync(join(root, "out", "llms.txt"), "utf8");
    expect(written).toBe(llmsText({ manifest, buildInfo, install, summary }));
  });
});
