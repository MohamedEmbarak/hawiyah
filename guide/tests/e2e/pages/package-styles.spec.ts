import { test, expect, hydrated, keepRootDocument, presetMode } from '../support/fixtures';
import { documents } from '../support/routes';
import { ANCESTOR_EFFECTS, INHERITED_ALLOWED, INHERITED_PROPERTIES, PLACEMENT, SIZE_RESOLVED, stylingRule } from '../support/styling-rule';

// The computed half of the styling rule (README.md, "The styling rule"); the
// structural half is styling-structure.spec.ts. For every prerendered page, in both
// colour modes and at 1280 and 390 px, every computed property (custom properties
// aside) of every package element (as styling-rule.ts defines it), and of its
// ::before, ::after and ::marker when they exist, is read twice in one task: with
// every stylesheet on, and with every stylesheet, style element and adopted sheet
// disabled except the package bundle (styles-*.css; step 90 proves that it equals the
// bundle derived again from @hawiyah/styles). The values must be equal, except the
// placement properties (PLACEMENT, each with its reason).
//
// A difference of an inherited property whose origin is a guide element is accepted
// only when a rule listed in INHERITED_ALLOWED declares that property on the origin
// (the structural half fails every other such rule). Any other difference fails.

/** Placement consequences handled by rule; see compareStyles. */
const FOLLOWS_COLOR = [
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-block-start-color',
  'border-block-end-color',
  'border-inline-start-color',
  'border-inline-end-color',
  'text-decoration-color',
  'text-emphasis-color',
  'outline-color',
  'column-rule-color',
  'row-rule-color',
  'caret-color',
  '-webkit-text-fill-color',
  '-webkit-text-stroke-color',
];

interface Outcome {
  sheets: { package: number; disabled: number };
  elements: number;
  properties: number;
  pseudo: number;
  violations: string[];
  inheritedFromGuide: string[];
}

function compareStyles(input: { placement: string[]; inherited: string[]; followsColor: string[]; sizeResolved: string[] }): Outcome {
  const placement = input.placement.map((source) => new RegExp(source));
  const inheritedSet = new Set(input.inherited);
  const followsColor = new Set(input.followsColor);
  const sizeResolved = new Set(input.sizeResolved);
  const names = Array.from(getComputedStyle(document.documentElement)).filter((name) => !name.startsWith('--') && !placement.some((pattern) => pattern.test(name)));
  // Read on every other element: the inherited properties, and display for the box parent.
  const inheritedNames = [...names.filter((name) => inheritedSet.has(name)), 'display'];
  const colorAt = names.indexOf('color');
  const displayAt = names.indexOf('display');
  const blockified: Record<string, string> = { inline: 'block', 'inline-block': 'block', 'inline-flex': 'flex', 'inline-grid': 'grid', 'inline-table': 'table', 'inline list-item': 'block list-item' };
  const blockify = (value: string) => blockified[value] ?? value;
  const all = [document.documentElement, ...Array.from(document.documentElement.querySelectorAll('*'))];
  const isPackage = (el: Element) => el.hasAttribute('data-guide-styling-package');
  const packages = all.filter(isPackage);
  const indexOf = new Map(all.map((el, i) => [el, i] as const));
  const PSEUDO = ['::before', '::after', '::marker'] as const;

  interface State {
    own: Map<Element, string[]>;
    inherited: Map<Element, string[]>;
    pseudo: Map<string, string[]>;
    box: Map<Element, string>;
  }
  const read = (): State => {
    const own = new Map<Element, string[]>();
    const inherited = new Map<Element, string[]>();
    const pseudo = new Map<string, string[]>();
    const box = new Map<Element, string>();
    for (const el of all) {
      const style = getComputedStyle(el);
      if (isPackage(el)) {
        own.set(el, names.map((name) => style.getPropertyValue(name)));
        const rect = el.getBoundingClientRect();
        box.set(el, `${rect.width}x${rect.height}`);
        for (const which of PSEUDO) {
          const ps = getComputedStyle(el, which);
          const exists = which === '::marker' ? /list-item/.test(style.display) : ps.content !== 'none' && ps.content !== 'normal';
          pseudo.set(`${indexOf.get(el)}${which}`, exists ? names.map((name) => ps.getPropertyValue(name)) : []);
        }
      } else {
        inherited.set(el, inheritedNames.map((name) => style.getPropertyValue(name)));
      }
    }
    return { own, inherited, pseudo, box };
  };
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

  /** The value of a property for any element in a state (package: own list; other: inherited list). */
  const valueOf = (state: State, el: Element, name: string) => {
    if (isPackage(el)) return state.own.get(el)![names.indexOf(name)];
    const at = inheritedNames.indexOf(name);
    return at === -1 ? undefined : state.inherited.get(el)![at];
  };
  const allowedOn = (el: Element, property: string) => (el.getAttribute('data-guide-styling-allowed') ?? '').split(' ').includes(property);

  const violations: string[] = [];
  const inheritedFromGuide = new Set<string>();
  let pseudoCount = 0;
  const judge = (el: Element, label: string, a: string[], b: string[], own: boolean) => {
    names.forEach((property, p) => {
      const x = a[p]!;
      const y = b[p]!;
      if (x === y) return;
      if (followsColor.has(property) && a[colorAt] === x && b[colorAt] === y) return;
      if (sizeResolved.has(property) && before.box.get(el) !== after.box.get(el)) return;
      if (own && property === 'display') {
        // The box parent in each state: the nearest ancestor that generates a box
        // (display: contents skipped). Blockified as an item of a flex or grid
        // container with the guide stylesheets, and not such an item without them.
        const boxParent = (state: State) => {
          let box = el.parentElement;
          while (box && valueOf(state, box, 'display') === 'contents') box = box.parentElement;
          return box;
        };
        const flexOrGrid = (value: string | undefined) => /(^|\s)(flex|grid)$/.test(value ?? '');
        const boxBefore = boxParent(before);
        const boxAfter = boxParent(after);
        if (
          boxBefore &&
          flexOrGrid(valueOf(before, boxBefore, 'display')) &&
          !(boxAfter === boxBefore && flexOrGrid(valueOf(after, boxAfter!, 'display'))) &&
          blockify(y) === x
        ) {
          return;
        }
      }
      if (inheritedSet.has(property)) {
        // Walk up while the ancestor shows the same pair of values: the origin is the
        // highest element of that run (for a pseudo-element, starting at its element).
        let origin: Element = el;
        let moved = !own;
        for (let parent = own ? el.parentElement : el; parent; parent = parent.parentElement) {
          if (valueOf(before, parent, property) !== x || valueOf(after, parent, property) !== y) break;
          origin = parent;
          moved = true;
        }
        if (moved && (origin !== el || !own)) {
          if (isPackage(origin) && origin !== el) return; // reported at the package element where it starts
          if (!isPackage(origin) && allowedOn(origin, property)) {
            inheritedFromGuide.add(`${property} from ${describe(origin)}`);
            return;
          }
          if (!isPackage(origin)) {
            violations.push(`${label} ${property}: ${x} -> ${y} (inherited from guide element ${describe(origin)}, which no listed rule explains)`);
            return;
          }
        }
      }
      violations.push(`${label} ${property}: ${x} -> ${y}`);
    });
  };
  for (const el of packages) {
    judge(el, describe(el), before.own.get(el)!, after.own.get(el)!, true);
    for (const which of PSEUDO) {
      const key = `${indexOf.get(el)}${which}`;
      const a = before.pseudo.get(key)!;
      const b = after.pseudo.get(key)!;
      if (a.length === 0 && b.length === 0) continue;
      pseudoCount += 1;
      if (a.length === 0 || b.length === 0) {
        violations.push(`${describe(el)}${which} exists ${a.length === 0 ? 'only without' : 'only with'} the guide stylesheets`);
        continue;
      }
      judge(el, `${describe(el)}${which}`, a, b, false);
    }
  }
  return {
    sheets: { package: packageSheets.length, disabled: disabled.length },
    elements: packages.length,
    properties: names.length,
    pseudo: pseudoCount,
    violations,
    inheritedFromGuide: Array.from(inheritedFromGuide),
  };
}

test('the placement and the size-resolved properties are disjoint and inherited colours follow color', () => {
  for (const name of SIZE_RESOLVED) expect(PLACEMENT.some((entry) => entry.properties.test(name)), name).toBe(false);
  for (const name of FOLLOWS_COLOR) expect(PLACEMENT.some((entry) => entry.properties.test(name)), name).toBe(false);
});

const pages = documents.filter((doc) => doc.kind === 'page');
const marking = {
  mode: 'elements' as const,
  inheritedAllowed: INHERITED_ALLOWED.map(({ sheet, selector, property }) => ({ sheet, selector, property })),
};
const comparing = {
  placement: PLACEMENT.map((entry) => entry.properties.source),
  inherited: [...INHERITED_PROPERTIES, ...ANCESTOR_EFFECTS],
  followsColor: FOLLOWS_COLOR,
  sizeResolved: SIZE_RESOLVED,
};

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
        await page.evaluate(stylingRule, marking);
        const outcome = await page.evaluate(compareStyles, comparing);
        expect(outcome.sheets.package, 'exactly one package bundle').toBe(1);
        expect(outcome.sheets.disabled, 'guide stylesheets disabled').toBeGreaterThan(0);
        expect(outcome.elements, 'package elements compared').toBeGreaterThan(0);
        expect(outcome.properties, 'computed properties compared').toBeGreaterThan(300);
        expect(outcome.violations, `${label}, ${mode}, ${width} px`).toEqual([]);
        counts.push(`${mode} ${width}: ${outcome.elements} elements and ${outcome.pseudo} pseudo-elements x ${outcome.properties} properties`);
        for (const entry of outcome.inheritedFromGuide) {
          if (!counts.includes(`inherited: ${entry}`)) counts.push(`inherited: ${entry}`);
        }
      }
    }
    testInfo.annotations.push({ type: 'compared', description: counts.join('; ') });
    console.log(`package-styles ${label}: ${counts.join('; ')}`);
  });
}
