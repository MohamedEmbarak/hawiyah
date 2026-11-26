// Link resolution (contentPipeline.links).
//
//   https://..., http://...          stay; external
//   #fragment                        the page's own address (+ fragment); the fragment must be a heading id of the page
//   <id>.md, <id>.ar.md of a built   a component page: '<lang>/components/<id>/reference/'; a guide (docs/guides):
//   page of any kind                 '<lang>/guides/<id>/'; a template (docs/templates): '<lang>/templates/<id>/'
//                                    (+ fragment); internal; the fragment must be a heading id of that page;
//                                    between kinds as within one (../components/button.md from a guide)
//   a malformed percent escape       HWC-LINK
//   any other repository file        GitHub blob URL (tree URL for a directory); external;
//                                    inside the build inputs (guide/build-inputs.json) it must
//                                    exist, outside them it must be listed in guide/link-targets.json
//                                    (the sparse checkout of the workflow does not hold it)
//   missing file, outside the repository, other schemes, absolute paths: HWC-LINK
//
// A page read from a copy outside the repository (--docs) resolves a link to another
// file than a page of the copy against docs/<kind>, where the page is written.
//
// Hrefs of guide pages are relative to the document base (no leading slash).

import { existsSync, statSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { BUILD_INPUTS, GITHUB_BLOB, GITHUB_TREE, LINK_TARGETS } from './config.mjs';
import { KINDS, homeDir, pageHref, pageKey } from './kinds.mjs';

const toPosix = (path) => path.split('\\').join('/');

/**
 * @param {string} url The link destination as written.
 * @param {{ lang: 'ar' | 'en', id: string, kind?: 'component' | 'guide' | 'template', filePath: string, repoDir: string,
 *           componentsDir?: string, dirs?: Record<string, string>, built: Set<string>, headingIds: Set<string>,
 *           inputs?: string[], linkTargets?: string[] }} ctx
 *   kind: the kind of the linking page (component by default); dirs: the directory each kind is read
 *   from (componentsDir and the repository's docs/guides and docs/templates by default); built: the
 *   keys of the built pages (the id of a component page, guide:<id> and template:<id>).
 * @returns {{ href: string, internal: boolean, external: boolean, crossPage?: { id: string, fragment: string } } | { error: string }}
 *   crossPage.id is the key of the linked page.
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
  const kind = ctx.kind ?? 'component';
  const dirs = {
    component: ctx.dirs?.component ?? ctx.componentsDir ?? homeDir(ctx.repoDir, 'component'),
    guide: ctx.dirs?.guide ?? homeDir(ctx.repoDir, 'guide'),
    template: ctx.dirs?.template ?? homeDir(ctx.repoDir, 'template'),
  };
  const ownKey = pageKey(kind, ctx.id);
  if (pathPart === '') {
    const id = fragment.slice(1);
    if (!ctx.headingIds.has(id)) return { error: `the link "${url}" names no heading of this page` };
    return { href: `${pageHref(kind, ctx.lang, ctx.id)}${fragment}`, internal: true, external: false };
  }
  // A page read from a copy outside the repository (--docs <dir>, G17 of the 5a fix round) is
  // written for docs/<kind>: a relative link resolves as it would there, so the copy builds as
  // the repository does; a page of the copy is linked when the copy holds it.
  const outside = (dir) => toPosix(relative(ctx.repoDir, resolve(dir))).startsWith('..');
  const target = resolve(outside(dirs[kind]) ? homeDir(ctx.repoDir, kind) : dirname(ctx.filePath), pathPart);
  const name = basename(target);
  const page = /^([a-z0-9-]+)(?:\.ar)?\.md$/.exec(name);
  if (page) {
    for (const other of Object.keys(KINDS)) {
      const source = resolve(dirs[other]);
      const here = dirname(target) === source || (outside(source) && dirname(target) === homeDir(ctx.repoDir, other));
      const key = pageKey(other, page[1]);
      if (!here || !ctx.built.has(key) || !existsSync(resolve(source, name))) continue;
      // The fragment of a link to another built page is checked against that
      // page's heading ids once every page is built (crossPage).
      const result = { href: `${pageHref(other, ctx.lang, page[1])}${fragment}`, internal: true, external: false };
      if (fragment.length > 1 && key !== ownKey) result.crossPage = { id: key, fragment: fragment.slice(1) };
      else if (fragment.length > 1 && !ctx.headingIds.has(fragment.slice(1))) return { error: `the link "${url}" names no heading of this page` };
      return result;
    }
  }
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
  const base = statSync(target).isDirectory() ? GITHUB_TREE : GITHUB_BLOB;
  return { href: `${base}${repoPath}${fragment}`, internal: false, external: true };
}
