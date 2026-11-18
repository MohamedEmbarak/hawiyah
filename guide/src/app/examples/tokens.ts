import { InjectionToken, type Type } from '@angular/core';
import type { ExampleFramework, ExampleLanguage } from './payload';

/** Frameworks whose result is rendered in a sandboxed frame instead of in the page. */
export type FrameFramework = Exclude<ExampleFramework, 'angular'>;

/** What a frame result reports to the page block, which composes the status text. */
export type ExampleFrameStatus =
  | { readonly state: 'loading' }
  | { readonly state: 'ready'; readonly bundledRuntime: boolean }
  | { readonly state: 'failed'; readonly message: string };

/**
 * Inputs the page block passes, through NgComponentOutlet, to the component that
 * EXAMPLE_FRAME_RESULT names.
 */
export type ExampleFrameResultInputs = {
  readonly id: string;
  readonly lang: ExampleLanguage;
  readonly example: string;
  readonly framework: FrameFramework;
  readonly report: (status: ExampleFrameStatus) => void;
};

/**
 * The component type that renders a vanilla, React or Vue result (FrameResult, from
 * src/app/examples/frame/ in stage 4b, provided by the frame-runtime feature). Without
 * a provider the page block keeps the native Angular result for every tab.
 */
export const EXAMPLE_FRAME_RESULT = new InjectionToken<Type<unknown>>('EXAMPLE_FRAME_RESULT');
