import compliance from './compliance.json';
import { Texts } from './text';

export interface ShellTexts {
  readonly attribution: string;
  readonly skipLabel: string;
  readonly brandLabel: string;
  readonly menuLabel: string;
  readonly navigationLabel: string;
  readonly darkMode: string;
  readonly footerBrandLabel: string;
  readonly footerDescription: string;
  readonly footerVersion: (version: string) => string;
  readonly footerGuide: string;
  readonly footerProject: string;
  readonly repository: string;
  readonly packagesOnNpm: string;
  readonly changelog: string;
  readonly licence: string;
  readonly notices: string;
  readonly legalLinksLabel: string;
  readonly externalLabel: string;
  readonly previewTitle: string;
  readonly previewBody: (sha: string) => string;
  readonly notFoundTitle: string;
  readonly notFoundBody: string;
  readonly chooseLanguage: string;
  readonly languageName: string;
  readonly rootTitle: string;
}

export const shellTexts: Texts<ShellTexts> = {
  en: {
    attribution: 'Developed by the Development Team in the National Platforms Sector — National Information Center',
    skipLabel: 'Skip to main content',
    brandLabel: 'Hawiyah, home page',
    menuLabel: 'Menu',
    navigationLabel: 'Main sections',
    darkMode: 'Dark mode',
    footerBrandLabel: 'Hawiyah',
    // The compliance sentence: one string in one source (compliance.json), also used by the landing.
    footerDescription: compliance.en,
    footerVersion: (version) => `Version ${version}. Licensed under the Apache License 2.0.`,
    footerGuide: 'Guide',
    footerProject: 'Project',
    repository: 'Repository on GitHub',
    packagesOnNpm: 'Packages on npm',
    changelog: 'Changelog',
    licence: 'Apache License 2.0',
    notices: 'Notices and third-party licences',
    legalLinksLabel: 'Licence and notices',
    externalLabel: 'opens in a new tab',
    previewTitle: 'Preview build',
    previewBody: (sha) =>
      `Built from local package tarballs at commit ${sha}. This is not the published guide, and it does not use the packages on npm.`,
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address does not match a page of this guide.',
    chooseLanguage: 'Choose a language',
    languageName: 'English',
    rootTitle: 'Hawiyah',
  },
  ar: {
    attribution: 'تم التطوير بواسطة فريق التطوير في قطاع المنصات الوطنية - مركز المعلومات الوطني',
    skipLabel: 'الانتقال إلى المحتوى الرئيسي',
    brandLabel: 'هوية، الصفحة الرئيسية',
    menuLabel: 'القائمة',
    navigationLabel: 'الأقسام الرئيسية',
    darkMode: 'الوضع الداكن',
    footerBrandLabel: 'هوية',
    footerDescription: compliance.ar,
    footerVersion: (version) => `الإصدار ${version}. مرخّصة بموجب رخصة Apache 2.0.`,
    footerGuide: 'الدليل',
    footerProject: 'المشروع',
    repository: 'المستودع على GitHub',
    packagesOnNpm: 'الحزم على npm',
    changelog: 'سجل التغييرات',
    licence: 'رخصة Apache 2.0',
    notices: 'الإشعارات وتراخيص الأطراف الثالثة',
    legalLinksLabel: 'الترخيص والإشعارات',
    externalLabel: 'يُفتح في علامة تبويب جديدة',
    previewTitle: 'نسخة معاينة',
    previewBody: (sha) =>
      `بُنيت من حزم محلية عند الإيداع ${sha}. هذه ليست النسخة المنشورة من الدليل، ولا تستخدم الحزم المنشورة على npm.`,
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundBody: 'لا يطابق العنوان أي صفحة في هذا الدليل.',
    chooseLanguage: 'اختر اللغة',
    languageName: 'العربية',
    rootTitle: 'هوية',
  },
};
