import '@angular/compiler';
import {Component} from '@angular/core';
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
Component({standalone:true,imports:[HwPortalFooterComponent],template:`<hw-portal-footer brand="هوية" copyright="2026" description="Example" [groups]="groups" [links]="links" [legalLinks]="legal" externalLabel="New window"><span hwFooterBrand>Brand mark</span><button hwFooterSupport type="button">Help</button><img hwFooterPartners src="/example.svg" alt="Example partner"><p>Legacy content</p></hw-portal-footer>`})(Host);
it('renders grouped links and projected footer areas without losing legacy content',()=>{
  const fixture=TestBed.createComponent(Host);fixture.detectChanges();const root=fixture.nativeElement as HTMLElement;
  expect(root.querySelectorAll('footer')).toHaveLength(1);expect(root.querySelectorAll('nav')).toHaveLength(3);
  expect(root.querySelector('nav[aria-label="Explore"] h2')?.textContent).toBe('Explore');
  expect(root.querySelector('nav[aria-label="Empty"]')).toBeNull();
  const external=root.querySelector('a[target="_blank"]')!;
  expect(external.getAttribute('rel')).toBe('noopener noreferrer');expect(external.textContent).toContain('New window');
  expect(root.querySelector('.hw-portal-footer-brand-marks')?.textContent).toContain('Brand mark');
  expect(root.querySelector('.hw-portal-footer-support-content button')?.textContent).toBe('Help');
  expect(root.querySelector('.hw-portal-footer-extra')?.textContent).toContain('Legacy content');
  expect(root.querySelector('.hw-portal-footer-partners img')?.getAttribute('alt')).toBe('Example partner');
  expect(root.querySelector('.hw-portal-footer-bottom a')?.getAttribute('href')).toBe('/privacy');
});
