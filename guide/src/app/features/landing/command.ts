import { Component, computed, input } from '@angular/core';
import { CodeBlockComponent } from '../../content/code-block';
import type { CodeRun } from '../../content/model';

/**
 * An install command in the packaged code block. When the command changes after the
 * reader chose another framework or package manager, or the lead rotation moved on,
 * the new listing fades in (animate.enter) over the old one, which fades out
 * (animate.leave) without taking pointer events; both sit in one grid cell, so
 * nothing moves. Until the first change, and under reduced motion, no animation
 * exists. With reserve, a hidden copy of the longest command shares the cell, so a
 * command that needs a scroll bar and one that does not keep the same height.
 */
@Component({
  selector: 'guide-landing-command',
  imports: [CodeBlockComponent],
  template: `<div class="swap" [class.live]="live()">@if (reserved(); as r) {<guide-code-block class="reserve" aria-hidden="true" inert [title]="title()" [text]="r.text" [lines]="r.lines" />}@for (item of items(); track item.text) {<guide-code-block class="cell" animate.enter="command-enter" animate.leave="command-leave" [title]="title()" [text]="item.text" [lines]="item.lines" />}</div>`,
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

  protected readonly items = computed(() => [listing(this.text())]);
  protected readonly reserved = computed(() => {
    const text = this.reserve();
    return text ? listing(text) : null;
  });
}

function listing(text: string): { readonly text: string; readonly lines: readonly (readonly CodeRun[])[] } {
  return { text, lines: [[{ t: text }]] };
}
