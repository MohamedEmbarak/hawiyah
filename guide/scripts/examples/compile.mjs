// Compiles the live groups of .cache/content/live-groups.json (contentPipeline.compile).
// Every group is wrapped and checked per framework (HWC-LIVE4 to HWC-LIVE6), then
// the frameworks are compiled together: vanilla (HWC-V1 to V3), React (HWC-R1), Vue
// (HWC-U1) and Angular (HWC-A1). Findings are collected for every group before the
// caller fails; each prints '<code> <file>:<line>: <message>'.
import { join } from 'node:path';
import { pathKey } from '../content/kinds.mjs';
import { classicBundle } from './classic.mjs';
import { compileAngular } from './compile-angular.mjs';
import { compileReact } from './compile-react.mjs';
import { compileVanilla } from './compile-vanilla.mjs';
import { compileVue } from './compile-vue.mjs';
import { packageVersion } from './exports.mjs';
import { bareImports } from './modules.mjs';
import { angularRules, htmlRules, reactRules, unknownFindings, vueRules } from './rules.mjs';
import {
  ANGULAR_MAIN, FRAMEWORKS, REACT_MAIN, VUE_MAIN, detectForm, nativeClassName, wrapAngular, wrapReact, wrapVanilla, wrapVue,
} from './wrap.mjs';

const LANGS = ['ar', 'en'];
const NAME = /^[a-z][a-z0-9-]{0,39}$/;
/** The key of a page: a component id, guide:<id> or template:<id> (scripts/content/kinds.mjs). */
const ID = /^(?:(?:guide|template):)?[a-z][a-z0-9-]*$/;

export const groupKey = (group) => `${group.id}/${group.lang}/${group.example}`;
/** The element name of a native example; the colon of a guide or template key is written as an underscore. */
export const nativeSelector = (group) => `guide-example-${group.id.replace(':', '_')}-${group.example}`;

/** Markdown file of a group: its sourcePath, else docs/components/<id>.md or <id>.ar.md. */
export const sourceFile = (group) => group.sourcePath ?? `docs/components/${group.id}${group.lang === 'ar' ? '.ar' : ''}.md`;

/** Throws when live-groups.json does not follow the contract of steps 20 and 25. */
export function validateGroups(groups) {
  if (!Array.isArray(groups)) throw new Error('live-groups.json must be an array of groups');
  const seen = new Set();
  for (const [index, group] of groups.entries()) {
    const where = `live-groups.json[${index}]`;
    if (!group || typeof group !== 'object') throw new Error(`${where} is not an object`);
    if (!ID.test(group.id ?? '')) throw new Error(`${where}.id must match ${ID}`);
    if (!LANGS.includes(group.lang)) throw new Error(`${where}.lang must be ar or en`);
    if (!NAME.test(group.example ?? '')) throw new Error(`${where}.example must match ${NAME}`);
    if (seen.has(groupKey(group))) throw new Error(`${where}: group ${groupKey(group)} appears twice`);
    seen.add(groupKey(group));
    for (const framework of FRAMEWORKS) {
      const block = group.blocks?.[framework];
      if (!block || typeof block.code !== 'string') throw new Error(`${where}.blocks.${framework}.code is missing`);
    }
  }
}

export function toolchain(guideDir) {
  return {
    typescript: packageVersion('typescript', guideDir),
    esbuild: packageVersion('esbuild', guideDir),
    vue: packageVersion('@vue/compiler-sfc', guideDir),
    angular: packageVersion('@angular/compiler-cli', guideDir),
  };
}

function formatFinding(finding) {
  return `${finding.code} ${finding.file}:${finding.line}: ${finding.message}`;
}

/**
 * groups: parsed live-groups.json. Options: guideDir (resolution of the installed
 * packages), workDir (absolute; react/, vue/, angular/ are created under it).
 * Returns { findings: [{ code, file, line, message, text }], payloads, natives }.
 */
export async function compileGroups(groups, { guideDir, workDir }) {
  validateGroups(groups);
  const findings = [];
  const entries = [];

  const report = (entry, code, blockLine, message) => {
    const fence = entry.block.line;
    const line = typeof fence === 'number' ? fence + Math.max(1, blockLine) : Math.max(1, blockLine);
    const item = { code, file: sourceFile(entry.group), line, message: `[${entry.key} ${entry.framework}] ${message}` };
    item.text = formatFinding(item);
    findings.push(item);
    entry.failed = true;
  };

  // Wrap and rules.
  for (const group of groups) {
    for (const framework of FRAMEWORKS) {
      const block = group.blocks[framework];
      const entry = { group, framework, block, key: groupKey(group), dir: `${pathKey(group.id)}/${group.lang}/${group.example}`, failed: false };
      entries.push(entry);
      const form = detectForm(framework, block.code);
      if (block.form && block.form !== form) {
        report(entry, 'HWC-LIVE1', 1, `block form '${block.form}' in live-groups.json differs from the detected ${form} form`);
      }
      try {
        if (framework === 'vanilla') {
          entry.wrap = wrapVanilla(block.code);
          for (const f of htmlRules(entry.wrap.html)) report(entry, f.code, f.line - entry.wrap.lineOffset, f.message);
        } else if (framework === 'react') {
          entry.wrap = wrapReact(block.code, guideDir);
          for (const f of unknownFindings('react', entry.wrap.unknown)) report(entry, f.code, f.line, f.message);
          for (const f of reactRules(entry.wrap.source, entry.wrap.form)) report(entry, f.code, f.line - entry.wrap.lineOffset, f.message);
        } else if (framework === 'vue') {
          entry.wrap = wrapVue(block.code, guideDir);
          for (const f of unknownFindings('vue', entry.wrap.unknown)) report(entry, f.code, f.line, f.message);
          for (const f of vueRules(entry.wrap.source, entry.wrap.form)) report(entry, f.code, f.line - entry.wrap.lineOffset, f.message);
        } else {
          entry.wrap = wrapAngular(block.code, guideDir);
          for (const error of entry.wrap.errors) report(entry, 'HWC-A1', error.line, `template: ${error.message}`);
          for (const f of unknownFindings('angular', entry.wrap.unknown)) report(entry, f.code, f.line, f.message);
          if (entry.wrap.source) {
            for (const f of angularRules(entry.wrap.source, entry.wrap.form)) report(entry, f.code, f.line - entry.wrap.lineOffset, f.message);
            entry.native = wrapAngular(block.code, guideDir, {
              className: nativeClassName(group.id, group.example, group.lang),
              selector: nativeSelector(group),
            });
          }
        }
      } catch (error) {
        const code = { vanilla: 'HWC-V1', react: 'HWC-R1', vue: 'HWC-U1', angular: 'HWC-A1' }[framework];
        report(entry, code, 1, `could not read the block: ${error.message.split('\n')[0]}`);
      }
    }
  }

  // Compile what passed the rules.
  const ready = (framework) => entries.filter((e) => e.framework === framework && !e.failed);
  const item = (entry) => ({ key: entry.key, dir: entry.dir, source: entry.wrap.source });
  const vueRun = compileVue(ready('vue').map(item), { workDir: join(workDir, 'vue'), fromDir: guideDir });
  const angularRun = compileAngular(ready('angular').map(item), { workDir: join(workDir, 'angular'), fromDir: guideDir });
  const reactResults = await compileReact(ready('react').map(item), { workDir: join(workDir, 'react') });
  const [vueResults, angularResults] = await Promise.all([vueRun, angularRun]);
  const results = { react: reactResults, vue: vueResults, angular: angularResults };
  const codes = { react: 'HWC-R1', vue: 'HWC-U1', angular: 'HWC-A1' };
  const primary = { react: 'Example.tsx', vue: 'Example.vue', angular: 'example.component.ts' };

  for (const entry of entries) {
    if (entry.failed) continue;
    if (entry.framework === 'vanilla') {
      const { findings: vanillaFindings, compiled } = compileVanilla(entry.wrap.html, guideDir);
      for (const f of vanillaFindings) report(entry, f.code, f.line - entry.wrap.lineOffset, f.message);
      entry.compiled = compiled;
      continue;
    }
    const result = results[entry.framework].get(entry.key);
    for (const diagnostic of result.diagnostics) {
      const inPrimary = diagnostic.file === primary[entry.framework];
      const line = inPrimary ? diagnostic.line - entry.wrap.lineOffset : 1;
      report(entry, codes[entry.framework], line, `${diagnostic.file}${inPrimary ? '' : `:${diagnostic.line}`}: ${diagnostic.message}`);
    }
    entry.compiled = result.compiled;
  }

  // Payloads.
  const tools = toolchain(guideDir);
  const payloads = [];
  const natives = [];
  for (const entry of entries) {
    if (entry.failed || !entry.compiled) continue;
    const { group, framework } = entry;
    let classic;
    try {
      classic = await classicBundle(entry.compiled);
    } catch (error) {
      report(entry, codes[framework] ?? 'HWC-V1', 1, `classic bundle: ${error.errors?.[0]?.text ?? error.message}`);
      continue;
    }
    const files = {
      vanilla: () => entry.wrap.files,
      react: () => ({ 'Example.tsx': entry.wrap.source, 'main.tsx': REACT_MAIN }),
      vue: () => ({ 'Example.vue': entry.wrap.source, 'main.ts': VUE_MAIN }),
      angular: () => ({ 'example.component.ts': entry.wrap.source, 'main.ts': ANGULAR_MAIN }),
    }[framework]();
    payloads.push({
      id: group.id,
      lang: group.lang,
      dir: group.lang === 'ar' ? 'rtl' : 'ltr',
      example: group.example,
      framework,
      files,
      primaryFile: Object.keys(files)[0],
      compiled: { ...entry.compiled, classic, imports: bareImports(entry.compiled.modules) },
      toolchain: tools,
    });
    if (framework === 'angular') {
      natives.push({ id: group.id, lang: group.lang, example: group.example, className: nativeClassName(group.id, group.example, group.lang), source: entry.native.source });
    }
  }
  return { findings, payloads, natives };
}
