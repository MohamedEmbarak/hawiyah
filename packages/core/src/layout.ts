/** CSS-driven layouts. Safe to call during SSR; no DOM or viewport access. */
export type LayoutBreakpoint = 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };
export type LayoutSpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type LayoutSpacing = LayoutSpaceToken | string;
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type LayoutSide = 'start' | 'end';

/** Shared presentation props; adapters additionally accept native HTML props. */
export interface LayoutProps {
  gap?: Responsive<LayoutSpacing>;
  padding?: Responsive<LayoutSpacing>;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  wrap?: boolean;
  columns?: Responsive<number>;
  /** Adaptive auto-fit columns. Takes precedence over an explicit columns value. */
  minItemWidth?: string;
  /** Rendered by adapters as data-side, not as a style property. */
  side?: LayoutSide;
  sidebarWidth?: string;
  /** Rendered by adapters as data-collapse-at. Defaults to md (48rem). */
  collapseAt?: 'sm' | 'md' | 'lg';
  maxWidth?: string;
  ratio?: number;
}

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const;
const justifyValues: Record<LayoutJustify, string> = {
  start: 'start', center: 'center', end: 'end',
  between: 'space-between', around: 'space-around', evenly: 'space-evenly',
};

function cssLength(value: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('Layout CSS lengths must be non-empty strings.');
  return value.trim();
}

function space(value: LayoutSpacing): string {
  if (typeof value === 'string') return cssLength(value);
  if (!Number.isInteger(value) || value < 0 || value > 16) {
    throw new RangeError('Layout spacing numbers must be integer tokens from 0 through 16; use a CSS length string otherwise.');
  }
  // All spacing steps are supported, including steps absent from a theme's scale.
  return `var(--hw-space-${value}, ${value === 0 ? '0px' : `${value / 4}rem`})`;
}

function columnCount(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError('Layout columns must be positive integers.');
  return value;
}

function responsive<T>(styles: Record<string, string | number>, name: string, value: Responsive<T> | undefined, format: (item: T) => string | number): void {
  if (value === undefined) return;
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const steps = value as { base?: T; sm?: T; md?: T; lg?: T; xl?: T };
    for (const breakpoint of breakpoints) {
      const item = steps[breakpoint];
      if (item !== undefined) styles[`${name}${breakpoint === 'base' ? '' : `-${breakpoint}`}`] = format(item);
    }
  } else {
    styles[name] = format(value as T);
  }
}

/**
 * Return only declared CSS custom properties. CSS supplies defaults, responsive
 * cascade and direction, so server and client output are identical.
 *
 * Adapters render side/collapseAt as data-side/data-collapse-at. Consumers may
 * spread this object into a framework style object, or set its properties using
 * element.style.setProperty(name, String(value)) in vanilla HTML.
 */
export function layoutStyles(props: LayoutProps = {}): Record<string, string | number> {
  const styles: Record<string, string | number> = {};
  responsive(styles, '--hw-layout-gap', props.gap, space);
  responsive(styles, '--hw-layout-padding', props.padding, space);
  if (props.minItemWidth !== undefined) {
    styles['--hw-layout-min-item'] = cssLength(props.minItemWidth);
    styles['--hw-layout-columns'] = 'auto-fit';
  } else {
    responsive(styles, '--hw-layout-columns', props.columns, columnCount);
  }
  if (props.align !== undefined) styles['--hw-layout-align'] = props.align;
  if (props.justify !== undefined) styles['--hw-layout-justify'] = justifyValues[props.justify];
  if (props.wrap !== undefined) styles['--hw-layout-wrap'] = props.wrap ? 'wrap' : 'nowrap';
  if (props.sidebarWidth !== undefined) styles['--hw-layout-sidebar-width'] = cssLength(props.sidebarWidth);
  if (props.maxWidth !== undefined) styles['--hw-layout-max-width'] = cssLength(props.maxWidth);
  if (props.ratio !== undefined) {
    if (!Number.isFinite(props.ratio) || props.ratio <= 0) throw new RangeError('Layout aspect ratio must be a positive finite number.');
    styles['--hw-layout-ratio'] = props.ratio;
  }
  return styles;
}
