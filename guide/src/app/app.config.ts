import { ViewportScroller } from '@angular/common';
import { APP_ID, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { features } from '../generated/features';
import { GuideViewportScroller } from './core/viewport-scroller';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Fragment links of every page, including in-page links that reach the router
      // because its addresses have no trailing slash, scroll to and focus their target
      // through GuideViewportScroller.
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideClientHydration(withEventReplay()),
    { provide: APP_ID, useValue: 'hwg' },
    { provide: ViewportScroller, useClass: GuideViewportScroller },
    ...features.flatMap((feature) => feature.providers ?? []),
  ],
};
