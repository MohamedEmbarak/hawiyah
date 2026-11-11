// Local tarball validation only. This script never publishes packages.
// With HAWIYAH_RELEASE=1 the staged manifests drop `private` so that
// scripts/publish-packages.mjs can publish exactly these verified tarballs.
import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";
import { hashTree, manifestPath } from "./dist-manifest.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const checkRoot = resolve(root, ".artifacts/package-check");
rmSync(checkRoot, { recursive: true, force: true });
mkdirSync(checkRoot, { recursive: true });
function run(cmd, args, cwd = checkRoot) {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32" && !cmd.toLowerCase().endsWith(".exe"),
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    console.error(result.stdout, result.stderr);
    throw result.error || new Error(`${cmd} failed (${result.status})`);
  }
  return result.stdout;
}
const release = process.env.HAWIYAH_RELEASE === "1";
const paths = [];
const packageNames = ["tokens", "styles", "core", "vanilla", "react", "vue", "angular"];
const workspaceVersions = Object.fromEntries(
  packageNames.map((name) => {
    const { name: id, version } = JSON.parse(
      readFileSync(resolve(root, "packages", name, "package.json"), "utf8"),
    );
    return [id, version];
  }),
);
for (const name of packageNames) {
  const source = resolve(root, "packages", name),
    dest = resolve(checkRoot, "staging", name);
  const manifest = JSON.parse(
    readFileSync(resolve(source, "package.json"), "utf8"),
  );
  if (manifest.private !== true)
    throw new Error(`${name}: source manifests stay private; publish only through scripts/publish-packages.mjs`);
  if (!existsSync(resolve(source, "dist")) || !existsSync(manifestPath(name)))
    throw new Error(`Build ${name} with pnpm build:packages before packing`);
  // dist must be exactly what the last clean build wrote: nothing stale, nothing edited.
  const built = JSON.parse(readFileSync(manifestPath(name), "utf8"));
  const current = hashTree(resolve(source, "dist"));
  for (const file of new Set([...Object.keys(built), ...Object.keys(current)]))
    if (built[file] !== current[file])
      throw new Error(`${name}: dist/${file} ${!built[file] ? "was not written by the last clean build" : !current[file] ? "is missing" : "changed after the last clean build"}; run pnpm build:packages before packing`);
  mkdirSync(dest, { recursive: true });
  cpSync(resolve(source, "dist"), resolve(dest, "dist"), { recursive: true });
  // Everything else the manifest's "files" field names ships from the source tree.
  const sourceEntries = (manifest.files || []).filter((entry) => entry !== "dist");
  for (const file of sourceEntries) {
    if (/[*?[\]{}!]/.test(file))
      throw new Error(`${name}: "files" entry ${file} must be a literal path`);
    if (existsSync(resolve(source, file)))
      cpSync(resolve(source, file), resolve(dest, file), { recursive: true });
  }
  for (const section of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ])
    for (const [dependency, version] of Object.entries(manifest[section] || {}))
      if (version.startsWith("workspace:")) {
        if (!workspaceVersions[dependency])
          throw new Error(`${name}: unknown workspace dependency ${dependency}`);
        manifest[section][dependency] = workspaceVersions[dependency];
      }
  delete manifest.devDependencies;
  delete manifest.scripts;
  if (release) delete manifest.private;
  writeFileSync(
    resolve(dest, "package.json"),
    JSON.stringify(manifest, null, 2),
  );
  const packed = JSON.parse(
    run(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", checkRoot],
      dest,
    ),
  )[0];
  for (const notice of ['LICENSE', 'NOTICE']) {
    if (!packed.files.some(file => file.path === notice))
      throw new Error(`${name}: missing ${notice} in consumer tarball`);
  }
  const packedPaths = new Set(packed.files.map((file) => file.path));
  for (const file of packedPaths) {
    const fromBuild = file.startsWith("dist/") && built[file.slice(5)];
    const fromSource = sourceEntries.some((entry) => file === entry || file.startsWith(`${entry}/`));
    if (file !== "package.json" && !fromBuild && !fromSource)
      throw new Error(`${name}: ${file} in the tarball is not produced by a clean build`);
  }
  for (const file of Object.keys(built))
    if (!packedPaths.has(`dist/${file}`))
      throw new Error(`${name}: built file dist/${file} is missing from the tarball`);
  // Every export target (and legacy entry field) must exist in the tarball.
  const targets = [];
  const collect = (value) => {
    if (typeof value === "string") targets.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(manifest.exports);
  for (const field of ["main", "module", "types", "typings"]) collect(manifest[field]);
  if (!targets.length) throw new Error(`${name}: no export targets`);
  for (const target of targets) {
    const path = target.replace(/^\.\//, "");
    const [prefix, suffix] = path.split("*");
    const found = path.includes("*")
      ? [...packedPaths].some((file) => file.length > prefix.length + suffix.length && file.startsWith(prefix) && file.endsWith(suffix))
      : packedPaths.has(path);
    if (!found) throw new Error(`${name}: export target ${target} is missing from the tarball`);
  }
  if (packed.files.some(file => /\.(?:test|spec)\.(?:[cm]?js|d\.ts)(?:\.map)?$/.test(file.path)))
    throw new Error(`${name}: test output must not ship in consumer tarballs`);
  if (name === "styles") {
    const iconProvenance = JSON.parse(readFileSync(resolve(source, "src/assets/icons/provenance.json"), "utf8"));
    for (const file of ["LICENSE", "provenance.json", ...iconProvenance.icons.map(icon => icon.file)]) {
      if (!packed.files.some(entry => entry.path === `dist/assets/icons/${file}`))
        throw new Error(`styles: missing icon asset or notice ${file} in consumer tarball`);
    }
    // The opt-in fonts: every recorded file, the licence and the provenance record ship; every url() of
    // fonts.css is a packed file; styles.css declares no font but the riyal face and never loads fonts.css.
    const fontProvenance = JSON.parse(readFileSync(resolve(source, "src/assets/fonts/ibm-plex-provenance.json"), "utf8"));
    for (const file of [fontProvenance.licenseFile, "ibm-plex-provenance.json", ...fontProvenance.packages.flatMap(pack => pack.files.map(entry => entry.file))]) {
      if (!packedPaths.has(`dist/assets/fonts/${file}`))
        throw new Error(`styles: missing font file, licence or provenance record ${file} in consumer tarball`);
    }
    const packedCss = (file) => readFileSync(resolve(dest, "dist", file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const fontsCss = packedCss("fonts.css");
    const fontUrls = [...fontsCss.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map(match => match[2]);
    if (!fontUrls.length) throw new Error("styles: fonts.css declares no font file");
    for (const url of fontUrls)
      if (!/^\.\/assets\/fonts\/[A-Za-z0-9-]+\.woff2$/.test(url) || !packedPaths.has(`dist/${url.slice(2)}`))
        throw new Error(`styles: fonts.css references ${url}, which is not in the consumer tarball`);
    const stylesCss = packedCss("styles.css");
    const families = [...stylesCss.matchAll(/@font-face\s*\{[^}]*?font-family:\s*(['"]?)([^;'"]+)\1/g)].map(match => match[2]);
    if (families.length !== 1 || families[0] !== "HawiyahRiyal")
      throw new Error(`styles: styles.css may declare the riyal face only, found ${families.join(", ") || "none"}`);
    if (/IBMPlex|fonts\.css/.test(stylesCss)) throw new Error("styles: styles.css must not load the opt-in fonts");
  }
  if (
    packed.files.some((f) =>
      /(?:^|\/)(?:\.env|node_modules|AGENTS\.md|RULES\.md|CLAUDE\.md)(?:\/|$)/.test(
        f.path,
      ),
    )
  )
    throw new Error(`${name}: unexpected private workspace content in tarball`);
  paths.push(resolve(checkRoot, packed.filename));
  console.log(
    `${manifest.name}: ${packed.entryCount} files, ${Math.round(packed.size / 1024)} kB packed`,
  );
}
const consumer = resolve(checkRoot, "consumer");
mkdirSync(consumer);
writeFileSync(
  resolve(consumer, "package.json"),
  JSON.stringify({
    name: "hawiyah-local-consumer",
    private: true,
    type: "module",
    dependencies: {
      react: "19.3.1",
      "react-dom": "19.3.1",
      vue: "3.5.44",
      "@vue/server-renderer": "3.5.44",
      "@angular/core": "22.2.3",
      "@angular/common": "22.2.3",
      "@angular/forms": "22.2.3",
      "@angular/compiler": "22.2.3",
      rxjs: "^7.8.2",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
    },
  }),
);
run(
  "npm",
  ["install", "--ignore-scripts", "--no-audit", "--no-fund", ...paths],
  consumer,
);
writeFileSync(
  resolve(consumer, "smoke.mjs"),
  `
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '@angular/compiler';
import * as tokens from '@hawiyah/tokens';
import * as core from '@hawiyah/core';
import * as vanilla from '@hawiyah/vanilla';
import * as react from '@hawiyah/react';
import * as vue from '@hawiyah/vue';
import * as angular from '@hawiyah/angular';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {createSSRApp,h} from 'vue';
import {renderToString as renderVue} from '@vue/server-renderer';
// The packages hold no wording: this consumer supplies every text and the locale, and no warning may remain.
const warnings = []; console.warn = (...args) => { warnings.push(args.join(' ')); };
const layoutText = {skipLabel:'انتقل إلى المحتوى',menuLabel:'القائمة',navigationLabel:'التنقل الرئيسي',footerProps:{externalLabel:'يفتح في نافذة جديدة'}};
const dateText = {locale:'en',calendarLabel:'Choose date',previousLabel:'Previous month',nextLabel:'Next month',openLabel:'Open calendar',closeLabel:'Close calendar',calendarSystemLabel:'Calendar system',gregorianLabel:'Gregorian',hijriLabel:'Hijri · Umm al-Qura',rangeLabel:'Supported Hijri dates',invalidMessage:'Enter an available Gregorian date in YYYY-MM-DD format.',unsupportedMessage:'Umm al-Qura is available from '+core.UMALQURA_MIN_DATE+' through '+core.UMALQURA_MAX_DATE+'. The selected ISO date is unchanged.'};
assert.equal(core.normalizeSearch('الرِّيَاض'),'الرياض');
assert.equal(typeof vanilla.enhance,'function');
assert.ok(tokens.tokens);
assert.ok(renderToString(React.createElement(react.Button,null,'Continue')).includes('hw-button'));
assert.ok((await renderVue(createSSRApp({render:()=>h(vue.Button,{},()=> 'Continue')}))).includes('hw-button'));
for (const name of ['DatePicker','Calendar','Grid','Stack','Menu','TreeView','DataTable','ServiceCard','PortalHeader','PortalLayout','SecondaryNav','MobileTopBar','NavigationDrawer','PasswordField','SearchField','Rating','Stepper','CopyButton','SideNavigation']) {
  assert.ok(react[name], 'React missing '+name); assert.ok(vue[name], 'Vue missing '+name);
  assert.ok(angular['Hw'+name+'Component'], 'Angular missing '+name);
}
assert.equal(typeof vanilla.createCalendar,'function');
assert.equal(typeof vanilla.createTreeView,'function');
assert.equal(typeof vanilla.createPortalHeader,'function');
for (const name of ['createNavigationDrawer','createStepper','createRating','createPasswordField','createSearchField','createCopyButton','createSideNavigation']) assert.equal(typeof vanilla[name],'function');
for (const name of ['copyText','createCopyFeedback','bindLinkNavigation','isLinkNavigationHandled','getNavigationItemKind','getNavigationGroupEntries','isNavigationGroupOpen','getNavigationCurrentId','revealNavigationCurrent','observeContentNavigation']) assert.equal(typeof core[name],'function','core missing '+name);
assert.deepEqual(core.copyFeedbackIcons,{idle:'copy-01',copied:'tick-02',failed:'alert-02'});
// Nothing touches the clipboard on a server: no Clipboard API there, so a copy reports that and writes nothing.
assert.equal(await core.copyText('نص'),'unavailable');
const copyText = {text:'pnpm add @hawiyah/styles',label:'نسخ الأمر',copiedMessage:'تم النسخ',failedMessage:'تعذر النسخ'};
const navigationItems = [{id:'start',label:'البداية',href:'/start'},{id:'components',label:'المكونات',children:[{id:'copy-button',label:'زر النسخ',href:'/components/copy-button',current:true}]}];
const newHtml = [
  renderToString(React.createElement('div',null,React.createElement(react.CopyButton,copyText),React.createElement(react.SideNavigation,{label:'أقسام الدليل',items:navigationItems}))),
  await renderVue(createSSRApp({render:()=>h('div',[h(vue.CopyButton,copyText),h(vue.SideNavigation,{label:'أقسام الدليل',items:navigationItems})])}))
];
for (const html of newHtml) {
  assert.ok(html.includes('class="hw-copy"') && html.includes('data-state="idle"') && html.includes('data-icon="copy-01"'));
  assert.ok(html.includes('class="hw-side-navigation hw-navigation-drawer-nav"') && html.includes('aria-current="page"'));
  assert.ok(/<details class="hw-navigation-drawer-group" open(="")?>/.test(html), 'the group of the current page is open in the server markup');
}
assert.ok(renderToString(React.createElement(react.PortalLayout,{brand:'هوية',mainId:'portal-main',...layoutText},React.createElement('h1',null,'الخدمات'))).includes('href="#portal-main"'));
assert.ok((await renderVue(createSSRApp({render:()=>h(vue.PortalLayout,{brand:'هوية',mainId:'portal-main',...layoutText},()=>h('h1',{},'الخدمات'))}))).includes('href="#portal-main"'));
assert.deepEqual(core.getCalendarDateParts('2029-08-11','islamic-umalqura'),{year:1451,month:4,day:1});
assert.equal(core.convertCalendarDate({year:1451,month:4,day:1},'islamic-umalqura'),'2029-08-11');
const dateHtml = [
  renderToString(React.createElement(react.Grid,{columns:{base:1,md:2}},React.createElement(react.DatePicker,{label:'Appointment',name:'appointment',defaultValue:'2026-10-28',...dateText}))),
  await renderVue(createSSRApp({render:()=>h(vue.Grid,{columns:{base:1,md:2}},()=>h(vue.DatePicker,{label:'Appointment',name:'appointment',defaultValue:'2026-10-28',...dateText}))}))
];
for (const html of dateHtml) {
  assert.ok(html.includes('type="text"')); assert.ok(!html.includes('type="date"'));
  assert.ok(html.includes('type="hidden"')); assert.ok(html.includes('name="appointment"')); assert.ok(html.includes('value="2026-10-28"'));
}
const cssEntry = new URL(import.meta.resolve('@hawiyah/styles/styles.css'));
const flatCss = fs.readFileSync(cssEntry,'utf8');
// The entry is one flat file a page can link directly: no @import, tokens and
// component rules included, every relative url() present in the tarball.
assert.ok(!flatCss.includes('@import'), 'styles.css must not contain @import');
assert.ok(flatCss.includes('--hw-color-primary:'), 'styles.css must define --hw-color-primary');
assert.ok(flatCss.includes('.hw-button'), 'styles.css must contain .hw-button rules');
assert.ok(!flatCss.includes('Optional application reset'), 'reset.css must stay opt-in');
assert.equal(new URL(import.meta.resolve('@hawiyah/styles')).href,cssEntry.href);
for (const [,,url] of flatCss.matchAll(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/g))
  if (!/^(?:[a-z][a-z0-9+.-]*:|\\/|#)/i.test(url)) assert.ok(fs.existsSync(new URL(url.replace(/[?#].*$/,''),cssEntry)),'styles.css references missing '+url);
for (const [file,marker] of [['components.css','.hw-button'],['extended.css','.hw-calendar'],['layout.css','.hw-grid'],['password-field.css','.hw-password-icon'],['stepper.css','--hw-step-current'],['riyal.css','U+20C1'],['reset.css','box-sizing']]) {
  if (file !== 'reset.css') assert.ok(flatCss.includes(marker));
  assert.ok(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/'+file)),'utf8').includes(marker));
}
assert.ok(fs.readFileSync(new URL('../third-party/hijridate-LICENSE.txt',import.meta.resolve('@hawiyah/core')),'utf8').includes('MIT License'));
assert.ok(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/tokens/tokens.css')),'utf8').includes('--hw-color-primary'));
assert.ok(JSON.parse(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/tokens/reference/dga-foundations.json')),'utf8')).source);
const wordmark=fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/hawiyah-wordmark.svg')),'utf8');
assert.ok(wordmark.includes('<path')); assert.ok(!wordmark.includes('<text'));
assert.equal(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/hawiyah-loader.gif'))).subarray(0,6).toString(),'GIF89a');
assert.ok(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/fonts/riyal-LICENSE.txt')),'utf8').includes('SIL OPEN FONT LICENSE'));
assert.equal(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/fonts/riyal.woff2'))).subarray(0,4).toString(),'wOF2');
// The fonts are opt-in: their own entry, every file it names present, and nothing of them in styles.css.
const fontsEntry = new URL(import.meta.resolve('@hawiyah/styles/fonts.css'));
const fontsCss = fs.readFileSync(fontsEntry,'utf8').replace(/\\/\\*[\\s\\S]*?\\*\\//g,'');
const fontUrls = [...fontsCss.matchAll(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/g)].map(match => match[2]);
assert.ok(fontUrls.length >= 9, 'fonts.css declares the IBM Plex files');
for (const url of fontUrls) assert.equal(fs.readFileSync(new URL(url,fontsEntry)).subarray(0,4).toString(),'wOF2','fonts.css references missing or invalid '+url);
for (const family of ['IBM Plex Sans Arabic','IBM Plex Mono']) assert.ok(fontsCss.includes(family),'fonts.css must declare '+family);
assert.ok(!fontsCss.includes('@import'), 'fonts.css must not contain @import');
const faces = [...flatCss.replace(/\\/\\*[\\s\\S]*?\\*\\//g,'').matchAll(/@font-face\\s*\\{[^}]*?font-family:\\s*(['"]?)([^;'"]+)\\1/g)].map(match => match[2]);
assert.deepEqual(faces,['HawiyahRiyal'],'styles.css declares no font but the riyal face');
assert.ok(!/IBMPlex|fonts\\.css/.test(flatCss),'styles.css must not load the opt-in fonts');
assert.ok(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/fonts/ibm-plex-LICENSE.txt')),'utf8').includes('SIL OPEN FONT LICENSE Version 1.1'));
assert.ok(JSON.parse(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/assets/fonts/ibm-plex-provenance.json')),'utf8')).packages.every(pack => pack.license === 'OFL-1.1'));
for (const [file,marker] of [['code.css','.hw-code-block'],['prose.css','.hw-prose'],['copy.css','.hw-copy']]) { assert.ok(flatCss.includes(marker)); assert.ok(fs.readFileSync(new URL(import.meta.resolve('@hawiyah/styles/'+file)),'utf8').includes(marker)); }
assert.deepEqual(warnings,[],'The consumer left a required text or locale unsupplied');
console.log('Clean tarball consumer: ESM, SSR, Angular APF, CSS exports passed.');
`,
);
console.log(run("node", ["smoke.mjs"], consumer).trim());
writeFileSync(
  resolve(consumer, "types.ts"),
  `import * as core from '@hawiyah/core';\nimport * as vanilla from '@hawiyah/vanilla';\nimport * as react from '@hawiyah/react';\nimport * as vue from '@hawiyah/vue';\nimport * as angular from '@hawiyah/angular';\nconst options: core.Option[] = [{value:'a',label:'A'}];\ncore.filterOptions(options,'a');\nvoid [vanilla.enhance,react.Button,vue.Button,angular];\n`,
);
run(
  process.execPath,
  [
    resolve(root, "node_modules/typescript/bin/tsc"),
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--lib",
    "ES2022,DOM",
    "types.ts",
  ],
  consumer,
);
console.log(
  "Clean consumer TypeScript declarations passed. Nothing was published.",
);
for (const check of [
  {
    name: "React Button",
    entry: 'export {Button} from "@hawiyah/react";',
    forbidden: /hw-dialog|hw-combobox|hw-tab-list|hw-calendar|2423999/,
    budget: 4096,
  },
  {
    name: "Vanilla Tabs",
    entry: 'export {createTabs} from "@hawiyah/vanilla";',
    forbidden: /data-hw-combobox|data-hw-tooltip|hw-calendar|2423999/,
    budget: 6144,
  },
]) {
  writeFileSync(resolve(consumer, "minimal.ts"), check.entry);
  const output = resolve(consumer, "tree-shake");
  await build({
    configFile: false,
    root: consumer,
    logLevel: "warn",
    build: {
      outDir: output,
      emptyOutDir: true,
      minify: true,
      lib: {
        entry: resolve(consumer, "minimal.ts"),
        formats: ["es"],
        fileName: "minimal",
      },
      rolldownOptions: { external: (id) => /^react(?:-dom)?(?:\/|$)/.test(id) },
    },
  });
  const code = readdirSync(output)
    .filter((file) => file.endsWith(".js"))
    .map((file) => readFileSync(resolve(output, file), "utf8"))
    .join("\n");
  if (!code || check.forbidden.test(code))
    throw new Error(`${check.name}: unrelated widgets retained`);
  const bytes = gzipSync(code).length;
  if (bytes > check.budget)
    throw new Error(
      `${check.name}: gzip budget exceeded (${bytes}/${check.budget})`,
    );
  console.log(
    `${check.name}: tree shaking passed; ${bytes} bytes gzip (${check.budget} budget, framework excluded).`,
  );
}
