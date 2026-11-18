// CodeMirror theme and highlight style of the editor (editor.fullEditor.codeSurface).
// Only var(--hw-color-code-*), var(--hw-color-*), var(--hw-space-*) and other
// var(--hw-*) values (lint L-SRC-8): the colours follow the colour mode of the page.
// The roles match the build-time highlighting (scripts/content/highlight.mjs).
import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const codeTheme = EditorView.theme({
  '&': {
    color: 'var(--hw-color-code-text)',
    backgroundColor: 'var(--hw-color-code-surface)',
    border: '1px solid var(--hw-color-code-border)',
    borderRadius: 'var(--hw-radius-md)',
    fontSize: '0.875rem',
  },
  '&.cm-focused': {
    outline: '2px solid var(--hw-color-focus)',
    outlineOffset: '2px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--hw-font-mono)',
    lineHeight: '1.6',
    minBlockSize: 'var(--hw-space-48)',
    maxBlockSize: '70vh',
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: 'var(--hw-color-code-text)',
    paddingBlock: 'var(--hw-space-3)',
  },
  '.cm-line': {
    paddingInline: 'var(--hw-space-3)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderInlineStartColor: 'var(--hw-color-code-text)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--hw-color-primary-subtle)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--hw-color-code-surface)',
    color: 'var(--hw-color-code-comment)',
    borderInlineEnd: '1px solid var(--hw-color-code-border)',
    borderStartStartRadius: 'var(--hw-radius-md)',
    borderEndStartRadius: 'var(--hw-radius-md)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    paddingInline: 'var(--hw-space-2)',
  },
  '.cm-matchingBracket': {
    outline: '1px solid var(--hw-color-code-punctuation)',
  },
});

export const codeHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--hw-color-code-comment)' },
  { tag: [tags.punctuation, tags.operator, tags.bracket], color: 'var(--hw-color-code-punctuation)' },
  { tag: [tags.keyword, tags.modifier], color: 'var(--hw-color-code-keyword)' },
  { tag: tags.propertyName, color: 'var(--hw-color-code-property)' },
  { tag: [tags.string, tags.regexp], color: 'var(--hw-color-code-string)' },
  { tag: [tags.number, tags.bool, tags.atom, tags.unit], color: 'var(--hw-color-code-constant)' },
  { tag: tags.attributeName, color: 'var(--hw-color-code-attribute)' },
  { tag: tags.tagName, color: 'var(--hw-color-code-tag)' },
  { tag: [tags.typeName, tags.className], color: 'var(--hw-color-code-type)' },
  { tag: tags.function(tags.variableName), color: 'var(--hw-color-code-function)' },
]);
