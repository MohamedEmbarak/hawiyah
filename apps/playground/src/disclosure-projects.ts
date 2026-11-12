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
  const variants = [
    ['top', 'start'], ['top', 'center'], ['top', 'end'],
    ['bottom', 'center'], ['start', 'center'], ['end', 'center'],
  ];
  const wrap = (items: string[]) => `<div class="hw-cluster" style="gap:4rem;padding:4rem;justify-content:center">${items.join('')}</div>`;
  return {
    vanilla: wrap(variants.map(([placement, align]) => `<span class="hw-tooltip-anchor" data-hw="tooltip"><span tabindex="0" data-hw-tooltip-trigger>${term} (${placement}/${align})</span><span class="hw-tooltip" role="tooltip" data-placement="${placement}" data-align="${align}" hidden>${tip}</span></span>`)),
    react: wrap(variants.map(([placement, align]) => `<Tooltip content="${tip}" placement="${placement}" align="${align}"><span tabIndex={0}>${term} (${placement}/${align})</span></Tooltip>`)).replace('class=', 'className=').replace('style="gap:4rem;padding:4rem;justify-content:center"', 'style={{gap:"4rem",padding:"4rem",justifyContent:"center"}}'),
    vue: wrap(variants.map(([placement, align]) => `<Tooltip content="${tip}" placement="${placement}" align="${align}"><span tabindex="0">${term} (${placement}/${align})</span></Tooltip>`)),
    angular: wrap(variants.map(([placement, align]) => `<hw-tooltip text="${tip}" placement="${placement}" align="${align}"><span hwTooltipTrigger tabindex="0">${term} (${placement}/${align})</span></hw-tooltip>`)),
  };
}

function popover(t: Translate): Markup {
  const trigger = t('Check requirements', 'تحقق من المتطلبات');
  const label = t('Service requirements', 'متطلبات الخدمة');
  const checkbox = `<label><input type="checkbox" class="hw-checkbox"> ${t('I have the supporting documents', 'لدي المستندات الداعمة')}</label>`;
  return {
    vanilla: `<div class="hw-popover" data-hw="popover"><button type="button" class="hw-button" data-variant="secondary" data-hw-trigger>${trigger}</button>
  <div class="hw-popover-panel" data-hw-panel role="region" aria-label="${label}" hidden>${checkbox}</div></div>`,
    react: `<Popover label="${label}" trigger={<button type="button" className="hw-button" data-variant="secondary">${trigger}</button>}>
  ${checkbox.replace('class="hw-checkbox">', 'className="hw-checkbox" />')}
</Popover>`,
    vue: `<Popover label="${label}" trigger-label="${trigger}">${checkbox}</Popover>`,
    angular: `<hw-popover label="${label}" triggerLabel="${trigger}">${checkbox}</hw-popover>`,
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
root.addEventListener('hw:change', onSelection);
window.addEventListener('pagehide', () => root.removeEventListener('hw:change', onSelection), {once: true});
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
    vanilla: `<div class="hw-menu" data-hw="menu"><button class="hw-button" data-variant="secondary" type="button" data-hw-trigger>${label}</button>
  <div class="hw-menu-content" data-hw-panel role="menu" aria-label="${label}" hidden>
    ${items.map(item => `<button class="hw-menu-item" type="button" role="menuitem" data-hw-value="${item.value}"${item.disabled ? ' disabled' : ''}>${item.label}</button>`).join('\n    ')}
  </div></div>`,
    react: `<Menu label="${label}" items={${data}} onAction={setValue}
  trigger={<button className="hw-button" data-variant="secondary" type="button">${label}</button>} />`,
    vue: `<Menu label="${label}" trigger-label="${label}" :items='${data}' @action="value = $event" />`,
    angular: `<hw-menu label="${label}" triggerLabel="${label}" [items]="actions" (action)="value = $event" />`,
    angularMember: `\n  readonly actions = ${data};`,
  }, t('Last action ID', 'معرّف آخر إجراء'), typed);
}

function drawer(t: Translate): Markup {
  const trigger = t('Filter requests', 'تصفية الطلبات');
  const title = t('Request filters', 'مرشحات الطلبات');
  const close = t('Close filters', 'إغلاق المرشحات');
  const label = t('Include closed requests', 'تضمين الطلبات المغلقة');
  const field = `<label><input class="hw-checkbox" type="checkbox"> ${label}</label>`;
  return {
    vanilla: `<button type="button" class="hw-button" data-hw-dialog-open="request-filters">${trigger}</button>
<dialog id="request-filters" class="hw-dialog hw-drawer" data-hw="drawer" data-side="end" aria-labelledby="filters-title">
  <div class="hw-dialog-header"><h2 id="filters-title">${title}</h2><button type="button" class="hw-button" data-hw-dialog-close>${close}</button></div>
  <div class="hw-dialog-body">${field}</div>
</dialog>`,
    react: `<Drawer side="end" title="${title}" closeLabel="${close}"
  trigger={<button type="button" className="hw-button">${trigger}</button>}>
  ${field.replace('class=', 'className=').replace('checkbox">', 'checkbox" />')}
</Drawer>`,
    vue: `<Drawer side="end" title="${title}" close-label="${close}">
  <template #trigger="{ open }"><button type="button" class="hw-button" @click="open">${trigger}</button></template>
  ${field}
</Drawer>`,
    angular: `<button type="button" class="hw-button" #opener (click)="filters.show(opener)">${trigger}</button>
<hw-drawer #filters side="end" title="${title}" closeLabel="${close}">${field}</hw-drawer>`,
  };
}

function collapsible(t: Translate): Markup {
  const label = t('Before you apply', 'قبل تقديم الطلب');
  const body = `<ul><li>${t('Prepare your identification.', 'جهّز وثيقة الهوية.')}</li><li>${t('Check your contact details.', 'تحقق من بيانات التواصل.')}</li></ul>`;
  return {
    vanilla: `<details class="hw-collapsible"><summary>${label}</summary>${body}</details>`,
    react: `<Collapsible label="${label}">${body}</Collapsible>`,
    vue: `<Collapsible label="${label}">${body}</Collapsible>`,
    angular: `<hw-collapsible label="${label}">${body}</hw-collapsible>`,
  };
}

function tree(t: Translate, typed: boolean): Markup {
  const label = t('Application documents', 'مستندات الطلب');
  const business = t('Business documents', 'مستندات المنشأة');
  const children = [{id: 'license', label: t('Commercial license', 'الرخصة التجارية')}, {id: 'address', label: t('Address proof', 'إثبات العنوان')}];
  const personal = {id: 'personal', label: t('Personal documents', 'المستندات الشخصية')};
  const data = JSON.stringify([{id: 'business', label: business, children}, personal]);
  const leaf = (item: {id: string; label: string}) => `<li role="treeitem" data-hw-value="${item.id}"><span data-hw-tree-label>${item.label}</span></li>`;
  return withSelection({
    vanilla: `<ul class="hw-tree-view" data-hw="tree-view" role="tree" aria-label="${label}" data-hw-expand-label="${t('Expand', 'توسيع')} {label}" data-hw-collapse-label="${t('Collapse', 'طي')} {label}">
  <li role="treeitem" data-hw-value="business" aria-expanded="false"><button type="button" class="hw-tree-toggle" data-hw-tree-toggle tabindex="-1"><span class="hw-icon" data-icon="arrow-right-01" data-directional="true" data-size="sm" aria-hidden="true"></span></button><span data-hw-tree-label>${business}</span>
    <ul role="group" hidden>${children.map(leaf).join('\n      ')}</ul>
  </li>
  ${leaf(personal)}
</ul>`,
    react: `<TreeView label="${label}" items={${data}} value={value} onValueChange={setValue}
  getExpandLabel={node => '${t('Expand', 'توسيع')} ' + node.label} getCollapseLabel={node => '${t('Collapse', 'طي')} ' + node.label} />`,
    vue: `<TreeView label="${label}" :items='${data}' v-model="value"
  :get-expand-label="node => '${t('Expand', 'توسيع')} ' + node.label" :get-collapse-label="node => '${t('Collapse', 'طي')} ' + node.label" />`,
    angular: `<hw-tree-view label="${label}" [items]="documents" [(value)]="value"
  [getExpandLabel]="expandLabel" [getCollapseLabel]="collapseLabel" />`,
    angularMember: `\n  readonly documents = ${data};\n  readonly expandLabel = (node${typed ? ': {label: string}' : ''}) => '${t('Expand', 'توسيع')} ' + node.label;\n  readonly collapseLabel = (node${typed ? ': {label: string}' : ''}) => '${t('Collapse', 'طي')} ' + node.label;`,
  }, t('Selected document ID', 'معرّف المستند المحدد'), typed);
}

const recipes = {tooltip, popover, menu, drawer, collapsible, 'tree-view': tree};
export function disclosureProjectRecipe(id: DisclosureId, locale: Locale, typed: boolean) {
  const result = recipes[id]((en, ar) => locale === 'ar' ? ar : en, typed);
  const wrap = (markup: string, classAttribute: string) =>
    `<div ${classAttribute}="hw-stack" data-disclosure-project="${id}">\n${markup}\n</div>`;
  return {...result, component: componentNames[id], react: wrap(result.react, 'className'), vue: wrap(result.vue, 'class'), angular: wrap(result.angular, 'class'), vanilla: wrap(result.vanilla, 'class')};
}
