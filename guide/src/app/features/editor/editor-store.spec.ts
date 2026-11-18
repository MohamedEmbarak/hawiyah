import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  EditorStore,
  LOG_LIMIT,
  EMPTY_LOG,
  appendLog,
  editorSearch,
  filesFrom,
  firstLine,
  isEdited,
  javascriptName,
  languageFor,
  parseEditorQuery,
  type EditorExample,
} from './editor-store';

const examples: EditorExample[] = [
  { id: 'button', example: 'primary', section: 'example' },
  { id: 'tabs', example: 'basic', section: 'example' },
];

describe('parseEditorQuery', () => {
  it('uses the defaults without a query', () => {
    expect(parseEditorQuery('', examples)).toEqual({ id: 'button', example: 'primary', framework: 'angular', language: 'ts', bundled: false, fallback: false });
  });

  it('reads example, framework, language and runtime', () => {
    expect(parseEditorQuery('?example=tabs%2Fbasic&framework=react&language=js&runtime=bundle', examples)).toEqual({
      id: 'tabs',
      example: 'basic',
      framework: 'react',
      language: 'js',
      bundled: true,
      fallback: false,
    });
  });

  it('falls back to the defaults for unknown values and says so', () => {
    expect(parseEditorQuery('?example=tabs/none', examples)).toMatchObject({ id: 'button', example: 'primary', fallback: true });
    expect(parseEditorQuery('?framework=svelte', examples)).toMatchObject({ framework: 'angular', fallback: true });
    expect(parseEditorQuery('?framework=vue&language=coffee', examples)).toMatchObject({ framework: 'vue', language: 'ts', fallback: true });
    expect(parseEditorQuery('?runtime=cdn', examples)).toMatchObject({ bundled: false, fallback: true });
    expect(parseEditorQuery('?example=button/primary/x', examples)).toMatchObject({ fallback: true });
  });

  it('keeps Angular in TypeScript and JavaScript examples in JavaScript', () => {
    expect(parseEditorQuery('?framework=angular&language=js', examples)).toMatchObject({ language: 'ts', fallback: true });
    expect(parseEditorQuery('?framework=vanilla', examples)).toMatchObject({ language: 'js', fallback: false });
    expect(languageFor('react', 'js')).toBe('js');
    expect(languageFor('angular', 'js')).toBe('ts');
    expect(languageFor('vanilla', 'ts')).toBe('js');
  });
});

describe('editorSearch', () => {
  it('writes the selection back to a query the parser reads', () => {
    const search = editorSearch({ id: 'tabs', example: 'basic', framework: 'vue', language: 'js', bundled: true });
    expect(search).toBe('example=tabs/basic&framework=vue&language=js&runtime=bundle');
    expect(parseEditorQuery(search, examples)).toMatchObject({ id: 'tabs', example: 'basic', framework: 'vue', language: 'js', bundled: true, fallback: false });
    expect(editorSearch({ id: 'button', example: 'primary', framework: 'angular', language: 'ts', bundled: false })).toBe('example=button/primary&framework=angular');
  });
});

describe('file helpers', () => {
  it('names the JavaScript form of TypeScript files', () => {
    expect(javascriptName('Example.tsx')).toBe('Example.jsx');
    expect(javascriptName('main.ts')).toBe('main.js');
    expect(javascriptName('Example.vue')).toBe('Example.vue');
  });

  it('detects edits and keeps the file order', () => {
    const originals = filesFrom({ 'b.ts': 'b', 'a.ts': 'a' }, ['b.ts', 'a.ts']);
    expect(originals.map((file) => file.name)).toEqual(['b.ts', 'a.ts']);
    expect(isEdited(originals, originals)).toBe(false);
    expect(isEdited([{ name: 'b.ts', text: 'B' }, originals[1]!], originals)).toBe(true);
  });

  it('takes the first non-empty line of a message', () => {
    expect(firstLine('\n  Error: x\n  at y')).toBe('Error: x');
  });
});

describe('log', () => {
  it('keeps at most LOG_LIMIT entries and counts the dropped ones', () => {
    let state = EMPTY_LOG;
    for (let i = 0; i < LOG_LIMIT + 5; i += 1) state = appendLog(state, { level: 'info', text: `entry ${i}`, kind: 'code' });
    expect(state.entries.length).toBe(LOG_LIMIT);
    expect(state.dropped).toBe(5);
    expect(state.entries[0]?.text).toBe('entry 5');
  });
});

describe('EditorStore', () => {
  it('tracks edits against the originals and the shown file', () => {
    TestBed.configureTestingModule({ providers: [EditorStore] });
    const store = TestBed.inject(EditorStore);
    const files = [
      { name: 'Example.tsx', text: 'a' },
      { name: 'main.tsx', text: 'm' },
    ];
    store.originals.set(files);
    store.replaceFiles(files);
    expect(store.currentFile()).toBe('Example.tsx');
    expect(store.edited()).toBe(false);
    store.setFile('Example.tsx', 'b');
    expect(store.edited()).toBe(true);
    expect(store.currentText()).toBe('b');
    const revision = store.revision();
    store.replaceFiles(files);
    expect(store.revision()).toBe(revision + 1);
    expect(store.edited()).toBe(false);
    store.addLog('danger', 'x', 'code');
    store.clearLog();
    expect(store.log().entries).toEqual([]);
  });
});
