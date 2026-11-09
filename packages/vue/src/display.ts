import { computed, defineComponent, h, mergeProps, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue';
import { createAccordionMotion, getPaginationItems, normalizePaginationPage, normalizePaginationTotal, observeFieldValue, type FieldValueObserver } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
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
    return () => h('details', { ref: details, class: 'hw-accordion-item', name: props.name, open: initialOpen, onToggle: () => motion?.nativeToggle() }, [
      h('summary', { class: 'hw-accordion-trigger', onClick: (event: MouseEvent) => { event.preventDefault(); change(!open.value); } }, props.title),
      h('div', { ref: content, class: 'hw-accordion-content' }, slots.default?.()),
    ]);
  },
});
export const Accordion = defineComponent({
  name: 'HwAccordion', inheritAttrs: false,
  props: { items: { type: Array as PropType<readonly AccordionItem[]>, required: true }, exclusive: Boolean },
  emits: { toggle: (_value: string, _open: boolean) => true },
  setup(props, { attrs, slots, emit }) {
    const group = `hw-${useId()}`;
    return () => h('div', mergeProps(attrs, { class: 'hw-accordion' }), props.items.map(item => h(AccordionDetail, { key: item.value, title: item.title, name: props.exclusive ? group : undefined, open: item.open, onChange: (next: boolean) => emit('toggle', item.value, next) }, () => slots[item.value]?.() ?? item.content)));
  },
});
export const Card = defineComponent({
  name: 'HwCard', inheritAttrs: false,
  props: { variant: String as PropType<'default' | 'flat' | 'elevated' | 'outlined' | 'ghost'>, href: String, disabled: Boolean },
  setup(props, { attrs, slots }) { return () => {
    const action = props.href !== undefined;
    const { onClick, ...rest } = attrs;
    return h(action ? 'a' : 'article', mergeProps(rest, {
      class: ['hw-card', action && 'hw-card-action'],
      'data-variant': props.variant ?? attrs['data-variant'], 'data-disabled': props.disabled || undefined,
      ...(action ? { href: props.disabled ? undefined : props.href, role: props.disabled ? 'link' : attrs.role, 'aria-disabled': props.disabled || undefined, tabindex: props.disabled ? -1 : attrs.tabindex } : {}),
      onClick: (event: MouseEvent) => {
        if (props.disabled) { event.preventDefault(); event.stopPropagation(); return; }
        for (const handler of Array.isArray(onClick) ? onClick : [onClick]) if (typeof handler === 'function') handler(event);
      },
    }), [slots.header && h('header', { class: 'hw-card-header' }, slots.header()), h('div', { class: 'hw-card-body' }, slots.default?.()), slots.footer && h('footer', { class: 'hw-card-footer' }, slots.footer())]);
  }; },
});
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export const Badge = defineComponent({
  name: 'HwBadge', inheritAttrs: false, props: { tone: { type: String as PropType<Tone>, default: 'neutral' }, variant: String as PropType<'soft' | 'outline' | 'dot'> },
  setup(props, { attrs, slots }) { return () => h('span', mergeProps(attrs, { class: 'hw-badge', 'data-tone': props.tone, 'data-variant': props.variant ?? attrs['data-variant'] }), slots.default?.()); },
});
export const Alert = defineComponent({
  name: 'HwAlert', inheritAttrs: false, props: { tone: { type: String as PropType<Tone>, default: 'info' }, title: String, variant: String as PropType<'default' | 'outline' | 'minimal'> },
  setup(props, { attrs, slots }) { return () => h('div', mergeProps({ role: props.tone === 'danger' ? 'alert' : 'status' }, attrs, { class: 'hw-alert', 'data-tone': props.tone, 'data-variant': props.variant ?? attrs['data-variant'] }), h('div', { class: 'hw-alert-content' }, [props.title && h('strong', {}, props.title), slots.default?.()])); },
});
export interface TableColumn { key: string; header: string; cell?: (row: Record<string, unknown>, index: number) => VNodeChild; rowHeader?: boolean }
export const Table = defineComponent({
  name: 'HwTable', inheritAttrs: false,
  props: { columns: Array as PropType<readonly TableColumn[]>, rows: { type: Array as PropType<readonly Record<string, unknown>[]>, default: () => [] }, caption: String, variant: String as PropType<'default' | 'striped' | 'bordered'>, size: String as PropType<'sm' | 'md' | 'lg'>, emptyMessage: {type: String, default: 'لا توجد سجلات'}, wrapperProps: Object as PropType<Record<string, unknown>>, rowKey: Function as PropType<(row: Record<string, unknown>, index: number) => string | number> },
  setup(props, { attrs, slots }) { const captionId = useId(); return () => h('div', mergeProps({ class: 'hw-table-wrap', tabindex: 0, role: props.caption ? 'region' : undefined, 'aria-labelledby': props.caption ? captionId : undefined }, props.wrapperProps ?? {}), [h('table', mergeProps(attrs, { class: 'hw-table', 'data-variant': props.variant ?? attrs['data-variant'], 'data-size': props.size ?? attrs['data-size'] }), [
    props.caption && h('caption', {id: captionId}, props.caption),
    props.columns ? [h('thead', {}, [h('tr', {}, props.columns.map(column => h('th', { key: column.key, scope: 'col' }, column.header)))]), h('tbody', {}, props.rows.length ? props.rows.map((row, index) => h('tr', { key: props.rowKey?.(row, index) ?? index }, props.columns!.map(column => h(column.rowHeader ? 'th' : 'td', { key: column.key, scope: column.rowHeader ? 'row' : undefined }, slots[`cell:${column.key}`]?.({ row, index }) ?? column.cell?.(row, index) ?? String(row[column.key] ?? ''))))) : h('tr', {}, h('td', {colspan: props.columns.length || 1}, props.emptyMessage)))] : slots.default?.(),
  ])]); },
});
const PaginationJumpInput = defineComponent({
  props: {start: {type: Number, required: true}, end: {type: Number, required: true}},
  setup(props) {
    const element = ref<HTMLInputElement>(); let presence: FieldValueObserver | undefined;
    onMounted(() => {if(element.value) presence = observeFieldValue(element.value);});
    onUpdated(() => presence?.refresh());
    onBeforeUnmount(() => presence?.destroy());
    return () => h('input', {ref: element, class: 'hw-input', 'data-hw-jump-input': '', 'data-hw-filled': 'true', form: '', type: 'number', inputmode: 'numeric', required: true, min: props.start, max: props.end, step: 1, value: props.start, onInput: (event: Event) => {
      const input = event.currentTarget as HTMLInputElement;
      if(input.dataset.hwJumpTouched === 'true') {if(input.checkValidity()) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid','true');}
    }});
  },
});
export const Pagination = defineComponent({
  name: 'HwPagination', inheritAttrs: false,
  props: {
    modelValue: Number, defaultValue: {type: Number, default: 1}, totalPages: {type: Number, required: true},
    label: {type: String, default: 'ترقيم الصفحات'}, previousLabel: {type: String, default: 'الصفحة السابقة'}, nextLabel: {type: String, default: 'الصفحة التالية'},
    pageLabel: {type: Function as PropType<(page: number) => string>, default: (page: number) => 'الصفحة ' + page},
    formatPage: {type: Function as PropType<(page: number) => string>, default: String}, siblingCount: {type: Number, default: 1},
    disabled: Boolean, hideOnSinglePage: Boolean,
    gapLabel: {type: Function as PropType<(start: number, end: number) => string>, default: (start: number, end: number) => 'الصفحات ' + start + ' إلى ' + end},
    jumpLabel: {type: String, default: 'الانتقال إلى صفحة'}, goLabel: {type: String, default: 'انتقال'},
  },
  emits: {'update:modelValue': (_value: number) => true},
  setup(props, {attrs, emit}) {
    const model = useValue(() => props.modelValue, props.defaultValue, value => emit('update:modelValue', value));
    const root = ref<HTMLElement>(); const total = computed(() => normalizePaginationTotal(props.totalPages)), current = computed(() => normalizePaginationPage(model.value.value, total.value));
    let pendingFocus: number | null = null; let ancestorObserver: MutationObserver | undefined;
    const close = (except?: HTMLDetailsElement) => root.value?.querySelectorAll<HTMLDetailsElement>('.hw-pagination-gap[open]').forEach(details => {if(details !== except) details.open = false;});
    const blocked = () => props.disabled || !!root.value?.querySelector<HTMLButtonElement>(':scope > [data-hw-page]')?.matches(':disabled');
    const syncInherited = () => {
      const unavailable = blocked();
      root.value?.querySelectorAll<HTMLElement>('.hw-pagination-gap > summary').forEach(summary => {
        if(unavailable) {summary.setAttribute('aria-disabled','true');summary.tabIndex = -1;}
        else {summary.removeAttribute('aria-disabled');summary.removeAttribute('tabindex');}
      });
      if(unavailable) close();
    };
    const focusCurrent = () => {if(pendingFocus !== null) {const requested = pendingFocus; pendingFocus = null; if(current.value === requested) root.value?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();}};
    watch([current, total, () => props.disabled, () => props.siblingCount], () => {close(); syncInherited(); focusCurrent();}, {flush: 'post'});
    const outside = (event: Event) => {if(root.value && !root.value.contains(event.target as Node)) close();};
    onMounted(() => {
      const node = root.value; if(!node) return;
      node.ownerDocument.addEventListener('click', outside);
      const Observer = node.ownerDocument.defaultView?.MutationObserver;
      ancestorObserver = Observer ? new Observer(syncInherited) : undefined;
      for(let ancestor=node.parentElement;ancestor;ancestor=ancestor.parentElement) if(ancestor.tagName==='FIELDSET') ancestorObserver?.observe(ancestor,{attributes:true,attributeFilter:['disabled']});
      syncInherited();
    });
    onUpdated(syncInherited);
    onBeforeUnmount(() => {root.value?.ownerDocument.removeEventListener('click', outside);ancestorObserver?.disconnect();});
    const select = (requested: number, gap?: HTMLDetailsElement | null) => {
      if(blocked() || !Number.isFinite(requested)) return;
      const next = normalizePaginationPage(requested, total.value); close();
      if(gap) {gap.querySelector<HTMLElement>('summary')?.focus(); pendingFocus = next !== current.value ? next : null;}
      if(next !== current.value) model.set(next);
      void nextTick(focusCurrent);
    };
    const jump = (node: HTMLElement, start: number, end: number) => {
      const input = node.querySelector<HTMLInputElement>('input');
      if(!input || blocked()) return;
      input.dataset.hwJumpTouched = 'true';
      if(input.checkValidity() && Number.isInteger(input.valueAsNumber) && input.valueAsNumber >= start && input.valueAsNumber <= end) {input.removeAttribute('aria-invalid');select(input.valueAsNumber, node.closest('details'));}
      else {input.setAttribute('aria-invalid','true');input.reportValidity();}
    };
    return () => h('nav', mergeProps({'aria-label': props.label}, attrs, {ref: root, class: 'hw-pagination', 'data-disabled': props.disabled || undefined, hidden: attrs.hidden || props.hideOnSinglePage && total.value === 1,
      onClickCapture: (event: MouseEvent) => {if(blocked()) {event.preventDefault();event.stopPropagation();syncInherited();}},
      onKeydown: (event: KeyboardEvent) => {
        if(blocked() && ['Enter',' '].includes(event.key)) {event.preventDefault();syncInherited();return;}
        if(event.defaultPrevented || event.key !== 'Escape') return;
        const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.hw-pagination-gap[open]');
        if(details) {event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();}
      },
    }), [
      h('button', {class: 'hw-button hw-pagination-arrow', 'data-variant': 'ghost', 'data-hw-previous': '', type: 'button', 'aria-label': props.previousLabel, disabled: props.disabled || current.value === 1, onClick: () => select(current.value - 1)}),
      ...getPaginationItems(current.value, total.value, props.siblingCount).map(item => {
        if(typeof item === 'number') return h('button', {key: item, class: 'hw-button hw-pagination-item', 'data-variant': 'ghost', 'data-hw-page': item, type: 'button', disabled: props.disabled, 'aria-label': props.pageLabel(item), 'aria-current': current.value === item ? 'page' : undefined, onClick: () => select(item)}, props.formatPage(item));
        if(props.disabled) return h('span', {key: 'gap-' + item.start, class: 'hw-pagination-ellipsis', 'aria-hidden': 'true'}, '…');
        return h('details', {key: 'gap-' + item.start, class: 'hw-pagination-gap', onToggle: (event: Event) => {const details = event.currentTarget as HTMLDetailsElement; if(blocked()) syncInherited();else if(details.open) close(details);}}, [
          h('summary', {class: 'hw-pagination-gap-trigger', 'aria-label': props.gapLabel(item.start, item.end)}, '…'),
          h('div', {class: 'hw-pagination-menu'}, item.end - item.start < 100 ?
            Array.from({length: item.end - item.start + 1}, (_, index) => item.start + index).map(page => h('button', {key: page, type: 'button', class: 'hw-button hw-pagination-item', 'data-variant': 'ghost', 'data-hw-page': page, 'aria-label': props.pageLabel(page), onClick: (event: MouseEvent) => select(page, (event.currentTarget as HTMLElement).closest('details'))}, props.formatPage(page))) :
            h('div', {class: 'hw-pagination-jump', onKeydown: (event: KeyboardEvent) => {if(event.key === 'Enter') {event.preventDefault(); jump(event.currentTarget as HTMLElement, item.start, item.end);}}}, [
              h('label', {class: 'hw-label'}, [props.jumpLabel, h(PaginationJumpInput, {start: item.start, end: item.end})]),
              h('button', {type: 'button', class: 'hw-button', 'data-hw-jump-submit': '', onClick: (event: MouseEvent) => jump((event.currentTarget as HTMLElement).parentElement!, item.start, item.end)}, props.goLabel),
            ])),
        ]);
      }),
      h('button', {class: 'hw-button hw-pagination-arrow', 'data-variant': 'ghost', 'data-hw-next': '', type: 'button', 'aria-label': props.nextLabel, disabled: props.disabled || current.value === total.value, onClick: () => select(current.value + 1)}),
    ]);
  },
});
export interface BreadcrumbItem { label: string; href?: string; current?: boolean; disabled?: boolean }
export const Breadcrumb = defineComponent({
  name: 'HwBreadcrumb', inheritAttrs: false, props: { items: { type: Array as PropType<readonly BreadcrumbItem[]>, required: true }, label: { type: String, default: 'مسار التنقل' } },
  setup(props, { attrs }) { return () => h('nav', mergeProps({ 'aria-label': props.label }, attrs, { class: 'hw-breadcrumb' }), [h('ol', {}, props.items.map((item, index) => h('li', { key: index }, [h(item.href && !item.disabled ? 'a' : 'span', { href: item.disabled ? undefined : item.href, role:item.disabled?'link':undefined,'aria-disabled':item.disabled || undefined, 'aria-current': item.current || index === props.items.length - 1 ? 'page' : undefined }, item.label)])))]); },
});
export const Progress = defineComponent({
  name: 'HwProgress', inheritAttrs: false, props: { label: { type: String, required: true }, value: Number, max: { type: Number, default: 100 } },
  setup(props, { attrs }) { return () => h('progress', mergeProps(attrs, { class: 'hw-progress', 'aria-label': props.label, value: props.value, max: props.max })); },
});
export const Skeleton = defineComponent({ name: 'HwSkeleton', inheritAttrs: false, setup(_, { attrs }) { return () => h('span', mergeProps(attrs, { class: 'hw-skeleton', 'aria-hidden': 'true' })); } });
export const Spinner = defineComponent({ name: 'HwSpinner', inheritAttrs: false, props: { label: { type: String, default: 'Loading' } }, setup(props, { attrs }) { return () => h('span', mergeProps(attrs, { class: 'hw-spinner', role: 'status' }), [h('span', { class: 'hw-sr-only' }, props.label)]); } });
export const Avatar = defineComponent({
  name: 'HwAvatar', inheritAttrs: false, props: { name: { type: String, required: true }, src: String, initials: String, size: String as PropType<'sm' | 'md' | 'lg' | 'xl' | '40' | '64' | '80' | '120'>, variant: String as PropType<'circle' | 'square'> },
  setup(props, { attrs }) {
    const imageFailed = ref(false); watch(() => props.src, () => {imageFailed.value = false;}, {flush: 'sync'});
    return () => {const visible = !!props.src && !imageFailed.value; const src = props.src;
      return h('span', mergeProps(attrs, { class: 'hw-avatar', 'data-size': props.size ?? attrs['data-size'], 'data-variant': props.variant ?? attrs['data-variant'], role: visible ? undefined : 'img', 'aria-label': visible ? undefined : props.name }), visible ? [h('img', { key: src, src, alt: props.name, onError: () => {if(props.src === src) imageFailed.value = true;} })] : h('span', {'aria-hidden': 'true'}, props.initials ?? props.name.trim().split(/\s+/u).slice(0, 2).map(word => Array.from(word)[0]).join('')));
    };
  },
});
export const Divider = defineComponent({
  name: 'HwDivider', inheritAttrs: false,
  props: {
    tone: String as PropType<'neutral' | 'primary' | 'gold' | 'tertiary'>,
    orientation: String as PropType<'horizontal' | 'vertical'>,
  },
  setup(props, { attrs }) {
    return () => h('hr', mergeProps({ 'data-tone': props.tone, 'aria-orientation': props.orientation }, attrs, { class: 'hw-divider' }));
  },
});
export interface StepItem { value: string; label: string; description?: string; status?: 'complete' | 'current' | 'upcoming' }
export const Stepper = defineComponent({
  name: 'HwStepper', inheritAttrs: false, props: { items: { type: Array as PropType<readonly StepItem[]>, required: true }, current: String, activeIndex: Number, label: { type: String, default: 'التقدم' } },
  setup(props, { attrs }) { return () => h('ol', mergeProps({ 'aria-label': props.label }, attrs, { class: 'hw-stepper' }), props.items.map((item, index) => {
    const requested = props.activeIndex ?? props.items.findIndex(step => step.value === props.current);
    const current = Number.isInteger(requested) && requested >= -1 && requested <= props.items.length ? requested : -1;
    const status = item.status ?? (index === current ? 'current' : index < current ? 'complete' : 'upcoming');
    return h('li', { key: item.value, class: 'hw-step', 'data-state': status, 'aria-current': status === 'current' ? 'step' : undefined }, [h('span', {}, item.label), item.description && h('p', { class: 'hw-hint' }, item.description)]);
  })); },
});
export const EmptyState = defineComponent({
  name: 'HwEmptyState', inheritAttrs: false, props: { title: { type: String, required: true }, description: String },
  setup(props, { attrs, slots }) { return () => h('div', mergeProps(attrs, { class: 'hw-empty' }), [slots.icon && h('span', { 'aria-hidden': 'true' }, slots.icon()), h('h3', {}, props.title), props.description && h('p', {}, props.description), slots.default?.(), slots.action?.()]); },
});
