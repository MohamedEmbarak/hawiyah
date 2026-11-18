import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export const trusted = (html: string) => inject(DomSanitizer).bypassSecurityTrustHtml(html);
