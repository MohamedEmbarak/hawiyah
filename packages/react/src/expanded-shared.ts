import { useEffect, useReducer, useRef } from 'react';
import type { RefObject } from 'react';
import { observeFormReset } from '@hawiyah/core';
/** Runs `reset` after a native reset of the control's form has been applied, then renders the component once more,
 * so that controlled props are written to the DOM again. Attached after mount; nothing runs on the server. */
export function useFormReset(node: RefObject<Element | null>, reset?: () => void) {
  const latest = useRef(reset); latest.current = reset;
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    const element = node.current;
    if (!element) return;
    const observer = observeFormReset(element, () => { latest.current?.(); rerender(); });
    return () => observer.destroy();
  }, [node]);
}
