import { describe, expect, it } from 'vitest';
import type { NavigationIndex } from '../../content/model';
import { componentNavItems } from './component-layout';

const INDEX: NavigationIndex = {
  categories: ['actions', 'navigation'],
  pages: [
    { id: 'button', langs: ['ar', 'en'], category: 'actions', title: { en: 'Button', ar: 'زر' }, summary: { en: 'B.', ar: 'ب.' }, examples: [] },
    { id: 'link', langs: ['en'], category: 'actions', title: { en: 'Link', ar: 'رابط' }, summary: { en: 'L.', ar: 'ل.' }, examples: [] },
    { id: 'tabs', langs: ['ar', 'en'], category: 'navigation', title: { en: 'Tabs', ar: 'تبويبات' }, summary: { en: 'T.', ar: 'ت.' }, examples: [] },
  ],
};

describe('componentNavItems', () => {
  it('groups the pages of each language by category, with the category labels of the text sources', () => {
    expect(componentNavItems('en', 'tabs', INDEX)).toEqual([
      {
        id: 'category-actions',
        label: 'Actions',
        children: [
          { id: 'button', label: 'Button', href: 'en/components/button/', current: false },
          { id: 'link', label: 'Link', href: 'en/components/link/', current: false },
        ],
      },
      { id: 'category-navigation', label: 'Navigation', children: [{ id: 'tabs', label: 'Tabs', href: 'en/components/tabs/', current: true }] },
    ]);
  });

  it('leaves out pages without the language, and categories left empty', () => {
    const ar = componentNavItems('ar', 'button', INDEX);
    expect(ar.map((group) => group.label)).toEqual(['الإجراءات', 'التنقل']);
    expect(ar[0]?.children?.map((item) => [item.id, item.label, item.current])).toEqual([['button', 'زر', true]]);
    const onlyLink: NavigationIndex = { categories: ['actions'], pages: [INDEX.pages[1]!] };
    expect(componentNavItems('ar', null, onlyLink)).toEqual([]);
  });
});
