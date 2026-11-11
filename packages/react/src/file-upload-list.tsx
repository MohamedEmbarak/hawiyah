import type { FileUploadItem, FileUploadLabels } from '@hawiyah/core';
import { fileUploadProgress } from '@hawiyah/core';
import { text } from './shared.js';

export interface FileUploadListProps {
  items: readonly FileUploadItem[];
  /** Status texts and the templated names of each file's progress bar and remove button. */
  labels: FileUploadLabels;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

/** A controlled transfer list. Removing an item is a host request. */
export function FileUploadList({ items, labels, disabled, onRemove }: FileUploadListProps) {
  const copy: Partial<FileUploadLabels> = text('FileUploadList', 'labels', labels) ?? {};
  const label = <Key extends keyof FileUploadLabels>(key: Key) => text('FileUploadList', `labels.${key}`, copy[key]);
  return <ul className="hw-upload-list">
    {items.map(item => <li key={item.id} className="hw-upload-item" data-status={item.status} data-message={item.message ? true : undefined}>
      <span className="hw-upload-name">{item.name}</span>
      <span className="hw-upload-status" role="status">{item.message || label(item.status)}</span>
      {item.status === 'uploading' && <progress max={100} value={fileUploadProgress(item.progress)} aria-label={label('getProgressLabel')?.(item.name) || undefined} />}
      {onRemove && item.removable !== false && <button type="button" className="hw-button" data-variant="subtle" disabled={disabled} aria-label={label('getRemoveLabel')?.(item.name) || undefined} onClick={() => onRemove(item.id)}>{label('remove')}</button>}
    </li>)}
  </ul>;
}
