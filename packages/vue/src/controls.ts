import {
  computed,
  defineComponent,
  h,
  mergeProps,
  nextTick,
  ref,
  watch,
  watchEffect,
} from "vue";
import type { PropType } from "vue";
import { clampRange, evaluateFileSelection, filterOptions, isDisabled, isFileDrag, normalizePinInput, normalizeRatingMax, normalizeRatingValue, prepareRemovalFocus } from "@hawiyah/core";
import type { Option } from "@hawiyah/core";
import { Button, TextField, decorate } from "./forms.js";
import { decorationProps, joinIds, needText, optionalText, requiredMarker, textOf, useField, useFormReset, useValue, validity } from "./shared.js";

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
  /** No declared default: the empty value is the component's own (Slider (min + max) / 2). */
  defaultValue: { type: Number, default: undefined },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  disabled: Boolean,
  readonly: Boolean,
  /** Text of a value for assistive technology (aria-valuetext) and for the shown value; no adapter formats numbers itself. */
  formatValue: Function as PropType<(value: number) => string>,
} as const;
const { formatValue: _ratingHasNoFormat, ...ratingNumberProps } = numberProps;
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
  name: "HwInputGroup",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h("div", mergeProps(attrs, { class: "hw-input-group" }), [
        slots.prefix && h("span", { class: "hw-input-addon" }, slots.prefix()),
        slots.default?.(),
        slots.suffix && h("span", { class: "hw-input-addon" }, slots.suffix()),
      ]);
  },
});
export const PasswordField = defineComponent({
  name: "HwPasswordField",
  inheritAttrs: false,
  props: {
    ...textProps,
    showLabel: { type: String, required: true },
    hideLabel: { type: String, required: true },
    toggleVariant: { type: String as PropType<'icon' | 'text'>, default: 'icon' },
    /** Controlled visibility when not undefined (v-model:visible); `defaultVisible` is the uncontrolled start. */
    visible: { type: Boolean, default: undefined },
    defaultVisible: Boolean,
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:visible": (_visible: boolean) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const shown = useValue(() => props.visible, props.defaultVisible, (value) => emit("update:visible", value));
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit("update:modelValue", value),
    );
    useFormReset(element, () => { model.set(props.defaultValue); shown.set(false); }, () => {
      if (element.value) { element.value.value = model.value.value; element.value.type = shown.value.value ? "text" : "password"; }
    });
    expose({ element, focus: () => element.value?.focus() });
    return () =>
      decorate(
        props,
        field.id.value,
        h(
          "div",
          {
            class: ["hw-password-control", "hw-password-field"],
          },
          [
            h(
              "input",
              mergeProps(attrs, field.controlAttrs.value, {
                ref: element,
                class: "hw-input",
                type: shown.value.value ? "text" : "password",
                value: model.value.value,
                disabled: props.disabled,
                readonly: props.readonly,
                onInput: (event: Event) => {
                  if (!props.disabled && !props.readonly)
                    model.set((event.target as HTMLInputElement).value);
                },
              }),
            ),
            h(
                  Button,
                  {
                    variant: "ghost",
                    class: "hw-password-toggle",
                    "data-toggle-variant": props.toggleVariant,
                    disabled: props.disabled,
                    "aria-label": shown.value.value
                      ? needText("PasswordField", "hideLabel", props.hideLabel)
                      : needText("PasswordField", "showLabel", props.showLabel),
                    "aria-pressed": shown.value.value,
                    "aria-controls": field.id.value,
                    onClick: () => {
                      if (element.value && !isDisabled(element.value)) shown.set(!shown.value.value);
                    },
                  },
                  () => props.toggleVariant === 'text' ? (shown.value.value ? optionalText(props.hideLabel) : optionalText(props.showLabel)) : h('span', { class: 'hw-password-icon', 'aria-hidden': 'true' }),
                )
          ],
        ),
      );
  },
});
export {SearchField} from './search-field.js';
export const NumberField = defineComponent({
  name: "HwNumberField",
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
    useFormReset(element, () => model.set(props.defaultValue), () => {
      if (element.value) element.value.value = String(model.value.value);
    });
    expose({ element, focus: () => element.value?.focus() });
    return () =>
      decorate(
        props,
        field.id.value,
        h(
          "input",
          mergeProps(attrs, field.controlAttrs.value, {
            ref: element,
            class: "hw-input hw-number-field",
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
  name: "HwSlider",
  inheritAttrs: false,
  props: { ...numberProps, showValue: Boolean },
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    // Empty value: the midpoint, as a native range input without a value.
    const target = () => props.defaultValue ?? (props.min + props.max) / 2;
    const model = useValue(
      () => props.modelValue,
      target(),
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(target()), () => {
      if (element.value) element.value.value = String(model.value.value);
    });
    expose({ element, focus: () => element.value?.focus() });
    return () => {
      const value = model.value.value;
      const text = props.formatValue ? props.formatValue(value) : undefined;
      return decorate(
        props,
        field.id.value,
        [h(
          "input",
          mergeProps(attrs, field.controlAttrs.value, {
            ref: element,
            class: "hw-slider",
            type: "range",
            min: props.min,
            max: props.max,
            step: props.step,
            value,
            // A range input always has a value: `required` shows the marker only.
            required: undefined,
            "aria-valuetext": text ?? attrs["aria-valuetext"],
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
        ), props.showValue && h("output", { class: "hw-slider-value", for: field.id.value }, text ?? String(value))],
      );
    };
  },
});
export const RangeSlider = defineComponent({
  name: "HwRangeSlider",
  inheritAttrs: false,
  props: {
    ...numberProps,
    modelValue: Array as unknown as PropType<readonly [number, number]>,
    /** No declared default: the empty value is [min, max]. */
    defaultValue: {
      type: Array as unknown as PropType<readonly [number, number]>,
      default: undefined,
    },
    lowerLabel: { type: String, required: true },
    upperLabel: { type: String, required: true },
    /** Visible text of the whole range; without it no output is rendered. */
    getRangeLabel: Function as PropType<(lower: number, upper: number) => string>,
    name: String,
    lowerName: String,
    upperName: String,
    form: String,
  },
  emits: { "update:modelValue": (_value: readonly [number, number]) => true },
  setup(props, { attrs, emit }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const upper = ref<HTMLInputElement>();
    const target = (): readonly [number, number] => props.defaultValue ?? [props.min, props.max];
    const model = useValue(
      () => props.modelValue,
      target(),
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => model.set(target()), () => {
      const lower = element.value, high = upper.value;
      if (!lower || !high) return;
      const values = clampRange([...model.value.value], props.min, props.max, "lower");
      // Widen the bounds first so that neither thumb is clamped by the other's stale value.
      lower.max = String(props.max); high.min = String(props.min);
      lower.value = String(values[0]); high.value = String(values[1]);
      lower.max = String(values[1]); high.min = String(values[0]);
    });
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
          class: "hw-field hw-range-slider",
          disabled: props.disabled,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
          "aria-invalid": field.controlAttrs.value["aria-invalid"],
        }),
        [
          props.label && h("legend", { class: "hw-label" }, [props.label, props.required && requiredMarker()]),
          ...(["lower", "upper"] as const).map((side, index) =>
            h("label", { class: "hw-label" }, [
              side === "lower" ? needText("RangeSlider", "lowerLabel", props.lowerLabel) : needText("RangeSlider", "upperLabel", props.upperLabel),
              h("input", {
                ref: index === 0 ? element : upper,
                id: `${field.id.value}-${side}`,
                type: "range",
                class: "hw-slider",
                name: side === "lower" ? props.lowerName ?? props.name : props.upperName ?? props.name,
                form: props.form,
                "aria-valuetext": props.formatValue?.(values[index]!),
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
          props.getRangeLabel &&
            h("output", { class: "hw-range-slider-value", for: `${field.id.value}-lower ${field.id.value}-upper` }, props.getRangeLabel(values[0], values[1])),
          props.hint &&
            h(
              "p",
              { id: `${field.id.value}-hint`, class: "hw-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "p",
              { id: `${field.id.value}-error`, class: "hw-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
export const Rating = defineComponent({
  name: "HwRating",
  inheritAttrs: false,
  props: {
    ...ratingNumberProps,
    defaultValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    getRatingLabel: { type: Function as PropType<(value: number, max: number) => string>, required: true },
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
    useFormReset(element, () => model.set(props.defaultValue), () => {
      const current = Math.floor(normalizeRatingValue(model.value.value, normalizeRatingMax(props.max)));
      element.value?.closest("fieldset")?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => {
        input.checked = Number(input.value) === current;
      });
    });
    return () => {
      const count = normalizeRatingMax(props.max);
      const current = Math.floor(normalizeRatingValue(model.value.value, count));
      return h(
        "fieldset",
        mergeProps(attrs, {
          class: "hw-field hw-rating",
          disabled: props.disabled,
          "data-hw-readonly": props.readonly || undefined,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
          "aria-invalid": props.error ? true : undefined,
        }),
        [
          props.label && h("legend", { class: "hw-label" }, [props.label, props.required && requiredMarker()]),
          ...Array.from({ length: count }, (_, index) =>
            h(
              "label",
              {
                "data-selected": index < current ? "true" : undefined,
              },
              [
                h("input", {
                  ref: index === 0 ? element : undefined,
                  type: "radio",
                  name: attrs.name ?? `${field.id.value}-rating`,
                  form: attrs.form,
                  value: index + 1,
                  checked: current === index + 1,
                  required: props.required,
                  disabled: props.disabled,
                  "aria-label": textOf("Rating", "getRatingLabel", props.getRatingLabel, [index + 1, count]),
                  "aria-disabled": props.readonly || undefined,
                  onClick: (event: MouseEvent) => {
                    if (props.readonly) {
                      event.preventDefault();
                      // Radios activate before click; restore the whole native group when cancellation rolls back only the target.
                      element.value?.closest('fieldset')?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => {
                        input.checked = Number(input.value) === current;
                      });
                    }
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    if (props.readonly && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
                  },
                  onChange: (event: Event) => {
                    if (!props.readonly && !isDisabled(event.currentTarget as HTMLInputElement))
                      model.set(index + 1);
                  },
                }),
                h("span", { "aria-hidden": "true" }, "★"),
              ],
            ),
          ),
          props.hint &&
            h(
              "p",
              { id: `${field.id.value}-hint`, class: "hw-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "p",
              { id: `${field.id.value}-error`, class: "hw-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
/** Read-only aggregate score; Rating remains an integer radio input. */
export const RatingDisplay = defineComponent({
  name: 'HwRatingDisplay', inheritAttrs: false,
  props: {
    value: {type: Number, default: 0},
    max: {type: Number, default: 5}, showValue: {type: Boolean, default: true},
    getValueLabel: Function as PropType<(value: number, max: number) => string>,
  },
  setup(props, {attrs}) {
    return () => {
      const total = normalizeRatingMax(props.max), score = normalizeRatingValue(props.value, total);
      return h('div', mergeProps(attrs, {class: 'hw-rating-display', role: 'img', 'aria-label': optionalText(attrs['aria-label']) ?? (optionalText(attrs['aria-labelledby']) ? undefined : textOf('RatingDisplay', 'getValueLabel', props.getValueLabel, [score, total]))}), [
        h('span', {class: 'hw-rating-stars', 'aria-hidden': 'true'}, Array.from({length: total}, (_, index) => h('span', {class: 'hw-rating-star', key: index}, ['★', h('span', {class: 'hw-rating-fill', style: {'--hw-rating-fill': `${Math.min(1, Math.max(0, score - index)) * 100}%`}})]))),
        props.showValue && h('span', {class: 'hw-rating-score', 'aria-hidden': 'true'}, `${score}/${total}`),
      ]);
    };
  },
});
export const PinInput = defineComponent({
  name: "HwPinInput",
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
    const normalize = (value: string) => normalizePinInput(value, normalizedLength());
    // aria-invalid: focus left an incomplete code, or a submission failed on the input.
    const incomplete = ref(false);
    const failed = ref(false);
    const model = useValue(
      () => props.modelValue,
      normalize(props.defaultValue),
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => { incomplete.value = false; failed.value = false; model.set(normalize(props.defaultValue)); }, () => {
      if (element.value) element.value.value = normalize(model.value.value);
    });
    watch(() => model.value.value, () => {
      const code = normalize(model.value.value);
      if (!code || code.length === normalizedLength()) incomplete.value = false;
      if (failed.value && element.value?.validity.valid) failed.value = false;
    }, { flush: "post" });
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
            class: "hw-input hw-pin-input",
            type: "text",
            autocomplete: "one-time-code",
            inputmode: "numeric",
            pattern: `[0-9]{${length}}`,
            dir: "ltr",
            value: normalize(model.value.value),
            disabled: props.disabled,
            readonly: props.readonly,
            "aria-invalid": incomplete.value || failed.value ? true : field.controlAttrs.value["aria-invalid"],
            onInput: (event: Event) => {
              if (props.disabled || props.readonly) return;
              const input = event.target as HTMLInputElement;
              const previous = normalize(model.value.value);
              // Normalise first, then limit: separators in a pasted code cost no digit.
              const value = normalizePinInput(input.value, length, previous, (event as InputEvent).inputType);
              input.value = value;
              if (value === previous) return;
              model.set(value);
              if (value.length === length) emit("complete", value);
            },
            onBlur: () => {
              const code = normalize(model.value.value);
              incomplete.value = code.length > 0 && code.length < length;
            },
            onInvalid: () => { failed.value = true; },
          }),
        ),
      );
    };
  },
});
export const TagInput = defineComponent({
  name: "HwTagInput",
  inheritAttrs: false,
  props: {
    ...arrayProps,
    requiredMessage: String,
    getRemoveLabel: { type: Function as PropType<(tag: string) => string>, required: true },
  },
  emits: { "update:modelValue": (_value: readonly string[]) => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const box = ref<HTMLElement>();
    const query = ref("");
    // A submission failed on the text input; cleared once the validity is valid again or by a reset.
    const failed = ref(false);
    let composing = false;
    const blocked = () => props.disabled || props.readonly || !!element.value && isDisabled(element.value);
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    useFormReset(element, () => {
      query.value = "";
      failed.value = false;
      model.set(props.defaultValue);
    }, () => {
      if (element.value) element.value.value = "";
    });
    watchEffect(() => {
      element.value?.setCustomValidity(
        validity("TagInput", "requiredMessage", Boolean(field.controlAttrs.value.required && !model.value.value.length), props.requiredMessage, "required is set"),
      );
      if (failed.value && element.value?.validity.valid) failed.value = false;
    }, { flush: "post" });
    expose({ element, focus: () => element.value?.focus() });
    const remove = (value: string) => {
      if (!blocked()) model.set(model.value.value.filter((item) => item !== value));
    };
    return () => {
      const { name, form, ...rest } = attrs;
      return decorate(
        props,
        field.id.value,
        h("div", { class: "hw-tag-input", ref: box }, [
          h(
            "ul",
            { role: "list" },
            model.value.value.map((value) =>
              h("li", { class: "hw-chip", key: value }, [
                value,
                h(
                  "button",
                  {
                    type: "button",
                    disabled: props.disabled || props.readonly,
                    "aria-label": textOf("TagInput", "getRemoveLabel", props.getRemoveLabel, [value]),
                    onClick: (event: MouseEvent) => {
                      if (blocked()) return;
                      // Focus moves to the remove button now at the same place, else the previous one, else the input.
                      const restore = box.value ? prepareRemovalFocus(box.value, event.currentTarget as HTMLElement, { item: ".hw-chip", control: "button", fallback: element.value }) : undefined;
                      remove(value);
                      void nextTick(() => restore?.());
                    },
                  },
                  h('span', { class: 'hw-icon', 'data-icon': 'cancel-01', 'data-size': 'md', 'aria-hidden': 'true' }),
                ),
                h("input", {
                  type: "hidden",
                  name,
                  form,
                  value,
                  disabled: props.disabled,
                }),
              ]),
            ),
          ),
          h(
            "input",
            mergeProps(rest, field.controlAttrs.value, {
              ref: element,
              form,
              type: "text",
              class: "hw-input",
              value: query.value,
              required: undefined,
              "aria-required": field.controlAttrs.value.required || undefined,
              "aria-invalid": failed.value ? true : field.controlAttrs.value["aria-invalid"],
              disabled: props.disabled,
              readonly: props.readonly,
              onInvalid: () => { failed.value = true; },
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
                  // Focus stays in the text input.
                  const last = model.value.value.at(-1);
                  if (last) { event.preventDefault(); remove(last); }
                }
              },
            }),
          ),
        ]),
      );
    };
  },
});
export const MultiSelect = defineComponent({
  name: "HwMultiSelect",
  inheritAttrs: false,
  props: {
    ...arrayProps,
    options: { type: Array as PropType<readonly Option[]>, required: true },
    /** Visible label of the filter input. */
    searchLabel: { type: String, required: true },
    emptyMessage: { type: String, required: true },
    /** Announced politely after the reader filters: the number of options shown. */
    getResultsMessage: { type: Function as PropType<(count: number) => string>, required: true },
    /** Optional status with the number of selected options, present from the first render. */
    getSelectedMessage: Function as PropType<(count: number) => string>,
    requiredMessage: String,
  },
  emits: { "update:modelValue": (_value: readonly string[]) => true },
  setup(props, { attrs, emit }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const query = ref("");
    // The results status stays empty until the reader filters, and again after a reset.
    const announce = ref(false);
    // A submission failed on the filter input; cleared once the validity is valid again or by a reset.
    const failed = ref(false);
    // Renders the option rows anew after a reset, so that their checked state is the held value again.
    const resetCount = ref(0);
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    // Keep caller state intact; only known, enabled choices count or submit.
    const selected = computed(() => model.value.value.filter(value => props.options.some(option => option.value === value && !option.disabled)));
    useFormReset(element, () => {
      query.value = "";
      announce.value = false;
      failed.value = false;
      model.set(props.defaultValue);
    }, () => {
      if (element.value) element.value.value = "";
      resetCount.value++;
    });
    watchEffect(() => {
      element.value?.setCustomValidity(
        validity("MultiSelect", "requiredMessage", Boolean(field.controlAttrs.value.required && !props.disabled && !selected.value.length), props.requiredMessage, "required is set"),
      );
      if (failed.value && element.value?.validity.valid) failed.value = false;
    }, { flush: "post" });
    return () => {
      const options = filterOptions(props.options, query.value);
      const { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, name, form, ...inputAttrs } = attrs;
      const legend = optionalText(ariaLabel) || optionalText(ariaLabelledby) ? optionalText(props.label) : needText("MultiSelect", "label", props.label);
      const searchLabel = needText("MultiSelect", "searchLabel", props.searchLabel);
      const invalid = failed.value ? true : field.controlAttrs.value["aria-invalid"];
      return h(
        "fieldset",
        {
          class: "hw-field hw-multi-select",
          disabled: props.disabled,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          "aria-describedby": field.controlAttrs.value["aria-describedby"],
          "aria-invalid": invalid,
          "data-hw-readonly": props.readonly ? "true" : undefined,
        },
        [
          legend && h("legend", { class: "hw-label" }, [legend, field.controlAttrs.value.required && requiredMarker()]),
          searchLabel && h("label", { class: "hw-label", for: field.id.value }, searchLabel),
          h(
            "input",
            mergeProps(inputAttrs, {
              ref: element,
              id: field.id.value,
              // The filter input owns the custom validity, so it belongs to the same form as the values.
              form,
              type: "search",
              class: "hw-input",
              "aria-required": field.controlAttrs.value.required || undefined,
              "aria-describedby": field.controlAttrs.value["aria-describedby"],
              "aria-invalid": invalid,
              disabled: props.disabled,
              value: query.value,
              onInvalid: () => { failed.value = true; },
              onInput: (event: Event) => {
                query.value = (event.target as HTMLInputElement).value;
                announce.value = true;
              },
            }),
          ),
          h(
            "div",
            { class: "hw-multi-select-options", key: resetCount.value },
            [
              ...options.map((option) =>
                h("label", { class: "hw-choice", key: option.value }, [
                  h("input", {
                    type: "checkbox",
                    class: "hw-checkbox",
                    value: option.value,
                    checked: selected.value.includes(option.value),
                    disabled: props.disabled || option.disabled,
                    "aria-disabled": props.readonly || undefined,
                    onClick: (event: MouseEvent) => {
                      if (props.readonly) event.preventDefault();
                    },
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
              !options.length && h("p", { class: "hw-hint" }, needText("MultiSelect", "emptyMessage", props.emptyMessage)),
            ],
          ),
          h("span", { class: "hw-sr-only", role: "status", "aria-live": "polite", "aria-atomic": "true" },
            announce.value ? textOf("MultiSelect", "getResultsMessage", props.getResultsMessage, [options.length]) : ""),
          props.getSelectedMessage &&
            h("p", { class: "hw-multi-select-selected", role: "status" }, optionalText(props.getSelectedMessage(selected.value.length))),
          ...selected.value.map((value) =>
            h("input", {
              type: "hidden",
              name,
              form,
              value,
              disabled: props.disabled,
            }),
          ),
          props.hint &&
            h(
              "p",
              { id: `${field.id.value}-hint`, class: "hw-hint" },
              props.hint,
            ),
          props.error &&
            h(
              "p",
              { id: `${field.id.value}-error`, class: "hw-error" },
              props.error,
            ),
        ],
      );
    };
  },
});
export const FileDropzone = defineComponent({
  name: "HwFileDropzone",
  inheritAttrs: false,
  props: {
    ...decorationProps,
    disabled: Boolean,
    readonly: Boolean,
    accept: String,
    multiple: Boolean,
    /** Largest accepted file in bytes. */
    maxSize: Number,
    dropLabel: { type: String, required: true },
    getSelectedMessage: Function as PropType<(files: readonly File[]) => string>,
    /** Error text for a rejected batch; required when accept or maxSize is set. */
    getRejectedMessage: Function as PropType<(rejected: readonly File[]) => string>,
  },
  emits: {
    "update:files": (_files: File[]) => true,
    reject: (_files: File[]) => true,
  },
  setup(props, { attrs, emit, slots, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const root = ref<HTMLElement>();
    const dragging = ref(false);
    const selection = ref<File[]>([]);
    // The files of the last rejected batch; the rejection applies until an accepted batch or a reset.
    const rejected = ref<File[]>([]);
    useFormReset(element, () => {
      if (selection.value.length) emit("update:files", []);
      selection.value = [];
      rejected.value = [];
    });
    expose({ element, focus: () => element.value?.focus() });
    const unavailable = () => props.disabled || props.readonly || !element.value || isDisabled(element.value);
    const select = (list: FileList | null, drop = false) => {
      if (unavailable() || !list) return;
      const files = Array.from(list);
      // A batch replaces the selection; a batch with any rejected file leaves the dropzone empty.
      const result = evaluateFileSelection(files, { accept: props.accept, multiple: props.multiple, maxSize: props.maxSize });
      if (result.rejected.length) {
        if (element.value) element.value.value = "";
        if (selection.value.length) emit("update:files", []);
        selection.value = [];
        rejected.value = result.rejected;
        emit("reject", result.rejected);
        return;
      }
      if (drop && element.value) {
        // A browser that refuses the assignment keeps the previous selection and nothing is notified.
        try { element.value.files = list; } catch { return; }
        if (element.value.files?.length !== files.length) return;
      }
      const changed = selection.value.length > 0 || files.length > 0;
      selection.value = files;
      rejected.value = [];
      if (changed) emit("update:files", files);
    };
    return () => {
      const id = field.id.value;
      const dropLabel = needText("FileDropzone", "dropLabel", props.dropLabel);
      const restricted = Boolean(props.accept) || props.maxSize != null;
      if (restricted) needText("FileDropzone", "getRejectedMessage", props.getRejectedMessage, "accept or maxSize is set");
      const message = props.error || !rejected.value.length ? undefined
        : textOf("FileDropzone", "getRejectedMessage", props.getRejectedMessage, [rejected.value], restricted ? "accept or maxSize is set" : "a selection was rejected");
      const errorText = props.error || message;
      const own = new Set([`${id}-hint`, `${id}-error`]);
      const inherited = String(field.controlAttrs.value["aria-describedby"] ?? "").split(/\s+/).filter(part => part && !own.has(part));
      const required = field.controlAttrs.value.required;
      return h(
        "div",
        {
          ref: root,
          class: "hw-field hw-file-dropzone",
          "data-state": dragging.value ? "dragging" : rejected.value.length ? "error" : undefined,
          "data-hw-readonly": props.readonly ? "true" : undefined,
          onDragover: (event: DragEvent) => {
            if (!isFileDrag(event.dataTransfer)) return;
            event.preventDefault();
            const blocked = unavailable();
            if (event.dataTransfer) event.dataTransfer.dropEffect = blocked ? "none" : "copy";
            dragging.value = !blocked;
          },
          onDragleave: (event: DragEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node | null)) dragging.value = false;
          },
          onDrop: (event: DragEvent) => {
            event.preventDefault();
            dragging.value = false;
            select(event.dataTransfer?.files ?? null, true);
          },
        },
        [
          // The instruction describes the input; the field label (label, a parent Field or ARIA attributes) names it.
          !field.controlAttrs.value["aria-labelledby"] && !optionalText(attrs["aria-label"]) && needText("FileDropzone", "label", props.label) && null,
          props.label && h("label", { class: "hw-label", id: `${id}-label`, for: id }, [props.label, required && requiredMarker()]),
          dropLabel && h("p", { id: `${id}-instruction`, class: "hw-file-dropzone-instruction" }, dropLabel),
          h(
            "input",
            mergeProps(attrs, field.controlAttrs.value, {
              ref: element,
              class: "hw-input",
              type: "file",
              "aria-describedby": joinIds(...inherited, dropLabel && `${id}-instruction`, props.hint && `${id}-hint`, errorText && `${id}-error`),
              "aria-invalid": props.error || rejected.value.length ? true : field.controlAttrs.value["aria-invalid"],
              accept: props.accept,
              multiple: props.multiple,
              disabled: props.disabled,
              "aria-disabled": props.readonly ? "true" : attrs["aria-disabled"],
              onClick: (event: MouseEvent) => {
                if (props.readonly) event.preventDefault();
              },
              onKeydown: (event: KeyboardEvent) => {
                if (props.readonly && (event.key === " " || event.key === "Enter")) event.preventDefault();
              },
              onChange: (event: Event) =>
                select((event.target as HTMLInputElement).files),
            }),
          ),
          props.getSelectedMessage && h("p", { role: "status" }, selection.value.length ? textOf("FileDropzone", "getSelectedMessage", props.getSelectedMessage, [selection.value]) : undefined),
          slots.default?.(),
          props.hint && h("p", { class: "hw-hint", id: `${id}-hint` }, props.hint),
          errorText && h("p", { class: "hw-error", id: `${id}-error`, role: message ? "alert" : undefined }, errorText),
        ],
      );
    };
  },
});
