import { expect, test } from '../support/fixtures';
import {
  FRAMEWORKS,
  recordRequests,
  MAIN_FILES,
  TEXT,
  allowFrameErrors,
  appendTo,
  frameResources,
  logTexts,
  openEditor,
  originalRan,
  readyResult,
  resultFrame,
  statusLine,
} from './support';

// Edit and run in each framework, compile and runtime errors in the log, the loop
// guard and the bundled runtime (layout guide/tests/e2e/editor/run.spec.ts).

test.describe.configure({ timeout: 90_000 });

for (const framework of FRAMEWORKS) {
  test(`en ${framework}: the original runs without compilers, an edit compiles and runs`, async ({ page }) => {
    const requests = await recordRequests(page);
    await openEditor(page, 'en', `example=button/primary&framework=${framework}`);
    await originalRan(page, 'en');
    let frame = await readyResult(page);
    await expect(frame.locator('#hawiyah-preview-root button.hw-button')).toHaveText('Continue');
    expect(requests.filter((url) => url.includes('/runtime/compilers/'))).toEqual([]);

    await appendTo(page, MAIN_FILES[framework], `\nconsole.info('edited in ${framework}');\n`);
    if (framework === 'vanilla') await appendTo(page, 'index.html', '\n<p id="added">Added in the editor</p>\n');
    await page.getByRole('button', { name: /^Run/ }).click();
    await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 30_000 });
    await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(`edited in ${framework}`));
    frame = await readyResult(page);
    await expect(frame.locator('#hawiyah-preview-root button.hw-button')).toHaveText('Continue');
    if (framework === 'vanilla') await expect(frame.locator('#added')).toHaveText('Added in the editor');
    expect(requests.some((url) => url.includes('/runtime/compilers/'))).toBe(true);
    // Edited Angular code is compiled in the frame (JIT); no other framework loads the Angular compiler.
    const loaded = [...requests, ...(await frameResources(frame))];
    expect(loaded.some((url) => url.endsWith('/runtime/compilers/compiler.mjs'))).toBe(framework === 'angular');
  });
}

test('ar react: an edited run renders in Arabic, right to left', async ({ page }) => {
  await openEditor(page, 'ar', 'framework=react');
  await originalRan(page, 'ar');
  await appendTo(page, 'main.tsx', "\nconsole.info('تعديل');\n");
  await page.keyboard.press('Control+Enter');
  await expect(statusLine(page)).toHaveText(TEXT.ar.yourCodeRan, { timeout: 30_000 });
  const frame = await readyResult(page);
  await expect(frame.locator('#hawiyah-preview-root button.hw-button')).toHaveText('متابعة');
  expect(await frame.evaluate(() => [document.documentElement.lang, document.documentElement.dir, document.title])).toEqual(['ar', 'rtl', 'النتيجة في React']);
});

test('a compile error is listed in the log with its file and position, and no result is shown', async ({ page }) => {
  await openEditor(page, 'en', 'framework=react');
  await originalRan(page, 'en');
  await appendTo(page, 'Example.tsx', '\nconst broken = <div>{value</div>;\n');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.failed, { timeout: 30_000 });
  await expect(statusLine(page)).toContainText('Example.tsx:');
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringMatching(/^Error\s*Example\.tsx:\d+:\d+: /));
  await expect(resultFrame(page)).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Result' })).toHaveText('No result is shown because the run failed. The log lists the errors.');
});

test('a TypeScript syntax error of an Angular file is listed in the log', async ({ page }) => {
  await openEditor(page, 'en', 'framework=angular');
  await originalRan(page, 'en');
  await appendTo(page, 'example.component.ts', '\nconst = ;\n');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.failed, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringMatching(/example\.component\.ts:\d+:\d+: /));
});

test('an import the editor does not serve is reported before the run', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vue');
  await originalRan(page, 'en');
  await appendTo(page, 'main.ts', "\nimport 'left-pad';\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.failed, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('The editor does not provide the module left-pad'));
});

test('a runtime error is listed in the log and fails the run', async ({ page, guard }) => {
  await openEditor(page, 'en', 'framework=vue');
  await originalRan(page, 'en');
  await appendTo(page, 'main.ts', "\nthrow new Error('editor runtime failure');\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(/^The run failed: .*editor runtime failure/, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('Error: editor runtime failure'));
  allowFrameErrors(guard, /editor runtime failure/);
});

test('a loop that does not end is stopped and the result is removed', async ({ page, guard }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', '\nlet turns = 0;\nwhile (true) { turns += 1; }\n');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toContainText(TEXT.en.loopStopped, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(TEXT.en.loopStopped));
  await expect(resultFrame(page)).toHaveCount(0);
  allowFrameErrors(guard, /A loop ran for more than 2 seconds/);
});

const LEAVE_BLOCKED = 'The code tried to open another address in the preview. The request was not sent, and the run was stopped.';

// Code that navigates the frame itself. The page policy refuses the request before
// it is sent, so the routing of the context must never see the address.
const leaving: Readonly<Record<string, string>> = {
  'location.href': "location.href = 'https://example.org/left?d=' + encodeURIComponent(document.title);",
  'location.replace': "location.replace('https://example.org/left');",
  'a meta refresh': "const m = document.createElement('meta'); m.httpEquiv = 'refresh'; m.content = '0;url=https://example.org/left'; document.head.append(m);",
  'a data: address': "location.href = 'data:text/html,<p>left</p>';",
};

for (const [name, code] of Object.entries(leaving)) {
  // The browser logs the refusal on purpose: the plain page fixture, without the console guard.
  test(`code that leaves the result through ${name} sends no request and fails the run`, async ({ browser }) => {
    const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
    const page = await context.newPage();
    const outside: string[] = [];
    await context.route(/example\.org/, (route) => {
      outside.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>outside</p>' });
    });
    await openEditor(page, 'en', 'framework=vanilla');
    await originalRan(page, 'en');
    await appendTo(page, 'main.js', `\nsetTimeout(() => { ${code} }, 300);\n`);
    await page.getByRole('button', { name: /^Run/ }).click();
    await expect(statusLine(page)).toHaveText(`The run failed: ${LEAVE_BLOCKED}`, { timeout: 30_000 });
    await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(LEAVE_BLOCKED));
    await expect(resultFrame(page)).toHaveCount(0);
    await expect(page.locator('guide-preview-frame p.notice')).toHaveText(LEAVE_BLOCKED);
    expect(outside).toEqual([]);
    await context.close();
  });
}

test('a result that reloads itself is not read as leaving', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nsetTimeout(() => { if (!window.name) { window.name = 'again'; location.reload(); } }, 300);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan);
  await expect(resultFrame(page)).toHaveCount(1);
});

for (const framework of ['react', 'angular'] as const) {
  test(`runtime=bundle: the ${framework} original and an edit run on the bundled runtime`, async ({ page }) => {
    const requests = await recordRequests(page);
    await openEditor(page, 'en', `framework=${framework}&runtime=bundle`);
    await expect(statusLine(page)).toHaveText(/^The original example ran in \d+ ms\. Bundled runtime\.$/, { timeout: 20_000 });
    await appendTo(page, MAIN_FILES[framework], `\nconsole.info('bundled ${framework}');\n`);
    await page.getByRole('button', { name: /^Run/ }).click();
    await expect(statusLine(page)).toHaveText(/^Your code ran in \d+ ms\. Bundled runtime\.$/, { timeout: 30_000 });
    await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(`bundled ${framework}`));
    const frame = await readyResult(page);
    await expect(frame.locator('#hawiyah-preview-root button.hw-button')).toHaveText('Continue');
    const loaded = [...requests, ...(await frameResources(frame))];
    expect(loaded.some((url) => url.endsWith(`/runtime/bundles/${framework}.js`))).toBe(true);
    expect(loaded.some((url) => url.includes('/runtime/linked/') || url.includes('/runtime/npm/@hawiyah/react@'))).toBe(false);
  });
}
