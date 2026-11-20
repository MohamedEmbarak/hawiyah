// The fact sheet of a component (5a.4): what the installed packages declare and
// publish for it, read with the same readers as step 30 (api-tables/members.mjs),
// so a sheet and the check cannot disagree. A sheet is generated output for page
// writers: content:facts writes it to .cache/facts/ (ignored by Git), and nothing
// in the build or the application reads it.
//
// Per component: the components.json entry; per framework the exports and their
// members with kind, written type, required flag and default (with the published
// line the default is read from); the vanilla controller with its options,
// returned methods, the data-hw-* hooks its published module reads and the
// enhance() hook that creates it, or for a component without a controller the
// classes and attributes of the styles contract and of the stylesheet's selectors;
// the Angular classes with their selectors; the Vue slots the build reads; the
// reader names the Arabic string map replaces; the fixed captions of the API
// tables; the entries under Known defects in the pinned version of CHANGELOG.md
// and the entries of known-differences.json that name the component.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FRAMEWORKS, declaredMembers } from '../api-tables/members.mjs';
import { generatedNote } from '../api-tables/notes.mjs';
import { resolveExport } from '../api-tables/program.mjs';
import { loadPublished, resolvePackageExport } from '../api-tables/published-js.mjs';
import { vueSlots } from '../api-tables/slots-vue.mjs';
import { attributesFor } from '../api-tables/stylesheet-selectors.mjs';
import { contractFor } from '../api-tables/stylesheet-contract.mjs';
import { H3_FRAMEWORK, captionText } from '../api-tables/write.mjs';
import { printType } from '../api-tables/types.mjs';
import { READER_NAMES } from '../content/parity.mjs';
import { textProps } from '../content/string-map.mjs';

const kebab = (name) => name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

/** Known defects of a version in CHANGELOG.md: the list items under '#### Known defects in <version>'. */
export function knownDefects(changelog, version) {
  const lines = changelog.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => /^#{2,6}\s+Known defects in /.test(line) && line.includes(version));
  if (start < 0) return [];
  const items = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) break;
    if (/^- /.test(line)) items.push(line.slice(2).trim());
    else if (/^\s+\S/.test(line) && items.length) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

/** The names under which a component appears in prose: its name, classes and exports (not its id, which is often a common word). */
export function namesOf(entry, declared) {
  const names = new Set([entry.name, ...(entry.cssClasses ?? [])]);
  for (const framework of FRAMEWORKS) for (const name of declared[framework].exports ?? []) names.add(name);
  // The documented Angular class without its prefix and suffix (HwRadioGroupComponent: RadioGroup).
  const first = declared.angular.exports?.[0];
  if (first) names.add(first.replace(/^Hw/, '').replace(/(Component|Directive)$/, ''));
  for (const member of declared.angular.members) if (member.element) names.add(member.element.replace(/\[.*$/, ''));
  return [...names].filter((name) => name && name.length > 2);
}

function mentions(text, names) {
  return names.some((name) => new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text));
}

/** create<Name> -> its data-hw value in the factories of enhance() (index.js of @hawiyah/vanilla). */
export function enhanceHooks(published) {
  const { ts } = published;
  const module = published.modules.get(published.entry);
  const out = new Map();
  const node = module.declarations.get('factories');
  const object = node && ts.isVariableDeclaration(node) ? node.initializer : null;
  if (!object || !ts.isObjectLiteralExpression(object)) return out;
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || !property.name) continue;
    const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : null;
    const factory = /create[A-Z]\w*/.exec(property.initializer.getText())?.[0];
    if (key && factory) out.set(factory, key);
  }
  return out;
}

/** The data-hw-* hooks the published module of a vanilla controller reads or writes. */
function controllerHooks(published, name) {
  const found = resolvePackageExport(published, name);
  if (!found) return [];
  const text = found.module.source.getFullText();
  const hooks = new Set();
  for (const match of text.matchAll(/data-hw-[a-z0-9-]+/g)) hooks.add(match[0]);
  for (const match of text.matchAll(/dataset\.(hw[A-Z][A-Za-z]*)/g)) hooks.add(`data-${kebab(match[1])}`);
  return [...hooks].sort();
}

/** The methods and properties of the controller create<Name> returns. */
function controllerApi(context, name) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'vanilla', name);
  if (!symbol) return [];
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  if (!signature) return [];
  const returned = checker.getReturnTypeOfSignature(signature);
  return checker.getPropertiesOfType(returned).map((property) => ({
    name: property.name,
    type: printType(checker.getTypeOfSymbol(property), context).text,
    readonly: Boolean(property.declarations?.some((item) => item.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ReadonlyKeyword))),
  }));
}

/**
 * The fact sheet of one id.
 * @param {*} readers createReaders() result
 * @param {string} id
 * @param {{ changelog: string, knownDifferences: any[], version: string, vanilla?: any }} sources
 */
export function factSheet(readers, id, sources) {
  const entry = readers.components.get(id);
  const declared = declaredMembers(readers, id);
  const vanillaPublished = sources.vanilla ?? loadPublished(readers.nodeModules, '@hawiyah/vanilla');
  const hooks = sources.enhanceHooks ?? enhanceHooks(vanillaPublished);
  const member = (item) => ({
    name: item.name,
    kind: item.kind,
    type: item.compare?.type === false ? null : item.type,
    required: item.required,
    default: item.compare?.default === false ? null : item.default,
    ...(item.defaultSource ? { defaultFrom: item.defaultSource } : {}),
    ...(item.from ? { from: item.from } : {}),
    ...(item.note ? { note: item.note } : {}),
  });
  const frameworks = {};
  for (const framework of FRAMEWORKS) {
    const decl = declared[framework];
    frameworks[framework] = { exports: decl.exports, members: decl.members.map(member) };
  }
  if (declared.vanilla.source === 'controller') {
    const name = declared.vanilla.exports[0];
    frameworks.vanilla.controller = {
      name,
      enhance: hooks.has(name) ? `data-hw="${hooks.get(name)}"` : null,
      returns: controllerApi(readers.context, name),
      hooks: controllerHooks(vanillaPublished, name),
    };
  } else {
    const classes = entry.cssClasses ?? [];
    const contract = contractFor(readers.contractRows, classes);
    const selected = attributesFor(readers.selectors, classes);
    frameworks.vanilla.stylesheet = {
      classes: declared.vanilla.classes,
      componentClasses: classes,
      contractFamilies: contract.families,
      contractAttributes: Object.fromEntries([...contract.values].map(([name, values]) => [name, values])),
      selectorAttributes: Object.fromEntries([...selected].map(([name, value]) => [name, value])),
      stableContract: !declared.vanilla.generatedNote,
      note: declared.vanilla.generatedNote ? generatedNote('en', sources.version) : null,
    };
  }
  frameworks.vue.slots = vueSlots(readers.published.vue, declared.vue.exports[0]);
  frameworks.angular.classes = [...new Map(declared.angular.members.filter((item) => item.className).map((item) => [item.className, { className: item.className, element: item.element }])).values()];
  const names = namesOf(entry, declared);
  const captions = {};
  for (const lang of ['en', 'ar']) captions[lang] = Object.fromEntries(Object.keys(H3_FRAMEWORK).map((h3) => [h3, captionText(h3, lang, declared, entry)]));
  return {
    id,
    generated: `npm run content:facts -- ${id}: read from the installed @hawiyah packages ${sources.version}; generated output for writers, not a source and never committed`,
    component: {
      name: entry.name, labelAr: entry.labelAr, category: entry.category, sourceType: entry.sourceType, interaction: entry.interaction,
      cssClasses: entry.cssClasses ?? [], description: entry.description, notes: entry.notes ?? [], evidence: entry.evidence ?? [],
      built: entry.built ?? [], verified: entry.verified ?? [],
    },
    frameworks,
    readerText: { attributes: [...READER_NAMES], props: textProps(declared), rule: 'names in READER_NAMES of scripts/content/parity.mjs or ending in label, message, text or title; never value, id, name, slot or option values' },
    captions,
    knownDefects: knownDefects(sources.changelog, sources.version).filter((text) => mentions(text, names)),
    knownDifferences: sources.knownDifferences.filter((item) => item.component === id),
    problems: FRAMEWORKS.flatMap((framework) => declared[framework].problems.map((problem) => `${framework}: ${problem}`)),
    listGaps: FRAMEWORKS.flatMap((framework) => declared[framework].gaps.map((gap) => `${framework}: ${gap}`)),
  };
}

const cell = (value) => (value === null || value === undefined ? '—' : String(value).replace(/\|/g, '\\|'));

/** The sheet as Markdown, for reading. */
export function factSheetMarkdown(sheet) {
  const lines = [`# Fact sheet: ${sheet.component.name} (${sheet.id})`, '', `> ${sheet.generated}.`, ''];
  const c = sheet.component;
  lines.push('## components.json', '', `- name: ${c.name}; labelAr: ${c.labelAr}; category: ${c.category}; sourceType: ${c.sourceType}; interaction: ${c.interaction}`,
    `- classes: ${c.cssClasses.join(', ') || '—'}`, `- description: ${c.description}`, ...c.notes.map((note) => `- note: ${note}`),
    `- built: ${c.built.join(', ')}; verified: ${c.verified.join(', ') || 'none'}; evidence entries: ${c.evidence.length}`,
    ...c.evidence.map((item) => `  - ${item.adapter} ${item.kind}: ${item.scope} (${item.source}, ${item.result} ${item.date})`), '');
  for (const framework of FRAMEWORKS) {
    const data = sheet.frameworks[framework];
    lines.push(`## ${framework}`, '', `Exports: ${data.exports.join(', ') || '— (no controller)'}`, '');
    if (data.controller) {
      lines.push(`Controller ${data.controller.name}; enhance(): ${data.controller.enhance ?? '—'}; hooks the module reads or writes: ${data.controller.hooks.join(', ') || '—'}`, '',
        `Returns: ${data.controller.returns.map((item) => `${item.readonly ? 'readonly ' : ''}${item.name}: ${item.type}`).join('; ') || '—'}`, '');
    }
    if (data.stylesheet) {
      const s = data.stylesheet;
      lines.push(`Stylesheet table: classes ${s.classes.join(', ')}; contract families ${s.contractFamilies.join(', ') || 'none (outside the stable contract)'}`, '');
      if (s.note) lines.push(`Generated note: ${s.note}`, '');
    }
    if (data.classes) lines.push(`Classes: ${data.classes.map((item) => `${item.className} (${item.element})`).join(', ')}`, '');
    if (data.slots) lines.push(`Slots read by the build: ${[...data.slots.named, ...data.slots.dynamic.map((item) => `[${item}]`)].join(', ') || 'none'}`, '');
    lines.push('| Name | Kind | Type | Required | Default | Default read from |', '| --- | --- | --- | --- | --- | --- |');
    for (const item of data.members) {
      const from = item.defaultFrom ? `${item.defaultFrom.file}${item.defaultFrom.line ? `:${item.defaultFrom.line}` : ''} ${item.defaultFrom.text ?? ''}` : item.from ?? '';
      lines.push(`| \`${cell(item.name)}\` | ${item.kind} | ${item.type === null ? '— (not declared)' : `\`${cell(item.type)}\``} | ${item.required} | ${cell(item.default)} | ${cell(from.trim()) || '—'} |`);
    }
    lines.push('');
  }
  lines.push('## Reader text (Arabic string map)', '', `Attributes: ${sheet.readerText.attributes.join(', ')}`, `Text props: ${sheet.readerText.props.join(', ') || '—'}`, `Rule: ${sheet.readerText.rule}`, '');
  lines.push('## API table captions', '', ...Object.entries(sheet.captions.en).map(([h3, text]) => `- ${h3}: ${text} / ${sheet.captions.ar[h3]}`), '');
  lines.push('## Known defects in the pinned version that name the component', '', ...(sheet.knownDefects.length ? sheet.knownDefects.map((text) => `- ${text}`) : ['- none']), '');
  lines.push('## Known differences', '', ...(sheet.knownDifferences.length ? sheet.knownDifferences.map((item) => `- ${item.id} (${item.aspect}): ${item.description}`) : ['- none']), '');
  if (sheet.problems.length || sheet.listGaps.length) lines.push('## Problems', '', ...[...sheet.problems, ...sheet.listGaps].map((text) => `- ${text}`), '');
  return `${lines.join('\n')}\n`;
}

export function readSources(guideDir, repoDir, version) {
  return {
    changelog: readFileSync(join(repoDir, 'CHANGELOG.md'), 'utf8'),
    knownDifferences: JSON.parse(readFileSync(join(guideDir, 'scripts', 'equivalence', 'known-differences.json'), 'utf8')),
    version,
  };
}

