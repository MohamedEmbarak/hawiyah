import { booleanAttribute, AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { restoreFocus } from '@nasaq/core';

let nextId = 0;
@Component({ selector: 'nq-dialog', standalone: true, template: `<dialog #dialog class="nq-dialog" [attr.aria-labelledby]="titleId" (close)="closed()" (cancel)="cancelledBackdrop()" (pointerdown)="backdropStart($event)" (pointercancel)="resetBackdrop()" (click)="backdrop($event)"><header class="nq-dialog-header"><h2 [id]="titleId">{{ title }}</h2><button class="nq-button" data-variant="ghost" type="button" [attr.aria-label]="closeLabel" (click)="close()">×</button></header><div class="nq-dialog-body"><ng-content /></div><footer class="nq-dialog-footer"><ng-content select="[nqDialogFooter]" /></footer></dialog>` })
export class NqDialogComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({required: true}) title = '';
  @Input() titleId = `nq-dialog-title-${++nextId}`;
  @Input({transform: booleanAttribute}) open = false;
  @Input() closeLabel = 'Close dialog';
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

@Component({ selector: 'nq-tooltip', standalone: true, template: `<span class="nq-tooltip-anchor nq-tooltip-trigger" tabindex="0" [attr.aria-describedby]="id" (focusin)="visible = true" (focusout)="visible = false" (mouseenter)="visible = true" (mouseleave)="visible = false"><ng-content /><span class="nq-tooltip" role="tooltip" [id]="id" [hidden]="!visible">{{ text }}</span></span>` })
export class NqTooltipComponent {
  @Input({required: true}) text = '';
  @Input() id = `nq-tooltip-${++nextId}`;
  visible = false;
  private readonly host = inject(ElementRef<HTMLElement>);
  hide(): void { this.visible = false; }
  @HostListener('document:keydown.escape', ['$event']) escape(event: Event): void { if (this.visible) { event.preventDefault(); event.stopPropagation(); this.hide(); } }
  @HostListener('document:pointerdown', ['$event']) outside(event: Event): void { if (!this.host.nativeElement.contains(event.target as Node)) this.hide(); }
}
