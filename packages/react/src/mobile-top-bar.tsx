import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from './shared.js';

export interface MobileTopBarProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  title: ReactNode; subtitle?: ReactNode; variant?: 'main' | 'internal';
  headingLevel?: 1 | 2 | 3; backHref?: string; backLabel?: string;
  leading?: ReactNode; actions?: ReactNode;
}
/** Page chrome in normal flow. The application owns navigation and action behavior. */
export function MobileTopBar({ title, subtitle, variant = 'internal', headingLevel = 1, backHref, backLabel = 'رجوع', leading, actions, children, className, ...props }: MobileTopBarProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  return <header {...props} className={cx('nq-mobile-top-bar', className)} data-variant={variant}>
    {(leading || backHref) && <div className="nq-mobile-top-bar-leading">{leading ?? <a className="nq-mobile-top-bar-back" href={backHref} aria-label={backLabel}><span className="nq-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true" /></a>}</div>}
    <div className="nq-mobile-top-bar-copy"><Heading className="nq-mobile-top-bar-title">{title}</Heading>{subtitle && <p className="nq-mobile-top-bar-subtitle">{subtitle}</p>}</div>
    {actions && <div className="nq-mobile-top-bar-actions">{actions}</div>}{children}
  </header>;
}
