import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { PasswordField } from './src/expanded-controls.js';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await act(() => root.unmount()); document.body.replaceChildren(); });
it('defaults to a labelled decorative eye, preserves readonly values/focus, blocks disabled ancestors and resets visibility', async () => {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root);
  await act(() => root.render(<form><fieldset><PasswordField label="Password" showLabel="Show password" hideLabel="Hide password" name="password" defaultValue="secret" readOnly /></fieldset></form>));
  const input = container.querySelector('input')!; const toggle = container.querySelector('button')!; const fieldset = container.querySelector('fieldset')!;
  expect(toggle.dataset.toggleVariant).toBe('icon'); expect(toggle.textContent).toBe(''); expect(toggle.querySelector('[aria-hidden=true]')).not.toBeNull(); expect(toggle.getAttribute('aria-controls')).toBe(input.id); expect(toggle.getAttribute('aria-label')).toBe('Show password');
  toggle.focus(); await act(() => toggle.click()); expect(input.type).toBe('text'); expect(input.value).toBe('secret'); expect(document.activeElement).toBe(toggle); expect(toggle.getAttribute('aria-label')).toBe('Hide password'); expect(toggle.getAttribute('aria-pressed')).toBe('true');
  fieldset.disabled = true; await act(() => toggle.dispatchEvent(new MouseEvent('click', {bubbles:true}))); expect(input.type).toBe('text'); fieldset.disabled = false;
  expect(new FormData(container.querySelector('form')!).get('password')).toBe('secret');
  await act(async () => { container.querySelector('form')!.reset(); await Promise.resolve(); }); expect(input.type).toBe('password'); expect(toggle.getAttribute('aria-pressed')).toBe('false');
});
it('supports localized text presentation and controlled visibility without replacing the input', async () => {
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root); const changed = vi.fn();
  await act(() => root.render(<PasswordField label="Password" toggleVariant="text" showLabel="إظهار" hideLabel="إخفاء" visible={false} onVisibleChange={changed} />));
  const input = container.querySelector('input')!; const toggle = container.querySelector('button')!;
  expect(toggle.textContent).toBe('إظهار'); expect(toggle.querySelector('.hw-password-icon')).toBeNull();
  await act(() => toggle.click()); expect(changed).toHaveBeenCalledExactlyOnceWith(true); expect(input.type).toBe('password'); expect(container.querySelector('input')).toBe(input);
});
