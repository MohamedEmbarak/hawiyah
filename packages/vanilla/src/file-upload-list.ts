import { fileUploadLabels, fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';

export interface FileUploadListOptions {
  items: readonly FileUploadItem[];
  labels?: FileUploadLabels;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

export function createFileUploadList(root: HTMLElement, options: FileUploadListOptions) {
  const original = Array.from(root.childNodes);
  const list = root.ownerDocument.createElement('ul');
  list.className = 'hw-upload-list';
  root.replaceChildren(list);
  const labels = options.labels ?? fileUploadLabels;
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
      status.textContent = item.message || labels[item.status]; row.append(name, status);
      if (item.status === 'uploading') {
        const progress = root.ownerDocument.createElement('progress');
        progress.max = 100;
        const value = fileUploadProgress(item.progress);
        if (value !== undefined) progress.value = value;
        progress.setAttribute('aria-label', `${labels.uploading} ${item.name}`); row.append(progress);
      }
      if (options.onRemove && item.removable !== false) {
        const button = root.ownerDocument.createElement('button');
        button.type = 'button'; button.className = 'hw-button'; button.dataset.variant = 'subtle';
        button.textContent = labels.remove; button.disabled = disabled;
        button.setAttribute('aria-label', `${labels.remove} ${item.name}`);
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
