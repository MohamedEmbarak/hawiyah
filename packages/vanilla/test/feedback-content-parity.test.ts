// @vitest-environment jsdom
import { prepareRemovalFocus, resetTextWarnings } from '@hawiyah/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCookieConsent, createFeedback, createToastRegion, enhance } from '../src/index.js';

// Vanilla fixtures of the cross-adapter feedback, content and service-pattern cases: the documented authored markup and its controllers.
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
const shape = (root: Element) => [...root.children].map(node => node.localName + (node.classList.length ? '.' + [...node.classList].join('.') : ''));

describe('feedback', () => {
  const feedback = (attrs = 'data-hw-success-message="Thank you for your feedback."') => mount(`<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="fb-label" ${attrs}><p id="fb-label">Was this page helpful?</p><div class="hw-feedback-actions"><button type="button" class="hw-button" data-variant="secondary" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">Yes</span></button><button type="button" class="hw-button" data-variant="secondary" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">No</span></button></div><div class="hw-feedback-comment" data-hw-feedback-comment hidden><div class="hw-field"><label class="hw-label" for="fb-comment">Comment</label><textarea class="hw-textarea" id="fb-comment"></textarea></div><button type="button" class="hw-button" data-hw-feedback-submit>Send</button></div><p role="status" data-hw-feedback-status></p></div>`);
  const pick = (root: HTMLElement, value: 'yes' | 'no') => root.querySelector<HTMLButtonElement>(`[data-hw-value="${value}"]`)!;
  it('[FEEDBACK-01] first render: a labelled group, two unpressed secondary choices, no visible comment step, an empty status', () => {
    const root = feedback(); const controller = createFeedback(root);
    expect(document.getElementById(root.getAttribute('aria-labelledby')!)!.textContent).toBe('Was this page helpful?');
    expect([...root.querySelectorAll('.hw-feedback-actions > button.hw-button[data-variant=secondary]')].map(button => button.getAttribute('aria-pressed'))).toEqual(['false', 'false']);
    expect(root.querySelector<HTMLElement>('[data-hw-feedback-comment]')!.hidden).toBe(true); expect(root.querySelector('[role=status]')!.textContent).toBe('');
    expect(root.querySelector('form, fieldset, legend, input[type=radio], h2')).toBeNull(); controller.destroy();
  });
  it('[FEEDBACK-02] [FEEDBACK-03] [STATE-06] choose, comment and submit', () => {
    const root = feedback(); const changed = vi.fn(); const sent = vi.fn(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createFeedback(root, { onValueChange: changed, onFeedback: sent }); const status = root.querySelector('[role=status]')!;
    pick(root, 'yes').click(); expect(pick(root, 'yes').getAttribute('aria-pressed')).toBe('true'); expect(changed.mock.calls).toEqual([[{ helpful: true, comment: '' }]]);
    expect(root.querySelector<HTMLElement>('[data-hw-feedback-comment]')!.hidden).toBe(false); expect(status.textContent).toBe('');
    pick(root, 'yes').click(); expect(changed).toHaveBeenCalledTimes(1);
    const textarea = root.querySelector('textarea')!; textarea.value = 'Thanks'; textarea.dispatchEvent(new Event('input', { bubbles: true }));
    root.querySelector<HTMLButtonElement>('[data-hw-feedback-submit]')!.click(); expect(sent.mock.calls).toEqual([[{ helpful: true, comment: 'Thanks' }]]); expect(status.textContent).toBe('Thank you for your feedback.');
    pick(root, 'no').click(); expect(status.textContent).toBe(''); expect(changed).toHaveBeenLastCalledWith({ helpful: false, comment: 'Thanks' });
    expect(details).toEqual([{ value: { helpful: true, comment: '' } }, { value: { helpful: true, comment: 'Thanks' } }, { feedback: { helpful: true, comment: 'Thanks' } }, { value: { helpful: false, comment: 'Thanks' } }]); controller.destroy();
  });
  it('[STATE-02] the initial value option sets the pressed choice and the comment step', () => {
    const root = feedback(); const controller = createFeedback(root, { value: { helpful: false, comment: 'Slow' } });
    expect(pick(root, 'no').getAttribute('aria-pressed')).toBe('true'); expect(root.querySelector('textarea')!.value).toBe('Slow'); expect(root.querySelector<HTMLElement>('[data-hw-feedback-comment]')!.hidden).toBe(false); controller.destroy();
  });
  it('[FEEDBACK-04] disabled: every control is disabled and nothing notifies; focus stays on the pressed choice', () => {
    const root = feedback(); const changed = vi.fn(); const controller = createFeedback(root, { onValueChange: changed });
    pick(root, 'yes').focus(); pick(root, 'yes').click(); expect(document.activeElement).toBe(pick(root, 'yes'));
    expect([...root.querySelectorAll<HTMLElement>('button, textarea')].map(node => node.textContent || node.localName)).toEqual(['Yes', 'No', 'textarea', 'Send']);
    root.setAttribute('aria-disabled', 'true'); controller.select(false);
    return Promise.resolve().then(() => {
      expect([...root.querySelectorAll<HTMLButtonElement>('button, textarea')].every(node => node.disabled)).toBe(true); expect(changed).toHaveBeenCalledTimes(1); controller.destroy();
    });
  });
  it('[TEXT-01] a missing successMessage renders an empty status and warns once', () => {
    const root = feedback(''); const controller = createFeedback(root); pick(root, 'yes').click(); controller.submit();
    expect(root.querySelector('[role=status]')!.textContent).toBe(''); expect(warn.mock.calls.filter(([message]: unknown[]) => String(message).includes('Feedback requires "successMessage"'))).toHaveLength(1); controller.destroy();
  });
});

describe('cookie consent', () => {
  const consent = (attrs = '') => mount(`<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="cc-title" ${attrs}><h2 id="cc-title">Cookies</h2><p>Choose optional cookies.</p><a class="hw-link" href="/privacy">Privacy</a><div class="hw-button-group"><button type="button" class="hw-button" data-variant="primary" data-hw-consent="accepted">Accept</button><button type="button" class="hw-button" data-variant="secondary" data-hw-consent="rejected">Reject</button><button type="button" class="hw-button" data-variant="ghost" data-hw-preferences>Preferences</button></div></section>`);
  it('[CONSENT-01] [CONSENT-02] Accept, Reject, Preferences in one button group; the region is labelled by its h2', () => {
    const root = consent(); const controller = createCookieConsent(root);
    expect([...root.querySelectorAll('.hw-button-group > button')].map(button => [button.textContent, button.getAttribute('data-variant')])).toEqual([['Accept', 'primary'], ['Reject', 'secondary'], ['Preferences', 'ghost']]);
    expect([...root.querySelectorAll('a, button')].map(node => node.textContent)).toEqual(['Privacy', 'Accept', 'Reject', 'Preferences']);
    expect(document.getElementById(root.getAttribute('aria-labelledby')!)!.localName).toBe('h2'); expect(root.hasAttribute('aria-label')).toBe(false); expect(root.hasAttribute('role')).toBe(false); controller.destroy();
  });
  it('[STATE-01] [STATE-03] [STATE-06] Reject reports the choice, then closes once; setOpen from the application notifies once per change', () => {
    const root = consent(); const consented = vi.fn(); const opened = vi.fn(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createCookieConsent(root, { onConsent: consented, onOpenChange: opened });
    root.querySelector<HTMLButtonElement>('[data-hw-consent="rejected"]')!.click();
    expect(consented.mock.calls).toEqual([['rejected']]); expect(opened.mock.calls).toEqual([[false]]); expect(root.hidden).toBe(true); expect(controller.open).toBe(false);
    expect(details).toEqual([{ consent: 'rejected' }, { open: false }]);
    controller.setOpen(false); expect(opened).toHaveBeenCalledTimes(1); controller.setOpen(true); expect(root.hidden).toBe(false); expect(opened).toHaveBeenLastCalledWith(true); controller.destroy();
    const closed = createCookieConsent(root, { open: false }); expect(root.hidden).toBe(true); closed.destroy();
  });
  it('[CONSENT-04] the banner variant is authored data-variant', () => {
    let root = consent('data-variant="banner"'); let release = enhance(root); expect(root.getAttribute('data-variant')).toBe('banner'); release();
    root = consent(); release = enhance(root); expect(root.hasAttribute('data-variant')).toBe(false); release();
  });
});

describe('feedback and status (authored markup)', () => {
  it('[ALERT-01] a danger alert has role=alert, every other tone role=status', () => {
    const root = mount('<div><div class="hw-alert" data-tone="danger" role="alert"><div class="hw-alert-content"><p>Failed</p></div></div><div class="hw-alert" data-tone="info" role="status"><div class="hw-alert-content"><p>Note</p></div></div></div>'); const release = enhance(root);
    expect([...root.children].map(node => node.getAttribute('role'))).toEqual(['alert', 'status']); release();
  });
  it('[PROGRESS-01] [PROGRESS-02] [METER-01] [METER-02] [SKELETON-01] [SPINNER-01] [SPINNER-02] the documented elements carry their attributes unchanged', () => {
    const root = mount('<div><progress class="hw-progress" aria-label="Upload" value="150" max="100" data-size="sm"></progress><progress class="hw-progress" aria-label="Loading"></progress><meter class="hw-meter" aria-label="Storage" min="0" max="100" value="10"></meter><meter class="hw-meter" aria-label="Score" min="0" max="100" value="80" low="30" high="70" optimum="90"></meter><span class="hw-skeleton" data-variant="circle" aria-hidden="true"></span><span class="hw-spinner" role="status" data-size="lg"><span class="hw-sr-only">Loading</span></span></div>');
    const release = enhance(root); const [progress, bare] = root.querySelectorAll('progress'); const [meter, scored] = root.querySelectorAll('meter');
    expect([progress!.getAttribute('value'), progress!.getAttribute('max'), progress!.getAttribute('data-size'), progress!.textContent]).toEqual(['150', '100', 'sm', '']); expect(bare!.hasAttribute('value')).toBe(false); expect(root.querySelector('label')).toBeNull();
    expect(['low', 'high', 'optimum'].some(name => meter!.hasAttribute(name))).toBe(false); expect(['low', 'high', 'optimum'].map(name => scored!.getAttribute(name))).toEqual(['30', '70', '90']);
    expect(root.querySelector('.hw-skeleton')!.getAttribute('aria-hidden')).toBe('true'); const spinner = root.querySelector('.hw-spinner')!;
    expect([spinner.getAttribute('role'), spinner.getAttribute('data-size'), shape(spinner)]).toEqual(['status', 'lg', ['span.hw-sr-only']]); release();
  });
  it('[SKELETON-03] the README documents skeletons inside a status container with a visually hidden text', () => {
    const readme = readFileSync(join(process.cwd(), 'packages/vanilla/README.md'), 'utf8'); const section = readme.slice(readme.indexOf('### Skeleton'));
    expect(section).toContain('role="status"'); expect(section).toContain('hw-sr-only'); expect(readme).not.toMatch(/<\w[^<>]*(aria-busy="true"[^<>]*aria-label|aria-label[^<>]*aria-busy="true")/u);
  });
  it('[RICH-01] EmptyState: the icon is in span.hw-empty-icon before the h3 and the action is the last child', () => {
    const root = mount('<div class="hw-empty"><span class="hw-empty-icon" aria-hidden="true"><span class="hw-icon" data-icon="search-01"></span></span><h3>No results</h3><p>Change the filters.</p><button type="button" class="hw-button">Clear filters</button></div>');
    expect(shape(root)).toEqual(['span.hw-empty-icon', 'h3', 'p', 'button.hw-button']);
  });
  it('[CHIP-01] the chip remove control is a plain button with the icon; prepareRemovalFocus hands focus to the next chip', () => {
    const root = mount('<div><span class="hw-chip" data-tone="neutral">Riyadh<button type="button" aria-label="Remove Riyadh"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span><span class="hw-chip" data-tone="neutral">Jeddah<button type="button" aria-label="Remove Jeddah"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span></div>');
    const button = root.querySelector<HTMLButtonElement>('.hw-chip button')!; expect([button.type, button.classList.contains('hw-button'), button.querySelector('.hw-icon')!.getAttribute('data-icon')]).toEqual(['button', false, 'cancel-01']);
    button.focus(); const restore = prepareRemovalFocus(root, button, { item: '.hw-chip', control: 'button' }); button.closest('.hw-chip')!.remove(); restore();
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove Jeddah');
  });
});

describe('content display (authored markup)', () => {
  it('[SHAPE-01] AvatarGroup: initials, size and variant are authored', () => {
    const root = mount('<div class="hw-avatar-group" role="group" aria-label="Team"><span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="Rana Cole">RC</span><span class="hw-avatar" role="img" aria-label="Sami">S</span></div>');
    expect([...root.children].map(node => [node.textContent, node.getAttribute('data-size'), node.getAttribute('data-variant')])).toEqual([['RC', '64', 'square'], ['S', null, null]]);
  });
  it('[DESCRIPTION-LIST-01] the description list has no data-variant unless authored', () => {
    const root = mount('<div><dl class="hw-description-list"><div><dt>Fee</dt><dd>100</dd></div></dl><dl class="hw-description-list" data-variant="horizontal"><div><dt>Fee</dt><dd>100</dd></div></dl></div>');
    expect([...root.children].map(node => node.getAttribute('data-variant'))).toEqual([null, 'horizontal']);
  });
  it('[STAT-01] [STAT-02] [RICH-01] Stat: label, value, description and trend in order; rich value and trend; tones', () => {
    const root = mount('<div class="hw-stat" data-tone="danger"><span class="hw-stat-label">Requests</span><strong class="hw-stat-value"><bdi><span class="hw-riyal" aria-hidden="true"></span>120 <span class="hw-sr-only">riyals</span></bdi></strong><p class="hw-stat-description">This month</p><span class="hw-stat-trend" data-tone="success"><span class="hw-icon" data-icon="arrow-up-01" aria-hidden="true"></span>12%</span></div>');
    expect(shape(root)).toEqual(['span.hw-stat-label', 'strong.hw-stat-value', 'p.hw-stat-description', 'span.hw-stat-trend']); expect(root.querySelector('dl')).toBeNull();
    expect(root.querySelector('.hw-stat-value .hw-riyal')).not.toBeNull(); expect(root.querySelector('.hw-stat-trend .hw-icon')).not.toBeNull();
    expect([root.getAttribute('data-tone'), root.querySelector('.hw-stat-trend')!.getAttribute('data-tone')]).toEqual(['danger', 'success']);
  });
  it('[TIMELINE-01] [SHAPE-01] Timeline: items of class hw-timeline-item with h3, time, p; states and the current step', () => {
    const root = mount('<ol class="hw-timeline"><li class="hw-timeline-item" data-state="complete"><h3>Submitted</h3><time datetime="2026-10-27">27 October 2026</time><p>Received.</p></li><li class="hw-timeline-item" data-state="current" aria-current="step"><h3>Review</h3></li><li class="hw-timeline-item" data-state="upcoming"><h3>Decision</h3></li></ol>');
    expect(shape(root.children[0]!)).toEqual(['h3', 'time', 'p']); expect([...root.children].map(node => [node.className, node.getAttribute('data-state'), node.getAttribute('aria-current')])).toEqual([['hw-timeline-item', 'complete', null], ['hw-timeline-item', 'current', 'step'], ['hw-timeline-item', 'upcoming', null]]);
    expect(root.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-27');
  });
  const notifications = '<section class="hw-notification-list" aria-labelledby="nl-title" tabindex="-1"><h2 id="nl-title">Notifications</h2><ul><li data-state="unread"><h3><a class="hw-link" href="/x">Ready</a></h3><span class="hw-badge" data-tone="info">New</span><p>D</p><time datetime="2026-10-28T09:00:00+03:00">28 October</time><button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read>Mark read</button><button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss Ready"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></li><li data-state="read"><h3>Received</h3><button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss Received"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></li></ul></section>';
  it('[SHAPE-01] [NOTIFICATION-01] [NOTIFICATION-06] NotificationList: labelled by its h2, h3 titles, data-state, one link, one time, the unread badge', () => {
    const root = mount(notifications); const release = enhance(root);
    expect(document.getElementById(root.getAttribute('aria-labelledby')!)!.localName).toBe('h2'); expect(root.hasAttribute('aria-label')).toBe(false);
    expect([...root.querySelectorAll('li')].map(item => [item.getAttribute('data-state'), item.className, item.querySelector('h3')!.textContent])).toEqual([['unread', '', 'Ready'], ['read', '', 'Received']]);
    expect(root.querySelectorAll('a.hw-link')).toHaveLength(1); expect(root.querySelectorAll('time[datetime]')).toHaveLength(1);
    const [unread, read] = root.querySelectorAll('li'); expect(unread!.querySelectorAll('.hw-badge[data-tone=info]')).toHaveLength(1); expect(unread!.querySelector('.hw-sr-only')).toBeNull(); expect(read!.querySelector('.hw-badge')).toBeNull(); release();
  });
  it('[NOTIFICATION-02] an empty list is one paragraph without a role', () => {
    const root = mount('<section class="hw-notification-list" aria-labelledby="nl-title"><h2 id="nl-title">Notifications</h2><p>No notifications.</p></section>');
    expect(root.querySelector('ul')).toBeNull(); expect(root.querySelector('p')!.hasAttribute('role')).toBe(false);
  });
  it('[FOCUS-04] dismissing a notification hands focus to the next dismiss button, then to the list', () => {
    const root = mount(notifications); const first = root.querySelector<HTMLElement>('[data-hw-dismiss]')!; first.focus();
    let restore = prepareRemovalFocus(root, first, { item: ':scope > ul > li', control: '[data-hw-dismiss]', fallback: root }); first.closest('li')!.remove(); restore();
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Dismiss Received');
    const last = document.activeElement as HTMLElement; restore = prepareRemovalFocus(root, last, { item: ':scope > ul > li', control: '[data-hw-dismiss]', fallback: root }); last.closest('li')!.remove(); restore();
    expect(document.activeElement).toBe(root);
  });
  it('[SHAPE-01] ToastRegion: the title in strong, the message in p and the dismiss name from the template', () => {
    const root = mount('<div class="hw-toast-region" data-hw="toast-region" aria-label="Notifications" data-hw-dismiss-label="Dismiss {title}"><div class="hw-toast" data-hw-toast data-tone="success" id="saved"><div class="hw-toast-content"><strong>Draft saved</strong><p>You can return later.</p></div><button type="button" data-hw-dismiss></button></div></div>');
    const controller = createToastRegion(root); expect([root.querySelector('strong')!.textContent, root.querySelector('p')!.textContent]).toEqual(['Draft saved', 'You can return later.']);
    expect(root.querySelector('[data-hw-dismiss]')!.getAttribute('aria-label')).toBe('Dismiss Draft saved'); controller.destroy();
  });
});

describe('actions (authored markup)', () => {
  it('[BUTTON-01] an authored type=button does not submit; type=submit does', () => {
    const form = mount('<form><button type="button" class="hw-button">Save draft</button><button type="submit" class="hw-button">Send</button></form>') as HTMLFormElement;
    const submitted = vi.fn((event: Event) => event.preventDefault()); form.addEventListener('submit', submitted); const release = enhance(form);
    form.querySelector<HTMLButtonElement>('[type=button]')!.click(); expect(submitted).not.toHaveBeenCalled(); form.querySelector<HTMLButtonElement>('[type=submit]')!.click(); expect(submitted).toHaveBeenCalledTimes(1); release();
  });
  it('[LINK-01] attributes written on the anchor stay on a.hw-link', () => {
    const root = mount('<a class="hw-link extra" data-variant="neutral" href="/guide" hreflang="ar" download aria-label="Guide" aria-current="page" target="_blank" rel="noopener noreferrer">Guide</a>'); const release = enhance(root);
    expect(['hreflang', 'download', 'aria-label', 'data-variant', 'aria-current', 'target', 'rel'].map(name => root.getAttribute(name))).toEqual(['ar', '', 'Guide', 'neutral', 'page', '_blank', 'noopener noreferrer']); expect(root.classList.contains('extra')).toBe(true); release();
  });
});

describe('service patterns (authored markup)', () => {
  const facts = '<dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>100</dd></div></dl>';
  it('[SHAPE-01] [SERVICE-01] ServiceCard: header with badge before the h3, body with p and dl, footer with one a.hw-link', () => {
    const root = mount(`<article class="hw-card hw-service-card"><header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Licences</span><h3>Commercial licence</h3></div></header><div class="hw-card-body"><p>Issue a licence.</p>${facts}</div><footer class="hw-card-footer"><a class="hw-link" href="/apply">Apply</a></footer></article>`);
    expect(shape(root)).toEqual(['header.hw-card-header', 'div.hw-card-body', 'footer.hw-card-footer']); expect(shape(root.querySelector('.hw-card-header > div')!)).toEqual(['span.hw-badge', 'h3']);
    expect(root.querySelector('h3 a')).toBeNull(); expect(shape(root.querySelector('.hw-card-body')!)).toEqual(['p', 'dl.hw-description-list']); expect(root.querySelectorAll('dt')).toHaveLength(2);
    expect(shape(root.querySelector('footer')!)).toEqual(['a.hw-link']);
  });
  it('[SHAPE-01] [SERVICE-04] ServiceDetails: article, header, dl, requirements section and the action in a footer as the last child', () => {
    const root = mount(`<article class="hw-service-details"><header><h2>Commercial licence</h2><p>Issue a licence.</p></header>${facts}<section><h3>Requirements</h3><ul><li>Identity</li></ul></section><footer><button type="button" class="hw-button">Apply</button></footer></article>`);
    expect(shape(root)).toEqual(['header', 'dl.hw-description-list', 'section', 'footer']); expect(shape(root.querySelector('section')!)).toEqual(['h3', 'ul']); expect(root.lastElementChild!.querySelector('button')).not.toBeNull();
  });
});
