import type {Locale} from './data';
export function toggleGroupMarkup(locale:Locale,kind='segmented',prefix='toggle-example') {
  const en=locale==='en',label=en?'View mode':'نمط العرض',names=en?['List','Grid','Map']:['قائمة','شبكة','خريطة'];
  const multiple=kind==='multiple'||kind==='readonly-outline',readonly=kind==='readonly'||kind==='readonly-outline',disabled=kind==='disabled';
  const options=names.map((name,index)=>multiple
    ? `<button class="hw-button" type="button" data-hw-value="${index}" aria-pressed="${index===0}" ${index===2?'disabled':''}>${name}</button>`
    : `<label><input type="radio" name="${prefix}" value="${index}" ${index===0?'checked':''} ${index===2?'disabled':''}><span>${name}</span></label>`).join('');
  return `<fieldset class="hw-toggle-group" data-hw="toggle-group" data-variant="${kind.includes('outline')?'outline':'segmented'}" ${multiple?`data-hw-multiple="true" data-hw-name="${prefix}"`:''} ${readonly?'data-hw-readonly="true"':''} ${disabled?'disabled':''}><legend class="hw-label">${label}</legend>${options}</fieldset>`;
}
