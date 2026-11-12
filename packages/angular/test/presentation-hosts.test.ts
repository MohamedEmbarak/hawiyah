import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { contentOf, page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); });

const overflow = (count: number) => `${count} more`;
const consent = 'title="Cookies" description="We use cookies." acceptLabel="Accept" rejectLabel="Reject"';
/** Presentational hosts that are the styled element: the tag, the inputs it needs, the class it carries. */
const hosts: [tag: string, attributes: string, name: string][] = [
  ['hw-alert', '', 'hw-alert'], ['hw-skeleton', '', 'hw-skeleton'], ['hw-spinner', 'label="Loading"', 'hw-spinner'], ['hw-empty-state', 'title="No requests"', 'hw-empty'],
  ['hw-badge', '', 'hw-badge'], ['hw-avatar', 'name="Sara Ali"', 'hw-avatar'], ['hw-chip', '', 'hw-chip'], ['hw-button-group', 'label="Actions"', 'hw-button-group'],
  ['hw-avatar-group', 'label="Team" [getOverflowLabel]="overflow"', 'hw-avatar-group'], ['hw-stat', 'label="Requests" value="3"', 'hw-stat'], ['hw-cookie-consent', consent, 'hw-cookie-consent'],
];

describe('Angular presentational hosts', () => {
  for (const [tag, attributes, name] of hosts) {
    it(`[ATTR-01][feedback-status-14] ${tag}: class, id, data-x and aria-describedby written on the host are on the element with class ${name}; there is no inner .${name}`, () => {
      const { root } = page(`<p id="note">Note</p><${tag} ${attributes} class="mine" id="own" data-x="1" aria-describedby="note" style="inline-size: 40%"></${tag}>`, { overflow });
      const box = root.querySelector(`.${name}`)!;
      expect(box.localName).toBe(tag); expect(box.id).toBe('own'); expect(box.classList.contains('mine')).toBe(true); expect(box.getAttribute('data-x')).toBe('1'); expect(box.getAttribute('aria-describedby')).toBe('note');
      expect((box as HTMLElement).style.inlineSize).toBe('40%');
      expect(box.querySelector(`.${name}`)).toBeNull(); expect(root.querySelectorAll(`.${name}`)).toHaveLength(1);
    });
  }

  it('[ATTR-01] an aria-label written on hw-badge, hw-spinner, hw-button-group, hw-avatar-group and an hw-avatar that shows its image stays on that element', () => {
    const { root } = page(`<hw-badge aria-label="Approved request">Approved</hw-badge><hw-spinner aria-label="Loading results" /><hw-button-group aria-label="Actions"><button type="button">Save</button></hw-button-group>
      <hw-avatar-group aria-label="Team" [getOverflowLabel]="overflow" [items]="[{name: 'Sara Ali'}]" /><hw-avatar id="portrait" name="Sara Ali" src="/sara.png" aria-label="Portrait of Sara Ali" />`, { overflow });
    expect(root.querySelector('.hw-badge')!.getAttribute('aria-label')).toBe('Approved request'); expect(root.querySelector('.hw-spinner')!.getAttribute('aria-label')).toBe('Loading results');
    expect(root.querySelector('.hw-button-group')!.getAttribute('aria-label')).toBe('Actions'); expect(root.querySelector('.hw-avatar-group')!.getAttribute('aria-label')).toBe('Team');
    expect(root.querySelector('#portrait')!.getAttribute('aria-label')).toBe('Portrait of Sara Ali'); expect(root.querySelector('#portrait')!.hasAttribute('role')).toBe(false);
  });

  it('[ATTR-01][feedback-status-9] hw-skeleton is an empty, aria-hidden host sized by its own style and class', () => {
    const { root } = page(`<hw-skeleton class="wide" style="inline-size: 60%; block-size: 2rem" />`);
    const skeleton = root.querySelector<HTMLElement>('hw-skeleton')!;
    expect(skeleton.className).toBe('hw-skeleton wide'); expect(skeleton.getAttribute('aria-hidden')).toBe('true'); expect(skeleton.style.inlineSize).toBe('60%'); expect(skeleton.style.blockSize).toBe('2rem');
    expect(skeleton.childNodes).toHaveLength(0);
  });

  it('[ATTR-01][feedback-status-1] hw-alert is the alert: its content box is its first child and no section or inner alert exists', () => {
    const { root } = page(`<hw-alert tone="success" title="Saved" class="mine">Your draft is stored.</hw-alert>`);
    const alert = root.querySelector('hw-alert')!;
    expect(alert.className).toBe('hw-alert mine'); expect(alert.hasAttribute('title')).toBe(false); expect(alert.getAttribute('data-tone')).toBe('success'); expect(alert.hasAttribute('data-variant')).toBe(false);
    expect(contentOf(alert).map(node => (node as Element).className)).toEqual(['hw-alert-content']); expect(alert.querySelector('.hw-alert-content')!.textContent).toBe('SavedYour draft is stored.');
  });

  it('[ATTR-02][feedback-status-14] hw-button-group: label writes aria-label over what the application wrote; without label the application value is back', () => {
    const { root, update } = page(`<hw-button-group [label]="label" aria-label="From the page" id="bound"><button type="button">Save</button></hw-button-group><hw-button-group [label]="label" [attr.aria-label]="own" role="toolbar" id="authored"><button type="button">Save</button></hw-button-group>`, { label: 'Actions', own: 'Bound by the page' });
    const [bound, authored] = [root.querySelector('#bound')!, root.querySelector('#authored')!];
    for (const group of [bound, authored]) { expect(group.getAttribute('aria-label')).toBe('Actions'); expect(group.getAttribute('role')).toBe('group'); }
    update({ label: '' });
    expect(bound.getAttribute('aria-label')).toBe('From the page'); expect(authored.getAttribute('aria-label')).toBe('Bound by the page'); expect(bound.getAttribute('role')).toBe('group');
    update({ label: 'Again' });
    expect(bound.getAttribute('aria-label')).toBe('Again'); expect(authored.getAttribute('aria-label')).toBe('Again');
  });

  it('[NAME-02][NAME-04] hw-button-group and hw-avatar-group: an application aria-label or aria-labelledby alone gives no warning; neither gives one warning each and no aria-label', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<h2 id="heading">Heading</h2><hw-button-group aria-label="Actions" /><hw-button-group aria-labelledby="heading" /><hw-avatar-group aria-labelledby="heading" [getOverflowLabel]="overflow" />`, { overflow });
    update(); expect(warnings).toEqual([]); expect(root.querySelectorAll('.hw-button-group')[1]!.hasAttribute('aria-label')).toBe(false);
    const unnamed = page(`<hw-button-group /><hw-avatar-group [getOverflowLabel]="overflow" />`, { overflow }); unnamed.update();
    for (const name of ['hw-button-group', 'hw-avatar-group']) { const group = unnamed.root.querySelector(`.${name}`)!; expect(group.hasAttribute('aria-label')).toBe(false); expect(group.getAttribute('role')).toBe('group'); }
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-button-group requires "label"', 'Hawiyah: hw-avatar-group requires "label"']);
  });

  it('[ATTR-02][feedback-status-14] hw-avatar: role=img and aria-label=name appear when the image fails and disappear when a new src loads', () => {
    const { root, update } = page(`<hw-avatar name="Sara Ali" [src]="src" /><hw-avatar name="Omar Hassan" size="lg" variant="square" />`, { src: '/missing.png' });
    const [portrait, initials] = [...root.querySelectorAll('hw-avatar')];
    expect(portrait!.hasAttribute('role')).toBe(false); expect(portrait!.hasAttribute('aria-label')).toBe(false); expect(portrait!.querySelector('img')!.alt).toBe('Sara Ali');
    expect(portrait!.hasAttribute('data-size')).toBe(false); expect(portrait!.hasAttribute('data-variant')).toBe(false);
    portrait!.querySelector('img')!.dispatchEvent(new Event('error')); update();
    expect(portrait!.getAttribute('role')).toBe('img'); expect(portrait!.getAttribute('aria-label')).toBe('Sara Ali'); expect(portrait!.querySelector('img')).toBeNull(); expect(portrait!.querySelector('span[aria-hidden=true]')!.textContent).toBe('SA');
    update({ src: '/sara.png' });
    expect(portrait!.hasAttribute('role')).toBe(false); expect(portrait!.hasAttribute('aria-label')).toBe(false); expect(portrait!.querySelector('img')!.getAttribute('src')).toBe('/sara.png');
    expect(initials!.getAttribute('role')).toBe('img'); expect(initials!.getAttribute('aria-label')).toBe('Omar Hassan'); expect(initials!.getAttribute('data-size')).toBe('lg'); expect(initials!.getAttribute('data-variant')).toBe('square'); expect(initials!.textContent).toBe('OH');
  });

  it('[ATTR-03][content-display-1] hw-card: aria-label, aria-labelledby and aria-describedby, static and bound, are on the article or the anchor; the host has none', () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-card aria-label="Static name" aria-describedby="note"><p>Body</p></hw-card><hw-card aria-labelledby="heading" href="/next"><p>Body</p></hw-card><hw-card [aria-label]="name" [aria-describedby]="'note'" variant="elevated"><p>Body</p></hw-card>`, { name: 'Bound name' });
    const cards = [...root.querySelectorAll('hw-card')], targets = cards.map(card => card.querySelector('.hw-card')!);
    for (const card of cards) for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby']) expect(card.hasAttribute(attribute), attribute).toBe(false);
    expect(targets.map(target => target.localName)).toEqual(['article', 'a', 'article']);
    expect(targets[0]!.getAttribute('aria-label')).toBe('Static name'); expect(targets[0]!.getAttribute('aria-describedby')).toBe('note'); expect(targets[0]!.hasAttribute('data-variant')).toBe(false);
    expect(targets[1]!.getAttribute('aria-labelledby')).toBe('heading'); expect(targets[1]!.hasAttribute('aria-label')).toBe(false);
    expect(targets[2]!.getAttribute('aria-label')).toBe('Bound name'); expect(targets[2]!.getAttribute('aria-describedby')).toBe('note'); expect(targets[2]!.getAttribute('data-variant')).toBe('elevated');
    update({ name: 'Renamed' }); expect(targets[2]!.getAttribute('aria-label')).toBe('Renamed');
  });

  it('[ATTR-04] the id, class and style of hw-card stay on the host and no id is duplicated', () => {
    const { root } = page(`<hw-card id="summary" class="mine" style="margin: 1px" aria-label="Summary"><h3 hwCardHeader id="summary-title">Title</h3><p>Body</p></hw-card>`);
    const card = root.querySelector('hw-card')!;
    expect(card.id).toBe('summary'); expect(card.classList.contains('mine')).toBe(true); expect(card.getAttribute('style')).toContain('margin'); expect(card.querySelector('.hw-card')!.hasAttribute('id')).toBe(false);
    const ids = [...root.querySelectorAll('[id]')].map(element => element.id); expect(new Set(ids).size).toBe(ids.length);
  });

  it('[ATTR-03][content-display-22][service-patterns-13] hw-notification-list and hw-feedback: the forwarded attributes reach the section and the group; the hosts keep none', () => {
    const feedback = 'yesLabel="Yes" noLabel="No" commentLabel="Comment" submitLabel="Send" successMessage="Thank you"';
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-notification-list aria-label="Static name" aria-describedby="note" emptyMessage="None" unreadLabel="Unread" /><hw-notification-list aria-labelledby="heading" emptyMessage="None" unreadLabel="Unread" /><hw-notification-list [aria-label]="name" label="Visible" emptyMessage="None" unreadLabel="Unread" />
      <hw-feedback aria-label="Static name" aria-describedby="note" ${feedback} /><hw-feedback aria-labelledby="heading" ${feedback} /><hw-feedback [aria-label]="name" label="Visible" ${feedback} />`, { name: 'Bound name' });
    for (const [tag, named] of [['hw-notification-list', 'section.hw-notification-list'], ['hw-feedback', 'div.hw-feedback']] as const) {
      const wrappers = [...root.querySelectorAll(tag)], targets = wrappers.map(wrapper => wrapper.querySelector(named)!);
      for (const wrapper of wrappers) for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby']) expect(wrapper.hasAttribute(attribute), `${tag} ${attribute}`).toBe(false);
      expect(targets[0]!.getAttribute('aria-label')).toBe('Static name'); expect(targets[0]!.getAttribute('aria-describedby')).toBe('note'); expect(targets[0]!.hasAttribute('aria-labelledby')).toBe(false);
      expect(targets[1]!.getAttribute('aria-labelledby')).toBe('heading'); expect(targets[1]!.hasAttribute('aria-label')).toBe(false);
      // An application name replaces the reference to the visible heading or question, which is still rendered.
      expect(targets[2]!.getAttribute('aria-label')).toBe('Bound name'); expect(targets[2]!.hasAttribute('aria-labelledby')).toBe(false); expect(targets[2]!.querySelector('h2, p')!.textContent).toBe('Visible');
    }
    update({ name: 'Renamed' }); expect(root.querySelectorAll('section.hw-notification-list')[2]!.getAttribute('aria-label')).toBe('Renamed');
  });

  it('[ATTR-01][ATTR-02][R04] hw-cookie-consent: role and aria-labelledby are written on the host; an application aria-label or aria-labelledby wins over the heading', () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><hw-cookie-consent ${consent} id="own" class="mine" /><hw-cookie-consent ${consent} [attr.aria-label]="name" /><hw-cookie-consent ${consent} aria-labelledby="heading" />`, { name: 'Cookie choices' as string | null });
    const [byTitle, byLabel, byHeading] = [...root.querySelectorAll('hw-cookie-consent')];
    for (const region of [byTitle!, byLabel!, byHeading!]) { expect(region.getAttribute('role')).toBe('region'); expect(region.classList.contains('hw-cookie-consent')).toBe(true); expect(region.querySelector('section')).toBeNull(); }
    expect(byTitle!.id).toBe('own'); expect(byTitle!.getAttribute('aria-labelledby')).toBe(byTitle!.querySelector('h2')!.id); expect(byTitle!.hasAttribute('aria-label')).toBe(false);
    expect(byLabel!.getAttribute('aria-label')).toBe('Cookie choices'); expect(byLabel!.hasAttribute('aria-labelledby')).toBe(false);
    expect(byHeading!.getAttribute('aria-labelledby')).toBe('heading');
    update(); expect(byTitle!.getAttribute('aria-labelledby')).toBe(byTitle!.querySelector('h2')!.id); expect(byHeading!.getAttribute('aria-labelledby')).toBe('heading');
    // Without the application's name the heading names the region again.
    update({ name: null }); update(); expect(byLabel!.hasAttribute('aria-label')).toBe(false); expect(byLabel!.getAttribute('aria-labelledby')).toBe(byLabel!.querySelector('h2')!.id);
  });

  it('[RICH-04] hw-stat and hw-empty-state render their regions without whitespace, so an empty one is :empty', () => {
    const { root } = page(`<hw-stat label="Requests" value="3" /><hw-empty-state title="No requests" />`);
    // Angular's comment anchors do not count for :empty; an element or a text node, whitespace included, would.
    for (const selector of ['.hw-stat-trend', '.hw-empty-icon']) { const region = root.querySelector(selector)!; expect(contentOf(region), selector).toHaveLength(0); expect(region.textContent, selector).toBe(''); }
    expect(contentOf(root.querySelector('.hw-stat-value')!).map(node => node.textContent)).toEqual(['3']);
  });
});
