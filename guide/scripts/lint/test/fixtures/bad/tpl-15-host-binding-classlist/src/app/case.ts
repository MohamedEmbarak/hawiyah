import { Component, Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[guideCase]' })
export class Case {
  @HostBinding('classList') names = 'hw-badge';
  @HostBinding() classList = 'hw-badge';
}

@Component({ selector: 'guide-case-host', template: '<span></span>', host: { '[classList]': 'names' } })
export class CaseHost {
  protected readonly names = 'hw-badge';
}
