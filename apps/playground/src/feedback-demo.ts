import {escape, type Locale} from './data';

export function feedbackMarkup(locale:Locale, variant:'text'|'icon'|'icon-text'='text', id=`feedback-${variant}`) {
  const ar=locale==='ar', question=ar?'هل كانت هذه الصفحة مفيدة؟':'Was this page helpful?';
  const choice=(value:'yes'|'no',label:string)=>`<button class="hw-button" data-variant="secondary" type="button" data-hw-value="${value}" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-${value==='yes'?'up':'down'}" aria-hidden="true"></span><span class="hw-feedback-label">${escape(label)}</span></button>`;
  const comment=`<div class="hw-feedback-comment" data-hw-feedback-comment hidden><div class="hw-field"><label class="hw-label" for="${id}-comment">${ar?'أخبرنا بالمزيد':'Tell us more'}</label><textarea class="hw-textarea" id="${id}-comment"></textarea></div><button type="button" class="hw-button" data-hw-feedback-submit>${ar?'إرسال التقييم':'Send feedback'}</button></div>`;
  return `<div class="hw-feedback" data-hw="feedback" data-choice-variant="${variant}" data-hw-success-message="${ar?'شكراً على تقييمك.':'Thank you for your feedback.'}" role="group" aria-labelledby="${id}-label"><p id="${id}-label">${question}</p><div class="hw-feedback-actions">${choice('yes',ar?'نعم':'Yes')}${choice('no',ar?'لا':'No')}</div>${comment}<p role="status" data-hw-feedback-status></p><input type="hidden" data-hw-feedback-value name="helpful"></div>`;
}
