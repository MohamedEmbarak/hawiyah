// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// The documents state what the code does; the behaviour itself is covered by the adapter tests.
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');

it('documents the PortalLayout texts in each adapter README and portal guide', () => {
  for (const adapter of ['react', 'vue', 'angular']) for (const file of ['README.md', 'PORTAL.md']) {
    const text = read(`packages/${adapter}/${file}`);
    for (const name of ['skipLabel', 'menuLabel', 'navigationLabel', 'secondaryLabel', 'breadcrumbLabel', 'footerLabel']) expect(text, `${adapter} ${file}: ${name}`).toContain(`\`${name}\``);
  }
});

it('states the vanilla precedence as the code applies it', () => {
  const contract = read('CONTRACT.md');
  expect(contract).toContain('Vanilla uses authored markup as written; otherwise the controller option of the same name; otherwise `data-hw-<name>` on the controller root');
  expect(contract).toContain('An authored name of a root or landmark (`aria-label`, `aria-labelledby`) is never replaced.');
  expect(contract).not.toMatch(/from `data-hw-<name>` on the controller root \([^)]*\), then from the controller option/);
  expect(read('packages/vanilla/README.md')).toMatch(/2\. The controller option of the same name\. 3\. An attribute on the controller root/);
});

it('states that an Angular warning names the selector', () => {
  expect(read('CONTRACT.md')).toContain('the selector in Angular (`Hawiyah: hw-file-dropzone requires "label"`)');
  expect(read('packages/angular/README.md')).toMatch(/Hawiyah: hw-[a-z-]+ requires/);
});
