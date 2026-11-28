import { defineComponent, h, mergeProps, nextTick, onMounted, onBeforeUnmount, ref, useId } from "vue";
import type { PropType, VNodeArrayChildren } from "vue";
import { Button, Textarea } from "./forms.js";
import { Badge, Card } from "./display.js";
import { Link } from "./content.js";
import type { DescriptionItem } from "./content.js";
import { getFragmentHref, getPortalBranchSummary, prepareRemovalFocus } from "@hawiyah/core";
import type { ConsentChoice, FeedbackValue } from "@hawiyah/core";
import { listener, listens, needText, optionalText, rootLabel, useBrandName, useFragmentLinks, useValue } from "./shared.js";

/** Service facts as a stacked description list; written inline so the markup does not follow DescriptionList's default variant. */
function serviceFacts(metadata: readonly DescriptionItem[] | undefined) {
  return metadata?.length
    ? h("dl", { class: "hw-description-list" }, metadata.map((item, index) => h("div", { key: index }, [h("dt", {}, item.term), h("dd", {}, [item.description] as VNodeArrayChildren)])))
    : null;
}
export const ServiceCard = defineComponent({
  name: "HwServiceCard",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: String,
    href: String,
    actionLabel: String,
    category: String,
    metadata: Array as PropType<readonly DescriptionItem[]>,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(Card, mergeProps(attrs, { class: "hw-service-card" }), {
        header: () => [
          slots.icon && h("div", { class: "hw-service-card-icon", "aria-hidden": "true" }, slots.icon()),
          h("div", {}, [
            props.category && h(Badge, {}, () => props.category),
            h("h3", {}, props.title),
          ]),
        ],
        default: () => [
          props.description && h("p", {}, props.description),
          serviceFacts(props.metadata),
          slots.default?.(),
        ],
        footer: slots.action || props.href ? () =>
          slots.action?.() ??
          h(Link, { href: props.href }, () => needText("ServiceCard", "actionLabel", props.actionLabel, "href is set and no action slot is given")) : undefined,
      });
  },
});
export const ServiceDetails = defineComponent({
  name: "HwServiceDetails",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: String,
    metadata: {
      type: Array as PropType<readonly DescriptionItem[]>,
      default: () => [],
    },
    requirements: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    /** Heading of the requirements; required when requirements has entries. */
    requirementsLabel: String,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("article", mergeProps(attrs, { class: "hw-service-details" }), [
        h("header", {}, [
          h("h2", {}, props.title),
          props.description && h("p", {}, props.description),
        ]),
        serviceFacts(props.metadata),
        props.requirements.length > 0 && h("section", {}, [
          needText("ServiceDetails", "requirementsLabel", props.requirementsLabel, "requirements are given") && h("h3", {}, props.requirementsLabel),
          h("ul", {}, props.requirements.map((item, index) => h("li", { key: index }, slots.requirement?.({ item, index }) ?? item))),
        ]),
        slots.default?.(),
        slots.action && h("footer", {}, slots.action()),
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
    /** Open state of the navigation below 48rem (v-model:open); `defaultOpen` is the uncontrolled start. */
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
  },
  emits: { "update:open": (_value: boolean) => true },
  setup(props, { attrs, slots, emit }) {
    const id = useId(); const open = useValue(() => props.open, props.defaultOpen, value => emit("update:open", value));
    const root = ref<HTMLElement>(); const trigger = ref<HTMLButtonElement>();
    const branch = ref<HTMLDetailsElement>(); const skip = ref<HTMLAnchorElement>(); const brand = ref<HTMLElement>();
    useFragmentLinks(() => [skip.value]);
    useBrandName("PortalHeader", () => brand.value);
    const close = () => { branch.value = undefined; open.set(false); };
    // A press on a branch heading closes nothing by itself: the click on that heading opens it and closes
    // the others, so the heading does not move away between the press and the click.
    let pressed: HTMLElement | null = null;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      pressed = getPortalBranchSummary(event.target, root.value);
      if (pressed) return;
      if (!branch.value?.contains(target)) branch.value = undefined;
      if (!root.value?.contains(target)) open.set(false);
    };
    const cancel = () => { pressed = null; };
    onMounted(() => { root.value?.ownerDocument.addEventListener('pointerdown', outside); root.value?.ownerDocument.addEventListener('pointercancel', cancel); });
    onBeforeUnmount(() => { root.value?.ownerDocument.removeEventListener('pointerdown', outside); root.value?.ownerDocument.removeEventListener('pointercancel', cancel); });
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
          pressed = null;
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
          pressed = null;
          if (event.defaultPrevented || event.key !== 'Escape') return;
          if (branch.value?.isConnected) {
            event.preventDefault(); event.stopPropagation();
            const summary = branch.value.querySelector<HTMLElement>(':scope > summary');
            branch.value = undefined; summary?.focus();
          } else if (open.value.value) {
            event.preventDefault(); event.stopPropagation(); close(); trigger.value?.focus();
          }
        },
        onFocusout: (event: FocusEvent) => {
          const target = (event.relatedTarget ?? root.value?.ownerDocument.activeElement) as Node | null;
          if (!pressed?.contains(target) && !branch.value?.contains(target)) branch.value = undefined;
          if (!root.value?.contains(target)) open.set(false);
        },
      }), [
        props.mainId && h('a', { ref: skip, class: 'hw-skip-link', href: getFragmentHref(props.mainId) }, needText("PortalHeader", "skipLabel", props.skipLabel, "mainId is set")),
        // Application content (an official-site notice): no text contract, no role and no aria attribute.
        slots.notice && h("div", { class: "hw-portal-notice" }, slots.notice()),
        // The brand is application content: artwork in the brand slot, text in the brand prop, or both.
        h(
          props.homeHref ? "a" : "div",
          {
            ref: brand,
            href: props.homeHref || undefined,
            class: "hw-portal-brand",
            role: !props.homeHref && optionalText(props.brandLabel) ? "img" : undefined,
            "aria-label": optionalText(props.brandLabel),
          },
          [slots.brand?.(), optionalText(props.brand) && h("span", {}, props.brand)],
        ),
        props.links.length > 0 && h('button', { ref: trigger, type: 'button', class: 'hw-button hw-portal-menu-toggle', 'aria-expanded': open.value.value, 'aria-controls': props.navigationId ?? `${id}-navigation`, onClick: () => { branch.value = undefined; open.set(!open.value.value); } }, [h('span', { class: 'hw-icon', 'data-icon': open.value.value ? 'cancel-01' : 'menu-01', 'aria-hidden': 'true' }), needText('PortalHeader', 'menuLabel', props.menuLabel)]),
        props.links.length > 0 && h(
          "nav",
          { id: props.navigationId ?? `${id}-navigation`, "aria-label": needText("PortalHeader", "navigationLabel", props.navigationLabel), 'data-open': String(open.value.value) },
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
    const linkList = (items: readonly PortalFooterLink[]) => h('ul', {class:'hw-portal-footer-links'}, items.map((link,index) => h('li', {key:index}, h('a', {href:link.href,target:link.external?'_blank':undefined,rel:link.external?'noopener noreferrer':undefined}, [link.label,link.external && h('span',{class:'hw-portal-footer-external hw-icon','data-icon':'link-square-02','data-size':'sm','aria-hidden':'true'}),link.external && needText('PortalFooter','externalLabel',props.externalLabel) && h('span',{class:'hw-sr-only'},' '+props.externalLabel)]))));
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
export type { ConsentChoice, FeedbackValue };
export const Feedback = defineComponent({
  name: "HwFeedback",
  inheritAttrs: false,
  props: {
    choiceVariant: { type: String as PropType<'text' | 'icon' | 'icon-text'>, default: 'text' },
    // The visible question that names the group; an application aria-label or aria-labelledby replaces it.
    label: String,
    modelValue: Object as PropType<FeedbackValue>,
    defaultValue: { type: Object as PropType<FeedbackValue>, default: () => ({ helpful: null, comment: "" }) },
    yesLabel: { type: String, required: true },
    noLabel: { type: String, required: true },
    // The comment field appears once a reader answers (run-time data), so both texts are needed in every use.
    commentLabel: { type: String, required: true },
    submitLabel: { type: String, required: true },
    successMessage: { type: String, required: true },
    disabled: Boolean,
  },
  emits: {
    "update:modelValue": (_value: FeedbackValue) => true,
    feedback: (_value: FeedbackValue) => true,
  },
  setup(props, { attrs, emit, slots }) {
    const id = useId();
    const model = useValue<FeedbackValue>(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const sent = ref(false);
    const change = (next: FeedbackValue) => { sent.value = false; model.set(next); };
    return () => {
      const named = !!optionalText(attrs["aria-label"]) || !!optionalText(attrs["aria-labelledby"]);
      const question = named ? optionalText(props.label) : needText("Feedback", "label", props.label);
      const copy = { yes: needText("Feedback", "yesLabel", props.yesLabel), no: needText("Feedback", "noLabel", props.noLabel), comment: needText("Feedback", "commentLabel", props.commentLabel), submit: needText("Feedback", "submitLabel", props.submitLabel), success: needText("Feedback", "successMessage", props.successMessage) };
      const current = model.value.value;
      const choice = (helpful: boolean) => h(
        Button,
        {
          variant: "secondary",
          disabled: props.disabled,
          "aria-pressed": current.helpful === helpful,
          onClick: () => { if (props.disabled || model.value.value.helpful === helpful) return; change({ ...model.value.value, helpful }); },
        },
        () => [h('span', { class: 'hw-icon hw-feedback-icon', 'data-icon': helpful ? 'thumbs-up' : 'thumbs-down', 'aria-hidden': 'true' }), h('span', { class: 'hw-feedback-label' }, helpful ? copy.yes : copy.no)],
      );
      return h(
        "div",
        mergeProps(attrs, { class: "hw-feedback", role: "group", "aria-labelledby": attrs["aria-labelledby"] ?? (question && !optionalText(attrs["aria-label"]) ? `${id}-label` : undefined), "data-choice-variant": props.choiceVariant }),
        [
          question && h("p", { id: `${id}-label` }, question),
          h("div", { class: "hw-feedback-actions" }, [choice(true), choice(false)]),
          current.helpful !== null &&
            h("div", { class: "hw-feedback-comment" }, [
              h(Textarea, {
                label: copy.comment,
                modelValue: current.comment,
                "onUpdate:modelValue": (comment: string) => change({ ...model.value.value, comment }),
                disabled: props.disabled,
              }),
              h(
                Button,
                {
                  disabled: props.disabled,
                  onClick: () => {
                    if (props.disabled) return;
                    emit("feedback", model.value.value);
                    sent.value = true;
                  },
                },
                () => copy.submit,
              ),
            ]),
          h("p", { role: "status" }, sent.value ? copy.success : undefined),
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
    policyHref: String,
    policyLabel: String,
    variant: String as PropType<"banner">,
    // The preferences action is rendered only while @preferences is bound.
    onPreferences: listener<[]>(),
  },
  emits: {
    "update:open": (_value: boolean) => true,
    consent: (_choice: ConsentChoice) => true,
    preferences: () => true,
  },
  setup(props, { attrs, slots, emit }) {
    const id = useId();
    const model = useValue(
      () => props.open,
      props.defaultOpen,
      (v) => emit("update:open", v),
    );
    // Nothing is stored; the application places focus once the region closes.
    const choose = (choice: ConsentChoice) => { emit("consent", choice); model.set(false); };
    return () => {
      const title = needText("CookieConsent", "title", props.title);
      const description = needText("CookieConsent", "description", props.description);
      return h(
        "section",
        mergeProps(attrs, {
          class: "hw-cookie-consent",
          "aria-labelledby": attrs["aria-labelledby"] ?? (title && !optionalText(attrs["aria-label"]) ? `${id}-title` : undefined),
          "data-variant": props.variant ?? attrs["data-variant"],
          hidden: !model.value.value,
        }),
        [
          title && h("h2", { id: `${id}-title` }, title),
          description && h("p", {}, description),
          props.policyHref && h(Link, { href: props.policyHref }, () => needText("CookieConsent", "policyLabel", props.policyLabel, "policyHref is set")),
          slots.default?.(),
          h("div", { class: "hw-button-group" }, [
            h(Button, { onClick: () => choose("accepted") }, () => needText("CookieConsent", "acceptLabel", props.acceptLabel)),
            h(Button, { variant: "secondary", onClick: () => choose("rejected") }, () => needText("CookieConsent", "rejectLabel", props.rejectLabel)),
            listens(props.onPreferences) && h(
              Button,
              { variant: "ghost", onClick: () => emit("preferences") },
              () => needText("CookieConsent", "preferencesLabel", props.preferencesLabel, "a preferences listener is bound"),
            ),
          ]),
        ],
      );
    };
  },
});
export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  /** Machine-readable ISO value of the date; shown only through dateLabel. */
  dateTime?: string;
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
    // The visible heading that names the list; an application aria-label or aria-labelledby replaces it.
    label: String,
    emptyMessage: { type: String, required: true },
    unreadLabel: { type: String, required: true },
    getMarkReadLabel: Function as PropType<(item: NotificationItem) => string>,
    getDismissLabel: Function as PropType<(item: NotificationItem) => string>,
    // A listener is also a rendering input: the mark-read and dismiss actions are rendered only while @read / @dismiss is bound.
    onRead: listener<[id: string]>(), onDismiss: listener<[id: string]>(),
  },
  setup(props, { attrs, emit, slots }) {
    const id = useId();
    const region = ref<HTMLElement>();
    const itemLabel = (name: "getMarkReadLabel" | "getDismissLabel", item: NotificationItem, when: string) => { const get = needText("NotificationList", name, props[name], when); return get ? optionalText(get(item)) : undefined; };
    // After an action, focus goes to the same control of the next item, else the previous one, else the list.
    const act = (event: MouseEvent, control: string, notify: () => void) => {
      const recover = region.value ? prepareRemovalFocus(region.value, event.currentTarget as HTMLElement, { item: ":scope > ul > li", control, fallback: region.value }) : undefined;
      try { notify(); } finally { if (recover) void nextTick(recover); }
    };
    return () => {
      const named = !!optionalText(attrs["aria-label"]) || !!optionalText(attrs["aria-labelledby"]);
      const heading = named ? optionalText(props.label) : needText("NotificationList", "label", props.label);
      const unread = needText("NotificationList", "unreadLabel", props.unreadLabel);
      const actions = listens(props.onRead) || listens(props.onDismiss);
      return h(
        "section",
        mergeProps(attrs, {
          ref: region,
          class: "hw-notification-list",
          tabindex: attrs.tabindex ?? (actions ? -1 : undefined),
          "aria-labelledby": attrs["aria-labelledby"] ?? (heading && !optionalText(attrs["aria-label"]) ? `${id}-title` : undefined),
        }),
        [
          heading && h("h2", { id: `${id}-title` }, heading),
          props.items.length
            ? h(
                "ul",
                {},
                props.items.map((item) => {
                  const markRead = !item.read && listens(props.onRead) ? itemLabel("getMarkReadLabel", item, "a read listener is bound") : undefined;
                  return h(
                    "li",
                    { key: item.id, "data-state": item.read ? "read" : "unread" },
                    [
                      h("h3", {}, item.href ? h(Link, { href: item.href }, () => item.title) : item.title),
                      !item.read && unread && h(Badge, { tone: "info" }, () => unread),
                      item.description && h("p", {}, item.description),
                      item.dateLabel && h("time", { datetime: item.dateTime }, item.dateLabel),
                      slots[item.id]?.({ item }),
                      markRead &&
                        h(
                          Button,
                          {
                            variant: "ghost",
                            "data-hw-mark-read": "",
                            onClick: (event: MouseEvent) => act(event, "[data-hw-mark-read]", () => emit("read", item.id)),
                          },
                          () => markRead,
                        ),
                      listens(props.onDismiss) && h(
                        Button,
                        {
                          variant: "ghost",
                          "data-hw-dismiss": "",
                          "aria-label": itemLabel("getDismissLabel", item, "a dismiss listener is bound"),
                          onClick: (event: MouseEvent) => act(event, "[data-hw-dismiss]", () => emit("dismiss", item.id)),
                        },
                        () => h('span', { class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md', 'aria-hidden': 'true' }),
                      ),
                    ],
                  );
                }),
              )
            : h("p", {}, needText("NotificationList", "emptyMessage", props.emptyMessage)),
        ],
      );
    };
  },
});
