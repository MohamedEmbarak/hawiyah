// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Combobox, Dialog, Field, Tabs, TextField } from '../src/index.js';

it('hydrates stable accessible IDs without mismatches and retains working controls', async () => {
  const Application = defineComponent({
    setup() {
      const name = ref('نورة');
      const city = ref('riyadh');
      return () => h('main', { dir: 'rtl' }, [
        h(Field, { label: 'الاسم', hint: 'الاسم الكامل' }, () => h(TextField, {
          name: 'name', modelValue: name.value, 'onUpdate:modelValue': value => { name.value = value; },
        })),
        h('output', { 'data-name-output': '' }, name.value),
        h(Combobox, {
          label: 'المدينة', name: 'city', modelValue: city.value, emptyMessage: 'لا توجد خيارات', getResultsMessage: (count: number) => `${count} نتائج`,
          options: [{ value: 'riyadh', label: 'الرياض' }, { value: 'dammam', label: 'الدمام' }],
          'onUpdate:modelValue': value => { city.value = value; },
        }),
        h(Tabs, { label: 'تفاصيل الطلب', overflowLabel: 'المزيد من التبويبات', items: [
          { value: 'overview', label: 'نظرة عامة', content: 'تفاصيل' },
          { value: 'history', label: 'السجل', content: 'سجل الطلب' },
        ] }),
        h(Dialog, { title: 'مراجعة الطلب', closeLabel: 'إغلاق', open: false }, () => 'تأكيد التفاصيل'),
      ]);
    },
  });
  const markup = await renderToString(createSSRApp(Application));
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.append(container);
  const originalControls = [...container.querySelectorAll('input, [role="tab"], dialog')];
  const serverIds = [...container.querySelectorAll('[id]')].map(element => element.id);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const application = createSSRApp(Application);
  try {
    application.mount(container);
    await nextTick();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect([...container.querySelectorAll('[id]')].map(element => element.id)).toEqual(serverIds);
    expect(new Set(serverIds).size).toBe(serverIds.length);
    [...container.querySelectorAll('input, [role="tab"], dialog')].forEach((node, index) => {
      expect(node).toBe(originalControls[index]);
    });
    for (const node of container.querySelectorAll('[for], [aria-labelledby], [aria-describedby], [aria-controls]')) {
      for (const attribute of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls']) {
        node.getAttribute(attribute)?.split(' ').forEach(id => expect(document.getElementById(id)).not.toBeNull());
      }
    }
    expect(container.querySelector('dialog')!.open).toBe(false);

    const input = container.querySelector<HTMLInputElement>('input[name="name"]')!;
    input.value = 'ليان';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(container.querySelector('output')!.textContent).toBe('ليان');

    const combobox = container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    combobox.focus();
    combobox.value = 'الد';
    combobox.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(1);
    for (const key of ['ArrowDown', 'Enter']) {
      combobox.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await nextTick();
    }
    expect(combobox.value).toBe('الدمام');
    expect(container.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('dammam');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');

    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[0]!.focus();
    tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
    expect(container.querySelectorAll<HTMLElement>('[role="tabpanel"]')[1]!.hidden).toBe(false);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  } finally {
    application.unmount();
    container.remove();
    warn.mockRestore();
    error.mockRestore();
  }
});
