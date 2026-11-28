// Log scan over the fixture logs (lint.logScan).

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatFinding, scanLog, stripAnsi } from '../scan.mjs';

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const rules = (result) => result.findings.map((item) => item.rule);

describe('scanLog', () => {
  it('clean.log has no findings in either configuration', () => {
    expect(scanLog(fixture('clean.log'), 'production').findings).toEqual([]);
    expect(scanLog(fixture('clean.log'), 'development').findings).toEqual([]);
    expect(scanLog(fixture('clean.log'), 'production').prerenderedRoutes).toBe(13);
  });

  it('clean.log passes with the expected route count and fails with another', () => {
    expect(scanLog(fixture('clean.log'), 'production', { expectedRoutes: 13 }).findings).toEqual([]);
    const result = scanLog(fixture('clean.log'), 'production', { expectedRoutes: 12 });
    expect(result.findings).toEqual([{ rule: 'LS-ROUTES', line: 9, text: 'Prerendered 13 static routes; expected 12' }]);
  });

  it('server-error.log: a server render error logged by the ErrorHandler fails the scan', () => {
    const result = scanLog(fixture('server-error.log'));
    expect(rules(result)).toEqual(['LS-4']);
    expect(formatFinding(result.findings[0])).toMatch(/^log-scan: LS-4 line 9: ERROR RuntimeError: NG0201: No provider found/);
  });

  it('ng0-error.log: an NG0 runtime error fails the scan', () => {
    expect(rules(scanLog(fixture('ng0-error.log')))).toEqual(['LS-4']);
  });

  it('hydration-error.log: a hydration error code fails the scan', () => {
    expect(rules(scanLog(fixture('hydration-error.log')))).toEqual(['LS-5']);
  });

  it('typeerror.log: a TypeError fails the scan', () => {
    expect(rules(scanLog(fixture('typeerror.log')))).toEqual(['LS-6']);
  });

  it('budget-warning.log: a coloured budget warning fails the scan', () => {
    const result = scanLog(fixture('budget-warning.log'));
    expect(rules(result)).toEqual(['LS-8']);
    expect(result.findings[0].text).toBe('▲ [WARNING] bundle initial exceeded maximum budget. Budget 700.00 kB was not met by 254.01 kB with a total of 954.01 kB.');
  });

  it('hawiyah-warning-dev.log: missing-text warnings fail the development scan only', () => {
    expect(rules(scanLog(fixture('hawiyah-warning-dev.log'), 'development'))).toEqual(['LS-10']);
    expect(scanLog(fixture('hawiyah-warning-dev.log'), 'production').findings).toEqual([]);
  });

  it('build-error.log: a builder error and the missing prerender line fail the scan', () => {
    expect(rules(scanLog(fixture('build-error.log')))).toEqual(['LS-1', 'LS-ROUTES']);
  });

  it('matches the remaining patterns of rules.json', () => {
    const lines = [
      ['Error: Cannot find module', 'LS-3'],
      ['Prerendering failed for /en/', 'LS-9'],
      ['Error rendering route /ar/components/', 'LS-9'],
      ['Unhandled Promise rejection: x', 'LS-7'],
      ['ERROR [object Object]', 'LS-2'],
      ['ReferenceError: window is not defined', 'LS-6'],
    ];
    for (const [line, rule] of lines) {
      expect(rules(scanLog(`${line}\nPrerendered 3 static routes.\n`))).toEqual([rule]);
    }
  });

  it('an empty log fails for want of the prerender line', () => {
    expect(rules(scanLog(''))).toEqual(['LS-ROUTES']);
  });

  it('strips ANSI colour codes', () => {
    expect(stripAnsi('\u001b[33mtext\u001b[0m')).toBe('text');
  });

  it('rejects an unknown configuration', () => {
    expect(() => scanLog('', 'staging')).toThrow(/production or development/);
  });
});
