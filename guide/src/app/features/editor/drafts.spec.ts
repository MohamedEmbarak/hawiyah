import { describe, expect, it } from 'vitest';
import { DRAFT_DELAY_MS, DraftSaver, draftKey, parseDraft, readDraft, removeFrameworkDrafts, writeDraft, type DraftScope, type DraftStorage } from './drafts';

class MemoryStorage implements DraftStorage {
  readonly items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
}

const scope: DraftScope = { id: 'button', example: 'primary', framework: 'react', language: 'ts', pageLang: 'ar' };

describe('draftKey', () => {
  it('names the example, framework, language and page language', () => {
    expect(draftKey(scope)).toBe('hawiyah-guide-editor:button/primary:react:ts:ar');
  });
});

describe('parseDraft', () => {
  it('accepts files and savedAt only', () => {
    expect(parseDraft(JSON.stringify({ files: { 'a.ts': 'x' }, savedAt: 5 }))).toEqual({ files: { 'a.ts': 'x' }, savedAt: 5 });
    expect(parseDraft('not json')).toBeNull();
    expect(parseDraft(JSON.stringify({ files: { 'a.ts': 1 }, savedAt: 5 }))).toBeNull();
    expect(parseDraft(JSON.stringify({ files: {}, savedAt: 5 }))).toBeNull();
    expect(parseDraft(JSON.stringify({ files: { 'a.ts': 'x' } }))).toBeNull();
    expect(parseDraft(null)).toBeNull();
  });
});

describe('readDraft and writeDraft', () => {
  it('restores a draft of the same files', () => {
    const storage = new MemoryStorage();
    expect(writeDraft(storage, scope, { 'Example.tsx': 'edited', 'main.tsx': 'main' }, 10)).toBe(true);
    expect(readDraft(storage, scope, ['Example.tsx', 'main.tsx'])).toEqual({ files: { 'Example.tsx': 'edited', 'main.tsx': 'main' }, savedAt: 10 });
  });

  it('ignores a draft of another file set or another scope', () => {
    const storage = new MemoryStorage();
    writeDraft(storage, scope, { 'Example.tsx': 'edited' }, 10);
    expect(readDraft(storage, scope, ['Example.tsx', 'main.tsx'])).toBeNull();
    expect(readDraft(storage, { ...scope, pageLang: 'en' }, ['Example.tsx'])).toBeNull();
    expect(readDraft(null, scope, ['Example.tsx'])).toBeNull();
  });

  it('survives storage that throws', () => {
    const broken: DraftStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(readDraft(broken, scope, ['a'])).toBeNull();
    expect(writeDraft(broken, scope, { a: 'x' }, 1)).toBe(false);
    expect(() => removeFrameworkDrafts(broken, scope)).not.toThrow();
  });

  it('reset removes both languages of the framework and nothing else', () => {
    const storage = new MemoryStorage();
    writeDraft(storage, scope, { a: '1' }, 1);
    writeDraft(storage, { ...scope, language: 'js' }, { a: '2' }, 1);
    writeDraft(storage, { ...scope, framework: 'vue' }, { a: '3' }, 1);
    removeFrameworkDrafts(storage, scope);
    expect([...storage.items.keys()]).toEqual(['hawiyah-guide-editor:button/primary:vue:ts:ar']);
  });
});

describe('DraftSaver', () => {
  it('saves once, DRAFT_DELAY_MS after the last edit', () => {
    let pending: (() => void) | null = null;
    let delay = 0;
    const saver = new DraftSaver({
      set: (callback, ms) => {
        pending = callback;
        delay = ms;
        return 1 as unknown as ReturnType<typeof setTimeout>;
      },
      clear: () => {
        pending = null;
      },
    });
    const saved: string[] = [];
    saver.schedule(() => saved.push('first'));
    saver.schedule(() => saved.push('second'));
    expect(delay).toBe(DRAFT_DELAY_MS);
    (pending as (() => void) | null)?.();
    expect(saved).toEqual(['second']);
    saver.schedule(() => saved.push('third'));
    saver.cancel();
    saver.flush();
    expect(saved).toEqual(['second']);
  });
});
