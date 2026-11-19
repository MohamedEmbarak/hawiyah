// State of the editor route (editor.fullEditor): the selected example, framework and
// language, the files, the run state and the log. The query parsing and the file
// helpers are pure functions so that they can be tested without a browser.
import { Injectable, computed, signal } from '@angular/core';
import { contentManifest } from '../../content/content-loader';
import type { ExampleFramework } from '../../examples/payload';
import { EXAMPLE_FRAMEWORKS } from '../../examples/payload';
import type { LogLevel } from './i18n';

export type EditorLanguage = 'js' | 'ts';

export const EDITOR_LANGUAGES: readonly EditorLanguage[] = ['js', 'ts'];

/** Defaults of the query (editor.fullEditor.route). */
export const DEFAULT_EXAMPLE = Object.freeze({ id: 'button', example: 'primary' });
export const DEFAULT_EDITOR_FRAMEWORK: ExampleFramework = 'angular';
export const DEFAULT_LANGUAGE: EditorLanguage = 'ts';

/** One live group the editor can open. */
export interface EditorExample {
  readonly id: string;
  readonly example: string;
  /** Id of the heading the group stands under on its component page. */
  readonly section: string;
}

/** Every live group of the content manifest, in manifest order. */
export function editorExamples(manifest: { readonly pages: readonly { readonly id: string; readonly liveGroups: readonly { readonly example: string; readonly section: string }[] }[] } = contentManifest): EditorExample[] {
  return manifest.pages.flatMap((page) => page.liveGroups.map((group) => ({ id: page.id, example: group.example, section: group.section })));
}

export interface EditorQuery {
  readonly id: string;
  readonly example: string;
  readonly framework: ExampleFramework;
  readonly language: EditorLanguage;
  /** runtime=bundle: the bundled runtime is forced. */
  readonly bundled: boolean;
  /** A value of the query was not known; the default was used (an info alert says so). */
  readonly fallback: boolean;
}

/**
 * The language a framework is edited in. Angular examples are TypeScript only; the
 * JavaScript examples are published as JavaScript only (main.js and index.html), so
 * they have no TypeScript form.
 */
export function languageFor(framework: ExampleFramework, requested: EditorLanguage): EditorLanguage {
  if (framework === 'angular') return 'ts';
  if (framework === 'vanilla') return 'js';
  return requested;
}

/** Whether a language can be chosen for a framework. */
export function languageAvailable(framework: ExampleFramework, language: EditorLanguage): boolean {
  return languageFor(framework, language) === language;
}

export function isEditorFramework(value: unknown): value is ExampleFramework {
  return typeof value === 'string' && (EXAMPLE_FRAMEWORKS as readonly string[]).includes(value);
}

export function isEditorLanguage(value: unknown): value is EditorLanguage {
  return value === 'js' || value === 'ts';
}

/** Parses the query of <lang>/editor/ (example=<id>/<example>, framework, language, runtime). */
export function parseEditorQuery(search: string, examples: readonly EditorExample[] = editorExamples()): EditorQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  let fallback = false;

  let id: string = DEFAULT_EXAMPLE.id;
  let example: string = DEFAULT_EXAMPLE.example;
  const exampleValue = params.get('example');
  if (exampleValue !== null) {
    const [pageId, name, ...rest] = exampleValue.split('/');
    const found = rest.length === 0 ? examples.find((entry) => entry.id === pageId && entry.example === name) : undefined;
    if (found) {
      id = found.id;
      example = found.example;
    } else {
      fallback = true;
    }
  }

  let framework = DEFAULT_EDITOR_FRAMEWORK;
  const frameworkValue = params.get('framework');
  if (frameworkValue !== null) {
    if (isEditorFramework(frameworkValue)) framework = frameworkValue;
    else fallback = true;
  }

  let language: EditorLanguage = DEFAULT_LANGUAGE;
  const languageValue = params.get('language');
  if (languageValue !== null) {
    if (isEditorLanguage(languageValue)) {
      // Angular is TypeScript only: an explicit request for JavaScript is not available.
      if (framework === 'angular' && languageValue === 'js') fallback = true;
      language = languageValue;
    } else {
      fallback = true;
    }
  }
  language = languageFor(framework, language);

  let bundled = false;
  const runtimeValue = params.get('runtime');
  if (runtimeValue !== null) {
    if (runtimeValue === 'bundle') bundled = true;
    else fallback = true;
  }

  return { id, example, framework, language, bundled, fallback };
}

/** The query string of a selection (runtime is kept only when it was forced). */
export function editorSearch(query: Pick<EditorQuery, 'id' | 'example' | 'framework' | 'language' | 'bundled'>): string {
  const params = new URLSearchParams();
  params.set('example', `${query.id}/${query.example}`);
  params.set('framework', query.framework);
  if (query.framework === 'react' || query.framework === 'vue') params.set('language', query.language);
  if (query.bundled) params.set('runtime', 'bundle');
  return params.toString().replace(/%2F/g, '/');
}

/** One file of a project, in payload order. */
export interface ProjectFile {
  readonly name: string;
  readonly text: string;
}

/** The JavaScript name of a TypeScript file (Example.tsx -> Example.jsx, main.ts -> main.js). */
export function javascriptName(name: string): string {
  return name.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
}

/** Files as a record in their order. */
export function filesRecord(files: readonly ProjectFile[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of files) out[file.name] = file.text;
  return out;
}

/** A record as files, keeping the order of `order` (names outside it are ignored). */
export function filesFrom(record: Readonly<Record<string, string>>, order: readonly string[]): ProjectFile[] {
  return order.filter((name) => typeof record[name] === 'string').map((name) => ({ name, text: record[name] as string }));
}

/** Whether the files differ from the original files. */
export function isEdited(files: readonly ProjectFile[], originals: readonly ProjectFile[]): boolean {
  if (files.length !== originals.length) return true;
  return files.some((file, index) => file.name !== originals[index]?.name || file.text !== originals[index]?.text);
}

/** The first line of a message, for status texts. */
export function firstLine(text: string): string {
  return text.split('\n').find((line) => line.trim() !== '')?.trim() ?? '';
}

// ------------------------------------------------------------------------- log

/** Maximum number of log entries kept (editor.fullEditor.logPanel). */
export const LOG_LIMIT = 200;

export interface LogEntry {
  readonly id: number;
  readonly level: LogLevel;
  readonly text: string;
  /**
   * 'code': text from a compiler, the frame or the console, shown left to right in a
   * code element; 'text': a sentence of the guide in the page language.
   */
  readonly kind: 'code' | 'text';
  /** An entry with a key is updated in place by upsertLog (the dropped-message count of a run). */
  readonly key?: string;
  /** A sentence around an address, shown left to right in a bdi element; text holds the whole sentence. */
  readonly address?: { readonly before: string; readonly value: string; readonly after: string };
}

export interface LogState {
  readonly entries: readonly LogEntry[];
  /** Entries removed because of the limit since the last clear. */
  readonly dropped: number;
  readonly next: number;
}

export const EMPTY_LOG: LogState = { entries: [], dropped: 0, next: 1 };

/** Adds an entry; when more than `limit` entries exist, the oldest are removed and counted. */
export function appendLog(state: LogState, entry: Omit<LogEntry, 'id'>, limit = LOG_LIMIT): LogState {
  const entries = [...state.entries, { ...entry, id: state.next }];
  const over = Math.max(0, entries.length - limit);
  return { entries: over ? entries.slice(over) : entries, dropped: state.dropped + over, next: state.next + 1 };
}

/** Replaces the text of the entry with this key where it stands, or appends it when there is none. */
export function upsertLog(state: LogState, key: string, entry: Omit<LogEntry, 'id' | 'key'>, limit = LOG_LIMIT): LogState {
  const at = state.entries.findIndex((item) => item.key === key);
  if (at < 0) return appendLog(state, { ...entry, key }, limit);
  const entries = state.entries.map((item, index) => (index === at ? { ...item, ...entry } : item));
  return { ...state, entries };
}

// ----------------------------------------------------------------------- store

export type RunState =
  | { readonly state: 'notRun' }
  | { readonly state: 'running' }
  | { readonly state: 'ready'; readonly ms: number; readonly edited: boolean; readonly bundled: boolean }
  | {
      readonly state: 'failed';
      readonly message: string;
      /** 'code': a message of a compiler or the frame; 'text': a sentence of the guide. */
      readonly kind: 'code' | 'text';
      readonly bundled: boolean;
    };

/** Signals of one editor page; provided by the page component. */
@Injectable()
export class EditorStore {
  readonly query = signal<EditorQuery>({
    id: DEFAULT_EXAMPLE.id,
    example: DEFAULT_EXAMPLE.example,
    framework: DEFAULT_EDITOR_FRAMEWORK,
    language: DEFAULT_LANGUAGE,
    bundled: false,
    fallback: false,
  });
  /** The files shown and edited. */
  readonly files = signal<readonly ProjectFile[]>([]);
  /** The files of the example in the current language, before any edit. */
  readonly originals = signal<readonly ProjectFile[]>([]);
  /** Name of the file tab shown. */
  readonly currentFile = signal<string>('');
  /** Increases when the files are replaced from outside the code surfaces (load, reset, discard). */
  readonly revision = signal(0);
  readonly run = signal<RunState>({ state: 'notRun' });
  readonly log = signal<LogState>(EMPTY_LOG);
  /** A draft was restored and is shown with its alert. */
  readonly draftRestored = signal(false);
  readonly edited = computed(() => isEdited(this.files(), this.originals()));

  /** The text of the file shown (copy and download). */
  readonly currentText = computed(() => this.files().find((file) => file.name === this.currentFile())?.text ?? '');

  setFile(name: string, text: string): void {
    this.files.update((files) => files.map((file) => (file.name === name ? { name, text } : file)));
  }

  /** Replaces the files (load, reset, restore, discard) and remounts the code surfaces. */
  replaceFiles(files: readonly ProjectFile[]): void {
    this.files.set(files);
    if (!files.some((file) => file.name === this.currentFile())) this.currentFile.set(files[0]?.name ?? '');
    this.revision.update((value) => value + 1);
  }

  addLog(level: LogLevel, text: string, kind: LogEntry['kind'], address?: LogEntry['address']): void {
    this.log.update((state) => appendLog(state, address ? { level, text, kind, address } : { level, text, kind }));
  }

  /** One entry per key, updated in place. */
  setLog(key: string, level: LogLevel, text: string, kind: LogEntry['kind']): void {
    this.log.update((state) => upsertLog(state, key, { level, text, kind }));
  }

  clearLog(): void {
    this.log.update((state) => ({ entries: [], dropped: 0, next: state.next }));
  }
}
