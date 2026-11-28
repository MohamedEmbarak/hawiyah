// FEEDBACK-06: the choices stay in one row and the comment step takes the full
// width below them, for the text, icon and icon-text choices, LTR and RTL, at
// 320px and on a desktop width; the pressed outline is visible in forced colours.
import { enhance } from '@hawiyah/vanilla';
import { html, type FixtureCase } from '../host';

const variants = ['text', 'icon', 'icon-text'] as const;

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const markup = variants
      .map((variant) => {
        const id = `feedback-${variant}`;
        const choice = (value: string, icon: string, label: string) =>
          `<button type="button" class="hw-button" data-variant="secondary" data-hw-value="${value}" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="${icon}" aria-hidden="true"></span><span class="hw-feedback-label">${label}</span></button>`;
        return `<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="${id}-label" data-choice-variant="${variant}" data-hw-success-message="${t('Thank you for your feedback.', 'شكرًا لملاحظاتك.')}"><p id="${id}-label">${t('Was this page helpful?', 'هل كانت هذه الصفحة مفيدة؟')}</p><div class="hw-feedback-actions">${choice('yes', 'thumbs-up', t('Yes', 'نعم'))}${choice('no', 'thumbs-down', t('No', 'لا'))}</div><div class="hw-feedback-comment" data-hw-feedback-comment hidden><div class="hw-field"><label class="hw-label" for="${id}-comment">${t('Comment', 'تعليق')}</label><textarea class="hw-textarea" id="${id}-comment"></textarea></div><button type="button" class="hw-button" data-hw-feedback-submit>${t('Send', 'إرسال')}</button></div><p role="status" data-hw-feedback-status></p><input type="hidden" data-hw-feedback-value name="helpful"></div>`;
      })
      .join('');
    html(root, markup);
    return enhance(root);
  },
};

export default fixture;
