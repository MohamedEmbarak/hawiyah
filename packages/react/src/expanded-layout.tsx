import { createElement, useId } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { layoutStyles } from '@nasaq/core';
import type { LayoutProps } from '@nasaq/core';
import { cx } from './shared.js';
export type { LayoutProps, Responsive, LayoutSpacing, LayoutAlign, LayoutJustify, LayoutBreakpoint, LayoutSide } from '@nasaq/core';
export type LayoutComponentProps = ComponentPropsWithRef<'div'> & LayoutProps;
function nativeLayout<Tag extends 'div' | 'section'>(tag: Tag, name: string) {
  return function Layout({ gap, padding, align, justify, wrap, columns, minItemWidth, side, sidebarWidth, collapseAt, maxWidth, ratio, style, className, ...props }: ComponentPropsWithRef<Tag> & LayoutProps) {
    return createElement(tag, { ...props, className: cx(`nq-${name}`, className), 'data-side': side, 'data-collapse-at': collapseAt, style: { ...layoutStyles({ gap, padding, align, justify, wrap, columns, minItemWidth, side, sidebarWidth, collapseAt, maxWidth, ratio }), ...style } as CSSProperties });
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
export interface AppShellProps extends ComponentPropsWithRef<'div'> { header?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; mainId?: string; skipLabel?: string }
export function AppShell({ header, sidebar, footer, mainId, skipLabel = 'انتقل إلى المحتوى', children, className, ...props }: AppShellProps) {
  const id = useId(); const main = mainId ?? `${id}-main`;
  return <div {...props} className={cx('nq-app-shell', className)}><a className="nq-skip-link" href={`#${main}`}>{skipLabel}</a>{header && <div className="nq-app-shell-header">{header}</div>}<div className="nq-app-shell-body">{sidebar && <aside className="nq-app-shell-sidebar">{sidebar}</aside>}<main id={main} tabIndex={-1} className="nq-app-shell-main">{children}</main></div>{footer && <div className="nq-app-shell-footer">{footer}</div>}</div>;
}
export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> { title: ReactNode; description?: ReactNode; breadcrumb?: ReactNode; actions?: ReactNode }
export function PageHeader({ title, description, breadcrumb, actions, children, className, ...props }: PageHeaderProps) { return <header {...props} className={cx('nq-page-header', className)}>{breadcrumb}<div className="nq-page-header-main"><div><h1>{title}</h1>{description && <p>{description}</p>}{children}</div>{actions && <div className="nq-page-header-actions">{actions}</div>}</div></header>; }
