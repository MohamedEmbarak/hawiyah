import { copyFeedbackIcons, createCleanup, createCopyFeedback, hasText, requireText, type CopyFeedbackState, type CopyResult } from '@hawiyah/core';
import { emit, named, remember, required, text, writeContent, writeText } from './dom.js';

/** Texts are required; text, label and the messages fall back to `data-hw-*` attributes on the root (see README). */
export interface CopyButtonOptions {
  /** The value to copy, read at activation. Else `data-hw-text`, else the textContent of the element whose id is `data-hw-target`. */
  text?: string | (() => string);
  /** Accessible name (data-hw-label), written as aria-label only when the authored button has no aria-label, aria-labelledby or text. Required. */
  label?: string;
  /** Status text after a successful copy (data-hw-copied-message). Required. */
  copiedMessage?: string;
  /** Status text after any failure (data-hw-failed-message). Required. */
  failedMessage?: string;
  /** Milliseconds the copied state lasts (data-hw-feedback-duration); not a finite number above zero means 3000. */
  feedbackDuration?: number;
  onCopyResult?: (result: CopyResult) => void;
}
export interface CopyButtonController { readonly state: CopyFeedbackState; copy(): Promise<CopyResult | undefined>; destroy(): void }

/** Enhances authored `span.hw-copy` markup: the first button copies, `.hw-copy-message` announces the outcome. */
export function createCopyButton(root: HTMLElement, options: CopyButtonOptions = {}): CopyButtonController {
  const button = required<HTMLButtonElement>(root, 'button');
  const status = required<HTMLElement>(root, '.hw-copy-message');
  const icon = button.querySelector<HTMLElement>('.hw-icon');
  const scope = createCleanup();
  remember(scope, root, ['data-state']); remember(scope, button, ['type', 'aria-label']); remember(scope, status, ['role', 'aria-live', 'aria-atomic']);
  if (icon) remember(scope, icon, ['data-icon']);
  const authored = [...status.childNodes];
  scope.add(() => status.replaceChildren(...authored));
  const message = (name: 'copiedMessage' | 'failedMessage') => text(root, name, options[name]);
  // The three texts are checked at creation, so a missing failure message is reported before a failure happens.
  if (!named(button) && !hasText(button.textContent)) writeText(button, 'aria-label', 'CopyButton', 'label', text(root, 'label', options.label));
  requireText('CopyButton', 'copiedMessage', message('copiedMessage')); requireText('CopyButton', 'failedMessage', message('failedMessage'));
  if (!button.hasAttribute('type')) button.type = 'button';
  if (!status.hasAttribute('role')) status.setAttribute('role', 'status');
  if (!status.hasAttribute('aria-live')) status.setAttribute('aria-live', 'polite');
  if (!status.hasAttribute('aria-atomic')) status.setAttribute('aria-atomic', 'true');
  status.textContent = '';
  const source = (): string => {
    const value = options.text ?? root.getAttribute('data-hw-text');
    if (typeof value === 'function') return value();
    if (value !== null) return value;
    const target = root.getAttribute('data-hw-target');
    return target ? root.ownerDocument.getElementById(target)?.textContent ?? '' : '';
  };
  const render = (state: CopyFeedbackState) => {
    root.dataset.state = state;
    icon?.setAttribute('data-icon', copyFeedbackIcons[state]);
    if (state === 'idle') status.textContent = '';
    else writeContent(status, 'CopyButton', state === 'copied' ? 'copiedMessage' : 'failedMessage', message(state === 'copied' ? 'copiedMessage' : 'failedMessage'));
  };
  const feedback = createCopyFeedback({
    getText: source,
    getDuration: () => { const value = root.getAttribute('data-hw-feedback-duration'); return options.feedbackDuration ?? (value === null ? undefined : Number(value)); },
    onStateChange: render,
    onResult: result => { options.onCopyResult?.(result); emit(root, { status: result.status, text: result.text }); },
  });
  scope.add(() => feedback.destroy());
  render('idle');
  scope.listen(button, 'click', () => { if (!button.disabled && button.getAttribute('aria-disabled') !== 'true') void feedback.copy(); });
  return { get state() { return feedback.state; }, copy: () => feedback.copy(), destroy: () => scope.destroy() };
}
