/** Display copy only: this component does not verify a domain or registration.
 * Every label is supplied by the application; `registrationLabel` and `externalLabel`
 * are used only when a registration link is shown. */
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
export interface SiteVerificationOptions extends SiteVerificationLabels {
  domain?: string;
  registrationHref?: string;
  registrationNumber?: string;
  registrationExternal?: boolean;
}
