import { Component, computed, inject, input } from '@angular/core';
import { HwLinkDirective } from '@hawiyah/angular';
import { LocaleService } from '../core/locale';
import { pick } from '../i18n/text';
import { contentTexts } from './i18n';
import type { Inline } from './model';

/**
 * Inline renderer: text, emphasis, strong, inline code, links and line breaks of the
 * content model. Internal links are base-relative guide paths; external links open in
 * a new tab (a[hwLink] external) and carry a visually hidden note saying so.
 */
@Component({
  selector: 'guide-inline',
  imports: [HwLinkDirective],
  template: `@for (node of inlines(); track $index) {@switch (node.type) {@case ('text') {{{ node.value }}}@case ('emphasis') {<em><guide-inline [inlines]="node.children" /></em>}@case ('strong') {<strong><guide-inline [inlines]="node.children" /></strong>}@case ('inlineCode') {<code class="hw-code" dir="ltr" translate="no">{{ node.value }}</code>}@case ('link') {@if (node.external) {<a hwLink [href]="node.href" external><guide-inline [inlines]="node.children" /><span class="hw-sr-only"> {{ t().opensInNewTab }}</span></a>} @else {<a hwLink [href]="node.href"><guide-inline [inlines]="node.children" /></a>}}@case ('break') {<br />}}}`,
})
export class InlineContent {
  readonly inlines = input.required<readonly Inline[]>();
  private readonly locale = inject(LocaleService);
  protected readonly t = computed(() => pick(contentTexts, this.locale.lang()));
}

/** Plain text of inline content, for names, captions and meta descriptions. */
export function inlineText(inlines: readonly Inline[]): string {
  return inlines
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'inlineCode':
          return node.value;
        case 'break':
          return ' ';
        default:
          return inlineText(node.children);
      }
    })
    .join('');
}
