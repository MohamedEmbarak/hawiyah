// Block size of a result frame of the harness page. A frame takes the height its
// document reports, unless the runner has fixed it: a document with an element whose
// minimum block size follows the viewport (min-block-size: 100dvh, as on
// .hw-app-shell and .hw-portal-layout) is taller than any frame it is given, so it
// would grow with every report until the height bound of the protocol. The runner
// (scripts/equivalence/run.mjs) then gives the four frames of the group one fixed
// height, and a report no longer changes the frame.

export interface FrameHeight {
  /** The iframe of the result. */
  readonly element: HTMLIFrameElement;
  /** The last height the frame document reported (CSS px). */
  reported: number;
  /** The height the runner fixed (CSS px), or null while the frame follows its reports. */
  fixed: number | null;
}

/** A height report of the frame document: the frame takes it unless its height is fixed. */
export function reportHeight(frame: FrameHeight, height: number): void {
  frame.reported = height;
  if (frame.fixed === null) frame.element.style.blockSize = `${height}px`;
}

/**
 * Fixes the height of the frame (CSS px), or with null lets it follow its reports
 * again: it takes the last reported height, or its initial size before any report.
 */
export function fixHeight(frame: FrameHeight, height: number | null): void {
  frame.fixed = height;
  frame.element.style.blockSize = height !== null ? `${height}px` : frame.reported > 0 ? `${frame.reported}px` : '';
}
