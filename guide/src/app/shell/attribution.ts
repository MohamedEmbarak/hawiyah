import { Component, computed, inject } from '@angular/core';
import { LocaleService } from '../core/locale';
import { shellTexts } from '../i18n/shell';
import { pick } from '../i18n/text';

/** The NIC attribution line, projected into the portal header as [hwPortalNotice]. */
@Component({
  selector: 'guide-attribution',
  template: `<p class="attribution"><img class="nic-logo" src="assets/nic-logo.webp" alt="" width="34" height="38" decoding="async"><span class="hw-type" data-scale="body-sm">{{ t().attribution }}</span></p>`,
  styleUrl: './attribution.css',
})
export class Attribution {
  private readonly locale = inject(LocaleService);
  protected readonly t = computed(() => pick(shellTexts, this.locale.lang()));
}
