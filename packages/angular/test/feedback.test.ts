import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { attributesOf, contentOf, markup, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

interface Value { helpful: boolean | null; comment: string }
const texts = 'label="Was this page helpful?" yesLabel="Yes" noLabel="No" commentLabel="Tell us more" submitLabel="Send" successMessage="Thank you"';
const type = (textarea: HTMLTextAreaElement, value: string) => { textarea.value = value; textarea.dispatchEvent(new Event('input', { bubbles: true })); };
const pressed = (root: Element) => [...root.querySelectorAll('.hw-feedback-actions button')].map(button => button.getAttribute('aria-pressed'));

// The Angular side of tests/feedback-parity.test.ts: the same case ids and assertions on the DOM.
describe('Feedback', () => {
  it('[FEEDBACK-01][service-patterns-13] first render: a group labelled by the question, two secondary buttons with aria-pressed=false, no textarea, an empty status', () => {
    const { root } = page(`<hw-feedback ${texts}><p id="extra">More</p></hw-feedback>`);
    const group = root.querySelector('hw-feedback > div.hw-feedback')!, question = group.querySelector('p')!;
    expect(question.textContent).toBe('Was this page helpful?'); expect(attributesOf(group)).toEqual({ 'aria-labelledby': question.id, class: 'hw-feedback', 'data-choice-variant': 'text', role: 'group' });
    expect(contentOf(group).map(node => (node as Element).localName)).toEqual(['p', 'div', 'p', 'p']); expect(attributesOf(group.querySelector('.hw-feedback-actions')!)).toEqual({ class: 'hw-feedback-actions' });
    const buttons = [...group.querySelectorAll('.hw-feedback-actions > button')];
    expect(buttons.map(attributesOf)).toEqual([0, 1].map(() => ({ 'aria-pressed': 'false', class: 'hw-button', 'data-size': 'md', 'data-variant': 'secondary', type: 'button' })));
    expect(buttons.map(button => contentOf(button).map(node => markup(node as Element)).join(''))).toEqual(['<span aria-hidden="true" class="hw-icon hw-feedback-icon" data-icon="thumbs-up"></span><span class="hw-feedback-label">Yes</span>', '<span aria-hidden="true" class="hw-icon hw-feedback-icon" data-icon="thumbs-down"></span><span class="hw-feedback-label">No</span>']);
    expect(group.querySelector('textarea, .hw-feedback-comment')).toBeNull(); expect(attributesOf(group.querySelector('[role=status]')!)).toEqual({ role: 'status' }); expect(group.querySelector('[role=status]')!.textContent).toBe('');
    expect(root.querySelector('form, fieldset, legend, input, h2, section')).toBeNull(); expect(group.lastElementChild!.id).toBe('extra');
  });

  it('[FEEDBACK-02][service-patterns-12][R05] choosing yes sets aria-pressed, notifies {helpful: true, comment: \'\'} once and shows the labelled textarea and the submit button', () => {
    const { root, state, update } = page(`<hw-feedback ${texts} (valueChange)="values.push($event)" (feedback)="sent.push($event)" />`, { values: [] as Value[], sent: [] as Value[] });
    const [yes] = [...root.querySelectorAll<HTMLButtonElement>('.hw-feedback-actions button')];
    yes!.focus(); yes!.click(); update();
    expect(pressed(root)).toEqual(['true', 'false']); expect(state.values).toEqual([{ helpful: true, comment: '' }]); expect(state.sent).toEqual([]);
    const step = root.querySelector('.hw-feedback-comment')!, textarea = step.querySelector('textarea')!;
    expect(step.querySelector(`label[for="${textarea.id}"]`)!.textContent).toBe('Tell us more'); expect(attributesOf(step.querySelector(':scope > button')!)).toEqual({ class: 'hw-button', 'data-size': 'md', 'data-variant': 'primary', type: 'button' }); expect(step.querySelector(':scope > button')!.textContent).toBe('Send');
    expect(root.querySelector('[role=status]')!.textContent).toBe('');
    // The step follows the choices and precedes the status; focus stays on the pressed choice.
    expect(step.previousElementSibling!.className).toBe('hw-feedback-actions'); expect(step.nextElementSibling!.getAttribute('role')).toBe('status'); expect(document.activeElement).toBe(yes);
    yes!.click(); update(); expect(state.values).toHaveLength(1);
  });

  it('[FEEDBACK-03] typing then submit notifies feedback once with the value and shows successMessage; a later change empties the status', () => {
    const { root, state, update } = page(`<hw-feedback ${texts} (valueChange)="values.push($event)" (feedback)="sent.push($event)" />`, { values: [] as Value[], sent: [] as Value[] });
    const [yes, no] = [...root.querySelectorAll<HTMLButtonElement>('.hw-feedback-actions button')];
    yes!.click(); update(); type(root.querySelector('textarea')!, 'Thanks'); update();
    expect(state.values).toEqual([{ helpful: true, comment: '' }, { helpful: true, comment: 'Thanks' }]);
    root.querySelector<HTMLButtonElement>('.hw-feedback-comment > button')!.click(); update();
    expect(state.sent).toEqual([{ helpful: true, comment: 'Thanks' }]); expect(root.querySelector('[role=status]')!.textContent).toBe('Thank you'); expect(state.values).toHaveLength(2);
    no!.click(); update();
    expect(root.querySelector('[role=status]')!.textContent).toBe(''); expect(state.values.at(-1)).toEqual({ helpful: false, comment: 'Thanks' }); expect(pressed(root)).toEqual(['false', 'true']); expect(root.querySelector('textarea')!.value).toBe('Thanks');
    root.querySelector<HTMLButtonElement>('.hw-feedback-comment > button')!.click(); update(); type(root.querySelector('textarea')!, 'Thanks a lot'); update();
    expect(root.querySelector('[role=status]')!.textContent).toBe(''); expect(state.sent).toHaveLength(2);
  });

  // Convention controlled-and-observable-state for Angular: a written value is the initial state and the component then
  // updates its own field, so a value that the application does not write back still follows the reader.
  it('[STATE-02] a bound value that the application does not update is the initial state: the choice is reported once and the component follows it', () => {
    const { root, state, update } = page(`<hw-feedback ${texts} [value]="value" (valueChange)="values.push($event)" />`, { value: { helpful: null, comment: '' } as Value, values: [] as Value[] });
    root.querySelector<HTMLButtonElement>('.hw-feedback-actions button')!.click(); update();
    expect(state.values).toEqual([{ helpful: true, comment: '' }]); expect(state.value).toEqual({ helpful: null, comment: '' });
    expect(pressed(root)).toEqual(['true', 'false']); expect(root.querySelector('.hw-feedback-comment')).not.toBeNull();
    // A later write of the application is followed without a notification.
    update({ value: { helpful: null, comment: '' } }); expect(pressed(root)).toEqual(['false', 'false']); expect(root.querySelector('.hw-feedback-comment')).toBeNull(); expect(state.values).toHaveLength(1);
  });

  it('[STATE-03][STATE-04] a value written by the application does not notify; [(value)] round-trips', () => {
    const { root, state, update } = page(`<hw-feedback ${texts} [(value)]="value" (valueChange)="values.push($event)" />`, { value: { helpful: false, comment: 'Unclear' } as Value, values: [] as Value[] });
    expect(pressed(root)).toEqual(['false', 'true']); expect(root.querySelector('textarea')!.value).toBe('Unclear'); expect(state.values).toEqual([]);
    update({ value: { helpful: null, comment: '' } }); expect(pressed(root)).toEqual(['false', 'false']); expect(root.querySelector('.hw-feedback-comment')).toBeNull(); expect(state.values).toEqual([]);
    root.querySelector<HTMLButtonElement>('.hw-feedback-actions button')!.click(); update();
    expect(state.value).toEqual({ helpful: true, comment: '' }); expect(state.values).toHaveLength(1); expect(pressed(root)).toEqual(['true', 'false']);
  });

  it('[FEEDBACK-04] disabled: both choices, the textarea and submit are disabled and nothing notifies; the controls follow each other in the document', () => {
    const { root, state, update } = page(`<hw-feedback ${texts} [disabled]="disabled" [value]="{helpful: true, comment: ''}" (valueChange)="values.push($event)" (feedback)="sent.push($event)" />`, { disabled: true, values: [] as Value[], sent: [] as Value[] });
    const controls = [...root.querySelectorAll<HTMLButtonElement | HTMLTextAreaElement>('button, textarea')];
    expect(controls.map(control => control.localName)).toEqual(['button', 'button', 'textarea', 'button']); expect(controls.map(control => control.disabled)).toEqual([true, true, true, true]);
    for (const control of controls) if (control.localName === 'button') control.click();
    update(); expect(state.values).toEqual([]); expect(state.sent).toEqual([]);
    update({ disabled: false }); expect(controls.map(control => control.disabled)).toEqual([false, false, false, false]);
    // Native controls in document order and none with a tabindex: Tab visits yes, no, the textarea, submit.
    expect(controls.every(control => !control.hasAttribute('tabindex'))).toBe(true);
  });

  it('[FEEDBACK-04] focus stays on the pressed choice when the comment step appears', () => {
    const { root, update } = page(`<hw-feedback ${texts} />`);
    const no = root.querySelectorAll<HTMLButtonElement>('.hw-feedback-actions button')[1]!;
    no.focus(); no.click(); update();
    expect(root.querySelector('.hw-feedback-comment textarea')).not.toBeNull(); expect(document.activeElement).toBe(no); expect(no.getAttribute('aria-pressed')).toBe('true');
  });

  it('[TEXT-01] each missing text renders nothing in its place and warns once under hw-feedback', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-feedback [yesLabel]="''" [noLabel]="''" [commentLabel]="''" [submitLabel]="''" [successMessage]="''" [value]="{helpful: true, comment: ''}" />`);
    root.querySelector<HTMLButtonElement>('.hw-feedback-comment > button')!.click(); update(); update();
    const group = root.querySelector('.hw-feedback')!;
    expect(group.textContent).toBe(''); expect(group.hasAttribute('aria-labelledby')).toBe(false); expect(group.hasAttribute('aria-label')).toBe(false); expect(group.querySelector('label')).toBeNull(); expect(group.querySelectorAll(':scope > p')).toHaveLength(1);
    expect(warnings.map(warning => warning.split('.')[0]).sort()).toEqual(['commentLabel', 'label', 'noLabel', 'submitLabel', 'successMessage', 'yesLabel'].map(name => `Hawiyah: hw-feedback requires "${name}"`));
  });

  it('[NAME-02] an application aria-label alone needs no label and renders no question', () => {
    const { root, update } = page(`<hw-feedback aria-label="Page feedback" yesLabel="Yes" noLabel="No" commentLabel="More" submitLabel="Send" successMessage="Thanks" />`); update();
    const group = root.querySelector('.hw-feedback')!;
    expect(group.getAttribute('aria-label')).toBe('Page feedback'); expect(group.hasAttribute('aria-labelledby')).toBe(false); expect(group.firstElementChild!.className).toBe('hw-feedback-actions');
  });

  it('[FEEDBACK-01] choiceVariant is written on the group', () => {
    const { root } = page(`<hw-feedback ${texts} choiceVariant="icon" /><hw-feedback ${texts} choiceVariant="icon-text" />`);
    expect([...root.querySelectorAll('.hw-feedback')].map(group => group.getAttribute('data-choice-variant'))).toEqual(['icon', 'icon-text']);
  });
});
