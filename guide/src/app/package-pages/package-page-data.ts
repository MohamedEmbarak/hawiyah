import type { ActivatedRouteSnapshot } from '@angular/router';
import type { Lang } from '../i18n/text';
import type { BrandPageModel, FoundationsPageModel } from './model';

/** The generated models of the two pages by language (src/generated/package-pages/, build step 32), loaded with the page. */
const loaders = {
  brand: {
    ar: () => import('../../generated/package-pages/brand.ar.json'),
    en: () => import('../../generated/package-pages/brand.en.json'),
  },
  foundations: {
    ar: () => import('../../generated/package-pages/foundations.ar.json'),
    en: () => import('../../generated/package-pages/foundations.en.json'),
  },
} as const;

/** The model of the brand page or the foundations page in the language of the route. */
export async function resolvePackagePage(route: ActivatedRouteSnapshot, id: 'brand'): Promise<BrandPageModel>;
export async function resolvePackagePage(route: ActivatedRouteSnapshot, id: 'foundations'): Promise<FoundationsPageModel>;
export async function resolvePackagePage(route: ActivatedRouteSnapshot, id: 'brand' | 'foundations'): Promise<BrandPageModel | FoundationsPageModel> {
  let snapshot: ActivatedRouteSnapshot | null = route;
  while (snapshot && !snapshot.paramMap.has('lang')) snapshot = snapshot.parent;
  const lang = (snapshot?.paramMap.get('lang') === 'ar' ? 'ar' : 'en') as Lang;
  const module = await loaders[id][lang]();
  return module.default as unknown as BrandPageModel | FoundationsPageModel;
}
