import { describe, expect, it } from 'vitest';
import type { NavigationIndex } from '../../content/model';
import { catalogueSections } from './catalogue-page';

const INDEX: NavigationIndex = {
  categories: ['actions', 'navigation'],
  pages: [
    { id: 'button', langs: ['ar', 'en'], category: 'actions', title: { en: 'Button', ar: 'زر' }, summary: { en: 'Button starts an action.', ar: 'يبدأ الزر إجراءً.' }, examples: [] },
    { id: 'tabs', langs: ['ar', 'en'], category: 'navigation', title: { en: 'Tabs', ar: 'تبويبات' }, summary: { en: 'Tabs show panels.', ar: 'تعرض التبويبات لوحات.' }, examples: [] },
  ],
};

describe('catalogueSections', () => {
  it('gives one section per category with a card per built page: name, summary and link', () => {
    expect(catalogueSections('en', INDEX)).toEqual([
      { id: 'actions', label: 'Actions', cards: [{ id: 'button', href: 'en/components/button/', label: 'Button', summary: 'Button starts an action.' }] },
      { id: 'navigation', label: 'Navigation', cards: [{ id: 'tabs', href: 'en/components/tabs/', label: 'Tabs', summary: 'Tabs show panels.' }] },
    ]);
    expect(catalogueSections('ar', INDEX).map((section) => [section.label, section.cards.map((card) => card.summary)])).toEqual([
      ['الإجراءات', ['يبدأ الزر إجراءً.']],
      ['التنقل', ['تعرض التبويبات لوحات.']],
    ]);
  });

  it('reads the index of the build: Button under Actions before Tabs under Navigation', () => {
    expect(catalogueSections('en').map((section) => [section.id, section.cards.map((card) => card.id)])).toEqual([
      ['actions', ['button']],
      ['navigation', ['tabs']],
    ]);
  });
});
