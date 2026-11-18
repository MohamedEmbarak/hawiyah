// FOCUS-01 (browser half): after Space on Next at the second-to-last slide, the
// active element is the Next button, it carries aria-disabled="true" without the
// disabled attribute and shows a focus ring; forced colours draw its glyph in GrayText.
import { Component } from '@angular/core';
import { HwCarouselComponent } from '@hawiyah/angular';
import { Carousel } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { Carousel as VueCarousel } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  label: t('Featured services', 'خدمات مختارة'),
  previousLabel: t('Previous slide', 'الشريحة السابقة'),
  nextLabel: t('Next slide', 'الشريحة التالية'),
  indicatorsLabel: t('Choose a slide', 'اختر شريحة'),
  emptyLabel: t('No services to show', 'لا توجد خدمات للعرض'),
  getSlideLabel: (position: number, total: number) => t(`${position} of ${total}`, `${position} من ${total}`),
  slides: [t('Request a permit', 'طلب تصريح'), t('Track a request', 'متابعة طلب'), t('Register a business', 'تسجيل منشأة')],
});

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    html(
      root,
      `<section class="hw-carousel" data-hw="carousel" aria-label="${text.label}" data-hw-slide-label="${t('{position} of {total}', '{position} من {total}')}" data-hw-empty-label="${text.emptyLabel}"><div class="hw-carousel-viewport hw-carousel-slides"><div class="hw-carousel-track" data-hw-carousel-track>${text.slides.map((slide) => `<div class="hw-carousel-slide" data-hw-slide><p>${slide}</p></div>`).join('')}</div></div><div class="hw-carousel-controls"><div class="hw-carousel-arrows"><button class="hw-button hw-carousel-arrow" type="button" data-hw-previous aria-label="${text.previousLabel}"></button><button class="hw-button hw-carousel-arrow" type="button" data-hw-next aria-label="${text.nextLabel}"></button></div><span class="hw-carousel-status hw-sr-only" data-hw-carousel-status role="status"></span></div></section>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    const text = texts(t);
    return mountReact(root, h(Carousel, { ...text, slides: text.slides.map((slide) => h('p', null, slide)), loop: false }));
  },
  vue(root, { t }) {
    const text = texts(t);
    return mountVue(root, { render: () => vh(VueCarousel, { ...text, slides: text.slides.map((slide, index) => ({ id: `slide-${index}`, content: vh('p', slide) })), wrap: false }) });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-carousel',
      standalone: true,
      imports: [HwCarouselComponent],
      template: `<hw-carousel [label]="text.label" [slides]="slides" [previousLabel]="text.previousLabel" [nextLabel]="text.nextLabel" [indicatorsLabel]="text.indicatorsLabel" [emptyLabel]="text.emptyLabel" [getSlideLabel]="text.getSlideLabel" />`,
    })
    class FixtureCarousel {
      text = text;
      slides = text.slides.map((content, index) => ({ id: `slide-${index}`, content }));
    }
    return mountAngular(root, FixtureCarousel);
  },
};

export default fixture;
