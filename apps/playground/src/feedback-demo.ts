import {escape, type Locale} from './data';

export function feedbackMarkup(locale:Locale, variant:'text'|'icon'|'icon-text'='text') {
  const ar=locale==='ar', question=ar?'هل كانت هذه الصفحة مفيدة؟':'Was this page helpful?';
  const choice=(value:'yes'|'no',label:string)=>`<button class="hw-button" data-variant="secondary" type="button" data-hw-value="${value}" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-${value==='yes'?'up':'down'}" aria-hidden="true"></span><span class="hw-feedback-label">${escape(label)}</span></button>`;
  return `<div class="hw-feedback" data-hw="feedback" data-choice-variant="${variant}" role="group" aria-label="${question}"><p>${question}</p><div class="hw-feedback-actions">${choice('yes',ar?'نعم':'Yes')}${choice('no',ar?'لا':'No')}</div><input type="hidden" data-hw-feedback-value name="helpful"><span data-hw-feedback-status role="status"></span></div>`;
}
