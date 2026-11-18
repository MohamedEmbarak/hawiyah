import { Component, input } from '@angular/core';

@Component({
  selector: 'guide-preview-frame',
  template: `<iframe [srcdoc]="document()" [title]="label()"></iframe>`,
  styleUrl: './preview-frame.css',
})
export class PreviewFrame {
  readonly document = input.required<string>();
  readonly label = input.required<string>();
}
