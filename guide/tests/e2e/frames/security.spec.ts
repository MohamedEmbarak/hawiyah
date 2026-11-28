import { test as base } from '@playwright/test';
import { expect, hydrated } from '../support/fixtures';
import {
  briefPath,
  frameElement,
  frameResources,
  originOf,
  outside,
  payload,
  readyFrame,
  recordRequests,
  routePayload,
  selectFramework,
  statusOf,
} from './support';

// These tests make the frame do what the boundary forbids, so the browser logs
// errors on purpose: they use the plain test object, without the console guard.
const test = base;

const linkAndForm = (lang: 'en' | 'ar') =>
  payload('vanilla', lang, {
    host:
      '<div id="app"><a class="hw-link" href="https://example.org/apply">Apply</a>' +
      '<form method="post" action="https://example.org/submit"><button class="hw-button" type="submit">Send</button></form></div>',
    entry: 'main.js',
    modules: { 'main.js': "import { enhance } from '@hawiyah/vanilla';\nenhance(document.getElementById('app'));\n" },
    imports: ['@hawiyah/vanilla'],
  });

test('the frame is sandboxed with an opaque origin and cannot reach the guide', async ({ page }) => {
  await selectFramework(page, briefPath('en'), 'vanilla');
  const frame = await readyFrame(page, 'vanilla');
  await expect(frameElement(page)).toHaveAttribute('sandbox', 'allow-scripts allow-forms');
  const probe = await frame.evaluate(() => {
    const result: Record<string, string> = { origin: self.origin };
    try {
      result['parentDocument'] = String(window.parent.document.title);
    } catch (error) {
      result['parentDocument'] = (error as Error).name;
    }
    try {
      result['storage'] = String(window.localStorage.length);
    } catch (error) {
      result['storage'] = (error as Error).name;
    }
    try {
      result['cookie'] = document.cookie;
    } catch (error) {
      result['cookie'] = (error as Error).name;
    }
    return result;
  });
  expect(probe['origin']).toBe('null');
  expect(probe['parentDocument']).toBe('SecurityError');
  expect(probe['storage']).toBe('SecurityError');
  expect(probe['cookie']).toBe('SecurityError');
});

test('the policy blocks a fetch, an external module import and an inline script without the nonce', async ({ page }) => {
  const requests = await recordRequests(page);
  await selectFramework(page, briefPath('en'), 'vanilla');
  const frame = await readyFrame(page, 'vanilla');
  const origin = originOf(page);
  const outcome = await frame.evaluate(async (guide) => {
    const result: Record<string, string> = {};
    const blocked: string[] = [];
    document.addEventListener('securitypolicyviolation', (event) => blocked.push(`${event.effectiveDirective} ${event.blockedURI}`));
    try {
      await fetch(`${guide}/hawiyah/runtime/import-map.json`);
      result['fetch'] = 'loaded';
    } catch (error) {
      result['fetch'] = (error as Error).name;
    }
    try {
      await import('https://example.org/module.js' as string);
      result['import'] = 'loaded';
    } catch (error) {
      result['import'] = (error as Error).name;
    }
    const script = document.createElement('script');
    script.textContent = 'window.__inline = true;';
    document.body.append(script);
    result['inline'] = String((window as unknown as { __inline?: boolean }).__inline === true);
    try {
      result['eval'] = String(eval('1 + 1'));
    } catch (error) {
      result['eval'] = (error as Error).name;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    result['blocked'] = [...new Set(blocked)].sort().join(' | ');
    return result;
  }, origin);
  expect(outcome).toEqual({
    fetch: 'TypeError',
    import: 'TypeError',
    inline: 'false',
    eval: 'EvalError',
    blocked: `connect-src ${origin}/hawiyah/runtime/import-map.json | script-src eval | script-src-elem https://example.org/module.js | script-src-elem inline`,
  });
  // The policy refused the external module before any request: the only requests are the guide's.
  const loaded = await frameResources(frame);
  expect(outside(requests, origin)).toEqual([]);
  expect(outside(loaded, origin).filter((url) => url !== 'https://example.org/module.js')).toEqual([]);
  expect(loaded.some((url) => url.endsWith('/hawiyah/runtime/npm/@hawiyah/vanilla@0.3.0/dist/index.js'))).toBe(true);
});

test('forged messages are ignored; the frame\'s own messages are accepted', async ({ page }) => {
  await routePayload(page, 'en', 'vanilla', await linkAndForm('en'));
  await selectFramework(page, briefPath('en'), 'vanilla');
  const frame = await readyFrame(page, 'vanilla');
  // The notice is in the document, empty, before it has text (one live region per event).
  const notice = page.locator('guide-preview-frame p.notice');
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveAttribute('role', 'status');
  await expect(notice).toBeEmpty();
  // From the guide's own window: wrong source and origin.
  await page.evaluate(() => {
    window.postMessage({ channel: 'hawiyah-guide-frame', version: 1, token: 'x', run: 1, type: 'navigation', href: 'forged-parent' }, '*');
  });
  // From inside the frame, without the run's token.
  await frame.evaluate(() => {
    for (const token of ['0'.repeat(32), '']) {
      window.parent.postMessage({ channel: 'hawiyah-guide-frame', version: 1, token, run: 1, type: 'navigation', href: 'forged-frame' }, '*');
    }
    window.parent.postMessage({ channel: 'other', version: 1, type: 'submit' }, '*');
    window.parent.postMessage('navigation', '*');
  });
  // From another window: a second frame created by the page.
  await page.evaluate(() => {
    const other = document.createElement('iframe');
    other.setAttribute('sandbox', 'allow-scripts');
    other.srcdoc = "<script>parent.postMessage({ channel: 'hawiyah-guide-frame', version: 1, token: 'y', run: 1, type: 'submit' }, '*');</script>";
    document.body.append(other);
  });
  await page.waitForTimeout(500);
  await expect(notice).toBeEmpty();
  await expect(statusOf(page)).toHaveText('Rendered with @hawiyah/vanilla 0.3.0 from npm');
  // Positive controls: a link and a form in the example are reported, never followed.
  await frame.getByRole('link', { name: 'Apply' }).click();
  await expect(notice).toHaveText('The example link to https://example.org/apply does not open from the preview.');
  // The address is shown left to right inside the sentence.
  await expect(notice.locator('bdi[dir="ltr"]')).toHaveText('https://example.org/apply');
  expect(frame.url()).toBe('about:srcdoc');
  await frame.getByRole('button', { name: 'Send' }).click();
  await expect(notice).toHaveText('The example form was submitted inside the preview; nothing was sent.');
  expect(frame.url()).toBe('about:srcdoc');
});

test('a run that fails with an error reports the first line in the status', async ({ page }) => {
  const failing = await payload('vue', 'ar', {
    host: '<div id="app"></div>',
    entry: 'main.js',
    modules: { 'main.js': "import { createApp } from 'vue';\nthrow new Error('example failed\\nsecond line');\n" },
    imports: ['vue'],
  });
  await routePayload(page, 'ar', 'vue', failing);
  await selectFramework(page, briefPath('ar'), 'vue');
  await expect(statusOf(page)).toHaveText('تعذّر تحميل نتيجة Vue: Error: example failed', { timeout: 30_000 });
});

test('with several frames on a page, a frame that navigates itself is the one removed', async ({ page }) => {
  const outsideRequests: string[] = [];
  await page.context().route(/example\.org/, (route) => {
    outsideRequests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>outside</p>' });
  });
  const leaving = await payload('vanilla', 'en', {
    host: '<div id="app"><button class="hw-button" type="button" id="leave">Leave</button></div>',
    entry: 'main.js',
    modules: {
      'main.js':
        "import { enhance } from '@hawiyah/vanilla';\nenhance(document.getElementById('app'));\n" +
        "document.getElementById('leave').addEventListener('click', () => { location.href = 'https://example.org/left'; });\n",
    },
    imports: ['@hawiyah/vanilla'],
  });
  await routePayload(page, 'en', 'vanilla', leaving);
  await page.goto('en/components/button/reference/');
  await hydrated(page);
  const blocks = page.locator('guide-example-block');
  const count = await blocks.count();
  expect(count).toBeGreaterThan(2);
  for (let index = 0; index < count; index += 1) {
    await blocks.nth(index).getByRole('tab', { name: 'JavaScript', exact: true }).click();
  }
  const frames = page.locator('guide-example-block guide-frame-result iframe');
  await expect(frames).toHaveCount(count, { timeout: 30_000 });
  await expect(page.locator('guide-example-block p.status').filter({ hasText: 'Rendered with @hawiyah/vanilla 0.3.0 from npm' })).toHaveCount(count, { timeout: 30_000 });
  let clicked = false;
  for (const frame of page.frames()) {
    const button = frame.locator('#leave');
    if ((await button.count()) === 1) {
      // The button lies about 2,500 px above the viewport, and the result frame runs
      // out of process. Right after the long scroll that a click makes, Chromium can
      // still route the pointer to the page's iframe element instead of into the frame
      // (probe: 9 of 48 clicks reached the iframe element, which took focus; the button
      // saw no event). The frame is scrolled into view first, and the click is sent
      // once a pointer move over the button has reached the frame.
      await (await frame.frameElement()).scrollIntoViewIfNeeded();
      await expect(async () => {
        await button.hover();
        expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
      }).toPass({ timeout: 10_000 });
      await button.click();
      clicked = true;
      break;
    }
  }
  expect(clicked).toBe(true);
  // The failed run is announced once, by the status line of its block; the notices stay empty.
  await expect(
    page.locator('guide-example-block p.status').filter({
      hasText: 'The JavaScript result could not be loaded: The code tried to open another address in the preview. The request was not sent, and the run was stopped.',
    }),
  ).toHaveCount(1);
  await expect(page.locator('guide-preview-frame p.notice').filter({ hasText: /\S/ })).toHaveCount(0);
  await expect(frames).toHaveCount(count - 1);
  await expect(page.locator('guide-example-block p.status').filter({ hasText: 'Rendered with @hawiyah/vanilla 0.3.0 from npm' })).toHaveCount(count - 1);
  // The frame that left is the one of the routed example: no remaining frame holds its button.
  for (const frame of page.frames()) expect(await frame.locator('#leave').count()).toBe(0);
  expect(outsideRequests).toEqual([]);
});
