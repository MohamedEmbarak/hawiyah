/** Display copy only: this component does not verify a domain or registration. */
export interface SiteVerificationLabels {
  label: string;
  detailsLabel: string;
  domainLabel: string;
  domainDescription: string;
  httpsLabel: string;
  httpsDescription: string;
  registrationLabel: string;
  externalLabel: string;
}
export interface SiteVerificationOptions extends Partial<SiteVerificationLabels> {
  locale?: string;
  domain?: string;
  registrationHref?: string;
  registrationNumber?: string;
  registrationExternal?: boolean;
}
export function getSiteVerificationLabels(locale = 'ar'): SiteVerificationLabels {
  return locale.startsWith('ar') ? {
    label: 'معلومات الموقع', detailsLabel: 'كيف تتحقق؟',
    domainLabel: 'تحقق من نطاق الموقع',
    domainDescription: 'تأكد من تطابق العنوان مع النطاق الرسمي للجهة.',
    httpsLabel: 'تحقق من الاتصال الآمن',
    httpsDescription: 'تأكد من أن العنوان يبدأ بـ HTTPS قبل مشاركة بياناتك.',
    registrationLabel: 'التحقق من تسجيل المنصة', externalLabel: 'يفتح في نافذة جديدة',
  } : {
    label: 'Website information', detailsLabel: 'How to verify',
    domainLabel: 'Check the website domain',
    domainDescription: 'Check that the address matches the organization’s official domain.',
    httpsLabel: 'Check the secure connection',
    httpsDescription: 'Check that the address starts with HTTPS before sharing your information.',
    registrationLabel: 'Verify platform registration', externalLabel: 'opens in a new window',
  };
}
