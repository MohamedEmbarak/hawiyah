import { Injectable, computed, inject, signal } from '@angular/core';
import install from '../../../generated/install.json';
import { ModeService, type Mode } from '../../core/mode';
import { shellTexts } from '../../i18n/shell';
import type { Lang } from '../../i18n/text';
import type { LandingTexts } from './i18n';

export type InstallFramework = 'vanilla' | 'react' | 'vue' | 'angular';
export type InstallManager = 'npm' | 'pnpm' | 'yarn';
export type PaneId = 'a' | 'b';
export type Direction = 'rtl' | 'ltr';
export type Density = 'comfortable' | 'compact';

/** src/generated/install.json, written by build step 32 from scripts/install/data.mjs. */
export interface InstallData {
  readonly pin: string;
  readonly componentCount: number;
  readonly packages: readonly { readonly name: string; readonly spec: string }[];
  readonly managers: readonly InstallManager[];
  readonly frameworks: readonly InstallFramework[];
  readonly adapters: Readonly<Record<InstallFramework, string>>;
  readonly commands: Readonly<Record<InstallManager, Readonly<Record<InstallFramework, string>>>>;
  readonly styleImports: Readonly<Record<InstallFramework, { readonly file: string; readonly text: string }>>;
}

export const INSTALL = install as InstallData;

/** Framework names of the chooser; names stay in Latin script in both languages. */
export const FRAMEWORK_LABELS: Readonly<Record<InstallFramework, string>> = {
  vanilla: 'JavaScript',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

export const DEFAULT_FRAMEWORK: InstallFramework = 'angular';
export const DEFAULT_MANAGER: InstallManager = 'npm';

/**
 * The attributes of one container. mode is null while the container follows the page
 * colour mode; it holds a value once the reader changed it for this container.
 */
export interface PaneState {
  readonly lang: Lang;
  readonly dir: Direction;
  readonly mode: Mode | null;
  readonly density: Density;
}

/** The attributes a container shows, with the mode resolved. */
export type EffectivePane = Omit<PaneState, 'mode'> & { readonly mode: Mode };

/** Starting attributes: container A Arabic and right to left, container B English and left to right. */
export const INITIAL_PANES: Readonly<Record<PaneId, PaneState>> = {
  a: { lang: 'ar', dir: 'rtl', mode: null, density: 'comfortable' },
  b: { lang: 'en', dir: 'ltr', mode: null, density: 'comfortable' },
};

/** The container in the page language comes first. */
export function paneOrder(pageLang: Lang): readonly [PaneId, PaneId] {
  return pageLang === 'ar' ? ['a', 'b'] : ['b', 'a'];
}

export function containerName(t: LandingTexts, id: PaneId): string {
  return id === 'a' ? t.duo.containerA : t.duo.containerB;
}

/** The name of a language in that language (العربية, English). */
export function languageName(lang: Lang): string {
  return shellTexts[lang].languageName;
}

/** duo.announce for one container, in the page language. */
export function describePane(t: LandingTexts, id: PaneId, state: PaneState, pageMode: Mode): string {
  const mode = state.mode ?? pageMode;
  return t.duo.announce(
    containerName(t, id),
    languageName(state.lang),
    state.dir === 'rtl' ? t.duo.rtl : t.duo.ltr,
    mode === 'dark' ? t.duo.dark : t.duo.light,
    state.density === 'compact' ? t.duo.compact : t.duo.comfortable,
  );
}

/**
 * LandingState: the framework and package manager shared by the lead and the
 * chooser, and the attributes of the two containers. Provided by the landing page.
 */
@Injectable()
export class LandingState {
  private readonly pageMode = inject(ModeService).mode;

  readonly framework = signal<InstallFramework>(DEFAULT_FRAMEWORK);
  readonly manager = signal<InstallManager>(DEFAULT_MANAGER);
  /** Which listings changed last, so that only those fade; null until the reader chooses. */
  readonly swapped = signal<'framework' | 'manager' | null>(null);
  readonly command = computed(() => INSTALL.commands[this.manager()][this.framework()]);

  readonly panes = signal<Readonly<Record<PaneId, PaneState>>>(INITIAL_PANES);
  /** Replay counters of the containers (data-rev); 0 until a container changes. */
  readonly revisions = signal<Readonly<Record<PaneId, number>>>({ a: 0, b: 0 });

  chooseFramework(value: string): void {
    if (!isFramework(value) || value === this.framework()) return;
    this.framework.set(value);
    this.swapped.set('framework');
  }

  chooseManager(value: string): void {
    if (!isManager(value) || value === this.manager()) return;
    this.manager.set(value);
    this.swapped.set('manager');
  }

  /** The attributes each container shows: its own mode, or the page mode while it follows it. */
  readonly views = computed<Readonly<Record<PaneId, EffectivePane>>>(() => {
    const panes = this.panes();
    const mode = this.pageMode();
    return { a: { ...panes.a, mode: panes.a.mode ?? mode }, b: { ...panes.b, mode: panes.b.mode ?? mode } };
  });

  effective(id: PaneId): EffectivePane {
    return this.views()[id];
  }

  /** Changes one attribute of one container; returns false when nothing changed. */
  patch(id: PaneId, change: Partial<PaneState>): boolean {
    const current = this.panes()[id];
    const next: PaneState = { ...current, ...change };
    const effectiveBefore = current.mode ?? this.pageMode();
    const same = next.lang === current.lang && next.dir === current.dir && next.density === current.density && (next.mode ?? this.pageMode()) === effectiveBefore;
    if (same) return false;
    this.panes.update((all) => ({ ...all, [id]: next }));
    this.revisions.update((all) => ({ ...all, [id]: all[id] + 1 }));
    return true;
  }

  /** Returns both containers to their starting attributes; only a container that changed replays. */
  reset(): void {
    const before = this.panes();
    const pageMode = this.pageMode();
    const changed = (id: PaneId) => {
      const a = before[id];
      const b = INITIAL_PANES[id];
      return a.lang !== b.lang || a.dir !== b.dir || a.density !== b.density || (a.mode ?? pageMode) !== pageMode;
    };
    const replay = { a: changed('a'), b: changed('b') };
    this.panes.set(INITIAL_PANES);
    this.revisions.update((all) => ({ a: all.a + (replay.a ? 1 : 0), b: all.b + (replay.b ? 1 : 0) }));
  }
}

export function isFramework(value: unknown): value is InstallFramework {
  return value === 'vanilla' || value === 'react' || value === 'vue' || value === 'angular';
}

export function isManager(value: unknown): value is InstallManager {
  return value === 'npm' || value === 'pnpm' || value === 'yarn';
}

export function isDirection(value: unknown): value is Direction {
  return value === 'rtl' || value === 'ltr';
}
