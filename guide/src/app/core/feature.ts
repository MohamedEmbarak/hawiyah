import type { EnvironmentProviders, Provider } from '@angular/core';
import type { Routes } from '@angular/router';
import type { ServerRoute } from '@angular/ssr';
import type { LANGS } from '../i18n/text';

/** A navigation entry of a feature: path relative to '<lang>/', ending in '/'. */
export interface GuideFeatureNav {
  readonly path: string;
  readonly label: { readonly en: string; readonly ar: string };
  readonly header: boolean;
  readonly footer: boolean;
}

/**
 * A guide feature, registered by src/app/features/<id>/feature.ts and collected by
 * build step 10 into src/generated/features.ts. Routes are children of the ':lang'
 * route; server route paths are relative to ':lang/'.
 */
export interface GuideFeature {
  readonly id: string;
  readonly order: number;
  readonly routes: Routes;
  readonly serverRoutes: (langs: typeof LANGS) => ServerRoute[];
  readonly nav?: GuideFeatureNav;
  readonly providers?: (Provider | EnvironmentProviders)[];
}
