/** Transfer status is supplied by the host that performs the upload. */
export interface FileUploadItem {
  id: string;
  name: string;
  status: 'selected' | 'uploading' | 'complete' | 'error';
  message?: string;
  progress?: number;
  removable?: boolean;
}

export function fileUploadProgress(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : Math.min(100, Math.max(0, value));
}

/** Text for the upload list. All of it is supplied by the application. */
export interface FileUploadLabels {
  selected: string;
  uploading: string;
  complete: string;
  error: string;
  /** Visible text of the remove button. */
  remove: string;
  /** Accessible name of one file's progress bar. */
  getProgressLabel: (name: string) => string;
  /** Accessible name of one file's remove button. */
  getRemoveLabel: (name: string) => string;
}
