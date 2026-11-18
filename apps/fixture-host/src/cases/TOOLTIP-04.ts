// TOOLTIP-04: the Angular tooltip is positioned against the hw-tooltip host for
// the placement and alignment combinations (top, bottom, start, end with start,
// center, end).
import { Component } from '@angular/core';
import { HwTooltipComponent, HwTooltipTriggerDirective } from '@hawiyah/angular';
import { mountAngular, type FixtureCase } from '../host';

const placements = ['top', 'bottom', 'start', 'end'] as const;
const aligns = ['start', 'center', 'end'] as const;

const fixture: FixtureCase = {
  angular(root, { t }) {
    @Component({
      selector: 'fixture-tooltip',
      standalone: true,
      imports: [HwTooltipComponent, HwTooltipTriggerDirective],
      styles: [':host { display: grid; grid-template-columns: repeat(3, max-content); gap: 9rem 14rem; padding: 6rem 12rem; }'],
      template: `@for (combination of combinations; track combination.id) {<hw-tooltip [attr.data-fixture-tooltip]="combination.id" [text]="text" [placement]="combination.placement" [align]="combination.align" [tooltipId]="'tooltip-' + combination.id"><button hwTooltipTrigger type="button" class="hw-button" data-variant="secondary">{{ label }} {{ combination.id }}</button></hw-tooltip>}`,
    })
    class FixtureTooltip {
      text = t('Opens the request form', 'يفتح نموذج الطلب');
      label = t('Request', 'الطلب');
      combinations = placements.flatMap((placement) => aligns.map((align) => ({ id: `${placement}-${align}`, placement, align })));
    }
    return mountAngular(root, FixtureTooltip);
  },
};

export default fixture;
