// The lists and the in-page functions of the styling rule (README.md, "The styling
// rule"), shared by the structural half (tests/e2e/pages/styling-structure.spec.ts)
// and the computed half (tests/e2e/pages/package-styles.spec.ts).
//
// Package element: an element whose tag starts with hw- or whose class list has a
// class starting with hw- (a package root or part), and every descendant of such an
// element down to a projected guide element. A projected guide element is an element
// written by a guide template: its tag starts with guide- (or is app-root), or it
// carries an Angular emulation attribute (_ngcontent-*, _nghost-*). @hawiyah/angular
// 0.3.0 declares no component styles, so Angular writes no emulation attribute on
// what a package component renders; every guide component has styles or is a guide-
// host. A plain span, button, td or li that a package component renders without an
// hw- class therefore belongs to the package; a guide block projected into a package
// container, and everything below it, belongs to the guide again (until the next
// package root).

/**
 * Placement: the only properties a guide rule may declare on a package element, and
 * the only properties the computed half does not compare. Each with its reason.
 */
export const PLACEMENT: { properties: RegExp; reason: string }[] = [
  { properties: /^margin-(top|right|bottom|left|block-start|block-end|inline-start|inline-end)$/, reason: 'the space between a package element and its neighbours belongs to the page layout' },
  { properties: /^(min-|max-)?(inline-size|block-size|width|height)$/, reason: 'the room a guide container gives the element' },
  { properties: /^(position|inset-(block|inline)-(start|end)|top|right|bottom|left|z-index)$/, reason: 'where the element sits in the page' },
  { properties: /^(order|flex-(grow|shrink|basis)|grid-(row|column)-(start|end)|align-self|justify-self)$/, reason: 'the element as an item of a guide flex or grid container' },
  { properties: /^visibility$/, reason: 'a guide control that is out of its round keeps its place while hidden (landing pause button)' },
];

/**
 * Computed values that are resolved against the element's own size (the origins in
 * px, the used track sizes of a grid container), so they follow placement: the
 * computed half compares them only when the element's box has the same size in both
 * states. Never allowed as a guide declaration.
 */
export const SIZE_RESOLVED = ['transform-origin', 'perspective-origin', 'grid-template-columns', 'grid-template-rows'];

/** Inherited CSS longhands (Chromium); a guide rule on an ancestor of a package element may not declare them unless listed in INHERITED_ALLOWED. */
export const INHERITED_PROPERTIES = [
  'accent-color', 'border-collapse', 'border-spacing', 'caption-side', 'caret-color', 'clip-rule', 'color', 'color-interpolation',
  'color-interpolation-filters', 'color-rendering', 'color-scheme', 'cursor', 'direction', 'dominant-baseline', 'dynamic-range-limit',
  'empty-cells', 'fill', 'fill-opacity', 'fill-rule', 'font-family', 'font-feature-settings', 'font-kerning', 'font-language-override',
  'font-optical-sizing', 'font-palette', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-synthesis-small-caps',
  'font-synthesis-style', 'font-synthesis-weight', 'font-variant-alternates', 'font-variant-caps', 'font-variant-east-asian',
  'font-variant-emoji', 'font-variant-ligatures', 'font-variant-numeric', 'font-variant-position', 'font-variation-settings', 'font-weight',
  'forced-color-adjust', 'hyphenate-character', 'hyphenate-limit-chars', 'hyphens', 'image-orientation', 'image-rendering',
  'interpolate-size', 'letter-spacing', 'line-break', 'line-height', 'list-style-image', 'list-style-position', 'list-style-type',
  'marker-end', 'marker-mid', 'marker-start', 'math-depth', 'math-shift', 'math-style', 'orphans', 'paint-order', 'pointer-events',
  'print-color-adjust', 'quotes', 'ruby-align', 'ruby-position', 'shape-rendering', 'speak', 'stroke', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'tab-size',
  'text-align', 'text-align-last', 'text-anchor', 'text-autospace', 'text-box-trim', 'text-combine-upright', 'text-decoration-skip-ink',
  'text-emphasis-color', 'text-emphasis-position', 'text-emphasis-style', 'text-indent', 'text-orientation', 'text-rendering',
  'text-shadow', 'text-size-adjust', 'text-spacing-trim', 'text-transform', 'text-underline-offset', 'text-underline-position',
  'text-wrap-mode', 'text-wrap-style', 'visibility', 'white-space-collapse', 'widows', 'word-break', 'word-spacing', 'overflow-wrap',
  'writing-mode', 'zoom', '-webkit-locale', '-webkit-text-fill-color', '-webkit-text-security', '-webkit-text-stroke-color',
  '-webkit-text-stroke-width', '-webkit-user-modify', '-webkit-tap-highlight-color', '-webkit-rtl-ordering', '-webkit-line-break',
  '-webkit-text-orientation', '-webkit-writing-mode', '-webkit-hyphenate-character', '-webkit-font-smoothing', '-webkit-border-horizontal-spacing',
  '-webkit-border-vertical-spacing', '-webkit-print-color-adjust', 'user-select', '-webkit-user-select',
];

/**
 * Properties that are not inherited but change how every descendant paints: a guide
 * rule on an ancestor of package elements is judged for them as for an inherited
 * property.
 */
export const ANCESTOR_EFFECTS = [
  'opacity', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation', 'clip-path', 'mask-image', 'mask-mode', 'mask-repeat',
  'mask-position', 'mask-clip', 'mask-origin', 'mask-size', 'mask-composite', 'mask-type', 'transform', 'translate', 'rotate', 'scale',
  'perspective', 'zoom', 'content-visibility',
];

/**
 * Guide rules that declare an inherited property (or one of ANCESTOR_EFFECTS) on an
 * ancestor of package elements: the stylesheet (guide.css, or the guide component
 * whose styles hold the rule), the selector without Angular's emulation attributes
 * (the host written :host), the property, and why. Package custom properties (--hw-*)
 * count as inherited properties. A package token as value is not a reason on its own.
 */
export const INHERITED_ALLOWED: { sheet: string; selector: string; property: string; reason: string }[] = [
  { sheet: 'guide.css', selector: 'html', property: 'color', reason: 'the document text colour: the package sets none on html, and a page needs one' },
  { sheet: 'guide.css', selector: 'html', property: 'font-family', reason: 'the document font family: the package sets none on html, and a page needs one' },
  {
    sheet: 'guide-native-result',
    selector: '.stage',
    property: 'color',
    reason: 'a native result reproduces the document of its result frame (document.ts sets the same two properties on html), also inside a package card whose own text colour differs',
  },
  {
    sheet: 'guide-native-result',
    selector: '.stage',
    property: 'font-family',
    reason: 'a native result reproduces the document of its result frame (document.ts sets the same two properties on html)',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage',
    property: 'color',
    reason: 'the stage carries its own data-hw-mode and data-hw-theme; an inherited colour is resolved at the page root, so the stage resolves the document text colour again for its own mode, as a document root does',
  },
  {
    sheet: 'guide-landing-pane',
    selector: '.stage',
    property: 'font-family',
    reason: 'the stage carries its own lang and data-hw-theme; it resolves the document font family again for them, as a document root does',
  },
  {
    sheet: 'guide-component-layout',
    selector: ':host',
    property: '--hw-side-navigation-top',
    reason: 'the sticky offset of hw-side-navigation below the page top, a placement hook the package documents for its side navigation',
  },
  {
    sheet: 'guide-landing-install',
    selector: '.cell:not(.active)',
    property: 'opacity',
    reason: 'an install cell of a framework that is not chosen is hidden (visibility: hidden, placement); opacity 0 is where its cross-fade starts, never seen at rest',
  },
];

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
  inherited?: string[];
  effects?: string[];
  inheritedAllowed?: { sheet: string; selector: string; property: string }[];
}): { stripped?: string[]; violations?: string[]; rules?: number; matches?: number; packageElements?: number; sheets?: number } {
  const KEEP_SIMPLE = new Set(['root', 'first-child', 'last-child', 'only-child', 'first-of-type', 'last-of-type', 'only-of-type', 'any-link']);
  const KEEP_FUNCTIONAL = new Set(['nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type', 'lang', 'dir']);
  const SELECTOR_LISTS = new Set(['is', 'where', 'matches', 'any', '-webkit-any']);
  const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
  const UNHANDLED = new Set(['host', 'host-context', 'slotted', 'part', 'scope', 'state']);
  const STATE_ATTRIBUTES = /^\[\s*(?:data-hw-mode|data-hw-theme|data-hw-density)(?:\s*[~|^$*]?=|\s*\])/i;
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
    while (j < text.length && /[-\w -￿]/.test(text[j]!)) j += 1;
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
        if (afterPseudoElement || STATE_ATTRIBUTES.test(attribute)) {
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

  if (input.mode === 'strip') {
    return {
      stripped: (input.selectors ?? []).map((selector) => {
        try {
          const result = stripList(selector).text;
          document.documentElement.matches(result);
          return result;
        } catch (error) {
          return `ERROR ${error instanceof Error ? error.message : String(error)}`;
        }
      }),
    };
  }

  // Package elements (see the comment at the top of styling-rule.ts).
  const isRoot = (el: Element) => el.localName.startsWith('hw-') || Array.from(el.classList).some((name) => name.startsWith('hw-'));
  const isGuide = (el: Element) =>
    el.localName.startsWith('guide-') || el.localName === 'app-root' || el.getAttributeNames().some((name) => name.startsWith('_ngcontent-') || name.startsWith('_nghost-'));
  const packageElements = new Set<Element>();
  const all = Array.from(document.querySelectorAll('*'));
  for (const el of all) {
    if (isRoot(el) || (!isGuide(el) && el.parentElement && packageElements.has(el.parentElement))) packageElements.add(el);
  }

  // 'elements' marks the package elements, and the guide elements on which a rule of
  // INHERITED_ALLOWED declares its property, for the computed half.
  const marking = input.mode === 'elements';
  const allowedMarks = new Map<Element, Set<string>>();

  const placement = (input.placement ?? []).map((source) => new RegExp(source));
  const isPlacement = (property: string) => placement.some((pattern) => pattern.test(property));
  const inherited = new Set([...(input.inherited ?? []), ...(input.effects ?? [])]);
  const allowed = input.inheritedAllowed ?? [];
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

  const violations: string[] = [];
  let rules = 0;
  let matches = 0;
  const sheets = Array.from(document.styleSheets).filter((sheet) => {
    const owner = sheet.ownerNode as Element | null;
    return !(owner?.localName === 'link' && /\/styles(?:-[A-Za-z0-9]+)?\.css$/.test(new URL(sheet.href ?? '', location.href).pathname));
  });
  const allSheets = [...sheets, ...document.adoptedStyleSheets];
  const sheetName = (sheet: CSSStyleSheet) => {
    const owner = sheet.ownerNode as Element | null;
    if (sheet.href) return new URL(sheet.href).pathname.split('/').pop()!;
    if (owner) return `style element ${Array.from(owner.parentNode?.children ?? []).indexOf(owner)}`;
    return 'adopted sheet';
  };

  // The stylesheet of a rule as INHERITED_ALLOWED names it: the file of a link, or the
  // guide component whose emulation attribute the selector carries.
  const ruleSheet = (sheet: CSSStyleSheet, selector: string) => {
    if (sheet.href) return new URL(sheet.href).pathname.split('/').pop()!.replace(/-[A-Za-z0-9]+\.css$/, '.css');
    const id = /\[_ng(?:content|host)-([^\]=]+)\]/.exec(selector)?.[1];
    if (id) return document.querySelector(`[_nghost-${CSS.escape(id)}]`)?.localName ?? 'a component without host in this page';
    return sheetName(sheet);
  };
  const normalise = (selector: string) => selector.replace(/\[_ngcontent-[^\]]+\]/g, '').replace(/\[_nghost-[^\]]+\]/g, ':host');

  const checkRule = (selector: string, style: CSSStyleDeclaration, where: string, sheet: CSSStyleSheet) => {
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
    if (marking) {
      const label = ruleSheet(sheet, selector);
      const plain = normalise(selector);
      for (const entry of allowed) {
        if (entry.sheet !== label || entry.selector !== plain || !declarations.includes(entry.property)) continue;
        for (const el of matched) {
          if (!allowedMarks.has(el)) allowedMarks.set(el, new Set());
          allowedMarks.get(el)!.add(entry.property);
        }
      }
      return;
    }
    const direct = matched.filter((el) => packageElements.has(el));
    if (direct.length > 0) {
      matches += 1;
      const outside = declarations.filter((property) => !isPlacement(property));
      if (outside.length > 0) {
        const names = Array.from(new Set(direct.map(describe))).slice(0, 4).join(', ');
        violations.push(`${where} (${ruleSheet(sheet, selector)}): ${normalise(selector)} matches the package element(s) ${names} and declares ${outside.map((p) => `${p}: ${style.getPropertyValue(p)}`).join('; ')}`);
      }
    }
    const above = matched.filter((el) => !packageElements.has(el) && ancestors.has(el));
    if (above.length > 0) {
      const passed = declarations.filter((property) => (inherited.has(property) || property.startsWith('--hw-')) && !isPlacement(property));
      const label = ruleSheet(sheet, selector);
      const plain = normalise(selector);
      const unlisted = passed.filter((property) => !allowed.some((entry) => entry.sheet === label && entry.selector === plain && entry.property === property));
      if (unlisted.length > 0) {
        const names = Array.from(new Set(above.map(describe))).slice(0, 4).join(', ');
        violations.push(`${where} (${label}): ${plain} matches ${names}, an ancestor of package elements, and declares ${unlisted.map((p) => `${p}: ${style.getPropertyValue(p)}`).join('; ')}`);
      }
    }
  };

  /** Walks a rule list; `parent` is the selector list of the enclosing style rule (CSS nesting). */
  const walk = (list: CSSRuleList, where: string, parent: string | null, scoped: boolean, sheet: CSSStyleSheet) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        let selector = rule.selectorText;
        if (scoped) selector = selector.replace(/:scope\b/g, '*').replace(/&/g, '*');
        if (parent !== null) {
          selector = split(selector)
            .map((part) => (part.includes('&') ? part.replace(/&/g, `:is(${parent})`) : `:is(${parent}) ${part}`))
            .join(', ');
        }
        checkRule(selector, rule.style, where, sheet);
        if (rule.cssRules.length > 0) walk(rule.cssRules, where, selector, false, sheet);
      } else if (typeof CSSNestedDeclarations !== 'undefined' && rule instanceof CSSNestedDeclarations) {
        if (parent === null) violations.push(`${where}: nested declarations outside a style rule`);
        else checkRule(parent, rule.style, where, sheet);
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, `${where} @media ${rule.conditionText}`, parent, scoped, sheet);
      } else if (rule instanceof CSSSupportsRule) {
        walk(rule.cssRules, `${where} @supports ${rule.conditionText}`, parent, scoped, sheet);
      } else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) {
        walk(rule.cssRules, `${where} @container ${rule.conditionText}`, parent, scoped, sheet);
      } else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
        walk(rule.cssRules, `${where} @layer ${rule.name}`, parent, scoped, sheet);
      } else if (typeof CSSScopeRule !== 'undefined' && rule instanceof CSSScopeRule) {
        // @scope is over-approximated: its rules are checked as if unscoped.
        walk(rule.cssRules, `${where} @scope`, parent, true, sheet);
      } else if (typeof CSSStartingStyleRule !== 'undefined' && rule instanceof CSSStartingStyleRule) {
        walk(rule.cssRules, `${where} @starting-style`, parent, scoped, sheet);
      } else if (rule instanceof CSSKeyframesRule || (typeof CSSLayerStatementRule !== 'undefined' && rule instanceof CSSLayerStatementRule)) {
        // Keyframes apply through animation-name, which is checked where it is declared;
        // a layer statement declares nothing.
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
    walk(list, sheetName(sheet), null, false, sheet);
  }
  if (marking) {
    for (const name of ['data-guide-styling-package', 'data-guide-styling-allowed']) {
      for (const el of document.querySelectorAll(`[${name}]`)) el.removeAttribute(name);
    }
    for (const el of packageElements) el.setAttribute('data-guide-styling-package', '');
    for (const [el, properties] of allowedMarks) el.setAttribute('data-guide-styling-allowed', Array.from(properties).join(' '));
    if (violations.length > 0) throw new Error(violations.join('\n'));
    return { packageElements: packageElements.size };
  }
  return { violations, rules, matches, packageElements: packageElements.size, sheets: allSheets.length };
}
