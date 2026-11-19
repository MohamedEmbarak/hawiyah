import { Component, computed, inject, input } from '@angular/core';
import { HwAlertComponent } from '@hawiyah/angular';
import { LocaleService } from '../core/locale';
import { pick } from '../i18n/text';
import { contentTexts } from './i18n';
import type { AlertKind } from './model';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

/** Tone of each GitHub alert kind (contentPipeline.alerts). */
export const ALERT_TONES: Readonly<Record<AlertKind, AlertTone>> = {
  note: 'info',
  tip: 'success',
  important: 'info',
  warning: 'warning',
  caution: 'danger',
};

/**
 * A GitHub alert quotation as hw-alert with role note, its tone and its title from
 * the content texts. The blocks of the alert are projected by the block renderer.
 */
@Component({
  selector: 'guide-alert',
  styleUrl: './alert.css',
  imports: [HwAlertComponent],
  // hw-alert 0.3.0 types role as 'alert' | 'status' | 'region' | 'group' although the
  // host binding writes any value; 'note' is the role the content model specifies.
  template: `<hw-alert [tone]="tone()" [role]="$any('note')" [title]="title()"><ng-content /></hw-alert>`,
})
export class AlertContent {
  readonly kind = input.required<AlertKind>();
  private readonly locale = inject(LocaleService);
  protected readonly tone = computed(() => ALERT_TONES[this.kind()]);
  protected readonly title = computed(() => pick(contentTexts, this.locale.lang()).alerts[this.kind()]);
}
