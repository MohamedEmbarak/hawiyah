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
  return [key, child !== null && typeof child === 'object' ? names(child, next) : `--hw-${next.join('-')}`];
}));
const foundation = unwrap(source.foundation);
const sourceThemes = unwrap(source.themes);
// A colour written as {color.<name>} is an alias of another semantic colour. It
// becomes var(--hw-color-<name>) in the stylesheet and in the typed export, so
// it follows its target through themes, modes and application overrides. An
// alias has no palette slot and must name the same plain colour in every theme
// and mode, because one declaration serves them all.
const aliasTarget = (value) => /^\{color\.([a-z0-9-]+)\}$/.exec(value)?.[1];
const groups = Object.entries(sourceThemes).flatMap(([themeName, theme]) => Object.entries(theme).map(([mode, values]) => [`${themeName} ${mode}`, values.color]));
const colorKeys = Object.keys(sourceThemes.dga.light.color);
const aliases = Object.fromEntries(colorKeys.flatMap((key) => {
  const target = aliasTarget(sourceThemes.dga.light.color[key]);
  return target ? [[key, target]] : [];
}));
for (const [group, color] of groups) {
  if (Object.keys(color).join() !== colorKeys.join()) throw new Error(`${group}: colour names differ from dga light`);
  for (const [key, value] of Object.entries(color)) {
    const target = aliasTarget(value);
    if (target !== aliases[key]) throw new Error(`${group}: ${key} must alias the same colour in every theme and mode`);
    if (target && (!(target in color) || target in aliases)) throw new Error(`${group}: ${key} aliases ${target}, which is not a plain colour`);
    if (!target && String(value).includes('{')) throw new Error(`${group}: ${key} has an unsupported reference ${value}`);
  }
}
const aliasValue = (key) => `var(--hw-color-${aliases[key]})`;
const themes = Object.fromEntries(Object.entries(sourceThemes).map(([themeName, theme]) => [themeName, Object.fromEntries(Object.entries(theme).map(([mode, values]) =>
  [mode, { ...values, color: Object.fromEntries(Object.entries(values.color).map(([key, value]) => [key, key in aliases ? aliasValue(key) : value])) }]))]));
const densities = unwrap(source.densities);
const themeFoundations = { dga: foundation, ...unwrap(source.themeFoundations || {}) };
const tokens = { ...foundation, ...themes.dga.light, ...densities.comfortable };
const declarations = (value) => Object.entries(flatten(value)).map(([key, val]) => `  --hw-${key}: ${val};`).join('\n');
const colorSlots = (theme) => ({
  ...Object.fromEntries(Object.entries(theme.light.color).filter(([key]) => !(key in aliases)).map(([key, value]) => [`palette-light-${key}`, value])),
  ...Object.fromEntries(Object.entries(theme.dark.color).filter(([key]) => !(key in aliases)).map(([key, value]) => [`palette-dark-${key}`, value])),
});
const modeAliases = (mode) => Object.fromEntries(colorKeys.map((key) => [`color-${key}`, key in aliases ? aliasValue(key) : `var(--hw-palette-${mode}-${key})`]));
const slotsToCss = (theme) => declarations(colorSlots(theme));
let css = `/* Generated from tokens.json. Run pnpm --filter @hawiyah/tokens generate. */\n`;
css += `:where(:root) {\n  color-scheme: light;\n${declarations(foundation)}\n${slotsToCss(themes.dga)}\n${declarations(modeAliases('light'))}\n${declarations(densities.comfortable)}\n}\n\n`;
// Both palettes inherit independently from color-scheme. light-dark() rebinds
// semantic colors correctly at nested theme/mode boundaries in modern browsers.
for (const [themeName, theme] of Object.entries(themes)) {
  css += `:where([data-hw-theme="${themeName}"]${themeName === 'dga' ? ', [data-hw-theme="custom"]' : ''}) {\n${declarations(themeFoundations[themeName] || foundation)}\n${slotsToCss(theme)}\n}\n\n`;
}
css += `:where([data-hw-mode="light"]) {\n  color-scheme: light;\n${declarations(modeAliases('light'))}\n}\n\n`;
css += `:where([data-hw-mode="dark"]) {\n  color-scheme: dark;\n${declarations(modeAliases('dark'))}\n}\n\n`;
css += `@supports (color: light-dark(white, black)) {\n  :where(:root, [data-hw-theme], [data-hw-mode]) {\n${colorKeys.map(key => `    --hw-color-${key}: ${key in aliases ? aliasValue(key) : `light-dark(var(--hw-palette-light-${key}), var(--hw-palette-dark-${key}))`};`).join('\n')}\n  }\n}\n\n`;
for (const [densityName, density] of Object.entries(densities)) {
  css += `:where([data-hw-density="${densityName}"]) {\n${declarations(density)}\n}\n\n`;
}
const tokenNames = names(tokens);
const variableNames = Object.keys(flatten(tokens)).map(key => `--hw-${key}`);
const generated = `// Generated from tokens.json. Do not edit by hand.\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n\nexport const themes = ${JSON.stringify(themes, null, 2)} as const;\n\nexport const themeFoundations = ${JSON.stringify(themeFoundations, null, 2)} as const;\n\nexport const densities = ${JSON.stringify(densities, null, 2)} as const;\n\nexport const tokenNames = ${JSON.stringify(tokenNames, null, 2)} as const;\n\nexport const cssVariableNames = ${JSON.stringify(variableNames, null, 2)} as const;\n`;
await writeFile(new URL('src/tokens.css', packageRoot), css.trimEnd() + '\n');
await writeFile(new URL('src/generated.ts', packageRoot), generated);
console.log(`Generated ${variableNames.length} semantic variables in ${fileURLToPath(packageRoot)}.`);
