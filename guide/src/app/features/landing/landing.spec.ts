import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ModeService } from '../../core/mode';
import { ARABIC_SCRIPT } from '../../i18n/text';
import { feature } from './feature';
import { landingTexts } from './i18n';
import { formatPaneDate, otherCalendarHint, paneLocale } from './pane';
import { INITIAL_PANES, INSTALL, LandingState, describePane, paneOrder } from './state';

type Tree = { readonly [key: string]: unknown };

/** Dotted key paths of a text dictionary; functions and strings are leaves. */
function paths(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    value && typeof value === 'object' ? paths(value as Tree, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

function leaf(tree: Tree, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => (node as Tree)[key], tree);
}

const sample = (value: unknown): string => {
  if (typeof value === 'function') return (value as (...args: unknown[]) => string)('A', 'B', 'C', 'D', 'E');
  return String(value);
};

function state(): LandingState {
  TestBed.configureTestingModule({ providers: [LandingState] });
  return TestBed.inject(LandingState);
}

describe('landing texts', () => {
  it('have the same keys in both languages and no empty value', () => {
    const en = paths(landingTexts.en as unknown as Tree).sort();
    const ar = paths(landingTexts.ar as unknown as Tree).sort();
    expect(ar).toEqual(en);
    for (const lang of ['ar', 'en'] as const) {
      for (const path of en) expect(sample(leaf(landingTexts[lang] as unknown as Tree, path)).trim(), `${lang}.${path}`).not.toBe('');
    }
  });

  it('write every Arabic value in Arabic script', () => {
    for (const path of paths(landingTexts.ar as unknown as Tree)) {
      expect(ARABIC_SCRIPT.test(sample(leaf(landingTexts.ar as unknown as Tree, path))), path).toBe(true);
    }
  });

  it('state the compliance position without a claim of certification or official status', () => {
    expect(landingTexts.en.compliance.statement).toBe(
      'Hawiyah is built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.',
    );
    const all = paths(landingTexts.en as unknown as Tree).map((path) => sample(leaf(landingTexts.en as unknown as Tree, path)));
    for (const text of all) {
      expect(/certified|accredited|endorsed/i.test(text), text).toBe(false);
      expect(/official/i.test(text.replace('not an official DGA product', '')), text).toBe(false);
    }
  });
});

describe('landing feature', () => {
  it('claims the language root and prerenders it in both languages', async () => {
    expect(feature.id).toBe('landing');
    expect(feature.order).toBe(10);
    expect(feature.routes.map((route) => route.path)).toEqual(['']);
    expect(feature.nav).toBeUndefined();
    const server = feature.serverRoutes(['ar', 'en']);
    expect(server.map((route) => route.path)).toEqual(['']);
    const route = server[0] as { getPrerenderParams?: () => Promise<Record<string, string>[]> };
    expect(await route.getPrerenderParams?.()).toEqual([{ lang: 'ar' }, { lang: 'en' }]);
  });
});

describe('install chooser state', () => {
  it('starts with Angular and npm and follows every choice of the twelve pairs', () => {
    const s = state();
    expect(s.command()).toBe('npm install @hawiyah/styles@0.3.0 @hawiyah/angular@0.3.0');
    expect(s.swapped()).toBeNull();
    for (const manager of INSTALL.managers) {
      s.chooseManager(manager);
      for (const framework of INSTALL.frameworks) {
        s.chooseFramework(framework);
        expect(s.command()).toBe(INSTALL.commands[manager][framework]);
        expect(s.command()).toContain(`${INSTALL.adapters[framework]}@${INSTALL.pin}`);
      }
    }
  });

  it('records which listing changed and ignores unknown values', () => {
    const s = state();
    s.chooseFramework('react');
    expect(s.swapped()).toBe('framework');
    s.chooseManager('pnpm');
    expect(s.swapped()).toBe('manager');
    s.chooseFramework('svelte');
    s.chooseManager('bun');
    expect(s.framework()).toBe('react');
    expect(s.manager()).toBe('pnpm');
  });
});

describe('containers', () => {
  it('put the container in the page language first', () => {
    expect(paneOrder('ar')).toEqual(['a', 'b']);
    expect(paneOrder('en')).toEqual(['b', 'a']);
    expect(INITIAL_PANES.a).toMatchObject({ lang: 'ar', dir: 'rtl' });
    expect(INITIAL_PANES.b).toMatchObject({ lang: 'en', dir: 'ltr' });
  });

  it('follow the page mode until their own mode is changed, and replay only on a change', () => {
    const s = state();
    const mode = TestBed.inject(ModeService);
    mode.mode.set('dark');
    expect(s.views().a.mode).toBe('dark');
    expect(s.patch('a', { mode: 'dark' })).toBe(false);
    expect(s.revisions()).toEqual({ a: 0, b: 0 });
    expect(s.patch('a', { mode: 'light' })).toBe(true);
    mode.mode.set('dark');
    expect(s.views().a.mode).toBe('light');
    expect(s.views().b.mode).toBe('dark');
    expect(s.patch('b', { density: 'compact', dir: 'rtl' })).toBe(true);
    expect(s.revisions()).toEqual({ a: 1, b: 1 });
    s.reset();
    expect(s.panes()).toEqual(INITIAL_PANES);
    expect(s.revisions()).toEqual({ a: 2, b: 2 });
    s.reset();
    expect(s.revisions()).toEqual({ a: 2, b: 2 });
  });

  it('announce the attributes in the page language', () => {
    const pane = { lang: 'en' as const, dir: 'rtl' as const, mode: null, density: 'compact' as const };
    expect(describePane(landingTexts.en, 'b', pane, 'dark')).toBe('Container B: English, Right to left, Dark, Compact');
    expect(describePane(landingTexts.ar, 'a', INITIAL_PANES.a, 'light')).toBe('الحاوية أ: العربية، من اليمين إلى اليسار، فاتح، مريحة');
  });

  it('show the other calendar of the date in the container language, isolated', () => {
    expect(paneLocale('ar')).toBe('ar-SA');
    expect(paneLocale('en')).toBe('en-GB');
    const gregorian = formatPaneDate('2026-12-20', 'en', 'gregory');
    expect(gregorian.startsWith('⁨')).toBe(true);
    expect(gregorian.endsWith('⁩')).toBe(true);
    expect(gregorian).toContain('2026');
    expect(otherCalendarHint('2026-12-20', 'en', 'gregory')).toMatch(/^Umm al-Qura: ⁨.*1448.*⁩$/);
    expect(otherCalendarHint('2026-12-20', 'ar', 'islamic-umalqura')).toMatch(/^بالتقويم الميلادي: ⁨/);
    expect(otherCalendarHint('', 'en', 'gregory')).toBe('No date selected');
  });
});
