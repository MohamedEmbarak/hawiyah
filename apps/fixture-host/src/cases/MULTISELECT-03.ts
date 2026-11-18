// MULTISELECT-03: the selected row tint and the 16rem scroll of the option list
// apply in every adapter; a row is 40px high.
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';
import { MultiSelect } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { MultiSelect as VueMultiSelect } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  label: t('Services', 'الخدمات'),
  searchLabel: t('Filter services', 'تصفية الخدمات'),
  emptyMessage: t('No services match', 'لا توجد خدمات مطابقة'),
  getResultsMessage: (count: number) => t(`${count} services shown`, `${count} خدمات معروضة`),
  options: Array.from({ length: 12 }, (_, index) => ({ value: `s${index + 1}`, label: t(`Service ${index + 1}`, `الخدمة ${index + 1}`) })),
});
const selected = ['s1', 's3'];

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    const rows = text.options
      .map((option) => `<label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="services" value="${option.value}"${selected.includes(option.value) ? ' checked' : ''}>${option.label}</label>`)
      .join('');
    html(
      root,
      `<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="${t('{count} services shown', '{count} خدمات معروضة')}" data-hw-empty-message="${text.emptyMessage}"><legend class="hw-label">${text.label}</legend><label class="hw-label" for="vanilla-services-search">${text.searchLabel}</label><input class="hw-input" id="vanilla-services-search" type="search" data-hw-multiselect-search><div class="hw-multi-select-options">${rows}</div><span class="hw-sr-only" data-hw-status role="status"></span></fieldset>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(MultiSelect, { ...texts(t), name: 'services', defaultValue: selected }));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VueMultiSelect, { ...texts(t), name: 'services', defaultValue: selected }) });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-multi-select',
      standalone: true,
      imports: [HwMultiSelectComponent],
      template: `<hw-multi-select controlId="angular-services" name="services" [label]="text.label" [searchLabel]="text.searchLabel" [emptyMessage]="text.emptyMessage" [getResultsMessage]="text.getResultsMessage" [options]="text.options" [value]="selected" />`,
    })
    class FixtureMultiSelect {
      text = text;
      selected = [...selected];
    }
    return mountAngular(root, FixtureMultiSelect);
  },
};

export default fixture;
