import {expect,test,type Locator,type Page} from '@playwright/test';

async function sameRow(choices: Locator) {
  await expect(choices).toHaveCount(2);
  const [a,b] = await Promise.all([choices.nth(0).boundingBox(),choices.nth(1).boundingBox()]);
  expect(a).not.toBeNull(); expect(b).not.toBeNull();
  expect(Math.abs(a!.y + a!.height / 2 - b!.y - b!.height / 2)).toBeLessThan(2);
  expect(a!.x + a!.width <= b!.x + 1 || b!.x + b!.width <= a!.x + 1).toBe(true);
}

async function besideText(control: Locator, selector: string) {
  const geometry = await control.evaluate((el,selector) => {
    const icon = el.querySelector(selector)?.getBoundingClientRect();
    const walker = document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim() || node.parentElement?.closest('[aria-hidden=true],svg')) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      const text = range.getBoundingClientRect();
      if (!icon || !icon.width || !text.width) continue;
      const overlap = Math.min(icon.bottom,text.bottom) - Math.max(icon.top,text.top);
      return {overlap:overlap / Math.min(icon.height,text.height), beside:icon.right <= text.left + 1 || text.right <= icon.left + 1};
    }
    return null;
  },selector);
  expect(geometry).not.toBeNull();
  expect(geometry!.beside).toBe(true);
  expect(geometry!.overlap).toBeGreaterThan(0.7);
}

function catalogCard(page: Page, id: string) {
  return page.locator('article.component-card').filter({has:page.locator(`a.component-card-docs[href="#component/${id}"]`)});
}

for (const locale of ['ar','en'] as const) test(`catalog feedback and standalone arrow stay inline in ${locale}`, async ({page},info) => {
  await page.addInitScript(locale => localStorage.setItem('hawiyah-locale',locale),locale);
  await page.goto('/#components');
  const main = page.getByRole('main');
  await expect(main).toHaveCount(1);
  const feedback = catalogCard(page,'feedback').locator('.component-preview .hw-feedback');
  const actions = feedback.locator('.hw-feedback-actions');
  const yes = actions.getByRole('button',{name:locale === 'ar' ? 'نعم' : 'Yes',exact:true});
  const no = actions.getByRole('button',{name:locale === 'ar' ? 'لا' : 'No',exact:true});
  const arrow = catalogCard(page,'link').locator('.component-preview a.hw-link[data-variant="standalone"]');
  for (const width of [1864,390]) {
    await page.setViewportSize({width,height:884});
    await sameRow(actions.getByRole('button'));
    await yes.click(); await expect(yes).toHaveAttribute('aria-pressed','true');
    await expect(feedback.locator('[data-hw-feedback-value]')).toHaveValue('yes');
    await no.click(); await expect(no).toHaveAttribute('aria-pressed','true');
    await expect(yes).toHaveAttribute('aria-pressed','false');
    await expect(feedback.locator('[data-hw-feedback-value]')).toHaveValue('no');
    await besideText(arrow,'svg');
    await arrow.click(); await expect(page).toHaveURL(/#components$/);
  }
  await feedback.screenshot({path:info.outputPath(`feedback-${locale}.png`)});
});

test('portal shell previews preserve one main and a local skip target while their snippets keep main', async ({page}) => {
  await page.goto('/#components');
  const gallery = catalogCard(page,'portal-layout');
  await expect(gallery.locator('.source-details code').first()).toContainText('<main');
  await page.goto('/#component/portal-layout');
  await expect(page.getByRole('main')).toHaveCount(1);
  const embedded = page.locator('.component-preview .hw-portal-layout');
  await expect(embedded).toHaveCount(2);
  for (const shell of await embedded.all()) {
    const section = shell.locator('section.hw-portal-layout-main');
    await expect(section).toHaveCount(1);
    const skip = shell.locator('.hw-skip-link');
    await expect(skip).toHaveAttribute('href','#' + await section.getAttribute('id'));
    await skip.focus(); await skip.press('Enter');
    await expect(section).toBeFocused();
    await expect(page).toHaveURL(/#component\/portal-layout$/);
  }
  await expect(page.locator('[data-ready-example^="portal-layout-"] .source-details code').first()).toContainText('<main');
});

for (const framework of ['react','vue','angular']) test(`${framework} feedback variants and standalone arrow`, async ({page},info) => {
  test.setTimeout(90000);
  await page.goto('/#component/feedback'); await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  if (framework !== 'angular') await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame = page.frameLocator('.hw-ide-frame');
  const output = frame.locator('.demo > output');
  for (const variant of ['text','icon-text','icon']) {
    const root = frame.locator(`.hw-feedback[data-choice-variant="${variant}"]`);
    const actions = root.locator('.hw-feedback-actions');
    // Every adapter renders the two choices as toggle buttons; the projects show value.helpful.
    const choices = actions.locator('button');
    await sameRow(choices);
    const yes = actions.getByRole('button',{name:'نعم',exact:true}), no = actions.getByRole('button',{name:'لا',exact:true});
    await choices.first().click(); await expect(output).toHaveText('true');
    await expect(yes).toHaveAttribute('aria-pressed','true'); await no.press('Space'); await expect(no).toHaveAttribute('aria-pressed','true');
    await expect(yes).toHaveAttribute('aria-pressed','false');
    await expect(output).toHaveText('false');
    for (const [index,name] of ['thumbs-up','thumbs-down'].entries()) {
      const icon = choices.nth(index).locator('.hw-feedback-icon');
      if (variant === 'text') await expect(icon).toBeHidden();
      else {
        await expect(icon).toBeVisible();
        await expect(icon).toHaveAttribute('data-icon',name);
        if (variant === 'icon-text') await besideText(choices.nth(index),'.hw-feedback-icon');
      }
    }
  }
  await frame.locator('.hw-feedback[data-choice-variant="icon-text"]').screenshot({path:info.outputPath(`${framework}-feedback.png`)});
  await page.goto('/#component/link'); await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption(framework);
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const arrow = frame.locator('a.hw-link[data-variant="standalone"]');
  await besideText(arrow,'.hw-icon');
  await arrow.click(); await expect(page).toHaveURL(/#component\/link$/);
});
