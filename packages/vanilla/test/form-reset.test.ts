// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRangeSlider, createRating, createToggleGroup } from '../src/index.js';

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
const input = (element: HTMLInputElement, value: string) => { element.value = value; element.dispatchEvent(new Event('input', { bubbles: true })); };
const range = '<fieldset data-hw="range-slider"><legend>Price</legend><input type="range" name="low" data-hw-lower aria-label="Lowest" min="0" max="100" value="20"><input type="range" name="high" data-hw-upper aria-label="Highest" min="0" max="100" value="80"></fieldset>';
const single = '<fieldset data-hw="toggle-group"><legend>View</legend><label><input type="radio" name="view" value="list" checked>List</label><label><input type="radio" name="view" value="grid">Grid</label></fieldset>';
const multiple = '<div data-hw="toggle-group" data-hw-multiple="true" data-hw-name="format" role="group" aria-label="Format"><button data-hw-value="bold" aria-pressed="true">Bold</button><button data-hw-value="italic" aria-pressed="false">Italic</button></div>';
const rating = '<fieldset data-hw="rating"><legend>Rating</legend><input type="radio" name="stars" value="1" aria-label="1"><input type="radio" name="stars" value="2" aria-label="2" checked><input type="radio" name="stars" value="3" aria-label="3"></fieldset>';

describe('native form reset', () => {
  it('[RESET-01] [RESET-02] returns range slider, toggle groups and rating to the authored values with one notification', async () => {
    const form = mount(`<form>${range}${single}${multiple}${rating}</form>`) as HTMLFormElement;
    const [rangeRoot, singleRoot, multipleRoot, ratingRoot] = [...form.children] as HTMLElement[];
    const calls = { range: vi.fn(), single: vi.fn(), multiple: vi.fn(), rating: vi.fn() }; const events: unknown[] = [];
    form.addEventListener('hw:change', event => events.push((event as CustomEvent).detail.value));
    const slider = createRangeSlider(rangeRoot!, { onValueChange: calls.range });
    const view = createToggleGroup(singleRoot!, { onValueChange: calls.single });
    const format = createToggleGroup(multipleRoot!, { onValueChange: calls.multiple });
    const stars = createRating(ratingRoot!, { onValueChange: calls.rating });
    const [lower] = rangeRoot!.querySelectorAll('input'); input(lower!, '5');
    singleRoot!.querySelectorAll('input')[1]!.click(); multipleRoot!.querySelectorAll('button')[1]!.click(); ratingRoot!.querySelectorAll('input')[2]!.click();
    Object.values(calls).forEach(call => call.mockClear()); events.length = 0;
    form.reset(); await Promise.resolve();
    expect(slider.value).toEqual([20, 80]); expect(view.value).toBe('list'); expect(format.value).toEqual(['bold']); expect(stars.value).toBe(2);
    const data = new FormData(form);
    expect([data.get('low'), data.get('high'), data.get('view'), data.getAll('format'), data.get('stars')]).toEqual(['20', '80', 'list', ['bold'], '2']);
    expect(calls.range.mock.calls).toEqual([[[20, 80]]]); expect(calls.single.mock.calls).toEqual([['list']]); expect(calls.multiple.mock.calls).toEqual([[['bold']]]); expect(calls.rating.mock.calls).toEqual([[2]]);
    expect(events).toEqual([[20, 80], 'list', ['bold'], 2]);
  });

  it('[RESET-03] does not notify when the reset leaves the value unchanged', async () => {
    const form = mount(`<form>${range}${single}${multiple}${rating}<div data-hw="toggle-group" data-hw-multiple="true" role="group" aria-label="Empty"><button data-hw-value="a" aria-pressed="false">A</button></div></form>`) as HTMLFormElement;
    const changed = vi.fn(); form.addEventListener('hw:change', changed); const callback = vi.fn();
    const [rangeRoot, singleRoot, multipleRoot, ratingRoot, emptyRoot] = [...form.children] as HTMLElement[];
    createRangeSlider(rangeRoot!, { onValueChange: callback }); createToggleGroup(singleRoot!, { onValueChange: callback }); createToggleGroup(multipleRoot!, { onValueChange: callback }); createRating(ratingRoot!, { onValueChange: callback });
    const empty = createToggleGroup(emptyRoot!, { onValueChange: callback });
    form.reset(); await Promise.resolve();
    expect(changed).not.toHaveBeenCalled(); expect(callback).not.toHaveBeenCalled(); expect(empty.value).toEqual([]);
  });

  it('[RESET-04] an application that applies the notification agrees with the shown and submitted value', async () => {
    const form = mount(`<form>${range}</form>`) as HTMLFormElement; let held: [number, number] = [20, 80];
    const controller = createRangeSlider(form.firstElementChild as HTMLElement, { onValueChange: value => { held = value; } });
    const [lower, upper] = form.querySelectorAll('input'); input(upper!, '60'); expect(held).toEqual([20, 60]);
    form.reset(); await Promise.resolve();
    expect(held).toEqual(controller.value); expect([lower!.value, upper!.value]).toEqual(['20', '80']); expect(new FormData(form).get('high')).toBe('80');
  });

  it('[RESET-06] a default-prevented reset changes nothing and notifies nothing', async () => {
    const form = mount(`<form>${range}${single}</form>`) as HTMLFormElement; const callback = vi.fn();
    form.addEventListener('reset', event => event.preventDefault());
    const slider = createRangeSlider(form.children[0] as HTMLElement, { onValueChange: callback }); const view = createToggleGroup(form.children[1] as HTMLElement, { onValueChange: callback });
    input(form.querySelector<HTMLInputElement>('[data-hw-lower]')!, '5'); form.querySelectorAll<HTMLInputElement>('[name=view]')[1]!.click(); callback.mockClear();
    form.reset(); await Promise.resolve(); await new Promise(resolve => setTimeout(resolve, 0));
    expect(slider.value).toEqual([5, 80]); expect(view.value).toBe('grid'); expect(callback).not.toHaveBeenCalled();
  });

  it('[RESET-07] read-only and disabled controls reset; untouched read-only ones keep their value', async () => {
    const form = mount(`<form>${range.replace('data-hw="range-slider"', 'data-hw="range-slider" data-hw-readonly="true"')}${single.replace('<fieldset', '<fieldset disabled')}${multiple.replace('data-hw-multiple', 'data-hw-readonly="true" data-hw-multiple')}</form>`) as HTMLFormElement;
    const [rangeRoot, singleRoot, multipleRoot] = [...form.children] as HTMLElement[]; const callback = vi.fn();
    const slider = createRangeSlider(rangeRoot!, { onValueChange: callback }); const view = createToggleGroup(singleRoot!, { onValueChange: callback }); const format = createToggleGroup(multipleRoot!, { onValueChange: callback });
    // Script changes the disabled group's checked state; a reset still returns it.
    singleRoot!.querySelectorAll('input')[1]!.checked = true;
    form.reset(); await Promise.resolve();
    expect(slider.value).toEqual([20, 80]); expect(view.value).toBe('list'); expect(singleRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(true); expect(format.value).toEqual(['bold']);
    const data = new FormData(form); expect([data.get('low'), data.get('high'), data.getAll('format')]).toEqual(['20', '80', ['bold']]); expect(callback).not.toHaveBeenCalled();
  });

  it('[RESET-08] follows an external form named through the form attribute', async () => {
    document.body.innerHTML = `<form id="outer"></form>${range.replaceAll('<input', '<input form="outer"')}${single.replaceAll('<input', '<input form="outer"')}`;
    const form = document.querySelector('form')!; const [rangeRoot, singleRoot] = [...document.querySelectorAll<HTMLElement>('fieldset')]; const callback = vi.fn();
    const slider = createRangeSlider(rangeRoot!, { onValueChange: callback }); const view = createToggleGroup(singleRoot!, { onValueChange: callback });
    input(rangeRoot!.querySelector<HTMLInputElement>('[data-hw-lower]')!, '5'); singleRoot!.querySelectorAll('input')[1]!.click(); callback.mockClear();
    form.reset(); await Promise.resolve();
    expect(slider.value).toEqual([20, 80]); expect(view.value).toBe('list'); expect(callback.mock.calls).toEqual([[[20, 80]], ['list']]);
  });
});
