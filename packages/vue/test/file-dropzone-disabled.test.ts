import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { FileDropzone } from '../src/controls.js';
import { dropzoneText } from './texts.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
function fixture(firstLegend = false) {
  const container = document.createElement('div'); document.body.append(container); const changed = vi.fn(); const rejected = vi.fn();
  const app = createApp({ render() { const picker = h(FileDropzone, { ...dropzoneText, label: 'Upload', 'onUpdate:files': changed, onReject: rejected }); return h('fieldset', { disabled: true }, firstLegend ? h('legend', {}, picker) : picker); } });
  apps.push(app); app.mount(container);
  const input = container.querySelector('input')!; const zone = container.querySelector('.hw-file-dropzone')!;
  // JSDOM has no DataTransfer; retain the actual native :disabled computation.
  let files: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: value => { files = Array.from(value); } });
  const send = async (type: string, file = new File(['a'], 'document.txt')) => {
    const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, 'dataTransfer', { value: { files: [file], types: ['Files'], dropEffect: 'none' } });
    zone.dispatchEvent(event); await nextTick(); return event as Event & { dataTransfer: { dropEffect: string } };
  };
  return { fieldset: container.querySelector('fieldset')!, input, zone, changed, rejected, send };
}

it('blocks inherited-disabled drops, including disabling during drag, without changing the selection', async () => {
  const f = fixture(); expect(f.input.matches(':disabled')).toBe(true);
  await f.send('dragover'); expect(f.zone.getAttribute('data-state')).not.toBe('dragging');
  expect((await f.send('drop')).defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
  f.fieldset.disabled = false; await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
  await f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging'); f.fieldset.disabled = true;
  expect((await f.send('drop', new File(['b'], 'replacement.txt'))).defaultPrevented).toBe(true);
  expect(f.zone.getAttribute('data-state')).not.toBe('dragging'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('keeps the native first-legend exception usable', async () => {
  const f = fixture(true); expect(f.input.matches(':disabled')).toBe(false);
  await f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('[FILEDROPZONE-09][files-8] a file dragover on a disabled or read-only zone is cancelled with dropEffect none and sets no dragging state', async () => {
  const f = fixture();
  const event = await f.send('dragover');
  expect(event.defaultPrevented).toBe(true); expect(event.dataTransfer.dropEffect).toBe('none'); expect(f.zone.hasAttribute('data-state')).toBe(false);
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp({ render: () => h(FileDropzone, { ...dropzoneText, label: 'Upload', readonly: true }) }); apps.push(app); app.mount(container);
  const zone = container.querySelector('.hw-file-dropzone')!;
  const over = new Event('dragover', { bubbles: true, cancelable: true }); Object.defineProperty(over, 'dataTransfer', { value: { files: [], types: ['Files'], dropEffect: 'copy' } });
  zone.dispatchEvent(over); await nextTick();
  expect(over.defaultPrevented).toBe(true); expect((over as Event & { dataTransfer: { dropEffect: string } }).dataTransfer.dropEffect).toBe('none'); expect(zone.hasAttribute('data-state')).toBe(false);
  expect(zone.hasAttribute('data-dragging')).toBe(false); expect(zone.hasAttribute('data-dragover')).toBe(false);
});

it('[FILEDROPZONE-10] a dragover without files is not cancelled and sets no state', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const app = createApp({ render: () => h(FileDropzone, { ...dropzoneText, label: 'Upload' }) }); apps.push(app); app.mount(container);
  const zone = container.querySelector('.hw-file-dropzone')!;
  const over = new Event('dragover', { bubbles: true, cancelable: true }); Object.defineProperty(over, 'dataTransfer', { value: { files: [], types: ['text/plain'], dropEffect: 'move' } });
  zone.dispatchEvent(over); await nextTick();
  expect(over.defaultPrevented).toBe(false); expect(zone.hasAttribute('data-state')).toBe(false);
});

it('[FILEDROPZONE-11] a drop on a disabled zone, also one disabled during the drag, changes and notifies nothing', async () => {
  const f = fixture();
  expect((await f.send('drop')).defaultPrevented).toBe(true);
  expect(f.changed).not.toHaveBeenCalled(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
});
