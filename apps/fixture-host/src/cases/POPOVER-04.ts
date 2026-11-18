// POPOVER-04: the panel padding and the margins of its first and last child are
// the same in the four adapters (the Vue panel matches .hw-popover-panel).
import { Component } from '@angular/core';
import { HwPopoverComponent } from '@hawiyah/angular';
import { Popover } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { Popover as VuePopover } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  trigger: t('More information', 'مزيد من المعلومات'),
  label: t('About this request', 'عن هذا الطلب'),
  first: t('Requests are reviewed within five working days.', 'تُراجع الطلبات خلال خمسة أيام عمل.'),
  last: t('You receive a notification when the review is complete.', 'يصلك إشعار عند اكتمال المراجعة.'),
});

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    html(
      root,
      `<div class="hw-popover" data-hw="popover"><button class="hw-button" data-variant="secondary" type="button" data-hw-trigger>${text.trigger}</button><div class="hw-popover-panel" data-hw-panel role="region" aria-label="${text.label}" hidden><p>${text.first}</p><p>${text.last}</p></div></div>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    const text = texts(t);
    return mountReact(
      root,
      h(Popover, { label: text.label, trigger: h('button', { type: 'button' as const, className: 'hw-button', 'data-variant': 'secondary' }, text.trigger) }, h('p', null, text.first), h('p', null, text.last)),
    );
  },
  vue(root, { t }) {
    const text = texts(t);
    return mountVue(root, { render: () => vh(VuePopover, { label: text.label, triggerLabel: text.trigger }, () => [vh('p', text.first), vh('p', text.last)]) });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-popover',
      standalone: true,
      imports: [HwPopoverComponent],
      template: `<hw-popover [label]="text.label" [triggerLabel]="text.trigger"><p>{{ text.first }}</p><p>{{ text.last }}</p></hw-popover>`,
    })
    class FixturePopover {
      text = text;
    }
    return mountAngular(root, FixturePopover);
  },
};

export default fixture;
