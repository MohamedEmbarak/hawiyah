import {useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {ComponentPropsWithRef, ReactNode, RefObject} from 'react';
import {observeContentNavigation} from '@hawiyah/core';
import type {ContentNavigationItem} from '@hawiyah/core';
import {cx, text, useFragmentLink} from './shared.js';

export type {ContentNavigationItem} from '@hawiyah/core';
export interface ContentNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  items: readonly ContentNavigationItem[];
  /** Name of the navigation landmark and text of its heading. */
  label: string;
  showHeading?: boolean;
  sticky?: boolean;
  scrollRoot?: HTMLElement | null;
  offset?: number;
  /** Also writes the section URL to the address bar with history.replaceState. Off by default. */
  updateHash?: boolean;
  onCurrentChange?: (id: string) => void;
}
type Observer = ReturnType<typeof observeContentNavigation>;

function ContentNavigationLink({item, current, observer, updateHash}: {item: ContentNavigationItem; current: boolean; observer: RefObject<Observer | undefined>; updateHash: boolean}) {
  const pointer = useRef(0);
  const link = useFragmentLink(item.id, {updateHash, navigate: id => observer.current?.navigate(id, {focus: pointer.current === 0}) ?? false});
  return <a className="hw-content-nav-link" ref={link.ref} href={link.href} data-hw-section={item.id} aria-current={current ? 'location' : undefined} onClickCapture={event => {pointer.current = event.detail;}}><span className="hw-content-nav-marker" aria-hidden="true" /><span className="hw-content-nav-label">{item.label}</span></a>;
}

/** Local section navigation; the application owns section elements and their IDs. */
export function ContentNavigation({items, label, showHeading = true, sticky = false, scrollRoot = null, offset = 80, updateHash = false, onCurrentChange, className, ref, ...props}: ContentNavigationProps) {
  const name = text('ContentNavigation', 'label', label);
  const navigation = useRef<HTMLElement>(null);
  const observer = useRef<Observer | undefined>(undefined);
  const latest = useRef({items, scrollRoot, offset, onCurrentChange}); latest.current = {items, scrollRoot, offset, onCurrentChange};
  const [current, setCurrent] = useState('');
  useImperativeHandle(ref, () => navigation.current!, []);
  useEffect(() => {
    if (!navigation.current) return;
    observer.current = observeContentNavigation({navigation: navigation.current, getItems: () => latest.current.items, getScrollRoot: () => latest.current.scrollRoot, offset: () => latest.current.offset, onCurrentChange: id => {setCurrent(id); latest.current.onCurrentChange?.(id);}});
    return () => observer.current?.destroy();
  }, []);
  useEffect(() => {observer.current?.refresh();}, [items, scrollRoot, offset]);
  const renderItems = (entries: readonly ContentNavigationItem[], nested = false): ReactNode => <ul className={nested ? 'hw-content-nav-sublist' : 'hw-content-nav-list'}>{entries.map(item => <li key={item.id}>
    {item.disabled ? <span className="hw-content-nav-link" role="link" aria-disabled="true" data-hw-section={item.id}><span className="hw-content-nav-marker" aria-hidden="true" /><span className="hw-content-nav-label">{item.label}</span></span> : <ContentNavigationLink item={item} current={current === item.id} observer={observer} updateHash={updateHash} />}
    {!!item.children?.length && renderItems(item.children, true)}
  </li>)}</ul>;
  return <nav {...props} ref={navigation} className={cx('hw-content-nav', className)} aria-label={name} data-sticky={sticky || undefined}>
    {showHeading && name && <h2 className="hw-content-nav-heading">{name}</h2>}{renderItems(items)}
  </nav>;
}
