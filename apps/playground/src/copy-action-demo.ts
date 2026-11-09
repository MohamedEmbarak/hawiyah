import type { Locale } from './data';

type Outcome = 'copied' | 'denied' | 'unavailable' | 'failed' | 'empty';
type CopyKind = 'email' | 'reference';

function copyLabels(locale: Locale) {
  return locale === 'ar' ? {
    manual: 'النص للنسخ اليدوي',
    messages: {
      copied: 'تم النسخ إلى الحافظة.', denied: 'لم يسمح المتصفح بالنسخ. حدد النص وانسخه يدويًا.',
      unavailable: 'الحافظة غير متاحة هنا. حدد النص وانسخه يدويًا.',
      failed: 'تعذّر النسخ. حدد النص وانسخه يدويًا.', empty: 'لا يوجد نص لنسخه.',
    },
  } : {
    manual: 'Text for manual copying',
    messages: {
      copied: 'Copied to clipboard.', denied: 'Clipboard access was denied. Select the text and copy it manually.',
      unavailable: 'Clipboard access is unavailable here. Select the text and copy it manually.',
      failed: 'Copy failed. Select the text and copy it manually.', empty: 'There is no text to copy.',
    },
  };
}

function example(kind: CopyKind, locale: Locale) {
  const ar = locale === 'ar';
  return kind === 'email' ? {
    title: ar ? 'نسخ عنوان البريد الإلكتروني' : 'Copy an email address',
    label: ar ? 'بريد مكتب الخدمة' : 'Service desk email',
    action: ar ? 'نسخ البريد الإلكتروني' : 'Copy email address',
    uri: 'mailto:support@example.test', text: 'support@example.test',
  } : {
    title: ar ? 'نسخ مرجع الطلب' : 'Copy a request reference',
    label: ar ? 'مرجع الطلب' : 'Request reference',
    action: ar ? 'نسخ المرجع' : 'Copy reference',
    uri: '', text: 'HW-1043',
  };
}

function copyText(uri: string, visible: string): string {
  const address = /^mailto:([^?#]*)/i.exec(uri.trim())?.[1];
  if (address) {
    try { return decodeURIComponent(address).trim() || visible.trim(); }
    catch { return visible.trim(); }
  }
  return visible.trim();
}

async function writeCopy(text: string, view: Window | null): Promise<Outcome> {
  if (!text) return 'empty';
  try {
    const clipboard = view?.navigator.clipboard;
    if (typeof clipboard?.writeText !== 'function') return 'unavailable';
    await clipboard.writeText(text);
    return 'copied';
  } catch (error) {
    const name = typeof error === 'object' && error !== null && 'name' in error ? error.name : '';
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'failed';
  }
}

export function bindCopyActionDemos(root: HTMLElement, locale: Locale, signal: AbortSignal) {
  const requests = new WeakMap<HTMLElement, number>();
  const { messages } = copyLabels(locale);
  root.addEventListener('click', async event => {
    const trigger = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-copy-trigger]') : null;
    const card = trigger?.closest<HTMLElement>('[data-copy-action]');
    if (!trigger || trigger.disabled || !card || !root.contains(card)) return;
    const source = card.querySelector<HTMLElement>('[data-copy-source]');
    const status = card.querySelector<HTMLElement>('[data-copy-status]');
    const manual = card.querySelector<HTMLElement>('[data-copy-manual]');
    const field = manual?.querySelector('input');
    if (!source || !status || !manual || !field) return;
    const request = (requests.get(card) ?? 0) + 1;
    requests.set(card, request);
    const uri = source.getAttribute('href') ?? source.getAttribute('value') ?? '';
    const text = copyText(uri, source.textContent ?? '');
    const result = await writeCopy(text, root.ownerDocument.defaultView);
    if (signal.aborted || !root.contains(card) || requests.get(card) !== request) return;
    status.textContent = messages[result];
    field.value = text;
    manual.hidden = result === 'copied' || result === 'empty';
  }, { signal });
  root.addEventListener('focusin', event => {
    if (event.target instanceof HTMLInputElement && event.target.matches('[data-copy-action] [data-copy-manual] input')) event.target.select();
  }, { signal });
}

// Each published snippet contains its local clipboard operation so it can be pasted into an application.
function copyHelpers(typed: boolean) {
  const str = typed ? ': string' : '';
  return `${typed ? "type CopyOutcome = 'copied' | 'denied' | 'unavailable' | 'failed' | 'empty';\n\n" : ''}function copyText(uri${str}, visible${str}) {
  const address = /^mailto:([^?#]*)/i.exec(uri.trim())?.[1];
  if (address) {
    try { return decodeURIComponent(address).trim() || visible.trim(); }
    catch { return visible.trim(); }
  }
  return visible.trim();
}

async function writeCopy(text${str})${typed ? ': Promise<CopyOutcome>' : ''} {
  if (!text) return 'empty';
  try {
    const clipboard = navigator.clipboard;
    if (typeof clipboard?.writeText !== 'function') return 'unavailable';
    await clipboard.writeText(text);
    return 'copied';
  } catch (error) {
    const name = typeof error === 'object' && error !== null && 'name' in error ? error.name : '';
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'failed';
  }
}`;
}

export function copyActionRecipes(locale: Locale) {
  const { manual, messages } = copyLabels(locale);
  return (['email', 'reference'] as const).map(kind => {
    const {title, label, action, uri, text} = example(kind, locale);
    const markup = `<div class="hw-field" data-copy-action="${kind}">
  <div class="hw-label">${label}</div>
  <div class="hw-inline">
    <data dir="ltr" data-copy-source value="${uri}">${text}</data>
    <button type="button" class="hw-button" data-variant="secondary" data-copy-trigger>${action}</button>
  </div>
  <p class="hw-hint" role="status" aria-live="polite" aria-atomic="true" data-copy-status></p>
  <div hidden data-copy-manual><label class="hw-field"><span class="hw-label">${manual}</span><input class="hw-input" dir="auto" type="text" readonly></label></div>
</div>`;
    const constants = `const source = ${JSON.stringify({uri, text}, null, 2)};\nconst messages = ${JSON.stringify(messages, null, 2)};`;
    const vanillaScript = `import '@hawiyah/styles/styles.css';
import { enhance } from '@hawiyah/vanilla';

${copyHelpers(false)}

const messages = ${JSON.stringify(messages, null, 2)};
const example = document.querySelector('[data-copy-action="${kind}"]');
if (!example) throw new Error('Missing copy action markup');
const cleanup = enhance(example);
const events = new AbortController();
const source = example.querySelector('[data-copy-source]');
const button = example.querySelector('[data-copy-trigger]');
const status = example.querySelector('[data-copy-status]');
const manual = example.querySelector('[data-copy-manual]');
const field = manual.querySelector('input');
let latest = 0;
button.addEventListener('click', async () => {
  const request = ++latest;
  const uri = source.getAttribute('href') ?? source.getAttribute('value') ?? '';
  const text = copyText(uri, source.textContent ?? '');
  const result = await writeCopy(text);
  if (events.signal.aborted || request !== latest) return;
  status.textContent = messages[result];
  field.value = text;
  manual.hidden = result === 'copied' || result === 'empty';
}, { signal: events.signal });
field.addEventListener('focus', () => field.select(), { signal: events.signal });
window.addEventListener('pagehide', () => { events.abort(); cleanup(); }, { once: true });`;
    const react = `import { useEffect, useRef, useState } from 'react';
import { Button } from '@hawiyah/react';
import '@hawiyah/styles/styles.css';

${copyHelpers(true)}

${constants}

export default function CopyAction() {
  const [status, setStatus] = useState('');
  const [manualText, setManualText] = useState('');
  const latest = useRef(0);
  useEffect(() => () => { latest.current++; }, []);
  async function copy() {
    const request = ++latest.current;
    const text = copyText(source.uri, source.text);
    const result = await writeCopy(text);
    if (request !== latest.current) return;
    setStatus(messages[result]);
    setManualText(result === 'copied' || result === 'empty' ? '' : text);
  }
  return <div className="hw-field">
    <span className="hw-label">${label}</span>
    <div className="hw-inline"><bdi>{source.text}</bdi> <Button type="button" variant="secondary" onClick={copy}>${action}</Button></div>
    <p className="hw-hint" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    {manualText && <label className="hw-field">${manual}<input className="hw-input" dir="auto" readOnly value={manualText} onFocus={event => event.currentTarget.select()} /></label>}
  </div>;
}`;
    const vue = `<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Button } from '@hawiyah/vue';
import '@hawiyah/styles/styles.css';

${copyHelpers(true)}

${constants}
const status = ref('');
const manualText = ref('');
let latest = 0;
onBeforeUnmount(() => { latest++; });
async function copy() {
  const request = ++latest;
  const text = copyText(source.uri, source.text);
  const result = await writeCopy(text);
  if (request !== latest) return;
  status.value = messages[result];
  manualText.value = result === 'copied' || result === 'empty' ? '' : text;
}
function selectText(event: FocusEvent) {
  if (event.target instanceof HTMLInputElement) event.target.select();
}
</script>

<template>
  <div class="hw-field">
    <span class="hw-label">${label}</span>
    <div class="hw-inline"><bdi>{{ source.text }}</bdi> <Button type="button" variant="secondary" @click="copy">${action}</Button></div>
    <p class="hw-hint" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
    <label v-if="manualText" class="hw-field">${manual}<input class="hw-input" dir="auto" readonly :value="manualText" @focus="selectText"></label>
  </div>
</template>`;
    const angular = `import { Component, signal } from '@angular/core';
import { HwButtonDirective } from '@hawiyah/angular';
import '@hawiyah/styles/styles.css';

${copyHelpers(true)}

${constants}

@Component({
  selector: 'app-copy-action', standalone: true, imports: [HwButtonDirective],
  template: \`<div class="hw-field">
    <span class="hw-label">${label}</span>
    <div class="hw-inline"><bdi>{{ source.text }}</bdi> <button hwButton type="button" variant="secondary" (click)="copy()">${action}</button></div>
    <p class="hw-hint" role="status" aria-live="polite" aria-atomic="true">{{ status() }}</p>
    @if (manualText()) {<label class="hw-field">${manual}<input #field class="hw-input" dir="auto" readonly [value]="manualText()" (focus)="field.select()"></label>}
  </div>\`,
})
export class CopyActionComponent {
  readonly source = source;
  readonly status = signal('');
  readonly manualText = signal('');
  private latest = 0;
  ngOnDestroy() { this.latest++; }
  async copy() {
    const request = ++this.latest;
    const text = copyText(source.uri, source.text);
    const result = await writeCopy(text);
    if (request !== this.latest) return;
    this.status.set(messages[result]);
    this.manualText.set(result === 'copied' || result === 'empty' ? '' : text);
  }
}`;
    return {title, markup, vanillaScript, react, vue, angular};
  });
}
