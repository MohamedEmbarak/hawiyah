import {
  Component,
  DOCUMENT,
  DestroyRef,
  ViewContainerRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  type ComponentRef,
} from '@angular/core';
import { pick } from '../../i18n/text';
import { examplePayloadPath, type ExampleLanguage, type ExamplePayload } from '../payload';
import type { ExampleFrameStatus, FrameFramework } from '../tokens';
import { frameTexts } from './i18n';
import type { FrameRunStatus, PreviewFrame } from './preview-frame';

/**
 * FrameResult: the EXAMPLE_FRAME_RESULT component of the page block.
 * It renders the vanilla, React or Vue result of a live group in a sandboxed
 * frame. Kept small because the frame-runtime feature provides it eagerly: the
 * frame component, the document builder and the in-frame scripts are loaded in a
 * lazy chunk, after hydration, together with the compiled payload that step 45
 * wrote to <base>examples/<id>/<lang>/<example>/<framework>.json.
 */
@Component({
  selector: 'guide-frame-result',
  // The outlet exists only in the browser: the prerendered block is empty, so hydration has no
  // container to match, and the frame is created in a view made after hydration.
  template: `@if (browser()) {<ng-container #outlet />}`,
})
export class FrameResult {
  readonly id = input.required<string>();
  readonly lang = input.required<ExampleLanguage>();
  readonly example = input.required<string>();
  readonly framework = input.required<FrameFramework>();
  readonly report = input.required<(status: ExampleFrameStatus) => void>();

  private readonly document = inject(DOCUMENT);
  private readonly outlet = viewChild('outlet', { read: ViewContainerRef });
  protected readonly browser = signal(false);
  private frame: ComponentRef<PreviewFrame> | null = null;
  private sequence = 0;

  constructor() {
    afterNextRender(() => this.browser.set(true));
    effect(() => {
      if (!this.browser()) return;
      const key = { id: this.id(), lang: this.lang(), example: this.example(), framework: this.framework() };
      untracked(() => void this.load(key));
    });
    inject(DestroyRef).onDestroy(() => {
      this.sequence += 1;
      this.frame = null;
    });
  }

  private emit(status: ExampleFrameStatus): void {
    untracked(this.report)(status);
  }

  private async load(key: { id: string; lang: ExampleLanguage; example: string; framework: FrameFramework }): Promise<void> {
    const sequence = ++this.sequence;
    this.emit({ state: 'loading' });
    const view = this.document.defaultView;
    if (!view) return;
    const url = new URL(examplePayloadPath(key.id, key.lang, key.example, key.framework), this.document.baseURI).href;
    let payload: ExamplePayload;
    let component: typeof PreviewFrame;
    try {
      const [module, response] = await Promise.all([import('./preview-frame'), view.fetch(url)]);
      if (!response.ok) throw new Error(`${response.status}`);
      payload = (await response.json()) as ExamplePayload;
      component = module.PreviewFrame;
    } catch {
      if (sequence === this.sequence) this.emit({ state: 'failed', message: pick(frameTexts, key.lang).payloadFailed });
      return;
    }
    if (sequence !== this.sequence) return;
    if (!this.frame) {
      // The browser-only block renders in the change detection after browser() turns true.
      for (let tries = 0; tries < 20 && !this.outlet(); tries += 1) await new Promise((done) => view.setTimeout(done, 16));
      if (sequence !== this.sequence) return;
      const outlet = this.outlet();
      if (!outlet) {
        this.emit({ state: 'failed', message: pick(frameTexts, key.lang).payloadFailed });
        return;
      }
      const ref = outlet.createComponent(component);
      ref.instance.status.subscribe((status) => this.forward(status));
      this.frame = ref;
    }
    this.frame.setInput('source', {
      framework: payload.framework,
      lang: payload.lang,
      dir: payload.dir,
      compiled: payload.compiled,
    });
  }

  private forward(status: FrameRunStatus): void {
    if (status.state === 'loading') this.emit({ state: 'loading' });
    else if (status.state === 'ready') this.emit({ state: 'ready', bundledRuntime: status.strategy === 'bundled' });
    else this.emit({ state: 'failed', message: status.message });
  }
}
