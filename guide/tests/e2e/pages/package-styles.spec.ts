import { test, expect, hydrated, keepRootDocument, presetMode } from '../support/fixtures';
import { documents } from '../support/routes';

// The outcome proof of the styling rule (README.md, "The styling rule"): the guide
// never changes how a package element renders. For every prerendered page, in both
// colour modes and at 1280 and 390 px, the computed appearance of every element
// whose class list has a class starting with hw- (and every hw-* element) is read
// twice in one task: with every stylesheet on, and with every stylesheet, style
// element and adopted sheet disabled except the package bundle (styles-*.css, built
// from src/styles.css, which holds only the @hawiyah/styles imports). The values
// must be equal.
//
// A difference of an inherited property whose origin is a guide element (not an hw-
// element) is the document or container setup of the guide; it is accepted only
// when every guide declaration of that property on the origin is a package token
// (var(--hw-...)), and it is counted in the annotation. Any other difference fails.

/** Appearance properties compared on every hw- element. */
const COMPARED = [
  'display',
  'overflow-wrap',
  'word-break',
  'white-space',
  'white-space-collapse',
  'text-wrap-mode',
  'unicode-bidi',
  'color',
  'background-color',
  'background-image',
  ...['top', 'right', 'bottom', 'left'].flatMap((side) => [`border-${side}-width`, `border-${side}-style`, `border-${side}-color`]),
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-variant',
  'letter-spacing',
  'text-transform',
  'line-height',
  'text-decoration-line',
  'text-decoration-style',
  'text-decoration-color',
  'text-decoration-thickness',
  'text-underline-offset',
  'box-shadow',
  'opacity',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
] as const;

/**
 * Placement, not appearance: never compared. A guide container may place a package
 * element; it may not change how the element itself renders.
 */
const PLACEMENT: { properties: RegExp; reason: string }[] = [
  { properties: /^margin(-|$)/, reason: 'the space between a package element and its neighbours belongs to the page layout' },
  { properties: /^(min-|max-)?(inline-size|block-size|width|height)$/, reason: 'the room a guide container gives the element' },
  { properties: /^(position|inset(-.*)?|top|right|bottom|left|z-index)$/, reason: 'where the element sits in the page' },
  { properties: /^(order|flex(-.*)?|grid(-.*)?|align-self|justify-self|place-self)$/, reason: 'the element as an item of a guide flex or grid container' },
  { properties: /^text-align$/, reason: 'alignment of the element inside a guide container (inherited from a centred page block)' },
  { properties: /^visibility$/, reason: 'a guide control that is out of its round keeps its place while hidden (landing pause button)' },
];

/**
 * Two consequences of placement that show in compared properties and are handled by
 * rule, not by leaving the property out:
 * - display: an item of a guide flex or grid container is blockified by the browser
 *   (inline becomes block); accepted only when the parent is that container and the
 *   value is exactly the blockified form of the value without the guide stylesheets.
 * - currentColor: border, outline and text-decoration colours that follow the
 *   element's own color in both states are judged with color itself.
 */
const FOLLOWS_COLOR = new Set([
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'text-decoration-color',
  'outline-color',
]);

/** Inherited CSS properties among COMPARED. */
const INHERITED = new Set([
  'overflow-wrap',
  'word-break',
  'white-space',
  'white-space-collapse',
  'text-wrap-mode',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-variant',
  'letter-spacing',
  'text-transform',
  'line-height',
]);

interface Outcome {
  sheets: { package: number; disabled: number };
  elements: number;
  properties: number;
  violations: string[];
  inheritedFromGuide: string[];
}

function compareStyles(input: { compared: readonly string[]; inherited: string[]; followsColor: string[] }): Outcome {
  const { compared, inherited } = input;
  const inheritedSet = new Set(inherited);
  const followsColor = new Set(input.followsColor);
  const colorAt = compared.indexOf('color');
  const displayAt = compared.indexOf('display');
  const blockified: Record<string, string> = { inline: 'block', 'inline-block': 'block', 'inline-flex': 'flex', 'inline-grid': 'grid', 'inline-table': 'table' };
  const blockify = (value: string) => blockified[value] ?? value;
  const all = [document.documentElement, ...Array.from(document.documentElement.querySelectorAll('*'))];
  const isPackage = (el: Element) =>
    el.localName.startsWith('hw-') || Array.from(el.classList).some((name) => name.startsWith('hw-'));
  const read = () =>
    all.map((el) => {
      const style = getComputedStyle(el);
      return compared.map((name) => style.getPropertyValue(name));
    });
  const describe = (el: Element) => {
    const classes = Array.from(el.classList).join('.');
    const path: string[] = [];
    for (let node: Element | null = el; node && path.length < 4; node = node.parentElement) {
      path.unshift(node.localName + (node.id ? `#${node.id}` : ''));
    }
    return `${el.localName}${classes ? `.${classes}` : ''} (${path.join(' > ')})`;
  };

  const before = read();

  const packageSheets: CSSStyleSheet[] = [];
  const disabled: CSSStyleSheet[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const owner = sheet.ownerNode as Element | null;
    const href = sheet.href ?? '';
    if (owner?.localName === 'link' && /\/styles(?:-[A-Za-z0-9]+)?\.css$/.test(new URL(href).pathname)) {
      packageSheets.push(sheet);
      continue;
    }
    if (!sheet.disabled) {
      sheet.disabled = true;
      disabled.push(sheet);
    }
  }
  for (const sheet of document.adoptedStyleSheets) {
    if (!sheet.disabled) {
      sheet.disabled = true;
      disabled.push(sheet);
    }
  }
  const after = read();
  for (const sheet of disabled) sheet.disabled = false;

  // Guide declarations of a property on an element, read from the sheets that were off.
  const guideValues = (el: Element, property: string): string[] => {
    const values: string[] = [];
    const visit = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          let matches = false;
          try {
            matches = el.matches(rule.selectorText);
          } catch {
            matches = false;
          }
          if (matches) {
            const value = rule.style.getPropertyValue(property);
            if (value) values.push(value.trim());
          }
        }
        if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) visit((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of disabled) visit(sheet.cssRules);
    return values;
  };

  const index = new Map(all.map((el, i) => [el, i] as const));
  const violations: string[] = [];
  const inheritedFromGuide = new Set<string>();
  let elements = 0;
  all.forEach((el, i) => {
    if (!isPackage(el)) return;
    elements += 1;
    compared.forEach((property, p) => {
      const a = before[i]![p];
      const b = after[i]![p];
      if (a === b) return;
      if (followsColor.has(property) && before[i]![colorAt] === a && after[i]![colorAt] === b) return;
      if (property === 'display') {
        // The box parent in each state: the nearest ancestor that generates a box
        // (display: contents skipped). Blockified as an item of a flex or grid
        // container with the guide stylesheets, and not such an item without them.
        const boxParent = (values: string[][]) => {
          let box = el.parentElement;
          while (box && values[index.get(box)!]![displayAt] === 'contents') box = box.parentElement;
          return box;
        };
        const boxBefore = boxParent(before);
        const boxAfter = boxParent(after);
        const flexOrGrid = (value: string | undefined) => /(^|\s)(flex|grid)$/.test(value ?? '');
        if (
          boxBefore &&
          flexOrGrid(before[index.get(boxBefore)!]![displayAt]) &&
          !(boxAfter === boxBefore && flexOrGrid(after[index.get(boxAfter)!]![displayAt])) &&
          blockify(b!) === a
        ) {
          return;
        }
      }
      if (inheritedSet.has(property)) {
        // Walk up while the ancestor shows the same pair of values: the origin is the
        // highest element of that run.
        let origin = el;
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          const j = index.get(parent)!;
          if (before[j]![p] !== a || after[j]![p] !== b) break;
          origin = parent;
        }
        if (origin !== el) {
          if (isPackage(origin)) return; // reported at the package element where it starts
          const values = guideValues(origin, property);
          if (values.length > 0 && values.every((value) => /^var\(--hw-[a-z0-9-]+\)$/.test(value))) {
            inheritedFromGuide.add(`${property} from ${describe(origin)}: ${values.join(', ')}`);
            return;
          }
          violations.push(`${describe(el)} ${property}: ${a} -> ${b} (inherited from guide element ${describe(origin)}, declared ${values.join(', ') || 'nothing readable'})`);
          return;
        }
      }
      violations.push(`${describe(el)} ${property}: ${a} -> ${b}`);
    });
  });
  return {
    sheets: { package: packageSheets.length, disabled: disabled.length },
    elements,
    properties: elements * compared.length,
    violations,
    inheritedFromGuide: Array.from(inheritedFromGuide),
  };
}

test('the compared and the placement properties are disjoint', () => {
  for (const name of COMPARED) {
    expect(PLACEMENT.filter((entry) => entry.properties.test(name)).map((entry) => entry.reason), name).toEqual([]);
  }
  for (const name of [...INHERITED, ...FOLLOWS_COLOR]) expect(COMPARED as readonly string[]).toContain(name);
});

const pages = documents.filter((doc) => doc.kind === 'page');

for (const doc of pages) {
  const label = doc.route === '' ? 'root document' : doc.route === '404' ? '404 document' : doc.route;
  test(`guide stylesheets leave package elements unchanged: ${label}`, async ({ page, guard }, testInfo) => {
    test.slow();
    const counts: string[] = [];
    for (const mode of ['light', 'dark'] as const) {
      await presetMode(page, mode);
      if (doc.route === '') {
        await keepRootDocument(page);
        await page.goto('');
      } else if (doc.route === '404') {
        guard.allowDocument404(/\/hawiyah\/en\/no-such-page\/$/);
        await page.goto('en/no-such-page/');
      } else {
        await page.goto(`${doc.route}/`);
      }
      await hydrated(page);
      await expect(page.locator('html')).toHaveAttribute('data-hw-mode', mode);
      // The editor is compared after its first run, with the status line and the log filled.
      if (doc.route.endsWith('/editor')) {
        await expect(page.locator('guide-editor-status p.state')).toHaveText(/^(The original example ran in \d+ ms\.|شُغِّل المثال الأصلي في \d+ ملّي ثانية\.)$/, { timeout: 20_000 });
      }
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const outcome = await page.evaluate(compareStyles, { compared: COMPARED, inherited: [...INHERITED], followsColor: [...FOLLOWS_COLOR] });
        expect(outcome.sheets.package, 'exactly one package bundle').toBe(1);
        expect(outcome.sheets.disabled, 'guide stylesheets disabled').toBeGreaterThan(0);
        expect(outcome.elements, 'package elements compared').toBeGreaterThan(0);
        expect(outcome.violations, `${label}, ${mode}, ${width} px`).toEqual([]);
        counts.push(`${mode} ${width}: ${outcome.elements} elements x ${COMPARED.length} properties = ${outcome.properties}`);
        for (const entry of outcome.inheritedFromGuide) {
          if (!counts.includes(`inherited: ${entry}`)) counts.push(`inherited: ${entry}`);
        }
      }
    }
    testInfo.annotations.push({ type: 'compared', description: counts.join('; ') });
    console.log(`package-styles ${label}: ${counts.join('; ')}`);
  });
}
