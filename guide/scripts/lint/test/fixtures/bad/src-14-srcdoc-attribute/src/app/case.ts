export function load(frame: HTMLIFrameElement, html: string): void {
  frame.setAttribute('srcdoc', html);
}
