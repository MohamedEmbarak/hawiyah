import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { CodeBlockComponent } from '../../content/code-block';
import type { CodeRun } from '../../content/model';
import type { CodeEditor } from './code-editor';

/** Plain lines of a text, for a listing without build-time highlighting. */
export function plainLines(text: string): CodeRun[][] {
  return text.split('\n').map((line) => (line ? [{ t: line }] : []));
}

/**
 * The code of one file (editor.fullEditor.codeSurface). On the server and before
 * hydration it is the guide's code block; after hydration a CodeMirror view replaces
 * it, with its own undo history, an accessible name in the page language and a
 * description of how to leave the code. The view is loaded with the editor engine
 * only on this route.
 */
@Component({
  selector: 'guide-code-surface',
  imports: [CodeBlockComponent],
  template: `@if (!mounted()) {<guide-code-block [title]="name()" [text]="text()" [lines]="shownLines()" />}<div #host class="surface" dir="ltr" [hidden]="!mounted()"></div>`,
  styleUrl: './code-surface.css',
})
export class CodeSurface {
  readonly name = input.required<string>();
  /** The text when the surface is created; later edits stay in the view. */
  readonly text = input.required<string>();
  /** Build-time highlighted lines of the text, when the build has them. */
  readonly lines = input<readonly (readonly CodeRun[])[] | null>(null);
  readonly label = input.required<string>();
  readonly describedBy = input.required<string>();
  readonly changed = output<string>();
  readonly run = output<void>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  protected readonly mounted = signal(false);
  protected readonly shownLines = computed(() => this.lines() ?? plainLines(this.text()));
  private editor: CodeEditor | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(() => {
      void import('./code-editor').then(({ createCodeEditor }) => {
        if (this.destroyed) return;
        this.editor = createCodeEditor({
          parent: this.host().nativeElement,
          doc: this.text(),
          fileName: this.name(),
          label: this.label(),
          describedBy: this.describedBy(),
          onChange: (doc) => this.changed.emit(doc),
          onRun: () => this.run.emit(),
        });
        this.mounted.set(true);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.editor?.destroy();
      this.editor = null;
    });
  }

  focus(): void {
    this.editor?.focus();
  }
}
