import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { LANG_STORAGE_KEY, LocaleService } from './locale';

describe('LocaleService', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
  });

  it('starts in Arabic', () => {
    const locale = TestBed.inject(LocaleService);
    expect(locale.lang()).toBe('ar');
    expect(locale.dir()).toBe('rtl');
  });

  it('sets html lang and dir for the route language', () => {
    const locale = TestBed.inject(LocaleService);
    const html = TestBed.inject(DOCUMENT).documentElement;
    locale.apply('en');
    expect(locale.lang()).toBe('en');
    expect(html.getAttribute('lang')).toBe('en');
    expect(html.getAttribute('dir')).toBe('ltr');
    locale.apply('ar');
    expect(html.getAttribute('lang')).toBe('ar');
    expect(html.getAttribute('dir')).toBe('rtl');
  });

  it('stores the reader language under its own key only', () => {
    TestBed.inject(LocaleService).remember('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(localStorage.getItem('hawiyah-locale')).toBeNull();
  });
});
