import '@angular/compiler';
import './fixtures/texts';
import {ChangeDetectionStrategy,Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {afterEach,beforeAll,expect,it} from 'vitest';
import {HwPortalFooterComponent} from '@hawiyah/angular';
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
afterEach(()=>TestBed.resetTestingModule());
class Host {
    groups=[{title:'Explore',links:[{label:'Services',href:'/services'},{label:'Partner',href:'https://example.test',external:true}]},{title:'Empty',links:[]}];
    links=[{label:'Contact',href:'/contact'}];legal=[{label:'Privacy',href:'/privacy'}];
  }
Component({standalone:true,imports:[HwPortalFooterComponent],template:`<hw-portal-footer brand="هوية" copyright="2026" description="Example" [groups]="groups" [links]="links" [legalLinks]="legal" navigationLabel="Footer links" legalLinksLabel="Policies" supportLabel="Help and contact" externalLabel="New window"><span hwFooterBrand>Brand mark</span><button hwFooterSupport type="button">Help</button><img hwFooterPartners src="/example.svg" alt="Example partner"><p>Legacy content</p></hw-portal-footer>`})(Host);
it('renders grouped links and projected footer areas without losing legacy content',()=>{
  const fixture=TestBed.createComponent(Host);fixture.detectChanges();const root=fixture.nativeElement as HTMLElement;
  expect(root.querySelectorAll('footer')).toHaveLength(1);expect(root.querySelectorAll('nav')).toHaveLength(3);
  expect(root.querySelector('nav[aria-label="Explore"] h2')?.textContent).toBe('Explore');
  expect(root.querySelector('nav[aria-label="Empty"]')).toBeNull();
  const external=root.querySelector('a[target="_blank"]')!;
  expect(external.getAttribute('rel')).toBe('noopener noreferrer');expect(external.textContent).toContain('New window');
  expect(root.querySelector('.hw-portal-footer-brand-marks')?.textContent).toContain('Brand mark');
  expect(root.querySelector('.hw-portal-footer-support-content button')?.textContent).toBe('Help');
  const support=root.querySelector('.hw-portal-footer-support')!;expect(support.hasAttribute('hidden')).toBe(false);expect(support.getAttribute('aria-label')).toBe('Help and contact');expect(support.querySelector('h2')?.textContent).toBe('Help and contact');
  expect(root.querySelector('nav[aria-label="Footer links"] h2')?.textContent).toBe('Footer links');expect(root.querySelector('.hw-portal-footer-legal')?.getAttribute('aria-label')).toBe('Policies');
  expect(root.querySelector('.hw-portal-footer-extra')?.textContent).toContain('Legacy content');
  expect(root.querySelector('.hw-portal-footer-partners img')?.getAttribute('alt')).toBe('Example partner');
  expect(root.querySelector('.hw-portal-footer-bottom a')?.getAttribute('href')).toBe('/privacy');
});
it('renders the support section only for projected support content, and no brand text of its own',()=>{
  class Bare {}
  Component({standalone:true,imports:[HwPortalFooterComponent],template:`<hw-portal-footer externalLabel="New window" copyright="2026" />`})(Bare);
  const fixture=TestBed.createComponent(Bare);fixture.detectChanges();const root=fixture.nativeElement as HTMLElement;
  const support=root.querySelector('.hw-portal-footer-support')!;
  expect(support.hasAttribute('hidden')).toBe(true);expect(support.hasAttribute('aria-label')).toBe(false);expect(support.querySelector('h2')).toBeNull();expect(support.textContent).toBe('');
  const brand=root.querySelector('.hw-portal-footer-brand')!;expect(brand.textContent).toBe('');expect(brand.hasAttribute('aria-label')).toBe(false);expect(brand.hasAttribute('role')).toBe(false);
  expect(root.querySelectorAll('nav')).toHaveLength(0);
});
it('shows and hides the support section as the application adds and removes its content',()=>{
  class Toggle { help=false; }
  Component({standalone:true,changeDetection:ChangeDetectionStrategy.Default,imports:[HwPortalFooterComponent],template:`<hw-portal-footer externalLabel="New window" supportLabel="Help and contact">@if(help){<p hwFooterSupport>Call 199099</p>}</hw-portal-footer>`})(Toggle);
  const fixture=TestBed.createComponent(Toggle);fixture.detectChanges();const support=(fixture.nativeElement as HTMLElement).querySelector('.hw-portal-footer-support')!;
  expect(support.hasAttribute('hidden')).toBe(true);expect(support.querySelector('h2')).toBeNull();
  fixture.componentInstance.help=true;fixture.changeDetectorRef.markForCheck();fixture.detectChanges();
  expect(support.hasAttribute('hidden')).toBe(false);expect(support.querySelector('h2')!.textContent).toBe('Help and contact');expect(support.textContent).toBe('Help and contactCall 199099');
  fixture.componentInstance.help=false;fixture.changeDetectorRef.markForCheck();fixture.detectChanges();
  expect(support.hasAttribute('hidden')).toBe(true);expect(support.querySelector('h2')).toBeNull();
});
