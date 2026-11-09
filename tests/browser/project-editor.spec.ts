import {readFileSync} from 'node:fs';
import {expect, test, type FrameLocator, type Page} from '@playwright/test';
import {nativeProjectComponents, projectExample} from '../../apps/playground/src/project-examples';
import type {ProjectFramework, ProjectLanguage} from '../../apps/playground/src/project-compiler';
for(const [framework,languages] of Object.entries({react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']})) {
  for(const language of languages)test(`${framework} ${language} project renders and updates native state`,async({page})=>{
    await page.goto('/#component/toggle-group');
    await page.locator('[data-guide-tab="playground"]').click();
    await page.locator('[data-project-framework]').selectOption(framework);
    if(framework!=='angular')await page.locator('[data-project-language]').selectOption(language);
    await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
    await expect(page.locator(`.hw-project-subheader [data-framework-icon="${framework}"]`)).toBeVisible();
    await expect(page.locator(`.hw-project-subheader [data-framework-icon="${language}"]`)).toBeVisible();
    const preview=page.frameLocator('.hw-ide-frame');
    await expect(preview.locator('.hw-toggle-group')).toHaveCount(6);
    await expect(preview.locator('.hw-toggle-group').first()).toBeVisible();
    await preview.locator('input[type="radio"]').nth(1).check({force:true});
    await expect(preview.locator('output')).toHaveText('second');
    await expect(page.locator('[data-ide-editor="html"]')).toContainText(`@hawiyah/${framework}`);
    await page.locator('[data-ide-file="js"]').click();
    await expect(page.locator('[data-ide-editor="js"]')).toContainText("import './style.css'");
    await expect(page).toHaveURL(/#component\/toggle-group$/);
  });
}
test('vanilla TypeScript imports compile and errors stay inside the preview',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-language]').selectOption('typescript');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  await page.locator('[data-ide-file="js"]').click();
  await expect(page.locator('[data-ide-file="js"]')).toContainText('main.ts');
  const code=page.locator('[data-ide-editor="js"] .cm-content');await code.click();await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("const answer: number = 42; document.querySelector('#app')!.textContent = String(answer);");
  await page.locator('[data-ide-run]').click();
  await expect(page.frameLocator('.hw-ide-frame').locator('#app')).toHaveText('42');
  await code.click(); await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("throw new Error('Example runtime error')");
  await page.locator('[data-ide-run]').click();
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','error');
  await expect(page.locator('.hw-ide-console')).toContainText('Example runtime error');
  await expect(page).toHaveURL(/#component\/button$/);
});

test('project download includes real entry points and setup files',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('react');
  await page.locator('[data-project-language]').selectOption('typescript');
  const pending=page.waitForEvent('download');await page.locator('[data-project-download]').click();
  const download=await pending;expect(download.suggestedFilename()).toBe('hawiyah-button-react-typescript.zip');
  const archive = readFileSync((await download.path())!);
  for (const name of ['App.tsx','main.tsx','index.html','package.json','tsconfig.json','vite.config.js','style.css']) {
    expect(archive.includes(Buffer.from(name)), `missing ${name} in React project download`).toBe(true);
  }
  await page.setViewportSize({width:390,height:844});
  const toolbar=await page.locator('.hw-project-subheader').boundingBox();
  expect(toolbar!.x).toBeGreaterThanOrEqual(0);expect(toolbar!.x+toolbar!.width).toBeLessThanOrEqual(390);
});

type ProjectFormat = {framework: ProjectFramework; language: ProjectLanguage};
const formats: ProjectFormat[] = [
  {framework:'vanilla',language:'javascript'}, {framework:'vanilla',language:'typescript'},
  {framework:'react',language:'javascript'}, {framework:'react',language:'typescript'},
  {framework:'vue',language:'javascript'}, {framework:'vue',language:'typescript'},
  {framework:'angular',language:'typescript'},
];

type CatalogEntry = {id: string; cssClasses: string[]};
const manifest: {components: CatalogEntry[]} = JSON.parse(readFileSync(new URL('../../components.json',import.meta.url),'utf8'));
const routeAliases: Record<string,string> = {'file-upload':'upload', 'empty-state':'empty'};
const catalog = manifest.components.map(entry => ({...entry, id:routeAliases[entry.id] ?? entry.id}));

test('every public catalog entry has a native project, and unknown native recipes are rejected', () => {
  expect([...nativeProjectComponents].sort()).toEqual(catalog.map(entry => entry.id).sort());
  expect(() => projectExample('unregistered-example','react','typescript','ar','')).toThrow(/Native project recipe pending/);
});

async function openProject(page: Page, id: string, {framework,language}: ProjectFormat) {
  await page.goto(`/#component/${id}`);
  const playground = page.locator('[data-guide-tab="playground"]');
  await expect(playground,`guide page for ${id}`).toBeVisible({timeout:15000});
  await playground.click();
  const frameworkSelect = page.locator('[data-project-framework]');
  const languageSelect = page.locator('[data-project-language]');
  await expect(frameworkSelect,`project editor for ${id}`).toBeVisible({timeout:30000});
  if (await frameworkSelect.inputValue() !== framework) await frameworkSelect.selectOption(framework);
  if (await languageSelect.inputValue() !== language) await languageSelect.selectOption(language);
  await expect(page.locator('[data-project-download]')).toBeEnabled();
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  return page.frameLocator('.hw-ide-frame');
}

async function checkDisclosure(id: string, preview: FrameLocator) {
  if (id === 'tooltip') {
    const trigger = preview.locator('[data-disclosure-project="tooltip"] [aria-describedby]').first();
    await trigger.focus();
    const tip = preview.getByRole('tooltip');
    await expect(tip).toBeVisible();
    await trigger.press('Escape'); await expect(tip).toHaveCount(0);
    return true;
  }
  const panels: Record<string, {opener:string; panel:string; key:string}> = {
    dialog: {opener:'[data-notice-open="warning"]',panel:'dialog[open]',key:'Enter'},
    drawer: {opener:'[data-disclosure-project="drawer"] button',panel:'dialog[open]',key:'Enter'},
    'navigation-drawer': {opener:'[data-drawer-open]',panel:'dialog[open]',key:'Enter'},
    menu: {opener:'[data-disclosure-project="menu"] button',panel:'[role="menu"]',key:'ArrowDown'},
    popover: {opener:'[data-disclosure-project="popover"] button',panel:'[role="region"]',key:'Enter'},
  };
  const spec = panels[id];
  if (!spec) return false;
  const opener = preview.locator(spec.opener).first();
  await expect(opener).toBeVisible(); await opener.press(spec.key);
  const panel = preview.locator(spec.panel).filter({visible:true}).first();
  await expect(panel).toBeVisible();
  // Escape travels through a focused control, including roving menu items.
  const focused = preview.locator(':focus');
  await focused.press('Escape');
  await expect(panel).toHaveCount(0); await expect(opener).toBeFocused();
  return true;
}

async function checkRendered(entry: CatalogEntry, preview: FrameLocator) {
  if (await checkDisclosure(entry.id, preview)) return;
  if (entry.id === 'spacer') {
    // A flexible spacer is decorative and can legitimately have zero height.
    const spacer = preview.locator('.hw-spacer').first();
    await expect(spacer).toBeAttached();
    expect(await spacer.evaluate(node => Number(getComputedStyle(node).flexGrow))).toBeGreaterThan(0);
    return;
  }
  if (entry.id === 'upload' || entry.id === 'file-dropzone') {
    // The upload surface may style the native chooser through its label.
    const chooser = preview.locator('input[type=file]:not(:disabled)').first();
    await expect(chooser).toBeAttached();
    expect(await chooser.evaluate(node => Boolean((node as HTMLInputElement).labels?.length))).toBe(true);
    return;
  }
  const semantics: Record<string,string> = {
    button:'button', 'icon-button':'button[aria-label]', 'text-field':'input:not([type=hidden])', textarea:'textarea', select:'select',
    checkbox:'input[type=checkbox]', radio:'input[type=radio]', switch:'input[role=switch], [role=switch], input[type=checkbox]',
    combobox:'[role=combobox]', 'pin-input':'input[autocomplete=one-time-code]', 'tag-input':'.hw-tag-input input:not([type=hidden])',
    'multi-select':'input[type=checkbox]', 'number-field':'input[type=number]', slider:'input[type=range]', 'range-slider':'input[type=range]',
    'password-field':'input[type=password]', 'search-field':'input[type=search], .hw-search-field input:not([type=hidden])',
    calendar:'table[role=grid]', 'date-picker':'input[aria-haspopup=dialog]', 'input-group':'.hw-input-group input',
    field:'label', table:'table', 'data-table':'table', 'description-list':'dl', progress:'progress, [role=progressbar]', meter:'meter, [role=meter]',
    tabs:'[role=tablist]', 'tree-view':'[role=tree]', collapsible:'details > summary', accordion:'details > summary',
    link:'a[href]', 'secondary-nav':'nav a[href]', 'portal-layout':'main', 'mobile-top-bar':'header h1, header h2, header h3',
    'portal-header':'header', 'portal-footer':'footer', breadcrumb:'[aria-current=page]', 'content-navigation':'nav a[data-hw-section]',
    'toast-region':'[data-toast-demo] button', 'app-shell':'main', 'page-header':'h1, h2', 'avatar-group':'.hw-avatar-group',
  };
  // Layout, surface and decorative components expose public classes documented
  // in the catalog. Their route IDs need not be CSS class names.
  const selector = semantics[entry.id] ?? '.' + entry.cssClasses[0];
  await expect(preview.locator(selector).filter({visible:true}).first(),`rendered ${entry.id}`).toBeVisible();
}

async function checkNativeInteraction(component: string, preview: FrameLocator) {
  if (component === 'search-field') {
    const example = preview.locator('[data-search-demo="suggestions"]'), input = example.locator('input');
    await input.fill('License'); await input.press('ArrowDown'); await input.press('Enter');
    await expect(input).toHaveValue('License renewal'); await input.press('Enter');
    await expect(example.locator('[data-search-demo-result]')).toContainText('License renewal');
  } else if (component === 'content-navigation') {
    const example = preview.locator('.content-navigation-demo').first(), link = example.locator('a[data-hw-section]').last();
    await link.click(); await expect(link).toHaveAttribute('aria-current','location');
    await expect(example.locator('output')).toContainText('support');
  } else if (component === 'select') {
    const example = preview.locator('[data-select-demo="single"]');
    await example.locator('select').selectOption('second'); await expect(example.locator('output')).toHaveText('second');
  } else if (component === 'radio') {
    const radios = preview.getByRole('radio');
    await radios.first().press('ArrowDown'); await expect(radios.nth(1)).toBeChecked();
    await expect(preview.locator('output').first()).toHaveText('second');
  } else if (component === 'accordion') {
    const items = preview.locator('details');
    await items.first().locator('summary').press('Enter');
    await expect(items.first()).toHaveAttribute('open','');
    await expect(preview.locator('output').first()).toHaveText('first:true');
    await items.nth(1).locator('summary').press('Enter');
    await expect(items.nth(1)).toHaveAttribute('open',''); await expect(items.first()).not.toHaveAttribute('open','');
  } else if (component === 'tabs') {
    const example = preview.locator('[data-tabs-demo="basic"]');
    const tabs = example.getByRole('tab');
    await tabs.first().press('ArrowLeft');
    await expect(example.getByRole('tab',{name:'المتطلبات'})).toHaveAttribute('aria-selected','true');
    await expect(example.locator('output')).toHaveText('second');
    await expect(example.getByRole('tab',{name:'غير متاح'})).toBeDisabled();
    await expect(example.getByRole('tabpanel')).toHaveCount(1);
  } else if (component === 'pagination') {
    const pagination = preview.locator('.hw-pagination').first();
    await pagination.locator('[data-hw-next]').click();
    await expect(preview.locator('output').first()).toHaveText('2');
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');
  } else if (component === 'stepper') {
    await expect(preview.locator('[data-state=complete]')).toHaveCount(1);
    await preview.getByRole('button').first().click();
    await expect(preview.locator('[data-state=complete]')).toHaveCount(2);
    await expect(preview.locator('[aria-current=step]')).toContainText('الإكمال');
  } else if (component === 'breadcrumb') {
    await preview.getByRole('link').first().click();
    await expect(preview.locator('[aria-current=page]').first()).toHaveText('الطلب');
  } else if (component === 'table') {
    const table = preview.getByRole('table',{name:'الطلبات'}).first();
    await expect(table.getByRole('rowheader')).toHaveCount(2);
    await expect(table.getByRole('row')).toHaveCount(3);
  } else if (component === 'progress') {
    const bar = preview.getByRole('progressbar').first();
    expect(await bar.evaluate(el => el.getAttribute('aria-valuenow') ?? el.getAttribute('value'))).toBe('65');
  } else if (component === 'card') {
    await expect(preview.locator('.hw-card-header').first()).toContainText('تفاصيل الخدمة');
    await expect(preview.locator('.hw-card-footer').first()).toContainText('متاحة إلكترونياً');
  }
}

for (const format of formats) {
  for (let start = 0; start < catalog.length; start += 4) {
    const group = catalog.slice(start,start + 4);
    test(`catalog ${format.framework} ${format.language} — ${group.map(entry => entry.id).join(', ')}`, async ({page}) => {
      test.setTimeout(240000);
      for (const entry of group) await test.step(entry.id, async () => {
        const preview = await openProject(page, entry.id, format);
        await checkRendered(entry, preview);
        if (format.framework !== 'vanilla') await checkNativeInteraction(entry.id,preview);
        await expect(page.locator('.hw-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
        await expect(page).toHaveURL(new RegExp(`#component/${entry.id}$`));
      });
    });
  }
}

test('Vue scoped SFC styles remain scoped after TypeScript compilation',async({page})=>{
  await page.goto('/#component/button');await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('vue');await page.locator('[data-project-language]').selectOption('typescript');
  await page.locator('[data-ide-auto]').uncheck();
  const edit=async(file:string,source:string)=>{await page.locator(`[data-ide-file="${file}"]`).click();await page.locator(`[data-ide-editor="${file}"] .cm-content`).click();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(source);};
  await edit('html','<script setup lang="ts">const message: string = "Scoped";</script><template><p id="inside">{{message}}</p></template><style scoped>p {color:rgb(170,0,0)}</style>');
  await edit('js',"import {createApp} from 'vue'; import App from './App.vue'; createApp(App).mount('#app'); document.body.insertAdjacentHTML('beforeend','<p id=outside>Outside</p>');");
  await page.locator('[data-ide-run]').click();
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
  const frame=page.frameLocator('.hw-ide-frame');await expect(frame.locator('#inside')).toHaveCSS('color','rgb(170, 0, 0)');await expect(frame.locator('#outside')).not.toHaveCSS('color','rgb(170, 0, 0)');
});
