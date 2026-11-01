import { defineComponent, h, mergeProps, onMounted, onBeforeUnmount, ref, useId } from "vue";
import type { PropType } from "vue";
import { Button, Textarea } from "./forms.js";
import { Badge, Card } from "./display.js";
import { DescriptionList, Link } from "./content.js";
import type { DescriptionItem } from "./content.js";
import { useValue } from "./shared.js";

export const ServiceCard = defineComponent({
  name: "NqServiceCard",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: String,
    href: String,
    actionLabel: { type: String, default: "Start service" },
    badge: String,
    metadata: Array as PropType<readonly string[]>,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(Card, mergeProps(attrs, { class: "nq-service-card" }), {
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
            ? h(Link, { href: props.href }, () => props.actionLabel)
            : undefined),
      });
  },
});
export const ServiceDetails = defineComponent({
  name: "NqServiceDetails",
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
      h("section", mergeProps(attrs, { class: "nq-service-details" }), [
        h("header", {}, [
          h("h2", {}, props.title),
          props.description && h("p", {}, props.description),
        ]),
        h(DescriptionList, { items: props.items }),
        slots.default?.(),
        slots.action &&
          h("div", { class: "nq-service-details-action" }, slots.action()),
      ]);
  },
});
export interface PortalLink {
  label: string;
  href: string;
  current?: boolean;
}
export const PortalHeader = defineComponent({
  name: "NqPortalHeader",
  inheritAttrs: false,
  props: {
    brand: { type: String, required: true },
    homeHref: { type: String, default: "/" },
    links: {
      type: Array as PropType<readonly PortalLink[]>,
      default: () => [],
    },
    navLabel: { type: String, default: "التنقل الرئيسي" },
    menuLabel: { type: String, default: "القائمة" },
    navigationId: String,
    mainId: String,
    skipLabel: { type: String, default: "انتقل إلى المحتوى" },
  },
  setup(props, { attrs, slots }) {
    const id = useId(); const open = ref(false);
    const root = ref<HTMLElement>(); const trigger = ref<HTMLButtonElement>();
    const outside = (event: PointerEvent) => { if (!root.value?.contains(event.target as Node)) open.value = false; };
    onMounted(() => root.value?.ownerDocument.addEventListener('pointerdown', outside));
    onBeforeUnmount(() => root.value?.ownerDocument.removeEventListener('pointerdown', outside));
    return () =>
      h("header", mergeProps(attrs, { class: "nq-portal-header", ref: root,
        onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && event.key === 'Escape' && open.value) { event.preventDefault(); open.value = false; trigger.value?.focus(); } },
        onFocusout: (event: FocusEvent) => { if (event.relatedTarget && !root.value?.contains(event.relatedTarget as Node)) open.value = false; },
      }), [
        props.mainId && h('a', { class: 'nq-skip-link', href: `#${props.mainId}` }, props.skipLabel),
        h(
          "a",
          {
            href: props.homeHref,
            class: "nq-portal-brand",
            "aria-label": props.brand,
          },
          slots.logo?.() ?? props.brand,
        ),
        props.links.length > 0 && h('button', { ref: trigger, type: 'button', class: 'nq-button nq-portal-menu-toggle', 'aria-expanded': open.value, 'aria-controls': props.navigationId ?? `${id}-navigation`, onClick: () => { open.value = !open.value; } }, [h('span', { class: 'nq-icon', 'data-icon': open.value ? 'cancel-01' : 'menu-01', 'aria-hidden': 'true' }), props.menuLabel]),
        props.links.length > 0 && h(
          "nav",
          { id: props.navigationId ?? `${id}-navigation`, "aria-label": props.navLabel, 'data-open': String(open.value), onClick: (event: MouseEvent) => { if ((event.target as Element).closest('a[href]')) open.value = false; } },
          h(
            "ul",
            {},
            props.links.map((link) =>
              h(
                "li",
                {},
                h(
                  "a",
                  {
                    href: link.href,
                    "aria-current": link.current ? "page" : undefined,
                  },
                  link.label,
                ),
              ),
            ),
          ),
        ),
        slots.actions &&
          h("div", { class: "nq-portal-header-actions" }, slots.actions()),
        slots.default?.(),
      ]);
  },
});
export const PortalFooter = defineComponent({
  name: "NqPortalFooter",
  inheritAttrs: false,
  props: {
    brand: String,
    copyright: String,
    links: {
      type: Array as PropType<readonly PortalLink[]>,
      default: () => [],
    },
    navLabel: { type: String, default: "Footer navigation" },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("footer", mergeProps(attrs, { class: "nq-portal-footer" }), [
        props.brand && h("strong", {}, props.brand),
        h(
          "nav",
          { "aria-label": props.navLabel },
          h(
            "ul",
            {},
            props.links.map((link) =>
              h("li", {}, h("a", { href: link.href }, link.label)),
            ),
          ),
        ),
        slots.default?.(),
        props.copyright && h("small", {}, props.copyright),
      ]);
  },
});
export interface FeedbackValue {
  value: string;
  comment: string;
}
export const Feedback = defineComponent({
  name: "NqFeedback",
  inheritAttrs: false,
  props: {
    label: { type: String, default: "Was this page helpful?" },
    modelValue: String,
    defaultValue: { type: String, default: "" },
    yesLabel: { type: String, default: "Yes" },
    noLabel: { type: String, default: "No" },
    commentLabel: { type: String, default: "Tell us more" },
    submitLabel: { type: String, default: "Send feedback" },
    thanks: { type: String, default: "Thank you for your feedback." },
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
    return () =>
      h(
        "section",
        mergeProps(attrs, { class: "nq-feedback", "aria-label": props.label }),
        [
          h("h2", {}, props.label),
          h(
            "div",
            {
              class: "nq-button-group",
              role: "group",
              "aria-label": props.label,
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
                () => (value === "yes" ? props.yesLabel : props.noLabel),
              ),
            ),
          ),
          model.value.value &&
            h("div", {}, [
              h(Textarea, {
                label: props.commentLabel,
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
                () => props.submitLabel,
              ),
            ]),
          h("p", { role: "status" }, submitted.value ? props.thanks : ""),
          slots.default?.(),
        ],
      );
  },
});
export const CookieConsent = defineComponent({
  name: "NqCookieConsent",
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: true },
    label: { type: String, default: "Cookie preferences" },
    description: { type: String, required: true },
    acceptLabel: { type: String, default: "Accept optional cookies" },
    rejectLabel: { type: String, default: "Reject optional cookies" },
    preferencesLabel: { type: String, default: "Manage preferences" },
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
          class: "nq-cookie-consent",
          role: "region",
          "aria-label": props.label,
          hidden: !model.value.value,
        }),
        [
          h("h2", {}, props.label),
          h("p", {}, props.description),
          slots.default?.(),
          h("div", { class: "nq-button-group" }, [
            h(
              Button,
              {
                onClick: () => {
                  emit("accept");
                  model.set(false);
                },
              },
              () => props.acceptLabel,
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
              () => props.rejectLabel,
            ),
            h(
              Button,
              { variant: "ghost", onClick: () => emit("preferences") },
              () => props.preferencesLabel,
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
  name: "NqNotificationList",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<readonly NotificationItem[]>,
      required: true,
    },
    label: { type: String, default: "Notifications" },
    emptyMessage: { type: String, default: "No notifications" },
    readLabel: {
      type: Function as PropType<(item: NotificationItem) => string>,
      default: (item: NotificationItem) => `Mark ${item.title} as read`,
    },
    dismissLabel: {
      type: Function as PropType<(item: NotificationItem) => string>,
      default: (item: NotificationItem) => `Dismiss ${item.title}`,
    },
  },
  emits: { read: (_id: string) => true, dismiss: (_id: string) => true },
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        "section",
        mergeProps(attrs, {
          class: "nq-notification-list",
          "aria-label": props.label,
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
                            "aria-label": props.readLabel(item),
                            onClick: () => emit("read", item.id),
                          },
                          () => props.readLabel(item),
                        ),
                      h(
                        Button,
                        {
                          variant: "ghost",
                          "aria-label": props.dismissLabel(item),
                          onClick: () => emit("dismiss", item.id),
                        },
                        () => "×",
                      ),
                    ],
                  ),
                ),
              )
            : h("p", { role: "status" }, props.emptyMessage),
        ],
      );
  },
});
