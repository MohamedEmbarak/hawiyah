// runtime/import-map.json (editor.runtimeFiles.importMap):
// { imports: { '<specifier>': '<path relative to the base>' } } for every bare
// specifier of the closure, sorted by specifier. guide-preview-frame turns each
// path into an absolute URL <origin><base><path>.

/** specifiers: Map<specifier, { path }> with paths relative to runtime/. */
export function importMapOf(specifiers) {
  const imports = {};
  for (const specifier of [...specifiers.keys()].sort()) imports[specifier] = `runtime/${specifiers.get(specifier).path}`;
  return { imports };
}

/** The same map with paths relative to runtime/ (used by the bundle step). */
export function runtimeRelative(importMap) {
  return Object.fromEntries(Object.entries(importMap.imports).map(([specifier, path]) => [specifier, path.replace(/^runtime\//, '')]));
}

export function importMapText(importMap) {
  return `${JSON.stringify(importMap, null, 2)}\n`;
}
