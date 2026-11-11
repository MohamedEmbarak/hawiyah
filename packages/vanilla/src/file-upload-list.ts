import { fileUploadProgress, requireText, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';
import { writeContent, writeText } from './dom.js';

export interface FileUploadListOptions {
  items: readonly FileUploadItem[];
  /** All text of the list, supplied by the application. Required. */
  labels: FileUploadLabels;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

export function createFileUploadList(root: HTMLElement, options: FileUploadListOptions) {
  const original = Array.from(root.childNodes);
  const list = root.ownerDocument.createElement('ul');
  list.className = 'hw-upload-list';
  root.replaceChildren(list);
  requireText('FileUploadList', 'labels', options.labels);
  const labels: Partial<FileUploadLabels> = options.labels ?? {};
  let destroyed = false;
  let disabled = !!options.disabled;
  const render = (items: readonly FileUploadItem[]) => {
    if (destroyed) return;
    list.replaceChildren(...items.map(item => {
      const row = root.ownerDocument.createElement('li');
      row.className = 'hw-upload-item'; row.dataset.status = item.status;
      if (item.message) row.dataset.message = 'true';
      const name = root.ownerDocument.createElement('span');
      name.className = 'hw-upload-name'; name.textContent = item.name;
      const status = root.ownerDocument.createElement('span');
      status.className = 'hw-upload-status'; status.setAttribute('role', 'status');
      if (item.message) status.textContent = item.message; else writeContent(status, 'FileUploadList', `labels.${item.status}`, labels[item.status]); row.append(name, status);
      if (item.status === 'uploading') {
        const progress = root.ownerDocument.createElement('progress');
        progress.max = 100;
        const value = fileUploadProgress(item.progress);
        if (value !== undefined) progress.value = value;
        writeText(progress, 'aria-label', 'FileUploadList', 'labels.getProgressLabel', labels.getProgressLabel?.(item.name)); row.append(progress);
      }
      if (options.onRemove && item.removable !== false) {
        const button = root.ownerDocument.createElement('button');
        button.type = 'button'; button.className = 'hw-button'; button.dataset.variant = 'subtle';
        writeContent(button, 'FileUploadList', 'labels.remove', labels.remove); button.disabled = disabled;
        writeText(button, 'aria-label', 'FileUploadList', 'labels.getRemoveLabel', labels.getRemoveLabel?.(item.name));
        button.addEventListener('click', () => {
          if (!destroyed && !disabled && list.contains(button)) options.onRemove?.(item.id);
        }); row.append(button);
      }
      return row;
    }));
  };
  render(options.items);
  return {
    update: render,
    setDisabled(value: boolean) {
      if (destroyed) return;
      disabled = value;
      for (const button of list.querySelectorAll('button')) button.disabled = disabled;
    },
    destroy() { if (destroyed) return; destroyed = true; root.replaceChildren(...original); },
  };
}
