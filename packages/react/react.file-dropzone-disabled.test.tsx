import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { FileDropzone } from './src/expanded-controls.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); vi.unstubAllGlobals(); });

async function fixture(firstLegend = false) {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root); const changed = vi.fn();
  const picker = <FileDropzone label="Upload" onFilesChange={changed} />;
  await act(() => root.render(<fieldset disabled>{firstLegend ? <legend>{picker}</legend> : picker}</fieldset>));
  const input = container.querySelector('input')!; const zone = container.querySelector('.nq-file-dropzone')!;
  // JSDOM has no DataTransfer; retain the actual native :disabled computation.
  let files: File[] = [];
  Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: value => { files = Array.from(value); } });
  vi.stubGlobal('DataTransfer', class { files: File[] = []; items = { add: (file: File) => { this.files.push(file); } }; });
  const send = async (type: string, file = new File(['a'], 'document.txt')) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files: [file], types: ['Files'] } });
    await act(() => zone.dispatchEvent(event)); return event;
  };
  return { fieldset: container.querySelector('fieldset')!, input, zone, changed, send };
}

it('blocks inherited-disabled drops, including disabling during drag, without changing the selection', async () => {
  const f = await fixture(); expect(f.input.matches(':disabled')).toBe(true);
  expect((await f.send('dragover')).defaultPrevented).toBe(true); expect(f.zone.getAttribute('data-state')).not.toBe('dragging');
  expect((await f.send('drop')).defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
  f.fieldset.disabled = false; await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
  await f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  f.fieldset.disabled = true;
  expect((await f.send('drop', new File(['b'], 'replacement.txt'))).defaultPrevented).toBe(true);
  expect(f.zone.getAttribute('data-state')).not.toBe('dragging'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('keeps the native first-legend exception usable', async () => {
  const f = await fixture(true); expect(f.input.matches(':disabled')).toBe(false);
  await f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});
