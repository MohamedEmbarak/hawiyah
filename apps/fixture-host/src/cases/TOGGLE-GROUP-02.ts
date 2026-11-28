// TOGGLE-GROUP-02: rest, hover and focus-visible colours of an unpressed and a
// pressed button of a multiple-mode ToggleGroup are equal for the four markups,
// segmented and outline, light and dark, and in forced colours.
import { Component } from '@angular/core';
import { HwToggleGroupComponent } from '@hawiyah/angular';
import { ToggleGroup } from '@hawiyah/react';
import { createToggleGroup } from '@hawiyah/vanilla';
import { ToggleGroup as VueToggleGroup } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const variants = ['segmented', 'outline'] as const;
const options = (t: FixtureContext['t']) => [
  { value: 'a', label: t('Bold', 'عريض') },
  { value: 'b', label: t('Italic', 'مائل') },
];
const label = (t: FixtureContext['t'], variant: string) => t(`Text style (${variant})`, `نمط النص (${variant})`);

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const markup = variants
      .map((variant) => {
        const [first, second] = options(t);
        return `<fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" data-variant="${variant}" data-fixture-variant="${variant}"><legend class="hw-label">${label(t, variant)}</legend><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="a" aria-pressed="true">${first!.label}</button><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="b" aria-pressed="false">${second!.label}</button></fieldset>`;
      })
      .join('');
    html(root, markup);
    const controllers = Array.from(root.querySelectorAll<HTMLElement>('.hw-toggle-group'), (group) => createToggleGroup(group));
    return () => controllers.forEach((controller) => controller.destroy());
  },
  react(root, { t }) {
    return mountReact(
      root,
      h(
        'div',
        null,
        variants.map((variant) =>
          h(ToggleGroup, { key: variant, multiple: true, variant, label: label(t, variant), options: options(t), defaultValue: ['a'], 'data-fixture-variant': variant } as never),
        ),
      ),
    );
  },
  vue(root, { t }) {
    return mountVue(root, {
      render: () =>
        vh(
          'div',
          variants.map((variant) =>
            vh(VueToggleGroup, { key: variant, multiple: true, variant, label: label(t, variant), options: options(t), defaultValue: ['a'], 'data-fixture-variant': variant }),
          ),
        ),
    });
  },
  angular(root, { t }) {
    @Component({
      selector: 'fixture-toggle-group',
      standalone: true,
      imports: [HwToggleGroupComponent],
      template: `@for (variant of variants; track variant) {<hw-toggle-group [attr.data-fixture-variant]="variant" [multiple]="true" [variant]="variant" [label]="label(variant)" [options]="options" [value]="['a']" />}`,
    })
    class FixtureToggleGroup {
      variants = variants;
      options = options(t);
      label = (variant: string) => label(t, variant);
    }
    return mountAngular(root, FixtureToggleGroup);
  },
};

export default fixture;
