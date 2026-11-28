import { afterEach, expect, test, vi } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { createRoot } from 'react-dom/client';
import { createElement, act } from 'react';
import { FileUploadList as ReactList } from '../packages/react/src/file-upload-list';
import { FileUploadList as VueList } from '../packages/vue/src/file-upload-list';
import { createFileUploadList } from '../packages/vanilla/src/file-upload-list';
import { fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '../packages/core/src/file-upload-state';
import * as core from '../packages/core/dist/index.js';

afterEach(() => document.body.replaceChildren());
const items: FileUploadItem[] = [
  {id:'one',name:'<unsafe>.pdf',status:'uploading',progress:150},
  {id:'two',name:'failure.pdf',status:'error',message:'Try again'},
];
// The application's copy: the strings core used to supply as fileUploadLabels.
const labels: FileUploadLabels = {
  selected: 'جاهز للرفع', uploading: 'جارٍ الرفع', complete: 'اكتمل الرفع', error: 'تعذر الرفع', remove: 'إزالة الملف',
  getProgressLabel: name => `جارٍ الرفع ${name}`, getRemoveLabel: name => `إزالة الملف ${name}`,
};
test('bounds progress without turning unknown progress into completion', () => {
  expect(fileUploadProgress(undefined)).toBeUndefined();
  expect(fileUploadProgress(NaN)).toBeUndefined();
  expect(fileUploadProgress(150)).toBe(100);
  expect(fileUploadProgress(-1)).toBe(0);
});
test('vanilla updates controlled states, escapes filenames and restores authored markup', () => {
  const host = document.createElement('div'); host.textContent = 'original'; document.body.append(host);
  const remove = vi.fn(); const list = createFileUploadList(host, {items, labels, onRemove:remove});
  expect(host.querySelector('unsafe')).toBeNull();
  expect(host.querySelector('progress')?.value).toBe(100);
  expect(host.querySelector('progress')?.getAttribute('aria-label')).toBe('جارٍ الرفع <unsafe>.pdf');
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('إزالة الملف <unsafe>.pdf');
  expect(host.textContent).toContain('جارٍ الرفع');
  host.querySelector('button')!.click(); expect(remove).toHaveBeenCalledWith('one');
  expect(host.querySelectorAll('li')).toHaveLength(2);
  list.update([{...items[0]!,progress:undefined}]);
  expect(host.querySelector('progress')?.hasAttribute('value')).toBe(false);
  list.destroy(); list.update(items); expect(host.textContent).toBe('original');
});
test('Vue emits removal requests and supports disabled controls', async () => {
  const host = document.createElement('div'); document.body.append(host); const remove = vi.fn();
  const app = createApp({render:() => h(VueList, {items,labels,removable:true,onRemove:remove})}); app.mount(host);
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('إزالة الملف <unsafe>.pdf');
  host.querySelector('button')!.click(); await nextTick(); expect(remove).toHaveBeenCalledWith('one');
  expect(host.querySelectorAll('li')).toHaveLength(2); app.unmount();
});
test('React preserves host ownership and has explicit non-submit actions', async () => {
  const host = document.createElement('div'); document.body.append(host); const remove = vi.fn(); const root = createRoot(host);
  await act(async () => root.render(createElement(ReactList,{items,labels,onRemove:remove})));
  expect(host.querySelector('button')?.type).toBe('button');
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('إزالة الملف <unsafe>.pdf');
  await act(async () => host.querySelector('button')!.click()); expect(remove).toHaveBeenCalledWith('one');
  expect(host.querySelectorAll('li')).toHaveLength(2);
  await act(async () => root.render(createElement(ReactList,{items,labels,onRemove:remove,disabled:true})));
  host.querySelector('button')!.click(); expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => root.unmount());
});
test('core no longer ships upload copy, and a list without labels renders no invented words', () => {
  expect('fileUploadLabels' in core).toBe(false);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const host = document.createElement('div'); document.body.append(host);
    const list = createFileUploadList(host, {items, onRemove: () => {}} as unknown as Parameters<typeof createFileUploadList>[1]);
    expect(host.querySelectorAll('li')).toHaveLength(2);
    expect(host.querySelector('progress')?.hasAttribute('aria-label')).toBe(false);
    expect(host.querySelector('button')?.hasAttribute('aria-label') ?? false).toBe(false);
    expect(host.textContent).not.toMatch(/الرفع|إزالة/u);
    list.destroy();
  } finally { warn.mockRestore(); }
});
