import { resolve } from 'node:path';
import { NgtscProgram } from '@angular/compiler-cli';
import ts from 'typescript';
import { expect, it } from 'vitest';

// Type and template checks of the renames of milestone 3: the new names compile under strictTemplates, the old ones do not.
it('[SHAPE-03][RENAME-02] the renamed and removed inputs, outputs and item fields are compile errors in an application template', () => {
  const fixture = resolve(import.meta.dirname, 'fixtures/renamed-inputs.ts');
  const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], skipLibCheck: true, experimentalDecorators: true, types: [], strictTemplates: true };
  const program = new NgtscProgram([fixture], options, ts.createCompilerHost(options));
  const message = (diagnostic: ts.Diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  expect([...program.getTsOptionDiagnostics(), ...program.getTsSyntacticDiagnostics(), ...program.getTsSemanticDiagnostics()].map(message)).toEqual([]);
  // The two fixture components share one import list; an unused import (NG8113) is not the subject here.
  const findings = program.getNgSemanticDiagnostics().map(diagnostic => ({ code: Math.abs(diagnostic.code) % 10000, message: message(diagnostic).split('.')[0] })).filter(finding => finding.code !== 8113);
  expect(findings).toEqual([
    { code: 2353, message: `Object literal may only specify known properties, and '"id"' does not exist in type 'HwAccordionItem'` },
    { code: 2339, message: `Property 'id' does not exist on type '{ value: string; open: boolean; }'` },
    // [current]="1": the current step is named by its value.
    { code: 2322, message: `Type 'number' is not assignable to type 'string'` },
    // (sortChange) is no output any more: the binding is a DOM event listener, whose event has no sort direction.
    { code: 2339, message: `Property 'direction' does not exist on type 'Event'` },
    { code: 2353, message: `Object literal may only specify known properties, and '"id"' does not exist in type 'HwMenuItem'` },
    // Timeline and NotificationList items: state -> status ('pending' -> 'upcoming'), unread -> read, time -> dateLabel.
    { code: 2353, message: `Object literal may only specify known properties, and '"state"' does not exist in type 'HwTimelineItem'` },
    { code: 2353, message: `Object literal may only specify known properties, and '"time"' does not exist in type 'HwTimelineItem'` },
    { code: 2322, message: `Type '"active"' is not assignable to type '"complete" | "current" | "upcoming" | undefined'` },
    { code: 2353, message: `Object literal may only specify known properties, and '"unread"' does not exist in type 'HwNotification'` },
    { code: 2353, message: `Object literal may only specify known properties, and '"time"' does not exist in type 'HwNotification'` },
    // The value of hw-feedback is {helpful, comment}.
    { code: 2322, message: `Type 'boolean' is not assignable to type 'FeedbackValue'` },
    { code: 8002, message: `Can't bind to 'steps' since it isn't a known property of 'hw-stepper'` },
    { code: 8002, message: `Can't bind to 'nodes' since it isn't a known property of 'hw-tree-view'` },
    { code: 8002, message: `Can't bind to 'expandedIds' since it isn't a known property of 'hw-tree-view'` },
    { code: 8002, message: `Can't bind to 'describedBy' since it isn't a known property of 'hw-dialog'` },
    { code: 8002, message: `Can't bind to 'duration' since it isn't a known property of 'hw-service-card'` },
    { code: 8002, message: `Can't bind to 'fee' since it isn't a known property of 'hw-service-card'` },
    { code: 8002, message: `Can't bind to 'details' since it isn't a known property of 'hw-service-details'` },
    { code: 8002, message: `Can't bind to 'dismissible' since it isn't a known property of 'hw-alert'` },
    { code: 8002, message: `Can't bind to 'width' since it isn't a known property of 'hw-skeleton'` },
    { code: 8002, message: `Can't bind to 'height' since it isn't a known property of 'hw-skeleton'` },
    { code: 8002, message: `Can't bind to 'removable' since it isn't a known property of 'hw-chip'` },
    { code: 8002, message: `Can't bind to 'avatars' since it isn't a known property of 'hw-avatar-group'` },
    { code: 8002, message: `Can't bind to 'describedBy' since it isn't a known property of 'hw-icon-button'` },
    { code: 8002, message: `Can't bind to 'visible' since it isn't a known property of 'hw-cookie-consent'` },
    // hw-link is removed: the link is a[hwLink].
    { code: 8001, message: `'hw-link' is not a known element:\n1` },
    { code: 8008, message: `Required inputs 'completeLabel', 'upcomingLabel' from component HwStepperComponent must be specified` },
    { code: 8008, message: `Required inputs 'getExpandLabel', 'getCollapseLabel' from component HwTreeViewComponent must be specified` },
    { code: 8008, message: `Required inputs 'commentLabel', 'submitLabel' from component HwFeedbackComponent must be specified` },
    { code: 8008, message: `Required input 'description' from component HwCookieConsentComponent must be specified` },
  ]);
}, 120_000);
