import { cloneVNode, computed, defineComponent, h, isVNode, mergeProps, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, watchEffect } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import { createComboboxState, getComboboxOptions, getDirection, getNextEnabledIndex, isDisabled, observeTabOverflow, restoreFocus, transitionCombobox } from '@nasaq/core';
import type { ComboboxEvent, Option, Orientation } from '@nasaq/core';
import { Button, decorate } from './forms.js';
import { decorationProps, joinIds, useField, useFormReset, useValue } from './shared.js';

export interface TabItem { value: string; label: string; content?: VNodeChild; disabled?: boolean }
export const Tabs = defineComponent({
  name: 'NqTabs', inheritAttrs: false,
  props: { items: { type: Array as PropType<readonly TabItem[]>, required: true }, label: { type: String, required: true }, modelValue: String, defaultValue: String,
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' }, activationMode: { type: String as PropType<'automatic' | 'manual'>, default: 'automatic' },
    overflow: {type: String as PropType<'menu' | 'scroll'>, default: 'menu'}, overflowLabel: {type: String, default: 'المزيد من التبويبات'} },
  emits: { 'update:modelValue': (_value: string) => true },
  setup(props, { attrs, slots, emit }) {
    const id = `nq-${useId()}`;
    const model = useValue(() => props.modelValue, props.defaultValue ?? props.items.find(item => !item.disabled)?.value ?? '', value => emit('update:modelValue', value));
    const focused = ref<string>();
    const active = computed(() => props.items.find(item => item.value === model.value.value && !item.disabled)?.value ?? props.items.find(item => !item.disabled)?.value);
    const buttons = new Map<string, HTMLButtonElement>();
    const bar = ref<HTMLDivElement>();
    const disclosure = ref<HTMLDetailsElement>();
    const hidden = ref<number[]>([]);
    let observer: ReturnType<typeof observeTabOverflow> | undefined;
    let alive = true;
    const visible = computed(() => props.items.filter((item, index) => !hidden.value.includes(index) && !item.disabled));
    const focusValue = computed(() => visible.value.find(item => item.value === focused.value)?.value ?? visible.value.find(item => item.value === active.value)?.value ?? visible.value[0]?.value);
    const close = () => {if (disclosure.value) disclosure.value.open = false;};
    const outside = (event: Event) => {if (!bar.value?.contains(event.target as Node)) close();};
    onMounted(() => {
      const node = bar.value!;
      observer = observeTabOverflow({container: node, tabs: () => props.items.map(item => buttons.get(item.value)!).filter(Boolean), enabled: () => props.overflow === 'menu' && props.orientation === 'horizontal', onChange: next => {
        const focusedElement = node.ownerDocument.activeElement;
        const menuValue = (focusedElement as HTMLElement | null)?.dataset.nqOverflowValue;
        const itemIndex = props.items.findIndex(item => item.value === menuValue);
        const toMenu = menuValue !== undefined && itemIndex >= 0 && next.includes(itemIndex);
        const toOriginal = menuValue !== undefined && itemIndex >= 0 && !toMenu;
        const toSummary = next.some(index => buttons.get(props.items[index]?.value ?? '') === focusedElement) || (!toMenu && !toOriginal && !!next.length && !!disclosure.value?.contains(focusedElement));
        const toTab = !next.length && disclosure.value?.contains(focusedElement);
        if (!toMenu) close(); hidden.value = next;
        void nextTick(() => {if (!alive) return; if (toMenu) [...(disclosure.value?.querySelectorAll<HTMLElement>('[data-nq-overflow-value]') ?? [])].find(button => button.dataset.nqOverflowValue === menuValue)?.focus(); else if (toOriginal) buttons.get(menuValue!)?.focus(); else if (toSummary) disclosure.value?.querySelector('summary')?.focus(); else if (toTab && focusValue.value) buttons.get(focusValue.value)?.focus();});
      }});
      node.ownerDocument.addEventListener('click', outside);
    });
    watch(() => [props.items, props.overflow, props.orientation], () => {observer?.refresh(); const focusedElement = bar.value?.ownerDocument.activeElement; if (focusedElement?.getAttribute('data-nq-overflow-hidden') === 'true' && bar.value?.contains(focusedElement)) disclosure.value?.querySelector('summary')?.focus();}, {deep: true, flush: 'post'});
    watch(active, close);
    onBeforeUnmount(() => {alive = false; observer?.destroy(); bar.value?.ownerDocument.removeEventListener('click', outside);});
    return () => h('div', mergeProps(attrs, { class: 'nq-tabs' }), [
      h('div', {class: 'nq-tab-bar', ref: bar, 'data-nq-overflow': props.overflow, 'data-orientation': props.orientation}, [
      h('div', { class: 'nq-tab-list', 'data-nq-overflow': props.overflow, role: 'tablist', 'aria-label': props.label, 'aria-orientation': props.orientation, 'aria-hidden': hidden.value.length === props.items.length || undefined }, props.items.map((item, index) => h('button', {
        key: item.value, ref: (element: unknown) => { if (element) buttons.set(item.value, element as HTMLButtonElement); else buttons.delete(item.value); },
        class: 'nq-tab', type: 'button', role: 'tab', id: `${id}-tab-${index}`, 'aria-controls': `${id}-panel-${index}`, 'aria-selected': active.value === item.value,
        'data-nq-overflow-hidden': hidden.value.includes(index) ? 'true' : undefined, 'aria-hidden': hidden.value.includes(index) || undefined,
        tabindex: !hidden.value.includes(index) && focusValue.value === item.value ? 0 : -1, disabled: item.disabled,
        onFocus: () => { focused.value = item.value; }, onClick: () => {if (!item.disabled) model.set(item.value);},
        onKeydown: (event: KeyboardEvent) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
          const keys = props.orientation === 'vertical' ? ['ArrowDown', 'ArrowUp', 'Home', 'End'] : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const next = props.items[getNextEnabledIndex(index, event.key, props.items.map((candidate, i) => ({disabled: candidate.disabled || hidden.value.includes(i)})), getDirection(event.currentTarget as Element), props.orientation)];
          if (!next) return;
          focused.value = next.value; buttons.get(next.value)?.focus();
          if (props.activationMode === 'automatic') model.set(next.value);
        },
      }, slots[`tab:${item.value}`]?.({ item }) ?? item.label))),
      h('details', {class: 'nq-tabs-overflow', ref: disclosure, hidden: !hidden.value.length, onKeydown: (event: KeyboardEvent) => {if (event.key === 'Escape' && disclosure.value?.open) {event.preventDefault(); close(); disclosure.value.querySelector('summary')?.focus();}}}, [
        h('summary', {class: 'nq-tab-overflow-trigger', 'aria-label': props.overflowLabel, 'data-active': hidden.value.some(index => props.items[index]?.value === active.value) ? 'true' : undefined}, '…'),
        h('div', {class: 'nq-tab-overflow-menu'}, hidden.value.map(index => {const item = props.items[index]; return item && h('button', {key: item.value, type: 'button', class: 'nq-tab-overflow-item', 'data-nq-overflow-value': item.value, disabled: item.disabled, 'aria-pressed': item.value === active.value, onClick: () => {if (item.disabled) return; model.set(item.value); close(); disclosure.value?.querySelector('summary')?.focus();}}, slots[`tab:${item.value}`]?.({item}) ?? item.label);})),
      ]),
      ]),
      ...props.items.map((item, index) => h('section', { key: item.value, class: 'nq-tab-panel', id: `${id}-panel-${index}`, role: 'tabpanel', 'aria-labelledby': `${id}-tab-${index}`, tabindex: 0, hidden: active.value !== item.value }, [slots[item.value]?.() ?? item.content])),
    ]);
  },
});

export const Dialog = defineComponent({
  name: 'NqDialog', inheritAttrs: false,
  props: { open: { type: Boolean, default: undefined }, defaultOpen: Boolean, title: { type: String, required: true }, description: String, closeLabel: { type: String, default: 'Close' }, closeOnBackdrop: { type: Boolean, default: true } },
  emits: { 'update:open': (_open: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const id = `nq-${useId()}`;
    const element = ref<HTMLDialogElement>();
    const model = useValue(() => props.open, props.defaultOpen, value => emit('update:open', value));
    let previousFocus: HTMLElement | null = null;
    let backdropStarted = false;
    const close = () => { backdropStarted = false; model.set(false); };
    const show = () => { backdropStarted = false; model.set(true); };
    watchEffect(() => {
      const dialog = element.value;
      if (!dialog) return;
      if (model.value.value && !dialog.open) {
        backdropStarted = false;
        previousFocus = dialog.ownerDocument.activeElement as HTMLElement | null;
        dialog.showModal();
      } else if (!model.value.value && dialog.open) { backdropStarted = false; dialog.close(); restoreFocus(previousFocus); }
    }, { flush: 'post' });
    onBeforeUnmount(() => { if (element.value?.open) { element.value.close(); restoreFocus(previousFocus); } });
    expose({ element, show, close });
    return () => [slots.trigger?.({ open: show }), h('dialog', mergeProps(attrs, {
      ref: element, class: 'nq-dialog', 'aria-labelledby': attrs['aria-labelledby'] ?? `${id}-title`, 'aria-describedby': attrs['aria-describedby'] ?? (props.description ? `${id}-description` : undefined),
      onCancel: (event: Event) => { backdropStarted = false; if (!event.defaultPrevented) { event.preventDefault(); close(); } },
      onClose: () => { backdropStarted = false; if (model.value.value) close(); restoreFocus(previousFocus); },
      onPointerdown: (event: PointerEvent) => {
        const bounds = element.value!.getBoundingClientRect();
        backdropStarted = !event.defaultPrevented && event.button === 0 && event.target === event.currentTarget &&
          (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
      },
      onPointercancel: () => { backdropStarted = false; },
      onClick: (event: MouseEvent) => {
        const started = backdropStarted; backdropStarted = false;
        if (event.defaultPrevented || !props.closeOnBackdrop || !started || event.target !== event.currentTarget) return;
        const bounds = element.value!.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      },
    }), [
      h('header', { class: 'nq-dialog-header' }, [h('h2', { id: `${id}-title` }, props.title), h(Button, { variant: 'ghost', 'aria-label': props.closeLabel, onClick: close }, () => '×')]),
      h('div', { class: 'nq-dialog-body' }, [props.description && h('p', { id: `${id}-description` }, props.description), slots.default?.({ close })]),
      slots.footer && h('footer', { class: 'nq-dialog-footer' }, slots.footer({ close })),
    ])];
  },
});

export const Combobox = defineComponent({
  name: 'NqCombobox', inheritAttrs: false,
  props: { ...decorationProps, options: { type: Array as PropType<readonly Option[]>, required: true }, modelValue: String, defaultValue: { type: String, default: '' }, disabled: Boolean, readonly: Boolean,
    emptyMessage: { type: String, default: 'No options found' }, resultsMessage: { type: Function as PropType<(count: number) => string>, default: (count: number) => `${count} results available` }, requiredMessage: { type: String, default: 'Choose an option from the list.' } },
  emits: { 'update:modelValue': (_value: string) => true, 'update:open': (_open: boolean) => true, 'update:query': (_query: string) => true },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const root = ref<HTMLElement>();
    const state = ref(createComboboxState(props.options, props.modelValue ?? props.defaultValue));
    const ancestorDisabled = ref(false);
    const blocked = () => props.disabled || props.readonly || !!(element.value && isDisabled(element.value));
    let disabledObserver: MutationObserver | undefined;
    onMounted(() => {
      const input = element.value;
      if (!input) return;
      const refresh = () => { ancestorDisabled.value = isDisabled(input); };
      const Observer = input.ownerDocument.defaultView?.MutationObserver;
      if (Observer) disabledObserver = new Observer(refresh);
      for (let ancestor = input.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.localName === 'fieldset') disabledObserver?.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
      }
      refresh();
    });
    onBeforeUnmount(() => disabledObserver?.disconnect());
    watch(() => props.disabled || props.readonly || ancestorDisabled.value, unavailable => {
      if (unavailable) state.value = { ...state.value, open: false, activeIndex: -1 };
    });
    const effective = computed(() => ({ ...state.value, value: props.modelValue ?? state.value.value,
      query: props.modelValue !== undefined && props.modelValue !== state.value.value ? createComboboxState(props.options, props.modelValue).query : state.value.query,
      open: !props.disabled && !ancestorDisabled.value && !props.readonly && state.value.open }));
    const results = computed(() => getComboboxOptions(effective.value, props.options));
    let lastEmitted: string | undefined;
    function dispatch(event: ComboboxEvent) {
      if (blocked() && event.type !== 'close' && event.type !== 'reset') return;
      const previous = effective.value;
      const next = transitionCombobox(previous, event, props.options);
      state.value = next;
      if (next.value !== previous.value) { lastEmitted = next.value; emit('update:modelValue', next.value); }
      if (next.open !== previous.open) emit('update:open', next.open);
    }
    watch(() => props.modelValue, value => {
      if (value === undefined) return;
      if (value === lastEmitted) { lastEmitted = undefined; state.value = { ...state.value, value }; }
      else state.value = { ...createComboboxState(props.options, value), open: state.value.open };
    });
    watch(() => props.options, options => {
      if (effective.value.value) state.value = { ...createComboboxState(options, effective.value.value), open: state.value.open };
    });
    watchEffect(() => element.value?.setCustomValidity(field.controlAttrs.value.required && !effective.value.value ? props.requiredMessage : ''));
    useFormReset(element, () => dispatch({ type: 'reset', value: props.defaultValue }));
    const outside = (event: Event) => { if (!root.value?.contains(event.target as Node)) dispatch({ type: 'close' }); };
    onMounted(() => element.value?.ownerDocument.addEventListener('pointerdown', outside));
    onBeforeUnmount(() => element.value?.ownerDocument.removeEventListener('pointerdown', outside));
    expose({ element, focus: () => element.value?.focus(), close: () => dispatch({ type: 'close' }) });
    return () => {
      const { name, form, ...inputAttrs } = attrs;
      const listId = `${field.id.value}-listbox`;
      const active = results.value[state.value.activeIndex];
      const open = effective.value.open;
      const query = effective.value.query;
      return decorate(props, field.id.value, h('div', { ref: root, class: 'nq-combobox', onFocusout: (event: FocusEvent) => { if (!root.value?.contains(event.relatedTarget as Node | null)) dispatch({ type: 'close' }); } }, [
        h('input', mergeProps(inputAttrs, field.controlAttrs.value, { ref: element, form, disabled: props.disabled, readonly: props.readonly, class: 'nq-input', type: 'text', role: 'combobox', autocomplete: 'off', 'aria-autocomplete': 'list', 'aria-readonly': props.readonly || undefined, 'aria-expanded': open, 'aria-controls': listId,
          'aria-activedescendant': open && active && !active.disabled ? `${field.id.value}-option-${state.value.activeIndex}` : undefined, value: query,
          onInput: (event: Event) => { const input = event.target as HTMLInputElement; if (blocked()) { input.value = query; return; } const nextQuery = input.value; dispatch({ type: 'input', query: nextQuery }); emit('update:query', nextQuery); },
          onFocus: (event: FocusEvent) => { if (!event.defaultPrevented) dispatch({ type: 'open' }); },
          onClick: (event: MouseEvent) => { if (!event.defaultPrevented && !open) dispatch({ type: 'open' }); },
          onKeydown: (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.isComposing || blocked()) return;
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              if (!open && (event.key === 'Home' || event.key === 'End')) return;
              event.preventDefault(); dispatch({ type: 'navigate', key: event.key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' });
            } else if (event.key === 'Enter' && open && active && !active.disabled) { event.preventDefault(); dispatch({ type: 'select', value: active.value }); }
            else if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); dispatch({ type: 'close' }); }
            else if (event.key === 'Tab') dispatch({ type: 'close' });
          },
        })),
        h('input', { type: 'hidden', name, form, disabled: props.disabled, value: effective.value.value }),
        h('ul', { id: listId, role: 'listbox', class: 'nq-listbox', 'aria-label': attrs['aria-label'], 'aria-labelledby': field.controlAttrs.value['aria-labelledby'], hidden: !open }, [
          ...results.value.map((option, index) => h('li', { key: option.value, id: `${field.id.value}-option-${index}`, role: 'option', class: 'nq-option', 'aria-selected': effective.value.value === option.value, 'aria-disabled': option.disabled || undefined,
            'data-active': state.value.activeIndex === index ? 'true' : undefined, 'data-state': state.value.activeIndex === index ? 'active' : undefined,
            onPointerdown: (event: PointerEvent) => event.preventDefault(), onClick: () => { if (!option.disabled) { dispatch({ type: 'select', value: option.value }); element.value?.focus(); } },
          }, option.label)), !results.value.length && h('li', { role: 'presentation', class: 'nq-hint' }, props.emptyMessage),
        ]),
        h('span', { class: 'nq-sr-only', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, open ? props.resultsMessage(results.value.length) : ''),
      ]));
    };
  },
});

export const Tooltip = defineComponent({
  name: 'NqTooltip', inheritAttrs: false, props: { content: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    const id = `nq-${useId()}`;
    const open = ref(false);
    const root = ref<HTMLElement>();
    let hovered = false, focused = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const show = () => { clearTimeout(hideTimer); open.value = true; };
    const hide = () => { clearTimeout(hideTimer); open.value = false; };
    const leave = () => {
      hovered = false;
      if (!focused) hideTimer = setTimeout(hide, 120);
    };
    const escape = (event: KeyboardEvent) => {
      if (!open.value || event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault(); event.stopPropagation(); hide();
    };
    watch(open, (visible, _, cleanup) => {
      const element = root.value;
      if (!visible || !element) return;
      const doc = element.ownerDocument;
      const outside = (event: PointerEvent) => { if (!element.contains(event.target as Node)) hide(); };
      doc.addEventListener('keydown', escape);
      doc.addEventListener('pointerdown', outside);
      cleanup(() => { doc.removeEventListener('keydown', escape); doc.removeEventListener('pointerdown', outside); });
    }, {flush: 'sync'});
    onBeforeUnmount(() => clearTimeout(hideTimer));
    return () => {
      const children = slots.default?.() ?? [];
      return h('span', mergeProps(attrs, {
        ref: root, 'data-nq': 'tooltip',
        onMouseenter: () => { hovered = true; show(); }, onMouseleave: leave,
        onFocusin: () => { focused = true; show(); },
        onFocusout: (event: FocusEvent) => {
          if (root.value?.contains(event.relatedTarget as Node | null)) return;
          focused = false;
          if (!hovered) hide();
        },
        onKeydown: escape,
      }), [
        ...children.map(child => isVNode(child) ? cloneVNode(child, { 'aria-describedby': joinIds(child.props?.['aria-describedby'], id) }) : child),
        h('span', { id, role: 'tooltip', class: 'nq-tooltip', hidden: !open.value }, props.content),
      ]);
    };
  },
});
