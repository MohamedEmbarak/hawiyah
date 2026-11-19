// DOM normaliser of the equivalence harness (contentPipeline.equivalence.structure).
//
// normalize(target) is evaluated inside each example frame by Playwright
// (frame.evaluate(normalize, '#app')), so it is self-contained: no import, no
// closure over module scope. target is a CSS selector of the mount (#app or
// guide-example) or an element (tests). The result is the list of normalised
// children of the mount:
//   text node    -> string (white space collapsed and trimmed)
//   element node -> { tag, attrs: { name: value } (sorted), props?: {...}, children: [...] }
//
// Rules: comments and white-space-only text are dropped. Every attribute is
// kept except the framework noise of NOISE below (written list, one reason
// each). class keeps every token except Angular's ng-* state classes, sorted;
// style is compared as the browser serialises it (element.style.cssText). A
// custom element (tag with '-') is compared as div when it has an hw- class or
// carries role or aria-*; otherwise it is an unwrapped framework host. ids
// become #<n> in first-appearance order and the id references of for, form,
// list, headers, popovertarget, commandfor and the ARIA IDREF attributes are
// rewritten (a reference to an id outside the tree becomes '#?'). name values
// are compared as written unless they look generated (GENERATED_NAME); form
// controls add their live value, checked, selected and indeterminate. Static
// input values that Angular leaves as attributes on @hawiyah/angular elements
// are noise too (angularInput).
export function normalize(target) {
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
    /^data-hw(?:-[a-z0-9-]+)?$/, // @hawiyah/vanilla: declarative enhancement hooks; the behaviour they select is compared by the group's checks
  ];
  // Names a framework or an adapter generates (React useId, numbered ids).
  const GENERATED_NAME = /^(?:[:«]r[0-9a-z]+[:»]|_r_[0-9a-z]+_|hw-[a-z0-9-]*-\d+(?:-[a-z0-9-]+)?|ng-[a-z0-9-]*\d+)$/;
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
  const keepAttribute = (name, element) => !NOISE.some((pattern) => pattern.test(name)) && !angularInput(element, name);
  const tokens = (element) => (element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  const hwClasses = (element) => tokens(element).filter((token) => token.startsWith('hw-')).sort();
  const keptClasses = (element) => [...new Set(tokens(element).filter((token) => !token.startsWith('ng-')))].sort();
  // A custom element is an unwrapped framework host unless it has an hw- class
  // or exposes itself to assistive technology.
  const unwrap = (element) => element.localName.includes('-') && hwClasses(element).length === 0
    && !Array.from(element.attributes).some((attribute) => attribute.name === 'role' || attribute.name.startsWith('aria-'));
  const collapse = (text) => text.replace(/\s+/g, ' ').trim();

  // First pass: ids and names in first-appearance (document) order of the kept tree.
  const ids = new Map();
  const names = new Map();
  const visit = (element) => {
    const id = unwrap(element) ? null : element.getAttribute('id');
    if (id !== null && id !== '' && !ids.has(id)) ids.set(id, `#${ids.size + 1}`);
    const name = element.getAttribute('name');
    if (name !== null && GENERATED_NAME.test(name) && !names.has(name)) names.set(name, `name#${names.size + 1}`);
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
        value = node.style ? node.style.cssText : value;
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
