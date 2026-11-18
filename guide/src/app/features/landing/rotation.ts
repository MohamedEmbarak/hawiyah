import { DestroyRef, Injectable, effect, inject, untracked } from '@angular/core';
import { LandingState } from './state';

/** Time each command of the round stays in view, in milliseconds. */
export const ROTATION_PERIOD = 3000;

/** Share of the lead block that must be inside the viewport for the rotation to run. */
export const ROTATION_VISIBLE_RATIO = 0.5;

export type RotationHold = 'pointer' | 'focus';

/**
 * Drives the one round of the lead commands (LandingState.startRotation and
 * advanceRotation) in the browser. attach() is called from afterNextRender, so the
 * server render creates no observer and no timer. The round starts when at least
 * half of the block is inside the viewport and the document is visible; each step
 * waits ROTATION_PERIOD while the block stays in view, the document stays visible,
 * the round is running and neither the pointer nor the focus is inside the block.
 * Any of these ending clears the timer; the period starts again when all hold.
 * Under reduced motion the rotation is stopped before it starts.
 */
@Injectable()
export class LandingRotation {
  private readonly state = inject(LandingState);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private attached = false;
  private inView = false;
  private documentVisible = false;
  private readonly holds = new Set<RotationHold>();
  private readonly cleanups: (() => void)[] = [];

  constructor() {
    effect(() => {
      this.state.rotation();
      untracked(() => this.sync());
    });
    inject(DestroyRef).onDestroy(() => this.detach());
  }

  /** Starts observing the block; browser only, once. */
  attach(block: HTMLElement): void {
    const doc = block.ownerDocument;
    const view = doc.defaultView;
    if (this.attached || !view) return;
    this.attached = true;

    const motion = typeof view.matchMedia === 'function' ? view.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (motion?.matches) {
      this.state.stopRotation();
      return;
    }
    if (motion) {
      const onMotion = (event: MediaQueryListEvent) => {
        if (event.matches) this.state.stopRotation();
      };
      motion.addEventListener('change', onMotion);
      this.cleanups.push(() => motion.removeEventListener('change', onMotion));
    }

    this.documentVisible = doc.visibilityState !== 'hidden';
    const onVisibility = () => {
      this.documentVisible = doc.visibilityState !== 'hidden';
      this.sync();
    };
    doc.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(() => doc.removeEventListener('visibilitychange', onVisibility));

    const Observer = view.IntersectionObserver;
    if (typeof Observer === 'function') {
      const observer = new Observer(
        (entries) => {
          for (const entry of entries) this.inView = entry.isIntersecting && entry.intersectionRatio >= ROTATION_VISIBLE_RATIO - 0.001;
          this.sync();
        },
        { threshold: [0, ROTATION_VISIBLE_RATIO, 1] },
      );
      observer.observe(block);
      this.cleanups.push(() => observer.disconnect());
    } else {
      this.inView = true;
    }
    this.sync();
  }

  /** The pointer or the focus entered (true) or left (false) the block. */
  hold(kind: RotationHold, on: boolean): void {
    if (on) this.holds.add(kind);
    else this.holds.delete(kind);
    this.sync();
  }

  /** The pause button: pauses a running round, resumes a paused one. */
  toggle(): void {
    if (this.state.rotation() === 'running') this.state.pauseRotation();
    else this.state.resumeRotation();
  }

  /** Whether a step timer exists (for tests). */
  get pending(): boolean {
    return this.timer !== null;
  }

  private sync(): void {
    if (!this.attached) return;
    const ready = this.inView && this.documentVisible;
    if (ready && this.state.rotation() === 'idle') this.state.startRotation();
    const run = ready && this.holds.size === 0 && this.state.rotation() === 'running';
    if (run && this.timer === null) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.state.advanceRotation();
        this.sync();
      }, ROTATION_PERIOD);
    } else if (!run && this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private detach(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
    this.attached = false;
  }
}
