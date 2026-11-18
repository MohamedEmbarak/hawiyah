import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NativeResult } from './native-result';

@Component({ selector: 'guide-test-native', template: `<button type="button">Native</button>` })
class TestNative {}

async function render(borderless: boolean | undefined): Promise<HTMLElement> {
  TestBed.configureTestingModule({});
  const fixture = TestBed.createComponent(NativeResult);
  fixture.componentRef.setInput('component', TestNative);
  fixture.componentRef.setInput('lang', 'ar');
  if (borderless !== undefined) fixture.componentRef.setInput('borderless', borderless);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('NativeResult', () => {
  it('renders the component in a framed stage with the example environment', async () => {
    const stage = (await render(undefined)).querySelector('.stage');
    expect(stage?.getAttribute('dir')).toBe('rtl');
    expect(stage?.getAttribute('data-hw-theme')).toBe('dga');
    expect(stage?.classList.contains('borderless')).toBe(false);
    expect(stage?.querySelector('button')?.textContent).toBe('Native');
  });

  it('has a borderless form for hosts that frame the result', async () => {
    const stage = (await render(true)).querySelector('.stage');
    expect(stage?.classList.contains('borderless')).toBe(true);
    expect(stage?.querySelector('button')?.textContent).toBe('Native');
  });
});
