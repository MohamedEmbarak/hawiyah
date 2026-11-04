import type { Locale } from './data';

export const contentComponents = {
  chip: 'Chip',
  'description-list': 'DescriptionList',
  stat: 'Stat',
  timeline: 'Timeline',
  meter: 'Meter',
  'avatar-group': 'AvatarGroup',
} as const;

export type ContentProjectId = keyof typeof contentComponents;
export const contentProjectIds = Object.keys(contentComponents) as ContentProjectId[];
export function isContentProjectId(id: string): id is ContentProjectId {
  return Object.hasOwn(contentComponents, id);
}

/** Project fragments. The guide's existing publisher supplies imports, bootstrap and the main landmark. */
export interface ContentProjectRecipe {
  vanilla: string;
  vanillaScript?: string;
  react: string;
  vue: string;
  angular: string;
  reactDeclarations?: string;
  vueDeclarations?: string;
  angularMember?: string;
  state?: boolean;
}

function declarations(name: string, items: readonly unknown[], typed: boolean) {
  const literal = JSON.stringify(items, null, 2);
  const declaration = `const ${name} = ${literal}${typed ? ' as const' : ''};`;
  return {
    reactDeclarations: declaration,
    vueDeclarations: declaration,
    angularMember: `\n  readonly ${name} = ${literal} as const;`,
  };
}

function chipRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const labels = ar
    ? ['جميع الخدمات', 'قيد المراجعة', 'مكتمل', 'يتطلب إجراءً', 'معاد للتعديل']
    : ['All services', 'In review', 'Completed', 'Action required', 'Returned for changes'];
  const tones = ['neutral', 'info', 'success', 'warning', 'danger'];
  const filters = tones.map((tone, index) => ({
    id: tone, label: labels[index]!, tone, removable: index < 2, disabled: index === 0,
    removeLabel: `${ar ? 'إزالة المرشح' : 'Remove filter'} ${labels[index]}`,
  }));
  const reset = ar ? 'استعادة المرشحات' : 'Restore filters';
  const count = ar ? 'عدد المرشحات' : 'Filter count';
  const data = declarations('filters', filters, typed);
  return {
    ...data,
    state: true,
    vanilla: `<div class="nq-cluster" data-filters>\n${filters.map(filter => `  <span class="nq-chip" data-tone="${filter.tone}">${filter.label}${filter.removable ? `<button class="nq-button" data-variant="ghost" data-size="sm" type="button" data-remove-filter aria-label="${filter.removeLabel}"${filter.disabled ? ' disabled' : ''}>×</button>` : ''}</span>`).join('\n')}\n</div>\n<button type="button" class="nq-button" data-variant="secondary" id="restore-filters">${reset}</button>\n<p>${count} <output data-filter-count>5</output></p>`,
    vanillaScript: `\nconst filters = root.querySelector('[data-filters]');\nconst reset = root.querySelector('#restore-filters');\nconst count = root.querySelector('[data-filter-count]');\nif (filters instanceof HTMLElement && reset instanceof HTMLButtonElement && count instanceof HTMLOutputElement) {\n  const saved = Array.from(filters.children);\n  const events = new AbortController();\n  filters.addEventListener('click', event => {\n    const button = event.target instanceof Element ? event.target.closest('[data-remove-filter]') : null;\n    if (!(button instanceof HTMLButtonElement) || button.disabled) return;\n    button.closest('.nq-chip')?.remove();\n    count.value = String(filters.childElementCount);\n    reset.focus();\n  }, { signal: events.signal });\n  reset.addEventListener('click', () => {\n    filters.replaceChildren(...saved);\n    count.value = String(saved.length);\n  }, { signal: events.signal });\n  window.addEventListener('pagehide', () => events.abort(), { once: true });\n}\n`,
    react: `<div className="nq-cluster">\n  {filters.filter(filter => filter.id !== value).map(filter => (\n    <Chip key={filter.id} tone={filter.tone} disabled={filter.disabled} removeLabel={filter.removeLabel}\n      onRemove={filter.removable ? () => {\n        setValue(filter.id);\n        document.getElementById('restore-filters')?.focus();\n      } : undefined}>\n      {filter.label}\n    </Chip>\n  ))}\n</div>\n<button type="button" className="nq-button" data-variant="secondary" id="restore-filters" onClick={() => setValue('')}>${reset}</button>\n<p>${count} <output>{filters.filter(filter => filter.id !== value).length}</output></p>`,
    vueDeclarations: `${data.vueDeclarations}\n\nfunction removeFilter(id${typed ? ': string' : ''}) {\n  value.value = id;\n  document.getElementById('restore-filters')?.focus();\n}`,
    vue: `<div class="nq-cluster">\n  <template v-for="filter in filters" :key="filter.id">\n    <Chip v-if="filter.id !== value" :tone="filter.tone" :removable="filter.removable"\n      :disabled="filter.disabled" :remove-label="filter.removeLabel" @remove="removeFilter(filter.id)">\n      {{ filter.label }}\n    </Chip>\n  </template>\n</div>\n<button type="button" class="nq-button" data-variant="secondary" id="restore-filters" @click="value = ''">${reset}</button>\n<p>${count} <output>{{ filters.filter(filter => filter.id !== value).length }}</output></p>`,
    angular: `<div class="nq-cluster">\n  @for (filter of filters; track filter.id) {\n    @if (filter.id !== value) {\n      <nq-chip [tone]="filter.tone" [removable]="filter.removable" [disabled]="filter.disabled"\n        [removeLabel]="filter.removeLabel" (removed)="value = filter.id; restore.focus()">\n        {{ filter.label }}\n      </nq-chip>\n    }\n  }\n</div>\n<button #restore type="button" class="nq-button" data-variant="secondary" (click)="value = ''">${reset}</button>\n<p>${count} <output>{{ filters.length - (value ? 1 : 0) }}</output></p>`,
  };
}

function descriptionRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const items = [
    { term: ar ? 'مرجع الطلب' : 'Request reference', description: 'NQ-1043' },
    { term: ar ? 'الخدمة' : 'Service', description: ar ? 'تحديث بيانات المنشأة' : 'Update establishment details' },
    { term: ar ? 'مدة المراجعة' : 'Review time', description: ar ? '3 أيام عمل' : '3 working days' },
  ];
  return {
    ...declarations('details', items, typed),
    vanilla: `<dl class="nq-description-list" data-variant="horizontal">\n${items.map(item => `  <div><dt>${item.term}</dt><dd>${item.description}</dd></div>`).join('\n')}\n</dl>`,
    react: '<DescriptionList items={details} data-variant="horizontal" />',
    vue: '<DescriptionList :items="details" variant="horizontal" />',
    angular: '<nq-description-list [items]="details" variant="horizontal" />',
  };
}

function statRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const stats = [
    {label: ar ? 'الطلبات المكتملة' : 'Completed requests', value: '1,284', description: ar ? 'خلال الشهر الحالي' : 'This month', trend: ar ? 'زيادة 12% عن الشهر الماضي' : '12% more than last month'},
    {label: ar ? 'الطلبات قيد المراجعة' : 'Requests in review', value: '37', description: ar ? 'عند إغلاق يوم العمل' : 'At the end of the business day', trend: ar ? 'انخفاض 4 طلبات عن أمس' : '4 fewer requests than yesterday'},
  ];
  return {
    ...declarations('stats', stats, typed),
    vanilla: stats.map(stat => `<div class="nq-stat">\n  <dl><dt>${stat.label}</dt><dd class="nq-stat-value">${stat.value}</dd></dl>\n  <p>${stat.description}</p><span class="nq-stat-trend">${stat.trend}</span>\n</div>`).join('\n'),
    react: '{stats.map(stat => <Stat key={stat.label} label={stat.label} value={stat.value} description={stat.description} trend={stat.trend} />)}',
    vue: '<Stat v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :description="stat.description" :trend="stat.trend" />',
    angular: '@for (stat of stats; track stat.label) {\n  <nq-stat [label]="stat.label" [value]="stat.value" [description]="stat.description">\n    <span class="nq-stat-trend">{{ stat.trend }}</span>\n  </nq-stat>\n}',
  };
}

function timelineRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const label = ar ? 'مراحل الطلب' : 'Request timeline';
  const stages = [
    {id: 'received', title: ar ? 'استلام الطلب' : 'Application received', description: ar ? 'اكتملت هذه المرحلة.' : 'This stage is complete.', date: '2026-10-28'},
    {id: 'review', title: ar ? 'مراجعة المستندات' : 'Document review', description: ar ? 'هذه هي المرحلة الحالية.' : 'This is the current stage.', date: '2026-10-29'},
    {id: 'decision', title: ar ? 'إصدار القرار' : 'Decision', description: ar ? 'تبدأ بعد اكتمال المراجعة.' : 'Begins after the review is complete.', date: '2026-11-02'},
  ];
  const reactStates = ['complete', 'active', 'upcoming'];
  const vueStates = ['complete', 'current', 'upcoming'];
  const angularStates = ['complete', 'current', 'pending'];
  const react = stages.map(({date, ...stage}, index) => ({...stage, dateTime: date, dateLabel: date, status: reactStates[index]}));
  const vue = stages.map((stage, index) => ({...stage, dateLabel: stage.date, status: vueStates[index]}));
  const angular = stages.map((stage, index) => ({title: stage.title, description: stage.description, time: stage.date, dateTime: stage.date, state: angularStates[index]}));
  return {
    reactDeclarations: declarations('stages', react, typed).reactDeclarations,
    vueDeclarations: declarations('stages', vue, typed).vueDeclarations,
    angularMember: declarations('stages', angular, typed).angularMember,
    vanilla: `<ol class="nq-timeline" aria-label="${label}">\n${stages.map((stage, index) => `  <li class="nq-timeline-item" data-state="${vueStates[index]}"${index === 1 ? ' aria-current="step"' : ''}>\n    <h3>${stage.title}</h3><p>${stage.description}</p><time datetime="${stage.date}">${stage.date}</time>\n  </li>`).join('\n')}\n</ol>`,
    react: `<Timeline label="${label}" items={stages} />`,
    vue: `<Timeline label="${label}" :items="stages" />`,
    angular: `<nq-timeline label="${label}" [items]="stages" />`,
  };
}

function meterRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const readings = [
    {label: ar ? 'استخدام التخزين المنخفض' : 'Low storage use', value: 10},
    {label: ar ? 'استخدام التخزين المتوسط' : 'Moderate storage use', value: 65},
    {label: ar ? 'استخدام التخزين المرتفع' : 'High storage use', value: 92},
  ];
  return {
    ...declarations('readings', readings, typed),
    vanilla: readings.map(({label, value}) => `<label class="nq-meter"><span>${label} · ${value}%</span>\n  <meter min="0" max="100" low="25" high="85" optimum="20" value="${value}">${value}%</meter>\n</label>`).join('\n'),
    react: '{readings.map(reading => (\n  <div className="nq-stack" key={reading.label}>\n    <span>{reading.label} · {reading.value}%</span>\n    <Meter label={reading.label} min={0} max={100} low={25} high={85} optimum={20} value={reading.value} />\n  </div>\n))}',
    vue: '<div v-for="reading in readings" :key="reading.label" class="nq-stack">\n  <span>{{ reading.label }} · {{ reading.value }}%</span>\n  <Meter :label="reading.label" :min="0" :max="100" :low="25" :high="85" :optimum="20" :value="reading.value" />\n</div>',
    angular: '@for (reading of readings; track reading.label) {\n  <nq-meter [label]="reading.label + \' · \' + reading.value + \'%\'" [min]="0" [max]="100"\n    [low]="25" [high]="85" [optimum]="20" [value]="reading.value" />\n}',
  };
}

function avatarsRecipe(locale: Locale, typed: boolean): ContentProjectRecipe {
  const ar = locale === 'ar';
  const label = ar ? 'فريق مراجعة الطلب' : 'Request review team';
  const members = (ar ? ['منسق الطلب', 'مراجع الخدمة', 'مدير القسم', 'دعم المنصة'] : ['Request coordinator', 'Service reviewer', 'Department lead', 'Platform support']).map(name => ({name}));
  const data = declarations('members', members, typed);
  const remaining = ar ? "'أعضاء إضافيون (' + count + ')'" : "count + ' more members'";
  const overflow = `const overflowLabel = (count${typed ? ': number' : ''}) => ${remaining};`;
  return {
    reactDeclarations: `${data.reactDeclarations}\n${overflow}`,
    vueDeclarations: `${data.vueDeclarations}\n${overflow}`,
    angularMember: `${data.angularMember}\n  readonly overflowLabel = (count: number) => ${remaining};`,
    vanilla: `<div class="nq-avatar-group" role="group" aria-label="${label}">\n${members.slice(0, 2).map(({name}) => `  <span class="nq-avatar" role="img" aria-label="${name}">${name.split(' ').map(word => Array.from(word)[0]).join('')}</span>`).join('\n')}\n  <span class="nq-avatar" role="img" aria-label="${ar ? 'أعضاء إضافيون (2)' : '2 more members'}">+2</span>\n</div>`,
    react: `<AvatarGroup label="${label}" items={members} max={2} getOverflowLabel={overflowLabel} />`,
    vue: `<AvatarGroup label="${label}" :items="members" :max="2" :remaining-label="overflowLabel" />`,
    angular: `<nq-avatar-group label="${label}" [avatars]="members" [max]="2" [overflowLabel]="overflowLabel" />`,
  };
}

export function contentProjectRecipe(id: ContentProjectId, locale: Locale, typed: boolean): ContentProjectRecipe {
  switch (id) {
    case 'chip': return chipRecipe(locale, typed);
    case 'description-list': return descriptionRecipe(locale, typed);
    case 'stat': return statRecipe(locale, typed);
    case 'timeline': return timelineRecipe(locale, typed);
    case 'meter': return meterRecipe(locale, typed);
    case 'avatar-group': return avatarsRecipe(locale, typed);
  }
}
