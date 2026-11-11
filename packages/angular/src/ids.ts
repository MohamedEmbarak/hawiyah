import { APP_ID, inject, Injectable } from '@angular/core';

/** Generated ids come from one counter per application, held by the root injector: the
 * server render and the hydration of a page create their components in the same order and
 * so produce the same ids, and two server renders of a page produce identical markup.
 * An id that the application passes as an input always wins. Applications that share a
 * document set Angular's APP_ID, which then becomes part of every generated id. */
@Injectable({ providedIn: 'root' })
export class HwIdSource {
  private readonly scope = inject(APP_ID);
  private count = 0;
  next(prefix: string): string { return `${prefix}-${this.scope === 'ng' ? '' : `${this.scope}-`}${++this.count}`; }
}

/** Call in an injection context: a field initializer or a constructor. */
export function injectId(prefix: string): string { return inject(HwIdSource).next(prefix); }
