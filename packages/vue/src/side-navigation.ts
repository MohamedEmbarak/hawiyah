import { computed, defineComponent, h, mergeProps, onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { getNavigationCurrentId, revealNavigationCurrent } from '@hawiyah/core';
import { navigationList } from './navigation-drawer.js';
import type { NavigationDrawerItem } from './navigation-drawer.js';
import { rootLabel } from './shared.js';

/** SideNavigation takes the NavigationDrawer item model, so one array feeds both components. */
export type SideNavigationItem = NavigationDrawerItem;
export const SideNavigation = defineComponent({
  name: 'HwSideNavigation', inheritAttrs: false,
  props: { items: { type: Array as PropType<readonly NavigationDrawerItem[]>, required: true }, label: String, sticky: Boolean },
  setup(props, { attrs }) {
    const nav = ref<HTMLElement>();
    // Browser only: reveal the current link inside the nav's own scroll box after mount and when the current page changes.
    const currentId = computed(() => getNavigationCurrentId(props.items));
    onMounted(() => { revealNavigationCurrent(nav.value); });
    watch(currentId, () => { revealNavigationCurrent(nav.value); }, { flush: 'post' });
    return () => h('nav', mergeProps({ class: 'hw-side-navigation hw-navigation-drawer-nav' }, attrs, { ref: nav, 'aria-label': rootLabel('SideNavigation', props.label, attrs), 'data-sticky': props.sticky ? 'true' : undefined }), [navigationList(props.items)]);
  },
});
