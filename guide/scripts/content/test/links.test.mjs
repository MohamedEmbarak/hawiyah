// Link resolution to guide routes and GitHub URLs.

import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveLink } from '../links.mjs';
import { componentsDir, docsDir, repoDir } from './helpers.mjs';

const ctx = (overrides = {}) => ({
  lang: 'en',
  id: 'fixture-a',
  filePath: join(componentsDir, 'fixture-a.md'),
  repoDir,
  componentsDir,
  built: new Set(['fixture-a']),
  headingIds: new Set(['api', 'javascript']),
  ...overrides,
});

describe('resolveLink', () => {
  it('keeps http and https links and marks them external', () => {
    expect(resolveLink('https://www.dga.gov.sa/', ctx())).toEqual({ href: 'https://www.dga.gov.sa/', internal: false, external: true });
    expect(resolveLink('http://example.com/a', ctx())).toMatchObject({ external: true });
  });

  it('resolves fragments of the page and checks them against heading ids', () => {
    expect(resolveLink('#api', ctx())).toEqual({ href: 'en/components/fixture-a/reference/#api', internal: true, external: false });
    expect(resolveLink('#missing', ctx())).toEqual({ error: 'the link "#missing" names no heading of this page' });
  });

  it('links a built page in the language of the linking page', () => {
    expect(resolveLink('fixture-a.md#javascript', ctx({ lang: 'ar' }))).toEqual({ href: 'ar/components/fixture-a/reference/#javascript', internal: true, external: false });
    expect(resolveLink('fixture-a.ar.md', ctx())).toEqual({ href: 'en/components/fixture-a/reference/', internal: true, external: false });
  });

  it('reports a malformed percent escape and returns the fragment of another built page for checking', () => {
    expect(resolveLink('../%E0%A4%A.md', ctx())).toEqual({ error: 'the link "../%E0%A4%A.md" has a malformed percent escape' });
    expect(resolveLink('fixture-a.md#nothing', ctx())).toEqual({ error: 'the link "fixture-a.md#nothing" names no heading of this page' });
    expect(resolveLink('fixture-a.md#api', ctx({ id: 'other', built: new Set(['fixture-a', 'other']) }))).toEqual({
      href: 'en/components/fixture-a/reference/#api', internal: true, external: false, crossPage: { id: 'fixture-a', fragment: 'api' },
    });
  });

  it('links other repository files to GitHub', () => {
    const fromRepo = (path) => `https://github.com/MohamedEmbarak/hawiyah/blob/main/${path}`;
    const relativeToRepo = join(docsDir, 'components.json').slice(repoDir.length + 1).split('\\').join('/');
    expect(resolveLink('../components.json', ctx())).toEqual({ href: fromRepo(relativeToRepo), internal: false, external: true });
    expect(resolveLink('fixture-a.md', ctx({ built: new Set() }))).toMatchObject({ internal: false, external: true });
    expect(resolveLink('..', ctx()).href).toMatch(/^https:\/\/github\.com\/MohamedEmbarak\/hawiyah\/tree\/main\//);
  });

  it('rejects missing files, absolute paths, other schemes and paths outside the repository', () => {
    expect(resolveLink('missing.md', ctx()).error).toMatch(/missing\.md, which does not exist$/);
    expect(resolveLink('/docs/x.md', ctx()).error).toMatch(/is an absolute path/);
    expect(resolveLink('mailto:a@example.com', ctx()).error).toMatch(/unsupported scheme/);
    const outside = join(...Array(12).fill('..'), 'x.md');
    expect(resolveLink(outside, ctx()).error).toMatch(/points outside the repository/);
  });

  it('accepts a repository file outside the build inputs only from the list of link targets', () => {
    const toRoot = join(...Array(7).fill('..'));
    expect(resolveLink(join(toRoot, 'CONTRACT.md'), ctx({ linkTargets: [] }))).toEqual({
      error: `the link "${join(toRoot, 'CONTRACT.md')}" points to CONTRACT.md, which is outside the files the guide build reads (guide/build-inputs.json); list it in guide/link-targets.json`,
    });
    expect(resolveLink(join(toRoot, 'CONTRACT.md#scope'), ctx({ linkTargets: ['CONTRACT.md'] }))).toEqual({
      href: 'https://github.com/MohamedEmbarak/hawiyah/blob/main/CONTRACT.md#scope', internal: false, external: true,
    });
    expect(resolveLink(join(toRoot, 'brand'), ctx({ linkTargets: ['brand/'] }))).toEqual({
      href: 'https://github.com/MohamedEmbarak/hawiyah/tree/main/brand', internal: false, external: true,
    });
    // A listed target is not read: the sparse checkout does not hold it.
    expect(resolveLink(join(toRoot, 'brand', 'no-such-file.md'), ctx({ linkTargets: ['brand/no-such-file.md'] }))).toMatchObject({ external: true });
    // Inside the build inputs a file must exist.
    expect(resolveLink(join(toRoot, 'docs', 'no-such-file.md'), ctx()).error).toMatch(/docs\/no-such-file\.md, which does not exist$/);
  });
});
