import { createElement, useId } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { layoutStyles } from '@hawiyah/core';
import type { LayoutProps } from '@hawiyah/core';
import { cx, text, useFragmentLink } from './shared.js';
export type { LayoutProps, Responsive, LayoutSpacing, LayoutAlign, LayoutJustify, LayoutBreakpoint, LayoutSide } from '@hawiyah/core';
export type LayoutComponentProps = ComponentPropsWithRef<'div'> & LayoutProps;
function nativeLayout<Tag extends 'div' | 'section'>(tag: Tag, name: string) {
  return function Layout({ gap, padding, align, justify, wrap, columns, minItemWidth, side, sidebarWidth, collapseAt, maxWidth, ratio, style, className, ...props }: ComponentPropsWithRef<Tag> & LayoutProps) {
    return createElement(tag, { ...props, className: cx(`hw-${name}`, className), 'data-side': side, 'data-collapse-at': collapseAt, style: { ...layoutStyles({ gap, padding, align, justify, wrap, columns, minItemWidth, side, sidebarWidth, collapseAt, maxWidth, ratio }), ...style } as CSSProperties });
  };
}
export const Container = nativeLayout('div', 'container');
export const Stack = nativeLayout('div', 'stack');
export const Inline = nativeLayout('div', 'inline');
export const Grid = nativeLayout('div', 'grid');
export const Columns = nativeLayout('div', 'columns');
export const Sidebar = nativeLayout('div', 'sidebar');
export const Center = nativeLayout('div', 'center');
export const Spacer = nativeLayout('div', 'spacer');
export const AspectRatio = nativeLayout('div', 'aspect-ratio');
export const Section = nativeLayout('section', 'section');
/** `skipLabel` is the text of the skip link to the main region, which is always rendered. */
export interface AppShellProps extends ComponentPropsWithRef<'div'> { header?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; mainId?: string; skipLabel: string }
export function AppShell({ header, sidebar, footer, mainId, skipLabel, children, className, ...props }: AppShellProps) {
  const id = useId(); const main = mainId ?? `${id}-main`; const skipLink = useFragmentLink(main);
  return <div {...props} className={cx('hw-app-shell', className)}><a ref={skipLink.ref} className="hw-skip-link" href={skipLink.href}>{text('AppShell', 'skipLabel', skipLabel)}</a>{header && <div className="hw-app-shell-header">{header}</div>}<div className="hw-app-shell-body">{sidebar && <aside className="hw-app-shell-sidebar">{sidebar}</aside>}<main id={main} tabIndex={-1} className="hw-app-shell-main">{children}</main></div>{footer && <div className="hw-app-shell-footer">{footer}</div>}</div>;
}
export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> { title: ReactNode; description?: ReactNode; breadcrumb?: ReactNode; actions?: ReactNode }
export function PageHeader({ title, description, breadcrumb, actions, children, className, ...props }: PageHeaderProps) { return <header {...props} className={cx('hw-page-header', className)}>{breadcrumb}<div className="hw-page-header-main"><div><h1>{title}</h1>{description && <p>{description}</p>}{children}</div>{actions && <div className="hw-page-header-actions">{actions}</div>}</div></header>; }
