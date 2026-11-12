// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRangeSlider, createToggleGroup, enhance } from '../src/index.js';

// Vanilla fixtures of the cross-adapter form cases: the documented authored markup and its controllers.
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
const marker = '<span class="hw-required-marker" aria-hidden="true"> *</span>';

describe('native fields (authored markup)', () => {
  it('[SELECT-02] a select without a selected option resets to its first enabled option, else to the marked default', async () => {
    const form = mount('<form><select class="hw-select" name="a"><option value="x" disabled>X</option><option value="y">Y</option><option value="z">Z</option></select><select class="hw-select" name="b"><option value="y">Y</option><option value="z" selected>Z</option></select></form>') as HTMLFormElement;
    const release = enhance(form); const [a, b] = form.querySelectorAll('select');
    a!.value = 'z'; b!.value = 'y'; form.reset(); await Promise.resolve();
    expect([a!.value, b!.value]).toEqual(['y', 'z']); release();
  });

  it('[MSG-01] [MSG-03] [INV-06] keeps label, control, hint and error in order; an application error has no role and marks the control invalid', () => {
    const field = mount(`<div class="hw-field"><label class="hw-label" id="email-label" for="email">Email${marker}</label><input class="hw-input" id="email" required aria-describedby="email-hint email-error" aria-invalid="true"><p class="hw-hint" id="email-hint">Work address.</p><p class="hw-error" id="email-error">Enter an email address.</p></div>`);
    const release = enhance(field);
    expect([...field.children].map(node => node.localName + '.' + node.className)).toEqual(['label.hw-label', 'input.hw-input', 'p.hw-hint', 'p.hw-error']);
    expect(field.querySelector('.hw-error')!.hasAttribute('role')).toBe(false); expect(field.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    expect(field.querySelector('label')!.lastElementChild!.outerHTML).toBe(marker); release();
  });

  it('[CHECKBOX-01] [CHECKBOX-02] a checked checkbox and switch submit "on" or the authored value; the label holds the input and the text only', () => {
    const form = mount('<form><div class="hw-field"><label class="hw-choice" for="c"><input class="hw-checkbox" type="checkbox" id="c" name="c" checked>Agree</label></div><div class="hw-field"><label class="hw-choice" for="s"><input class="hw-switch" type="checkbox" role="switch" id="s" name="s" value="yes" checked>Alerts</label></div></form>') as HTMLFormElement;
    const release = enhance(form); const data = new FormData(form);
    expect([data.get('c'), data.get('s')]).toEqual(['on', 'yes']);
    form.querySelectorAll('label.hw-choice').forEach(label => { expect(label.querySelector('span')).toBeNull(); expect([...label.childNodes].map(node => node.nodeType)).toEqual([1, 3]); });
    release();
  });
});

describe('range slider (authored markup)', () => {
  it('[RANGE-SLIDER-03] submits both thumbs under one name in lower, upper order and follows an external form', async () => {
    document.body.innerHTML = '<form id="outer"></form><fieldset class="hw-field hw-range-slider" data-hw="range-slider"><legend class="hw-label">Price</legend><label class="hw-label">Lowest<input class="hw-slider" type="range" name="price" form="outer" data-hw-lower min="0" max="100" value="20"></label><label class="hw-label">Highest<input class="hw-slider" type="range" name="price" form="outer" data-hw-upper min="0" max="100" value="80"></label></fieldset>';
    const form = document.querySelector('form')!; const root = document.querySelector<HTMLElement>('fieldset')!; const controller = createRangeSlider(root);
    expect(new FormData(form).getAll('price')).toEqual(['20', '80']); expect(root.hasAttribute('name') || root.hasAttribute('form')).toBe(false);
    const lower = root.querySelector<HTMLInputElement>('[data-hw-lower]')!; lower.value = '5'; lower.dispatchEvent(new Event('input'));
    form.reset(); await Promise.resolve(); expect(controller.value).toEqual([20, 80]); controller.destroy();
  });
});

describe('toggle group (authored markup)', () => {
  const single = (attributes = '') => `<form><fieldset class="hw-toggle-group" data-hw="toggle-group" aria-describedby="app-note view-hint view-error" ${attributes}><legend class="hw-label">View${marker}</legend><label><input type="radio" name="view" value="list" required>List</label><label><input type="radio" name="view" value="grid" required>Grid</label><p class="hw-hint" id="view-hint">Choose a layout.</p><p class="hw-error" id="view-error">Choose one.</p></fieldset></form>`;

  it('[TOGGLE-GROUP-01] multiple mode: every option is button.hw-button with data-variant=secondary, data-size=md and aria-pressed', () => {
    const root = mount('<div class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" role="group" aria-label="Format"><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="bold" aria-pressed="false">Bold</button><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="italic" aria-pressed="true">Italic</button></div>');
    const controller = createToggleGroup(root);
    root.querySelectorAll('button').forEach(button => { expect(button.className).toBe('hw-button'); expect([button.dataset.variant, button.dataset.size, button.type]).toEqual(['secondary', 'md', 'button']); expect(button.hasAttribute('aria-pressed')).toBe(true); });
    controller.destroy();
  });

  it('[TOGGLE-GROUP-04] [MSG-01] option markup has no class, span or data-selected; hint and error follow the options; name and form stay on the radios and hidden inputs', () => {
    const form = mount(single()); const root = form.firstElementChild as HTMLElement; const controller = createToggleGroup(root);
    root.querySelectorAll('label').forEach(label => { expect(label.className).toBe(''); expect(label.querySelector('span, [data-selected]')).toBeNull(); expect(label.firstElementChild!.matches('input[type=radio]:not([class])')).toBe(true); });
    expect([...root.children].slice(-2).map(node => node.localName + '#' + node.id)).toEqual(['p#view-hint', 'p#view-error']); expect(root.getAttribute('aria-describedby')).toBe('app-note view-hint view-error');
    expect(root.hasAttribute('name') || root.hasAttribute('form')).toBe(false); controller.destroy();
    const multiple = mount('<form id="f"></form><div data-hw="toggle-group" data-hw-multiple="true" data-hw-name="format" role="group" aria-label="Format"><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="bold" aria-pressed="true">Bold</button></div>');
    const group = document.querySelector<HTMLElement>('[data-hw-multiple]')!; const second = createToggleGroup(group);
    expect(group.hasAttribute('name')).toBe(false); expect(group.querySelector<HTMLInputElement>('input[type=hidden]')!.name).toBe('format'); second.destroy(); void multiple;
  });

  it('[INV-01] [INV-03] [INV-04] [INV-05] a failed submission marks a required single group invalid until a choice or a reset', async () => {
    const form = mount(single()) as HTMLFormElement; const root = form.firstElementChild as HTMLElement; const controller = createToggleGroup(root);
    expect(root.hasAttribute('aria-invalid')).toBe(false);
    const submitted = vi.fn(event => event.preventDefault()); form.addEventListener('submit', submitted);
    form.requestSubmit(); expect(submitted).not.toHaveBeenCalled(); expect(root.getAttribute('aria-invalid')).toBe('true');
    root.querySelectorAll('input')[1]!.click(); expect(root.hasAttribute('aria-invalid')).toBe(false);
    form.reset(); await Promise.resolve(); form.checkValidity(); expect(root.getAttribute('aria-invalid')).toBe('true');
    form.reset(); await Promise.resolve(); expect(root.hasAttribute('aria-invalid')).toBe(false);
    controller.destroy(); expect(root.hasAttribute('aria-invalid')).toBe(false);
  });

  it('[INV-04] keeps an authored aria-invalid after a choice and restores it on destroy', () => {
    const form = mount(single('aria-invalid="true"')); const root = form.firstElementChild as HTMLElement; const controller = createToggleGroup(root);
    (form as HTMLFormElement).checkValidity(); root.querySelectorAll('input')[0]!.click(); expect(root.getAttribute('aria-invalid')).toBe('true');
    controller.destroy(); expect(root.getAttribute('aria-invalid')).toBe('true');
  });
});
