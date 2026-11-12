import '@angular/compiler';
import { supplyText } from './fixtures/texts';
import { text } from './fixtures/application-text';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { HwFileDropzoneComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); vi.unstubAllGlobals(); });
function fixture(firstLegend = false) {
  const component = TestBed.createComponent(HwFileDropzoneComponent); supplyText(component, text.fileDropzone); component.componentRef.setInput('label', 'Upload'); component.detectChanges();
  const fieldset = document.createElement('fieldset'); fieldset.disabled = true; document.body.append(fieldset);
  if (firstLegend) { const legend = document.createElement('legend'); fieldset.append(legend); legend.append(component.nativeElement); } else fieldset.append(component.nativeElement);
  const input = component.nativeElement.querySelector('input') as HTMLInputElement; const zone = component.nativeElement.querySelector('.hw-file-dropzone') as HTMLElement;
  const changed = vi.fn(); const rejected = vi.fn(); component.componentInstance.valueChange.subscribe(changed); component.componentInstance.rejected.subscribe(rejected);
  // JSDOM has no DataTransfer; retain the actual native :disabled computation.
  let files: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: value => { files = Array.from(value); } });
  vi.stubGlobal('DataTransfer', class { files: File[] = []; items = { add: (file: File) => { this.files.push(file); } }; });
  const send = (type: string, file = new File(['a'], 'document.txt'), types = ['Files']) => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as Event & { dataTransfer: { files: File[]; types: string[]; dropEffect?: string } }; Object.defineProperty(event, 'dataTransfer', { value: { files: [file], types } });
    zone.dispatchEvent(event); component.detectChanges(); return event;
  };
  return { component, fieldset, input, zone, changed, rejected, send };
}

it('[FILEDROPZONE-09][FILEDROPZONE-11][files-8] blocks inherited-disabled drops, including disabling during drag, without changing the selection', () => {
  const f = fixture(); expect(f.input.matches(':disabled')).toBe(true);
  // A file drag over an unavailable zone is still cancelled, so that the drop is not handled by the browser, and says that nothing will be taken.
  const over = f.send('dragover'); expect(over.defaultPrevented).toBe(true); expect(over.dataTransfer.dropEffect).toBe('none'); expect(f.zone.hasAttribute('data-state')).toBe(false); expect(f.zone.hasAttribute('data-dragging')).toBe(false);
  expect(f.send('drop').defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
  f.fieldset.disabled = false; f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
  const available = f.send('dragover'); expect(available.dataTransfer.dropEffect).toBe('copy'); expect(f.zone.getAttribute('data-state')).toBe('dragging'); expect(f.zone.hasAttribute('data-dragging')).toBe(false); expect(f.zone.hasAttribute('data-dragover')).toBe(false); f.fieldset.disabled = true;
  expect(f.send('drop', new File(['b'], 'replacement.txt')).defaultPrevented).toBe(true);
  expect(f.zone.hasAttribute('data-state')).toBe(false); expect(f.changed).toHaveBeenCalledOnce(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('keeps the native first-legend exception usable', () => {
  const f = fixture(true); expect(f.input.matches(':disabled')).toBe(false);
  f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('[FILEDROPZONE-09] a read-only zone cancels a file drag with the drop effect none, shows no dragging state and takes no drop', () => {
  const f = fixture(); f.fieldset.disabled = false; f.component.componentRef.setInput('readOnly', true); f.component.detectChanges();
  const over = f.send('dragover'); expect(over.defaultPrevented).toBe(true); expect(over.dataTransfer.dropEffect).toBe('none'); expect(f.zone.hasAttribute('data-state')).toBe(false);
  expect(f.send('drop').defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
});

it('[FILEDROPZONE-10] a drag without files is left to the browser: not cancelled, no state', () => {
  const f = fixture(); f.fieldset.disabled = false;
  const over = f.send('dragover', undefined, ['text/plain']); expect(over.defaultPrevented).toBe(false); expect(over.dataTransfer.dropEffect).toBeUndefined(); expect(f.zone.hasAttribute('data-state')).toBe(false);
});

it('[FILEDROPZONE-07][files-6] leaving to a child keeps the dragging state and leaving the root clears it', () => {
  const f = fixture(); f.fieldset.disabled = false;
  f.send('dragover'); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  const leave = (relatedTarget: Element | null) => { const event = new Event('dragleave', { bubbles: true }); Object.defineProperty(event, 'relatedTarget', { value: relatedTarget }); f.zone.dispatchEvent(event); f.component.detectChanges(); };
  leave(f.input); expect(f.zone.getAttribute('data-state')).toBe('dragging');
  leave(document.body); expect(f.zone.hasAttribute('data-state')).toBe(false);
});
