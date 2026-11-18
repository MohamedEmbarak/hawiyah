import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HwContainerComponent } from '@hawiyah/angular';
import { map } from 'rxjs';
import { CodeBlockIds } from '../../content/code-block';
import { HeadService } from '../../core/head';
import { LocaleService } from '../../core/locale';
import { pick } from '../../i18n/text';
import { LandingCompliance } from './compliance';
import { LandingDuo } from './duo';
import { landingTexts } from './i18n';
import { LandingInstall } from './install-chooser';
import type { LandingData } from './landing-data';
import { LandingLead } from './lead';
import { LandingPackages } from './packages';
import { LandingState } from './state';

/** Route <lang>/: the landing (direction C with A's install chooser), five sections in order. */
@Component({
  selector: 'guide-landing-page',
  imports: [HwContainerComponent, LandingCompliance, LandingDuo, LandingInstall, LandingLead, LandingPackages],
  providers: [LandingState, CodeBlockIds],
  template: `<hw-container><div class="flow"><div class="first"><guide-landing-lead /><guide-landing-duo /></div><guide-landing-install [data]="data()" /><guide-landing-packages /><guide-landing-compliance /></div></hw-container>`,
  styleUrl: './landing-page.css',
})
export class LandingPage {
  protected readonly data = toSignal(inject(ActivatedRoute).data.pipe(map((data) => (data['landing'] as LandingData | undefined) ?? null)), {
    initialValue: null,
  });

  constructor() {
    const lang = inject(LocaleService).lang();
    const t = pick(landingTexts, lang);
    inject(HeadService).set({ title: t.documentTitle, description: t.lead.body, page: { lang, path: '' } });
  }
}
