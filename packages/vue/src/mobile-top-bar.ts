import { defineComponent, h, mergeProps } from 'vue';
import type { PropType } from 'vue';
import { needText } from './shared.js';

export const MobileTopBar = defineComponent({
  name: 'HwMobileTopBar', inheritAttrs: false,
  props: {
    title: { type: String, required: true }, subtitle: String,
    variant: { type: String as PropType<'main' | 'internal'>, default: 'internal' },
    headingLevel: { type: Number as PropType<1 | 2 | 3>, default: 1 },
    backHref: String, backLabel: String,
  },
  setup(props, { attrs, slots }) { return () => h('header', mergeProps(attrs, { class: 'hw-mobile-top-bar', 'data-variant': props.variant }), [
    (slots.leading || props.backHref) && h('div', { class: 'hw-mobile-top-bar-leading' }, slots.leading?.() ?? [h('a', { class: 'hw-mobile-top-bar-back', href: props.backHref, 'aria-label': needText('MobileTopBar', 'backLabel', props.backLabel, 'backHref is set') }, h('span', { class: 'hw-icon', 'data-icon': 'arrow-left-01', 'data-directional': 'true', 'aria-hidden': 'true' }))]),
    h('div', { class: 'hw-mobile-top-bar-copy' }, [h(`h${props.headingLevel}`, { class: 'hw-mobile-top-bar-title' }, slots.title?.() ?? props.title), (props.subtitle || slots.subtitle) && h('p', { class: 'hw-mobile-top-bar-subtitle' }, slots.subtitle?.() ?? props.subtitle)]),
    slots.actions && h('div', { class: 'hw-mobile-top-bar-actions' }, slots.actions()), slots.default?.(),
  ]); },
});
