// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// One loading pattern in the package documents and in the guide: a status container that
// holds a visually hidden text and the decorative skeletons. A container that is only
// busy and labelled (aria-busy with aria-label on an element without a role) has no
// reliable name and is documented nowhere.
const file = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
// A container (not a button: a busy button keeps the name of its action, as IconButton renders it while loading).
const busyAndLabelled = /<(?!button\b)\w[^<>]*(aria-busy="true"[^<>]*aria-label|aria-label[^<>]*aria-busy="true")/u;

it('[SKELETON-03] the React, Vue and Angular READMEs document skeletons inside a status container with a visually hidden text', () => {
  for (const [path, heading] of [['packages/react/README.md', 'Loading: wrap skeletons'], ['packages/vue/README.md', 'Loading: wrap skeletons'], ['packages/angular/README.md', '### Loading skeletons']] as const) {
    const readme = file(path); const section = readme.slice(readme.indexOf(heading), readme.indexOf(heading) + 700);
    expect(section, path).toContain('role="status"'); expect(section, path).toContain('hw-sr-only'); expect(readme, path).not.toMatch(busyAndLabelled);
  }
});

it('[SKELETON-03] the guide shows the same pattern in the usage snippet, the live sample and the editor projects', () => {
  const usage = file('apps/playground/src/component-native-guides.ts').match(/skeleton: \{[\s\S]*?usage: `([^`]*)`/u)![1]!;
  expect(usage).toContain('<div role="status">'); expect(usage).toContain('<span class="hw-sr-only">Loading request details</span>'); expect(usage.match(/class="hw-skeleton" aria-hidden="true"/gu)).toHaveLength(2);
  const projects = file('apps/playground/src/project-examples.ts').match(/id === "skeleton"\) \{([\s\S]*?)\} else if/u)![1]!;
  expect(projects.match(/<div class(?:Name)?="hw-stack" role="status"><span class(?:Name)?="hw-sr-only">/gu)).toHaveLength(3); expect(projects.match(/<(?:Skeleton|hw-skeleton) /gu)).toHaveLength(9);
  const sample = file('apps/playground/src/main.ts').match(/case "skeleton":\s*return `([^`]*)`/u)![1]!;
  expect(sample).toContain('role="status"'); expect(sample).toContain('class="hw-sr-only"'); expect(sample.match(/class="hw-skeleton" aria-hidden="true"/gu)).toHaveLength(3);
  for (const path of ['apps/playground/src/component-native-guides.ts', 'apps/playground/src/component-native-guides.ar.ts', 'apps/playground/src/project-examples.ts', 'apps/playground/src/main.ts']) expect(file(path), path).not.toMatch(busyAndLabelled);
});

it('[SKELETON-03] components.json, llms.txt and docs/ document no container that is only busy and labelled', () => {
  const documents = ['components.json', 'llms.txt', ...readdirSync(new URL('../docs', import.meta.url), { recursive: true }).map(String).filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
  expect(documents.length).toBeGreaterThan(2);
  // JSON escapes the quotes of the markup it holds.
  for (const path of documents) expect(file(path).replaceAll('\\"', '"'), path).not.toMatch(busyAndLabelled);
});
