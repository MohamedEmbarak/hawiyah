import { Component, input, output } from '@angular/core';
import { HwBadgeComponent, HwIconButtonComponent } from '@hawiyah/angular';
import type { LogState } from './editor-store';
import type { EditorTexts, LogLevel } from './i18n';

const TONES: Readonly<Record<LogLevel, 'info' | 'warning' | 'danger'>> = { info: 'info', warning: 'warning', danger: 'danger' };

/**
 * Log panel of the editor (editor.fullEditor.logPanel): compile errors, runtime
 * errors, console calls, blocked navigation and form submits, at most 200 entries.
 * Text from a compiler, the frame or the console is shown left to right as code;
 * the guide's own sentences follow the page direction. The live region is a div
 * with role log around the list: on the ol itself the role would take the list
 * semantics from its items (axe listitem).
 */
@Component({
  selector: 'guide-editor-log',
  imports: [HwBadgeComponent, HwIconButtonComponent],
  template: `<section class="log" [attr.aria-labelledby]="headingId"><div class="head"><h2 class="hw-type" data-scale="heading-sm" [id]="headingId">{{ t().log }}</h2><hw-icon-button [label]="t().clearLog" variant="ghost" size="sm" (activated)="clear.emit()"><span class="hw-icon" data-icon="cancel-01" aria-hidden="true"></span></hw-icon-button></div><div role="log" aria-live="polite" [attr.aria-labelledby]="headingId"><ol class="entries">@if (state().dropped > 0) {<li class="entry dropped"><span class="text hw-type" data-scale="body-sm">{{ t().dropped(state().dropped) }}</span></li>}@for (entry of state().entries; track entry.id) {<li class="entry"><hw-badge [tone]="tones[entry.level]">{{ t().level[entry.level] }}</hw-badge>@if (entry.kind === 'code') {<code class="hw-code text" dir="ltr">{{ entry.text }}</code>} @else {<span class="text hw-type" data-scale="body-sm">{{ entry.text }}</span>}</li>}</ol></div>@if (state().entries.length === 0 && state().dropped === 0) {<p class="empty hw-type" data-scale="body-sm">{{ t().logEmpty }}</p>}</section>`,
  styleUrl: './log-panel.css',
})
export class EditorLogPanel {
  readonly t = input.required<EditorTexts>();
  readonly state = input.required<LogState>();
  readonly clear = output<void>();

  protected readonly headingId = 'editor-log-title';
  protected readonly tones = TONES;
}
