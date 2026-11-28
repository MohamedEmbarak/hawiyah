import { booleanAttribute, AfterViewInit, ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { restoreFocus } from '@hawiyah/core';
import { injectId } from './ids';
import { HwTexts } from './text';
import { dialogTemplate } from './dialog-template';
import { forwardedAriaHost } from './host-attributes';

// The input named title is not a native tooltip on the wrapper element. aria-label, aria-labelledby and
// aria-describedby written on the host are inputs: they reach the native dialog and leave the wrapper.
@Component({ selector: 'hw-dialog', standalone: true, host: {...forwardedAriaHost, '[attr.title]': 'null'}, template: dialogTemplate('hwDialogFooter') })
export class HwDialogComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({required: true}) title = '';
  /** Replaces the title as the name of the dialog, or names it without reference to the title. */
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  /** Id of the element that describes the dialog, usually a projected paragraph. */
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  @Input() titleId = injectId('hw-dialog-title');
  @Input({transform: booleanAttribute}) open = false;
  /** Accessible name of the header close button. */
  @Input({required: true}) closeLabel = '';
  @Input({transform: booleanAttribute}) closeOnBackdrop = true;
  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly returnValue = new EventEmitter<string>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLDialogElement>;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly changeDetector = inject(ChangeDetectorRef);
  private trigger: HTMLElement | null = null;
  private ready = false;
  private backdropStarted = false;
  protected readonly texts = new HwTexts('hw-dialog');
  ngAfterViewInit(): void { this.ready = true; this.sync(); }
  ngOnChanges(): void { this.sync(); }
  private sync(): void {
    if (!this.ready || !this.browser) return;
    const dialog = this.dialog!.nativeElement;
    if (this.open && !dialog.open) {
      this.resetBackdrop();
      this.trigger = dialog.ownerDocument.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!this.open && dialog.open) { this.resetBackdrop(); dialog.close(); }
  }
  show(trigger?: HTMLElement): void { this.open = true; this.sync(); if (trigger) this.trigger = trigger; this.openChange.emit(true); }
  close(value = ''): void { this.resetBackdrop(); if (this.browser) this.dialog?.nativeElement.close(value); else this.open = false; }
  closed(): void { this.resetBackdrop(); this.open = false; this.openChange.emit(false); this.returnValue.emit(this.dialog?.nativeElement.returnValue ?? ''); restoreFocus(this.trigger); this.trigger = null; this.changeDetector.markForCheck(); }
  resetBackdrop(): void { this.backdropStarted = false; }
  cancelledBackdrop(): void { this.resetBackdrop(); this.cancelled.emit(); }
  backdropStart(event: PointerEvent): void {
    this.resetBackdrop();
    const dialog = this.dialog?.nativeElement;
    if (!dialog || event.defaultPrevented || event.button !== 0 || event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    this.backdropStarted = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  backdrop(event: MouseEvent): void {
    const started = this.backdropStarted; this.resetBackdrop();
    const dialog = this.dialog?.nativeElement;
    if (!dialog || event.defaultPrevented || !started || !this.closeOnBackdrop || event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) this.close();
  }
  ngOnDestroy(): void { if (this.dialog?.nativeElement.open) this.dialog.nativeElement.close(); restoreFocus(this.trigger); }
}

// The host is the positioned wrapper; the one focusable element projected into it is marked hwTooltipTrigger.
// The input named align is not the legacy presentational attribute of the wrapper element.
@Component({ selector: 'hw-tooltip', standalone: true, host: {class: 'hw-tooltip-anchor', '[attr.align]': 'null', '(focusin)': 'focusEntered()', '(focusout)': 'focusLeft($event)', '(mouseenter)': 'pointerEntered()', '(mouseleave)': 'pointerLeft()', '(keydown)': 'escape($event)'}, template: `<ng-content /><span class="hw-tooltip" role="tooltip" [id]="tooltipId" [attr.data-placement]="placement" [attr.data-align]="align" [hidden]="!visible">{{ text }}</span>` })
export class HwTooltipComponent implements OnDestroy {
  @Input() placement: 'top' | 'bottom' | 'start' | 'end' = 'top';
  @Input() align: 'start' | 'center' | 'end' = 'start';
  @Input({required: true}) text = '';
  /** Id of the tooltip element. Named tooltipId so that no id attribute is left on the wrapper element. */
  @Input() tooltipId = injectId('hw-tooltip');
  visible = false;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private hovered = false;
  private focused = false;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private show() {
    clearTimeout(this.hideTimer);
    if (this.visible) return;
    this.visible = true;
    const doc = this.host.nativeElement.ownerDocument;
    doc.addEventListener('keydown', this.escape);
    doc.addEventListener('pointerdown', this.outside);
  }
  hide() {
    clearTimeout(this.hideTimer);
    if (!this.visible) return;
    this.visible = false;
    const doc = this.host.nativeElement.ownerDocument;
    doc.removeEventListener('keydown', this.escape);
    doc.removeEventListener('pointerdown', this.outside);
    this.changeDetector.markForCheck();
  }
  pointerEntered() { this.hovered = true; this.show(); }
  pointerLeft() {
    this.hovered = false;
    if (!this.focused) this.hideTimer = setTimeout(() => this.hide(), 120);
  }
  focusEntered() { this.focused = true; this.show(); }
  focusLeft(event: FocusEvent) {
    if (this.host.nativeElement.contains(event.relatedTarget as Node | null)) return;
    this.focused = false;
    if (!this.hovered) this.hide();
  }
  readonly escape = (event: KeyboardEvent) => {
    if (!this.visible || event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault(); event.stopPropagation(); this.hide();
  };
  readonly outside = (event: Event) => { if (!this.host.nativeElement.contains(event.target as Node)) this.hide(); };
  ngOnDestroy() { this.hide(); }
}

/** Marks the one focusable element inside an hw-tooltip that the tooltip describes: a button, a link,
 * or text with tabindex="0". An aria-describedby written on that element is kept, before the tooltip id. */
@Directive({ selector: '[hwTooltipTrigger]', standalone: true, host: {class: 'hw-tooltip-trigger', '[attr.aria-describedby]': 'ids'} })
export class HwTooltipTriggerDirective {
  private readonly tooltip = inject(HwTooltipComponent);
  @Input({alias: 'aria-describedby'}) describedBy: string | null = null;
  get ids(): string { return [...new Set(`${this.describedBy ?? ''} ${this.tooltip.tooltipId}`.trim().split(/\s+/))].join(' '); }
}
