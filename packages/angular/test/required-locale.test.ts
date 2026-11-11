// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { NgtscProgram } from '@angular/compiler-cli';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('makes a missing locale a compile error (NG8008) in an application template', () => {
  const fixture = fileURLToPath(new URL('./fixtures/required-locale.ts', import.meta.url));
  const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], skipLibCheck: true, experimentalDecorators: true, types: [], strictTemplates: true };
  const program = new NgtscProgram([fixture], options, ts.createCompilerHost(options));
  const text = (diagnostic: ts.Diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  // The fixture type-checks as TypeScript and resolves the built package: the only findings are the three template errors.
  expect([...program.getTsOptionDiagnostics(), ...program.getTsSyntacticDiagnostics(), ...program.getTsSemanticDiagnostics()].map(text)).toEqual([]);
  const findings = program.getNgSemanticDiagnostics().map(diagnostic => ({ code: Math.abs(diagnostic.code) % 10000, message: text(diagnostic), template: diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.text.slice(diagnostic.start).match(/^(hw-[a-z-]+)/)?.[1] : undefined }));
  expect(findings.map(finding => finding.code)).toEqual([8008, 8008, 8008]);
  expect(findings.map(finding => finding.message)).toEqual(['HwCalendarComponent', 'HwDatePickerComponent', 'HwDataTableComponent'].map(name => `Required input 'locale' from component ${name} must be specified.`));
  expect(findings.map(finding => finding.template)).toEqual(['hw-calendar', 'hw-date-picker', 'hw-data-table']);
}, 120_000);
