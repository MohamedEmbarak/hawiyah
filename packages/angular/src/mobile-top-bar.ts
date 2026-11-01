import { Component, Input } from '@angular/core';

@Component({ selector: 'nq-mobile-top-bar', standalone: true, template: `
  <header class="nq-mobile-top-bar" [attr.data-variant]="variant">
    <div class="nq-mobile-top-bar-leading"><ng-content select="[nqTopBarLeading]">@if (backHref) {<a class="nq-mobile-top-bar-back" [href]="backHref" [attr.aria-label]="backLabel"><span class="nq-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a>}</ng-content></div>
    <div class="nq-mobile-top-bar-copy">@switch (headingLevel) {@case (2) {<h2 class="nq-mobile-top-bar-title">{{ title }}</h2>} @case (3) {<h3 class="nq-mobile-top-bar-title">{{ title }}</h3>} @default {<h1 class="nq-mobile-top-bar-title">{{ title }}</h1>}}@if (subtitle) {<p class="nq-mobile-top-bar-subtitle">{{ subtitle }}</p>}</div>
    <div class="nq-mobile-top-bar-actions"><ng-content select="[nqTopBarActions]" /></div>
  </header>` })
export class NqMobileTopBarComponent {
  @Input({ required: true }) title = ''; @Input() subtitle = '';
  @Input() variant: 'main' | 'internal' = 'internal'; @Input() headingLevel: 1 | 2 | 3 = 1;
  @Input() backHref = ''; @Input() backLabel = 'رجوع';
}
