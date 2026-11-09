import {booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {observeContentNavigation} from '@hawiyah/core';
import type {ContentNavigationItem} from '@hawiyah/core';

export type {ContentNavigationItem} from '@hawiyah/core';
@Component({selector: 'hw-content-navigation', standalone: true, imports: [NgTemplateOutlet], template: `
<nav #navigation class="hw-content-nav" [attr.aria-label]="label" [attr.data-sticky]="sticky || null">
  @if (showHeading) {<h2 class="hw-content-nav-heading">{{ label }}</h2>}
  <ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{items: items, nested: false}" />
</nav>
<ng-template #list let-entries="items" let-nested="nested"><ul [class]="nested ? 'hw-content-nav-sublist' : 'hw-content-nav-list'">
  @for (item of entries; track item.id) {<li>
    @if (item.disabled) {<span class="hw-content-nav-link" role="link" aria-disabled="true" [attr.data-hw-section]="item.id"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">{{ item.label }}</span></span>}
    @else {<a class="hw-content-nav-link" [href]="fragment(item.id)" [attr.data-hw-section]="item.id" [attr.aria-current]="current === item.id ? 'location' : null" (click)="activate($event, item.id)"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">{{ item.label }}</span></a>}
    @if (item.children?.length) {<ng-container [ngTemplateOutlet]="list" [ngTemplateOutletContext]="{items: item.children, nested: true}" />}
  </li>}
</ul></ng-template>`})
export class HwContentNavigationComponent {
  @Input({required: true}) items: readonly ContentNavigationItem[] = [];
  @Input() label = 'في هذه الصفحة';
  @Input({transform: booleanAttribute}) showHeading = true;
  @Input({transform: booleanAttribute}) sticky = false;
  @Input() scrollRoot: HTMLElement | null = null;
  @Input() offset = 80;
  @Output() readonly currentChange = new EventEmitter<string>();
  @ViewChild('navigation') navigation?: ElementRef<HTMLElement>;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private observer?: ReturnType<typeof observeContentNavigation>;
  current = '';
  fragment(id: string): string {return `#${encodeURIComponent(id)}`;}
  ngAfterViewInit(): void {this.observer = observeContentNavigation({navigation: this.navigation!.nativeElement, getItems: () => this.items, getScrollRoot: () => this.scrollRoot, offset: () => this.offset, onCurrentChange: id => {this.current = id; this.currentChange.emit(id); this.changeDetector.markForCheck();}});}
  ngOnChanges(): void {this.observer?.refresh();}
  ngOnDestroy(): void {this.observer?.destroy();}
  activate(event: MouseEvent, id: string): void {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault(); this.observer?.navigate(id, {focus: event.detail === 0});
  }
}
