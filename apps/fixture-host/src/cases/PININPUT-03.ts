// PININPUT-03: a real clipboard paste and inserted text of '123 456',
// '12-34-56' and '٤٥٦-١٢٣' give the same results (123456, 123456, 456123).
import { Component } from '@angular/core';
import { HwPinInputComponent } from '@hawiyah/angular';
import { PinInput } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { PinInput as VuePinInput } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase } from '../host';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    html(root, `<div class="hw-field" data-hw="pin-input"><label class="hw-label" for="vanilla-code">${t('One-time code', 'رمز التحقق')}</label><input class="hw-input" id="vanilla-code" data-hw-pin-input name="code" inputmode="numeric" autocomplete="one-time-code"></div>`);
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(PinInput, { label: t('One-time code', 'رمز التحقق'), name: 'code', length: 6 }));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VuePinInput, { label: t('One-time code', 'رمز التحقق'), name: 'code', length: 6 }) });
  },
  angular(root, { t }) {
    @Component({
      selector: 'fixture-pin-input',
      standalone: true,
      imports: [HwPinInputComponent],
      template: `<hw-pin-input controlId="angular-code" name="code" [length]="6" [label]="label" />`,
    })
    class FixturePinInput {
      label = t('One-time code', 'رمز التحقق');
    }
    return mountAngular(root, FixturePinInput);
  },
};

export default fixture;
