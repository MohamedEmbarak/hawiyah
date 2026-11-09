import { expect, it, vi } from 'vitest';
import { act, StrictMode, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Combobox, Dialog, Field, Tabs, TextField } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function HydratedApplication() {
  const [city, setCity] = useState('riyadh');
  return <main>
    <form>
      <Field label="Reference" hint="Keep your reference number">
        <TextField name="reference" defaultValue="HW-1024" />
      </Field>
      <Combobox label="City" name="city" required value={city} onValueChange={setCity} options={[
        { value: 'riyadh', label: 'الرياض' },
        { value: 'jeddah', label: 'جدة', disabled: true },
        { value: 'abha', label: 'أبها' },
      ]} />
    </form>
    <Tabs dir="rtl" label="Application sections" items={[
      { value: 'details', label: 'Details', content: 'Application details' },
      { value: 'unavailable', label: 'Unavailable', content: 'Unavailable section', disabled: true },
      { value: 'review', label: 'Review', content: 'Application review' },
    ]} />
    <Dialog title="Confirm application" description="Review the information before submitting.">Ready to submit</Dialog>
  </main>;
}

it('hydrates generated associations without recovery or node replacement and retains keyboard behavior', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const identifierPrefix = 'hawiyah-hydration-';
  const recoverableError = vi.fn();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root: Root | undefined;
  try {
    container.innerHTML = renderToString(<StrictMode><HydratedApplication /></StrictMode>, { identifierPrefix });
    const serverNodes = [...container.querySelectorAll<HTMLElement>('[id]')];
    const serverIds = serverNodes.map(node => node.id);
    const reference = container.querySelector<HTMLInputElement>('[name=reference]')!;
    const city = container.querySelector<HTMLInputElement>('[role=combobox]')!;
    const dialog = container.querySelector('dialog')!;
    const form = container.querySelector('form')!;
    expect(serverIds.length).toBeGreaterThan(0);
    expect(serverIds.every(id => id.includes(identifierPrefix))).toBe(true);
    expect(city.value).toBe('الرياض');
    expect(new FormData(form).get('city')).toBe('riyadh');
    expect(dialog.open).toBe(false);

    await act(async () => {
      root = hydrateRoot(container, <StrictMode><HydratedApplication /></StrictMode>, {
        identifierPrefix,
        onRecoverableError: recoverableError,
      });
    });

    const hydratedNodes = [...container.querySelectorAll<HTMLElement>('[id]')];
    expect(hydratedNodes.map(node => node.id)).toEqual(serverIds);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.querySelector('[name=reference]')).toBe(reference);
    expect(container.querySelector('label')?.htmlFor).toBe(reference.id);
    expect(document.getElementById(reference.getAttribute('aria-describedby')!)?.textContent).toBe('Keep your reference number');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Confirm application');
    expect(dialog.open).toBe(false);
    for (const element of container.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls]')) {
      for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
        for (const id of element.getAttribute(attribute)?.split(' ') ?? []) {
          expect(container.contains(document.getElementById(id))).toBe(true);
        }
      }
    }

    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    await act(async () => tabs[0]!.focus());
    await act(async () => tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById(tabs[2]!.getAttribute('aria-controls')!)!.hidden).toBe(false);
    expect(container.querySelectorAll('[role=tabpanel]:not([hidden])')).toHaveLength(1);

    await act(async () => city.focus());
    await act(async () => city.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })));
    expect(document.getElementById(city.getAttribute('aria-activedescendant')!)?.textContent).toBe('أبها');
    await act(async () => city.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(city);
    expect(city.value).toBe('أبها');
    expect(city.getAttribute('aria-expanded')).toBe('false');
    expect(new FormData(form).get('city')).toBe('abha');
    expect(city.checkValidity()).toBe(true);
    expect(recoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    container.remove();
    consoleError.mockRestore();
  }
});
