// SERVICE-03: for the same content at 386px the ServiceCard height and the badge
// and heading positions agree within 2px in the four adapters, in ar and en.
import { Component } from '@angular/core';
import { HwServiceCardComponent } from '@hawiyah/angular';
import { ServiceCard } from '@hawiyah/react';
import { ServiceCard as VueServiceCard } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  title: t('Commercial licence', 'الرخصة التجارية'),
  description: t('Issue or renew the licence of an establishment.', 'إصدار رخصة المنشأة أو تجديدها.'),
  category: t('Licences', 'الرخص'),
  href: '#apply',
  actionLabel: t('Start the service', 'ابدأ الخدمة'),
  metadata: [
    { term: t('Duration', 'المدة'), description: t('3 working days', '3 أيام عمل') },
    { term: t('Fee', 'الرسوم'), description: t('100 riyals', '100 ريال') },
  ],
});

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    html(
      root,
      `<article class="hw-card hw-service-card"><header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">${text.category}</span><h3>${text.title}</h3></div></header><div class="hw-card-body"><p>${text.description}</p><dl class="hw-description-list">${text.metadata.map((item) => `<div><dt>${item.term}</dt><dd>${item.description}</dd></div>`).join('')}</dl></div><footer class="hw-card-footer"><a class="hw-link" href="${text.href}">${text.actionLabel}</a></footer></article>`,
    );
    return () => undefined;
  },
  react(root, { t }) {
    return mountReact(root, h(ServiceCard, texts(t)));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VueServiceCard, texts(t)) });
  },
  angular(root, { t }) {
    @Component({
      selector: 'fixture-service-card',
      standalone: true,
      imports: [HwServiceCardComponent],
      template: `<hw-service-card [title]="text.title" [description]="text.description" [category]="text.category" [href]="text.href" [actionLabel]="text.actionLabel" [metadata]="text.metadata" />`,
    })
    class FixtureServiceCard {
      text = texts(t);
    }
    return mountAngular(root, FixtureServiceCard);
  },
};

export default fixture;
