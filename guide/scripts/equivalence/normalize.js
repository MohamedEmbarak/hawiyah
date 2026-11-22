// DOM normaliser of the equivalence harness (contentPipeline.equivalence.structure).
//
// normalize(input) is evaluated inside each example frame by Playwright
// (frame.evaluate(normalize, { target: '#app', generatedName, styled })), so it is
// self-contained: no import, no closure over module scope. target is a CSS selector
// of the mount (#app or guide-example) or an element (tests); generatedName is the
// pattern of the names the adapters generate (generated-names.mjs) and styled the
// data-hw-* attributes the package stylesheet selects (styled-attributes.mjs), both
// read from the installed packages. The result is the list of normalised children of
// the mount:
//   text node    -> string (white space collapsed and trimmed)
//   element node -> { tag, attrs: { name: value } (sorted), props?: {...}, children: [...] }
//
// Rules: comments and white-space-only text are dropped. Every attribute is
// kept except the framework noise of NOISE below (written list, one reason
// each) and a vanilla configuration hook (VANILLA_CONFIGURATION) on an element
// where no compound of the package stylesheet selects it. class keeps every
// token except Angular's ng-* state classes, sorted; style is compared as the set
// of declarations the browser parsed (element.style, see declarations). A custom element (tag with '-')
// is compared as div when it has an hw- class, carries a global attribute that the
// browser or assistive technology gives meaning to (GLOBAL) or a data-hw-* attribute
// of the styled set; otherwise it is an unwrapped framework host. ids become #<n> in first-appearance order and the
// id references of for, form, list, headers, popovertarget, commandfor and the
// ARIA IDREF attributes are rewritten (a reference to an id outside the tree
// becomes '#?'). name values are compared as written unless they match
// generatedName; form controls add their live value, checked, selected and
// indeterminate. Static input values that Angular leaves as attributes on
// @hawiyah/angular elements are noise too (angularInput).
export function normalize(input) {
  const options = typeof input === 'object' && input !== null && 'target' in input ? input : { target: input };
  const target = options.target;
  // Framework noise: attributes that a framework or an adapter's own hooks
  // write and that neither the reader nor assistive technology perceives.
  const NOISE = [
    /^data-v-/, // Vue: scoped style ids and data-v-app on the mount
    /^_ng(?:content|host)-/, // Angular: emulated encapsulation ids
    /^ng-(?:version|reflect-|server-context)/, // Angular: version stamp and development reflection
    /^ngh$/, // Angular: hydration annotations
    /^jsaction$/, // Angular: event replay
    /^data-ng/, // Angular: internal data attributes
    /^hw[a-z][a-z0-9]*$/, // Angular: attribute-directive selectors of @hawiyah/angular (hwButton renders hwbutton)
    /^data-hw$/, // @hawiyah/vanilla: the enhancement hook that names the controller; the behaviour is compared by the group's checks
  ];
  // @hawiyah/vanilla configuration hooks, by name: the controller reads them as
  // options. Left out only where no compound of the package stylesheet selects them
  // (styled); scripts/equivalence/test checks that each name occurs in the installed
  // @hawiyah/vanilla. data-hw-value is compared (the four adapters write it on the
  // items of a navigation list) except where VANILLA_SCOPED names it.
  const VANILLA_CONFIGURATION = [
    'data-hw-activation', // automatic or manual activation of Tabs; the behaviour is compared by the Tabs checks
    'data-hw-overflow', // the overflow mode of Tabs on the root (the tab list carries the state, which the stylesheet selects)
    'data-hw-overflow-label', // the label the controller gives the overflow control of Tabs: that control's accessible name is compared where it is rendered
  ];
  // A hook left out only on the elements of one selector: [attribute, selector].
  const VANILLA_SCOPED = [
    ['data-hw-value', '.hw-tab'], // the value of a tab that createTabs reads (dataset.hwValue); React, Vue and Angular take it as a prop and write none on the tab
  ];
  // Global attributes that the browser or assistive technology gives meaning to: a
  // custom element that carries one is compared, not unwrapped.
  const GLOBAL = /^(?:tabindex|hidden|inert|lang|dir|title|contenteditable|draggable|style|role|aria-.+|accesskey|autofocus|popover|spellcheck|translate)$/;
  // Names the adapters generate (generated-names.mjs); none without the pattern.
  const GENERATED_NAME = typeof options.generatedName === 'string' ? new RegExp(options.generatedName) : null;
  const styled = options.styled ?? {};
  const ID_REFERENCES = ['for', 'form', 'list', 'headers', 'popovertarget', 'commandfor', 'interestfor'];
  // ARIA attributes whose value is an id or a list of ids (WAI-ARIA 1.2 IDREF and IDREFS).
  const ARIA_REFERENCES = [
    'aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-details', 'aria-errormessage',
    'aria-flowto', 'aria-labelledby', 'aria-owns',
  ];
  const ELEMENT = 1;
  const TEXT = 3;

  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) throw new Error(`normalize: no element matches ${String(target)}`);

  // Angular keeps a static input value as a DOM attribute (<button hwButton
  // variant="primary">). On an element of a @hawiyah/angular directive (an hw*
  // selector attribute) or component (an hw-* tag), an attribute that is not
  // role, aria-* or data-* and that the element does not reflect as a property
  // is such an input: the browser gives it no meaning.
  const angularHost = (element) => element.localName.startsWith('hw-')
    || Array.from(element.attributes).some((attribute) => /^hw[a-z][a-z0-9]*$/.test(attribute.name));
  // Content attributes whose property has another name (for -> htmlFor, ...).
  const REFLECTED_AS = { for: 'htmlfor', class: 'classname', popovertarget: 'popovertargetelement', commandfor: 'commandforelement', interestfor: 'interestforelement' };
  const reflected = new Map();
  const reflects = (element, name) => {
    let names = reflected.get(element.constructor);
    if (!names) {
      names = new Set();
      for (let proto = Object.getPrototypeOf(element); proto; proto = Object.getPrototypeOf(proto)) {
        for (const key of Object.getOwnPropertyNames(proto)) names.add(key.toLowerCase());
      }
      reflected.set(element.constructor, names);
    }
    return names.has(REFLECTED_AS[name] ?? name.replace(/-/g, ''));
  };
  const angularInput = (element, name) => angularHost(element) && name !== 'role' && name !== 'style'
    && !name.startsWith('aria-') && !name.startsWith('data-') && !reflects(element, name);
  // A data-hw-* attribute is selected here when one of its compounds matches the element
  // (a compound the browser cannot parse counts as a match: the attribute is kept).
  const selectedHere = (element, name) => (styled[name] ?? []).some((compound) => {
    try {
      return element.matches(compound);
    } catch {
      return true;
    }
  });
  const configuration = (element, name) =>
    (VANILLA_CONFIGURATION.includes(name) || VANILLA_SCOPED.some(([attribute, selector]) => attribute === name && element.matches(selector))) && !selectedHere(element, name);
  const keepAttribute = (name, element) => !NOISE.some((pattern) => pattern.test(name)) && !angularInput(element, name) && !configuration(element, name);
  const tokens = (element) => (element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  const hwClasses = (element) => tokens(element).filter((token) => token.startsWith('hw-')).sort();
  const keptClasses = (element) => [...new Set(tokens(element).filter((token) => !token.startsWith('ng-')))].sort();
  // A custom element is an unwrapped framework host unless it has an hw- class, or
  // carries a global attribute with a meaning (GLOBAL) or a data-hw-* attribute that
  // the package stylesheet selects (styled: data-hw-mode, data-hw-theme, ...).
  const unwrap = (element) => element.localName.includes('-') && hwClasses(element).length === 0
    && !Array.from(element.attributes).some((attribute) => GLOBAL.test(attribute.name) || Object.hasOwn(styled, attribute.name));
  const collapse = (text) => text.replace(/\s+/g, ' ').trim();
  // The declarations of a style attribute as a set: each one 'property: value;' (with
  // ' !important' where set) as the browser parsed it, its value with white space
  // collapsed and none next to a comma or a parenthesis, sorted and joined by a space.
  // The order, the white space and a trailing semicolon of the written attribute do not
  // count; another property, value or priority does (the pilot of the Stack page: the
  // vanilla block writes the custom properties that the adapters set one by one).
  const declarations = (style) => {
    const out = new Set();
    for (let index = 0; index < style.length; index += 1) {
      const property = style.item(index);
      const value = collapse(style.getPropertyValue(property)).replace(/\s*([,()])\s*/g, '$1').replace(/,/g, ', ');
      const priority = style.getPropertyPriority(property);
      out.add(`${property}: ${value}${priority ? ` !${priority}` : ''};`);
    }
    return [...out].sort().join(' ');
  };

  // First pass: ids and names in first-appearance (document) order of the kept tree.
  const ids = new Map();
  const names = new Map();
  const visit = (element) => {
    const id = unwrap(element) ? null : element.getAttribute('id');
    if (id !== null && id !== '' && !ids.has(id)) ids.set(id, `#${ids.size + 1}`);
    const name = element.getAttribute('name');
    if (name !== null && GENERATED_NAME && GENERATED_NAME.test(name) && !names.has(name)) names.set(name, `name#${names.size + 1}`);
    for (const child of Array.from(element.children)) visit(child);
  };
  for (const child of Array.from(root.children)) visit(child);

  const reference = (value) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => ids.get(token) || '#?')
      .join(' ');

  const liveProperties = (element) => {
    const tag = element.localName;
    if (tag === 'input') {
      return { value: element.value, checked: element.checked, indeterminate: element.indeterminate };
    }
    if (tag === 'select' || tag === 'textarea') return { value: element.value };
    if (tag === 'option') return { selected: element.selected, value: element.value };
    return null;
  };

  const element = (node) => {
    const attrs = {};
    const classes = keptClasses(node);
    if (classes.length > 0) attrs.class = classes.join(' ');
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name === 'class' || name === 'id') continue;
      if (!keepAttribute(name, node)) continue;
      let value = attribute.value;
      if (name === 'style') {
        value = node.style ? declarations(node.style) : value;
        if (value === '') continue;
      }
      if (name === 'name') value = names.get(value) || value;
      else if (ID_REFERENCES.includes(name) || ARIA_REFERENCES.includes(name)) value = reference(value);
      attrs[name] = value;
    }
    const id = node.getAttribute('id');
    if (id !== null && id !== '') attrs.id = ids.get(id);
    const sorted = {};
    for (const key of Object.keys(attrs).sort()) sorted[key] = attrs[key];
    const tag = node.localName.includes('-') ? 'div' : node.localName;
    const out = { tag, attrs: sorted };
    const props = liveProperties(node);
    if (props) out.props = props;
    out.children = children(node);
    return out;
  };

  // Children with custom-element hosts without hw- class unwrapped and adjacent
  // text joined (an unwrapped host can leave two text nodes side by side).
  function children(parent) {
    const out = [];
    const push = (item) => {
      if (typeof item === 'string' && typeof out[out.length - 1] === 'string') {
        out[out.length - 1] = collapse(`${out[out.length - 1]} ${item}`);
      } else {
        out.push(item);
      }
    };
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === TEXT) {
        const text = collapse(node.data);
        if (text) push(text);
      } else if (node.nodeType === ELEMENT) {
        if (unwrap(node)) {
          for (const item of children(node)) push(item);
        } else {
          push(element(node));
        }
      }
    }
    return out;
  }

  return children(root);
}
