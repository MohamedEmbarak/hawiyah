import type { FileUploadItem, FileUploadLabels } from '@nasaq/core';
import { fileUploadLabels, fileUploadProgress } from '@nasaq/core';

export interface FileUploadListProps {
  items: readonly FileUploadItem[];
  labels?: FileUploadLabels;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

/** A controlled transfer list. Removing an item is a host request. */
export function FileUploadList({ items, labels = fileUploadLabels, disabled, onRemove }: FileUploadListProps) {
  return <ul className="nq-upload-list">
    {items.map(item => <li key={item.id} className="nq-upload-item" data-status={item.status} data-message={item.message ? true : undefined}>
      <span className="nq-upload-name">{item.name}</span>
      <span className="nq-upload-status" role="status">{item.message || labels[item.status]}</span>
      {item.status === 'uploading' && <progress max={100} value={fileUploadProgress(item.progress)} aria-label={`${labels.uploading} ${item.name}`} />}
      {onRemove && item.removable !== false && <button type="button" className="nq-button" data-variant="subtle" disabled={disabled} aria-label={`${labels.remove} ${item.name}`} onClick={() => onRemove(item.id)}>{labels.remove}</button>}
    </li>)}
  </ul>;
}
