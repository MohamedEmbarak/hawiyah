import { Component, computed, inject } from '@angular/core';
import { HwAlertComponent } from '@hawiyah/angular';
import { buildInfo } from '../core/build-info';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';

/** Persistent notice of a preview build; renders nothing in other builds. */
// Package defect: hw-alert 0.3.0 types role as 'alert' | 'status' | 'region' | 'group'
// although the host binding writes any value; $any('note') renders the specified role="note".
// Package defect: hw-alert 0.3.0 renders the title as an inline <strong> directly before the
// projected content, so a text body runs into the title ('Preview buildBuilt from ...'); the
// body is projected in a paragraph, which the alert stylesheet already supports.
@Component({
  selector: 'guide-preview-notice',
  imports: [HwAlertComponent],
  template: `@if (commit) {<hw-alert tone="warning" [role]="$any('note')" [title]="t().previewTitle"><p>{{ t().previewBody(commit.slice(0, 7)) }}</p></hw-alert>}`,
})
export class PreviewNotice {
  private readonly locale = inject(LocaleService);
  protected readonly commit = buildInfo.preview?.commit ?? '';
  protected readonly t = computed(() => pick(shellTexts, this.locale.lang()));
}
