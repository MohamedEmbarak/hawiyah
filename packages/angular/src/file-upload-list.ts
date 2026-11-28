import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';
import { fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';
import { HwTexts } from './text';

@Component({
  selector: 'hw-file-upload-list', standalone: true,
  template: `<ul class="hw-upload-list">@for (item of items; track item.id) {
    <li class="hw-upload-item" [attr.data-status]="item.status" [attr.data-message]="item.message ? true : null">
      <span class="hw-upload-name">{{item.name}}</span>
      <span class="hw-upload-status" role="status">{{item.message || texts.need('labels.' + item.status, given[item.status])}}</span>
      @if (item.status === 'uploading') {<progress max="100" [attr.value]="progress(item.progress)" [attr.aria-label]="texts.call('labels.getProgressLabel', given.getProgressLabel, [item.name])"></progress>}
      @if (removable && item.removable !== false) {<button type="button" class="hw-button" data-variant="subtle" [disabled]="disabled" [attr.aria-label]="texts.call('labels.getRemoveLabel', given.getRemoveLabel, [item.name])" (click)="remove.emit(item.id)">{{texts.need('labels.remove', given.remove)}}</button>}
    </li>
  }</ul>`,
})
export class HwFileUploadListComponent {
  @Input() items: readonly FileUploadItem[] = [];
  /** Status words, the remove text and the two name functions; the complete strings come from the application. */
  @Input({ required: true }) labels!: FileUploadLabels;
  /** What the application supplied; a caller outside the template type-check may have left some of it out. */
  protected get given(): Partial<FileUploadLabels> { return this.labels ?? {}; }
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) removable = false;
  @Output() remove = new EventEmitter<string>();
  readonly progress = fileUploadProgress;
  protected readonly texts = new HwTexts('hw-file-upload-list');
}
