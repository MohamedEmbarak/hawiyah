import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindLinkNavigation, isLinkNavigationHandled, type LinkNavigation, type LinkNavigationTarget } from '../src/link-navigation.js';
import { bindFragmentLink } from '../src/fragment-link.js';

const bindings: LinkNavigation[] = [];
const setBase = (href?: string, target?: string) => {
  document.head.querySelector('base')?.remove();
  if (href === undefined && target === undefined) return;
  const base = document.createElement('base'); if (href !== undefined) base.setAttribute('href', href); if (target) base.setAttribute('target', target); document.head.append(base);
};
const visit = (path: string) => window.history.replaceState(null, '', path);
afterEach(() => { for (const binding of bindings.splice(0)) binding.destroy(); setBase(); visit('/'); document.body.replaceChildren(); vi.restoreAllMocks(); });

/** jsdom reports "navigation not implemented" for an unprevented link click; a last listener cancels it after recording the outcome. */
function click(element: Element, init: MouseEventInit = {}) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  let prevented = false;
  const last = (received: Event) => { if (received === event) { prevented = received.defaultPrevented; received.preventDefault(); } };
  window.addEventListener('click', last); element.dispatchEvent(event); window.removeEventListener('click', last);
  return { event, prevented };
}
function setup(html: string, options: { base?: string; result?: boolean | void; root?: () => Document | HTMLElement } = {}) {
  document.body.innerHTML = html;
  const navigate = vi.fn((_target: LinkNavigationTarget): boolean | void => options.result);
  const binding = bindLinkNavigation(options.root?.() ?? document, { navigate, base: options.base }); bindings.push(binding);
  return { navigate, binding, link: document.querySelector('a')! };
}
const origin = () => window.location.origin;

describe('bindLinkNavigation', () => {
  it('hands a plain primary activation of a same-origin link to the application and prevents the default', () => {
    const { navigate, link } = setup('<nav><a class="hw-navigation-drawer-row" href="/components/select?tab=api#usage"><span>Select</span></a></nav>');
    const { event, prevented } = click(link.querySelector('span')!);
    expect(navigate).toHaveBeenCalledTimes(1);
    const target = navigate.mock.calls[0]![0];
    expect(target.path).toBe('/components/select?tab=api#usage'); expect(target.url.href).toBe(`${origin()}/components/select?tab=api#usage`); expect(target.link).toBe(link); expect(target.event).toBe(event);
    expect(prevented).toBe(true); expect(isLinkNavigationHandled(event)).toBe(true);
  });
  it('handles a click whose target is a text node inside the link', () => {
    const { navigate, link } = setup('<a href="/about">About</a>');
    expect(click(link.firstChild as unknown as Element).prevented).toBe(true); expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('leaves the click to the browser when navigate returns false', () => {
    const { navigate, link } = setup('<a href="/about">About</a>', { result: false });
    const { event, prevented } = click(link);
    expect(navigate).toHaveBeenCalledTimes(1); expect(prevented).toBe(false); expect(isLinkNavigationHandled(event)).toBe(false);
  });
  it('does not prevent the default when navigate throws', () => {
    document.body.innerHTML = '<a href="/about">About</a>';
    bindings.push(bindLinkNavigation(document.body, { navigate: () => { throw new Error('router'); } }));
    const event = new MouseEvent('click', { bubbles: true, cancelable: true }); const errors: unknown[] = [];
    const report = (error: ErrorEvent) => { errors.push(error.error); error.preventDefault(); };
    const cancel = (received: Event) => received.preventDefault();
    window.addEventListener('error', report); let prevented = true;
    document.addEventListener('click', received => { prevented = received.defaultPrevented; cancel(received); }, { once: true });
    document.querySelector('a')!.dispatchEvent(event); window.removeEventListener('error', report);
    expect(prevented).toBe(false); expect(isLinkNavigationHandled(event)).toBe(false); expect(errors).toHaveLength(1);
  });
  it.each([
    ['ctrl', { ctrlKey: true }], ['meta', { metaKey: true }], ['shift', { shiftKey: true }], ['alt', { altKey: true }], ['middle button', { button: 1 }], ['secondary button', { button: 2 }],
  ] as const)('passes a modified click through: %s', (_name, init) => {
    const { navigate, link } = setup('<a href="/about">About</a>');
    const { event, prevented } = click(link, init);
    expect(navigate).not.toHaveBeenCalled(); expect(prevented).toBe(false); expect(isLinkNavigationHandled(event)).toBe(false);
  });
  it('leaves a click that a component or an application guard already prevented', () => {
    const { navigate, link } = setup('<a href="/about">About</a>');
    link.addEventListener('click', event => event.preventDefault());
    const { event } = click(link);
    expect(navigate).not.toHaveBeenCalled(); expect(isLinkNavigationHandled(event)).toBe(false);
  });
  it.each([
    ['target="_blank"', '<a href="/about" target="_blank">x</a>'],
    ['a named target', '<a href="/about" target="preview">x</a>'],
    ['download', '<a href="/files/form.pdf" download>x</a>'],
    ['rel="external"', '<a href="/about" rel="noopener EXTERNAL">x</a>'],
    ['aria-disabled', '<a href="/about" aria-disabled="true">x</a>'],
    ['an aria-disabled ancestor', '<span aria-disabled="true"><a href="/about">x</a></span>'],
    ['an inert ancestor', '<div inert><a href="/about">x</a></div>'],
    ['another origin', '<a href="https://example.org/about">x</a>'],
    ['another scheme on the same host', `<a href="${'http://localhost:3000'.replace('http:', 'https:')}/about">x</a>`],
    ['mailto', '<a href="mailto:desk@example.test">x</a>'],
    ['an anchor without href', '<a>x</a>'],
  ])('leaves a link with %s to the browser', (_name, html) => {
    const { navigate, link } = setup(html);
    const { event, prevented } = click(link);
    expect(navigate).not.toHaveBeenCalled(); expect(prevented).toBe(false); expect(isLinkNavigationHandled(event)).toBe(false);
  });
  it('accepts target="_self" and honours a target on the document base', () => {
    const own = setup('<a href="/about" target="_SELF">x</a>'); click(own.link); expect(own.navigate).toHaveBeenCalledTimes(1); own.binding.destroy();
    setBase(undefined, '_blank');
    const inherited = setup('<a href="/about">x</a>'); click(inherited.link); expect(inherited.navigate).not.toHaveBeenCalled(); inherited.binding.destroy();
    const overridden = setup('<a href="/about" target="_self">x</a>'); click(overridden.link); expect(overridden.navigate).toHaveBeenCalledTimes(1);
  });
  it('leaves SVG anchors alone', () => {
    const { navigate } = setup('<svg><a href="/about"><text>x</text></a></svg>');
    click(document.querySelector('text')!); expect(navigate).not.toHaveBeenCalled();
  });
  it('leaves fragment links of the current document to bindFragmentLink and the browser', () => {
    visit('/components/button?tab=api');
    const { navigate } = setup('<a id="bare" href="#usage">x</a><a id="full" href="/components/button?tab=api#usage">x</a><a id="top" href="#">x</a><a id="same" href="/components/button?tab=api">x</a><a id="other" href="/components/button#usage">x</a><section id="usage"></section>');
    for (const id of ['bare', 'full', 'top']) expect(click(document.getElementById(id)!).prevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    // The same document without a fragment, and another document with one, are navigations.
    click(document.getElementById('same')!); click(document.getElementById('other')!);
    expect(navigate.mock.calls.map(call => call[0].path)).toEqual(['/components/button?tab=api', '/components/button#usage']);
  });
  it('lets a packaged in-page link keep working under a base href', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { navigate, link } = setup('<a class="hw-skip-link" href="#main">Skip</a><main id="main"></main>');
    const target = document.getElementById('main')!; target.scrollIntoView = vi.fn();
    const fragment = bindFragmentLink(link);
    click(link);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1); expect(document.activeElement).toBe(target); expect(navigate).not.toHaveBeenCalled();
    // Without a target the browser keeps the click: the href now names the current document.
    target.remove(); const { prevented } = click(link);
    expect(link.getAttribute('href')).toBe('/hawiyah/components/button#main'); expect(prevented).toBe(false); expect(navigate).not.toHaveBeenCalled();
    fragment.destroy();
  });
  it('reports the path relative to a same-origin base href and leaves links outside it', () => {
    visit('/hawiyah/components/button'); setBase('/hawiyah/');
    const { navigate } = setup('<a id="relative" href="components/select?x=1#api">x</a><a id="absolute" href="/hawiyah/brand">x</a><a id="root" href="/hawiyah/">x</a><a id="bare" href="/hawiyah">x</a><a id="outside" href="/other/page">x</a><a id="prefix" href="/hawiyah-next/page">x</a>');
    for (const id of ['relative', 'absolute', 'root', 'bare']) expect(click(document.getElementById(id)!).prevented).toBe(true);
    expect(navigate.mock.calls.map(call => call[0].path)).toEqual(['/components/select?x=1#api', '/brand', '/', '/']);
    expect(click(document.getElementById('outside')!).prevented).toBe(false); expect(click(document.getElementById('prefix')!).prevented).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(4);
  });
  it('uses "/" without a base element, with a base on another origin, and the base option when given', () => {
    visit('/docs/guide/page');
    const plain = setup('<a href="/docs/other">x</a>'); click(plain.link); expect(plain.navigate.mock.calls[0]![0].path).toBe('/docs/other'); plain.binding.destroy();
    setBase('https://cdn.example.net/assets/');
    const foreign = setup(`<a href="${origin()}/docs/other">x</a>`); click(foreign.link); expect(foreign.navigate.mock.calls[0]![0].path).toBe('/docs/other'); foreign.binding.destroy(); setBase();
    const option = setup('<a id="in" href="/docs/other?x#y">x</a><a id="out" href="/blog/post">x</a>', { base: 'docs' });
    click(document.getElementById('in')!); click(document.getElementById('out')!);
    expect(option.navigate.mock.calls.map(call => call[0].path)).toEqual(['/other?x#y']);
  });
  it('acts only inside the root the application names', () => {
    const { navigate } = setup('<div id="app"><a id="inside" href="/a">x</a></div><a id="outside" href="/b">x</a><a id="around" href="/c"><span id="inner">x</span></a>', { root: () => document.getElementById('app')! });
    click(document.getElementById('inside')!); click(document.getElementById('outside')!);
    expect(navigate.mock.calls.map(call => call[0].path)).toEqual(['/a']);
    const inner = document.getElementById('inner')!; bindings.push(bindLinkNavigation(inner, { navigate }));
    expect(click(inner).prevented).toBe(false); expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('adds one listener, runs after component handlers, and stops when destroyed', () => {
    document.body.innerHTML = '<nav><a href="/about">x</a></nav>';
    const add = vi.spyOn(document, 'addEventListener'), remove = vi.spyOn(document, 'removeEventListener'); const order: string[] = [];
    const navigation = document.querySelector('nav')!; navigation.addEventListener('click', () => order.push('component'));
    const binding = bindLinkNavigation(document, { navigate: () => { order.push('router'); } });
    expect(add.mock.calls.filter(call => call[0] === 'click')).toHaveLength(1); expect(add).toHaveBeenCalledTimes(1);
    click(document.querySelector('a')!); expect(order).toEqual(['component', 'router']);
    binding.destroy(); binding.destroy(); expect(remove).toHaveBeenCalledTimes(1);
    expect(click(document.querySelector('a')!).prevented).toBe(false); expect(order).toEqual(['component', 'router', 'component']);
  });
  it('lets a nested binding win over an outer one', () => {
    document.body.innerHTML = '<div id="app"><a href="/about">x</a></div>';
    const inner = vi.fn(), outer = vi.fn();
    bindings.push(bindLinkNavigation(document, { navigate: outer }), bindLinkNavigation(document.getElementById('app')!, { navigate: inner }));
    click(document.querySelector('a')!); expect(inner).toHaveBeenCalledTimes(1); expect(outer).not.toHaveBeenCalled();
  });
  it('keeps the navigation drawers closing: their check is "not prevented, or handled here"', async () => {
    // The check every adapter's NavigationDrawer runs after a link activation inside its nav.
    document.body.innerHTML = '<nav><a href="/about">x</a></nav>';
    const close = vi.fn(); const navigation = document.querySelector('nav')!;
    navigation.addEventListener('click', event => queueMicrotask(() => { if (!event.defaultPrevented || isLinkNavigationHandled(event)) close(); }));
    const binding = bindLinkNavigation(document, { navigate: () => {} });
    click(document.querySelector('a')!); await Promise.resolve();
    expect(close).toHaveBeenCalledTimes(1);
    // A click the application prevented itself is still a cancelled navigation.
    binding.destroy(); const cancel = (event: Event) => event.preventDefault(); document.addEventListener('click', cancel);
    click(document.querySelector('a')!); await Promise.resolve(); document.removeEventListener('click', cancel);
    expect(close).toHaveBeenCalledTimes(1); expect(isLinkNavigationHandled(null)).toBe(false);
  });
  it('returns an inert handle without a root or without a browser window', () => {
    const navigate = vi.fn();
    expect(() => bindLinkNavigation(undefined, { navigate }).destroy()).not.toThrow(); expect(() => bindLinkNavigation(null, { navigate }).destroy()).not.toThrow();
    const detached = new DOMParser().parseFromString('<a href="/about">x</a>', 'text/html'); const add = vi.spyOn(detached, 'addEventListener');
    const binding = bindLinkNavigation(detached, { navigate });
    expect(add).not.toHaveBeenCalled(); detached.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); expect(navigate).not.toHaveBeenCalled();
    expect(() => { binding.destroy(); binding.destroy(); }).not.toThrow();
  });
});
