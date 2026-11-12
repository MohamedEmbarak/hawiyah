import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, contentOf, markup, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

// The Angular side of tests/feedback-status-parity.test.ts: the same case ids and assertions on the DOM.
describe('Alert', () => {
  it('[ALERT-01][feedback-status-1] tone=danger without role renders role=alert; every other tone renders role=status', () => {
    const { root, update } = page(`@for (tone of tones; track tone) {<hw-alert [tone]="tone">Message</hw-alert>}<hw-alert id="default">Message</hw-alert><hw-alert id="bound" [tone]="tone">Message</hw-alert>`, { tones: ['neutral', 'info', 'success', 'warning', 'danger'], tone: 'info' });
    expect([...root.querySelectorAll('hw-alert:not([id])')].map(alert => [alert.getAttribute('data-tone'), alert.getAttribute('role')])).toEqual([['neutral', 'status'], ['info', 'status'], ['success', 'status'], ['warning', 'status'], ['danger', 'alert']]);
    expect(attributesOf(root.querySelector('#default')!)).toEqual({ class: 'hw-alert', 'data-tone': 'info', id: 'default', role: 'status' });
    update({ tone: 'danger' }); expect(root.querySelector('#bound')!.getAttribute('role')).toBe('alert');
  });

  it('[ALERT-02] an explicit role on a danger alert is kept, written statically or bound', () => {
    const { root, update } = page(`<hw-alert tone="danger" role="status">Rendered with the page</hw-alert><hw-alert tone="danger" [role]="role">Bound</hw-alert><hw-alert tone="info" role="alert">Urgent</hw-alert>`, { role: 'status' as 'status' | 'group' | undefined });
    expect([...root.querySelectorAll('hw-alert')].map(alert => alert.getAttribute('role'))).toEqual(['status', 'status', 'alert']);
    update({ role: 'group' }); expect(root.querySelectorAll('hw-alert')[1]!.getAttribute('role')).toBe('group');
    update({ role: undefined }); expect(root.querySelectorAll('hw-alert')[1]!.getAttribute('role')).toBe('alert');
  });

  it('[TEXT-03][R00] no dismiss button without a (dismissed) listener; one ghost icon button with it, named by closeLabel', () => {
    const { root } = page(`<hw-alert closeLabel="Dismiss">Plain</hw-alert><hw-alert closeLabel="Dismiss" (dismissed)="seen = seen + 1">Dismissable</hw-alert>`, { seen: 0 });
    const [plain, dismissable] = [...root.querySelectorAll('hw-alert')];
    expect(plain!.querySelector('button')).toBeNull();
    const button = dismissable!.querySelector('button')!;
    expect(attributesOf(button)).toEqual({ 'aria-label': 'Dismiss', class: 'hw-button hw-alert-dismiss', 'data-size': 'md', 'data-variant': 'ghost', type: 'button' });
    expect(attributesOf(button.firstElementChild!)).toEqual({ 'aria-hidden': 'true', class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md' });
    // The button follows the content box and is the last child of the alert.
    expect(contentOf(dismissable!).map(node => (node as Element).localName)).toEqual(['div', 'button']);
  });

  it('[ALERT-03][feedback-status-2] each activation of the dismiss button notifies once and the alert stays until the application removes it', () => {
    const { root, state, update } = page(`@if (shown) {<hw-alert closeLabel="Dismiss" (dismissed)="seen.push($event)">Saved</hw-alert>}`, { shown: true, seen: [] as unknown[] });
    const button = root.querySelector<HTMLButtonElement>('hw-alert button')!;
    // A native button of type button: Enter and Space are its own activation, which arrives as a click.
    expect(button.type).toBe('button'); expect(button.disabled).toBe(false);
    button.click(); update(); expect(state.seen).toEqual([undefined]); expect(root.querySelector('hw-alert')).not.toBeNull();
    button.click(); update(); expect(state.seen).toHaveLength(2); expect(root.querySelector('hw-alert .hw-alert-content')!.textContent).toBe('Saved');
    update({ shown: false }); expect(root.querySelector('hw-alert')).toBeNull();
  });
});

describe('Progress and Meter', () => {
  it('[PROGRESS-01][feedback-status-7] label alone: one progress.hw-progress with aria-label, no label element and no visible text; values are written unchanged', () => {
    const { root } = page(`<hw-progress label="Upload" [value]="150" [max]="100" /><hw-progress label="Waiting" /><hw-progress label="Odd" [value]="-5" [max]="0" />`);
    const [over, waiting, odd] = [...root.querySelectorAll('hw-progress')];
    expect(contentOf(over!).map(node => (node as Element).localName)).toEqual(['progress']); expect(root.querySelector('label, span')).toBeNull(); expect(root.textContent).toBe('');
    expect(attributesOf(over!.querySelector('progress')!)).toEqual({ 'aria-label': 'Upload', class: 'hw-progress', max: '100', value: '150' });
    expect(attributesOf(waiting!.querySelector('progress')!)).toEqual({ 'aria-label': 'Waiting', class: 'hw-progress', max: '100' });
    expect(attributesOf(odd!.querySelector('progress')!)).toEqual({ 'aria-label': 'Odd', class: 'hw-progress', max: '0', value: '-5' });
  });

  it('[PROGRESS-02] size=sm and size=lg write data-size on the progress element', () => {
    const { root } = page(`<hw-progress label="Small" size="sm" [value]="1" /><hw-progress label="Large" size="lg" [value]="1" /><hw-progress label="Default" [value]="1" />`);
    expect([...root.querySelectorAll('progress')].map(progress => progress.getAttribute('data-size'))).toEqual(['sm', 'lg', null]);
  });

  it('[METER-01][feedback-status-8] label and value 10 only: min 0, max 100, value 10 and no low, high or optimum; no label element and no text', () => {
    const { root } = page(`<hw-meter label="Storage" [value]="10" /><hw-meter label="Empty" />`);
    const [meter, empty] = [...root.querySelectorAll('hw-meter')];
    expect(attributesOf(meter!.querySelector('meter')!)).toEqual({ 'aria-label': 'Storage', class: 'hw-meter', max: '100', min: '0', value: '10' });
    expect(attributesOf(empty!.querySelector('meter')!)).toEqual({ 'aria-label': 'Empty', class: 'hw-meter', max: '100', min: '0', value: '0' });
    expect(contentOf(meter!).map(node => (node as Element).localName)).toEqual(['meter']); expect(root.querySelector('label, span')).toBeNull(); expect(root.textContent).toBe('');
  });

  it('[METER-02] low, high and optimum are written when given', () => {
    const { root } = page(`<hw-meter label="Storage" [value]="60" [min]="10" [max]="200" [low]="25" [high]="75" [optimum]="100" />`);
    expect(attributesOf(root.querySelector('meter')!)).toEqual({ 'aria-label': 'Storage', class: 'hw-meter', high: '75', low: '25', max: '200', min: '10', optimum: '100', value: '60' });
  });
});

describe('Skeleton, Spinner and EmptyState', () => {
  it('[SKELETON-01][feedback-status-9] variant=circle and variant=text write data-variant on the aria-hidden element with class hw-skeleton', () => {
    const { root } = page(`<hw-skeleton [variant]="'circle'" /><hw-skeleton [variant]="'text'" /><hw-skeleton />`);
    expect([...root.querySelectorAll('.hw-skeleton')].map(attributesOf)).toEqual([{ 'aria-hidden': 'true', class: 'hw-skeleton', 'data-variant': 'circle' }, { 'aria-hidden': 'true', class: 'hw-skeleton', 'data-variant': 'text' }, { 'aria-hidden': 'true', class: 'hw-skeleton' }]);
  });

  it('[SPINNER-01][feedback-status-10] the element with class hw-spinner has role=status and contains span.hw-sr-only with the label; no other wrapper', () => {
    const { root } = page(`<hw-spinner [label]="'Loading results'" />`);
    const spinner = root.querySelector('.hw-spinner')!;
    expect(spinner.localName).toBe('hw-spinner'); expect(attributesOf(spinner)).toEqual({ class: 'hw-spinner', role: 'status' });
    expect(contentOf(spinner).map(node => (node as Element).outerHTML)).toEqual(['<span class="hw-sr-only">Loading results</span>']); expect(root.querySelectorAll('[role=status]')).toHaveLength(1);
  });

  it('[SPINNER-02] size=sm and size=lg write data-size on that element', () => {
    const { root } = page(`<hw-spinner label="Loading" size="sm" /><hw-spinner label="Loading" size="lg" /><hw-spinner label="Loading" />`);
    expect([...root.querySelectorAll('.hw-spinner')].map(spinner => spinner.getAttribute('data-size'))).toEqual(['sm', 'lg', null]);
  });

  it('[NAME-02][NAME-03][NAME-04][SPINNER-03] a spinner named on its host, or hidden with aria-hidden="true", needs no label and renders no inner span; one with neither warns once', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<span id="busy">Loading results</span><hw-spinner id="named" aria-label="Loading" /><hw-spinner id="by" aria-labelledby="busy" /><hw-spinner id="hidden" aria-hidden="true" /><hw-spinner id="both" aria-label="Loading" label="Loading results" />`);
    update();
    expect([...root.querySelectorAll('hw-spinner')].map(spinner => [spinner.id, spinner.childElementCount, spinner.textContent])).toEqual([['named', 0, ''], ['by', 0, ''], ['hidden', 0, ''], ['both', 1, 'Loading results']]);
    expect(root.querySelector('#named')!.getAttribute('aria-label')).toBe('Loading'); expect(root.querySelector('#by')!.getAttribute('aria-labelledby')).toBe('busy'); expect(root.querySelector('#hidden')!.getAttribute('aria-hidden')).toBe('true');
    expect(warnings).toEqual([]);
    const bare = page(`<hw-spinner /><hw-spinner />`); bare.update();
    expect([...bare.root.querySelectorAll('hw-spinner')].map(spinner => [spinner.childElementCount, spinner.hasAttribute('aria-label')])).toEqual([[0, false], [0, false]]);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-spinner requires "label"']);
  });

  it('[RICH-01][feedback-status-11] hw-empty-state: the icon is inside span.hw-empty-icon[aria-hidden=true] before the h3 and the action is the last child', () => {
    const { root } = page(`<hw-empty-state title="No requests" description="Start a request."><button hwEmptyAction type="button">New request</button><span hwEmptyIcon class="hw-icon" data-icon="search-01"></span><p>More</p></hw-empty-state>`);
    const empty = root.querySelector('.hw-empty')!;
    expect(empty.localName).toBe('hw-empty-state'); expect(empty.querySelector('section')).toBeNull(); expect(empty.hasAttribute('title')).toBe(false);
    expect(contentOf(empty).map(node => (node as Element).localName)).toEqual(['span', 'h3', 'p', 'p', 'button']);
    const icon = empty.firstElementChild!; expect(attributesOf(icon)).toEqual({ 'aria-hidden': 'true', class: 'hw-empty-icon' }); expect(icon.firstElementChild!.getAttribute('data-icon')).toBe('search-01');
    expect(empty.querySelector('h3')!.textContent).toBe('No requests'); expect(empty.lastElementChild!.textContent).toBe('New request');
  });
});

describe('Chip', () => {
  it('[CHIP-01][feedback-status-12] the remove control is a plain button of type button with the icon; tone, variant and size are written on the chip', () => {
    const { root } = page(`<hw-chip [removeLabel]="'Remove Riyadh'" (removed)="seen = true">Riyadh</hw-chip><hw-chip [tone]="'info'" [variant]="'outline'" [size]="'sm'">Jeddah</hw-chip><hw-chip removeLabel="Remove" disabled (removed)="seen = true">Fixed</hw-chip>`, { seen: false });
    const [removable, plain, disabled] = [...root.querySelectorAll('.hw-chip')];
    expect(removable!.localName).toBe('hw-chip'); expect(attributesOf(removable!)).toEqual({ class: 'hw-chip', 'data-tone': 'neutral' });
    const button = removable!.querySelector('button')!;
    expect(attributesOf(button)).toEqual({ 'aria-label': 'Remove Riyadh', type: 'button' }); expect(contentOf(button).map(node => markup(node as Element))).toEqual(['<span aria-hidden="true" class="hw-icon" data-icon="cancel-01" data-size="md"></span>']);
    expect(attributesOf(plain!)).toEqual({ class: 'hw-chip', 'data-size': 'sm', 'data-tone': 'info', 'data-variant': 'outline' });
    expect(disabled!.querySelector('button')!.disabled).toBe(true);
  });

  it('[TEXT-03] no remove button without a (removed) listener, one with it; each activation notifies once without a payload', () => {
    const { root, state, update } = page(`<hw-chip removeLabel="Remove">Plain</hw-chip><hw-chip removeLabel="Remove" (removed)="seen.push($event)">Removable</hw-chip>`, { seen: [] as unknown[] });
    const [plain, removable] = [...root.querySelectorAll('hw-chip')];
    expect(plain!.querySelector('button')).toBeNull(); expect(removable!.querySelectorAll('button')).toHaveLength(1);
    removable!.querySelector('button')!.click(); update(); expect(state.seen).toEqual([undefined]); expect(root.querySelectorAll('hw-chip')).toHaveLength(2);
  });

  it('[FOCUS-04] removing the focused chip moves focus to the next chip\'s remove button, then to the previous one; the last chip leaves focus to the application', async () => {
    const { root, state, update } = page(`<div id="row">@for (city of cities; track city) {<hw-chip [removeLabel]="'Remove ' + city" (removed)="remove(city)">{{ city }}</hw-chip>}</div>`, { cities: ['Riyadh', 'Jeddah', 'Dammam'], remove(this: { cities: string[] }, city: string) { this.cities = this.cities.filter(entry => entry !== city); } });
    const press = async (name: string) => { const button = root.querySelector<HTMLButtonElement>(`button[aria-label="Remove ${name}"]`)!; button.focus(); button.click(); update(); await Promise.resolve(); await Promise.resolve(); };
    await press('Jeddah');
    expect(state.cities).toEqual(['Riyadh', 'Dammam']); expect(document.activeElement).toBe(root.querySelector('button[aria-label="Remove Dammam"]'));
    await press('Dammam');
    expect(document.activeElement).toBe(root.querySelector('button[aria-label="Remove Riyadh"]'));
    await press('Riyadh');
    expect(root.querySelector('hw-chip')).toBeNull(); expect(document.activeElement).toBe(document.body);
  });

  it('[FOCUS-04] a chip that the application keeps, and a removal while focus is elsewhere, move no focus', async () => {
    const { root, update } = page(`<button id="other" type="button">Other</button>@for (city of cities; track city) {<hw-chip [removeLabel]="'Remove ' + city" (removed)="remove(city)">{{ city }}</hw-chip>}`, { cities: ['Riyadh', 'Jeddah'], keep: true, remove(this: { cities: string[]; keep: boolean }, city: string) { if (!this.keep) this.cities = this.cities.filter(entry => entry !== city); } });
    const first = root.querySelector<HTMLButtonElement>('button[aria-label="Remove Riyadh"]')!;
    first.focus(); first.click(); update(); await Promise.resolve(); expect(document.activeElement).toBe(first);
    update({ keep: false }); root.querySelector<HTMLElement>('#other')!.focus(); first.click(); update(); await Promise.resolve(); await Promise.resolve();
    expect(root.querySelectorAll('hw-chip')).toHaveLength(1); expect(document.activeElement).toBe(root.querySelector('#other'));
  });
});
