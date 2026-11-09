import { expect, test } from 'vitest';
import { renderHome } from '../apps/playground/src/discovery-templates';
import { renderDgaTemplates } from '../apps/playground/src/dga-templates';
import { cardActionMarkup } from '../apps/playground/src/card-action-demo';

for (const locale of ['ar', 'en'] as const) {
  test(`home variants prioritize the intended content in ${locale}`, () => {
    const host = document.createElement('div');
    host.innerHTML = renderHome(locale);
    expect(host.querySelector('section:nth-of-type(2)')?.getAttribute('aria-labelledby')).toBe('hw-home-services');
    host.innerHTML = renderHome(locale, 'information');
    expect(host.querySelector('section:nth-of-type(2)')?.getAttribute('aria-labelledby')).toBe('hw-home-news');
    expect(host.querySelectorAll('#hw-home-news')).toHaveLength(1);
    expect(host.querySelectorAll('#hw-home-services')).toHaveLength(1);
    expect(renderDgaTemplates('templates/home-information', locale)).toContain('data-dga-template="home-information"');
  });
  test(`action card contains one real CTA without nested interactions in ${locale}`, () => {
    const host = document.createElement('div'); host.innerHTML = cardActionMarkup(locale, 'vanilla');
    const action = host.querySelector<HTMLAnchorElement>('.hw-card a.hw-button');
    expect(action?.getAttribute('href')).toBe('#card-details');
    expect(action?.textContent?.trim()).toBeTruthy();
    expect(host.querySelector('a a, a button, button a')).toBeNull();
    expect(host.querySelector('#card-details')).not.toBeNull();
  });
}
