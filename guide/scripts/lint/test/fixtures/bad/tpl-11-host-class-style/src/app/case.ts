import { Component } from '@angular/core';

@Component({
  selector: 'guide-case',
  templateUrl: './case.html',
  host: {
    class: 'hw-card',
    '[style.width.px]': 'width',
  },
})
export class Case {
  width = 9;
}
