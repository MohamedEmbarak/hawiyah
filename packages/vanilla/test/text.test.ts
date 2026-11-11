import { resetTextWarnings } from '@hawiyah/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCarousel, createContentNavigation, createDatePicker, createPagination, createPortalHeader, createSkipLink, createStepper, enhance } from '../src/index.js';

const mount = (html: string) => { document.body.insertAdjacentHTML('beforeend', html); return document.body.lastElementChild as HTMLElement; };
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { warn.mockRestore(); document.head.querySelectorAll('base').forEach(base => base.remove()); document.body.replaceChildren(); });
const warnings = (name: string) => warn.mock.calls.filter(([message]) => String(message).includes(`"${name}"`)).length;

describe('text is supplied by the application', () => {
  it('renders nothing for a missing required text and warns once in development', () => {
    const first = mount('<ol class="hw-stepper"><li class="hw-step" aria-current="step"><span>البيانات</span></li></ol>') as HTMLOListElement;
    const second = mount('<ol class="hw-stepper"><li class="hw-step" aria-current="step"><span>البيانات</span></li></ol>') as HTMLOListElement;
    const a = createStepper(first); const b = createStepper(second);
    expect(first.hasAttribute('aria-label')).toBe(false); expect(second.hasAttribute('aria-label')).toBe(false);
    expect(warnings('label')).toBe(1); expect(String(warn.mock.calls[0]![0])).toMatch(/^Hawiyah: Stepper requires "label"/);
    a.destroy(); b.destroy();
    const pagination = mount('<nav aria-label="الصفحات" data-hw-total="3"><div data-hw-pagination-items></div></nav>');
    const controller = createPagination(pagination, { jumpLabel: 'Go to page', goLabel: 'Go', getGapLabel: (start, end) => `Pages ${start} to ${end}` });
    const buttons = [...pagination.querySelectorAll('[data-hw-page]')];
    expect(buttons.length).toBe(3); expect(buttons.every(button => !button.hasAttribute('aria-label'))).toBe(true);
    expect(buttons.map(button => button.textContent)).toEqual(['1', '2', '3']);
    expect(warnings('getPageLabel')).toBe(1);
    controller.destroy();
  });

  it('does not warn when the text comes from markup, the root attribute or the option', () => {
    const named = mount('<ol class="hw-stepper" aria-label="التقدم"><li class="hw-step"><span>أ</span></li></ol>') as HTMLOListElement;
    const attribute = mount('<ol class="hw-stepper" data-hw-label="Progress"><li class="hw-step"><span>A</span></li></ol>') as HTMLOListElement;
    const option = mount('<ol class="hw-stepper" data-hw-label="ignored"><li class="hw-step"><span>A</span></li></ol>') as HTMLOListElement;
    const controllers = [createStepper(named), createStepper(attribute), createStepper(option, { label: 'Steps' })];
    expect(named.getAttribute('aria-label')).toBe('التقدم'); expect(attribute.getAttribute('aria-label')).toBe('Progress'); expect(option.getAttribute('aria-label')).toBe('Steps');
    expect(warn).not.toHaveBeenCalled();
    controllers.forEach(controller => controller.destroy());
  });

  it('passes the documented arguments to templated texts and fills template attributes', () => {
    const getPageLabel = vi.fn((page: number) => `Page ${page}`);
    const getGapLabel = vi.fn((start: number, end: number) => `Pages ${start} to ${end}`);
    const pagination = mount('<nav aria-label="Pages" data-hw-total="20" data-hw-current="10"><div data-hw-pagination-items></div></nav>');
    const controller = createPagination(pagination, { getPageLabel, getGapLabel, jumpLabel: 'Go to page', goLabel: 'Go' });
    expect(getPageLabel).toHaveBeenCalledWith(10); expect(pagination.querySelector('[data-hw-page="10"]')!.getAttribute('aria-label')).toBe('Page 10');
    const [start, end] = getGapLabel.mock.calls[0]!; expect(typeof start).toBe('number'); expect(end).toBeGreaterThanOrEqual(start!);
    expect(pagination.querySelector('summary')!.getAttribute('aria-label')).toBe(`Pages ${start} to ${end}`);
    controller.destroy();
    const templated = mount('<nav aria-label="Pages" data-hw-total="3" data-hw-page-label="الصفحة {page}" data-hw-gap-label="{start}–{end}" data-hw-jump-label="Page" data-hw-go-label="Go"><div data-hw-pagination-items></div></nav>');
    const fromMarkup = createPagination(templated);
    expect(templated.querySelector('[data-hw-page="2"]')!.getAttribute('aria-label')).toBe('الصفحة 2');
    fromMarkup.destroy();
    const getSlideLabel = vi.fn((position: number, total: number) => `${position} of ${total}`);
    const carousel = mount('<section aria-label="Featured" data-hw-empty-label="No slides"><div><article data-hw-slide>One</article><article data-hw-slide hidden>Two</article></div><button data-hw-previous>Previous</button><span data-hw-carousel-status></span><button data-hw-next>Next</button></section>');
    const slides = createCarousel(carousel, { getSlideLabel });
    expect(getSlideLabel).toHaveBeenCalledWith(1, 2); expect(getSlideLabel).toHaveBeenCalledWith(2, 2); expect(getSlideLabel).not.toHaveBeenCalledWith(0, 2);
    expect(carousel.querySelector('[data-hw-carousel-status]')!.textContent).toBe('1 of 2');
    expect(carousel.hasAttribute('aria-roledescription')).toBe(false); expect(warn).not.toHaveBeenCalled();
    slides.destroy();
  });
});

describe('portal brand', () => {
  const header = (brand: string, attributes = '') => mount(`<header class="hw-portal-header" data-hw="portal-header"${attributes}><a class="hw-portal-brand" href="/">${brand}</a><button type="button" data-hw-portal-toggle aria-label="Menu"></button><nav data-hw-portal-navigation aria-label="Main"><a href="#a">A</a></nav></header>`);

  it('accepts artwork alone and names it from brandLabel', () => {
    const root = header('<svg aria-hidden="true" viewBox="0 0 1 1"></svg>');
    const controller = createPortalHeader(root, { brandLabel: 'هوية — الصفحة الرئيسية' });
    const brand = root.querySelector('.hw-portal-brand')!;
    expect(brand.textContent).toBe(''); expect(brand.getAttribute('aria-label')).toBe('هوية — الصفحة الرئيسية'); expect(warn).not.toHaveBeenCalled();
    controller.destroy(); expect(brand.hasAttribute('aria-label')).toBe(false);
    const fromAttribute = createPortalHeader(header('<img src="data:," alt="">', ' data-hw-brand-label="Hawiyah home"'));
    expect(document.querySelectorAll('.hw-portal-brand')[1]!.getAttribute('aria-label')).toBe('Hawiyah home');
    fromAttribute.destroy();
  });

  it('adds nothing to a brand with visible text and warns for unnamed artwork', () => {
    const text = createPortalHeader(header('هوية'));
    expect(document.querySelector('.hw-portal-brand')!.hasAttribute('aria-label')).toBe(false); expect(warn).not.toHaveBeenCalled();
    text.destroy();
    const artwork = createPortalHeader(header('<img src="data:," alt="">'));
    expect(document.querySelectorAll('.hw-portal-brand')[1]!.hasAttribute('aria-label')).toBe(false); expect(warnings('brandLabel')).toBe(1);
    artwork.destroy();
  });
});

describe('fragment links', () => {
  it('keeps "#id" on first render and resolves it under a base URL on interaction', () => {
    const base = document.createElement('base'); base.href = 'https://example.test/assets/'; document.head.append(base);
    const link = mount('<a class="hw-skip-link" data-hw="skip-link" href="#main">Skip to content</a>') as HTMLAnchorElement;
    const main = mount('<main id="main">Content</main>');
    const skip = createSkipLink(link);
    expect(link.getAttribute('href')).toBe('#main');
    link.dispatchEvent(new Event('focus'));
    const resolved = link.getAttribute('href')!;
    expect(resolved.endsWith('#main')).toBe(true); expect(resolved).not.toBe('#main');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }); link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true); expect(document.activeElement).toBe(main);
    skip.destroy();
    const navigation = mount('<nav aria-label="On this page"><a href="#main">Content</a></nav>');
    const contents = createContentNavigation(navigation);
    expect(navigation.querySelector('a')!.getAttribute('href')).toBe('#main');
    contents.destroy();
  });

  it('binds a skip link once when both the header and enhance() own it, and warns for missing text', () => {
    const root = mount('<header class="hw-portal-header" data-hw="portal-header" data-hw-menu-label="Menu" data-hw-navigation-label="Main"><a class="hw-skip-link" data-hw="skip-link" href="#main">Skip</a><span class="hw-portal-brand">هوية</span><button type="button" data-hw-portal-toggle></button><nav data-hw-portal-navigation><a href="#a">A</a></nav></header>');
    const main = mount('<main id="main">Content</main>');
    const focus = vi.spyOn(main, 'focus');
    const release = enhance(document.body);
    root.querySelector<HTMLAnchorElement>('.hw-skip-link')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    expect(focus).toHaveBeenCalledTimes(1);
    expect(root.querySelector('[data-hw-portal-toggle]')!.getAttribute('aria-label')).toBe('Menu'); expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Main');
    release(); expect(warn).not.toHaveBeenCalled();
    const empty = mount('<a class="hw-skip-link" href="#main"></a>') as HTMLAnchorElement;
    createSkipLink(empty).destroy(); expect(warnings('skipLabel')).toBe(1); expect(empty.textContent).toBe('');
  });

  it('reports a missing date-picker calendarLabel once, not again as the nested calendar label', () => {
    const root = mount('<div data-hw="date-picker" data-hw-locale="en"><input type="date" data-hw-date-input aria-label="Date"><button type="button" data-hw-date-trigger></button><dialog data-hw-date-dialog><div data-hw-date-calendar></div></dialog></div>');
    const controller = createDatePicker(root);
    expect(warnings('calendarLabel')).toBe(1); expect(warnings('label')).toBe(0);
    expect(root.querySelector('dialog')!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector('[data-hw-date-calendar]')!.hasAttribute('aria-label')).toBe(false);
    controller.destroy();
  });
});
