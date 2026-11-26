import { Component, DOCUMENT, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HwAlertComponent, HwButtonDirective, HwContainerComponent, HwLinkDirective, HwPageHeaderComponent, HwTabComponent, HwTabsComponent } from '@hawiyah/angular';
import { navigationDocument, navigationPage } from '../../content/content-loader';
import { pagePathOf, parseKey } from '../../content/kinds';
import type { CodeRun } from '../../content/model';
import { buildInfo } from '../../core/build-info';
import { HeadService } from '../../core/head';
import { page } from '../../core/links';
import { LocaleService } from '../../core/locale';
import { FRAMEWORK_PACKAGES } from '../../examples/i18n';
import { PreviewFrame, type FrameLogEntry, type FrameRunStatus, type FrameSource } from '../../examples/frame/preview-frame';
import { loadRuntimeConfig } from '../../examples/frame/runtime-config';
import { examplePayloadPath, type ExampleFramework, type ExamplePayload } from '../../examples/payload';
import { dirOf, pick } from '../../i18n/text';
import { CodeSurface } from './code-surface';
import { CompileClient, type CompileDiagnostic } from './compile-client';
import { DraftSaver, readDraft, removeDraft, removeFrameworkDrafts, writeDraft, type DraftScope, type DraftStorage } from './drafts';
import type { EditorData } from './editor-data';
import {
  DEFAULT_EXAMPLE,
  DEFAULT_LANGUAGE,
  EditorStore,
  editorSearch,
  filesFrom,
  filesRecord,
  firstLine,
  isEdited,
  languageFor,
  parseEditorQuery,
  type EditorLanguage,
  type EditorQuery,
  type ProjectFile,
} from './editor-store';
import { editorTexts, type LogLevel } from './i18n';
import { EditorLogPanel } from './log-panel';
import { EditorStatusBar } from './status-bar';
import { EditorToolbar } from './toolbar';

/** The run state line of the status bar (status-bar.ts). */
export interface StatusText {
  readonly text: string;
  readonly detail: string;
  readonly note: string;
}

/** Id of the visible hint that every code area names as its description. */
export const LEAVE_HINT_ID = 'editor-leave-hint';

const CONSOLE_LEVELS: Readonly<Record<string, LogLevel>> = { log: 'info', info: 'info', warn: 'warning', error: 'danger' };

/** A stable scope id of a Vue example (eight hexadecimal characters). */
function vueScope(key: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Route <lang>/editor/ (editor.fullEditor): the page header, the toolbar, the file
 * tabs with their code, the result frame, the status bar and the log. The server and
 * the first client render show the default example from the build-time listings; the
 * query, the payload and any draft are read in the browser after hydration. An
 * unedited example runs its precompiled payload; edited files are compiled in the
 * worker first. A restored draft does not run until Run is pressed.
 */
@Component({
  selector: 'guide-editor-page',
  providers: [EditorStore],
  imports: [
    CodeSurface,
    EditorLogPanel,
    EditorStatusBar,
    EditorToolbar,
    HwAlertComponent,
    HwButtonDirective,
    HwContainerComponent,
    HwLinkDirective,
    HwPageHeaderComponent,
    HwTabComponent,
    HwTabsComponent,
    PreviewFrame,
  ],
  template: `<hw-container><div class="editor"><hw-page-header [title]="t().editorTitle" [description]="description()"><a hwLink [href]="componentHref()">{{ componentLink() }}</a></hw-page-header><div class="no-script"><p class="hw-type" data-scale="body-md">{{ t().noScript }}</p></div>@if (store.query().fallback) {<hw-alert tone="info" role="status">{{ t().queryFallback }}</hw-alert>}@if (store.draftRestored()) {<hw-alert tone="info" role="status"><span class="alert-row"><span>{{ t().draftRestored }}</span><button hwButton variant="ghost" size="sm" type="button" (click)="discardDraft()">{{ t().discardDraft }}</button></span></hw-alert>}<guide-editor-toolbar [t]="t()" [framework]="store.query().framework" [language]="store.query().language" [currentText]="store.currentText()" (frameworkChange)="chooseFramework($event)" (languageChange)="chooseLanguage($event)" (reset)="reset()" (download)="download()" (run)="run()" /><guide-editor-status [t]="t()" [state]="statusText()" [pkg]="pkg()" [version]="pin" [integrity]="integrity()" [preview]="preview" /><div class="workspace"><div class="code"><p class="hint hw-type" data-scale="body-sm" data-tone="muted" [id]="hintId">{{ t().leaveHint }}</p>@for (revision of revisions(); track revision.id) {<hw-tabs id="editor-files" [label]="t().files" overflow="scroll" [value]="store.currentFile()" (valueChange)="store.currentFile.set($event)">@for (file of store.files(); track file.name) {<hw-tab [value]="file.name" [label]="file.name"><guide-code-surface [name]="file.name" [text]="file.text" [lines]="listingLines(file.name)" [label]="t().codeLabel(file.name)" [describedBy]="hintId" (changed)="edit(file.name, $event)" (run)="run()" /></hw-tab>}</hw-tabs>}</div><div class="side"><div class="result" role="group" [attr.aria-label]="t().result">@if (frameSource(); as source) {<guide-preview-frame [source]="source" [bundled]="store.query().bundled" (status)="frameStatus($event)" (log)="frameLog($event)" />} @else {<div class="empty"><p class="hw-type" data-scale="body-md" data-tone="muted">{{ store.run().state === 'failed' ? t().resultFailed : t().resultEmpty }}</p></div>}</div><guide-editor-log [t]="t()" [state]="store.log()" (clear)="store.clearLog()" /></div></div></div></hw-container>`,
  styleUrl: './editor-page.css',
})
export class EditorPage {
  protected readonly store = inject(EditorStore);
  private readonly locale = inject(LocaleService);
  private readonly head = inject(HeadService);
  private readonly document = inject(DOCUMENT);
  /** Resolved by the route (editor-data.ts). */
  private readonly data = (inject(ActivatedRoute).snapshot.data['editor'] as EditorData | undefined) ?? null;

  protected readonly lang = this.locale.lang;
  protected readonly t = computed(() => pick(editorTexts, this.lang()));
  protected readonly hintId = LEAVE_HINT_ID;
  protected readonly pin = buildInfo.pin;
  protected readonly preview = buildInfo.preview !== null;
  // One entry keyed by the revision, so a new revision re-creates the file tabs. Tracked
  // by a property, not by identity: identity tracking makes Angular log NG0956 in
  // development builds (4c.3).
  protected readonly revisions = computed(() => [{ id: this.store.revision() }]);
  protected readonly frameSource = signal<FrameSource | null>(null);

  protected readonly pkg = computed(() => FRAMEWORK_PACKAGES[this.store.query().framework]);
  protected readonly integrity = computed(() => buildInfo.packages[this.pkg()]?.integrity ?? '');

  /** The page of the example: a component page, or a guide or a template by its key. */
  private readonly entry = computed(() => {
    const id = this.store.query().id;
    const key = parseKey(id);
    return key.kind === 'component' ? navigationPage(id) : navigationDocument(key.kind, key.id);
  });
  protected readonly componentName = computed(() => this.entry()?.title[this.lang()] ?? this.store.query().id);
  private readonly section = computed(() => {
    const query = this.store.query();
    const group = this.entry()?.examples.find((entry) => entry.example === query.example);
    // A group under its own heading (h3) is named by it; a group directly under a
    // section such as Example is named by its own name, not by the section.
    return { id: group?.section ?? '', text: group?.title?.[this.lang()] ?? query.example };
  });
  /**
   * False on the server and in the first client render: the prerendered page (also what
   * a reader without script reads) answers every address of the editor, so its
   * description and link name no example; after hydration they name the example of
   * the address.
   */
  private readonly live = signal(false);
  protected readonly description = computed(() => (this.live() ? this.t().description(this.componentName(), this.section().text) : this.t().descriptionAnyExample));
  protected readonly componentLink = computed(() => {
    if (!this.live()) return this.t().componentPages;
    return parseKey(this.store.query().id).kind === 'component' ? this.t().backToComponent(this.componentName()) : this.t().backToDocument(this.componentName());
  });
  protected readonly componentHref = computed(() => {
    if (!this.live()) return page(this.lang(), 'components');
    const section = this.section().id;
    return `${page(this.lang(), pagePathOf(this.store.query().id))}${section ? `#${section}` : ''}`;
  });

  /** The run state: a sentence, then a message of a compiler or the frame isolated left to right, then the runtime note. */
  protected readonly statusText = computed<StatusText>(() => {
    const t = this.t();
    const run = this.store.run();
    switch (run.state) {
      case 'notRun':
        return { text: t.notRun, detail: '', note: '' };
      case 'running':
        return { text: t.running, detail: '', note: '' };
      case 'ready':
        return { text: t.ready(run.ms, run.edited), detail: '', note: run.bundled ? t.bundledRuntime : '' };
      case 'failed': {
        const note = run.bundled ? t.bundledRuntime : '';
        if (run.kind === 'text') return { text: t.failed(firstLine(run.message)), detail: '', note };
        return { text: t.failed(''), detail: firstLine(run.message), note };
      }
    }
  });

  /** Build-time highlighted lines of the default example's files (before hydration). */
  private readonly listings = computed(() => {
    const map = new Map<string, readonly (readonly CodeRun[])[]>();
    const query = this.store.query();
    if (query.id !== DEFAULT_EXAMPLE.id || query.example !== DEFAULT_EXAMPLE.example) return map;
    for (const listing of this.data?.sources?.[query.framework] ?? []) map.set(listing.fileName, listing.lines);
    return map;
  });

  private readonly saver = new DraftSaver();
  private client: CompileClient | null = null;
  private payload: ExamplePayload | null = null;
  private loadCounter = 0;
  private runCounter = 0;
  private compiling = false;
  private compilersAnnounced = false;
  private runStart = 0;
  private runEdited = false;
  private userRun = false;
  private browser = false;

  constructor() {
    const lang = this.lang();
    const t = pick(editorTexts, lang);
    this.head.set({ title: t.documentTitle, description: t.summary, page: { lang, path: 'editor/' } });

    // The default example from the build-time listings: the same on the server and on the first client render.
    const sources = this.data?.sources?.[this.store.query().framework] ?? [];
    this.store.replaceFiles(sources.map((listing) => ({ name: listing.fileName, text: listing.text })));

    afterNextRender(() => {
      this.browser = true;
      this.live.set(true);
      const query = parseEditorQuery(this.document.defaultView?.location.search ?? '');
      void this.open(query);
    });
    inject(DestroyRef).onDestroy(() => {
      this.saver.flush();
      this.client?.dispose();
      this.client = null;
    });
  }

  protected listingLines(name: string): readonly (readonly CodeRun[])[] | null {
    return this.listings().get(name) ?? null;
  }

  private storage(): DraftStorage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private scope(query: EditorQuery = this.store.query()): DraftScope {
    return { id: query.id, example: query.example, framework: query.framework, language: query.language, pageLang: this.lang() };
  }

  private compileClient(): CompileClient {
    this.client ??= new CompileClient();
    return this.client;
  }

  private async runtime(): Promise<{ compilersBase: string; available: string[] }> {
    const view = this.document.defaultView;
    if (!view) throw new Error('No window');
    const config = await loadRuntimeConfig(this.document.baseURI, buildInfo.pin, (url) => view.fetch(url));
    return { compilersBase: `${config.runtimeBase}compilers/`, available: Object.keys(config.imports) };
  }

  /** Opens a selection: loads its payload, converts it for JavaScript, restores a draft or runs the original. */
  private async open(query: EditorQuery): Promise<void> {
    const load = ++this.loadCounter;
    this.saver.flush();
    this.store.query.set(query);
    this.store.draftRestored.set(false);
    this.frameSource.set(null);
    this.store.run.set({ state: 'notRun' });
    const view = this.document.defaultView;
    if (!view) return;
    let payload: ExamplePayload;
    try {
      const url = new URL(examplePayloadPath(query.id, this.lang(), query.example, query.framework), this.document.baseURI).href;
      const response = await view.fetch(url);
      if (!response.ok) throw new Error(`${url} answered ${response.status}`);
      payload = (await response.json()) as ExamplePayload;
    } catch (error) {
      if (load !== this.loadCounter) return;
      this.log('danger', this.t().payloadFailed, 'text');
      this.store.run.set({ state: 'failed', message: this.t().payloadFailed, kind: 'text', bundled: false });
      return;
    }
    if (load !== this.loadCounter) return;
    this.payload = payload;
    const order = Object.keys(payload.files);
    let originals: ProjectFile[] = filesFrom(payload.files, order);
    if (query.language === 'js' && (query.framework === 'react' || query.framework === 'vue')) {
      const converted = await this.convert(payload.files);
      if (load !== this.loadCounter) return;
      if (!converted) return;
      originals = filesFrom(converted, Object.keys(converted));
    }
    this.store.originals.set(originals);
    const names = originals.map((file) => file.name);
    const draft = readDraft(this.storage(), this.scope(query), names);
    const restored = draft ? filesFrom(draft.files, names) : null;
    if (restored && isEdited(restored, originals)) {
      this.store.replaceFiles(restored);
      this.store.draftRestored.set(true);
      return;
    }
    this.store.replaceFiles(originals);
    void this.run();
  }

  /** TypeScript files of a React or Vue example to JavaScript in the worker. */
  private async convert(files: Readonly<Record<string, string>>): Promise<Record<string, string> | null> {
    try {
      const { compilersBase } = await this.runtime();
      this.announceCompilers();
      const response = await this.compileClient().request({ kind: 'convert', framework: this.store.query().framework, files, compilersBase });
      if (response.ok && response.kind === 'convert') return { ...response.files };
      const message = response.ok
        ? ''
        : 'timeout' in response
          ? this.t().compileTimeout
          : 'loadError' in response
            ? response.loadError
            : (response.diagnostics[0]?.message ?? '');
      this.log('danger', this.t().convertFailed(message), 'text');
      this.store.run.set({ state: 'failed', message: this.t().convertFailed(message), kind: 'text', bundled: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log('danger', this.t().convertFailed(message), 'text');
      this.store.run.set({ state: 'failed', message: this.t().convertFailed(message), kind: 'text', bundled: false });
    }
    return null;
  }

  private announceCompilers(): void {
    if (this.compilersAnnounced) return;
    this.compilersAnnounced = true;
    this.log('info', this.t().loadingCompilers, 'text');
  }

  private log(level: LogLevel, text: string, kind: 'code' | 'text'): void {
    this.store.addLog(level, text, kind);
  }

  /** Runs the project: the precompiled payload when nothing was edited, else the compiled files. */
  protected async run(): Promise<void> {
    if (!this.browser || this.compiling || !this.payload) return;
    const query = this.store.query();
    const run = ++this.runCounter;
    const edited = this.store.edited();
    this.store.draftRestored.set(false);
    this.store.run.set({ state: 'running' });
    this.runStart = performance.now();
    this.runEdited = edited;
    this.userRun = true;
    const base = { framework: query.framework, lang: this.lang(), dir: dirOf(this.lang()) } as const;
    if (!edited) {
      this.frameSource.set({ ...base, compiled: this.payload.compiled });
      return;
    }
    this.compiling = true;
    try {
      const { compilersBase, available } = await this.runtime();
      this.announceCompilers();
      const response = await this.compileClient().request({
        kind: 'compile',
        framework: query.framework,
        language: query.language,
        files: filesRecord(this.store.files()),
        available,
        loopMessage: this.t().loopStopped,
        scope: vueScope(`${query.id}/${query.example}`),
        compilersBase,
      });
      if (run !== this.runCounter) return;
      if (response.ok && response.kind === 'compile') {
        this.frameSource.set({ ...base, compiled: response.compiled, jit: response.jit });
        return;
      }
      this.frameSource.set(null);
      if (!response.ok && 'timeout' in response) {
        const text = this.t().compileTimeout;
        this.log('danger', text, 'text');
        this.store.run.set({ state: 'failed', message: text, kind: 'text', bundled: false });
        return;
      }
      if (!response.ok && 'loadError' in response) {
        const text = this.t().compilersFailed(response.loadError);
        this.log('danger', text, 'text');
        this.store.run.set({ state: 'failed', message: text, kind: 'text', bundled: false });
        return;
      }
      const diagnostics = !response.ok && 'diagnostics' in response ? response.diagnostics : [];
      const texts = diagnostics.map((diagnostic) => this.diagnosticText(diagnostic));
      for (const text of texts) this.log('danger', text.text, text.kind);
      this.store.run.set({ state: 'failed', message: texts[0]?.text ?? '', kind: texts[0]?.kind ?? 'code', bundled: false });
    } catch (error) {
      if (run !== this.runCounter) return;
      const text = this.t().compilersFailed(error instanceof Error ? error.message : String(error));
      this.frameSource.set(null);
      this.log('danger', text, 'text');
      this.store.run.set({ state: 'failed', message: text, kind: 'text', bundled: false });
    } finally {
      this.compiling = false;
    }
  }

  private diagnosticText(diagnostic: CompileDiagnostic): { text: string; kind: 'code' | 'text' } {
    const location = diagnostic.file ? `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}` : '';
    if (diagnostic.code === 'unknownModule') return { text: `${location} ${this.t().unknownModule(diagnostic.specifier ?? '')}`.trim(), kind: 'text' };
    if (diagnostic.code === 'unknownFile') return { text: `${location} ${this.t().unknownFile(diagnostic.specifier ?? '')}`.trim(), kind: 'text' };
    return { text: location ? this.t().compileError(location, diagnostic.message) : diagnostic.message, kind: 'code' };
  }

  protected frameStatus(status: FrameRunStatus): void {
    const t = this.t();
    switch (status.state) {
      case 'loading':
        // A run started by the frame itself (a change of the colour mode) is timed from here.
        if (!this.userRun) this.runStart = performance.now();
        this.store.run.set({ state: 'running' });
        return;
      case 'ready':
        this.userRun = false;
        this.store.run.set({ state: 'ready', ms: Math.max(0, Math.round(performance.now() - this.runStart)), edited: this.runEdited, bundled: status.strategy === 'bundled' });
        return;
      case 'failed': {
        this.userRun = false;
        const loop = status.message.includes(t.loopStopped);
        const message = loop ? t.loopStopped : status.message;
        const last = this.store.log().entries.at(-1);
        const plain = loop || status.plain === true;
        if (!loop && last?.text !== status.message) this.log('danger', status.message, plain ? 'text' : 'code');
        this.store.run.set({ state: 'failed', message, kind: plain ? 'text' : 'code', bundled: status.strategy === 'bundled' });
        return;
      }
    }
  }

  protected frameLog(entry: FrameLogEntry): void {
    const t = this.t();
    switch (entry.kind) {
      case 'console':
        this.log(CONSOLE_LEVELS[entry.level] ?? 'info', entry.text, 'code');
        return;
      case 'error':
        if (entry.text.includes(t.loopStopped)) {
          // The loop guard stopped a loop: the frame is removed (editor.fullEditor.loopGuard).
          this.log('danger', t.loopStopped, 'text');
          this.frameSource.set(null);
          this.store.run.set({ state: 'failed', message: t.loopStopped, kind: 'text', bundled: false });
          return;
        }
        this.log('danger', entry.text, 'code');
        return;
      case 'navigation': {
        const { before, after } = t.navigationBlocked;
        this.store.addLog('info', `${before}${entry.href}${after}`, 'text', { before, value: entry.href, after });
        return;
      }
      case 'submit':
        this.log('info', t.submitBlocked, 'text');
        return;
      case 'left':
        this.log('danger', entry.text, 'text');
        return;
      case 'dropped':
        // One entry per run, whose count is updated.
        this.store.setLog(`dropped-${entry.run}`, 'warning', t.messagesDropped(entry.count), 'text');
        return;
      case 'dropped-outcome':
        this.store.setLog(`dropped-outcome-${entry.run}`, 'warning', t.outcomeDropped(entry.count), 'text');
        return;
      case 'fallback':
        this.log('warning', t.fallbackUsed, 'text');
        return;
    }
  }

  protected edit(name: string, text: string): void {
    this.store.setFile(name, text);
    const scope = this.scope();
    const files = filesRecord(this.store.files());
    const edited = this.store.edited();
    const storage = this.storage();
    this.saver.schedule(() => {
      if (edited) writeDraft(storage, scope, files, Date.now());
      else removeDraft(storage, scope);
    });
  }

  protected chooseFramework(framework: ExampleFramework): void {
    const query = this.store.query();
    // The language chosen for React or Vue carries over between them; Angular and JavaScript have one language each.
    const preferred = query.framework === 'react' || query.framework === 'vue' ? query.language : DEFAULT_LANGUAGE;
    this.select({ ...query, framework, language: languageFor(framework, preferred) });
  }

  protected chooseLanguage(language: EditorLanguage): void {
    const query = this.store.query();
    this.select({ ...query, language: languageFor(query.framework, language) });
  }

  private select(query: EditorQuery): void {
    const next = { ...query, fallback: false };
    const view = this.document.defaultView;
    // The address names the selection; it is not a navigation of the router.
    const path = view?.location.pathname.replace(/\/?$/, '/') ?? '';
    view?.history.replaceState(view.history.state, '', `${path}?${editorSearch(next)}`);
    void this.open(next);
  }

  /** Back to the original example: the drafts of this framework are removed. */
  protected reset(): void {
    const scope = this.scope();
    this.saver.cancel();
    removeFrameworkDrafts(this.storage(), { id: scope.id, example: scope.example, framework: scope.framework, pageLang: scope.pageLang });
    this.restoreOriginals();
  }

  protected discardDraft(): void {
    this.saver.cancel();
    removeDraft(this.storage(), this.scope());
    this.restoreOriginals();
  }

  private restoreOriginals(): void {
    this.store.draftRestored.set(false);
    this.store.replaceFiles(this.store.originals());
    void this.run();
  }

  /** Downloads the file shown through a Blob URL. */
  protected download(): void {
    const view = this.document.defaultView;
    const name = this.store.currentFile();
    if (!view || !name) return;
    const url = view.URL.createObjectURL(new Blob([this.store.currentText()], { type: 'text/plain;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = name;
    link.hidden = true;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    view.setTimeout(() => view.URL.revokeObjectURL(url), 1000);
  }
}
