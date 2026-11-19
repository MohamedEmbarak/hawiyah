import { Component, Injectable, computed, inject, input } from '@angular/core';
import { HwCopyButtonComponent } from '@hawiyah/angular';
import { LocaleService } from '../core/locale';
import { pick } from '../i18n/text';
import { contentTexts } from './i18n';
import type { CodeRole, CodeRun } from './model';

/**
 * Hands out page-unique ids for code listing titles (code-1, code-2, ...). Page
 * components provide their own instance, so the server render and the hydrating
 * client count from the same start; elsewhere the root instance applies.
 */
@Injectable({ providedIn: 'root' })
export class CodeBlockIds {
  private count = 0;

  next(): string {
    this.count += 1;
    return `code-${this.count}`;
  }
}

const TOKEN_CLASSES: Readonly<Record<CodeRole, string>> = {
  comment: 'hw-code-token-comment',
  punctuation: 'hw-code-token-punctuation',
  keyword: 'hw-code-token-keyword',
  property: 'hw-code-token-property',
  string: 'hw-code-token-string',
  constant: 'hw-code-token-constant',
  attribute: 'hw-code-token-attribute',
  tag: 'hw-code-token-tag',
  type: 'hw-code-token-type',
  function: 'hw-code-token-function',
};

/** Drops empty lines at the end of a listing, so a final newline adds no blank line. */
export function trimTrailingLines(lines: readonly (readonly CodeRun[])[]): readonly (readonly CodeRun[])[] {
  let end = lines.length;
  while (end > 0 && (lines[end - 1] ?? []).every((run) => run.t.trim() === '')) end -= 1;
  return lines.slice(0, end);
}

/**
 * A code listing in the packaged code-block markup: a figure with a visible title and a
 * copy button, and a named, focusable pre (role group, labelled by the title) holding
 * the highlighted runs as hw-code-token spans. Highlighting happens before render; the
 * component only places the runs. Each run that is not white space is a span of the
 * class run, which code-block.css isolates, so Arabic text in a left-to-right listing
 * keeps its source order. Used by content pages, the landing and the editor.
 */
@Component({
  selector: 'guide-code-block',
  imports: [HwCopyButtonComponent],
  template: `<figure class="hw-code-block"><figcaption class="hw-code-block-header"><span class="hw-code-block-title" [id]="titleId"><bdi dir="ltr">{{ title() }}</bdi></span><div class="hw-code-block-actions"><span class="copy"><hw-copy-button [text]="text()" [label]="t().copyCode" [copiedMessage]="t().copied" [failedMessage]="t().copyFailed" /></span></div></figcaption><pre class="hw-code-block-content" dir="ltr" translate="no" tabindex="0" role="group" [attr.aria-labelledby]="titleId"><code>@for (line of shown(); track $index) {@for (run of line; track $index) {@if (run.r) {<span [class]="tokenClass(run.r)">{{ run.t }}</span>} @else if (isBlank(run.t)) {{{ run.t }}} @else {<span class="run">{{ run.t }}</span>}}{{ newline }}}</code></pre></figure>`,
  styleUrl: './code-block.css',
})
export class CodeBlockComponent {
  /** The visible title: a file name or a language name; callers pass the 'Code listing' text when there is none. */
  readonly title = input.required<string>();
  /** The text the copy button copies. */
  readonly text = input.required<string>();
  readonly lines = input.required<readonly (readonly CodeRun[])[]>();

  private readonly locale = inject(LocaleService);
  protected readonly t = computed(() => pick(contentTexts, this.locale.lang()));
  protected readonly titleId = inject(CodeBlockIds).next();
  protected readonly shown = computed(() => trimTrailingLines(this.lines()));
  protected readonly newline = '\n';

  /** Every run that is not white space is its own bidirectional isolate (class run, code-block.css). */
  protected tokenClass(role: CodeRole): string {
    return `run ${TOKEN_CLASSES[role]}`;
  }

  protected isBlank(text: string): boolean {
    return text.trim() === '';
  }
}
