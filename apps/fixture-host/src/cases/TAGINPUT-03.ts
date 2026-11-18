// TAGINPUT-03: one border surrounds the chips and the text input, the input has
// no border of its own and the label is outside the box; the box has the same
// height in the four adapters.
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';
import { TagInput } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { TagInput as VueTagInput } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

const texts = (t: FixtureContext['t']) => ({
  label: t('Keywords', 'الكلمات المفتاحية'),
  hint: t('Press Enter or comma to add a keyword.', 'اضغط Enter أو الفاصلة لإضافة كلمة.'),
  tags: [t('Design', 'تصميم'), t('Services', 'خدمات')],
  getRemoveLabel: (tag: string) => t(`Remove ${tag}`, `إزالة ${tag}`),
});

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = texts(t);
    html(
      root,
      `<div class="hw-field"><label class="hw-label" for="vanilla-tags">${text.label}</label><div class="hw-tag-input" data-hw="tag-input" data-hw-name="tags" data-hw-value='${JSON.stringify(text.tags)}' data-hw-remove-label="${t('Remove {tag}', 'إزالة {tag}')}"><ul data-hw-tags></ul><input class="hw-input" id="vanilla-tags" data-hw-tag-input aria-describedby="vanilla-tags-hint"></div><p class="hw-hint" id="vanilla-tags-hint">${text.hint}</p></div>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    const text = texts(t);
    return mountReact(root, h(TagInput, { label: text.label, hint: text.hint, name: 'tags', defaultValue: text.tags, getRemoveLabel: text.getRemoveLabel }));
  },
  vue(root, { t }) {
    const text = texts(t);
    return mountVue(root, { render: () => vh(VueTagInput, { label: text.label, hint: text.hint, name: 'tags', defaultValue: text.tags, getRemoveLabel: text.getRemoveLabel }) });
  },
  angular(root, { t }) {
    const text = texts(t);
    @Component({
      selector: 'fixture-tag-input',
      standalone: true,
      imports: [HwTagInputComponent],
      template: `<hw-tag-input controlId="angular-tags" name="tags" [label]="text.label" [hint]="text.hint" [getRemoveLabel]="text.getRemoveLabel" [value]="text.tags" />`,
    })
    class FixtureTagInput {
      text = text;
    }
    return mountAngular(root, FixtureTagInput);
  },
};

export default fixture;
