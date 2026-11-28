import { Component, Input } from '@angular/core';
import { HwTexts } from './text';

// The input named title is not a native tooltip on the wrapper element.
@Component({ selector: 'hw-mobile-top-bar', standalone: true, host: { '[attr.title]': 'null' }, template: `
  <header class="hw-mobile-top-bar" [attr.data-variant]="variant">
    <div class="hw-mobile-top-bar-leading"><ng-content select="[hwTopBarLeading]">@if (backHref) {<a class="hw-mobile-top-bar-back" [href]="backHref" [attr.aria-label]="texts.need('backLabel', backLabel, 'backHref is set')"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a>}</ng-content></div>
    <div class="hw-mobile-top-bar-copy">@switch (headingLevel) {@case (2) {<h2 class="hw-mobile-top-bar-title">{{ title }}</h2>} @case (3) {<h3 class="hw-mobile-top-bar-title">{{ title }}</h3>} @default {<h1 class="hw-mobile-top-bar-title">{{ title }}</h1>}}@if (subtitle) {<p class="hw-mobile-top-bar-subtitle">{{ subtitle }}</p>}</div>
    <div class="hw-mobile-top-bar-actions"><ng-content select="[hwTopBarActions]" /></div>
  </header>` })
export class HwMobileTopBarComponent {
  @Input({ required: true }) title = ''; @Input() subtitle = '';
  @Input() variant: 'main' | 'internal' = 'internal'; @Input() headingLevel: 1 | 2 | 3 = 1;
  @Input() backHref = '';
  /** Accessible name of the back link. Required when backHref is set. */
  @Input() backLabel = '';
  protected readonly texts = new HwTexts('hw-mobile-top-bar');
}
