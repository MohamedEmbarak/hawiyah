import { defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { createAccordionMotion } from '@nasaq/core';
import type { AccordionMotion } from '@nasaq/core';
import type { PropType, VNodeChild } from 'vue';
import { Button } from './forms.js';
import { useValue } from './shared.js';

export interface AccordionItem { value: string; title: string; content?: VNodeChild; open?: boolean }
const AccordionDetail = defineComponent({
  props: { title: { type: String, required: true }, open: { type: Boolean, default: undefined }, name: String },
  emits: { change: (_open: boolean) => true },
  setup(props, { slots, emit }) {
    const details = ref<HTMLDetailsElement>();
    const content = ref<HTMLElement>();
    const open = ref(props.open ?? false);
    const initialOpen = open.value;
    let motion: AccordionMotion | undefined;
    const change = (next: boolean) => { open.value = next; emit('change', next); };
    const setupMotion = () => {
      motion?.destroy();
      if (props.name) details.value!.setAttribute('name', props.name); else details.value!.removeAttribute('name');
      motion = createAccordionMotion(details.value!, content.value!, change);
      motion.setOpen(open.value, true);
    };
    onMounted(setupMotion);
    watch(() => props.name, () => { if (details.value) setupMotion(); }, { flush: 'post' });
    // Preserve the native-details contract: open initializes the item and a
    // changed prop updates it, while user toggles still work without a listener.
    watch(() => props.open, next => { open.value = next ?? false; });
    watch(open, next => motion?.setOpen(next), { flush: 'post' });
    onBeforeUnmount(() => motion?.destroy());
    return () => h('details', { ref: details, class: 'nq-accordion-item', name: props.name, open: initialOpen, onToggle: () => motion?.nativeToggle() }, [
      h('summary', { class: 'nq-accordion-trigger', onClick: (event: MouseEvent) => { event.preventDefault(); change(!open.value); } }, props.title),
      h('div', { ref: content, class: 'nq-accordion-content' }, slots.default?.()),
    ]);
  },
});
export const Accordion = defineComponent({
  name: 'NqAccordion', inheritAttrs: false,
  props: { items: { type: Array as PropType<readonly AccordionItem[]>, required: true }, exclusive: Boolean },
  emits: { toggle: (_value: string, _open: boolean) => true },
  setup(props, { attrs, slots, emit }) {
    const group = `nq-${useId()}`;
    return () => h('div', mergeProps(attrs, { class: 'nq-accordion' }), props.items.map(item => h(AccordionDetail, { key: item.value, title: item.title, name: props.exclusive ? group : undefined, open: item.open, onChange: (next: boolean) => emit('toggle', item.value, next) }, () => slots[item.value]?.() ?? item.content)));
  },
});
export const Card = defineComponent({
  name: 'NqCard', inheritAttrs: false,
  props: { variant: String as PropType<'default' | 'flat' | 'elevated' | 'outlined' | 'ghost'>, href: String, disabled: Boolean },
  setup(props, { attrs, slots }) { return () => {
    const action = props.href !== undefined;
    const { onClick, ...rest } = attrs;
    return h(action ? 'a' : 'article', mergeProps(rest, {
      class: ['nq-card', action && 'nq-card-action'],
      'data-variant': props.variant ?? attrs['data-variant'], 'data-disabled': props.disabled || undefined,
      ...(action ? { href: props.disabled ? undefined : props.href, role: props.disabled ? 'link' : attrs.role, 'aria-disabled': props.disabled || undefined, tabindex: props.disabled ? -1 : attrs.tabindex } : {}),
      onClick: (event: MouseEvent) => {
        if (props.disabled) { event.preventDefault(); event.stopPropagation(); return; }
        for (const handler of Array.isArray(onClick) ? onClick : [onClick]) if (typeof handler === 'function') handler(event);
      },
    }), [slots.header && h('header', { class: 'nq-card-header' }, slots.header()), h('div', { class: 'nq-card-body' }, slots.default?.()), slots.footer && h('footer', { class: 'nq-card-footer' }, slots.footer())]);
  }; },
});
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export const Badge = defineComponent({
  name: 'NqBadge', inheritAttrs: false, props: { tone: { type: String as PropType<Tone>, default: 'neutral' } },
  setup(props, { attrs, slots }) { return () => h('span', mergeProps(attrs, { class: 'nq-badge', 'data-tone': props.tone }), slots.default?.()); },
});
export const Alert = defineComponent({
  name: 'NqAlert', inheritAttrs: false, props: { tone: { type: String as PropType<Tone>, default: 'info' }, title: String, variant: String as PropType<'default' | 'outline' | 'minimal'> },
  setup(props, { attrs, slots }) { return () => h('div', mergeProps({ role: props.tone === 'danger' ? 'alert' : 'status' }, attrs, { class: 'nq-alert', 'data-tone': props.tone, 'data-variant': props.variant ?? attrs['data-variant'] }), h('div', { class: 'nq-alert-content' }, [props.title && h('strong', {}, props.title), slots.default?.()])); },
});
export interface TableColumn { key: string; header: string; cell?: (row: Record<string, unknown>, index: number) => VNodeChild; rowHeader?: boolean }
export const Table = defineComponent({
  name: 'NqTable', inheritAttrs: false,
  props: { columns: Array as PropType<readonly TableColumn[]>, rows: { type: Array as PropType<readonly Record<string, unknown>[]>, default: () => [] }, caption: String, rowKey: Function as PropType<(row: Record<string, unknown>, index: number) => string | number> },
  setup(props, { attrs, slots }) { return () => h('div', { class: 'nq-table-wrap' }, [h('table', mergeProps(attrs, { class: 'nq-table' }), [
    props.caption && h('caption', {}, props.caption),
    props.columns ? [h('thead', {}, [h('tr', {}, props.columns.map(column => h('th', { key: column.key, scope: 'col' }, column.header)))]), h('tbody', {}, props.rows.map((row, index) => h('tr', { key: props.rowKey?.(row, index) ?? index }, props.columns!.map(column => h(column.rowHeader ? 'th' : 'td', { key: column.key, scope: column.rowHeader ? 'row' : undefined }, slots[`cell:${column.key}`]?.({ row, index }) ?? column.cell?.(row, index) ?? String(row[column.key] ?? ''))))))] : slots.default?.(),
  ])]); },
});
export const Pagination = defineComponent({
  name: 'NqPagination', inheritAttrs: false,
  props: { modelValue: Number, defaultValue: { type: Number, default: 1 }, totalPages: { type: Number, required: true }, label: { type: String, default: 'Pagination' }, previousLabel: { type: String, default: 'Previous' }, nextLabel: { type: String, default: 'Next' }, pageLabel: { type: Function as PropType<(page: number) => string>, default: (page: number) => `Page ${page}` }, formatPage: { type: Function as PropType<(page: number) => string>, default: String }, siblingCount: { type: Number, default: 1 } },
  emits: { 'update:modelValue': (_value: number) => true },
  setup(props, { attrs, emit }) {
    const model = useValue(() => props.modelValue, props.defaultValue, value => emit('update:modelValue', value));
    return () => {
      const total = Number.isFinite(props.totalPages) ? Math.max(1, Math.floor(props.totalPages)) : 1;
      const current = Math.min(total, Math.max(1, Math.floor(model.value.value) || 1));
      const radius = Math.min(5, Math.max(0, Math.floor(props.siblingCount)));
      const pages = [...new Set([1, total, ...Array.from({ length: radius * 2 + 1 }, (_, index) => current - radius + index)])].filter(page => page >= 1 && page <= total).sort((a, b) => a - b);
      return h('nav', mergeProps({ 'aria-label': props.label }, attrs, { class: 'nq-pagination' }), [
        h(Button, { variant: 'secondary', disabled: current === 1, onClick: () => model.set(current - 1) }, () => props.previousLabel),
        ...pages.map((page, index) => h('span', { key: page }, [index > 0 && page > pages[index - 1]! + 1 && h('span', { 'aria-hidden': 'true' }, '…'), h(Button, { variant: current === page ? 'primary' : 'ghost', 'aria-label': props.pageLabel(page), 'aria-current': current === page ? 'page' : undefined, onClick: () => model.set(page) }, () => props.formatPage(page))])),
        h(Button, { variant: 'secondary', disabled: current === total, onClick: () => model.set(current + 1) }, () => props.nextLabel),
      ]);
    };
  },
});
export interface BreadcrumbItem { label: string; href?: string; current?: boolean }
export const Breadcrumb = defineComponent({
  name: 'NqBreadcrumb', inheritAttrs: false, props: { items: { type: Array as PropType<readonly BreadcrumbItem[]>, required: true }, label: { type: String, default: 'Breadcrumb' } },
  setup(props, { attrs }) { return () => h('nav', mergeProps({ 'aria-label': props.label }, attrs, { class: 'nq-breadcrumb' }), [h('ol', {}, props.items.map((item, index) => h('li', { key: index }, [h(item.href ? 'a' : 'span', { href: item.href, 'aria-current': item.current || index === props.items.length - 1 ? 'page' : undefined }, item.label)])))]); },
});
export const Progress = defineComponent({
  name: 'NqProgress', inheritAttrs: false, props: { label: { type: String, required: true }, value: Number, max: { type: Number, default: 100 } },
  setup(props, { attrs }) { return () => h('progress', mergeProps(attrs, { class: 'nq-progress', 'aria-label': props.label, value: props.value, max: props.max })); },
});
export const Skeleton = defineComponent({ name: 'NqSkeleton', inheritAttrs: false, setup(_, { attrs }) { return () => h('span', mergeProps(attrs, { class: 'nq-skeleton', 'aria-hidden': 'true' })); } });
export const Spinner = defineComponent({ name: 'NqSpinner', inheritAttrs: false, props: { label: { type: String, default: 'Loading' } }, setup(props, { attrs }) { return () => h('span', mergeProps(attrs, { class: 'nq-spinner', role: 'status' }), [h('span', { class: 'nq-sr-only' }, props.label)]); } });
export const Avatar = defineComponent({
  name: 'NqAvatar', inheritAttrs: false, props: { name: { type: String, required: true }, src: String, initials: String },
  setup(props, { attrs }) { return () => h('span', mergeProps(attrs, { class: 'nq-avatar', role: props.src ? undefined : 'img', 'aria-label': props.src ? undefined : props.name }), props.src ? [h('img', { src: props.src, alt: props.name })] : props.initials ?? props.name.trim().split(/\s+/u).slice(0, 2).map(word => Array.from(word)[0]).join('')); },
});
export const Divider = defineComponent({ name: 'NqDivider', inheritAttrs: false, setup(_, { attrs }) { return () => h('hr', mergeProps(attrs, { class: 'nq-divider' })); } });
export interface StepItem { value: string; label: string; description?: string; status?: 'complete' | 'current' | 'upcoming' }
export const Stepper = defineComponent({
  name: 'NqStepper', inheritAttrs: false, props: { items: { type: Array as PropType<readonly StepItem[]>, required: true }, current: String, activeIndex: Number, label: { type: String, default: 'التقدم' } },
  setup(props, { attrs }) { return () => h('ol', mergeProps({ 'aria-label': props.label }, attrs, { class: 'nq-stepper' }), props.items.map((item, index) => {
    const requested = props.activeIndex ?? props.items.findIndex(step => step.value === props.current);
    const current = Number.isInteger(requested) && requested >= -1 && requested <= props.items.length ? requested : -1;
    const status = item.status ?? (index === current ? 'current' : index < current ? 'complete' : 'upcoming');
    return h('li', { key: item.value, class: 'nq-step', 'data-state': status, 'aria-current': status === 'current' ? 'step' : undefined }, [h('span', {}, item.label), item.description && h('p', { class: 'nq-hint' }, item.description)]);
  })); },
});
export const EmptyState = defineComponent({
  name: 'NqEmptyState', inheritAttrs: false, props: { title: { type: String, required: true }, description: String },
  setup(props, { attrs, slots }) { return () => h('div', mergeProps(attrs, { class: 'nq-empty' }), [slots.icon && h('span', { 'aria-hidden': 'true' }, slots.icon()), h('h3', {}, props.title), props.description && h('p', {}, props.description), slots.default?.(), slots.action?.()]); },
});
