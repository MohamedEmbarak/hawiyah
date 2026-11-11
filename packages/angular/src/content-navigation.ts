import {booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {observeContentNavigation} from '@hawiyah/core';
import type {ContentNavigationItem} from '@hawiyah/core';
import {injectIsBrowser} from './platform';
import {bindAngularFragmentLinks} from './fragment-links';
import {HwTexts} from './text';

export type {ContentNavigationItem} from '@hawiyah/core';
@Component({selector: 'hw-content-navigation', standalone: true, imports: [NgTemplateOutlet], template: `
<nav #navigation class="hw-content-nav" [attr.aria-label]="texts.need('label', label)" [attr.data-sticky]="sticky || null">
  @if (showHeading) {<h2 class="hw-content-nav-heading">{{ texts.need('label', label) }}</h2>}
  <ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{items: items, nested: false}" />
</nav>
<ng-template #list let-entries="items" let-nested="nested"><ul [class]="nested ? 'hw-content-nav-sublist' : 'hw-content-nav-list'">
  @for (item of entries; track item.id) {<li>
    @if (item.disabled) {<span class="hw-content-nav-link" role="link" aria-disabled="true" [attr.data-hw-section]="item.id"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">{{ item.label }}</span></span>}
    @else {<a class="hw-content-nav-link" [attr.href]="fragment(item.id)" [attr.data-hw-section]="item.id" [attr.aria-current]="current === item.id ? 'location' : null" (click)="noteActivation($event)"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">{{ item.label }}</span></a>}
    @if (item.children?.length) {<ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{items: item.children, nested: true}" />}
  </li>}
</ul></ng-template>`})
export class HwContentNavigationComponent {
  @Input({required: true}) items: readonly ContentNavigationItem[] = [];
  /** Name of the navigation landmark and text of its heading when the heading is shown. */
  @Input({required: true}) label = '';
  /** Also write the reached section to the address bar with history.replaceState. Off by default, so hash-routed applications keep their route. */
  @Input({transform: booleanAttribute}) updateHash = false;
  @Input({transform: booleanAttribute}) showHeading = true;
  @Input({transform: booleanAttribute}) sticky = false;
  @Input() scrollRoot: HTMLElement | null = null;
  @Input() offset = 80;
  @Output() readonly currentChange = new EventEmitter<string>();
  @ViewChild('navigation') navigation?: ElementRef<HTMLElement>;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly browser = injectIsBrowser();
  private observer?: ReturnType<typeof observeContentNavigation>;
  current = '';
  protected keyboard = false;
  protected readonly texts = new HwTexts('hw-content-navigation');
  /** The links keep the bare "#id" a server can know; in the browser core keeps each one resolving to the
   * current document under any <base href> and hands a plain activation to the section observer. */
  constructor() {
    const component = this;
    bindAngularFragmentLinks('a.hw-content-nav-link', () => ({navigate: id => component.observer?.navigate(id, {focus: component.keyboard}) ?? false, get updateHash() {return component.updateHash;}}));
  }
  fragment(id: string): string {return `#${encodeURIComponent(id)}`;}
  /** Remembers whether the activation came from the keyboard, which moves focus to the section. It returns nothing:
   * Angular cancels an event whose template listener returns false, and a cancelled click is never handed on. */
  protected noteActivation(event: MouseEvent): void {this.keyboard = event.detail === 0;}
  ngAfterViewInit(): void {if (!this.browser) return; this.observer = observeContentNavigation({navigation: this.navigation!.nativeElement, getItems: () => this.items, getScrollRoot: () => this.scrollRoot, offset: () => this.offset, onCurrentChange: id => {this.current = id; this.currentChange.emit(id); this.changeDetector.markForCheck();}});}
  ngOnChanges(): void {this.observer?.refresh();}
  ngOnDestroy(): void {this.observer?.destroy();}
}
