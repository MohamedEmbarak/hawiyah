import type {WithNativeAttributes} from './native-attributes.js';
import type {HTMLAttributes} from 'vue';
import { defineComponent, h, mergeProps, ref, useId } from "vue";
import type { PropType } from "vue";
import { getFragmentHref, layoutStyles } from "@hawiyah/core";
import { needText, useFragmentLinks } from "./shared.js";
import type { LayoutProps } from "@hawiyah/core";

const layoutProps = {
  as: { type: String, default: "div" },
  gap: [Number, String, Object] as PropType<LayoutProps["gap"]>,
  padding: [Number, String, Object] as PropType<LayoutProps["padding"]>,
  align: String as PropType<LayoutProps["align"]>,
  justify: String as PropType<LayoutProps["justify"]>,
  wrap: { type: Boolean, default: undefined },
  columns: [Number, Object] as PropType<LayoutProps["columns"]>,
  minItemWidth: String,
  side: { type: String as PropType<LayoutProps["side"]>, default: "start" },
  sidebarWidth: String,
  collapseAt: {
    type: String as PropType<LayoutProps["collapseAt"]>,
    default: "md",
  },
  maxWidth: String,
  ratio: Number,
} as const;
function layout(name: string, className: string, tag = "div") {
  const component = defineComponent({
    name,
    inheritAttrs: false,
    props: { ...layoutProps, as: { type: String, default: tag } },
    setup(props, { attrs, slots }) {
      return () =>
        h(
          props.as,
          mergeProps(attrs, {
            class: className,
            style: layoutStyles(props),
            "data-side": props.side,
            "data-collapse-at": props.collapseAt,
          }),
          slots.default?.(),
        );
    },
  });
  return component as WithNativeAttributes<typeof component, HTMLAttributes>;
}
export const Container = layout("HwContainer", "hw-container");
export const Stack = layout("HwStack", "hw-stack");
export const Inline = layout("HwInline", "hw-inline");
export const Grid = layout("HwGrid", "hw-grid");
export const Columns = layout("HwColumns", "hw-columns");
export const Sidebar = layout("HwSidebar", "hw-sidebar");
export const Center = layout("HwCenter", "hw-center");
export const Spacer = layout("HwSpacer", "hw-spacer");
export const AspectRatio = layout("HwAspectRatio", "hw-aspect-ratio");
export const Section = layout("HwSection", "hw-section", "section");
export const AppShell = defineComponent({
  name: "HwAppShell",
  inheritAttrs: false,
  props: {
    ...layoutProps,
    mainId: String,
    skipLabel: { type: String, required: true },
  },
  setup(props, { attrs, slots }) {
    const defaultMainId = `hw-shell-${useId()}-main`;
    const skip = ref<HTMLAnchorElement>();
    useFragmentLinks(() => [skip.value]);
    return () =>
      h(
        props.as,
        mergeProps(attrs, {
          class: "hw-app-shell",
          style: layoutStyles(props),
          "data-side": props.side,
          "data-collapse-at": props.collapseAt,
        }),
        [
          h('a', { ref: skip, class: 'hw-skip-link', href: getFragmentHref(props.mainId ?? defaultMainId) }, needText('AppShell', 'skipLabel', props.skipLabel)),
          slots.header &&
            h("div", { class: "hw-app-shell-header" }, slots.header()),
          slots.sidebar &&
            h("aside", { class: "hw-app-shell-sidebar" }, slots.sidebar()),
          h("main", { class: "hw-app-shell-main", id: props.mainId ?? defaultMainId, tabindex: -1 }, slots.default?.()),
          slots.footer &&
            h("div", { class: "hw-app-shell-footer" }, slots.footer()),
        ],
      );
  },
});
export const PageHeader = defineComponent({
  name: "HwPageHeader",
  inheritAttrs: false,
  props: {
    ...layoutProps,
    title: { type: String, required: true },
    description: String,
    level: { type: Number, default: 1 },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "header",
        mergeProps(attrs, {
          class: "hw-page-header",
          style: layoutStyles(props),
        }),
        [
          slots.breadcrumb?.(),
          h("div", { class: "hw-page-header-main" }, [
            h("div", {}, [
              h(`h${Math.min(6, Math.max(1, props.level))}`, {}, props.title),
              props.description && h("p", {}, props.description),
            ]),
            slots.actions &&
              h("div", { class: "hw-page-header-actions" }, slots.actions()),
          ]),
          slots.default?.(),
        ],
      );
  },
});
