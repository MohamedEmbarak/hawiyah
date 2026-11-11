import {defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import type {PropType, VNode} from 'vue';
import {observeContentNavigation} from '@hawiyah/core';
import type {ContentNavigationItem} from '@hawiyah/core';
import {optionalText, rootLabel, useFragmentLinks} from './shared.js';

export type {ContentNavigationItem} from '@hawiyah/core';
export const ContentNavigation = defineComponent({
  name: 'HwContentNavigation', inheritAttrs: false,
  props: {
    items: {type: Array as PropType<readonly ContentNavigationItem[]>, required: true},
    label: String, showHeading: {type: Boolean, default: true}, sticky: Boolean, updateHash: Boolean,
    scrollRoot: {type: Object as PropType<HTMLElement | null>, default: null}, offset: {type: Number, default: 80},
  },
  emits: {'currentChange': (_id: string) => true},
  setup(props, {attrs, emit}) {
    const navigation = ref<HTMLElement>(); const current = ref('');
    let observer: ReturnType<typeof observeContentNavigation> | undefined;
    onMounted(() => {observer = observeContentNavigation({navigation: navigation.value!, getItems: () => props.items, getScrollRoot: () => props.scrollRoot, offset: () => props.offset, onCurrentChange: id => {current.value = id; emit('currentChange', id);}});});
    watch(() => [props.items, props.scrollRoot, props.offset], () => observer?.refresh(), {deep: true, flush: 'post'});
    onBeforeUnmount(() => observer?.destroy());
    // Links are packaged fragment links: "#id" as rendered, resolved against the current document from the
    // first interaction, and activated through the observer so its offset, reduced motion and aria-current apply.
    let keyboard = false;
    useFragmentLinks(() => [...navigation.value?.querySelectorAll<HTMLAnchorElement>('a.hw-content-nav-link') ?? []], () => ({navigate: id => observer?.navigate(id, {focus: keyboard}) ?? false, get updateHash() { return props.updateHash; }}));
    const renderItems = (entries: readonly ContentNavigationItem[], nested = false): VNode => h('ul', {class: nested ? 'hw-content-nav-sublist' : 'hw-content-nav-list'}, entries.map(item => h('li', {key: item.id}, [
      h(item.disabled ? 'span' : 'a', {class: 'hw-content-nav-link', 'data-hw-section': item.id, ...(item.disabled ? {role: 'link', 'aria-disabled': 'true'} : {href: `#${encodeURIComponent(item.id)}`, 'aria-current': current.value === item.id ? 'location' : undefined, onClick: (event: MouseEvent) => {keyboard = event.detail === 0;}})}, [h('span', {class: 'hw-content-nav-marker', 'aria-hidden': 'true'}), h('span', {class: 'hw-content-nav-label'}, item.label)]),
      item.children?.length ? renderItems(item.children, true) : null,
    ])));
    return () => { const label = rootLabel('ContentNavigation', props.label, attrs); return h('nav', mergeProps(attrs, {ref: navigation, class: 'hw-content-nav', 'aria-label': label, 'data-sticky': props.sticky ? 'true' : undefined}), [props.showHeading && optionalText(props.label) ? h('h2', {class: 'hw-content-nav-heading'}, props.label) : null, renderItems(props.items)]); };
  },
});
