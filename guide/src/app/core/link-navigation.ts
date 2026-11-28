import { DOCUMENT, DestroyRef, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { bindLinkNavigation } from '@hawiyah/core';

/** A path whose last segment has a file extension (NOTICE.txt, a download) is a file, not a route. */
const FILE = /\/[^/]+\.[A-Za-z0-9]+$/;

/** The router URL for a base-relative path: no trailing slash except the root. */
export function routerUrl(path: string): string {
  const match = /^([^?#]*)(.*)$/.exec(path);
  const pathname = match?.[1] ?? '/';
  const rest = match?.[2] ?? '';
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return `${trimmed || '/'}${rest}`;
}

/**
 * Hands plain clicks on same-origin links under the base path to the router, in the
 * browser only (afterNextRender), and releases the listener with the injector that
 * bound it. Call in an injection context.
 */
export function bindGuideLinkNavigation(): void {
  const router = inject(Router);
  const document = inject(DOCUMENT);
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    const links = bindLinkNavigation(document, {
      navigate: ({ path, url }) => {
        if (FILE.test(path.split(/[?#]/)[0] ?? '')) return false;
        router.navigateByUrl(routerUrl(path)).catch((error: unknown) => {
          console.error('Guide navigation failed; loading the page instead.', error);
          document.location.assign(url.href);
        });
        return undefined;
      },
    });
    destroyRef.onDestroy(() => links.destroy());
  });
}
