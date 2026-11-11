import type {Locale} from './data';

export type CarouselDemoKind = 'bounded' | 'loop' | 'no-indicators' | 'empty' | 'single';
export function carouselDemoCopy(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return {
    label:t('Featured services','الخدمات المميزة'), previous:t('Previous slide','الشريحة السابقة'), next:t('Next slide','الشريحة التالية'),
    indicators:t('Choose a slide','اختر شريحة'), empty:t('No slides','لا توجد شرائح'), carousel:t('carousel','عرض شرائح'), slide:t('slide','شريحة'),
    position:(current:number,total:number)=>t(`Slide ${current} of ${total}`,`الشريحة ${current} من ${total}`),
    positionExpression:locale==='ar'?"'الشريحة ' + current + ' من ' + total":"'Slide ' + current + ' of ' + total",
    positionTemplate:t('Slide {position} of {total}','الشريحة {position} من {total}'),
    slides:[
      {id:'first',title:t('A clearer beginning.','بداية أوضح.'),content:t('Find the service that fits your needs.','اعثر على الخدمة المناسبة لاحتياجك.')},
      {id:'second',title:t('Everything in one place.','كل شيء في مكان واحد.'),content:t('Follow your requests from one workspace.','تابع طلباتك من مساحة عمل واحدة.')},
      {id:'third',title:t('Made for your next step.','مصمّم لخطوتك القادمة.'),content:t('Review the available steps before you begin.','راجع الخطوات المتاحة قبل أن تبدأ.')},
    ],
  };
}
export function carouselDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'bounded',title:t('Bounded navigation and slide indicators','تنقل محدود ومؤشرات الشرائح')},
    {kind:'loop',title:t('Looping navigation','تنقل دائري')},
    {kind:'no-indicators',title:t('Navigation without indicators','تنقل دون مؤشرات')},
    {kind:'empty',title:t('Empty slide collection','قائمة شرائح فارغة')},
    {kind:'single',title:t('One slide','شريحة واحدة')},
  ] as const;
}
export function carouselDemoSlides(locale: Locale,kind: CarouselDemoKind='bounded') {
  const slides=carouselDemoCopy(locale).slides;
  return kind==='empty'?[]:kind==='single'?slides.slice(0,1):slides;
}
export function carouselDemoMarkup(locale: Locale,kind?: CarouselDemoKind) {
  const copy=carouselDemoCopy(locale),slides=carouselDemoSlides(locale,kind);
  const label=kind?`${copy.label} · ${carouselDemoCases(locale).find(item=>item.kind===kind)!.title}`:copy.label;
  return `<section class="hw-carousel" data-hw="carousel" ${kind==='loop'?'data-hw-loop="true" ':''}aria-label="${label}" data-hw-slide-label="${copy.positionTemplate}" data-hw-empty-label="${copy.empty}" data-hw-carousel-description="${copy.carousel}" data-hw-slide-description="${copy.slide}"><div class="hw-carousel-viewport"><div class="hw-carousel-track" data-hw-carousel-track>${slides.map((slide,index)=>`<article class="hw-carousel-slide" data-hw-slide ${index?'hidden':''}><h3>${slide.title}</h3><p>${slide.content}</p></article>`).join('')}</div>${!slides.length?`<p class="hw-carousel-empty">${copy.empty}</p>`:''}</div><div class="hw-carousel-controls">${kind==='no-indicators'?'':`<div class="hw-carousel-pagination" role="group" aria-label="${copy.indicators}">${slides.map((_,index)=>`<button class="hw-carousel-dot" type="button" data-hw-carousel-dot="${index}" aria-label="${copy.position(index+1,slides.length)}"></button>`).join('')}</div>`}<span class="hw-carousel-status hw-sr-only" data-hw-carousel-status role="status" aria-live="polite"></span><div class="hw-carousel-arrows"><button class="hw-button hw-carousel-arrow" type="button" data-hw-previous aria-label="${copy.previous}"></button><button class="hw-button hw-carousel-arrow" type="button" data-hw-next aria-label="${copy.next}"></button></div></div></section>`;
}
export function carouselNativeMarkup(locale: Locale,kind: CarouselDemoKind='bounded',controlled=false) {
  const copy=carouselDemoCopy(locale),slides=carouselDemoSlides(locale,kind),loop=kind==='loop',indicators=kind!=='no-indicators';
  const labels=`label="${copy.label} · ${carouselDemoCases(locale).find(item=>item.kind===kind)!.title}" previousLabel="${copy.previous}" nextLabel="${copy.next}" indicatorsLabel="${copy.indicators}" emptyLabel="${copy.empty}" carouselDescription="${copy.carousel}" slideDescription="${copy.slide}"`;
  const reactSlides=`[${slides.map(slide=>`<section key="${slide.id}"><h3>${slide.title}</h3><p>${slide.content}</p></section>`).join(',')}]`;
  const vueSlides=JSON.stringify(slides.map(slide=>({id:slide.id,content:slide.content})));
  const vueSlots=slides.map(slide=>`<template #${slide.id}><h3>${slide.title}</h3><p>${slide.content}</p></template>`).join('');
  return {
    react:`<Carousel ${labels} slides={${reactSlides}} loop={${loop}} showIndicators={${indicators}} getSlideLabel={(current, total) => ${copy.positionExpression}} ${controlled?'index={value} onIndexChange={setValue} ':''}/>` ,
    vue:`<Carousel ${labels} :slides='${vueSlides}' :wrap="${loop}" :show-indicators="${indicators}" :get-slide-label="(current, total) => ${copy.positionExpression}" ${controlled?'v-model="value" ':''}>${vueSlots}</Carousel>`,
    angular:`${kind==='bounded'?'<ng-template #carouselSlide let-item let-index="index"><h3>{{ item.title }}</h3><p>{{ item.content }}</p></ng-template>':''}<hw-carousel ${labels} [slides]='${JSON.stringify(slides)}' [loop]="${loop}" [showIndicators]="${indicators}" [getSlideLabel]="positionLabel" ${kind==='bounded'?'[slideTemplate]="carouselSlide" ':''}${controlled?'[(current)]="value" ':''}/>` ,
    angularMember:`\n  positionLabel = (current: number, total: number) => ${copy.positionExpression};`,
  };
}
