// Navigation data and documented vanilla markup of the PortalHeader cases.
import type { FixtureContext } from '../host';

export interface Destination { label: string; href: string; current?: boolean }
export interface Branch extends Destination { groups?: { label?: string; links: Destination[] }[] }

export function branchLinks(t: FixtureContext['t']): Branch[] {
  return [
    { label: t('Services', 'الخدمات'), href: '#all-services', groups: [
      { label: t('For individuals', 'للأفراد'), links: [
        { label: t('Request a permit', 'طلب تصريح'), href: '#permit', current: true },
        { label: t('Track a request', 'متابعة طلب'), href: '#track' },
      ] },
      { label: t('For businesses', 'للمنشآت'), links: [{ label: t('Register a business', 'تسجيل منشأة'), href: '#register-business' }] },
    ] },
    { label: t('Support', 'الدعم'), href: '#support', groups: [{ links: [
      { label: t('Common questions', 'الأسئلة الشائعة'), href: '#questions' },
      { label: t('Contact us', 'اتصل بنا'), href: '#contact' },
    ] }] },
    { label: t('About the platform', 'عن المنصة'), href: '#about' },
  ];
}

export function flatLinks(t: FixtureContext['t']): Destination[] {
  return [
    { label: t('Services', 'الخدمات'), href: '#services', current: true },
    { label: t('Support', 'الدعم'), href: '#support' },
    { label: t('About the platform', 'عن المنصة'), href: '#about' },
  ];
}

export const headerTexts = (t: FixtureContext['t']) => ({
  brand: t('Services portal', 'بوابة الخدمات'),
  navigationLabel: t('Main navigation', 'التنقل الرئيسي'),
  menuLabel: t('Menu', 'القائمة'),
});

function anchor(item: Destination, extra = ''): string {
  return `<a class="hw-link${extra}" href="${item.href}"${item.current ? ' aria-current="page"' : ''}>${item.label}</a>`;
}

/** The documented vanilla list of a grouped navigation (packages/vanilla/PORTAL.md). */
export function vanillaList(items: Branch[]): string {
  return items
    .map((item) => {
      if (!item.groups) return `<li>${anchor(item)}</li>`;
      const groups = item.groups
        .map((group) => `<section class="hw-portal-branch-group">${group.label ? `<h2>${group.label}</h2>` : ''}<ul>${group.links.map((child) => `<li>${anchor(child)}</li>`).join('')}</ul></section>`)
        .join('');
      const current = item.groups.some((group) => group.links.some((link) => link.current));
      return `<li><details class="hw-portal-branch" data-hw-portal-branch${current ? ' data-current="true"' : ''}><summary>${item.label}</summary><div class="hw-portal-branch-panel">${anchor(item, ' hw-portal-branch-overview')}${groups}</div></details></li>`;
    })
    .join('');
}
