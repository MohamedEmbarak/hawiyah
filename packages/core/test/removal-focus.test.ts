import { afterEach, describe, expect, it } from 'vitest';
import { prepareRemovalFocus } from '../src/index.js';

afterEach(() => { document.body.replaceChildren(); });
const list = (count = 3) => {
  document.body.innerHTML = `<button id="elsewhere">Elsewhere</button><section id="root" tabindex="-1"><ul>${Array.from({ length: count }, (_, index) => `<li id="item-${index}"><span>Item ${index}</span><button data-remove id="remove-${index}">Remove</button></li>`).join('')}</ul></section>`;
  const root = document.getElementById('root')!;
  return { root, item: (index: number) => document.getElementById(`item-${index}`)!, remove: (index: number) => document.getElementById(`remove-${index}`)!, options: { item: ':scope > ul > li', control: '[data-remove]', fallback: root } };
};

describe('prepareRemovalFocus', () => {
  it('[REMOVAL-FOCUS-01] hands focus to the next item, then the previous one, then the fallback', () => {
    const { root, item, remove, options } = list();
    remove(1).focus();
    let restore = prepareRemovalFocus(root, remove(1), options);
    item(1).remove(); restore();
    expect(document.activeElement).toBe(remove(2));
    restore = prepareRemovalFocus(root, remove(2), options);
    item(2).remove(); restore();
    expect(document.activeElement).toBe(remove(0));
    restore = prepareRemovalFocus(root, remove(0), options);
    item(0).remove(); restore(); restore();
    expect(document.activeElement).toBe(root);
  });
  it('[REMOVAL-FOCUS-02] does nothing when focus was elsewhere, when the control stays, or when focus moved before the call', () => {
    const { root, item, remove, options } = list();
    document.getElementById('elsewhere')!.focus();
    const idle = prepareRemovalFocus(root, remove(1), options);
    item(1).remove(); idle();
    expect(document.activeElement).toBe(document.getElementById('elsewhere'));
    remove(0).focus();
    const kept = prepareRemovalFocus(root, remove(0), options); kept();
    expect(document.activeElement).toBe(remove(0));
    const moved = prepareRemovalFocus(root, remove(0), options);
    item(0).remove(); document.getElementById('elsewhere')!.focus(); moved();
    expect(document.activeElement).toBe(document.getElementById('elsewhere'));
  });
  it('[REMOVAL-FOCUS-03] skips disabled, aria-disabled, hidden and inert candidates', () => {
    const { root, item, remove, options } = list(5);
    (remove(2) as HTMLButtonElement).disabled = true; remove(3).setAttribute('aria-disabled', 'true'); item(4).hidden = true; item(0).setAttribute('inert', '');
    remove(1).focus();
    const restore = prepareRemovalFocus(root, remove(1), options);
    item(1).remove(); restore();
    expect(document.activeElement).toBe(root);
  });
  it('[REMOVAL-FOCUS-04] takes over when the control stays but becomes unavailable, and leaves focus alone without a fallback', () => {
    const { root, item, remove, options } = list(2);
    remove(0).focus();
    let restore = prepareRemovalFocus(root, remove(0), options);
    (remove(0) as HTMLButtonElement).disabled = true; remove(0).blur(); restore();
    expect(document.activeElement).toBe(remove(1));
    restore = prepareRemovalFocus(root, remove(1), { item: options.item, control: options.control });
    item(1).remove(); item(0).remove();
    expect(() => restore()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });
  it('[REMOVAL-FOCUS-05] works for sibling chips selected from their parent and for nested lists, and never throws', () => {
    document.body.innerHTML = '<div id="chips"><span class="hw-chip">One<button>x</button></span><span class="hw-chip">Two<button>x</button></span></div><ul id="outer"><li>Outer<ul><li><button id="a">a</button></li><li><button id="b">b</button></li></ul><button id="outer-remove">x</button></li></ul>';
    const chips = document.getElementById('chips')!; const [first, second] = Array.from(chips.querySelectorAll('button'));
    second!.focus();
    const restore = prepareRemovalFocus(chips, second!, { item: ':scope > .hw-chip', control: ':scope > button' });
    second!.parentElement!.remove(); restore();
    expect(document.activeElement).toBe(first);
    const outer = document.getElementById('outer')!; const a = document.getElementById('a')!; const b = document.getElementById('b')!;
    a.focus();
    const nested = prepareRemovalFocus(outer, a, { item: 'li', control: 'button' });
    a.parentElement!.remove(); nested();
    expect(document.activeElement).toBe(b);
    b.focus();
    expect(() => prepareRemovalFocus(outer, b, { item: '::invalid(', control: 'button' })()).not.toThrow();
    expect(document.activeElement).toBe(b);
  });
});
