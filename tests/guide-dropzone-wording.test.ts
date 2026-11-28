// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// The guide shows one wording for the dropzone selection message: the usage snippets,
// the live sample and the editor projects use the wording the guide already had.
const source = (name: string) => readFileSync(new URL(`../apps/playground/src/${name}`, import.meta.url), 'utf8');
const templates = (text: string) => [...text.matchAll(/data-hw-selected-message="([^"]*)"/g)].map(match => match[1]);

it('uses one wording for the dropzone selection message in the guide', () => {
  expect(templates(source('component-expanded-guides.ts'))).toEqual(['Selected files {count}']);
  expect(templates(source('component-expanded-guides.ar.ts'))).toEqual(['عدد الملفات المختارة {count}']);
  expect(source('expanded-samples.ts')).toContain('data-hw-selected-message="${t("Selected files {count}", "عدد الملفات المختارة {count}")}"');
  expect(source('file-projects.ts')).toContain("const count = ar ? 'عدد الملفات المختارة' : 'Selected files';");
});
