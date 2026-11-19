import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[guideCase]' })
export class Case {
  @HostBinding('class.hw-card') card = true;
  @HostBinding() style = 'margin-right: 9px';
}
