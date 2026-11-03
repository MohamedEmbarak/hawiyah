import '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {afterEach,beforeAll,expect,it} from 'vitest';
import {NqPortalFooterComponent} from '@nasaq/angular';
beforeAll(()=>TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting()));
afterEach(()=>TestBed.resetTestingModule());
class Host {
    groups=[{title:'Explore',links:[{label:'Services',href:'/services'},{label:'Partner',href:'https://example.test',external:true}]},{title:'Empty',links:[]}];
    links=[{label:'Contact',href:'/contact'}];legal=[{label:'Privacy',href:'/privacy'}];
  }
Component({standalone:true,imports:[NqPortalFooterComponent],template:`<nq-portal-footer brand="نسق" copyright="2026" description="Example" [groups]="groups" [links]="links" [legalLinks]="legal" externalLabel="New window"><span nqFooterBrand>Brand mark</span><button nqFooterSupport type="button">Help</button><img nqFooterPartners src="/example.svg" alt="Example partner"><p>Legacy content</p></nq-portal-footer>`})(Host);
it('renders grouped links and projected footer areas without losing legacy content',()=>{
  const fixture=TestBed.createComponent(Host);fixture.detectChanges();const root=fixture.nativeElement as HTMLElement;
  expect(root.querySelectorAll('footer')).toHaveLength(1);expect(root.querySelectorAll('nav')).toHaveLength(3);
  expect(root.querySelector('nav[aria-label="Explore"] h2')?.textContent).toBe('Explore');
  expect(root.querySelector('nav[aria-label="Empty"]')).toBeNull();
  const external=root.querySelector('a[target="_blank"]')!;
  expect(external.getAttribute('rel')).toBe('noopener noreferrer');expect(external.textContent).toContain('New window');
  expect(root.querySelector('.nq-portal-footer-brand-marks')?.textContent).toContain('Brand mark');
  expect(root.querySelector('.nq-portal-footer-support-content button')?.textContent).toBe('Help');
  expect(root.querySelector('.nq-portal-footer-extra')?.textContent).toContain('Legacy content');
  expect(root.querySelector('.nq-portal-footer-partners img')?.getAttribute('alt')).toBe('Example partner');
  expect(root.querySelector('.nq-portal-footer-bottom a')?.getAttribute('href')).toBe('/privacy');
});
