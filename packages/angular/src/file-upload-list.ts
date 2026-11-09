import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';
import { fileUploadLabels, fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';

@Component({
  selector: 'hw-file-upload-list', standalone: true,
  template: `<ul class="hw-upload-list">@for (item of items; track item.id) {
    <li class="hw-upload-item" [attr.data-status]="item.status" [attr.data-message]="item.message ? true : null">
      <span class="hw-upload-name">{{item.name}}</span>
      <span class="hw-upload-status" role="status">{{item.message || labels[item.status]}}</span>
      @if (item.status === 'uploading') {<progress max="100" [attr.value]="progress(item.progress)" [attr.aria-label]="labels.uploading + ' ' + item.name"></progress>}
      @if (removable && item.removable !== false) {<button type="button" class="hw-button" data-variant="subtle" [disabled]="disabled" [attr.aria-label]="labels.remove + ' ' + item.name" (click)="remove.emit(item.id)">{{labels.remove}}</button>}
    </li>
  }</ul>`,
})
export class HwFileUploadListComponent {
  @Input() items: readonly FileUploadItem[] = [];
  @Input() labels: FileUploadLabels = fileUploadLabels;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) removable = false;
  @Output() remove = new EventEmitter<string>();
  readonly progress = fileUploadProgress;
}
