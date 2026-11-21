// Link resolution (contentPipeline.links).
//
//   https://..., http://...          stay; external
//   #fragment                        '<lang>/components/<id>/reference/#fragment'; the fragment must be a heading id of the page
//   <id>.md, <id>.ar.md (built)      '<lang>/components/<id>/reference/' (+ fragment); internal;
//                                    the fragment must be a heading id of that page
//   a malformed percent escape       HWC-LINK
//   any other repository file        GitHub blob URL (tree URL for a directory); external;
//                                    inside the build inputs (guide/build-inputs.json) it must
//                                    exist, outside them it must be listed in guide/link-targets.json
//                                    (the sparse checkout of the workflow does not hold it)
//   missing file, outside the repository, other schemes, absolute paths: HWC-LINK
//
// A page read from a copy outside the repository (--docs) resolves a link to another
// file than a page of the copy against docs/components, where the page is written.
//
// Hrefs of guide pages are relative to the document base (no leading slash).

import { existsSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { BUILD_INPUTS, GITHUB_BLOB, GITHUB_TREE, LINK_TARGETS } from './config.mjs';

const toPosix = (path) => path.split('\\').join('/');

/**
 * @param {string} url The link destination as written.
 * @param {{ lang: 'ar' | 'en', id: string, filePath: string, repoDir: string, componentsDir: string,
 *           built: Set<string>, headingIds: Set<string>, inputs?: string[], linkTargets?: string[] }} ctx
 * @returns {{ href: string, internal: boolean, external: boolean } | { error: string }}
 */
export function resolveLink(url, ctx) {
  if (/^https?:\/\//i.test(url)) return { href: url, internal: false, external: true };
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return { error: `the link "${url}" uses an unsupported scheme; use https or a relative path` };
  if (url.startsWith('/')) return { error: `the link "${url}" is an absolute path; write a path relative to this file` };
  const hashIndex = url.indexOf('#');
  let pathPart;
  try {
    pathPart = decodeURI(hashIndex < 0 ? url : url.slice(0, hashIndex)).split('?')[0];
  } catch {
    return { error: `the link "${url}" has a malformed percent escape` };
  }
  const fragment = hashIndex < 0 ? '' : url.slice(hashIndex);
  const pageHref = (id) => `${ctx.lang}/components/${id}/reference/`;
  if (pathPart === '') {
    const id = fragment.slice(1);
    if (!ctx.headingIds.has(id)) return { error: `the link "${url}" names no heading of this page` };
    return { href: `${pageHref(ctx.id)}${fragment}`, internal: true, external: false };
  }
  // A page read from a copy outside the repository (--docs <dir>, G17 of the 5a fix round) is
  // written for docs/components: a link to another file than a page of the copy resolves as it
  // would there, so the copy builds as the repository does.
  const outside = toPosix(relative(ctx.repoDir, resolve(ctx.componentsDir))).startsWith('..');
  const samePage = /^[a-z0-9-]+(?:\.ar)?\.md$/.test(pathPart);
  const pageId = samePage ? pathPart.replace(/(?:\.ar)?\.md$/, '') : null;
  if (outside && samePage && ctx.built.has(pageId) && existsSync(resolve(ctx.componentsDir, pathPart))) {
    const result = { href: `${pageHref(pageId)}${fragment}`, internal: true, external: false };
    if (fragment.length > 1 && pageId !== ctx.id) result.crossPage = { id: pageId, fragment: fragment.slice(1) };
    else if (fragment.length > 1 && !ctx.headingIds.has(fragment.slice(1))) return { error: `the link "${url}" names no heading of this page` };
    return result;
  }
  const target = resolve(outside ? resolve(ctx.repoDir, 'docs', 'components') : dirname(ctx.filePath), pathPart);
  const repoPath = toPosix(relative(ctx.repoDir, target));
  if (repoPath.startsWith('..') || repoPath === '') return { error: `the link "${url}" points outside the repository` };
  // A path is inside an entry when it is the entry or lies below a directory entry.
  const within = (list) => list.some((entry) => (entry.endsWith('/') ? `${repoPath}/`.startsWith(entry) : repoPath === entry));
  if (!within(ctx.inputs ?? BUILD_INPUTS)) {
    const listed = (ctx.linkTargets ?? LINK_TARGETS).find((entry) => entry === repoPath || entry === `${repoPath}/`);
    if (!listed) {
      return { error: `the link "${url}" points to ${repoPath}, which is outside the files the guide build reads (guide/build-inputs.json); list it in guide/link-targets.json` };
    }
    return { href: `${listed.endsWith('/') ? GITHUB_TREE : GITHUB_BLOB}${repoPath}${fragment}`, internal: false, external: true };
  }
  if (!existsSync(target)) return { error: `the link "${url}" points to ${repoPath}, which does not exist` };
  if (toPosix(dirname(target)) === toPosix(ctx.componentsDir)) {
    const match = /^([a-z0-9-]+)(?:\.ar)?\.md$/.exec(target.slice(dirname(target).length + 1));
    // The fragment of a link to another built page is checked against that
    // page's heading ids once every page is built (crossPage).
    if (match && ctx.built.has(match[1])) {
      const result = { href: `${pageHref(match[1])}${fragment}`, internal: true, external: false };
      if (fragment.length > 1 && match[1] !== ctx.id) result.crossPage = { id: match[1], fragment: fragment.slice(1) };
      else if (fragment.length > 1 && !ctx.headingIds.has(fragment.slice(1))) return { error: `the link "${url}" names no heading of this page` };
      return result;
    }
  }
  const base = statSync(target).isDirectory() ? GITHUB_TREE : GITHUB_BLOB;
  return { href: `${base}${repoPath}${fragment}`, internal: false, external: true };
}
