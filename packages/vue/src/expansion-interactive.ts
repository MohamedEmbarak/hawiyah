import {
  computed,
  defineComponent,
  h,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useId,
  watch,
} from "vue";
import type { PropType, VNodeChild } from "vue";
import { createTypeahead, getDirection, getNextEnabledIndex, isTypeaheadKey, restoreFocus, observeReadonlyChoice, prepareToastDismissFocus } from "@hawiyah/core";
import type { Option } from "@hawiyah/core";
import { Button, type ButtonVariant } from "./forms.js";
import { Dialog } from "./interactive.js";
import { joinIds, needText, optionalText, requiredMarker, rootLabel, textOf, useFormReset, useValue, withoutName } from "./shared.js";

export const ToggleGroup = defineComponent({
  name: "HwToggleGroup",
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<readonly Option[]>, required: true },
    /** Legend text; optional only when aria-label or aria-labelledby names the group. */
    label: String,
    hint: String,
    error: String,
    /** Single selection: every radio is required. Not enforced in multiple mode. */
    required: Boolean,
    name: String,
    form: String,
    modelValue: [String, Array] as PropType<string | readonly string[]>,
    /** No declared default: the empty value is '' in single mode and [] in multiple mode. */
    defaultValue: [String, Array] as PropType<string | readonly string[]>,
    multiple: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    /** Hides the legend visually; it stays the accessible name of the group. */
    labelHidden: Boolean,
    variant: {
      type: String as PropType<"segmented" | "outline">,
      default: "segmented",
    },
  },
  emits: { "update:modelValue": (_value: string | readonly string[]) => true },
  setup(props, { attrs, emit }) {
    const id = `hw-${useId()}`;
    const element = ref<HTMLInputElement>();
    const group = ref<HTMLFieldSetElement>();
    // A submission failed on the group (the invalid event of a radio); cleared by a choice or a reset.
    const failed = ref(false);
    let guards: ReturnType<typeof observeReadonlyChoice>[]=[];
    const bindGuards=()=>{guards.forEach(guard=>guard.destroy());guards=Array.from(group.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],observeReadonlyChoice);};
    onMounted(bindGuards);onUpdated(bindGuards);onBeforeUnmount(()=>guards.forEach(guard=>guard.destroy()));
    const empty = (): string | readonly string[] => props.multiple ? [] : "";
    const model = useValue(
      () => props.modelValue,
      props.defaultValue ?? empty(),
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => { failed.value = false; model.set(props.defaultValue ?? empty()); }, () => {
      group.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => {
        radio.checked = radio.value === model.value.value;
      });
    });
    return () => {
      // A forwarded aria-label or aria-labelledby names the group; otherwise `label` is required text.
      const legend = optionalText(attrs["aria-label"]) || optionalText(attrs["aria-labelledby"])
        ? optionalText(props.label) : needText("ToggleGroup", "label", props.label);
      return h(
        "fieldset",
        mergeProps(attrs, {
          class: "hw-toggle-group",ref:group,"data-hw-readonly":props.readonly || undefined,
          "data-variant": props.variant,
          disabled: props.disabled,
          "aria-describedby": joinIds(attrs["aria-describedby"], props.hint && `${id}-hint`, props.error && `${id}-error`),
          "aria-invalid": props.error || failed.value ? true : attrs["aria-invalid"],
        }),
        [
          legend ? h("legend", { class: props.labelHidden ? "hw-label hw-sr-only" : "hw-label" }, [legend, props.required && !props.multiple && requiredMarker()]) : null,
          props.multiple
            ? h("input", { ref: element, type: "hidden", form: props.form, disabled: true })
            : null,
          ...props.options.map((option, index) => {
            const selected = props.multiple
              ? Array.isArray(model.value.value) &&
                model.value.value.includes(option.value)
              : model.value.value === option.value;
            const disabled = props.disabled || option.disabled;
            return props.multiple
              ? h(
                  Button,
                  {
                    key: option.value,
                    variant: "secondary",
                    disabled,
                    "aria-pressed": selected,
                    "aria-disabled": props.readonly || undefined,
                    onClick: () => {
                      if (disabled || props.readonly) return;
                      const values = Array.isArray(model.value.value)
                        ? model.value.value
                        : [];
                      model.set(
                        selected
                          ? values.filter((value) => value !== option.value)
                          : [...values, option.value],
                      );
                    },
                  },
                  () => option.label,
                )
              : h(
                  "label",
                  { key: option.value },
                  [
                    h("input", {
                      ref: index === 0 ? element : undefined,
                      type: "radio",
                      name: props.name ?? id,
                      form: props.form,
                      value: option.value,
                      required: props.required || undefined,
                      checked: selected,readOnly:props.readonly,"aria-disabled":props.readonly || undefined,
                      disabled,
                      onClick: (event: MouseEvent) => {
                        if (props.readonly) event.preventDefault();
                      },
                      onInvalid: () => { failed.value = true; },
                      onChange: () => {
                        if (!disabled && !props.readonly) {
                          failed.value = false;
                          model.set(option.value);
                        }
                      },
                    }),
                    option.label,
                  ],
                );
          }),
          props.hint && h("p", { class: "hw-hint", id: `${id}-hint` }, props.hint),
          props.error && h("p", { class: "hw-error", id: `${id}-error` }, props.error),
          ...(props.multiple && Array.isArray(model.value.value)
            ? model.value.value.filter(value=>props.options.some(option=>option.value===value && !option.disabled)).map((value) =>
                h("input", {
                  type: "hidden",
                  name: props.name,
                  form: props.form,
                  value,
                  disabled: props.disabled,
                }),
              )
            : []),
        ],
      );
    };
  },
});
export const Popover = defineComponent({
  name: "HwPopover",
  inheritAttrs: false,
  props: {
    /** Accessible name of the panel; not required when aria-label or aria-labelledby names it. Prints nothing. */
    label: String,
    /** Text of the packaged trigger; required unless the `trigger` slot is given. */
    triggerLabel: String,
    triggerVariant: { type: String as PropType<ButtonVariant>, default: "secondary" },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
  },
  emits: { "update:open": (_value: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const id = `hw-${useId()}`;
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const model = useValue(
      () => props.open,
      props.defaultOpen,
      (v) => emit("update:open", v),
    );
    const close = (focus = false) => {
      model.set(false);
      if (focus) restoreFocus(trigger.value);
    };
    const outside = (event: Event) => {
      if (model.value.value && !root.value?.contains(event.target as Node))
        close();
    };
    watch(() => props.disabled, (disabled) => { if (disabled && model.value.value) close(); });
    onMounted(() =>
      root.value?.ownerDocument.addEventListener("pointerdown", outside),
    );
    onBeforeUnmount(() =>
      root.value?.ownerDocument.removeEventListener("pointerdown", outside),
    );
    expose({
      close: () => close(true),
      show: () => {
        if (!props.disabled) model.set(true);
      },
    });
    return () =>
      h(
        "div",
        mergeProps(withoutName(attrs), {
          ref: root,
          class: "hw-popover",
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === "Escape" && model.value.value && !event.defaultPrevented) {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            }
          },
          // Focus moving to an element outside closes the popover and stays where it went; a focusout
          // without a target (the window lost focus) leaves it open.
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null;
            if (model.value.value && next && !root.value?.contains(next)) close();
          },
        }),
        [
          h(
            "button",
            {
              ref: trigger,
              type: "button",
              class: "hw-button",
              "data-variant": props.triggerVariant,
              disabled: props.disabled,
              "aria-expanded": model.value.value,
              "aria-controls": id,
              onClick: () => model.set(!model.value.value),
            },
            slots.trigger?.() ?? needText("Popover", "triggerLabel", props.triggerLabel, "no trigger slot is given"),
          ),
          h(
            "div",
            {
              id,
              class: "hw-popover-panel",
              role: "region",
              "aria-label": rootLabel("Popover", props.label, attrs),
              "aria-labelledby": attrs["aria-labelledby"],
              hidden: !model.value.value,
            },
            slots.default?.({ close: () => close(true) }),
          ),
        ],
      );
  },
});
export interface MenuItem {
  value: string;
  label: string;
  disabled?: boolean;
  href?: string;
}
export const Menu = defineComponent({
  name: "HwMenu",
  inheritAttrs: false,
  props: {
    /** Accessible name of the menu; not required when aria-label or aria-labelledby names it. Not printed on the trigger. */
    label: String,
    /** Text of the packaged trigger; required unless the `trigger` slot is given. */
    triggerLabel: String,
    triggerVariant: { type: String as PropType<ButtonVariant>, default: "secondary" },
    items: { type: Array as PropType<readonly MenuItem[]>, required: true },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
  },
  emits: { "update:open": (_value: boolean) => true, action: (_value: string) => true },
  setup(props, { attrs, emit, slots }) {
    const id = `hw-${useId()}`;
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = useValue(() => props.open, props.defaultOpen, (v) => emit("update:open", v));
    const focused = ref(0);
    const items = new Map<number, HTMLElement>();
    const typeahead = createTypeahead();
    let openOnLast = false;
    const close = (focus = true) => {
      typeahead.reset();
      open.set(false);
      if (focus) restoreFocus(trigger.value);
    };
    const show = (last = false) => {
      if (props.disabled) return;
      openOnLast = last;
      open.set(true);
    };
    // Whenever the menu opens (a press, a key or the application's state) the first enabled item, or the
    // last one after ArrowUp, becomes active and takes focus after the render; nothing runs on the server.
    watch(() => open.value.value, (isOpen) => {
      if (!isOpen) { typeahead.reset(); return; }
      focused.value = getNextEnabledIndex(-1, openOnLast ? "End" : "Home", props.items);
      openOnLast = false;
      items.get(focused.value)?.focus();
    }, { flush: "post" });
    watch(() => props.disabled, (disabled) => { if (disabled && open.value.value) close(false); });
    const active = computed(() => props.items[focused.value] && !props.items[focused.value]!.disabled ? focused.value : getNextEnabledIndex(-1, "Home", props.items));
    const outside = (event: Event) => {
      if (open.value.value && !root.value?.contains(event.target as Node))
        close(false);
    };
    onMounted(() =>
      root.value?.ownerDocument.addEventListener("pointerdown", outside),
    );
    onBeforeUnmount(() => {
      typeahead.reset();
      root.value?.ownerDocument.removeEventListener("pointerdown", outside);
    });
    return () =>
      h(
        "div",
        mergeProps(withoutName(attrs), {
          ref: root,
          class: "hw-menu",
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null;
            if (open.value.value && next && !root.value?.contains(next))
              close(false);
          },
        }),
        [
          h(
            "button",
            {
              ref: trigger,
              class: "hw-button",
              type: "button",
              "data-variant": props.triggerVariant,
              disabled: props.disabled,
              "aria-haspopup": "menu",
              "aria-expanded": open.value.value,
              "aria-controls": id,
              onClick: () => (open.value.value ? close() : show()),
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  show(event.key === "ArrowUp");
                }
              },
            },
            slots.trigger?.() ?? needText("Menu", "triggerLabel", props.triggerLabel, "no trigger slot is given"),
          ),
          h(
            "div",
            {
              id,
              class: "hw-menu-content",
              role: "menu",
              "aria-label": rootLabel("Menu", props.label, attrs),
              "aria-labelledby": attrs["aria-labelledby"],
              hidden: !open.value.value,
              onKeydown: (event: KeyboardEvent) => {
                if (event.isComposing) return;
                if (
                  ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  focused.value = getNextEnabledIndex(
                    focused.value,
                    event.key,
                    props.items,
                    "ltr",
                    "vertical",
                  );
                  items.get(focused.value)?.focus();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  close();
                } else if (event.key === "Tab") {
                  close(false);
                } else if (isTypeaheadKey(event)) {
                  const labels = props.items.map((_, index) => items.get(index)?.textContent ?? "");
                  const next = typeahead.next(event.key, labels, focused.value, (index) => Boolean(props.items[index]?.disabled));
                  if (next >= 0) {
                    event.preventDefault();
                    focused.value = next;
                    items.get(next)?.focus();
                  }
                }
              },
            },
            props.items.map((item, index) =>
              h(
                item.href ? "a" : "button",
                {
                  key: item.value,
                  ref: (element: unknown) => {
                    if (element) items.set(index, element as HTMLElement);
                    else items.delete(index);
                  },
                  class: "hw-menu-item",
                  type: item.href ? undefined : "button",
                  href: item.disabled ? undefined : item.href,
                  role: "menuitem",
                  disabled: item.href ? undefined : item.disabled,
                  "aria-disabled": item.href && item.disabled ? "true" : undefined,
                  tabindex: active.value === index ? 0 : -1,
                  onFocus: () => {
                    focused.value = index;
                  },
                  onClick: (event: MouseEvent) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    emit("action", item.value);
                    close();
                  },
                },
                item.label,
              ),
            ),
          ),
        ],
      );
  },
});
export const Drawer = defineComponent({
  name: "HwDrawer",
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    title: { type: String, required: true },
    description: String,
    closeLabel: { type: String, required: true },
    side: {
      type: String as PropType<"start" | "end" | "bottom">,
      default: "end",
    },
    closeOnBackdrop: { type: Boolean, default: true },
  },
  emits: { "update:open": (_value: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const dialog = ref<{
      show: () => void;
      close: () => void;
      element: HTMLDialogElement;
    }>();
    expose({
      show: () => dialog.value?.show(),
      close: () => dialog.value?.close(),
      element: computed(() => dialog.value?.element),
    });
    return () =>
      h(
        Dialog,
        {
          ...attrs,
          ...props,
          closeLabel: needText("Drawer", "closeLabel", props.closeLabel) as string,
          ref: dialog,
          class: ["hw-drawer", attrs.class],
          "data-side": props.side,
          "onUpdate:open": (value: boolean) => emit("update:open", value),
        },
        slots,
      );
  },
});
export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  urgent?: boolean;
  dismissible?: boolean;
}
type ToastDismissHandler = (id: string) => void;
const dismissListener = [Function, Array] as PropType<ToastDismissHandler | ToastDismissHandler[]>;
function listens(handler: ToastDismissHandler | ToastDismissHandler[] | undefined) {
  return typeof handler === 'function' || !!handler?.length;
}
export const ToastRegion = defineComponent({
  name: 'HwToastRegion', inheritAttrs: false,
  props: {
    messages: {type: Array as PropType<readonly ToastMessage[]>, required: true},
    label: String,
    getDismissLabel: Function as PropType<(message: ToastMessage) => string>,
    variant: String as PropType<'default' | 'inline' | 'banner'>,
    position: String as PropType<'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'>,
    // A listener is also a rendering input: adding/removing it must update the action.
    onDismiss: dismissListener,
    onDismissOnce: dismissListener,
  },
  setup(props, {attrs, emit}) {
    const region = ref<HTMLElement>();
    const onceUsed = ref(false);
    const render = (urgent: boolean, banner: boolean) => props.messages
      .filter(message => Boolean(message.urgent) === urgent)
      .map(message => h('article', {key: message.id, class: 'hw-toast', 'data-hw-toast': message.id, 'data-tone': message.tone ?? 'info'}, [
        banner && h('span', {class: 'hw-toast-icon', 'aria-hidden': 'true'}),
        h('div', {class: 'hw-toast-content'}, [message.title && h('strong', message.title), h('p', message.message)]),
        message.dismissible !== false && (listens(props.onDismiss) || (!onceUsed.value && listens(props.onDismissOnce))) && h(Button, {
          type: 'button', variant: 'ghost', class: 'hw-toast-dismiss', 'data-hw-dismiss': '', 'aria-label': textOf('ToastRegion', 'getDismissLabel', props.getDismissLabel, [message], 'a message can be dismissed'),
          onClick: (event: MouseEvent) => {
            const notice = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-hw-toast]');
            const recover = region.value && notice ? prepareToastDismissFocus(region.value, notice) : undefined;
            try { emit('dismiss', message.id); } finally {
              if (listens(props.onDismissOnce)) onceUsed.value = true;
              if (recover) void nextTick(recover);
            }
          },
        }, () => h('span', { class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md', 'aria-hidden': 'true' })),
      ]));
    return () => {
      const variant = props.variant ?? attrs['data-variant'];
      return h('section', mergeProps(attrs, {ref: region, class: 'hw-toast-region', tabindex: attrs.tabindex ?? -1, 'aria-label': rootLabel('ToastRegion', props.label, attrs), 'data-variant': variant, 'data-position': props.position ?? attrs['data-position']}), [
        h('div', {role: 'status', 'aria-live': 'polite', 'aria-relevant': 'additions text', 'data-hw-live': 'polite'}, render(false, variant === 'banner')),
        h('div', {role: 'alert', 'aria-live': 'assertive', 'aria-relevant': 'additions text', 'data-hw-live': 'assertive'}, render(true, variant === 'banner')),
      ]);
    };
  },
});

export const Collapsible = defineComponent({
  name: "HwCollapsible",
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    modelValue: { type: Boolean, default: undefined },
    defaultValue: Boolean,
    disabled: Boolean,
  },
  emits: { "update:modelValue": (_value: boolean) => true },
  setup(props, { attrs, slots, emit }) {
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    return () =>
      h(
        "details",
        mergeProps(attrs, {
          class: "hw-collapsible",
          open: model.value.value,
          onToggle: (event: Event) => {
            const element = event.target as HTMLDetailsElement;
            if (element.open !== model.value.value) model.set(element.open);
          },
        }),
        [
          h(
            "summary",
            {
              "aria-disabled": props.disabled || undefined,
              onClick: (event: MouseEvent) => {
                if (props.disabled) event.preventDefault();
              },
            },
            props.label,
          ),
          h("div", {}, slots.default?.()),
        ],
      );
  },
});
export interface TreeNode {
  id: string;
  label: string;
  disabled?: boolean;
  children?: readonly TreeNode[];
}
export const TreeView = defineComponent({
  name: "HwTreeView",
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly TreeNode[]>, required: true },
    label: String,
    modelValue: String,
    defaultValue: { type: String, default: "" },
    expanded: Array as PropType<readonly string[]>,
    defaultExpanded: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    disabled: Boolean,
    getExpandLabel: { type: Function as PropType<(node: TreeNode) => string>, required: true },
    getCollapseLabel: { type: Function as PropType<(node: TreeNode) => string>, required: true },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:expanded": (_value: readonly string[]) => true,
  },
  setup(props, { attrs, emit }) {
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const expanded = useValue(
      () => props.expanded,
      props.defaultExpanded,
      (v) => emit("update:expanded", v),
    );
    const focused = ref("");
    const elements = new Map<string, HTMLElement>();
    const typeahead = createTypeahead();
    onBeforeUnmount(() => typeahead.reset());
    // Each tree item is named by its label span alone, so the toggle's name is not part of it.
    const base = `hw-${useId()}`;
    const labelId = (node: TreeNode) => `${base}-${encodeURIComponent(node.id)}`;
    type Visible = {
      node: TreeNode;
      depth: number;
      parent?: string;
      position: number;
      count: number;
    };
    const visible = computed(() => {
      const rows: Visible[] = [];
      const visit = (
        nodes: readonly TreeNode[],
        depth: number,
        parent?: string,
      ) =>
        nodes.forEach((node, index) => {
          rows.push({
            node,
            depth,
            parent,
            position: index + 1,
            count: nodes.length,
          });
          if (node.children && expanded.value.value.includes(node.id))
            visit(node.children, depth + 1, node.id);
        });
      visit(props.items, 1);
      return rows;
    });
    const focus = (id: string) => {
      focused.value = id;
      void nextTick(() => elements.get(id)?.focus());
    };
    const toggle = (id: string) =>
      expanded.set(
        expanded.value.value.includes(id)
          ? expanded.value.value.filter((value) => value !== id)
          : [...expanded.value.value, id],
      );
    return () =>
      h(
        "ul",
        mergeProps(attrs, {
          class: "hw-tree-view",
          role: "tree",
          "aria-label": rootLabel("TreeView", props.label, attrs),
          "aria-disabled": props.disabled || undefined,
        }),
        visible.value.map((row, index) => {
          const branch = Boolean(row.node.children?.length);
          const isOpen = expanded.value.value.includes(row.node.id);
          const active = visible.value.some(
            (item) => item.node.id === focused.value && !item.node.disabled,
          )
            ? focused.value
            : (visible.value.find(
                (item) =>
                  item.node.id === model.value.value && !item.node.disabled,
              )?.node.id ??
              visible.value.find((item) => !item.node.disabled)?.node.id);
          return h(
            "li",
            {
              ref: (element: unknown) => {
                if (element) elements.set(row.node.id, element as HTMLElement);
                else elements.delete(row.node.id);
              },
              key: row.node.id,
              role: "treeitem",
              class: "hw-tree-item",
              "aria-labelledby": labelId(row.node),
              "aria-level": row.depth,
              "aria-posinset": row.position,
              "aria-setsize": row.count,
              "aria-expanded": branch ? isOpen : undefined,
              "aria-selected": model.value.value === row.node.id,
              "aria-disabled": props.disabled || row.node.disabled || undefined,
              tabindex: !props.disabled && active === row.node.id ? 0 : -1,
              style: { "--hw-tree-depth": row.depth - 1 },
              onFocus: () => {
                focused.value = row.node.id;
              },
              onClick: () => {
                if (!props.disabled && !row.node.disabled) {
                  model.set(row.node.id);
                  focus(row.node.id);
                }
              },
              onKeydown: (event: KeyboardEvent) => {
                if (props.disabled || row.node.disabled || event.isComposing) return;
                const forward =
                  getDirection(event.currentTarget as Element) === "rtl"
                    ? "ArrowLeft"
                    : "ArrowRight";
                const back =
                  forward === "ArrowRight" ? "ArrowLeft" : "ArrowRight";
                if (
                  ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  const next = getNextEnabledIndex(
                    index,
                    event.key,
                    visible.value.map((item) => item.node),
                    "ltr",
                    "vertical",
                  );
                  if (next >= 0) focus(visible.value[next]!.node.id);
                } else if (event.key === forward && branch) {
                  event.preventDefault();
                  if (!isOpen) toggle(row.node.id);
                  else {
                    const child = row.node.children?.find(
                      (node) => !node.disabled,
                    );
                    if (child) focus(child.id);
                  }
                } else if (event.key === back) {
                  event.preventDefault();
                  if (branch && isOpen) toggle(row.node.id);
                  else if (row.parent) focus(row.parent);
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  model.set(row.node.id);
                } else if (isTypeaheadKey(event)) {
                  // Type-ahead over the visible (expanded) nodes only.
                  const labels = visible.value.map((item) => elements.get(item.node.id)?.lastElementChild?.textContent ?? "");
                  const next = typeahead.next(event.key, labels, index, (position) => Boolean(visible.value[position]!.node.disabled));
                  if (next >= 0) {
                    event.preventDefault();
                    focus(visible.value[next]!.node.id);
                  }
                }
              },
            },
            [
              branch &&
                h(
                  "button",
                  {
                    type: "button",
                    class: "hw-tree-toggle",
                    tabindex: -1,
                    disabled: props.disabled || row.node.disabled,
                    "aria-label": isOpen
                      ? textOf("TreeView", "getCollapseLabel", props.getCollapseLabel, [row.node])
                      : textOf("TreeView", "getExpandLabel", props.getExpandLabel, [row.node]),
                    onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      toggle(row.node.id);
                      focus(row.node.id);
                    },
                  },
                  h('span', { class: 'hw-icon', 'data-icon': isOpen ? 'minus-sign' : 'add-01', 'data-size': 'sm', 'aria-hidden': 'true' }),
                ),
              h("span", { id: labelId(row.node) }, row.node.label),
            ],
          );
        }),
      );
  },
});
export interface CarouselSlide {
  id: string;
  content?: VNodeChild;
}
export const Carousel = defineComponent({
  name: "HwCarousel",
  inheritAttrs: false,
  props: {
    slides: {
      type: Array as PropType<readonly CarouselSlide[]>,
      required: true,
    },
    label: String,
    modelValue: Number,
    defaultValue: { type: Number, default: 0 },
    previousLabel: { type: String, required: true },
    nextLabel: { type: String, required: true },
    showIndicators: { type: Boolean, default: true },
    indicatorsLabel: String,
    emptyLabel: { type: String, required: true },
    carouselDescription: String,
    slideDescription: String,
    getSlideLabel: { type: Function as PropType<(position: number, total: number) => string>, required: true },
    wrap: { type: Boolean, default: true },
  },
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { attrs, slots, emit }) {
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const slideLabel = (position: number, total: number) => textOf("Carousel", "getSlideLabel", props.getSlideLabel, [position, total]);
    return () => {
      const total = props.slides.length;
      const stored = model.value.value;
      const current = Math.max(0, Math.min(total - 1, Number.isFinite(stored) ? Math.floor(stored) : 0));
      const select = (requested: number) => {
        if (!total || !Number.isFinite(requested)) return;
        const rounded = Math.floor(requested);
        const next = props.wrap ? ((rounded % total) + total) % total : Math.max(0, Math.min(total - 1, rounded));
        if (next !== current) model.set(next);
      };
      return h(
        "section",
        mergeProps(attrs, {
          class: "hw-carousel",
          "data-hw-carousel-ready": "",
          style: { "--hw-carousel-index": current },
          role: "region",
          "aria-roledescription": optionalText(props.carouselDescription),
          "aria-label": rootLabel("Carousel", props.label, attrs),
        }),
        [
          h("div", { class: "hw-carousel-viewport hw-carousel-slides" }, [h("div", { class: "hw-carousel-track" }, props.slides.map((slide, index) =>
            h(
              "div",
              {
                key: slide.id,
                class: "hw-carousel-slide",
                role: "group",
                "aria-roledescription": optionalText(props.slideDescription),
                "aria-label": slideLabel(index + 1, total),
                hidden: index !== current,
                inert: index !== current ? true : undefined,
                "aria-hidden": index !== current ? "true" : undefined,
              },
              [slots[slide.id]?.() ?? slide.content],
            ),
          )), !total && h("p", {class: "hw-carousel-empty"}, needText("Carousel", "emptyLabel", props.emptyLabel))]),
          h("div", { class: "hw-carousel-controls" }, [
            props.showIndicators && total > 0 && h("div", {class: "hw-carousel-pagination", role: "group", "aria-label": needText("Carousel", "indicatorsLabel", props.indicatorsLabel, "showIndicators is on")}, props.slides.map((slide, index) => h("button", {class: "hw-carousel-dot", key: slide.id, type: "button", "aria-label": slideLabel(index + 1, total), "aria-current": index === current ? "true" : undefined, onClick: () => select(index)}))),
            h("div", {class: "hw-carousel-arrows"}, [
              h(Button, {class: "hw-carousel-arrow", variant: "secondary", type: "button", "data-hw-previous": "", "aria-label": needText("Carousel", "previousLabel", props.previousLabel), disabled: total < 2, "aria-disabled": total > 1 && !props.wrap && current === 0 ? "true" : undefined, onClick: () => select(current - 1)}),
              h(Button, {class: "hw-carousel-arrow", variant: "secondary", type: "button", "data-hw-next": "", "aria-label": needText("Carousel", "nextLabel", props.nextLabel), disabled: total < 2, "aria-disabled": total > 1 && !props.wrap && current === total - 1 ? "true" : undefined, onClick: () => select(current + 1)}),
            ]),
            h(
              "span",
              { class: "hw-carousel-status hw-sr-only", role: "status", "aria-live": "polite" },
              total ? slideLabel(current + 1, total) : needText("Carousel", "emptyLabel", props.emptyLabel),
            ),
          ]),
        ],
      );
    };
  },
});
