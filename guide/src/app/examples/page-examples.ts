import { Injectable, signal, type Type } from '@angular/core';
import type { ExampleSources } from './example-loader';
import type { ExampleLanguage } from './payload';

/** Everything the page block needs about one live group, resolved before render. */
export interface ExampleGroup {
  readonly id: string;
  readonly lang: ExampleLanguage;
  readonly example: string;
  /** Id of the h2 or h3 the group stands under; names the block's section. */
  readonly headingId: string;
  /** The generated native Angular component, or null when the build has none. */
  readonly native: Type<unknown> | null;
  readonly sources: ExampleSources | null;
}

/**
 * The live groups of the page being rendered. A page component provides its own
 * instance and fills it from the resolved data; every guide-example-block of that page
 * reads its group from it by example name.
 */
@Injectable()
export class PageExamples {
  private readonly groups = signal<ReadonlyMap<string, ExampleGroup>>(new Map());

  set(groups: readonly ExampleGroup[]): void {
    this.groups.set(new Map(groups.map((group) => [group.example, group])));
  }

  group(example: string): ExampleGroup | null {
    return this.groups().get(example) ?? null;
  }
}
