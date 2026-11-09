import { afterEach, expect, it } from 'vitest';
import { createPortalHeader, enhance } from '../src/index.js';

afterEach(() => { document.body.innerHTML = ''; });
function markup() {
  document.body.innerHTML = `<header class="hw-portal-header" data-hw="portal-header"><button type="button" data-hw-portal-toggle>القائمة</button><nav data-hw-portal-navigation><a href="#main">الخدمات</a></nav></header><main id="main" tabindex="-1">المحتوى</main><button id="outside">خارج</button>`;
  return document.querySelector('header')!;
}
it('discloses navigation, returns focus on Escape and leaves Tab native', () => {
  const root = markup(); const controller = createPortalHeader(root);
  const trigger = root.querySelector('button')!; const nav = root.querySelector('nav')!; const link = root.querySelector('a')!;
  expect(trigger.getAttribute('aria-controls')).toBe(nav.id);
  trigger.click(); expect(controller.open).toBe(true);
  link.focus();
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  link.dispatchEvent(tab); expect(tab.defaultPrevented).toBe(false);
  link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger);
  trigger.click(); link.click(); expect(controller.open).toBe(false);
  trigger.click(); document.querySelector('#outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true })); expect(controller.open).toBe(false);
  trigger.click(); document.querySelector<HTMLButtonElement>('#outside')!.focus(); expect(controller.open).toBe(false);
  controller.destroy(); expect(nav.hasAttribute('data-open')).toBe(false); expect(trigger.hasAttribute('aria-expanded')).toBe(false);
  trigger.click(); expect(nav.hasAttribute('data-open')).toBe(false);
});
it('participates in enhancement cleanup and leaves no collapsed navigation without JS', () => {
  const root = markup(); const release = enhance(root);
  expect(root.querySelector('nav')!.dataset.open).toBe('false'); release();
  expect(root.querySelector('nav')!.hasAttribute('data-open')).toBe(false);
});

function branchHeader() {
  const root = document.createElement('header');
  root.innerHTML = `<button type="button" data-hw-portal-toggle>Menu</button><nav data-hw-portal-navigation>
    <details data-hw-portal-branch open><summary>Services</summary>
      <ul><li><details data-hw-portal-branch><summary>Licenses</summary><ul>
        <li><a href="#license" aria-current="page">Current license</a></li>
      </ul></details></li></ul>
    </details>
    <details data-hw-portal-branch><summary>Resources</summary><a href="#help">Help</a></details>
  </nav>`;
  document.body.append(root);
  const original = root.innerHTML;
  const controller = createPortalHeader(root);
  const [services,licenses,resources] = Array.from(root.querySelectorAll('details'));
  const summary = (branch: HTMLDetailsElement) => branch.querySelector('summary')!;
  return {root, original, controller, services, licenses, resources, summary, toggle:root.querySelector('button')!};
}

function escape(target: HTMLElement) {
  const event = new KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true});
  target.dispatchEvent(event);
  return event;
}

it('dismisses the innermost branch before the mobile navigation and restores each opener', () => {
  const {root,original,controller,toggle,services,licenses,summary} = branchHeader();
  toggle.click();
  expect(services.open).toBe(false);
  summary(services).click(); summary(licenses).click();
  const link = licenses.querySelector('a')!;
  link.focus();
  expect(escape(link).defaultPrevented).toBe(true);
  expect(services.open).toBe(true);
  expect(licenses.open).toBe(false);
  expect(document.activeElement).toBe(summary(licenses));
  expect(controller.open).toBe(true);
  escape(summary(licenses));
  expect(services.open).toBe(false);
  expect(document.activeElement).toBe(summary(services));
  escape(summary(services));
  expect(controller.open).toBe(false);
  expect(document.activeElement).toBe(toggle);
  expect(link.getAttribute('aria-current')).toBe('page');
  controller.destroy();
  expect(root.innerHTML).toBe(original);
  summary(services).click();
  expect(services.open).toBe(false);
  summary(services).click(); summary(licenses).click();
  expect(escape(link).defaultPrevented).toBe(false);
  expect(licenses.open).toBe(true);
});

it('preserves link activation and authored current state while closing siblings, outside branches and multiple instances', () => {
  const first = branchHeader(), second = branchHeader();
  first.summary(first.resources).click();
  expect(first.services.open).toBe(false);
  expect(first.resources.open).toBe(true);
  expect(second.services.open).toBe(true);
  const help = first.resources.querySelector('a')!;
  let activationPrevented = true;
  first.root.addEventListener('click', event => {
    if (event.target === help) {
      activationPrevented = event.defaultPrevented;
      event.preventDefault();
    }
  });
  help.click();
  expect(activationPrevented).toBe(false);
  expect(first.resources.open).toBe(false);
  expect(second.services.open).toBe(true);

  first.summary(first.services).click();
  first.summary(first.services).focus();
  first.summary(first.resources).focus();
  expect(first.services.open).toBe(false);
  first.summary(first.resources).click();
  first.root.dispatchEvent(new Event('pointerdown',{bubbles:true}));
  expect(first.resources.open).toBe(false);
  expect(second.services.open).toBe(false);
  first.summary(first.services).click();
  first.controller.close();
  expect(first.services.open).toBe(false);

  first.controller.destroy(); second.controller.destroy();
  expect(first.root.innerHTML).toBe(first.original);
  expect(second.root.innerHTML).toBe(second.original);
});
