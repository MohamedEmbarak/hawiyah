import type {Locale} from './data';

export type PaginationDemoKind = 'first' | 'middle' | 'last' | 'single' | 'disabled' | 'large';

export function paginationDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  return [
    {kind:'first',title:t('First page and one page-jump list','الصفحة الأولى وقائمة انتقال واحدة'),page:1,total:10},
    {kind:'middle',title:t('Middle page and two page-jump lists','صفحة وسطية وقائمتا انتقال'),page:10,total:20},
    {kind:'last',title:t('Last page','الصفحة الأخيرة'),page:20,total:20},
    {kind:'single',title:t('One page','صفحة واحدة'),page:1,total:1},
    {kind:'disabled',title:t('Disabled navigation','تنقل معطل'),page:10,total:20},
    {kind:'large',title:t('Large page count with direct entry','عدد صفحات كبير مع إدخال مباشر'),page:5000,total:10000},
  ] as const;
}

export function paginationCopy(locale: Locale,kind: PaginationDemoKind) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  const item=paginationDemoCases(locale).find(item=>item.kind===kind)!;
  return {...item,
    label:`${t('Results pages','صفحات النتائج')} · ${item.title}`,
    previous:t('Previous page','الصفحة السابقة'),next:t('Next page','الصفحة التالية'),
    pageLabel:t('Page','الصفحة'),jumpLabel:t('Go to page','الانتقال إلى صفحة'),goLabel:t('Go','انتقال'),
    gapExpression:locale==='ar'?"'الصفحات من ' + start + ' إلى ' + end":"'Pages ' + start + ' to ' + end",
  };
}

export function paginationNativeMarkup(locale: Locale,kind: PaginationDemoKind='first',controlled=false) {
  const copy=paginationCopy(locale,kind);
  const common=`label="${copy.label}" previousLabel="${copy.previous}" nextLabel="${copy.next}" jumpLabel="${copy.jumpLabel}" goLabel="${copy.goLabel}"${kind==='disabled'?' disabled':''}`;
  return {
    react:`<Pagination ${common} totalPages={${copy.total}} ${controlled?'page={value} onPageChange={setValue}':`defaultPage={${copy.page}}`} getPageLabel={page => '${copy.pageLabel} ' + page} getGapLabel={(start, end) => ${copy.gapExpression}} />`,
    vue:`<Pagination ${common} :total-pages="${copy.total}" ${controlled?'v-model="value"':`:default-value="${copy.page}"`} :page-label="page => '${copy.pageLabel} ' + page" :gap-label="(start, end) => ${copy.gapExpression}" />`,
    angular:`<hw-pagination ${common} [totalPages]="${copy.total}" ${controlled?'[(page)]="value"':`[page]="${copy.page}"`} [pageLabel]="pageLabel" [gapLabel]="gapLabel" />`,
    angularMember:`\n  pageLabel = (page: number) => '${copy.pageLabel} ' + page;\n  gapLabel = (start: number, end: number) => ${copy.gapExpression};`,
  };
}

export function paginationDemoMarkup(locale: Locale,kind?: PaginationDemoKind) {
  const copy=paginationCopy(locale,kind??'first');
  const label=kind?copy.label:locale==='ar'?'صفحات النتائج':'Results pages';
  return `<nav class="hw-pagination" data-hw="pagination" data-hw-total="${copy.total}" data-hw-current="${copy.page}" aria-label="${label}"${kind==='disabled'?' aria-disabled="true"':''}><button class="hw-button hw-pagination-arrow" data-variant="ghost" type="button" data-hw-page="previous" data-hw-previous aria-label="${copy.previous}"></button><span class="hw-pagination-items" data-hw-pagination-items></span><button class="hw-button hw-pagination-arrow" data-variant="ghost" type="button" data-hw-page="next" data-hw-next aria-label="${copy.next}"></button></nav>`;
}
