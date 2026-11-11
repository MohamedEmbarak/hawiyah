import { computed, defineComponent, h, ref } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import { Drawer } from './expansion-interactive.js';
import { needText } from './shared.js';

import { getNavigationGroupEntries, getNavigationItemKind, isLinkNavigationHandled, isNavigationGroupOpen } from '@hawiyah/core';
import type { NavigationItem } from '@hawiyah/core';

/** One entry of NavigationDrawer and SideNavigation: the fields of core NavigationItem. */
export interface NavigationDrawerItem extends NavigationItem { children?: readonly NavigationDrawerItem[] }
function label(item: NavigationDrawerItem): VNodeChild[] {
  return [item.icon && h('span', { class: 'hw-icon', 'data-icon': item.icon, 'aria-hidden': 'true' }), h('span', { class: 'hw-navigation-drawer-label' }, item.label)];
}
/** The list of NavigationDrawer and SideNavigation (internal; not exported from the package entry). A group's open
 * attribute is the pure isNavigationGroupOpen value: Vue patches it only when that value changes, so the reader's toggles stand. */
export function navigationList(items: readonly NavigationDrawerItem[]): VNodeChild {
  return h('ul', {}, items.map(item => {
    const kind = getNavigationItemKind(item);
    return h('li', { key: item.id, 'data-hw-value': item.id }, [
      kind === 'disabled' ? h('span', { class: 'hw-navigation-drawer-row', 'aria-disabled': 'true' }, label(item))
        : kind === 'group' ? h('details', { class: 'hw-navigation-drawer-group', open: isNavigationGroupOpen(item) }, [h('summary', { class: 'hw-navigation-drawer-row' }, label(item)), navigationList(getNavigationGroupEntries(item))])
          : kind === 'link' ? h('a', { class: 'hw-navigation-drawer-row', href: item.href, 'aria-current': item.current ? 'page' : undefined }, label(item))
            : h('span', { class: 'hw-navigation-drawer-row' }, label(item)),
    ]);
  }));
}
export const NavigationDrawer = defineComponent({
  name: 'HwNavigationDrawer', inheritAttrs: false,
  props: {
    title: { type: String, required: true }, items: { type: Array as PropType<readonly NavigationDrawerItem[]>, required: true },
    navigationLabel: { type: String, required: true }, closeLabel: { type: String, required: true },
    open: { type: Boolean, default: undefined }, defaultOpen: Boolean, closeOnBackdrop: { type: Boolean, default: true },
    side: { type: String as PropType<'start' | 'end'>, default: 'start' }, description: String,
  },
  emits: { 'update:open': (_value: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const drawer = ref<{ show(): void; close(): void; element: HTMLDialogElement }>();
    expose({ show: () => drawer.value?.show(), close: () => drawer.value?.close(), element: computed(() => drawer.value?.element) });
    return () => h(Drawer, { ...attrs,
      ref: drawer, title: props.title, description: props.description, open: props.open, defaultOpen: props.defaultOpen,
      closeLabel: needText('NavigationDrawer', 'closeLabel', props.closeLabel) as string, closeOnBackdrop: props.closeOnBackdrop, side: props.side, class: ['hw-navigation-drawer', attrs.class],
      'onUpdate:open': (value: boolean) => emit('update:open', value),
    }, {
      trigger: slots.trigger, footer: slots.footer,
      default: ({ close }: { close: () => void }) => [
        slots.user && h('div', { class: 'hw-navigation-drawer-user' }, slots.user()),
        h('nav', { class: 'hw-navigation-drawer-nav', 'aria-label': needText('NavigationDrawer', 'navigationLabel', props.navigationLabel), onClick: (event: MouseEvent) => {
          const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
          if (!link || !(event.currentTarget as Element).contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
          queueMicrotask(() => { if ((!event.defaultPrevented || isLinkNavigationHandled(event)) && link.isConnected) close(); });
        } }, [navigationList(props.items)]),
      ],
    });
  },
});
