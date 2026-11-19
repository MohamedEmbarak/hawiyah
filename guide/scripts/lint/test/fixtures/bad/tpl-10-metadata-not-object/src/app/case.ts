import { Component } from '@angular/core';

const META = { selector: 'guide-case', template: '<p class="hw-alert">Text</p>' };

@Component(META)
export class Case {}

@Component({
  ...META,
  selector: 'guide-other',
})
export class Other {}
