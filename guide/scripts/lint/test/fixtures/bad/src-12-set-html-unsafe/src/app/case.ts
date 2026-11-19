export function render(element: Element, html: string): void {
  (element as Element & { setHTMLUnsafe(html: string): void }).setHTMLUnsafe(html);
}
