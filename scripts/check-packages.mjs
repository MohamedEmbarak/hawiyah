// Local tarball validation only. This script never publishes packages.
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
const paths = [];
for (const name of [
  "tokens",
  "styles",
  "core",
  "vanilla",
  "react",
  "vue",
  "angular",
]) {
  const source = resolve(root, "packages", name),
    dest = resolve(checkRoot, "staging", name);
  const manifest = JSON.parse(
    readFileSync(resolve(source, "package.json"), "utf8"),
  );
  if (manifest.private !== true)
    throw new Error(`${name}: npm publication is disabled until release preparation`);
  if (!existsSync(resolve(source, "dist")))
    throw new Error(`Build ${name} before packing`);
  mkdirSync(dest, { recursive: true });
  cpSync(resolve(source, "dist"), resolve(dest, "dist"), { recursive: true });
  for (const file of [
    "README.md",
    "LICENSE",
    "NOTICE",
    "API.md",
    "EXPANSION-API.md",
    "PORTAL.md",
    "tokens.json",
    "third-party",
  ])
    if (existsSync(resolve(source, file)))
      cpSync(resolve(source, file), resolve(dest, file), { recursive: true });
  for (const section of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ])
    for (const [dependency, version] of Object.entries(manifest[section] || {}))
      if (version.startsWith("workspace:"))
        manifest[section][dependency] = "0.1.0";
  delete manifest.devDependencies;
  delete manifest.scripts;
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
  if (name === "styles") {
    const iconProvenance = JSON.parse(readFileSync(resolve(source, "src/assets/icons/provenance.json"), "utf8"));
    for (const file of ["LICENSE", "provenance.json", ...iconProvenance.icons.map(icon => icon.file)]) {
      if (!packed.files.some(entry => entry.path === `dist/assets/icons/${file}`))
        throw new Error(`styles: missing icon asset or notice ${file} in consumer tarball`);
    }
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
    name: "nasaq-local-consumer",
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
import * as tokens from '@nasaq/tokens';
import * as core from '@nasaq/core';
import * as vanilla from '@nasaq/vanilla';
import * as react from '@nasaq/react';
import * as vue from '@nasaq/vue';
import * as angular from '@nasaq/angular';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {createSSRApp,h} from 'vue';
import {renderToString as renderVue} from '@vue/server-renderer';
assert.equal(core.normalizeSearch('الرِّيَاض'),'الرياض');
assert.equal(typeof vanilla.enhance,'function');
assert.ok(tokens.tokens);
assert.ok(renderToString(React.createElement(react.Button,null,'Continue')).includes('nq-button'));
assert.ok((await renderVue(createSSRApp({render:()=>h(vue.Button,{},()=> 'Continue')}))).includes('nq-button'));
for (const name of ['DatePicker','Calendar','Grid','Stack','Menu','TreeView','DataTable','ServiceCard','PortalHeader','PortalLayout','SecondaryNav','MobileTopBar','NavigationDrawer','PasswordField','Rating','Stepper']) {
  assert.ok(react[name], 'React missing '+name); assert.ok(vue[name], 'Vue missing '+name);
  assert.ok(angular['Nq'+name+'Component'], 'Angular missing '+name);
}
assert.equal(typeof vanilla.createCalendar,'function');
assert.equal(typeof vanilla.createTreeView,'function');
assert.equal(typeof vanilla.createPortalHeader,'function');
for (const name of ['createNavigationDrawer','createStepper','createRating','createPasswordField']) assert.equal(typeof vanilla[name],'function');
assert.ok(renderToString(React.createElement(react.PortalLayout,{brand:'نسق',mainId:'portal-main'},React.createElement('h1',null,'الخدمات'))).includes('href="#portal-main"'));
assert.ok((await renderVue(createSSRApp({render:()=>h(vue.PortalLayout,{brand:'نسق',mainId:'portal-main'},()=>h('h1',{},'الخدمات'))}))).includes('href="#portal-main"'));
assert.deepEqual(core.getCalendarDateParts('2029-08-11','islamic-umalqura'),{year:1451,month:4,day:1});
assert.equal(core.convertCalendarDate({year:1451,month:4,day:1},'islamic-umalqura'),'2029-08-11');
const dateHtml = [
  renderToString(React.createElement(react.Grid,{columns:{base:1,md:2}},React.createElement(react.DatePicker,{label:'Appointment',name:'appointment',defaultValue:'2026-10-28'}))),
  await renderVue(createSSRApp({render:()=>h(vue.Grid,{columns:{base:1,md:2}},()=>h(vue.DatePicker,{label:'Appointment',name:'appointment',defaultValue:'2026-10-28'}))}))
];
for (const html of dateHtml) {
  assert.ok(html.includes('type="text"')); assert.ok(!html.includes('type="date"'));
  assert.ok(html.includes('type="hidden"')); assert.ok(html.includes('name="appointment"')); assert.ok(html.includes('value="2026-10-28"'));
}
const cssEntry = new URL(import.meta.resolve('@nasaq/styles/styles.css'));
for (const [file,marker] of [['components.css','.nq-button'],['extended.css','.nq-calendar'],['layout.css','.nq-grid'],['password-field.css','.nq-password-icon'],['stepper.css','--nq-step-current'],['riyal.css','U+20C1']]) {
  assert.ok(fs.readFileSync(cssEntry,'utf8').includes(file));
  assert.ok(fs.readFileSync(new URL(file,cssEntry),'utf8').includes(marker));
}
assert.ok(fs.readFileSync(new URL('../third-party/hijridate-LICENSE.txt',import.meta.resolve('@nasaq/core')),'utf8').includes('MIT License'));
assert.ok(fs.readFileSync(new URL(import.meta.resolve('@nasaq/tokens/tokens.css')),'utf8').includes('--nq-color-primary'));
const wordmark=fs.readFileSync(new URL(import.meta.resolve('@nasaq/styles/assets/nasaq-wordmark.svg')),'utf8');
assert.ok(wordmark.includes('<path')); assert.ok(!wordmark.includes('<text'));
assert.equal(fs.readFileSync(new URL(import.meta.resolve('@nasaq/styles/assets/nasaq-loader.gif'))).subarray(0,6).toString(),'GIF89a');
assert.ok(fs.readFileSync(new URL(import.meta.resolve('@nasaq/styles/assets/fonts/riyal-LICENSE.txt')),'utf8').includes('SIL OPEN FONT LICENSE'));
assert.equal(fs.readFileSync(new URL(import.meta.resolve('@nasaq/styles/assets/fonts/riyal.woff2'))).subarray(0,4).toString(),'wOF2');
console.log('Clean tarball consumer: ESM, SSR, Angular APF, CSS exports passed.');
`,
);
console.log(run("node", ["smoke.mjs"], consumer).trim());
writeFileSync(
  resolve(consumer, "types.ts"),
  `import * as core from '@nasaq/core';\nimport * as vanilla from '@nasaq/vanilla';\nimport * as react from '@nasaq/react';\nimport * as vue from '@nasaq/vue';\nimport * as angular from '@nasaq/angular';\nconst options: core.Option[] = [{value:'a',label:'A'}];\ncore.filterOptions(options,'a');\nvoid [vanilla.enhance,react.Button,vue.Button,angular];\n`,
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
    entry: 'export {Button} from "@nasaq/react";',
    forbidden: /nq-dialog|nq-combobox|nq-tab-list|nq-calendar|2423999/,
    budget: 4096,
  },
  {
    name: "Vanilla Tabs",
    entry: 'export {createTabs} from "@nasaq/vanilla";',
    forbidden: /data-nq-combobox|data-nq-tooltip|nq-calendar|2423999/,
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
