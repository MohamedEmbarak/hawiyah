import { Directive, Input } from '@angular/core';
import { forwardedAriaHost } from './host-attributes';
import type { HwTexts } from './text';

/** A wrapper component whose inner landmark, group or region takes its name from, in this order: an
 * aria-label written on the host, an aria-labelledby written on the host, `label`. The three aria attributes
 * are inputs under their attribute names (`aria-label="..."` or `[aria-label]="expr"`): they reach the named
 * element and never stay on the role-less wrapper. `[attr.aria-label]` on the host is not supported. */
@Directive({host: forwardedAriaHost})
export abstract class HwNamedRoot {
  @Input({alias: 'aria-label'}) ariaLabel: string | null = null;
  @Input({alias: 'aria-labelledby'}) ariaLabelledby: string | null = null;
  @Input({alias: 'aria-describedby'}) ariaDescribedby: string | null = null;
  /** Name of the root. Required unless aria-label or aria-labelledby is given. */
  @Input() label = '';
  protected abstract readonly texts: HwTexts;
  /** The aria-label of the named element; a missing name is reported once, in development. */
  get rootName(): string | null { return this.ariaLabel || (this.ariaLabelledby ? this.label || null : this.texts.need('label', this.label)); }
}
