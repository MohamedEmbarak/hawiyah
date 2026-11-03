import type {Locale} from './data';

// Original abstract demo artwork; no remote request or real profile data.
// The non-square canvas makes centered cover cropping visible at every size.
export const avatarDemoImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100"><rect width="160" height="100" fill="#d9efe3"/><circle cx="80" cy="35" r="18" fill="#1b8354"/><path d="M40 100a40 40 0 0 1 80 0" fill="#14573a"/><path d="M0 0h20v100H0zM140 0h20v100h-20z" fill="#9ed6b6"/></svg>')}`;

export function avatarDemoCases(locale: Locale) {
  const t=(en:string,ar:string)=>locale==='ar'?ar:en;
  const name=t('Example user','مستخدم تجريبي');
  return [
    ...(['40','64','80','120'] as const).map(size=>({title:t(`Image · ${size}px`,`صورة · ${size} بكسل`),name,size,variant:'circle' as const,src:avatarDemoImage,initials:undefined})),
    {title:t('Square image · Nasaq extension','صورة مربعة · امتداد من نسق'),name,size:'64',variant:'square' as const,src:avatarDemoImage,initials:undefined},
    {title:t('Name-derived initials','أحرف مشتقة من الاسم'),name,size:'64',variant:'circle' as const,src:undefined,initials:undefined},
    {title:t('Explicit initials','أحرف مختصرة محددة'),name:t('Nasaq team','فريق نسق'),size:'64',variant:'circle' as const,src:undefined,initials:t('NQ','نس')},
  ];
}

export function avatarDemoMarkup(item: ReturnType<typeof avatarDemoCases>[number]) {
  const appearance=`data-size="${item.size}" data-variant="${item.variant}"`;
  if(item.src)return `<span class="nq-avatar" ${appearance}><img src="${item.src}" alt="${item.name}"></span>`;
  const initials=item.initials??item.name.trim().split(/\s+/u).slice(0,2).map(part=>Array.from(part)[0]).join('');
  return `<span class="nq-avatar" ${appearance} role="img" aria-label="${item.name}"><span aria-hidden="true">${initials}</span></span>`;
}

export function avatarDemoProps(item: ReturnType<typeof avatarDemoCases>[number]) {
  return `name="${item.name}" size="${item.size}" variant="${item.variant}"${item.src?` src="${item.src}"`:''}${item.initials?` initials="${item.initials}"`:''}`;
}
