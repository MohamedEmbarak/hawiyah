import { booleanAttribute, Component, input } from '@angular/core';

/**
 * The Hawiyah wordmark artwork: the light and the reverse files are both in the
 * markup and CSS shows the one for the colour mode, so nothing depends on the mode
 * during hydration. On a surface that is dark in both modes (the footer), `reverse`
 * renders one image of the reverse file. Under forced colours the surfaces take the
 * system colours, so the artwork follows prefers-color-scheme instead of the mode
 * (CSS for the pair; a picture source for the reverse image). Images are decorative
 * (alt="") unless `label` names them.
 */
@Component({
  selector: 'guide-wordmark',
  template: `@if (reverse()) {<picture><source media="(forced-colors: active) and (prefers-color-scheme: light)" srcset="brand/hawiyah-wordmark.svg" width="72" height="56"><img src="brand/hawiyah-wordmark-reverse.svg" [attr.alt]="label()" [attr.lang]="label() ? labelLang() : null" width="72" height="56" decoding="async"></picture>} @else {<img class="wordmark-light" src="brand/hawiyah-wordmark.svg" [attr.alt]="label()" [attr.lang]="label() ? labelLang() : null" width="72" height="56" decoding="async"><img class="wordmark-dark" src="brand/hawiyah-wordmark-reverse.svg" [attr.alt]="label()" [attr.lang]="label() ? labelLang() : null" width="72" height="56" decoding="async">}`,
  styleUrl: './wordmark.css',
})
export class Wordmark {
  /** Text alternative for a wordmark that stands alone; empty when a link or group names it. */
  readonly label = input('');
  readonly labelLang = input('ar');
  /** The surface behind the wordmark is dark in both colour modes. */
  readonly reverse = input(false, { transform: booleanAttribute });
}
