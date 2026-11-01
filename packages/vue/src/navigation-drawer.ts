import { computed, defineComponent, h, ref } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import { Drawer } from './expansion-interactive.js';

export interface NavigationDrawerItem {
  id: string; label: string; href?: string; icon?: string; current?: boolean;
  disabled?: boolean; children?: readonly NavigationDrawerItem[];
}
function label(item: NavigationDrawerItem): VNodeChild[] {
  return [item.icon && h('span', { class: 'nq-icon', 'data-icon': item.icon, 'aria-hidden': 'true' }), h('span', { class: 'nq-navigation-drawer-label' }, item.label)];
}
function groupEntries(item: NavigationDrawerItem): readonly NavigationDrawerItem[] {
  const children = item.children ?? [];
  if (!item.href) return children;
  let id = `${item.id}-page`;
  while (children.some(child => child.id === id)) id += '-page';
  return [{ ...item, id, children: undefined }, ...children];
}
function entries(items: readonly NavigationDrawerItem[]): VNodeChild {
  return h('ul', {}, items.map(item => h('li', { key: item.id, 'data-nq-value': item.id }, [
    item.disabled ? h('span', { class: 'nq-navigation-drawer-row', 'aria-disabled': 'true' }, label(item))
      : item.children?.length ? h('details', { class: 'nq-navigation-drawer-group' }, [h('summary', { class: 'nq-navigation-drawer-row' }, label(item)), entries(groupEntries(item))])
        : item.href ? h('a', { class: 'nq-navigation-drawer-row', href: item.href, 'aria-current': item.current ? 'page' : undefined }, label(item))
          : h('span', { class: 'nq-navigation-drawer-row' }, label(item)),
  ])));
}
export const NavigationDrawer = defineComponent({
  name: 'NqNavigationDrawer', inheritAttrs: false,
  props: {
    title: { type: String, required: true }, items: { type: Array as PropType<readonly NavigationDrawerItem[]>, required: true },
    navigationLabel: { type: String, default: 'التنقل الرئيسي' }, closeLabel: { type: String, default: 'إغلاق القائمة' },
    open: { type: Boolean, default: undefined }, defaultOpen: Boolean, closeOnBackdrop: { type: Boolean, default: true },
    side: { type: String as PropType<'start' | 'end'>, default: 'start' }, description: String,
  },
  emits: { 'update:open': (_value: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const drawer = ref<{ show(): void; close(): void; element: HTMLDialogElement }>();
    expose({ show: () => drawer.value?.show(), close: () => drawer.value?.close(), element: computed(() => drawer.value?.element) });
    return () => h(Drawer, { ...attrs,
      ref: drawer, title: props.title, description: props.description, open: props.open, defaultOpen: props.defaultOpen,
      closeLabel: props.closeLabel, closeOnBackdrop: props.closeOnBackdrop, side: props.side, class: ['nq-navigation-drawer', attrs.class],
      'onUpdate:open': (value: boolean) => emit('update:open', value),
    }, {
      trigger: slots.trigger, footer: slots.footer,
      default: ({ close }: { close: () => void }) => [
        slots.user && h('div', { class: 'nq-navigation-drawer-user' }, slots.user()),
        h('nav', { class: 'nq-navigation-drawer-nav', 'aria-label': props.navigationLabel, onClick: (event: MouseEvent) => {
          const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
          if (!link || !(event.currentTarget as Element).contains(link) || link.closest('[aria-disabled="true"], [inert]')) return;
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
          queueMicrotask(() => { if (!event.defaultPrevented && link.isConnected) close(); });
        } }, [entries(props.items)]),
      ],
    });
  },
});
