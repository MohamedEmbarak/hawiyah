// One page-navigation list feeds NavigationDrawer and SideNavigation. Adapters render it;
// the rules that must not differ between them live here.

export interface NavigationItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean; disabled?: boolean;
  /** Opens the group when it does not hold the current page. Ignored on an entry without children. */
  expanded?: boolean;
  children?: readonly NavigationItem[];
}
export type NavigationItemKind = 'disabled' | 'group' | 'link' | 'text';

/** How an entry is rendered, in this order: a disabled entry is text with aria-disabled and
 * its children are not rendered; an entry with children is a native disclosure; an entry
 * with an href is a link; anything else is plain text. */
export function getNavigationItemKind(item: NavigationItem): NavigationItemKind {
  return item.disabled ? 'disabled' : item.children?.length ? 'group' : item.href ? 'link' : 'text';
}

/** Entries inside a group. A group with its own href repeats itself as the first link,
 * under an id that no sibling uses, because a summary cannot also be a link. */
export function getNavigationGroupEntries(item: NavigationItem): readonly NavigationItem[] {
  const children = item.children ?? [];
  if (!item.href) return children;
  let id = `${item.id}-page`;
  while (children.some(child => child.id === id)) id += '-page';
  return [{ ...item, id, children: undefined, expanded: undefined }, ...children];
}

function holdsCurrent(item: NavigationItem): boolean {
  if (item.disabled) return false;
  if (item.current && item.href) return true;
  return item.children?.some(holdsCurrent) ?? false;
}

/** The `open` attribute of a group, as a pure function of the items: open when `expanded`
 * is true or when a link rendered inside the group is the current page. Adapters render it
 * on the server and write it again only when this value changes, so the reader's own
 * toggles stand in between. */
export function isNavigationGroupOpen(item: NavigationItem): boolean {
  return item.expanded === true || holdsCurrent(item);
}

/** `data-hw-value` of the first link rendered with aria-current="page", in document order,
 * or '' when there is none. Adapters reveal the current link when this value changes. */
export function getNavigationCurrentId(items: readonly NavigationItem[]): string {
  for (const item of items) {
    const kind = getNavigationItemKind(item);
    if (kind === 'link' && item.current) return item.id;
    if (kind !== 'group') continue;
    const found = getNavigationCurrentId(getNavigationGroupEntries(item));
    if (found) return found;
  }
  return '';
}

/** Brings the current link (`a[aria-current="page"]`) into view inside the navigation's own
 * scroll box, centred, without animation. It never scrolls the page and never moves focus.
 * Returns whether it scrolled. Nothing happens when the navigation does not overflow, when
 * the link is already fully visible or sits in a closed group, or without layout (a server DOM). */
export function revealNavigationCurrent(navigation: HTMLElement | null | undefined): boolean {
  if (!navigation?.ownerDocument?.defaultView || typeof navigation.getBoundingClientRect !== 'function') return false;
  if (navigation.clientHeight <= 0 || navigation.scrollHeight <= navigation.clientHeight) return false;
  const link = navigation.querySelector<HTMLElement>('a[aria-current="page"]');
  if (!link) return false;
  const outer = navigation.getBoundingClientRect(), inner = link.getBoundingClientRect();
  if (inner.height <= 0) return false;
  const top = outer.top + navigation.clientTop, bottom = top + navigation.clientHeight;
  if (inner.top >= top && inner.bottom <= bottom) return false;
  const next = navigation.scrollTop + inner.top - top - navigation.clientHeight / 2 + inner.height / 2;
  const clamped = Math.min(Math.max(0, next), navigation.scrollHeight - navigation.clientHeight);
  if (typeof navigation.scrollTo === 'function') navigation.scrollTo({ top: clamped, behavior: 'instant' as ScrollBehavior });
  else navigation.scrollTop = clamped;
  return true;
}
