import { computed, h, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, useId } from 'vue';
import { bindFragmentLink, hasText, observeFieldValue, observeFormReset, requireText, sameValue, type FieldValueObserver, type FormResetObserver, type FragmentLink, type FragmentLinkOptions } from '@hawiyah/core';
import type { ComputedRef, InjectionKey, PropType, Ref, VNode, VNodeChild } from 'vue';

export interface FieldDecoration { label?: string; hint?: string; error?: string; required?: boolean }
export const decorationProps = { label: String, hint: String, error: String, required: { type: Boolean, default: undefined } } as const;
interface FieldContext { id: string; labelId?: string; describedby?: string; invalid?: boolean; required?: boolean }
const fieldKey: InjectionKey<ComputedRef<FieldContext>> = Symbol('hawiyah-field');
export function provideField(value: ComputedRef<FieldContext>) { provide(fieldKey, value); }
export function joinIds(...values: unknown[]): string | undefined {
  const ids = values.filter(Boolean).flatMap(value => String(value).trim().split(/\s+/)).filter(Boolean);
  return [...new Set(ids)].join(' ') || undefined;
}
export function useField(props: FieldDecoration, attrs: Record<string, unknown>, separateNestedHelpers = false) {
  const generated = `hw-${useId()}`;
  const parent = inject(fieldKey, undefined);
  const decorated = computed(() => Boolean(props.label || props.hint || props.error));
  const id = computed(() => String(attrs.id ?? parent?.value.id ?? generated));
  const decorationId = computed(() => separateNestedHelpers && parent ? generated : id.value);
  const labelId = computed(() => props.label ? `${decorationId.value}-label` : parent?.value.labelId);
  const describedby = computed(() => joinIds(attrs['aria-describedby'], parent?.value.describedby,
    props.hint && `${decorationId.value}-hint`, props.error && `${decorationId.value}-error`));
  const controlAttrs = computed(() => ({ id: id.value, 'aria-labelledby': attrs['aria-labelledby'] ?? (attrs['aria-label'] ? undefined : labelId.value),
    'aria-describedby': describedby.value, 'aria-invalid': props.error || parent?.value.invalid ? true : attrs['aria-invalid'],
    required: props.required ?? parent?.value.required }));
  return { id, decorationId, decorated, controlAttrs };
}
export function useValue<T>(read: () => T | undefined, initial: T, emit: (value: T) => void) {
  const local = ref(initial) as Ref<T>;
  const value = computed(() => read() === undefined ? local.value : read() as T);
  const sync = (next: T) => { local.value = next; };
  // Notifies only for a change: arrays and tuples are compared by content (core sameValue).
  const set = (next: T) => { const changed = !sameValue(next, value.value); sync(next); if (changed) emit(next); };
  return { value, set, sync };
}
/** Native form reset (CONTRACT.md "Native form reset"): `reset` sets the reset target after the browser has
 * reset the form's controls, and `show` writes the held value back to the native controls on the next tick,
 * so that a bound modelValue whose update was ignored is shown and submitted again. Nothing runs on the server. */
export function useFormReset(element: Ref<Element | undefined>, reset: () => void, show?: () => void) {
  let presence: FieldValueObserver | undefined;
  let resets: FormResetObserver | undefined;
  onMounted(() => {
    const control = element.value;
    if (!control) return;
    resets = observeFormReset(control, () => { reset(); void nextTick(() => show?.()); });
    if (control.matches('input, textarea, select')) presence = observeFieldValue(control as HTMLInputElement);
  });
  onUpdated(() => presence?.refresh());
  onBeforeUnmount(() => { resets?.destroy(); presence?.destroy(); });
}
/** The one required marker of a label.hw-label or legend.hw-label (convention required-marker). */
export function requiredMarker(): VNode { return h('span', { class: 'hw-required-marker', 'aria-hidden': 'true' }, ' *'); }
export type RenderContent = VNodeChild;
// Hawiyah ships no built-in strings: every text below comes from the application.
/** Required text: the value when it is usable, otherwise undefined after a one-time development warning. */
export function needText<T>(component: string, name: string, value: T, when?: string): T | undefined { return requireText(component, name, value, when) ? value : undefined; }
/** Optional text: the value when it is usable, otherwise undefined, with no warning. */
export function optionalText<T>(value: T): T | undefined { return hasText(value) ? value : undefined; }
/** Required templated text: calls the application's function with the documented arguments; nothing when the function or its result is missing. */
export function textOf<A extends unknown[]>(component: string, name: string, get: ((...args: A) => string) | undefined, args: A, when?: string): string | undefined { const fn = needText(component, name, get, when); return fn ? optionalText(fn(...args)) : undefined; }
/** Custom validity for a failed constraint. A missing message warns once and still blocks submission (a single-space validity). */
export function validity(component: string, name: string, invalid: boolean, message: string | undefined, when?: string): string { return invalid ? needText(component, name, message, when) ?? ' ' : ''; }
/** A listener declared as a prop, so that binding or removing it re-renders the action it switches on. */
export function listener<A extends unknown[]>() { return [Function, Array] as PropType<((...args: A) => void) | ((...args: A) => void)[]>; }
/** Whether a listener declared with listener() is bound. */
export function listens(handler: unknown): boolean { return typeof handler === 'function' || (Array.isArray(handler) && handler.length > 0); }
/** Accessible name of a component root. An aria-label or aria-labelledby from the application satisfies the requirement. */
export function rootLabel(component: string, value: string | undefined, attrs: Record<string, unknown>, name = 'label'): string | undefined {
  if (hasText(attrs['aria-label'])) return String(attrs['aria-label']);
  if (hasText(attrs['aria-labelledby'])) return optionalText(value);
  return needText(component, name, value);
}
/** The attributes of a component root without aria-label and aria-labelledby, which name an inner element instead. */
export function withoutName(attrs: Record<string, unknown>): Record<string, unknown> {
  const { 'aria-label': _label, 'aria-labelledby': _labelledby, ...rest } = attrs;
  return rest;
}
/** Binds packaged in-page links with core bindFragmentLink once mounted. The rendered "#id" is left as written
 * (identical on the server and on hydration) until the reader interacts with the link. */
export function useFragmentLinks(links: () => readonly (HTMLAnchorElement | null | undefined)[], options: () => FragmentLinkOptions = () => ({})) {
  const bound = new Map<HTMLAnchorElement, FragmentLink>();
  let mounted = false;
  const sync = () => {
    if (!mounted) return;
    const current = new Set(links().filter((link): link is HTMLAnchorElement => Boolean(link)));
    for (const [link, binding] of bound) if (!current.has(link)) { binding.destroy(); bound.delete(link); }
    for (const link of current) if (!bound.has(link)) bound.set(link, bindFragmentLink(link, options()));
  };
  onMounted(() => { mounted = true; sync(); });
  onUpdated(sync);
  onBeforeUnmount(() => { mounted = false; for (const binding of bound.values()) binding.destroy(); bound.clear(); });
}
/** Development check after mount: a brand made of artwork alone needs brandLabel as its accessible name. */
export function useBrandName(component: string, element: () => Element | null | undefined) {
  onMounted(() => {
    const brand = element();
    if (!brand || hasText(brand.textContent) || hasText(brand.getAttribute('aria-label')) || hasText(brand.getAttribute('aria-labelledby'))) return;
    if ([...brand.querySelectorAll('img[alt], [role="img"][aria-label], svg[aria-label]')].some(node => hasText(node.getAttribute('alt') ?? node.getAttribute('aria-label')))) return;
    requireText(component, 'brandLabel', undefined, 'the brand has no text');
  });
}
