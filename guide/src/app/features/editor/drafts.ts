// Drafts of the editor (editor.fullEditor.drafts): the reader's edits are kept in
// localStorage per example, framework, language and page language, saved 500 ms
// after the last edit. A restored draft is shown, never run, until Run is pressed.
import type { ExampleFramework } from '../../examples/payload';
import type { Lang } from '../../i18n/text';
import type { EditorLanguage } from './editor-store';

export const DRAFT_PREFIX = 'hawiyah-guide-editor:';

/** Delay between the last edit and the save. */
export const DRAFT_DELAY_MS = 500;

export interface Draft {
  readonly files: Readonly<Record<string, string>>;
  /** Milliseconds since the epoch. */
  readonly savedAt: number;
}

export interface DraftScope {
  readonly id: string;
  readonly example: string;
  readonly framework: ExampleFramework;
  readonly language: EditorLanguage;
  readonly pageLang: Lang;
}

/** Storage as far as the drafts use it (localStorage, or a test double). */
export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** hawiyah-guide-editor:<id>/<example>:<framework>:<language>:<pageLang> */
export function draftKey(scope: DraftScope): string {
  return `${DRAFT_PREFIX}${scope.id}/${scope.example}:${scope.framework}:${scope.language}:${scope.pageLang}`;
}

/** Parses a stored draft; anything that is not { files: { name: text }, savedAt: number } is null. */
export function parseDraft(text: string | null): Draft | null {
  if (text === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const { files, savedAt } = value as { files?: unknown; savedAt?: unknown };
  if (!files || typeof files !== 'object' || Array.isArray(files) || typeof savedAt !== 'number') return null;
  const entries = Object.entries(files as Record<string, unknown>);
  if (entries.length === 0 || entries.some(([, content]) => typeof content !== 'string')) return null;
  return { files: Object.fromEntries(entries) as Record<string, string>, savedAt };
}

/**
 * The draft of a scope when it names exactly the given files; a draft of another file
 * set (an example whose files changed since) is ignored.
 */
export function readDraft(storage: DraftStorage | null, scope: DraftScope, names: readonly string[]): Draft | null {
  if (!storage) return null;
  let text: string | null = null;
  try {
    text = storage.getItem(draftKey(scope));
  } catch {
    return null;
  }
  const draft = parseDraft(text);
  if (!draft) return null;
  const keys = Object.keys(draft.files);
  if (keys.length !== names.length || names.some((name) => !(name in draft.files))) return null;
  return draft;
}

export function writeDraft(storage: DraftStorage | null, scope: DraftScope, files: Readonly<Record<string, string>>, now: number): boolean {
  if (!storage) return false;
  try {
    storage.setItem(draftKey(scope), JSON.stringify({ files, savedAt: now } satisfies Draft));
    return true;
  } catch {
    return false;
  }
}

export function removeDraft(storage: DraftStorage | null, scope: DraftScope): void {
  if (!storage) return;
  try {
    storage.removeItem(draftKey(scope));
  } catch {
    // Storage unavailable: nothing was stored either.
  }
}

/** Reset: removes the drafts of the current framework (both languages) of the example and page language. */
export function removeFrameworkDrafts(storage: DraftStorage | null, scope: Omit<DraftScope, 'language'>): void {
  for (const language of ['js', 'ts'] as const) removeDraft(storage, { ...scope, language });
}

/** Saves DRAFT_DELAY_MS after the last call of schedule(); flush() saves at once. */
export class DraftSaver {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: (() => void) | null = null;

  constructor(
    private readonly timers: { set: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>; clear: (timer: ReturnType<typeof setTimeout>) => void } = {
      set: (callback, ms) => setTimeout(callback, ms),
      clear: (timer) => clearTimeout(timer),
    },
  ) {}

  schedule(save: () => void): void {
    this.cancel();
    this.pending = save;
    this.timer = this.timers.set(() => this.flush(), DRAFT_DELAY_MS);
  }

  flush(): void {
    const save = this.pending;
    this.cancel();
    save?.();
  }

  cancel(): void {
    if (this.timer !== null) this.timers.clear(this.timer);
    this.timer = null;
    this.pending = null;
  }
}
