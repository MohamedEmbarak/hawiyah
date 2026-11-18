// Self-tests of the normaliser (contentPipeline.equivalence.selfTest) on synthetic
// DOM in jsdom. normalize() is evaluated from its source text inside the jsdom
// window, as Playwright does in a frame, so a closure over module scope would fail.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { compareStructure } from '../compare.mjs';
import { normalize } from '../normalize.js';

/** Normalises '<div id="app">…</div>' (or another mount) in a fresh jsdom document. */
function tree(body, selector = '#app') {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, { runScripts: 'outside-only' });
  const evaluated = dom.window.eval(`(${normalize.toString()})`);
  return evaluated(selector);
}

const vanillaTabs = (extra = {}) => `<div id="app"><div class="hw-tabs" data-hw="tabs">
  <div class="hw-tab-list" role="tablist" aria-label="Request details">
    <button class="hw-tab" type="button" role="tab" id="t-a" aria-controls="p-a" aria-selected="true" tabindex="0">${extra.text ?? 'Overview'}</button>
    <button class="hw-tab${extra.classes ?? ''}" type="button" role="${extra.role ?? 'tab'}" id="t-b" ${extra.noControls ? '' : 'aria-controls="p-b"'} aria-selected="false" tabindex="-1">History</button>
  </div>
  <section class="hw-tab-panel" id="p-a" role="tabpanel" aria-labelledby="t-a"><p>Under review.</p></section>
  <section class="hw-tab-panel" id="p-b" role="tabpanel" aria-labelledby="t-b" hidden><p>Submitted.</p></section>
</div></div>`;

// The same result as an Angular component would render it: other ids, a host without
// hw- class around each panel, _ngcontent and ng-reflect attributes, comments and styles.
const angularTabs = `<guide-example _nghost-ng-c1=""><!--container--><div class="hw-tabs" _ngcontent-ng-c1="">
<div class="hw-tab-list" role="tablist" aria-label="Request details" ng-reflect-label="x">
<button class="hw-tab" type="button" role="tab" id="hw-tabs-7-tab-0" aria-controls="hw-tabs-7-panel-0" aria-selected="true" tabindex="0" jsaction="click:;">Overview</button><button type="button" class="hw-tab" role="tab" id="hw-tabs-7-tab-1" aria-controls="hw-tabs-7-panel-1" aria-selected="false" tabindex="-1" style="color: red">History</button></div>
<hw-tab value="a" style="display: contents"><section role="tabpanel" class="hw-tab-panel" id="hw-tabs-7-panel-0" aria-labelledby="hw-tabs-7-tab-0"><p>Under   review.</p></section></hw-tab>
<hw-tab value="b"><section class="hw-tab-panel" role="tabpanel" id="hw-tabs-7-panel-1" aria-labelledby="hw-tabs-7-tab-1" hidden=""><p>Submitted.</p></section></hw-tab>
</div></guide-example>`;

const differs = (a, b) => compareStructure({ vanilla: a, react: b })[0];

describe('normalize', () => {
  it('produces the documented node shape', () => {
    expect(tree('<div id="app"><button class="x hw-button hw-a" data-variant="primary" data-hw-x="1" data-v-12="" data-ngh="1" style="color:red" hwbutton="" type="button" disabled="disabled">Go</button></div>')).toEqual([
      { tag: 'button', attrs: { class: 'hw-a hw-button', 'data-variant': 'primary', disabled: 'disabled', type: 'button' }, children: ['Go'] },
    ]);
  });

  it('passes equal trees with different ids and Angular hosts', () => {
    const a = tree(vanillaTabs());
    const b = tree(angularTabs, 'guide-example');
    expect(differs(a, b)).toEqual({ pair: 'vanilla-react', equal: true });
    expect(a[0].children[0].children[0].attrs).toMatchObject({ id: '#1', 'aria-controls': '#3' });
  });

  it('compares a custom element with an hw- class as div', () => {
    expect(tree('<div id="app"><hw-box class="hw-card"><p>x</p></hw-box></div>')).toEqual([{ tag: 'div', attrs: { class: 'hw-card' }, children: [{ tag: 'p', attrs: {}, children: ['x'] }] }]);
  });

  it('rewrites names and dangling references, and adds live properties', () => {
    const dom = new JSDOM('<!doctype html><div id="app"><label for="f">L</label><input id="f" name="first-name" aria-describedby="f-hint nowhere" value="a"><input type="checkbox" name="agree"></div>', { runScripts: 'outside-only' });
    const evaluated = dom.window.eval(`(${normalize.toString()})`);
    const box = dom.window.document.querySelector('[type=checkbox]');
    box.indeterminate = true;
    dom.window.document.querySelector('#f').value = 'typed';
    expect(evaluated('#app')).toEqual([
      { tag: 'label', attrs: { for: '#1' }, children: ['L'] },
      { tag: 'input', attrs: { 'aria-describedby': '#? #?', id: '#1', name: 'name#1', value: 'a' }, props: { value: 'typed', checked: false, indeterminate: false }, children: [] },
      { tag: 'input', attrs: { name: 'name#2', type: 'checkbox' }, props: { value: 'on', checked: false, indeterminate: true }, children: [] },
    ]);
  });

  it('keeps attribute values as written and drops white-space-only text', () => {
    expect(tree('<div id="app">\n  <div hidden="until-found"> a  \n b </div>\n</div>')).toEqual([{ tag: 'div', attrs: { hidden: 'until-found' }, children: ['a b'] }]);
  });

  // Negative controls: each one must fail.
  it('fails on a missing aria-controls', () => {
    const result = differs(tree(vanillaTabs()), tree(vanillaTabs({ noControls: true })));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].children[1].attrs["aria-controls"]');
  });

  it('fails on an extra hw- class', () => {
    const result = differs(tree(vanillaTabs()), tree(vanillaTabs({ classes: ' hw-extra' })));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].children[1].attrs.class');
  });

  it('fails on different text', () => {
    const result = differs(tree(vanillaTabs()), tree(vanillaTabs({ text: 'Summary' })));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].children[0].children[0]');
    expect(result.message).toContain('"Overview"');
  });

  it('fails on a different role', () => {
    const result = differs(tree(vanillaTabs()), tree(vanillaTabs({ role: 'button' })));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].children[1].attrs.role');
  });
});
