import {escape, type Locale} from './data';

export function feedbackMarkup(locale:Locale, variant:'text'|'icon'|'icon-text'='text') {
  const ar=locale==='ar', question=ar?'هل كانت هذه الصفحة مفيدة؟':'Was this page helpful?';
  const choice=(value:'yes'|'no',label:string)=>`<button class="nq-button" data-variant="secondary" type="button" data-nq-value="${value}" aria-pressed="false"><span class="nq-icon nq-feedback-icon" data-icon="thumbs-${value==='yes'?'up':'down'}" aria-hidden="true"></span><span class="nq-feedback-label">${escape(label)}</span></button>`;
  return `<div class="nq-feedback" data-nq="feedback" data-choice-variant="${variant}" role="group" aria-label="${question}"><p>${question}</p><div class="nq-feedback-actions">${choice('yes',ar?'نعم':'Yes')}${choice('no',ar?'لا':'No')}</div><input type="hidden" data-nq-feedback-value name="helpful"><span data-nq-feedback-status role="status"></span></div>`;
}
