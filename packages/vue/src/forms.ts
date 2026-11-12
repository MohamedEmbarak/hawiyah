import { onMounted, onUpdated, onBeforeUnmount, computed, defineComponent, h, mergeProps, nextTick, ref, useId, watchEffect } from 'vue';
import type { PropType, VNodeArrayChildren, VNodeChild } from 'vue';
import { observeReadonlyChoice, type Option } from '@hawiyah/core';
import { decorationProps, joinIds, provideField, requiredMarker, useField, useFormReset, useValue } from './shared.js';
import type { FieldDecoration } from './shared.js';

/** The look of a Button, also used by the packaged triggers of Menu and Popover. */
export type ButtonVariant = 'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link';
export const Button = defineComponent({
  name: 'HwButton', inheritAttrs: false,
  props: { variant: { type: String as PropType<ButtonVariant>, default: 'primary' }, size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' }, loading: Boolean, disabled: Boolean, type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' } },
  setup(props, { attrs, slots, expose }) {
    const element = ref<HTMLButtonElement>();
    expose({ element, focus: () => element.value?.focus() });
    return () => h('button', mergeProps(attrs, { ref: element, class: 'hw-button', type: props.type, disabled: props.disabled || props.loading, 'aria-busy': props.loading || attrs['aria-busy'], 'data-variant': props.variant, 'data-size': props.size }), slots.default?.());
  },
});

export const Field = defineComponent({
  name: 'HwField', inheritAttrs: false, props: { ...decorationProps, controlId: String },
  setup(props, { attrs, slots }) {
    const generated = `hw-${useId()}`;
    const context = computed(() => ({ id: props.controlId ?? generated, labelId: props.label ? `${props.controlId ?? generated}-label` : undefined,
      describedby: joinIds(props.hint && `${props.controlId ?? generated}-hint`, props.error && `${props.controlId ?? generated}-error`), invalid: Boolean(props.error), required: props.required }));
    provideField(context);
    return () => h('div', mergeProps(attrs, { class: 'hw-field' }), [
      props.label && h('label', { class: 'hw-label', id: context.value.labelId, for: context.value.id }, [props.label, props.required && requiredMarker()]),
      slots.default?.(context.value),
      props.hint && h('p', { class: 'hw-hint', id: `${context.value.id}-hint` }, props.hint),
      props.error && h('p', { class: 'hw-error', id: `${context.value.id}-error` }, props.error),
    ]);
  },
});

/** `produced` is a message the component itself produces (a violated constraint): it fills the one p.hw-error
 * with role=alert when the application gives no `error`, whose text always wins and has no role. */
export function decorate(props: FieldDecoration, id: string, content: VNodeChild, extraClass?: string, decorationId = id, produced?: VNodeChild) {
  if (!props.label && !props.hint && !props.error && !extraClass && !produced) return content;
  return h('div', { class: ['hw-field', extraClass] }, [
    props.label && h('label', { class: 'hw-label', id: `${decorationId}-label`, for: id }, [props.label, props.required && requiredMarker()]), content,
    props.hint && h('p', { class: 'hw-hint', id: `${decorationId}-hint` }, props.hint),
    (props.error || produced) && h('p', { class: 'hw-error', id: `${decorationId}-error`, role: props.error ? undefined : 'alert' }, [props.error || produced] as VNodeArrayChildren),
  ]);
}
const valueProps = { ...decorationProps, modelValue: String, defaultValue: String, placeholder: String } as const;
function textControl(tag: 'input' | 'textarea' | 'select', className: string, name: string) {
  return defineComponent({
    name, inheritAttrs: false,
    props: { ...valueProps, options: { type: Array as PropType<readonly Option[]>, default: () => [] } },
    emits: { 'update:modelValue': (_value: string) => true },
    setup(props, { attrs, slots, emit, expose }) {
      const field = useField(props, attrs, true);
      const element = ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>();
      // Without a value or prompt, let a native select choose its first enabled option.
      const initial = props.defaultValue ?? (tag === 'select' ? undefined : '');
      const model = useValue<string | undefined>(() => props.modelValue, initial, value => {
        if (value !== undefined) emit('update:modelValue', value);
      });
      const syncSelect = () => nextTick(() => {
        if (element.value && model.value.value !== undefined) element.value.value = model.value.value;
      });
      // Reset target: defaultValue, else what a native control shows without a default: '' for a text
      // control and the first option that is not disabled for a select.
      useFormReset(element, () => {
        const select = tag === 'select' ? element.value as HTMLSelectElement | undefined : undefined;
        const first = select ? Array.from(select.options).find(option => !option.disabled)?.value : undefined;
        model.set(props.defaultValue ?? first ?? '');
      }, () => {
        if (tag === 'select') void syncSelect();
        else if (element.value) element.value.value = model.value.value ?? '';
      });
      expose({ element, focus: () => element.value?.focus() });
      return () => {
        const slotOptions = tag === 'select' ? slots.default?.() : undefined;
        const hasEmptyOption = props.options.some(option => option.value === '') || slotOptions?.some(node => node.type === 'option' && node.props?.value === '');
        const prompt = props.placeholder && !hasEmptyOption && (attrs.multiple == null || attrs.multiple === false) ? h('option', {value: ''}, props.placeholder) : null;
        const options = tag === 'select' ? [prompt, ...props.options.map(option => h('option', {
          key: option.value, value: option.value, disabled: option.disabled,
          selected: model.value.value === undefined ? undefined : model.value.value === option.value,
        }, option.label)), slotOptions] : undefined;
        const control = h(tag, mergeProps(attrs, field.controlAttrs.value, {
          ref: element, class: className, placeholder: tag === 'select' ? undefined : props.placeholder,
          ...(model.value.value === undefined ? {} : { value: model.value.value }),
          [tag === 'select' ? 'onChange' : 'onInput']: (event: Event) => {
            model.set((event.target as HTMLInputElement).value);
            if (tag === 'select') void syncSelect();
          },
        }), options);
        return decorate(props, field.id.value, control, undefined, field.decorationId.value);
      };
    },
  });
}
export const TextField = textControl('input', 'hw-input', 'HwTextField');
export const Textarea = textControl('textarea', 'hw-textarea', 'HwTextarea');
export const Select = textControl('select', 'hw-select', 'HwSelect');

function choice<Value extends boolean | string>(kind: 'checkbox' | 'radio' | 'switch', normalize: (value: boolean | string) => Value) {
  return defineComponent({
    name: `Hw${kind[0]!.toUpperCase()}${kind.slice(1)}`, inheritAttrs: false,
    props: { ...decorationProps, modelValue: { type: [Boolean, String] as PropType<boolean | string>, default: undefined }, defaultValue: { type: [Boolean, String] as PropType<boolean | string>, default: false }, value: { type: String, default: 'on' }, readonly: Boolean, indeterminate: Boolean },
    emits: { 'update:modelValue': (_value: Value) => true },
    setup(props, { attrs, slots, emit, expose }) {
      const field = useField(props, attrs);
      const element = ref<HTMLInputElement>();
      const model = useValue(() => props.modelValue, props.defaultValue, value => emit('update:modelValue', normalize(value)));
      const syncDefault = () => {
        const input = element.value;
        if (kind !== 'radio' || !input) return;
        const selected = props.defaultValue === props.value;
        if (input.defaultChecked !== selected) input.defaultChecked = selected;
      };
      useFormReset(element, () => {
        const input = element.value;
        if (kind !== 'radio' || !input?.form) { model.set(props.defaultValue); return; }
        const peers = input.name ? Array.from(input.form.elements).filter((node): node is HTMLInputElement =>
          node.matches('input[type="radio" i]') && node.getAttribute('name') === input.name) : [input];
        const checked = peers.find(peer => peer.checked);
        const restored = checked?.value ?? '';
        // A group has one reset result. Its other members synchronize silently
        // so an unchecked sibling cannot replace the selected default.
        if ((checked ?? peers[0]) === input) model.set(restored);
        else model.sync(restored);
      }, () => {
        if (element.value) element.value.checked = kind === 'radio' ? model.value.value === props.value : Boolean(model.value.value);
      });
      let readonlyGuard: ReturnType<typeof observeReadonlyChoice> | undefined;
      onMounted(() => { if (element.value) readonlyGuard = observeReadonlyChoice(element.value); syncDefault(); });
      onUpdated(() => { readonlyGuard?.refresh(); syncDefault(); });
      onBeforeUnmount(() => readonlyGuard?.destroy());
      watchEffect(() => { if (element.value) element.value.indeterminate = kind === 'checkbox' && props.indeterminate; });
      expose({ element, focus: () => element.value?.focus() });
      return () => h('div', { class: 'hw-field' }, [
        h('label', { class: 'hw-choice', for: field.id.value, id: props.label ? `${field.id.value}-label` : undefined }, [
          h('input', mergeProps(attrs, field.controlAttrs.value, { ref: element, class: `hw-${kind}`, type: kind === 'radio' ? 'radio' : 'checkbox', role: kind === 'switch' ? 'switch' : attrs.role,
            readOnly: props.readonly, 'aria-disabled': props.readonly || attrs['aria-disabled'], value: props.value, checked: kind === 'radio' ? model.value.value === props.value : Boolean(model.value.value),
            onChange: (event: Event) => { if (!props.readonly) model.set(kind === 'radio' ? props.value : (event.target as HTMLInputElement).checked); } })),
          props.label ?? slots.default?.(),
        ]),
        props.hint && h('p', { class: 'hw-hint', id: `${field.id.value}-hint` }, props.hint),
        props.error && h('p', { class: 'hw-error', id: `${field.id.value}-error` }, props.error),
      ]);
    },
  });
}
export const Checkbox = choice('checkbox', Boolean);
export const Radio = choice('radio', value => typeof value === 'string' ? value : '');
export const Switch = choice('switch', Boolean);

export const FileUpload = defineComponent({
  name: 'HwFileUpload', inheritAttrs: false, props: decorationProps,
  emits: { 'update:files': (_files: File[]) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    // Files held after the last change: a reset notifies [] only when there were some.
    let held = 0;
    useFormReset(element, () => { if (held) emit('update:files', []); held = 0; });
    expose({ element, focus: () => element.value?.focus() });
    return () => decorate(props, field.id.value, [h('input', mergeProps(attrs, field.controlAttrs.value, { ref: element, class: 'hw-input', type: 'file', onChange: (event: Event) => {
      const files = Array.from((event.target as HTMLInputElement).files ?? []); held = files.length; emit('update:files', files);
    } })), slots.default?.()], 'hw-upload');
  },
});
