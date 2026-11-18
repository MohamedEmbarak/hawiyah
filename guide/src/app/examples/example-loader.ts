import { Injectable, TransferState, inject, makeStateKey, type Type } from '@angular/core';
import { exampleLoaders } from '../../generated/examples/loaders';
import type { CodeRun } from '../content/model';
import type { ExampleFramework, ExampleLanguage, ExamplePayload } from './payload';
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

/** Files of a payload the page block shows: the primary file, and main.js for vanilla. */
export function listedFiles(payload: Pick<ExamplePayload, 'framework' | 'files' | 'primaryFile'>): string[] {
  const names = [payload.primaryFile];
  if (payload.framework === 'vanilla' && 'main.js' in payload.files && payload.primaryFile !== 'main.js') names.push('main.js');
  return names.filter((name) => name in payload.files);
}

/** Highlighter language of a file name. */
export function listingLanguage(fileName: string): string | null {
  const extension = /\.([a-z]+)$/.exec(fileName)?.[1] ?? '';
  return ['html', 'vue', 'ts', 'tsx', 'js', 'jsx', 'css'].includes(extension) ? extension : null;
}

type Highlight = (lang: string | null, code: string) => CodeRun[][];

/**
 * The build-time highlighter of the content pipeline (Lezer, scripts/content/highlight.mjs),
 * so a listing of a compiled example gets the same roles as a Markdown listing.
 */
async function highlighter(): Promise<Highlight> {
  // @ts-expect-error: plain ES module of the build scripts, without type declarations.
  const module = (await import('../../../scripts/content/highlight.mjs')) as { highlight: Highlight };
  return module.highlight;
}

/** The compiled payload of step 25 (.cache/examples/frames/<id>/<lang>/<example>/<framework>.json). */
async function loadPayload(id: string, lang: ExampleLanguage, example: string, framework: ExampleFramework): Promise<ExamplePayload> {
  const module = (await import(`../../../.cache/examples/frames/${id}/${lang}/${example}/${framework}.json`)) as { default: ExamplePayload };
  return module.default;
}

/**
 * Loads and highlights the listings of live groups. The server render does the work
 * once per group and leaves the result in the transfer state, so the hydrating browser
 * reuses it without loading a payload or the highlighter; a client-side navigation to
 * a page that was not prerendered in this document loads both on demand.
 */
@Injectable({ providedIn: 'root' })
export class ExampleSourcesLoader {
  private readonly state = inject(TransferState);

  async load(id: string, lang: ExampleLanguage, example: string): Promise<ExampleSources> {
    const key = makeStateKey<ExampleSources>(`guide-example-sources:${id}/${lang}/${example}`);
    const cached = this.state.get(key, null);
    if (cached) return cached;
    const [highlight, payloads] = await Promise.all([
      highlighter(),
      Promise.all(EXAMPLE_FRAMEWORKS.map((framework) => loadPayload(id, lang, example, framework))),
    ]);
    const entries = payloads.map((payload) => [
      payload.framework,
      listedFiles(payload).map((fileName) => {
        const text = payload.files[fileName] ?? '';
        return { fileName, text, lines: highlight(listingLanguage(fileName), text) };
      }),
    ]);
    const sources = Object.fromEntries(entries) as ExampleSources;
    this.state.set(key, sources);
    return sources;
  }
}
