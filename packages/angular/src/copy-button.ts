import { booleanAttribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, numberAttribute, Output, Renderer2, ViewChild } from '@angular/core';
import { copyFeedbackIcons, createCopyFeedback, type CopyFeedbackState, type CopyResult } from '@hawiyah/core';
import { HwTexts } from './text';

export type { CopyResult, CopyStatus } from '@hawiyah/core';
/** Copies a value the page already shows. The host element is the root: it carries hw-copy and data-state.
 * The clipboard is written only when the reader activates the button; nothing is read from it, ever. */
@Component({ selector: 'hw-copy-button', standalone: true, host: { class: 'hw-copy', 'data-state': 'idle' }, template: `<button #button type="button" [class]="display === 'text' ? 'hw-button' : 'hw-button hw-icon-button'" [disabled]="disabled" [attr.data-variant]="variant" [attr.data-size]="size" [attr.aria-label]="display === 'text' ? null : texts.need('label', label)" (click)="activate()"><span class="hw-icon" [attr.data-icon]="icons[state]" aria-hidden="true"></span>@if (display === 'text') {{{ texts.need('label', label) }}}</button><span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true" [textContent]="message(texts.need('copiedMessage', copiedMessage), texts.need('failedMessage', failedMessage))"></span>` })
export class HwCopyButtonComponent {
  /** The value to copy. A function is called at activation and never before. */
  @Input({ required: true }) text: string | (() => string) = '';
  /** The constant accessible name, and the visible text when display is "text". It does not change with the state. */
  @Input({ required: true }) label = '';
  /** Status text after a successful copy, announced politely. */
  @Input({ required: true }) copiedMessage = '';
  /** Status text after any failure, announced politely and shown beside the button. */
  @Input({ required: true }) failedMessage = '';
  @Input() display: 'icon' | 'text' = 'icon';
  @Input() variant: 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link' = 'ghost';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  /** Milliseconds the copied state lasts. A value that is not a finite number above zero means 3000. */
  @Input({ transform: numberAttribute }) feedbackDuration = 3000;
  @Input({ transform: booleanAttribute }) disabled = false;
  /** Once per activation whose result still counts: status is copied, denied, unavailable, failed or empty. */
  @Output() readonly copyResult = new EventEmitter<CopyResult>();
  @ViewChild('button') button?: ElementRef<HTMLButtonElement>;
  protected readonly texts = new HwTexts('hw-copy-button');
  protected readonly icons = copyFeedbackIcons;
  protected state: CopyFeedbackState = 'idle';
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly changeDetector = inject(ChangeDetectorRef);
  /** Creating the controller touches nothing. Each state is in the DOM before the next one arrives: an activation
   * first empties the status, then the result fills it, which is what makes a repeated message audible. A host
   * binding would be refreshed only on the next application tick, so data-state is written here. */
  private readonly feedback = createCopyFeedback({
    getText: () => typeof this.text === 'function' ? this.text() : this.text,
    getDuration: () => this.feedbackDuration,
    onStateChange: state => { this.state = state; this.renderer.setAttribute(this.host, 'data-state', state); this.changeDetector.detectChanges(); },
    onResult: result => this.copyResult.emit(result),
  });
  protected message(copied: string | null, failed: string | null): string { return (this.state === 'copied' ? copied : this.state === 'failed' ? failed : '') ?? ''; }
  /** The native click of the button: pointer, Enter or Space. Returns nothing, so Angular never cancels the event. */
  protected activate(): void { void this.feedback.copy(); }
  focus() { this.button?.nativeElement.focus(); }
  ngOnDestroy(): void { this.feedback.destroy(); }
}
