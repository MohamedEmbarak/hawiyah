import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockIds } from '../../content/code-block';
import { LandingLead } from './lead';
import { LandingRotation, ROTATION_PERIOD } from './rotation';
import { DEFAULT_FRAMEWORK, INSTALL, LandingState, longestCommand, nextFramework } from './state';

/** A browser view the test controls: viewport intersection, document visibility, reduced motion. */
class FakeView {
  reduced = false;
  observed: { callback: (entries: { isIntersecting: boolean; intersectionRatio: number }[]) => void } | null = null;
  readonly docListeners = new Map<string, () => void>();
  visibilityState: 'visible' | 'hidden' = 'visible';

  readonly block = {
    ownerDocument: {
      get visibilityState() {
        return view.visibilityState;
      },
      addEventListener: (type: string, listener: () => void) => this.docListeners.set(type, listener),
      removeEventListener: (type: string) => this.docListeners.delete(type),
      defaultView: {
        matchMedia: () => ({ matches: this.reduced, addEventListener: () => undefined, removeEventListener: () => undefined }),
        IntersectionObserver: class {
          constructor(callback: (entries: { isIntersecting: boolean; intersectionRatio: number }[]) => void) {
            view.observed = { callback };
          }
          observe(): void {}
          disconnect(): void {
            view.observed = null;
          }
        },
      },
    },
  } as unknown as HTMLElement;

  intersect(ratio: number): void {
    this.observed?.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]);
  }

  setVisibility(value: 'visible' | 'hidden'): void {
    this.visibilityState = value;
    this.docListeners.get('visibilitychange')?.();
  }
}

let view: FakeView;

function setup(): { state: LandingState; rotation: LandingRotation } {
  TestBed.configureTestingModule({ providers: [LandingState, LandingRotation] });
  return { state: TestBed.inject(LandingState), rotation: TestBed.inject(LandingRotation) };
}

/** Attaches to the fake view and brings the block into view. */
function running(): { state: LandingState; rotation: LandingRotation } {
  const parts = setup();
  parts.rotation.attach(view.block);
  view.intersect(1);
  TestBed.tick();
  return parts;
}

const step = () => {
  vi.advanceTimersByTime(ROTATION_PERIOD);
  TestBed.tick();
};

beforeEach(() => {
  vi.useFakeTimers();
  view = new FakeView();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.useRealTimers();
});

describe('lead rotation', () => {
  it('follows the order of INSTALL.frameworks from the shown framework and ends one round later on it', () => {
    const { state } = running();
    expect(state.rotation()).toBe('running');
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    const seen: string[] = [];
    for (let i = 0; i < INSTALL.frameworks.length; i += 1) {
      vi.advanceTimersByTime(ROTATION_PERIOD - 1);
      expect(state.shown()).toBe(i === 0 ? DEFAULT_FRAMEWORK : seen[i - 1]);
      vi.advanceTimersByTime(1);
      TestBed.tick();
      seen.push(state.shown());
    }
    expect(seen).toEqual(['vanilla', 'react', 'vue', 'angular']);
    expect(state.rotation()).toBe('done');
    expect(state.rotationControl()).toBe(false);
    step();
    step();
    expect(state.shown()).toBe('angular');
    expect(vi.getTimerCount()).toBe(0);
    // The Install section keeps the reader's framework (the default) during the round.
    expect(state.framework()).toBe(DEFAULT_FRAMEWORK);
    expect(state.swapped()).toBeNull();
    expect(state.leadChanged()).toBe(true);
  });

  it('starts from the framework the reader chose before it started', () => {
    const { state, rotation } = setup();
    state.shown.set('react');
    rotation.attach(view.block);
    view.intersect(1);
    TestBed.tick();
    step();
    expect(state.shown()).toBe('vue');
    expect(nextFramework('angular')).toBe('vanilla');
  });

  it('waits until half of the block is in view and the document is visible', () => {
    const { state, rotation } = setup();
    rotation.attach(view.block);
    TestBed.tick();
    expect(state.rotation()).toBe('idle');
    view.intersect(0.3);
    expect(state.rotation()).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
    view.intersect(0.5);
    TestBed.tick();
    expect(state.rotation()).toBe('running');
    expect(rotation.pending).toBe(true);
    view.intersect(0.2);
    expect(rotation.pending).toBe(false);
    view.intersect(1);
    view.setVisibility('hidden');
    expect(rotation.pending).toBe(false);
    vi.advanceTimersByTime(ROTATION_PERIOD * 3);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    view.setVisibility('visible');
    step();
    expect(state.shown()).toBe('vanilla');
  });

  it('pauses and resumes with the button; the period starts again on resume', () => {
    const { state, rotation } = running();
    vi.advanceTimersByTime(ROTATION_PERIOD - 100);
    rotation.toggle();
    TestBed.tick();
    expect(state.rotation()).toBe('paused');
    expect(state.rotationControl()).toBe(true);
    expect(rotation.pending).toBe(false);
    vi.advanceTimersByTime(ROTATION_PERIOD * 5);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    rotation.toggle();
    TestBed.tick();
    expect(state.rotation()).toBe('running');
    vi.advanceTimersByTime(ROTATION_PERIOD - 1);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    vi.advanceTimersByTime(1);
    expect(state.shown()).toBe('vanilla');
  });

  it('holds while the pointer or the focus is inside the block and continues after', () => {
    const { state, rotation } = running();
    rotation.hold('pointer', true);
    vi.advanceTimersByTime(ROTATION_PERIOD * 3);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    rotation.hold('focus', true);
    rotation.hold('pointer', false);
    vi.advanceTimersByTime(ROTATION_PERIOD * 3);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    rotation.hold('focus', false);
    expect(state.rotation()).toBe('running');
    step();
    expect(state.shown()).toBe('vanilla');
  });

  const actions: [string, (state: LandingState) => void][] = [
    ['a framework chosen in the lead or the Install section', (s) => s.chooseFramework('react')],
    ['the framework the lead shows chosen again', (s) => s.chooseFramework(s.shown())],
    ['a package manager change', (s) => s.chooseManager('pnpm')],
    ['a copy of the command', (s) => s.stopRotation()],
  ];
  for (const [name, act] of actions) {
    it(`stops for good on ${name}`, () => {
      const { state, rotation } = running();
      step();
      expect(state.shown()).toBe('vanilla');
      act(state);
      TestBed.tick();
      expect(state.rotation()).toBe('stopped');
      expect(state.rotationControl()).toBe(false);
      expect(rotation.pending).toBe(false);
      const shown = state.shown();
      rotation.toggle();
      rotation.hold('pointer', true);
      rotation.hold('pointer', false);
      view.intersect(0);
      view.intersect(1);
      vi.advanceTimersByTime(ROTATION_PERIOD * 10);
      TestBed.tick();
      expect(state.rotation()).toBe('stopped');
      expect(state.shown()).toBe(shown);
      expect(vi.getTimerCount()).toBe(0);
    });
  }

  it('a choice of the reader is shown by both choosers; the lead keeps what it shows when the manager changes', () => {
    const { state } = running();
    step();
    step();
    expect(state.shown()).toBe('react');
    state.chooseManager('yarn');
    expect(state.shown()).toBe('react');
    expect(state.leadCommand()).toBe(INSTALL.commands.yarn.react);
    expect(state.framework()).toBe(DEFAULT_FRAMEWORK);
    state.chooseFramework('vue');
    expect(state.shown()).toBe('vue');
    expect(state.framework()).toBe('vue');
    expect(state.command()).toBe(state.leadCommand());
  });

  it('does not rotate under reduced motion', () => {
    view.reduced = true;
    const { state, rotation } = setup();
    rotation.attach(view.block);
    view.intersect(1);
    TestBed.tick();
    expect(state.rotation()).toBe('stopped');
    expect(state.rotationControl()).toBe(false);
    vi.advanceTimersByTime(ROTATION_PERIOD * 10);
    expect(state.shown()).toBe(DEFAULT_FRAMEWORK);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears its timer and observers when destroyed', () => {
    const { rotation } = running();
    expect(rotation.pending).toBe(true);
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
    expect(view.observed).toBeNull();
    expect(view.docListeners.size).toBe(0);
  });

  it('creates no timer and does not start without attach (the server render)', () => {
    const { state } = setup();
    TestBed.tick();
    vi.advanceTimersByTime(ROTATION_PERIOD * 10);
    expect(state.rotation()).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reserves the height of the longest command of the package manager', () => {
    for (const manager of INSTALL.managers) {
      const longest = longestCommand(manager);
      for (const fw of INSTALL.frameworks) expect(INSTALL.commands[manager][fw].length).toBeLessThanOrEqual(longest.length);
    }
  });
});

describe('lead block', () => {
  it('renders the selector, one command and the list of four, and attaches the rotation only after render', () => {
    TestBed.configureTestingModule({ imports: [LandingLead], providers: [LandingState, LandingRotation, CodeBlockIds] });
    const rotation = TestBed.inject(LandingRotation);
    const attach = vi.spyOn(rotation, 'attach').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(LandingLead);
    // Creating the component (what the server render does) does not attach: no observer, no timer.
    expect(attach).not.toHaveBeenCalled();
    expect(rotation.pending).toBe(false);
    fixture.detectChanges();
    TestBed.tick();
    expect(attach).toHaveBeenCalledTimes(1);
    const root = fixture.nativeElement as HTMLElement;
    expect(attach.mock.calls[0]?.[0]).toBe(root.querySelector('.rotator'));
    expect(root.querySelectorAll('.rotator .cell pre')).toHaveLength(1);
    expect(root.querySelector('.rotator .cell pre')?.textContent).toBe(`${INSTALL.commands.npm.angular}\n`);
    expect(root.querySelectorAll('.rotator input[type="radio"]')).toHaveLength(4);
    expect(root.querySelectorAll('.all dd')).toHaveLength(4);
    expect(root.querySelector('.pause')?.classList.contains('off')).toBe(true);
    vi.advanceTimersByTime(ROTATION_PERIOD * 5);
    expect(TestBed.inject(LandingState).rotation()).toBe('idle');
    expect(rotation.pending).toBe(false);
  });
});
