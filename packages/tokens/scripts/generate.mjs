/** Regenerate CSS and typed values from tokens.json. No dependencies required. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const packageRoot = new URL('../', import.meta.url);
const source = JSON.parse(await readFile(new URL('tokens.json', packageRoot), 'utf8'));
const unwrap = (value) => value && typeof value === 'object' && '$value' in value
  ? value.$value
  : Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('$')).map(([key, child]) => [key, unwrap(child)]));
const flatten = (value, path = []) => Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
  const next = [...path, key];
  return child !== null && typeof child === 'object'
    ? Object.entries(flatten(child, next))
    : [[next.join('-'), String(child)]];
}));
const names = (value, path = []) => Object.fromEntries(Object.entries(value).map(([key, child]) => {
  const next = [...path, key];
  return [key, child !== null && typeof child === 'object' ? names(child, next) : `--nq-${next.join('-')}`];
}));
const foundation = unwrap(source.foundation);
const themes = unwrap(source.themes);
const densities = unwrap(source.densities);
const themeFoundations = { dga: foundation, ...unwrap(source.themeFoundations || {}) };
const tokens = { ...foundation, ...themes.dga.light, ...densities.comfortable };
const declarations = (value) => Object.entries(flatten(value)).map(([key, val]) => `  --nq-${key}: ${val};`).join('\n');
const colorSlots = (theme) => ({
  ...Object.fromEntries(Object.entries(theme.light.color).map(([key, value]) => [`palette-light-${key}`, value])),
  ...Object.fromEntries(Object.entries(theme.dark.color).map(([key, value]) => [`palette-dark-${key}`, value])),
});
const modeAliases = (mode) => Object.fromEntries(Object.keys(themes.dga.light.color).map((key) => [`color-${key}`, `var(--nq-palette-${mode}-${key})`]));
const slotsToCss = (theme) => declarations(colorSlots(theme));
let css = `/* Generated from tokens.json. Run pnpm --filter @nasaq/tokens generate. */\n`;
css += `:where(:root) {\n  color-scheme: light;\n${declarations(foundation)}\n${slotsToCss(themes.dga)}\n${declarations(modeAliases('light'))}\n${declarations(densities.comfortable)}\n}\n\n`;
// Both palettes inherit independently from color-scheme. light-dark() rebinds
// semantic colors correctly at nested theme/mode boundaries in modern browsers.
for (const [themeName, theme] of Object.entries(themes)) {
  css += `:where([data-nq-theme="${themeName}"]${themeName === 'dga' ? ', [data-nq-theme="custom"]' : ''}) {\n${declarations(themeFoundations[themeName] || foundation)}\n${slotsToCss(theme)}\n}\n\n`;
}
css += `:where([data-nq-mode="light"]) {\n  color-scheme: light;\n${declarations(modeAliases('light'))}\n}\n\n`;
css += `:where([data-nq-mode="dark"]) {\n  color-scheme: dark;\n${declarations(modeAliases('dark'))}\n}\n\n`;
css += `@supports (color: light-dark(white, black)) {\n  :where(:root, [data-nq-theme], [data-nq-mode]) {\n${Object.keys(themes.dga.light.color).map(key => `    --nq-color-${key}: light-dark(var(--nq-palette-light-${key}), var(--nq-palette-dark-${key}));`).join('\n')}\n  }\n}\n\n`;
for (const [densityName, density] of Object.entries(densities)) {
  css += `:where([data-nq-density="${densityName}"]) {\n${declarations(density)}\n}\n\n`;
}
const tokenNames = names(tokens);
const variableNames = Object.keys(flatten(tokens)).map(key => `--nq-${key}`);
const generated = `// Generated from tokens.json. Do not edit by hand.\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n\nexport const themes = ${JSON.stringify(themes, null, 2)} as const;\n\nexport const themeFoundations = ${JSON.stringify(themeFoundations, null, 2)} as const;\n\nexport const densities = ${JSON.stringify(densities, null, 2)} as const;\n\nexport const tokenNames = ${JSON.stringify(tokenNames, null, 2)} as const;\n\nexport const cssVariableNames = ${JSON.stringify(variableNames, null, 2)} as const;\n`;
await writeFile(new URL('src/tokens.css', packageRoot), css.trimEnd() + '\n');
await writeFile(new URL('src/generated.ts', packageRoot), generated);
console.log(`Generated ${variableNames.length} semantic variables in ${fileURLToPath(packageRoot)}.`);
