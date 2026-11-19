import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[guideCase]' })
export class Case {
  @HostBinding('className') names = 'hw-card';
  @HostBinding() className = 'hw-card';
}
