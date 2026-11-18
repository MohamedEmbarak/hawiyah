import { Component } from '@angular/core';

@Component({ selector: 'guide-case', templateUrl: './case.html' })
export class Case {
  readonly browser = typeof window !== 'undefined';
}
