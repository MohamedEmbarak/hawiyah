import type {Locale} from './data';

const componentNames = {tooltip: 'Tooltip', popover: 'Popover', menu: 'Menu', drawer: 'Drawer', collapsible: 'Collapsible', 'tree-view': 'TreeView'} as const;
type DisclosureId = keyof typeof componentNames;
export const disclosureProjectIds = Object.keys(componentNames) as DisclosureId[];
export function isDisclosureProjectId(id: string): id is DisclosureId {
  return Object.hasOwn(componentNames, id);
}
interface Markup {
  react: string;
  vue: string;
  angular: string;
  vanilla: string;
  initialValue?: string;
  stateType?: 'string' | 'boolean';
  angularMember?: string;
  vanillaScript?: string;
}
type Translate = (en: string, ar: string) => string;

function tooltip(t: Translate): Markup {
  const term = t('Application reference', 'الرقم المرجعي للطلب');
  const tip = t('Find this reference in your confirmation message.', 'ستجد هذا الرقم في رسالة تأكيد الطلب.');
  return {
    vanilla: `<span class="nq-tooltip-anchor" data-nq="tooltip"><span tabindex="0" data-nq-tooltip-trigger>${term}</span><span class="nq-tooltip" role="tooltip" hidden>${tip}</span></span>`,
    react: `<Tooltip content="${tip}"><span tabIndex={0}>${term}</span></Tooltip>`,
    vue: `<Tooltip content="${tip}"><span tabindex="0">${term}</span></Tooltip>`,
    angular: `<nq-tooltip text="${tip}">${term}</nq-tooltip>`,
  };
}

function popover(t: Translate): Markup {
  const trigger = t('Check requirements', 'تحقق من المتطلبات');
  const label = t('Service requirements', 'متطلبات الخدمة');
  const checkbox = `<label><input type="checkbox" class="nq-checkbox"> ${t('I have the supporting documents', 'لدي المستندات الداعمة')}</label>`;
  return {
    vanilla: `<div class="nq-popover" data-nq="popover"><button type="button" class="nq-button" data-nq-trigger>${trigger}</button>
  <section class="nq-popover-panel" data-nq-panel role="region" aria-labelledby="requirements-title" hidden><h3 id="requirements-title">${label}</h3>${checkbox}</section></div>`,
    react: `<Popover title="${label}" trigger={<button type="button" className="nq-button">${trigger}</button>}>
  ${checkbox.replace('class="nq-checkbox">', 'className="nq-checkbox" />')}
</Popover>`,
    vue: `<Popover label="${label}" trigger-label="${trigger}">${checkbox}</Popover>`,
    angular: `<nq-popover label="${label}" triggerLabel="${trigger}">${checkbox}</nq-popover>`,
  };
}

function output(label: string, expression: string, framework: 'react' | 'vue' | 'angular' | 'vanilla') {
  const value = framework === 'vanilla' ? '—' : framework === 'react' ? `{${expression}}` : `{{ ${expression} }}`;
  return `<p>${label} <output aria-label="${label}" data-project-selection>${value}</output></p>`;
}
const selectionScript = (typed: boolean) => `
const selection = root.querySelector('[data-project-selection]');
const onSelection = (event${typed ? ': Event' : ''}) => {
  if (selection instanceof HTMLOutputElement && event instanceof CustomEvent && typeof event.detail?.value === 'string') {
    selection.value = event.detail.value;
  }
};
root.addEventListener('nq:change', onSelection);
window.addEventListener('pagehide', () => root.removeEventListener('nq:change', onSelection), {once: true});
`;
function withSelection(sample: Markup, label: string, typed: boolean): Markup {
  return {
    react: sample.react + '\n' + output(label, "value || '—'", 'react'),
    vue: sample.vue + '\n' + output(label, "value || '—'", 'vue'),
    angular: sample.angular + '\n' + output(label, "value || '—'", 'angular'),
    vanilla: sample.vanilla + '\n' + output(label, '', 'vanilla'),
    initialValue: "''", angularMember: sample.angularMember,
    vanillaScript: selectionScript(typed),
  };
}

function menu(t: Translate, typed: boolean): Markup {
  const label = t('Request actions', 'إجراءات الطلب');
  const items = [
    {value: 'review', label: t('Review details', 'مراجعة التفاصيل')},
    {value: 'archive', label: t('Archive', 'أرشفة'), disabled: true},
    {value: 'duplicate', label: t('Duplicate request', 'تكرار الطلب')},
  ];
  const data = JSON.stringify(items);
  return withSelection({
    vanilla: `<div class="nq-menu" data-nq="menu"><button class="nq-button" type="button" data-nq-trigger>${label}</button>
  <div class="nq-menu-content" data-nq-panel role="menu" aria-label="${label}" hidden>
    ${items.map(item => `<button class="nq-menu-item" type="button" role="menuitem" data-nq-value="${item.value}"${item.disabled ? ' disabled' : ''}>${item.label}</button>`).join('\n    ')}
  </div></div>`,
    react: `<Menu label="${label}" items={${data}} onAction={setValue}
  trigger={<button className="nq-button" type="button">${label}</button>} />`,
    vue: `<Menu label="${label}" :items='${data}' @select="value = $event" />`,
    angular: `<nq-menu label="${label}" triggerLabel="${label}" [items]="actions" (action)="value = $event" />`,
    angularMember: `\n  readonly actions = ${JSON.stringify(items.map(({value, ...item}) => ({id: value, ...item})))};`,
  }, t('Last action ID', 'معرّف آخر إجراء'), typed);
}

function drawer(t: Translate): Markup {
  const trigger = t('Filter requests', 'تصفية الطلبات');
  const title = t('Request filters', 'مرشحات الطلبات');
  const close = t('Close filters', 'إغلاق المرشحات');
  const label = t('Include closed requests', 'تضمين الطلبات المغلقة');
  const field = `<label><input class="nq-checkbox" type="checkbox"> ${label}</label>`;
  return {
    vanilla: `<button type="button" class="nq-button" data-nq-dialog-open="request-filters">${trigger}</button>
<dialog id="request-filters" class="nq-dialog nq-drawer" data-nq="drawer" data-side="end" aria-labelledby="filters-title">
  <div class="nq-dialog-header"><h2 id="filters-title">${title}</h2><button type="button" class="nq-button" data-nq-dialog-close>${close}</button></div>
  <div class="nq-dialog-body">${field}</div>
</dialog>`,
    react: `<Drawer side="end" title="${title}" closeLabel="${close}"
  trigger={<button type="button" className="nq-button">${trigger}</button>}>
  ${field.replace('class=', 'className=').replace('checkbox">', 'checkbox" />')}
</Drawer>`,
    vue: `<Drawer side="end" title="${title}" close-label="${close}">
  <template #trigger="{ open }"><button type="button" class="nq-button" @click="open">${trigger}</button></template>
  ${field}
</Drawer>`,
    angular: `<button type="button" class="nq-button" #opener (click)="filters.show(opener)">${trigger}</button>
<nq-drawer #filters side="end" title="${title}" closeLabel="${close}">${field}</nq-drawer>`,
  };
}

function collapsible(t: Translate): Markup {
  const label = t('Before you apply', 'قبل تقديم الطلب');
  const body = `<ul><li>${t('Prepare your identification.', 'جهّز وثيقة الهوية.')}</li><li>${t('Check your contact details.', 'تحقق من بيانات التواصل.')}</li></ul>`;
  return {
    vanilla: `<details class="nq-collapsible"><summary>${label}</summary>${body}</details>`,
    react: `<Collapsible title="${label}">${body}</Collapsible>`,
    vue: `<Collapsible label="${label}">${body}</Collapsible>`,
    angular: `<nq-collapsible label="${label}">${body}</nq-collapsible>`,
  };
}

function tree(t: Translate, typed: boolean): Markup {
  const label = t('Application documents', 'مستندات الطلب');
  const business = t('Business documents', 'مستندات المنشأة');
  const children = [{id: 'license', label: t('Commercial license', 'الرخصة التجارية')}, {id: 'address', label: t('Address proof', 'إثبات العنوان')}];
  const personal = {id: 'personal', label: t('Personal documents', 'المستندات الشخصية')};
  const data = JSON.stringify([{id: 'business', label: business, children}, personal]);
  const leaf = (item: {id: string; label: string}) => `<li role="treeitem" data-nq-value="${item.id}"><span data-nq-tree-label>${item.label}</span></li>`;
  return withSelection({
    vanilla: `<ul class="nq-tree-view" data-nq="tree-view" role="tree" aria-label="${label}">
  <li role="treeitem" data-nq-value="business" aria-expanded="false"><button type="button" data-nq-tree-toggle tabindex="-1" aria-label="${t('Toggle business documents','تبديل عرض مستندات المنشأة')}">▸</button><span data-nq-tree-label>${business}</span>
    <ul role="group" hidden>${children.map(leaf).join('\n      ')}</ul>
  </li>
  ${leaf(personal)}
</ul>`,
    react: `<TreeView label="${label}" items={${data}} value={value} onValueChange={setValue} />`,
    vue: `<TreeView label="${label}" :items='${data}' v-model="value"
  :expand-label="node => '${t('Expand', 'توسيع')} ' + node.label" :collapse-label="node => '${t('Collapse', 'طي')} ' + node.label" />`,
    angular: `<nq-tree-view label="${label}" [nodes]="documents" [(value)]="value" />`,
    angularMember: `\n  readonly documents = ${data};`,
  }, t('Selected document ID', 'معرّف المستند المحدد'), typed);
}

const recipes = {tooltip, popover, menu, drawer, collapsible, 'tree-view': tree};
export function disclosureProjectRecipe(id: DisclosureId, locale: Locale, typed: boolean) {
  const result = recipes[id]((en, ar) => locale === 'ar' ? ar : en, typed);
  const wrap = (markup: string, classAttribute: string) =>
    `<div ${classAttribute}="nq-stack" data-disclosure-project="${id}">\n${markup}\n</div>`;
  return {...result, component: componentNames[id], react: wrap(result.react, 'className'), vue: wrap(result.vue, 'class'), angular: wrap(result.angular, 'class'), vanilla: wrap(result.vanilla, 'class')};
}
