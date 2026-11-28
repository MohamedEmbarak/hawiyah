import { Component, computed, inject, input } from '@angular/core';
import { HwCardComponent, HwLinkDirective, HwToggleGroupComponent } from '@hawiyah/angular';
import { CodeBlockComponent } from '../../content/code-block';
import type { CodeRun } from '../../content/model';
import { buildInfo } from '../../core/build-info';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { EDITOR_AVAILABLE, editorHref } from '../../examples/example-block';
import { NativeResult } from '../../examples/native-result';
import { pick } from '../../i18n/text';
import { LandingCommand } from './command';
import { landingTexts } from './i18n';
import type { LandingData } from './landing-data';
import { FIRST_EXAMPLE } from './landing-data';
import { FRAMEWORK_LABELS, INSTALL, LandingState, type InstallFramework } from './state';

/**
 * Section 3: the framework and package manager chooser and four steps. The listings
 * of the four frameworks in steps 2 and 3 share one grid cell; the inactive ones are
 * hidden, aria-hidden and inert, so the height of a step never changes. A change of
 * framework cross-fades the listings (only when the reader allows motion).
 */
@Component({
  selector: 'guide-landing-install',
  imports: [CodeBlockComponent, HwCardComponent, HwLinkDirective, HwToggleGroupComponent, LandingCommand, NativeResult],
  template: `<section id="install" class="band" aria-labelledby="install-title"><div class="band-head"><h2 id="install-title" tabindex="-1" class="hw-type" data-scale="display-xs">{{ t().install.heading }}</h2><div class="choosers"><hw-toggle-group controlId="install-framework" [label]="t().install.framework" [options]="frameworkOptions" [value]="state.framework()" (valueChange)="state.chooseFramework($any($event))" /><hw-toggle-group controlId="install-manager" [label]="t().install.manager" [options]="managerOptions" [value]="state.manager()" (valueChange)="state.chooseManager($any($event))" /></div></div><ol class="steps band-body"><li><h3 class="hw-type" data-scale="heading-sm">{{ t().install.step1 }}</h3><guide-landing-command [text]="state.command()" [title]="t().code.terminal" [live]="state.swapped() !== null" /></li><li><h3 class="hw-type" data-scale="heading-sm">{{ t().install.step2 }}</h3><div class="stack" [class.live]="state.swapped() === 'framework'">@for (fw of frameworks; track fw) {<div class="cell" [class.active]="fw === state.framework()" [attr.aria-hidden]="fw === state.framework() ? null : 'true'" [attr.inert]="fw === state.framework() ? null : ''"><guide-code-block [title]="styleImports[fw].file" [text]="styleImports[fw].text" [lines]="styleLines[fw]" /><p class="hw-type" data-scale="body-md">{{ t().install.themeNote.before }} <code class="hw-code" dir="ltr">data-hw-theme</code> {{ t().install.themeNote.after }}</p>@if (fw === 'vanilla') {<p class="hw-type" data-scale="body-md">{{ t().install.bundlerNote }}</p>}</div>}</div></li><li><h3 class="hw-type" data-scale="heading-sm">{{ t().install.step3 }}</h3><div class="pair"><div class="stack" [class.live]="state.swapped() === 'framework'">@for (fw of frameworks; track fw) {<div class="cell" [class.active]="fw === state.framework()" [attr.aria-hidden]="fw === state.framework() ? null : 'true'" [attr.inert]="fw === state.framework() ? null : ''">@if (data()?.listings?.[fw]; as listing) {<guide-code-block [title]="listing.fileName" [text]="listing.text" [lines]="listing.lines" />}</div>}</div><hw-card variant="outlined" aria-labelledby="install-result-title"><div hwCardHeader><h4 id="install-result-title" class="hw-type" data-scale="heading-sm">{{ t().install.resultTitle }}</h4></div>@if (data()?.native; as native) {<guide-native-result [component]="native" [lang]="lang()" borderless />}<p class="hw-type result-note" data-scale="body-sm" data-tone="muted">{{ t().install.renderedBy }} <code class="hw-code" dir="ltr">&#64;hawiyah/angular {{ pin }}</code></p></hw-card></div></li><li><h3 class="hw-type" data-scale="heading-sm">{{ t().install.step4 }}</h3><ul class="next"><li><a hwLink [href]="componentsHref()">{{ t().install.toComponents }}</a></li>@if (editor) {<li><a hwLink [href]="editorLink()">{{ t().install.toEditor }}</a></li>}</ul></li></ol></section>`,
  styleUrls: ['./landing.css', './install-chooser.css'],
})
export class LandingInstall {
  /** The resolved example data of step 3. */
  readonly data = input<LandingData | null>(null);

  protected readonly state = inject(LandingState);
  protected readonly lang = inject(LocaleService).lang;
  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly pin = buildInfo.pin;
  protected readonly editor = EDITOR_AVAILABLE;
  protected readonly frameworks = INSTALL.frameworks;
  protected readonly styleImports = INSTALL.styleImports;
  protected readonly styleLines = Object.fromEntries(
    INSTALL.frameworks.map((fw) => [fw, [[{ t: INSTALL.styleImports[fw].text }]] as readonly (readonly CodeRun[])[]]),
  ) as Readonly<Record<InstallFramework, readonly (readonly CodeRun[])[]>>;
  protected readonly frameworkOptions = INSTALL.frameworks.map((fw) => ({ value: fw, label: FRAMEWORK_LABELS[fw] }));
  protected readonly managerOptions = INSTALL.managers.map((manager) => ({ value: manager, label: manager }));
  protected readonly componentsHref = computed(() => page(this.lang(), 'components'));
  protected readonly editorLink = computed(() => editorHref(this.lang(), FIRST_EXAMPLE.id, FIRST_EXAMPLE.example, this.state.framework()));
}
