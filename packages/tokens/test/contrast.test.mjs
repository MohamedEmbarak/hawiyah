import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = JSON.parse(await readFile(new URL('../tokens.json', import.meta.url), 'utf8'));
// Alpha semantic backgrounds must be measured after compositing on their surface.
const rgb = (hex, backdrop = [1, 1, 1]) => {
  assert.match(hex, /^#[\da-f]{6}([\da-f]{2})?$/i);
  const alpha = hex.length === 9 ? Number.parseInt(hex.slice(7), 16) / 255 : 1;
  return [1, 3, 5].map((index, channel) =>
    Number.parseInt(hex.slice(index, index + 2), 16) / 255 * alpha + backdrop[channel] * (1 - alpha));
};
const luminance = (channels) => channels
  .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
const ratio = (foreground, background, surface = '#ffffff') => {
  const back = rgb(background, rgb(surface));
  const [low, high] = [luminance(rgb(foreground, back)), luminance(back)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
};

for (const [name, theme] of Object.entries(source.themes)) {
  if (name.startsWith('$')) continue;
  for (const [mode, values] of Object.entries(theme)) {
    const color = Object.fromEntries(Object.entries(values.color).map(([key, value]) => [key, value.$value]));
    test(`${name} ${mode}: text and semantic status pairs meet 4.5:1`, () => {
      const pairs = [
        ['on-primary', 'primary'], ['primary-text', 'primary-subtle'],
        ['success', 'success-subtle'], ['warning', 'warning-subtle'],
        ['danger', 'danger-subtle'], ['info', 'info-subtle'], ['on-inverse', 'inverse'],
        ...['text', 'text-muted', 'text-subtle'].flatMap(foreground =>
          ['canvas', 'surface', 'surface-muted', 'surface-raised'].map(background => [foreground, background])),
      ];
      for (const [foreground, background] of pairs) {
        const measured = Math.min(...['canvas', 'surface'].map(surface => ratio(color[foreground], color[background], color[surface])));
        assert.ok(measured >= 4.5, `${foreground}/${background}: ${measured.toFixed(2)}:1`);
      }
    });
    test(`${name} ${mode}: control and focus boundaries meet 3:1`, () => {
      for (const foreground of ['border-strong', 'focus']) {
        for (const background of ['canvas', 'surface']) {
          const measured = Math.min(...['canvas', 'surface'].map(surface => ratio(color[foreground], color[background], color[surface])));
          assert.ok(measured >= 3, `${foreground}/${background}: ${measured.toFixed(2)}:1`);
        }
      }
    });
  }
}
