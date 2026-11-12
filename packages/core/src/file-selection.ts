export interface FileSelectionRules {
  /** The `accept` list of a file input: extensions (".pdf"), wildcard types ("image/*") and exact MIME types. */
  accept?: string | null;
  /** Whether more than one file may be chosen. Default false. */
  multiple?: boolean;
  /** Largest size of one file in bytes. Zero, a negative number, Infinity, null and undefined mean no limit. */
  maxSize?: number | null;
}
export type FileRejectionReason = 'count' | 'type' | 'size';
export interface FileSelectionResult<F> {
  /** Every file of the batch when none was rejected, otherwise empty. */
  accepted: F[];
  /** The rejected files in the order they were given. */
  rejected: F[];
  /** `reasons[i]` belongs to `rejected[i]`. */
  reasons: FileRejectionReason[];
}

/** Whether a file matches an `accept` list. An empty list matches every file. */
export function matchesFileAccept(file: { name: string; type: string }, accept: string | null | undefined): boolean {
  const tokens = (accept ?? '').split(',').map(token => token.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some(token => token.startsWith('.') ? name.endsWith(token)
    : token.endsWith('/*') ? type.startsWith(token.slice(0, -1))
      : type === token);
}

/** Evaluates one batch of chosen or dropped files. A batch replaces the selection, and a batch with any
 * rejected file is accepted in no part. Without `multiple`, more than one file rejects them all with 'count'. */
export function evaluateFileSelection<F extends { name: string; type: string; size: number }>(files: readonly F[], rules: FileSelectionRules = {}): FileSelectionResult<F> {
  const rejected: F[] = [];
  const reasons: FileRejectionReason[] = [];
  if (files.length > 1 && !rules.multiple) {
    return { accepted: [], rejected: [...files], reasons: files.map(() => 'count' as const) };
  }
  const limit = typeof rules.maxSize === 'number' && Number.isFinite(rules.maxSize) && rules.maxSize > 0 ? rules.maxSize : undefined;
  for (const file of files) {
    const reason: FileRejectionReason | undefined = !matchesFileAccept(file, rules.accept) ? 'type'
      : limit !== undefined && file.size > limit ? 'size' : undefined;
    if (reason) { rejected.push(file); reasons.push(reason); }
  }
  return { accepted: rejected.length ? [] : [...files], rejected, reasons };
}

/** Whether a drag carries files, read from `DataTransfer.types`. Other drags are left to the browser. */
export function isFileDrag(transfer: { types?: ArrayLike<string> | null } | null | undefined): boolean {
  const types = transfer?.types;
  if (!types) return false;
  for (let index = 0; index < types.length; index++) if (types[index] === 'Files') return true;
  return false;
}
