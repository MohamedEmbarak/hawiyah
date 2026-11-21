import { NgComponentOutlet } from '@angular/common';
import { Component, DOCUMENT, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { HwButtonDirective, HwTabComponent, HwTabsComponent } from '@hawiyah/angular';
import featureList from '../../generated/features.json';
import { CodeBlockComponent } from '../content/code-block';
import { buildInfo } from '../core/build-info';
import { pick } from '../i18n/text';
import { FRAMEWORK_PACKAGES, exampleTexts } from './i18n';
import { NativeResult } from './native-result';
import { PageExamples } from './page-examples';
import { EXAMPLE_FRAMEWORKS, exampleFilePath, type ExampleFramework } from './payload';
import { EXAMPLE_FRAME_RESULT, type ExampleFrameResultInputs, type ExampleFrameStatus } from './tokens';

/** localStorage key of the framework the reader last selected in a page block. */
export const FRAMEWORK_STORAGE_KEY = 'hawiyah-guide-framework';

/** The framework selected on the server and on the first client render. */
export const DEFAULT_FRAMEWORK: ExampleFramework = 'angular';

/** Whether the build includes the editor feature (stage 4c). */
export const EDITOR_AVAILABLE = (featureList as readonly { id: string }[]).some((feature) => feature.id === 'editor');

export function isFramework(value: unknown): value is ExampleFramework {
  return typeof value === 'string' && (EXAMPLE_FRAMEWORKS as readonly string[]).includes(value);
}

/** Base-relative address of the editor with this example and framework. */
export function editorHref(lang: string, id: string, example: string, framework: ExampleFramework): string {
  return `${lang}/editor/?example=${encodeURIComponent(`${id}/${example}`)}&framework=${framework}`;
}

/**
 * Page block of a live group (editor.pageBlock): the result, a status line, and the
 * four framework sources in tabs with download and, when the editor exists, an
 * editor link. Angular renders natively in the page (in a framed group, in the frame
 * as well); the other frameworks render in the frame component that
 * EXAMPLE_FRAME_RESULT provides, and without it the Angular result stays shown for
 * every tab.
 */
@Component({
  selector: 'guide-example-block',
  imports: [CodeBlockComponent, HwButtonDirective, HwTabComponent, HwTabsComponent, NativeResult, NgComponentOutlet],
  template: `@if (group(); as g) {<section class="example" [attr.aria-labelledby]="g.headingId"><div class="result" role="group" [attr.aria-label]="t().result">@if (frameShown()) {<ng-container *ngComponentOutlet="frame; inputs: frameInputs()" />} @else if (g.native && !framed()) {<guide-native-result [component]="g.native" [lang]="g.lang" />}@if (framed()) {<p class="framed-note">{{ t().framedNoScript }}</p>}</div><p class="status hw-type" data-scale="body-sm" data-tone="muted" role="status" [class.framed-status]="framed()">@if (status(); as s) {{{ s.before }}<bdi dir="ltr">{{ s.pkg }}</bdi>{{ s.after }}} @else {{{ statusText() }}}</p><hw-tabs [id]="'ex-' + g.example" [label]="t().frameworks" overflow="scroll" [value]="framework()" (valueChange)="choose($event)">@for (fw of frameworks; track fw) {<hw-tab [value]="fw" [label]="t().frameworkNames[fw]"><div class="panel">@for (listing of g.sources?.[fw] ?? []; track listing.fileName) {<guide-code-block [title]="listing.fileName" [text]="listing.text" [lines]="listing.lines" />}<div class="actions">@if (downloadHref(fw); as href) {<a hwButton variant="ghost" size="sm" [href]="href" [attr.download]="fileName(fw)"><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span>{{ t().download }}</a>}@if (editor) {<a hwButton variant="secondary" size="sm" [href]="editorLink(fw)"><span class="hw-icon" data-icon="arrow-up-right-01" data-directional="true" aria-hidden="true"></span>{{ t().openInEditor }}</a>}</div></div></hw-tab>}</hw-tabs></section>}`,
  styleUrl: './example-block.css',
})
export class ExampleBlock {
  readonly example = input.required<string>();
  /**
   * frame on the group (5a.9): the Angular result is rendered in the sandboxed frame
   * like the other three, never in the guide page, so a page-level component's main
   * landmark, skip link and h1 stay out of the guide's outline. Without script the
   * block shows its Angular listing and one sentence.
   */
  readonly framed = input(false);

  private readonly page = inject(PageExamples);
  private readonly document = inject(DOCUMENT);
  protected readonly frame = inject(EXAMPLE_FRAME_RESULT, { optional: true });
  protected readonly frameworks = EXAMPLE_FRAMEWORKS;
  protected readonly editor = EDITOR_AVAILABLE;

  protected readonly group = computed(() => this.page.group(this.example()));
  protected readonly framework = signal<ExampleFramework>(DEFAULT_FRAMEWORK);
  private readonly frameStatus = signal<ExampleFrameStatus>({ state: 'loading' });
  protected readonly t = computed(() => pick(exampleTexts, this.group()?.lang ?? 'en'));

  /** A frame result is shown for vanilla, React and Vue once a provider exists, and for Angular too in a framed group. */
  protected readonly frameShown = computed(() => this.frame !== null && (this.framework() !== 'angular' || this.framed()));

  protected readonly frameInputs = computed<ExampleFrameResultInputs | undefined>(() => {
    const group = this.group();
    const framework = this.framework();
    if (!group || !this.frameShown()) return undefined;
    return {
      id: group.id,
      lang: group.lang,
      example: group.example,
      framework,
      report: (status) => this.frameStatus.set(status),
    };
  });

  /** The 'rendered with' status, with the package name and version shown left to right. */
  protected readonly status = computed(() => {
    const framed = this.frameShown();
    const framework = framed ? this.framework() : 'angular';
    const frameStatus = this.frameStatus();
    if (framed && frameStatus.state !== 'ready') return null;
    const [before, pkg, after] = this.t().renderedWith(FRAMEWORK_PACKAGES[framework], buildInfo.pin, buildInfo.preview !== null);
    const note = framed && frameStatus.state === 'ready' && frameStatus.bundledRuntime ? this.t().bundledRuntime : '';
    return { before, pkg, after: `${after}${note}` };
  });

  /** Loading and failure texts of a frame result. */
  protected readonly statusText = computed(() => {
    const name = this.t().frameworkNames[this.framework()];
    const frameStatus = this.frameStatus();
    if (frameStatus.state === 'failed') return this.t().failed(name, frameStatus.message.split('\n')[0] ?? '');
    return this.t().loading(name);
  });

  constructor() {
    afterNextRender(() => {
      let stored: string | null = null;
      try {
        stored = this.document.defaultView?.localStorage.getItem(FRAMEWORK_STORAGE_KEY) ?? null;
      } catch {
        // Storage may be unavailable; the default framework stays selected.
      }
      if (isFramework(stored) && stored !== this.framework()) this.select(stored);
    });
  }

  /** The reader selected a tab: show it and remember the choice. */
  protected choose(value: string): void {
    if (!isFramework(value)) return;
    this.select(value);
    try {
      this.document.defaultView?.localStorage.setItem(FRAMEWORK_STORAGE_KEY, value);
    } catch {
      // Storage may be unavailable; the selection still applies to this page.
    }
  }

  private select(framework: ExampleFramework): void {
    if (framework !== 'angular' || this.framed()) this.frameStatus.set({ state: 'loading' });
    this.framework.set(framework);
  }

  protected fileName(framework: ExampleFramework): string | null {
    return this.group()?.sources?.[framework][0]?.fileName ?? null;
  }

  protected downloadHref(framework: ExampleFramework): string | null {
    const group = this.group();
    const fileName = this.fileName(framework);
    if (!group || !fileName) return null;
    return exampleFilePath(group.id, group.lang, group.example, framework, fileName);
  }

  protected editorLink(framework: ExampleFramework): string {
    const group = this.group();
    return group ? editorHref(group.lang, group.id, group.example, framework) : '';
  }
}
