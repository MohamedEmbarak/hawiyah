import { defineComponent, h, mergeProps, ref, useId } from "vue";
import type { PropType, VNodeChild } from "vue";
import { sortRows } from "@hawiyah/core";
import { Button } from "./forms.js";
import { Avatar } from "./display.js";
import { needText, optionalText, rootLabel, useValue } from "./shared.js";

export const Link = defineComponent({
  name: 'HwLink', inheritAttrs: false,
  props: {href:String,disabled:Boolean,external:Boolean,variant:String as PropType<'default'|'subtle'|'neutral'|'standalone'>},
  setup(props,{attrs,slots}) {
    return ()=>{
      const unavailable=props.disabled || attrs['aria-disabled']===true || attrs['aria-disabled']==='true';
      const activation=(name:string)=>(event:MouseEvent)=>{
        if(unavailable){event.preventDefault();event.stopPropagation();return;}
        const handlers=attrs[name];for(const handler of Array.isArray(handlers)?handlers:[handlers])if(typeof handler==='function')handler(event);
      };
      return h('a',{...mergeProps(attrs,{class:'hw-link',href:unavailable?undefined:props.href,role:unavailable?'link':attrs.role,'data-variant':props.variant ?? attrs['data-variant'],target:props.external?'_blank':attrs.target,rel:props.external?'noopener noreferrer':attrs.rel,'aria-disabled':unavailable || undefined,tabindex:unavailable?-1:attrs.tabindex}),onClick:activation('onClick'),onAuxclick:activation('onAuxclick')},slots.default?.());
    };
  },
});
export const IconButton = defineComponent({
  name: "HwIconButton",
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    variant: {
      type: String as PropType<'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link'>,
      default: "ghost",
    },
    size: { type: String as PropType<"sm" | "md" | "lg">, default: "md" },
    shape: String as PropType<"square" | "circle">,
    disabled: Boolean,
    loading: Boolean,
  },
  setup(props, { attrs, slots, expose }) {
    const button = ref<{focus: () => void}>();
    expose({focus: () => button.value?.focus()});
    return () =>
      h(
        Button,
        mergeProps(attrs, {
          ref: button, variant: props.variant, size: props.size, disabled: props.disabled, loading: props.loading,
          "data-shape": props.shape ?? attrs["data-shape"],
          class: "hw-icon-button",
          "aria-label": props.label,
        }),
        () => h("span", { "aria-hidden": "true" }, slots.default?.()),
      );
  },
});
export const ButtonGroup = defineComponent({
  name: "HwButtonGroup",
  inheritAttrs: false,
  props: { label: { type: String, required: true }, variant:String as PropType<'default'|'attached'>, orientation:String as PropType<'horizontal'|'vertical'> },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        mergeProps(attrs, {
          class: "hw-button-group", "data-variant":props.variant ?? attrs["data-variant"], "data-orientation":props.orientation ?? attrs["data-orientation"],
          role: "group",
          "aria-label": props.label,
        }),
        slots.default?.(),
      );
  },
});
export const Chip = defineComponent({
  name: "HwChip",
  inheritAttrs: false,
  props: {
    label: String,
    removable: Boolean,
    disabled: Boolean,
    removeLabel: String,
    tone: {
      type: String as PropType<
        "neutral" | "success" | "warning" | "danger" | "info"
      >,
      default: "neutral",
    },
  },
  emits: { remove: () => true },
  setup(props, { attrs, slots, emit }) {
    return () =>
      h(
        "span",
        mergeProps(attrs, { class: "hw-chip", "data-tone": props.tone }),
        [
          props.label ?? slots.default?.(),
          props.removable &&
            h(
              Button,
              {
                variant: "ghost",
                size: "sm",
                disabled: props.disabled,
                "aria-label": needText("Chip", "removeLabel", props.removeLabel, "the chip is removable"),
                onClick: () => emit("remove"),
              },
              () => h('span', { class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md', 'aria-hidden': 'true' }),
            ),
        ],
      );
  },
});
export interface DescriptionItem {
  term: string;
  description: VNodeChild;
}
export const DescriptionList = defineComponent({
  name: "HwDescriptionList",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<readonly DescriptionItem[]>,
      required: true,
    },
    variant: {
      type: String as PropType<"stacked" | "horizontal" | "compact">,
      default: "horizontal",
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "dl",
        mergeProps(attrs, {
          class: "hw-description-list",
          "data-variant": props.variant,
        }),
        props.items.map((item, index) =>
          h("div", { key: index }, [
            h("dt", {}, item.term),
            h("dd", {}, [
              slots[`item:${index}`]?.({ item }) ?? item.description,
            ]),
          ]),
        ),
      );
  },
});
export const Stat = defineComponent({
  name: "HwStat",
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    description: String,
    trend: String,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("div", mergeProps(attrs, { class: "hw-stat" }), [
        h("span", { class: "hw-stat-label" }, props.label),
        h(
          "strong",
          { class: "hw-stat-value" },
          String(props.value),
        ),
        props.description &&
          h("p", { class: "hw-stat-description" }, props.description),
        props.trend && h("span", { class: "hw-stat-trend" }, props.trend),
        slots.default?.(),
      ]);
  },
});
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  dateLabel?: string;
  status?: "complete" | "current" | "upcoming";
}
export const Timeline = defineComponent({
  name: "HwTimeline",
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly TimelineItem[]>, required: true },
    label: String,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "ol",
        mergeProps(attrs, { class: "hw-timeline", "aria-label": rootLabel("Timeline", props.label, attrs) }),
        props.items.map((item) =>
          h(
            "li",
            {
              key: item.id,
              class: "hw-timeline-item",
              "data-state": item.status,
              "aria-current": item.status === "current" ? "step" : undefined,
            },
            [
              h("h3", {}, item.title),
              item.date &&
                h("time", { datetime: item.date }, item.dateLabel ?? item.date),
              item.description && h("p", {}, item.description),
              slots[item.id]?.({ item }),
            ],
          ),
        ),
      );
  },
});
export const Meter = defineComponent({
  name: "HwMeter",
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    low: Number,
    high: Number,
    optimum: Number,
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "meter",
        mergeProps(attrs, {
          class: "hw-meter",
          "aria-label": props.label,
          value: props.value,
          min: props.min,
          max: props.max,
          low: props.low,
          high: props.high,
          optimum: props.optimum,
        }),
      );
  },
});
export interface AvatarItem {
  name: string;
  src?: string;
  initials?: string;
}
export const AvatarGroup = defineComponent({
  name: "HwAvatarGroup",
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly AvatarItem[]>, required: true },
    max: { type: Number, default: 5 },
    label: String,
    getOverflowLabel: {
      type: Function as PropType<(count: number) => string>,
      required: true,
    },
  },
  setup(props, { attrs }) {
    return () => {
      const rounded = Math.floor(props.max);
      const max = Number.isNaN(rounded) ? 5 : Math.max(0, rounded);
      const overflowLabel = (count: number) => { const get = needText("AvatarGroup", "getOverflowLabel", props.getOverflowLabel); return get ? optionalText(get(count)) : undefined; };
      return h(
        "div",
        mergeProps(attrs, {
          class: "hw-avatar-group",
          role: "group",
          "aria-label": rootLabel("AvatarGroup", props.label, attrs),
        }),
        [
          ...props.items
            .slice(0, max)
            .map((item, index) => h(Avatar, { ...item, key: index })),
          props.items.length > max &&
            h(
              "span",
              {
                class: "hw-avatar",
                role: "img",
                "aria-label": overflowLabel(props.items.length - max),
              },
              `+${props.items.length - max}`,
            ),
        ],
      );
    };
  },
});
export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  rowHeader?: boolean;
}
export const DataTable = defineComponent({
  name: "HwDataTable",
  inheritAttrs: false,
  props: {
    variant: String as PropType<'default' | 'striped' | 'bordered'>,
    size: String as PropType<'sm' | 'md' | 'lg'>,
    wrapperProps: Object as PropType<Record<string, unknown>>,
    emptyMessage: {type: String, required: true},
    columns: { type: Array as PropType<readonly DataColumn[]>, required: true },
    rows: {
      type: Array as PropType<readonly Record<string, unknown>[]>,
      required: true,
    },
    caption: { type: String, required: true },
    sortKey: String,
    defaultSortKey: { type: String, default: "" },
    sortDirection: String as PropType<"ascending" | "descending">,
    defaultSortDirection: {
      type: String as PropType<"ascending" | "descending">,
      default: "ascending",
    },
    locale: { type: String, required: true },
    rowKey: Function as PropType<
      (row: Record<string, unknown>, index: number) => string | number
    >,
    getSortLabel: Function as PropType<
      (column: DataColumn, direction: "ascending" | "descending") => string
    >,
  },
  emits: {
    "update:sortKey": (_value: string) => true,
    "update:sortDirection": (_value: "ascending" | "descending") => true,
  },
  setup(props, { attrs, slots, emit }) {
    const captionId = useId();
    const key = useValue(
      () => props.sortKey,
      props.defaultSortKey,
      (v) => emit("update:sortKey", v),
    );
    const direction = useValue(
      () => props.sortDirection,
      props.defaultSortDirection,
      (v) => emit("update:sortDirection", v),
    );
    return () => {
      // Sorting compares text with the application's locale; without it the rows keep their source order.
      const locale = needText("DataTable", "locale", props.locale);
      const rows = key.value.value && locale
        ? sortRows(
            props.rows,
            key.value.value,
            direction.value.value,
            locale,
          )
        : props.rows;
      return h("div", mergeProps({ class: "hw-table-wrap hw-data-table", tabindex: 0, role: "region", "aria-labelledby": captionId }, props.wrapperProps ?? {}), [
        h("table", mergeProps(attrs, { class: "hw-table", "data-variant": props.variant ?? attrs["data-variant"], "data-size": props.size ?? attrs["data-size"] }), [
          h("caption", {id: captionId}, props.caption),
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              props.columns.map((column) => {
                const active = column.key === key.value.value;
                const next =
                  active && direction.value.value === "ascending"
                    ? "descending"
                    : "ascending";
                return h(
                  "th",
                  {
                    key: column.key,
                    scope: "col",
                    "aria-sort": column.sortable
                      ? active
                        ? direction.value.value
                        : "none"
                      : undefined,
                  },
                  column.sortable
                    ? h(
                        "button",
                        {
                          type: "button",
                          "aria-label": optionalText(props.getSortLabel?.(column, next)),
                          onClick: () => {
                            key.set(column.key);
                            direction.set(next);
                          },
                        },
                        [
                          column.label,
                          h("span", {
                            class: "hw-icon",
                            "data-size": "sm",
                            "aria-hidden": "true",
                            "data-icon": active
                              ? direction.value.value === "ascending"
                                ? "arrow-up-02"
                                : "arrow-down-02"
                              : "arrow-data-transfer-vertical",
                          }),
                        ],
                      )
                    : column.label,
                );
              }),
            ),
          ),
          h(
            "tbody",
            {},
            rows.length ? rows.map((row, index) =>
              h(
                "tr",
                { key: props.rowKey?.(row, index) ?? index },
                props.columns.map((column) =>
                  h(
                    column.rowHeader ? "th" : "td",
                    {
                      key: column.key,
                      scope: column.rowHeader ? "row" : undefined,
                    },
                    slots[`cell:${column.key}`]?.({ row, index }) ??
                      String(row[column.key] ?? ""),
                  ),
                ),
              ),
            ) : h("tr", {}, h("td", {colspan: props.columns.length || 1}, needText("DataTable", "emptyMessage", props.emptyMessage))),
          ),
        ]),
      ]);
    };
  },
});
