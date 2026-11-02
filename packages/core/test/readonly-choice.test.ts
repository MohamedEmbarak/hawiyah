import { expect, test } from 'vitest';
import { observeReadonlyChoice } from '../src/readonly-choice';

test('read-only radios preserve peers, reset and cleanup', async () => {
  document.body.innerHTML = '<form><input type="radio" name="x" value="a" checked><input type="radio" name="x" value="b" readonly></form>';
  const [first, locked] = Array.from(document.querySelectorAll('input'));
  const guard = observeReadonlyChoice(locked!);
  locked!.click(); await Promise.resolve();
  expect(first!.checked).toBe(true); expect(locked!.checked).toBe(false);
  first!.checked = false; first!.form!.reset(); await Promise.resolve();
  locked!.click(); await Promise.resolve(); expect(first!.checked).toBe(true);
  guard.destroy(); locked!.click(); expect(locked!.checked).toBe(true);
});

test('read-only checkbox blocks keyboard activation without blocking focus keys', () => {
  const input = document.createElement('input'); input.type = 'checkbox'; input.readOnly = true;
  document.body.append(input); const guard = observeReadonlyChoice(input);
  const space = new KeyboardEvent('keydown', { key: ' ', cancelable: true }); input.dispatchEvent(space);
  expect(space.defaultPrevented).toBe(true);
  const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }); input.dispatchEvent(tab);
  expect(tab.defaultPrevented).toBe(false); guard.destroy(); input.remove();
});
