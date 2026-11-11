// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { NgtscProgram } from '@angular/compiler-cli';
import ts from 'typescript';
import { expect, it } from 'vitest';

// Angular hosts forward no aria-label to the inner element, so `label` is the only source of these names.
it('makes a missing search field, toggle group or tree view name a compile error (NG8008) in an application template', () => {
  const fixture = fileURLToPath(new URL('./fixtures/required-names.ts', import.meta.url));
  const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], skipLibCheck: true, experimentalDecorators: true, types: [], strictTemplates: true };
  const program = new NgtscProgram([fixture], options, ts.createCompilerHost(options));
  const text = (diagnostic: ts.Diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  expect([...program.getTsOptionDiagnostics(), ...program.getTsSyntacticDiagnostics(), ...program.getTsSemanticDiagnostics()].map(text)).toEqual([]);
  const findings = program.getNgSemanticDiagnostics().map(diagnostic => ({ code: Math.abs(diagnostic.code) % 10000, message: text(diagnostic), template: diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.text.slice(diagnostic.start).match(/^(hw-[a-z-]+)/)?.[1] : undefined }));
  expect(findings.map(finding => finding.code)).toEqual([8008, 8008, 8008]);
  expect(findings.map(finding => finding.message)).toEqual(['HwSearchFieldComponent', 'HwToggleGroupComponent', 'HwTreeViewComponent'].map(name => `Required input 'label' from component ${name} must be specified.`));
  expect(findings.map(finding => finding.template)).toEqual(['hw-search-field', 'hw-toggle-group', 'hw-tree-view']);
}, 120_000);
