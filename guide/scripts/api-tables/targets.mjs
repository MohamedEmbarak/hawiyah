// The exports whose declarations each page documents. By default a page id
// maps to create<Name> (vanilla), <Name> (React and Vue) and Hw<Name>Component
// or Hw<Name>Directive (Angular). A page that documents a different or a
// further export names it here; the first Angular class is the documented
// class and the members of every further class are written '<element> <name>'.
export const TARGET_OVERRIDES = {
  tabs: { angular: ['HwTabsComponent', 'HwTabComponent'] },
};

export function pascal(id) {
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}

/** Exports documented by page `id`; Angular falls back to the Directive class when no Component exists. */
export function targetsFor(id, exists = () => true) {
  const name = pascal(id);
  const override = TARGET_OVERRIDES[id] ?? {};
  const component = `Hw${name}Component`;
  const directive = `Hw${name}Directive`;
  return {
    vanilla: override.vanilla ?? `create${name}`,
    react: override.react ?? name,
    vue: override.vue ?? name,
    angular: override.angular ?? [exists('angular', component) || !exists('angular', directive) ? component : directive],
  };
}
