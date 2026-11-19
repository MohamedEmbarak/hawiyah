import { expect, test } from '../support/fixtures';
import {
  FRAMEWORKS,
  recordRequests,
  MAIN_FILES,
  TEXT,
  allowFrameErrors,
  appendTo,
  codeOf,
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
  // One live region tells the outcome: the status line. The log is not live; the notice stays empty.
  const announcing = await page.evaluate(
    (text) =>
      [...document.querySelectorAll('[role="status"], [role="alert"], [role="log"]:not([aria-live="off"]), [aria-live]:not([aria-live="off"])')].filter((element) =>
        element.textContent?.includes(text),
      ).length,
    'editor runtime failure',
  );
  expect(announcing).toBe(1);
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

// Console output has its own budget of 500 messages per run; ready and error are
// always accepted, and the dropped count is one log entry per run, updated.
const DROPPED = /^Warning\s*(\d+) console messages of this run were not shown after the limit of 500\.$/;

test('console output past its budget neither delays the outcome nor floods the log', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nfor (let i = 0; i < 600; i += 1) console.log('line ' + i);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  // Far below the 20 s time limit: ready is not counted against the console budget.
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 10_000 });
  await expect.poll(async () => (await logTexts(page)).filter((text) => DROPPED.test(text)).map((text) => Number(DROPPED.exec(text)?.[1]))).toEqual([100]);
});

test('an error thrown after more console output than the budget still fails the run at once', async ({ page, guard }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nfor (let i = 0; i < 600; i += 1) console.log('line ' + i);\nthrow new Error('the real failure of the code');\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(/^The run failed: .*the real failure of the code/, { timeout: 10_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('Error: the real failure of the code'));
  allowFrameErrors(guard, /the real failure of the code/);
});

test('a flood of console output leaves one updated count in the log', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  // Four times the budget is enough to show one updated count; the loop stays far
  // below the 2 s loop guard also on a busy machine.
  await appendTo(page, 'main.js', "\nfor (let i = 0; i < 2000; i += 1) console.log('line ' + i);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 20_000 });
  await expect
    .poll(async () => (await logTexts(page)).filter((text) => DROPPED.test(text)).map((text) => Number(DROPPED.exec(text)?.[1])), { timeout: 20_000 })
    .toEqual([1500]);
  // The reader's own output that fits the log stays in it.
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('line 499'));
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
    // The status line announces the failed run; the notice under the frame stays empty.
    await expect(page.locator('guide-preview-frame p.notice')).toBeEmpty();
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

// The frame policy cannot limit WebRTC in Chromium; the bootstrap removes its
// constructors before the example code runs (README.md, Result frames).
for (const query of ['framework=vanilla', 'framework=vanilla&runtime=bundle']) {
  test(`example code sees no WebRTC constructor (${query})`, async ({ page }) => {
    await openEditor(page, 'en', query);
    await expect(statusLine(page)).toHaveText(/^The original example ran in \d+ ms\./, { timeout: 20_000 });
    await appendTo(
      page,
      'main.js',
      "\nconsole.info('webrtc ' + [typeof RTCPeerConnection, typeof webkitRTCPeerConnection, typeof RTCDataChannel, 'RTCPeerConnection' in window].join(' '));\n",
    );
    await page.getByRole('button', { name: /^Run/ }).click();
    await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 30_000 });
    await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('webrtc undefined undefined undefined false'));
  });
}

test('a result that replaces its document with an empty one is reported and the run is stopped', async ({ page }) => {
  const replaced = 'The code replaced the document of the preview, so the result is no longer shown. The run was stopped.';
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nsetTimeout(() => { location.href = 'about:blank'; }, 300);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(`The run failed: ${replaced}`, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(replaced));
  await expect(resultFrame(page)).toHaveCount(0);
});

const REPLACED = 'The code replaced the document of the preview, so the result is no longer shown. The run was stopped.';

for (const width of [1280, 390]) {
  test(`a result that writes a new document with document.write is reported at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openEditor(page, 'en', 'framework=vanilla');
    await originalRan(page, 'en');
    await appendTo(page, 'main.js', "\nsetTimeout(() => { document.open(); document.write('<p>Replaced</p>'); document.close(); }, 300);\n");
    await page.getByRole('button', { name: /^Run/ }).click();
    await expect(statusLine(page)).toHaveText(`The run failed: ${REPLACED}`, { timeout: 30_000 });
    await expect(resultFrame(page)).toHaveCount(0);
  });
}

test('a result that empties its document is reported and the run is stopped', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nsetTimeout(() => { document.documentElement.innerHTML = ''; }, 300);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(`The run failed: ${REPLACED}`, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(REPLACED));
  await expect(resultFrame(page)).toHaveCount(0);
});

test('a result that reloads itself without end is reported and the run is stopped', async ({ page }) => {
  const reloads = 'The code reloads the preview again and again, so the run was stopped.';
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(page, 'main.js', "\nsetTimeout(() => { location.reload(); }, 300);\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(`The run failed: ${reloads}`, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining(reloads));
  await expect(resultFrame(page)).toHaveCount(0);
});

// Error, link and form messages have a budget of 50 per run together: the first
// ones are shown, the rest counted in one entry; ready is always accepted.
const OUTCOME_DROPPED = /^Warning\s*(\d+) further error, link and form messages of this run were not shown after the first 50\.$/;

test('a flood of link activations shows the first 50 and counts the rest in one entry', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vanilla');
  await originalRan(page, 'en');
  await appendTo(
    page,
    'main.js',
    "\nconst flood = document.createElement('a');\nflood.href = 'https://example.com/flood';\nflood.textContent = 'flood';\ndocument.body.append(flood);\nfor (let i = 0; i < 120; i += 1) flood.click();\n",
  );
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.yourCodeRan, { timeout: 20_000 });
  await expect
    .poll(async () => (await logTexts(page)).filter((text) => OUTCOME_DROPPED.test(text)).map((text) => Number(OUTCOME_DROPPED.exec(text)?.[1])), { timeout: 20_000 })
    .toEqual([70]);
  expect((await logTexts(page)).filter((text) => text.includes('https://example.com/flood'))).toHaveLength(50);
});

test('an Angular template error fails the run at once with the compiler message', async ({ page, guard }) => {
  await openEditor(page, 'en', 'framework=angular');
  await originalRan(page, 'en');
  const code = await codeOf(page, 'example.component.ts');
  await code.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'guide-example',\n  template: `<button>Continue</buton>`,\n})\nexport class Example {}\n",
  );
  await page.getByRole('button', { name: /^Run/ }).click();
  // Well below the 20 s time limit of a run that never becomes ready.
  await expect(statusLine(page)).toHaveText(/^The run failed: .*Unexpected closing tag "buton"/, { timeout: 15_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringContaining('Unexpected closing tag "buton"'));
  allowFrameErrors(guard, /Unexpected closing tag|JIT compilation/);
});

test('a script error and an unknown import of a Vue file are placed at their lines in the file', async ({ page }) => {
  await openEditor(page, 'en', 'framework=vue');
  await originalRan(page, 'en');
  const code = await codeOf(page, 'Example.vue');
  await code.click();
  await page.keyboard.press('Control+A');
  // Line 9 opens the script block; line 11 has the syntax error.
  await page.keyboard.insertText('<template>\n  <p>One</p>\n  <p>Two</p>\n  <p>Three</p>\n  <p>Four</p>\n  <p>Five</p>\n</template>\n\n<script setup lang="ts">\nconst first = 1;\nconst = 3;\n</script>\n');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(statusLine(page)).toHaveText(TEXT.en.failed, { timeout: 30_000 });
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringMatching(/Example\.vue:11:7: /));

  await code.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("<template>\n  <p>{{ pad }}</p>\n</template>\n\n<script setup lang=\"ts\">\nimport pad from 'left-pad';\n</script>\n");
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect.poll(() => logTexts(page)).toContainEqual(expect.stringMatching(/Example\.vue:6:18 The editor does not provide the module left-pad/));
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
