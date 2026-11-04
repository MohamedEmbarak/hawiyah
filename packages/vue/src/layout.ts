import { defineComponent, h, mergeProps, useId } from "vue";
import type { PropType } from "vue";
import { layoutStyles } from "@nasaq/core";
import type { LayoutProps } from "@nasaq/core";

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
  return defineComponent({
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
}
export const Container = layout("NqContainer", "nq-container");
export const Stack = layout("NqStack", "nq-stack");
export const Inline = layout("NqInline", "nq-inline");
export const Grid = layout("NqGrid", "nq-grid");
export const Columns = layout("NqColumns", "nq-columns");
export const Sidebar = layout("NqSidebar", "nq-sidebar");
export const Center = layout("NqCenter", "nq-center");
export const Spacer = layout("NqSpacer", "nq-spacer");
export const AspectRatio = layout("NqAspectRatio", "nq-aspect-ratio");
export const Section = layout("NqSection", "nq-section", "section");
export const AppShell = defineComponent({
  name: "NqAppShell",
  inheritAttrs: false,
  props: {
    ...layoutProps,
    mainId: String,
    skipLabel: { type: String, default: 'انتقل إلى المحتوى' },
  },
  setup(props, { attrs, slots }) {
    const defaultMainId = `nq-shell-${useId()}-main`;
    return () =>
      h(
        props.as,
        mergeProps(attrs, {
          class: "nq-app-shell",
          style: layoutStyles(props),
          "data-side": props.side,
          "data-collapse-at": props.collapseAt,
        }),
        [
          h('a', { class: 'nq-skip-link', href: `#${props.mainId ?? defaultMainId}` }, props.skipLabel),
          slots.header &&
            h("div", { class: "nq-app-shell-header" }, slots.header()),
          slots.sidebar &&
            h("aside", { class: "nq-app-shell-sidebar" }, slots.sidebar()),
          h("main", { class: "nq-app-shell-main", id: props.mainId ?? defaultMainId, tabindex: -1 }, slots.default?.()),
          slots.footer &&
            h("div", { class: "nq-app-shell-footer" }, slots.footer()),
        ],
      );
  },
});
export const PageHeader = defineComponent({
  name: "NqPageHeader",
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
          class: "nq-page-header",
          style: layoutStyles(props),
        }),
        [
          slots.breadcrumb?.(),
          h("div", { class: "nq-page-header-main" }, [
            h("div", {}, [
              h(`h${Math.min(6, Math.max(1, props.level))}`, {}, props.title),
              props.description && h("p", {}, props.description),
            ]),
            slots.actions &&
              h("div", { class: "nq-page-header-actions" }, slots.actions()),
          ]),
          slots.default?.(),
        ],
      );
  },
});
