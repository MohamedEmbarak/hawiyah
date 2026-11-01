import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { FileDropzone } from '../src/controls.js';

const apps: App[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });
function fixture(firstLegend = false) {
  const container = document.createElement('div'); document.body.append(container); const changed = vi.fn(); const rejected = vi.fn();
  const app = createApp({ render() { const picker = h(FileDropzone, { label: 'Upload', 'onUpdate:files': changed, onReject: rejected }); return h('fieldset', { disabled: true }, firstLegend ? h('legend', {}, picker) : picker); } });
  apps.push(app); app.mount(container);
  const input = container.querySelector('input')!; const zone = container.querySelector('.nq-file-dropzone')!;
  // JSDOM has no DataTransfer; retain the actual native :disabled computation.
  let files: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: value => { files = Array.from(value); } });
  const send = async (type: string, file = new File(['a'], 'document.txt')) => {
    const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, 'dataTransfer', { value: { files: [file], types: ['Files'] } });
    zone.dispatchEvent(event); await nextTick(); return event;
  };
  return { fieldset: container.querySelector('fieldset')!, input, zone, changed, rejected, send };
}

it('blocks inherited-disabled drops, including disabling during drag, without changing the selection', async () => {
  const f = fixture(); expect(f.input.matches(':disabled')).toBe(true);
  await f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).not.toBe('true');
  expect((await f.send('drop')).defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
  f.fieldset.disabled = false; await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
  await f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).toBe('true'); f.fieldset.disabled = true;
  expect((await f.send('drop', new File(['b'], 'replacement.txt'))).defaultPrevented).toBe(true);
  expect(f.zone.getAttribute('data-dragging')).not.toBe('true'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('keeps the native first-legend exception usable', async () => {
  const f = fixture(true); expect(f.input.matches(':disabled')).toBe(false);
  await f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).toBe('true');
  await f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});
