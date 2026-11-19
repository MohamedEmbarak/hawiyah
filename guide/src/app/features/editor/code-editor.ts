// The CodeMirror 6 view of one file (editor.fullEditor.codeSurface), loaded by
// code-surface.ts after hydration. Ctrl or Cmd+Enter runs the project and inserts
// nothing; Tab indents, and Escape followed by Tab leaves the code (CodeMirror's
// tab focus mode).
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { vue } from '@codemirror/lang-vue';
import { bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { EditorView, drawSelection, keymap, lineNumbers } from '@codemirror/view';
import { codeHighlightStyle, codeTheme } from './code-theme';

export interface CodeEditorOptions {
  readonly parent: HTMLElement;
  readonly doc: string;
  readonly fileName: string;
  /** Accessible name of the code area. */
  readonly label: string;
  /** Id of the element that explains how to leave the code. */
  readonly describedBy: string;
  readonly onChange: (doc: string) => void;
  readonly onRun: () => void;
}

export interface CodeEditor {
  readonly view: EditorView;
  focus(): void;
  destroy(): void;
}

/** The language support of a file name. */
export function languageOf(fileName: string): Extension {
  if (fileName.endsWith('.tsx')) return javascript({ jsx: true, typescript: true });
  if (fileName.endsWith('.ts')) return javascript({ typescript: true });
  if (fileName.endsWith('.jsx')) return javascript({ jsx: true });
  if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return javascript();
  if (fileName.endsWith('.vue')) return vue();
  if (fileName.endsWith('.html')) return html();
  if (fileName.endsWith('.css')) return css();
  return [];
}

export function createCodeEditor(options: CodeEditorOptions): CodeEditor {
  const run = () => {
    options.onRun();
    return true;
  };
  const state = EditorState.create({
    doc: options.doc,
    extensions: [
      Prec.highest(
        keymap.of([
          { key: 'Mod-Enter', run, preventDefault: true },
          { key: 'Ctrl-Enter', run, preventDefault: true },
        ]),
      ),
      lineNumbers(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(codeHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      languageOf(options.fileName),
      codeTheme,
      EditorView.contentAttributes.of({
        'aria-label': options.label,
        'aria-describedby': options.describedBy,
        dir: 'ltr',
        // An explicit tab stop: axe counts a contenteditable element without tabindex as
        // not focusable and then reports the scroller around it (scrollable-region-focusable).
        tabindex: '0',
        translate: 'no',
        spellcheck: 'false',
        autocapitalize: 'off',
        autocorrect: 'off',
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) options.onChange(update.state.doc.toString());
      }),
    ],
  });
  const view = new EditorView({ state, parent: options.parent });
  return {
    view,
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  };
}
