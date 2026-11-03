import { expect, test } from '@playwright/test';
import { nativeProjectComponents } from '../../apps/playground/src/project-examples';
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']})) {
  for(const language of languages)test(`${framework} ${language} project renders and updates native state`,async({page})=>{
    await page.goto('/#component/toggle-group');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
    await expect(page.locator(`.nq-project-subheader [data-framework-icon="${framework}"]`)).toBeVisible();
    await expect(page.locator(`.nq-project-subheader [data-framework-icon="${language}"]`)).toBeVisible();
    const preview=page.frameLocator('.nq-ide-frame');
    await expect(preview.locator('.nq-toggle-group')).toHaveCount(6);
    await expect(preview.locator('.nq-toggle-group').first()).toBeVisible();
    await preview.locator('input[type="radio"]').nth(1).check({force:true});
    await expect(preview.locator('output')).toHaveText('second');
    await expect(page.locator('[data-ide-editor="html"]')).toContainText(`@nasaq/${framework}`);
    await page.locator('[data-ide-file="js"]').click();
    await expect(page.locator('[data-ide-editor="js"]')).toContainText("import './style.css'");
    await expect(page).toHaveURL(/#component\/toggle-group$/);
  });
}
test('vanilla TypeScript imports compile and errors stay inside the preview',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  await page.locator('[data-ide-file="js"]').click();
  await expect(page.locator('[data-ide-file="js"]')).toContainText('main.ts');
  const code=page.locator('[data-ide-editor="js"] .cm-content');await code.click();await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("const answer: number = 42; document.querySelector('#app')!.textContent = String(answer);");
  await page.locator('[data-ide-run]').click();
  await expect(page.frameLocator('.nq-ide-frame').locator('#app')).toHaveText('42');
});

test('project download includes real entry points and setup files',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('react');
  await page.locator('[data-project-language]').selectOption('typescript');
  const pending=page.waitForEvent('download');await page.locator('[data-project-download]').click();
  const download=await pending;expect(download.suggestedFilename()).toBe('nasaq-button-react-typescript.zip');
  await download.saveAs('.artifacts/nic-reference/project-react-download.zip');
  await page.setViewportSize({width:390,height:844});
  const toolbar=await page.locator('.nq-project-subheader').boundingBox();
  expect(toolbar!.x).toBeGreaterThanOrEqual(0);expect(toolbar!.x+toolbar!.width).toBeLessThanOrEqual(390);
});

for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']}))for(const language of languages)test(`every available ${framework} ${language} native project recipe renders and works`,async({page})=>{
  test.setTimeout(300000);
  for(const component of nativeProjectComponents) {
    await page.goto(`/#component/${component}`);await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.nq-ide-status'),`${framework}/${component}`).toHaveAttribute('data-state','ready',{timeout:30000});
    const preview=page.frameLocator('.nq-ide-frame');
    const selectors:Record<string,string>={'button':'.nq-button','icon-button':'.nq-button','text-field':'.nq-input','toggle-group':'.nq-toggle-group'};
    await expect(preview.locator(selectors[component] ?? `.nq-${component}`).first(),`${framework}/${language}/${component}`).toBeVisible();
    if(component==='select') {
      await preview.locator('select').selectOption('second');await expect(preview.locator('output')).toHaveText('second');
    } else if(component==='radio') {
      await preview.locator('input').first().focus();await preview.locator('input').first().press('ArrowDown');
      await expect(preview.locator('input').nth(1)).toBeChecked();await expect(preview.locator('output')).toHaveText('second');
    } else if(component==='accordion') {
      await preview.locator('summary').first().press('Enter');await expect(preview.locator('details').first()).toHaveAttribute('open','');
      await expect(preview.locator('output')).toHaveText('first:true');
      await preview.locator('summary').nth(1).click();await expect(preview.locator('details').nth(1)).toHaveAttribute('open','');
      await expect(preview.locator('details').first()).not.toHaveAttribute('open','');
    } else if(component==='tabs') {
      const tabs=preview.locator('.nq-tabs').first();
      await tabs.getByRole('tab').first().focus();await tabs.getByRole('tab').first().press('ArrowLeft');
      await expect(tabs.getByRole('tab').nth(1)).toHaveAttribute('aria-selected','true');await expect(preview.locator('output')).toHaveText('second');
      await expect(tabs.getByRole('tab').nth(2)).toBeDisabled();await expect(tabs.getByRole('tabpanel')).toHaveCount(1);
    } else if(component==='pagination') {
      const pagination=preview.locator('.nq-pagination').first();
      await pagination.locator('[data-nq-next]').click();await expect(preview.locator('output')).toHaveText('2');
      await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
    } else if(component==='stepper') {
      await expect(preview.locator('[data-state="complete"]')).toHaveCount(1);
      await preview.getByRole('button').click();await expect(preview.locator('[data-state="complete"]')).toHaveCount(2);
      await expect(preview.locator('[aria-current="step"]')).toHaveText('الإكمال');
    } else if(component==='breadcrumb') {
      await preview.getByRole('link').first().click();await expect(page).toHaveURL(/#component\/breadcrumb$/);
      await expect(preview.locator('[aria-current="page"]')).toHaveText('الطلب');
    } else if(component==='table') {
      await expect(preview.getByRole('table')).toHaveAccessibleName('الطلبات');
      await expect(preview.getByRole('rowheader')).toHaveCount(2);await expect(preview.getByRole('row')).toHaveCount(3);
    } else if(component==='progress') {
      await expect(preview.getByRole('progressbar')).toHaveAttribute('value','65');
    } else if(component==='card') {
      await expect(preview.locator('.nq-card-header')).toContainText('تفاصيل الخدمة');
      await expect(preview.locator('.nq-card-footer')).toContainText('متاحة إلكترونياً');
    }
    await expect(page.locator('.nq-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
  }
});

test('Vue scoped SFC styles remain scoped after TypeScript compilation',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('vue');await page.locator('[data-project-language]').selectOption('typescript');
  await page.locator('[data-ide-auto]').uncheck();
  const edit=async(file:string,source:string)=>{await page.locator(`[data-ide-file="${file}"]`).click();await page.locator(`[data-ide-editor="${file}"] .cm-content`).click();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(source);};
  await edit('html','<script setup lang="ts">const message: string = "Scoped";</script><template><p id="inside">{{message}}</p></template><style scoped>p {color:rgb(170,0,0)}</style>');
  await edit('js',"import {createApp} from 'vue'; import App from './App.vue'; createApp(App).mount('#app'); document.body.insertAdjacentHTML('beforeend','<p id=outside>Outside</p>');");
  await page.locator('[data-ide-run]').click();
  await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.nq-ide-frame');await expect(frame.locator('#inside')).toHaveCSS('color','rgb(170, 0, 0)');await expect(frame.locator('#outside')).not.toHaveCSS('color','rgb(170, 0, 0)');
});
