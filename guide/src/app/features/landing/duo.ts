import { Component, computed, inject, signal } from '@angular/core';
import { HwButtonDirective, HwToggleGroupComponent } from '@hawiyah/angular';
import { LocaleService } from '../../core/locale';
import { ModeService } from '../../core/mode';
import { isLang, pick } from '../../i18n/text';
import { landingTexts } from './i18n';
import { LandingPane } from './pane';
import { LandingState, containerName, describePane, isDirection, languageName, paneOrder, type PaneId, type PaneState } from './state';

/**
 * Section 2: the same composition in two containers, the one in the page language
 * first, with the controls between them. Each control changes one attribute of the
 * chosen container; a status line announces the container's attributes after each
 * change.
 */
@Component({
  selector: 'guide-landing-duo',
  imports: [HwButtonDirective, HwToggleGroupComponent, LandingPane],
  template: `<section class="duo-section" aria-labelledby="duo-title"><h2 id="duo-title" class="hw-sr-only">{{ t().duo.heading }}</h2><div class="duo">@for (id of order(); track id; let i = $index) {@if (i === 1) {<div class="controls"><div class="controls-head"><h3 class="hw-type" data-scale="heading-sm">{{ t().duo.controlsHeading }}</h3><p class="hw-type" data-scale="body-sm" data-tone="muted">{{ t().duo.controlsHint }}</p></div><hw-toggle-group controlId="duo-target" [label]="t().duo.target" [options]="targetOptions()" [value]="target()" (valueChange)="chooseTarget($event)" /><hw-toggle-group controlId="duo-lang" [label]="t().duo.language" [options]="langOptions" [value]="current().lang" (valueChange)="change({ lang: $any($event) })" /><hw-toggle-group controlId="duo-dir" [label]="t().duo.direction" [options]="dirOptions()" [value]="current().dir" (valueChange)="change({ dir: $any($event) })" /><hw-toggle-group controlId="duo-mode" [label]="t().duo.mode" [options]="modeOptions()" [value]="current().mode" (valueChange)="change({ mode: $any($event) })" /><hw-toggle-group controlId="duo-density" [label]="t().duo.density" [options]="densityOptions()" [value]="current().density" (valueChange)="change({ density: $any($event) })" /><div><button hwButton variant="ghost" size="sm" type="button" (click)="reset()">{{ t().duo.reset }}</button></div><p class="hw-sr-only" role="status">{{ announcement() }}</p></div>}<guide-landing-pane [paneId]="id" [caption]="name(id)" [view]="state.views()[id]" [rev]="state.revisions()[id]" [second]="i === 1" [startCalendar]="id === 'a' ? 'islamic-umalqura' : 'gregory'" />}</div></section>`,
  styleUrl: './duo.css',
})
export class LandingDuo {
  protected readonly state = inject(LandingState);
  private readonly lang = inject(LocaleService).lang;
  private readonly pageMode = inject(ModeService).mode;

  protected readonly t = computed(() => pick(landingTexts, this.lang()));
  protected readonly order = computed(() => paneOrder(this.lang()));
  /** The container the controls change: the one in the other language at first. */
  protected readonly target = signal<PaneId>(this.lang() === 'ar' ? 'b' : 'a');
  protected readonly current = computed(() => this.state.effective(this.target()));
  protected readonly announcement = signal('');

  protected readonly langOptions = [
    { value: 'ar', label: languageName('ar') },
    { value: 'en', label: languageName('en') },
  ];
  protected readonly targetOptions = computed(() => this.order().map((id) => ({ value: id, label: containerName(this.t(), id) })));
  protected readonly dirOptions = computed(() => [
    { value: 'rtl', label: this.t().duo.rtl },
    { value: 'ltr', label: this.t().duo.ltr },
  ]);
  protected readonly modeOptions = computed(() => [
    { value: 'light', label: this.t().duo.light },
    { value: 'dark', label: this.t().duo.dark },
  ]);
  protected readonly densityOptions = computed(() => [
    { value: 'comfortable', label: this.t().duo.comfortable },
    { value: 'compact', label: this.t().duo.compact },
  ]);

  protected name(id: PaneId): string {
    return containerName(this.t(), id);
  }

  protected chooseTarget(value: string | string[]): void {
    if (value === 'a' || value === 'b') this.target.set(value);
  }

  protected change(change: Partial<PaneState>): void {
    if (change.lang !== undefined && !isLang(change.lang)) return;
    if (change.dir !== undefined && !isDirection(change.dir)) return;
    const id = this.target();
    if (!this.state.patch(id, change)) return;
    this.announcement.set(describePane(this.t(), id, this.state.panes()[id], this.pageMode()));
  }

  protected reset(): void {
    this.state.reset();
    this.announcement.set(this.t().duo.resetDone);
  }
}
