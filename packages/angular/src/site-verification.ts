import {Component,Input,Output,EventEmitter} from '@angular/core';
import {HwTexts} from './text';

@Component({selector:'hw-site-verification',standalone:true,template:`
  <aside class="hw-site-verification" [attr.aria-label]="texts.need('label', label)">
    <details [open]="open" (toggle)="toggled($event)">
      <summary><span class="hw-verification-mark"><ng-content select="[hwVerificationMark]" /></span><span>{{texts.need('label', label)}}</span><span class="hw-verification-toggle">{{texts.need('detailsLabel', detailsLabel)}}<span class="hw-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
      <div class="hw-verification-content"><div class="hw-verification-checks">
        @if(domain){<section><span class="hw-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>{{texts.need('domainLabel', domainLabel)}} <bdi>{{domain}}</bdi></h2><p>{{texts.need('domainDescription', domainDescription)}}</p></div></section>}
        <section><span class="hw-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>{{texts.need('httpsLabel', httpsLabel)}}</h2><p>{{texts.need('httpsDescription', httpsDescription)}}</p></div></section>
      </div>
      @if(registrationHref){<p class="hw-verification-registration"><a [href]="registrationHref" [attr.target]="registrationExternal ? '_blank' : null" [attr.rel]="registrationExternal ? 'noopener noreferrer' : null">{{texts.need('registrationLabel', registrationLabel, 'registrationHref is set')}} @if(registrationNumber){<bdi>{{registrationNumber}}</bdi>}@if(registrationExternal){@if(texts.need('externalLabel', externalLabel, 'registrationHref is set and registrationExternal is on'); as external){<span class="hw-sr-only"> {{external}}</span>}}</a></p>}
      <ng-content />
      </div>
    </details>
  </aside>`})
export class HwSiteVerificationComponent {
  /** Every text is supplied by the application; httpsLabel includes the protocol name. */
  @Input({required:true}) label=''; @Input({required:true}) detailsLabel='';
  @Input() domain=''; @Input({required:true}) domainLabel=''; @Input({required:true}) domainDescription='';
  @Input({required:true}) httpsLabel=''; @Input({required:true}) httpsDescription='';
  /** registrationLabel is required when registrationHref is set, externalLabel when the link is also external. */
  @Input() registrationHref=''; @Input() registrationLabel=''; @Input() registrationNumber='';
  @Input() registrationExternal=true; @Input() externalLabel='';
  protected readonly texts=new HwTexts('hw-site-verification');
  @Input() open=false; @Output() readonly openChange=new EventEmitter<boolean>();
  toggled(event:Event){const next=(event.currentTarget as HTMLDetailsElement).open;if(next!==this.open){this.open=next;this.openChange.emit(next);}}
}
