import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { bindGuideLinkNavigation } from './core/link-navigation';
import { bindRouteFocus } from './core/route-focus';
import { MinimalShell } from './shell/minimal-shell';
import { SiteFooter } from './shell/site-footer';
import { SiteHeader } from './shell/site-header';

export type ShellKind = 'full' | 'minimal';

/** data.shell of the deepest activated route that sets one; null before the first navigation. */
export function shellOf(root: ActivatedRouteSnapshot): ShellKind | null {
  let route: ActivatedRouteSnapshot | null = root;
  let shell: ShellKind | null = null;
  while (route) {
    const value: unknown = route.data['shell'];
    if (value === 'full' || value === 'minimal') shell = value;
    route = route.firstChild;
  }
  return shell;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MinimalShell, SiteHeader, SiteFooter],
  // Until the initial navigation ends no shell is rendered; the prerendered nodes of
  // the shell stay in place and are hydrated when the branch is created.
  template: `@if (shell() === 'minimal') {<guide-minimal-shell />} @else if (shell() === 'full') {<guide-site-header /><main id="main" tabindex="-1"><router-outlet /></main><guide-site-footer />}`,
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  protected readonly shell = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => shellOf(this.router.routerState.snapshot.root)),
    ),
    { initialValue: null },
  );

  constructor() {
    bindGuideLinkNavigation();
    bindRouteFocus();
  }
}
