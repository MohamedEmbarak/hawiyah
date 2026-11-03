import {Component,Input,Output,EventEmitter} from '@angular/core';
import {getSiteVerificationLabels} from '@nasaq/core';

@Component({selector:'nq-site-verification',standalone:true,template:`
  <aside class="nq-site-verification" [attr.aria-label]="label || copy.label">
    <details [open]="open" (toggle)="toggled($event)">
      <summary><span class="nq-verification-mark"><ng-content select="[nqVerificationMark]" /></span><span>{{label || copy.label}}</span><span class="nq-verification-toggle">{{detailsLabel || copy.detailsLabel}}<span class="nq-icon" data-icon="arrow-down-01" aria-hidden="true"></span></span></summary>
      <div class="nq-verification-content"><div class="nq-verification-checks">
        @if(domain){<section><span class="nq-icon" data-icon="link-04" aria-hidden="true"></span><div><h2>{{domainLabel || copy.domainLabel}} <bdi>{{domain}}</bdi></h2><p>{{domainDescription || copy.domainDescription}}</p></div></section>}
        <section><span class="nq-icon" data-icon="lock-password" aria-hidden="true"></span><div><h2>{{httpsLabel || copy.httpsLabel}} <bdi>HTTPS</bdi></h2><p>{{httpsDescription || copy.httpsDescription}}</p></div></section>
      </div>
      @if(registrationHref){<p class="nq-verification-registration"><a [href]="registrationHref" [attr.target]="registrationExternal ? '_blank' : null" [attr.rel]="registrationExternal ? 'noopener noreferrer' : null">{{registrationLabel || copy.registrationLabel}} @if(registrationNumber){<bdi>{{registrationNumber}}</bdi>}@if(registrationExternal){<span class="nq-sr-only"> · {{externalLabel || copy.externalLabel}}</span>}</a></p>}
      <ng-content />
      </div>
    </details>
  </aside>`})
export class NqSiteVerificationComponent {
  @Input() locale='ar'; @Input() label=''; @Input() detailsLabel='';
  @Input() domain=''; @Input() domainLabel=''; @Input() domainDescription='';
  @Input() httpsLabel=''; @Input() httpsDescription='';
  @Input() registrationHref=''; @Input() registrationLabel=''; @Input() registrationNumber='';
  @Input() registrationExternal=true; @Input() externalLabel='';
  @Input() open=false; @Output() readonly openChange=new EventEmitter<boolean>();
  get copy(){return getSiteVerificationLabels(this.locale);}
  toggled(event:Event){const next=(event.currentTarget as HTMLDetailsElement).open;if(next!==this.open){this.open=next;this.openChange.emit(next);}}
}
