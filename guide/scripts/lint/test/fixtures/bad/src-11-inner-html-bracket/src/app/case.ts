export function render(element: Element, html: string): void {
  element['innerHTML'] = html;
}
