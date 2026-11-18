import { Component, DOCUMENT, computed, inject } from '@angular/core';
import { HwDividerComponent, HwLinkDirective } from '@hawiyah/angular';
import { buildInfo } from '../../core/build-info';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { dirOf, pick, type Lang } from '../../i18n/text';
import { LandingCommand } from './command';
import { landingTexts } from './i18n';
import { LandingState } from './state';

/**
 * Section 1: the statement in the page language and in the other language across a
 * spine, then the install command of the chosen framework and package manager.
 */
@Component({
  selector: 'guide-landing-lead',
  imports: [HwDividerComponent, HwLinkDirective, LandingCommand],
  template: `<section class="lead" aria-labelledby="lead-title"><div class="spread"><div class="say"><h1 id="lead-title" tabindex="-1" class="hw-type" data-scale="display-sm">{{ t().lead.statement }}</h1><p class="hw-type" data-scale="body-lg" data-tone="muted">{{ t().lead.body }}</p></div><span class="spine" aria-hidden="true"><hw-divider orientation="vertical" /></span><div class="say" [attr.lang]="other()" [attr.dir]="otherDir()"><p class="hw-type" data-scale="display-sm">{{ o().lead.statement }}</p><p class="hw-type" data-scale="body-lg" data-tone="muted">{{ o().lead.body }}</p></div></div><div class="install"><p class="hw-sr-only">{{ t().lead.commandLabel }}</p><guide-landing-command [text]="state.command()" [title]="t().code.terminal" [live]="state.swapped() !== null" /><div class="notes"><p class="hw-type" data-scale="body-sm" data-tone="muted">{{ t().lead.version(pin) }} {{ t().lead.renderedBy }} <code class="hw-code" dir="ltr">&#64;hawiyah/angular {{ pin }}</code></p><p class="hw-type" data-scale="body-sm"><a hwLink [href]="installHref()" (click)="toInstall($event)">{{ t().lead.installLink }}</a></p></div></div></section>`,
  styleUrl: './lead.css',
})
export class LandingLead {
  protected readonly state = inject(LandingState);
  private readonly lang = inject(LocaleService).lang;
  protected readonly pin = buildInfo.pin;
  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly other = computed<Lang>(() => (this.lang() === 'ar' ? 'en' : 'ar'));
  protected readonly otherDir = computed(() => dirOf(this.other()));
  protected readonly o = computed(() => pick(landingTexts, this.other()));
  protected readonly installHref = computed(() => `${page(this.lang())}#install`);
  private readonly document = inject(DOCUMENT);

  /**
   * Workaround (reported to the lead): after hydration the router address of this page
   * has no trailing slash, so bindLinkNavigation does not recognise '<lang>/#install'
   * as a fragment of the current document and the router, whose anchor scrolling is
   * disabled, does not scroll. The link keeps its href for readers without script.
   */
  protected toInstall(event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const heading = this.document.getElementById('install-title');
    if (!heading) return;
    event.preventDefault();
    heading.focus();
    heading.scrollIntoView({ block: 'start' });
  }
}
