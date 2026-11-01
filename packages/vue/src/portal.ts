import { defineComponent, h, mergeProps, useId } from 'vue';
import type { PropType } from 'vue';
import { Breadcrumb } from './display.js';
import type { BreadcrumbItem } from './display.js';
import { PortalHeader, PortalFooter } from './patterns.js';
import type { PortalLink } from './patterns.js';

export interface SecondaryNavItem extends PortalLink { icon?: string }
export const SecondaryNav = defineComponent({
  name: 'NqSecondaryNav', inheritAttrs: false,
  props: { variant: { type: String as PropType<'default' | 'mobile'>, default: 'default' }, items: { type: Array as PropType<readonly SecondaryNavItem[]>, required: true }, label: { type: String, default: 'التنقل الثانوي' } },
  setup(props, { attrs }) { return () => h('nav', mergeProps(attrs, { class: 'nq-secondary-nav', 'aria-label': props.label, 'data-variant': props.variant }), h('ul', {}, props.items.map(item => h('li', { key: item.href }, h('a', { href: item.href, 'aria-current': item.current ? 'page' : undefined }, [props.variant === 'mobile' && item.icon && h('span', {class:'nq-icon', 'data-icon':item.icon, 'aria-hidden':'true'}), h('span', {}, item.label)]))))); },
});
export const PortalLayout = defineComponent({
  name: 'NqPortalLayout', inheritAttrs: false,
  props: {
    brand: { type: String, required: true }, homeHref: { type: String, default: '/' },
    links: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    secondaryNavigation: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    footerLinks: { type: Array as PropType<readonly PortalLink[]>, default: () => [] },
    breadcrumbs: { type: Array as PropType<readonly BreadcrumbItem[]>, default: () => [] },
    copyright: String, mainId: String,
    lang: { type: String, default: 'ar' }, dir: { type: String, default: 'rtl' },
    skipLabel: { type: String, default: 'انتقل إلى المحتوى' },
    menuLabel: { type: String, default: 'القائمة' }, navigationLabel: { type: String, default: 'التنقل الرئيسي' },
    secondaryLabel: { type: String, default: 'التنقل الثانوي' }, breadcrumbLabel: { type: String, default: 'مسار التنقل' }, footerLabel: { type: String, default: 'روابط التذييل' },
  },
  setup(props, { attrs, slots }) {
    const id = useId();
    return () => { const mainId = props.mainId ?? `${id}-main`; return h('div', mergeProps(attrs, { class: 'nq-portal-layout', lang: props.lang, dir: props.dir }), [
      h(PortalHeader, { brand: props.brand, homeHref: props.homeHref, links: props.links, mainId, skipLabel: props.skipLabel, menuLabel: props.menuLabel, navLabel: props.navigationLabel }, { logo: slots.logo, actions: slots.actions }),
      props.secondaryNavigation.length > 0 && h(SecondaryNav, { items: props.secondaryNavigation, label: props.secondaryLabel }),
      h('main', { id: mainId, tabindex: -1, class: 'nq-portal-layout-main nq-container' }, [props.breadcrumbs.length > 0 && h(Breadcrumb, { items: props.breadcrumbs, label: props.breadcrumbLabel }), slots.default?.()]),
      h(PortalFooter, { brand: props.brand, links: props.footerLinks, copyright: props.copyright, navLabel: props.footerLabel }, { default: slots.footer }),
    ]); };
  },
});
