import { Component } from '@angular/core';

@Component({
  selector: 'guide-case',
  template: `
    <p [class.hw-card]="on">Text</p>
  `,
})
export class Case {
  on = true;
}
