// METER-03: value 10 of 100 paints the same colour and the same filled width in
// the vanilla markup and in the Angular markup.
import { Component } from '@angular/core';
import { HwMeterComponent } from '@hawiyah/angular';
import { html, mountAngular, type FixtureCase } from '../host';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    html(root, `<meter class="hw-meter" aria-label="${t('Storage used', 'المساحة المستخدمة')}" min="0" max="100" value="10"></meter>`);
    return () => undefined;
  },
  angular(root, { t }) {
    @Component({
      selector: 'fixture-meter',
      standalone: true,
      imports: [HwMeterComponent],
      template: `<hw-meter [label]="label" [value]="10" />`,
    })
    class FixtureMeter {
      label = t('Storage used', 'المساحة المستخدمة');
    }
    return mountAngular(root, FixtureMeter);
  },
};

export default fixture;
