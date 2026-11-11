import '@angular/compiler';
import { missingTextWarnings } from './fixtures/texts';
import { text, withText } from './fixtures/application-text';
import { APP_ID, ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as hawiyah from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.head.querySelector('base')?.remove(); document.body.replaceChildren(); delete (globalThis as { __HAWIYAH_DEV__?: boolean }).__HAWIYAH_DEV__; });

const imports = Object.values(hawiyah).filter(value => typeof value === 'function' && ('ɵcmp' in value || 'ɵdir' in value)) as never[];
function page<T extends object>(template: string, state: T = {} as T) {
  class Host { constructor() { Object.assign(this, { text }, state); } }
  Component({ standalone: true, changeDetection: ChangeDetectionStrategy.Default, imports, template })(Host);
  const fixture = TestBed.createComponent(Host); document.body.append(fixture.nativeElement); fixture.detectChanges();
  return { fixture, root: fixture.nativeElement as HTMLElement, state: fixture.componentInstance as unknown as T };
}
const about = (warnings: string[], component: string, name: string) => warnings.filter(warning => warning.startsWith(`Hawiyah: ${component} requires "${name}"`));

describe('text is supplied by the application', () => {
  it('renders nothing in place of a missing required text and warns once per component and input', () => {
    const warnings = missingTextWarnings();
    const { fixture, root } = page(`<hw-dialog title="Review"><p>Body</p></hw-dialog><hw-dialog title="Second"><p>Body</p></hw-dialog><hw-table caption="Requests" [columns]="[{key: 'id', label: 'Id'}]" [rows]="[]" /><hw-spinner /><hw-stepper [steps]="[{label: 'One'}]" />`);
    fixture.detectChanges(); fixture.detectChanges();
    for (const close of root.querySelectorAll('.hw-dialog-header button')) { expect(close.hasAttribute('aria-label')).toBe(false); expect(close.querySelector('.hw-icon')).not.toBeNull(); }
    expect(root.querySelector('hw-table td')!.textContent).toBe(''); expect(root.querySelector('hw-table td')!.getAttribute('colspan')).toBe('1');
    expect(root.querySelector('hw-spinner .hw-sr-only')!.textContent).toBe(''); expect(root.querySelector('hw-stepper ol')!.hasAttribute('aria-label')).toBe(false);
    expect(about(warnings, 'hw-dialog', 'closeLabel')).toHaveLength(1); expect(about(warnings, 'hw-table', 'emptyMessage')).toHaveLength(1);
    expect(about(warnings, 'hw-spinner', 'label')).toHaveLength(1); expect(about(warnings, 'hw-stepper', 'label')).toHaveLength(1);
    expect(warnings).toHaveLength(4);
    expect(warnings[0]).toBe('Hawiyah: hw-dialog requires "closeLabel". Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.');
    // Nothing in the document reads as a default: no English, no Arabic, no placeholder text.
    expect(root.textContent).toBe('ReviewBodySecondBodyRequestsIdOne');
  });

  it('asks for conditional text only while its condition holds, and never for optional text', () => {
    const warnings = missingTextWarnings();
    const { fixture, root, state } = page(`<hw-alert [dismissible]="dismissible">Saved</hw-alert><hw-chip [removable]="dismissible">Tag</hw-chip><hw-select label="City" [options]="[{value: 'r', label: 'Riyadh'}]" /><hw-carousel label="News" ${withText.carousel} [slides]="[{id: 'a', title: 'A', content: 'First'}]" /><hw-search-field label="Find" clearLabel="Clear" [showSearchButton]="false" /><hw-mobile-top-bar title="Home" /><hw-service-details title="Permit" /><hw-site-verification label="Official site" detailsLabel="Verify" domainLabel="Domain" domainDescription="Ends with gov.sa" httpsLabel="Uses HTTPS" httpsDescription="Encrypted" />`, { dismissible: false });
    expect(warnings).toEqual([]);
    expect(root.querySelector('hw-select option')!.textContent).toBe('Riyadh'); expect(root.querySelectorAll('hw-select option')).toHaveLength(1);
    expect(root.querySelector('.hw-carousel')!.hasAttribute('aria-roledescription')).toBe(false); expect(root.querySelector('hw-search-field input')!.hasAttribute('placeholder') && root.querySelector('hw-search-field input')!.getAttribute('placeholder') !== '').toBe(false);
    // The site verification prints only the application's words: no protocol token is appended.
    expect(root.querySelector('hw-site-verification')!.textContent).not.toMatch(/HTTPS\s*HTTPS/); expect(root.querySelectorAll('hw-site-verification h2')[0]!.textContent).toBe('Uses HTTPS');
    state.dismissible = true; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); fixture.detectChanges();
    expect(warnings).toEqual([
      'Hawiyah: hw-alert requires "closeLabel" when the alert is dismissible. Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.',
      'Hawiyah: hw-chip requires "removeLabel" when the chip is removable. Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.',
    ]);
    expect(root.querySelector('hw-alert button')!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector('hw-chip button')!.hasAttribute('aria-label')).toBe(false);
  });

  it('keeps a constraint blocking when its message is missing', () => {
    const warnings = missingTextWarnings();
    const { root } = page(`<form><hw-tag-input label="Tags" name="tags" addLabel="Add" [getRemoveLabel]="text.tagInput.getRemoveLabel" required /><hw-combobox label="City" name="city" emptyMessage="None" [getResultsMessage]="text.combobox.getResultsMessage" [options]="[]" required /><hw-date-picker ${withText.datePicker.replace(/invalidMessage="[^"]*"/, '')} name="date" value="not-a-date" /></form>`);
    const form = root.querySelector('form')!;
    for (const selector of ['hw-tag-input input.hw-input', 'hw-combobox input[role=combobox]', 'hw-date-picker input[type=text]']) {
      const input = form.querySelector<HTMLInputElement>(selector)!;
      expect(input.validity.customError, selector).toBe(true); expect(input.validationMessage, selector).toBe(' '); expect(input.getAttribute('aria-invalid'), selector).toBe('true');
    }
    expect(form.checkValidity()).toBe(false); expect(root.querySelector('hw-date-picker .hw-error')).toBeNull();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-tag-input requires "requiredMessage" when required is set', 'Hawiyah: hw-combobox requires "requiredMessage" when required is set', 'Hawiyah: hw-date-picker requires "invalidMessage"']);
  });

  it('stays silent outside development', () => {
    const warnings = missingTextWarnings();
    (globalThis as { __HAWIYAH_DEV__?: boolean }).__HAWIYAH_DEV__ = false;
    const { root } = page(`<hw-dialog title="Review" /><hw-breadcrumb [items]="[{label: 'Home'}]" />`);
    expect(warnings).toEqual([]); expect(root.querySelector('.hw-dialog-header button')!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector('nav')!.hasAttribute('aria-label')).toBe(false);
  });

  it('hands every templated text function its documented arguments and renders exactly what it returns', () => {
    const calls: Record<string, unknown[][]> = {};
    const record = (name: string) => (...args: unknown[]) => { (calls[name] ??= []).push(args); return `${name}(${args.map(arg => typeof arg === 'object' && arg ? (arg as { id?: string; key?: string; name?: string }).id ?? (arg as { key?: string }).key ?? (arg as { name?: string }).name : arg).join(',')})`; };
    const state = { record: Object.fromEntries(['page', 'gap', 'slide', 'rating', 'value', 'overflow', 'toast', 'notice', 'results', 'selected', 'remove', 'sort', 'day', 'progress', 'removeFile', 'suggestions'].map(name => [name, record(name)])), dismissed: [] as string[] };
    const { fixture, root } = page(`
      <hw-pagination label="Pages" previousLabel="Previous" nextLabel="Next" jumpLabel="Jump" goLabel="Go" [getPageLabel]="record.page" [getGapLabel]="record.gap" [totalPages]="20" [page]="10" />
      <hw-carousel label="News" previousLabel="Previous" nextLabel="Next" indicatorsLabel="Slides" emptyLabel="None" [getSlideLabel]="record.slide" [slides]="[{id: 'a', title: 'A', content: 'First'}, {id: 'b', title: 'B', content: 'Second'}]" />
      <hw-rating label="Rate" [max]="3" [getRatingLabel]="record.rating" /><hw-rating-display [value]="2.5" [max]="4" [getValueLabel]="record.value" />
      <hw-avatar-group label="Team" [max]="1" [getOverflowLabel]="record.overflow" [avatars]="[{name: 'Sara Ali'}, {name: 'Omar Hassan'}, {name: 'Lina Saleh'}]" />
      <hw-toast-region label="Messages" [getDismissLabel]="record.toast" [messages]="[{id: 't1', message: 'Saved'}]" (dismissed)="dismissed.push($event)" />
      <hw-notification-list label="Inbox" emptyMessage="None" unreadLabel="Unread" [getDismissLabel]="record.notice" [items]="[{id: 'n1', title: 'Approved'}]" (dismissed)="dismissed.push($event)" />
      <hw-combobox label="City" emptyMessage="None" [getResultsMessage]="record.results" [options]="[{value: 'r', label: 'Riyadh'}, {value: 'j', label: 'Jeddah'}]" />
      <hw-multi-select label="Cities" searchLabel="Filter" emptyMessage="None" [getSelectedMessage]="record.selected" [options]="[{value: 'r', label: 'Riyadh'}]" [value]="['r']" />
      <hw-tag-input label="Tags" addLabel="Add" [getRemoveLabel]="record.remove" [value]="['alpha']" />
      <hw-data-table caption="Requests" emptyMessage="None" [getSortLabel]="record.sort" sortKey="title" [columns]="[{key: 'title', label: 'Title', sortable: true}, {key: 'date', label: 'Date', sortable: true}]" [rows]="[{title: 'B', date: '2'}]" />
      <hw-calendar label="Date" locale="en" previousLabel="Previous" nextLabel="Next" value="2026-10-15" [getDayLabel]="record.day" />
      <hw-file-upload-list [labels]="{selected: 'Selected', uploading: 'Uploading', complete: 'Done', error: 'Failed', remove: 'Remove', getProgressLabel: record.progress, getRemoveLabel: record.removeFile}" [items]="[{id: 'f1', name: 'plan.pdf', status: 'uploading', progress: 40}]" removable />
      <hw-search-field label="Find" clearLabel="Clear" searchLabel="Search" [getResultsMessage]="record.suggestions" [suggestions]="['Passport renewal', 'Passport status', 'Permit']" value="Pass" />`, state);
    const label = (selector: string) => root.querySelector(selector)!.getAttribute('aria-label');
    // Pagination: the page number; a gap receives its first and last hidden page.
    expect(calls['page']!.every(args => args.length === 1 && typeof args[0] === 'number')).toBe(true); expect(calls['page']!.map(args => args[0])).toContain(20);
    expect(label('hw-pagination [aria-current="page"]')).toBe('page(10)');
    expect(calls['gap']!.every(args => args.length === 2 && (args[0] as number) < (args[1] as number))).toBe(true); expect(root.querySelector('hw-pagination')!.innerHTML).toContain(`gap(${calls['gap']![0]!.join(',')})`);
    // Carousel: one-based position and the total.
    expect(calls['slide']).toContainEqual([1, 2]); expect(calls['slide']).toContainEqual([2, 2]); expect(calls['slide']!.some(args => args[0] === 0)).toBe(false);
    expect(root.querySelector('hw-carousel')!.innerHTML).toContain('slide(1,2)');
    // Rating: each option value and the maximum. RatingDisplay: the score and the maximum, as the whole name.
    expect(calls['rating']!.slice(0, 3)).toEqual([[1, 3], [2, 3], [3, 3]]); expect([...root.querySelectorAll('hw-rating .hw-sr-only')].map(node => node.textContent)).toEqual(['rating(1,3)', 'rating(2,3)', 'rating(3,3)']);
    expect(calls['value']![0]).toEqual([2.5, 4]); expect(label('.hw-rating-display')).toBe('value(2.5,4)');
    // AvatarGroup: the number of hidden avatars.
    expect(calls['overflow']![0]).toEqual([2]); expect(label('.hw-avatar-group > span.hw-avatar')).toBe('overflow(2)');
    // ToastRegion and NotificationList: the message or item itself.
    expect(calls['toast']![0]).toEqual([{ id: 't1', message: 'Saved' }]); expect(label('hw-toast-region [data-hw-dismiss]')).toBe('toast(t1)');
    expect(calls['notice']![0]).toEqual([{ id: 'n1', title: 'Approved' }]); expect(label('hw-notification-list li button')).toBe('notice(n1)');
    // Counts.
    expect(calls['selected']![0]).toEqual([1]); expect(root.querySelector('hw-multi-select [role=status]')!.textContent).toBe('selected(1)');
    expect(calls['remove']![0]).toEqual(['alpha']); expect(label('hw-tag-input .hw-chip button')).toBe('remove(alpha)');
    // DataTable: the column and the direction the button will apply.
    expect(calls['sort']).toContainEqual([{ key: 'title', label: 'Title', sortable: true }, 'descending']); expect(calls['sort']).toContainEqual([{ key: 'date', label: 'Date', sortable: true }, 'ascending']);
    expect([...root.querySelectorAll('hw-data-table th button')].map(button => button.getAttribute('aria-label'))).toEqual(['sort(title,descending)', 'sort(date,ascending)']);
    // Calendar: the ISO date of the day.
    expect(calls['day']!.every(args => args.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(args[0] as string))).toBe(true); expect(label('[data-date="2026-10-15"]')).toBe('day(2026-10-15)');
    // FileUploadList: the file name, for the progress bar and for the remove button.
    expect(calls['progress']![0]).toEqual(['plan.pdf']); expect(label('hw-file-upload-list progress')).toBe('progress(plan.pdf)');
    expect(calls['removeFile']![0]).toEqual(['plan.pdf']); expect(label('hw-file-upload-list button')).toBe('removeFile(plan.pdf)'); expect(root.querySelector('hw-file-upload-list button')!.textContent).toBe('Remove');
    // Live regions: the number of matches, once the list is open.
    const combobox = root.querySelector<HTMLInputElement>('hw-combobox input[role=combobox]')!; combobox.dispatchEvent(new Event('focus')); fixture.detectChanges();
    expect(calls['results']!.at(-1)).toEqual([2]); expect(root.querySelector('hw-combobox [role=status]')!.textContent).toBe('results(2)');
    const search = root.querySelector<HTMLInputElement>('hw-search-field input')!; search.dispatchEvent(new Event('focus')); fixture.detectChanges();
    expect(calls['suggestions']!.at(-1)).toEqual([2]); expect(root.querySelector('hw-search-field [role=status]')!.textContent).toBe('suggestions(2)');
  });

  it('passes the selected files to the file dropzone message', () => {
    const selected = vi.fn((files: readonly File[]) => `${files.length}: ${files.map(file => file.name).join(', ')}`);
    const { fixture, root } = page(`<hw-file-dropzone label="Documents" dropLabel="Drop files here" [getSelectedMessage]="selected" [(value)]="files" />`, { selected, files: [] as File[] });
    expect(root.querySelector('label')!.textContent).toBe('Documents'); expect(root.querySelector('.hw-file-dropzone > p')!.textContent).toBe('Drop files here'); expect(root.querySelector('[role=status]')!.textContent).toBe(''); expect(selected).not.toHaveBeenCalled();
    const files = [new File(['a'], 'plan.pdf'), new File(['b'], 'id.png')];
    (fixture.componentInstance as unknown as { files: File[] }).files = files; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    expect(selected).toHaveBeenLastCalledWith(files); expect(root.querySelector('[role=status]')!.textContent).toBe('2: plan.pdf, id.png');
  });

  it('never leaves an input named like a native attribute on the wrapper element', () => {
    const { root } = page(`<hw-alert title="Check" role="alert">Body</hw-alert><hw-tooltip text="Hint" align="end" tooltipId="hint"><span>Target</span></hw-tooltip><hw-empty-state title="Nothing" /><hw-page-header title="Services" /><hw-mobile-top-bar title="Home" /><hw-service-details title="Permit" /><hw-dialog title="Review" closeLabel="Close" /><hw-popover label="Filters" triggerLabel="Filters" panelId="filters" /><hw-menu label="Actions" triggerLabel="Actions" panelId="actions" [items]="[]" />`);
    for (const host of root.children) { for (const name of ['title', 'role', 'align', 'id']) expect(host.hasAttribute(name), `${host.localName} ${name}`).toBe(false); }
    expect(root.querySelector('.hw-alert')!.getAttribute('role')).toBe('alert'); expect(root.querySelector('.hw-alert strong')!.textContent).toBe('Check');
    expect(root.querySelector('[role=tooltip]')!.id).toBe('hint'); expect(root.querySelector('[role=tooltip]')!.getAttribute('data-align')).toBe('end'); expect(root.querySelector('.hw-tooltip-trigger')!.getAttribute('aria-describedby')).toBe('hint');
    expect(root.querySelector('.hw-popover-panel')!.id).toBe('filters'); expect(document.querySelectorAll('#filters, #actions, #hint')).toHaveLength(3);
  });

  it('draws generated ids from one source per application, scoped by APP_ID', () => {
    TestBed.configureTestingModule({ providers: [{ provide: APP_ID, useValue: 'docs' }] });
    const { root } = page(`<hw-tooltip text="One"><span>A</span></hw-tooltip><hw-tooltip text="Two"><span>B</span></hw-tooltip><hw-popover label="Filters" triggerLabel="Filters" />`);
    expect([...root.querySelectorAll('[role=tooltip]')].map(node => node.id)).toEqual(['hw-tooltip-docs-1', 'hw-tooltip-docs-2']); expect(root.querySelector('.hw-popover-panel')!.id).toBe('hw-popover-docs-3');
    expect(TestBed.inject(hawiyah.HwIdSource).next('custom')).toBe('custom-docs-4');
  });
});

describe('brand', () => {
  const header = 'menuLabel="Menu" navigationLabel="Main"';
  it('can be artwork alone, named by brandLabel, with no text printed beside it', () => {
    const warnings = missingTextWarnings();
    const { root } = page(`<hw-portal-header ${header} brandLabel="Hawiyah home" homeHref="/home"><svg hwBrand viewBox="0 0 8 8" aria-hidden="true"><path d="M0 0h8v8H0z" /></svg></hw-portal-header>`);
    const brand = root.querySelector('.hw-portal-brand')!;
    expect(brand.getAttribute('aria-label')).toBe('Hawiyah home'); expect(brand.getAttribute('href')).toBe('/home');
    expect(brand.querySelector('span')).toBeNull(); expect(brand.textContent).toBe(''); expect(brand.children).toHaveLength(1); expect(brand.firstElementChild!.localName).toBe('svg');
    expect(warnings).toEqual([]);
  });

  it('adds nothing to visible brand text, and is not a link without a home address', () => {
    const warnings = missingTextWarnings();
    const { root } = page(`<hw-portal-header ${header} brand="هوية" homeHref="" />`);
    const brand = root.querySelector('.hw-portal-brand')!;
    expect(brand.textContent).toBe('هوية'); expect(brand.hasAttribute('aria-label')).toBe(false); expect(brand.hasAttribute('href')).toBe(false); expect(brand.hasAttribute('role')).toBe(false);
    expect(warnings).toEqual([]);
  });

  it('reports artwork that has no accessible name, once the page is in a browser', () => {
    const warnings = missingTextWarnings();
    page(`<hw-portal-header ${header}><svg hwBrand viewBox="0 0 8 8"><path d="M0 0h8v8H0z" /></svg></hw-portal-header><hw-portal-header ${header}><img hwBrand src="data:," alt="Hawiyah"></hw-portal-header>`);
    TestBed.tick();
    expect(warnings).toEqual(['Hawiyah: hw-portal-header requires "brandLabel" when the brand has no text. Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.']);
  });

  it('passes through the layout and names footer artwork the same way', () => {
    const warnings = missingTextWarnings();
    const { root } = page(`<hw-portal-layout brandLabel="Hawiyah home" skipLabel="Skip to content" menuLabel="Menu" navigationLabel="Main" externalLabel="opens in a new window"><svg hwBrand viewBox="0 0 8 8" aria-hidden="true"><path d="M0 0h8v8H0z" /></svg><p>Content</p></hw-portal-layout><hw-portal-footer brandLabel="Hawiyah" externalLabel="opens in a new window"><svg hwFooterBrand viewBox="0 0 8 8" aria-hidden="true"><path d="M0 0h8v8H0z" /></svg></hw-portal-footer>`);
    TestBed.tick();
    const brand = root.querySelector('hw-portal-layout .hw-portal-brand')!; expect(brand.getAttribute('aria-label')).toBe('Hawiyah home'); expect(brand.textContent).toBe(''); expect(brand.querySelector('svg')).not.toBeNull();
    expect(root.querySelector('hw-portal-layout .hw-portal-footer-brand')!.textContent).toBe('');
    const footer = root.querySelector(':scope > hw-portal-footer .hw-portal-footer-brand')!; expect(footer.getAttribute('role')).toBe('group'); expect(footer.getAttribute('aria-label')).toBe('Hawiyah'); expect(footer.textContent).toBe('');
    expect(warnings).toEqual([]);
  });
});

describe('packaged in-page links', () => {
  const base = (href: string) => { const element = document.createElement('base'); element.href = href; document.head.append(element); };
  it('renders the bare fragment first and resolves it against the document from the first interaction', () => {
    base('/other/app/');
    const { fixture, root } = page(`<hw-app-shell skipLabel="Skip to content"><p>Body</p></hw-app-shell><hw-portal-header menuLabel="Menu" navigationLabel="Main" brand="Portal" mainId="المحتوى" skipLabel="Skip" /><main id="المحتوى">Main</main><hw-portal-header menuLabel="Menu" navigationLabel="Other" brand="No target" />`);
    TestBed.tick();
    const [shell, header] = [...root.querySelectorAll<HTMLAnchorElement>('a.hw-skip-link')];
    expect(root.querySelectorAll('a.hw-skip-link')).toHaveLength(2);
    // What the server rendered is what the first client render keeps: only the fragment.
    expect(shell!.getAttribute('href')).toBe('#main-content'); expect(header!.getAttribute('href')).toBe(`#${encodeURIComponent('المحتوى')}`); expect(shell!.textContent).toBe('Skip to content');
    shell!.dispatchEvent(new Event('focus')); header!.dispatchEvent(new Event('pointerdown'));
    const path = location.pathname + location.search;
    expect(shell!.getAttribute('href')).toBe(`${path}#main-content`); expect(header!.getAttribute('href')).toBe(`${path}#${encodeURIComponent('المحتوى')}`);
    expect(new URL(shell!.href).pathname).toBe(location.pathname);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); shell!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true); expect(document.activeElement).toBe(root.querySelector('main.hw-app-shell-main')); expect(location.hash).toBe('');
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }); header!.dispatchEvent(modified); expect(modified.defaultPrevented).toBe(false);
    fixture.destroy(); expect(shell!.getAttribute('href')).toBe('#main-content');
  });

  it('binds content navigation links, hands activation to the observer and writes the hash only on request', () => {
    base('/other/app/');
    const items = [{ id: 'intro', label: 'Intro' }, { id: 'usage', label: 'Usage', children: [{ id: 'api', label: 'API' }] }, { id: 'missing', label: 'Missing' }];
    const { fixture, root, state } = page(`<hw-content-navigation label="On this page" [items]="items" [updateHash]="updateHash" (currentChange)="current = $event" /><section id="intro" tabindex="-1">Intro</section><section id="usage" tabindex="-1">Usage<h3 id="api" tabindex="-1">API</h3></section>`, { items, updateHash: false, current: '' });
    TestBed.tick();
    const links = [...root.querySelectorAll<HTMLAnchorElement>('a.hw-content-nav-link')];
    expect(links.map(link => link.getAttribute('href'))).toEqual(['#intro', '#usage', '#api', '#missing']);
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('On this page'); expect(root.querySelector('h2')!.textContent).toBe('On this page');
    links[1]!.dispatchEvent(new Event('focus')); expect(links[1]!.getAttribute('href')).toBe(`${location.pathname}#usage`); expect(links[0]!.getAttribute('href')).toBe('#intro');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); links[1]!.dispatchEvent(click); fixture.detectChanges();
    expect(click.defaultPrevented).toBe(true); expect(location.hash).toBe('');
    // A link whose target is not in the document is left to the browser.
    const missing = new MouseEvent('click', { bubbles: true, cancelable: true }); links[3]!.dispatchEvent(missing); expect(missing.defaultPrevented).toBe(false);
    state.updateHash = true; fixture.changeDetectorRef.markForCheck(); fixture.detectChanges();
    const replaced = vi.spyOn(history, 'replaceState');
    links[2]!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(replaced).toHaveBeenCalledTimes(1); expect(String(replaced.mock.calls[0]![2])).toBe(`${location.pathname}#api`);
    replaced.mockRestore(); history.replaceState(null, '', location.pathname);
  });
});
