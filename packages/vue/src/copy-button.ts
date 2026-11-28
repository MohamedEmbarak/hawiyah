import { defineComponent, h, mergeProps, onBeforeUnmount, ref } from 'vue';
import type { PropType } from 'vue';
import { copyFeedbackIcons, createCopyFeedback } from '@hawiyah/core';
import type { CopyFeedbackState, CopyResult } from '@hawiyah/core';
import { needText } from './shared.js';

export const CopyButton = defineComponent({
  name: 'HwCopyButton', inheritAttrs: false,
  props: {
    text: { type: [String, Function] as PropType<string | (() => string)>, required: true },
    label: { type: String, required: true }, copiedMessage: { type: String, required: true }, failedMessage: { type: String, required: true },
    display: { type: String as PropType<'icon' | 'text'>, default: 'icon' },
    variant: { type: String as PropType<'primary' | 'default' | 'secondary' | 'outline' | 'outline-white' | 'light' | 'danger' | 'ghost' | 'soft' | 'link'>, default: 'ghost' },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    feedbackDuration: { type: Number, default: 3000 }, disabled: Boolean,
  },
  emits: { copyResult: (_result: CopyResult) => true },
  setup(props, { attrs, emit, expose }) {
    const button = ref<HTMLButtonElement>();
    const state = ref<CopyFeedbackState>('idle');
    // Creating the controller touches nothing; the clipboard is reached only from the click handler.
    const feedback = createCopyFeedback({
      getText: () => typeof props.text === 'function' ? props.text() : props.text, getDuration: () => props.feedbackDuration,
      onStateChange: next => { state.value = next; }, onResult: result => emit('copyResult', result),
    });
    onBeforeUnmount(() => feedback.destroy());
    expose({ focus: () => button.value?.focus() });
    return () => {
      // All three texts are checked on every render, so a missing message is reported before a copy ever fails.
      const label = needText('CopyButton', 'label', props.label), copied = needText('CopyButton', 'copiedMessage', props.copiedMessage), failed = needText('CopyButton', 'failedMessage', props.failedMessage);
      // The style key is passed only when the application gave one: the server renderer writes style="" for a key that is present but undefined.
      const { class: className, style, ...native } = attrs;
      const textDisplay = props.display === 'text';
      const icon = h('span', { class: 'hw-icon', 'data-icon': copyFeedbackIcons[state.value], 'aria-hidden': 'true' });
      return h('span', { class: ['hw-copy', className], ...(style === undefined ? {} : { style }), 'data-state': state.value }, [
        h('button', mergeProps(native, { ref: button, type: 'button', class: textDisplay ? 'hw-button' : 'hw-button hw-icon-button', 'data-variant': props.variant, 'data-size': props.size, 'aria-label': textDisplay ? undefined : label, disabled: props.disabled, onClick: () => { void feedback.copy(); } }), textDisplay && label !== undefined ? [icon, label] : [icon]),
        h('span', { class: 'hw-copy-message', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, state.value === 'copied' ? copied : state.value === 'failed' ? failed : undefined),
      ]);
    };
  },
});
