import { cssVariableNames, densities, themeFoundations, themes, tokens } from './generated.js';

export { cssVariableNames, densities, themes, tokenNames, tokens } from './generated.js';

export type Theme = keyof typeof themes | 'custom';
export type ColorMode = 'light' | 'dark';
export type Density = keyof typeof densities;
export type TokenName = (typeof cssVariableNames)[number];
type Paths<T> = { [K in keyof T & string]: T[K] extends object ? `${K}.${Paths<T[K]>}` : K }[keyof T & string];
export type TokenPath = Paths<typeof tokens>;
export type ThemeVariables = Record<TokenName, string>;
export type ThemeOverrides = Partial<Record<TokenName, string | number>>;

export interface ThemeOptions {
  /** Custom starts with DGA reference defaults; supply overrides for your brand. */
  theme?: Theme;
  mode?: ColorMode;
  density?: Density;
}

function flatten(value: object, path: string[] = []): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]: [string, unknown]) => {
    const next = [...path, key];
    return child !== null && typeof child === 'object'
      ? Object.entries(flatten(child, next))
      : [[`--nq-${next.join('-')}`, String(child)]];
  }));
}

/** Plain CSS variables for SSR, style objects, documentation, and agency themes. */
export function createThemeVariables(overrides: ThemeOverrides = {}, options: ThemeOptions = {}): ThemeVariables {
  const { theme = 'dga', mode = 'light', density = 'comfortable' } = options;
  const values = {
    ...flatten(tokens),
    ...flatten(themeFoundations[theme === 'custom' ? 'dga' : theme]),
    ...flatten(themes[theme === 'custom' ? 'dga' : theme][mode]),
    ...flatten(densities[density]),
  } as ThemeVariables;
  for (const name of cssVariableNames) {
    const value = overrides[name];
    if (value !== undefined) values[name] = String(value);
  }
  return values;
}
