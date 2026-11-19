import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, signal, untracked } from '@angular/core';
import {
  HwButtonDirective,
  HwCardComponent,
  HwDatePickerComponent,
  HwDescriptionListComponent,
  HwTabComponent,
  HwTabsComponent,
  HwTextFieldComponent,
} from '@hawiyah/angular';
import { formatCalendarDate, type CalendarSystem } from '@hawiyah/core';
import type { Mode } from '../../core/mode';
import { pick, type Lang } from '../../i18n/text';
import { landingTexts } from './i18n';
import type { Density, Direction, PaneId } from './state';

/** The sample appointment date both containers start with (an ISO date, as every calendar value). */
export const SAMPLE_DATE = '2026-12-20';

const FSI = '⁨';
const PDI = '⁩';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Intl locale of a container language. */
export function paneLocale(lang: Lang): string {
  return lang === 'ar' ? 'ar-SA' : 'en-GB';
}

/** A date in one calendar, isolated so that it keeps its order in any direction; '' when it cannot be shown. */
export function formatPaneDate(value: string, lang: Lang, calendar: CalendarSystem): string {
  if (!ISO_DATE.test(value)) return '';
  try {
    return `${FSI}${formatCalendarDate(value, { locale: paneLocale(lang), calendar, dateStyle: 'long' })}${PDI}`;
  } catch {
    return '';
  }
}

/** The hint of the date picker: the date in the calendar that is not shown. */
export function otherCalendarHint(value: string, lang: Lang, shown: CalendarSystem): string {
  const t = pick(landingTexts, lang).pane;
  const other: CalendarSystem = shown === 'gregory' ? 'islamic-umalqura' : 'gregory';
  const text = formatPaneDate(value, lang, other);
  if (!text) return t.noDate;
  return other === 'gregory' ? t.otherGregorian(text) : t.otherHijri(text);
}

export interface PaneView {
  readonly lang: Lang;
  readonly dir: Direction;
  readonly mode: Mode;
  readonly density: Density;
}

/**
 * One container: the appointment composition inside its own lang, dir, theme, mode and
 * density. Every text follows the container's language, never the page language.
 */
@Component({
  selector: 'guide-landing-pane',
  imports: [
    HwButtonDirective,
    HwCardComponent,
    HwDatePickerComponent,
    HwDescriptionListComponent,
    HwTabComponent,
    HwTabsComponent,
    HwTextFieldComponent,
  ],
  template: `<figure class="pane"><figcaption class="caption"><h3 class="hw-type" data-scale="heading-sm">{{ caption() }}</h3><p class="attrs" lang="en" translate="no"><code class="hw-code" dir="ltr">lang="{{ view().lang }}" dir="{{ view().dir }}"</code> <code class="hw-code" dir="ltr">data-hw-mode="{{ view().mode }}"</code> <code class="hw-code" dir="ltr">data-hw-density="{{ view().density }}"</code></p></figcaption><div class="stage" [class.second]="second()" [attr.lang]="view().lang" [attr.dir]="view().dir" data-hw-theme="dga" [attr.data-hw-mode]="view().mode" [attr.data-hw-density]="view().density" [attr.data-rev]="rev()"><hw-card variant="outlined"><hw-tabs [id]="'pane-' + paneId() + '-tabs'" [label]="t().tabsLabel" overflow="scroll" [direction]="view().dir" [(value)]="tab"><hw-tab value="details" [label]="t().details"><form class="fields" (submit)="submit($event)"><hw-text-field [controlId]="'pane-' + paneId() + '-name'" name="fullName" autocomplete="off" [label]="t().name" [(value)]="name" /><hw-date-picker [controlId]="'pane-' + paneId() + '-date'" name="date" [label]="t().date" [locale]="locale()" [direction]="view().dir" [(calendar)]="calendar" [(value)]="date" [hint]="hint()" [calendarLabel]="t().calendarLabel" [openLabel]="t().openLabel" [closeLabel]="t().closeLabel" [previousLabel]="t().previousLabel" [nextLabel]="t().nextLabel" [calendarSystemLabel]="t().calendarSystemLabel" [gregorianLabel]="t().gregorianLabel" [hijriLabel]="t().hijriLabel" [rangeLabel]="t().rangeLabel" [invalidMessage]="t().invalidMessage" [unsupportedMessage]="t().unsupportedMessage" /><div><button hwButton variant="primary" type="submit">{{ t().continue }}</button></div></form></hw-tab><hw-tab value="summary" [label]="t().summary"><div class="fields"><hw-description-list [items]="summary()" /><div><button hwButton variant="secondary" type="button" (click)="show('details')">{{ t().edit }}</button></div></div></hw-tab></hw-tabs></hw-card></div></figure>`,
  styleUrl: './pane.css',
})
export class LandingPane {
  readonly paneId = input.required<PaneId>();
  /** The container name in the page language. */
  readonly caption = input.required<string>();
  /** The container's attributes, with the mode resolved. */
  readonly view = input.required<PaneView>();
  /** Replay counter: each increment replays the change motion (data-rev). */
  readonly rev = input(0);
  /** Whether this is the second container in the page; its settle starts later. */
  readonly second = input(false);
  /** The calendar the date picker starts with. */
  readonly startCalendar = input<CalendarSystem>('gregory');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly t = computed(() => pick(landingTexts, this.view().lang).pane);
  protected readonly locale = computed(() => paneLocale(this.view().lang));
  protected readonly tab = signal('details');
  protected readonly name = signal('');
  protected readonly date = signal(SAMPLE_DATE);
  protected readonly calendar = signal<CalendarSystem>('gregory');

  protected readonly hint = computed(() => otherCalendarHint(this.date(), this.view().lang, this.calendar()));
  protected readonly summary = computed(() => {
    const t = this.t();
    const date = formatPaneDate(this.date(), this.view().lang, this.calendar());
    return [
      { term: t.name, description: this.name().trim() },
      { term: t.date, description: date || t.noDate },
    ];
  });

  private previousLang: Lang | null = null;

  constructor() {
    effect(() => {
      const lang = this.view().lang;
      untracked(() => {
        const previous = this.previousLang;
        if (previous !== null && previous !== lang && this.name() === pick(landingTexts, previous).pane.sampleName) {
          // The sample name follows the container language until the reader edits it.
          this.name.set(pick(landingTexts, lang).pane.sampleName);
        }
        this.previousLang = lang;
      });
    });
  }

  ngOnInit(): void {
    const lang = this.view().lang;
    this.previousLang = lang;
    this.calendar.set(this.startCalendar());
    this.name.set(pick(landingTexts, lang).pane.sampleName);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.show('summary');
  }

  /** Selects a tab from a button inside a panel, then moves focus to the selected tab. */
  protected show(tab: 'details' | 'summary'): void {
    this.tab.set(tab);
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}
