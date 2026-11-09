// Verify exported project files against the same installed tarball consumers.
import { mkdirSync, readFileSync, writeFileSync, symlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';
import { readConfiguration, performCompilation, formatDiagnostics } from '@angular/compiler-cli';
import { build } from 'vite';
import { projectExample, nativeProjectComponents } from '../apps/playground/src/project-examples.ts';
import { projectDownloadFiles } from '../apps/playground/src/project-download.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const consumer=resolve(root,'.artifacts/package-check/consumer/node_modules');
if(!existsSync(consumer))throw new Error('Run pnpm check:packages before checking editor exports.');
const workspace=resolve(root,'.artifacts/editor-project-check');
function prepare(directory,files){
  mkdirSync(directory,{recursive:true});
  const modules=resolve(directory,'node_modules');if(!existsSync(modules))symlinkSync(consumer,modules,process.platform==='win32'?'junction':'dir');
  for(const[name,content]of Object.entries(files))writeFileSync(resolve(directory,name),content);
}
for(const framework of ['react','angular']){
  const directory=resolve(workspace,'types',framework);mkdirSync(directory,{recursive:true});
  let config;
  for(const id of nativeProjectComponents){
    const example=projectExample(id,framework,'typescript','ar','');
    const files=projectDownloadFiles(example,example.files,framework,'typescript');
    prepare(resolve(directory,id),files);config=JSON.parse(files['tsconfig.json']);
  }
  config.include=['**/*.ts','**/*.tsx'];config.angularCompilerOptions={strictTemplates:true};
  const file=resolve(directory,'tsconfig.json');writeFileSync(file,JSON.stringify(config));
  let diagnostics;
  if(framework==='angular'){
    const settings=readConfiguration(file);diagnostics=[...settings.errors,...performCompilation({rootNames:settings.rootNames,options:settings.options}).diagnostics];
  }else{
    const source=ts.readConfigFile(file,ts.sys.readFile);const settings=ts.parseJsonConfigFileContent(source.config,ts.sys,directory);
    diagnostics=[...settings.errors,...ts.getPreEmitDiagnostics(ts.createProgram(settings.fileNames,settings.options))];
  }
  const errors=diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length)throw new Error(formatDiagnostics(errors));
  console.log(`${framework}: ${nativeProjectComponents.size} project recipes passed ${framework==='angular'?'strict template':'TypeScript'} checking.`);
}
// Bundle each downloaded Vue SFC and its actual bootstrap against the packed
// adapter. Multiple HTML entries let Vite compile the catalog in a single pass.
for (const language of ['javascript', 'typescript']) {
  const directory = resolve(workspace, 'catalog', 'vue-' + language);
  const entries = {};
  const locale = language === 'javascript' ? 'ar' : 'en';
  for (const id of nativeProjectComponents) {
    const example = projectExample(id, 'vue', language, locale, '');
    const files = projectDownloadFiles(example, example.files, 'vue', language, locale);
    prepare(resolve(directory, id), files);
    entries[id] = resolve(directory, id, 'index.html');
  }
  await build({
    root: directory,
    configFile: resolve(directory, 'button/vite.config.js'),
    logLevel: 'error',
    build: { write: false, rolldownOptions: { input: entries } },
  });
  console.log(`vue/${language}: ${nativeProjectComponents.size} exported projects bundled.`);
  if (language === 'typescript') {
    const sample = resolve(directory, 'button', 'tsconfig.json');
    const config = JSON.parse(readFileSync(sample, 'utf8'));
    config.include = [...nativeProjectComponents].flatMap(id => [
      id + '/App.vue', id + '/main.ts', id + '/env.d.ts',
    ]);
    const file = resolve(directory, 'tsconfig.json');
    writeFileSync(file, JSON.stringify(config));
    const cli = createRequire(import.meta.url).resolve('vue-tsc/bin/vue-tsc.js');
    execFileSync(process.execPath, [cli, '--noEmit', '-p', file], { cwd: directory, stdio: 'inherit' });
    console.log(`vue/typescript: ${nativeProjectComponents.size} strict SFC templates passed type checking.`);
  }
}
for(const[framework,languages]of Object.entries({vanilla:['javascript','typescript'],react:['javascript','typescript'],vue:['javascript','typescript'],angular:['typescript']})){
  for(const language of languages){
    const example=projectExample('toggle-group',framework,language,'ar','<button class="hw-button">Example</button>');
    const directory=resolve(workspace,'builds',`${framework}-${language}`);
    prepare(directory,projectDownloadFiles(example,example.files,framework,language));
    await build({root:directory,configFile:resolve(directory,'vite.config.js'),logLevel:'error'});
    console.log(`${framework}/${language}: exported project build passed.`);
  }
}
