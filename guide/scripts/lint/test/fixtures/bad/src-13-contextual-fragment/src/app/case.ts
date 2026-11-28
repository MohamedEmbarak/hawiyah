export function render(range: Range, html: string): DocumentFragment {
  return range.createContextualFragment(html);
}
