import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { copyFeedbackIcons, createCopyFeedback } from '@hawiyah/core';
import type { CopyFeedback, CopyFeedbackState, CopyResult } from '@hawiyah/core';
import type { ButtonProps } from './forms.js';
import { cx, text } from './shared.js';

export type { CopyResult, CopyStatus } from '@hawiyah/core';
export interface CopyButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'type' | 'aria-label'> {
  /** The value to copy. The function form is called at activation and never before. */
  text: string | (() => string);
  /** Constant accessible name, and the visible text when `display` is "text". */
  label: string;
  /** Status text after a successful copy. */
  copiedMessage: string;
  /** Status text after any failure (denied, unavailable, failed, empty); the reason is in `onCopyResult`. */
  failedMessage: string;
  display?: 'icon' | 'text';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  /** Milliseconds the copied state lasts; a value that is not a finite number above zero means 3000. */
  feedbackDuration?: number;
  onCopyResult?: (result: CopyResult) => void;
}

/** Copies a value on activation and reports the outcome in a polite status beside the button. `className` and `style` go to the root; every other attribute and the ref go to the button. */
export function CopyButton({ text: value, label, copiedMessage, failedMessage, display = 'icon', variant = 'ghost', size = 'md', feedbackDuration = 3000, onCopyResult, disabled, className, style, onClick, ...props }: CopyButtonProps) {
  const name = text('CopyButton', 'label', label);
  const messages = { copied: text('CopyButton', 'copiedMessage', copiedMessage), failed: text('CopyButton', 'failedMessage', failedMessage) };
  const [state, setState] = useState<CopyFeedbackState>('idle');
  const latest = useRef({ value, feedbackDuration, onCopyResult }); latest.current = { value, feedbackDuration, onCopyResult };
  const controller = useRef<CopyFeedback | undefined>(undefined);
  useEffect(() => {
    const current = createCopyFeedback({ getText: () => { const source = latest.current.value; return typeof source === 'function' ? source() : source; }, getDuration: () => latest.current.feedbackDuration, onStateChange: setState, onResult: result => latest.current.onCopyResult?.(result) });
    controller.current = current;
    return () => { current.destroy(); if (controller.current === current) controller.current = undefined; };
  }, []);
  const status = state === 'idle' ? undefined : messages[state];
  return <span className={cx('hw-copy', className)} style={style} data-state={state}>
    <button {...props} type="button" className={display === 'text' ? 'hw-button' : 'hw-button hw-icon-button'} data-variant={variant} data-size={size} aria-label={display === 'text' ? undefined : name} disabled={disabled} onClick={event => { onClick?.(event); if (!disabled) void controller.current?.copy(); }}><span className="hw-icon" data-icon={copyFeedbackIcons[state]} aria-hidden="true" />{display === 'text' ? name : null}</button>
    <span className="hw-copy-message" role="status" aria-live="polite" aria-atomic="true">{status || null}</span>
  </span>;
}
