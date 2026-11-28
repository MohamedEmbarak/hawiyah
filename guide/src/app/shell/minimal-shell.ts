import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { shellTexts } from '../i18n/shell';

/** The bilingual shell of the root and 404 documents: attribution in both languages and main. */
@Component({
  selector: 'guide-minimal-shell',
  imports: [RouterOutlet],
  template: `<div class="minimal"><div class="attribution"><img class="nic-logo" src="assets/nic-logo.webp" alt="" width="34" height="38" decoding="async"><div class="lines"><p lang="ar" dir="rtl" class="hw-type" data-scale="body-sm">{{ ar }}</p><p lang="en" dir="ltr" class="hw-type" data-scale="body-sm">{{ en }}</p></div></div><main id="main" tabindex="-1"><router-outlet /></main></div>`,
  styleUrl: './minimal-shell.css',
})
export class MinimalShell {
  protected readonly ar = shellTexts.ar.attribution;
  protected readonly en = shellTexts.en.attribution;
}
