import type {Locale} from './data';
export const iconButtonCases = [
  {key:'small',size:'sm',shape:'square',variant:'ghost'},
  {key:'standard',size:'md',shape:'square',variant:'ghost'},
  {key:'circle',size:'md',shape:'circle',variant:'primary'},
  {key:'large',size:'lg',shape:'square',variant:'secondary'},
  {key:'selected',size:'md',shape:'circle',variant:'ghost',pressed:true},
  {key:'disabled',size:'md',shape:'square',variant:'primary',disabled:true,pressed:true},
  {key:'loading',size:'md',shape:'square',variant:'secondary',loading:true},
] as const;
export function iconButtonLabel(locale:Locale,key:string){
  const names:Record<string,[string,string]>={small:['Search — small','بحث — صغير'],standard:['Search','بحث'],circle:['Search — circle','بحث — دائري'],large:['Search — large','بحث — كبير'],selected:['Saved search','بحث محفوظ'],disabled:['Search unavailable','البحث غير متاح'],loading:['Searching','جارٍ البحث']};
  return names[key]![locale==='ar'?1:0];
}
export function featuredIconMarkup(){
  const sizes = ['sm','md','lg','xl'];
  const roles = [['brand','search-01'],['neutral','search-01'],['success','checkmark-circle-02'],['error','cancel-01'],['warning','!'],['info','i']];
  return `<div class="hw-stack" data-featured-examples aria-hidden="true"><div class="hw-cluster">${sizes.map(size=>`<span class="hw-icon-background" data-variant="featured" data-size="${size}"><span class="hw-icon" data-icon="search-01"></span></span>`).join('')}</div>${['light','outline','dark'].map(style=>`<div class="hw-cluster">${roles.map(([tone,icon])=>`<span class="hw-icon-background" data-variant="featured" data-tone="${tone}" data-style="${style}" data-shape="square">${icon === '!' || icon === 'i' ? `<span class="hw-featured-symbol">${icon}</span>` : `<span class="hw-icon" data-icon="${icon}"></span>`}</span>`).join('')}</div>`).join('')}</div>`;
}
export function iconBackgroundMarkup(){return `<div class="hw-cluster" aria-hidden="true">${['xs','md','xl'].map(size=>`<span class="hw-icon-background" data-size="${size}"><span class="hw-icon" data-icon="checkmark-circle-02" ${size==='xl'?'data-size="xl"':''}></span></span>`).join('')}</div>${featuredIconMarkup()}`;}
export function iconButtonMarkup(locale:Locale){return `<div class="hw-cluster">${iconButtonCases.map(item=>`<button class="hw-button hw-icon-button" type="button" data-size="${item.size}" data-shape="${item.shape}" data-variant="${item.variant}" aria-label="${iconButtonLabel(locale,item.key)}" ${'pressed' in item?'aria-pressed="true"':''} ${'disabled' in item || 'loading' in item?'disabled':''} ${'loading' in item?'aria-busy="true"':''} data-action="demo-info"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></button>`).join('')}</div>`;}
