import type {Locale} from './data';
export function toggleGroupMarkup(locale:Locale,kind='segmented',prefix='toggle-example') {
  const en=locale==='en',label=en?'View mode':'نمط العرض',names=en?['List','Grid','Map']:['قائمة','شبكة','خريطة'];
  const multiple=kind==='multiple'||kind==='readonly-outline',readonly=kind==='readonly'||kind==='readonly-outline',disabled=kind==='disabled';
  const options=names.map((name,index)=>multiple
    ? `<button class="nq-button" type="button" data-nq-value="${index}" aria-pressed="${index===0}" ${index===2?'disabled':''}>${name}</button>`
    : `<label><input type="radio" name="${prefix}" value="${index}" ${index===0?'checked':''} ${index===2?'disabled':''}><span>${name}</span></label>`).join('');
  return `<fieldset class="nq-toggle-group" data-nq="toggle-group" data-variant="${kind.includes('outline')?'outline':'segmented'}" ${multiple?`data-nq-multiple="true" data-nq-name="${prefix}"`:''} ${readonly?'data-nq-readonly="true"':''} ${disabled?'disabled':''}><legend class="nq-label">${label}</legend>${options}</fieldset>`;
}
