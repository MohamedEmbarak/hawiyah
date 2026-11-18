import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, input, type Type } from '@angular/core';
import { ModeService } from '../core/mode';
import { dirOf } from '../i18n/text';
import type { ExampleLanguage } from './payload';

/**
 * The generated Angular example component, rendered in the page inside an environment
 * container with the language, direction, theme, mode and density of the example. The
 * component class is resolved before render, so it is part of the prerendered HTML and
 * hydrates with the page.
 */
@Component({
  selector: 'guide-native-result',
  imports: [NgComponentOutlet],
  template: `<div class="stage" [attr.lang]="lang()" [attr.dir]="dir()" data-hw-theme="dga" [attr.data-hw-mode]="mode()" data-hw-density="comfortable"><ng-container *ngComponentOutlet="component()" /></div>`,
  styleUrl: './native-result.css',
})
export class NativeResult {
  readonly component = input.required<Type<unknown>>();
  readonly lang = input.required<ExampleLanguage>();
  protected readonly dir = computed(() => dirOf(this.lang()));
  protected readonly mode = inject(ModeService).mode;
}
