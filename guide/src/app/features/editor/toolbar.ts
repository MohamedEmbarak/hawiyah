import { Component, computed, input, output } from '@angular/core';
import { HwButtonDirective, HwCopyButtonComponent, HwIconButtonComponent, HwToggleGroupComponent } from '@hawiyah/angular';
import { EXAMPLE_FRAMEWORKS, type ExampleFramework } from '../../examples/payload';
import { EDITOR_LANGUAGES, isEditorFramework, isEditorLanguage, languageAvailable, type EditorLanguage } from './editor-store';
import type { EditorTexts } from './i18n';

const FRAMEWORK_LABELS: Readonly<Record<ExampleFramework, string>> = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };

/** Whether a key event is the run shortcut (Ctrl or Cmd with Enter). */
export function isRunShortcut(event: KeyboardEvent): boolean {
  return event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
}

/**
 * The single toolbar of the editor (editor.fullEditor.toolbar): framework, language,
 * reset, copy, download and run. Ctrl or Cmd+Enter on any of its controls runs the
 * project and does nothing else.
 */
@Component({
  selector: 'guide-editor-toolbar',
  imports: [HwButtonDirective, HwCopyButtonComponent, HwIconButtonComponent, HwToggleGroupComponent],
  template: `<div class="toolbar" role="group" [attr.aria-label]="t().controls" (keydown)="shortcut($event)"><div class="choices"><hw-toggle-group controlId="editor-framework" labelHidden [label]="t().framework" [options]="frameworkOptions" [value]="framework()" (valueChange)="chooseFramework($event)" /><hw-toggle-group controlId="editor-language" labelHidden [label]="t().language" [options]="languageOptions()" [value]="language()" (valueChange)="chooseLanguage($event)" /></div><div class="actions"><hw-icon-button [label]="t().reset" variant="ghost" (activated)="reset.emit()"><span class="hw-icon" data-icon="reload" aria-hidden="true"></span></hw-icon-button><hw-copy-button [text]="currentText()" [label]="t().copyFile" [copiedMessage]="t().copied" [failedMessage]="t().copyFailed" /><hw-icon-button [label]="t().download" variant="ghost" (activated)="download.emit()"><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span></hw-icon-button><button hwButton variant="primary" type="button" aria-keyshortcuts="Control+Enter Meta+Enter" (click)="run.emit()"><span class="hw-icon" data-icon="play" aria-hidden="true"></span>{{ t().run }}<span class="keys" dir="ltr" aria-hidden="true"><kbd class="hw-kbd">Ctrl</kbd>+<kbd class="hw-kbd">Enter</kbd></span></button></div></div>`,
  styleUrl: './toolbar.css',
})
export class EditorToolbar {
  readonly t = input.required<EditorTexts>();
  readonly framework = input.required<ExampleFramework>();
  readonly language = input.required<EditorLanguage>();
  /** Text of the file shown, for the copy button. */
  readonly currentText = input.required<string>();
  readonly frameworkChange = output<ExampleFramework>();
  readonly languageChange = output<EditorLanguage>();
  readonly reset = output<void>();
  readonly download = output<void>();
  readonly run = output<void>();

  protected readonly frameworkOptions = EXAMPLE_FRAMEWORKS.map((value) => ({ value, label: FRAMEWORK_LABELS[value] }));
  protected readonly languageOptions = computed(() => {
    const t = this.t();
    return EDITOR_LANGUAGES.map((value) => ({
      value,
      label: value === 'js' ? t.javascript : t.typescript,
      disabled: !languageAvailable(this.framework(), value),
    }));
  });

  protected chooseFramework(value: string | string[]): void {
    if (isEditorFramework(value) && value !== this.framework()) this.frameworkChange.emit(value);
  }

  protected chooseLanguage(value: string | string[]): void {
    if (isEditorLanguage(value) && value !== this.language()) this.languageChange.emit(value);
  }

  protected shortcut(event: KeyboardEvent): void {
    if (!isRunShortcut(event)) return;
    event.preventDefault();
    event.stopPropagation();
    this.run.emit();
  }
}
