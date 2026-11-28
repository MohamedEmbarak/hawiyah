import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, page } from './fixtures/page';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const click = (element: Element, type = 'click') => { const event = new MouseEvent(type, { bubbles: true, cancelable: true }); element.dispatchEvent(event); return event; };

// The Angular side of tests/button-parity.test.ts and tests/link-parity.test.ts: the same case ids and assertions on the DOM.
describe('button[hwButton]', () => {
  it('[BUTTON-01][actions-6] a button without type inside a form has type=button and does not submit; type="submit" submits', () => {
    const { root, state } = page(`<form (submit)="submitted = submitted + 1; $event.preventDefault()"><button hwButton id="plain">Save draft</button><button hwButton id="submit" type="submit">Send</button><button hwButton id="reset" [type]="kind">Reset</button></form>`, { submitted: 0, kind: 'reset' });
    const button = (id: string) => root.querySelector<HTMLButtonElement>(`#${id}`)!;
    expect(attributesOf(button('plain'))).toEqual({ class: 'hw-button', 'data-size': 'md', 'data-variant': 'primary', hwbutton: '', id: 'plain', type: 'button' });
    expect(button('submit').type).toBe('submit'); expect(button('reset').type).toBe('reset');
    button('plain').click(); expect(state.submitted).toBe(0);
    button('submit').click(); expect(state.submitted).toBe(1);
  });

  it('[BUTTON-02] loading: disabled and aria-busy=true, no click and no submit; clearing loading removes both', () => {
    const { root, state, update } = page(`<form (submit)="submitted = submitted + 1; $event.preventDefault()"><button hwButton type="submit" [loading]="loading" (click)="clicked = clicked + 1">Send</button></form>`, { loading: true, submitted: 0, clicked: 0 });
    const button = root.querySelector<HTMLButtonElement>('button')!;
    expect(button.disabled).toBe(true); expect(button.getAttribute('aria-busy')).toBe('true'); expect(button.textContent).toBe('Send');
    button.click(); expect(state.clicked).toBe(0); expect(state.submitted).toBe(0);
    update({ loading: false }); expect(button.hasAttribute('disabled')).toBe(false); expect(button.hasAttribute('aria-busy')).toBe(false);
    button.click(); expect(state.clicked).toBe(1); expect(state.submitted).toBe(1);
  });
});

describe('a[hwLink]', () => {
  it('[LINK-01][actions-7] the attributes of the anchor stay on a.hw-link; variant, current and external are written on it', () => {
    const { root, update } = page(`<a hwLink id="plain" class="mine" href="/guide" aria-label="Guide" hreflang="ar" download>Guide</a><a hwLink id="variant" href="/x" variant="neutral" current>Here</a>
      <a hwLink id="external" href="https://example.org/" rel="author" [external]="external">Out</a><a hwLink id="bare" href="https://example.org/" external>Out</a>`, { external: true });
    const link = (id: string) => root.querySelector<HTMLAnchorElement>(`#${id}`)!;
    expect(attributesOf(link('plain'))).toEqual({ 'aria-label': 'Guide', class: 'hw-link mine', download: '', href: '/guide', hreflang: 'ar', hwlink: '', id: 'plain' });
    expect(attributesOf(link('variant'))).toEqual({ 'aria-current': 'page', class: 'hw-link', current: '', 'data-variant': 'neutral', href: '/x', hwlink: '', id: 'variant', variant: 'neutral' });
    expect(link('external').target).toBe('_blank'); expect(link('external').rel).toBe('author noopener noreferrer'); expect(link('bare').rel).toBe('noopener noreferrer');
    update({ external: false }); expect(link('external').hasAttribute('target')).toBe(false); expect(link('external').rel).toBe('author');
    expect(root.querySelector('hw-link')).toBeNull();
  });

  it('[LINK-02] disabled: no href, role=link, aria-disabled=true, tabindex=-1; click and auxclick are cancelled and no listener of the application runs; enabling restores the href', () => {
    const { root, state, update } = page(`<a hwLink id="link" [href]="href" [disabled]="disabled" (click)="clicks = clicks + 1" (auxclick)="clicks = clicks + 1"><span>Next</span></a><a hwLink id="static" href="/static" disabled>Static</a>`, { href: '/next', disabled: true, clicks: 0 });
    const link = root.querySelector<HTMLAnchorElement>('#link')!, fixed = root.querySelector<HTMLAnchorElement>('#static')!;
    for (const anchor of [link, fixed]) { expect(anchor.hasAttribute('href')).toBe(false); expect(anchor.getAttribute('role')).toBe('link'); expect(anchor.getAttribute('aria-disabled')).toBe('true'); expect(anchor.getAttribute('tabindex')).toBe('-1'); }
    const outside: Event[] = []; link.addEventListener('click', event => outside.push(event));
    for (const target of [link, link.querySelector('span')!]) for (const type of ['click', 'auxclick']) expect(click(target, type).defaultPrevented, type).toBe(true);
    expect(state.clicks).toBe(0); expect(outside).toEqual([]);
    // An href the application changes while the link is disabled is the one that comes back.
    update({ href: '/later' }); expect(link.hasAttribute('href')).toBe(false);
    update({ disabled: false });
    expect(link.getAttribute('href')).toBe('/later'); for (const name of ['role', 'aria-disabled', 'tabindex']) expect(link.hasAttribute(name), name).toBe(false);
    const event = click(link); expect(event.defaultPrevented).toBe(false); expect(state.clicks).toBe(1); expect(outside).toHaveLength(1);
    update({ disabled: true }); expect(link.hasAttribute('href')).toBe(false); update({ disabled: false }); expect(link.getAttribute('href')).toBe('/later');
  });
});
