import { Injectable, TransferState, inject, makeStateKey, type Type } from '@angular/core';
import { exampleListingLoaders, exampleLoaders } from '../../generated/examples/loaders';
import type { CodeRun } from '../content/model';
import type { ExampleFramework, ExampleLanguage } from './payload';
import { EXAMPLE_FRAMEWORKS } from './payload';

/** One listing of the page block: a file of the compiled example, highlighted. */
export interface ExampleListing {
  readonly fileName: string;
  /** Text the copy button copies: the complete file. */
  readonly text: string;
  readonly lines: readonly (readonly CodeRun[])[];
}

/** The listings of one group per framework, primary file first (vanilla also main.js). */
export type ExampleSources = Readonly<Record<ExampleFramework, readonly ExampleListing[]>>;

/** Native Angular example components of one page and language, by example name. */
export async function loadNativeExamples(id: string, lang: ExampleLanguage): Promise<Readonly<Record<string, Type<unknown>>>> {
  const load = exampleLoaders[`${id}/${lang}`];
  if (!load) return {};
  return (await load()).examples;
}

/** listings.json of one page and language: example -> framework -> listings. */
type PageListings = Readonly<Record<string, Partial<Record<ExampleFramework, readonly ExampleListing[]>>>>;

/**
 * Loads the listings of live groups, highlighted at build time by step 25
 * (src/generated/examples/<id>/<lang>/listings.json). The server
 * render leaves the result in the transfer state, so the hydrating browser reuses it
 * without loading the listings chunk; a client-side navigation loads it on demand.
 */
@Injectable({ providedIn: 'root' })
export class ExampleSourcesLoader {
  private readonly state = inject(TransferState);

  async load(id: string, lang: ExampleLanguage, example: string): Promise<ExampleSources | null> {
    const key = makeStateKey<ExampleSources>(`guide-example-sources:${id}/${lang}/${example}`);
    const cached = this.state.get(key, null);
    if (cached) return cached;
    const loader = exampleListingLoaders[`${id}/${lang}`];
    if (!loader) return null;
    const page = (await loader()).default as PageListings;
    const group = page[example];
    if (!group) return null;
    const sources = Object.fromEntries(EXAMPLE_FRAMEWORKS.map((framework) => [framework, group[framework] ?? []])) as ExampleSources;
    this.state.set(key, sources);
    return sources;
  }
}
