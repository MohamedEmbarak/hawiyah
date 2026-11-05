import { expect, test } from 'vitest';
import { renderDgaTemplates } from '../apps/playground/src/dga-templates';

for (const locale of ['ar', 'en'] as const) test(`participation exposes eight topics with usable actions in ${locale}`, () => {
  const root = document.createElement('div');
  root.innerHTML = renderDgaTemplates('templates/participation', locale)!;
  const cards = root.querySelectorAll('[data-participation-topics] > section');
  expect(cards).toHaveLength(8);
  for (const card of cards) {
    expect(card.querySelector('h2')?.textContent?.trim()).toBeTruthy();
    expect(card.querySelector('a.nq-button')?.getAttribute('href')).toMatch(/^#templates\//);
  }
});

for (const locale of ['ar', 'en'] as const) test(`sitemap includes every registered destination in ${locale}`, () => {
  const gallery = document.createElement('div');
  gallery.innerHTML = renderDgaTemplates('templates', locale)!;
  const sitemap = document.createElement('div');
  sitemap.innerHTML = renderDgaTemplates('templates/sitemap', locale)!;
  const links = (root: HTMLElement) => new Set(Array.from(root.querySelectorAll<HTMLAnchorElement>('.nq-template-content a[href^="#templates/"]'), link => link.getAttribute('href')));
  const expected = links(gallery);
  expected.delete('#templates/sitemap');
  expect(links(sitemap)).toEqual(expected);
  expect(sitemap.querySelector('a[href="#templates/home"]')).not.toBeNull();
  expect(sitemap.querySelector('a[href="#templates/search"]')).not.toBeNull();
});
