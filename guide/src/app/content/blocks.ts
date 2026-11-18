import { Component, computed, inject, input } from '@angular/core';
import { LocaleService } from '../core/locale';
import { ExampleBlock } from '../examples/example-block';
import { pick } from '../i18n/text';
import { AlertContent } from './alert';
import { CodeBlockComponent } from './code-block';
import { contentTexts } from './i18n';
import { InlineContent } from './inline';
import type { Block } from './model';
import { TableContent } from './table';

/**
 * Block renderer of the content model. Headings carry their id and tabindex -1;
 * paragraphs, lists, quotations and rules are class-less, so the packaged prose
 * styles of the surrounding .hw-prose article apply. Tables, alerts, code listings and
 * live groups render through their own components. Nothing is bound as HTML.
 */
@Component({
  selector: 'guide-blocks',
  imports: [AlertContent, CodeBlockComponent, ExampleBlock, InlineContent, TableContent],
  template: `@for (block of blocks(); track $index) {@switch (block.type) {@case ('heading') {@if (block.level === 3) {<h3 [id]="block.id" tabindex="-1"><guide-inline [inlines]="block.children" /></h3>} @else {<h4 [id]="block.id" tabindex="-1"><guide-inline [inlines]="block.children" /></h4>}}@case ('paragraph') {<p><guide-inline [inlines]="block.children" /></p>}@case ('list') {@if (block.ordered) {<ol [attr.start]="block.start === 1 ? null : block.start">@for (item of block.items; track $index) {<li><guide-blocks [blocks]="item" /></li>}</ol>} @else {<ul>@for (item of block.items; track $index) {<li><guide-blocks [blocks]="item" /></li>}</ul>}}@case ('blockquote') {<blockquote><guide-blocks [blocks]="block.blocks" /></blockquote>}@case ('alert') {<guide-alert [kind]="block.kind"><guide-blocks [blocks]="block.blocks" /></guide-alert>}@case ('table') {<guide-table [block]="block" />}@case ('code') {<guide-code-block [title]="block.title ?? t().codeListing" [text]="block.text" [lines]="block.lines" />}@case ('live') {<guide-example-block [example]="block.example" />}@case ('thematicBreak') {<hr />}}}`,
  styleUrl: './blocks.css',
})
export class BlocksContent {
  readonly blocks = input.required<readonly Block[]>();
  private readonly locale = inject(LocaleService);
  protected readonly t = computed(() => pick(contentTexts, this.locale.lang()));
}
