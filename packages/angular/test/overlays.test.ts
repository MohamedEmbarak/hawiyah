import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { contentOf, page } from './fixtures/page';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function () { if (!this.open) return; this.open = false; this.dispatchEvent(new Event('close')); };
});
afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); document.body.replaceChildren(); });

const forwarded = ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid'];

describe('hw-dialog and hw-drawer', () => {
  it('[RICH-03][DIALOG-01][overlays-1] the footer region holds nothing while no footer is projected, so the stylesheet can hide it', () => {
    const { root, update } = page(`<hw-dialog title="Review" closeLabel="Close"><p>Body</p></hw-dialog><hw-drawer title="Filters" closeLabel="Close"><p>Body</p></hw-drawer>
      <hw-dialog title="Review" closeLabel="Close"><p>Body</p>@if (canSave) {<div hwDialogFooter><button type="button">Save</button></div>}</hw-dialog><hw-drawer title="Filters" closeLabel="Close"><div hwDrawerFooter><button type="button">Apply</button></div></hw-drawer>`, { canSave: false });
    const footers = [...root.querySelectorAll('footer.hw-dialog-footer')];
    expect(footers).toHaveLength(4);
    // :empty matches an element without element or text children; Angular's comment anchors do not count.
    for (const footer of footers.slice(0, 3)) { expect(contentOf(footer)).toEqual([]); expect(footer.matches(':empty')).toBe(true); }
    expect(footers[3]!.querySelector('[hwDrawerFooter] button')!.textContent).toBe('Apply'); expect(footers[3]!.matches(':empty')).toBe(false);
    update({ canSave: true }); expect(footers[2]!.querySelector('[hwDialogFooter] button')!.textContent).toBe('Save'); expect(footers[2]!.matches(':empty')).toBe(false);
  });

  it('[ATTR-03][DIALOG-02][overlays-10] aria-describedby, aria-labelledby and aria-label written on the host reach the native dialog of both components', () => {
    const { root, update } = page(`<h2 id="own">Own heading</h2>
      <hw-dialog title="Review" titleId="review-title" closeLabel="Close" aria-describedby="note"><p id="note">Note</p></hw-dialog>
      <hw-drawer title="Filters" titleId="filters-title" closeLabel="Close" aria-describedby="drawer-note"><p id="drawer-note">Note</p></hw-drawer>
      <hw-dialog title="Review" closeLabel="Close" [aria-describedby]="described" aria-labelledby="own" />
      <hw-drawer title="Filters" closeLabel="Close" [aria-describedby]="described" [aria-labelledby]="'own'" aria-label="Filter the list" side="start" />`, { described: 'first' as string | null });
    const hosts = [...root.querySelectorAll('hw-dialog, hw-drawer')], dialogs = hosts.map(host => host.querySelector('dialog')!);
    for (const host of hosts) for (const name of [...forwarded, 'title']) expect(host.hasAttribute(name), `${host.localName} ${name}`).toBe(false);
    expect(dialogs[0]!.getAttribute('aria-describedby')).toBe('note'); expect(dialogs[0]!.getAttribute('aria-labelledby')).toBe('review-title'); expect(dialogs[0]!.hasAttribute('aria-label')).toBe(false);
    // [overlays-10] the drawer never bound its description.
    expect(dialogs[1]!.getAttribute('aria-describedby')).toBe('drawer-note'); expect(dialogs[1]!.getAttribute('aria-labelledby')).toBe('filters-title'); expect(root.querySelector('#drawer-note')!.closest('dialog')).toBe(dialogs[1]);
    expect(dialogs[2]!.getAttribute('aria-describedby')).toBe('first'); expect(dialogs[2]!.getAttribute('aria-labelledby')).toBe('own');
    expect(dialogs[3]!.getAttribute('aria-describedby')).toBe('first'); expect(dialogs[3]!.getAttribute('aria-labelledby')).toBe('own'); expect(dialogs[3]!.getAttribute('aria-label')).toBe('Filter the list');
    update({ described: null }); expect(dialogs[2]!.hasAttribute('aria-describedby')).toBe(false); expect(dialogs[3]!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('[overlays-10] the drawer is the dialog markup with its side and its own footer marker', () => {
    const { root } = page(`<hw-dialog title="Review" titleId="t" closeLabel="Close"><p>Body</p></hw-dialog><hw-drawer title="Review" titleId="t2" closeLabel="Close" side="bottom"><p>Body</p></hw-drawer>`);
    const [dialog, drawer] = [...root.querySelectorAll('dialog')];
    expect(drawer!.className).toBe('hw-dialog hw-drawer'); expect(drawer!.getAttribute('data-side')).toBe('bottom'); expect(dialog!.className).toBe('hw-dialog'); expect(dialog!.hasAttribute('data-side')).toBe(false);
    const shape = (element: Element): unknown => [element.localName, element.className, [...element.children].map(shape)];
    expect(shape(drawer!)).toEqual(['dialog', 'hw-dialog hw-drawer', (shape(dialog!) as unknown[])[2]]);
  });
});

describe('hw-tooltip', () => {
  const template = `<p id="more">More</p><button type="button" id="before">Before</button><hw-tooltip text="Opens the form" tooltipId="tip" class="own" id="wrapper" data-x="1"><button type="button" hwTooltipTrigger aria-describedby="more">New request</button></hw-tooltip><hw-tooltip text="A term" tooltipId="term"><span hwTooltipTrigger tabindex="0">Term</span></hw-tooltip><button type="button" id="after">After</button>`;

  it('[TOOLTIP-01][ATTR-01][overlays-14] the host is the wrapper and the marked element the only tab stop', () => {
    const { root } = page(template);
    const host = root.querySelector('hw-tooltip')!, trigger = host.querySelector('button')!;
    expect(host.classList.contains('hw-tooltip-anchor')).toBe(true); expect(host.classList.contains('own')).toBe(true); expect(host.id).toBe('wrapper'); expect(host.getAttribute('data-x')).toBe('1');
    expect(host.querySelector('.hw-tooltip-anchor')).toBeNull(); expect(host.hasAttribute('tabindex')).toBe(false); expect(host.hasAttribute('aria-describedby')).toBe(false);
    expect([...host.children].map(child => child.localName)).toEqual(['button', 'span']);
    // One tab stop inside the wrapper: the trigger. The tooltip itself is not focusable.
    expect([...host.querySelectorAll('[tabindex], button, a[href], input')]).toEqual([trigger]); expect(trigger.hasAttribute('tabindex')).toBe(false); expect(trigger.classList.contains('hw-tooltip-trigger')).toBe(true);
    expect(trigger.getAttribute('aria-describedby')!.split(' ')).toContain('tip');
    const tooltip = host.querySelector('span.hw-tooltip')!;
    expect(tooltip.getAttribute('role')).toBe('tooltip'); expect(tooltip.id).toBe('tip'); expect(tooltip.hasAttribute('hidden')).toBe(true); expect(tooltip.textContent).toBe('Opens the form');
    expect(tooltip.getAttribute('data-placement')).toBe('top'); expect(tooltip.getAttribute('data-align')).toBe('start');
    const term = root.querySelectorAll('hw-tooltip')[1]!.querySelector('span[hwTooltipTrigger]')!;
    expect(term.getAttribute('aria-describedby')).toBe('term'); expect(term.getAttribute('tabindex')).toBe('0');
  });

  it('[TOOLTIP-02] an aria-describedby of the trigger is kept, before the tooltip id, static or bound', () => {
    const { root, update } = page(`<hw-tooltip text="T" tooltipId="tip"><button type="button" hwTooltipTrigger aria-describedby="more">A</button></hw-tooltip><hw-tooltip text="T" tooltipId="tip2"><button type="button" hwTooltipTrigger [aria-describedby]="ids">B</button></hw-tooltip>`, { ids: 'one two' as string | null });
    const [first, second] = [...root.querySelectorAll('button')];
    expect(first!.getAttribute('aria-describedby')).toBe('more tip'); expect(second!.getAttribute('aria-describedby')).toBe('one two tip2');
    update({ ids: null }); expect(second!.getAttribute('aria-describedby')).toBe('tip2');
  });

  it('[TOOLTIP-03] focus shows the tooltip; Escape hides it and keeps focus on the trigger; leaving hides it', () => {
    const { root, fixture } = page(template);
    const host = root.querySelector('hw-tooltip')!, trigger = host.querySelector('button')!, tooltip = host.querySelector<HTMLElement>('.hw-tooltip')!;
    trigger.focus(); fixture.detectChanges(); expect(tooltip.hidden).toBe(false);
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    trigger.dispatchEvent(escape); fixture.detectChanges();
    expect(tooltip.hidden).toBe(true); expect(document.activeElement).toBe(trigger); expect(escape.defaultPrevented).toBe(true);
    trigger.blur(); trigger.focus(); fixture.detectChanges(); expect(tooltip.hidden).toBe(false);
    root.querySelector<HTMLElement>('#after')!.focus(); fixture.detectChanges(); expect(tooltip.hidden).toBe(true);
  });

  it('[TOOLTIP-03] the pointer shows the tooltip, and it hides 120 ms after the pointer leaves or at a press outside', () => {
    vi.useFakeTimers();
    const { root, fixture } = page(template);
    const host = root.querySelector('hw-tooltip')!, tooltip = host.querySelector<HTMLElement>('.hw-tooltip')!;
    host.dispatchEvent(new MouseEvent('mouseenter')); fixture.detectChanges(); expect(tooltip.hidden).toBe(false);
    host.dispatchEvent(new MouseEvent('mouseleave')); vi.advanceTimersByTime(119); fixture.detectChanges(); expect(tooltip.hidden).toBe(false);
    vi.advanceTimersByTime(1); fixture.detectChanges(); expect(tooltip.hidden).toBe(true);
    host.dispatchEvent(new MouseEvent('mouseenter')); fixture.detectChanges(); expect(tooltip.hidden).toBe(false);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })); fixture.detectChanges(); expect(tooltip.hidden).toBe(true);
  });

  it('[overlays-14] the range information of an Umm al-Qura calendar is one named, focusable trigger described by its tooltip', () => {
    const { root } = page(`<hw-calendar label="Day" locale="en-GB" calendar="islamic-umalqura" controlId="cal" previousLabel="Previous" nextLabel="Next" rangeLabel="Supported dates" unsupportedMessage="Outside the range" value="2026-10-28" />`);
    const info = root.querySelector('hw-tooltip.hw-calendar-info')!, trigger = info.querySelector('.hw-calendar-info-icon')!;
    expect(info.classList.contains('hw-tooltip-anchor')).toBe(true); expect(info.querySelector('.hw-sr-only')).toBeNull();
    expect(trigger.getAttribute('role')).toBe('img'); expect(trigger.getAttribute('aria-label')).toBe('Supported dates'); expect(trigger.getAttribute('tabindex')).toBe('0'); expect(trigger.hasAttribute('aria-hidden')).toBe(false);
    expect(trigger.getAttribute('aria-describedby')).toBe('cal-range'); expect(info.querySelector('[role=tooltip]')!.id).toBe('cal-range');
  });
});
