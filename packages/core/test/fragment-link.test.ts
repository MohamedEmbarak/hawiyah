import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFragmentLink, getFragmentHref, getFragmentId } from '../src/fragment-link.js';

const setBase = (href?: string) => {
  document.head.querySelector('base')?.remove();
  if (href) { const base = document.createElement('base'); base.setAttribute('href', href); document.head.append(base); }
};
const visit = (path: string) => window.history.replaceState(null, '', path);
afterEach(() => { setBase(); visit('/'); document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('getFragmentHref', () => {
  it('keeps the bare fragment when nothing is known about the document', () => {
    expect(getFragmentHref('main')).toBe('#main');
    expect(getFragmentHref('main', null, 'https://example.test/app/')).toBe('#main');
    expect(getFragmentHref('قسم 1')).toBe('#%D9%82%D8%B3%D9%85%201');
  });

  it('keeps the bare fragment when the base is the page itself', () => {
    expect(getFragmentHref('main', 'https://example.test/a/b?x=1#old', 'https://example.test/a/b?x=1')).toBe('#main');
    expect(getFragmentHref('main', 'https://example.test/a/b', null)).toBe('#main');
  });

  it('names the current page when a base on the same origin would redirect the fragment', () => {
    expect(getFragmentHref('main-content', 'https://example.test/hawiyah/components/button', 'https://example.test/hawiyah/')).toBe('/hawiyah/components/button#main-content');
    expect(getFragmentHref('main', 'https://example.test/components/button?tab=api#usage', 'https://example.test/')).toBe('/components/button?tab=api#main');
    expect(getFragmentHref('main', 'https://example.test', 'https://example.test/app/')).toBe('/#main');
  });

  it('uses the absolute URL when the base is on another origin', () => {
    expect(getFragmentHref('main', 'https://example.test/docs/page', 'https://cdn.example.net/assets/')).toBe('https://example.test/docs/page#main');
  });
});

describe('getFragmentId', () => {
  it('reads and decodes the fragment', () => {
    expect(getFragmentId('#main')).toBe('main');
    expect(getFragmentId('/a/b?x=1#%D9%82%D8%B3%D9%85')).toBe('قسم');
    expect(getFragmentId('#100%')).toBe('100%');
    expect(getFragmentId('/a/b')).toBe('');
    expect(getFragmentId(null)).toBe('');
  });
});

describe('bindFragmentLink', () => {
  const page = () => {
    document.body.innerHTML = '<a class="hw-skip-link" href="#main-content">Skip</a><main id="main-content"></main>';
    const link = document.querySelector('a')!; const main = document.querySelector('main')!;
    main.scrollIntoView = vi.fn();
    return { link, main };
  };

  it('leaves the server markup alone until the reader interacts', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { link } = page();
    expect(new URL(link.href).pathname).toBe('/hawiyah/');
    const bound = bindFragmentLink(link);
    expect(link.getAttribute('href')).toBe('#main-content');
    link.dispatchEvent(new FocusEvent('focus'));
    expect(link.getAttribute('href')).toBe('/hawiyah/components/button#main-content');
    expect(new URL(link.href).pathname).toBe('/hawiyah/components/button');
    bound.destroy();
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('follows client-side route changes and every way of opening the link', () => {
    visit('/components/button'); setBase('/');
    const { link } = page();
    const bound = bindFragmentLink(link);
    for (const [type, path] of [['pointerenter', '/components/button'], ['pointerdown', '/components/tabs'], ['contextmenu', '/docs/vue?x=1'], ['auxclick', '/docs/react']] as const) {
      visit(path);
      link.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: type === 'auxclick' ? 1 : 0 }));
      expect(link.getAttribute('href')).toBe(`${path}#main-content`);
    }
    bound.destroy();
  });

  it('does not rewrite the href when there is no differing base', () => {
    visit('/components/button');
    const { link } = page();
    const bound = bindFragmentLink(link);
    link.dispatchEvent(new FocusEvent('focus'));
    expect(link.getAttribute('href')).toBe('#main-content');
    bound.destroy();
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('moves focus to the target on a plain activation without touching the URL', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { link, main } = page();
    const bound = bindFragmentLink(link);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(main.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(window.location.pathname + window.location.hash).toBe('/hawiyah/components/button');
    main.dispatchEvent(new FocusEvent('blur'));
    expect(main.hasAttribute('tabindex')).toBe(false);
    bound.destroy();
  });

  it('leaves modified clicks, other targets and missing targets to the browser, with a correct href', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { link, main } = page();
    const bound = bindFragmentLink(link);
    // Record what the helper decided, then stop jsdom from attempting the navigation.
    const left: boolean[] = [];
    const record = (event: Event) => { left.push(!event.defaultPrevented); event.preventDefault(); };
    document.addEventListener('click', record);
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    link.dispatchEvent(modified);
    expect(link.getAttribute('href')).toBe('/hawiyah/components/button#main-content');
    expect(document.activeElement).not.toBe(main);
    link.target = '_blank';
    const blank = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(blank);
    link.removeAttribute('target'); main.remove();
    const missing = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(missing);
    document.removeEventListener('click', record);
    expect(left).toEqual([true, true, true]);
    expect(bound.activate()).toBe(false);
    bound.destroy();
  });

  it('hands scrolling to the caller and writes the fragment only on request', () => {
    visit('/hawiyah/docs/page?x=1'); setBase('/hawiyah/');
    document.body.innerHTML = '<nav><a href="#%D9%82%D8%B3%D9%85" data-hw-section="قسم">Section</a></nav><h2 id="قسم">Section</h2>';
    const link = document.querySelector('a')!;
    const navigate = vi.fn();
    const bound = bindFragmentLink(link, { navigate, updateHash: true });
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(navigate).toHaveBeenCalledWith('قسم', document.getElementById('قسم'));
    expect(document.activeElement).not.toBe(document.getElementById('قسم'));
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/hawiyah/docs/page?x=1#%D9%82%D8%B3%D9%85');
    bound.destroy();
    const declined = bindFragmentLink(link, { navigate: () => false });
    let left = false;
    const record = (event: Event) => { left = !event.defaultPrevented; event.preventDefault(); };
    document.addEventListener('click', record);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    document.removeEventListener('click', record);
    expect(left).toBe(true);
    declined.destroy();
  });

  it('keeps an href the owning framework rendered after the last refresh', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { link } = page();
    const bound = bindFragmentLink(link);
    link.dispatchEvent(new FocusEvent('focus'));
    link.setAttribute('href', '#other');
    bound.destroy();
    expect(link.getAttribute('href')).toBe('#other');
    link.dispatchEvent(new FocusEvent('focus'));
    expect(link.getAttribute('href')).toBe('#other');
  });

  it('is inert on a server DOM without a window', () => {
    const link = { ownerDocument: { defaultView: null }, getAttribute: () => '#main' } as unknown as HTMLAnchorElement;
    const bound = bindFragmentLink(link);
    expect(bound.activate()).toBe(false);
    expect(() => { bound.refresh(); bound.destroy(); bound.destroy(); }).not.toThrow();
  });
});
