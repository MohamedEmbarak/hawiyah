import { describe, expect, it } from 'vitest';
import { pageKey, pagePathOf, parseKey, pathKey } from '../content/kinds';
import type { NavigationIndex } from '../content/model';
import { examplePayloadPath } from '../examples/payload';
import { editorExamples, parseEditorQuery } from '../features/editor/editor-store';
import { documentCards } from './document-index-page';

const INDEX: NavigationIndex = {
  categories: ['actions'],
  pages: [{ id: 'button', langs: ['ar', 'en'], category: 'actions', title: { en: 'Button', ar: 'زر' }, summary: { en: 'Button starts an action.', ar: 'يبدأ الزر إجراءً.' }, examples: [{ example: 'primary', section: 'example' }] }],
  guides: [
    { id: 'guide:getting-started', slug: 'getting-started', langs: ['ar', 'en'], title: { en: 'Getting started', ar: 'البدء' }, summary: { en: 'Install the packages.', ar: 'ثبّت الحزم.' }, examples: [{ example: 'continue', section: 'a-live-group' }] },
    { id: 'guide:theming', slug: 'theming', langs: ['en'], title: { en: 'Theming', ar: '' }, summary: { en: 'Set the theme.', ar: '' }, examples: [] },
  ],
  templates: [
    { id: 'template:service', slug: 'service', langs: ['ar', 'en'], title: { en: 'Service page', ar: 'صفحة الخدمة' }, summary: { en: 'A service.', ar: 'خدمة.' }, examples: [{ example: 'received', section: 'request-received' }] },
  ],
};

describe('keys of the guides and templates', () => {
  it('prefixes the kind, writes the colon as a full stop in paths and names the page address', () => {
    expect(pageKey('guide', 'getting-started')).toBe('guide:getting-started');
    expect(parseKey('template:service')).toEqual({ kind: 'template', id: 'service' });
    expect(parseKey('button')).toEqual({ kind: 'component', id: 'button' });
    expect(pathKey('template:service')).toBe('template.service');
    expect(pagePathOf('guide:getting-started')).toBe('guides/getting-started/');
    expect(pagePathOf('button')).toBe('components/button/reference/');
    expect(examplePayloadPath('guide:getting-started', 'ar', 'continue', 'vue')).toBe('examples/guide.getting-started/ar/continue/vue.json');
  });
});

describe('documentCards', () => {
  it('gives a card per built page of the kind in this language, in the order of index.json', () => {
    expect(documentCards('guide', 'en', INDEX)).toEqual([
      { id: 'getting-started', href: 'en/guides/getting-started/', label: 'Getting started', summary: 'Install the packages.' },
      { id: 'theming', href: 'en/guides/theming/', label: 'Theming', summary: 'Set the theme.' },
    ]);
    expect(documentCards('guide', 'ar', INDEX).map((card) => card.href)).toEqual(['ar/guides/getting-started/']);
    expect(documentCards('template', 'ar', INDEX)).toEqual([{ id: 'service', href: 'ar/templates/service/', label: 'صفحة الخدمة', summary: 'خدمة.' }]);
    expect(documentCards('template', 'en', { categories: [], pages: [] })).toEqual([]);
  });
});

describe('the editor and the groups of guides and templates', () => {
  it('opens a group of a guide or a template by its key', () => {
    const examples = editorExamples(INDEX);
    expect(examples.map((entry) => `${entry.id}/${entry.example}`)).toEqual(['button/primary', 'guide:getting-started/continue', 'template:service/received']);
    expect(parseEditorQuery('?example=guide:getting-started/continue', examples)).toMatchObject({ id: 'guide:getting-started', example: 'continue', fallback: false });
    expect(parseEditorQuery('?example=template%3Aservice%2Freceived', examples)).toMatchObject({ id: 'template:service', example: 'received', fallback: false });
  });
});
