// MENU-04: with the default examples, the packaged Vue and Angular triggers of
// Menu and Popover have the same computed background.
import { Component } from '@angular/core';
import { HwMenuComponent, HwPopoverComponent } from '@hawiyah/angular';
import { Menu as VueMenu, Popover as VuePopover } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { mountAngular, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  menuTrigger: t('Actions', 'الإجراءات'),
  menuLabel: t('Request actions', 'إجراءات الطلب'),
  popoverTrigger: t('More information', 'مزيد من المعلومات'),
  popoverLabel: t('About this request', 'عن هذا الطلب'),
  body: t('Requests are reviewed within five working days.', 'تُراجع الطلبات خلال خمسة أيام عمل.'),
  items: [
    { value: 'edit', label: t('Edit', 'تعديل') },
    { value: 'archive', label: t('Archive', 'أرشفة') },
  ],
});

const fixture: FixtureCase = {
  vue(root, { t }) {
    const text = texts(t);
    return mountVue(root, {
      render: () =>
        vh('div', { class: 'fixture-row' }, [
          vh(VueMenu, { 'data-fixture': 'menu', label: text.menuLabel, triggerLabel: text.menuTrigger, items: text.items }),
          vh(VuePopover, { 'data-fixture': 'popover', label: text.popoverLabel, triggerLabel: text.popoverTrigger }, () => vh('p', text.body)),
        ]),
    });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-menu',
      standalone: true,
      imports: [HwMenuComponent, HwPopoverComponent],
      template: `<div class="fixture-row"><hw-menu data-fixture="menu" [label]="text.menuLabel" [triggerLabel]="text.menuTrigger" [items]="text.items" /><hw-popover data-fixture="popover" [label]="text.popoverLabel" [triggerLabel]="text.popoverTrigger"><p>{{ text.body }}</p></hw-popover></div>`,
    })
    class FixtureMenu {
      text = text;
    }
    return mountAngular(root, FixtureMenu);
  },
};

export default fixture;
