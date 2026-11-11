import { defineComponent, h, mergeProps, onMounted, onBeforeUnmount, ref, useId } from "vue";
import type { PropType } from "vue";
import { Button, Textarea } from "./forms.js";
import { Badge, Card } from "./display.js";
import { DescriptionList, Link } from "./content.js";
import type { DescriptionItem } from "./content.js";
import { getFragmentHref } from "@hawiyah/core";
import { needText, optionalText, rootLabel, useBrandName, useFragmentLinks, useValue } from "./shared.js";

export const ServiceCard = defineComponent({
  name: "HwServiceCard",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: String,
    href: String,
    actionLabel: String,
    badge: String,
    metadata: Array as PropType<readonly string[]>,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(Card, mergeProps(attrs, { class: "hw-service-card" }), {
        header: () => [
          slots.icon?.(),
          h("h3", {}, props.title),
          props.badge && h(Badge, { tone: "info" }, () => props.badge),
        ],
        default: () => [
          props.description && h("p", {}, props.description),
          props.metadata?.length &&
            h(
              "ul",
              {},
              props.metadata.map((item) => h("li", {}, item)),
            ),
          slots.default?.(),
        ],
        footer: () =>
          slots.action?.() ??
          (props.href
            ? h(Link, { href: props.href }, () => needText("ServiceCard", "actionLabel", props.actionLabel, "href is set and no action slot is given"))
            : undefined),
      });
  },
});
export const ServiceDetails = defineComponent({
  name: "HwServiceDetails",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: String,
    items: {
      type: Array as PropType<readonly DescriptionItem[]>,
      default: () => [],
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("section", mergeProps(attrs, { class: "hw-service-details" }), [
        h("header", {}, [
          h("h2", {}, props.title),
          props.description && h("p", {}, props.description),
        ]),
        h(DescriptionList, { items: props.items }),
        slots.default?.(),
        slots.action &&
          h("div", { class: "hw-service-details-action" }, slots.action()),
      ]);
  },
});
interface PortalNavLink {
  label: string;
  href: string;
  current?: boolean;
}
export interface PortalLink extends PortalNavLink { groups?: readonly { label?: string; links: readonly PortalNavLink[] }[] }
export const PortalHeader = defineComponent({
  name: "HwPortalHeader",
  inheritAttrs: false,
  props: {
    brand: String,
    brandLabel: String,
    homeHref: { type: String, default: "/" },
    links: {
      type: Array as PropType<readonly PortalLink[]>,
      default: () => [],
    },
    navigationLabel: { type: String, required: true },
    menuLabel: { type: String, required: true },
    navigationId: String,
    mainId: String,
    skipLabel: String,
  },
  setup(props, { attrs, slots }) {
    const id = useId(); const open = ref(false);
    const root = ref<HTMLElement>(); const trigger = ref<HTMLButtonElement>();
    const branch = ref<HTMLDetailsElement>(); const skip = ref<HTMLAnchorElement>(); const brand = ref<HTMLElement>();
    useFragmentLinks(() => [skip.value]);
    useBrandName("PortalHeader", () => brand.value);
    const close = () => { branch.value = undefined; open.value = false; };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!branch.value?.contains(target)) branch.value = undefined;
      if (!root.value?.contains(target)) open.value = false;
    };
    onMounted(() => root.value?.ownerDocument.addEventListener('pointerdown', outside));
    onBeforeUnmount(() => root.value?.ownerDocument.removeEventListener('pointerdown', outside));
    const link = (item: PortalNavLink, className?: string) => h('a', {
      href: item.href, class: className,
      'aria-current': item.current ? 'page' : undefined, onClick: close,
    }, item.label);
    function navigationItem(item: PortalLink) {
      const groups = item.groups?.filter(group => group.links.length);
      if (!groups?.length) return h('li', { key: item.href }, link(item));
      const childCurrent = groups.some(group => group.links.some(child => child.current));
      const current = item.current || childCurrent;
      return h('li', { key: item.href }, h('details', {
        class: 'hw-portal-branch', 'data-hw-portal-branch': '', 'data-current': current || undefined,
        'data-branch-href': item.href, open: Boolean(branch.value?.isConnected && branch.value.dataset.branchHref === item.href),
      }, [
        h('summary', { onClick(event: MouseEvent) {
          event.preventDefault();
          const details = (event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
          branch.value = details === branch.value ? undefined : details;
        } }, item.label),
        h('div', { class: 'hw-portal-branch-panel' }, [
          link({...item, current: item.current && !childCurrent}, 'hw-link hw-portal-branch-overview'),
          ...groups.map(group => h('section', { class: 'hw-portal-branch-group' }, [
            group.label && h('h2', group.label),
            h('ul', group.links.map(child => h('li', { key: child.href }, link(child, 'hw-link')))),
          ])),
        ]),
      ]));
    }
    return () =>
      h("header", mergeProps(attrs, { class: "hw-portal-header", ref: root,
        onKeydown: (event: KeyboardEvent) => {
          if (event.defaultPrevented || event.key !== 'Escape') return;
          if (branch.value?.isConnected) {
            event.preventDefault(); event.stopPropagation();
            const summary = branch.value.querySelector<HTMLElement>(':scope > summary');
            branch.value = undefined; summary?.focus();
          } else if (open.value) {
            event.preventDefault(); event.stopPropagation(); close(); trigger.value?.focus();
          }
        },
        onFocusout: (event: FocusEvent) => {
          const target = (event.relatedTarget ?? root.value?.ownerDocument.activeElement) as Node | null;
          if (!branch.value?.contains(target)) branch.value = undefined;
          if (!root.value?.contains(target)) open.value = false;
        },
      }), [
        props.mainId && h('a', { ref: skip, class: 'hw-skip-link', href: getFragmentHref(props.mainId) }, needText("PortalHeader", "skipLabel", props.skipLabel, "mainId is set")),
        // The brand is application content: artwork in the brand slot, text in the brand prop, or both.
        h(
          props.homeHref ? "a" : "span",
          {
            ref: brand,
            href: props.homeHref || undefined,
            class: "hw-portal-brand",
            role: !props.homeHref && optionalText(props.brandLabel) ? "group" : undefined,
            "aria-label": optionalText(props.brandLabel),
          },
          [slots.brand?.(), optionalText(props.brand) && h("span", {}, props.brand)],
        ),
        props.links.length > 0 && h('button', { ref: trigger, type: 'button', class: 'hw-button hw-portal-menu-toggle', 'aria-expanded': open.value, 'aria-controls': props.navigationId ?? `${id}-navigation`, onClick: () => { branch.value = undefined; open.value = !open.value; } }, [h('span', { class: 'hw-icon', 'data-icon': open.value ? 'cancel-01' : 'menu-01', 'aria-hidden': 'true' }), needText('PortalHeader', 'menuLabel', props.menuLabel)]),
        props.links.length > 0 && h(
          "nav",
          { id: props.navigationId ?? `${id}-navigation`, "aria-label": needText("PortalHeader", "navigationLabel", props.navigationLabel), 'data-open': String(open.value) },
          h('ul', props.links.map(navigationItem)),
        ),
        slots.actions &&
          h("div", { class: "hw-portal-header-actions" }, slots.actions()),
        slots.default?.(),
      ]);
  },
});
export interface PortalFooterLink extends PortalNavLink { external?: boolean }
export interface PortalFooterGroup { title: string; links: readonly PortalFooterLink[] }
export const PortalFooter = defineComponent({
  name: "HwPortalFooter", inheritAttrs: false,
  props: {
    brand: String, brandLabel: String, description: String, copyright: String,
    links: { type: Array as PropType<readonly PortalFooterLink[]>, default: () => [] },
    groups: { type: Array as PropType<readonly PortalFooterGroup[]>, default: () => [] },
    legalLinks: { type: Array as PropType<readonly PortalFooterLink[]>, default: () => [] },
    navigationLabel: String,
    legalLinksLabel: String,
    supportLabel: String,
    externalLabel: { type: String, required: true },
  },
  setup(props, { attrs, slots }) {
    const brand = ref<HTMLElement>();
    useBrandName("PortalFooter", () => brand.value);
    const linkList = (items: readonly PortalFooterLink[]) => h('ul', {class:'hw-portal-footer-links'}, items.map((link,index) => h('li', {key:index}, h('a', {href:link.href,target:link.external?'_blank':undefined,rel:link.external?'noopener noreferrer':undefined}, [link.label,link.external && h('span',{class:'hw-portal-footer-external hw-icon','data-icon':'link-square-02','data-size':'sm','aria-hidden':'true'}),link.external && needText('PortalFooter','externalLabel',props.externalLabel) && [' ',h('span',{class:'hw-sr-only'},props.externalLabel)]]))));
    return () => h('footer',mergeProps(attrs,{class:'hw-portal-footer'}),[
      h('div',{class:'hw-portal-footer-main'},[
        (optionalText(props.brand) || props.description || slots.brand) && h('div',{class:'hw-portal-footer-brand'},[(slots.brand || optionalText(props.brand)) && h('div',{ref:brand,class:'hw-portal-footer-brand-marks',role:optionalText(props.brandLabel)?'group':undefined,'aria-label':optionalText(props.brandLabel)},[slots.brand?.(),optionalText(props.brand) && h('strong',{},props.brand)]),props.description && h('p',{},props.description)]),
        props.links.length > 0 && h('nav',{class:'hw-portal-footer-group','aria-label':needText('PortalFooter','navigationLabel',props.navigationLabel,'links are given')},[optionalText(props.navigationLabel) && h('h2',{},props.navigationLabel),linkList(props.links)]),
        ...props.groups.filter(group=>group.links.length>0).map((group,index)=>h('nav',{class:'hw-portal-footer-group','aria-label':group.title,key:index},[h('h2',{},group.title),linkList(group.links)])),
        slots.support && h('section',{class:'hw-portal-footer-support','aria-label':needText('PortalFooter','supportLabel',props.supportLabel,'support content is given')},[optionalText(props.supportLabel) && h('h2',{},props.supportLabel),h('div',{class:'hw-portal-footer-support-content'},slots.support())]),
        slots.default && h('div',{class:'hw-portal-footer-extra'},slots.default()),
      ]),
      (props.copyright || props.legalLinks.length || slots.partners) && h('div',{class:'hw-portal-footer-bottom'},[
        props.copyright && h('small',{},props.copyright),
        props.legalLinks.length>0 && h('nav',{class:'hw-portal-footer-legal','aria-label':needText('PortalFooter','legalLinksLabel',props.legalLinksLabel,'legalLinks are given')},linkList(props.legalLinks)),
        slots.partners && h('div',{class:'hw-portal-footer-partners'},slots.partners()),
      ]),
    ]);
  },
});
export interface FeedbackValue {
  value: string;
  comment: string;
}
export const Feedback = defineComponent({
  name: "HwFeedback",
  inheritAttrs: false,
  props: {
    choiceVariant: { type: String as PropType<'text' | 'icon' | 'icon-text'>, default: 'text' },
    label: { type: String, required: true },
    modelValue: String,
    defaultValue: { type: String, default: "" },
    yesLabel: { type: String, required: true },
    noLabel: { type: String, required: true },
    commentLabel: String,
    submitLabel: String,
    successMessage: { type: String, required: true },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    submit: (_value: FeedbackValue) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const comment = ref("");
    const submitted = ref(false);
    return () => {
      const label = needText("Feedback", "label", props.label);
      return h(
        "section",
        mergeProps(attrs, { class: "hw-feedback", "aria-label": attrs["aria-label"] ?? label, "data-choice-variant": props.choiceVariant }),
        [
          h("h2", {}, label),
          h(
            "div",
            {
              class: "hw-button-group hw-feedback-actions",
              role: "group",
              "aria-label": label,
            },
            (["yes", "no"] as const).map((value) =>
              h(
                Button,
                {
                  variant: "secondary",
                  disabled: props.disabled || props.readonly,
                  "aria-pressed": model.value.value === value,
                  onClick: () => {
                    model.set(value);
                    submitted.value = false;
                  },
                },
                () => [h('span', {class:'hw-icon hw-feedback-icon', 'data-icon':value==='yes'?'thumbs-up':'thumbs-down', 'aria-hidden':'true'}), h('span', {class:'hw-feedback-label'}, value==='yes'?needText("Feedback", "yesLabel", props.yesLabel):needText("Feedback", "noLabel", props.noLabel))],
              ),
            ),
          ),
          model.value.value &&
            h("div", {}, [
              h(Textarea, {
                label: needText("Feedback", "commentLabel", props.commentLabel, "the comment field is rendered"),
                modelValue: comment.value,
                "onUpdate:modelValue": (value: string) => {
                  comment.value = value;
                },
                disabled: props.disabled,
                readonly: props.readonly,
              }),
              h(
                Button,
                {
                  disabled: props.disabled || props.readonly,
                  onClick: () => {
                    emit("submit", {
                      value: model.value.value,
                      comment: comment.value,
                    });
                    submitted.value = true;
                  },
                },
                () => needText("Feedback", "submitLabel", props.submitLabel, "the comment field is rendered"),
              ),
            ]),
          h("p", { role: "status" }, submitted.value ? needText("Feedback", "successMessage", props.successMessage) : undefined),
          slots.default?.(),
        ],
      );
    };
  },
});
export const CookieConsent = defineComponent({
  name: "HwCookieConsent",
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    acceptLabel: { type: String, required: true },
    rejectLabel: { type: String, required: true },
    preferencesLabel: String,
  },
  emits: {
    "update:open": (_value: boolean) => true,
    accept: () => true,
    reject: () => true,
    preferences: () => true,
  },
  setup(props, { attrs, slots, emit }) {
    const model = useValue(
      () => props.open,
      props.defaultOpen,
      (v) => emit("update:open", v),
    );
    return () =>
      h(
        "section",
        mergeProps(attrs, {
          class: "hw-cookie-consent",
          role: "region",
          "aria-label": attrs["aria-label"] ?? needText("CookieConsent", "title", props.title),
          hidden: !model.value.value,
        }),
        [
          h("h2", {}, optionalText(props.title)),
          h("p", {}, props.description),
          slots.default?.(),
          h("div", { class: "hw-button-group" }, [
            h(
              Button,
              {
                onClick: () => {
                  emit("accept");
                  model.set(false);
                },
              },
              () => needText("CookieConsent", "acceptLabel", props.acceptLabel),
            ),
            h(
              Button,
              {
                variant: "secondary",
                onClick: () => {
                  emit("reject");
                  model.set(false);
                },
              },
              () => needText("CookieConsent", "rejectLabel", props.rejectLabel),
            ),
            h(
              Button,
              { variant: "ghost", onClick: () => emit("preferences") },
              () => needText("CookieConsent", "preferencesLabel", props.preferencesLabel, "the preferences action is rendered"),
            ),
          ]),
        ],
      );
  },
});
export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  dateLabel?: string;
  read?: boolean;
  href?: string;
}
export const NotificationList = defineComponent({
  name: "HwNotificationList",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<readonly NotificationItem[]>,
      required: true,
    },
    label: { type: String, required: true },
    emptyMessage: { type: String, required: true },
    getMarkReadLabel: Function as PropType<(item: NotificationItem) => string>,
    getDismissLabel: Function as PropType<(item: NotificationItem) => string>,
  },
  emits: { read: (_id: string) => true, dismiss: (_id: string) => true },
  setup(props, { attrs, emit, slots }) {
    const itemLabel = (name: "getMarkReadLabel" | "getDismissLabel", item: NotificationItem, when: string) => { const get = needText("NotificationList", name, props[name], when); return get ? optionalText(get(item)) : undefined; };
    return () =>
      h(
        "section",
        mergeProps(attrs, {
          class: "hw-notification-list",
          "aria-label": rootLabel("NotificationList", props.label, attrs),
        }),
        [
          props.items.length
            ? h(
                "ul",
                {},
                props.items.map((item) =>
                  h(
                    "li",
                    { key: item.id, "data-read": String(Boolean(item.read)) },
                    [
                      h(
                        "h3",
                        {},
                        item.href
                          ? h("a", { href: item.href }, item.title)
                          : item.title,
                      ),
                      item.description && h("p", {}, item.description),
                      item.date &&
                        h(
                          "time",
                          { datetime: item.date },
                          item.dateLabel ?? item.date,
                        ),
                      slots[item.id]?.({ item }),
                      !item.read &&
                        h(
                          Button,
                          {
                            variant: "ghost",
                            onClick: () => emit("read", item.id),
                          },
                          () => itemLabel("getMarkReadLabel", item, "a mark-read action is rendered"),
                        ),
                      h(
                        Button,
                        {
                          variant: "ghost",
                          "aria-label": itemLabel("getDismissLabel", item, "a dismiss action is rendered"),
                          onClick: () => emit("dismiss", item.id),
                        },
                        () => h('span', { class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md', 'aria-hidden': 'true' }),
                      ),
                    ],
                  ),
                ),
              )
            : h("p", { role: "status" }, needText("NotificationList", "emptyMessage", props.emptyMessage)),
        ],
      );
  },
});
