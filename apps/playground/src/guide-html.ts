export function escape(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

/** Render a page shell inside the guide while preserving its standalone copyable HTML. */
export function inlineExample(id: string, markup: string): string {
  if (id !== 'portal-layout') return markup;
  const template = document.createElement('template');
  template.innerHTML = markup;
  const main = template.content.querySelector('main');
  if (!main) return markup;
  const section = document.createElement('section');
  for (const attribute of main.attributes) section.setAttribute(attribute.name, attribute.value);
  section.append(...main.childNodes);
  main.replaceWith(section);
  return template.innerHTML;
}
