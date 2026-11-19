import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ModeService } from '../../core/mode';
import { buildInfo } from '../../core/build-info';
import { pick } from '../../i18n/text';
import type { CompiledExample, ExampleDirection, ExampleFramework, ExampleLanguage } from '../payload';
import { bundledDocument, modulesDocument } from './document';
import { FRAME_FRAMEWORK_NAMES, frameTexts } from './i18n';
import {
  MessageBudget,
  DROPPED_REPORT_MS,
  READY_TIMEOUT_MS,
  acceptMessage,
  needsBundledRuntime,
  randomHex128,
  type ConsoleLevel,
  type ReadyMarks,
} from './protocol';
import { loadRuntimeConfig } from './runtime-config';

/** What a frame runs: one compiled example in its language and direction. */
export interface FrameSource {
  readonly framework: ExampleFramework;
  readonly lang: ExampleLanguage;
  readonly dir: ExampleDirection;
  readonly compiled: Pick<CompiledExample, 'host' | 'entry' | 'modules' | 'classic'>;
  /** Edited Angular code compiled in the frame (JIT, stage 4c). */
  readonly jit?: boolean;
}

export type FrameStrategy = 'modules' | 'bundled';

export type FrameRunStatus =
  | { readonly state: 'loading'; readonly run: number }
  | { readonly state: 'ready'; readonly run: number; readonly strategy: FrameStrategy; readonly marks: ReadyMarks }
  | {
      readonly state: 'failed';
      readonly run: number;
      readonly strategy: FrameStrategy;
      readonly message: string;
      /** The message is a sentence of the guide, not text from the example. */
      readonly plain?: boolean;
    };

export type FrameLogEntry =
  | { readonly run: number; readonly kind: 'console'; readonly level: ConsoleLevel; readonly text: string }
  | { readonly run: number; readonly kind: 'error'; readonly text: string }
  | { readonly run: number; readonly kind: 'navigation'; readonly href: string }
  | { readonly run: number; readonly kind: 'submit' }
  | { readonly run: number; readonly kind: 'left'; readonly text: string }
  | { readonly run: number; readonly kind: 'dropped'; readonly count: number }
  | { readonly run: number; readonly kind: 'fallback' };

interface ActiveRun {
  readonly run: number;
  readonly token: string;
  readonly strategy: FrameStrategy;
  readonly budget: MessageBudget;
  readonly runtimeBase: string;
  state: 'loading' | 'ready' | 'failed';
  /** The frame document was written; load events before that belong to the empty frame. */
  written: boolean;
  /** Load events of the frame since its document was written. */
  loads: number;
  /** Time of the latest of them. */
  loadedAt: number;
  /** Time of the latest accepted message of the frame. */
  messageAt: number;
}

/**
 * With several frames on a page, a refused navigation is matched with the next load
 * event of a frame when that event comes within this time: the browser loads its
 * error document into the frame that tried to navigate.
 */
const LEFT_WINDOW_MS = 1000;
/**
 * The two events reach the page by different routes. Should the load come first, it
 * is matched only when it is a repeated load of its frame (a first load is the
 * frame's own document) and only this shortly before the refusal.
 */
const REPEATED_LOAD_WINDOW_MS = 250;
/**
 * A repeated load without a refused navigation is a reload of the run's document
 * when the bootstrap posts again within this time; otherwise the code replaced the
 * document (about:blank, document.open) and the run is stopped.
 */
const REPLACED_WINDOW_MS = 3000;

/** Set once a modules run failed for a runtime reason: later runs of this document use the bundles. */
let modulesUnavailable = false;

/**
 * guide-preview-frame (editor.frame): runs a compiled example in a sandboxed
 * iframe with an opaque origin. The iframe exists only in the browser after
 * hydration; every run (a new source, mode or strategy) gets a new iframe, a new
 * token and a new nonce. The guide never sends a message to the frame; it accepts
 * the frame's messages only through acceptMessage().
 *
 * Code in the frame can try to navigate the frame itself (location, a meta
 * refresh). The page policy frame-src 'none' (src/index.template.html) refuses
 * that request before it is sent; the browser then shows its own error document
 * in the frame. The refusal is an event of the page that does not name the frame.
 * With one frame on the page (the editor) it is that frame's; with several, it is
 * the frame whose load event comes with it. That frame is removed and its run fails.
 */
@Component({
  selector: 'guide-preview-frame',
  template: `<div class="frame">@for (item of runs(); track item.run) {<iframe #frame sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" [title]="title()" (load)="loaded(item.run)"></iframe>}</div><p class="notice hw-type" data-scale="body-sm" data-tone="muted" role="status">@if (notice(); as n) {@if (n.address !== undefined) {{{ t().navigationBlocked.before }}<bdi dir="ltr">{{ n.address }}</bdi>{{ t().navigationBlocked.after }}} @else {{{ n.text }}}}</p>`,
  styleUrl: './preview-frame.css',
})
export class PreviewFrame {
  readonly source = input<FrameSource | null>(null);
  /** Forces the bundled runtime (also forced by ?runtime=bundle). */
  readonly bundled = input(false);
  readonly status = output<FrameRunStatus>();
  readonly log = output<FrameLogEntry>();

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mode = inject(ModeService).mode;
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  protected readonly runs = signal<readonly { readonly run: number }[]>([]);
  /**
   * The notice under the frame: a link or a form of the example that did not leave
   * the preview. It is the one live region of those events and stays in the
   * document, empty, until it has text. A run that fails is announced by the status
   * line of the page (example block or editor), not here.
   */
  protected readonly notice = signal<{ readonly text: string; readonly address?: string } | null>(null);
  private readonly browser = signal(false);
  protected readonly t = computed(() => pick(frameTexts, this.source()?.lang ?? 'en'));
  protected readonly title = computed(() => this.t().frameTitle(FRAME_FRAMEWORK_NAMES[this.source()?.framework ?? 'vanilla']));

  private counter = 0;
  private active: ActiveRun | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** Pending report of the dropped-message count of the active run. */
  private droppedTimer: ReturnType<typeof setTimeout> | null = null;
  /** Pending check after a repeated load of the frame. */
  private replacedTimer: ReturnType<typeof setTimeout> | null = null;

  /** The components of the page, for the attribution of a refused navigation. */
  private static readonly live = new Set<PreviewFrame>();
  private static readonly watched = new WeakSet<Document>();
  /** Time of a refused navigation that no frame has been matched with yet. */
  private static refusedAt = Number.NEGATIVE_INFINITY;

  /** A navigation of some frame of the page was refused by the page policy. */
  private static refused(now: number): void {
    const written = [...PreviewFrame.live].filter((frame) => frame.active?.written);
    if (written.length === 1) {
      written[0]?.left();
      return;
    }
    const repeated = written
      .filter((frame) => (frame.active?.loads ?? 0) >= 2 && now - (frame.active?.loadedAt ?? Number.NEGATIVE_INFINITY) <= REPEATED_LOAD_WINDOW_MS)
      .sort((a, b) => (b.active?.loadedAt ?? 0) - (a.active?.loadedAt ?? 0));
    if (repeated[0]) repeated[0].left();
    else PreviewFrame.refusedAt = now;
  }

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      const listener = (event: MessageEvent) => this.receive(event);
      view.addEventListener('message', listener);
      PreviewFrame.live.add(this);
      if (!PreviewFrame.watched.has(this.document)) {
        // One listener per document, for its lifetime.
        PreviewFrame.watched.add(this.document);
        this.document.addEventListener('securitypolicyviolation', (event) => {
          if (event.effectiveDirective === 'frame-src') PreviewFrame.refused(performance.now());
        });
      }
      this.destroyRef.onDestroy(() => {
        view.removeEventListener('message', listener);
        PreviewFrame.live.delete(this);
        this.clearTimer();
        if (this.droppedTimer !== null) clearTimeout(this.droppedTimer);
        this.droppedTimer = null;
        if (this.replacedTimer !== null) clearTimeout(this.replacedTimer);
        this.replacedTimer = null;
        this.active = null;
      });
      this.browser.set(true);
    });
    effect(() => {
      if (!this.browser()) return;
      const source = this.source();
      const mode = this.mode();
      const forced = this.bundled();
      untracked(() => void this.start(source, mode, forced, false));
    });
  }


  /** The strategy of a new run (editor.fallback.when). */
  private strategy(forced: boolean): FrameStrategy {
    const view = this.document.defaultView;
    if (forced || modulesUnavailable || !view) return 'bundled';
    try {
      if (new URL(view.location.href).searchParams.get('runtime') === 'bundle') return 'bundled';
    } catch {
      // An unreadable location keeps the default strategy.
    }
    const scripts = (view as unknown as { HTMLScriptElement?: { supports?: (type: string) => boolean } }).HTMLScriptElement;
    if (typeof scripts?.supports !== 'function' || !scripts.supports('importmap')) return 'bundled';
    return 'modules';
  }

  private async start(source: FrameSource | null, mode: 'light' | 'dark', forced: boolean, fallback: boolean): Promise<void> {
    this.clearTimer();
    this.flushDropped();
    this.active = null;
    this.notice.set(null);
    const run = ++this.counter;
    this.runs.set([]);
    if (!source) return;
    const view = this.document.defaultView;
    if (!view) return;
    const strategy = fallback ? 'bundled' : this.strategy(forced);
    this.status.emit({ state: 'loading', run });
    let html: string;
    let runtimeBase = '';
    const token = randomHex128(view.crypto);
    try {
      const config = await loadRuntimeConfig(this.document.baseURI, buildInfo.pin, (url) => view.fetch(url));
      if (run !== this.counter) return;
      runtimeBase = config.runtimeBase;
      const common = {
        framework: source.framework,
        lang: source.lang,
        dir: source.dir,
        mode,
        title: this.title(),
        compiled: source.compiled,
        runtimeBase,
        stylesheets: config.stylesheets,
        nonce: randomHex128(view.crypto),
        token,
        run,
        jit: source.jit ?? false,
      };
      html = strategy === 'modules' ? modulesDocument({ ...common, imports: config.imports }) : bundledDocument(common);
    } catch (error) {
      if (run !== this.counter) return;
      this.status.emit({ state: 'failed', run, strategy, message: error instanceof Error ? error.message : String(error) });
      return;
    }
    this.active = { run, token, strategy, budget: new MessageBudget(), runtimeBase, state: 'loading', written: false, loads: 0, loadedAt: Number.NEGATIVE_INFINITY, messageAt: Number.NEGATIVE_INFINITY };
    this.runs.set([{ run }]);
    afterNextRender(
      {
        write: () => {
          const element = this.frame()?.nativeElement;
          if (!element || this.active?.run !== run) return;
          // The only place the guide writes a frame document (lint L-SRC-5).
          element.srcdoc = html;
          this.active.written = true;
        },
      },
      { injector: this.injector },
    );
    this.timer = setTimeout(() => this.fail(run, this.t().timeout), READY_TIMEOUT_MS);
  }

  private receive(event: MessageEvent): void {
    const active = this.active;
    const element = this.frame()?.nativeElement;
    if (!active || !element) return;
    const message = acceptMessage(event, { source: element.contentWindow, token: active.token, run: active.run });
    if (!message) return;
    active.messageAt = performance.now();
    if (!active.budget.take(message.type)) {
      // One log entry per run: its count is reported at most every DROPPED_REPORT_MS.
      if (message.type === 'console' && this.droppedTimer === null) {
        this.droppedTimer = setTimeout(() => {
          this.droppedTimer = null;
          if (this.active === active) this.log.emit({ run: active.run, kind: 'dropped', count: active.budget.dropped });
        }, DROPPED_REPORT_MS);
      }
      return;
    }
    switch (message.type) {
      case 'ready':
        if (active.state !== 'loading') return;
        active.state = 'ready';
        this.clearTimer();
        this.status.emit({ state: 'ready', run: active.run, strategy: active.strategy, marks: message.marks });
        return;
      case 'error':
        this.log.emit({ run: active.run, kind: 'error', text: message.text });
        if (active.state !== 'loading') return;
        if (active.strategy === 'modules' && needsBundledRuntime(message.text, active.runtimeBase)) {
          modulesUnavailable = true;
          this.log.emit({ run: active.run, kind: 'fallback' });
          void this.start(this.source(), this.mode(), this.bundled(), true);
          return;
        }
        this.fail(active.run, message.text);
        return;
      case 'console':
        this.log.emit({ run: active.run, kind: 'console', level: message.level, text: message.text });
        return;
      case 'height':
        element.style.blockSize = `${message.height}px`;
        return;
      case 'navigation':
        this.notice.set({ text: `${this.t().navigationBlocked.before}${message.href}${this.t().navigationBlocked.after}`, address: message.href });
        this.log.emit({ run: active.run, kind: 'navigation', href: message.href });
        return;
      case 'submit':
        this.notice.set({ text: this.t().submitBlocked });
        this.log.emit({ run: active.run, kind: 'submit' });
        return;
    }
  }

  /** A load event of the frame of a run. */
  protected loaded(run: number): void {
    const active = this.active;
    // Load events before the document is written belong to the empty frame.
    if (!active || active.run !== run || !active.written) return;
    const now = performance.now();
    active.loads += 1;
    active.loadedAt = now;
    if (now - PreviewFrame.refusedAt > LEFT_WINDOW_MS) {
      // A repeated load without a refused navigation: a reload of the same document
      // posts again; a document the code put in its place does not.
      if (active.loads >= 2) {
        if (this.replacedTimer !== null) clearTimeout(this.replacedTimer);
        this.replacedTimer = setTimeout(() => {
          this.replacedTimer = null;
          if (this.active === active && active.messageAt < now) this.stop(this.t().documentReplaced);
        }, REPLACED_WINDOW_MS);
      }
      return;
    }
    PreviewFrame.refusedAt = Number.NEGATIVE_INFINITY;
    this.left();
  }

  /** Code in the frame tried to navigate it: the frame is removed and the run fails. */
  private left(): void {
    this.stop(this.t().leaveBlocked);
  }

  /** The frame is removed and the run fails with a sentence of the guide. */
  private stop(text: string): void {
    const active = this.active;
    if (!active) return;
    this.clearTimer();
    this.flushDropped();
    this.active = null;
    this.runs.set([]);
    this.log.emit({ run: active.run, kind: 'left', text });
    this.status.emit({ state: 'failed', run: active.run, strategy: active.strategy, message: text, plain: true });
  }

  private fail(run: number, message: string): void {
    const active = this.active;
    if (!active || active.run !== run || active.state !== 'loading') return;
    active.state = 'failed';
    this.clearTimer();
    this.status.emit({ state: 'failed', run, strategy: active.strategy, message });
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Reports a pending dropped-message count now (a run ends or is replaced). */
  private flushDropped(): void {
    if (this.droppedTimer === null) return;
    clearTimeout(this.droppedTimer);
    this.droppedTimer = null;
    const active = this.active;
    if (active && active.budget.dropped > 0) this.log.emit({ run: active.run, kind: 'dropped', count: active.budget.dropped });
  }
}
