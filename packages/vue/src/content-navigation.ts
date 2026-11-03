import {defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import type {PropType, VNode} from 'vue';
import {observeContentNavigation} from '@nasaq/core';
import type {ContentNavigationItem} from '@nasaq/core';

export type {ContentNavigationItem} from '@nasaq/core';
export const ContentNavigation = defineComponent({
  name: 'NqContentNavigation', inheritAttrs: false,
  props: {
    items: {type: Array as PropType<readonly ContentNavigationItem[]>, required: true},
    label: {type: String, default: 'في هذه الصفحة'}, showHeading: {type: Boolean, default: true}, sticky: Boolean,
    scrollRoot: {type: Object as PropType<HTMLElement | null>, default: null}, offset: {type: Number, default: 80},
  },
  emits: {'currentChange': (_id: string) => true},
  setup(props, {attrs, emit}) {
    const navigation = ref<HTMLElement>(); const current = ref('');
    let observer: ReturnType<typeof observeContentNavigation> | undefined;
    onMounted(() => {observer = observeContentNavigation({navigation: navigation.value!, getItems: () => props.items, getScrollRoot: () => props.scrollRoot, offset: () => props.offset, onCurrentChange: id => {current.value = id; emit('currentChange', id);}});});
    watch(() => [props.items, props.scrollRoot, props.offset], () => observer?.refresh(), {deep: true, flush: 'post'});
    onBeforeUnmount(() => observer?.destroy());
    const activate = (event: MouseEvent, id: string) => {
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault(); observer?.navigate(id, {focus: event.detail === 0});
    };
    const renderItems = (entries: readonly ContentNavigationItem[], nested = false): VNode => h('ul', {class: nested ? 'nq-content-nav-sublist' : 'nq-content-nav-list'}, entries.map(item => h('li', {key: item.id}, [
      h(item.disabled ? 'span' : 'a', {class: 'nq-content-nav-link', 'data-nq-section': item.id, ...(item.disabled ? {role: 'link', 'aria-disabled': 'true'} : {href: `#${encodeURIComponent(item.id)}`, 'aria-current': current.value === item.id ? 'location' : undefined, onClick: (event: MouseEvent) => activate(event, item.id)})}, [h('span', {class: 'nq-content-nav-marker', 'aria-hidden': 'true'}), h('span', {class: 'nq-content-nav-label'}, item.label)]),
      item.children?.length ? renderItems(item.children, true) : null,
    ])));
    return () => h('nav', mergeProps(attrs, {ref: navigation, class: 'nq-content-nav', 'aria-label': props.label, 'data-sticky': props.sticky ? 'true' : undefined}), [props.showHeading ? h('h2', {class: 'nq-content-nav-heading'}, props.label) : null, renderItems(props.items)]);
  },
});
