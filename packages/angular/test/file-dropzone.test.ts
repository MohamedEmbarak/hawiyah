import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const pdf = (name = 'b.pdf', size = 1) => new File(['x'.repeat(size)], name, { type: 'application/pdf' });
const txt = (name = 'c.txt') => new File(['x'], name, { type: 'text/plain' });
const uploads = { selected: 'Selected', uploading: 'Uploading', complete: 'Uploaded', error: 'Failed', remove: 'Remove', getProgressLabel: (name: string) => `Uploading ${name}`, getRemoveLabel: (name: string) => `Remove ${name}` };
const shape = (element: Element) => [...element.children].map(child => `${child.localName}${child.className ? `.${child.className.split(' ').join('.')}` : ''}`);
const settle = async (fixture: { detectChanges(): void }) => { await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); };

/** jsdom has neither a file chooser nor DataTransfer: the input's file list is a property the test owns, and FormData reads it through the test. */
function dropzone(attributes: string, state: Record<string, unknown> = {}, content = '') {
  const changed = vi.fn(), rejected = vi.fn(), selected = (files: readonly File[]) => `${files.length} selected`, message = (files: readonly File[]) => `Not accepted: ${files.map(file => file.name).join(', ')}`;
  const view = page(`<form><hw-file-dropzone controlId="docs" name="docs" dropLabel="Drop files here" ${attributes} (valueChange)="changed($event)" (rejected)="rejected($event)">${content}</hw-file-dropzone></form>`, { changed, rejected, selected, message, uploads, ...state });
  const root = view.root.querySelector<HTMLElement>('div.hw-file-dropzone')!, input = root.querySelector<HTMLInputElement>('input[type=file]')!;
  let held: File[] = [], text = '';
  Object.defineProperty(input, 'files', { configurable: true, get: () => held, set: (value: ArrayLike<File>) => { held = Array.from(value); } });
  Object.defineProperty(input, 'value', { configurable: true, get: () => text, set: (value: string) => { text = value; if (!value) held = []; } });
  const choose = (...files: File[]) => { held = files; input.dispatchEvent(new Event('change', { bubbles: true })); view.fixture.detectChanges(); };
  const drop = (...files: File[]) => { const event = new Event('drop', { bubbles: true, cancelable: true }); Object.defineProperty(event, 'dataTransfer', { value: { files, types: ['Files'] } }); root.dispatchEvent(event); view.fixture.detectChanges(); return event; };
  return { ...view, form: view.root.querySelector('form')!, zone: root, input, changed, rejected, choose, drop, held: () => held.map(file => file.name) };
}

describe('hw-file-dropzone selection rule', () => {
  it('[FILEDROPZONE-01][files-2] a mixed batch leaves the dropzone empty and reports the rejected files once', () => {
    const f = dropzone('label="Documents" accept=".pdf,.png" multiple [getRejectedMessage]="message"');
    const rejected = txt(); f.choose(pdf(), rejected);
    expect(f.held()).toEqual([]); expect(f.rejected.mock.calls).toEqual([[[rejected]]]); expect(f.changed).not.toHaveBeenCalled();
  });

  it('[FILEDROPZONE-02][files-2] several files on a single-file dropzone are all rejected', () => {
    const f = dropzone('label="Documents" [getRejectedMessage]="message"');
    const first = pdf('a.pdf'), second = pdf('b.pdf'); f.drop(first, second);
    expect(f.held()).toEqual([]); expect(f.rejected.mock.calls).toEqual([[[first, second]]]); expect(f.changed).not.toHaveBeenCalled();
  });

  it('[FILEDROPZONE-03] an accepted drop assigns its files to the input and reports the value once; a rejected batch after it empties the dropzone and reports [] once', () => {
    const f = dropzone('label="Documents" accept=".pdf" multiple [getRejectedMessage]="message"');
    const first = pdf('a.pdf'), second = pdf('b.pdf');
    expect(f.drop(first, second).defaultPrevented).toBe(true);
    expect(f.held()).toEqual(['a.pdf', 'b.pdf']); expect(f.changed.mock.calls).toEqual([[[first, second]]]); expect(f.rejected).not.toHaveBeenCalled();
    f.drop(txt()); expect(f.held()).toEqual([]); expect(f.changed.mock.calls).toEqual([[[first, second]], [[]]]); expect(f.rejected).toHaveBeenCalledTimes(1);
    // A second rejected batch finds nothing held: no further value notification.
    f.drop(txt()); expect(f.changed).toHaveBeenCalledTimes(2); expect(f.rejected).toHaveBeenCalledTimes(2);
  });

  it('[FILEDROPZONE-03] a drop that the browser refuses to assign leaves the selection as it was and reports nothing', () => {
    const f = dropzone('label="Documents" multiple');
    Object.defineProperty(f.input, 'files', { configurable: true, get: () => [], set: () => { throw new TypeError('refused'); } });
    f.drop(pdf()); expect(f.changed).not.toHaveBeenCalled(); expect(f.rejected).not.toHaveBeenCalled();
  });

  it('[FILEDROPZONE-04][files-3][R07] a file larger than maxSize is rejected; without maxSize it is accepted', () => {
    const limited = dropzone('label="Documents" [maxSize]="5" [getRejectedMessage]="message"');
    const large = pdf('large.pdf', 10); limited.choose(large);
    expect(limited.held()).toEqual([]); expect(limited.rejected.mock.calls).toEqual([[[large]]]); expect(limited.changed).not.toHaveBeenCalled();
    const open = dropzone('label="Documents"'); open.choose(large); expect(open.held()).toEqual(['large.pdf']); expect(open.changed.mock.calls).toEqual([[[large]]]); expect(open.rejected).not.toHaveBeenCalled();
  });
});

describe('hw-file-dropzone rejection message', () => {
  it('[MSG-04][INV-08][files-4][R06] a rejection is the one error of the field, an alert that describes the input and marks it invalid without a custom validity', () => {
    const f = dropzone('label="Documents" accept=".pdf" hint="Hint" [getSelectedMessage]="selected" [getRejectedMessage]="message"');
    expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.hasAttribute('aria-invalid')).toBe(false); expect(f.zone.hasAttribute('data-state')).toBe(false);
    f.choose(txt());
    const errors = f.zone.querySelectorAll('.hw-error'), error = errors[0]!;
    expect(errors).toHaveLength(1); expect(error.localName).toBe('p'); expect(error.id).toBe('docs-error'); expect(error.getAttribute('role')).toBe('alert'); expect(error.textContent).toBe('Not accepted: c.txt'); expect(f.zone.lastElementChild).toBe(error);
    expect(f.input.getAttribute('aria-describedby')).toBe('docs-instruction docs-hint docs-error'); expect(f.input.getAttribute('aria-invalid')).toBe('true'); expect(f.input.validity.customError).toBe(false); expect(f.zone.getAttribute('data-state')).toBe('error');
    expect(f.zone.querySelector('p[role=status]')!.textContent).toBe('');
  });

  it('[MSG-05] with an application error the same element shows the application\'s text, without a role', () => {
    const f = dropzone('label="Documents" accept=".pdf" error="Choose a document" [getRejectedMessage]="message"');
    f.choose(txt());
    expect(f.zone.querySelectorAll('.hw-error')).toHaveLength(1); expect(f.zone.querySelector('.hw-error')!.textContent).toBe('Choose a document'); expect(f.zone.querySelector('.hw-error')!.hasAttribute('role')).toBe(false);
  });

  it('[MSG-06][TEXT-02] getRejectedMessage is required with accept or maxSize: without it a rejection shows no error element, still marks the input, and warns once', () => {
    const warnings = missingTextWarnings();
    const quiet = dropzone('label="Documents"'); quiet.fixture.detectChanges(); expect(warnings).toEqual([]);
    const f = dropzone('label="Documents" [maxSize]="5"'); f.fixture.detectChanges();
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-file-dropzone requires "getRejectedMessage" when accept or maxSize is set']);
    f.choose(pdf('large.pdf', 10)); f.fixture.detectChanges();
    expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.getAttribute('aria-invalid')).toBe('true'); expect(f.zone.getAttribute('data-state')).toBe('error'); expect(warnings).toHaveLength(1);
  });

  it('[MSG-06] a rejection without accept or maxSize asks for the text at that moment', () => {
    const warnings = missingTextWarnings();
    const f = dropzone('label="Documents"'); f.drop(pdf('a.pdf'), pdf('b.pdf'));
    expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.getAttribute('aria-invalid')).toBe('true');
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-file-dropzone requires "getRejectedMessage" when a selection was rejected']);
  });

  it('[MSG-07][RESET-09] the message goes away after an accepted batch, and after a reset', async () => {
    const f = dropzone('label="Documents" accept=".pdf" [getSelectedMessage]="selected" [getRejectedMessage]="message"');
    f.choose(txt()); expect(f.zone.querySelector('.hw-error')).not.toBeNull();
    f.choose(pdf()); expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.hasAttribute('aria-invalid')).toBe(false); expect(f.zone.hasAttribute('data-state')).toBe(false); expect(f.zone.querySelector('p[role=status]')!.textContent).toBe('1 selected');
    f.choose(txt()); expect(f.zone.getAttribute('data-state')).toBe('error'); f.changed.mockClear();
    f.form.reset(); await settle(f.fixture);
    expect(f.zone.querySelector('.hw-error')).toBeNull(); expect(f.input.hasAttribute('aria-invalid')).toBe(false); expect(f.zone.hasAttribute('data-state')).toBe(false); expect(f.zone.querySelector('p[role=status]')!.textContent).toBe(''); expect(f.changed).not.toHaveBeenCalled();
  });
});

describe('hw-file-dropzone structure and reset', () => {
  it('[FILEDROPZONE-05][FILEDROPZONE-06][MSG-02][REQ-01][files-6][R08] one root with label, instruction, input, status, projected content, hint and error; no file list', () => {
    const f = dropzone('label="Documents" required hint="Hint" error="Error" aria-describedby="note" capture="environment" form="outer" [getSelectedMessage]="selected"', {}, '<hw-file-upload-list [items]="[{id: \'f1\', name: \'plan.pdf\', status: \'complete\'}]" [labels]="uploads" />');
    expect(f.zone.className).toBe('hw-field hw-file-dropzone'); expect(f.zone.parentElement!.localName).toBe('hw-file-dropzone'); expect(f.zone.hasAttribute('aria-disabled')).toBe(false);
    expect(shape(f.zone)).toEqual(['label.hw-label', 'p.hw-file-dropzone-instruction', 'input.hw-input', 'p', 'hw-file-upload-list', 'p.hw-hint', 'p.hw-error']);
    expect(f.zone.querySelector('label')!.textContent).toBe('Documents *'); expect(f.zone.querySelector('label')!.getAttribute('for')).toBe('docs'); expect(f.zone.querySelector('.hw-file-dropzone-instruction')!.id).toBe('docs-instruction');
    expect(f.input.getAttribute('aria-describedby')).toBe('note docs-instruction docs-hint docs-error'); expect(f.input.hasAttribute('accept')).toBe(false); expect(f.input.getAttribute('capture')).toBe('environment'); expect(f.input.getAttribute('form')).toBe('outer'); expect(f.input.required).toBe(true);
    f.choose(pdf('plan.pdf', 2048));
    expect(f.zone.querySelector(':scope > ul')).toBeNull(); expect(f.zone.textContent).not.toMatch(/2048|\(\d+\)/); expect(f.zone.querySelector('p[role=status]')!.textContent).toBe('1 selected');
  });

  it('[RESET-01][RESET-02][RESET-03][files-5] a reset empties the dropzone and reports [] once; an empty one reports nothing', async () => {
    const f = dropzone('label="Documents" multiple');
    f.form.reset(); await settle(f.fixture); expect(f.changed).not.toHaveBeenCalled();
    f.choose(pdf('a.pdf'), pdf('b.pdf')); f.changed.mockClear();
    f.form.reset(); await settle(f.fixture); expect(f.changed.mock.calls).toEqual([[[]]]); expect(f.held()).toEqual([]);
  });
});
