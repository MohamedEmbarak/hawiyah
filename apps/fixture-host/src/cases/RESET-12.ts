// RESET-12: a real click and Enter on a reset button: after the next frame
// data-hw-filled, the shown value and FormData agree with the reset target for a
// static vanilla fixture (text field, range slider, toggle group); a reset
// prevented by a later listener changes nothing.
import { enhance } from '@hawiyah/vanilla';
import { html, type FixtureCase } from '../host';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    html(
      root,
      `<form id="reset-form" class="hw-stack" novalidate>
        <div class="hw-field"><label class="hw-label" for="reset-name">${t('Applicant name', 'اسم مقدم الطلب')}</label><input class="hw-input" id="reset-name" name="applicant"></div>
        <fieldset class="hw-field hw-range-slider" data-hw="range-slider" data-hw-range-label="{lower} – {upper}"><legend class="hw-label">${t('Price', 'السعر')}</legend><label class="hw-label">${t('Minimum', 'الحد الأدنى')} <input class="hw-slider" type="range" data-hw-lower name="price" min="0" max="100" value="20"></label><label class="hw-label">${t('Maximum', 'الحد الأعلى')} <input class="hw-slider" type="range" data-hw-upper name="price" min="0" max="100" value="80"></label><output class="hw-range-slider-value" data-hw-range-output></output></fieldset>
        <fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" data-hw-name="style"><legend class="hw-label">${t('Text style', 'نمط النص')}</legend><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="bold" aria-pressed="true">${t('Bold', 'عريض')}</button><button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="italic" aria-pressed="false">${t('Italic', 'مائل')}</button></fieldset>
        <button class="hw-button" data-variant="secondary" type="reset">${t('Clear the form', 'مسح النموذج')}</button>
      </form>`,
    );
    return enhance(root);
  },
};

export default fixture;
