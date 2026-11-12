import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeFormReset, sameValue } from '../src/form-reset.js';

afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });
const page = (html: string) => { document.body.innerHTML = html; return document.body; };

describe('observeFormReset', () => {
  it('[FORM-RESET-01] reports a reset once, with the controls already reset, and nothing after destroy or for another form', async () => {
    const root = page('<form id="a"><input name="x" value="initial"></form><form id="b"><input name="y"></form>');
    const input = root.querySelector<HTMLInputElement>('#a input')!;
    const seen: string[] = [];
    const observer = observeFormReset(input, () => seen.push(input.value));
    input.value = 'changed';
    root.querySelector<HTMLFormElement>('#b')!.reset(); await Promise.resolve();
    expect(seen).toEqual([]);
    root.querySelector<HTMLFormElement>('#a')!.reset();
    expect(seen).toEqual([]);
    await Promise.resolve();
    expect(seen).toEqual(['initial']);
    observer.destroy(); observer.destroy();
    root.querySelector<HTMLFormElement>('#a')!.reset(); await Promise.resolve();
    expect(seen).toEqual(['initial']);
  });

  it('[FORM-RESET-02] ignores a reset that a later listener prevents', async () => {
    const root = page('<form><input name="x" value="initial"></form>');
    const form = root.querySelector('form')!; const onReset = vi.fn();
    observeFormReset(form.querySelector('input')!, onReset);
    const prevent = (event: Event) => event.preventDefault();
    form.addEventListener('reset', prevent); form.reset(); await Promise.resolve();
    expect(onReset).not.toHaveBeenCalled();
    form.removeEventListener('reset', prevent); form.reset(); await Promise.resolve();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('[FORM-RESET-03] follows the form attribute, also when it changes after observing', async () => {
    const root = page('<form id="a"></form><form id="b"></form><input name="x" form="a">');
    const input = root.querySelector('input')!; const onReset = vi.fn();
    observeFormReset(input, onReset);
    const [a, b] = Array.from(root.querySelectorAll('form'));
    a!.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(1);
    input.setAttribute('form', 'b');
    a!.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(1);
    b!.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(2);
    input.setAttribute('form', 'missing');
    b!.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(2);
  });

  it('[FORM-RESET-04] resolves the form of the first control inside a wrapper, else the closest form', async () => {
    const root = page('<form id="outer"><div id="wrapper"><input name="x" form="other"></div><div id="plain"><span>Text</span></div></form><form id="other"></form>');
    const wrapped = vi.fn(); const plain = vi.fn();
    observeFormReset(root.querySelector('#wrapper')!, wrapped);
    observeFormReset(root.querySelector('#plain')!, plain);
    root.querySelector<HTMLFormElement>('#outer')!.reset(); await Promise.resolve();
    expect(wrapped).not.toHaveBeenCalled(); expect(plain).toHaveBeenCalledTimes(1);
    root.querySelector<HTMLFormElement>('#other')!.reset(); await Promise.resolve();
    expect(wrapped).toHaveBeenCalledTimes(1); expect(plain).toHaveBeenCalledTimes(1);
  });

  it('[FORM-RESET-05] hears a form that is not connected yet and reports once after it is connected', async () => {
    const form = document.createElement('form'); form.innerHTML = '<input name="x">';
    const onReset = vi.fn();
    observeFormReset(form.querySelector('input')!, onReset);
    form.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(1);
    document.body.append(form);
    form.reset(); await Promise.resolve(); expect(onReset).toHaveBeenCalledTimes(2);
  });

  it('[FORM-RESET-06] hears a reset inside a shadow tree at the shadow root', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' }); shadow.innerHTML = '<form><input name="x"></form>';
    const onReset = vi.fn();
    const observer = observeFormReset(shadow.querySelector('input')!, onReset);
    shadow.querySelector('form')!.reset(); await Promise.resolve();
    expect(onReset).toHaveBeenCalledTimes(1);
    observer.destroy();
  });

  it('[FORM-RESET-07] waits for the end of a dispatch that is still running in the microtask, and still honours a late preventDefault', async () => {
    vi.useFakeTimers();
    const root = page('<form><input name="x"></form>');
    const form = root.querySelector('form')!; const onReset = vi.fn();
    observeFormReset(form.querySelector('input')!, onReset);
    // A reset the reader activates runs its microtasks between listeners, while the event is still being dispatched.
    const dispatching = (prevented: boolean) => ({ type: 'reset', target: form, eventPhase: 2, defaultPrevented: prevented }) as unknown as Event;
    const listeners: EventListener[] = [];
    const add = vi.spyOn(document, 'addEventListener').mockImplementation((_type, listener) => { listeners.push(listener as EventListener); });
    const second = observeFormReset(form.querySelector('input')!, onReset);
    add.mockRestore();
    expect(listeners).toHaveLength(1);
    listeners[0]!(dispatching(false)); await Promise.resolve();
    expect(onReset).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onReset).toHaveBeenCalledTimes(1);
    listeners[0]!(dispatching(true)); await Promise.resolve(); vi.runAllTimers();
    expect(onReset).toHaveBeenCalledTimes(1);
    second.destroy();
  });

  it('[FORM-RESET-08] does nothing on a DOM that cannot listen', () => {
    const control = { ownerDocument: {}, matches: () => true, form: null } as unknown as Element;
    const observer = observeFormReset(control, () => { throw new Error('unreachable'); });
    expect(() => { observer.destroy(); observer.destroy(); }).not.toThrow();
  });
});

describe('sameValue', () => {
  it('[FORM-RESET-04] compares with Object.is and arrays by content', () => {
    expect(sameValue('a', 'a')).toBe(true); expect(sameValue(Number.NaN, Number.NaN)).toBe(true);
    expect(sameValue(0, -0)).toBe(false); expect(sameValue('', null)).toBe(false);
    expect(sameValue([], [])).toBe(true); expect(sameValue(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(sameValue([20, 80], [20, 80])).toBe(true); expect(sameValue(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameValue(['a'], ['a', 'b'])).toBe(false); expect(sameValue(['a'], 'a')).toBe(false);
    const file = {}; expect(sameValue([file], [file])).toBe(true); expect(sameValue([{}], [{}])).toBe(false);
  });
});
