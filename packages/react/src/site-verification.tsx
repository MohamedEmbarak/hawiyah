import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { SiteVerificationOptions } from '@hawiyah/core';
import { cx, text } from './shared.js';

interface SiteVerificationBaseProps extends ComponentPropsWithRef<'aside'>, Omit<SiteVerificationOptions, 'registrationHref' | 'registrationLabel' | 'externalLabel'> {
  mark?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Screen-reader text of a registration link that opens in a new window (registrationExternal, on by default). */
  externalLabel?: string;
}
/** `registrationLabel` is required with `registrationHref`. */
export type SiteVerificationProps = SiteVerificationBaseProps & ({ registrationHref?: undefined; registrationLabel?: string } | { registrationHref?: string; registrationLabel: string });
export function SiteVerification({label, detailsLabel, domainLabel, domainDescription, httpsLabel, httpsDescription, registrationLabel, externalLabel, registrationExternal=true, domain, registrationHref, registrationNumber, mark, open, defaultOpen=false, onOpenChange, children, className, ...props}: SiteVerificationProps) {
  const name=(key:string,value:string|undefined,when?:string)=>text('SiteVerification',key,value,when),[localOpen,setLocalOpen]=useState(defaultOpen);
  const copy={label:name('label',label),detailsLabel:name('detailsLabel',detailsLabel),domainLabel:name('domainLabel',domainLabel),domainDescription:name('domainDescription',domainDescription),httpsLabel:name('httpsLabel',httpsLabel),httpsDescription:name('httpsDescription',httpsDescription),registrationLabel:registrationHref?name('registrationLabel',registrationLabel,'registrationHref is set'):undefined,externalLabel:registrationHref&&registrationExternal?name('externalLabel',externalLabel,'registrationHref is set and registrationExternal is on'):undefined};
  const expanded=open ?? localOpen;
  return <aside {...props} className={cx('hw-site-verification',className)} aria-label={props['aria-label'] ?? copy.label}>
    <details open={expanded} onToggle={event=>{const next=event.currentTarget.open;if(next!==expanded){setLocalOpen(next);onOpenChange?.(next);}}}>
      <summary onClick={event=>{if(open!==undefined){event.preventDefault();onOpenChange?.(!open);}}}>{mark && <span className="hw-verification-mark">{mark}</span>}<span>{copy.label}</span><span className="hw-verification-toggle">{copy.detailsLabel}<span className="hw-icon" data-icon="arrow-down-01" aria-hidden="true" /></span></summary>
      <div className="hw-verification-content">
        <div className="hw-verification-checks">
          {domain && <section><span className="hw-icon" data-icon="link-04" aria-hidden="true" /><div><h2>{copy.domainLabel} <bdi>{domain}</bdi></h2><p>{copy.domainDescription}</p></div></section>}
          <section><span className="hw-icon" data-icon="lock-password" aria-hidden="true" /><div><h2>{copy.httpsLabel}</h2><p>{copy.httpsDescription}</p></div></section>
        </div>
        {registrationHref && <p className="hw-verification-registration"><a href={registrationHref} target={registrationExternal ? '_blank' : undefined} rel={registrationExternal ? 'noopener noreferrer' : undefined}>{copy.registrationLabel}{registrationNumber && <> <bdi>{registrationNumber}</bdi></>}{registrationExternal && copy.externalLabel && <span className="hw-sr-only"> {copy.externalLabel}</span>}</a></p>}
        {children}
      </div>
    </details>
  </aside>;
}
