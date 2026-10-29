import { describe, expect, it } from 'vitest';
import { createThemeVariables, cssVariableNames, tokens } from '../src/index';

describe('DGA default and explicit legacy theme contracts', () => {
  it('uses the mapped reference in plain exports, custom defaults and SSR variables', () => {
    expect(tokens.color.primary).toBe('#1B8354');
    const defaults = createThemeVariables();
    expect(defaults['--nq-color-primary']).toBe('#1B8354');
    expect(defaults['--nq-content-max']).toBe('80rem');
    expect(defaults['--nq-radius-md']).toBe('0.5rem');
    expect(createThemeVariables({}, {theme:'custom'})).toEqual(defaults);
    expect(Object.keys(defaults).sort()).toEqual([...cssVariableNames].sort());
  });
  it('retains explicit Nasaq palette and foundation dimensions across modes', () => {
    const legacy = createThemeVariables({}, {theme:'nasaq'});
    expect(legacy['--nq-color-primary']).toBe('#006a64');
    expect(legacy['--nq-radius-md']).toBe('0.625rem');
    expect(legacy['--nq-content-max']).toBe('78rem');
    expect(createThemeVariables({}, {theme:'nasaq',mode:'dark'})['--nq-radius-md']).toBe(legacy['--nq-radius-md']);
  });
  it('uses source dark semantics while retaining caller overrides and density', () => {
    const values = createThemeVariables({'--nq-color-primary':'#123456'}, {mode:'dark',density:'compact'});
    expect(values['--nq-color-primary']).toBe('#123456');
    expect(values['--nq-color-canvas']).toBe('#111927');
    expect(values['--nq-control-height']).toBe('2rem');
    expect(values['--nq-duration-input']).toBe('150ms');
  });
});
