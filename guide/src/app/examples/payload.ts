// Types of the compiled example payload (contentPipeline.compile.payload).
// Step 25 (scripts/examples) writes one payload per group, language and framework
// to .cache/examples/frames/<id>/<lang>/<example>/<framework>.json; step 45 copies
// them to <browserDir>/examples/<id>/<lang>/<example>/<framework>.json and each
// entry of `files` to <browserDir>/examples/<id>/<lang>/<example>/<framework>/<fileName>.
// <id> is the page key in its path form (guide.<id> for guide:<id>, content/kinds.ts).
import type { Type } from '@angular/core';
import { pathKey } from '../content/kinds';

export type ExampleFramework = 'vanilla' | 'react' | 'vue' | 'angular';
export type ExampleLanguage = 'ar' | 'en';
export type ExampleDirection = 'rtl' | 'ltr';

/** Frameworks in the order of a live group and of the example block tabs. */
export const EXAMPLE_FRAMEWORKS: readonly ExampleFramework[] = ['vanilla', 'react', 'vue', 'angular'];

/** Name of the module every compiled example starts from. */
export const EXAMPLE_ENTRY = 'main.js';

/** Prefix of project modules in the frame import map (hawiyah-project/<name>.js). */
export const EXAMPLE_PROJECT_PREFIX = 'hawiyah-project/';

export interface CompiledExample {
  /** Markup placed in the frame mount: '<div id="app">…</div>' or '<guide-example></guide-example>'. */
  host: string;
  entry: 'main.js';
  /** Module code by file name; relative imports are rewritten to hawiyah-project/<name>.js. */
  modules: Record<string, string>;
  /** Bundle-fallback form: one classic script whose bare imports read globalThis.HawiyahRuntime.modules. */
  classic: string;
  /** Bare specifiers the modules import, sorted. */
  imports: string[];
}

export interface ExampleToolchain {
  typescript: string;
  esbuild: string;
  vue: string;
  angular: string;
}

export interface ExamplePayload {
  /** Component page id, for example 'button'. */
  id: string;
  lang: ExampleLanguage;
  dir: ExampleDirection;
  /** Example name within the page, for example 'primary'. */
  example: string;
  framework: ExampleFramework;
  /**
   * What the reader sees and downloads, primary file first:
   * vanilla index.html (fragment) and main.js; React Example.tsx and main.tsx;
   * Vue Example.vue and main.ts; Angular example.component.ts and main.ts.
   */
  files: Record<string, string>;
  primaryFile: string;
  compiled: CompiledExample;
  toolchain: ExampleToolchain;
}

/** URL of a payload relative to the base href (the key of a guide or template in its path form, guide.<id>). */
export const examplePayloadPath = (id: string, lang: ExampleLanguage, example: string, framework: ExampleFramework): string =>
  `examples/${pathKey(id)}/${lang}/${example}/${framework}.json`;

/** URL of a downloadable source file relative to the base href. */
export const exampleFilePath = (id: string, lang: ExampleLanguage, example: string, framework: ExampleFramework, fileName: string): string =>
  `examples/${pathKey(id)}/${lang}/${example}/${framework}/${fileName}`;

/** Module of src/generated/examples/<id>/<lang>/index.ts: native Angular example components by example name. */
export interface NativeExampleModule {
  examples: Readonly<Record<string, Type<unknown>>>;
}

/** Shape of src/generated/examples/loaders.ts: '<id>/<lang>' to a lazy import of its index. */
export type NativeExampleLoaders = Readonly<Record<string, () => Promise<NativeExampleModule>>>;
