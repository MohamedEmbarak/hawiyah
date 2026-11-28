import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { MODE_STORAGE_KEY, ModeService } from './mode';

describe('ModeService', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-hw-mode', 'light');
  });

  it('reads the mode the pre-paint script wrote', () => {
    document.documentElement.setAttribute('data-hw-mode', 'dark');
    const mode = TestBed.inject(ModeService);
    expect(mode.mode()).toBe('dark');
    expect(mode.dark()).toBe(true);
  });

  it('treats a missing or unknown value as light', () => {
    document.documentElement.removeAttribute('data-hw-mode');
    expect(TestBed.inject(ModeService).mode()).toBe('light');
  });

  it('toggles the attribute and stores the choice under its own key only', () => {
    document.documentElement.setAttribute('data-hw-mode', 'light');
    const mode = TestBed.inject(ModeService);
    const html = TestBed.inject(DOCUMENT).documentElement;
    mode.toggle();
    expect(html.getAttribute('data-hw-mode')).toBe('dark');
    expect(localStorage.getItem(MODE_STORAGE_KEY)).toBe('dark');
    expect(localStorage.getItem('hawiyah-mode')).toBeNull();
    mode.toggle();
    expect(mode.dark()).toBe(false);
    expect(localStorage.getItem(MODE_STORAGE_KEY)).toBe('light');
  });
});
