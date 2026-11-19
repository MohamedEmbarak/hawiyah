import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { LocaleService } from '../../core/locale';
import { fixtureData } from './page-fixture';
import { feature } from './feature';
import { ReferencePage, navigationItems } from './reference-page';

describe('ReferencePage', () => {
  async function render() {
    TestBed.configureTestingModule({ providers: [{ provide: ActivatedRoute, useValue: { data: of({ page: fixtureData('reference') }) } }] });
    TestBed.inject(LocaleService).lang.set('en');
    const fixture = TestBed.createComponent(ReferencePage);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders every section with its h2 id and tabindex -1', async () => {
    const root = await render();
    const article = root.querySelector('article.hw-prose');
    const h2 = Array.from(article?.querySelectorAll(':scope > h2') ?? []);
    expect(h2.map((heading) => heading.id)).toEqual(['example', 'variants-and-states', 'api']);
    expect(h2.every((heading) => heading.getAttribute('tabindex') === '-1')).toBe(true);
    expect(article?.querySelector('h3#sizes')?.getAttribute('tabindex')).toBe('-1');
    expect(article?.textContent).toContain('Reference.');
  });

  it('renders the content navigation after the summary, named On this page', async () => {
    const root = await render();
    const navigation = root.querySelector('hw-content-navigation');
    // A block of the prose flow: its wrapper follows the summary paragraph.
    expect(navigation?.parentElement?.classList.contains('toc')).toBe(true);
    expect(navigation?.parentElement?.previousElementSibling?.tagName).toBe('P');
    expect(root.querySelector('nav[aria-label="On this page"], [aria-label="On this page"]')).not.toBeNull();
    const hrefs = Array.from(navigation?.querySelectorAll('a') ?? []).map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['#example', '#variants-and-states', '#sizes', '#api']);
  });

  it('shows every live group as a page block named by its heading', async () => {
    const root = await render();
    const blocks = Array.from(root.querySelectorAll('guide-example-block section.example'));
    expect(blocks.map((block) => block.getAttribute('aria-labelledby'))).toEqual(['example', 'sizes']);
    expect(TestBed.inject(Title).getTitle()).toBe('Fixture reference · Hawiyah');
  });
});

describe('component pages feature', () => {
  it('builds the content navigation from h2 and h3', () => {
    expect(
      navigationItems([
        { id: 'a', level: 2, text: 'A' },
        { id: 'b', level: 3, text: 'B' },
        { id: 'c', level: 4, text: 'C' },
        { id: 'd', level: 2, text: 'D' },
      ]),
    ).toEqual([
      { id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] },
      { id: 'd', label: 'D' },
    ]);
  });

  it('registers the brief and reference routes and prerenders every language of every page', async () => {
    expect(feature.id).toBe('component-pages');
    expect(feature.nav).toBeUndefined();
    const [route] = feature.routes;
    expect(route?.path).toBe('components/:id');
    expect(route?.children?.map((child) => child.path)).toEqual(['', 'reference']);
    const server = feature.serverRoutes(['ar', 'en']);
    expect(server.map((entry) => entry.path)).toEqual(['components/:id', 'components/:id/reference']);
    const params = await (server[0] as { getPrerenderParams?: () => Promise<Record<string, string>[]> }).getPrerenderParams?.();
    expect(params).toContainEqual({ lang: 'ar', id: 'button' });
    expect(params).toContainEqual({ lang: 'en', id: 'button' });
  });
});
