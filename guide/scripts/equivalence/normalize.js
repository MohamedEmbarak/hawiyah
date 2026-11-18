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
// Rules: comments and white-space-only text are dropped; custom elements (tag
// with '-') without an hw- class are unwrapped, those with an hw- class are
// compared as div; class keeps the hw- tokens, sorted; kept attributes are role,
// every aria-*, data-* except data-hw, data-hw-*, data-v-* and data-ng*, and the
// native attributes listed in KEEP; ids become #<n> in first-appearance order and
// the id references of for, form, list, headers and the ARIA IDREF attributes
// are rewritten (a reference to an id outside the tree becomes '#?'); name values
// become name#<n>; every other kept value is compared as written; form controls
// add their live value, checked, selected and indeterminate.
export function normalize(target) {
  const KEEP = [
    'type', 'name', 'value', 'href', 'disabled', 'checked', 'selected', 'hidden', 'open', 'inert', 'tabindex',
    'required', 'readonly', 'placeholder', 'alt', 'title', 'dir', 'lang', 'multiple', 'min', 'max', 'step',
    'pattern', 'autocomplete', 'inputmode', 'maxlength', 'minlength', 'src', 'width', 'height', 'colspan',
    'rowspan', 'scope', 'target', 'rel', 'download', 'for', 'form', 'list', 'headers',
  ];
  const ID_REFERENCES = ['for', 'form', 'list', 'headers'];
  // ARIA attributes whose value is an id or a list of ids (WAI-ARIA 1.2 IDREF and IDREFS).
  const ARIA_REFERENCES = [
    'aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-details', 'aria-errormessage',
    'aria-flowto', 'aria-labelledby', 'aria-owns',
  ];
  const ELEMENT = 1;
  const TEXT = 3;

  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) throw new Error(`normalize: no element matches ${String(target)}`);

  const keepAttribute = (name) => {
    if (name === 'role' || name.startsWith('aria-')) return true;
    if (name.startsWith('data-')) {
      return !(name === 'data-hw' || name.startsWith('data-hw-') || name.startsWith('data-v-') || name.startsWith('data-ng'));
    }
    return KEEP.includes(name);
  };
  const hwClasses = (element) => {
    const value = element.getAttribute('class') || '';
    return value.split(/\s+/).filter((token) => token.startsWith('hw-')).sort();
  };
  const collapse = (text) => text.replace(/\s+/g, ' ').trim();

  // First pass: ids and names in first-appearance (document) order of the kept tree.
  const ids = new Map();
  const names = new Map();
  const visit = (element) => {
    const unwrapped = element.localName.includes('-') && hwClasses(element).length === 0;
    const id = unwrapped ? null : element.getAttribute('id');
    if (id !== null && id !== '' && !ids.has(id)) ids.set(id, `#${ids.size + 1}`);
    const name = element.getAttribute('name');
    if (name !== null && !names.has(name)) names.set(name, `name#${names.size + 1}`);
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
    const classes = hwClasses(node);
    if (classes.length > 0) attrs.class = classes.join(' ');
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name === 'class' || name === 'id' || name === 'style') continue;
      if (!keepAttribute(name)) continue;
      let value = attribute.value;
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
        const custom = node.localName.includes('-');
        if (custom && hwClasses(node).length === 0) {
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
