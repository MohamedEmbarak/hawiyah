import { Component, computed, input } from '@angular/core';
import { HwCopyButtonComponent } from '@hawiyah/angular';
import type { EditorTexts } from './i18n';

/** The integrity shown in the status bar: its first 16 characters and an ellipsis. */
export function shortIntegrity(integrity: string): string {
  return integrity.length > 16 ? `${integrity.slice(0, 16)}…` : integrity;
}

/**
 * Status bar of the editor (editor.fullEditor.statusBar): the run state as a live
 * status, then the package, version, source and integrity of the framework shown,
 * with a copy button for the full integrity.
 */
@Component({
  selector: 'guide-editor-status',
  imports: [HwCopyButtonComponent],
  template: `<div class="bar"><p class="state hw-type" data-scale="body-sm" role="status">{{ state().text }}@if (state().detail) {<bdi dir="ltr">{{ state().detail }}</bdi>}{{ state().note }}</p><p class="package hw-type" data-scale="body-sm"><span class="label">{{ t().packageLine }}</span> <span class="value-group"><bdi dir="ltr" class="value">{{ line() }}</bdi>@if (integrity()) {<hw-copy-button [text]="integrity()" [label]="t().copyIntegrity" [copiedMessage]="t().copied" [failedMessage]="t().copyFailed" size="sm" />}</span></p></div>`,
  styleUrl: './status-bar.css',
})
export class EditorStatusBar {
  readonly t = input.required<EditorTexts>();
  /** The run state: a sentence, a left-to-right message and a note. */
  readonly state = input.required<{ readonly text: string; readonly detail: string; readonly note: string }>();
  readonly pkg = input.required<string>();
  readonly version = input.required<string>();
  readonly integrity = input.required<string>();
  /** A preview build serves the local tarballs instead of npm. */
  readonly preview = input(false);

  protected readonly line = computed(() => {
    const source = this.preview() ? this.t().sourceLocal : this.t().sourceNpm;
    const parts = [`${this.pkg()} ${this.version()}`, source];
    if (this.integrity()) parts.push(shortIntegrity(this.integrity()));
    return parts.join(' · ');
  });
}
