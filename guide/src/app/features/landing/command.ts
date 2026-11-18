import { Component, computed, input } from '@angular/core';
import { CodeBlockComponent } from '../../content/code-block';
import type { CodeRun } from '../../content/model';

/**
 * An install command in the packaged code block. When the command changes after the
 * reader chose another framework or package manager, the new listing fades in
 * (animate.enter) over the old one, which fades out (animate.leave) without taking
 * pointer events; both sit in one grid cell, so nothing moves. Until the reader
 * chooses, and under reduced motion, no animation exists.
 */
@Component({
  selector: 'guide-landing-command',
  imports: [CodeBlockComponent],
  template: `<div class="swap" [class.live]="live()">@for (item of items(); track item.text) {<guide-code-block class="cell" animate.enter="command-enter" animate.leave="command-leave" [title]="title()" [text]="item.text" [lines]="item.lines" />}</div>`,
  styleUrl: './command.css',
})
export class LandingCommand {
  /** The command text. */
  readonly text = input.required<string>();
  /** The visible title of the listing ('Terminal'). */
  readonly title = input.required<string>();
  /** Whether a change of the command fades; false on first render. */
  readonly live = input(false);

  protected readonly items = computed(() => {
    const text = this.text();
    const lines: readonly (readonly CodeRun[])[] = [[{ t: text }]];
    return [{ text, lines }];
  });
}
