import type {Locale} from './data';

export type RatingDemoKind = 'selected' | 'empty' | 'readonly' | 'disabled' | 'invalid' | 'scores';

export function ratingDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'selected',title:t('Cumulative selection','اختيار تراكمي'),value:4},
    {kind:'empty',title:t('Unselected with a hint','دون اختيار مع نص توضيحي'),value:0},
    {kind:'readonly',title:t('Read-only selection','اختيار للقراءة فقط'),value:3},
    {kind:'disabled',title:t('Disabled selection','اختيار معطل'),value:2},
    {kind:'invalid',title:t('Required rating with an error','تقييم مطلوب مع رسالة خطأ'),value:0},
    {kind:'scores',title:t('Average scores: zero, fractional and full','متوسط التقييم: صفر وكسري وكامل'),value:3.5},
  ] as const;
}

function ratingCopy(locale: Locale,kind: RatingDemoKind) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  const item=ratingDemoCases(locale).find(item=>item.kind===kind)!;
  return {...item,
    label:`${t('Rate this experience','قيّم التجربة')} · ${item.title}`,
    hint:t('Choose a whole-number rating from 1 to 5.','اختر تقييمًا صحيحًا من 1 إلى 5.'),
    error:t('Choose a rating before continuing.','اختر تقييمًا قبل المتابعة.'),
    valueLabel:(value:number,total:number)=>t(`${value} of ${total}`,`${value} من ${total}`),
    valueExpression:locale==='ar'?"value + ' من ' + total":"value + ' of ' + total",
    scoreLabel:(value:number)=>t(`Average experience score ${value}`,`متوسط تقييم التجربة ${value}`),
  };
}

export function ratingDisplayMarkup(locale: Locale,value: number) {
  const copy=ratingCopy(locale,'scores');
  return `<div class="hw-rating-display" role="img" aria-label="${copy.scoreLabel(value)}: ${copy.valueLabel(value,5)}"><span class="hw-rating-stars" aria-hidden="true">${[0,1,2,3,4].map(index=>`<span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill:${Math.max(0,Math.min(1,value-index))*100}%"></span></span>`).join('')}</span><span class="hw-rating-score" aria-hidden="true">${value}/5</span></div>`;
}

export function ratingDemoMarkup(locale: Locale,kind: RatingDemoKind='selected',prefix=`rating-${kind}`) {
  const copy=ratingCopy(locale,kind);
  if(kind==='scores')return `<div class="hw-stack">${[0,3.5,5].map(value=>ratingDisplayMarkup(locale,value)).join('')}</div>`;
  const description=kind==='empty'?`${prefix}-hint`:kind==='invalid'?`${prefix}-error`:'';
  return `<fieldset class="hw-rating" data-hw="rating" ${kind==='readonly'?'data-hw-readonly="true" ':''}${kind==='disabled'?'disabled ':''}${kind==='invalid'?'aria-invalid="true" ':''}${description?`aria-describedby="${description}"`:''}><legend class="hw-label">${copy.label}</legend>${[1,2,3,4,5].map(value=>`<label><input type="radio" class="hw-radio" name="${prefix}" value="${value}" ${value===copy.value?'checked ':''}${kind==='invalid'?'required ':''}aria-label="${copy.valueLabel(value,5)}"><span aria-hidden="true">★</span></label>`).join('')}${kind==='empty'?`<p class="hw-hint" id="${description}">${copy.hint}</p>`:kind==='invalid'?`<p class="hw-error" id="${description}">${copy.error}</p>`:''}</fieldset>`;
}

export function ratingNativeMarkup(locale: Locale,kind: RatingDemoKind='selected',controlled=false) {
  const copy=ratingCopy(locale,kind);
  const expression=copy.valueExpression;
  if(kind==='scores')return {
    react:`<div className="hw-stack">${[0,3.5,5].map(value=>`<RatingDisplay label="${copy.scoreLabel(value)}" value={${value}} getValueLabel={(value, total) => ${expression}} />`).join('')}</div>`,
    vue:`<div class="hw-stack">${[0,3.5,5].map(value=>`<RatingDisplay label="${copy.scoreLabel(value)}" :value="${value}" :value-label="(value, total) => ${expression}" />`).join('')}</div>`,
    angular:`<div class="hw-stack">${[0,3.5,5].map(value=>`<hw-rating-display label="${copy.scoreLabel(value)}" [value]="${value}" [valueLabel]="ratingLabel" />`).join('')}</div>`,
    angularMember:`\n  ratingLabel = (value: number, total: number) => ${expression};`,
  };
  const common=`label="${copy.label}"${kind==='empty'?` hint="${copy.hint}"`:kind==='invalid'?` required error="${copy.error}"`:''}${kind==='disabled'?' disabled':''}`;
  return {
    react:`<Rating ${common} ${controlled?'value={value} onValueChange={setValue}':`defaultValue={${copy.value}}`} ${kind==='readonly'?'readOnly ':''}getRatingLabel={(value, total) => ${expression}} />`,
    vue:`<Rating ${common} ${controlled?'v-model="value"':`:default-value="${copy.value}"`} ${kind==='readonly'?'readonly ':''}:option-label="(value, total) => ${expression}" />`,
    angular:`<hw-rating ${common} ${controlled?'[(value)]="value"':`[value]="${copy.value}"`} ${kind==='readonly'?'[readOnly]="true" ':''}[ratingLabel]="ratingLabel" />`,
    angularMember:`\n  ratingLabel = (value: number, total: number) => ${expression};`,
  };
}
