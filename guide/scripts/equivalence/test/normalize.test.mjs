// Self-tests of the normaliser (contentPipeline.equivalence.selfTest) on synthetic
// DOM in jsdom. normalize() is evaluated from its source text inside the jsdom
// window, as Playwright does in a frame, so a closure over module scope would fail.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { compareStructure } from '../compare.mjs';
import { generatedIdForms, generatedNamePattern } from '../generated-names.mjs';
import { normalize } from '../normalize.js';
import { styledAttributes, styledAttributesOf } from '../styled-attributes.mjs';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
// As the harness passes them: read from the installed packages.
const generatedName = generatedNamePattern(guideDir);
const styled = styledAttributes(guideDir);

/** Normalises '<div id="app">…</div>' (or another mount) in a fresh jsdom document. */
function tree(body, selector = '#app') {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, { runScripts: 'outside-only' });
  const evaluated = dom.window.eval(`(${normalize.toString()})`);
  return evaluated({ target: selector, generatedName, styled });
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
// hw- class around each panel, _ngcontent, ng-reflect and jsaction attributes, a
// directive selector attribute with a static input value, and comments.
const angularTabs = `<guide-example _nghost-ng-c1=""><!--container--><div class="hw-tabs" _ngcontent-ng-c1="">
<div class="hw-tab-list" role="tablist" aria-label="Request details" ng-reflect-label="x">
<button class="hw-tab" type="button" role="tab" id="hw-tabs-7-tab-0" aria-controls="hw-tabs-7-panel-0" aria-selected="true" tabindex="0" jsaction="click:;">Overview</button><button type="button" class="hw-tab" role="tab" id="hw-tabs-7-tab-1" aria-controls="hw-tabs-7-panel-1" aria-selected="false" tabindex="-1" hwtab="" key="b">History</button></div>
<hw-tab value="a"><section role="tabpanel" class="hw-tab-panel" id="hw-tabs-7-panel-0" aria-labelledby="hw-tabs-7-tab-0"><p>Under   review.</p></section></hw-tab>
<hw-tab value="b"><section class="hw-tab-panel" role="tabpanel" id="hw-tabs-7-panel-1" aria-labelledby="hw-tabs-7-tab-1" hidden=""><p>Submitted.</p></section></hw-tab>
</div></guide-example>`;

const differs = (a, b) => compareStructure({ vanilla: a, react: b })[0];

describe('normalize', () => {
  it('produces the documented node shape: every attribute but the framework noise', () => {
    expect(tree('<div id="app"><button class="x hw-button hw-a ng-star-inserted" data-variant="primary" data-hw="button" data-hw-x="1" data-v-12="" data-ngh="1" _ngcontent-ng-c1="" ng-reflect-variant="primary" jsaction="click:;" ngh="0" style="color:red" hwbutton="" variant="primary" size="sm" accesskey="k" type="button" disabled="disabled">Go</button></div>')).toEqual([
      { tag: 'button', attrs: { accesskey: 'k', class: 'hw-a hw-button x', 'data-hw-x': '1', 'data-variant': 'primary', disabled: 'disabled', style: 'color: red;', type: 'button' }, children: ['Go'] },
    ]);
  });

  it('keeps an attribute outside the old list of native attributes, so one adapter without it fails', () => {
    const result = differs(
      tree('<div id="app"><button class="hw-button" type="button" popovertarget="menu" enterkeyhint="go">Go</button><div id="menu" popover="">m</div></div>'),
      tree('<div id="app"><button class="hw-button" type="button" popovertarget="menu">Go</button><div id="menu" popover="">m</div></div>'),
    );
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].attrs.enterkeyhint');
  });

  it('compares name values as written: two different names fail, generated names are numbered', () => {
    const named = (name) => tree(`<div id="app"><input type="radio" name="${name}"></div>`);
    const result = differs(named('alpha'), named('beta'));
    expect(result.equal).toBe(false);
    expect(result.message).toContain('"alpha"');
    expect(differs(named('_r_1_'), named('hw-control-3')).equal).toBe(true);
    expect(named('v-0-1-rating')[0].attrs.name).toBe('name#1');
  });

  it('compares a custom-element host that carries role or aria-*; a plain framework host is unwrapped', () => {
    const plain = tree('<div id="app"><p>x</p></div>');
    expect(tree('<div id="app"><x-wrap data-x="1"><p>x</p></x-wrap></div>')).toEqual(plain);
    const wrapped = tree('<div id="app"><x-wrap role="region" aria-label="Wrapper"><p>x</p></x-wrap></div>');
    expect(wrapped).toEqual([{ tag: 'div', attrs: { 'aria-label': 'Wrapper', role: 'region' }, children: [{ tag: 'p', attrs: {}, children: ['x'] }] }]);
    expect(differs(plain, wrapped).equal).toBe(false);
  });

  it('compares inline style as serialised and fails on a different style', () => {
    expect(differs(tree('<div id="app"><p style="color:red;margin-inline:0">x</p></div>'), tree('<div id="app"><p style="color: red; margin-inline: 0">x</p></div>')).equal).toBe(true);
    const result = differs(tree('<div id="app"><p style="color: red">x</p></div>'), tree('<div id="app"><p style="color: blue">x</p></div>'));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].attrs.style');
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

  it('rewrites dangling references, keeps written names, and adds live properties', () => {
    const dom = new JSDOM('<!doctype html><div id="app"><label for="f">L</label><input id="f" name="first-name" aria-describedby="f-hint nowhere" value="a"><input type="checkbox" name="agree"></div>', { runScripts: 'outside-only' });
    const evaluated = dom.window.eval(`(${normalize.toString()})`);
    const box = dom.window.document.querySelector('[type=checkbox]');
    box.indeterminate = true;
    dom.window.document.querySelector('#f').value = 'typed';
    expect(evaluated('#app')).toEqual([
      { tag: 'label', attrs: { for: '#1' }, children: ['L'] },
      { tag: 'input', attrs: { 'aria-describedby': '#? #?', id: '#1', name: 'first-name', value: 'a' }, props: { value: 'typed', checked: false, indeterminate: false }, children: [] },
      { tag: 'input', attrs: { name: 'agree', type: 'checkbox' }, props: { value: 'on', checked: false, indeterminate: true }, children: [] },
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

  // Self-tests for the four renders of the second verification (v2/eq/batch-b.json).
  it('fails on a styled data-hw-* attribute that one adapter writes (data-hw-mode on the JavaScript button)', () => {
    const button = (extra) => tree(`<div id="app"><button class="hw-button" type="button" data-variant="primary"${extra}>Continue</button></div>`);
    const result = differs(button(' data-hw-mode="light"'), button(''));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].attrs["data-hw-mode"]');
  });

  it('compares a custom element that carries tabindex, lang, draggable or contenteditable', () => {
    const plain = tree('<div id="app"><button class="hw-button" type="button">Go</button></div>');
    for (const attribute of ['tabindex="0"', 'lang="fr"', 'draggable="true"', 'contenteditable="false"', 'hidden', 'inert', 'title="t"', 'dir="rtl"']) {
      const wrapped = tree(`<div id="app"><x-wrap ${attribute}><button class="hw-button" type="button">Go</button></x-wrap></div>`);
      expect(differs(plain, wrapped).equal, attribute).toBe(false);
    }
  });

  it('compares a custom element that carries a data-hw-* attribute the package stylesheet selects (verification W2)', () => {
    const plain = tree('<div id="app"><button class="hw-button" type="button">Go</button></div>');
    for (const attribute of ['data-hw-mode="light"', 'data-hw-theme="custom"', 'data-hw-density="compact"']) {
      const wrapped = tree(`<div id="app"><x-wrap ${attribute}><button class="hw-button" type="button">Go</button></x-wrap></div>`);
      expect(differs(plain, wrapped).equal, attribute).toBe(false);
    }
    const vanilla = tree(vanillaTabs());
    const host = (extra) => tree(angularTabs.replace('<guide-example _nghost-ng-c1="">', `<guide-example _nghost-ng-c1=""><hw-tabs${extra}>`).replace('</guide-example>', '</hw-tabs></guide-example>'), 'guide-example');
    expect(differs(vanilla, host(' data-hw-mode="light"')).equal).toBe(false);
    // A data-* attribute that no rule of the stylesheet selects still leaves a framework host unwrapped.
    expect(differs(vanilla, host(' data-test="x"')).equal).toBe(true);
  });

  it('compares data-hw-value, which all four adapters write on list items, and leaves it out only on a tab', () => {
    const item = (value) => tree(`<div id="app"><ul class="hw-list"><li data-hw-value="${value}">One</li></ul></div>`);
    const result = differs(item('one'), item('two'));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].attrs["data-hw-value"]');
    // createTabs reads the value of a tab from data-hw-value; the adapters take it as a prop.
    expect(differs(tree(vanillaTabs()), tree(vanillaTabs().replace('id="t-a"', 'id="t-a" data-hw-value="overview"'))).equal).toBe(true);
    expect(differs(tree(vanillaTabs()), tree(vanillaTabs().replace('class="hw-tab-panel" id="p-a"', 'class="hw-tab-panel" id="p-a" data-hw-value="overview"'))).equal).toBe(false);
  });

  it('fails on tabindex on an Angular component host without hw- class', () => {
    const vanilla = tree(vanillaTabs());
    const angular = tree(angularTabs.replace('<guide-example _nghost-ng-c1="">', '<guide-example _nghost-ng-c1=""><hw-tabs tabindex="0">').replace('</guide-example>', '</hw-tabs></guide-example>'), 'guide-example');
    expect(differs(vanilla, angular).equal).toBe(false);
    expect(differs(vanilla, tree(angularTabs.replace('<guide-example _nghost-ng-c1="">', '<guide-example _nghost-ng-c1=""><hw-tabs>').replace('</guide-example>', '</hw-tabs></guide-example>'), 'guide-example')).equal).toBe(true);
  });

  it('compares names of the form hw-<words>-<n> that no adapter generates', () => {
    const named = (name) => tree(`<div id="app"><input type="radio" name="${name}"></div>`);
    expect(differs(named('hw-step-1'), named('hw-pay-2')).equal).toBe(false);
    expect(named('hw-step-1')[0].attrs.name).toBe('hw-step-1');
  });

  it('leaves out a vanilla configuration hook only where the stylesheet does not select it', () => {
    const root = (extra) => tree(`<div id="app"><div class="hw-tabs" data-hw="tabs"${extra}><div class="hw-tab-list" role="tablist" aria-label="x" data-hw-overflow="scroll"></div></div></div>`);
    expect(differs(root(' data-hw-overflow="scroll" data-hw-activation="manual"'), root('')).equal).toBe(true);
    const list = (value) => tree(`<div id="app"><div class="hw-tabs"><div class="hw-tab-list" role="tablist" aria-label="x"${value}></div></div></div>`);
    const result = differs(list(' data-hw-overflow="menu"'), list(''));
    expect(result.equal).toBe(false);
    expect(result.path).toBe('$[0].children[0].attrs["data-hw-overflow"]');
  });
});

describe('the inputs of the normaliser are read from the installed packages', () => {
  const vanilla = readdirSync(join(guideDir, 'node_modules', '@hawiyah', 'vanilla', 'dist'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(join(guideDir, 'node_modules', '@hawiyah', 'vanilla', 'dist', name), 'utf8'))
    .join('\n');

  it('every vanilla configuration hook occurs in @hawiyah/vanilla', () => {
    const hooks = [...normalize.toString().matchAll(/'(data-hw-[a-z-]+)', \/\/ /g)].map((match) => match[1]);
    expect(hooks.length).toBeGreaterThan(0);
    for (const hook of hooks) {
      const dataset = `dataset.hw${hook.slice('data-hw-'.length).replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase())}`;
      expect(vanilla.includes(hook) || vanilla.includes(dataset), hook).toBe(true);
    }
  });

  it('the styled attributes come from selectors of @hawiyah/styles', () => {
    expect(Object.keys(styled)).toEqual(expect.arrayContaining(['data-hw-mode', 'data-hw-theme', 'data-hw-readonly', 'data-hw-page', 'data-hw-overflow']));
    expect(styled['data-hw-overflow']).toEqual(['.hw-tab-list[data-hw-overflow]']);
    expect(styledAttributesOf(".a :where([data-hw-x='1']) b:hover, .b[data-hw-y]::before { color: red }")).toEqual({ 'data-hw-x': ['[data-hw-x]'], 'data-hw-y': ['.b[data-hw-y]'] });
  });

  it('the generated name forms come from the four adapters', () => {
    const forms = generatedIdForms(guideDir);
    expect(forms).toHaveLength(4);
    const pattern = new RegExp(generatedName);
    for (const name of ['hw-tab-3', 'hw-control-3', '_r_1_', 'hw-field-_R_1H2_', 'hw-v-0', 'v-0-1-rating']) expect(pattern.test(name), name).toBe(true);
    for (const name of ['hw-step-1', 'hw-pay-2', 'hw-radio-group-3', 'alpha', ':r1:']) expect(pattern.test(name), name).toBe(false);
  });
});
