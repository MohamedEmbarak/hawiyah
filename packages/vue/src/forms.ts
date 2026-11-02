import { onMounted, onUpdated, onBeforeUnmount, computed, defineComponent, h, mergeProps, nextTick, ref, useId, watchEffect } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import { observeReadonlyChoice, type Option } from '@nasaq/core';
import { decorationProps, joinIds, provideField, useField, useFormReset, useValue } from './shared.js';
import type { FieldDecoration } from './shared.js';

export const Button = defineComponent({
  name: 'NqButton', inheritAttrs: false,
  props: { variant: { type: String as PropType<'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link'>, default: 'primary' }, size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' }, loading: Boolean, disabled: Boolean, type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' } },
  setup(props, { attrs, slots, expose }) {
    const element = ref<HTMLButtonElement>();
    expose({ element, focus: () => element.value?.focus() });
    return () => h('button', mergeProps(attrs, { ref: element, class: 'nq-button', type: props.type, disabled: props.disabled || props.loading, 'aria-busy': props.loading || attrs['aria-busy'], 'data-variant': props.variant, 'data-size': props.size }), slots.default?.());
  },
});

export const Field = defineComponent({
  name: 'NqField', inheritAttrs: false, props: { ...decorationProps, controlId: String },
  setup(props, { attrs, slots }) {
    const generated = `nq-${useId()}`;
    const context = computed(() => ({ id: props.controlId ?? generated, labelId: props.label ? `${props.controlId ?? generated}-label` : undefined,
      describedby: joinIds(props.hint && `${props.controlId ?? generated}-hint`, props.error && `${props.controlId ?? generated}-error`), invalid: Boolean(props.error), required: props.required }));
    provideField(context);
    return () => h('div', mergeProps(attrs, { class: 'nq-field' }), [
      props.label && h('label', { class: 'nq-label', id: context.value.labelId, for: context.value.id }, [props.label, props.required && h('span', { 'aria-hidden': 'true' }, ' *')]),
      slots.default?.(context.value),
      props.hint && h('span', { class: 'nq-hint', id: `${context.value.id}-hint` }, props.hint),
      props.error && h('span', { class: 'nq-error', id: `${context.value.id}-error` }, props.error),
    ]);
  },
});

export function decorate(props: FieldDecoration, id: string, content: VNodeChild, extraClass?: string) {
  if (!props.label && !props.hint && !props.error && !extraClass) return content;
  return h('div', { class: ['nq-field', extraClass] }, [
    props.label && h('label', { class: 'nq-label', id: `${id}-label`, for: id }, [props.label, props.required && h('span', { 'aria-hidden': 'true' }, ' *')]), content,
    props.hint && h('span', { class: 'nq-hint', id: `${id}-hint` }, props.hint),
    props.error && h('span', { class: 'nq-error', id: `${id}-error` }, props.error),
  ]);
}
const valueProps = { ...decorationProps, modelValue: String, defaultValue: { type: String, default: '' } } as const;
function textControl(tag: 'input' | 'textarea' | 'select', className: string, name: string) {
  return defineComponent({
    name, inheritAttrs: false,
    props: { ...valueProps, options: { type: Array as PropType<readonly Option[]>, default: () => [] } },
    emits: { 'update:modelValue': (_value: string) => true },
    setup(props, { attrs, slots, emit, expose }) {
      const field = useField(props, attrs);
      const element = ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>();
      const model = useValue(() => props.modelValue, props.defaultValue, value => emit('update:modelValue', value));
      useFormReset(element, () => model.set(props.defaultValue));
      expose({ element, focus: () => element.value?.focus() });
      return () => decorate(props, field.id.value, h(tag, mergeProps(attrs, field.controlAttrs.value, {
        ref: element, class: className, value: model.value.value,
        [tag === 'select' ? 'onChange' : 'onInput']: (event: Event) => {
          model.set((event.target as HTMLInputElement).value);
          if (tag === 'select') void nextTick(() => {
            if (element.value) element.value.value = model.value.value;
          });
        },
      }), tag === 'select' ? [...props.options.map(option => h('option', { key: option.value, value: option.value, disabled: option.disabled }, option.label)), slots.default?.()] : undefined));
    },
  });
}
export const TextField = textControl('input', 'nq-input', 'NqTextField');
export const Textarea = textControl('textarea', 'nq-textarea', 'NqTextarea');
export const Select = textControl('select', 'nq-select', 'NqSelect');

function choice(kind: 'checkbox' | 'radio' | 'switch') {
  return defineComponent({
    name: `Nq${kind[0]!.toUpperCase()}${kind.slice(1)}`, inheritAttrs: false,
    props: { ...decorationProps, modelValue: { type: [Boolean, String] as PropType<boolean | string>, default: undefined }, defaultValue: { type: [Boolean, String] as PropType<boolean | string>, default: false }, value: { type: String, default: 'on' }, readOnly: Boolean, indeterminate: Boolean },
    emits: { 'update:modelValue': (_value: boolean | string) => true },
    setup(props, { attrs, slots, emit, expose }) {
      const field = useField(props, attrs);
      const element = ref<HTMLInputElement>();
      const model = useValue(() => props.modelValue, props.defaultValue, value => emit('update:modelValue', value));
      useFormReset(element, () => model.set(props.defaultValue));
      let readonlyGuard: ReturnType<typeof observeReadonlyChoice> | undefined;
      onMounted(() => { if (element.value) readonlyGuard = observeReadonlyChoice(element.value); });
      onUpdated(() => readonlyGuard?.refresh());
      onBeforeUnmount(() => readonlyGuard?.destroy());
      watchEffect(() => { if (element.value) element.value.indeterminate = kind === 'checkbox' && props.indeterminate; });
      expose({ element, focus: () => element.value?.focus() });
      return () => h('div', { class: 'nq-field' }, [
        h('label', { class: 'nq-choice', for: field.id.value, id: props.label ? `${field.id.value}-label` : undefined }, [
          h('input', mergeProps(attrs, field.controlAttrs.value, { ref: element, class: `nq-${kind}`, type: kind === 'radio' ? 'radio' : 'checkbox', role: kind === 'switch' ? 'switch' : attrs.role,
            readOnly: props.readOnly, 'aria-disabled': props.readOnly || attrs['aria-disabled'], value: props.value, checked: kind === 'radio' ? model.value.value === props.value : Boolean(model.value.value),
            onChange: (event: Event) => { if (!props.readOnly) model.set(kind === 'radio' ? props.value : (event.target as HTMLInputElement).checked); } })),
          props.label ?? slots.default?.(),
        ]),
        props.hint && h('span', { class: 'nq-hint', id: `${field.id.value}-hint` }, props.hint),
        props.error && h('span', { class: 'nq-error', id: `${field.id.value}-error` }, props.error),
      ]);
    },
  });
}
export const Checkbox = choice('checkbox');
export const Radio = choice('radio');
export const Switch = choice('switch');

export const FileUpload = defineComponent({
  name: 'NqFileUpload', inheritAttrs: false, props: decorationProps,
  emits: { 'update:files': (_files: File[]) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    useFormReset(element, () => emit('update:files', []));
    expose({ element, focus: () => element.value?.focus() });
    return () => decorate(props, field.id.value, [h('input', mergeProps(attrs, field.controlAttrs.value, { ref: element, class: 'nq-input', type: 'file', onChange: (event: Event) => emit('update:files', Array.from((event.target as HTMLInputElement).files ?? [])) })), slots.default?.()], 'nq-upload');
  },
});
