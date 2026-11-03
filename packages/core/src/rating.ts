/** Rating widgets share a finite, bounded star count across native adapters. */
export function normalizeRatingMax(max = 5): number {
  return Number.isFinite(max) ? Math.max(1, Math.min(20, Math.floor(max))) : 5;
}

/** Preserve fractional aggregate scores; integer inputs floor this result. */
export function normalizeRatingValue(value: number, max: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(normalizeRatingMax(max), value)) : 0;
}
