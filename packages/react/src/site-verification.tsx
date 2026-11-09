import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { getSiteVerificationLabels, type SiteVerificationOptions } from '@hawiyah/core';
import { cx } from './shared.js';

export interface SiteVerificationProps extends ComponentPropsWithRef<'aside'>, SiteVerificationOptions {
  mark?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function SiteVerification({locale='ar', label, detailsLabel, domainLabel, domainDescription, httpsLabel, httpsDescription, registrationLabel, externalLabel, registrationExternal=true, domain, registrationHref, registrationNumber, mark, open, defaultOpen=false, onOpenChange, children, className, ...props}: SiteVerificationProps) {
  const copy=getSiteVerificationLabels(locale),[localOpen,setLocalOpen]=useState(defaultOpen);
  const expanded=open ?? localOpen;
  return <aside {...props} className={cx('hw-site-verification',className)} aria-label={props['aria-label'] ?? label ?? copy.label}>
    <details open={expanded} onToggle={event=>{const next=event.currentTarget.open;if(next!==expanded){setLocalOpen(next);onOpenChange?.(next);}}}>
      <summary onClick={event=>{if(open!==undefined){event.preventDefault();onOpenChange?.(!open);}}}>{mark && <span className="hw-verification-mark">{mark}</span>}<span>{label ?? copy.label}</span><span className="hw-verification-toggle">{detailsLabel ?? copy.detailsLabel}<span className="hw-icon" data-icon="arrow-down-01" aria-hidden="true" /></span></summary>
      <div className="hw-verification-content">
        <div className="hw-verification-checks">
          {domain && <section><span className="hw-icon" data-icon="link-04" aria-hidden="true" /><div><h2>{domainLabel ?? copy.domainLabel} <bdi>{domain}</bdi></h2><p>{domainDescription ?? copy.domainDescription}</p></div></section>}
          <section><span className="hw-icon" data-icon="lock-password" aria-hidden="true" /><div><h2>{httpsLabel ?? copy.httpsLabel} <bdi>HTTPS</bdi></h2><p>{httpsDescription ?? copy.httpsDescription}</p></div></section>
        </div>
        {registrationHref && <p className="hw-verification-registration"><a href={registrationHref} target={registrationExternal ? '_blank' : undefined} rel={registrationExternal ? 'noopener noreferrer' : undefined}>{registrationLabel ?? copy.registrationLabel}{registrationNumber && <> <bdi>{registrationNumber}</bdi></>}{registrationExternal && <span className="hw-sr-only"> · {externalLabel ?? copy.externalLabel}</span>}</a></p>}
        {children}
      </div>
    </details>
  </aside>;
}
