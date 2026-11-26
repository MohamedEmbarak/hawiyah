import { Component, computed, input } from '@angular/core';
import type { BrandPageModel } from './model';

type Brand = BrandPageModel['brand'];

/**
 * The wordmark files of the brand page: the artwork for light surfaces and for dark
 * surfaces, each on a surface of that colour mode (data-hw-mode on the guide's
 * surface), with the file names. A component of its own, so that its layout is the
 * guide's and not part of the package prose around it.
 */
@Component({
  selector: 'guide-artworks',
  template: `<div class="artworks">@for (surface of surfaces; track surface) {<figure class="artwork"><div class="surface" [attr.data-hw-mode]="surface">@for (file of brand().wordmarks[surface]; track file.file) {<img [src]="file.src" [alt]="brand().labels.artwork" width="144" height="112" decoding="async">}</div><figcaption>{{ brand().labels[surface] }}: @for (file of brand().wordmarks[surface]; track file.file; let last = $last) {<code class="hw-code" dir="ltr" translate="no">{{ file.file }}</code>@if (!last) {{{ separator() }}}}</figcaption></figure>}</div>`,
  styleUrl: './artworks.css',
})
export class Artworks {
  readonly brand = input.required<Brand>();
  readonly lang = input.required<'ar' | 'en'>();
  protected readonly surfaces = ['light', 'dark'] as const;
  protected readonly separator = computed(() => (this.lang() === 'ar' ? '، ' : ', '));
}

/**
 * The loader of the brand page: the package's .hw-brand-loader with the animated file
 * and the static wordmark of each colour mode, and its caption.
 */
@Component({
  selector: 'guide-loader',
  template: `<figure class="loader"><span class="hw-brand-loader"><span class="hw-brand-loader-light"><img class="hw-brand-loader-motion" [src]="brand().loader.light.motion" alt="" width="64" height="64"><img class="hw-brand-loader-static" [src]="brand().loader.light.still" alt="" width="64" height="64"></span><span class="hw-brand-loader-dark"><img class="hw-brand-loader-motion" [src]="brand().loader.dark.motion" alt="" width="64" height="64"><img class="hw-brand-loader-static" [src]="brand().loader.dark.still" alt="" width="64" height="64"></span></span><figcaption>{{ brand().labels.loaderCaption }}</figcaption></figure>`,
  styleUrl: './artworks.css',
})
export class Loader {
  readonly brand = input.required<Brand>();
}

/**
 * The icons of the foundations page: the package's span.hw-icon of each name, with the
 * name, in a muted line of the package type (hw-type), which gives the icon its colour.
 */
@Component({
  selector: 'guide-icon-list',
  template: `<ul class="icons" [attr.aria-label]="label()">@for (name of names(); track name) {<li class="icon"><span class="hw-type" data-scale="body-sm" data-tone="muted"><span class="hw-icon" [attr.data-icon]="name" aria-hidden="true"></span>&ngsp;<code class="hw-code" dir="ltr" translate="no">{{ name }}</code></span></li>}</ul>`,
  styleUrl: './icon-list.css',
})
export class IconList {
  readonly names = input.required<readonly string[]>();
  readonly label = input.required<string>();
}
