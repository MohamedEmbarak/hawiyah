// ATTR-06 (sticky content navigation and popover host): a sticky
// hw-content-navigation still sticks inside its column, and hw-popover flows
// inline in a sentence like the React Popover root.
import { Component } from '@angular/core';
import { HwContentNavigationComponent, HwPopoverComponent } from '@hawiyah/angular';
import { Popover } from '@hawiyah/react';
import { h, mountAngular, mountReact, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  navigationLabel: t('On this page', 'في هذه الصفحة'),
  items: [
    { id: 'attr-overview', label: t('Overview', 'نظرة عامة') },
    { id: 'attr-steps', label: t('Steps', 'الخطوات') },
    { id: 'attr-fees', label: t('Fees', 'الرسوم') },
  ],
  before: t('Read the conditions', 'اقرأ الشروط'),
  after: t('before you apply.', 'قبل تقديم الطلب.'),
  trigger: t('Conditions', 'الشروط'),
  panelLabel: t('Conditions of the service', 'شروط الخدمة'),
  panel: t('The applicant must hold a valid identity document.', 'يجب أن يحمل مقدم الطلب وثيقة هوية سارية.'),
});

const fixture: FixtureCase = {
  react(root, { t }) {
    const text = texts(t);
    return mountReact(
      root,
      h('p', { 'data-fixture': 'sentence' }, `${text.before} `, h(Popover, { label: text.panelLabel, trigger: h('button', { type: 'button' as const, className: 'hw-button', 'data-variant': 'secondary' }, text.trigger) }, h('p', null, text.panel)), ` ${text.after}`),
    );
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-attributes',
      standalone: true,
      imports: [HwContentNavigationComponent, HwPopoverComponent],
      styles: [
        '.fixture-columns { display: grid; grid-template-columns: 16rem minmax(0, 1fr); gap: 2rem; align-items: start; }',
        '.fixture-column { min-block-size: 100%; }',
        '.fixture-content section { min-block-size: 900px; }',
      ],
      template: `<p data-fixture="sentence">{{ text.before }} <hw-popover [label]="text.panelLabel" [triggerLabel]="text.trigger"><p>{{ text.panel }}</p></hw-popover> {{ text.after }}</p>
<div class="fixture-columns"><div class="fixture-column" data-fixture="column"><hw-content-navigation [label]="text.navigationLabel" [items]="text.items" [sticky]="true" /></div>
<div class="fixture-content">@for (item of text.items; track item.id) {<section [id]="item.id"><h2>{{ item.label }}</h2></section>}</div></div>`,
    })
    class FixtureAttributes {
      text = text;
    }
    return mountAngular(root, FixtureAttributes);
  },
};

export default fixture;
