import { describe, expect, it } from 'vitest';
import { createThemeVariables, cssVariableNames, tokens } from '../src/index';

describe('DGA default and explicit legacy theme contracts', () => {
  it('keeps switch geometry density-owned and accepts scoped overrides', () => {
    for (const theme of ['dga', 'hawiyah', 'custom'] as const) {
      for (const density of ['comfortable', 'compact', 'mobile'] as const) {
        const values = createThemeVariables({}, {theme, density});
        const mobile = density === 'mobile';
        expect(values['--hw-switch-width']).toBe(mobile ? '3.25rem' : '2.75rem');
        expect(values['--hw-switch-height']).toBe(mobile ? '2rem' : '1.625rem');
        expect(values['--hw-switch-thumb-size']).toBe(mobile ? '1.75rem' : '1.125rem');
        expect(values['--hw-switch-thumb-offset']).toBe(mobile ? 'calc(0.125rem - 1px)' : '0.1875rem');
        expect(values['--hw-switch-thumb-offset-checked']).toBe(mobile ? 'calc(1.375rem - 1px)' : '1.3125rem');
      }
    }
    expect(createThemeVariables({'--hw-switch-width': '4rem'}, {density:'mobile'})['--hw-switch-width']).toBe('4rem');
  });
  it('isolates source-informed component motion from legacy and generic timing', () => {
    const dga = createThemeVariables();
    expect(dga['--hw-duration-switch']).toBe('200ms');
    expect(dga['--hw-duration-spinner']).toBe('1000ms');
    expect(dga['--hw-ease-switch']).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
    expect(dga['--hw-duration-normal']).toBe('180ms');
    expect(dga['--hw-duration-tab-bar']).toBe('300ms');
    expect(dga['--hw-duration-accordion']).toBe('300ms');
    expect(dga['--hw-duration-accordion-indicator']).toBe('200ms');
    const legacy = createThemeVariables({}, {theme:'hawiyah'});
    expect(legacy['--hw-duration-switch']).toBe('180ms');
    expect(legacy['--hw-duration-spinner']).toBe('700ms');
    expect(legacy['--hw-ease-switch-track']).toBe('ease');
    expect(legacy['--hw-duration-tab-bar']).toBe('0ms');
    expect(legacy['--hw-duration-accordion']).toBe('0ms');
    expect(legacy['--hw-duration-accordion-indicator']).toBe('0ms');
    expect(createThemeVariables({'--hw-duration-switch':'350ms'}, {theme:'custom'})['--hw-duration-switch']).toBe('350ms');
  });
  it('keeps mobile field minimums separate from button sizes and caller overrides', () => {
    for (const theme of ['dga', 'hawiyah', 'custom'] as const) {
      const mobile = createThemeVariables({}, {theme, density:'mobile'});
      expect(mobile['--hw-control-field-min-height']).toBe('2.75rem');
      expect(mobile['--hw-control-height']).toBe('2.5rem');
      expect(mobile['--hw-control-height-sm']).toBe('2rem');
      expect(mobile['--hw-control-height-lg']).toBe('2.75rem');
    }
    expect(createThemeVariables({}, {density:'compact'})['--hw-control-field-min-height']).toBe('0px');
    expect(createThemeVariables({'--hw-control-height':'3rem'}, {density:'mobile'})['--hw-control-height']).toBe('3rem');
  });
  it('uses the mapped reference in plain exports, custom defaults and SSR variables', () => {
    expect(tokens.color.primary).toBe('#1B8354');
    const defaults = createThemeVariables();
    expect(defaults['--hw-color-primary']).toBe('#1B8354');
    expect(defaults['--hw-content-max']).toBe('80rem');
    expect(defaults['--hw-radius-md']).toBe('0.5rem');
    expect(createThemeVariables({}, {theme:'custom'})).toEqual(defaults);
    expect(Object.keys(defaults).sort()).toEqual([...cssVariableNames].sort());
  });
  it('retains explicit Hawiyah palette and foundation dimensions across modes', () => {
    const legacy = createThemeVariables({}, {theme:'hawiyah'});
    expect(legacy['--hw-color-primary']).toBe('#006a64');
    expect(legacy['--hw-radius-md']).toBe('0.625rem');
    expect(legacy['--hw-content-max']).toBe('78rem');
    expect(createThemeVariables({}, {theme:'hawiyah',mode:'dark'})['--hw-radius-md']).toBe(legacy['--hw-radius-md']);
  });
  it('uses source dark semantics while retaining caller overrides and density', () => {
    const values = createThemeVariables({'--hw-color-primary':'#123456'}, {mode:'dark',density:'compact'});
    expect(values['--hw-color-primary']).toBe('#123456');
    expect(values['--hw-color-canvas']).toBe('#111927');
    expect(values['--hw-control-height']).toBe('2rem');
    expect(values['--hw-duration-input']).toBe('500ms');
    expect(values['--hw-ease-input']).toBe('ease');
  });
});
