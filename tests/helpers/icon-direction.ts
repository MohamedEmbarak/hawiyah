// These run inside the page through locator.evaluate(), which serializes each
// function on its own, so each one must be self-contained.

/** Visual direction of a DGA arrow drawn as a pseudo-element mask: the icon artwork plus any mirroring. */
export const arrowDirection = (element: Element, pseudo = '::before') => {
  const style = getComputedStyle(element, pseudo);
  const raw = style.maskImage || (style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage || '';
  const inner = raw.match(/url\((["']?)(.*)\1\)/)?.[2] ?? raw;
  const base64 = inner.match(/^data:[^,]*;base64,(.*)$/);
  const encoded = inner.match(/^data:[^,]*,(.*)$/);
  const source = base64 ? atob(base64[1]!) : encoded ? decodeURIComponent(encoded[1]!) : inner;
  const right = /arrow-right-02|M18\.5 12L/.test(source);
  const flipped = /^matrix\(-1/.test(style.transform);
  return right !== flipped ? '"→"' : '"←"';
};

/** Which DGA sort icon a pseudo-element mask shows. */
export const sortIcon = (element: Element) => {
  const raw = getComputedStyle(element, '::before').maskImage;
  const inner = raw.match(/url\((["']?)(.*)\1\)/)?.[2] ?? raw;
  const base64 = inner.match(/^data:[^,]*;base64,(.*)$/);
  const encoded = inner.match(/^data:[^,]*,(.*)$/);
  const source = base64 ? atob(base64[1]!) : encoded ? decodeURIComponent(encoded[1]!) : inner;
  if (/arrow-up-02|M12 5\.5V19/.test(source)) return 'ascending';
  if (/arrow-down-02|M12 18\.502V5/.test(source)) return 'descending';
  return 'unsorted';
};
