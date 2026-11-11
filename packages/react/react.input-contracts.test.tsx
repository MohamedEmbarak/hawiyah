import { afterEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FileDropzone, PinInput, TagInput } from './src/expanded-controls.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(async () => root.unmount()); document.body.replaceChildren(); });
function mount() { const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); roots.push(root); return { host, root }; }

it('validates chooser and dropped files with the same accept policy and clears rejected selections', async () => {
  const { host, root } = mount(); const changed = vi.fn();
  await act(async () => root.render(<form><FileDropzone name="files" label="المرفقات" dropLabel="أفلت الملفات هنا" accept=".pdf" onFilesChange={changed} getRejectedMessage={() => 'PDF only'} /></form>));
  const input = host.querySelector<HTMLInputElement>('input[type=file]')!;
  const choose = async (file: File) => { Object.defineProperty(input, 'files', { configurable: true, value: [file] }); await act(async () => input.dispatchEvent(new Event('change', { bubbles: true }))); };
  const accepted = new File(['pdf'], 'document.pdf', { type: 'application/pdf' });
  await choose(accepted); expect(changed).toHaveBeenLastCalledWith([accepted]); expect(host.querySelector('li')?.textContent).toBe('document.pdf');
  await choose(new File(['text'], 'document.txt', { type: 'text/plain' }));
  expect(changed).toHaveBeenLastCalledWith([]); expect(host.querySelector('li')).toBeNull(); expect(host.textContent).toContain('PDF only');
  await choose(accepted);
  const drop = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [new File(['image'], 'image.png', { type: 'image/png' })], types: ['Files'] } });
  await act(async () => host.querySelector('.hw-file-dropzone')!.dispatchEvent(drop));
  expect(changed).toHaveBeenLastCalledWith([]); expect(host.querySelector('li')).toBeNull(); expect(host.textContent).toContain('PDF only');
});

it('requires committed tags, announces required, and permits an empty draft with existing tags', async () => {
  const { host, root } = mount();
  await act(async () => root.render(<form><TagInput label="الوسوم" name="tags" required requiredMessage="أضف وسمًا واحدًا على الأقل." getRemoveLabel={tag => `إزالة ${tag}`} defaultValue={['هوية']} /></form>));
  const form = host.querySelector('form')!; const input = host.querySelector<HTMLInputElement>('input[type=text]')!;
  expect(input.required).toBe(false); expect(input.getAttribute('aria-required')).toBe('true'); expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).getAll('tags')).toEqual(['هوية']);
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.click()); expect(form.checkValidity()).toBe(false);
  await act(async () => form.reset()); expect(form.checkValidity()).toBe(true); expect(new FormData(form).getAll('tags')).toEqual(['هوية']);
});

it('normalizes external PIN digits without mutating the controlled source', async () => {
  const { host, root } = mount(); const changed = vi.fn();
  await act(async () => root.render(<form><PinInput label="الرمز" name="pin" value="١٢٣٤٥٦٧" onValueChange={changed} /></form>));
  const form = host.querySelector('form')!; expect(new FormData(form).get('pin')).toBe('123456'); expect(form.checkValidity()).toBe(true);
  await act(async () => root.render(<form><PinInput label="الرمز" name="pin" value="۱۲" onValueChange={changed} /></form>));
  expect(new FormData(form).get('pin')).toBe('12'); expect(form.checkValidity()).toBe(false); expect(changed).not.toHaveBeenCalled();
});
