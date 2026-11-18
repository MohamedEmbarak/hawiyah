// FILEDROPZONE-08: the label and the hint are inside the dashed border and the
// file input has the same width in the four adapters, LTR and RTL.
import { Component } from '@angular/core';
import { HwFileDropzoneComponent } from '@hawiyah/angular';
import { FileDropzone } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { FileDropzone as VueFileDropzone } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase, type FixtureContext } from '../host';

export const dropzoneTexts = (t: FixtureContext['t']) => ({
  label: t('Supporting documents', 'المستندات الداعمة'),
  dropLabel: t('Choose or drop documents', 'اختر المستندات أو أفلتها هنا'),
  hint: t('PDF or PNG, up to 5 MB each', 'ملفات PDF أو PNG بحد أقصى 5 ميجابايت لكل ملف'),
  getRejectedMessage: (rejected: readonly File[]) => t(`${rejected.length} files were not accepted`, `لم يُقبل ${rejected.length} من الملفات`),
});

export function vanillaDropzone(id: string, t: FixtureContext['t'], disabled = false): string {
  const text = dropzoneTexts(t);
  return `<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-hw-rejected-message="${t('{count} files were not accepted', 'لم يُقبل {count} من الملفات')}" data-hw-unsupported-drop-message="${t('Use the file chooser to attach documents.', 'استخدم منتقي الملفات لإرفاق المستندات.')}"><label class="hw-label" for="${id}">${text.label}</label><p class="hw-file-dropzone-instruction" id="${id}-instruction">${text.dropLabel}</p><input class="hw-input" type="file" id="${id}" data-hw-file-input name="documents" accept=".pdf,.png" multiple aria-describedby="${id}-instruction ${id}-hint"${disabled ? ' disabled' : ''}><p class="hw-hint" id="${id}-hint">${text.hint}</p></div>`;
}

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    html(root, vanillaDropzone('vanilla-documents', t));
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(FileDropzone, { ...dropzoneTexts(t), name: 'documents', accept: '.pdf,.png', multiple: true }));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VueFileDropzone, { ...dropzoneTexts(t), name: 'documents', accept: '.pdf,.png', multiple: true }) });
  },
  angular(root, { t }) {
    const text = dropzoneTexts(t);
    @Component({
      selector: 'fixture-file-dropzone',
      standalone: true,
      imports: [HwFileDropzoneComponent],
      template: `<hw-file-dropzone controlId="angular-documents" name="documents" accept=".pdf,.png" [multiple]="true" [label]="text.label" [dropLabel]="text.dropLabel" [hint]="text.hint" [getRejectedMessage]="text.getRejectedMessage" />`,
    })
    class FixtureFileDropzone {
      text = text;
    }
    return mountAngular(root, FixtureFileDropzone);
  },
};

export default fixture;
