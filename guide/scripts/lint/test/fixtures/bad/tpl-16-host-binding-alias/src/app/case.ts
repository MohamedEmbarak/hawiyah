import { Directive, HostBinding as Bind } from '@angular/core';

@Directive({ selector: '[guideCase]' })
export class Case {
  @Bind('class') names = 'hw-card';
  @Bind() className = 'hw-card';
}
