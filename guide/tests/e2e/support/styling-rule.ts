import type { Page } from '@playwright/test';

// The lists and the in-page functions of the styling rule (README.md, "The styling
// rule"), shared by the structural half (tests/e2e/pages/styling-structure.spec.ts)
// and the computed half (tests/e2e/pages/package-styles.spec.ts).
//
// Package element, first clause: an element whose tag starts with hw- or whose class
// list has a class starting with hw- (a package root or part), and every descendant of
// such an element down to a projected guide element. A projected guide element is an
// element written by a guide template: its tag starts with guide- (or is app-root), or
// it carries an Angular emulation attribute (_ngcontent-*, _nghost-*). @hawiyah/angular
// 0.3.0 declares no component styles, so Angular writes no emulation attribute on what a
// package component renders. A plain span, button, td or li that a package component
// renders without an hw- class therefore belongs to the package.
//
// Second clause: every element, whoever wrote it, that a rule of the served package
// stylesheet (styles-*.css) matches when the rule's selector names an hw- class or an
// hw- tag in any compound outside :not() and :has() (h2 inside .hw-prose, the code element of a
// code block, a paragraph inside an alert, an image inside the portal brand). The set is
// derived in the browser from the stylesheet the page serves, stripped as the guide's
// rules are except that data-* attributes other than the colour mode, theme and density
// stay (see PACKAGE_STATE_ATTRIBUTES). A rule that selects only by data-hw-mode, data-hw-theme or
// data-hw-density, by :root or by an element name alone does not name an hw- class or
// tag, so it makes no element a package element.

/** A guide declaration that the lists allow: where it is written, what it declares, and why. */
export interface ListedDeclaration {
  /** guide.css, or the tag of the guide component whose styles hold the rule. */
  sheet: string;
  /** The selector without Angular's emulation attributes (the host written :host). */
  selector: string;
  property: string;
  /** The declared value as the browser serialises it. */
  value: string;
  /** The enclosing conditions ('@media ...', '@supports ...'), joined by ' '; '' for none. */
  condition?: string;
  reason: string;
}

/**
 * Placement that every guide rule may declare on a package element, and that the
 * computed half does not compare: only the margins. Every other placement declaration
 * on a package element is allowed only through PLACEMENT_ALLOWED.
 */
export const PLACEMENT: { properties: RegExp; reason: string }[] = [
  { properties: /^margin-(top|right|bottom|left|block-start|block-end|inline-start|inline-end)$/, reason: 'the space between a package element and its neighbours belongs to the page layout' },
];

/**
 * The other placement properties (sizes, position and inset, flex and grid item
 * properties, visibility, scroll margins, and display only with the value none: the
 * element is not rendered, as with visibility). Never allowed in general; each
 * declaration that uses one on a package element needs an entry of PLACEMENT_ALLOWED.
 */
export const PLACEMENT_PROPERTIES =
  /^((min-|max-)?(inline-size|block-size|width|height)|position|inset-(block|inline)-(start|end)|top|right|bottom|left|z-index|order|flex-(grow|shrink|basis)|grid-(row|column)-(start|end)|align-self|justify-self|visibility|scroll-margin-(top|right|bottom|left|block-start|block-end|inline-start|inline-end)|display)$/;

/** Guide declarations of a placement property on a package element, each with its reason. */
export const PLACEMENT_ALLOWED: ListedDeclaration[] = [
  {
    sheet: 'guide-brief-page',
    selector: 'article',
    property: 'max-inline-size',
    value: '60rem',
    reason: 'the brief page gives its article.hw-prose a line length inside the content column; hw-prose takes the width its parent gives',
  },
  {
    sheet: 'guide-reference-page',
    selector: 'article',
    property: 'max-inline-size',
    value: '60rem',
    reason: 'the reference page gives its article.hw-prose a line length inside the content column; hw-prose takes the width its parent gives',
  },
  {
    sheet: 'guide-component-layout',
    selector: '.side',
    property: 'display',
    value: 'none',
    condition: '@media (scripting: enabled) and (width < 64rem)',
    reason: 'below 64rem the column of hw-sidebar that holds the side navigation is not rendered and hw-navigation-drawer offers the same navigation; without script, and from 64rem, the column is in the flow',
  },
];

/**
 * Computed values that are resolved against the element's own box (sizes as used
 * values, the origins in px, the used track sizes of a grid container), so they follow
 * placement: the computed half compares them only when the element's box has the same
 * size in both states. Never allowed as a guide declaration on that ground.
 */
export const SIZE_RESOLVED = ['width', 'height', 'inline-size', 'block-size', 'transform-origin', 'perspective-origin', 'grid-template-columns', 'grid-template-rows'];

/**
 * Inherited CSS longhands that the derivation in the browser (inheritedProperties)
 * cannot always see, because no test value changes them on a plain element. The
 * checks use the union of this list and the derived one.
 */
export const INHERITED_FLOOR = [
  'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'text-shadow', 'white-space-collapse', 'text-autospace', 'visibility', 'cursor',
  'pointer-events', 'color', 'font-family', 'font-size', 'line-height', 'direction', 'writing-mode', 'text-align', 'text-transform', 'letter-spacing',
  'word-spacing', 'font-style', 'font-weight', 'list-style-type', 'quotes', '-webkit-text-fill-color', 'user-select', '-webkit-user-select',
];

/**
 * Properties that are not inherited but change how every descendant paints: a guide
 * rule on an ancestor of package elements is judged for them as for an inherited
 * property.
 */
export const ANCESTOR_EFFECTS = [
  'opacity', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation', 'clip-path', 'mask-image', 'mask-mode', 'mask-repeat',
  'mask-position', 'mask-clip', 'mask-origin', 'mask-size', 'mask-composite', 'mask-type', 'transform', 'translate', 'rotate', 'scale',
  'perspective', 'zoom', 'content-visibility', 'text-decoration-line', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor',
  'offset-position', 'animation-name',
];

/**
 * Guide rules that declare an inherited property (or one of ANCESTOR_EFFECTS, or a
 * package custom property --hw-* or --_hw-*) on an ancestor of package elements, with
 * the value and the condition. A package token as value is not a reason on its own.
 */
export const INHERITED_ALLOWED: ListedDeclaration[] = [
  { sheet: 'guide.css', selector: 'html', property: 'color', value: 'var(--hw-color-text)', reason: 'the document text colour: the package sets none on html, and a page needs one' },
  { sheet: 'guide.css', selector: 'html', property: 'font-family', value: 'var(--hw-font-sans)', reason: 'the document font family: the package sets none on html, and a page needs one' },
  {
    sheet: 'guide-native-result',
    selector: '.stage',
    property: 'color',
    value: 'var(--hw-color-text)',
    reason: 'a native result reproduces the document of its result frame (document.ts sets the same two properties on html), also inside a package card whose own text colour differs',
  },
  {
    sheet: 'guide-native-result',
    selector: '.stage',
    property: 'font-family',
    value: 'var(--hw-font-sans)',
    reason: 'a native result reproduces the document of its result frame (document.ts sets the same two properties on html)',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage',
    property: 'color',
    value: 'var(--hw-color-text)',
    reason: 'the stage carries its own data-hw-mode and data-hw-theme; an inherited colour is resolved at the page root, so the stage resolves the document text colour again for its own mode, as a document root does',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage',
    property: 'font-family',
    value: 'var(--hw-font-sans)',
    reason: 'the stage carries its own lang and data-hw-theme; it resolves the document font family again for them, as a document root does',
  },
  {
    sheet: 'guide-component-layout',
    selector: ':host',
    property: '--hw-side-navigation-top',
    value: 'var(--hw-space-4)',
    reason: 'the sticky offset of hw-side-navigation below the page top, a placement hook the package documents for its side navigation',
  },
  {
    sheet: 'guide-landing-install',
    selector: '.cell:not(.active)',
    property: 'visibility',
    value: 'hidden',
    reason: 'the install cell of a framework that is not chosen is not shown and not reachable; the chosen cell takes the same grid area',
  },
  {
    sheet: 'guide-landing-install',
    selector: '.cell:not(.active)',
    property: 'opacity',
    value: '0',
    reason: 'an install cell of a framework that is not chosen is hidden (visibility above); opacity 0 is where its cross-fade starts, never seen at rest',
  },
  {
    sheet: 'guide-landing-lead',
    selector: '.pause.off',
    property: 'visibility',
    value: 'hidden',
    reason: 'outside the round the slot of the pause button keeps its space while the button is not shown, so the block keeps one height (decision E-D)',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage',
    property: 'animation-name',
    value: 'animation: guide-pane-settle var(--hw-duration-slow) var(--hw-ease-standard) backwards',
    condition: '@media (prefers-reduced-motion: no-preference)',
    reason: 'the landing pane settles once on load, only when the reader allows motion; the keyframes move and fade the guide stage, and at rest the animation has ended',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage:is([data-rev$="1"], [data-rev$="3"], [data-rev$="5"], [data-rev$="7"], [data-rev$="9"])',
    property: 'animation-name',
    value: 'animation: guide-pane-change-odd var(--hw-duration-slow) var(--hw-ease-standard)',
    condition: '@media (prefers-reduced-motion: no-preference)',
    reason: 'the cross-fade of a landing pane after the reader changed it, only when the reader allows motion; the keyframes move and fade the guide stage',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage:is([data-rev$="2"], [data-rev$="4"], [data-rev$="6"], [data-rev$="8"]), .stage:not([data-rev="0"])[data-rev$="0"]',
    property: 'animation-name',
    value: 'animation: guide-pane-change-even var(--hw-duration-slow) var(--hw-ease-standard)',
    condition: '@media (prefers-reduced-motion: no-preference)',
    reason: 'the cross-fade of a landing pane after the reader changed it again: the second name restarts the animation; only when the reader allows motion',
  },
  {
    sheet: 'guide-landing-command',
    selector: '.reserve',
    property: 'visibility',
    value: 'hidden',
    reason: 'a copy of the longest command that holds the height of the listing; never shown and never reached',
  },
];

/**
 * In-page derivation of the inherited longhands: each computed property is set on a
 * parent with test values until its computed value changes, and counted as inherited
 * when the child's computed value changes with it. Run in a blank document.
 */
export function inheritedProperties(): string[] {
  const parent = document.createElement('div');
  const child = document.createElement('span');
  child.textContent = 'x';
  parent.append(child);
  document.body.append(parent);
  const names = Array.from(getComputedStyle(parent)).filter((name) => !name.startsWith('--'));
  const candidates = ['1px', '3px', 'red', 'none', 'auto', '1', '2', '0.5', 'hidden', 'hide', 'rtl', 'italic', 'bold', 'center', 'underline', 'line-through', 'uppercase', 'pre', 'preserve', 'preserve-breaks', 'inert', 'crosshair', 'dark', 'vertical-rl', 'all', 'manual', 'break-all', 'anywhere', 'square', 'inside', 'separate', 'collapse', 'bottom', 'under', 'over', 'sesame', 'edge', '"x"', 'serif', 'small-caps', 'optimizeSpeed', 'pixelated', 'from-image', 'evenodd', 'round', 'middle', 'nowrap', 'balance', 'text', 'ex', 'cap', 'cap alphabetic', 'trim-both', 'space-all', 'no-autospace', 'ideograph-alpha', 'strict', 'loose', 'sideways', 'exact', 'economy', 'isolate', 'thin', 'red blue', 'red 1px 1px', 'stable', 'disc', 'read-write', 'plaintext-only', 'logical', 'visual', 'disc inside', '50%', 'fixed', 'standard', 'constrained-high', 'allow-keywords', 'compact', 'text-top', 'both', 'block', 'bar', 'underscore', 'emoji', 'slashed-zero', 'historical-forms', 'super', 'jis78', 'common-ligatures', 'discretionary-ligatures', '"wght" 500', '"smcp"', '75%', 'condensed', 'weight', '"ar"', 'antialiased', 'no-drag', 'element', 'linearRGB', 'geometricPrecision', 'crispEdges', 'butt', 'bevel', 'end', 'hanging', '5 2 2', 'stroke', 'spell-out', 'digits', 'first', 'last', 'justify', 'inter-character', 'only light', 'no-limit', 'preserve-parent-color'];
  const inherited: string[] = [];
  for (const name of names) {
    const initialParent = getComputedStyle(parent).getPropertyValue(name);
    const initialChild = getComputedStyle(child).getPropertyValue(name);
    for (const value of candidates) {
      parent.style.setProperty(name, value);
      if (parent.style.getPropertyValue(name) === '') continue;
      const changed = getComputedStyle(parent).getPropertyValue(name) !== initialParent;
      const passed = getComputedStyle(child).getPropertyValue(name) !== initialChild;
      parent.style.removeProperty(name);
      if (changed) {
        if (passed) inherited.push(name);
        break;
      }
    }
  }
  parent.remove();
  return inherited;
}

let derivedInherited: string[] | null = null;

/**
 * The inherited longhands the checks judge: the ones this Chromium inherits, derived in
 * a blank document of the page's context once per worker, and INHERITED_FLOOR.
 */
export async function judgedInherited(page: Page): Promise<{ inherited: string[]; derived: number }> {
  if (derivedInherited === null) {
    const blank = await page.context().newPage();
    await blank.setContent('<!doctype html><html><head></head><body></body></html>');
    derivedInherited = await blank.evaluate(inheritedProperties);
    await blank.close();
  }
  return { inherited: Array.from(new Set([...derivedInherited, ...INHERITED_FLOOR])).sort(), derived: derivedInherited.length };
}

/** The key of a listed declaration, as the structural half reports the entries it used. */
export function entryKey(entry: Pick<ListedDeclaration, 'sheet' | 'selector' | 'property' | 'value' | 'condition'>): string {
  return `${entry.sheet} | ${entry.selector} | ${entry.property}: ${entry.value}${entry.condition ? ` | ${entry.condition}` : ''}`;
}

type Listed = Pick<ListedDeclaration, 'sheet' | 'selector' | 'property' | 'value' | 'condition'>;

/**
 * Selector stripping and the package element set, as one self-contained function for
 * page.evaluate. `mode`:
 *   'strip'     returns the stripped form of each selector in `selectors` (or the error)
 *   'structure' walks every rule of every guide stylesheet and returns the violations
 *   'elements'  marks the package elements with data-guide-styling-package (for the computed half)
 */
export function stylingRule(input: {
  mode: 'strip' | 'structure' | 'elements';
  selectors?: string[];
  placement?: string[];
  placementProperties?: string;
  placementAllowed?: Listed[];
  inherited?: string[];
  effects?: string[];
  inheritedAllowed?: Listed[];
}): {
  stripped?: string[];
  violations?: string[];
  rules?: number;
  matches?: number;
  packageElements?: number;
  firstClause?: number;
  secondClause?: number;
  packageRules?: number;
  sheets?: number;
  used?: string[];
} {
  const KEEP_SIMPLE = new Set(['root', 'first-child', 'last-child', 'only-child', 'first-of-type', 'last-of-type', 'only-of-type', 'any-link']);
  const KEEP_FUNCTIONAL = new Set(['nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type', 'lang', 'dir']);
  const SELECTOR_LISTS = new Set(['is', 'where', 'matches', 'any', '-webkit-any']);
  const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
  const UNHANDLED = new Set(['host', 'host-context', 'slotted', 'part', 'scope', 'state']);
  // States carried by attributes: every aria-* and data-* attribute and the boolean
  // state attributes. lang, dir, role, class, id, type, href and Angular's emulation
  // attributes stay in the selector.
  const STATE_ATTRIBUTES = /^\[\s*(?:[-\w]*\|)?(?:aria-[-\w]*|data-[-\w]*|open|hidden|disabled|checked|selected|readonly|required|inert)\s*(?:[~|^$*]?=|\])/i;
  // For the second clause (rules of the package stylesheet) data-* attributes other than
  // the colour mode, theme and density stay: the package's scripts write data-* states
  // only on the elements they render (first clause), so a guide-written element is
  // selected through a data-* attribute only when the guide itself writes it, and then
  // it matches at rest.
  const PACKAGE_STATE_ATTRIBUTES = /^\[\s*(?:[-\w]*\|)?(?:aria-[-\w]*|data-hw-mode|data-hw-theme|data-hw-density|open|hidden|disabled|checked|selected|readonly|required|inert)\s*(?:[~|^$*]?=|\])/i;
  let stateAttributes = STATE_ATTRIBUTES;
  const ANY = ':is(*)';

  /** Reads a balanced (...) group starting at text[i] === '('; returns [inner, index after ')']. */
  const group = (text: string, i: number): [string, number] => {
    let depth = 0;
    let quote = '';
    for (let j = i; j < text.length; j += 1) {
      const c = text[j]!;
      if (quote) {
        if (c === '\\') j += 1;
        else if (c === quote) quote = '';
        continue;
      }
      if (c === '\\') j += 1;
      else if (c === '"' || c === "'") quote = c;
      else if (c === '(' || c === '[') depth += 1;
      else if (c === ')' || c === ']') {
        depth -= 1;
        if (depth === 0) return [text.slice(i + 1, j), j + 1];
      }
    }
    throw new Error(`unbalanced group in ${text}`);
  };

  /** Splits a selector list at top-level commas. */
  const split = (text: string): string[] => {
    const parts: string[] = [];
    let start = 0;
    for (let i = 0; i < text.length; ) {
      const c = text[i]!;
      if (c === '\\') i += 2;
      else if (c === '(' || c === '[') i = group(text, i)[1];
      else if (c === '"' || c === "'") throw new Error(`a string outside brackets in ${text}`);
      else if (c === ',') {
        parts.push(text.slice(start, i));
        start = i + 1;
        i += 1;
      } else i += 1;
    }
    parts.push(text.slice(start));
    return parts.map((part) => part.trim()).filter((part) => part !== '');
  };

  const nameAt = (text: string, i: number): [string, number] => {
    let j = i;
    while (j < text.length && /[-\w\u00a0-\uffff]/.test(text[j]!)) j += 1;
    return [text.slice(i, j), j];
  };

  /** Strips one complex selector; returns the text and whether anything was removed. */
  const stripComplex = (text: string): { text: string; changed: boolean } => {
    let out = '';
    let changed = false;
    let afterPseudoElement = false;
    for (let i = 0; i < text.length; ) {
      const c = text[i]!;
      if (/[\s>+~]/.test(c)) {
        afterPseudoElement = false;
        out += c;
        i += 1;
      } else if (c === '\\') {
        out += text.slice(i, i + 2);
        i += 2;
      } else if (c === '[') {
        const [, end] = group(text, i);
        const attribute = text.slice(i, end);
        if (afterPseudoElement || stateAttributes.test(attribute)) {
          out += ANY;
          changed = true;
        } else out += attribute;
        i = end;
      } else if (c === ':') {
        const element = text[i + 1] === ':';
        const [name, afterName] = nameAt(text, i + (element ? 2 : 1));
        const lower = name.toLowerCase();
        let args: string | null = null;
        let end = afterName;
        if (text[afterName] === '(') [args, end] = group(text, afterName);
        if (!name) throw new Error(`an empty pseudo name in ${text}`);
        if (element || LEGACY_PSEUDO_ELEMENTS.has(lower)) {
          if (lower === 'slotted' || lower === 'part') throw new Error(`::${name}() cannot be stripped`);
          afterPseudoElement = true;
          out += ANY;
          changed = true;
        } else if (afterPseudoElement) {
          out += ANY;
          changed = true;
        } else if (UNHANDLED.has(lower)) {
          throw new Error(`:${name} cannot be stripped`);
        } else if (SELECTOR_LISTS.has(lower) || lower === 'has') {
          if (args === null) throw new Error(`:${name} without arguments`);
          const inner = stripList(args);
          out += `:${lower === 'has' ? 'has' : lower === 'where' ? 'where' : 'is'}(${inner.text})`;
          changed ||= inner.changed;
        } else if (lower === 'not') {
          if (args === null) throw new Error(':not without arguments');
          const inner = stripList(args);
          // An element can be outside every state, so a negated state does not limit
          // the match: the whole :not() is dropped when a state was removed inside it.
          if (inner.changed) {
            out += ANY;
            changed = true;
          } else out += `:not(${inner.text})`;
        } else if (KEEP_FUNCTIONAL.has(lower)) {
          if (args === null) throw new Error(`:${name} without arguments`);
          if (/\bof\b/i.test(args)) throw new Error(`:${name}(... of S) cannot be stripped`);
          out += `:${name}(${args})`;
        } else if (KEEP_SIMPLE.has(lower) && args === null) {
          out += `:${name}`;
        } else {
          // Every other pseudo-class depends on a state of the element or of the user
          // (hover, focus, focus-visible, focus-within, active, checked, disabled,
          // target, open, popover-open, visited, link, placeholder-shown, empty, ...).
          out += ANY;
          changed = true;
        }
        i = end;
      } else if (c === '(' || c === ')' || c === '"' || c === "'" || c === ',' || c === '{' || c === '}' || c === ';') {
        throw new Error(`unexpected ${c} in ${text}`);
      } else {
        if (afterPseudoElement) throw new Error(`a simple selector after a pseudo-element in ${text}`);
        out += c;
        i += 1;
      }
    }
    return { text: out.trim(), changed };
  };

  const stripList = (text: string): { text: string; changed: boolean } => {
    const parts = split(text).map(stripComplex);
    return { text: parts.map((part) => part.text).join(', '), changed: parts.some((part) => part.changed) };
  };

  /**
   * Whether a complex selector names an hw- class or an hw- tag in a compound: attribute
   * selectors, strings and the arguments of :not() and :has() (conditions on other
   * elements, not the identity of the subject) are left out first.
   */
  const namesPackage = (text: string): boolean => {
    let bare = '';
    for (let i = 0; i < text.length; ) {
      const c = text[i]!;
      if (c === '\\') {
        bare += text.slice(i, i + 2);
        i += 2;
      } else if (c === '[') {
        i = group(text, i)[1];
        bare += '[]';
      } else if (c === ':' && /^:(?:not|has)\(/i.test(text.slice(i))) {
        i = group(text, i + 4)[1];
        bare += ':x()';
      } else {
        bare += c;
        i += 1;
      }
    }
    return /\.hw-[-\w]/i.test(bare) || /(?:^|[\s>+~(,])hw-[-\w]/i.test(bare);
  };

  if (input.mode === 'strip') {
    return {
      stripped: (input.selectors ?? []).map((selector) => {
        try {
          const result = stripList(selector).text;
          document.documentElement.matches(result);
          return `${result}${split(selector).some(namesPackage) ? ' [package]' : ''}`;
        } catch (error) {
          return `ERROR ${error instanceof Error ? error.message : String(error)}`;
        }
      }),
    };
  }

  const violations: string[] = [];
  const isPackageSheet = (sheet: CSSStyleSheet) => {
    const owner = sheet.ownerNode as Element | null;
    return owner?.localName === 'link' && /\/styles(?:-[A-Za-z0-9]+)?\.css$/.test(new URL(sheet.href ?? '', location.href).pathname);
  };

  // Package elements, first clause (see the comment at the top of styling-rule.ts).
  const isRoot = (el: Element) => el.localName.startsWith('hw-') || Array.from(el.classList).some((name) => name.startsWith('hw-'));
  const isGuide = (el: Element) =>
    el.localName.startsWith('guide-') || el.localName === 'app-root' || el.getAttributeNames().some((name) => name.startsWith('_ngcontent-') || name.startsWith('_nghost-'));
  const packageElements = new Set<Element>();
  const all = Array.from(document.querySelectorAll('*'));
  for (const el of all) {
    if (isRoot(el) || (!isGuide(el) && el.parentElement && packageElements.has(el.parentElement))) packageElements.add(el);
  }
  const firstClause = packageElements.size;

  // Second clause: what a rule of the served package stylesheet with an hw- class or
  // tag in its selector matches, states and pseudo-elements stripped as for guide rules.
  let packageRules = 0;
  const packageSelectors: string[] = [];
  const collect = (list: CSSRuleList, parent: string | null) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        let selector = rule.selectorText;
        if (parent !== null) {
          selector = split(selector)
            .map((part) => (part.includes('&') ? part.replace(/&/g, `:is(${parent})`) : `:is(${parent}) ${part}`))
            .join(', ');
        }
        packageRules += 1;
        packageSelectors.push(selector);
        if (rule.cssRules.length > 0) collect(rule.cssRules, selector);
      } else if ('cssRules' in rule && !(rule instanceof CSSKeyframesRule)) {
        collect((rule as CSSGroupingRule).cssRules, parent);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    if (isPackageSheet(sheet)) collect(sheet.cssRules, null);
  }
  stateAttributes = PACKAGE_STATE_ATTRIBUTES;
  for (const selector of packageSelectors) {
    let parts: string[];
    try {
      parts = split(selector).filter(namesPackage);
    } catch (error) {
      violations.push(`package stylesheet: selector ${selector} cannot be read (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    for (const part of parts) {
      let stripped: string;
      try {
        stripped = stripComplex(part).text;
      } catch (error) {
        violations.push(`package stylesheet: selector ${part} cannot be stripped (${error instanceof Error ? error.message : String(error)})`);
        continue;
      }
      for (const el of document.querySelectorAll(stripped)) packageElements.add(el);
    }
  }
  stateAttributes = STATE_ATTRIBUTES;
  const secondClause = packageElements.size - firstClause;

  // 'elements' marks the package elements, the guide elements on which a rule of
  // INHERITED_ALLOWED declares its property, and the package elements on which a rule
  // of PLACEMENT_ALLOWED declares its property, for the computed half.
  const marking = input.mode === 'elements';
  const allowedMarks = new Map<Element, Set<string>>();
  const placedMarks = new Map<Element, Set<string>>();
  // The physical properties that getComputedStyle also reports for a logical one (the
  // guide's pages are written horizontally; inline sides depend on the direction).
  const PHYSICAL: Record<string, string[]> = {
    'inline-size': ['width'],
    'block-size': ['height'],
    'min-inline-size': ['min-width'],
    'min-block-size': ['min-height'],
    'max-inline-size': ['max-width'],
    'max-block-size': ['max-height'],
    'inset-inline-start': ['left', 'right'],
    'inset-inline-end': ['left', 'right'],
    'inset-block-start': ['top'],
    'inset-block-end': ['bottom'],
  };
  const mark = (marks: Map<Element, Set<string>>, el: Element, property: string) => {
    if (!marks.has(el)) marks.set(el, new Set());
    marks.get(el)!.add(property);
  };

  const placement = (input.placement ?? []).map((source) => new RegExp(source));
  const isPlacement = (property: string) => placement.some((pattern) => pattern.test(property));
  const inherited = new Set([...(input.inherited ?? []), ...(input.effects ?? [])]);
  const isPackageCustom = (property: string) => property.startsWith('--hw-') || property.startsWith('--_hw-');
  const inheritedAllowed = input.inheritedAllowed ?? [];
  const placementAllowed = input.placementAllowed ?? [];
  const used = new Set<string>();
  const keyOf = (entry: Listed) => `${entry.sheet} | ${entry.selector} | ${entry.property}: ${entry.value}${entry.condition ? ` | ${entry.condition}` : ''}`;
  const ancestors = new Set<Element>();
  for (const el of packageElements) {
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (ancestors.has(parent)) break;
      ancestors.add(parent);
    }
  }
  const describe = (el: Element) => {
    const classes = Array.from(el.classList).join('.');
    return `${el.localName}${classes ? `.${classes}` : ''}`;
  };

  let rules = 0;
  let matches = 0;
  const sheets = Array.from(document.styleSheets).filter((sheet) => !isPackageSheet(sheet));
  const allSheets = [...sheets, ...document.adoptedStyleSheets];
  const sheetName = (sheet: CSSStyleSheet) => {
    const owner = sheet.ownerNode as Element | null;
    if (sheet.href) return new URL(sheet.href).pathname.split('/').pop()!;
    if (owner) return `style element ${Array.from(owner.parentNode?.children ?? []).indexOf(owner)}`;
    return 'adopted sheet';
  };

  // The stylesheet of a rule as the lists name it: the file of a link, or the guide
  // component whose emulation attribute the selector carries.
  const ruleSheet = (sheet: CSSStyleSheet, selector: string) => {
    if (sheet.href) return new URL(sheet.href).pathname.split('/').pop()!.replace(/-[A-Za-z0-9]+\.css$/, '.css');
    const id = /\[_ng(?:content|host)-([^\]=]+)\]/.exec(selector)?.[1];
    if (id) return document.querySelector(`[_nghost-${CSS.escape(id)}]`)?.localName ?? 'a component without host in this page';
    return sheetName(sheet);
  };
  const normalise = (selector: string) => selector.replace(/\[_ngcontent-[^\]]+\]/g, '').replace(/\[_nghost-[^\]]+\]/g, ':host');

  /** The listed entry that allows this declaration, if any. */
  const listed = (list: Listed[], sheet: string, selector: string, property: string, value: string, condition: string) =>
    list.find((entry) => entry.sheet === sheet && entry.selector === selector && entry.property === property && entry.value === value && (entry.condition ?? '') === condition);

  const checkRule = (selector: string, style: CSSStyleDeclaration, where: string, condition: string, sheet: CSSStyleSheet) => {
    rules += 1;
    let stripped: string;
    try {
      stripped = stripList(selector).text;
    } catch (error) {
      violations.push(`${where}: selector ${selector} cannot be stripped (${error instanceof Error ? error.message : String(error)})`);
      return;
    }
    let matched: Element[];
    try {
      matched = Array.from(document.querySelectorAll(stripped));
    } catch (error) {
      violations.push(`${where}: selector ${selector} stripped to ${stripped} is not valid (${error instanceof Error ? error.message : String(error)})`);
      return;
    }
    const declarations = Array.from(style);
    const label = ruleSheet(sheet, selector);
    const plain = normalise(selector);
    // A shorthand written with var() leaves its longhands without a value of their own:
    // the value is then the shorthand's, as written.
    const valueOf = (property: string) => {
      // Angular's emulation prefixes the names of a component's keyframes with its id.
      const plain = (text: string) => text.replace(/_ngcontent-[a-z0-9-]+?_/gi, '');
      const value = plain(style.getPropertyValue(property));
      if (value !== '') return value;
      const candidates: string[] = [];
      for (let name = property; name.includes('-'); ) {
        name = name.slice(0, name.lastIndexOf('-'));
        candidates.push(name);
      }
      if (/-gap$/.test(property)) candidates.push('gap');
      if (/^(top|right|bottom|left)$/.test(property)) candidates.push('inset');
      for (const name of candidates) {
        const shorthand = style.getPropertyValue(name);
        if (shorthand !== '') return `${name}: ${plain(shorthand)}`;
      }
      return '';
    };
    const direct = matched.filter((el) => packageElements.has(el));
    const above = matched.filter((el) => !packageElements.has(el) && ancestors.has(el));
    if (marking) {
      for (const property of declarations) {
        if (listed(inheritedAllowed, label, plain, property, valueOf(property), condition)) for (const el of above) mark(allowedMarks, el, property);
        if (listed(placementAllowed, label, plain, property, valueOf(property), condition)) {
          for (const el of direct) for (const name of [property, ...(PHYSICAL[property] ?? [])]) mark(placedMarks, el, name);
        }
      }
      return;
    }
    if (direct.length > 0) {
      matches += 1;
      const outside = declarations.filter((property) => {
        if (isPlacement(property)) return false;
        const entry = listed(placementAllowed, label, plain, property, valueOf(property), condition);
        if (entry) used.add(keyOf(entry));
        return !entry;
      });
      if (outside.length > 0) {
        const names = Array.from(new Set(direct.map(describe))).slice(0, 4).join(', ');
        violations.push(`${where} (${label}): ${plain} matches the package element(s) ${names} and declares ${outside.map((p) => `${p}: ${valueOf(p)}`).join('; ')}`);
      }
    }
    if (above.length > 0) {
      const passed = declarations.filter((property) => inherited.has(property) || isPackageCustom(property));
      const unlisted = passed.filter((property) => {
        const entry = listed(inheritedAllowed, label, plain, property, valueOf(property), condition);
        if (entry) used.add(keyOf(entry));
        return !entry;
      });
      if (unlisted.length > 0) {
        const names = Array.from(new Set(above.map(describe))).slice(0, 4).join(', ');
        violations.push(`${where} (${label}): ${plain} matches ${names}, an ancestor of package elements, and declares ${unlisted.map((p) => `${p}: ${valueOf(p)}`).join('; ')}`);
      }
    }
  };

  /** Walks a rule list; `parent` is the selector list of the enclosing style rule (CSS nesting). */
  const walk = (list: CSSRuleList, where: string, condition: string[], parent: string | null, scoped: boolean, sheet: CSSStyleSheet) => {
    const within = (kind: string, text: string) => [...condition, `${kind} ${text}`];
    const at = (next: string[]) => `${sheetName(sheet)}${next.length > 0 ? ` ${next.join(' ')}` : ''}`;
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        let selector = rule.selectorText;
        if (scoped) selector = selector.replace(/:scope\b/g, '*').replace(/&/g, '*');
        if (parent !== null) {
          selector = split(selector)
            .map((part) => (part.includes('&') ? part.replace(/&/g, `:is(${parent})`) : `:is(${parent}) ${part}`))
            .join(', ');
        }
        checkRule(selector, rule.style, where, condition.join(' '), sheet);
        if (rule.cssRules.length > 0) walk(rule.cssRules, where, condition, selector, false, sheet);
      } else if (typeof CSSNestedDeclarations !== 'undefined' && rule instanceof CSSNestedDeclarations) {
        if (parent === null) violations.push(`${where}: nested declarations outside a style rule`);
        else checkRule(parent, rule.style, where, condition.join(' '), sheet);
      } else if (rule instanceof CSSMediaRule) {
        const next = within('@media', rule.conditionText);
        walk(rule.cssRules, at(next), next, parent, scoped, sheet);
      } else if (rule instanceof CSSSupportsRule) {
        const next = within('@supports', rule.conditionText);
        walk(rule.cssRules, at(next), next, parent, scoped, sheet);
      } else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) {
        const next = within('@container', rule.conditionText);
        walk(rule.cssRules, at(next), next, parent, scoped, sheet);
      } else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
        const next = within('@layer', rule.name);
        walk(rule.cssRules, at(next), next, parent, scoped, sheet);
      } else if (typeof CSSScopeRule !== 'undefined' && rule instanceof CSSScopeRule) {
        // @scope is over-approximated: its rules are checked as if unscoped.
        const next = within('@scope', '');
        walk(rule.cssRules, at(next), next, parent, true, sheet);
      } else if (typeof CSSStartingStyleRule !== 'undefined' && rule instanceof CSSStartingStyleRule) {
        const next = within('@starting-style', '');
        walk(rule.cssRules, at(next), next, parent, scoped, sheet);
      } else if (rule instanceof CSSKeyframesRule) {
        // Keyframes apply through animation-name, which is checked where it is declared
        // (on an ancestor it is one of ANCESTOR_EFFECTS); a guide keyframes with a
        // package name would replace the package's animation.
        if (/^hw-/i.test(rule.name)) violations.push(`${where}: @keyframes ${rule.name} uses the name of a package animation`);
      } else if (typeof CSSLayerStatementRule !== 'undefined' && rule instanceof CSSLayerStatementRule) {
        // A layer statement declares nothing.
      } else {
        violations.push(`${where}: a ${rule.constructor.name} rule that the check cannot handle: ${rule.cssText.slice(0, 80)}`);
      }
    }
  };
  for (const sheet of allSheets) {
    let list: CSSRuleList;
    try {
      list = sheet.cssRules;
    } catch (error) {
      violations.push(`${sheetName(sheet)}: rules cannot be read (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    walk(list, sheetName(sheet), [], null, false, sheet);
  }
  if (marking) {
    for (const name of ['data-guide-styling-package', 'data-guide-styling-allowed', 'data-guide-styling-placed']) {
      for (const el of document.querySelectorAll(`[${name}]`)) el.removeAttribute(name);
    }
    for (const el of packageElements) el.setAttribute('data-guide-styling-package', '');
    for (const [el, properties] of allowedMarks) el.setAttribute('data-guide-styling-allowed', Array.from(properties).join(' '));
    for (const [el, properties] of placedMarks) el.setAttribute('data-guide-styling-placed', Array.from(properties).join(' '));
    if (violations.length > 0) throw new Error(violations.join('\n'));
    return { packageElements: packageElements.size, firstClause, secondClause, packageRules };
  }
  return { violations, rules, matches, packageElements: packageElements.size, firstClause, secondClause, packageRules, sheets: allSheets.length, used: Array.from(used) };
}
