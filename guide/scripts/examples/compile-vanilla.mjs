// JavaScript (vanilla) examples: parse5 validation (HWC-V1), every hw- class must
// be a class selector of the installed @hawiyah/styles/dist/styles.css (HWC-V2) and
// every data-hw value a controller selected by the installed @hawiyah/vanilla
// enhance() (HWC-V3). The entry module only calls enhance() on the mount.
import { parseFragment } from 'parse5';
import { styleClasses, vanillaControllers } from './exports.mjs';
import { VANILLA_MAIN } from './wrap.mjs';

export const VANILLA_HOST = (html) => `<div id="app">${html}</div>`;

/**
 * Checks an HTML fragment. Returns { findings: [{ code, line, message }], compiled }
 * where compiled is null when a finding exists. Lines are 1-based in `html`.
 */
export function compileVanilla(html, fromDir) {
  const findings = [];
  const tree = parseFragment(html, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => findings.push({ code: 'HWC-V1', line: error.startLine ?? 1, message: `HTML parse error ${error.code}` }),
  });
  const classes = styleClasses(fromDir);
  const controllers = vanillaControllers(fromDir);
  const visit = (node) => {
    if (node.tagName) {
      const line = node.sourceCodeLocation?.startLine ?? 1;
      for (const attribute of node.attrs ?? []) {
        const attrLine = node.sourceCodeLocation?.attrs?.[attribute.name]?.startLine ?? line;
        if (attribute.name === 'class') {
          for (const token of attribute.value.split(/\s+/)) {
            if (token.startsWith('hw-') && !classes.has(token)) {
              findings.push({ code: 'HWC-V2', line: attrLine, message: `class ${token} is not defined in @hawiyah/styles/dist/styles.css` });
            }
          }
        }
        if (attribute.name === 'data-hw' && !controllers.has(attribute.value)) {
          findings.push({ code: 'HWC-V3', line: attrLine, message: `data-hw="${attribute.value}" is not a controller of @hawiyah/vanilla enhance()` });
        }
      }
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(tree);
  if (findings.length) return { findings, compiled: null };
  return {
    findings,
    compiled: { host: VANILLA_HOST(html), entry: 'main.js', modules: { 'main.js': VANILLA_MAIN } },
  };
}
