import { Component, computed, input, linkedSignal } from '@angular/core';
import { CodeBlockComponent } from '../../content/code-block';
import type { CodeRun } from '../../content/model';

/**
 * An install command in the packaged code block. One listing element stays in place
 * and only its text changes, so a screen reader keeps its reading position. When the
 * command changes after the reader chose another framework or package manager, or
 * the lead rotation moved on, the listing fades in again (two keyframes that
 * alternate with each change, so every change restarts the fade). Until the first
 * change, and under reduced motion, no animation exists. With reserve, a hidden copy
 * of the longest command shares the cell, so a command that needs a scroll bar and
 * one that does not keep the same height.
 */
@Component({
  selector: 'guide-landing-command',
  imports: [CodeBlockComponent],
  template: `<div class="swap" [class.live]="live()">@if (reserved(); as r) {<guide-code-block class="reserve" aria-hidden="true" inert [title]="title()" [text]="r.text" [lines]="r.lines" />}<guide-code-block class="cell" [attr.data-step]="step() % 2 === 0 ? 'even' : 'odd'" [title]="title()" [text]="item().text" [lines]="item().lines" /></div>`,
  styleUrl: './command.css',
})
export class LandingCommand {
  /** The command text. */
  readonly text = input.required<string>();
  /** The visible title of the listing ('Terminal'). */
  readonly title = input.required<string>();
  /** Whether a change of the command fades; false on first render. */
  readonly live = input(false);
  /** The longest text the listing may show; its height is reserved. */
  readonly reserve = input<string | null>(null);

  protected readonly item = computed(() => listing(this.text()));
  /** Counts the changes of the command; its parity selects the keyframes of the fade. */
  protected readonly step = linkedSignal<string, number>({ source: this.text, computation: (_text, previous) => (previous ? previous.value + 1 : 0) });
  protected readonly reserved = computed(() => {
    const text = this.reserve();
    return text ? listing(text) : null;
  });
}

function listing(text: string): { readonly text: string; readonly lines: readonly (readonly CodeRun[])[] } {
  return { text, lines: [[{ t: text }]] };
}
