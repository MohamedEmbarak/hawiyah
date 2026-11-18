import { Component, computed, inject } from '@angular/core';
import { HwIconButtonComponent } from '@hawiyah/angular';
import { LocaleService } from '../core/locale';
import { ModeService } from '../core/mode';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';

/** One fixed name; the state is aria-pressed. The icon does not change with the state. */
@Component({
  selector: 'guide-mode-switch',
  imports: [HwIconButtonComponent],
  template: `<hw-icon-button [label]="t().darkMode" [pressed]="mode.dark()" (activated)="mode.toggle()"><span class="hw-icon" data-icon="moon-02" aria-hidden="true"></span></hw-icon-button>`,
})
export class ModeSwitch {
  private readonly locale = inject(LocaleService);
  protected readonly mode = inject(ModeService);
  protected readonly t = computed(() => pick(shellTexts, this.locale.lang()));
}
