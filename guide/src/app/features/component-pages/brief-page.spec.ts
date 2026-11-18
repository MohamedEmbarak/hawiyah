import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { LocaleService } from '../../core/locale';
import { ARABIC_SCRIPT } from '../../i18n/text';
import { BriefPage } from './brief-page';
import { componentPageTexts } from './i18n';
import { fixtureData } from './page-fixture';

describe('BriefPage', () => {
  async function render() {
    TestBed.configureTestingModule({ providers: [{ provide: ActivatedRoute, useValue: { data: of({ page: fixtureData('brief') }) } }] });
    TestBed.inject(LocaleService).lang.set('en');
    const fixture = TestBed.createComponent(BriefPage);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the h1, the summary and only the Example section in a prose article', async () => {
    const root = await render();
    const article = root.querySelector('article.hw-prose');
    expect(article?.getAttribute('lang')).toBe('en');
    expect(article?.getAttribute('dir')).toBe('ltr');
    const h1 = article?.querySelector('h1');
    expect(h1?.textContent).toBe('Fixture');
    expect(h1?.getAttribute('tabindex')).toBe('-1');
    expect(article?.querySelector('h1 + p')?.textContent).toBe('Fixture is a test page.');
    expect(Array.from(article?.querySelectorAll('h2') ?? []).map((h2) => [h2.id, h2.textContent])).toEqual([['example', 'Example']]);
    expect(article?.textContent).toContain('One primary action.');
    expect(article?.textContent).not.toContain('Reference.');
  });

  it('shows the first live group only, as a page block named by the Example heading', async () => {
    const root = await render();
    const blocks = root.querySelectorAll('guide-example-block section.example');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.getAttribute('aria-labelledby')).toBe('example');
    expect(blocks[0]?.querySelector('guide-test-native button')).not.toBeNull();
  });

  it('links to the reference view and sets the document title and description', async () => {
    const root = await render();
    const link = root.querySelector('article a');
    expect(link?.getAttribute('href')).toBe('en/components/fixture/reference/');
    expect(link?.textContent).toBe('Full reference');
    expect(TestBed.inject(Title).getTitle()).toBe('Fixture · Hawiyah');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Fixture is a test page.');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/en\/components\/fixture\/$/);
  });
});

describe('component page texts', () => {
  it('have the same keys and Arabic values in Arabic script', () => {
    expect(Object.keys(componentPageTexts.ar).sort()).toEqual(Object.keys(componentPageTexts.en).sort());
    for (const key of ['onThisPage', 'fullReference', 'sideNavLabel', 'close'] as const) {
      expect(ARABIC_SCRIPT.test(componentPageTexts.ar[key]), key).toBe(true);
      expect(componentPageTexts.en[key].trim()).not.toBe('');
    }
    expect(componentPageTexts.ar.referenceTitle('زر')).toBe('مرجع زر · هوية');
    expect(componentPageTexts.en.briefTitle('Button')).toBe('Button · Hawiyah');
  });
});
