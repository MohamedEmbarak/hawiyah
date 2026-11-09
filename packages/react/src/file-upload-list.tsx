import type { FileUploadItem, FileUploadLabels } from '@hawiyah/core';
import { fileUploadLabels, fileUploadProgress } from '@hawiyah/core';

export interface FileUploadListProps {
  items: readonly FileUploadItem[];
  labels?: FileUploadLabels;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

/** A controlled transfer list. Removing an item is a host request. */
export function FileUploadList({ items, labels = fileUploadLabels, disabled, onRemove }: FileUploadListProps) {
  return <ul className="hw-upload-list">
    {items.map(item => <li key={item.id} className="hw-upload-item" data-status={item.status} data-message={item.message ? true : undefined}>
      <span className="hw-upload-name">{item.name}</span>
      <span className="hw-upload-status" role="status">{item.message || labels[item.status]}</span>
      {item.status === 'uploading' && <progress max={100} value={fileUploadProgress(item.progress)} aria-label={`${labels.uploading} ${item.name}`} />}
      {onRemove && item.removable !== false && <button type="button" className="hw-button" data-variant="subtle" disabled={disabled} aria-label={`${labels.remove} ${item.name}`} onClick={() => onRemove(item.id)}>{labels.remove}</button>}
    </li>)}
  </ul>;
}
