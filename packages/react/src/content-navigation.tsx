import {useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {ComponentPropsWithRef, MouseEvent, ReactNode} from 'react';
import {observeContentNavigation} from '@nasaq/core';
import type {ContentNavigationItem} from '@nasaq/core';
import {cx} from './shared.js';

export type {ContentNavigationItem} from '@nasaq/core';
export interface ContentNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  items: readonly ContentNavigationItem[];
  label?: string;
  showHeading?: boolean;
  sticky?: boolean;
  scrollRoot?: HTMLElement | null;
  offset?: number;
  onCurrentChange?: (id: string) => void;
}

/** Local section navigation; the application owns section elements and their IDs. */
export function ContentNavigation({items, label = 'في هذه الصفحة', showHeading = true, sticky = false, scrollRoot = null, offset = 80, onCurrentChange, className, ref, ...props}: ContentNavigationProps) {
  const navigation = useRef<HTMLElement>(null);
  const observer = useRef<ReturnType<typeof observeContentNavigation> | undefined>(undefined);
  const latest = useRef({items, scrollRoot, offset, onCurrentChange}); latest.current = {items, scrollRoot, offset, onCurrentChange};
  const [current, setCurrent] = useState('');
  useImperativeHandle(ref, () => navigation.current!, []);
  useEffect(() => {
    if (!navigation.current) return;
    observer.current = observeContentNavigation({navigation: navigation.current, getItems: () => latest.current.items, getScrollRoot: () => latest.current.scrollRoot, offset: () => latest.current.offset, onCurrentChange: id => {setCurrent(id); latest.current.onCurrentChange?.(id);}});
    return () => observer.current?.destroy();
  }, []);
  useEffect(() => {observer.current?.refresh();}, [items, scrollRoot, offset]);
  const activate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault(); observer.current?.navigate(id, {focus: event.detail === 0});
  };
  const renderItems = (entries: readonly ContentNavigationItem[], nested = false): ReactNode => <ul className={nested ? 'nq-content-nav-sublist' : 'nq-content-nav-list'}>{entries.map(item => <li key={item.id}>
    {item.disabled ? <span className="nq-content-nav-link" role="link" aria-disabled="true" data-nq-section={item.id}><span className="nq-content-nav-marker" aria-hidden="true" /><span className="nq-content-nav-label">{item.label}</span></span> : <a className="nq-content-nav-link" href={`#${encodeURIComponent(item.id)}`} data-nq-section={item.id} aria-current={current === item.id ? 'location' : undefined} onClick={event => activate(event, item.id)}><span className="nq-content-nav-marker" aria-hidden="true" /><span className="nq-content-nav-label">{item.label}</span></a>}
    {!!item.children?.length && renderItems(item.children, true)}
  </li>)}</ul>;
  return <nav {...props} ref={navigation} className={cx('nq-content-nav', className)} aria-label={label} data-sticky={sticky || undefined}>
    {showHeading && <h2 className="nq-content-nav-heading">{label}</h2>}{renderItems(items)}
  </nav>;
}
