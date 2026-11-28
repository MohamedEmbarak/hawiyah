// COMBOBOX-02: with a hint and an error, the top of the listbox is 8px below the
// bottom of the input, in LTR and RTL.
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';
import { Combobox } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { Combobox as VueCombobox } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  label: t('City', 'المدينة'),
  hint: t('Search the city names, then select a result.', 'ابحث في أسماء المدن ثم اختر نتيجة.'),
  error: t('Select a city from the list.', 'اختر مدينة من القائمة.'),
  emptyMessage: t('No cities found', 'لا توجد مدن مطابقة'),
  options: [
    { value: 'riyadh', label: t('Riyadh', 'الرياض') },
    { value: 'jeddah', label: t('Jeddah', 'جدة') },
    { value: 'abha', label: t('Abha', 'أبها') },
  ],
  getResultsMessage: (count: number) => t(`${count} results`, `${count} نتائج`),
});

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    html(
      root,
      `<div class="hw-field"><label class="hw-label" for="vanilla-city">${text.label}</label><div class="hw-combobox" data-hw="combobox" data-hw-results-message="${t('{count} results', '{count} نتائج')}" data-hw-empty-message="${text.emptyMessage}"><input id="vanilla-city" class="hw-input" data-hw-combobox-input autocomplete="off" aria-invalid="true" aria-describedby="vanilla-city-hint vanilla-city-error"><input type="hidden" name="city" data-hw-combobox-value><ul class="hw-listbox" data-hw-combobox-list hidden>${text.options.map((option) => `<li data-hw-value="${option.value}">${option.label}</li>`).join('')}</ul><span class="hw-sr-only" data-hw-combobox-status role="status"></span></div><p class="hw-hint" id="vanilla-city-hint">${text.hint}</p><p class="hw-error" id="vanilla-city-error">${text.error}</p></div>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(Combobox, { ...texts(t), id: 'react-city', name: 'city' }));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VueCombobox, { ...texts(t), id: 'vue-city', name: 'city' }) });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-combobox',
      standalone: true,
      imports: [HwComboboxComponent],
      template: `<hw-combobox controlId="angular-city" [label]="text.label" [hint]="text.hint" [error]="text.error" [options]="text.options" [emptyMessage]="text.emptyMessage" [getResultsMessage]="text.getResultsMessage" />`,
    })
    class FixtureCombobox {
      text = text;
    }
    return mountAngular(root, FixtureCombobox);
  },
};

export default fixture;
