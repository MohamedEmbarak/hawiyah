// Link resolution (contentPipeline.links).
//
//   https://..., http://...          stay; external
//   #fragment                        '<lang>/components/<id>/reference/#fragment'; the fragment must be a heading id of the page
//   <id>.md, <id>.ar.md (built)      '<lang>/components/<id>/reference/' (+ fragment); internal
//   any other repository file        GitHub blob URL (tree URL for a directory); external
//   missing file, outside the repository, other schemes, absolute paths: HWC-LINK
//
// Hrefs of guide pages are relative to the document base (no leading slash).

import { existsSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { GITHUB_BLOB, GITHUB_TREE } from './config.mjs';

const toPosix = (path) => path.split('\\').join('/');

/**
 * @param {string} url The link destination as written.
 * @param {{ lang: 'ar' | 'en', id: string, filePath: string, repoDir: string, componentsDir: string,
 *           built: Set<string>, headingIds: Set<string> }} ctx
 * @returns {{ href: string, internal: boolean, external: boolean } | { error: string }}
 */
export function resolveLink(url, ctx) {
  if (/^https?:\/\//i.test(url)) return { href: url, internal: false, external: true };
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return { error: `the link "${url}" uses an unsupported scheme; use https or a relative path` };
  if (url.startsWith('/')) return { error: `the link "${url}" is an absolute path; write a path relative to this file` };
  const hashIndex = url.indexOf('#');
  const pathPart = decodeURI(hashIndex < 0 ? url : url.slice(0, hashIndex)).split('?')[0];
  const fragment = hashIndex < 0 ? '' : url.slice(hashIndex);
  const pageHref = (id) => `${ctx.lang}/components/${id}/reference/`;
  if (pathPart === '') {
    const id = fragment.slice(1);
    if (!ctx.headingIds.has(id)) return { error: `the link "${url}" names no heading of this page` };
    return { href: `${pageHref(ctx.id)}${fragment}`, internal: true, external: false };
  }
  const target = resolve(dirname(ctx.filePath), pathPart);
  const repoPath = toPosix(relative(ctx.repoDir, target));
  if (repoPath.startsWith('..') || repoPath === '') return { error: `the link "${url}" points outside the repository` };
  if (!existsSync(target)) return { error: `the link "${url}" points to ${repoPath}, which does not exist` };
  if (toPosix(dirname(target)) === toPosix(ctx.componentsDir)) {
    const match = /^([a-z0-9-]+)(?:\.ar)?\.md$/.exec(target.slice(dirname(target).length + 1));
    if (match && ctx.built.has(match[1])) return { href: `${pageHref(match[1])}${fragment}`, internal: true, external: false };
  }
  const base = statSync(target).isDirectory() ? GITHUB_TREE : GITHUB_BLOB;
  return { href: `${base}${repoPath}${fragment}`, internal: false, external: true };
}
