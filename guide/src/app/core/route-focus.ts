import { DOCUMENT, EnvironmentInjector, afterNextRender, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * After every client-side navigation except the initial one, moves focus to the
 * page h1 when it is focusable (tabindex -1), else to the main element. Scrolling to
 * the top is the router's (withInMemoryScrolling). Call in an injection context.
 */
export function bindRouteFocus(onNavigated?: () => void): void {
  const router = inject(Router);
  const document = inject(DOCUMENT);
  const injector = inject(EnvironmentInjector);
  let first = true;
  router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
    if (first) {
      first = false;
      return;
    }
    onNavigated?.();
    afterNextRender(
      () => {
        const main = document.getElementById('main');
        const heading = main?.querySelector('h1');
        // Package defect: hw-page-header 0.3.0 renders its h1 without tabindex and has no
        // input for it, so pages using it (the catalogue) fall back to main.
        const target = heading?.hasAttribute('tabindex') ? heading : main;
        target?.focus({ preventScroll: true });
      },
      { injector },
    );
  });
}
