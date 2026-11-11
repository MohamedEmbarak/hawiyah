// @vitest-environment node
import { expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Combobox, Dialog, Field, Tabs, TextField } from '../src/index.js';
import { comboboxText, dialogText, tabsText } from './texts.js';

it('renders on the server with unique, linked IDs and no browser globals', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('main', {}, [
    h(Field, { label: 'Name' }, () => h(TextField)),
    h(Combobox, { ...comboboxText, label: 'City', options: [{ value: 'r', label: 'Riyadh' }] }),
    h(Tabs, { ...tabsText, label: 'Steps', items: [{ value: 'one', label: 'One', content: 'First' }] }),
    h(Dialog, { ...dialogText, title: 'Review', open: true }, () => 'Confirm your details'),
  ]) }));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  expect(new Set(ids).size).toBe(ids.length);
  expect(html).toContain('role="combobox"'); expect(html).toContain('role="tablist"');
  expect(html).not.toContain('<dialog open');
  for (const match of html.matchAll(/(?:for|aria-controls|aria-labelledby)="([^"]+)"/g)) {
    match[1]!.split(' ').forEach(id => expect(ids).toContain(id));
  }
});
