import { defineComponent, h, mergeProps, useId } from 'vue';
import type { PropType } from 'vue';
import { Breadcrumb } from './display.js';
import type { BreadcrumbItem } from './display.js';
import { PortalHeader, PortalFooter } from './patterns.js';
import { needText, rootLabel } from './shared.js';
import type { PortalLink } from './patterns.js';

export interface SecondaryNavItem extends PortalLink { icon?: string }
export const SecondaryNav = defineComponent({
  name: 'HwSecondaryNav', inheritAttrs: false,
  props: { variant: { type: String as PropType<'default' | 'mobile'>, default: 'default' }, items: { type: Array as PropType<readonly SecondaryNavItem[]>, required: true }, label: { type: String, required: true } },
  setup(props, { attrs }) { return () => h('nav', mergeProps(attrs, { class: 'hw-secondary-nav', 'aria-label': rootLabel('SecondaryNav', props.label, attrs), 'data-variant': props.variant }), h('ul', {}, props.items.map(item => h('li', { key: item.href }, h('a', { href: item.href, 'aria-current': item.current ? 'page' : undefined }, [props.variant === 'mobile' && item.icon && h('span', {class:'hw-icon', 'data-icon':item.icon, 'aria-hidden':'true'}), h('span', {}, item.label)]))))); },
});
export const PortalLayout = defineComponent({
  name: 'HwPortalLayout', inheritAttrs: false,
  props: {
    brand: String, brandLabel: String, homeHref: { type: String, default: '/' },
    links: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    secondaryNavigation: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    footerLinks: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    breadcrumbs: { type: Array as PropType<readonly BreadcrumbItem[]>, default: () => [] },
    copyright: String, mainId: String,
    dir: String as PropType<'rtl' | 'ltr' | 'auto'>,
    skipLabel: { type: String, required: true },
    menuLabel: { type: String, required: true }, navigationLabel: { type: String, required: true },
    secondaryLabel: String, breadcrumbLabel: String, footerLabel: String,
    /** Further PortalFooter props (externalLabel, legalLinksLabel, supportLabel, legalLinks, groups, description). */
    footerProps: { type: Object as PropType<Record<string, unknown> & { externalLabel?: string; legalLinksLabel?: string; supportLabel?: string }>, default: () => ({}) },
  },
  setup(props, { attrs, slots }) {
    const id = useId();
    return () => { const mainId = props.mainId ?? `${id}-main`; return h('div', mergeProps(attrs, { class: 'hw-portal-layout', dir: props.dir }), [
      h(PortalHeader, { brand: props.brand, brandLabel: props.brandLabel, homeHref: props.homeHref, links: props.links, mainId, skipLabel: props.skipLabel, menuLabel: props.menuLabel, navigationLabel: props.navigationLabel }, { brand: slots.brand, actions: slots.actions }),
      props.secondaryNavigation.length > 0 && h(SecondaryNav, { items: props.secondaryNavigation, label: needText('PortalLayout', 'secondaryLabel', props.secondaryLabel, 'secondaryNavigation is given') as string }),
      h('main', { id: mainId, tabindex: -1, class: 'hw-portal-layout-main hw-container' }, [props.breadcrumbs.length > 0 && h(Breadcrumb, { items: props.breadcrumbs, label: needText('PortalLayout', 'breadcrumbLabel', props.breadcrumbLabel, 'breadcrumbs are given') as string }), slots.default?.()]),
      h(PortalFooter, { ...props.footerProps, externalLabel: needText('PortalLayout', 'footerProps.externalLabel', props.footerProps.externalLabel) as string, brand: props.brand, brandLabel: props.brandLabel, links: props.footerLinks, copyright: props.copyright, navigationLabel: props.footerLinks.length > 0 ? needText('PortalLayout', 'footerLabel', props.footerLabel, 'footerLinks are given') : props.footerLabel }, { brand: slots.brand, default: slots.footer }),
    ]); };
  },
});
