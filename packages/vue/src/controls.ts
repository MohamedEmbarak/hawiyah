import {
  computed,
  defineComponent,
  h,
  mergeProps,
  ref,
  watchEffect,
} from "vue";
import type { PropType } from "vue";
import { clampRange, filterOptions, isDisabled, normalizeDigits } from "@nasaq/core";
import type { Option } from "@nasaq/core";
import { Button, TextField, decorate } from "./forms.js";
import { decorationProps, useField, useFormReset, useValue } from "./shared.js";

const textProps = {
  ...decorationProps,
  modelValue: String,
  defaultValue: { type: String, default: "" },
  disabled: Boolean,
  readonly: Boolean,
} as const;
const numberProps = {
  ...decorationProps,
  modelValue: Number,
  defaultValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  disabled: Boolean,
  readonly: Boolean,
} as const;
const arrayProps = {
  ...decorationProps,
  modelValue: Array as PropType<readonly string[]>,
  defaultValue: {
    type: Array as PropType<readonly string[]>,
    default: () => [],
  },
  disabled: Boolean,
  readonly: Boolean,
} as const;
export const InputGroup = defineComponent({
  name: "NqInputGroup",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h("div", mergeProps(attrs, { class: "nq-input-group" }), [
        slots.prefix && h("span", { class: "nq-input-addon" }, slots.prefix()),
        slots.default?.(),
        slots.suffix && h("span", { class: "nq-input-addon" }, slots.suffix()),
      ]);
  },
});
function actionField(kind: "password" | "search") {
  return defineComponent({
    name: kind === "password" ? "NqPasswordField" : "NqSearchField",
    inheritAttrs: false,
    props: {
      ...textProps,
      showLabel: { type: String, default: "Show password" },
      hideLabel: { type: String, default: "Hide password" },
      toggleVariant: { type: String as PropType<'icon' | 'text'>, default: 'icon' },
      clearLabel: { type: String, default: "Clear search" },
    },
    emits: {
      "update:modelValue": (_value: string) => true,
      search: (_value: string) => true,
    },
    setup(props, { attrs, emit, expose }) {
      const field = useField(props, attrs);
      const element = ref<HTMLInputElement>();
      const visible = ref(false);
      const model = useValue(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit("update:modelValue", value),
      );
      useFormReset(element, () => { model.set(props.defaultValue); if (kind === 'password') visible.value = false; });
      expose({ element, focus: () => element.value?.focus() });
      return () =>
        decorate(
          props,
          field.id.value,
          h(
            "div",
            {
              class: [
                kind === 'password' ? "nq-password-control" : "nq-input-group",
                `nq-${kind === "password" ? "password-field" : "search-field"}`,
              ],
            },
            [
              h(
                "input",
                mergeProps(attrs, field.controlAttrs.value, {
                  ref: element,
                  class: "nq-input",
                  type:
                    kind === "password"
                      ? visible.value
                        ? "text"
                        : "password"
                      : "search",
                  value: model.value.value,
                  disabled: props.disabled,
                  readonly: props.readonly,
                  onInput: (event: Event) => {
                    if (!props.disabled && !props.readonly)
                      model.set((event.target as HTMLInputElement).value);
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    if (
                      kind === "search" &&
                      event.key === "Enter" &&
                      !event.isComposing
                    )
                      emit("search", model.value.value);
                  },
                }),
              ),
              kind === "password"
                ? h(
                    Button,
                    {
                      variant: "ghost",
                      class: "nq-password-toggle",
                      "data-toggle-variant": props.toggleVariant,
                      disabled: props.disabled,
                      "aria-label": visible.value
                        ? props.hideLabel
                        : props.showLabel,
                      "aria-pressed": visible.value,
                      "aria-controls": field.id.value,
                      onClick: () => {
                        if (element.value && !isDisabled(element.value)) visible.value = !visible.value;
                      },
                    },
                    () => props.toggleVariant === 'text' ? (visible.value ? props.hideLabel : props.showLabel) : h('span', { class: 'nq-password-icon', 'aria-hidden': 'true' }),
                  )
                : model.value.value &&
                  h(
                    Button,
                    {
                      variant: "ghost",
                      disabled: props.disabled || props.readonly,
                      "aria-label": props.clearLabel,
                      onClick: () => {
                        model.set("");
                        element.value?.focus();
                      },
                    },
                    () => props.clearLabel,
                  ),
            ],
          ),
        );
    },
  });
}
export const PasswordField = actionField("password");
export const SearchField = actionField("search");
export const NumberField = defineComponent({
  name: "NqNumberField",
  inheritAttrs: false,
  props: {
    ...decorationProps,
    modelValue: [Number, String] as PropType<number | "">,
    defaultValue: {
      type: [Number, String] as PropType<number | "">,
      default: "",
    },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: { "update:modelValue": (_value: number | "") => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(props.defaultValue));
    expose({ element, focus: () => element.value?.focus() });
    return () =>
      decorate(
        props,
        field.id.value,
        h(
          "input",
          mergeProps(attrs, field.controlAttrs.value, {
            ref: element,
            class: "nq-input nq-number-field",
            type: "number",
            disabled: props.disabled,
            readonly: props.readonly,
            value: model.value.value,
            onInput: (event: Event) => {
              if (props.disabled || props.readonly) return;
              const value = (event.target as HTMLInputElement).valueAsNumber;
              model.set(Number.isNaN(value) ? "" : value);
            },
          }),
        ),
      );
  },
});
export const Slider = defineComponent({
  name: "NqSlider",
  inheritAttrs: false,
  props: numberProps,
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(props.defaultValue));
    expose({ element, focus: () => element.value?.focus() });
    return () =>
      decorate(
        props,
        field.id.value,
        h(
          "input",
          mergeProps(attrs, field.controlAttrs.value, {
            ref: element,
            class: "nq-slider",
            type: "range",
            min: props.min,
            max: props.max,
            step: props.step,
            value: model.value.value,
            disabled: props.disabled,
            "aria-readonly": props.readonly || undefined,
            onPointerdown: (event: PointerEvent) => {
              if (props.readonly) event.preventDefault();
            },
            onKeydown: (event: KeyboardEvent) => {
              if (props.readonly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.preventDefault();
            },
            onInput: (event: Event) => {
              const input = event.target as HTMLInputElement;
              if (props.readonly || isDisabled(input)) {
                input.value = String(model.value.value);
                return;
              }
              model.set(input.valueAsNumber);
            },
          }),
        ),
      );
  },
});
export const RangeSlider = defineComponent({
  name: "NqRangeSlider",
  inheritAttrs: false,
  props: {
    ...numberProps,
    modelValue: Array as unknown as PropType<readonly [number, number]>,
    defaultValue: {
      type: Array as unknown as PropType<readonly [number, number]>,
      default: () => [0, 100],
    },
    lowerLabel: { type: String, default: "Minimum" },
    upperLabel: { type: String, default: "Maximum" },
    lowerName: String,
    upperName: String,
  },
  emits: { "update:modelValue": (_value: readonly [number, number]) => true },
  setup(props, { attrs, emit }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(props.defaultValue));
    return () => {
      const values = clampRange(
        [...model.value.value],
        props.min,
        props.max,
        "lower",
      );
      return h(
        "fieldset",
        mergeProps(attrs, {
          class: "nq-field nq-range-slider",
          disabled: props.disabled,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
        }),
        [
          props.label && h("legend", { class: "nq-label" }, props.label),
          ...(["lower", "upper"] as const).map((side, index) =>
            h("label", { class: "nq-label" }, [
              side === "lower" ? props.lowerLabel : props.upperLabel,
              h("input", {
                ref: index === 0 ? element : undefined,
                type: "range",
                class: "nq-slider",
                name: side === "lower" ? props.lowerName : props.upperName,
                form: attrs.form,
                min: index === 0 ? props.min : values[0],
                max: index === 0 ? values[1] : props.max,
                step: props.step,
                value: values[index],
                disabled: props.disabled,
                "aria-readonly": props.readonly || undefined,
                onPointerdown: (event: PointerEvent) => {
                  if (props.readonly) event.preventDefault();
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (props.readonly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key))
                    event.preventDefault();
                },
                onInput: (event: Event) => {
                  const input = event.target as HTMLInputElement;
                  if (props.readonly || isDisabled(input)) {
                    input.value = String(values[index]);
                    return;
                  }
                  const next: [number, number] = [values[0], values[1]];
                  next[index] = input.valueAsNumber;
                  model.set(clampRange(next, props.min, props.max, side));
                },
              }),
            ]),
          ),
          props.hint &&
            h(
              "span",
              { id: `${field.id.value}-hint`, class: "nq-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "span",
              { id: `${field.id.value}-error`, class: "nq-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
export const Rating = defineComponent({
  name: "NqRating",
  inheritAttrs: false,
  props: {
    ...numberProps,
    max: { type: Number, default: 5 },
    optionLabel: {
      type: Function as PropType<(value: number, max: number) => string>,
      default: (value: number, max: number) => `${value} of ${max}`,
    },
  },
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { attrs, emit }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(props.defaultValue));
    return () => {
      const count = Math.max(1, Math.min(10, Math.floor(props.max) || 5));
      return h(
        "fieldset",
        mergeProps(attrs, {
          class: "nq-field nq-rating",
          disabled: props.disabled,
          "data-nq-readonly": props.readonly || undefined,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
        }),
        [
          props.label && h("legend", { class: "nq-label" }, props.label),
          ...Array.from({ length: count }, (_, index) =>
            h(
              "label",
              {
                "data-selected": index < model.value.value ? "true" : undefined,
              },
              [
                h("input", {
                  ref: index === 0 ? element : undefined,
                  type: "radio",
                  name: attrs.name ?? `${field.id.value}-rating`,
                  form: attrs.form,
                  value: index + 1,
                  checked: model.value.value === index + 1,
                  required: props.required,
                  disabled: props.disabled,
                  "aria-label": props.optionLabel(index + 1, count),
                  "aria-disabled": props.readonly || undefined,
                  onClick: (event: MouseEvent) => {
                    if (props.readonly) {
                      event.preventDefault();
                      // Radios activate before click; restore the whole native group when cancellation rolls back only the target.
                      element.value?.closest('fieldset')?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => {
                        input.checked = Number(input.value) === model.value.value;
                      });
                    }
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    if (props.readonly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
                  },
                  onChange: () => {
                    if (!props.disabled && !props.readonly)
                      model.set(index + 1);
                  },
                }),
                h("span", { "aria-hidden": "true" }, "★"),
              ],
            ),
          ),
          props.hint &&
            h(
              "span",
              { id: `${field.id.value}-hint`, class: "nq-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "span",
              { id: `${field.id.value}-error`, class: "nq-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
export const PinInput = defineComponent({
  name: "NqPinInput",
  inheritAttrs: false,
  props: { ...textProps, length: { type: Number, default: 6 } },
  emits: {
    "update:modelValue": (_value: string) => true,
    complete: (_value: string) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const normalizedLength = () => Math.max(1, Math.floor(props.length) || 6);
    const normalize = (value: string) => normalizeDigits(value).replace(/\D/g, '').slice(0, normalizedLength());
    const model = useValue(
      () => props.modelValue,
      normalize(props.defaultValue),
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(normalize(props.defaultValue)));
    expose({ element, focus: () => element.value?.focus() });
    return () => {
      const length = normalizedLength();
      return decorate(
        props,
        field.id.value,
        h(
          "input",
          mergeProps(attrs, field.controlAttrs.value, {
            ref: element,
            class: "nq-input nq-pin-input",
            type: "text",
            autocomplete: "one-time-code",
            inputmode: "numeric",
            pattern: `[0-9]{${length}}`,
            maxlength: length,
            dir: "ltr",
            value: normalize(model.value.value),
            disabled: props.disabled,
            readonly: props.readonly,
            onInput: (event: Event) => {
              if (props.disabled || props.readonly) return;
              const input = event.target as HTMLInputElement;
              const value = normalize(input.value);
              input.value = value;
              model.set(value);
              if (value.length === length) emit("complete", value);
            },
          }),
        ),
      );
    };
  },
});
export const TagInput = defineComponent({
  name: "NqTagInput",
  inheritAttrs: false,
  props: {
    ...arrayProps,
    requiredMessage: { type: String, default: "Add at least one item." },
    removeLabel: {
      type: Function as PropType<(value: string) => string>,
      default: (value: string) => `Remove ${value}`,
    },
  },
  emits: { "update:modelValue": (_value: readonly string[]) => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const query = ref("");
    let composing = false;
    const blocked = () => props.disabled || props.readonly || !!element.value && isDisabled(element.value);
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => {
      query.value = "";
      model.set(props.defaultValue);
    });
    watchEffect(() =>
      element.value?.setCustomValidity(
        field.controlAttrs.value.required && !model.value.value.length
          ? props.requiredMessage
          : "",
      ),
    );
    expose({ element, focus: () => element.value?.focus() });
    const remove = (value: string) => {
      if (!blocked()) { model.set(model.value.value.filter((item) => item !== value)); element.value?.focus(); }
    };
    return () => {
      const { name, form, ...rest } = attrs;
      return decorate(
        props,
        field.id.value,
        h("div", { class: "nq-tag-input" }, [
          h(
            "ul",
            {},
            model.value.value.map((value) =>
              h("li", { class: "nq-chip", key: value }, [
                value,
                h(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    disabled: props.disabled || props.readonly,
                    "aria-label": props.removeLabel(value),
                    onClick: () => remove(value),
                  },
                  () => "×",
                ),
              ]),
            ),
          ),
          h(
            "input",
            mergeProps(rest, field.controlAttrs.value, {
              ref: element,
              form,
              class: "nq-input",
              value: query.value,
              required: undefined,
              "aria-required": field.controlAttrs.value.required || undefined,
              disabled: props.disabled,
              readonly: props.readonly,
              onInput: (event: Event) => {
                query.value = (event.target as HTMLInputElement).value;
              },
              onCompositionstart: () => { composing = true; },
              onCompositionend: () => { composing = false; },
              onKeydown: (event: KeyboardEvent) => {
                if (event.defaultPrevented || blocked() || composing || event.isComposing || event.ctrlKey || event.altKey || event.metaKey)
                  return;
                if ((event.key === "Enter" || event.key === ",") && query.value.trim()) {
                  event.preventDefault();
                  const value = query.value.trim();
                  if (value && !model.value.value.includes(value))
                    model.set([...model.value.value, value]);
                  query.value = "";
                } else if (event.key === "Backspace" && !query.value) {
                  const last = model.value.value.at(-1);
                  if (last) { event.preventDefault(); remove(last); }
                }
              },
            }),
          ),
          ...model.value.value.map((value) =>
            h("input", {
              type: "hidden",
              name,
              form,
              value,
              disabled: props.disabled,
            }),
          ),
        ]),
      );
    };
  },
});
export const MultiSelect = defineComponent({
  name: "NqMultiSelect",
  inheritAttrs: false,
  props: {
    ...arrayProps,
    options: { type: Array as PropType<readonly Option[]>, required: true },
    searchLabel: { type: String, default: "Search options" },
    emptyMessage: { type: String, default: "No options found" },
    requiredMessage: { type: String, default: "Choose at least one option." },
  },
  emits: { "update:modelValue": (_value: readonly string[]) => true },
  setup(props, { attrs, emit }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const query = ref("");
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    // Keep caller state intact; only known, enabled choices count or submit.
    const selected = computed(() => model.value.value.filter(value => props.options.some(option => option.value === value && !option.disabled)));
    useFormReset(element, () => {
      query.value = "";
      model.set(props.defaultValue);
    });
    watchEffect(() =>
      element.value?.setCustomValidity(
        field.controlAttrs.value.required && !props.disabled && !selected.value.length
          ? props.requiredMessage
          : "",
      ),
    );
    return () => {
      const options = filterOptions(props.options, query.value);
      return h(
        "fieldset",
        {
          class: "nq-field nq-multi-select",
          disabled: props.disabled,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
        },
        [
          props.label && h("legend", { class: "nq-label" }, props.label),
          h(
            "input",
            mergeProps(attrs, {
              ref: element,
              id: field.id.value,
              name: undefined,
              type: "search",
              class: "nq-input",
              "aria-label": props.searchLabel,
              "aria-required": field.controlAttrs.value.required || undefined,
              "aria-describedby": field.controlAttrs.value["aria-describedby"],
              "aria-invalid": field.controlAttrs.value["aria-invalid"],
              disabled: props.disabled,
              value: query.value,
              onInput: (event: Event) => {
                query.value = (event.target as HTMLInputElement).value;
              },
            }),
          ),
          h(
            "div",
            { class: "nq-multi-select-options" },
            options.map((option) =>
              h("label", { class: "nq-choice", key: option.value }, [
                h("input", {
                  type: "checkbox",
                  class: "nq-checkbox",
                  checked: selected.value.includes(option.value),
                  disabled: props.disabled || props.readonly || option.disabled,
                  onChange: (event: Event) => {
                    if (props.disabled || props.readonly || option.disabled)
                      return;
                    model.set(
                      (event.target as HTMLInputElement).checked
                        ? [...selected.value, option.value]
                        : selected.value.filter(
                            (value) => value !== option.value,
                          ),
                    );
                  },
                }),
                option.label,
              ]),
            ),
          ),
          !options.length && h("p", { role: "status" }, props.emptyMessage),
          ...selected.value.map((value) =>
            h("input", {
              type: "hidden",
              name: attrs.name,
              form: attrs.form,
              value,
              disabled: props.disabled,
            }),
          ),
          props.hint &&
            h(
              "span",
              { id: `${field.id.value}-hint`, class: "nq-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "span",
              { id: `${field.id.value}-error`, class: "nq-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
export const FileDropzone = defineComponent({
  name: "NqFileDropzone",
  inheritAttrs: false,
  props: {
    ...decorationProps,
    disabled: Boolean,
    readonly: Boolean,
    accept: String,
    multiple: Boolean,
    maxSize: Number,
    dropLabel: { type: String, default: "Choose files or drop them here" },
  },
  emits: {
    "update:files": (_files: File[]) => true,
    reject: (_files: File[]) => true,
  },
  setup(props, { attrs, emit, slots, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const dragging = ref(false);
    const names = ref<string[]>([]);
    useFormReset(element, () => {
      names.value = [];
      emit("update:files", []);
    });
    expose({ element, focus: () => element.value?.focus() });
    const accepted = (file: File) => {
      if (props.maxSize && file.size > props.maxSize) return false;
      return (
        !props.accept ||
        props.accept.split(",").some((rule) => {
          rule = rule.trim().toLowerCase();
          return rule.startsWith(".")
            ? file.name.toLowerCase().endsWith(rule)
            : rule.endsWith("/*")
              ? file.type.startsWith(rule.slice(0, -1))
              : file.type === rule;
        })
      );
    };
    const unavailable = () => props.disabled || props.readonly || !element.value || isDisabled(element.value);
    const select = (list: FileList | null, drop = false) => {
      if (unavailable() || !list) return;
      const files = Array.from(list);
      if (
        files.some((file) => !accepted(file)) ||
        (!props.multiple && files.length > 1)
      ) {
        if (element.value) element.value.value = "";
        names.value = [];
        emit("update:files", []);
        emit("reject", files);
        return;
      }
      if (drop && element.value) element.value.files = list;
      names.value = files.map((file) => file.name);
      emit("update:files", files);
    };
    return () =>
      decorate(
        props,
        field.id.value,
        h(
          "div",
          {
            class: "nq-file-dropzone",
            "data-dragging": dragging.value ? "true" : undefined,
            onDragover: (event: DragEvent) => {
              event.preventDefault();
              if (!unavailable()) dragging.value = true;
            },
            onDragleave: () => {
              dragging.value = false;
            },
            onDrop: (event: DragEvent) => {
              event.preventDefault();
              dragging.value = false;
              select(event.dataTransfer?.files ?? null, true);
            },
          },
          [
            h("p", {}, props.dropLabel),
            h(
              "input",
              mergeProps(attrs, field.controlAttrs.value, {
                ref: element,
                class: "nq-input",
                type: "file",
                accept: props.accept,
                multiple: props.multiple,
                disabled: props.disabled,
                "aria-readonly": props.readonly || undefined,
                onClick: (event: MouseEvent) => {
                  if (props.readonly) event.preventDefault();
                },
                onChange: (event: Event) =>
                  select((event.target as HTMLInputElement).files),
              }),
            ),
            h("p", { role: "status" }, names.value.join(", ")),
            slots.default?.(),
          ],
        ),
      );
  },
});
