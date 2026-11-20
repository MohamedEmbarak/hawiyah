// Fixture data of the component page unit specs (a test page with two live groups).
import { Component } from '@angular/core';
import type { ContentPage, NavigationPage } from '../../content/model';
import { viewGroups, type ComponentPageData } from './page-data.resolver';

@Component({ selector: 'guide-test-native', template: `<button type="button">Continue</button>` })
class TestNative {}

const PAGE: ContentPage = {
  id: 'fixture',
  lang: 'en',
  dir: 'ltr',
  title: 'Fixture',
  summary: [{ type: 'text', value: 'Fixture is a test page.' }],
  headings: [
    { id: 'example', level: 2, text: 'Example' },
    { id: 'variants-and-states', level: 2, text: 'Variants and states' },
    { id: 'sizes', level: 3, text: 'Sizes' },
    { id: 'api', level: 2, text: 'API' },
  ],
  sections: [
    { id: 'example', level: 2, title: [{ type: 'text', value: 'Example' }], blocks: [{ type: 'paragraph', children: [{ type: 'text', value: 'One primary action.' }] }, { type: 'live', example: 'primary' }] },
    {
      id: 'variants-and-states',
      level: 2,
      title: [{ type: 'text', value: 'Variants and states' }],
      blocks: [{ type: 'heading', level: 3, id: 'sizes', children: [{ type: 'text', value: 'Sizes' }] }, { type: 'live', example: 'sizes' }],
    },
    { id: 'api', level: 2, title: [{ type: 'text', value: 'API' }], blocks: [{ type: 'paragraph', children: [{ type: 'text', value: 'Reference.' }] }] },
  ],
  liveGroups: ['primary', 'sizes'],
  sourcePath: 'docs/components/fixture.md',
  githubUrl: 'https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/components/fixture.md',
};

const ENTRY: NavigationPage = {
  id: 'fixture',
  langs: ['ar', 'en'],
  category: 'actions',
  title: { en: 'Fixture', ar: 'نموذج' },
  summary: { en: 'Fixture is a test page.', ar: 'نموذج صفحة اختبار.' },
  examples: [
    { example: 'primary', section: 'example' },
    { example: 'sizes', section: 'sizes', title: { en: 'Sizes', ar: 'الأحجام' } },
  ],
};

export function fixtureData(view: 'brief' | 'reference'): ComponentPageData {
  return {
    view,
    page: PAGE,
    entry: ENTRY,
    groups: viewGroups(ENTRY, PAGE, view).map((group) => ({
      id: 'fixture',
      lang: 'en',
      example: group.example,
      headingId: group.section,
      native: TestNative,
      sources: null,
    })),
  };
}
