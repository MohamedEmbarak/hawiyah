// Accordion, Collapsible, Carousel and Pagination cases shared by the four adapters
// (milestone 3: disclosure-data-3, disclosure-data-5, disclosure-data-10).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Accordion, Pagination } from '../src/display.js';
import { Carousel, Collapsible } from '../src/expansion-interactive.js';
import { paginationText } from './texts.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); });
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
// The fixture shape shared with React and Angular: [{value, title, content, open}].
const items = [
  { value: 'fees', title: 'Fees', content: 'No fee is charged.', open: true },
  { value: 'time', title: 'Processing time', content: 'Three working days.', open: false },
];
const rich = () => h(Accordion, { items }, {
  title: ({ item }: { item: typeof items[number] }) => [h('span', { class: 'hw-icon', 'data-icon': 'information-circle', 'aria-hidden': 'true' }), item.title, ' ', h('a', { href: `#${item.value}` }, 'Details')],
  content: ({ item, index }: { item: typeof items[number]; index: number }) => [h('p', {}, `${index + 1}. ${item.content}`), h('a', { href: '/guide' }, 'Guide')],
});

it('[RICH-01][disclosure-data-3] rich titles and contents render inside the summary and the content region', () => {
  const host = mount(rich);
  const summary = host.querySelector('details.hw-accordion-item > summary.hw-accordion-trigger')!;
  expect(summary.querySelector('.hw-icon')).not.toBeNull();
  expect(summary.querySelector('a')!.getAttribute('href')).toBe('#fees');
  const content = host.querySelector('details.hw-accordion-item > div.hw-accordion-content')!;
  expect(content.querySelector('p')!.textContent).toBe('1. No fee is charged.');
  expect(content.querySelector('a')!.textContent).toBe('Guide');
});

it('[RICH-02] a click on a link inside the title does not toggle; a click on the title text does', async () => {
  const toggled = vi.fn();
  const host = mount(() => h(Accordion, { items, onToggle: toggled }, { title: ({ item }: { item: typeof items[number] }) => [h('span', { class: 'text' }, item.title), h('a', { href: '#x', onClick: (event: Event) => event.preventDefault() }, 'Link')] }));
  const second = host.querySelectorAll('details')[1]!;
  second.querySelector('a')!.click(); await nextTick();
  expect(second.open).toBe(false); expect(toggled).not.toHaveBeenCalled();
  second.querySelector<HTMLElement>('.text')!.click(); await nextTick();
  expect(second.open).toBe(true); expect(toggled).toHaveBeenCalledWith('time', true);
});

it('[SHAPE-01][SHAPE-02] the shared item shape renders the same text and open state; the notification carries the value', async () => {
  const toggled = vi.fn();
  const host = mount(() => h(Accordion, { items, onToggle: toggled }));
  const details = [...host.querySelectorAll('details')];
  expect(details.map(item => [item.querySelector('summary')!.textContent, item.querySelector('.hw-accordion-content')!.textContent, item.open])).toEqual([
    ['Fees', 'No fee is charged.', true], ['Processing time', 'Three working days.', false],
  ]);
  details[0]!.querySelector('summary')!.click(); await nextTick();
  expect(toggled).toHaveBeenCalledWith('fees', false);
});

it('[RICH-04] server HTML with rich title and content equals the first client render and hydrates without a mismatch', async () => {
  const html = await renderToString(createSSRApp(defineComponent(() => rich)));
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host);
  const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => rich)); app.mount(host); await nextTick();
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  expect(host.querySelector('summary a')).not.toBeNull(); expect(server).toContain('1. No fee is charged.');
  errors.mockRestore();
});

it('[COLLAPSIBLE-01][disclosure-data-5] disabled: the summary is aria-disabled and focusable; click, Enter and Space change and notify nothing', async () => {
  const changes = vi.fn();
  const host = mount(() => h(Collapsible, { label: 'More', disabled: true, 'onUpdate:modelValue': changes }, () => 'Body'));
  const summary = host.querySelector<HTMLElement>('summary')!;
  expect(summary.getAttribute('aria-disabled')).toBe('true'); expect(summary.hasAttribute('tabindex')).toBe(false); expect(summary.textContent).toBe('More');
  summary.focus(); expect(document.activeElement).toBe(summary);
  summary.click();
  for (const key of ['Enter', ' ']) summary.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  await nextTick();
  expect(host.querySelector('details')!.open).toBe(false); expect(changes).not.toHaveBeenCalled();
});

it('[COLLAPSIBLE-02] disabled and opened by the application stays open; the reader cannot close it', async () => {
  const changes = vi.fn();
  const host = mount(() => h(Collapsible, { label: 'More', disabled: true, modelValue: true, 'onUpdate:modelValue': changes }, () => 'Body'));
  host.querySelector<HTMLElement>('summary')!.click(); await nextTick();
  expect(host.querySelector('details')!.open).toBe(true); expect(changes).not.toHaveBeenCalled();
});

const carouselText = { label: 'Highlights', previousLabel: 'Previous slide', nextLabel: 'Next slide', emptyLabel: 'No slides', indicatorsLabel: 'Choose a slide', getSlideLabel: (position: number, total: number) => `${position} of ${total}` };
const slides = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `s${index}`, content: `Slide ${index + 1}` }));
const press = async (button: HTMLElement) => { button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })); button.click(); await nextTick(); };

it('[FOCUS-01][FOCUS-02][FOCUS-03][disclosure-data-10] Carousel: Next keeps focus at the last slide, is aria-disabled and does nothing; moving back clears it', async () => {
  const changes = vi.fn();
  const host = mount(() => h(Carousel, { ...carouselText, slides: slides(3), wrap: false, 'onUpdate:modelValue': changes }));
  const next = host.querySelector<HTMLButtonElement>('[data-hw-next]')!; const previous = host.querySelector<HTMLButtonElement>('[data-hw-previous]')!;
  expect(previous.getAttribute('aria-disabled')).toBe('true'); expect(previous.disabled).toBe(false);
  next.focus(); await press(next); await press(next);
  expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.hasAttribute('disabled')).toBe(false);
  changes.mockClear(); await press(next);
  expect(changes).not.toHaveBeenCalled(); expect(host.querySelector('.hw-carousel-status')!.textContent).toBe('3 of 3');
  await press(previous);
  expect(next.hasAttribute('aria-disabled')).toBe(false);
});

it('[CAROUSEL-01] one slide: both arrows are disabled; a looping carousel has neither attribute at the ends', async () => {
  let host = mount(() => h(Carousel, { ...carouselText, slides: slides(1) }));
  for (const arrow of host.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow')) expect(arrow.disabled).toBe(true);
  app!.unmount(); document.body.replaceChildren();
  host = mount(() => h(Carousel, { ...carouselText, slides: slides(3), wrap: true }));
  for (const arrow of host.querySelectorAll<HTMLButtonElement>('.hw-carousel-arrow')) { expect(arrow.disabled).toBe(false); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
});

it('[FOCUS-01][FOCUS-02][FOCUS-03][disclosure-data-10] Pagination: Next keeps focus at the last page, is aria-disabled and does nothing; moving back clears it', async () => {
  const changes = vi.fn();
  const host = mount(() => h(Pagination, { ...paginationText, totalPages: 3, 'onUpdate:modelValue': changes }));
  const next = host.querySelector<HTMLButtonElement>('[data-hw-next]')!; const previous = host.querySelector<HTMLButtonElement>('[data-hw-previous]')!;
  expect(previous.getAttribute('aria-disabled')).toBe('true'); expect(previous.disabled).toBe(false);
  next.focus(); await press(next); await press(next); await nextTick();
  expect(document.activeElement).toBe(next); expect(next.getAttribute('aria-disabled')).toBe('true'); expect(next.hasAttribute('disabled')).toBe(false);
  changes.mockClear(); await press(next);
  expect(changes).not.toHaveBeenCalled();
  await press(previous);
  expect(next.hasAttribute('aria-disabled')).toBe(false);
});

it('[PAGINATION-01] disabled pagination: the arrows are disabled and carry no aria-disabled from a bound', () => {
  const host = mount(() => h(Pagination, { ...paginationText, totalPages: 3, disabled: true }));
  for (const arrow of host.querySelectorAll<HTMLButtonElement>('.hw-pagination-arrow')) { expect(arrow.disabled).toBe(true); expect(arrow.hasAttribute('aria-disabled')).toBe(false); }
});
