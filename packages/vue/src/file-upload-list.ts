import { defineComponent, h, type PropType } from 'vue';
import { fileUploadLabels, fileUploadProgress, type FileUploadItem, type FileUploadLabels } from '@hawiyah/core';

export const FileUploadList = defineComponent({
  name: 'HwFileUploadList',
  props: {
    items: { type: Array as PropType<readonly FileUploadItem[]>, required: true },
    labels: { type: Object as PropType<FileUploadLabels>, default: () => fileUploadLabels },
    disabled: Boolean,
    removable: Boolean,
  },
  emits: { remove: (_id: string) => true },
  setup(props, { emit }) {
    return () => h('ul', { class: 'hw-upload-list' }, props.items.map(item => h('li', { key: item.id, class: 'hw-upload-item', 'data-status': item.status, 'data-message': item.message ? true : undefined }, [
      h('span', { class: 'hw-upload-name' }, item.name),
      h('span', { class: 'hw-upload-status', role: 'status' }, item.message || props.labels[item.status]),
      item.status === 'uploading' ? h('progress', { max: 100, value: fileUploadProgress(item.progress), 'aria-label': `${props.labels.uploading} ${item.name}` }) : null,
      props.removable && item.removable !== false ? h('button', { type: 'button', class: 'hw-button', 'data-variant': 'subtle', disabled: props.disabled, 'aria-label': `${props.labels.remove} ${item.name}`, onClick: () => emit('remove', item.id) }, props.labels.remove) : null,
    ])));
  },
});
