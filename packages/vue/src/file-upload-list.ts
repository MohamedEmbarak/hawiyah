import { defineComponent, h, type PropType } from 'vue';
import { fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';
import { needText, optionalText } from './shared.js';

export const FileUploadList = defineComponent({
  name: 'HwFileUploadList',
  props: {
    items: { type: Array as PropType<readonly FileUploadItem[]>, required: true },
    labels: { type: Object as PropType<FileUploadLabels>, required: true },
    disabled: Boolean,
    removable: Boolean,
  },
  emits: { remove: (_id: string) => true },
  setup(props, { emit }) {
    // Every label is application text; a missing one renders nothing in its place.
    const label = (name: Exclude<keyof FileUploadLabels, 'getProgressLabel' | 'getRemoveLabel'>) => needText('FileUploadList', `labels.${name}`, props.labels?.[name]);
    const named = (name: 'getProgressLabel' | 'getRemoveLabel', file: string) => { const get = needText('FileUploadList', `labels.${name}`, props.labels?.[name]); return get ? optionalText(get(file)) : undefined; };
    return () => h('ul', { class: 'hw-upload-list' }, props.items.map(item => h('li', { key: item.id, class: 'hw-upload-item', 'data-status': item.status, 'data-message': item.message ? true : undefined }, [
      h('span', { class: 'hw-upload-name' }, item.name),
      h('span', { class: 'hw-upload-status', role: 'status' }, optionalText(item.message) ?? label(item.status)),
      item.status === 'uploading' ? h('progress', { max: 100, value: fileUploadProgress(item.progress), 'aria-label': named('getProgressLabel', item.name) }) : null,
      props.removable && item.removable !== false ? h('button', { type: 'button', class: 'hw-button', 'data-variant': 'subtle', disabled: props.disabled, 'aria-label': named('getRemoveLabel', item.name), onClick: () => emit('remove', item.id) }, label('remove')) : null,
    ])));
  },
});
