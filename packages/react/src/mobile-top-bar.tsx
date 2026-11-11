import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx, text } from './shared.js';

interface MobileTopBarBaseProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  title: ReactNode; subtitle?: ReactNode; variant?: 'main' | 'internal';
  headingLevel?: 1 | 2 | 3; leading?: ReactNode; actions?: ReactNode;
}
/** `backLabel` names the back link rendered with `backHref` (unless `leading` replaces it). */
export type MobileTopBarProps = MobileTopBarBaseProps & ({ backHref?: undefined; backLabel?: string } | { backHref?: string; backLabel: string });
/** Page chrome in normal flow. The application owns navigation and action behavior. */
export function MobileTopBar({ title, subtitle, variant = 'internal', headingLevel = 1, backHref, backLabel, leading, actions, children, className, ...props }: MobileTopBarProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  return <header {...props} className={cx('hw-mobile-top-bar', className)} data-variant={variant}>
    {(leading || backHref) && <div className="hw-mobile-top-bar-leading">{leading ?? <a className="hw-mobile-top-bar-back" href={backHref} aria-label={text('MobileTopBar', 'backLabel', backLabel, 'backHref is given')}><span className="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true" /></a>}</div>}
    <div className="hw-mobile-top-bar-copy"><Heading className="hw-mobile-top-bar-title">{title}</Heading>{subtitle && <p className="hw-mobile-top-bar-subtitle">{subtitle}</p>}</div>
    {actions && <div className="hw-mobile-top-bar-actions">{actions}</div>}{children}
  </header>;
}
