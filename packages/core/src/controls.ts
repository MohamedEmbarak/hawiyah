export function normalizeDigits(value: string): string {
  return value.replace(/[\u0660-\u0669\u06f0-\u06f9]/gu, digit =>
    String(digit.charCodeAt(0) - (digit.charCodeAt(0) <= 0x669 ? 0x660 : 0x6f0)));
}

export function clampRange(values: readonly [number, number], min: number, max: number, changed: 'lower' | 'upper'): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) throw new RangeError('Hawiyah: range bounds must be finite and ordered.');
  const clamp = (value: number, fallback: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));
  let lower = clamp(values[0], min);
  let upper = clamp(values[1], max);
  if (lower > upper) { if (changed === 'lower') lower = upper; else upper = lower; }
  return [lower, upper];
}

/** Immutable, stable, locale-aware sort. Missing values sort last in either direction. */
export function sortRows<T extends object>(rows: readonly T[], key: keyof T | string, direction: 'ascending' | 'descending', locale = 'ar-SA'): T[] {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  return rows.map((row, index) => ({ row, index })).sort((a, b) => {
    const left = a.row[key as keyof T];
    const right = b.row[key as keyof T];
    if (left == null && right != null) return 1;
    if (right == null && left != null) return -1;
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right)
      : collator.compare(String(left ?? ''), String(right ?? ''));
    return (direction === 'ascending' ? comparison : -comparison) || a.index - b.index;
  }).map(({ row }) => row);
}
