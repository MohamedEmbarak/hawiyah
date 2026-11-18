// scanLog(text, configuration, { expectedRoutes }) returns the findings of a
// saved ng build log (lint.logScan): one finding per line that matches a rule
// of rules.json for the configuration, plus LS-ROUTES when the log lacks
// 'Prerendered <n> static routes' or n differs from expectedRoutes.

import { readFileSync } from 'node:fs';

export const RULES = JSON.parse(readFileSync(new URL('./rules.json', import.meta.url), 'utf8'));
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const compiled = RULES.rules.map((rule) => ({ ...rule, regex: new RegExp(rule.pattern, rule.flags) }));
const prerendered = new RegExp(RULES.prerendered.pattern);

export function stripAnsi(text) {
  return text.replace(ANSI, '');
}

export function scanLog(text, configuration = 'production', { expectedRoutes } = {}) {
  if (!['production', 'development'].includes(configuration)) {
    throw new Error(`log-scan: configuration must be production or development (got ${configuration})`);
  }
  const rules = compiled.filter((rule) => rule.configurations.includes(configuration));
  const findings = [];
  let routes = null;
  let routesLine = 0;
  const lines = stripAnsi(text).split(/\r?\n/);
  lines.forEach((raw, index) => {
    const line = raw.replace(/\s+$/, '');
    const rule = rules.find((candidate) => candidate.regex.test(line));
    if (rule) findings.push({ rule: rule.id, line: index + 1, text: line.trim() });
    const count = line.match(prerendered);
    if (count) {
      routes = Number(count[1]);
      routesLine = index + 1;
    }
  });
  if (routes === null) {
    findings.push({ rule: RULES.prerendered.id, line: lines.length, text: "no 'Prerendered <n> static routes' line" });
  } else if (expectedRoutes !== undefined && expectedRoutes !== null && routes !== expectedRoutes) {
    findings.push({ rule: RULES.prerendered.id, line: routesLine, text: `Prerendered ${routes} static routes; expected ${expectedRoutes}` });
  }
  return { configuration, findings, prerenderedRoutes: routes };
}

export function formatFinding(item) {
  return `log-scan: ${item.rule} line ${item.line}: ${item.text}`;
}
