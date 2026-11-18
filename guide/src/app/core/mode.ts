import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

export type Mode = 'light' | 'dark';

export const MODE_STORAGE_KEY = 'hawiyah-guide-mode';

/**
 * The colour mode. The pre-paint script sets data-hw-mode on html before Angular
 * starts; this service reads it (the template value 'light' during the server
 * render) and toggle() writes the attribute and the reader's choice.
 */
@Injectable({ providedIn: 'root' })
export class ModeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<Mode>(this.document.documentElement.getAttribute('data-hw-mode') === 'dark' ? 'dark' : 'light');
  readonly dark = computed(() => this.mode() === 'dark');

  toggle(): void {
    this.set(this.dark() ? 'light' : 'dark');
  }

  set(mode: Mode): void {
    this.mode.set(mode);
    this.document.documentElement.setAttribute('data-hw-mode', mode);
    try {
      this.document.defaultView?.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Storage may be unavailable; the attribute still applies to this document.
    }
  }
}
