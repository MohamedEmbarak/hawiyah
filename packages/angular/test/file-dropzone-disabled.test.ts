import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { NqFileDropzoneComponent } from '@nasaq/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); vi.unstubAllGlobals(); });
function fixture(firstLegend = false) {
  const component = TestBed.createComponent(NqFileDropzoneComponent); component.componentRef.setInput('label', 'Upload'); component.detectChanges();
  const fieldset = document.createElement('fieldset'); fieldset.disabled = true; document.body.append(fieldset);
  if (firstLegend) { const legend = document.createElement('legend'); fieldset.append(legend); legend.append(component.nativeElement); } else fieldset.append(component.nativeElement);
  const input = component.nativeElement.querySelector('input') as HTMLInputElement; const zone = component.nativeElement.querySelector('.nq-file-dropzone') as HTMLElement;
  const changed = vi.fn(); const rejected = vi.fn(); component.componentInstance.valueChange.subscribe(changed); component.componentInstance.rejected.subscribe(rejected);
  // JSDOM has no DataTransfer; retain the actual native :disabled computation.
  let files: File[] = []; Object.defineProperty(input, 'files', { configurable: true, get: () => files, set: value => { files = Array.from(value); } });
  vi.stubGlobal('DataTransfer', class { files: File[] = []; items = { add: (file: File) => { this.files.push(file); } }; });
  const send = (type: string, file = new File(['a'], 'document.txt')) => {
    const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, 'dataTransfer', { value: { files: [file], types: ['Files'] } });
    zone.dispatchEvent(event); component.detectChanges(); return event;
  };
  return { fieldset, input, zone, changed, rejected, send };
}

it('blocks inherited-disabled drops, including disabling during drag, without changing the selection', () => {
  const f = fixture(); expect(f.input.matches(':disabled')).toBe(true);
  f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).not.toBe('true');
  expect(f.send('drop').defaultPrevented).toBe(true); expect(f.changed).not.toHaveBeenCalled(); expect(f.input.files).toHaveLength(0);
  f.fieldset.disabled = false; f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
  f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).toBe('true'); f.fieldset.disabled = true;
  expect(f.send('drop', new File(['b'], 'replacement.txt')).defaultPrevented).toBe(true);
  expect(f.zone.getAttribute('data-dragging')).not.toBe('true'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.rejected).not.toHaveBeenCalled(); expect(f.input.files![0]!.name).toBe('document.txt');
});

it('keeps the native first-legend exception usable', () => {
  const f = fixture(true); expect(f.input.matches(':disabled')).toBe(false);
  f.send('dragover'); expect(f.zone.getAttribute('data-dragging')).toBe('true');
  f.send('drop'); expect(f.changed).toHaveBeenCalledOnce(); expect(f.input.files![0]!.name).toBe('document.txt');
});
