import { Component, ElementRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { HwButtonDirective, HwDividerComponent, HwLinkDirective, HwToggleGroupComponent } from '@hawiyah/angular';
import { buildInfo } from '../../core/build-info';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { dirOf, pick, type Lang } from '../../i18n/text';
import { LandingCommand } from './command';
import { landingTexts } from './i18n';
import { LandingRotation } from './rotation';
import { DEFAULT_MANAGER, FRAMEWORK_LABELS, INSTALL, LandingState, longestCommand } from './state';

/**
 * Section 1: the statement in the page language and in the other language across a
 * spine, then the install block: a framework selector, the pause button of the
 * rotation and the command of the selected framework for the current package
 * manager. Once hydrated and in view, the block shows each framework's command in
 * turn, one round (LandingRotation). Without JavaScript (@media (scripting: none)) the
 * selector and the listing are replaced by the list of all four commands; the
 * prerendered markup is the hydrated markup, so nothing is removed or skipped.
 */
@Component({
  selector: 'guide-landing-lead',
  imports: [HwButtonDirective, HwDividerComponent, HwLinkDirective, HwToggleGroupComponent, LandingCommand],
  template: `<section class="lead" aria-labelledby="lead-title"><div class="spread"><div class="say"><h1 id="lead-title" tabindex="-1" class="hw-type" data-scale="display-sm">{{ t().lead.statement }}</h1><p class="hw-type" data-scale="body-lg" data-tone="muted">{{ t().lead.body }}</p></div><span class="spine" aria-hidden="true"><hw-divider orientation="vertical" /></span><div class="say" [attr.lang]="other()" [attr.dir]="otherDir()"><p class="hw-type" data-scale="display-sm">{{ o().lead.statement }}</p><p class="hw-type" data-scale="body-lg" data-tone="muted">{{ o().lead.body }}</p></div></div><div class="install"><div #block class="rotator" (pointerenter)="rotation.hold('pointer', true)" (pointerleave)="rotation.hold('pointer', false)" (focusin)="focusEntered($event)" (focusout)="focusLeft($event)" (click)="clicked($event)"><p class="hw-sr-only">{{ t().lead.commandLabel }}</p><div class="bar"><hw-toggle-group controlId="lead-framework" labelHidden [label]="t().lead.frameworkLabel" [options]="frameworkOptions" [value]="state.shown()" (valueChange)="state.chooseFramework($any($event))" /><button hwButton variant="ghost" size="sm" type="button" class="pause" [class.off]="!state.rotationControl()" [attr.inert]="state.rotationControl() ? null : ''" [attr.aria-label]="paused() ? t().lead.resumeLabel : t().lead.pauseLabel" (click)="rotation.toggle()"><span class="labels" aria-hidden="true"><span [class.off]="paused()">{{ t().lead.pause }}</span><span [class.off]="!paused()">{{ t().lead.resume }}</span></span></button></div><guide-landing-command [text]="state.leadCommand()" [reserve]="reserve()" [title]="t().code.terminal" [live]="state.leadChanged()" /></div><div class="all" role="group" aria-labelledby="lead-all-title"><p id="lead-all-title" class="hw-type" data-scale="body-sm">{{ t().lead.allCommands }}</p><dl>@for (fw of frameworks; track fw) {<div class="entry"><dt class="hw-type" data-scale="body-sm">{{ labels[fw] }}</dt><dd><code class="hw-code" dir="ltr" translate="no">{{ allCommands[fw] }}</code></dd></div>}</dl></div><div class="notes"><p class="hw-type" data-scale="body-sm" data-tone="muted">{{ t().lead.version(pin) }} {{ t().lead.renderedBy }} <code class="hw-code code-phrase" dir="ltr">&#64;hawiyah/angular {{ pin }}</code></p><p class="hw-type" data-scale="body-sm"><a hwLink [href]="installHref()">{{ t().lead.installLink }}</a></p></div></div></section>`,
  styleUrl: './lead.css',
})
export class LandingLead {
  protected readonly state = inject(LandingState);
  protected readonly rotation = inject(LandingRotation);
  private readonly lang = inject(LocaleService).lang;
  private readonly block = viewChild.required<ElementRef<HTMLElement>>('block');
  protected readonly pin = buildInfo.pin;
  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly other = computed<Lang>(() => (this.lang() === 'ar' ? 'en' : 'ar'));
  protected readonly otherDir = computed(() => dirOf(this.other()));
  protected readonly o = computed(() => pick(landingTexts, this.other()));
  protected readonly installHref = computed(() => `${page(this.lang())}#install`);
  protected readonly frameworks = INSTALL.frameworks;
  protected readonly labels = FRAMEWORK_LABELS;
  protected readonly frameworkOptions = INSTALL.frameworks.map((fw) => ({ value: fw, label: FRAMEWORK_LABELS[fw] }));
  /** The list without JavaScript shows the commands of the default package manager. */
  protected readonly allCommands = INSTALL.commands[DEFAULT_MANAGER];
  protected readonly reserve = computed(() => longestCommand(this.state.manager()));
  protected readonly paused = computed(() => this.state.rotation() === 'paused');

  constructor() {
    afterNextRender(() => this.rotation.attach(this.block().nativeElement));
  }

  /**
   * Keyboard focus inside the block holds the rotation. Focus that a pointer click
   * gives (no :focus-visible) does not: the pointer hold covers it, and a click on
   * Resume must not be held once the pointer has left.
   */
  protected focusEntered(event: FocusEvent): void {
    const target = event.target;
    this.rotation.hold('focus', target instanceof Element && target.matches(':focus-visible'));
  }

  /** Focus left the block only when it moved outside it. */
  protected focusLeft(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.block().nativeElement.contains(next)) return;
    this.rotation.hold('focus', false);
  }

  /** Copying the command is a reader action: the rotation stops for good. */
  protected clicked(event: Event): void {
    const target = event.target;
    if (target instanceof Element && target.closest('hw-copy-button')) this.state.stopRotation();
  }
}
